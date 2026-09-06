const test = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
} = require("nostr-tools");
const { createChessHandler } = require("./chess");

test(
  "Firestore emulator: identities, concurrent invites, persisted turns, and bot leases",
  {
    skip: process.env.CHESS_EMULATOR_TESTS !== "true",
  },
  async (t) => {
    // This test can only address the local emulator; never a production database.
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    const admin = require("firebase-admin");
    const app = admin.initializeApp(
      { projectId: "test-data-895e2" },
      `chess-test-${Date.now()}`,
    );
    const db = app.firestore();
    const records = [];
    let generationCount = 0;
    let releaseBot;
    const botWait = new Promise((resolve) => {
      releaseBot = resolve;
    });
    const handler = createChessHandler({
      db,
      generate: async (prompt) => {
        assert.match(prompt, /600 Elo/);
        generationCount += 1;
        await botWait;
        return '{"move":"e5"}';
      },
    });
    const server = handler.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    t.after(async () => {
      releaseBot();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await Promise.all(records.map((ref) => ref.delete()));
      await app.delete();
    });
    const users = Array.from({ length: 3 }, () => {
      const key = generateSecretKey();
      const npub = nip19.npubEncode(getPublicKey(key));
      records.push(db.collection("users").doc(npub));
      return { key, npub };
    });
    const call = async (user, payload) => {
      const event = finalizeEvent(
        {
          kind: 27235,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["t", "rbe-chess-v1"],
            ["nonce", randomBytes(8).toString("hex")],
          ],
          content: JSON.stringify(payload),
        },
        user.key,
      );
      const response = await fetch(`${base}/api/chess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      return { status: response.status, data: await response.json() };
    };
    for (const user of users)
      assert.equal((await call(user, { action: "profile" })).status, 200);
    await records[0].update({
      name: "Existing learner",
      answeredStepsCount: 42,
    });
    const restored = await call(users[0], { action: "profile" });
    assert.equal(restored.data.name, "Existing learner");
    const stored = (await records[0].get()).data();
    assert.equal(stored.answeredStepsCount, 42);
    assert.equal("nsec" in stored || "privateKey" in stored, false);
    const code = randomBytes(3).toString("hex");
    records.push(db.collection("chessRooms").doc(code));
    assert.equal(
      (await call(users[0], { action: "create", code })).status,
      200,
    );
    const joins = await Promise.all(
      users.slice(1).map((user) => call(user, { action: "join", code })),
    );
    assert.equal(joins[0].data.black, joins[1].data.black);
    const black = users.find((user) => user.npub === joins[0].data.black);
    const watcher = users.find((user) => user !== black && user !== users[0]);
    assert.equal(
      (await call(watcher, { action: "move", code, ply: 0, move: "e4" }))
        .status,
      403,
    );
    const repeated = await Promise.all(
      [1, 2].map(() =>
        call(users[0], { action: "move", code, ply: 0, move: "e4" }),
      ),
    );
    assert.deepEqual(
      repeated.map((response) => response.status).sort(),
      [200, 409],
    );
    assert.equal(
      (await call(black, { action: "move", code, ply: 1, move: "e5" })).status,
      200,
    );
    assert.equal(
      (await call(users[0], { action: "startBot", code })).status,
      409,
    );
    const rejoined = await call(users[0], { action: "join", code });
    assert.deepEqual(rejoined.data.moves, ["e4", "e5"]);
    const polled = await (
      await fetch(`${base}/api/chess/rooms/${code}`)
    ).json();
    assert.deepEqual(polled.moves, ["e4", "e5"]);
    assert.equal(
      (await fetch(`${base}/api/chess/rooms/invalid-code`)).status,
      400,
    );
    assert.equal(
      (await call(users[0], { action: "resign", code })).data.status,
      "finished",
    );

    const botCode = randomBytes(3).toString("hex");
    records.push(db.collection("chessRooms").doc(botCode));
    await call(users[0], { action: "create", code: botCode });
    await call(users[0], { action: "startBot", code: botCode });
    assert.equal(
      (
        await call(users[1], {
          action: "setDifficulty",
          code: botCode,
          elo: 600,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await call(users[0], {
          action: "setDifficulty",
          code: botCode,
          elo: 2500,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call(users[0], {
          action: "setDifficulty",
          code: botCode,
          elo: 600,
        })
      ).data.botElo,
      600,
    );
    await call(users[0], { action: "move", code: botCode, ply: 0, move: "e4" });
    const botTurn = call(users[0], {
      action: "botMove",
      code: botCode,
      ply: 1,
    });
    // Wait on a concrete test condition, bounded to avoid a hanging failure.
    for (let tries = 0; generationCount === 0 && tries < 100; tries += 1)
      await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(generationCount, 1);
    // Changing the level while Gemini is thinking preserves the captured prompt
    // and the new setting must survive when the pending move is committed.
    assert.equal(
      (
        await call(users[0], {
          action: "setDifficulty",
          code: botCode,
          elo: 2200,
        })
      ).data.botElo,
      2200,
    );
    assert.equal(
      (await call(users[0], { action: "botMove", code: botCode, ply: 1 }))
        .status,
      409,
    );
    releaseBot();
    assert.equal((await botTurn).status, 200);
    assert.equal(generationCount, 1);
    assert.deepEqual((await records.at(-1).get()).data().moves, ["e4", "e5"]);
    const restoredBotRoom = await (
      await fetch(`${base}/api/chess/rooms/${botCode}`)
    ).json();
    assert.equal(restoredBotRoom.botElo, 2200);
  },
);
