import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ACHIEVEMENTS, completeCollectionAwards } from "./catalog.js";
import { PROFICIENCY_LEVELS } from "./progression.js";
import { earnedProgressionIds, levelKey, meetsProgressionRequirement } from "./progressionEvidence.js";
import { tutorLevelFromCompletions } from "./proficiencyCompletion.js";
import { unlockStore } from "./unlockStore.js";

const metrics = ["tutor", "skillTree", "flashcards", "goals", "repairs"];
const idFor = (metric, level) => `piyali_${metric}_complete_${levelKey(level)}`;
const evidenceFor = (metric, level, complete = true) => ["goals", "repairs"].includes(metric)
  ? { language: "es", levelCounts: { [metric]: { [levelKey(level)]: complete ? 1 : 0 } } }
  : { language: "es", levels: { [metric]: { [levelKey(level)]: { total: 10, completed: complete ? 10 : 9 } } } };

test("all five proficiency ladders include earlier levels, never later levels or another category", () => {
  for (const metric of metrics) for (const [index, level] of PROFICIENCY_LEVELS.entries()) {
    const ids = earnedProgressionIds("nosabos", evidenceFor(metric, level));
    assert.deepEqual(ids, PROFICIENCY_LEVELS.slice(0, index + 1).map(lower => idFor(metric, lower)));
    assert.deepEqual(earnedProgressionIds("nosabos", evidenceFor(metric, level, false)), []);
    assert.deepEqual(earnedProgressionIds("robotsbuildingeducation", evidenceFor(metric, level)), []);
  }
});

test("placement, unknown levels, partial work and invalid counts grant no cumulative credit", () => {
  assert.deepEqual(earnedProgressionIds("nosabos", { language: "es", placement: "C2", level: "C2" }), []);
  for (const metric of metrics) {
    assert.deepEqual(earnedProgressionIds("nosabos", evidenceFor(metric, "unknown")), []);
    const counter = ["goals", "repairs"].includes(metric);
    for (const completed of counter ? [0, 0.5, NaN, Infinity, -1] : [0, 9, 9.9, NaN, Infinity, -1]) {
      const evidence = counter ? { levelCounts: { [metric]: { c2: completed } } }
        : { language: "es", levels: { [metric]: { c2: { total: 10, completed } } } };
      assert.deepEqual(earnedProgressionIds("nosabos", evidence), []);
    }
  }
});

test("full language completion accepts C2 in every track without beginner backtracking", () => {
  const requirement = ACHIEVEMENTS.piyali_full_curriculum_v4.requirement;
  const levels = Object.fromEntries(requirement.modes.map(mode => [mode, { c2: { total: 10, completed: 10 } }]));
  assert.equal(meetsProgressionRequirement(requirement, { language: "es", levels }), true);
  for (const mode of requirement.modes) {
    assert.equal(meetsProgressionRequirement(requirement, { language: "es", levels: { ...levels, [mode]: { c2: { total: 10, completed: 9 } } } }), false);
    assert.equal(meetsProgressionRequirement(requirement, { language: "es", levels: { ...levels, [mode]: { b2: { total: 10, completed: 10 } } } }), false);
  }
  assert.equal(meetsProgressionRequirement(requirement, { levels }), false);
});

test("Tutor reach uses the highest fully completed level even after placement", () => {
  assert.equal(tutorLevelFromCompletions({}), "Pre-A1");
  for (const [index, level] of PROFICIENCY_LEVELS.entries()) {
    assert.equal(tutorLevelFromCompletions({ [level]: { isComplete: true } }), PROFICIENCY_LEVELS[Math.min(index + 1, 6)]);
    assert.equal(tutorLevelFromCompletions({ [level]: { isComplete: false } }), "Pre-A1");
  }
});

test("existing genuine awards recover lower levels once, excluding test awards and unrelated work", () => {
  for (const metric of metrics) {
    const id = idFor(metric, "A2"), record = { unlockedAt: 123, source: "nosabos", catalogVersion: 7 };
    const recovered = completeCollectionAwards({ [id]: record });
    for (const level of PROFICIENCY_LEVELS.slice(0, 3)) {
      assert.equal(recovered[idFor(metric, level)].unlockedAt, 123);
      assert.ok(!recovered[idFor(metric, level)].test);
    }
    assert.equal(recovered[idFor(metric, "B1")], undefined);
    assert.equal(recovered.piyali_full_curriculum_v4, undefined);
    assert.deepEqual(completeCollectionAwards(recovered), recovered);
    assert.deepEqual(completeCollectionAwards({ [id]: { ...record, test: true } }), { [id]: { ...record, test: true } });
    assert.deepEqual(completeCollectionAwards({ [id]: { ...record, unlockedAt: NaN } }), { [id]: { ...record, unlockedAt: NaN } });
    const upgraded = completeCollectionAwards({ [id]: record, [idFor(metric, "A1")]: { unlockedAt: 50, test: true } });
    assert.equal(upgraded[idFor(metric, "A1")].unlockedAt, 123);
    assert.equal(upgraded[idFor(metric, "A1")].test, undefined);
  }
  const unrelated = { robots_chapter_5_complete: { unlockedAt: 123 }, nosabos_flashcards_completed_50: { unlockedAt: 123 } };
  assert.deepEqual(completeCollectionAwards(unrelated), unrelated);
  // Records do not carry language: never assemble a full course from awards
  // that might have been earned in different languages.
  const mixed = Object.fromEntries(["tutor", "skillTree", "flashcards"].map(metric => [idFor(metric, "C2"), { unlockedAt: 123 }]));
  assert.equal(completeCollectionAwards(mixed).piyali_full_curriculum_v4, undefined);
});

test("production award/save/sync path grants cumulative credit without duplicate feedback or invented counts", async () => {
  const services = await import(existsSync(new URL("../utils/achievements.js", import.meta.url)) ? "../utils/achievements.js" : "../utility/achievements.js");
  const previousWindow = globalThis.window, previousStorage = globalThis.localStorage;
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  try {
    for (const metric of metrics) {
      const npub = `cumulative-${metric}`;
      unlockStore.setIdentity(npub);
      const evidence = evidenceFor(metric, "A2");
      const events = ["goals", "repairs"].includes(metric) ? [{ metric: `${metric}:a2`, id: "es:one-confirmed-plan" }] : [];
      await services.awardProgressionAchievements({ npub, source: "nosabos", evidence, events });
      const before = services.getStoredAchievements(npub);
      for (const level of PROFICIENCY_LEVELS.slice(0, 3)) assert.ok(before[idFor(metric, level)] && !before[idFor(metric, level)].test);
      assert.equal(before.nosabos_flashcards_completed_5, undefined);
      const feedback = unlockStore.getSnapshot().queue.length;
      await services.awardProgressionAchievements({ npub, source: "nosabos", evidence, events });
      assert.equal(unlockStore.getSnapshot().queue.length, feedback);
      assert.deepEqual(services.getStoredAchievements(npub), before);
      assert.deepEqual(services.getStoredAchievements(`${npub}-other`), {});
      const saved = JSON.parse(storage.get(`learning_achievements_v1_${npub}`));
      assert.ok(saved[idFor(metric, "Pre-A1")]);
      // A returning account only needs its existing award records, no history scan.
      const oldAccount = `${npub}-v7`;
      services.storeAchievements(oldAccount, { [idFor(metric, "A2")]: { unlockedAt: 123, catalogVersion: 7 } });
      await services.syncAchievements(oldAccount);
      assert.equal(services.getStoredAchievements(oldAccount)[idFor(metric, "Pre-A1")].unlockedAt, 123);
    }
  } finally {
    unlockStore.setIdentity("");
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
  }
});
