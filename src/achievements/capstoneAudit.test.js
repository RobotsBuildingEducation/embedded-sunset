import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ACHIEVEMENTS, completeCollectionAwards } from "./catalog.js";
import { createAchievementPersistence } from "./firestoreRecords.js";
import { unlockStore } from "./unlockStore.js";

const path = existsSync(new URL("../utils/achievements.js", import.meta.url)) ? "../utils/achievements.js" : "../utility/achievements.js";
const services = await import(path);

test("shared completion waits for both genuine course awards and survives a second device", async () => {
  const previous = { window: globalThis.window, storage: globalThis.localStorage };
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const npub = "npub1" + "q".repeat(58), capstone = "two_worlds_complete_v4";
  const required = ACHIEVEMENTS[capstone].requirement.all;
  const records = new Map();
  const dependencies = { database: {}, collection: (_db, ...parts) => parts.join("/"), doc: (_db, ...parts) => parts.join("/"),
    getDocs: async path => ({ docs: [...records].filter(([id]) => id.startsWith(`${path}/`)).map(([id, record]) => ({ id: id.split("/").at(-1), data: () => record })) }),
    runTransaction: async (_db, run) => run({ get: async ref => ({ exists: () => records.has(ref), data: () => records.get(ref) }), set: (ref, value) => records.set(ref, value) }),
  };
  unlockStore.setIdentity(npub);
  try {
    await services.awardAchievements({ npub, achievementIds: required, test: true });
    assert.equal(services.getStoredAchievements(npub)[capstone], undefined);
    const piyali = ACHIEVEMENTS[required[0]].requirement;
    const languageEvidence = { language: "es", levels: Object.fromEntries(piyali.modes.map(mode => [mode,
      Object.fromEntries(piyali.levels.map(level => [level.toLowerCase().replaceAll("-", "_"), { total: 2, completed: 2 }])),
    ])) };
    await services.awardProgressionAchievements({ npub, source: "nosabos", evidence: languageEvidence });
    assert.equal(services.getStoredAchievements(npub)[capstone], undefined, "one genuine and one test course is insufficient");
    const robots = ACHIEVEMENTS[required[1]].requirement;
    const codingEvidence = { course: "en", sets: Object.fromEntries(robots.metrics.map(metric => [metric,
      { required: ["en:one", "en:two"], completed: ["en:one", "en:two"] },
    ])) };
    await services.awardProgressionAchievements({ npub, source: "robotsbuildingeducation", evidence: codingEvidence });
    const earned = services.getStoredAchievements(npub)[capstone];
    assert.ok(earned && !earned.test);
    assert.equal(unlockStore.getSnapshot().queue.filter(entry => entry.achievement.id === capstone).length, 1);
    const first = createAchievementPersistence(dependencies);
    await first.save(npub, services.getStoredAchievements(npub));
    const second = createAchievementPersistence(dependencies);
    const restored = await second.load(npub);
    assert.deepEqual(restored[capstone], earned);
    assert.deepEqual(completeCollectionAwards(restored)[capstone], earned);
    await second.save(npub, restored);
    assert.equal([...records.keys()].filter(id => id.endsWith(`/${capstone}`)).length, 1);
    assert.equal((await second.load("npub1" + "p".repeat(58)))[capstone], undefined);
  } finally {
    unlockStore.setIdentity("");
    if (previous.window === undefined) delete globalThis.window; else globalThis.window = previous.window;
    if (previous.storage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous.storage;
  }
});
