export const BASE_QUESTION_COUNT = 4200;

// The database counter records answers after the historical baseline.
export const getTotalQuestionsAnswered = (count) => {
  if (!Number.isSafeInteger(count) || count < 0) return null;
  const total = BASE_QUESTION_COUNT + count;
  return Number.isSafeInteger(total) ? total : null;
};
