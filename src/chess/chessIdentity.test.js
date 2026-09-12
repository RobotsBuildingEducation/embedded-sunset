import test from "node:test";
import assert from "node:assert/strict";
import { getPublicKey, nip19 } from "nostr-tools";
import { ensureIdentity } from "./chessApi.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("new identities use matching Nostr keys and are restored without replacement", () => {
  const storage = memoryStorage();
  const first = ensureIdentity(storage);
  const privateKey = storage.getItem("local_nsec");
  assert.match(first.npub, /^npub1/);
  assert.equal(
    nip19.npubEncode(getPublicKey(nip19.decode(privateKey).data)),
    first.npub,
  );
  assert.deepEqual(ensureIdentity(storage), first);
  assert.equal(storage.getItem("local_nsec"), privateKey);
  assert.equal(storage.getItem("uniqueId"), first.npub);
});

test("a partially saved account is recovered from its secret instead of regenerated", () => {
  const original = memoryStorage();
  const identity = ensureIdentity(original);
  const partial = memoryStorage({ local_nsec: original.getItem("local_nsec") });
  assert.deepEqual(ensureIdentity(partial), identity);
});

test("mismatched and corrupt saved keys are preserved for recovery", () => {
  const first = memoryStorage();
  const second = memoryStorage();
  ensureIdentity(first);
  ensureIdentity(second);
  const npub = second.getItem("local_npub");
  first.setItem("local_npub", npub);
  assert.throws(() => ensureIdentity(first), /do not match/);
  assert.equal(first.getItem("local_npub"), npub);
  const corrupt = memoryStorage({ local_nsec: "damaged" });
  assert.throws(() => ensureIdentity(corrupt), /could not be read/);
  assert.equal(corrupt.getItem("local_nsec"), "damaged");
});
