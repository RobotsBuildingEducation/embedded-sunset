import { addProgressEvents } from "./progressionEvidence.js";
import { mergeProgressLedgers } from "./progressionRuntime.js";
import { codingEvidenceForLedger } from "./codingProgress.js";

// Legacy answer/profile records lack course IDs. Match their saved content to
// one curriculum step; ambiguous matches must not grant another course's work.
export function codingBackfillProofs({ profile, answers, courseMap, ledger = {}, videoGroups = [] }) {
  const steps = Object.entries(courseMap).flatMap(([course, items]) => items.slice(1).map((step, index) => ({ course, number: index + 1, step })));
  const events = [];
  const identify = record => {
    const question = typeof record.question === "string" && record.question.trim() ? record.question : "";
    const title = typeof record.title === "string" && record.title.trim() ? record.title : "";
    if (!question && !title) return null;
    let matches = steps.filter(item => (!record.course || item.course === record.course) &&
      (question ? item.step.question?.questionText === question : item.step.title === title));
    if (matches.length > 1 && title) matches = matches.filter(item => item.step.title === title);
    return matches.length === 1 ? matches[0] : null;
  };
  for (const answer of answers || []) {
    if (answer.isCorrect === false) continue;
    const match = identify(answer);
    if (!match) continue;
    events.push({ metric: "course_steps", id: `${match.course}:${match.number}` });
    // A persisted grade is required for solved-question counts; navigation,
    // generated question counts and freeform feedback do not prove correctness.
    if (answer.isCorrect === true) events.push({ metric: "solved_questions", id: `${match.course}:course:${match.number}` });
  }
  for (const record of Object.values(profile.answeredSteps || {})) {
    if (!record?.completedAt) continue;
    const match = identify(record);
    if (match) events.push({ metric: "course_steps", id: `${match.course}:${match.number}` });
  }
  for (const [course, groups] of Object.entries(profile.moduleProgressByCourse || {})) {
    if (!courseMap[course]) continue;
    for (const [group, progress] of Object.entries(groups || {})) {
      if (progress?.videoWatched === true) events.push({ metric: "review_videos", id: `${course}:${group}` });
      if (progress?.videoWatched === true && progress.summaryViewed === true && progress.practiceCompleted === true) {
        events.push({ metric: "review_checklists", id: `${course}:${group}` });
      }
    }
  }
  const combined = mergeProgressLedgers(ledger, addProgressEvents({}, events));
  // Record all imported events before evaluating any individual course.
  return { proofs: [{ events }, ...codingEvidenceForLedger(courseMap, combined, videoGroups).map(evidence => ({ evidence }))] };
}
