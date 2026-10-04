import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import parser from "@babel/parser";
import { ACHIEVEMENTS } from "../achievements/catalog.js";
import { CODING_CHAPTERS } from "../achievements/codingChapters.js";
import { codingCourseEvidence } from "../achievements/codingProgress.js";
import { correctQuestionEvents } from "../achievements/learningCounts.js";
import { recordProgressEvents, readProgressLedger } from "../achievements/progressionRuntime.js";
import { unlockStore } from "../achievements/unlockStore.js";
import { awardProgressionAchievements, getStoredAchievements } from "./achievements.js";
import { hasWatchedReviewVideo, reviewCompletionEvents } from "./reviewCompletion.js";

const source = "robotsbuildingeducation";
const ast = parser.parse(readFileSync(new URL("./content.jsx", import.meta.url), "utf8"), { sourceType: "module", plugins: ["jsx"] });
const declaration = ast.program.body.find(node => node.type === "ExportNamedDeclaration" && node.declaration?.declarations?.[0]?.id?.name === "steps");
const courseObject = declaration.declaration.declarations[0].init;
const key = property => property.key.name || property.key.value;
const groups = CODING_CHAPTERS.map(chapter => chapter.group);
const manifests = Object.fromEntries(["en", "es"].map(course => [course,
  courseObject.properties.find(property => key(property) === course).value.elements.map(step => ({
    group: step.properties.find(property => key(property) === "group")?.value.value,
  })),
]));
const videoAst = parser.parse(readFileSync(new URL("./transcript.jsx", import.meta.url), "utf8"), { sourceType: "module", plugins: ["jsx"] });
const videos = videoAst.program.body.find(node => node.type === "ExportNamedDeclaration" && node.declaration?.declarations?.[0]?.id?.name === "videoTranscript");
const videoGroups = videos.declaration.declarations[0].init.properties.filter(property =>
  property.value.properties?.some(field => key(field) === "videoSrc")).map(property => String(key(property)));
assert.ok(groups.every(group => videoGroups.includes(group)), "every actual chapter has a review asset");
const normalizedGroup = group => String(group === "introduction" ? "tutorial" : group);
// Execute the actual host adapter; dependency injection avoids importing JSX
// UI assets into Node while preserving its production event/award pipeline.
const adapterSource = readFileSync(new URL("./robotsAchievementProgress.js", import.meta.url), "utf8");
const adapterAst = parser.parse(adapterSource, { sourceType: "module" });
const adapterNode = adapterAst.program.body.find(node => node.type === "ExportNamedDeclaration" && node.declaration?.id?.name === "awardRobotsProgress").declaration;
const adapterDependencies = { SOURCE: source, codingCourseEvidence, awardProgressionAchievements, recordProgressEvents, readProgressLedger,
  videoTranscript: Object.fromEntries(videoGroups.map(group => [group, { videoSrc: "actual-review-asset" }])),
};
const awardRobotsProgress = Function(...Object.keys(adapterDependencies), adapterSource.slice(adapterNode.start, adapterNode.end) + "\nreturn awardRobotsProgress;")(...Object.values(adapterDependencies));

async function perform(account, course, item, complete) {
  const r = item.requirement, courseSteps = manifests[course];
  const events = [];
  const addSteps = selectedGroups => {
    const selected = courseSteps.slice(1).map((step, index) => ({ step, index: index + 1 }))
      .filter(({ step }) => selectedGroups.includes(normalizedGroup(step.group)));
    const included = complete ? selected : selected.slice(0, -1);
    events.push(...included.map(({ index }) => ({ metric: "course_steps", id: `${course}:${index}` })));
  };
  const addReviews = (selectedGroups, checklist) => {
    selectedGroups.forEach((group, index) => {
      const finished = complete || index < selectedGroups.length - 1;
      const videoWatched = hasWatchedReviewVideo({ duration: 100, currentTime: !checklist && !finished ? 89.99 : 90 });
      events.push(...reviewCompletionEvents(course, group, { videoWatched, summaryViewed: true,
        practiceCompleted: checklist && finished }));
    });
  };
  if (r.type === "chapter_completion") addSteps([r.chapter]);
  else if (r.type === "chapter_review") addReviews([r.chapter], true);
  else if (r.type === "full_coding_course") {
    addSteps(groups);
    // Leave exactly the last review checklist incomplete before completion.
    addReviews(groups, true);
  } else if (r.metric === "chapters") addSteps(r.type === "counter" ? groups.slice(0, r.target) : groups);
  else if (r.metric === "review_videos" || r.metric === "review_checklists")
    addReviews(r.type === "counter" ? groups.slice(0, r.target) : groups, r.metric === "review_checklists");
  else if (r.metric === "solved_questions" || r.metric === "post_course_questions") {
    for (let i = 1; i <= r.target; i++) events.push(...correctQuestionEvents({ course,
      question: { questionText: `Question ${i}` }, isCorrect: complete || i < r.target,
      isPostCourse: r.metric === "post_course_questions", stepIndex: i, questionNumber: i }));
  } else assert.fail(`Unmapped Robots trigger: ${item.id}`);
  return awardRobotsProgress({ npub: account, course, courseSteps, events: [...events, ...events.slice(0, 1)] });
}

test("all 28 Robots awards pass their boundaries against both actual curricula", async t => {
  const previous = { window: globalThis.window, storage: globalThis.localStorage };
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const items = Object.values(ACHIEVEMENTS).filter(item => item.source === source);
  assert.equal(items.length, 28);
  try {
    for (const course of ["en", "es"]) for (const item of items) await t.test(`${course}: ${item.id}`, async () => {
      const account = `audit-${course}-${item.id}`;
      unlockStore.setIdentity(account);
      await perform(account, course, item, false);
      assert.equal(getStoredAchievements(account)[item.id], undefined, "no early award");
      await perform(account, course, item, true);
      const earned = getStoredAchievements(account)[item.id];
      assert.ok(earned && !earned.test, "genuine completion awards");
      assert.equal(unlockStore.getSnapshot().queue.filter(entry => entry.achievement.id === item.id).length, 1);
      await perform(account, course, item, true);
      assert.deepEqual(getStoredAchievements(account)[item.id], earned);
      assert.equal(unlockStore.getSnapshot().queue.filter(entry => entry.achievement.id === item.id).length, 1);
      assert.ok(JSON.parse(storage.get(`learning_achievements_v1_${account}`))[item.id]);
      assert.equal(getStoredAchievements(`${account}-other-user`)[item.id], undefined);
    });
  } finally {
    unlockStore.setIdentity("");
    if (previous.window === undefined) delete globalThis.window; else globalThis.window = previous.window;
    if (previous.storage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous.storage;
  }
});
