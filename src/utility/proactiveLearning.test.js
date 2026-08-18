import test from "node:test";
import assert from "node:assert/strict";
import {
  buildProactiveLearningPrompt,
  getProactiveLearningContext,
} from "./proactiveLearning.js";

const stepWithSecrets = {
  group: "2",
  title: "Trace an array transformation",
  description: "Follow the values as the code runs.",
  isCodeTracing: true,
  question: {
    questionText: "What does this map call return?",
    code: "[1, 2].map((number) => number * 2)",
    options: ["[1, 2]", "[2, 4]"],
    answer: "[2, 4]",
    acceptedAnswers: ["[2,4]"],
    tests: ["Returns the transformed array"],
    choices: ["first", "second"],
    pairs: [{ left: "map", right: "transform" }],
  },
};

test("proactive context includes the visible task but strips answer-bearing data", () => {
  const context = getProactiveLearningContext(stepWithSecrets);
  const serialized = JSON.stringify(context);

  assert.equal(context.questionType, "codeTracing");
  assert.equal(context.question.code, stepWithSecrets.question.code);
  assert.doesNotMatch(serialized, /\[2, 4\]/);
  assert.doesNotMatch(
    serialized,
    /acceptedAnswers|tests|options|choices|pairs/,
  );
  assert.doesNotMatch(serialized, /description/);
});

test("proactive prompt gives brief conversational guidance without authorizing a solution", () => {
  const prompt = buildProactiveLearningPrompt({
    step: stepWithSecrets,
    userLanguage: "en",
    programmingLanguage: "JavaScript",
  });

  assert.match(prompt, /warm coding tutor/);
  assert.match(prompt, /current question is the primary source of truth/i);
  assert.match(prompt, /Do not answer, solve, grade, or complete/);
  assert.match(prompt, /compact visual aid/);
  assert.match(prompt, /2–5 line/);
  assert.match(prompt, /input → operation → result/);
  assert.match(prompt, /different names, values, and circumstances/);
  assert.match(prompt, /2 to 4 sentences/);
  assert.match(prompt, /never more than 110 words/);
  assert.match(prompt, /do not force an example/);
  assert.match(prompt, /instead of following a fixed template/);
  assert.match(prompt, /Proactive Learning: <current concept>/);
  assert.doesNotMatch(prompt, /\[2, 4\]/);
});
