// Effective annual returns are converted to equivalent monthly rates. Account
// rules are a 2026 planning baseline, not an eligibility or tax filing engine.
export const RULES_YEAR = 2026;
export const ACCOUNT_TYPES = ["child", "401k", "ira"];
export const DEFAULTS = {
  child: {
    startAge: 0,
    stopAge: 18,
    endAge: 60,
    amount: 25,
    seed: true,
    annualReturn: 10,
    inflation: 3,
    applyInflation: false,
  },
  "401k": {
    startAge: 25,
    stopAge: 65,
    endAge: 65,
    amount: 25,
    seed: false,
    annualReturn: 10,
    inflation: 3,
    applyInflation: false,
  },
  ira: {
    startAge: 25,
    stopAge: 65,
    endAge: 65,
    amount: 25,
    seed: false,
    annualReturn: 10,
    inflation: 3,
    applyInflation: false,
  },
};

const number = (value, fallback, min, max) => {
  const parsed =
    typeof value === "number" || typeof value === "string"
      ? Number(value)
      : NaN;
  return Math.min(
    max,
    Math.max(min, Number.isFinite(parsed) ? parsed : fallback),
  );
};

export function normalizePlan(input = {}) {
  input = input && typeof input === "object" ? input : {};
  const account = ACCOUNT_TYPES.includes(input.account)
    ? input.account
    : "child";
  const defaults = DEFAULTS[account];
  const startAge = Math.round(
    number(input.startAge, defaults.startAge, 0, account === "child" ? 17 : 89),
  );
  const endAge = Math.round(
    number(input.endAge, defaults.endAge, startAge + 1, 90),
  );
  return {
    account,
    startAge,
    endAge,
    stopAge: Math.round(
      number(
        input.stopAge,
        defaults.stopAge,
        startAge,
        account === "child" ? Math.min(18, endAge) : endAge,
      ),
    ),
    amount: number(input.amount, defaults.amount, 0, 1000000),
    initialBalance: number(input.initialBalance, 0, 0, 100000000),
    frequency: ["monthly", "yearly", "once"].includes(input.frequency)
      ? input.frequency
      : "monthly",
    annualReturn: number(input.annualReturn, 10, -20, 20),
    inflation: number(input.inflation, 3, 0, 15),
    applyInflation: input.applyInflation === true,
    contributionGrowth: number(input.contributionGrowth, 0, 0, 15),
    seed:
      account === "child" &&
      (typeof input.seed === "boolean" ? input.seed : defaults.seed),
    maxContributions:
      input.maxContributions === true && input.frequency !== "once",
    growLimits: input.growLimits !== false,
    employerMonthly:
      account === "401k" ? number(input.employerMonthly, 0, 0, 100000) : 0,
    iraType: input.iraType === "roth" ? "roth" : "traditional",
  };
}

export function defaultPlan(account = "child") {
  return normalizePlan({ account, ...DEFAULTS[account] });
}

export function annualLimit(plan, age, yearIndex = 0) {
  let base;
  if (plan.account === "child") base = age < 18 ? 5000 : 0;
  else if (plan.account === "ira") base = 7500 + (age >= 50 ? 1100 : 0);
  else base = 24500 + (age >= 60 && age <= 63 ? 11250 : age >= 50 ? 8000 : 0);
  const increases =
    plan.account === "child" ? Math.max(0, yearIndex - 1) : yearIndex;
  return base * (plan.growLimits ? (1 + plan.inflation / 100) ** increases : 1);
}

export function projectInvestment(input) {
  const plan = normalizePlan(input);
  const monthlyRate = (1 + plan.annualReturn / 100) ** (1 / 12) - 1;
  let personal = plan.initialBalance;
  let employer = 0;
  const seed = plan.seed ? 1000 : 0;
  let balance = personal + seed;
  let limited = false;
  if (plan.frequency === "once") {
    const deposit = Math.min(plan.amount, annualLimit(plan, plan.startAge, 0));
    personal += deposit;
    balance += deposit;
    limited = deposit < plan.amount;
  }
  const points = [];
  function record(year) {
    const factor = plan.applyInflation
      ? (1 + plan.inflation / 100) ** year
      : 1;
    const recBalance = balance / factor;
    const recPersonal = personal / factor;
    const recEmployer = employer / factor;
    const recSeed = seed / factor;
    const added = recPersonal + recEmployer + recSeed;
    points.push({
      age: plan.startAge + year,
      year,
      balance: recBalance,
      personal: recPersonal,
      employer: recEmployer,
      seed: recSeed,
      added,
      growth: recBalance - added,
    });
  }
  record(0);
  for (let year = 0; year < plan.endAge - plan.startAge; year += 1) {
    const age = plan.startAge + year;
    const canContribute = age < plan.stopAge;
    const limit = annualLimit(plan, age, year);
    const requested =
      plan.maxContributions && plan.frequency !== "once"
        ? limit
        : plan.amount *
          (plan.frequency === "monthly"
            ? 12
            : plan.frequency === "yearly"
              ? 1
              : 0) *
          (1 + plan.contributionGrowth / 100) ** year;
    const annualPersonal = canContribute ? Math.min(requested, limit) : 0;
    if (canContribute && requested > limit + 0.001) limited = true;
    // 2026 combined 401(k) limit ($72,000 baseline) excludes catch-up contributions.
    const factor = plan.growLimits ? (1 + plan.inflation / 100) ** year : 1;
    const oneTimeThisYear =
      year === 0 && plan.frequency === "once"
        ? personal - plan.initialBalance
        : 0;
    const regularPersonal = Math.min(
      annualPersonal + oneTimeThisYear,
      24500 * factor,
    );
    const employerRequested = canContribute ? plan.employerMonthly * 12 : 0;
    const annualEmployer =
      plan.account === "401k"
        ? Math.min(
            employerRequested,
            Math.max(0, 72000 * factor - regularPersonal),
          )
        : 0;
    if (employerRequested > annualEmployer + 0.001) limited = true;
    for (let month = 1; month <= 12; month += 1) {
      balance *= 1 + monthlyRate;
      const deposit =
        plan.frequency === "monthly"
          ? annualPersonal / 12
          : plan.frequency === "yearly" && month === 12
            ? annualPersonal
            : 0;
      personal += deposit;
      employer += annualEmployer / 12;
      balance += deposit + annualEmployer / 12;
    }
    record(year + 1);
  }
  return { plan, points, limited };
}

export const money = (value, compact = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    ...(compact ? { notation: "compact" } : {}),
  }).format(value);
