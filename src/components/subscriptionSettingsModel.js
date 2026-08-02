export const PATREON_MEMBERSHIP_URL = "https://www.patreon.com/settings/memberships";
export const PATREON_PAYMENT_URL = "https://www.patreon.com/settings/payments";

export function getSubscriptionSettingsState(statusPayload = {}) {
  const subscription = statusPayload?.subscription || null;
  const linked = Boolean(statusPayload?.linked);
  const awaitingCheckout = Boolean(statusPayload?.checkoutRequired);
  const unavailable = statusPayload?.error === "patreon_unavailable";
  const status = subscription?.status || (linked ? "unknown" : "not_linked");
  const entitledAmountCents = Math.max(0, Number(subscription?.entitledAmountCents || 0));
  return {
    subscription,
    linked,
    awaitingCheckout,
    unavailable,
    status,
    entitledAmountCents,
    showConnect: !linked && !awaitingCheckout,
    showReconnect: linked && (unavailable || ["payment_issue", "inactive", "expired", "unknown"].includes(status)),
    showManage: linked,
    showPayment: linked && ["payment_issue", "inactive", "expired"].includes(status),
    showDisconnect: linked,
  };
}

export function formatUsdEntitlement(cents, language = "en") {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
  }).format(Math.max(0, Number(cents || 0)) / 100);
}
