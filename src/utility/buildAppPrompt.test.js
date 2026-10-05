import test from "node:test";
import assert from "node:assert/strict";
import { determineAppStage, buildAppPrompt } from "./buildAppPrompt.js";

test("determineAppStage classifies tutorial, 1, and 2 as 'html'", () => {
  assert.equal(determineAppStage({ group: "tutorial" }), "html");
  assert.equal(determineAppStage({ group: "0" }), "html");
  assert.equal(determineAppStage({ group: "" }), "html");
  assert.equal(determineAppStage({ group: "1" }), "html");
  assert.equal(determineAppStage({ group: "2" }), "html");
});

test("determineAppStage classifies 3 and 4 as 'react'", () => {
  assert.equal(determineAppStage({ group: "3" }), "react");
  assert.equal(determineAppStage({ group: "4" }), "react");
});

test("determineAppStage classifies 5 and 6 as 'fullstack'", () => {
  assert.equal(determineAppStage({ group: "5" }), "fullstack");
  assert.equal(determineAppStage({ group: "6" }), "fullstack");
});

test("determineAppStage falls back to completed titles when group is custom", () => {
  assert.equal(
    determineAppStage({ group: "custom", completed: ["Variables", "Functions"] }),
    "html",
  );
  assert.equal(
    determineAppStage({
      group: "custom",
      completed: ["Variables", "Functional Components", "React State Hook"],
    }),
    "react",
  );
  assert.equal(
    determineAppStage({
      group: "custom",
      completed: ["Variables", "React State Hook", "Firestore Security Rules"],
    }),
    "fullstack",
  );
});

test("buildAppPrompt generates basic HTML requirements for tutorial on new accounts", () => {
  const prompt = buildAppPrompt({
    group: "tutorial",
    completed: ["Multiple Choice", "Match the Pairs"],
    idea: "dog app",
    userLanguage: "en",
  });

  // Must instruct basic HTML render starting with <!DOCTYPE html>
  assert.ok(prompt.includes("BASIC HTML RENDER ONLY"), "has basic HTML render notice");
  assert.ok(prompt.includes("<!DOCTYPE html>"), "requires DOCTYPE");
  assert.ok(prompt.includes("DO NOT generate React"), "forbids React");
  assert.ok(prompt.includes("DO NOT use JSX syntax"), "forbids JSX");
  assert.ok(prompt.includes("DO NOT write React.useState"), "forbids useState");
  assert.ok(prompt.includes('App Idea: "dog app"'), "includes idea");

  // Must not include React runtime requirement text for beginners
  assert.ok(!prompt.includes("CRITICAL PREVIEW-RUNTIME LIMITATION FOR ALL REACT CODE"), "excludes React preview-runtime block");
});

test("buildAppPrompt generates React component requirements for chapter 3", () => {
  const prompt = buildAppPrompt({
    group: "3",
    completed: ["Semantic HTML", "Functional Components"],
    idea: "dog app",
    userLanguage: "en",
  });

  assert.ok(prompt.includes("FRONTEND COMPONENT LEVEL (REACT)"));
  assert.ok(prompt.includes("render(<TheComponentYouCreated />)"));
  assert.ok(prompt.includes("React.useState"));
  assert.ok(prompt.includes("CRITICAL PREVIEW-RUNTIME LIMITATION FOR ALL REACT CODE"));
});

test("buildAppPrompt generates fullstack requirements for chapter 5", () => {
  const prompt = buildAppPrompt({
    group: "5",
    completed: ["Semantic HTML", "Functional Components", "Firestore"],
    idea: "dog app",
    userLanguage: "en",
  });

  assert.ok(prompt.includes("ADVANCED FULLSTACK LEVEL"));
  assert.ok(prompt.includes("render(<TheComponentYouCreated />)"));
  assert.ok(prompt.includes("'experiments' collection"));
  assert.ok(prompt.includes("Chakra UI"));
});

test("buildAppPrompt respects Spanish userLanguage", () => {
  const prompt = buildAppPrompt({
    group: "tutorial",
    completed: ["Opción Múltiple"],
    idea: "app de perros",
    userLanguage: "es",
  });

  assert.ok(prompt.includes('lang="es"'));
  assert.ok(prompt.includes("The user's preferred language is Spanish"));
});
