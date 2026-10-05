import test from "node:test";
import assert from "node:assert/strict";
import { createLocalJournal } from "./localJournal.js";
import { createRetrySync } from "./retrySync.js";
import { confirmRelayPublish, withSyncDeadline, createSingleFlight } from "./syncDeadline.js";
import { existsSync } from "node:fs";
import { unlockStore } from "./unlockStore.js";
import { mergeProgressLedgers } from "./progressionRuntime.js";
import { ledgerCounters, earnedProgressionIds } from "./progressionEvidence.js";
import { codingCourseEvidence, codingEvidenceForLedger } from "./codingProgress.js";
import { createAchievementPersistence, completionDocumentId } from "./firestoreRecords.js";

const account = "npub1" + "q".repeat(58);
const source = "robotsbuildingeducation";
const completions = (...ids) => ({ solved_questions: Object.fromEntries(ids.map(id => [id, 1])) });
const tick = () => new Promise(resolve => setImmediate(resolve));
function localStorageMock(data = new Map()) {
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
function clock() {
  const timers = new Map(); let id = 0;
  return { setTimer: (run, delay) => { timers.set(++id, { run, delay }); return id; }, clearTimer: id => timers.delete(id),
    async next() { const [id, timer] = timers.entries().next().value; timers.delete(id); timer.run(); await tick(); return timer.delay; },
    size: () => timers.size };
}

test("completion unions combine device histories without double counting repeated IDs", () => {
  const phone = completions("en:course:1", "en:course:2", "en:course:3", "en:course:4", "en:course:5");
  const laptop = completions("en:course:5", "en:course:6", "en:course:7", "en:course:8", "en:course:9", "en:course:10");
  const merged = mergeProgressLedgers(phone, laptop, phone, { solved_questions: { bad: NaN }, session_timers: { retired: 1 } });
  assert.equal(ledgerCounters(merged).solved_questions, 10);
  assert.deepEqual(new Set(Object.keys(merged.solved_questions)), new Set(Object.keys(mergeProgressLedgers(laptop, phone).solved_questions)));
  assert.ok(earnedProgressionIds(source, { counters: ledgerCounters(merged) }).includes("robotsbuildingeducation_solved_questions_10"));
  assert.equal(merged.session_timers, undefined);
});

test("two independent devices persist unique completions and restore merged chapter/review evidence", async () => {
  const records = new Map(); let writes = 0;
  const dependencies = { database: {}, collection: (_db, ...parts) => parts.join("/"), doc: (_db, ...parts) => parts.join("/"),
    getDocs: async path => ({ docs: [...records].filter(([key]) => key.startsWith(`${path}/`)).map(([key, value]) => ({ id: key.split("/").at(-1), data: () => value })) }),
    runTransaction: async (_db, run) => run({ get: async ref => ({ exists: () => records.has(ref), data: () => records.get(ref) }),
      set: (ref, value) => { writes++; records.set(ref, value); } }) };
  const phone = createAchievementPersistence(dependencies), laptop = createAchievementPersistence(dependencies);
  await phone.saveProgress(account, source, { course_steps: { "en:1": 1 }, review_videos: { "en:tutorial": 1 } });
  await laptop.saveProgress(account, source, { course_steps: { "en:2": 1, "en:1": 1 }, review_checklists: { "en:tutorial": 1 } });
  assert.equal(writes, 4);
  const restored = await phone.loadProgress(account, source);
  const proof = codingCourseEvidence("en", [{}, { group: "tutorial" }, { group: "tutorial" }], restored, ["tutorial"]);
  assert.deepEqual(proof.chapters.completed, ["tutorial"]);
  assert.deepEqual(proof.chapters.reviewed, ["tutorial"]);
  assert.equal(Object.keys(await phone.loadProgress("npub1" + "p".repeat(58), source)).length, 0);
  assert.equal(Object.keys(await phone.loadProgress(account, "nosabos")).length, 0);
  await phone.saveProgress(account, source, restored);
  assert.equal(writes, 4);
  assert.notEqual(await completionDocumentId("a:b", "c"), await completionDocumentId("a", "b:c"));
  assert.match(await completionDocumentId("course_steps", "en:a/" + "long".repeat(1000)), /^[a-f0-9]{64}$/);
});

test("failed completion transactions are retried rather than cached as saved", async () => {
  let attempts = 0;
  const adapter = createAchievementPersistence({ database: {}, doc: () => "ref", runTransaction: async (_db, run) => {
    if (++attempts === 1) throw new Error("offline");
    return run({ get: async () => ({ exists: () => false }), set: () => {} });
  } });
  await assert.rejects(adapter.saveProgress(account, source, completions("en:course:1")));
  await adapter.saveProgress(account, source, completions("en:course:1"));
  assert.equal(attempts, 2);
});

test("restoration evaluates all saved courses without mixing their full-course requirements", () => {
  const steps = [{}, { group: "tutorial" }, { group: "1" }];
  const ledger = { course_steps: { "en:1": 1, "es:2": 1 },
    review_videos: { "en:tutorial": 1, "en:1": 1 }, review_checklists: { "en:tutorial": 1, "en:1": 1 } };
  const evidence = codingEvidenceForLedger({ en: steps, es: steps }, ledger, ["tutorial", "1"]);
  assert.equal(evidence.length, 2);
  assert.ok(evidence.every(proof => !earnedProgressionIds(source, proof).includes("robots_full_curriculum_v4")));
  const complete = codingEvidenceForLedger({ en: steps, es: steps }, mergeProgressLedgers(ledger, { course_steps: { "en:2": 1 } }), ["tutorial", "1"]);
  assert.ok(earnedProgressionIds(source, complete.find(proof => proof.course === "en")).includes("robots_full_curriculum_v4"));
  assert.ok(!earnedProgressionIds(source, complete.find(proof => proof.course === "es")).includes("robots_full_curriculum_v4"));
});

test("retry intent survives reopening and is cleared only after acknowledgement", async () => {
  const storage = localStorageMock();
  const firstClock = clock(), statuses = [];
  const first = createRetrySync(async () => { throw new Error("offline"); }, { journal: createLocalJournal({ storage: () => storage }), channel: "cloud", ...firstClock,
    onStatus: (_account, pending) => statuses.push(pending) });
  first.schedule(account);
  assert.equal(await firstClock.next(), 0);
  assert.equal(firstClock.size(), 1);
  assert.equal(JSON.parse(storage.getItem(`learning_achievement_sync_v1:cloud:${account}`)).pending, true);
  first.pause(account); assert.equal(firstClock.size(), 0);
  let uploaded = 0;
  const reopenedClock = clock();
  const reopened = createRetrySync(async () => { uploaded++; }, { journal: createLocalJournal({ storage: () => storage }), channel: "cloud", ...reopenedClock,
    onStatus: (_account, pending) => statuses.push(pending) });
  reopened.resume(account); await reopenedClock.next();
  assert.equal(uploaded, 1);
  assert.equal(JSON.parse(storage.getItem(`learning_achievement_sync_v1:cloud:${account}`)).pending, false);
  assert.equal(statuses.at(-1), false);
});

test("retries back off, pause by identity and retain work arriving during an upload", async () => {
  const timers = clock(), storage = localStorageMock();
  let fail = true, release;
  const queue = createRetrySync(async () => { if (fail) throw new Error("offline"); await new Promise(resolve => { release = resolve; }); },
    { journal: createLocalJournal({ storage: () => storage }), channel: "relay", baseDelay: 10, maxDelay: 25, ...timers });
  queue.schedule(account);
  assert.equal(await timers.next(), 0);
  assert.equal(await timers.next(), 10);
  assert.equal(await timers.next(), 20);
  assert.equal(await timers.next(), 25);
  fail = false; await timers.next();
  queue.schedule(account); release(); await tick();
  assert.equal(JSON.parse(storage.getItem(`learning_achievement_sync_v1:relay:${account}`)).pending, true);
  assert.equal(await timers.next(), 0); release(); await tick();
  assert.equal(JSON.parse(storage.getItem(`learning_achievement_sync_v1:relay:${account}`)).pending, false);
  queue.pause(account); queue.schedule(account); assert.equal(timers.size(), 0);
});

test("IndexedDB backup survives a localStorage failure and rehydrates a fresh session", async () => {
  const records = new Map(), key = `progress:${account}`;
  const storage = { getItem: () => JSON.stringify(completions("old")), setItem: () => { throw new Error("quota"); } };
  const backup = { read: async key => records.get(key), write: async (key, value) => records.set(key, value) };
  const journal = createLocalJournal({ storage: () => storage, backup: () => backup });
  const local = completions("new");
  const saved = journal.write(key, local);
  assert.deepEqual(journal.read(key), local); // immediately, before backup settles
  assert.equal(await saved, true);
  assert.deepEqual(journal.read(key), local); // stale localStorage must not win
  assert.equal(journal.hasUnsaved(account), false);
  const reopened = createLocalJournal({ storage: () => storage, backup: () => backup });
  const restored = await reopened.restore(key, mergeProgressLedgers);
  assert.deepEqual(new Set(Object.keys(restored.solved_questions)), new Set(["old", "new"]));
});

test("both storage destinations failing preserves immediate state and exposes unsaved status", async () => {
  const key = `progress:${account}`, value = completions("completed");
  const journal = createLocalJournal({ storage: () => ({ getItem: () => null, setItem: () => { throw new Error("quota"); } }),
    backup: () => ({ write: async () => { throw new Error("blocked"); } }) });
  assert.equal(await journal.write(key, value), false);
  assert.deepEqual(journal.read(key), value);
  assert.equal(journal.hasUnsaved(account), true);
  assert.equal(journal.hasUnsaved("another-account"), false);
  const newer = completions("completed", "another-completion");
  await journal.write(key, newer);
  journal.confirmRemoteSave(key, value);
  assert.equal(journal.hasUnsaved(account), true);
  journal.confirmRemoteSave(key, newer);
  assert.equal(journal.hasUnsaved(account), false);
});

test("relay publishing requires an acknowledgement and bounds stalled relays/signers", async () => {
  await assert.rejects(confirmRelayPublish([Promise.reject(new Error("rejected")), Promise.reject(new Error("offline"))], 30), AggregateError);
  assert.equal(await confirmRelayPublish([new Promise(() => {}), Promise.resolve("accepted")], 30), "accepted");
  await assert.rejects(confirmRelayPublish([new Promise(() => {})], 10), /timed out/);
  await assert.rejects(withSyncDeadline(new Promise(() => {}), 10), /timed out/);
});

test("a stalled extension request is reused on retry instead of opening duplicate dialogs", async () => {
  const request = createSingleFlight(); let calls = 0, release;
  const signer = () => { calls++; return new Promise(resolve => { release = resolve; }); };
  const original = request("alice:sign", signer);
  await assert.rejects(withSyncDeadline(original, 10), /timed out/);
  const retried = request("alice:sign", signer);
  assert.equal(calls, 1); assert.equal(retried, original);
  release("signed"); assert.equal(await retried, "signed");
  await tick();
  assert.equal(await request("alice:sign", () => "new event"), "new event");
});

test("live progress ignores unacknowledged/cached snapshots and releases its account listener", () => {
  let receive, stopped = false;
  const changes = [];
  const adapter = createAchievementPersistence({ database: {}, collection: () => "ref", onSnapshot: (_ref, _options, callback) => {
    receive = callback; return () => { stopped = true; };
  } });
  const stop = adapter.watchProgress(account, source, ledger => changes.push(ledger));
  const snapshot = metadata => ({ metadata, docs: [{ id: "event", data: () => ({ source, metric: "course_steps", completionId: "en:1" }) }] });
  receive(snapshot({ fromCache: true })); receive(snapshot({ hasPendingWrites: true }));
  assert.equal(changes.length, 0);
  receive(snapshot({ fromCache: false, hasPendingWrites: false }));
  assert.deepEqual(changes, [{ course_steps: { "en:1": 1 } }]);
  stop(); assert.equal(stopped, true);
});

test("foreground awards and feedback remain immediate even when localStorage is blocked", async () => {
  const services = await import(existsSync(new URL("../utils/achievements.js", import.meta.url)) ? "../utils/achievements.js" : "../utility/achievements.js");
  const originalWindow = globalThis.window, originalStorage = globalThis.localStorage;
  const identity = "blocked-storage-foreground";
  globalThis.window = {}; // No document: do not contact Firebase or real relays.
  globalThis.localStorage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("quota"); } };
  unlockStore.setIdentity(identity);
  try {
    const awards = await services.awardProgressionAchievements({ npub: identity, source, events: Array.from({ length: 10 }, (_, i) => ({ metric: "solved_questions", id: `en:course:${i + 1}` })) });
    assert.equal(awards.length, 1);
    assert.ok(services.getStoredAchievements(identity).robotsbuildingeducation_solved_questions_10);
    assert.equal(unlockStore.getSnapshot().queue[0].achievement.id, "robotsbuildingeducation_solved_questions_10");
  } finally {
    unlockStore.setIdentity("");
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});
