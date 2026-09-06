import { Chess } from "chess.js";

export const pieceNames = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};
export const squares = Array.from(
  { length: 64 },
  (_, i) => `${"abcdefgh"[i % 8]}${8 - Math.floor(i / 8)}`,
);

export function gameFromMoves(moves = []) {
  const game = new Chess();
  for (const move of moves) game.move(move);
  return game;
}

export function territoryFor(game) {
  const coverage = { w: new Set(), b: new Set() };
  for (const color of ["w", "b"]) {
    const fields = game.fen().split(" ");
    // The inactive side is evaluated as if it moved next; en passant only
    // belongs to the actual side to move. Never mutate the live game/history.
    if (fields[1] !== color) fields[3] = "-";
    fields[1] = color;
    const position = new Chess(fields.join(" "));
    for (const move of position.moves({ verbose: true })) {
      if (move.captured !== "k") coverage[color].add(move.to);
    }
  }
  return Object.fromEntries(
    squares.map((square) => [
      square,
      coverage.w.has(square) && coverage.b.has(square)
        ? "overlap"
        : coverage.w.has(square)
          ? "white"
          : coverage.b.has(square)
            ? "black"
            : "none",
    ]),
  );
}

export function makeRoomCode() {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  while (result.length < 6) {
    for (const byte of crypto.getRandomValues(new Uint8Array(12))) {
      if (byte < 248 && result.length < 6) result += alphabet[byte % 62];
    }
  }
  return result;
}

export function gameResult(game) {
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

export function sanitizeRoomForFirestore(room) {
  if (!room || typeof room !== "object") return room;
  const clean = {};
  for (const [key, val] of Object.entries(room)) {
    clean[key] = val === undefined ? null : val;
  }
  return clean;
}

export function applyLocalMove(room, moveInput, options = {}) {
  if (!room) return room;
  const game = gameFromMoves(room.moves || []);
  let move;
  try {
    move = game.move(moveInput);
  } catch {
    return room;
  }
  if (!move) return room;
  const result = gameResult(game);
  return {
    ...room,
    revision: (room.revision || 0) + 1,
    status: result ? "finished" : "active",
    result: result || null,
    moves: [...(room.moves || []), move.san],
    fen: game.fen(),
    lastMove: { from: move.from, to: move.to, san: move.san },
    lastBotThought:
      options.thoughtSummary !== undefined
        ? options.thoughtSummary
        : (room.lastBotThought ?? null),
    lastBotThoughtSignature:
      options.thoughtSignature !== undefined
        ? options.thoughtSignature
        : (room.lastBotThoughtSignature ?? null),
    lastBotThoughts:
      options.thoughts !== undefined
        ? options.thoughts
        : (room.lastBotThoughts ?? []),
    lastBotThoughtSignatures:
      options.thoughtSignatures !== undefined
        ? options.thoughtSignatures
        : (room.lastBotThoughtSignatures ?? []),
    updatedAt: Date.now(),
  };
}

