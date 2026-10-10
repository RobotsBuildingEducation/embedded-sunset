import assert from "node:assert/strict";
import test from "node:test";
import { getTotalQuestionsAnswered } from "./questionCount.js";

test("adds recorded answers to the historical baseline", () => {
  assert.equal(getTotalQuestionsAnswered(1880), 6080);
  assert.equal(getTotalQuestionsAnswered(1234), 5434);
  assert.equal(getTotalQuestionsAnswered(0), 4200);
});

test("does not turn missing or invalid live counts into the baseline", () => {
  for (const count of [
    undefined, null, "123", -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER,
  ]) {
    assert.equal(getTotalQuestionsAnswered(count), null);
  }
});
