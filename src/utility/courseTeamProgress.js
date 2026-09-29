import { steps, loot } from "./content";
import { translation } from "./translation";

const catalog = steps.en || [];
const groups = [
  ...new Set(
    catalog
      .map((step) => String(step.group))
      .filter((group) => group !== "introduction"),
  ),
];
const asCount = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null;

export const clampPercent = (value) =>
  Math.max(0, Math.min(100, Number(value) || 0));
export const courseChapterIds = groups;

export function chapterTitle(id, language = "en") {
  const locale = language?.startsWith("es") ? "es" : "en";
  const chapterNumber = id === "tutorial" ? 0 : Number(id);
  return (
    translation[locale]?.[`onboarding.chapter${chapterNumber}.title`] ||
    (locale === "es" ? `Capítulo ${id}` : `Chapter ${id}`)
  );
}

export function makeCourseProgressSnapshot(data = {}, now = new Date()) {
  const answered = new Set(
    (Array.isArray(data.answeredStepIds) ? data.answeredStepIds : []).map(
      Number,
    ),
  );
  const chapters = groups.map((id) => {
    const indexes = catalog.flatMap((step, index) =>
      String(step.group) === id ? [index] : [],
    );
    return {
      id,
      completed: indexes.filter((index) => answered.has(index)).length,
      total: indexes.length,
    };
  });
  const completed = chapters.reduce(
    (sum, chapter) => sum + chapter.completed,
    0,
  );
  const total = chapters.reduce((sum, chapter) => sum + chapter.total, 0);
  const step = asCount(data.step);
  const activeGroup =
    step !== null && catalog[step] ? String(catalog[step].group) : null;
  const currentChapterId = groups.includes(activeGroup) ? activeGroup : null;
  const currentChapter = chapters.find(
    (chapter) => chapter.id === currentChapterId,
  );
  const target = asCount(data.dailyGoals);
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const dailyCompleted =
    data.teamDailyGoalDate === localDate
      ? asCount(data.teamDailyGoalCompleted)
      : 0;
  return {
    schemaVersion: 1,
    name: typeof data.name === "string" ? data.name : "",
    currentChapterId,
    chapterProgress: currentChapter || null,
    chapters,
    courseProgress: {
      completed,
      total,
      percent:
        total > 0 ? clampPercent(Math.round((completed / total) * 100)) : null,
    },
    dailyGoal: {
      completed: dailyCompleted,
      target,
      unit: "questions",
      localDate,
    },
    updatedAt: Math.floor(now.getTime() / 1000),
  };
}

// The course's projected salary value is shown only for the signed-in learner.
// It is deliberately excluded from the public course-progress event.
export function ownSalaryValue(data = {}) {
  const answered = Array.isArray(data.answeredStepIds)
    ? data.answeredStepIds.map(Number)
    : [];
  const latest = Math.max(-1, ...answered.filter(Number.isInteger));
  const amount = loot[latest]?.monetaryValue;
  return Number.isFinite(amount) && amount > 0
    ? { amount, currency: "USD", period: "year" }
    : null;
}
