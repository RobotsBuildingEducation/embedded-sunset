import { TIERS, TUTOR_LEVELS } from "./catalog.js";

// Presentation order is independent of permanent protocol IDs and slot numbers.
export const TRANSCRIPT_CATEGORIES = [
  "tutor", "skillTree", "flashcards", "conversations", "goals", "repairs",
  "phonics", "immersion", "chapters", "reviews", "questions", "courseCompletion",
];

const METRIC_CATEGORIES = {
  tutorEarnedLevel: "tutor", tutor: "tutor", tutor_lessons: "tutor",
  skillTree: "skillTree", skill_tree_lessons: "skillTree",
  flashcards: "flashcards", flashcards_completed: "flashcards",
  conversation_goals: "conversations", goals: "goals", repairs: "repairs",
  phonics_cards: "phonics", phonics_decks: "phonics",
  immersion_checklists: "immersion", immersion_tasks: "immersion",
  chapters: "chapters", review_videos: "reviews", review_checklists: "reviews",
  solved_questions: "questions", post_course_questions: "questions",
};

// Keep each series together across difficulty tiers. Use requirement metadata,
// not translated titles, earned timestamps, or the currently visible subset.
const CATEGORY_SERIES = {
  tutor: ["tutor:level_set", "tutorEarnedLevel:level", "tutor_lessons:counter"],
  skillTree: ["skillTree:level_set", "skill_tree_lessons:counter"],
  flashcards: ["flashcards:level_set", "flashcards_completed:counter"],
  conversations: ["conversation_goals:counter"],
  goals: ["goals:level_counter"],
  repairs: ["repairs:level_counter"],
  phonics: ["phonics_decks:counter", "phonics_cards:complete_set"],
  immersion: ["immersion_checklists:counter", "immersion_tasks:counter"],
  chapters: ["chapters:chapter_completion", "chapters:counter", "chapters:complete_set"],
  reviews: ["review_checklists:chapter_review", "review_videos:counter", "review_videos:complete_set", "review_checklists:counter", "review_checklists:complete_set"],
  questions: ["solved_questions:counter", "post_course_questions:counter"],
  courseCompletion: [":full_language_course", ":full_coding_course", ":collection"],
};

function seriesRank(item) {
  const { metric = "", type } = item.requirement;
  const rank = CATEGORY_SERIES[transcriptCategory(item)].indexOf(`${metric}:${type}`);
  if (rank < 0) throw new Error(`Missing transcript series: ${item.id}`);
  return rank;
}

export function transcriptCategory(item) {
  const { type, metric } = item.requirement;
  if (["collection", "full_language_course", "full_coding_course"].includes(type)) return "courseCompletion";
  const category = METRIC_CATEGORIES[metric];
  if (!category) throw new Error(`Missing transcript category: ${item.id}`);
  return category;
}

function compareDifficulty(a, b) {
  const levelRank = item => {
    const rank = TUTOR_LEVELS.indexOf(item.level || item.requirement.level);
    return rank < 0 ? TUTOR_LEVELS.length : rank;
  };
  return TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) ||
    levelRank(a) - levelRank(b) ||
    (a.chapterNumber ?? Infinity) - (b.chapterNumber ?? Infinity) ||
    a.target - b.target || a.number - b.number;
}

export function groupTranscriptAchievements(items) {
  return TRANSCRIPT_CATEGORIES.flatMap(category => {
    const categoryItems = items.filter(item => transcriptCategory(item) === category);
    if (!categoryItems.length) return [];
    return [{ category, items: categoryItems.sort((a, b) =>
      seriesRank(a) - seriesRank(b) || compareDifficulty(a, b)) }];
  });
}

// Keep discovery tiles out of the unlocked section before applying display sorting.
export function transcriptSections(items, unlocked = {}) {
  return ["unlocked", "locked"].map(status => {
    const sectionItems = items.filter(item => Boolean(unlocked[item.id]) === (status === "unlocked"));
    return { status, count: sectionItems.length, groups: groupTranscriptAchievements(sectionItems) };
  });
}
