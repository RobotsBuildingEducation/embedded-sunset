export const CHAPTER_MAP_EXCLUDED_GROUPS = new Set([
  "introduction",
]);

export const shouldShowChapterIntro = (groupId) => {
  if (groupId === undefined || groupId === null || groupId === "") {
    return false;
  }

  const normalized = String(groupId);

  return (
    !CHAPTER_MAP_EXCLUDED_GROUPS.has(groupId) &&
    !CHAPTER_MAP_EXCLUDED_GROUPS.has(normalized)
  );
};
