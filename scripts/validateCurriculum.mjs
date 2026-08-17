import fs from "node:fs";
import parser from "@babel/parser";
import {
  QUESTION_TYPE_DEFINITIONS,
  countQuestionTypes,
  getQuestionType,
} from "../src/utility/questionTypes.js";

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
