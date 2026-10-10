import assert from "node:assert/strict";
import test from "node:test";
import {
  buildObjectiveGradingPrompt,
  parseObjectiveGrade,
} from "./objectiveGrading.js";

test("tracing grades the selected answer against the expected output with code context", () => {
  const prompt = buildObjectiveGradingPrompt(
    {
      isCodeTracing: true,
      question: {
        questionText: "What prints?",
        code: "console.log(8);",
        answer: "8",
      },
    },
    "6",
    "en",
  );
  assert.match(prompt, /codeTracing exercise/);
  assert.match(prompt, /Expected answer[^\n]+"8"/);
  assert.match(prompt, /Submitted answer: "6"/);
  assert.match(prompt, /console.log\(8\)/);
  assert.match(prompt, /Do not reveal the complete solution/);
});

test("multiple choice preserves strict comparison and the selected language", () => {
  const prompt = buildObjectiveGradingPrompt(
    {
      isMultipleChoice: true,
      question: { questionText: "¿Qué condición?", answer: "age >= 18" },
    },
    "age > 18",
    "es",
  );
  assert.match(prompt, /strictly comparing/);
  assert.match(prompt, /"age >= 18"/);
  assert.match(prompt, /"age > 18"/);
  assert.match(prompt, /speaking spanish/);
});

test("accepts valid grades and never treats a string boolean as correctness", () => {
  assert.deepEqual(
    parseObjectiveGrade(
      '{"isCorrect":false,"feedback":"Try tracing each pass.","grade":25}',
    ),
    {
      isCorrect: false,
      feedback: "Try tracing each pass.",
      grade: "25",
    },
  );
  assert.equal(
    parseObjectiveGrade(
      '{"isCorrect":true,"feedback":"Correct.","grade":"100"}',
    ).isCorrect,
    true,
  );
  for (const data of [
    { isCorrect: "false", feedback: "Try again", grade: "0" },
    { isCorrect: false, feedback: "Try again" },
    { isCorrect: true, feedback: "Correct", grade: 101 },
    { isCorrect: true, grade: 100 },
  ])
    assert.throws(() => parseObjectiveGrade(JSON.stringify(data)));
  assert.throws(() => parseObjectiveGrade("Not JSON"));
});
