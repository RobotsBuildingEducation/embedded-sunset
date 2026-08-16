export const getProgressRoute = (step, fallback = "/q/0") => {
  if (step === "award") {
    return "/award";
  }

  if (step === "subscription") {
    return "/subscription";
  }

  const numericStep =
    typeof step === "number"
      ? step
      : typeof step === "string" && step.trim() !== ""
        ? Number(step)
        : Number.NaN;

  if (Number.isInteger(numericStep) && numericStep >= 0) {
    return `/q/${numericStep}`;
  }

  return fallback;
};

export const getContinuingQuestionNumber = (
  authoredQuestionCount,
  continuingQuestionCount,
) => {
  const authoredCount = Number(authoredQuestionCount);
  const continuingCount = Number(continuingQuestionCount);

  if (
    !Number.isInteger(authoredCount) ||
    authoredCount < 1 ||
    !Number.isInteger(continuingCount) ||
    continuingCount < 1
  ) {
    return null;
  }

  return authoredCount - 1 + continuingCount;
};

export const getContinuingQuestionRoute = (
  authoredQuestionCount,
  continuingQuestionCount,
  fallback = "/award",
) => {
  const questionNumber = getContinuingQuestionNumber(
    authoredQuestionCount,
    continuingQuestionCount,
  );

  return questionNumber === null ? fallback : `/q/${questionNumber}`;
};
