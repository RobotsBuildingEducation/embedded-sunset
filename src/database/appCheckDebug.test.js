import assert from "node:assert/strict";
import test from "node:test";
import { getLocalAppCheckDebugToken } from "./appCheckDebug.js";

test("reuses the configured debug token on each local preview hostname", () => {
  for (const hostname of ["localhost", "127.0.0.1", "::1", "[::1]"]) {
    assert.equal(getLocalAppCheckDebugToken(hostname, " local-token "), "local-token");
  }
});

test("keeps the SDK debug-token setup available before a token is configured", () => {
  assert.equal(getLocalAppCheckDebugToken("localhost", ""), true);
  assert.equal(getLocalAppCheckDebugToken("127.0.0.1"), true);
});

test("never enables debug tokens on published sites or lookalike hosts", () => {
  for (const hostname of ["robotsbuildingeducation.com", "embedded-sunset.app", "localhost.example.com"]) {
    assert.equal(getLocalAppCheckDebugToken(hostname, "local-token"), undefined);
  }
});
