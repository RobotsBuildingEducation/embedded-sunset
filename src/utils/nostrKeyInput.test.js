import assert from "node:assert/strict";
import test from "node:test";
import { nip19 } from "nostr-tools";
import { isNsecSecretKey } from "./nostrKeyInput.js";

test("detects a valid nsec secret key", () => {
  const nsec = nip19.nsecEncode(new Uint8Array(32).fill(1));

  assert.equal(isNsecSecretKey(nsec), true);
  assert.equal(isNsecSecretKey(`  ${nsec}  `), true);
});

test("does not mistake ordinary usernames for secret keys", () => {
  assert.equal(isNsecSecretKey("alice"), false);
  assert.equal(isNsecSecretKey("nsecurity"), false);
  assert.equal(isNsecSecretKey("nsec1-not-a-valid-key"), false);
});
