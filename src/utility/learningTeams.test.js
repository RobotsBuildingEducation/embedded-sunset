import assert from "node:assert/strict";
import test from "node:test";
import { finalizeEvent, getPublicKey, nip19 } from "nostr-tools";
import { activeSigner, loadNostrProfileNames, makeProgressSnapshot, newestReplaceable, parseTeams, teamNaddr, toHexPubkey, usableProfileName } from "./learningTeams.js";

const creatorSecret = new Uint8Array(32).fill(1);
const memberSecret = new Uint8Array(32).fill(2);
const creator = getPublicKey(creatorSecret);
const member = getPublicKey(memberSecret);
const id = "0123456789abcdef0123456789abcdef";

const signed = (secret, tags, created_at, content = "") => finalizeEvent({ kind: 30078, created_at, tags, content }, secret);
const team = (created_at, extraTags = []) => signed(creatorSecret, [["d", `learning-team:${id}`], ["t", "learning-team"], ["name", "Study"], ["p", creator], ["p", member], ...extraTags], created_at, JSON.stringify({ name: "Study", createdAt: 100 }));
const leave = (created_at) => signed(memberSecret, [["d", `learning-team-left:${creator}:${id}`], ["t", "learning-team-left"], ["a", `30078:${creator}:learning-team:${id}`]], created_at);

test("team address uses the creator, kind, id, and configured relays", () => {
  assert.equal(toHexPubkey(nip19.npubEncode(member)), member);
  const decoded = nip19.decode(teamNaddr(creator, id));
  assert.equal(decoded.type, "naddr");
  assert.equal(decoded.data.kind, 30078);
  assert.equal(decoded.data.pubkey, creator);
  assert.equal(decoded.data.identifier, `learning-team:${id}`);
  assert.deepEqual(decoded.data.relays, [
    "wss://relay.primal.net",
    "wss://relay.ditto.pub",
    "wss://nos.lol",
  ]);
});

test("newest replacement, leave, re-add, and delete control membership", () => {
  assert.equal(newestReplaceable([team(100), team(101)]).length, 1);
  assert.equal(parseTeams([team(100)], [leave(100)], member).length, 0);
  assert.equal(parseTeams([team(100), team(101)], [leave(100)], member).length, 1);
  assert.equal(parseTeams([team(100), team(102, [["deleted", ""]])], [], member).length, 0);
  assert.equal(parseTeams([team(100)], [], member)[0].members.length, 2);
});

test("progress does not label an XP copy as a 0–100 score", () => {
  const old = makeProgressSnapshot({ score: 400, xp: 400, dailyGoalXp: 20, dailyXp: 15 });
  assert.equal(old.score, undefined);
  assert.equal(old.progressPercent, 75);
  const current = makeProgressSnapshot({ score: 72, scoreScale: "0-100", dailyGoalXp: 20, dailyXp: 40 });
  assert.equal(current.score, 72);
  assert.equal(current.progressPercent, 100);
});

test("profile names prefer the latest verified display name", async () => {
  const profile = (secret, created_at, content) =>
    finalizeEvent({ kind: 0, created_at, tags: [], content }, secret);
  const names = await loadNostrProfileNames([member], async () => [
    profile(memberSecret, 100, JSON.stringify({ name: "test" })),
    profile(
      memberSecret,
      101,
      JSON.stringify({ name: "test", display_name: "Sheilfer Zepeda" }),
    ),
    profile(creatorSecret, 102, JSON.stringify({ name: "Other" })),
  ]);
  assert.equal(names.get(member), "Sheilfer Zepeda");
  assert.equal(names.has(creator), false);
});

test("missing names and identifier placeholders are not treated as names", () => {
  assert.equal(usableProfileName("   "), "");
  assert.equal(usableProfileName(`${member.slice(0, 12)}…`), "");
  assert.equal(usableProfileName(nip19.npubEncode(member).slice(0, 12)), "");
  assert.equal(usableProfileName("  Sheilfer Zepeda  "), "Sheilfer Zepeda");
});

test("activeSigner signs events using stored nsec", async () => {
  const nsec = nip19.nsecEncode(memberSecret);
  const originalLocalStorage = global.localStorage;
  global.localStorage = {
    getItem: (key) => (key === "local_nsec" ? nsec : null),
  };
  try {
    const signer = await activeSigner(nip19.npubEncode(member));
    const event = await signer({
      kind: 22242,
      created_at: 100,
      tags: [["relay", "wss://relay.ditto.pub"]],
      content: "",
    });
    assert.equal(event.pubkey, member);
    assert.equal(typeof event.sig, "string");
  } finally {
    global.localStorage = originalLocalStorage;
  }
});
