// Achievement-only palettes: each pigment stays within its color family.
// The Tutor and /orbing playground keep their existing palettes.
export const ACHIEVEMENT_COLOR_STAGES = [
  { id: "award-blue", name: "Blue", swatch: "#539dff", colors: ["#133c89", "#539dff", "#d5eaff"] },
  { id: "award-cyan", name: "Cyan", swatch: "#39c7df", colors: ["#095f7c", "#39c7df", "#c9f5ff"] },
  { id: "award-jade", name: "Jade", swatch: "#38ca98", colors: ["#125f47", "#38ca98", "#c6f7dc"] },
  { id: "award-violet", name: "Violet", swatch: "#a183ee", colors: ["#49307d", "#a183ee", "#e9dcff"] },
  { id: "award-rose", name: "Rose", swatch: "#eb80ad", colors: ["#7f3153", "#eb80ad", "#ffe0ed"] },
  { id: "award-amber", name: "Amber", swatch: "#f3a74c", colors: ["#89521b", "#f3a74c", "#ffead0"] },
  { id: "award-gold", name: "Gold", swatch: "#f3cf58", colors: ["#887023", "#f3cf58", "#fff4c5"] },
].map((stage, index) => ({ ...stage, material: {
  roughness: index === 6 ? 0.22 : 0.3,
  metalness: index === 6 ? 0.55 : index === 5 ? 0.3 : 0.12,
  clearcoat: 0.9,
} }));

const LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
export const PROFICIENCY_ORB_THEMES = Object.fromEntries(LEVELS.map((level, index) => [level, ACHIEVEMENT_COLOR_STAGES[index].id]));
const SEQUENCE_STAGES = {
  1: [0], 2: [0, 6], 3: [0, 3, 6], 4: [0, 2, 4, 6],
  5: [0, 2, 3, 5, 6], 6: [0, 1, 2, 3, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6],
};
const sequenceTheme = (index, length) => ACHIEVEMENT_COLOR_STAGES[
  SEQUENCE_STAGES[length]?.[index] ?? Math.round(index * 6 / Math.max(1, length - 1))
].id;

export function achievementOrbTheme(achievement, catalog) {
  const requirement = achievement.requirement;
  const levelTheme = PROFICIENCY_ORB_THEMES[achievement.level || requirement.level];
  if (levelTheme) return levelTheme;
  if (achievement.chapterNumber !== undefined) {
    const chapters = [...new Set(catalog.filter(item => item.chapterNumber !== undefined).map(item => item.chapterNumber))].sort((a, b) => a - b);
    return sequenceTheme(chapters.indexOf(achievement.chapterNumber), chapters.length);
  }
  if (["complete_set", "full_language_course", "full_coding_course", "collection"].includes(requirement.type)) return "award-gold";
  if (requirement.type === "counter") {
    const peers = catalog.filter(item => item.source === achievement.source && item.requirement.type === "counter" && item.requirement.metric === requirement.metric)
      .sort((a, b) => a.target - b.target);
    return sequenceTheme(peers.findIndex(item => item.id === achievement.id), peers.length);
  }
  return { beginner: "award-blue", intermediate: "award-violet", advanced: "award-gold", completion: "award-gold" }[achievement.tier];
}
