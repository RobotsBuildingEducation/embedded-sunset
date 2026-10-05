import test from "node:test";
import assert from "node:assert/strict";
import { createPhonicsCompletionObserver } from "./phonicsProgress.js";
import { earnedProgressionIds } from "./progressionEvidence.js";

test("phonics completion waits for the final acknowledged save and keeps observing", () => {
  const proofs = [];
  const observer = createPhonicsCompletionObserver({ language: "es", baseCards: [{ id: "a" }, { id: "b" }],
    onProgress: proof => proofs.push(proof),
  });
  const snapshot = (completed, metadata = {}) => ({ metadata,
    docs: ["a", "b"].map((letterId, index) => ({ data: () => ({ letterId, correctCount: index === 0 || completed ? 1 : 0 }) })),
  });
  observer.receive(snapshot(false));
  assert.deepEqual(earnedProgressionIds("nosabos", proofs.at(-1).evidence), []);
  observer.receive(snapshot(true, { hasPendingWrites: true }));
  observer.receive(snapshot(true, { fromCache: true }));
  assert.equal(proofs.length, 1);
  // A late save or another device's write arrives without another button press.
  observer.receive(snapshot(true));
  assert.ok(earnedProgressionIds("nosabos", proofs.at(-1).evidence).includes("nosabos_phonics_cards_all"));
  observer.dispose();
  observer.receive(snapshot(true));
  assert.equal(proofs.length, 2);
});
