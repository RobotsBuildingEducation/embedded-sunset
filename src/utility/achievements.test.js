import test from "node:test";
import { CATALOG_VERSION } from "../achievements/catalog.js";
import assert from "node:assert/strict";
import { unlockStore } from "../achievements/unlockStore.js";
import {
  ACHIEVEMENT_KIND,
  ACHIEVEMENT_D,
  ACHIEVEMENT_TAG,
  buildAchievementEvent,
  parseAchievementEvent,
  pubkeyFromNpub,
} from "./achievements.js";

test("buildAchievementEvent formats Nostr kind 30078 correctly", () => {
  const unlocked = {
    first_words: { unlockedAt: 1710000000, source: "nosabos" },
    first_commit: { unlockedAt: 1710001000, source: "robotsbuildingeducation" },
  };

  const event = buildAchievementEvent(unlocked);
  assert.equal(event.kind, ACHIEVEMENT_KIND);
  assert.equal(event.kind, 30078);

  const dTag = event.tags.find((t) => t[0] === "d")?.[1];
  const tTag = event.tags.find((t) => t[0] === "t")?.[1];

  assert.equal(dTag, ACHIEVEMENT_D);
  assert.equal(tTag, ACHIEVEMENT_TAG);

  const parsed = parseAchievementEvent(event);
  assert.deepEqual(parsed, unlocked);
});

const withLocalStorage = async (run) => {
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.localStorage;
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  try { await run(); }
  finally {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
};

test("foreground awards save and queue unlocks without waiting for a stalled signer", () => withLocalStorage(async () => {
  const { awardTutorLevelAchievements, getStoredAchievements } = await import("./achievements.js");
  const identity = "foreground-test";
  unlockStore.setIdentity(identity);
  let signerCalls = 0;
  localStorage.setItem("nip07_signer", "true");
  window.nostr = { getPublicKey: () => { signerCalls++; return new Promise(() => {}); }, signEvent: () => {} };
  let timeout;
  try {
    const awards = await Promise.race([
      awardTutorLevelAchievements({ npub: identity, level: "B2" }),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Foreground waited for the signer")), 200); }),
    ]);
    assert.equal(awards.length, 3);
    assert.equal(signerCalls, 0);
    assert.ok(getStoredAchievements(identity).tutor_reach_b2);
    assert.equal(unlockStore.getSnapshot().queue.length, 3);
    assert.deepEqual(await awardTutorLevelAchievements({ npub: identity, level: "B2" }), []);
    assert.equal(unlockStore.getSnapshot().queue.length, 3);
  } finally { clearTimeout(timeout); unlockStore.setIdentity(""); }
}));

test("real tutor B2 awards all earned milestones, upgrades tests, and is idempotent", () => withLocalStorage(async () => {
  const { awardTutorLevelAchievements, getStoredAchievements, storeAchievements } = await import("./achievements.js");
  const npub = "tutor-local-test";
  storeAchievements(npub, { tutor_reach_b2: { unlockedAt: 1, test: true }, tutor_sessions_advanced: { unlockedAt: 2, test: true } });
  assert.deepEqual(await awardTutorLevelAchievements({ npub, level: "A1" }), []);
  const awarded = await awardTutorLevelAchievements({ npub, level: "B2" });
  assert.deepEqual(awarded.map(item => item.id), ["tutor_reach_a2", "tutor_reach_b1", "tutor_reach_b2"]);
  const saved = getStoredAchievements(npub);
  assert.equal(saved.tutor_reach_b2.test, undefined);
  assert.equal(saved.tutor_reach_b2.catalogVersion, CATALOG_VERSION);
  assert.equal(saved.tutor_sessions_advanced.test, true);
  assert.equal(saved.two_worlds_complete_v4, undefined);
  assert.deepEqual(await awardTutorLevelAchievements({ npub, level: "B2" }), []);
  assert.deepEqual(getStoredAchievements(npub), saved);
}));

test("concurrent handlers retain both completion awards and derive only the course capstone", () => withLocalStorage(async () => {
  const { awardProgressionAchievements, awardAchievement, getStoredAchievements, storeAchievements, syncAchievements, ACHIEVEMENTS } = await import("./achievements.js");
  const npub = "concurrent-local-test";
  await Promise.all([
    awardProgressionAchievements({ npub, source: "nosabos", evidence: { counters: { tutor_lessons: 5 } } }),
    awardProgressionAchievements({ npub, source: "robotsbuildingeducation", evidence: { counters: { solved_questions: 10 } } }),
  ]);
  const concurrent = getStoredAchievements(npub);
  assert.ok(concurrent.nosabos_tutor_lessons_5);
  assert.ok(concurrent.robotsbuildingeducation_solved_questions_10);
  assert.equal(await awardAchievement({ npub, achievementId: "conversation_repairs_beginner", test: true }), null);
  assert.equal(await awardAchievement({ npub, achievementId: "rhythm_collection_v4" }), null);
  assert.equal(concurrent.two_worlds_complete_v4, undefined);
  const complete = { ...concurrent, ...Object.fromEntries(ACHIEVEMENTS.two_worlds_complete_v4.requirement.all.map((id, i) => [id, { unlockedAt: 10 + i }])) };
  storeAchievements(npub, complete);
  assert.ok((await syncAchievements(npub)).two_worlds_complete_v4);
  assert.ok(getStoredAchievements(npub).two_worlds_complete_v4);
}));

test("parseAchievementEvent returns null for invalid kind or d tag", () => {
  assert.equal(parseAchievementEvent(null), null);
  assert.equal(parseAchievementEvent({ kind: 1, tags: [["d", ACHIEVEMENT_D]] }), null);
  assert.equal(parseAchievementEvent({ kind: 30078, tags: [["d", "other-tag"]] }), null);
});

test("pubkeyFromNpub correctly extracts hex or passes through valid hex", () => {
  const hex = "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
  assert.equal(pubkeyFromNpub(hex), hex);
  assert.equal(pubkeyFromNpub(""), "");
});

test("awardRandomAchievement strictly respects preferredSource when provided", async () => {
  const { awardRandomAchievement } = await import("./achievements.js");
  const nosabosAch = await awardRandomAchievement("test_npub", "nosabos");
  assert.equal(nosabosAch.source, "nosabos");

  const sunsetAch = await awardRandomAchievement("test_npub", "robotsbuildingeducation");
  assert.equal(sunsetAch.source, "robotsbuildingeducation");
});


test("merge preserves genuine awards over test records in either relay order", async () => {
  const {mergeAchievementMaps, completeCourseAward} = await import("./achievements.js");
  const demo = {course_percent_advanced:{unlockedAt:10, source:"nosabos", test:true}};
  const earned = {course_percent_advanced:{unlockedAt:20, source:"nosabos"}};
  for (const maps of [[demo,earned],[earned,demo]]) {
    const result = completeCourseAward(mergeAchievementMaps(...maps));
    assert.deepEqual(result.course_percent_advanced, earned.course_percent_advanced);
    assert.equal(result.two_worlds_complete_v4,undefined);
    const both = completeCourseAward({...result, coding_course_percent_advanced:{unlockedAt:30,source:"robotsbuildingeducation"}});
    assert.equal(both.two_worlds_complete_v4, undefined); // legacy completions never satisfy the stricter v4 capstone
  }
  assert.equal(completeCourseAward(demo).two_worlds_complete_v4,undefined);
  assert.equal(mergeAchievementMaps({bad:null, array:[], missing:{}, text:"x"}).bad,undefined);
});

test("random testing exhausts only the host catalog without duplicates or a final award", async () => {
  const {awardRandomAchievement, getStoredAchievements, storeAchievements, awardAchievement, ACHIEVEMENTS} = await import("./achievements.js");
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.localStorage;
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = {getItem:key=>storage.get(key) ?? null, setItem:(key,value)=>storage.set(key,value)};
  try {
    const id = "local-test-identity";
    const allButLast = Object.fromEntries(Object.values(ACHIEVEMENTS).filter(item=>item.source === "nosabos" && item.id !== "tutor_reach_b2").map(item=>[item.id,{unlockedAt:10,source:item.source,test:true}]));
    storeAchievements(id,allButLast);
    assert.equal((await awardRandomAchievement(id,"nosabos")).id,"tutor_reach_b2");
    assert.equal(await awardRandomAchievement(id,"nosabos"),null);
    assert.equal(await awardRandomAchievement(id,"unknown-source"),null);
    assert.equal(await awardAchievement({npub:id,achievementId:"unknown"}),null);
    assert.equal(await awardAchievement({npub:id,achievementId:"two_worlds_complete_v4",test:true}),null);
    assert.equal(await awardAchievement({npub:id,achievementId:"two_worlds_complete_v4"}),null);
    const records=getStoredAchievements(id);
    assert.equal(Object.keys(records).length,Object.values(ACHIEVEMENTS).filter(item=>item.source === "nosabos").length);
    assert.equal(records.tutor_reach_b2.test,true);
    const coding=await awardRandomAchievement(id,"robotsbuildingeducation");
    assert.equal(coding.tier,"beginner");
    await awardAchievement({npub:id,achievementId:"coding_course_percent_advanced"});
    assert.equal(getStoredAchievements(id).two_worlds_complete_v4,undefined);
    await awardAchievement({npub:id,achievementId:"course_percent_advanced"});
    assert.equal(getStoredAchievements(id).two_worlds_complete_v4, undefined);
  } finally {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window=originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage=originalStorage;
  }
});

test("v4 progression validates evidence, upgrades tests once, and derives the shared capstone", () => withLocalStorage(async () => {
  const { awardProgressionAchievements, awardAchievement, getStoredAchievements, storeAchievements, ACHIEVEMENTS } = await import("./achievements.js");
  const { PROFICIENCY_LEVELS } = await import("../achievements/progression.js");
  const npub="progression-local-test";
  assert.equal(await awardAchievement({npub,achievementId:"piyali_full_curriculum_v4"}),null);
  storeAchievements(npub,{piyali_tutor_complete_b2:{unlockedAt:1,test:true}});
  const language={language:"es",levels:Object.fromEntries(["tutor","skillTree","flashcards"].map(mode=>[mode,Object.fromEntries(PROFICIENCY_LEVELS.map(level=>[level.toLowerCase().replaceAll("-","_"),{total:1,completed:1}]))]))};
  await awardProgressionAchievements({npub,source:"nosabos",evidence:language});
  assert.equal(getStoredAchievements(npub).piyali_tutor_complete_b2.test,undefined);
  assert.ok(getStoredAchievements(npub).piyali_full_curriculum_v4);
  assert.equal(getStoredAchievements(npub).two_worlds_complete_v4,undefined);
  assert.deepEqual(await awardProgressionAchievements({npub,source:"nosabos",evidence:language}),[]);
  const coding={course:"py-en",sets:Object.fromEntries(ACHIEVEMENTS.robots_full_curriculum_v4.requirement.metrics.map(metric=>[metric,{required:["one"],completed:["one"]}]))};
  await awardProgressionAchievements({npub,source:"robotsbuildingeducation",evidence:coding});
  assert.ok(getStoredAchievements(npub).two_worlds_complete_v4);
}));

test("concurrent duplicate progression callbacks only award once", () => withLocalStorage(async () => {
  const { awardProgressionAchievements, getStoredAchievements } = await import("./achievements.js");
  const npub="duplicate-progress-test";
  const calls=await Promise.all(Array.from({length:4},()=>awardProgressionAchievements({npub,source:"nosabos",events:[{metric:"phonics_decks",id:"same-completed-deck"}]})));
  assert.equal(calls.flat().filter(item=>item.id==="nosabos_phonics_decks_1").length,1);
  assert.ok(getStoredAchievements(npub).nosabos_phonics_decks_1);
}));

test("completion count batches award every reached milestone, survive transport and never repeat", () => withLocalStorage(async () => {
  const { awardProgressionAchievements, getStoredAchievements, storeAchievements } = await import("./achievements.js");
  const npub = "completion-count-test";
  storeAchievements(npub, { nosabos_tutor_lessons_5: { unlockedAt: 1, test: true } });
  const language = { language: "es", counters: { tutor_lessons: 200, skill_tree_lessons: 200, flashcards_completed: 200 } };
  const coding = { course: "py-en", counters: { solved_questions: 100 } };
  assert.equal((await awardProgressionAchievements({ npub, source: "nosabos", evidence: language })).length, 21);
  assert.equal((await awardProgressionAchievements({ npub, source: "robotsbuildingeducation", evidence: coding })).length, 4);
  const saved = getStoredAchievements(npub);
  assert.equal(Object.keys(saved).length, 25);
  assert.ok(Object.values(saved).every(record => !record.test && record.catalogVersion === CATALOG_VERSION));
  assert.deepEqual(parseAchievementEvent(buildAchievementEvent(saved)), saved);
  for (const [source, evidence] of [["nosabos", language], ["robotsbuildingeducation", coding]]) {
    assert.deepEqual(await awardProgressionAchievements({ npub, source, evidence }), []);
  }
}));

test("retired records survive storage and Nostr round trips without counting or being re-awarded", () => withLocalStorage(async () => {
  const { storeAchievements, getStoredAchievements, awardAchievement, awardProgressionAchievements } = await import("./achievements.js");
  const { collectionProgress } = await import("../achievements/catalog.js");
  const { readProgressLedger } = await import("../achievements/progressionRuntime.js");
  const npub = "retired-completion-test";
  const retired = { conversation_repairs_beginner: { unlockedAt: 1 }, nosabos_session_timers_1: { unlockedAt: 2 } };
  storeAchievements(npub, retired);
  assert.deepEqual(parseAchievementEvent(buildAchievementEvent(getStoredAchievements(npub))), retired);
  assert.equal(Object.values(collectionProgress(retired)).reduce((n, tier) => n + tier.collected, 0), 0);
  assert.equal(await awardAchievement({ npub, achievementId: "conversation_repairs_beginner", test: true }), null);
  assert.deepEqual(await awardProgressionAchievements({ npub, source: "nosabos", events: [{ metric: "session_timers", id: "retired-timer" }, { metric: "spent_sats", id: "receipt", status: "confirmed", purpose: "tip", amount: 1000, sender: "alice", recipient: "bob" }] }), []);
  assert.deepEqual(readProgressLedger(npub, "nosabos"), {});
  assert.deepEqual(getStoredAchievements(npub), retired);
}));
