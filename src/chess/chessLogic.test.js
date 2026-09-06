import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import {
  gameFromMoves,
  territoryFor,
  makeRoomCode,
  applyLocalMove,
  gameResult,
  sanitizeRoomForFirestore,
} from "./chessLogic.js";
import {
  generateBotMove,
  parseModelResponse,
  splitIntoThoughtSteps,
} from "./chessBot.js";

test("opening coverage contains both sides' pawn and knight destinations", () => {
  const game = new Chess();
  const before = game.fen();
  const territory = territoryFor(game);
  assert.equal(territory.e4, "white");
  assert.equal(territory.e5, "black");
  assert.equal(territory.a1, "none");
  assert.equal(
    Object.values(territory).filter((value) => value === "white").length,
    16,
  );
  assert.equal(
    Object.values(territory).filter((value) => value === "black").length,
    16,
  );
  assert.equal(game.fen(), before);
});

test("shared destinations are marked without altering turn or history", () => {
  const game = gameFromMoves(["e4"]);
  const territory = territoryFor(game);
  assert.equal(territory.e5, "overlap");
  assert.equal(territory.a6, "overlap");
  assert.deepEqual(game.history(), ["e4"]);
  assert.equal(game.turn(), "b");
});

test("pinned pieces cannot add illegal destinations; kings are not captured", () => {
  const game = new Chess("k3r3/8/8/8/8/8/4N3/4K3 w - - 0 1");
  assert.notEqual(territoryFor(game).c3, "white");
  const check = gameFromMoves(["e4", "f6", "Qh5+"]);
  assert.notEqual(territoryFor(check).e8, "white");
});

test("en passant is available only for the current side", () => {
  const game = gameFromMoves(["e4", "a6", "e5", "d5"]);
  assert.equal(territoryFor(game).d6, "overlap"); // Black's queen can also reach d6.
  assert.equal(
    game
      .moves({ verbose: true })
      .find((move) => move.san === "exd6")
      .isEnPassant(),
    true,
  );
});

test("restoring full history preserves repetition draws", () => {
  const game = gameFromMoves([
    "Nf3",
    "Nf6",
    "Ng1",
    "Ng8",
    "Nf3",
    "Nf6",
    "Ng1",
    "Ng8",
  ]);
  assert.equal(game.isThreefoldRepetition(), true);
});

test("room codes are six invite-safe, case-sensitive alphanumeric characters", () => {
  const codes = new Set(Array.from({ length: 100 }, makeRoomCode));
  assert.equal(codes.size, 100);
  for (const code of codes) assert.match(code, /^[A-Za-z0-9]{6}$/);
});

test("applyLocalMove applies legal moves, updates revision, and sets lastBotThought", () => {
  const initialRoom = {
    code: "test01",
    revision: 0,
    moves: [],
    status: "active",
  };
  const afterWhite = applyLocalMove(initialRoom, "e4");
  assert.equal(afterWhite.revision, 1);
  assert.deepEqual(afterWhite.moves, ["e4"]);
  assert.equal(afterWhite.lastMove.san, "e4");

  const afterBlack = applyLocalMove(afterWhite, "c5", {
    thoughtSummary: "Sicilian defense to contest d4.",
  });
  assert.equal(afterBlack.revision, 2);
  assert.deepEqual(afterBlack.moves, ["e4", "c5"]);
  assert.equal(afterBlack.lastBotThought, "Sicilian defense to contest d4.");
  assert.equal(afterBlack.status, "active");
});

test("gameResult detects checkmate and draws", () => {
  const mateGame = gameFromMoves(["f3", "e5", "g4", "Qh4#"]);
  assert.equal(gameResult(mateGame), "Black wins by checkmate");

  const liveGame = gameFromMoves(["e4", "e5"]);
  assert.equal(gameResult(liveGame), null);
});

test("generateBotMove returns valid move and thought summary using model", async () => {
  const game = gameFromMoves(["e4"]);
  const mockModel = {
    generateContent: async () => ({
      response: {
        text: () =>
          JSON.stringify({
            thoughtSummary: "Responding with c5 to fight for the center.",
            move: "c5",
          }),
      },
    }),
  };
  const result = await generateBotMove({
    game,
    botElo: 1500,
    chessModel: mockModel,
    stepDelayMs: 1,
  });
  assert.equal(result.move, "c5");
  assert.match(result.thoughtSummary, /Responding with c5/);
});

test("generateBotMove progressively emits chain of thoughts replacing each step", async () => {
  const game = gameFromMoves(["e4"]);
  const mockModel = {
    generateContent: async () => ({
      response: {
        candidates: [
          {
            thoughtSignature: "sig_abc",
            content: {
              parts: [
                {
                  thought:
                    "Step 1: Check king safety.\nStep 2: Calculate central push.\nStep 3: Play c5.",
                },
                {
                  text: JSON.stringify({
                    thoughtSummary: "Playing c5.",
                    move: "c5",
                  }),
                },
              ],
            },
          },
        ],
      },
    }),
  };

  const stepsEmitted = [];
  const result = await generateBotMove({
    game,
    botElo: 1500,
    chessModel: mockModel,
    stepDelayMs: 2,
    onThoughtStep: (step, index) => {
      stepsEmitted.push({ step, index });
    },
  });

  assert.equal(result.move, "c5");
  assert.equal(stepsEmitted.length, 3);
  assert.equal(stepsEmitted[0].index, 0);
  assert.equal(stepsEmitted[0].step, "Step 1: Check king safety.");
  assert.equal(stepsEmitted[1].index, 1);
  assert.equal(stepsEmitted[1].step, "Step 2: Calculate central push.");
  assert.equal(stepsEmitted[2].index, 2);
  assert.equal(stepsEmitted[2].step, "Step 3: Play c5.");
});

test("generateBotMove supports generateContentStream chunk streaming", async () => {
  const game = gameFromMoves(["e4"]);
  const mockStreamModel = {
    generateContentStream: async () => ({
      stream: (async function* () {
        yield {
          candidates: [
            {
              thoughtSignature: "sig_live_1",
              content: {
                parts: [{ thought: "Paso 1: Analizar peón en e4." }],
              },
            },
          ],
        };
        yield {
          candidates: [
            {
              thoughtSignature: "sig_live_2",
              content: {
                parts: [{ thought: "\nPaso 2: Desarrollar caballo a f6." }],
              },
            },
          ],
        };
      })(),
      response: Promise.resolve({
        candidates: [
          {
            thoughtSignature: "sig_final",
            content: {
              parts: [
                {
                  thought:
                    "Paso 1: Analizar peón en e4.\nPaso 2: Desarrollar caballo a f6.",
                },
                {
                  text: JSON.stringify({
                    thoughtSummary: "Desarrollando caballo.",
                    move: "Nf6",
                  }),
                },
              ],
            },
          },
        ],
      }),
    }),
  };

  const streamedSteps = [];
  const result = await generateBotMove({
    game,
    botElo: 1500,
    chessModel: mockStreamModel,
    stepDelayMs: 2,
    onThoughtStep: (step, index) => {
      streamedSteps.push({ step, index });
    },
  });

  assert.equal(result.move, "Nf6");
  assert.ok(streamedSteps.length >= 2);
  assert.equal(streamedSteps[0].step, "Paso 1: Analizar peón en e4.");
  assert.equal(streamedSteps[1].step, "Paso 2: Desarrollar caballo a f6.");
  assert.ok(result.thoughtSignatures.includes("sig_live_1"));
  assert.ok(result.thoughtSignatures.includes("sig_live_2"));
});

test("splitIntoThoughtSteps handles numbered lists, Spanish prefixes, and bullet points", () => {
  const numbered = "1. First step.\n2. Second step.\n3. Third step.";
  assert.deepEqual(splitIntoThoughtSteps(numbered), [
    "1. First step.",
    "2. Second step.",
    "3. Third step.",
  ]);

  const bullets = "* Attack king\n* Consolidate pawn";
  assert.deepEqual(splitIntoThoughtSteps(bullets), [
    "Attack king",
    "Consolidate pawn",
  ]);

  const spanish = "Fase 1: Preparar enroque.\nFase 2: Abrir columna f.";
  assert.deepEqual(splitIntoThoughtSteps(spanish), [
    "Fase 1: Preparar enroque.",
    "Fase 2: Abrir columna f.",
  ]);
});

test("applyLocalMove sets null instead of undefined for bot thought fields", () => {
  const room = { code: "clean1", revision: 0, moves: [], status: "active" };
  const after = applyLocalMove(room, "d4");
  assert.strictEqual(after.lastBotThought, null);
  assert.strictEqual(after.lastBotThoughtSignature, null);
  assert.strictEqual(after.result, null);
});

test("sanitizeRoomForFirestore converts all undefined properties to null", () => {
  const dirty = {
    code: "TEST99",
    moves: ["e4"],
    lastBotThought: undefined,
    lastBotThoughtSignature: undefined,
    nested: { ok: true },
  };
  const cleaned = sanitizeRoomForFirestore(dirty);
  assert.strictEqual(cleaned.lastBotThought, null);
  assert.strictEqual(cleaned.lastBotThoughtSignature, null);
  assert.strictEqual(cleaned.code, "TEST99");
  assert.deepEqual(cleaned.moves, ["e4"]);
});

test("parseModelResponse extracts thoughts, chain of thoughts, and signatures without JSON.parse errors", () => {
  const mockResult = {
    response: {
      candidates: [
        {
          thoughtSignature: "sig_candidate_456",
          content: {
            parts: [
              {
                thought: true,
                text: "Step 1: Evaluate pawn structure after 1. e4.\n\nStep 2: Compare 1... c5 vs 1... e5.\n\nStep 3: Choose 1... c5 to unbalance the game.",
                thoughtSignature: "sig_part_123",
              },
              {
                text: "```json\n{\n  \"thoughtSummary\": \"Sicilian defense chosen to unbalance the game.\",\n  \"move\": \"c5\"\n}\n```",
              },
            ],
          },
        },
      ],
      text: () =>
        "Step 1: Evaluate pawn structure...\nStep 2: Compare...\n```json\n{\n  \"thoughtSummary\": \"Sicilian defense chosen to unbalance the game.\",\n  \"move\": \"c5\"\n}\n```",
    },
  };

  const parsed = parseModelResponse(mockResult, ["c5", "e5", "Nf6"]);
  assert.equal(parsed.move, "c5");
  assert.equal(parsed.thoughtSummary, "Sicilian defense chosen to unbalance the game.");
  assert.equal(parsed.thoughts.length, 3);
  assert.equal(parsed.thoughts[0], "Step 1: Evaluate pawn structure after 1. e4.");
  assert.equal(parsed.thoughts[1], "Step 2: Compare 1... c5 vs 1... e5.");
  assert.equal(parsed.thoughts[2], "Step 3: Choose 1... c5 to unbalance the game.");
  assert.equal(parsed.thoughtSignatures.length, 2);
  assert.ok(parsed.thoughtSignatures.includes("sig_part_123"));
  assert.ok(parsed.thoughtSignatures.includes("sig_candidate_456"));
});

test("splitIntoThoughtSteps returns empty array when raw thoughts are missing", () => {
  assert.deepEqual(splitIntoThoughtSteps(null), []);
  assert.deepEqual(splitIntoThoughtSteps(""), []);
  assert.deepEqual(splitIntoThoughtSteps([]), []);
  assert.deepEqual(splitIntoThoughtSteps("   "), []);
});

test("applyLocalMove correctly persists lastBotThoughts and lastBotThoughtSignatures arrays", () => {
  const initial = { code: "sigtest", revision: 0, moves: [], status: "active" };
  const after = applyLocalMove(initial, "e4", {
    thoughtSummary: "Controlling center squares e4 and d5.",
    thoughtSignature: "sig_e4_primary",
    thoughts: ["Step 1: Stake central claim.", "Step 2: Free queen and bishop diagonals."],
    thoughtSignatures: ["sig_e4_primary", "sig_e4_aux"],
  });

  assert.equal(after.lastBotThought, "Controlling center squares e4 and d5.");
  assert.equal(after.lastBotThoughtSignature, "sig_e4_primary");
  assert.deepEqual(after.lastBotThoughts, [
    "Step 1: Stake central claim.",
    "Step 2: Free queen and bishop diagonals.",
  ]);
  assert.deepEqual(after.lastBotThoughtSignatures, [
    "sig_e4_primary",
    "sig_e4_aux",
  ]);
});

test("parseModelResponse preserves distinct thoughtSummary, empty thoughts, and signatures when model returns no thought parts", () => {
  const resultWithoutThoughts = {
    response: {
      candidates: [
        {
          thoughtSignature: "sig_opaque_token_999",
          content: {
            parts: [
              {
                text: JSON.stringify({
                  thoughtSummary: "Quick tactical response without verbose reasoning.",
                  move: "e4",
                }),
              },
            ],
          },
        },
      ],
    },
  };

  const parsed = parseModelResponse(resultWithoutThoughts, ["e4", "d4"]);
  assert.equal(parsed.move, "e4");
  assert.equal(
    parsed.thoughtSummary,
    "Quick tactical response without verbose reasoning.",
  );
  // thoughts must NOT duplicate thoughtSummary into an array!
  assert.deepEqual(parsed.thoughts, []);
  // Cryptographic signature is preserved
  assert.deepEqual(parsed.thoughtSignatures, ["sig_opaque_token_999"]);
  assert.equal(parsed.thoughtSignature, "sig_opaque_token_999");
});

test("generateBotMove fails after one request without consulting another model", async () => {
  const calls = [];
  const chessModel = {
    generateContentStream: async () => {
      calls.push("stream");
      throw new Error("400 Bad Request: Model not available");
    },
    generateContent: async () => calls.push("non-stream"),
  };
  const fallbackModel = { generateContent: async () => calls.push("fallback") };
  await assert.rejects(generateBotMove({
    game: gameFromMoves(["e4"]), botElo: 1500, chessModel, fallbackModel,
  }), /Model not available/);
  assert.deepEqual(calls, ["stream"]);
});

test("generateBotMove propagates errors without inventing a move or deliberation", async () => {
  const game = new Chess();
  const before = game.fen();
  const emitted = [];
  await assert.rejects(generateBotMove({
    game,
    botElo: 900,
    chessModel: { generateContent: async () => { throw new Error("Quota exceeded"); } },
    onThoughtStep: (step) => emitted.push(step),
  }), /Quota exceeded/);
  assert.deepEqual(emitted, []);
  assert.equal(game.fen(), before);
});

test("streamed thoughts are preserved in result.thoughts even if final response omits thought parts", async () => {
  const game = new Chess();
  game.move("e4");
  const streamingModel = {
    generateContentStream: async () => ({
      stream: (async function* () {
        yield {
          candidates: [
            {
              content: {
                parts: [{ thought: "1. Calculating threats.\n2. Choosing e5." }],
              },
            },
          ],
        };
      })(),
      response: Promise.resolve({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify({ move: "e5", thoughtSummary: "Playing e5." }) }],
            },
          },
        ],
      }),
    }),
  };

  const result = await generateBotMove({
    game,
    botElo: 1500,
    chessModel: streamingModel,
    stepDelayMs: 2,
  });

  assert.equal(result.move, "e5");
  assert.equal(result.thoughtSummary, "Playing e5.");
  assert.deepEqual(result.thoughts, [
    "1. Calculating threats.",
    "2. Choosing e5.",
  ]);
});

test("parseModelResponse extracts thinkingSteps array distinctly from thoughtSummary", () => {
  const modelOutput = {
    response: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  thoughtSummary: "Solidifying center with c5.",
                  thinkingSteps: [
                    "Step 1: Check White's pawn on d4.",
                    "Step 2: Compare candidate responses c5 and e6.",
                    "Step 3: Play c5 to challenge central tension.",
                  ],
                  move: "c5",
                }),
              },
            ],
          },
          thoughtSignature: "sig_abc_123",
        },
      ],
    },
  };

  const parsed = parseModelResponse(modelOutput, ["c5", "e5", "Nf6"], "en");
  assert.equal(parsed.move, "c5");
  assert.equal(parsed.thoughtSummary, "Solidifying center with c5.");
  assert.deepEqual(parsed.thoughts, [
    "Step 1: Check White's pawn on d4.",
    "Step 2: Compare candidate responses c5 and e6.",
    "Step 3: Play c5 to challenge central tension.",
  ]);
  assert.equal(parsed.thoughtSignature, "sig_abc_123");
});



