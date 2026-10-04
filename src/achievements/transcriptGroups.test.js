import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS, ACHIEVEMENT_LOCALES, TIERS } from "./catalog.js";
import { CATEGORY_COPY, localizeAchievement } from "./copy.js";
import { TRANSCRIPT_CATEGORIES, groupTranscriptAchievements, transcriptCategory, transcriptSections } from "./transcriptGroups.js";

test("each host transcript groups every active award exactly once by category and difficulty", () => {
  for (const source of ["nosabos", "robotsbuildingeducation"]) {
    const items = Object.values(ACHIEVEMENTS).filter(item => [source, "shared"].includes(item.source));
    const before = items.map(item => item.id);
    const groups = groupTranscriptAchievements(items);
    const flattened = groups.flatMap(group => group.tiers.flatMap(tier => tier.items));
    assert.equal(new Set(flattened.map(item => item.id)).size, items.length);
    assert.deepEqual(flattened.map(item => item.id).sort(), [...before].sort());
    assert.deepEqual(items.map(item => item.id), before);
    assert.deepEqual(groups.map(group => group.category), TRANSCRIPT_CATEGORIES.filter(category => items.some(item => transcriptCategory(item) === category)));
    for (const group of groups) {
      assert.deepEqual(group.tiers.map(tier => tier.tier), TIERS.filter(tier => items.some(item => transcriptCategory(item) === group.category && item.tier === tier)));
      for (const tier of group.tiers) assert.ok(tier.items.every(item => transcriptCategory(item) === group.category && item.tier === tier.tier));
    }
    assert.equal(groups.at(-1).category, "courseCompletion");
    assert.equal(groups.at(-1).tiers.at(-1).items[0].id, "two_worlds_complete_v4");
    assert.deepEqual(groupTranscriptAchievements([...items].reverse()), groups);
  }
  assert.deepEqual(groupTranscriptAchievements([]), []);
});

test("levels, chapter numbers and milestone targets progress within their difficulty", () => {
  const items = Object.values(ACHIEVEMENTS);
  const groups = groupTranscriptAchievements(items);
  const select = (category, tier, metric) => groups.find(group => group.category === category).tiers.find(group => group.tier === tier).items.filter(item => item.requirement.metric === metric);
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
    assert.equal(groupTranscriptAchievements(Object.values(ACHIEVEMENTS).map(item => localizeAchievement(item, locale))).flatMap(group => group.tiers.flatMap(tier => tier.items)).length, 104);
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
  const flatten = section => section.groups.flatMap(group => group.tiers.flatMap(tier => tier.items));
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
