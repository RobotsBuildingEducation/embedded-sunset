import test from "node:test";
import assert from "node:assert/strict";
import {
  isInlineMarkdownCode,
  looksLikeDefiniteCodeLine,
  normalizeLearnMarkdown,
  repairFencedMarkdown,
} from "./markdownCode.js";

test("recognizes short and multi-word inline code references", () => {
  assert.equal(isInlineMarkdownCode({ children: "Robot" }), true);
  assert.equal(isInlineMarkdownCode({ children: "this.model = model" }), true);
});

test("recognizes fenced and multiline code blocks", () => {
  assert.equal(
    isInlineMarkdownCode({
      className: "language-javascript",
      children: "const value = 1;\n",
    }),
    false,
  );
  assert.equal(
    isInlineMarkdownCode({ children: "const value = 1;\nconsole.log(value);" }),
    false,
  );
});

test("respects parser metadata when it is available", () => {
  assert.equal(
    isInlineMarkdownCode({ inline: false, children: "Robot" }),
    false,
  );
  assert.equal(
    isInlineMarkdownCode({
      children: "Robot",
      node: { position: { start: { line: 2 }, end: { line: 2 } } },
    }),
    true,
  );
  assert.equal(
    isInlineMarkdownCode({
      children: "const value = 1;",
      node: { position: { start: { line: 2 }, end: { line: 4 } } },
    }),
    false,
  );
});

test("recognizes Firestore security rules and code constructs as definite code", () => {
  assert.equal(
    looksLikeDefiniteCodeLine("service cloud.firestore {"),
    true,
  );
  assert.equal(
    looksLikeDefiniteCodeLine("match /databases/{database}/documents {"),
    true,
  );
  assert.equal(
    looksLikeDefiniteCodeLine("allow create: if request.auth != null"),
    true,
  );
  assert.equal(
    looksLikeDefiniteCodeLine("allow update, delete: if request.auth != null"),
    true,
  );
  assert.equal(
    looksLikeDefiniteCodeLine("&& request.resource.data.ownerId == request.auth.uid;"),
    true,
  );
});

test("preserves Firestore security rules code blocks without breaking mid-way", () => {
  const code = [
    "```javascript",
    "service cloud.firestore {",
    "  match /databases/{database}/documents {",
    "    match /posts/{postId} {",
    "      allow create: if request.auth != null",
    "        && request.resource.data.ownerId == request.auth.uid;",
    "    }",
    "  }",
    "}",
    "```",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(code);

  // The normalized output must contain only one opening fence and one closing fence
  const openingFences = (normalized.match(/```javascript/g) || []).length;
  const closingFences = (normalized.match(/```$/gm) || []).length;

  assert.equal(openingFences, 1);
  assert.equal(closingFences, 1);
  assert.match(normalized, /allow create: if request\.auth != null/);
  assert.match(normalized, /&& request\.resource\.data\.ownerId == request\.auth\.uid;/);
});

test("preserves text paragraphs and subsequent code blocks intact", () => {
  const lecture = [
    "For `update` and `delete` operations, the document already exists. Here, you must check the existing `resource` data to ensure the person making the request is the original owner:",
    "",
    "```javascript",
    "service cloud.firestore {",
    "  match /databases/{database}/documents {",
    "    match /posts/{postId} {",
    "      allow update, delete: if request.auth != null",
    "        && resource.data.ownerId == request.auth.uid;",
    "    }",
    "  }",
    "}",
    "```",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(lecture);

  const openingFences = (normalized.match(/```javascript/g) || []).length;
  assert.equal(openingFences, 1);
  assert.match(normalized, /For `update` and `delete` operations/);
  assert.match(normalized, /allow update, delete: if request\.auth != null/);
});

test("groups loose unfenced code lines into a single code block", () => {
  const looseCode = [
    "service cloud.firestore {",
    "  match /databases/{database}/documents {",
    "    match /posts/{postId} {",
    "      allow create: if request.auth != null;",
    "    }",
    "  }",
    "}",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(looseCode);

  const openingFences = (normalized.match(/```javascript/g) || []).length;
  const closingFences = (normalized.match(/```$/gm) || []).length;

  assert.equal(openingFences, 1);
  assert.equal(closingFences, 1);
});

test("extracts prose transition text and does not wrap it in a code block", () => {
  const lectureWithTrailingProse = [
    "```javascript",
    'console.log("5" + 5);',
    "console.log(5 + 5);",
    "",
    "Now that you have explored how numbers and strings differ in behavior, let us test your knowledge with a challenge question:",
    "```",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(lectureWithTrailingProse);

  // The code block should contain only the console.log lines
  assert.match(normalized, /```javascript\nconsole\.log\("5" \+ 5\);\nconsole\.log\(5 \+ 5\);\n```/);
  // The transition text must be outside any code fence
  assert.match(
    normalized,
    /```\n\nNow that you have explored how numbers and strings differ in behavior, let us test your knowledge with a challenge question:/,
  );
});

test("unwraps a fenced block that contains only prose text", () => {
  const purelyProseFenced = [
    "```javascript",
    "Now that you have explored how numbers and strings differ in behavior, let us test your knowledge with a challenge question:",
    "```",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(purelyProseFenced);

  assert.equal(
    normalized.trim(),
    "Now that you have explored how numbers and strings differ in behavior, let us test your knowledge with a challenge question:",
  );
  assert.equal(normalized.includes("```"), false);
});

test("does not treat capitalized prose beginning with code keywords as code", () => {
  const prose = [
    "```javascript",
    "Let us start by looking at numbers. In JavaScript, numbers represent",
    "both integer and floating-point values.",
    "Class names and return values will appear later in the course.",
    "```",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(prose);

  assert.equal(normalized.includes("```"), false);
  assert.match(normalized, /Let us start by looking at numbers/);
  assert.match(normalized, /Class names and return values/);
});

test("extracts obvious prose even when generated code has an open brace", () => {
  const malformedLecture = [
    "```javascript",
    "function showValue() {",
    "  console.log(42);",
    "Let us pause here to understand why this value is displayed.",
    "}",
    "```",
  ].join("\n");

  const normalized = normalizeLearnMarkdown(malformedLecture);

  assert.match(normalized, /console\.log\(42\);\n```/);
  assert.match(
    normalized,
    /```\n\nLet us pause here to understand why this value is displayed\./,
  );
});
