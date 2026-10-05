import test from "node:test";
import assert from "node:assert/strict";
import { createUnlockStore, previewAchievementUnlock, unlockStore } from "./unlockStore.js";
import { createBackgroundSync } from "./backgroundSync.js";
import { createAchievementPersistence, preferAwardRecord } from "./firestoreRecords.js";
import { ACHIEVEMENTS } from "./catalog.js";
import { createCommittedProgressObserver } from "./committedProgress.js";

const first = ACHIEVEMENTS.nosabos_tutor_lessons_5;
const second = ACHIEVEMENTS.nosabos_tutor_lessons_10;
const account = "npub1" + "q".repeat(58);
const tick = () => new Promise(resolve => setTimeout(resolve, 5));

test("confirmed progress listeners wait for server state, detect late saves and stop on account change", () => {
  const received = [];
  const observer = createCommittedProgressObserver(progress => received.push(progress));
  const snapshot = (data, metadata = {}) => ({ exists: () => data !== null, data: () => data, metadata });
  observer.receive("profile", snapshot({ progress: {} }));
  observer.receive("summary", snapshot({ completed: 5 }, { hasPendingWrites: true }));
  observer.receive("quest", snapshot(null));
  observer.receive("summary", snapshot({ completed: 5 }, { fromCache: true }));
  assert.equal(received.length, 0);
  observer.receive("summary", snapshot({ completed: 5 }));
  assert.equal(received[0].summary.completed, 5);
  observer.receive("summary", snapshot({ completed: 10 }, { hasPendingWrites: true }));
  assert.equal(received.length, 1);
  observer.receive("summary", snapshot({ completed: 10 }));
  assert.equal(received[1].summary.completed, 10);
  observer.dispose();
  observer.receive("summary", snapshot({ completed: 20 }));
  assert.equal(received.length, 2);
});

test("unlock queue retains consecutive rewards, deduplicates callbacks and isolates identities", () => {
  const store = createUnlockStore();
  let changes = 0;
  const unsubscribe = store.subscribe(() => changes++);
  store.setIdentity("alice");
  store.enqueue("alice", first);
  store.enqueue("alice", first);
  store.enqueue("alice", second);
  store.enqueue("bob", second);
  assert.deepEqual(store.getSnapshot().queue.map(item => item.achievement.id), [first.id, second.id]);
  store.dismiss(store.getSnapshot().queue[0].key);
  assert.equal(store.getSnapshot().queue[0].achievement.id, second.id);
  store.setIdentity("bob");
  assert.equal(store.getSnapshot().queue.length, 0);
  assert.equal(changes, 5);
  unsubscribe();
});

test("Test unlock previews only the chosen host and does not write transcript records", () => {
  unlockStore.setIdentity("preview-test");
  const before = unlockStore.getSnapshot().revision;
  for (const source of ["nosabos", "robotsbuildingeducation"]) {
    const item = previewAchievementUnlock(source);
    assert.equal(item.source, source);
    assert.notEqual(item.tier, "completion");
  }
  assert.ok(unlockStore.getSnapshot().queue.every(item => item.preview));
  assert.equal(unlockStore.getSnapshot().revision, before);
  unlockStore.setIdentity("");
});

test("slow background relay work never blocks callers and schedules a follow-up after another award", async () => {
  const calls = [];
  let release;
  const schedule = createBackgroundSync(async id => {
    calls.push(id);
    if (calls.length === 1) await new Promise(resolve => { release = resolve; });
  });
  assert.equal(schedule("alice"), undefined);
  await tick();
  schedule("alice"); schedule("alice");
  assert.deepEqual(calls, ["alice"]);
  release();
  await tick();
  assert.deepEqual(calls, ["alice", "alice"]);
});

test("a failed relay job does not prevent a later award from syncing", async () => {
  let attempts = 0, failures = 0;
  const schedule = createBackgroundSync(async () => { if (++attempts === 1) throw new Error("offline"); }, () => failures++);
  schedule("alice"); await tick();
  schedule("alice"); await tick();
  assert.equal(attempts, 2); assert.equal(failures, 1);
});

test("Firestore award records are idempotent, cannot downgrade genuine work, and restore compact records", async () => {
  const saved = new Map();
  let writes = 0;
  const adapter = createAchievementPersistence({
    database: {}, collection: (_db, ...parts) => parts.join("/"), doc: (_db, ...parts) => parts.join("/"),
    getDocs: async () => ({ docs: [...saved.entries()].map(([key, data]) => ({ id: key.split("/").at(-1), data: () => data })) }),
    runTransaction: async (_db, run) => run({ get: async ref => ({ exists: () => saved.has(ref), data: () => saved.get(ref) }),
      set: (ref, value) => { writes++; saved.set(ref, value); } }),
  });
  const fake = { unlockedAt: 10, test: true };
  const real = { unlockedAt: 20 };
  await adapter.save(account, { [first.id]: fake });
  await Promise.all([adapter.save(account, { [first.id]: real }), adapter.save(account, { [first.id]: fake })]);
  await adapter.save(account, { [first.id]: fake });
  await adapter.save("guest", { [first.id]: real });
  assert.equal(writes, 2);
  const record = saved.get(`users/${account}/achievements/${first.id}`);
  assert.equal(record.test, false); assert.equal(record.unlockedAt, 20);
  assert.ok(record.title); assert.ok(record.description); assert.deepEqual(record.orb, first.orb);
  const restored = await adapter.load(account);
  assert.equal(restored[first.id].unlockedAt, 20);
  assert.equal(restored[first.id].test, undefined);
  assert.equal(restored[first.id].title, undefined);
  assert.equal(preferAwardRecord(real, fake), real);
  assert.equal(preferAwardRecord(real, { unlockedAt: 15 }).unlockedAt, 15);
});

test("a failed Firestore save retries rather than marking the award as persisted", async () => {
  let attempts = 0;
  const adapter = createAchievementPersistence({ database: {}, doc: () => "ref", runTransaction: async (_db, run) => {
    if (++attempts === 1) throw new Error("offline");
    return run({ get: async () => ({ exists: () => false }), set: () => {} });
  } });
  await assert.rejects(adapter.save(account, { [first.id]: { unlockedAt: 1 } }));
  await adapter.save(account, { [first.id]: { unlockedAt: 1 } });
  assert.equal(attempts, 2);
});
