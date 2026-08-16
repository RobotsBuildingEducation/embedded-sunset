import test from "node:test";
import assert from "node:assert/strict";
import {
  CONTINUING_LEARNING_SUMMARY_MAX_LENGTH,
  buildQuestionGenerationPrompt,
  chooseQuestionGenerationType,
  getGeneratableQuestionTypes,
  getInitialContinuingLearningSummary,
  getQuestionGenerationInterface,
  getQuestionTypePromptInstructions,
  normalizeGeneratedQuestionContent,
  normalizeContinuingLearningSummary,
  tutorial_interface,
  validateGeneratedQuestion,
} from "./questionGeneration.js";
import {
  getQuestionType,
  scrambleArray,
} from "./questionTypes.js";
import { tutorialSteps } from "./curriculumRevamp.js";

test("canonical interfaces cover every unique supported generation type", () => {
  const types = tutorial_interface.map(getQuestionType);
  assert.equal(new Set(types).size, types.length);
  assert.ok(types.includes("codeTracing"));
  assert.ok(types.includes("projectCheckpoint"));
  assert.ok(types.includes("conversationReview"));
});

test("generated type selection rotates and excludes the current interface", () => {
  const types = getGeneratableQuestionTypes();
  const first = chooseQuestionGenerationType({
    currentType: "multipleChoice",
    questionCount: 0,
  });
  const second = chooseQuestionGenerationType({
    currentType: "multipleChoice",
    questionCount: 1,
  });

  assert.ok(types.includes(first));
  assert.notEqual(first, "multipleChoice");
  assert.notEqual(second, "multipleChoice");
  assert.notEqual(first, second);
});

test("course completion summaries are detailed, localized, and bounded", () => {
  const english = getInitialContinuingLearningSummary("en");
  const spanish = getInitialContinuingLearningSummary("es");

  assert.match(english, /JavaScript/);
  assert.match(english, /React/);
  assert.match(english, /Firestore/);
  assert.match(spanish, /JavaScript/);
  assert.match(spanish, /React/);
  assert.ok(english.length <= CONTINUING_LEARNING_SUMMARY_MAX_LENGTH);
  assert.ok(spanish.length <= CONTINUING_LEARNING_SUMMARY_MAX_LENGTH);
});

test("rolling summaries are normalized and cannot grow without bounds", () => {
  const summary = normalizeContinuingLearningSummary(
    `The learner practiced arrays. ${"More evidence. ".repeat(300)}`,
    "en",
  );

  assert.ok(summary.length <= CONTINUING_LEARNING_SUMMARY_MAX_LENGTH);
  assert.doesNotMatch(summary, /  /);
});

test("generated question validation enforces the selected interface", () => {
  const schema = getQuestionGenerationInterface("matchPairs");
  assert.equal(getQuestionType(schema), "matchPairs");

  const valid = {
    group: "5",
    title: "Match array concepts",
    isMatchPairs: true,
    question: {
      questionText: "Match each concept.",
      pairs: [
        { left: "map", right: "Transforms every item" },
        { left: "filter", right: "Keeps matching items" },
      ],
      choices: ["Transforms every item", "Keeps matching items"],
      answer: {
        map: "Transforms every item",
        filter: "Keeps matching items",
      },
    },
  };

  assert.equal(validateGeneratedQuestion(valid, "matchPairs"), true);
  assert.equal(
    validateGeneratedQuestion(
      {
        ...valid,
        question: { ...valid.question, answer: { map: "Wrong" } },
      },
      "matchPairs",
    ),
    false,
  );
});

test("fenced code is removed from generated prose and moved into the code field", () => {
  const normalized = normalizeGeneratedQuestionContent({
    title: "Complete an effect",
    isCodeCompletion: true,
    question: {
      questionText:
        "Choose the dependency. ```javascript\nuseEffect(() => load(), [userId]);\n``` Which `userId` value belongs in the blank?",
      options: ["[]", "[userId]"],
      answer: "[userId]",
    },
  });

  assert.equal(
    normalized.question.questionText,
    "Choose the dependency. Which userId value belongs in the blank?",
  );
  assert.equal(normalized.question.code, "useEffect(() => load(), [userId]);");
  assert.equal(validateGeneratedQuestion(normalized, "codeCompletion"), true);
});

test("terminal question normalization ensures isTerminal and isCode flags are present", () => {
  const normalized = normalizeGeneratedQuestionContent(
    {
      title: "Deploy Firestore Security Rules",
      isTerminal: true,
      question: {
        questionText:
          "Type the terminal command to deploy only your Firestore security rules using the Firebase CLI.",
      },
    },
    "terminal",
  );

  assert.equal(normalized.isTerminal, true);
  assert.equal(normalized.isCode, true);
  assert.equal(getQuestionType(normalized), "terminal");
  assert.equal(validateGeneratedQuestion(normalized, "terminal"), true);
});

test("prompt builder enforces interaction-specific instructions and prevents verb copying", () => {
  const matchSchema = getQuestionGenerationInterface("matchPairs");
  const sourceRefactoringStep = {
    group: "5",
    title: "Secure Firestore Document Ownership",
    isRefactoringChallenge: true,
    question: {
      questionText:
        "Refactor the Firestore security rule below to ensure that users can only update documents where their auth ID matches the document's owner field.",
      starterCode: "match /docs/{id} { allow update: if true; }",
      tests: ["Requires auth.uid == resource.data.owner"],
    },
  };

  const prompt = buildQuestionGenerationPrompt({
    step: sourceRefactoringStep,
    targetType: "matchPairs",
    targetInterface: matchSchema,
    userLanguage: "en",
    programmingLanguage: "JavaScript",
    generationMode: "authored",
  });

  assert.match(prompt, /selected the matchPairs interface/);
  assert.match(prompt, /CRITICAL: questionText MUST specifically fit the matchPairs interaction format/);
  assert.match(prompt, /Do NOT copy instructions, verbs \(e.g., "Refactor", "Write code", "Fix the bug"\)/);
  assert.match(prompt, /NEVER instruct the learner to write, refactor, edit, or execute code in questionText/);
  assert.match(prompt, /pairs must contain at least 2 distinct pairs/);
  assert.match(prompt, /answer must map each pair\.left key to its exact pair\.right value/);
});

test("prompt builder provides specific instructions for ordering and tracing", () => {
  const orderInstructions = getQuestionTypePromptInstructions("selectOrder");
  assert.match(orderInstructions, /arrange or sequence the conceptual steps/);
  assert.match(orderInstructions, /NEVER ask the learner to write or debug code/);

  const tracingInstructions = getQuestionTypePromptInstructions("codeTracing");
  assert.match(tracingInstructions, /ask what output, return value, or state the provided code will produce/);
});

test("curriculum review step is titled Build Your App in English and Spanish", () => {
  const englishSteps = tutorialSteps("en");
  const spanishSteps = tutorialSteps("es");

  const englishReview = englishSteps.find((step) => step.isConversationReview);
  const spanishReview = spanishSteps.find((step) => step.isConversationReview);

  assert.ok(englishReview);
  assert.ok(spanishReview);
  assert.equal(englishReview.title, "Build Your App");
  assert.equal(spanishReview.title, "Construye tu Aplicación");
  assert.notEqual(englishReview.title.includes("optional"), true);
  assert.notEqual(spanishReview.title.includes("opcional"), true);
});

test("scrambleArray guarantees a different order when input has multiple elements", () => {
  const input = ["a", "b", "c", "d"];
  for (let i = 0; i < 20; i++) {
    const scrambled = scrambleArray(input);
    assert.equal(scrambled.length, input.length);
    assert.ok(scrambled.some((item, idx) => item !== input[idx]));
  }
});
