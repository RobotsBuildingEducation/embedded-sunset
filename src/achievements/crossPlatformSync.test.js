import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { finalizeEvent, generateSecretKey, getPublicKey, nip19, SimplePool, verifyEvent } from "nostr-tools";

const services = await import(existsSync(new URL("../utils/achievements.js", import.meta.url)) ? "../utils/achievements.js" : "../utility/achievements.js");
const { ACHIEVEMENT_D, ACHIEVEMENT_SOURCE, ACHIEVEMENT_RELAYS, buildAchievementEvent, parseAchievementEvent, storeAchievements, getStoredAchievements, syncAchievements } = services;
const otherSource = ACHIEVEMENT_SOURCE === "nosabos" ? "robotsbuildingeducation" : "nosabos";
const record = (source, unlockedAt = 1) => ({ source, unlockedAt });
const address = event => event.tags.find(tag => tag[0] === "d")[1];

async function session(t, run) {
  const originalWindow = globalThis.window, originalStorage = globalThis.localStorage;
  const secret = generateSecretKey(), pubkey = getPublicKey(secret), npub = nip19.npubEncode(pubkey);
  const storage = new Map(), signatures = [];
  globalThis.window = { nostr: { getPublicKey: async () => pubkey, signEvent: async template => {
    signatures.push(template); return finalizeEvent(template, secret);
  } } }; // No document: disable cloud/background jobs and all real networking.
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  localStorage.setItem("local_npub", npub); localStorage.setItem("nip07_signer", "true");
  const relays = new Map();
  const makeEvent = (awards, options) => finalizeEvent(buildAchievementEvent(awards, options), secret);
  function fakeRelay(url) {
    const stored = new Map(), publications = [];
    let authenticated = false;
    const state = {
      stored, publications, readAuth: false, writeAuth: false, failure: "", duringRead: null,
      async auth(sign) {
        const auth = await sign({ kind: 22242, created_at: Math.floor(Date.now() / 1000), content: "", tags: [["relay", url], ["challenge", "test-challenge"]] });
        assert.ok(verifyEvent(auth)); assert.equal(auth.pubkey, pubkey);
        authenticated = true;
      },
      prepareSubscription([filter], handlers) {
        let closed = false;
        return {
          fire() { queueMicrotask(() => {
            if (closed) return;
            if (state.failure) return handlers.onclose(state.failure);
            if (state.readAuth && !authenticated) return handlers.onclose("auth-required: authenticate author");
            for (const event of stored.values()) if (filter["#d"].includes(address(event))) handlers.onevent(event);
            state.duringRead?.(); handlers.oneose();
          }); },
          close() { if (!closed) { closed = true; handlers.onclose("closed by caller"); } },
        };
      },
      async publish(event) {
        if (state.writeAuth && !authenticated) throw new Error("auth-required: authenticate publisher");
        publications.push(event);
        const previous = stored.get(address(event));
        if (!previous || event.created_at > previous.created_at || (event.created_at === previous.created_at && event.id < previous.id)) stored.set(address(event), event);
        return "accepted";
      },
    };
    return state;
  }
  ACHIEVEMENT_RELAYS.forEach(url => relays.set(url, fakeRelay(url)));
  const ensure = t.mock.method(SimplePool.prototype, "ensureRelay", async url => relays.get(url.replace(/\/$/, "")));
  try { await run({ npub, pubkey, secret, signatures, relays: [...relays.values()], makeEvent }); }
  finally {
    ensure.mock.restore();
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
}

test("two independent app writes retain separate addresses and both appear after reconciliation", t => session(t, async ({ npub, relays, makeEvent }) => {
  const piyali = makeEvent({ nosabos_tutor_lessons_5: record("nosabos") }, { source: "nosabos" });
  const robots = makeEvent({ robots_chapter_tutorial: record("robotsbuildingeducation") }, { source: "robotsbuildingeducation" });
  await relays[0].publish(piyali); await relays[0].publish(robots);
  assert.notEqual(address(piyali), address(robots));
  const synced = await syncAchievements(npub, { strict: true });
  assert.ok(synced.nosabos_tutor_lessons_5); assert.ok(synced.robots_chapter_tutorial);
  assert.ok(parseAchievementEvent(relays[0].stored.get(`${ACHIEVEMENT_D}:${ACHIEVEMENT_SOURCE}`)).robots_chapter_tutorial);
  assert.ok(relays[0].stored.has(`${ACHIEVEMENT_D}:${otherSource}`));
}));

test("divergent legacy relay snapshots recover both apps and migrate to the host address", t => session(t, async ({ npub, relays, makeEvent }) => {
  const piyali = makeEvent({ nosabos_tutor_lessons_5: record("nosabos") }, { createdAt: 100 });
  const robots = makeEvent({ robots_chapter_tutorial: record("robotsbuildingeducation") }, { createdAt: 200 });
  relays[0].stored.set(ACHIEVEMENT_D, piyali); relays[1].stored.set(ACHIEVEMENT_D, robots);
  relays[1].readAuth = true;
  const synced = await syncAchievements(npub, { strict: true });
  assert.ok(synced.nosabos_tutor_lessons_5); assert.ok(synced.robots_chapter_tutorial);
  for (const relay of relays) {
    const published = relay.publications.at(-1);
    assert.equal(address(published), `${ACHIEVEMENT_D}:${ACHIEVEMENT_SOURCE}`);
    assert.deepEqual(parseAchievementEvent(published), synced);
  }
}));

test("relay authentication signs ephemeral challenges on both reads and writes", t => session(t, async ({ npub, relays, signatures }) => {
  relays[0].readAuth = true; relays[1].writeAuth = true;
  storeAchievements(npub, { nosabos_phonics_decks_1: record("nosabos") }, { schedule: false });
  await syncAchievements(npub, { strict: true });
  await new Promise(resolve => setImmediate(resolve)); // Let all successful publications settle.
  assert.equal(signatures.filter(template => template.kind === 22242).length, 2);
  assert.ok(relays[1].publications.length);
  assert.ok(relays.every(relay => relay.publications.every(event => event.kind === 30078)));
}));

test("failed reads keep local awards and reject strict sync so the retry worker stays pending", t => session(t, async ({ npub, relays }) => {
  relays.forEach(relay => { relay.failure = "restricted: offline"; });
  const local = { nosabos_phonics_decks_1: record("nosabos") };
  storeAchievements(npub, local, { schedule: false });
  const warning = t.mock.method(console, "warn", () => {});
  try { await assert.rejects(syncAchievements(npub, { strict: true }), AggregateError); }
  finally { warning.mock.restore(); }
  assert.deepEqual(getStoredAchievements(npub), local);
  assert.ok(relays.every(relay => relay.publications.length === 0));
}));

test("same-second updates advance the host timestamp and include awards earned during reads", t => session(t, async ({ npub, relays, makeEvent }) => {
  const now = Math.floor(Date.now() / 1000);
  const clock = t.mock.method(Date, "now", () => now * 1000);
  try {
    const previous = makeEvent({ nosabos_phonics_decks_1: record("nosabos") }, { source: ACHIEVEMENT_SOURCE, createdAt: now });
    relays.forEach(relay => relay.stored.set(address(previous), previous));
    relays[0].duringRead = () => storeAchievements(npub, { ...getStoredAchievements(npub), robots_chapter_tutorial: record("robotsbuildingeducation") }, { schedule: false });
    const synced = await syncAchievements(npub, { strict: true });
    const published = relays[0].stored.get(address(previous));
    assert.equal(published.created_at, now + 1);
    assert.deepEqual(parseAchievementEvent(published), synced);
    assert.ok(synced.robots_chapter_tutorial);
    const count = relays[0].publications.length;
    await syncAchievements(npub, { strict: true });
    assert.equal(relays[0].publications.length, count);
  } finally { clock.mock.restore(); }
}));
