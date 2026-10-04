import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import parser from "@babel/parser";
import { hasWatchedReviewVideo, reviewCompletionEvents } from "./reviewCompletion.js";
import { awardProgressionAchievements, getStoredAchievements } from "./achievements.js";
import { unlockStore } from "../achievements/unlockStore.js";

const source = readFileSync(new URL("../components/LectureModal/LectureModal.jsx", import.meta.url), "utf8");
const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });
const nodes = [];
function walk(node) {
  if (!node || typeof node !== "object") return;
  if (node.type) nodes.push(node);
  Object.values(node).forEach(value => { if (Array.isArray(value)) value.forEach(walk); else if (value && typeof value === "object") walk(value); });
}
walk(ast);
const loadEffect = nodes.find(node => node.type === "CallExpression" && node.callee.name === "useEffect" &&
  node.arguments[0]?.body?.body?.some(statement => statement.type === "FunctionDeclaration" && statement.id.name === "getProgress"));
const handler = name => nodes.find(node => node.type === "VariableDeclarator" && node.id.name === name).init;
const compile = (node, dependencies) => Function(...Object.keys(dependencies), `return (${source.slice(node.start, node.end)});`)(...Object.values(dependencies));
const tick = () => new Promise(resolve => setImmediate(resolve));

test("the real review handlers preserve completion during a slow profile load and then save it", async () => {
  const previous = { window: globalThis.window, storage: globalThis.localStorage };
  const account = "review-load-audit", storage = new Map([["local_npub", account]]);
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  unlockStore.setIdentity(account);
  let resolveRead;
  const read = new Promise(resolve => { resolveRead = resolve; });
  const state = { video: false, summary: false, practice: false, loaded: null }, saves = [], awards = [];
  const setter = key => value => { state[key] = typeof value === "function" ? value(state[key]) : value; };
  const dependencies = { isOpen: true, userLanguage: "en", step: { group: "1" }, reviewIdentity: "en:1",
    videoRef: { current: { duration: 100, currentTime: 90 } }, videoDurationDetection: false,
    setVideoDurationDetection: setter("video"), setHasViewedSummary: setter("summary"), setHasPracticedModule: setter("practice"), setLoadedReviewIdentity: setter("loaded"),
    database: {}, doc: (_db, ...parts) => parts.join("/"), getDoc: () => read, hasWatchedReviewVideo, reviewCompletionEvents,
    steps: { en: [{}, { group: "1" }] },
    awardRobotsProgress: args => {
      awards.push(...args.events);
      return awardProgressionAchievements({ npub: args.npub, source: "robotsbuildingeducation", events: args.events });
    },
    runTransaction: async (_db, run) => run({
      get: async () => ({ data: () => ({ moduleProgressByCourse: { en: { 1: {} } } }) }),
      update: (_ref, patch) => saves.push(patch),
    }),
  };
  try {
    const cleanup = compile(loadEffect.arguments[0], dependencies)();
    compile(handler("handleVideoProgress"), dependencies)();
    compile(handler("handleSummaryView"), dependencies)();
    compile(handler("handlePracticeComplete"), dependencies)();
    assert.deepEqual([state.video, state.summary, state.practice], [true, true, true]);
    await tick();
    assert.ok(getStoredAchievements(account).robotsbuildingeducation_review_videos_1);
    resolveRead({ data: () => ({ moduleProgressByCourse: { en: { 1: {
      videoWatched: false, summaryViewed: false, practiceCompleted: false,
    } } } }) });
    await tick();
    assert.deepEqual(state, { video: true, summary: true, practice: true, loaded: "en:1" });
    const saveEffect = nodes.find(node => node.type === "CallExpression" && node.callee.name === "useEffect" &&
      node.arguments[1]?.elements?.some(dependency => dependency.name === "hasPracticedModule"));
    assert.ok(saveEffect.arguments[1].elements.some(dependency => dependency.name === "loadedReviewIdentity"), "loading completion triggers a render/effect even if all flags were already true");
    await compile(handler("checkAndUpdateProgress"), { ...dependencies, loadedReviewIdentity: state.loaded,
      videoDurationDetection: state.video, hasViewedSummary: state.summary, hasPracticedModule: state.practice,
    })();
    assert.deepEqual(saves[0]["moduleProgressByCourse.en.1"], { videoWatched: true, summaryViewed: true, practiceCompleted: true });
    assert.ok(getStoredAchievements(account).robotsbuildingeducation_review_checklists_1);
    assert.ok(awards.some(event => event.metric === "review_checklists"));
    cleanup();
  } finally {
    unlockStore.setIdentity("");
    if (previous.window === undefined) delete globalThis.window; else globalThis.window = previous.window;
    if (previous.storage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous.storage;
  }
});
