import assert from "node:assert/strict";
import test from "node:test";

import {
  getContinuingQuestionNumber,
  getContinuingQuestionRoute,
  getProgressRoute,
} from "./progressRoute.js";

test("routes completed learners to the award screen", () => {
  assert.equal(getProgressRoute("award"), "/award");
});

test("routes learners waiting at the paywall to the subscription screen", () => {
  assert.equal(getProgressRoute("subscription"), "/subscription");
});

test("routes numeric progress to its question", () => {
  assert.equal(getProgressRoute(65), "/q/65");
  assert.equal(getProgressRoute("123"), "/q/123");
});

test("uses a safe fallback for malformed persisted progress", () => {
  assert.equal(getProgressRoute(undefined), "/q/0");
  assert.equal(getProgressRoute("not-a-step", "/"), "/");
});

test("maps persisted continuing-learning progress onto post-course routes", () => {
  assert.equal(getContinuingQuestionNumber(121, 1), 121);
  assert.equal(getContinuingQuestionNumber(121, 11), 131);
  assert.equal(getContinuingQuestionRoute(121, 11), "/q/131");
});

test("does not invent a post-course route before a question exists", () => {
  assert.equal(getContinuingQuestionNumber(121, 0), null);
  assert.equal(getContinuingQuestionRoute(121, 0), "/award");
});
