import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS } from "./catalog.js";
import { ACHIEVEMENT_SLOTS } from "./slots.js";
import { ACHIEVEMENT_COLOR_STAGES, PROFICIENCY_ORB_THEMES, achievementOrbTheme } from "./orbThemes.js";
import { PROFICIENCY_LEVELS } from "./progression.js";
import { CODING_CHAPTERS } from "./codingChapters.js";

test("all proficiency tracks share a blue-to-gold level theme", () => {
  assert.equal(PROFICIENCY_ORB_THEMES["Pre-A1"], "award-blue");
  assert.equal(PROFICIENCY_ORB_THEMES.C2, "award-gold");
  for (const level of PROFICIENCY_LEVELS) {
    for (const mode of ["tutor", "skillTree", "flashcards", "goals", "repairs"]) {
      const id = `piyali_${mode}_complete_${level.toLowerCase().replaceAll("-", "_")}`;
      assert.equal(ACHIEVEMENTS[id].orb.palette, PROFICIENCY_ORB_THEMES[level]);
    }
  }
  for (const level of ["A2", "B1", "B2"]) assert.equal(ACHIEVEMENTS[`tutor_reach_${level.toLowerCase()}`].orb.palette, PROFICIENCY_ORB_THEMES[level]);
});

test("each volume ladder advances by milestone order, independent of slot order", () => {
  const all = Object.values(ACHIEVEMENTS);
  const groups = new Map();
  for (const item of all.filter(item => item.requirement.type === "counter")) {
    const key = `${item.source}:${item.requirement.metric}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  }
  for (const group of groups.values()) {
    const sorted = group.sort((a,b) => a.target - b.target);
    const stages = sorted.map(item => ACHIEVEMENT_COLOR_STAGES.findIndex(stage => stage.id === item.orb.palette));
    assert.equal(stages[0], 0);
    assert.deepEqual(stages, [...new Set(stages)].sort((a,b) => a-b));
    if (sorted.length > 1) assert.equal(stages.at(-1), 6);
    for (const item of sorted) assert.equal(achievementOrbTheme(item, [...all].reverse()), item.orb.palette);
  }
  for (const n of [5,10,20,25,50,100,200]) assert.equal(ACHIEVEMENTS[`nosabos_tutor_lessons_${n}`].orb.palette, ACHIEVEMENTS[`nosabos_skill_tree_lessons_${n}`].orb.palette);
});

test("chapter completion and review share their chapter color; whole collections are gold", () => {
  const palettes = CODING_CHAPTERS.map(({number}) => {
    const complete = ACHIEVEMENTS[`robots_chapter_${number}_complete`].orb.palette;
    assert.equal(ACHIEVEMENTS[`robots_chapter_${number}_review`].orb.palette, complete);
    return complete;
  });
  assert.equal(palettes[0], "award-blue");
  assert.equal(palettes.at(-1), "award-gold");
  assert.equal(new Set(palettes).size, CODING_CHAPTERS.length);
  for (const item of Object.values(ACHIEVEMENTS).filter(item => ["complete_set","full_language_course","full_coding_course","collection"].includes(item.requirement.type))) {
    assert.equal(item.orb.palette,"award-gold",item.id);
  }
});

test("presentation changes only the palette, keeping every award and orb personality", () => {
  for (const item of Object.values(ACHIEVEMENTS)) {
    const {palette: _palette, ...personality} = item.orb;
    const {palette: _originalPalette, ...originalPersonality} = ACHIEVEMENT_SLOTS[item.id].orb;
    assert.deepEqual(personality, originalPersonality);
    assert.equal(item.number, ACHIEVEMENT_SLOTS[item.id].number);
    assert.ok(ACHIEVEMENT_COLOR_STAGES.some(stage => stage.id === item.orb.palette));
  }
  assert.ok(ACHIEVEMENT_COLOR_STAGES.at(-1).material.metalness > ACHIEVEMENT_COLOR_STAGES[0].material.metalness);
});
