import { PLAYGROUND_PALETTES, PLAYGROUND_FLOW, PLAYGROUND_EXPRESSIONS, PLAYGROUND_REACTION_DURATIONS } from "./orbPresets.js";
import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS, ACHIEVEMENT_LOCALES, TIERS, CATALOG_VERSION, collectionProgress, completeCollectionAwards, earnedTutorAchievementIds, hasCompletedCourses, normalizeAchievementLocale } from "./catalog.js";
import { UI_COPY, TUTOR_REACH_COPY, FAMILY_COPY, localizeAchievement } from "./copy.js";
import { PROGRESSION_NAMES, PROGRESSION_TASKS } from "./progressionCopy.js";
import { ACHIEVEMENT_COLOR_STAGES } from "./orbThemes.js";

test("completion-only catalog has 104 learning awards with reserved permanent slots", () => {
  const items = Object.values(ACHIEVEMENTS);
  assert.equal(items.length, 104);
  assert.deepEqual(TIERS.map(tier => items.filter(item => item.tier === tier).length), [40,28,35,1]);
  assert.equal(new Set(items.map(item => item.number)).size, 104);
  assert.equal(items.filter(item => item.source === "nosabos").length, 75);
  assert.equal(items.filter(item => item.source === "robotsbuildingeducation").length, 28);
  assert.ok(items.every(item => item.progression || item.requirement.type === "level" || item.family === "completion"));
  const allowedMetrics = new Set(["tutor", "skillTree", "flashcards", "goals", "repairs", "phonics_cards", "phonics_decks", "immersion_checklists", "immersion_tasks", "chapters", "review_videos", "review_checklists", "post_course_questions", "tutor_lessons", "skill_tree_lessons", "flashcards_completed", "solved_questions", "conversation_goals", "tutorEarnedLevel"]);
  assert.ok(items.every(item => !item.requirement.metric || allowedMetrics.has(item.requirement.metric)));
  for (const id of ["conversation_turns_beginner", "conversation_repairs_beginner", "rhythm_collection_v4", "discovery_collection_v4", "explained_fixes_advanced_v3", "nosabos_session_timers_1", "nosabos_spent_sats_1000", "piyali_pet_first_unlock", "robotsbuildingeducation_calendar_streak_3"]) assert.equal(ACHIEVEMENTS[id], undefined);
});

test("every displayed title, requirement and UI string is authored for all ten locales", () => {
  const groups = [UI_COPY, FAMILY_COPY, TUTOR_REACH_COPY, PROGRESSION_NAMES, PROGRESSION_TASKS];
  for (const group of groups) for (const [key, translations] of Object.entries(group)) {
    assert.deepEqual(Object.keys(translations), ACHIEVEMENT_LOCALES, key);
    for (const locale of ACHIEVEMENT_LOCALES) assert.ok(typeof translations[locale] === "string" && translations[locale].trim(), `${key}: ${locale}`);
  }
  for (const locale of ACHIEVEMENT_LOCALES) {
    const localized = Object.values(ACHIEVEMENTS).map(item => localizeAchievement(item, locale));
    assert.equal(new Set(localized.map(item => item.title)).size, itemsCount(), locale);
    assert.ok(localized.every(item => item.title && item.desc && !/[{}]|undefined/.test(item.title + item.desc) && item.tierTitle && item.familyTitle));
  }
  assert.equal(normalizeAchievementLocale("es-MX"), "es");
  assert.equal(normalizeAchievementLocale("pt_BR"), "pt");
  for (const course of ["py-en", "swift-en", "android-en", "compsci-en"]) assert.equal(normalizeAchievementLocale(course), "en");
  assert.equal(normalizeAchievementLocale("py-es"), "es");
  assert.equal(normalizeAchievementLocale(null), "en");
});

test("the shared capstone requires both real course completions", () => {
  const language = { unlockedAt: 1 };
  const coding = { unlockedAt: 2 };
  assert.equal(hasCompletedCourses({ piyali_full_curriculum_v4: language }), false);
  assert.equal(hasCompletedCourses({ robots_full_curriculum_v4: coding }), false);
  const both = { piyali_full_curriculum_v4: language, robots_full_curriculum_v4: coding };
  assert.equal(hasCompletedCourses(both), true);
  for (const id of Object.keys(both)) assert.equal(hasCompletedCourses({ ...both, [id]: { ...both[id], test: true } }), false);
  const completed = completeCollectionAwards(both);
  assert.equal(completed.two_worlds_complete_v4.unlockedAt, 2);
  assert.equal(completed.two_worlds_complete_v4.source, "shared");
  assert.equal(hasCompletedCourses({course_completion:{unlockedAt:1}}), false);
  assert.equal(hasCompletedCourses({}), false);
});

test("legacy and unknown IDs are preserved by transport but do not inflate collection progress", () => {
  const progress = collectionProgress({first_words:{unlockedAt:1}, unknown:{unlockedAt:1}, words_recalled_beginner:{unlockedAt:1}, tutor_sessions_beginner:{unlockedAt:1}, bug_fixes_advanced:{unlockedAt:1}});
  assert.deepEqual(progress.beginner, {total:Object.values(ACHIEVEMENTS).filter(item=>item.tier === "beginner").length, collected:0});
  assert.equal(Object.values(progress).reduce((sum, value)=>sum+value.collected,0),0);
});

test("all rewards use distinct deterministic /orbing presets", () => {
  const items = Object.values(ACHIEVEMENTS);
  assert.equal(new Set(items.map(item => JSON.stringify([item.orb.palette,item.orb.state,item.orb.mood,item.orb.reaction]))).size,104);
  for (const {orb} of items) {
    assert.ok([...PLAYGROUND_PALETTES, ...ACHIEVEMENT_COLOR_STAGES].some(p=>p.id===orb.palette));
    assert.ok(PLAYGROUND_FLOW[orb.state]);
    assert.ok(PLAYGROUND_EXPRESSIONS[orb.mood]);
    assert.ok(PLAYGROUND_REACTION_DURATIONS[orb.reaction]);
  }
  assert.equal(new Set(Object.values(PLAYGROUND_FLOW).map(f=>f.pattern)).size,20);
});

test("tutor milestones require curriculum-earned levels and include B2", () => {
  assert.deepEqual(earnedTutorAchievementIds("A1"), []);
  assert.deepEqual(earnedTutorAchievementIds("A2"), ["tutor_reach_a2"]);
  assert.deepEqual(earnedTutorAchievementIds("B1"), ["tutor_reach_a2", "tutor_reach_b1"]);
  for (const level of ["B2", "C1", "C2"]) assert.deepEqual(earnedTutorAchievementIds(level), ["tutor_reach_a2", "tutor_reach_b1", "tutor_reach_b2"]);
  for (const level of [null, "b2", "unknown", 57]) assert.deepEqual(earnedTutorAchievementIds(level), []);
});

test("every collection prerequisite is an active completion award", () => {
  const collections = Object.values(ACHIEVEMENTS).filter(item => item.requirement.all);
  assert.deepEqual(collections.map(item => item.id), ["two_worlds_complete_v4"]);
  for (const item of collections) assert.ok(item.requirement.all.every(id => ACHIEVEMENTS[id]?.progression));
});

function itemsCount() { return Object.keys(ACHIEVEMENTS).length; }
