import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import parser from "@babel/parser";
import {CODING_CHAPTERS} from "../achievements/codingChapters.js";

test("chapter awards cover every playable chapter of both actual curricula", () => {
  const ast=parser.parse(readFileSync(new URL("./content.jsx",import.meta.url),"utf8"),{sourceType:"module",plugins:["jsx"]});
  const declaration=ast.program.body.find(node=>node.type==="ExportNamedDeclaration" && node.declaration?.declarations?.[0]?.id?.name==="steps");
  const properties=declaration.declaration.declarations[0].init.properties;
  for(const locale of ["en","es"]) {
    const course=properties.find(p=>(p.key.name||p.key.value)===locale).value;
    const groups=[...new Set(course.elements.slice(1).map(step=>step.properties.find(p=>(p.key.name||p.key.value)==="group").value.value))];
    assert.deepEqual(groups,CODING_CHAPTERS.map(chapter=>chapter.group));
  }
});

// Exercise the production award transport with receipts from the actual course.
test("all 28 Robots awards unlock as genuine work using the actual curriculum", async () => {
  const { awardProgressionAchievements, getStoredAchievements, ACHIEVEMENTS } = await import("./achievements.js");
  const { unlockStore } = await import("../achievements/unlockStore.js");
  const { codingCourseEvidence } = await import("../achievements/codingProgress.js");
  const { correctQuestionEvents } = await import("../achievements/learningCounts.js");
  const { recordProgressEvents, readProgressLedger } = await import("../achievements/progressionRuntime.js");
  const originalWindow = globalThis.window, originalStorage = globalThis.localStorage;
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const npub = "complete-robots-user", source = "robotsbuildingeducation", course = "en";
  unlockStore.setIdentity(npub);
  try {
    const ast = parser.parse(readFileSync(new URL("./content.jsx", import.meta.url), "utf8"), { sourceType: "module", plugins: ["jsx"] });
    const declaration = ast.program.body.find(node => node.type === "ExportNamedDeclaration" && node.declaration?.declarations?.[0]?.id?.name === "steps");
    const courseAst = declaration.declaration.declarations[0].init.properties.find(p => (p.key.name || p.key.value) === course).value;
    const courseSteps = courseAst.elements.map(step => ({ group: step.properties.find(p => (p.key.name || p.key.value) === "group")?.value.value }));
    const groups = CODING_CHAPTERS.map(chapter => chapter.group);
    const events = [
      ...courseSteps.slice(1).map((_, i) => ({ metric: "course_steps", id: `${course}:${i + 1}` })),
      ...groups.flatMap(group => ["review_videos", "review_checklists"].map(metric => ({ metric, id: `${course}:${group}` }))),
      ...Array.from({ length: 100 }, (_, i) => correctQuestionEvents({ course, question: { questionText: `Post-course question ${i + 1}` },
        isCorrect: true, isPostCourse: true, questionNumber: i + 1 })).flat(),
    ];
    recordProgressEvents(npub, source, events);
    const evidence = codingCourseEvidence(course, courseSteps, readProgressLedger(npub, source), groups);
    await awardProgressionAchievements({ npub, source, evidence });
    const expected = Object.values(ACHIEVEMENTS).filter(item => item.source === source).map(item => item.id).sort();
    assert.equal(expected.length, 28);
    const records = getStoredAchievements(npub);
    assert.deepEqual(Object.keys(records).sort(), expected);
    assert.ok(Object.values(records).every(record => !record.test));
    assert.equal(unlockStore.getSnapshot().queue.length, 28);
    assert.ok(unlockStore.getSnapshot().queue.every(item => !item.preview && !item.test));
    assert.deepEqual(await awardProgressionAchievements({ npub, source, evidence }), []);
    assert.equal(unlockStore.getSnapshot().queue.length, 28);
  } finally {
    unlockStore.setIdentity("");
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});
