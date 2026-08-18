import test from "node:test";
import assert from "node:assert/strict";
import { getDittoBadgeUrl } from "./badgeUrl.js";

test("returns null for empty or invalid input", () => {
  assert.equal(getDittoBadgeUrl(null), null);
  assert.equal(getDittoBadgeUrl(""), null);
  assert.equal(getDittoBadgeUrl("   "), null);
});

test("returns ditto.pub URL directly when already an naddr", () => {
  const naddr = "naddr1qq84xatwwdjhgt25w46x7unfv9kqyg9ty9kqftakjrsw5p55z5nnsqwxld6xns5darqsrey7kqcuqrlz6upsgqqqw5usc665uz";
  assert.equal(getDittoBadgeUrl(naddr), `https://ditto.pub/${naddr}`);
});

test("encodes kind:pubkey:identifier into naddr for ditto.pub", () => {
  const coord = "30008:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0d604b0af398a6:Sunset-Tutorial";
  const url = getDittoBadgeUrl(coord);
  assert.ok(url.startsWith("https://ditto.pub/naddr1"));
});
