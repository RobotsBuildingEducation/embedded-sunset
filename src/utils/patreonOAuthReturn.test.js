import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPatreonCompletedReturnPath,
  buildPatreonModalReturnPath,
  completePatreonModalReturn,
  clearPatreonModalReopen,
  consumePatreonModalReturn,
  hasPendingPatreonModalReturn,
  hasPatreonOAuthReturn,
  normalizePatreonReturnLanguage,
  normalizePatreonReturnResult,
  rememberPatreonModalReturn,
  rememberPatreonPageReturn,
  sanitizePatreonReturnPath,
  shouldReopenPatreonModal,
} from "./patreonOAuthReturn.js";

test("startup routing preserves a typed Patreon callback destination", () => {
  assert.equal(hasPatreonOAuthReturn("?patreon_result=connected"), true);
  assert.equal(
    hasPatreonOAuthReturn("?patreon_modal=1&patreon_result=replace_required"),
    true,
  );
  assert.equal(hasPatreonOAuthReturn("?patreon=checkout_required"), true);
  assert.equal(hasPatreonOAuthReturn("?unrelated=1"), false);
});

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("same-tab OAuth returns to the original route and reopens the modal once", () => {
  const storage = memoryStorage();
  const now = 1_000;
  assert.equal(rememberPatreonModalReturn({
    location: { pathname: "/q/12", search: "?mode=learn", hash: "#answer" },
    npub: "npub1current",
    storage,
    now,
  }), true);
  assert.equal(hasPendingPatreonModalReturn({ storage, now }), true);
  assert.equal(shouldReopenPatreonModal({ storage, npub: "npub1current", now }), true);
  assert.equal(shouldReopenPatreonModal({ storage, npub: "npub1different", now }), false);

  const completed = completePatreonModalReturn("replace_required", { storage, now: now + 100 });
  assert.equal(completed.returnPath, "/q/12?mode=learn#answer");
  assert.equal(hasPendingPatreonModalReturn({ storage, now: now + 100 }), false);
  assert.equal(shouldReopenPatreonModal({ storage, npub: "npub1current", now: now + 100 }), true);
  assert.deepEqual(consumePatreonModalReturn({ storage, now: now + 100 }), completed);
  assert.equal(consumePatreonModalReturn({ storage, now: now + 100 }), null);
  assert.equal(shouldReopenPatreonModal({ storage, npub: "npub1current", now: now + 100 }), false);
  clearPatreonModalReopen({ storage });
  assert.equal(shouldReopenPatreonModal({ storage }), false);
});

test("the OAuth return route carries an explicit one-use modal marker", () => {
  assert.equal(
    buildPatreonModalReturnPath("/q/12?mode=learn#answer", "replace_required"),
    "/q/12?mode=learn&patreon_modal=1&patreon_result=replace_required#answer",
  );
});

test("page OAuth returns internally only when the original container has pending state", () => {
  const storage = memoryStorage();
  assert.equal(rememberPatreonPageReturn({
    npub: "npub1current",
    storage,
    now: 1_000,
  }), true);
  const completed = completePatreonModalReturn("connected", {
    storage,
    now: 1_100,
  });
  assert.equal(completed.reopenModal, false);
  assert.equal(
    buildPatreonCompletedReturnPath(completed, "connected"),
    "/subscription?patreon_result=connected",
  );
});

test("callback return values reject open redirects and unknown results", () => {
  assert.equal(sanitizePatreonReturnPath("https://evil.example/steal"), "/");
  assert.equal(sanitizePatreonReturnPath("//evil.example/steal"), "/");
  assert.equal(sanitizePatreonReturnPath("/q/12?mode=learn#answer"), "/q/12?mode=learn#answer");
  assert.equal(normalizePatreonReturnResult("not-a-real-result"), "oauth_error");
});

test("server-carried Patreon return language overrides browser fallback safely", () => {
  assert.equal(normalizePatreonReturnLanguage("es", "en-US"), "es");
  assert.equal(normalizePatreonReturnLanguage("en", "es-MX"), "en");
  assert.equal(normalizePatreonReturnLanguage("", "es-MX"), "es");
  assert.equal(normalizePatreonReturnLanguage("../../es", "en-US"), "en");
});

test("storage denial does not crash callback bookkeeping", () => {
  const deniedStorage = {
    getItem() { throw new Error("denied"); },
    setItem() { throw new Error("denied"); },
    removeItem() { throw new Error("denied"); },
  };
  assert.equal(rememberPatreonPageReturn({ storage: deniedStorage }), false);
  assert.equal(completePatreonModalReturn("connected", { storage: deniedStorage }), null);
  assert.equal(shouldReopenPatreonModal({ storage: deniedStorage }), false);
});
