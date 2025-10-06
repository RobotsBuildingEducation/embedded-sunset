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
