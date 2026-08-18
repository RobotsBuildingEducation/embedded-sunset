export const QUESTION_TYPE_DEFINITIONS = [
  { key: "multipleChoice", flag: "isMultipleChoice", label: "Multiple choice" },
  {
    key: "multipleAnswer",
    flag: "isMultipleAnswerChoice",
    label: "Multiple answer",
  },
  { key: "selectOrder", flag: "isSelectOrder", label: "Select order" },
  {
    key: "codeCompletion",
    flag: "isCodeCompletion",
    label: "Code completion",
  },
  { key: "codeWriting", flag: "isCode", label: "Code writing" },
  { key: "terminal", flag: "isTerminal", label: "Terminal practice" },
  {
    key: "shortAnswer",
    flag: "isSingleLineText",
    label: "Short answer",
  },
  { key: "openResponse", flag: "isText", label: "Open response" },
  { key: "codeTracing", flag: "isCodeTracing", label: "Code tracing" },
  {
    key: "fillCodeBlanks",
    flag: "isFillCodeBlanks",
    label: "Fill in the code blanks",
  },
  { key: "parsons", flag: "isParsonsProblem", label: "Parsons problem" },
  { key: "matchPairs", flag: "isMatchPairs", label: "Match the pairs" },
  {
    key: "relevantLine",
    flag: "isRelevantLine",
    label: "Find the relevant line",
  },
  {
    key: "bestImplementation",
    flag: "isBestImplementation",
    label: "Choose the best implementation",
  },
  { key: "fixBug", flag: "isFixBug", label: "Fix the bug" },
  {
    key: "refactoring",
    flag: "isRefactoringChallenge",
    label: "Refactoring challenge",
  },
  {
    key: "conversationReview",
    flag: "isConversationReview",
    label: "AI conversation review",
  },
];

export const NEW_QUESTION_FLAGS = [
  "isCodeTracing",
  "isFillCodeBlanks",
  "isParsonsProblem",
  "isMatchPairs",
  "isRelevantLine",
  "isBestImplementation",
  "isFixBug",
  "isRefactoringChallenge",
];

export const getQuestionType = (step) => {
  if (!step || typeof step !== "object") return "unknown";
  if (step.isTerminal || (step.isCode && step.isTerminal)) return "terminal";
  const definition = QUESTION_TYPE_DEFINITIONS.find(({ flag }) => step[flag]);
  return definition?.key || (step.isStudyGuide ? "studyGuide" : "unknown");
};

export const isNewQuestionType = (step) =>
  NEW_QUESTION_FLAGS.some((flag) => Boolean(step?.[flag]));

export const scrambleArray = (arr) => {
  if (!Array.isArray(arr) || arr.length <= 1) return [...(arr || [])];
  let shuffled = [...arr];
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const isDifferent = shuffled.some((item, idx) => item !== arr[idx]);
    if (isDifferent) return shuffled;
  }
  return [...shuffled.slice(1), shuffled[0]];
};

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/[ \t]+/g, " ");

const compareArrays = (submitted, expected, orderMatters = true) => {
  if (!Array.isArray(submitted) || !Array.isArray(expected)) return false;
  if (submitted.length !== expected.length) return false;
  const left = submitted.map(normalizeText);
  const right = expected.map(normalizeText);
  if (orderMatters) return left.every((value, index) => value === right[index]);
  return [...left]
    .sort()
    .every((value, index) => value === [...right].sort()[index]);
};

const compareObjects = (submitted, expected) => {
  if (
    !submitted ||
    !expected ||
    Array.isArray(submitted) ||
    Array.isArray(expected)
  ) {
    return false;
  }
  const expectedKeys = Object.keys(expected);
  if (Object.keys(submitted).length !== expectedKeys.length) return false;
  return expectedKeys.every(
    (key) => normalizeText(submitted[key]) === normalizeText(expected[key]),
  );
};

// Returns null when the mode needs rubric/AI grading rather than an exact check.
export const gradeStructuredQuestion = (step, submittedAnswer) => {
  const type = getQuestionType(step);
  const expected = step?.question?.answer;

  switch (type) {
    case "codeTracing":
    case "bestImplementation":
      return normalizeText(submittedAnswer) === normalizeText(expected);
    case "fillCodeBlanks":
    case "matchPairs":
      return compareObjects(submittedAnswer, expected);
    case "parsons":
      return compareArrays(submittedAnswer, expected, true);
    case "relevantLine": {
      const submitted = Array.isArray(submittedAnswer)
        ? submittedAnswer
        : [submittedAnswer];
      const correct = Array.isArray(expected) ? expected : [expected];
      return compareArrays(submitted, correct, false);
    }
    case "fixBug": {
      const accepted = step?.question?.acceptedAnswers;
      if (Array.isArray(accepted) && accepted.length) {
        return accepted.some(
          (candidate) =>
            normalizeText(candidate) === normalizeText(submittedAnswer),
        );
      }
      return typeof expected === "string"
        ? normalizeText(submittedAnswer) === normalizeText(expected)
        : null;
    }
    default:
      return null;
  }
};

export const countQuestionTypes = (
  courseSteps,
  { includeTutorial = true } = {},
) =>
  courseSteps.reduce((counts, step) => {
    if (!includeTutorial && step?.group === "tutorial") return counts;
    const type = getQuestionType(step);
    if (type === "studyGuide" || type === "unknown") return counts;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
