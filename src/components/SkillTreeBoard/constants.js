export const CHAPTER_MAP_EXCLUDED_GROUPS = new Set([
  "0",
  0,
  "introduction",
]);

export const shouldShowChapterIntro = (groupId) => {
  if (!groupId && groupId !== 0) {
    return false;
  }

  return !CHAPTER_MAP_EXCLUDED_GROUPS.has(groupId);
};
