import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ACHIEVEMENT_BACKFILL_VERSION, createAchievementBackfill, createFirestoreAchievementBackfill, applyAchievementBackfill, finishAchievementBackfill } from "./backfill.js";
import { codingBackfillProofs } from "./backfillCoding.js";
import { earnedProgressionIds } from "./progressionEvidence.js";
import { progressionSnapshot } from "./progressionRuntime.js";
import { unlockStore } from "./unlockStore.js";
const account = "npub1" + "q".repeat(58);
const otherAccount = "npub1" + "p".repeat(58);

test("catch-up scans once, shares concurrent preparation and skips a completed account on another device", async () => {
  const markers = new Map(); let reads = 0, scans = 0, writes = 0;
  const dependencies = { source: "nosabos", readMarker: async npub => { reads++; return markers.get(npub); },
    writeMarker: async (npub, value) => { writes++; markers.set(npub, value); }, scan: async () => { scans++; return { proofs: [] }; } };
  const first = createAchievementBackfill(dependencies);
  assert.deepEqual(await Promise.all([first.prepareBackfill(account), first.prepareBackfill(account)]), [
    { source: "nosabos", proofs: [] }, { source: "nosabos", proofs: [] },
  ]);
  assert.equal(reads, 1); assert.equal(scans, 1); assert.equal(writes, 0);
  await first.completeBackfill(account);
  assert.equal(await first.prepareBackfill(account), null);
  const anotherDevice = createAchievementBackfill(dependencies);
  assert.equal(await anotherDevice.prepareBackfill(account), null);
  assert.equal(scans, 1); assert.equal(writes, 1);
  assert.deepEqual(markers.get(account), { source: "nosabos", version: ACHIEVEMENT_BACKFILL_VERSION,
    complete: true, completedAt: markers.get(account).completedAt });
  await anotherDevice.prepareBackfill(otherAccount);
  assert.equal(scans, 2);
  assert.equal(await anotherDevice.prepareBackfill("guest"), null);
});

test("failed reads, scans, and marker writes stay retryable and never mark an incomplete pass", async () => {
  let reads = 0, scans = 0, writes = 0;
  const migration = createAchievementBackfill({ source: "robotsbuildingeducation",
    readMarker: async () => { if (++reads === 1) throw new Error("offline read"); return null; },
    scan: async () => { if (++scans === 1) throw new Error("incomplete scan"); return { proofs: [] }; },
    writeMarker: async () => { if (++writes === 1) throw new Error("offline save"); },
  });
  await assert.rejects(migration.prepareBackfill(account), /offline read/);
  await migration.completeBackfill(account); assert.equal(writes, 0);
  await assert.rejects(migration.prepareBackfill(account), /incomplete scan/);
  await migration.completeBackfill(account); assert.equal(writes, 0);
  await migration.prepareBackfill(account);
  await assert.rejects(migration.completeBackfill(account), /offline save/);
  await migration.prepareBackfill(account); assert.equal(scans, 2);
  await migration.completeBackfill(account);
  assert.equal(await migration.prepareBackfill(account), null);
  assert.equal(writes, 2);
});

test("Firestore completion flags are scoped to account, app and migration version", async () => {
  const records = new Map(), calls = [];
  const dependencies = { database: {}, doc: (_db, ...parts) => parts.join("/"),
    getDoc: async ref => { calls.push(ref); return { data: () => records.get(ref) }; },
    runTransaction: async (_db, run) => run({ get: async ref => ({ data: () => records.get(ref) }),
      set: (ref, value) => records.set(ref, value) }), scan: async () => ({ proofs: [] }) };
  const piyali = createFirestoreAchievementBackfill({ ...dependencies, source: "nosabos" });
  const robots = createFirestoreAchievementBackfill({ ...dependencies, source: "robotsbuildingeducation" });
  await piyali.prepareBackfill(account); await piyali.completeBackfill(account);
  assert.ok(await robots.prepareBackfill(account));
  assert.ok(await piyali.prepareBackfill(otherAccount));
  assert.deepEqual(calls, [`users/${account}/achievementMigrations/nosabos_v1`,
    `users/${account}/achievementMigrations/robotsbuildingeducation_v1`, `users/${otherAccount}/achievementMigrations/nosabos_v1`]);
});

test("a failed award/progress save cannot finalize catch-up, including after reopening", async () => {
  let marker, scans = 0;
  const dependencies = { source: "nosabos", readMarker: async () => marker,
    writeMarker: async (_npub, value) => { marker = value; }, scan: async () => { scans++; return { proofs: [] }; } };
  const interrupted = createAchievementBackfill(dependencies);
  await interrupted.prepareBackfill(account);
  await assert.rejects(finishAchievementBackfill(account, interrupted, async () => { throw new Error("award save failed"); }), /award save failed/);
  assert.equal(marker, undefined);
  const reopened = createAchievementBackfill(dependencies);
  assert.ok(await reopened.prepareBackfill(account));
  let resolveSave;
  const save = new Promise(resolve => { resolveSave = resolve; });
  const finishing = finishAchievementBackfill(account, reopened, () => save);
  assert.equal(marker, undefined);
  resolveSave(); await finishing;
  assert.equal(marker.complete, true);
  assert.equal(scans, 2);
  assert.equal(await createAchievementBackfill(dependencies).prepareBackfill(account), null);
});

test("legacy Robots history matches unique course content and complete course-specific reviews", () => {
  const courseMap = {
    en: [{}, { title: "One", group: "tutorial", question: { questionText: "One question" } }, { title: "Two", group: "tutorial", question: { questionText: "Two question" } }],
    es: [{}, { title: "Uno", group: "tutorial", question: { questionText: "Una pregunta" } }, { title: "Dos", group: "tutorial", question: { questionText: "Dos pregunta" } }],
  };
  const result = codingBackfillProofs({ courseMap, videoGroups: ["tutorial"],
    profile: { step: "award", answeredStepIds: [1, 2], answeredSteps: { 1: { completedAt: "old", title: "Two" } },
      moduleProgressByCourse: { en: { tutorial: { videoWatched: true, summaryViewed: true, practiceCompleted: true } },
        es: { tutorial: { videoWatched: true, summaryViewed: true, practiceCompleted: false } } } },
    answers: [{ question: "One question", step: 99 }, { question: "One question", step: 99 },
      { question: "Una pregunta", isCorrect: false }, { question: "Dos pregunta", isCorrect: true }],
  });
  const events = result.proofs[0].events;
  const snapshot = progressionSnapshot("legacy-robots-proof", "robotsbuildingeducation", {}, events);
  assert.equal(snapshot.counters.course_steps, 3);
  assert.equal(snapshot.counters.solved_questions, 1);
  const en = result.proofs.find(proof => proof.evidence?.course === "en").evidence;
  const es = result.proofs.find(proof => proof.evidence?.course === "es").evidence;
  assert.ok(earnedProgressionIds("robotsbuildingeducation", en).includes("robots_full_curriculum_v4"));
  assert.ok(!earnedProgressionIds("robotsbuildingeducation", es).includes("robots_full_curriculum_v4"));
  assert.deepEqual(es.chapters.reviewed, []);
});

test("ambiguous Robots records, positions and unscoped reviews cannot become completion proof", () => {
  const sharedStep = { title: "Common", group: "tutorial", question: { questionText: "Shared question" } };
  const result = codingBackfillProofs({ courseMap: { en: [{}, sharedStep], es: [{}, sharedStep] },
    profile: { language: "en", step: "award", previousStep: 999, answeredStepIds: [1],
      answeredSteps: { 1: { title: "Common", completedAt: "old" } }, moduleProgress: { tutorial: { videoWatched: true } } },
    answers: [{ question: "Shared question", isCorrect: true }], videoGroups: ["tutorial"] });
  assert.deepEqual(result.proofs, [{ events: [] }]);
});

test("saved titles disambiguate repeated question text without trusting a legacy step index", () => {
  const courseMap = {
    en: [{}, { title: "JS basics", group: "tutorial", question: { questionText: "Same prompt" } }],
    es: [{}, { title: "Other basics", group: "tutorial", question: { questionText: "Same prompt" } }],
  };
  const result = codingBackfillProofs({ courseMap, profile: {}, answers: [
    { title: "JS basics", question: "Same prompt", step: 999, isCorrect: true },
    { title: 42, question: "Same prompt" },
  ] });
  assert.deepEqual(result.proofs[0].events, [{ metric: "course_steps", id: "en:1" }, { metric: "solved_questions", id: "en:course:1" }]);
});

test("catch-up awards are silent, idempotent, durable and leave normal celebrations enabled in both hosts", async () => {
  const originalWindow = globalThis.window, originalStorage = globalThis.localStorage;
  const data = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  try {
    for (const path of ["../utils/achievements.js", "../utility/achievements.js"]) {
      if (!existsSync(new URL(path, import.meta.url))) continue;
      const services = await import(path);
      const npub = `${account}-${path}`;
      unlockStore.setIdentity(npub);
      const backfill = { source: "nosabos", proofs: [{ evidence: { counters: { flashcards_completed: 20 } } }], achievementIds: ["tutor_reach_a2"] };
      await applyAchievementBackfill(npub, backfill, services);
      assert.ok(services.getStoredAchievements(npub).nosabos_flashcards_completed_20);
      assert.ok(services.getStoredAchievements(npub).tutor_reach_a2);
      assert.equal(unlockStore.getSnapshot().queue.length, 0);
      await applyAchievementBackfill(npub, backfill, services);
      assert.equal(unlockStore.getSnapshot().queue.length, 0);
      await services.awardProgressionAchievements({ npub, source: "nosabos", evidence: { counters: { flashcards_completed: 25 } } });
      assert.equal(unlockStore.getSnapshot().queue.length, 1);
    }
  } finally {
    unlockStore.setIdentity("");
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});
