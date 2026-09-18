import { ensureIdentity } from "../utility/identity.js";
import { ACCOUNT_TYPES, defaultPlan, normalizePlan } from "./projection.js";

export const planStorageKey = (npub) => `investing:v1:${npub}`;

export function openInvestingSession(storage = localStorage) {
  const profile = ensureIdentity(storage);
  const plans = Object.fromEntries(
    ACCOUNT_TYPES.map((account) => [account, defaultPlan(account)]),
  );
  let account = "child";
  try {
    const saved = JSON.parse(
      storage.getItem(planStorageKey(profile.npub)) || "null",
    );
    if (saved && typeof saved === "object") {
      for (const type of ACCOUNT_TYPES) {
        if (saved.plans?.[type]) {
          const planData = { ...saved.plans[type], account: type };
          if (planData.annualReturn === 7 || !planData.annualReturn) {
            planData.annualReturn = 10;
          }
          if (planData.amount === 100 || planData.amount === 250) {
            planData.amount = 25;
          }
          plans[type] = normalizePlan(planData);
        }
      }
      if (ACCOUNT_TYPES.includes(saved.account)) account = saved.account;
    }
  } catch {
    /* A damaged scenario must not prevent the calculator from opening. */
  }
  storage.setItem("investing_profile", JSON.stringify({ npub: profile.npub }));
  return { profile, plans, account };
}

export function saveInvestingSession(session, storage = localStorage) {
  storage.setItem(
    planStorageKey(session.profile.npub),
    JSON.stringify({
      version: 2,
      plans: session.plans,
      account: session.account,
    }),
  );
}
