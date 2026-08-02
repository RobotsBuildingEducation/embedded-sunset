import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyPatreonReplacementResponse,
  createPatreonRecheckGate,
  resolvePatreonStatus,
  shouldRestorePatreonSession,
  shouldShowLegacyPatreonMigration,
} from "./patreonRecoveryState.js";

test("only a verified legacy passcode marker triggers Patreon migration", () => {
  assert.equal(shouldShowLegacyPatreonMigration(), false);
  assert.equal(shouldShowLegacyPatreonMigration({ passcodeVerified: false, patreonVerified: false }), false);
  assert.equal(shouldShowLegacyPatreonMigration({ passcodeVerified: true, patreonVerified: false }), true);
  assert.equal(shouldShowLegacyPatreonMigration({ passcodeVerified: true, patreonVerified: true }), false);
});

test("settings and paywall restore a linked key when the browser session is missing", () => {
  assert.equal(shouldRestorePatreonSession({}, true), true);
  assert.equal(shouldRestorePatreonSession({ authorized: true }, true), false);
  assert.equal(shouldRestorePatreonSession({ connected: true, checkoutRequired: true }, true), false);
  assert.equal(shouldRestorePatreonSession({ linked: true }, true), false);
  assert.equal(shouldRestorePatreonSession({ replacementRequired: true, reason: "replace_required" }, true), false);
  assert.equal(shouldRestorePatreonSession({ checkoutRequired: true }, true), false);
  assert.equal(shouldRestorePatreonSession({ reason: "active_key_changed" }, true), true);
  assert.equal(shouldRestorePatreonSession({}, false), false);
});

test("a Patreon replacement response is not overwritten by key restoration", async () => {
  let restoreCalls = 0;
  const replacement = {
    authorized: false,
    configured: true,
    linked: false,
    replacementRequired: true,
    reason: "replace_required",
    subscription: { status: "active", entitlementAmountCents: 100 },
  };

  const payload = await resolvePatreonStatus({
    npub: "npub1replacement",
    canRestore: true,
    getStatus: async () => replacement,
    restoreStatus: async () => {
      restoreCalls += 1;
      return { authorized: false, linked: false, subscription: null };
    },
  });

  assert.equal(restoreCalls, 0);
  assert.deepEqual(payload, replacement);
});

test("settings and paywall resolve Patreon through the same status and restore sequence", async () => {
  const calls = [];
  const payload = await resolvePatreonStatus({
    npub: "npub1current",
    canRestore: true,
    getStatus: async (npub) => {
      calls.push(["status", npub]);
      return { authorized: false, linked: false };
    },
    restoreStatus: async (npub) => {
      calls.push(["restore", npub]);
      return {
        authorized: true,
        linked: true,
        subscription: { status: "active" },
      };
    },
  });

  assert.deepEqual(calls, [
    ["status", "npub1current"],
    ["restore", "npub1current"],
  ]);
  assert.equal(payload.authorized, true);
  assert.equal(payload.subscription.status, "active");
});

test("replacement success and restartable failures match the Piyali outcomes", () => {
  assert.deepEqual(classifyPatreonReplacementResponse(true, { authorized: true }), { kind: "success", error: "" });
  assert.deepEqual(classifyPatreonReplacementResponse(false, { error: "replacement_expired" }), { kind: "restart", error: "replacement_expired" });
  assert.deepEqual(classifyPatreonReplacementResponse(false, { error: "membership_not_active" }), { kind: "restart", error: "membership_not_active" });
  assert.deepEqual(classifyPatreonReplacementResponse(false, {}), { kind: "failure", error: "replacement_failed" });
});

test("focus and visibility rechecks ignore hidden and duplicate events", () => {
  let currentTime = 2_000;
  const shouldRecheck = createPatreonRecheckGate({ minimumIntervalMs: 1500, now: () => currentTime });
  assert.equal(shouldRecheck("hidden"), false);
  assert.equal(shouldRecheck("visible"), true);
  currentTime += 200;
  assert.equal(shouldRecheck("visible"), false);
  currentTime += 1500;
  assert.equal(shouldRecheck("visible"), true);
});
