import test from "node:test";
import assert from "node:assert/strict";
import { flashcardCompletionEvent, flashcardEvidenceForLedger } from "./flashcardProgress.js";
import { addProgressEvents } from "./progressionEvidence.js";

test("successful flashcard receipts exclude failures and generated practice", () => {
  const success = { completed: false, successfulReviews: 1, lastReviewOutcome: "good" };
  assert.deepEqual(flashcardCompletionEvent("es", "pre-a1-1", success), { metric: "flashcards_completed:es", id: "pre-a1-1" });
  assert.ok(flashcardCompletionEvent("es", "a1-1", { completed: true }));
  for (const progress of [{}, { successfulReviews: 0 }, { successfulReviews: -1 }, { successfulReviews: NaN }, { ...success, isGoal: true }, { ...success, isRepair: true }, { successfulReviews: 1, lastReviewOutcome: "again", consecutiveCorrect: 0 }]) {
    assert.equal(flashcardCompletionEvent("es", "a1-1", progress), null);
  }
  assert.equal(flashcardCompletionEvent("es", "generated-1", success), null);
});

test("the same card on two devices counts once and languages remain separate", () => {
  const success = { successfulReviews: 1, lastReviewOutcome: "good" };
  const a = flashcardCompletionEvent("es", "a1-1", success);
  const b = flashcardCompletionEvent("es", "a1-2", success);
  const c = flashcardCompletionEvent("ja", "a1-1", success);
  const ledger = addProgressEvents(addProgressEvents({}, [a, b]), [a, c]);
  assert.deepEqual(flashcardEvidenceForLedger(ledger), [
    { language: "es", counters: { flashcards_completed: 2 } },
    { language: "ja", counters: { flashcards_completed: 1 } },
  ]);
});
