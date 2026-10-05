import test from "node:test";
import assert from "node:assert/strict";
import { readAchievementRelayEvents } from "./relayTransport.js";

function relay({ events = [], closed, stall = false, auth = false } = {}) {
  let authenticated = false;
  const state = { reads: 0, closes: 0, authentications: 0 };
  return {
    state,
    async auth(sign) { state.authentications++; await sign({ kind: 22242 }); authenticated = true; },
    prepareSubscription(_filters, handlers) {
      let stopped = false;
      return {
        fire() {
          state.reads++;
          queueMicrotask(() => {
            if (stall || stopped) return;
            if (auth && !authenticated) handlers.onclose("auth-required: authenticate author");
            else if (closed) handlers.onclose(closed);
            else { events.forEach(handlers.onevent); handlers.oneose(); }
          });
        },
        close() { if (!stopped) { stopped = true; state.closes++; handlers.onclose("closed by caller"); } },
      };
    },
  };
}
const poolFor = relays => ({ ensureRelay: async url => {
  if (relays[url] instanceof Error) throw relays[url];
  return relays[url];
} });

test("authenticate restricted reads and retry the subscription after AUTH", async () => {
  const ditto = relay({ auth: true, events: [{ id: "piyali" }] });
  const signed = [];
  assert.deepEqual(await readAchievementRelayEvents(poolFor({ ditto }), ["ditto"], {}, {
    authenticate: async template => { signed.push(template.kind); return template; },
  }), [{ id: "piyali" }]);
  assert.deepEqual(signed, [22242]);
  assert.deepEqual(ditto.state, { reads: 2, closes: 2, authentications: 1 });
});

test("union snapshots from every responding relay, retaining different host histories", async () => {
  const relays = { a: relay({ events: [{ id: "older-piyali" }] }), b: relay({ events: [{ id: "newer-robots" }] }), offline: new Error("offline") };
  assert.deepEqual(await readAchievementRelayEvents(poolFor(relays), Object.keys(relays), {}), [{ id: "older-piyali" }, { id: "newer-robots" }]);
});

test("all refused or offline reads reject instead of confirming an empty transcript", async () => {
  const relays = { restricted: relay({ closed: "restricted: unavailable" }), offline: new Error("offline") };
  await assert.rejects(readAchievementRelayEvents(poolFor(relays), Object.keys(relays), {}), error => {
    assert.ok(error instanceof AggregateError);
    assert.match(error.errors[0].message, /restricted/);
    assert.match(error.errors[1].message, /offline/);
    return true;
  });
});

test("stalled reads are bounded and subscriptions are released", async () => {
  const stalled = relay({ stall: true });
  await assert.rejects(readAchievementRelayEvents(poolFor({ stalled }), ["stalled"], {}, { timeout: 10 }), AggregateError);
  assert.equal(stalled.state.closes, 1);
});

test("a genuine empty EOSE response remains valid for new accounts", async () => {
  assert.deepEqual(await readAchievementRelayEvents(poolFor({ empty: relay() }), ["empty"], {}), []);
});

test("read-only accounts can use a public relay when another requires a signer", async () => {
  const relays = { restricted: relay({ auth: true }), public: relay({ events: [{ id: "public" }] }) };
  assert.deepEqual(await readAchievementRelayEvents(poolFor(relays), Object.keys(relays), {}, {
    authenticate: async () => { throw new Error("No signer"); },
  }), [{ id: "public" }]);
});
