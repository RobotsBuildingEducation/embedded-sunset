import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPatreonModalReturnPath,
  completePatreonModalReturn,
  clearPatreonModalReopen,
  consumePatreonModalReturn,
  hasPendingPatreonModalReturn,
  rememberPatreonModalReturn,
  shouldReopenPatreonModal,
} from "./patreonOAuthReturn.js";

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
    storage,
    now,
  }), true);
  assert.equal(hasPendingPatreonModalReturn({ storage, now }), true);
  assert.equal(shouldReopenPatreonModal({ storage }), true);

  const completed = completePatreonModalReturn("replace_required", { storage, now: now + 100 });
  assert.equal(completed.returnPath, "/q/12?mode=learn#answer");
  assert.equal(hasPendingPatreonModalReturn({ storage, now: now + 100 }), false);
  assert.deepEqual(consumePatreonModalReturn({ storage, now: now + 100 }), completed);
  assert.equal(consumePatreonModalReturn({ storage, now: now + 100 }), null);
  assert.equal(shouldReopenPatreonModal({ storage }), true);
  clearPatreonModalReopen({ storage });
  assert.equal(shouldReopenPatreonModal({ storage }), false);
});

test("the OAuth return route carries an explicit one-use modal marker", () => {
  assert.equal(
    buildPatreonModalReturnPath("/q/12?mode=learn#answer", "replace_required"),
    "/q/12?mode=learn&patreon_modal=1&patreon_result=replace_required#answer",
  );
});
