import test from "node:test";
import assert from "node:assert/strict";
import {
  CREATOR_NPUB,
  isCreatorAccount,
  isPatreonAuthEnabled,
  resolveSubscriptionAccess,
} from "./patreonFeature.js";

test("enables Patreon only for an explicit true value", () => {
  assert.equal(
    isPatreonAuthEnabled({ VITE_PATREON_AUTH_ENABLED: "true" }),
    true,
  );
  assert.equal(
    isPatreonAuthEnabled({ VITE_PATREON_AUTH_ENABLED: "false" }),
    false,
  );
  assert.equal(isPatreonAuthEnabled({}), false);
});

test("requires Patreon authorization after the production cutover", () => {
  assert.deepEqual(
    resolveSubscriptionAccess({
      patreonEnabled: true,
      patreonAuthorized: false,
      legacyPasscodeVerified: true,
    }),
    {
      authorized: false,
      requiresPatreonMigration: true,
    },
  );
});

test("allows an authorized Patreon member", () => {
  assert.equal(
    resolveSubscriptionAccess({
      patreonEnabled: true,
      patreonAuthorized: true,
      legacyPasscodeVerified: false,
    }).authorized,
    true,
  );
});

test("allows the creator account without Patreon authorization", () => {
  assert.equal(isCreatorAccount(CREATOR_NPUB), true);
  assert.equal(isCreatorAccount("npub1someoneelse"), false);
  assert.deepEqual(
    resolveSubscriptionAccess({
      patreonEnabled: true,
      creatorAuthorized: true,
    }),
    {
      authorized: true,
      requiresPatreonMigration: false,
    },
  );
});

test("preserves legacy access when the feature is rolled back", () => {
  assert.equal(
    resolveSubscriptionAccess({
      patreonEnabled: false,
      patreonAuthorized: false,
      legacyPasscodeVerified: true,
    }).authorized,
    true,
  );
});
