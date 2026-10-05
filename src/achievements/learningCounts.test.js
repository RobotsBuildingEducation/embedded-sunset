import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { ACHIEVEMENTS, SORTED_ACHIEVEMENTS } from "./catalog.js";
import { LESSON_COUNT_THRESHOLDS, QUESTION_COUNT_THRESHOLDS, learningCompletionCounters, correctQuestionEvents, solvedQuestionCount } from "./learningCounts.js";
import { addProgressEvents, earnedProgressionIds, meetsProgressionRequirement } from "./progressionEvidence.js";
import { codingCourseEvidence } from "./codingProgress.js";
import { ACHIEVEMENT_SLOTS } from "./slots.js";

test("new ladders unlock at each exact threshold independently of the other tracks", () => {
  assert.deepEqual(LESSON_COUNT_THRESHOLDS, [5, 10, 20, 25, 50, 100, 200]);
  assert.deepEqual(QUESTION_COUNT_THRESHOLDS, [10, 20, 50, 100]);
  for (const [source, metric, targets] of [
    ...["tutor_lessons", "skill_tree_lessons", "flashcards_completed"].map(metric => ["nosabos", metric, LESSON_COUNT_THRESHOLDS]),
    ["robotsbuildingeducation", "solved_questions", QUESTION_COUNT_THRESHOLDS],
  ]) {
    assert.deepEqual(Object.values(ACHIEVEMENTS).filter(item => item.requirement.metric === metric).map(item => item.target), targets);
    for (const target of targets) {
      const id = `${source}_${metric}_${target}`;
      const requirement = ACHIEVEMENTS[id].requirement;
      assert.equal(meetsProgressionRequirement(requirement, { counters: { [metric]: target - 1 } }), false);
      const earned = earnedProgressionIds(source, { counters: { [metric]: target } });
      assert.ok(earned.includes(id));
      assert.ok(earned.every(id => ACHIEVEMENTS[id].requirement.metric === metric));
      assert.deepEqual(earned.map(id => ACHIEVEMENTS[id].target), targets.filter(n => n <= target));
    }
  }
});

test("saved Piyali completions sum proficiency levels separately for each track", () => {
  const summary = {
    tutor: { levels: { pre_a1: { completed: 4, total: 10 }, a1: { completed: 21, total: 40 } } },
    skillTree: { levels: { b2: { completed: 50, total: 60 } } },
    flashcards: { levels: { c2: { completed: 200, total: 200 } } },
  };
  assert.deepEqual(learningCompletionCounters(summary), { tutor_lessons: 25, skill_tree_lessons: 50, flashcards_completed: 200 });
  summary.migration = { complete: false };
  assert.deepEqual(learningCompletionCounters(summary), { tutor_lessons: 0, skill_tree_lessons: 0, flashcards_completed: 0 });
  for (const stats of [null, { completed: 5 }, { completed: 5, total: 0 }, { completed: -1, total: 10 }, { completed: 4.5, total: 10 }, { completed: Infinity, total: 10 }, { completed: "10", total: 20 }]) {
    assert.equal(learningCompletionCounters({ tutor: { levels: { a1: stats } } }).tutor_lessons, 0);
  }
  assert.equal(learningCompletionCounters({ tutor: { levels: { a1: { completed: 100, total: 5 }, unknown: { completed: 100, total: 100 } } } }).tutor_lessons, 5);
  assert.equal(learningCompletionCounters().tutor_lessons, 0);
});

const question = { questionText: "What does this code print?" };
test("only correctly graded real questions emit completion events", () => {
  const input = { course: "py-en", question, isCorrect: true, stepIndex: 1 };
  assert.deepEqual(correctQuestionEvents(input), [{ metric: "solved_questions", id: "py-en:course:1" }]);
  for (const invalid of [{ isCorrect: false }, { isCorrect: "true" }, { question: undefined }, { question: { questionText: " " } }, { course: "" }, { stepIndex: 0 }, { stepIndex: 1.5 }, { stepIndex: "1" }, { isPostCourse: true }]) {
    assert.deepEqual(correctQuestionEvents({ ...input, ...invalid }), []);
  }
});

test("replays deduplicate while courses and post-course questions have separate identities", () => {
  let ledger = {};
  for (let i = 1; i <= 50; i++) {
    const course = correctQuestionEvents({ course: "py-en", question, isCorrect: true, stepIndex: i });
    const post = correctQuestionEvents({ course: "py-en", question, isCorrect: true, isPostCourse: true, questionNumber: i });
    ledger = addProgressEvents(ledger, [...course, ...course, ...post, ...post]);
    assert.equal(solvedQuestionCount(ledger), i * 2);
  }
  assert.equal(Object.keys(ledger.post_course_questions).length, 50);
  const evidence = codingCourseEvidence("py-en", [{}, { group: "tutorial" }], ledger, []);
  assert.equal(evidence.counters.solved_questions, 100);
  for (const target of QUESTION_COUNT_THRESHOLDS) assert.ok(earnedProgressionIds("robotsbuildingeducation", evidence).includes(`robotsbuildingeducation_solved_questions_${target}`));
  ledger = addProgressEvents(ledger, correctQuestionEvents({ course: "swift-en", question, isCorrect: true, stepIndex: 1 }));
  assert.equal(solvedQuestionCount(ledger), 101);
});

test("previous correct post-course answers backfill without counting navigation or duplicates", () => {
  let ledger = { post_course_questions: { "py-en:1": 1, "py-en:2": 1 }, course_steps: { "py-en:3": 1 }, solved_questions: { "py-en:course:3": 1 } };
  ledger = addProgressEvents(ledger, correctQuestionEvents({ course: "py-en", question, isCorrect: true, isPostCourse: true, questionNumber: 1 }));
  assert.equal(solvedQuestionCount(ledger), 3);
  assert.equal(solvedQuestionCount({ course_steps: { "py-en:1": 1 } }), 0);
});

test("permanent award slots stay unchanged beneath presentation color themes", () => {
  const baseline = SORTED_ACHIEVEMENTS.filter(item => item.number <= 245).map(({ id, number }) => ({ id, number, orb: ACHIEVEMENT_SLOTS[id].orb }));
  assert.equal(createHash("sha256").update(JSON.stringify(baseline)).digest("hex"), "cc28e22a18b5bab97eae8e772d04a70a20a5ddd78135d3dc6b88e2117b24a8ab");
});
