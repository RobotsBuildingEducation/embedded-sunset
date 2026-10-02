import { solvedQuestionCount } from "./learningCounts.js";
// Numeric legacy step IDs do not identify a course. New completion events use
// course-prefixed IDs, and chapter totals come from the current manifest.
export function codingCourseEvidence(course, courseSteps, ledger, videoGroups) {
  const indexed = courseSteps.slice(1).map((step, i) => ({ id: `${course}:${i + 1}`, group: String(step.group === "introduction" ? "tutorial" : step.group || "") }));
  const groups = [...new Set(indexed.map(step => step.group).filter(Boolean))];
  const completedSteps = Object.keys(ledger.course_steps || {});
  const completedChapters = groups.filter(group => indexed.filter(step => step.group === group).every(step => completedSteps.includes(step.id)));
  const videos = groups.filter(group => videoGroups.includes(group));
  const reviewedChapters = videos.filter(group => ledger.review_videos?.[`${course}:${group}`] && ledger.review_checklists?.[`${course}:${group}`]);
  return { course, chapters: { completed: completedChapters, reviewed: reviewedChapters }, counters: { chapters: completedChapters.length, solved_questions: solvedQuestionCount(ledger) }, sets: {
    course_steps: { required: indexed.map(step => step.id), completed: completedSteps },
    chapters: { required: groups, completed: completedChapters },
    review_videos: { required: videos.map(group => `${course}:${group}`), completed: Object.keys(ledger.review_videos || {}) },
    review_checklists: { required: videos.map(group => `${course}:${group}`), completed: Object.keys(ledger.review_checklists || {}) },
  } };
}
export function watchedSeconds(ranges) {
  let watched = 0, through = 0;
  for (const [start, end] of [...ranges].sort((a,b) => a[0]-b[0])) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) continue;
    watched += Math.max(0, end - Math.max(start, through)); through = Math.max(through, end);
  }
  return watched;
}
