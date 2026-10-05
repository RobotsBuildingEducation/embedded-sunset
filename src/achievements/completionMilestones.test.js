import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS, ACHIEVEMENT_LOCALES } from "./catalog.js";
import { CODING_CHAPTERS } from "./codingChapters.js";
import { codingCourseEvidence } from "./codingProgress.js";
import { conversationCompletionEvent } from "./conversationProgress.js";
import { addProgressEvents, earnedProgressionIds, ledgerCounters } from "./progressionEvidence.js";
import { localizeAchievement } from "./copy.js";

test("each playable chapter has independent completion and full-review milestones", () => {
  for (const {group, number} of CODING_CHAPTERS) {
    const steps = [{group:"introduction"}, {group}, {group}];
    const completion = `robots_chapter_${number}_complete`;
    const review = `robots_chapter_${number}_review`;
    const earned = ledger => earnedProgressionIds("robotsbuildingeducation", codingCourseEvidence("en", steps, ledger, [group]));
    assert.ok(ACHIEVEMENTS[completion]); assert.ok(ACHIEVEMENTS[review]);
    let ledger = addProgressEvents({}, [{metric:"course_steps",id:"en:1"},{metric:"course_steps",id:"es:2"}]);
    assert.equal(earned(ledger).includes(completion), false);
    ledger = addProgressEvents(ledger,[{metric:"course_steps",id:"en:2"}]);
    assert.ok(earned(ledger).includes(completion));
    assert.equal(earned(ledger).includes(review),false);
    ledger = addProgressEvents(ledger,[{metric:"review_videos",id:`en:${group}`},{metric:"review_checklists",id:`es:${group}`}]);
    assert.equal(earned(ledger).includes(review),false);
    ledger = addProgressEvents(ledger,[{metric:"review_checklists",id:`en:${group}`}]);
    assert.ok(earned(ledger).includes(review));
    assert.equal(earnedProgressionIds("robotsbuildingeducation",codingCourseEvidence("en",steps,ledger,[])).includes(review),false);
    for (const {number: other} of CODING_CHAPTERS.filter(c=>c.number!==number)) {
      assert.equal(earned(ledger).includes(`robots_chapter_${other}_complete`),false);
      assert.equal(earned(ledger).includes(`robots_chapter_${other}_review`),false);
    }
  }
});

test("empty curricula and videos alone never grant individual chapter reviews", () => {
  const ledger = {review_videos:{"en:1":1},review_checklists:{"en:1":1},course_steps:{"en:1":1}};
  const earned = earnedProgressionIds("robotsbuildingeducation",codingCourseEvidence("en",[{}],ledger,["1"]));
  assert.ok(!earned.some(id=>id.startsWith("robots_chapter_")));
});

test("conversation volumes count completed goals once, across repeated callbacks", () => {
  const goal = {text:{en:"Order a meal"}};
  for (const patch of [{completed:false},{completed:"true"},{language:""},{goal:null},{goal:{text:{en:" "}}}]) {
    assert.equal(conversationCompletionEvent({goal,language:"es",completed:true,...patch}),null);
  }
  const event=conversationCompletionEvent({goal,language:"es",completed:true});
  assert.deepEqual(conversationCompletionEvent({goal,language:"es",completed:true}),event);
  let ledger=addProgressEvents({},[event,event]);
  assert.equal(ledgerCounters(ledger).conversation_goals,1);
  for(let i=1;i<200;i++) {
    const next=conversationCompletionEvent({goal:{text:{en:"Order a meal"}},language:"es",completed:true});
    ledger=addProgressEvents(ledger,[next,next]);
  }
  const earned=earnedProgressionIds("nosabos",{counters:ledgerCounters(ledger)});
  assert.equal(ledgerCounters(ledger).conversation_goals,200);
  assert.deepEqual(earned,[5,20,50,100,200].map(n=>`nosabos_conversation_goals_${n}`));
});

test("all visible requirements are simple and use the Lessons brand", () => {
  for(const locale of ACHIEVEMENT_LOCALES) for(const item of Object.values(ACHIEVEMENTS)) {
    const copy=localizeAchievement(item,locale);
    assert.ok(copy.title && copy.desc && !/undefined|[{}]/.test(copy.title+copy.desc));
    if(locale==="en") {
      assert.ok(!/Skill Tree|does not count|do not count|replays|repeating|generating|placement|distinct|graded|every assigned practice mode/i.test(copy.desc),copy.desc);
      assert.ok(copy.desc.length<140,copy.desc);
    }
  }
  assert.equal(localizeAchievement(ACHIEVEMENTS.nosabos_skill_tree_lessons_20,"en").desc,"Complete 20 lessons.");
});
