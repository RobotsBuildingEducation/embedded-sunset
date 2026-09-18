import test from "node:test";
import assert from "node:assert/strict";
import {
  annualLimit,
  defaultPlan,
  normalizePlan,
  projectInvestment,
} from "./projection.js";

function near(actual, expected, tolerance = 0.001) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
}

test("seed-only compounding uses the effective annual rate, not rate / 12", () => {
  const { points } = projectInvestment({
    ...defaultPlan(),
    amount: 0,
    annualReturn: 10,
  });
  for (const age of [18, 40, 60]) near(points[age].balance, 1000 * 1.1 ** age);
  near(points[60].balance, 304481.6395414196);
});

test("monthly savings match the closed-form annuity and coast after the stop age", () => {
  const { points } = projectInvestment({
    ...defaultPlan(),
    amount: 100,
    annualReturn: 7,
  });
  const r = 1.07 ** (1 / 12) - 1;
  const at18 = 1000 * 1.07 ** 18 + (100 * ((1 + r) ** 216 - 1)) / r;
  near(points[18].balance, at18);
  near(points[40].balance, at18 * 1.07 ** 22);
  near(points[60].balance, at18 * 1.07 ** 42);
  for (const age of [18, 40, 60]) near(points[age].personal, 21600);
});

test("monthly, annual and one-time deposits use their documented timing", () => {
  const base = {
    ...defaultPlan("ira"),
    startAge: 25,
    stopAge: 26,
    endAge: 26,
    amount: 1200,
    annualReturn: 10,
  };
  near(
    projectInvestment({ ...base, frequency: "yearly" }).points.at(-1).balance,
    1200,
  );
  near(
    projectInvestment({ ...base, frequency: "once" }).points.at(-1).balance,
    1320,
  );
  const r = 1.1 ** (1 / 12) - 1;
  near(
    projectInvestment({ ...base, amount: 100 }).points.at(-1).balance,
    (100 * ((1 + r) ** 12 - 1)) / r,
  );
});

test("zero and negative returns remain finite and preserve deposit accounting", () => {
  for (const annualReturn of [0, -10, -20]) {
    const { points } = projectInvestment({ ...defaultPlan(), annualReturn });
    for (const point of points) {
      assert.ok(Number.isFinite(point.balance));
      near(
        point.balance,
        point.personal + point.seed + point.employer + point.growth,
      );
    }
    if (annualReturn === 0) near(points.at(-1).balance, 6400);
    else assert.ok(points.at(-1).growth < 0);
  }
});

test("new deposits respect limits; an existing balance and the seed are separate", () => {
  const { points, limited } = projectInvestment({
    ...defaultPlan(),
    initialBalance: 20000,
    amount: 10000,
    annualReturn: 0,
    growLimits: false,
  });
  assert.equal(limited, true);
  near(points[18].personal, 110000);
  near(points[60].balance, 111000);
  near(
    projectInvestment({
      ...defaultPlan("ira"),
      frequency: "once",
      amount: 10000,
      annualReturn: 0,
    }).points[0].personal,
    7500,
  );
});

test("max contributions index from 2028 for children and include adult catch-ups", () => {
  const child = defaultPlan();
  near(annualLimit(child, 0, 0), 5000);
  near(annualLimit(child, 1, 1), 5000);
  near(annualLimit(child, 2, 2), 5150);
  near(annualLimit(child, 18, 18), 0);
  const ira = { ...defaultPlan("ira"), growLimits: false };
  near(annualLimit(ira, 49), 7500);
  near(annualLimit(ira, 50), 8600);
  const work = { ...defaultPlan("401k"), growLimits: false };
  near(annualLimit(work, 49), 24500);
  near(annualLimit(work, 50), 32500);
  near(annualLimit(work, 60), 35750);
  near(annualLimit(work, 64), 32500);
  const full = projectInvestment({
    ...child,
    maxContributions: true,
    annualReturn: 0,
  }).points;
  near(full[3].personal, 15150);
});

test("employer deposits respect combined limits and stop with personal deposits", () => {
  const { points, limited } = projectInvestment({
    ...defaultPlan("401k"),
    startAge: 60,
    stopAge: 61,
    endAge: 62,
    maxContributions: true,
    employerMonthly: 100000,
    annualReturn: 0,
    growLimits: false,
  });
  assert.equal(limited, true);
  near(points[1].personal, 35750);
  near(points[1].employer, 47500);
  near(points[2].balance, 83250);
  const once = projectInvestment({
    ...defaultPlan("401k"),
    startAge: 25,
    stopAge: 26,
    endAge: 26,
    frequency: "once",
    amount: 24500,
    employerMonthly: 100000,
    annualReturn: 0,
    growLimits: false,
  });
  near(once.points.at(-1).balance, 72000);
});

test("stop-now prevents recurring deposits; a one-time deposit is still immediate", () => {
  const base = { ...defaultPlan(), stopAge: 0, annualReturn: 0 };
  near(projectInvestment(base).points.at(-1).balance, 1000);
  near(
    projectInvestment({ ...base, frequency: "once", amount: 100 }).points.at(-1)
      .balance,
    1100,
  );
});

test("malformed saved inputs cannot produce invalid horizons or NaN projections", () => {
  const plan = normalizePlan({
    account: "bad",
    startAge: 110,
    stopAge: -10,
    endAge: -100,
    annualReturn: NaN,
    amount: Infinity,
    inflation: -20,
    employerMonthly: 300,
  });
  assert.equal(plan.startAge, 17);
  assert.equal(plan.endAge, 18);
  assert.equal(plan.stopAge, 17);
  assert.equal(plan.employerMonthly, 0);
  assert.equal(plan.annualReturn, 10);
  assert.equal(defaultPlan().annualReturn, 10);
  assert.equal(defaultPlan().amount, 25);
  assert.equal(defaultPlan("child").amount, 25);
  assert.equal(defaultPlan("401k").amount, 25);
  assert.equal(defaultPlan("ira").amount, 25);
  assert.equal(defaultPlan().inflation, 3);
  assert.equal(defaultPlan().applyInflation, false);
  assert.ok(
    projectInvestment(plan).points.every((p) => Number.isFinite(p.balance)),
  );
  const partial = normalizePlan({ account: "ira", startAge: 89 });
  assert.equal(partial.endAge, 90);
  assert.equal(partial.stopAge, 89);
  assert.equal(projectInvestment(partial).points.length, 2);
  assert.equal(
    normalizePlan({ frequency: "once", maxContributions: true })
      .maxContributions,
    false,
  );
  assert.equal(projectInvestment(null).points.length, 61);
});

test("applyInflation discounts balances and deposits to today's buying power", () => {
  const base = {
    ...defaultPlan(),
    startAge: 0,
    endAge: 10,
    amount: 0,
    annualReturn: 10,
    inflation: 3,
    applyInflation: true,
  };
  const { points } = projectInvestment(base);
  near(points[0].balance, 1000);
  near(points[1].balance, (1000 * 1.1) / 1.03);
  near(points[10].balance, (1000 * 1.1 ** 10) / (1.03 ** 10));
  for (const p of points) {
    near(p.balance, p.personal + p.employer + p.seed + p.growth);
  }
});
