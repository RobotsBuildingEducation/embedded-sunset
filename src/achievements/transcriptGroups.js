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
  return levelRank(a) - levelRank(b) ||
    (a.chapterNumber ?? Infinity) - (b.chapterNumber ?? Infinity) ||
    a.target - b.target || a.number - b.number;
}

export function groupTranscriptAchievements(items) {
  return TRANSCRIPT_CATEGORIES.flatMap(category => {
    const categoryItems = items.filter(item => transcriptCategory(item) === category);
    if (!categoryItems.length) return [];
    return [{ category, tiers: TIERS.flatMap(tier => {
      const tierItems = categoryItems.filter(item => item.tier === tier).sort(compareDifficulty);
      return tierItems.length ? [{ tier, items: tierItems }] : [];
    }) }];
  });
}

// Keep discovery tiles out of the unlocked section before applying display sorting.
export function transcriptSections(items, unlocked = {}) {
  return ["unlocked", "locked"].map(status => {
    const sectionItems = items.filter(item => Boolean(unlocked[item.id]) === (status === "unlocked"));
    return { status, count: sectionItems.length, groups: groupTranscriptAchievements(sectionItems) };
  });
}
