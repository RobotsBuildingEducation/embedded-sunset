// Shared with embedded-sunset. IDs and slots are permanent protocol data.
import { PROGRESSION_ACHIEVEMENTS } from "./progression.js";
import { ACHIEVEMENT_SLOTS } from "./slots.js";
import { achievementOrbTheme } from "./orbThemes.js";
import { proficiencyIndex, tutorLevelFromCompletions } from "./proficiencyCompletion.js";

export const CATALOG_VERSION = 8;
export const TIERS = ["beginner", "intermediate", "advanced", "completion"];
export const ACHIEVEMENT_LOCALES = ["en", "es", "pt", "it", "fr", "de", "ja", "hi", "ar", "zh"];

const TUTOR_REACH_AWARDS = [
  {
    "id": "tutor_reach_a2",
    "path": "tutor_sessions",
    "family": "voice",
    "tier": "beginner",
    "target": 1,
    "source": "nosabos",
    "sourceName": "Piyali",
    "challenge": "tutorLevel",
    "label": "A2",
    "requirement": {
      "metric": "tutorEarnedLevel",
      "type": "level",
      "level": "A2"
    }
  },
  {
    "id": "tutor_reach_b1",
    "path": "tutor_sessions",
    "family": "voice",
    "tier": "intermediate",
    "target": 1,
    "source": "nosabos",
    "sourceName": "Piyali",
    "challenge": "tutorLevel",
    "label": "B1",
    "requirement": {
      "metric": "tutorEarnedLevel",
      "type": "level",
      "level": "B1"
    }
  },
  {
    "id": "tutor_reach_b2",
    "path": "tutor_sessions",
    "family": "voice",
    "tier": "advanced",
    "target": 1,
    "source": "nosabos",
    "sourceName": "Piyali",
    "challenge": "tutorLevel",
    "label": "B2",
    "requirement": {
      "metric": "tutorEarnedLevel",
      "type": "level",
      "level": "B2"
    }
  }
];
const CAPSTONE = {
  "id": "two_worlds_complete_v4",
  "path": "course_completion",
  "family": "completion",
  "tier": "completion",
  "target": 1,
  "source": "shared",
  "sourceName": "Piyali + Robots Building Education",
  "requirement": {
    "type": "collection",
    "all": [
      "piyali_full_curriculum_v4",
      "robots_full_curriculum_v4"
    ]
  }
};

// Only evidenced learning completion belongs to the current transcript.
// Old records stay in storage and Nostr events, outside this active catalog.
const catalog = [
  ...TUTOR_REACH_AWARDS, CAPSTONE, ...PROGRESSION_ACHIEVEMENTS,
];
export const ACHIEVEMENTS = Object.fromEntries(catalog.map(goal => {
  const slot = ACHIEVEMENT_SLOTS[goal.id];
  if (!slot) throw new Error(`Missing permanent achievement slot: ${goal.id}`);
  return [goal.id, { ...goal, ...slot, orb: { ...slot.orb, palette: achievementOrbTheme(goal, catalog) } }];
}));

export const TUTOR_LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
export function earnedTutorAchievementIds(level) {
  const index = TUTOR_LEVELS.indexOf(level);
  return Object.values(ACHIEVEMENTS).filter(item => item.requirement.type === "level" &&
    index >= TUTOR_LEVELS.indexOf(item.requirement.level)).map(item => item.id);
}

export function hasEarnedRequirement(unlocked, ids) {
  return ids.length > 0 && ids.every(id => Number.isFinite(unlocked[id]?.unlockedAt) && unlocked[id].unlockedAt > 0 && !unlocked[id].test);
}

export function completeCollectionAwards(unlocked) {
  let result = unlocked;
  // Recover earlier milestones from existing genuine awards on either host.
  // This needs no rescan of learning history and never fabricates lesson counts.
  for (const [id, record] of Object.entries(unlocked)) {
    const earned = ACHIEVEMENTS[id];
    if (!earned || !hasEarnedRequirement(unlocked, [id])) continue;
    const requirement = earned.requirement;
    const tutorLevel = requirement.type === "level_set" && requirement.metric === "tutor"
      ? tutorLevelFromCompletions({ [requirement.level]: { isComplete: true } })
      : id === "piyali_full_curriculum_v4" ? "C2" : null;
    for (const item of Object.values(ACHIEVEMENTS)) {
      const candidate = item.requirement;
      const sameLadder = ["level_set", "level_counter", "level"].includes(requirement.type) &&
        candidate.type === requirement.type && candidate.metric === requirement.metric &&
        proficiencyIndex(candidate.level) >= 0 && proficiencyIndex(candidate.level) <= proficiencyIndex(requirement.level);
      const fullCourseTrack = id === "piyali_full_curriculum_v4" && candidate.type === "level_set" &&
        requirement.modes.includes(candidate.metric);
      const tutorReach = tutorLevel && candidate.type === "level" && candidate.metric === "tutorEarnedLevel" &&
        proficiencyIndex(candidate.level) <= proficiencyIndex(tutorLevel);
      if (!(sameLadder || fullCourseTrack || tutorReach) || hasEarnedRequirement(result, [item.id])) continue;
      result = { ...result, [item.id]: {
        unlockedAt: record.unlockedAt, source: item.source, catalogVersion: CATALOG_VERSION,
      } };
    }
  }
  for (const item of Object.values(ACHIEVEMENTS).filter(item => item.requirement.type === "collection")) {
    if (hasEarnedRequirement(result, [item.id]) || !hasEarnedRequirement(result, item.requirement.all)) continue;
    result = { ...result, [item.id]: {
      unlockedAt: Math.max(...item.requirement.all.map(id => result[id].unlockedAt)),
      source: item.source, catalogVersion: CATALOG_VERSION,
    } };
  }
  return result;
}

export const SORTED_ACHIEVEMENTS = Object.values(ACHIEVEMENTS).sort((a, b) => a.number - b.number);

export function normalizeAchievementLocale(value = "en") {
  const parts = String(value).toLowerCase().replaceAll("_", "-").split("-");
  // Robots uses course IDs such as py-en, swift-en and android-en.
  if (["py", "swift", "android", "compsci"].includes(parts[0])) return parts.includes("es") ? "es" : "en";
  return ACHIEVEMENT_LOCALES.includes(parts[0]) ? parts[0] : "en";
}

export function collectionProgress(unlocked = {}) {
  return Object.fromEntries(TIERS.map(tier => {
    const items = SORTED_ACHIEVEMENTS.filter(item => item.tier === tier);
    return [tier, { total: items.length, collected: items.filter(item => unlocked[item.id]).length }];
  }));
}

export function hasCompletedCourses(unlocked = {}) {
  return hasEarnedRequirement(unlocked, ACHIEVEMENTS.two_worlds_complete_v4.requirement.all);
}

// Keep old records in storage and relay events without treating unrelated
// prototype awards as evidence of these new requirements.
export function isCatalogAchievement(id) { return Object.hasOwn(ACHIEVEMENTS, id); }
