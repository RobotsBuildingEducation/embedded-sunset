import { LESSON_COUNT_THRESHOLDS, QUESTION_COUNT_THRESHOLDS, CONVERSATION_COUNT_THRESHOLDS } from "./learningCounts.js";
import { CODING_CHAPTERS } from "./codingChapters.js";
// Explicit milestones for the host apps' real progression systems. A0 is the
// UI shorthand for Pre-A1; protocol IDs always use pre_a1.
export const PROFICIENCY_LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const levelKey = level => level.toLowerCase().replaceAll("-", "_");
const levelTier = level => PROFICIENCY_LEVELS.indexOf(level) < 3 ? "beginner" : PROFICIENCY_LEVELS.indexOf(level) < 5 ? "intermediate" : "advanced";
const piyali = "nosabos";
const robots = "robotsbuildingeducation";
const goal = (id, source, family, name, task, requirement, tier = "advanced", detail = {}) => ({
  id, source, family, path: id, name, task, requirement, tier, ...detail, progression: true,
  sourceName: source === piyali ? "Piyali" : source === robots ? "Robots Building Education" : "Piyali + Robots Building Education",
  target: requirement.target || 1,
});
const counts = (source, family, metric, name, targets, task = "count", tiers = ["beginner", "intermediate", "advanced"]) => targets.map((target, i) =>
  goal(`${source}_${metric}_${target}`, source, family, name, task,
    { type: "counter", metric, target, distinct: true }, tiers[Math.min(i, tiers.length - 1)]));
const setGoal = (source, family, metric, name) => goal(`${source}_${metric}_all`, source, family, name, "set",
  { type: "complete_set", metric, nonempty: true, scope: "one_course" });

export const PROGRESSION_ACHIEVEMENTS = [
  ...["tutor", "skillTree", "flashcards"].flatMap(mode => PROFICIENCY_LEVELS.map(level =>
    goal(`piyali_${mode}_complete_${levelKey(level)}`, piyali, mode === "tutor" ? "voice" : mode === "flashcards" ? "memory" : "journey",
      mode, "level", { type: "level_set", metric: mode, level, nonempty: true, scope: "one_language", cumulative: true }, levelTier(level), { level }))),
  ...["goals", "repairs"].flatMap(metric => PROFICIENCY_LEVELS.map(level =>
    goal(`piyali_${metric}_complete_${levelKey(level)}`, piyali, "journey", metric, "levelTask",
      { type: "level_counter", metric, level, target: 1, allAssignedModes: true, cumulative: true }, levelTier(level), { level }))),
  setGoal(piyali, "discovery", "phonics_cards", "phonicsCards"),
  ...counts(piyali, "discovery", "phonics_decks", "phonicsDecks", [1, 5, 20], "decks"),
  ...counts(piyali, "discovery", "immersion_checklists", "immersionChecklists", [1, 10, 30]),
  ...counts(piyali, "discovery", "immersion_tasks", "immersionTasks", [5, 50, 200]),
  ...counts(robots, "builder", "chapters", "chapters", [1, 3, 5]),
  setGoal(robots, "builder", "chapters", "allChapters"),
  ...counts(robots, "builder", "review_videos", "reviewVideos", [1], "videos"),
  setGoal(robots, "builder", "review_videos", "allVideos"),
  ...counts(robots, "builder", "review_checklists", "reviewChecklists", [1]),
  setGoal(robots, "builder", "review_checklists", "allChecklists"),
  ...counts(robots, "builder", "post_course_questions", "postCourse", [1, 25, 100], "postCourse"),
  goal("piyali_full_curriculum_v4", piyali, "journey", "fullPiyali", "fullPiyali",
    { type: "full_language_course", modes: ["tutor", "skillTree", "flashcards"], levels: PROFICIENCY_LEVELS, scope: "one_language", cumulative: true }),
  goal("robots_full_curriculum_v4", robots, "builder", "fullRobots", "fullRobots",
    { type: "full_coding_course", metrics: ["course_steps", "chapters", "review_videos", "review_checklists"], scope: "one_course" }),
  // Append new protocol slots; keep every existing number and orb identity.
  ...[["tutor_lessons", "voice", "tutorCount"], ["skill_tree_lessons", "journey", "skillTreeCount"], ["flashcards_completed", "memory", "flashcardsCount"]]
    .flatMap(([metric, family, name]) => counts(piyali, family, metric, name, LESSON_COUNT_THRESHOLDS, "learningCount",
      ["beginner", "beginner", "beginner", "intermediate", "intermediate", "advanced", "advanced"])),
  ...counts(robots, "builder", "solved_questions", "questionsCount", QUESTION_COUNT_THRESHOLDS, "questionsCount",
    ["beginner", "beginner", "intermediate", "advanced"]),
  ...counts(piyali, "voice", "conversation_goals", "conversationsCount", CONVERSATION_COUNT_THRESHOLDS, "conversationCount",
    ["beginner", "beginner", "intermediate", "advanced", "advanced"]),
  ...CODING_CHAPTERS.flatMap(({ group, number }) => [
    goal(`robots_chapter_${number}_complete`, robots, "builder", `chapter${number}`, "chapterComplete",
      { type: "chapter_completion", metric: "chapters", chapter: group, scope: "one_course" },
      number < 2 ? "beginner" : number < 4 ? "intermediate" : "advanced", { chapterNumber: number }),
    goal(`robots_chapter_${number}_review`, robots, "builder", `chapterReview${number}`, "chapterReview",
      { type: "chapter_review", metric: "review_checklists", chapter: group, scope: "one_course" },
      number < 2 ? "beginner" : number < 4 ? "intermediate" : "advanced", { chapterNumber: number }),
  ]),
];
