import fs from "node:fs";
import parser from "@babel/parser";
import {
  QUESTION_TYPE_DEFINITIONS,
  countQuestionTypes,
  getQuestionType,
} from "../src/utility/questionTypes.js";
import {
  buildCourseLoot,
  CHAPTER_SALARY_BANDS,
  TUTORIAL_REWARD_COPY,
} from "../src/utility/courseLoot.js";

const source = fs.readFileSync(
  new URL("../src/utility/content.jsx", import.meta.url),
  "utf8",
);
const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });

const propertyName = (property) => property.key?.name || property.key?.value;

const readValue = (node) => {
  if (!node) return undefined;
  if (["StringLiteral", "NumericLiteral", "BooleanLiteral"].includes(node.type))
    return node.value;
  if (node.type === "NullLiteral") return null;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  if (node.type === "ArrayExpression") return node.elements.map(readValue);
  if (node.type === "ObjectExpression") {
    return Object.fromEntries(
      node.properties.map((property) => [
        propertyName(property),
        readValue(property.value),
      ]),
    );
  }
  return "[complex content]";
};

const stepsDeclaration = ast.program.body.find(
  (node) =>
    node.type === "ExportNamedDeclaration" &&
    node.declaration?.declarations?.[0]?.id?.name === "steps",
);

if (!stepsDeclaration) throw new Error("Could not find the steps export");
const stepsObject = stepsDeclaration.declaration.declarations[0].init;

const readLocale = (locale) => {
  const property = stepsObject.properties.find(
    (entry) => propertyName(entry) === locale,
  );
  if (!property || property.value.type !== "ArrayExpression") {
    throw new Error(`Could not find active ${locale} curriculum`);
  }
  return property.value.elements.map(readValue).filter(Boolean);
};

const EXPECTED_QUESTION_COUNT = 149;
const EXPECTED_CHAPTER_LENGTHS = { 1: 21, 2: 18, 3: 50, 4: 22, 5: 21 };
const EXPECTED_TYPE_COUNTS = {
  multipleChoice: 8,
  multipleAnswer: 8,
  matchPairs: 9,
  selectOrder: 9,
  relevantLine: 9,
  codeTracing: 10,
  fillCodeBlanks: 10,
  codeCompletion: 8,
  parsons: 9,
  shortAnswer: 8,
  openResponse: 8,
  codeWriting: 8,
  terminal: 8,
  bestImplementation: 10,
  fixBug: 11,
  refactoring: 10,
  conversationReview: 6,
};

const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isStringArray = (value, minimum = 1) =>
  Array.isArray(value) &&
  value.length >= minimum &&
  value.every((item) => typeof item === "string");
const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const validateQuestion = (step, index, locale) => {
  const type = getQuestionType(step);
  const label = `${locale} question ${index} (${type})`;
  const question = step.question;
  assert(type !== "unknown", `${label}: unknown question type`);
  assert(isText(step.title), `${label}: missing title`);
  assert(question && typeof question === "object", `${label}: missing question`);
  assert(isText(question.questionText), `${label}: missing question text`);

  if (["multipleChoice", "codeCompletion", "bestImplementation"].includes(type)) {
    assert(isStringArray(question.options, 3), `${label}: needs at least 3 options`);
    assert(question.options.includes(question.answer), `${label}: answer must exactly match an option`);
  } else if (type === "multipleAnswer") {
    assert(isStringArray(question.options, 3), `${label}: needs at least 3 options`);
    assert(isStringArray(question.answer), `${label}: needs answer options`);
    assert(question.answer.every((answer) => question.options.includes(answer)), `${label}: every answer must match an option`);
  } else if (type === "selectOrder") {
    assert(isStringArray(question.options, 2), `${label}: needs order options`);
    assert(isStringArray(question.answer, 2), `${label}: needs an ordered answer`);
    assert([...question.options].sort().join("\u0000") === [...question.answer].sort().join("\u0000"), `${label}: ordered answer must contain every option exactly once`);
  } else if (type === "shortAnswer") {
    assert(question.answer !== undefined, `${label}: missing short answer`);
  } else if (type === "codeWriting") {
    assert(isText(question.starterCode), `${label}: missing starter code`);
    assert(isText(question.answer), `${label}: missing reference answer`);
    assert(isStringArray(question.tests), `${label}: missing success checks`);
    assert(normalize(question.starterCode) !== normalize(question.answer), `${label}: starter code must not contain the completed answer`);
  } else if (type === "codeTracing") {
    assert(isText(question.code), `${label}: missing traceable code`);
    assert(isStringArray(question.options, 2), `${label}: missing trace options`);
    assert(question.options.includes(question.answer), `${label}: invalid trace answer`);
  } else if (type === "fillCodeBlanks") {
    assert(isText(question.template), `${label}: missing code template`);
    assert(Array.isArray(question.blanks) && question.blanks.length, `${label}: missing blanks`);
    assert(question.answer && typeof question.answer === "object", `${label}: missing blank answers`);
    const tokens = [...new Set([...question.template.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]))].sort();
    const blankKeys = question.blanks.map((blank) => blank.key).sort();
    const answerKeys = Object.keys(question.answer).sort();
    assert(tokens.length > 0, `${label}: template has no blank tokens`);
    assert(tokens.join("\u0000") === blankKeys.join("\u0000"), `${label}: blank metadata does not match template tokens`);
    assert(tokens.join("\u0000") === answerKeys.join("\u0000"), `${label}: blank answers do not match template tokens`);
  } else if (type === "parsons") {
    assert(isStringArray(question.lines, 2), `${label}: missing Parsons lines`);
    assert(isStringArray(question.answer, 2), `${label}: missing Parsons answer`);
    assert([...question.lines].sort().join("\u0000") === [...question.answer].sort().join("\u0000"), `${label}: Parsons answer must contain every line exactly once`);
  } else if (type === "matchPairs") {
    assert(Array.isArray(question.pairs) && question.pairs.length >= 2, `${label}: missing pairs`);
    assert(question.answer && typeof question.answer === "object", `${label}: missing pair answers`);
    question.pairs.forEach(({ left, right }) => {
      assert(isText(left) && isText(right), `${label}: invalid pair`);
      assert(question.answer[left] === right, `${label}: pair answer mismatch for ${left}`);
    });
  } else if (type === "relevantLine") {
    assert(isText(question.code), `${label}: missing source code`);
    const answers = Array.isArray(question.answer) ? question.answer : [question.answer];
    const lineCount = question.code.split("\n").length;
    assert(answers.length > 0 && answers.every((line) => Number.isInteger(line) && line >= 1 && line <= lineCount), `${label}: relevant line answer is outside the code range`);
  } else if (type === "fixBug") {
    assert(isText(question.starterCode), `${label}: missing buggy starter code`);
    assert(isText(question.answer), `${label}: missing fixed reference answer`);
    assert(isStringArray(question.tests, 2), `${label}: needs at least 2 success checks`);
  } else if (type === "refactoring") {
    assert(isText(question.starterCode), `${label}: missing refactoring starter code`);
    assert(isStringArray(question.tests, 2), `${label}: needs at least 2 success checks`);
  } else if (type === "conversationReview") {
    assert(Array.isArray(question.range) && question.range.length === 2 && question.range.every(Number.isInteger), `${label}: app progress step needs a two-number range`);
  }
};

const curricula = Object.fromEntries(
  ["en", "es"].map((locale) => [locale, readLocale(locale)]),
);

const studyGuideMarkers = {
  en: [
    "### Advice",
    "fail faster",
    "my_custom_data",
    "class House",
    "function createHouse",
    "CelebrationMessage",
    "### Conclusion",
  ],
  es: [
    "### Consejos",
    "falla más rápido",
    "mis_datos_personalizados",
    "class Casa",
    "function crearCasa",
    "MensajeDeCelebracion",
    "### Conclusion",
  ],
};

Object.entries(curricula).forEach(([locale, course]) => {
  const studyGuide = course.find((step) => step.isStudyGuide);
  const metaData = studyGuide?.question?.metaData;
  assert(studyGuide, `${locale}: missing study guide step`);
  assert(isText(metaData) && metaData.length > 4000, `${locale}: study guide metadata is missing or truncated`);
  studyGuideMarkers[locale].forEach((marker) => {
    assert(metaData.includes(marker), `${locale}: study guide lost required material: ${marker}`);
  });
});

const expectedChapterThreePreviewTitles = {
  en: [
    "HTML & CSS Phase: Semantic HTML Elements",
    "HTML Attributes and Inputs",
    "Best Implementation: Accessible Clickable Elements",
    "Assembling a Semantic HTML Card",
    "The CSS Box Model Layers",
    "Flexbox Navbar Alignment",
    "Code Writing: Controlled Search Input",
    "Ternary Conditional Rendering",
    "Best Implementation: Conditional Tab Switching",
    "Building Flexbox Card Layout",
    "Component Composition with props.children",
    "Interval Timers and useEffect Cleanup",
  ],
  es: [
    "Fase HTML y CSS: Elementos Semánticos",
    "Atributos y Entradas en HTML",
    "Mejor Implementación: Elementos Interactivos Accesibles",
    "Estructura de una Tarjeta HTML Semántica",
    "Capas del Modelo de Caja en CSS",
    "Alineación de Barra de Navegación con Flexbox",
    "Escritura de Código: Input Controlado en React",
    "Renderizado Condicional Ternario",
    "Mejor Implementación: Cambio Declarativo de Pestañas",
    "Construyendo Diseños con Flexbox",
    "Composición de Componentes con props.children",
    "Temporizadores de Intervalo y Limpieza en useEffect",
  ],
};

Object.entries(curricula).forEach(([locale, course]) => {
  const previews = course.filter(
    (step) => String(step.group) === "3" && step.showPreview,
  );
  const actualTitles = previews.map((step) => step.title).sort();
  const expectedTitles = [...expectedChapterThreePreviewTitles[locale]].sort();

  assert(
    actualTitles.length === expectedTitles.length,
    `${locale}: chapter 3 must retain ${expectedTitles.length} component previews; found ${actualTitles.length}`,
  );
  assert(
    actualTitles.join("\u0000") === expectedTitles.join("\u0000"),
    `${locale}: chapter 3 component preview assignments changed`,
  );
  previews.forEach((step) => {
    assert(
      isText(step.question?.previewCode),
      `${locale}: ${step.title} is missing its component preview code`,
    );
    try {
      parser.parse(step.question.previewCode, {
        sourceType: "module",
        plugins: ["jsx"],
      });
    } catch (error) {
      throw new Error(
        `${locale}: ${step.title} has invalid component preview code: ${error.message}`,
      );
    }
  });
});

const courseLoot = buildCourseLoot(curricula);

assert(courseLoot.length === curricula.en.length, "loot must contain one entry for every authored course step");
courseLoot.forEach((entry, index) => {
  const englishStep = curricula.en[index];
  const spanishStep = curricula.es[index];
  const group = String(englishStep.group);
  const type = getQuestionType(englishStep);
  const label = `loot entry ${index} (${group}/${type})`;

  assert(entry.stepIndex === index, `${label}: stored step index is misaligned`);
  assert(entry.group === group, `${label}: chapter group is misaligned`);
  assert(entry.questionType === type, `${label}: question mode is misaligned`);
  assert(entry.enTitle === englishStep.title, `${label}: English title is misaligned`);
  assert(entry.esTitle === spanishStep.title, `${label}: Spanish title is misaligned`);
  assert(isText(entry.en), `${label}: missing English detail`);
  assert(isText(entry.es), `${label}: missing Spanish detail`);
  if (group === "tutorial") {
    assert(entry.en === TUTORIAL_REWARD_COPY.en[type], `${label}: English tutorial detail must describe the question's actual concept`);
    assert(entry.es === TUTORIAL_REWARD_COPY.es[type], `${label}: Spanish tutorial detail must describe the question's actual concept`);
  } else {
    assert(entry.en.includes(englishStep.title), `${label}: English detail must identify its question`);
    assert(entry.es.includes(spanishStep.title), `${label}: Spanish detail must identify its question`);
  }
  assert(Number.isFinite(entry.monetaryValue), `${label}: monetary value must be numeric`);

  if (type === "studyGuide") {
    assert(entry.monetaryValue === 0, `${label}: the pre-course study guide must start at zero`);
  }
});

const expectedTutorialTypes = QUESTION_TYPE_DEFINITIONS.map(({ key }) => key).sort();
["en", "es"].forEach((locale) => {
  const descriptorTypes = Object.keys(TUTORIAL_REWARD_COPY[locale]).sort();
  const descriptors = Object.values(TUTORIAL_REWARD_COPY[locale]);
  assert(descriptorTypes.join("\u0000") === expectedTutorialTypes.join("\u0000"), `${locale}: tutorial loot must describe every question mode exactly once`);
  assert(new Set(descriptors).size === descriptors.length, `${locale}: tutorial loot descriptions must be unique`);
});

Object.entries(CHAPTER_SALARY_BANDS).forEach(([group, [start, end]]) => {
  const chapterLoot = courseLoot.filter((entry) => entry.group === group);
  const expectedLength = group === "tutorial"
    ? QUESTION_TYPE_DEFINITIONS.length
    : EXPECTED_CHAPTER_LENGTHS[group];
  const chapterLabel = group === "tutorial" ? "0" : group;
  assert(chapterLoot.length === expectedLength, `loot chapter ${chapterLabel}: wrong number of entries`);
  assert(chapterLoot[0].monetaryValue === start, `loot chapter ${chapterLabel}: expected starting value ${start}`);
  assert(chapterLoot.at(-1).monetaryValue === end, `loot chapter ${chapterLabel}: expected ending value ${end}`);
  chapterLoot.forEach((entry, index) => {
    if (index === 0) return;
    assert(entry.monetaryValue > chapterLoot[index - 1].monetaryValue, `loot chapter ${chapterLabel}: every question must visibly increase value`);
  });
});

for (const [locale, course] of Object.entries(curricula)) {
  const questions = course.filter(
    (step) => step.group === "tutorial" || /^[1-5]$/.test(String(step.group)),
  );
  const tutorial = questions.filter((step) => step.group === "tutorial");
  const counts = countQuestionTypes(questions);

  assert(questions.length === EXPECTED_QUESTION_COUNT, `${locale}: expected ${EXPECTED_QUESTION_COUNT} questions; found ${questions.length}`);
  assert(tutorial.length === QUESTION_TYPE_DEFINITIONS.length, `${locale}: tutorial should demonstrate every mode exactly once`);
  QUESTION_TYPE_DEFINITIONS.forEach(({ key }) => {
    assert(tutorial.filter((step) => getQuestionType(step) === key).length === 1, `${locale}: tutorial must contain exactly one ${key} question`);
  });
  Object.entries(EXPECTED_CHAPTER_LENGTHS).forEach(([group, expected]) => {
    const actual = questions.filter((step) => String(step.group) === group).length;
    assert(actual === expected, `${locale}: chapter ${group} expected ${expected}; found ${actual}`);
  });
  assert(JSON.stringify(counts) === JSON.stringify(EXPECTED_TYPE_COUNTS), `${locale}: question-mode distribution changed\nexpected ${JSON.stringify(EXPECTED_TYPE_COUNTS)}\nreceived ${JSON.stringify(counts)}`);
  questions.forEach((step, index) => validateQuestion(step, index + 1, locale));
  console.log(`${locale}: ${questions.length} learner-facing questions validated`);
  console.table(counts);
}

const learnerQuestions = (course) =>
  course.filter(
    (step) => step.group === "tutorial" || /^[1-5]$/.test(String(step.group)),
  );
const englishQuestions = learnerQuestions(curricula.en);
const spanishQuestions = learnerQuestions(curricula.es);
englishQuestions.forEach((step, index) => {
  assert(String(step.group) === String(spanishQuestions[index].group), `locale parity: group mismatch at question ${index + 1}`);
  assert(getQuestionType(step) === getQuestionType(spanishQuestions[index]), `locale parity: mode mismatch at question ${index + 1}`);
});

console.log("English/Spanish order and question-mode parity validated");
