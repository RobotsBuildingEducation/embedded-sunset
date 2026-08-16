import test from "node:test";
import assert from "node:assert/strict";
import { simulateCliCommand } from "./terminalSimulator.js";

test("simulates firebase deploy commands accurately", () => {
  const rulesOutput = simulateCliCommand("firebase deploy --only firestore:rules");
  assert.match(rulesOutput, /deploying firestore:rules/);
  assert.match(rulesOutput, /Deploy complete!/);

  const hostingOutput = simulateCliCommand("firebase deploy --only hosting");
  assert.match(hostingOutput, /deploying hosting/);

  const defaultOutput = simulateCliCommand("firebase login");
  assert.match(defaultOutput, /Already logged in/);
});

test("simulates git commands accurately", () => {
  const commitOutput = simulateCliCommand('git commit -m "fix security rules"');
  assert.match(commitOutput, /fix security rules/);

  const statusOutput = simulateCliCommand("git status");
  assert.match(statusOutput, /On branch main/);

  const pushOutput = simulateCliCommand("git push origin main");
  assert.match(pushOutput, /Writing objects: 100%/);
});

test("simulates npm and node commands accurately", () => {
  const npmOutput = simulateCliCommand("npm install firebase");
  assert.match(npmOutput, /added 1 package \[firebase\]/);

  const nodeVersion = simulateCliCommand("node -v");
  assert.equal(nodeVersion, "v20.11.0");
});

test("provides fallback execution output for unrecognized commands", () => {
  const custom = simulateCliCommand("some-custom-tool --flag");
  assert.equal(custom, "[Executed: some-custom-tool --flag]");
});
