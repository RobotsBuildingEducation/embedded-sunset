import {
  generateSecretKey,
  getPublicKey,
  nip19,
} from "nostr-tools";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Chess } from "chess.js";
import { getChessDatabase } from "./chessDatabase.js";
import { difficulty } from "./chessDifficulty.js";
import { makeRoomCode, sanitizeRoomForFirestore } from "./chessLogic.js";

export function ensureIdentity(storage = localStorage) {
  let npub = storage.getItem("local_npub");
  let nsec = storage.getItem("local_nsec");
  if (nsec && nsec !== "nip07" && !nsec.startsWith("nsec1")) {
    throw new Error(
      "Your saved private key could not be read. Restore your account in the main app.",
    );
  }
  if (nsec?.startsWith("nsec1")) {
    const decoded = nip19.decode(nsec);
    const derived = nip19.npubEncode(getPublicKey(decoded.data));
    if (npub && derived !== npub)
      throw new Error(
        "Your saved Nostr keys do not match. Restore your account in the main app.",
      );
    npub = derived;
  } else if (npub) {
    if (nip19.decode(npub).type !== "npub")
      throw new Error("Your saved account is invalid.");
    if (typeof window !== "undefined" && !window.nostr?.signEvent)
      throw new Error(
        "Connect the Nostr extension for your saved account, then retry.",
      );
    return { npub };
  } else {
    const secret = generateSecretKey();
    npub = nip19.npubEncode(getPublicKey(secret));
    nsec = nip19.nsecEncode(secret);
  }
  // Save the private key locally before making network requests. It is never
  // included in a profile, room, URL, or request to the server.
  storage.setItem("local_nsec", nsec);
  storage.setItem("local_npub", npub);
  storage.setItem("uniqueId", npub);
  return { npub };
}

export function getLocalProfile(storage = localStorage) {
  const { npub } = ensureIdentity(storage);
  let name = `Player ${npub.slice(-4)}`;
  try {
    const cached = JSON.parse(storage.getItem("chess_profile") || "{}");
    if (cached.name && cached.npub === npub) name = cached.name;
  } catch {}
  const profile = { npub, name };
  storage.setItem("chess_profile", JSON.stringify(profile));
  return profile;
}

export function createGuestProfile(storage = localStorage) {
  const secret = generateSecretKey();
  const npub = nip19.npubEncode(getPublicKey(secret));
  const nsec = nip19.nsecEncode(secret);
  const profile = { npub, name: `Player ${npub.slice(-4)}` };
  try {
    storage.setItem("local_nsec", nsec);
    storage.setItem("local_npub", npub);
    storage.setItem("uniqueId", npub);
    storage.setItem("chess_profile", JSON.stringify(profile));
  } catch {}
  return profile;
}

export function createInitialRoom(code, profile) {
  return {
    code,
    revision: 0,
    white: profile.npub,
    black: null,
    whiteName: profile.name || "Player",
    blackName: null,
    mode: "waiting",
    botElo: difficulty.defaultElo,
    status: "waiting",
    moves: [],
    fen: new Chess().fen(),
    result: null,
    lastMove: null,
    lastBotThought: null,
    lastBotThoughtSignature: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function openChessRoom(code) {
  const profile = getLocalProfile();
  let db = null;
  try {
    db = getChessDatabase();
  } catch (err) {
    console.warn("Could not get chess database instance:", err);
  }

  // Creating a new room
  if (!code) {
    const newCode = makeRoomCode();
    const newRoom = createInitialRoom(newCode, profile);
    if (db) {
      try {
        await setDoc(doc(db, "chessRooms", newCode), sanitizeRoomForFirestore(newRoom));
      } catch (err) {
        console.warn("Could not save new room to Firestore:", err);
      }
    }
    return { profile, room: newRoom };
  }

  // Joining or resuming a room with a code
  if (db) {
    try {
      const snap = await getDoc(doc(db, "chessRooms", code));
      if (snap.exists()) {
        const existing = snap.data();
        // Creator returning to the room: always White
        if (existing.white === profile.npub) {
          return { profile, room: existing };
        }
        // Black player returning
        if (existing.black === profile.npub) {
          return { profile, room: existing };
        }
        // Second player joining an open room as Black
        if (existing.status === "waiting" && !existing.black) {
          const joined = {
            ...existing,
            black: profile.npub,
            blackName: profile.name || "Player",
            mode: "human",
            status: "active",
            updatedAt: Date.now(),
            revision: (existing.revision || 0) + 1,
          };
          try {
            await setDoc(doc(db, "chessRooms", code), sanitizeRoomForFirestore(joined));
          } catch (err) {
            console.warn("Error updating joined room in Firestore:", err);
          }
          return { profile, room: joined };
        }
        // Spectator
        return { profile, room: existing };
      }
    } catch (err) {
      console.warn("Firestore error checking room, falling back:", err);
    }
  }

  // If document didn't exist in Firestore, creator creates it with this code
  // The creator is ALWAYS White
  const newRoom = createInitialRoom(code, profile);
  if (db) {
    try {
      await setDoc(doc(db, "chessRooms", code), sanitizeRoomForFirestore(newRoom));
    } catch (err) {
      console.warn("Could not create room in Firestore:", err);
    }
  }
  return { profile, room: newRoom };
}

// Deprecated stub kept for backwards compatibility if needed
export async function chessRequest() {
  throw new Error("chessRequest is deprecated; all chess actions use Firestore directly.");
}
