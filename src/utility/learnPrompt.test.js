import test from "node:test";
import assert from "node:assert/strict";
import { buildLearnPrompt, getProgrammingLanguage } from "./learnPrompt.js";

test("resolves correct programming language name", () => {
  assert.equal(getProgrammingLanguage("en"), "JavaScript");
  assert.equal(getProgrammingLanguage("es"), "JavaScript");
  assert.equal(getProgrammingLanguage("py-en"), "Python");
  assert.equal(getProgrammingLanguage("swift-en"), "Swift");
});

test("buildLearnPrompt for early chapters (Chapter 0-2) does not force preview widgets", () => {
  const stepCh1 = {
    group: "1",
    title: "Variables and Data Types",
    description: "Learn about string and number types",
    question: { questionText: "Declare a constant named score." },
  };

  const prompt = buildLearnPrompt(stepCh1, "en");
  assert.match(prompt, /Generate educational JavaScript material/);
  assert.doesNotMatch(prompt, /```preview/);
  assert.doesNotMatch(prompt, /CRITICAL INTERACTIVE WIDGET RULES/i);
});

test("buildLearnPrompt for Chapter 3+ includes single-widget and loop-safety rules", () => {
  const stepCh3 = {
    group: "3",
    title: "Controlled Search Input",
    description: "Build an interactive search filter in React",
    showPreview: true,
    question: { questionText: "Complete the search component" },
  };

  const promptEn = buildLearnPrompt(stepCh3, "en");
  assert.match(promptEn, /```preview/);
  assert.match(promptEn, /at most ONE single interactive preview widget/i);
  assert.match(promptEn, /React functional component/i);
  assert.match(promptEn, /PERFORMANCE & LOOP SAFETY/i);
  assert.match(promptEn, /throttle intervals to at least 400ms/i);
  assert.match(promptEn, /RESPONSIVE MOBILE DESIGN/i);
  assert.match(promptEn, /English/);

  const promptEs = buildLearnPrompt(stepCh3, "es");
  assert.match(promptEs, /```preview/);
  assert.match(promptEs, /Spanish/);
});

test("buildLearnPrompt for conversation review includes preview instructions when group >= 3", () => {
  const reviewStep = {
    group: "3",
    title: "Build Your App",
    isConversationReview: true,
  };

  const prompt = buildLearnPrompt(reviewStep, "en", [{ title: "Step 1" }]);
  assert.match(prompt, /```preview/);
  assert.match(prompt, /CRITICAL INTERACTIVE WIDGET RULES/i);
});
