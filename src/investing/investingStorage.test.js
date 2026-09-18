import test from "node:test";
import assert from "node:assert/strict";
import {
  openInvestingSession,
  planStorageKey,
  saveInvestingSession,
} from "./investingStorage.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("automatic profile creation reuses the shared identity across visits", () => {
  const storage = memoryStorage();
  const first = openInvestingSession(storage);
  const privateKey = storage.getItem("local_nsec");
  const second = openInvestingSession(storage);
  assert.equal(first.profile.npub, second.profile.npub);
  assert.equal(storage.getItem("local_nsec"), privateKey);
  assert.equal(storage.getItem("uniqueId"), first.profile.npub);
  assert.equal(
    JSON.parse(storage.getItem("investing_profile")).npub,
    first.profile.npub,
  );
  assert.ok(!storage.getItem("investing_profile").includes(privateKey));
});

test("scenarios survive reloads while the removed dollar preference is ignored", () => {
  const storage = memoryStorage();
  const session = openInvestingSession(storage);
  session.plans.child.amount = 25;
  session.plans.ira.amount = 400;
  session.account = "ira";
  saveInvestingSession(session, storage);
  const key = planStorageKey(session.profile.npub);
  const legacy = JSON.parse(storage.getItem(key));
  storage.setItem(key, JSON.stringify({ ...legacy, real: true }));
  const next = openInvestingSession(storage);
  assert.equal(next.plans.child.amount, 25);
  assert.equal(next.plans.ira.amount, 400);
  assert.equal(next.account, "ira");
  assert.equal("real" in next, false);
  saveInvestingSession(next, storage);
  assert.equal("real" in JSON.parse(storage.getItem(key)), false);
});

test("corrupt scenarios recover while corrupt identity keys are preserved", () => {
  const storage = memoryStorage();
  const session = openInvestingSession(storage);
  storage.setItem(planStorageKey(session.profile.npub), "broken json");
  assert.equal(openInvestingSession(storage).plans.child.amount, 25);
  storage.setItem("local_nsec", "damaged");
  assert.throws(() => openInvestingSession(storage), /could not be read/);
  assert.equal(storage.getItem("local_nsec"), "damaged");
});

test("saved sessions with legacy 7% return migrate to 10% default across all versions", () => {
  for (const version of [1, 2, undefined]) {
    const storage = memoryStorage();
    const session = openInvestingSession(storage);
    const key = planStorageKey(session.profile.npub);
    storage.setItem(
      key,
      JSON.stringify({
        version,
        plans: {
          child: { annualReturn: 7, amount: 100 },
          ira: { annualReturn: 12, amount: 200 },
          "401k": { amount: 250 },
        },
        account: "child",
      }),
    );
    const reloaded = openInvestingSession(storage);
    assert.equal(reloaded.plans.child.annualReturn, 10);
    assert.equal(reloaded.plans.child.amount, 25);
    assert.equal(reloaded.plans.ira.annualReturn, 12);
    assert.equal(reloaded.plans.ira.amount, 200);
    assert.equal(reloaded.plans["401k"].amount, 25);
    assert.equal(reloaded.plans.child.inflation, 3);
  }
});

