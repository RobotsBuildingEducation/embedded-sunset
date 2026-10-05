import test from "node:test";
import assert from "node:assert/strict";
import {
  registerUpdateBlocker,
  unregisterUpdateBlocker,
  isUpdateSafe,
  getActiveBlockers,
  subscribeSafety,
  requestSafetySettlement,
  resetBlockersForTest,
} from "./updateSafety.js";

test("updateSafety blocker lifecycle", () => {
  resetBlockersForTest();
  assert.equal(isUpdateSafe(), true, "Initially safe when no blockers registered");
  assert.equal(getActiveBlockers().length, 0);

  // Register a blocker
  const unregisterLesson = registerUpdateBlocker("lesson-1", {
    description: "Active Spanish lesson",
  });
  assert.equal(isUpdateSafe(), false, "Unsafe while blocker active");
  assert.equal(getActiveBlockers().length, 1);
  assert.equal(getActiveBlockers()[0].id, "lesson-1");
  assert.equal(getActiveBlockers()[0].description, "Active Spanish lesson");

  // Register second blocker
  registerUpdateBlocker("recording-audio", {
    description: "Recording user pronunciation",
  });
  assert.equal(isUpdateSafe(), false);
  assert.equal(getActiveBlockers().length, 2);

  // Unregister first via cleanup
  unregisterLesson();
  assert.equal(isUpdateSafe(), false, "Still unsafe while second blocker active");
  assert.equal(getActiveBlockers().length, 1);
  assert.equal(getActiveBlockers()[0].id, "recording-audio");

  // Unregister second explicitly
  unregisterUpdateBlocker("recording-audio");
  assert.equal(isUpdateSafe(), true, "Safe once all blockers are cleared");
  assert.equal(getActiveBlockers().length, 0);
});

test("updateSafety subscription notifies listeners", () => {
  resetBlockersForTest();
  const events = [];
  const unsubscribe = subscribeSafety((state) => {
    events.push(state.safe);
  });

  // Initial event emitted immediately: [true]
  assert.equal(events.length, 1);
  assert.equal(events[0], true);

  const cleanup = registerUpdateBlocker("task-a");
  // Emitted [true, false]
  assert.equal(events.length, 2);
  assert.equal(events[1], false);

  cleanup();
  // Emitted [true, false, true]
  assert.equal(events.length, 3);
  assert.equal(events[2], true);

  unsubscribe();
  registerUpdateBlocker("task-b");
  // No new events after unsubscribe
  assert.equal(events.length, 3);
  resetBlockersForTest();
});

test("requestSafetySettlement flushes persistable blockers", async () => {
  resetBlockersForTest();
  let saved = false;

  const cleanup = registerUpdateBlocker("draft-notes", {
    description: "Unsaved lesson notes",
    persist: async () => {
      saved = true;
      cleanup(); // Clears blocker on successful save
    },
  });

  assert.equal(isUpdateSafe(), false);
  const settled = await requestSafetySettlement(1000);
  assert.equal(settled, true);
  assert.equal(saved, true);
  assert.equal(isUpdateSafe(), true);
});

test("requestSafetySettlement fails if non-persistable blocker remains", async () => {
  resetBlockersForTest();
  registerUpdateBlocker("live-voice-call", {
    description: "In progress voice conversation",
  });

  assert.equal(isUpdateSafe(), false);
  const settled = await requestSafetySettlement(500);
  assert.equal(settled, false, "Cannot auto-settle live call blocker");
  assert.equal(isUpdateSafe(), false);
  resetBlockersForTest();
});
