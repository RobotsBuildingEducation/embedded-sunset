import { getQuestionType } from "./questionTypes.js";

export const CONTINUING_LEARNING_SUMMARY_MAX_LENGTH = 1800;
export const CONTINUING_LEARNING_PROFILE_VERSION = 2;

const courseCompletionSummaries = {
  en: `The learner completed the full Robots Building Education JavaScript application-development course. They practiced JavaScript values and data types, functions, conditionals, loops, arrays, code output, and foundational terminal commands. They studied object-oriented programming through objects, classes, constructors, methods, this, properties, inheritance, method overriding, and encapsulation. They built frontend skills with React components, JSX, props, events, useState, shared state, useEffect, component lifecycle, data fetching, styling, and Flexbox. They studied backend and cloud foundations including servers, APIs, npm packages, Firebase projects, Firestore data, authentication, OAuth, environment variables, database relationships, and deployment. They also practiced an end-to-end app workflow with VS Code, Node.js, npm, package.json, Firebase tools, Git and GitHub, Google sign-in, displaying and updating user profiles, and publishing application updates. Across the course they answered conceptual questions, traced code, completed syntax, assembled and debugged programs, compared implementations, and refactored code. Continue with fresh material that reinforces unresolved fundamentals, combines established skills, and introduces adjacent intermediate JavaScript, React, backend, testing, accessibility, security, and application-design concepts gradually.`,
  es: `El estudiante completó todo el curso de desarrollo de aplicaciones con JavaScript de Robots Building Education. Practicó valores y tipos de datos de JavaScript, funciones, condicionales, ciclos, arreglos, salida de código y comandos fundamentales de terminal. Estudió programación orientada a objetos mediante objetos, clases, constructores, métodos, this, propiedades, herencia, sobrescritura de métodos y encapsulación. Desarrolló habilidades de frontend con componentes de React, JSX, props, eventos, useState, estado compartido, useEffect, ciclo de vida, obtención de datos, estilos y Flexbox. Estudió fundamentos de backend y nube, incluidos servidores, APIs, paquetes npm, proyectos de Firebase, datos en Firestore, autenticación, OAuth, variables de entorno, relaciones de bases de datos y despliegue. También practicó un flujo completo de creación de aplicaciones con VS Code, Node.js, npm, package.json, herramientas de Firebase, Git y GitHub, inicio de sesión con Google, visualización y actualización de perfiles y publicación de cambios. Durante el curso respondió preguntas conceptuales, siguió la ejecución de código, completó sintaxis, ensambló y corrigió programas, comparó implementaciones y refactorizó código. Continúa con material nuevo que refuerce fundamentos pendientes, combine habilidades ya practicadas e introduzca gradualmente conceptos intermedios de JavaScript, React, backend, pruebas, accesibilidad, seguridad y diseño de aplicaciones.`,
};

export const getCourseLocale = (userLanguage = "en") =>
  String(userLanguage).toLowerCase().startsWith("es") ? "es" : "en";

export const getInitialContinuingLearningSummary = (userLanguage = "en") =>
  courseCompletionSummaries[getCourseLocale(userLanguage)];

export const normalizeContinuingLearningSummary = (
  summary,
  userLanguage = "en",
) => {
  const fallback = getInitialContinuingLearningSummary(userLanguage);
  const normalized = String(summary || fallback)
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= CONTINUING_LEARNING_SUMMARY_MAX_LENGTH) {
    return normalized;
  }

  const shortened = normalized.slice(0, CONTINUING_LEARNING_SUMMARY_MAX_LENGTH);
  const finalSentence = Math.max(
    shortened.lastIndexOf(". "),
    shortened.lastIndexOf(".\n"),
  );

  return finalSentence > CONTINUING_LEARNING_SUMMARY_MAX_LENGTH * 0.65
    ? shortened.slice(0, finalSentence + 1)
    : `${shortened.trimEnd()}…`;
};

// Canonical JSON interfaces available to AI question generation. Each entry
// mirrors the exact shape consumed by the course renderer and grader.
export const tutorial_interface = [
  {
    group: "",
    title: "",
    description: "",
    isMultipleChoice: true,
    question: {
      questionText: "",
      code: "",
      options: ["", "", "", ""],
      answer: "",
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isMultipleAnswerChoice: true,
    question: {
      questionText: "",
      code: "",
      options: ["", "", "", ""],
      answer: ["", ""],
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isSelectOrder: true,
    question: {
      questionText: "",
      options: ["", "", "", ""],
      answer: ["", "", "", ""],
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isCodeCompletion: true,
    question: {
      questionText: "",
      code: "",
      options: ["", "", ""],
      answer: "",
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isCode: true,
    isTerminal: false,
    question: { questionText: "" },
  },
  {
    group: "",
    title: "",
    description: "",
    isCode: true,
    isTerminal: true,
    question: { questionText: "" },
  },
  {
    group: "",
    title: "",
    description: "",
    isSingleLineText: true,
    question: { questionText: "", code: "", placeholder: "", answer: "" },
  },
  {
    group: "",
    title: "",
    description: "",
    isText: true,
    question: { questionText: "", code: "" },
  },
  {
    group: "",
    title: "",
    description: "",
    isCodeTracing: true,
    question: { questionText: "", code: "", options: ["", "", ""], answer: "" },
  },
  {
    group: "",
    title: "",
    description: "",
    isFillCodeBlanks: true,
    question: {
      questionText: "",
      template: "{{blank}}",
      blanks: [{ key: "blank", hint: "" }],
      answer: { blank: "" },
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isParsonsProblem: true,
    question: { questionText: "", lines: ["", "", ""], answer: ["", "", ""] },
  },
  {
    group: "",
    title: "",
    description: "",
    isMatchPairs: true,
    question: {
      questionText: "",
      pairs: [
        { left: "conceptA", right: "definitionA" },
        { left: "conceptB", right: "definitionB" },
      ],
      choices: ["definitionA", "definitionB"],
      answer: {
        conceptA: "definitionA",
        conceptB: "definitionB",
      },
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isRelevantLine: true,
    question: { questionText: "", code: "", answer: [1] },
  },
  {
    group: "",
    title: "",
    description: "",
    isBestImplementation: true,
    question: { questionText: "", options: ["", "", ""], answer: "" },
  },
  {
    group: "",
    title: "",
    description: "",
    isFixBug: true,
    question: {
      questionText: "",
      starterCode: "",
      answer: "",
      tests: [""],
    },
  },
  {
    group: "",
    title: "",
    description: "",
    isRefactoringChallenge: true,
    question: { questionText: "", starterCode: "", tests: ["", ""] },
  },
  {
    group: "",
    title: "",
    description: "",
    isConversationReview: true,
    question: { questionText: "", range: [1, 2] },
  },
];

const NON_GENERATED_TYPES = new Set([
  "conversationReview",
  "unknown",
  "studyGuide",
]);

export const getQuestionGenerationInterface = (questionType) =>
  tutorial_interface.find(
    (candidate) => getQuestionType(candidate) === questionType,
  ) || null;

export const getGeneratableQuestionTypes = () =>
  tutorial_interface
    .map(getQuestionType)
    .filter((type) => !NON_GENERATED_TYPES.has(type));

export const getQuestionTypePromptInstructions = (targetType) => {
  switch (targetType) {
    case "matchPairs":
      return `For matchPairs:
- questionText MUST instruct the learner to match, pair, or connect related concepts, terms, syntax tokens, or database objects with their corresponding definitions or purposes (e.g. "Match each Firestore security rule term with its role in securing document ownership.").
- NEVER instruct the learner to write, refactor, edit, or execute code in questionText.
- pairs must contain at least 2 distinct pairs with clear left terms and right descriptions.
- answer must map each pair.left key to its exact pair.right value.`;
    case "selectOrder":
      return `For selectOrder:
- questionText MUST instruct the learner to arrange or sequence the conceptual steps, execution stages, or workflow from first to last (e.g. "Arrange the steps to show how authentication flow executes.").
- NEVER ask the learner to write or debug code.
- options contains the unsorted items.
- answer must be an array containing the exact correct sequential order.`;
    case "parsons":
      return `For parsons:
- questionText MUST instruct the learner to arrange or reorder the scrambled lines of code to form a working, complete program.
- lines contains the scrambled code snippets.
- answer must be an array of lines in the exact runnable order.`;
    case "fillCodeBlanks":
      return `For fillCodeBlanks:
- questionText MUST instruct the learner to fill in the missing blanks in the code snippet.
- template contains code with {{key}} tokens matching the blanks.
- blanks is an array of { key, hint } objects.
- answer maps each blank key to the correct code string.`;
    case "codeTracing":
      return `For codeTracing:
- questionText MUST ask what output, return value, or state the provided code will produce when executed.
- code MUST contain the complete snippet to trace with real newlines.
- options contains plausible outputs.
- answer is the correct output string.`;
    case "relevantLine":
      return `For relevantLine:
- questionText MUST ask the learner to click or identify the line number(s) in the code that perform a specific action, cause a bug, or declare a specific variable.
- code MUST contain the multiline code.
- answer MUST be an array of one-based line numbers.`;
    case "bestImplementation":
      return `For bestImplementation:
- questionText MUST ask which implementation is the cleanest, most secure, or most idiomatic solution for the specified goal.
- options contains 2 to 4 distinct code implementations.
- answer is the best option string.`;
    case "fixBug":
      return `For fixBug:
- questionText MUST explain the intended goal and instruct the learner to fix the bug in the provided starter code.
- starterCode contains the buggy starting code.
- tests contains verifiable success criteria.
- answer or acceptedAnswers contains the fixed code.`;
    case "refactoring":
      return `For refactoring:
- questionText MUST state the refactoring goal (e.g. improve security, extract logic, simplify conditions) for the starterCode.
- starterCode contains the initial unrefactored code.
- tests contains verifiable success criteria.`;
    case "codeCompletion":
      return `For codeCompletion:
- questionText MUST ask which token or code snippet belongs in the blank or completes the snippet.
- code contains the incomplete code snippet.
- options contains the choices.
- answer is the single correct option.`;
    case "multipleChoice":
      return `For multipleChoice:
- questionText MUST be a direct question with 3-4 options and a single correct answer.`;
    case "multipleAnswer":
      return `For multipleAnswer:
- questionText MUST ask a question where multiple choices apply.
- options contains all possible choices.
- answer is an array of all correct options.`;
    case "shortAnswer":
      return `For shortAnswer:
- questionText MUST ask a question with a concise, exact string answer.
- answer is the expected string.`;
    case "codeWriting":
      return `For codeWriting:
- questionText MUST prompt the learner to write code that accomplishes the specified goal.`;
    case "terminal":
      return `For terminal:
- questionText MUST prompt the learner to enter the terminal command to perform the action.`;
    default:
      return "";
  }
};

export const buildQuestionGenerationPrompt = ({
  step,
  targetType,
  targetInterface,
  userLanguage = "en",
  programmingLanguage = "JavaScript",
  generationMode = "authored",
  profile = null,
} = {}) => {
  const languageName = String(userLanguage).toLowerCase().startsWith("es")
    ? "Spanish"
    : "English";

  const learningDirection =
    generationMode === "continuing"
      ? `The learner has finished the authored course and is continuing with fresh material. Use this rolling description of their preparation and recent progress as the source of truth:\n${profile?.summary || ""}\n\nChoose one focused topic that either reinforces an unresolved skill, combines skills they have practiced, or introduces a sensible adjacent concept. Keep progression gradual and appropriate for this learner. Do not mention the summary or the selection process in the question.`
      : `The learner is currently working on this authored course question:\n${JSON.stringify(step)}\n\nCreate additional practice for the same exact learning objective, prerequisite level, and approximate difficulty. Adapt the learning objective into the newly selected interaction type (${targetType}). Do not switch to an unrelated subject or introduce advanced concepts ahead of this level.`;

  const typeInstructions = getQuestionTypePromptInstructions(targetType);

  return `
Create one learning exercise in ${languageName}. When code is needed, use ${programmingLanguage}.

${learningDirection}

The app selected the ${targetType} interface. Return exactly one JSON object matching this interface:
${JSON.stringify(targetInterface)}

Interface & interaction requirements:
- CRITICAL: questionText MUST specifically fit the ${targetType} interaction format. Do NOT copy instructions, verbs (e.g., "Refactor", "Write code", "Fix the bug"), or phrasing from the authored question if the target interface is a different format like matching, ordering, tracing, or multiple choice.
- Preserve exactly the boolean is* fields shown in the selected interface and every question-field data type.
- Set group to ${JSON.stringify(step?.group || "5")}.
- Do not add any is* question-type fields that are not shown in the selected interface.
- Supply a clear, self-contained questionText with all context the learner needs.
- Keep questionText as readable prose under 280 characters. Never put Markdown, backticks, imports, or a program inside questionText.
- When the selected interface has a code field, put all example code there with real newline characters. Use an empty string only when the exercise genuinely needs no code.
- Make every option, line, blank, pair, answer, and success check complete and internally consistent.
- For matchPairs, every pair.left string must be a key in answer and map to that pair.right string.
- For selectOrder and Parsons problems, answer must contain the exact correct order.
- For relevantLine, answer must be an array of one-based line numbers.
- For refactoring challenges, tests must be observable success criteria.
${typeInstructions ? `\nSpecific rules for ${targetType}:\n${typeInstructions}\n` : ""}- Do not include Markdown, code fences, commentary, or anything outside the single JSON step object.
  `.trim();
};

export const chooseQuestionGenerationType = ({
  currentType,
  questionCount = 0,
  seed = 0,
} = {}) => {
  const candidates = getGeneratableQuestionTypes().filter(
    (type) => type !== currentType,
  );
  const position =
    Math.abs(Number(questionCount) + Number(seed)) % candidates.length;
  return candidates[position];
};

const isStringArray = (value, minimum = 1) =>
  Array.isArray(value) &&
  value.length >= minimum &&
  value.every((item) => typeof item === "string");

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const normalizeGeneratedQuestionContent = (step, expectedType) => {
  if (!isPlainObject(step) || !isPlainObject(step.question)) return step;

  const extractedCode = [];
  const questionText = String(step.question.questionText || "")
    .replace(
      /```(?:javascript|js|typescript|ts|jsx|tsx|python|py|java|swift|bash|sh|shell|json|html|css)?\s*([\s\S]*?)```/gi,
      (_, code) => {
        if (String(code).trim()) extractedCode.push(String(code).trim());
        return " ";
      },
    )
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const existingCode =
    typeof step.question.code === "string" ? step.question.code.trim() : "";

  const isTerminal = Boolean(
    step.isTerminal ||
      expectedType === "terminal" ||
      step.question?.isTerminal,
  );

  return {
    ...step,
    ...(isTerminal ? { isTerminal: true, isCode: true } : {}),
    question: {
      ...step.question,
      questionText,
      code: existingCode || extractedCode.join("\n\n"),
    },
  };
};

export const validateGeneratedQuestion = (step, expectedType) => {
  if (!isPlainObject(step) || getQuestionType(step) !== expectedType) {
    return false;
  }
  if (
    typeof step.title !== "string" ||
    !step.title.trim() ||
    !isPlainObject(step.question)
  ) {
    return false;
  }
  if (
    typeof step.question.questionText !== "string" ||
    !step.question.questionText.trim() ||
    step.question.questionText.length > 500 ||
    step.question.questionText.includes("`")
  ) {
    return false;
  }

  const question = step.question;
  switch (expectedType) {
    case "multipleChoice":
    case "codeTracing":
    case "bestImplementation":
      return (
        isStringArray(question.options, 2) &&
        question.answer !== undefined &&
        question.options.some(
          (option) => String(option) === String(question.answer),
        )
      );
    case "codeCompletion":
      return (
        typeof question.code === "string" &&
        Boolean(question.code.trim()) &&
        isStringArray(question.options, 2) &&
        question.answer !== undefined &&
        question.options.some(
          (option) => String(option) === String(question.answer),
        )
      );
    case "multipleAnswer":
      return (
        isStringArray(question.options, 2) &&
        isStringArray(question.answer) &&
        question.answer.every((answer) => question.options.includes(answer))
      );
    case "selectOrder":
      return (
        isStringArray(question.options, 2) &&
        isStringArray(question.answer, 2) &&
        [...question.options].sort().join("\u0000") ===
          [...question.answer].sort().join("\u0000")
      );
    case "shortAnswer":
      return question.answer !== undefined;
    case "fillCodeBlanks":
      if (
        typeof question.template === "string" &&
        Array.isArray(question.blanks) &&
        question.blanks.length > 0 &&
        question.blanks.every((blank) => typeof blank?.key === "string") &&
        isPlainObject(question.answer)
      ) {
        const blankKeys = question.blanks.map((blank) => blank.key).sort();
        const answerKeys = Object.keys(question.answer).sort();
        return (
          blankKeys.join("\u0000") === answerKeys.join("\u0000") &&
          blankKeys.every((key) => question.template.includes(`{{${key}}}`))
        );
      }
      return false;
    case "parsons":
      return (
        isStringArray(question.lines, 2) &&
        isStringArray(question.answer, 2) &&
        [...question.lines].sort().join("\u0000") ===
          [...question.answer].sort().join("\u0000")
      );
    case "matchPairs":
      if (
        Array.isArray(question.pairs) &&
        question.pairs.length >= 2 &&
        question.pairs.every(
          (pair) =>
            typeof pair?.left === "string" && typeof pair?.right === "string",
        ) &&
        isPlainObject(question.answer)
      ) {
        return question.pairs.every(
          ({ left, right }) => question.answer[left] === right,
        );
      }
      return false;
    case "relevantLine":
      if (
        typeof question.code === "string" &&
        Array.isArray(question.answer) &&
        question.answer.every(Number.isInteger)
      ) {
        const lineCount = question.code.split("\n").length;
        return question.answer.every(
          (lineNumber) => lineNumber >= 1 && lineNumber <= lineCount,
        );
      }
      return false;
    case "fixBug":
      return (
        typeof question.starterCode === "string" &&
        (typeof question.answer === "string" ||
          isStringArray(question.acceptedAnswers))
      );
    case "refactoring":
      return (
        typeof question.starterCode === "string" &&
        isStringArray(question.tests)
      );
    case "codeWriting":
    case "terminal":
    case "openResponse":
      return true;
    default:
      return false;
  }
};
