import assert from "node:assert/strict";
import test from "node:test";
import { createQuestionTransitionCadence } from "./questionTransitionCadence.js";

test("question 1 always transitions and starts a fresh 3–7 question interval", () => {
  for (const [randomValue, interval] of [[0, 3], [0.999999, 7]]) {
    const cadence = createQuestionTransitionCadence(() => randomValue);

    // The exception also applies when revisiting question 1 partway
    // through an existing interval.
    assert.equal(cadence.completeQuestion(12), false);
    assert.equal(cadence.isNextTransitionDue(1), true);
    assert.equal(cadence.completeQuestion(1), true);

    for (let completed = 1; completed <= interval; completed += 1) {
      const questionIndex = completed + 1;
      const expectedTransition = completed === interval;
      assert.equal(cadence.isNextTransitionDue(questionIndex), expectedTransition);
      assert.equal(cadence.completeQuestion(questionIndex), expectedTransition);
    }
  }
});

test("resuming at another question does not force an early transition", () => {
  const cadence = createQuestionTransitionCadence(() => 0.999999);
  assert.equal(cadence.isNextTransitionDue(8), false);
  assert.equal(cadence.completeQuestion(8), false);
});

test("transitions occur after each possible interval from 3 through 7", () => {
  for (const [randomValue, interval] of [
    [0, 3],
    [0.2, 4],
    [0.4, 5],
    [0.6, 6],
    [0.999999, 7],
  ]) {
    const cadence = createQuestionTransitionCadence(() => randomValue);

    for (let question = 1; question <= interval; question += 1) {
      const expectedTransition = question === interval;
      assert.equal(cadence.isNextTransitionDue(), expectedTransition);
      assert.equal(cadence.completeQuestion(), expectedTransition);
    }
    assert.equal(cadence.isNextTransitionDue(), false);
  }
});

test("each transition starts a newly randomized interval", () => {
  const intervals = [0, 0.999999, 0.4];
  let draws = 0;
  const cadence = createQuestionTransitionCadence(() => intervals[draws++]);
  const transitionQuestions = [];

  for (let question = 1; question <= 14; question += 1) {
    if (cadence.completeQuestion()) transitionQuestions.push(question);
  }

  assert.deepEqual(transitionQuestions, [3, 10]);
  assert.equal(cadence.isNextTransitionDue(), true);
  assert.equal(draws, 3);
});

test("checking whether to paint the overlay does not consume questions or randomness", () => {
  let draws = 0;
  const cadence = createQuestionTransitionCadence(() => {
    draws += 1;
    return 0;
  });

  for (let question = 1; question <= 3; question += 1) {
    for (let check = 0; check < 10; check += 1) {
      assert.equal(cadence.isNextTransitionDue(), question === 3);
      assert.equal(draws, 1);
    }
    assert.equal(cadence.completeQuestion(), question === 3);
  }
  assert.equal(draws, 2);
});
