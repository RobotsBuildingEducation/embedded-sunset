import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";

// Exercise the actual startup effect without loading Firebase or the UI.
const source = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
const nodes = [];
const walk = (node) => {
  if (!node || typeof node !== "object") return;
  if (node.type) nodes.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") walk(value);
  }
};
walk(ast);
const startupEffect = nodes.find((node) =>
  node.type === "CallExpression" && node.callee.name === "useEffect" &&
  source.slice(node.start, node.end).includes("const initializeApp = async"),
);
const compile = (node, dependencies) => Function(
  ...Object.keys(dependencies),
  `return (${source.slice(node.start, node.end).replaceAll("import.meta.env", "env")});`,
)(...Object.values(dependencies));

const start = (pathname, overrides = {}) => {
  const navigations = [];
  const errors = [];
  const storage = new Map([["local_npub", "test-account"]]);
  const location = { pathname, search: "", href: `https://example.test${pathname}` };
  let finish;
  const done = new Promise((resolve) => { finish = resolve; });
  const noop = () => {};
  const dependencies = {
    env: { VITE_PATREON_PASSCODE: "test-passcode" },
    window: { location, setTimeout: () => 1, scrollTo: noop },
    location: { ...location },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    console: { warn: noop, error: (...args) => errors.push(args) },
    clearTimeout: noop,
    navigateOnStartup: (...args) => navigations.push(args),
    setLoading: () => finish(),
    showAlert: (...args) => errors.push(args),
    getErrorMessage: (error) => error.message,
    hasPatreonOAuthReturn: () => false,
    isCreatorAccount: () => false,
    ensureAppCheckReady: async () => {},
    getUserStep: async () => 3,
    getOnboardingStep: async () => 5,
    setIsSignedIn: noop,
    setCurrentStep: noop,
    database: {},
    doc: () => ({}),
    getDoc: async () => ({ exists: () => true, data: () => ({
      step: 3, language: "en", allowPosts: true, isAdaptiveLearning: true,
    }) }),
    applyUserThemePreferences: noop,
    setColorMode: noop,
    resolveAccountLanguage: () => "en",
    getInitialUserLanguage: () => "en",
    steps: { en: Array.from({ length: 20 }, () => ({})) },
    setHasSubmittedPasscode: noop,
    setUserLanguage: noop,
    setAllowPosts: noop,
    setIsAdaptiveLearning: noop,
    PATREON_AUTH_ENABLED: false,
    tutorialEndIndex: 19,
    setPatreonAuthorizedNpub: noop,
    resolveSubscriptionAccess: () => ({ authorized: true }),
    userLanguage: "en",
    ...overrides,
  };
  const cleanup = compile(startupEffect.arguments[0], dependencies)();
  return { done, cleanup, location, navigations, errors };
};

test("notifications onboarding stays open despite a stale saved question step", async () => {
  const run = start("/onboarding/5");
  await run.done;
  assert.deepEqual(run.errors, []);
  assert.deepEqual(run.navigations, []);
  run.cleanup();
});

test("other explicit onboarding screens also keep ownership of their Continue action", async () => {
  for (const step of [1, 2, 3, 6]) {
    const run = start(`/onboarding/${step}`);
    await run.done;
    assert.deepEqual(run.errors, []);
    assert.deepEqual(run.navigations, []);
    run.cleanup();
  }
});

test("startup still restores saved question progress from the home route", async () => {
  const run = start("/", { getOnboardingStep: async () => "done" });
  await run.done;
  assert.deepEqual(run.errors, []);
  assert.deepEqual(run.navigations, [["/q/3"]]);
  run.cleanup();
});

test("a delayed progress response cannot replace a newly opened notifications screen", async () => {
  let resolveProgress;
  let readingProgress;
  const started = new Promise((resolve) => { readingProgress = resolve; });
  const progress = new Promise((resolve) => { resolveProgress = resolve; });
  const run = start("/", { getOnboardingStep: () => {
    readingProgress();
    return progress;
  } });
  await started;
  run.location.pathname = "/onboarding/5";
  resolveProgress("done");
  await run.done;
  assert.deepEqual(run.errors, []);
  assert.deepEqual(run.navigations, []);
  run.cleanup();
});

test("route changes cannot retrigger startup through BrowserRouter's changing navigate function", () => {
  const dependencies = startupEffect.arguments[1].elements.map((node) => node.name);
  assert.ok(dependencies.includes("navigateOnStartup"));
  assert.ok(!dependencies.includes("navigate"));
  const navigation = nodes.find((node) =>
    node.type === "VariableDeclarator" && node.id.name === "navigateOnStartup",
  ).init;
  assert.equal(navigation.arguments[1].elements.length, 0);
  const navigations = [];
  const ref = { current: () => navigations.push("initial") };
  const stableNavigate = compile(navigation.arguments[0], { startupNavigateRef: ref });
  stableNavigate("/q/1");
  ref.current = () => navigations.push("updated");
  stableNavigate("/onboarding/5");
  assert.deepEqual(navigations, ["initial", "updated"]);
});
