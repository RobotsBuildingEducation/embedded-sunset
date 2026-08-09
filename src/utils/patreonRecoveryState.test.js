import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyPatreonReplacementResponse,
  createPatreonRecheckGate,
  replaceAndResolvePatreonStatus,
  resolvePatreonStatus,
  shouldRestorePatreonSession,
  shouldShowPatreonReplacement,
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

test("a typed OAuth return can force key-bound restoration", async () => {
  let restoreCalls = 0;
  const payload = await resolvePatreonStatus({
    npub: "npub1returned",
    canRestore: true,
    preferRestore: true,
    getStatus: async () => ({
      authorized: false,
      connected: true,
      checkoutRequired: true,
    }),
    restoreStatus: async () => {
      restoreCalls += 1;
      return {
        authorized: true,
        linked: true,
        subscription: { status: "active" },
      };
    },
  });

  assert.equal(restoreCalls, 1);
  assert.equal(payload.authorized, true);
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

test("a lost replacement response reconciles through the signed key before failing", async () => {
  const calls = [];
  const payload = await replaceAndResolvePatreonStatus({
    npub: "npub1mobile",
    canRestore: true,
    replaceLink: async () => {
      calls.push("replace");
      throw Object.assign(new Error("replacement_expired"), {
        payload: { error: "replacement_expired" },
      });
    },
    getStatus: async () => {
      calls.push("status");
      return { authorized: false, linked: false };
    },
    restoreStatus: async () => {
      calls.push("restore");
      return { authorized: true, linked: true };
    },
  });

  assert.deepEqual(calls, ["replace", "status", "restore"]);
  assert.equal(payload.authorized, true);
});

test("an empty successful replacement response is reconciled from status", async () => {
  let restoreCalls = 0;
  const payload = await replaceAndResolvePatreonStatus({
    npub: "npub1mobile",
    canRestore: false,
    replaceLink: async () => ({}),
    getStatus: async () => ({ authorized: true, linked: true }),
    restoreStatus: async () => {
      restoreCalls += 1;
      return { authorized: true };
    },
  });

  assert.equal(payload.authorized, true);
  assert.equal(restoreCalls, 0);
});

test("a genuinely failed replacement preserves its original error", async () => {
  const originalError = Object.assign(new Error("membership_not_active"), {
    payload: { error: "membership_not_active" },
  });
  await assert.rejects(
    replaceAndResolvePatreonStatus({
      npub: "npub1mobile",
      canRestore: true,
      replaceLink: async () => { throw originalError; },
      getStatus: async () => ({ authorized: false, linked: false }),
      restoreStatus: async () => ({
        authorized: false,
        replacementRequired: true,
      }),
    }),
    (error) => error === originalError,
  );
});

test("a stale replace-required return cannot pin the modal after success", () => {
  assert.equal(shouldShowPatreonReplacement({
    statusPayload: null,
    returnResult: "replace_required",
    isResolved: false,
  }), true);
  assert.equal(shouldShowPatreonReplacement({
    statusPayload: { replacementRequired: true },
    returnResult: "replace_required",
    isResolved: true,
  }), true);
  assert.equal(shouldShowPatreonReplacement({
    statusPayload: { authorized: true, replacementRequired: false },
    returnResult: "replace_required",
    isResolved: true,
  }), false);
  assert.equal(shouldShowPatreonReplacement({
    statusPayload: { authorized: false, replacementRequired: false },
    returnResult: "replace_required",
    isResolved: true,
  }), false);
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

test("an older status generation cannot publish after a newer check starts", async () => {
  let current = true;
  let restoreCalls = 0;
  const payload = await resolvePatreonStatus({
    npub: "npub1current",
    canRestore: true,
    getStatus: async () => {
      current = false;
      return { authorized: false, linked: false };
    },
    restoreStatus: async () => {
      restoreCalls += 1;
      return { authorized: true };
    },
    isCurrent: () => current,
  });

  assert.equal(payload, null);
  assert.equal(restoreCalls, 0);
});
