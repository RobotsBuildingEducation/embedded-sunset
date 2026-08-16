import fs from "node:fs";
import process from "node:process";
import parser from "@babel/parser";
import { revampCourse } from "../src/utility/curriculumRevamp.js";
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

const expectedTutorialTypes = QUESTION_TYPE_DEFINITIONS.map(({ key }) => key);
const convertedTypes = [
  "codeTracing",
  "fillCodeBlanks",
  "parsons",
  "matchPairs",
  "relevantLine",
  "bestImplementation",
  "fixBug",
  "refactoring",
  "projectCheckpoint",
];

const assertConvertedQuestionIsComplete = (step, index, locale) => {
  const type = getQuestionType(step);
  if (!convertedTypes.includes(type)) return;
  const label = `${locale} step ${index} (${type})`;
  const prompt = step.question?.questionText;
  if (typeof prompt !== "string" || prompt.trim().length < 45) {
    throw new Error(`${label}: prompt is missing or too vague`);
  }
  if (typeof step.title !== "string" || !step.title.trim()) {
    throw new Error(`${label}: title is missing`);
  }
  const q = step.question;
  const requireArray = (field, minimum = 1) => {
    if (!Array.isArray(q[field]) || q[field].length < minimum) {
      throw new Error(`${label}: ${field} needs at least ${minimum} entries`);
    }
  };
  if (type === "codeTracing") {
    if (!q.code || q.answer === undefined)
      throw new Error(`${label}: tracing requires code and an answer`);
  } else if (type === "fillCodeBlanks") {
    requireArray("blanks");
    if (!q.template || !q.answer)
      throw new Error(`${label}: fill-in requires a template and answer`);
  } else if (type === "parsons") {
    requireArray("lines", 2);
    requireArray("answer", 2);
  } else if (type === "matchPairs") {
    requireArray("pairs", 2);
    requireArray("choices", 2);
  } else if (type === "relevantLine") {
    if (!q.code) throw new Error(`${label}: relevant-line requires code`);
    requireArray("answer");
  } else if (type === "bestImplementation") {
    requireArray("options", 3);
    if (q.answer === undefined)
      throw new Error(`${label}: best-implementation requires an answer`);
  } else if (["fixBug", "refactoring", "projectCheckpoint"].includes(type)) {
    if (typeof q.starterCode !== "string" || !q.starterCode.trim())
      throw new Error(`${label}: coding task requires string starter code`);
    requireArray("tests", 2);
  }
};

for (const locale of ["en", "es"]) {
  const course = revampCourse(readLocale(locale), locale);
  const tutorial = course.filter((step) => step.group === "tutorial");
  const chapterSteps = course.filter((step) =>
    /^[1-5]$/.test(String(step.group)),
  );
  const tutorialTypes = tutorial.map(getQuestionType);
  const chapterCounts = countQuestionTypes(chapterSteps);

  course.forEach((step, index) => {
    if (/^[1-5]$/.test(String(step.group))) {
      assertConvertedQuestionIsComplete(step, index, locale);
    }
  });

  if (tutorial.length !== expectedTutorialTypes.length) {
    throw new Error(
      `${locale}: tutorial has ${tutorial.length} modes; expected ${expectedTutorialTypes.length}`,
    );
  }
  expectedTutorialTypes.forEach((type) => {
    if (!tutorialTypes.includes(type))
      throw new Error(`${locale}: tutorial is missing ${type}`);
  });

  convertedTypes.forEach((type) => {
    if (chapterCounts[type] !== 5) {
      throw new Error(
        `${locale}: expected 5 ${type} questions; found ${chapterCounts[type] || 0}`,
      );
    }
  });

  if (chapterSteps.length !== 102) {
    throw new Error(
      `${locale}: chapter length changed from 102 to ${chapterSteps.length}`,
    );
  }

  console.log(`${locale}: ${course.length} total steps`);
  console.table(chapterCounts);
}
