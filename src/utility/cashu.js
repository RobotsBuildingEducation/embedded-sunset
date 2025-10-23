const CASHU_BALANCE_STORAGE_KEY = "cashu_wallet_balance";

const getStorageKey = (npub) =>
  npub && typeof npub === "string" && npub.length > 0
    ? `${CASHU_BALANCE_STORAGE_KEY}:${npub}`
    : CASHU_BALANCE_STORAGE_KEY;

export const getCashuBalanceTotal = (balance) => {
  if (!balance) {
    return 0;
  }

  if (Array.isArray(balance)) {
    return balance.reduce((sum, entry) => sum + (entry?.amount ?? 0), 0);
  }

  if (typeof balance === "number") {
    return balance;
  }

  if (typeof balance === "object") {
    if (Array.isArray(balance?.balances)) {
      return balance.balances.reduce(
        (sum, entry) => sum + (entry?.amount ?? 0),
        0
      );
    }

    if (Array.isArray(balance?.proofs)) {
      return balance.proofs.reduce((sum, proof) => sum + (proof?.amount ?? 0), 0);
    }

    if (typeof balance.amount === "number") {
      return balance.amount;
    }

    if (typeof balance.balance === "number") {
      return balance.balance;
    }
  }

  return 0;
};

export const normalizeCashuBalance = (balance) => {
  const total = getCashuBalanceTotal(balance);
  return total < 0 ? 0 : total;
};

export const loadStoredCashuBalance = (npub) => {
  if (typeof window === "undefined" || !window?.localStorage) {
    return 0;
  }

  const rawValue = window.localStorage.getItem(getStorageKey(npub));
  if (!rawValue) {
    return 0;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const persistNormalizedCashuBalance = (balance, npub) => {
  const normalized = normalizeCashuBalance(balance);

  if (typeof window !== "undefined" && window?.localStorage) {
    try {
      window.localStorage.setItem(getStorageKey(npub), normalized.toString());
    } catch (error) {
      console.warn("Unable to persist Cashu balance:", error);
    }
  }

  return normalized;
};

export const clearStoredCashuBalance = (npub) => {
  if (typeof window === "undefined" || !window?.localStorage) {
    return;
  }

  window.localStorage.removeItem(getStorageKey(npub));
};
