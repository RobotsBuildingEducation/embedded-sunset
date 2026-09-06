const test = require("node:test");
const assert = require("node:assert/strict");
const { Chess } = require("chess.js");
const {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
} = require("nostr-tools");
const {
  verifyChessProof,
  applyMove,
  restoreGame,
  gameResult,
  selectGeminiMove,
  validateBotElo,
  changeDifficulty,
} = require("./chess");

const room = (moves = [], extra = {}) => ({
  white: "alice",
  black: "bob",
  moves,
  status: "active",
  mode: "human",
  ...extra,
});

test("difficulty accepts slider endpoints and rejects untrusted or out-of-range values", () => {
  for (const elo of [400, 600, 1500, 2200, 2400])
    assert.equal(validateBotElo(elo), elo);
  for (const elo of [null, "1500", 399, 2500, 1450, NaN, Infinity])
    assert.throws(() => validateBotElo(elo), /Choose a difficulty/);
});

test("only the player facing Gemini can change difficulty without resetting the game", () => {
  const current = room(["e4", "e5"], {
    mode: "bot",
    black: "gemini",
    botElo: 1500,
  });
  const updated = changeDifficulty(current, "alice", 600);
  assert.equal(updated.botElo, 600);
  assert.deepEqual(updated.moves, ["e4", "e5"]);
  assert.equal(current.botElo, 1500);
  assert.throws(
    () => changeDifficulty(current, "spectator", 600),
    /Only the player/,
  );
  assert.throws(
    () => changeDifficulty(room(), "alice", 600),
    /active Gemini game/,
  );
  assert.throws(
    () => changeDifficulty({ ...current, status: "finished" }, "alice", 600),
    /active Gemini game/,
  );
});

test("Gemini prompts use the selected target and matching beginner or advanced play style", async () => {
  const game = restoreGame(room(["e4"]));
  for (const [elo, style] of [
    [600, /Play like a new learner/],
    [2200, /Aim for your strongest play/],
  ]) {
    await selectGeminiMove(
      game,
      async (prompt) => {
        assert.ok(prompt.includes(`${elo} Elo`));
        assert.match(prompt, style);
        return '{"move":"e5"}';
      },
      elo,
    );
  }
});

test("signed requests verify identity and reject tampering, stale proofs and wrong namespaces", () => {
  const key = generateSecretKey();
  const template = {
    kind: 27235,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", "rbe-chess-v1"]],
    content: JSON.stringify({ action: "profile" }),
  };
  const event = finalizeEvent(template, key);
  assert.equal(
    verifyChessProof(event).npub,
    nip19.npubEncode(getPublicKey(key)),
  );
  assert.throws(
    () =>
      verifyChessProof(JSON.parse(JSON.stringify({ ...event, content: "{}" }))),
    /verified/,
  );
  assert.throws(() => verifyChessProof(event, Date.now() + 100000), /verified/);
  assert.throws(
    () => verifyChessProof(finalizeEvent({ ...template, tags: [] }, key)),
    /verified/,
  );
});

test("server enforces legal moves, seats, turn, revision, and game status", () => {
  assert.throws(() => applyMove(room(), "bob", { ply: 0, move: "e4" }), /turn/);
  assert.throws(
    () => applyMove(room(), "spectator", { ply: 0, move: "e4" }),
    /turn/,
  );
  assert.throws(
    () => applyMove(room(), "alice", { ply: 0, move: "e5" }),
    /legal/,
  );
  assert.throws(
    () => applyMove(room(), "alice", { ply: 1, move: "e4" }),
    /changed/,
  );
  assert.throws(
    () =>
      applyMove(room([], { status: "finished" }), "alice", {
        ply: 0,
        move: "e4",
      }),
    /active/,
  );
  const next = applyMove(room(), "alice", {
    ply: 0,
    move: { from: "e2", to: "e4" },
  });
  assert.deepEqual(next.moves, ["e4"]);
  assert.equal(restoreGame(next).turn(), "b");
  assert.throws(
    () => applyMove(next, "alice", { ply: 0, move: "d4" }),
    /changed/,
  );
});

test("castling and en passant update both involved pieces", () => {
  const castle = applyMove(
    room(["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"]),
    "alice",
    { ply: 6, move: "O-O" },
  );
  const board = new Chess(castle.fen);
  assert.equal(board.get("g1").type, "k");
  assert.equal(board.get("f1").type, "r");
  const ep = applyMove(room(["e4", "a6", "e5", "d5"]), "alice", {
    ply: 4,
    move: "exd6",
  });
  assert.equal(new Chess(ep.fen).get("d5"), undefined);
  assert.equal(new Chess(ep.fen).get("d6").color, "w");
});

test("all four promotion choices are accepted and persisted", () => {
  const moves = ["a4", "h5", "a5", "h4", "a6", "h3", "axb7", "hxg2"];
  for (const promotion of ["q", "r", "b", "n"]) {
    const next = applyMove(room(moves), "alice", {
      ply: 8,
      move: { from: "b7", to: "a8", promotion },
    });
    assert.equal(new Chess(next.fen).get("a8").type, promotion);
  }
});

test("checkmate and repetition end the persisted game", () => {
  const mate = applyMove(room(["f3", "e5", "g4"]), "bob", {
    ply: 3,
    move: "Qh4#",
  });
  assert.equal(mate.status, "finished");
  assert.equal(mate.result, "Black wins by checkmate");
  const repetition = applyMove(
    room(["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1"]),
    "bob",
    { ply: 7, move: "Ng8" },
  );
  assert.equal(repetition.result, "Draw by repetition");
  assert.equal(
    gameResult(new Chess("k7/8/1QK5/8/8/8/8/8 b - - 0 1")),
    "Draw by stalemate",
  );
  assert.equal(
    gameResult(new Chess("k7/8/2K5/8/8/8/8/8 w - - 0 1")),
    "Draw by insufficient material",
  );
});

test("bot turns require the host, bot mode, and Black to move", () => {
  const bot = room(["e4"], { mode: "bot", black: "gemini" });
  assert.equal(
    applyMove(bot, "alice", { ply: 1, move: "e5" }, true).moves.length,
    2,
  );
  assert.throws(
    () => applyMove(bot, "bob", { ply: 1, move: "e5" }, true),
    /turn/,
  );
  assert.throws(() => applyMove(bot, "alice", { ply: 1, move: "e5" }), /turn/);
  assert.throws(
    () => applyMove(room(["e4"]), "alice", { ply: 1, move: "e5" }, true),
    /turn/,
  );
});

test("Gemini receives legal options and retries invalid output without a fake fallback", async () => {
  const game = restoreGame(room(["e4"]));
  let calls = 0;
  const move = await selectGeminiMove(game, async (prompt) => {
    assert.match(prompt, /1500 Elo/);
    assert.match(prompt, /Legal SAN moves/);
    calls += 1;
    return calls === 1 ? '{"move":"e9"}' : '```json\n{"move":"e5"}\n```';
  });
  assert.equal(calls, 2);
  assert.equal(move, "e5");
  await assert.rejects(
    () => selectGeminiMove(game, async () => "bad json"),
    /legal move/,
  );
  await assert.rejects(
    () =>
      selectGeminiMove(game, async () => {
        throw new Error("Unavailable");
      }),
    /Unavailable/,
  );
});
