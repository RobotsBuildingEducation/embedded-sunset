import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCourseLoot,
  TUTORIAL_REWARD_COPY,
} from "./courseLoot.js";
import { QUESTION_TYPE_DEFINITIONS } from "./questionTypes.js";

const buildFixture = () => ({
  en: [
    { group: "introduction", title: "Study Guide", isStudyGuide: true },
    { group: "tutorial", title: "Multiple Choice", isMultipleChoice: true },
    { group: "tutorial", title: "Build Your App", isConversationReview: true },
    { group: "1", title: "Variables", isMultipleChoice: true },
    { group: "1", title: "Repair a Loop", isFixBug: true },
    { group: "1", title: "Build Your App", isConversationReview: true },
  ],
  es: [
    { group: "introducción", title: "Guía de Estudio", isStudyGuide: true },
    { group: "tutorial", title: "Opción Múltiple", isMultipleChoice: true },
    { group: "tutorial", title: "Construye tu Aplicación", isConversationReview: true },
    { group: "1", title: "Variables", isMultipleChoice: true },
    { group: "1", title: "Reparar un Bucle", isFixBug: true },
    { group: "1", title: "Construye tu Aplicación", isConversationReview: true },
  ],
});

test("buildCourseLoot aligns every reward with its paired course step", () => {
  const rewards = buildCourseLoot(buildFixture());

  assert.equal(rewards.length, 6);
  rewards.forEach((reward, index) => assert.equal(reward.stepIndex, index));
  assert.match(rewards[1].en, /distinguished a JavaScript number/);
  assert.match(rewards[1].es, /Distinguiste un número de JavaScript/);
  assert.match(rewards[4].en, /Repair a Loop/);
  assert.match(rewards[4].es, /Reparar un Bucle/);
});

test("Chapter 0 has one unique, concept-specific descriptor per interaction", () => {
  const expectedTypes = QUESTION_TYPE_DEFINITIONS.map(({ key }) => key).sort();

  for (const locale of ["en", "es"]) {
    const descriptors = TUTORIAL_REWARD_COPY[locale];
    assert.deepEqual(Object.keys(descriptors).sort(), expectedTypes);
    assert.equal(new Set(Object.values(descriptors)).size, expectedTypes.length);
    Object.values(descriptors).forEach((detail) => {
      assert.ok(detail.length >= 60);
      assert.doesNotMatch(detail, /interaction builds fluency|interacción.*fluidez/i);
    });
  }
});

test("Chapter 0 and numbered chapters span their salary bands", () => {
  const rewards = buildCourseLoot(buildFixture());

  assert.equal(rewards[0].monetaryValue, 0);
  assert.equal(rewards[1].monetaryValue, 50);
  assert.equal(rewards[2].monetaryValue, 1000);
  assert.equal(rewards[3].monetaryValue, 1250);
  assert.equal(rewards[5].monetaryValue, 10000);
  assert.ok(rewards[4].monetaryValue > rewards[3].monetaryValue);
});

test("buildCourseLoot rejects bilingual mode drift", () => {
  const fixture = buildFixture();
  fixture.es[4] = { group: "1", title: "Reparar un Bucle", isCodeTracing: true };

  assert.throws(() => buildCourseLoot(fixture), /question mode|English is fixBug/);
});
