import { PROFICIENCY_LEVELS } from "./progression.js";

export const proficiencyKey = level => String(level).toLowerCase().replaceAll("-", "_");
export const proficiencyIndex = level => PROFICIENCY_LEVELS.findIndex(candidate => proficiencyKey(candidate) === proficiencyKey(level));

export function atOrAboveProficiency(level, predicate) {
  const index = proficiencyIndex(level);
  return index >= 0 && PROFICIENCY_LEVELS.slice(index).some(predicate);
}

// Placement chooses the starting point; completed work proves an earned level.
// A complete higher level also proves the earlier levels in that same track.
export function tutorLevelFromCompletions(status) {
  let unlocked = PROFICIENCY_LEVELS[0];
  for (let i = 0; i < PROFICIENCY_LEVELS.length; i++) {
    if (status?.[PROFICIENCY_LEVELS[i]]?.isComplete === true) {
      unlocked = PROFICIENCY_LEVELS[Math.min(i + 1, PROFICIENCY_LEVELS.length - 1)];
    }
  }
  return unlocked;
}
