import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS } from "./catalog.js";
import { PROFICIENCY_LEVELS } from "./progression.js";
import { earnedProgressionIds, meetsProgressionRequirement, addProgressEvents, ledgerCounters, longestCalendarStreak, levelKey } from "./progressionEvidence.js";
const source = "nosabos";
const fullLanguage = () => ({ language: "es", levels: Object.fromEntries(["tutor", "skillTree", "flashcards"].map(mode => [mode, Object.fromEntries(PROFICIENCY_LEVELS.map(level => [levelKey(level), { total: 100, completed: 100 }]))])) });

test("every requested proficiency track, goal and repair level has a milestone", () => {
  for (const mode of ["tutor", "skillTree", "flashcards", "goals", "repairs"]) for (const level of PROFICIENCY_LEVELS) assert.ok(ACHIEVEMENTS[`piyali_${mode}_complete_${levelKey(level)}`]);
  for (const metric of ["phonics_decks", "immersion_checklists", "immersion_tasks"]) assert.ok(Object.values(ACHIEVEMENTS).some(item => item.source === source && item.requirement.metric === metric));
  for (const metric of ["chapters", "review_videos", "review_checklists", "post_course_questions"]) assert.ok(Object.values(ACHIEVEMENTS).some(item => item.source === "robotsbuildingeducation" && item.requirement.metric === metric));
});
test("full language course requires complete C2 in every track in one language", () => {
  const complete = fullLanguage();
  assert.ok(earnedProgressionIds(source, complete).includes("piyali_full_curriculum_v4"));
  for (const mode of ["tutor", "skillTree", "flashcards"]) for (const level of PROFICIENCY_LEVELS) {
    const partial = fullLanguage(); partial.levels[mode][levelKey(level)].completed = 99;
    assert.equal(earnedProgressionIds(source, partial).includes("piyali_full_curriculum_v4"), level !== "C2");
    assert.equal(earnedProgressionIds(source, partial).includes(`piyali_${mode}_complete_${levelKey(level)}`), level !== "C2");
  }
  for (const bad of [undefined, { total: 0, completed: 0 }, {total:100,completed:99.99}, {total:100,completed:Infinity}]) {
    const partial = fullLanguage(); partial.levels.tutor.c2 = bad;
    assert.equal(earnedProgressionIds(source, partial).includes("piyali_full_curriculum_v4"), false);
  }
  assert.equal(earnedProgressionIds(source, { ...complete, language: "" }).length, 0);
  // Milestones earned in different languages never assemble into a course.
  assert.equal(meetsProgressionRequirement(ACHIEVEMENTS.piyali_full_curriculum_v4.requirement, { language:"es", levels:{ tutor:complete.levels.tutor } }), false);
});
test("behavior, usage and pet evidence cannot unlock current learning awards", () => {
  assert.deepEqual(earnedProgressionIds(source, {score:100,gradedCount:100,members:{unlocked_pets:["alien","robot","slime","dog","axolotl"]},counters:{session_timers:100,focus_tasks:100,earned_xp:100000,healthy_days:30,conversation_turns:100,conversation_repairs:100,spent_sats:100000}}), []);
  assert.deepEqual(earnedProgressionIds("robotsbuildingeducation", {counters:{calendar_streak:100,daily_goals:100,spent_sats:100000}}), []);
  assert.equal(earnedProgressionIds(source,{counters:{tutor_lessons:-1,flashcards_completed:NaN},levelCounts:{goals:{unknown:5}}}).length,0);
});
test("events deduplicate across replays, countdown reloads and checklist toggles", () => {
  const events=[{metric:"session_timers",id:"session-1"},{metric:"immersion_tasks",id:"batch-1:0"},{metric:"focus_tasks",id:"es:2026-10-01:tutor"}];
  let ledger=addProgressEvents({}, events);ledger=addProgressEvents(ledger,events);
  assert.deepEqual(ledgerCounters(ledger),{session_timers:1,immersion_tasks:1,focus_tasks:1});
  assert.deepEqual(addProgressEvents(ledger,[{metric:"session_timers",id:""}]),ledger);
});
test("sats count only confirmed outgoing purchases/tips, once per receipt and without change", () => {
  const paid={metric:"spent_sats",id:"receipt",amount:1000,status:"confirmed",purpose:"tip",sender:"alice",recipient:"bob"};
  const invalid=[{status:"failed"},{purpose:"receive"},{purpose:"transfer"},{recipient:"alice"},{amount:Infinity},{amount:-1},{amount:0},{amount:1.5}].map((patch,i)=>({...paid,id:`bad-${i}`,...patch}));
  const ledger=addProgressEvents({},[paid,paid,...invalid]);
  assert.equal(ledgerCounters(ledger).spent_sats,1000);
});
test("day streaks use consecutive calendar dates, with duplicates and DST boundaries handled", () => {
  assert.equal(longestCalendarStreak(["2026-03-07","2026-03-08","2026-03-09","2026-03-09","garbage"]),3);
  assert.equal(longestCalendarStreak(["2026-10-01","2026-10-03","2026-10-04","2026-10-05"]),3);
  assert.equal(longestCalendarStreak(["2026-02-30"]),0);
  assert.equal(ledgerCounters(addProgressEvents({},Array.from({length:10},()=>({metric:"calendar_streak",id:"2026-10-01"})))).calendar_streak,1);
});
test("Robots course requires finite chapters, actual video completions and every checklist", () => {
  const requirement=ACHIEVEMENTS.robots_full_curriculum_v4.requirement;
  const sets=Object.fromEntries(requirement.metrics.map(metric=>[metric,{required:["py-en:1","py-en:2"],completed:["py-en:1","py-en:2"]}]));
  assert.equal(meetsProgressionRequirement(requirement,{course:"py-en",sets}),true);
  for (const metric of requirement.metrics) {
    assert.equal(meetsProgressionRequirement(requirement,{course:"py-en",sets:{...sets,[metric]:{required:["py-en:1","py-en:2"],completed:["py-en:1","swift-en:2"]}}}),false);
    assert.equal(meetsProgressionRequirement(requirement,{course:"py-en",sets:{...sets,[metric]:{required:[],completed:[]}}}),false);
  }
});

test("coding manifests require every step in every chapter of the same course", async () => {
  const { codingCourseEvidence, watchedSeconds } = await import("./codingProgress.js");
  const steps=[{group:"introduction"},{group:"tutorial"},{group:"1"},{group:"1"}];
  const ledger=addProgressEvents({},[{metric:"course_steps",id:"py-en:1"},{metric:"course_steps",id:"py-en:2"},{metric:"course_steps",id:"swift-en:3"}]);
  let evidence=codingCourseEvidence("py-en",steps,ledger,["tutorial","1"]);
  assert.equal(evidence.counters.chapters,1);
  assert.equal(earnedProgressionIds("robotsbuildingeducation",evidence).includes("robotsbuildingeducation_chapters_all"),false);
  const complete=addProgressEvents(ledger,[{metric:"course_steps",id:"py-en:3"},...["review_videos","review_checklists"].flatMap(metric=>["tutorial","1"].map(group=>({metric,id:`py-en:${group}`})))]);
  evidence=codingCourseEvidence("py-en",steps,complete,["tutorial","1"]);
  assert.ok(earnedProgressionIds("robotsbuildingeducation",evidence).includes("robots_full_curriculum_v4"));
  assert.equal(watchedSeconds([[0,10],[5,15],[30,40]]),25); // Replays do not replace unseen ranges.
  assert.equal(watchedSeconds([[0,NaN],[20,10],[-1,5]]),0);
});

test("phonics deck awards require the saved manifest, every card and persisted correct recall", async () => {
  const { phonicsCompletionEvidence } = await import("./phonicsProgress.js");
  const cards=[{letterId:"gen_123_0",generated:true,generatedDeckSize:2,correctCount:1},{letterId:"gen_123_1",generated:true,generatedDeckSize:2,correctCount:1}];
  assert.equal(phonicsCompletionEvidence("es",[],cards).events.length,1);
  assert.equal(phonicsCompletionEvidence("es",[],cards.slice(0,1)).events.length,0);
  assert.equal(phonicsCompletionEvidence("es",[],cards.map(card=>({...card,generatedDeckSize:null}))).events.length,0);
  const incomplete=cards.map((card,i)=>({...card,correctCount:i}));
  assert.equal(phonicsCompletionEvidence("es",[],incomplete).events.length,0);
  assert.equal(earnedProgressionIds("nosabos",phonicsCompletionEvidence("es",[{id:"a"}],cards).evidence).includes("nosabos_phonics_cards_all"),false);
});
