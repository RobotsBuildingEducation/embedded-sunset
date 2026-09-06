import test from "node:test";
import process from "node:process";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { initializeApp, deleteApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
  getDocs,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  disableNetwork,
  enableNetwork,
  terminate,
} from "firebase/firestore";
import { listenToChessRoom } from "./chessRoomListener.js";

test(
  "room listeners push updates, reconnect, unsubscribe, and cannot list or write rooms",
  {
    skip: process.env.CHESS_EMULATOR_TESTS !== "true",
  },
  async (t) => {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    const require = createRequire(
      new URL("../../functions/package.json", import.meta.url),
    );
    const admin = require("firebase-admin");
    const projectId = "test-data-895e2";
    const adminApp = admin.initializeApp(
      { projectId },
      `chess-listener-admin-${Date.now()}`,
    );
    const code = randomBytes(3).toString("hex");
    const ref = adminApp.firestore().collection("chessRooms").doc(code);
    const clients = [];
    const observers = [];
    t.after(async () => {
      observers.forEach((observer) => observer.stop());
      await Promise.all(
        clients.map(async ({ app, db }) => {
          await terminate(db);
          await deleteApp(app);
        }),
      );
      await ref.delete();
      await adminApp.delete();
    });
    await ref.set({
      code,
      revision: 0,
      status: "waiting",
      moves: [],
      botElo: 1500,
    });

    function createClient() {
      const app = initializeApp(
        { projectId, apiKey: "emulator-only" },
        `chess-listener-${code}-${clients.length}`,
      );
      const db = getFirestore(app);
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      clients.push({ app, db });
      return db;
    }

    function observe() {
      const db = createClient();
      const pending = new Set();
      let latestRoom;
      let connected;
      let failure;
      let roomEvents = 0;
      const check = () => pending.forEach((callback) => callback());
      const stop = listenToChessRoom(db, code, {
        onRoom: (room) => {
          latestRoom = room;
          roomEvents += 1;
          check();
        },
        onConnection: (value) => {
          connected = value;
          check();
        },
        onError: (error) => {
          failure = error;
          check();
        },
      });
      const observer = {
        db,
        stop,
        get latestRoom() {
          return latestRoom;
        },
        get roomEvents() {
          return roomEvents;
        },
        waitFor: (predicate) =>
          new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              pending.delete(checkState);
              reject(new Error("Timed out waiting for a Firestore event"));
            }, 10000);
            const checkState = () => {
              if (failure || predicate({ room: latestRoom, connected })) {
                clearTimeout(timeout);
                pending.delete(checkState);
                if (failure) reject(failure);
                else resolve();
              }
            };
            pending.add(checkState);
            checkState();
          }),
      };
      observers.push(observer);
      return observer;
    }

    const first = observe();
    const second = observe();
    await Promise.all(
      observers.map((observer) =>
        observer.waitFor(
          ({ room, connected }) => connected && room?.revision === 0,
        ),
      ),
    );
    await ref.update({ moves: ["e4"], revision: 1, status: "active" });
    await Promise.all(
      observers.map((observer) =>
        observer.waitFor(({ room }) => room?.revision === 1),
      ),
    );
    assert.deepEqual(first.latestRoom.moves, ["e4"]);
    assert.deepEqual(second.latestRoom.moves, ["e4"]);

    const permissionDenied = (error) => error.code === "permission-denied";
    // An untrusted third client must not change either player's live board.
    const attacker = createClient();
    await assert.rejects(
      () => getDocs(collection(attacker, "chessRooms")),
      permissionDenied,
    );
    await assert.rejects(
      () => setDoc(doc(attacker, "chessRooms", code), { code, moves: ["e5"] }),
      permissionDenied,
    );
    await assert.rejects(
      () => updateDoc(doc(attacker, "chessRooms", code), { botElo: 400 }),
      permissionDenied,
    );
    await assert.rejects(
      () => deleteDoc(doc(attacker, "chessRooms", code)),
      permissionDenied,
    );

    await disableNetwork(first.db);
    await first.waitFor(({ connected }) => !connected);
    await ref.update({ moves: ["e4", "e5"], revision: 2 });
    await second.waitFor(({ room }) => room?.revision === 2);
    assert.equal(first.latestRoom.revision, 1);
    await enableNetwork(first.db);
    await first.waitFor(
      ({ room, connected }) => connected && room?.revision === 2,
    );

    first.stop();
    const stoppedCount = first.roomEvents;
    await ref.update({ revision: 3, status: "finished" });
    await second.waitFor(({ room }) => room?.status === "finished");
    assert.equal(first.roomEvents, stoppedCount);
  },
);
