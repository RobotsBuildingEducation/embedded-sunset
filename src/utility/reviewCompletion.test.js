import test from "node:test";
import assert from "node:assert/strict";
import { hasWatchedReviewVideo, reviewCompletionEvents } from "./reviewCompletion.js";
import { codingCourseEvidence } from "../achievements/codingProgress.js";
import { recordProgressEvents, readProgressLedger } from "../achievements/progressionRuntime.js";
import { awardProgressionAchievements, getStoredAchievements, storeAchievements } from "./achievements.js";
import { unlockStore } from "../achievements/unlockStore.js";

const videoAt = (currentTime, ranges, duration = 100) => ({
  currentTime, duration, ended: currentTime === duration,
  played: { length: ranges.length, start: index => ranges[index][0], end: index => ranges[index][1] },
});

test("the 90% timeline checkpoint qualifies before the ended event", () => {
  assert.equal(hasWatchedReviewVideo(videoAt(89.99, [[0, 89.99]])), false);
  assert.equal(hasWatchedReviewVideo(videoAt(90, [[0, 90]])), true);
  assert.equal(hasWatchedReviewVideo(videoAt(95, [[0, 95]])), true);
  assert.equal(hasWatchedReviewVideo(videoAt(100, [[0, 100]])), true);
});

test("seeking to the checkpoint counts even without played ranges", () => {
  assert.equal(hasWatchedReviewVideo(videoAt(90, [])), true);
  assert.equal(hasWatchedReviewVideo(videoAt(100, [[0, 10], [95, 100]])), true);
  assert.equal(hasWatchedReviewVideo(videoAt(190, [], 196)), true);
  assert.equal(hasWatchedReviewVideo({ currentTime: 90, duration: 100 }), true);
  assert.equal(hasWatchedReviewVideo(videoAt(89.99, [])), false);
});

test("invalid media timing cannot complete a review", () => {
  assert.equal(hasWatchedReviewVideo(videoAt(0, [], NaN)), false);
  assert.equal(hasWatchedReviewVideo(videoAt(0, [], 0)), false);
  assert.equal(hasWatchedReviewVideo(videoAt(NaN, [])), false);
  assert.equal(hasWatchedReviewVideo(videoAt(Infinity, [])), false);
  assert.equal(hasWatchedReviewVideo(null), false);
});

test("seeking to 90% unlocks Encore and completing its checklist unlocks Reviewed and Ready", async () => {
  const originalWindow = globalThis.window, originalStorage = globalThis.localStorage;
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const npub = "review-flow", course = "en", group = "1", source = "robotsbuildingeducation";
  const courseSteps = [{}, { group: 1 }, { group: 1 }];
  unlockStore.setIdentity(npub);
  const award = async progress => {
    recordProgressEvents(npub, source, reviewCompletionEvents(course, group, progress));
    return awardProgressionAchievements({ npub, source,
      evidence: codingCourseEvidence(course, courseSteps, readProgressLedger(npub, source), [group]),
    });
  };
  try {
    await award({ summaryViewed: true, practiceCompleted: true, videoWatched: false });
    assert.deepEqual(getStoredAchievements(npub), {});
    await award({ videoWatched: hasWatchedReviewVideo(videoAt(90, [])) });
    assert.ok(getStoredAchievements(npub).robotsbuildingeducation_review_videos_1);
    assert.equal(getStoredAchievements(npub).robotsbuildingeducation_review_checklists_1, undefined);
    const finished = { videoWatched: true, summaryViewed: true, practiceCompleted: true };
    await award(finished);
    assert.ok(getStoredAchievements(npub).robotsbuildingeducation_review_checklists_1);
    // Skipping course steps must not grant chapter completion.
    assert.equal(getStoredAchievements(npub).robotsbuildingeducation_chapters_1, undefined);
    const queueLength = unlockStore.getSnapshot().queue.length;
    assert.deepEqual(await award(finished), []);
    assert.equal(unlockStore.getSnapshot().queue.length, queueLength);
    // Reopening a saved checklist repairs an account missing only Encore.
    const legacyAccount = "saved-review-without-encore";
    storeAchievements(legacyAccount, {
      robotsbuildingeducation_review_checklists_1: { unlockedAt: 1700000000, source },
    });
    unlockStore.setIdentity(legacyAccount);
    recordProgressEvents(legacyAccount, source, reviewCompletionEvents(course, group, finished));
    await awardProgressionAchievements({ npub: legacyAccount, source,
      evidence: codingCourseEvidence(course, courseSteps, readProgressLedger(legacyAccount, source), [group]),
    });
    assert.ok(getStoredAchievements(legacyAccount).robotsbuildingeducation_review_videos_1);
    assert.equal(getStoredAchievements(legacyAccount).robotsbuildingeducation_review_checklists_1.unlockedAt, 1700000000);
    assert.equal(unlockStore.getSnapshot().queue.filter(item => item.achievement.id === "robotsbuildingeducation_review_videos_1").length, 1);
    assert.equal(reviewCompletionEvents(course, "introduction", { videoWatched: true })[0].id, "en:tutorial");
  } finally {
    unlockStore.setIdentity("");
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});
