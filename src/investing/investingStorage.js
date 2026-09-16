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
    if (saved && saved.version === 1) {
      for (const type of ACCOUNT_TYPES) {
        if (saved.plans?.[type])
          plans[type] = normalizePlan({ ...saved.plans[type], account: type });
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
      version: 1,
      plans: session.plans,
      account: session.account,
    }),
  );
}
