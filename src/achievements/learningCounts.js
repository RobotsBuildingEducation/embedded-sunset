const LEVEL_KEYS = ["pre_a1", "a1", "a2", "b1", "b2", "c1", "c2"];
export const LESSON_COUNT_THRESHOLDS = [5, 10, 20, 25, 50, 100, 200];
export const CONVERSATION_COUNT_THRESHOLDS = [5, 20, 50, 100, 200];
export const QUESTION_COUNT_THRESHOLDS = [10, 20, 50, 100];

// Compact summaries already count unique completed curriculum IDs per level.
// Count one language at a time and ignore empty, partial or malformed totals.
export function learningCompletionCounters(summary) {
  const modes = { tutor: "tutor_lessons", skillTree: "skill_tree_lessons", flashcards: "flashcards_completed" };
  return Object.fromEntries(Object.entries(modes).map(([mode, metric]) => [metric,
    summary?.migration?.complete === false ? 0 : LEVEL_KEYS.reduce((sum, key) => {
      const stats = summary?.[mode]?.levels?.[key];
      return sum + (Number.isSafeInteger(stats?.completed) && stats.completed >= 0 && Number.isSafeInteger(stats.total) && stats.total > 0
        ? Math.min(stats.completed, stats.total) : 0);
    }, 0),
  ]));
}

export function correctQuestionEvents({ course, question, isCorrect, isPostCourse = false, stepIndex, questionNumber }) {
  if (!course || isCorrect !== true || typeof question?.questionText !== "string" || !question.questionText.trim()) return [];
  const number = isPostCourse ? questionNumber : stepIndex;
  if (!Number.isSafeInteger(number) || number < 1) return [];
  const events = [{ metric: "solved_questions", id: `${course}:${isPostCourse ? "post" : "course"}:${number}` }];
  if (isPostCourse) events.push({ metric: "post_course_questions", id: `${course}:${number}` });
  return events;
}
export function solvedQuestionCount(ledger) {
  // Previously tracked post-course answers are genuine correct-answer evidence.
  // Legacy course navigation IDs do not prove a question was answered correctly.
  const ids = new Set(Object.keys(ledger.solved_questions || {}));
  for (const id of Object.keys(ledger.post_course_questions || {})) {
    const match = /^([^:]+):(\d+)$/.exec(id);
    if (match && Number(match[2]) > 0) ids.add(`${match[1]}:post:${Number(match[2])}`);
  }
  return ids.size;
}
