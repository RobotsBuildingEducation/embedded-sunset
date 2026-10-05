import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS, ACHIEVEMENT_LOCALES } from "./catalog.js";
import { CATEGORY_COPY, localizeAchievement } from "./copy.js";
import { TRANSCRIPT_CATEGORIES, groupTranscriptAchievements, transcriptCategory, transcriptSections } from "./transcriptGroups.js";

test("each host transcript groups every active award exactly once by category and difficulty", () => {
  for (const source of ["nosabos", "robotsbuildingeducation"]) {
    const items = Object.values(ACHIEVEMENTS).filter(item => [source, "shared"].includes(item.source));
    const before = items.map(item => item.id);
    const groups = groupTranscriptAchievements(items);
    const flattened = groups.flatMap(group => group.items);
    assert.equal(new Set(flattened.map(item => item.id)).size, items.length);
    assert.deepEqual(flattened.map(item => item.id).sort(), [...before].sort());
    assert.deepEqual(items.map(item => item.id), before);
    assert.deepEqual(groups.map(group => group.category), TRANSCRIPT_CATEGORIES.filter(category => items.some(item => transcriptCategory(item) === category)));
    for (const group of groups) {
      assert.ok(group.items.every(item => transcriptCategory(item) === group.category));
    }
    assert.equal(groups.at(-1).category, "courseCompletion");
    assert.equal(groups.at(-1).items.at(-1).id, "two_worlds_complete_v4");
    assert.deepEqual(groupTranscriptAchievements([...items].reverse()), groups);
  }
  assert.deepEqual(groupTranscriptAchievements([]), []);
});

test("levels, chapter numbers and milestone targets progress within their difficulty", () => {
  const items = Object.values(ACHIEVEMENTS);
  const groups = groupTranscriptAchievements(items);
  const select = (category, tier, metric) => groups.find(group => group.category === category).items.filter(item => item.tier === tier && item.requirement.metric === metric);
  assert.deepEqual(select("tutor", "beginner", "tutor").map(item => item.level), ["Pre-A1", "A1", "A2"]);
  assert.deepEqual(select("tutor", "beginner", "tutor_lessons").map(item => item.target), [5, 10, 20]);
  assert.deepEqual(select("chapters", "advanced", "chapters").filter(item => item.chapterNumber !== undefined).map(item => item.chapterNumber), [4, 5]);
  assert.equal(transcriptCategory(ACHIEVEMENTS.tutor_reach_b2), "tutor");
  assert.equal(transcriptCategory(ACHIEVEMENTS.robots_chapter_2_review), "reviews");
  assert.equal(transcriptCategory(ACHIEVEMENTS.robots_full_curriculum_v4), "courseCompletion");
});

test("category headings are localized for every supported transcript language", () => {
  assert.deepEqual(Object.keys(CATEGORY_COPY), TRANSCRIPT_CATEGORIES);
  for (const category of TRANSCRIPT_CATEGORIES) {
    assert.deepEqual(Object.keys(CATEGORY_COPY[category]), ACHIEVEMENT_LOCALES);
    for (const locale of ACHIEVEMENT_LOCALES) assert.ok(CATEGORY_COPY[category][locale]?.trim());
  }
  for (const locale of ACHIEVEMENT_LOCALES) {
    const localized = groupTranscriptAchievements(Object.values(ACHIEVEMENTS).map(item => localizeAchievement(item, locale))).flatMap(group => group.items);
    const original = groupTranscriptAchievements(Object.values(ACHIEVEMENTS)).flatMap(group => group.items);
    assert.equal(localized.length, 104);
    assert.deepEqual(localized.map(item => item.id), original.map(item => item.id));
  }
});


test("unlocked sections exclude locked orbs while retaining real and test awards", () => {
  const unlocked = {
    robots_chapter_0_complete: { unlockedAt: 10, test: true },
    robotsbuildingeducation_chapters_1: { unlockedAt: 20 },
    piyali_tutor_complete_a2: { unlockedAt: 30, test: true },
    nosabos_tutor_lessons_10: { unlockedAt: 40 },
    retired_award: { unlockedAt: 50 },
  };
  const flatten = section => section.groups.flatMap(group => group.items);
  for (const source of ["nosabos", "robotsbuildingeducation"]) {
    const items = Object.values(ACHIEVEMENTS).filter(item => [source, "shared"].includes(item.source));
    const sections = transcriptSections(items, unlocked);
    assert.deepEqual(sections.map(section => section.status), ["unlocked", "locked"]);
    assert.equal(sections[0].count, 2);
    assert.ok(flatten(sections[0]).every(item => unlocked[item.id]));
    assert.ok(flatten(sections[1]).every(item => !unlocked[item.id]));
    assert.equal(sections[0].count + sections[1].count, items.length);
    assert.deepEqual(sections.flatMap(flatten).map(item => item.id).sort(), items.map(item => item.id).sort());
    assert.equal(transcriptSections(items)[0].count, 0);
    const allUnlocked = Object.fromEntries(items.map(item => [item.id, { unlockedAt: 1 }]));
    assert.equal(transcriptSections(items, allUnlocked)[1].count, 0);
  }
});

test("achievement series stay together across difficulty tiers", () => {
  const groups = groupTranscriptAchievements(Object.values(ACHIEVEMENTS));
  const select = category => groups.find(group => group.category === category).items;
  assert.deepEqual(select("flashcards").map(item => item.id), [
    ...["pre_a1", "a1", "a2", "b1", "b2", "c1", "c2"].map(level => `piyali_flashcards_complete_${level}`),
    ...[5, 10, 20, 25, 50, 100, 200].map(target => `nosabos_flashcards_completed_${target}`),
  ]);
  assert.deepEqual(select("immersion").map(item => item.id), [
    ...[1, 10, 30].map(target => `nosabos_immersion_checklists_${target}`),
    ...[5, 50, 200].map(target => `nosabos_immersion_tasks_${target}`),
  ]);
  assert.deepEqual(select("chapters").map(item => item.id), [
    ...[0, 1, 2, 3, 4, 5].map(chapter => `robots_chapter_${chapter}_complete`),
    ...[1, 3, 5].map(target => `robotsbuildingeducation_chapters_${target}`),
    "robotsbuildingeducation_chapters_all",
  ]);
  assert.deepEqual(select("questions").map(item => item.id), [
    ...[10, 20, 50, 100].map(target => `robotsbuildingeducation_solved_questions_${target}`),
    ...[1, 25, 100].map(target => `robotsbuildingeducation_post_course_questions_${target}`),
  ]);
  for (const group of groups) {
    const series = group.items.map(item => `${item.requirement.metric || ""}:${item.requirement.type}`);
    const runs = series.filter((key, index) => key !== series[index - 1]);
    assert.equal(runs.length, new Set(series).size, `${group.category} must not interleave series`);
  }
});

test("earning awards in different orders preserves the order of both collections", () => {
  const ids = section => section.groups.flatMap(group => group.items.map(item => item.id));
  for (const source of ["nosabos", "robotsbuildingeducation"]) {
    const items = Object.values(ACHIEVEMENTS).filter(item => [source, "shared"].includes(item.source));
    const canonicalOrder = ids(transcriptSections(items)[1]);
    for (const earningOrder of [items, [...items].reverse()]) {
      const unlocked = {};
      for (const [index, item] of earningOrder.entries()) {
        unlocked[item.id] = { unlockedAt: 100 + index };
        // Simulate history arriving from another device in a different order.
        const history = Object.fromEntries(Object.entries(unlocked).reverse());
        const sections = transcriptSections([...items].reverse(), history);
        assert.deepEqual(ids(sections[0]), canonicalOrder.filter(id => history[id]));
        assert.deepEqual(ids(sections[1]), canonicalOrder.filter(id => !history[id]));
      }
    }
  }
});
