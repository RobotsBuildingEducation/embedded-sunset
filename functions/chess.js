const express = require("express");
const { Chess } = require("chess.js");
const { nip19, verifyEvent } = require("nostr-tools");
const difficulty = require("./chessDifficulty.json");

const ROOM_PATTERN = /^[A-Za-z0-9]{6}$/;
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });

function verifyChessProof(event, now = Date.now()) {
  if (
    !event ||
    event.kind !== 27235 ||
    !Number.isInteger(event.created_at) ||
    Math.abs(now / 1000 - event.created_at) > 90 ||
    !event.tags?.some((tag) => tag[0] === "t" && tag[1] === "rbe-chess-v1") ||
    !verifyEvent(event)
  )
    throw fail("Your session could not be verified. Please try again.", 401);
  const payload = JSON.parse(event.content);
  return { npub: nip19.npubEncode(event.pubkey), payload };
}

function restoreGame(room) {
  const game = new Chess();
  // Replay the full history so repetition and fifty-move draws survive reloads.
  for (const move of room.moves) game.move(move);
  return game;
}

function gameResult(game) {
  if (game.isCheckmate())
    return game.turn() === "w"
      ? "Black wins by checkmate"
      : "White wins by checkmate";
  if (game.isStalemate()) return "Draw by stalemate";
  if (game.isThreefoldRepetition()) return "Draw by repetition";
  if (game.isInsufficientMaterial()) return "Draw by insufficient material";
  if (game.isDraw()) return "Draw by the fifty-move rule";
  return null;
}

function applyMove(room, npub, payload, bot = false) {
  if (room.status !== "active") throw fail("This game is not active.", 409);
  if (room.moves.length !== payload.ply)
    throw fail("The board has changed. Please try again.", 409);
  const game = restoreGame(room);
  const expected = game.turn() === "w" ? room.white : room.black;
  if (
    bot
      ? !(room.mode === "bot" && expected === "gemini" && room.white === npub)
      : expected !== npub
  ) {
    throw fail("It is not your turn.", 403);
  }
  let move;
  try {
    move = game.move(payload.move);
  } catch {
    throw fail("That move is not legal.");
  }
  if (!move) throw fail("That move is not legal.");
  const result = gameResult(game);
  return {
    ...room,
    moves: [...room.moves, move.san],
    fen: game.fen(),
    lastMove: { from: move.from, to: move.to },
    result,
    status: result ? "finished" : "active",
    updatedAt: Date.now(),
  };
}

function validateBotElo(elo) {
  if (
    !Number.isInteger(elo) ||
    elo < difficulty.min ||
    elo > difficulty.max ||
    (elo - difficulty.min) % difficulty.step !== 0
  ) {
    throw fail(
      `Choose a difficulty from ${difficulty.min} to ${difficulty.max} Elo in steps of ${difficulty.step}.`,
    );
  }
  return elo;
}

function changeDifficulty(room, npub, elo) {
  if (room.white !== npub)
    throw fail("Only the player facing Gemini can change its difficulty.", 403);
  if (room.mode !== "bot" || room.status !== "active")
    throw fail("Difficulty can only be changed in an active Gemini game.", 409);
  return { ...room, botElo: validateBotElo(elo), updatedAt: Date.now() };
}

async function selectGeminiMove(game, generate, elo = difficulty.defaultElo) {
  validateBotElo(elo);
  const band = difficulty.bands.find((level) => elo <= level.max);
  const legal = game.moves();
  const prompt = `You are playing Black in a casual chess game, targeting approximately ${elo} Elo.
Difficulty style: ${band.label}. ${band.guidance}
Match the requested strength and style while choosing only legal moves. Your rating is a target, not a measured rating.
Current FEN: ${game.fen()}
Move history: ${game.history().join(" ")}
Legal SAN moves: ${JSON.stringify(legal)}
Return ONLY JSON with one field: {"move":"one exact legal SAN move from the list"}.`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const text = await generate(prompt);
    try {
      const parsed = JSON.parse(
        text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, ""),
      );
      if (legal.includes(parsed.move)) return parsed.move;
    } catch {
      /* Ask Gemini once more if its output is malformed. */
    }
  }
  throw fail(
    "Gemini could not choose a legal move. Please retry its turn.",
    502,
  );
}

function createChessHandler({ db, generate, logger = console }) {
  const app = express();
  app.use(express.json({ limit: "16kb" }));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.get("/api/chess/rooms/:code", async (req, res, next) => {
    try {
      if (!ROOM_PATTERN.test(req.params.code)) throw fail("Invalid room code.");
      const snapshot = await db
        .collection("chessRooms")
        .doc(req.params.code)
        .get();
      if (!snapshot.exists)
        throw fail("This room does not exist. Create a new game below.", 404);
      res.json(snapshot.data());
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/chess", async (req, res, next) => {
    try {
      const { npub, payload } = verifyChessProof(req.body.event);
      const { action, code } = payload;
      const userRef = db.collection("users").doc(npub);
      if (action === "profile") {
        const profile = await db.runTransaction(async (tx) => {
          const snapshot = await tx.get(userRef);
          if (snapshot.exists)
            return {
              npub,
              name: String(snapshot.data().name || "Player").slice(0, 60),
            };
          const user = {
            npub,
            name: `Player ${npub.slice(-4)}`,
            language: "en",
            step: "onboarding",
            onboardingStep: 1,
            previousStep: 0,
            createdAt: Date.now(),
            source: "chess",
          };
          tx.create(userRef, user);
          return { npub, name: user.name };
        });
        return res.json(profile);
      }
      if (!ROOM_PATTERN.test(code || "")) throw fail("Invalid room code.");
      const ref = db.collection("chessRooms").doc(code);
      let botMove;
      if (action === "botMove") {
        const snapshot = await ref.get();
        if (!snapshot.exists) throw fail("Room not found.", 404);
        const room = snapshot.data();
        if (
          room.mode !== "bot" ||
          room.white !== npub ||
          room.status !== "active" ||
          room.moves.length !== payload.ply ||
          restoreGame(room).turn() !== "b"
        ) {
          throw fail("This bot turn is no longer available.", 409);
        }
        if (payload.move) {
          botMove = payload.move;
        } else {
          // A short server lease avoids duplicate paid generations from multiple tabs.
          const botRoom = await db.runTransaction(async (tx) => {
            const current = (await tx.get(ref)).data();
            if (
              current.moves.length !== payload.ply ||
              current.status !== "active" ||
              current.botLeaseUntil > Date.now()
            ) {
              throw fail(
                "Gemini is already thinking. Please wait a moment.",
                409,
              );
            }
            tx.update(ref, {
              botLeaseUntil: Date.now() + 60000,
              botLeaseOwner: req.body.event.id,
            });
            return current;
          });
          try {
            botMove = await selectGeminiMove(
              restoreGame(botRoom),
              generate,
              botRoom.botElo ?? difficulty.defaultElo,
            );
          } catch (error) {
            await db.runTransaction(async (tx) => {
              const current = (await tx.get(ref)).data();
              if (current.botLeaseOwner === req.body.event.id)
                tx.update(ref, { botLeaseUntil: 0 });
            });
            if (!error.status) {
              logger.error("Gemini chess turn failed", error);
              throw fail(
                "Gemini is temporarily unavailable. Please retry its turn.",
                502,
              );
            }
            throw error;
          }
        }
      }
      const result = await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (action === "create") {
          if (snapshot.exists) {
            if (snapshot.data().white === npub) return snapshot.data();
            throw fail("Room code is taken. Please try again.", 409);
          }
          const user = await tx.get(userRef);
          const room = {
            code,
            revision: 0,
            white: npub,
            black: null,
            whiteName: user.data()?.name || "Player",
            blackName: null,
            mode: "waiting",
            botElo: difficulty.defaultElo,
            status: "waiting",
            moves: [],
            fen: new Chess().fen(),
            result: null,
            lastMove: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          tx.create(ref, room);
          return room;
        }
        if (!snapshot.exists)
          throw fail("This room does not exist. Create a new game below.", 404);
        const room = snapshot.data();
        let nextRoom;
        if (action === "join") {
          if (room.white === npub || room.black === npub) return room;
          if (room.status !== "waiting" || room.black) return room; // Full rooms can be watched.
          const user = await tx.get(userRef);
          nextRoom = {
            ...room,
            black: npub,
            blackName: user.data()?.name || "Player",
            mode: "human",
            status: "active",
            updatedAt: Date.now(),
          };
        } else if (action === "startBot") {
          if (room.white !== npub)
            throw fail("Only the room creator can start the bot.", 403);
          if (room.mode === "bot") return room;
          if (room.status !== "waiting")
            throw fail("A player has already joined this room.", 409);
          nextRoom = {
            ...room,
            black: "gemini",
            blackName: "Gemini",
            mode: "bot",
            botElo: room.botElo ?? difficulty.defaultElo,
            status: "active",
            updatedAt: Date.now(),
          };
        } else if (action === "setDifficulty") {
          nextRoom = changeDifficulty(room, npub, payload.elo);
        } else if (action === "move" || action === "botMove") {
          nextRoom = applyMove(
            room,
            npub,
            { ...payload, move: botMove || payload.move },
            action === "botMove",
          );
          if (action === "botMove") {
            nextRoom.botLeaseUntil = 0;
            if (payload.thoughtSummary) {
              nextRoom.lastBotThought = String(payload.thoughtSummary).slice(0, 500);
            }
          }
        } else if (action === "resign") {
          if (
            room.status !== "active" ||
            ![room.white, room.black].includes(npub)
          )
            throw fail("You cannot resign this game.", 403);
          nextRoom = {
            ...room,
            status: "finished",
            result: `${npub === room.white ? "Black" : "White"} wins by resignation`,
            updatedAt: Date.now(),
          };
        } else throw fail("Unknown chess action.");
        nextRoom.revision = (room.revision || 0) + 1;
        tx.set(ref, nextRoom);
        return nextRoom;
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  app.use((error, req, res, next) => {
    if (!error.status) logger.error("Chess request failed", error);
    res.status(error.status || 500).json({
      error: error.status
        ? error.message
        : "Chess is temporarily unavailable. Please try again.",
    });
  });
  return app;
}

module.exports = {
  createChessHandler,
  verifyChessProof,
  restoreGame,
  applyMove,
  gameResult,
  selectGeminiMove,
  validateBotElo,
  changeDifficulty,
};
