import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { generateBotMove, parseModelResponse } from "./chessBot.js";
import { applyLocalMove, gameFromMoves } from "./chessLogic.js";

const chunk = (...parts) => ({ candidates: [{ content: { parts } }] });

test("one stream preserves loader steps through SDK aggregation and room persistence", async () => {
  const game = gameFromMoves(["e4"]);
  const steps = [
    "Step 1: Check king safety.",
    "Step 2: Compare e5 and c5.",
    "Step 3: Choose c5.",
  ];
  const answer = JSON.stringify({
    move: "c5",
    thoughtSummary: "Playing c5.",
    thinkingSteps: [
      "Different explanation 1",
      "Different explanation 2",
      "Different explanation 3",
      "Different explanation 4",
    ],
  });
  const emitted = [];
  let requests = 0;
  const result = await generateBotMove({
    game,
    botElo: 700,
    chessModel: {
      generateContentStream: async (payload) => {
        requests += 1;
        assert.deepEqual(payload.generationConfig.thinkingConfig, {
          thinkingLevel: "LOW",
          includeThoughts: true,
        });
        assert.doesNotMatch(payload.contents[0].parts[0].text, /thinkingSteps/);
        return {
          stream: (async function* () {
            // Each character can be a transport fragment, including whitespace.
            for (const text of steps.join("\n"))
              yield chunk({ thought: true, text });
            yield chunk({ thoughtSignature: "opaque-signature" });
            for (const text of answer) yield chunk({ text });
          })(),
          // Mirrors the installed SDK losing thought flags during aggregation.
          response: Promise.resolve(
            chunk(
              { text: steps.join("\n") },
              ...[...answer].map((text) => ({ text })),
            ),
          ),
        };
      },
      generateContent: async () => {
        throw new Error("Unexpected second call");
      },
    },
    onThoughtStep: (step, index) => emitted.push({ step, index }),
  });
  assert.equal(requests, 1);
  assert.equal(result.move, "c5");
  assert.deepEqual(result.thoughts, steps);
  assert.deepEqual(
    emitted,
    steps.map((step, index) => ({ step, index })),
  );
  assert.deepEqual(result.thoughtSignatures, ["opaque-signature"]);
  const room = applyLocalMove(
    {
      code: "ABC123",
      mode: "bot",
      status: "active",
      moves: ["e4"],
      revision: 1,
    },
    result.move,
    result,
  );
  assert.deepEqual(
    room.lastBotThoughts,
    emitted.map(({ step }) => step),
  );
});

test("JSON-only answers never create synthetic steps", async () => {
  const emitted = [];
  const result = await generateBotMove({
    game: gameFromMoves(["e4"]),
    botElo: 700,
    chessModel: {
      generateContent: async () => chunk({ text: '{"move":"a5"}' }),
    },
    onThoughtStep: (step) => emitted.push(step),
  });
  assert.equal(result.move, "a5");
  assert.deepEqual(result.thoughts, []);
  assert.deepEqual(emitted, []);
});

test("a signature-only part can break SDK aggregation without discarding a valid streamed move", async () => {
  const result = await generateBotMove({
    game: gameFromMoves(["e4"]),
    botElo: 700,
    chessModel: {
      generateContentStream: async () => ({
        stream: (async function* () {
          yield chunk({ thought: true, text: "Choose c5." });
          yield chunk({ text: '{"move":"c5"}' });
          yield chunk({ thoughtSignature: "signature-only" });
        })(),
        response: Promise.reject(
          new Error(
            "Part should have at least one property, but there are none.",
          ),
        ),
      }),
    },
  });
  assert.equal(result.move, "c5");
  assert.deepEqual(result.thoughts, ["Choose c5."]);
  assert.deepEqual(result.thoughtSignatures, ["signature-only"]);
});

test("real thought parts take precedence over a separately generated JSON explanation", () => {
  const result = parseModelResponse(
    chunk(
      { thought: true, text: "Choose c5." },
      { text: '{"move":' },
      { text: '"c5","thinkingSteps":["Unrelated step"]}' },
    ),
    ["c5"],
  );
  assert.deepEqual(result.thoughts, ["Choose c5."]);
});

for (const failure of [
  "unsupported thinking budget",
  "network interrupted",
  "invalid move",
  "invalid JSON",
]) {
  test(`${failure} after streamed thoughts cannot trigger another request or random move`, async () => {
    let calls = 0;
    const game = gameFromMoves(["e4"]);
    const before = game.fen();
    const finalText =
      failure === "invalid move" ? '{"move":"Nxg5"}' : "broken JSON";
    const streamFails =
      failure !== "invalid move" && failure !== "invalid JSON";
    await assert.rejects(
      generateBotMove({
        game,
        botElo: 700,
        chessModel: {
          generateContentStream: async () => {
            calls += 1;
            return {
              stream: (async function* () {
                yield chunk({ thought: true, text: "Step 1: Consider c5.\n" });
                if (streamFails) throw new Error(failure);
                yield chunk({ text: finalText });
              })(),
              response: streamFails
                ? Promise.reject(new Error(failure))
                : Promise.resolve(chunk({ text: finalText })),
            };
          },
          generateContent: async () => {
            calls += 1;
          },
        },
      }),
    );
    assert.equal(calls, 1);
    assert.equal(game.fen(), before);
  });
}

test("a forced legal move still comes from one Gemini request", async () => {
  const game = new Chess("7k/8/5K2/6Q1/8/8/8/8 b - - 0 1");
  const legal = game.moves();
  assert.equal(legal.length, 1);
  let calls = 0;
  const result = await generateBotMove({
    game,
    botElo: 700,
    chessModel: {
      generateContent: async () => {
        calls += 1;
        return chunk({ text: JSON.stringify({ move: legal[0] }) });
      },
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.move, legal[0]);
});

test("game over makes no Gemini request", async () => {
  let calls = 0;
  const result = await generateBotMove({
    game: gameFromMoves(["f3", "e5", "g4", "Qh4#"]),
    botElo: 700,
    chessModel: {
      generateContent: async () => {
        calls += 1;
      },
    },
  });
  assert.equal(result, null);
  assert.equal(calls, 0);
});
