import test from "node:test";
import assert from "node:assert/strict";
import { formatUsdEntitlement, getSubscriptionSettingsState } from "./subscriptionSettingsModel.js";

test("active linked memberships show manage and disconnect actions", () => {
  const view = getSubscriptionSettingsState({ linked: true, subscription: { status: "active", entitledAmountCents: 1000 } });
  assert.equal(view.showConnect, false);
  assert.equal(view.showReconnect, false);
  assert.equal(view.showManage, true);
  assert.equal(view.showDisconnect, true);
});

test("payment problems expose reconnect and payment actions", () => {
  const view = getSubscriptionSettingsState({ linked: true, subscription: { status: "payment_issue" } });
  assert.equal(view.showReconnect, true);
  assert.equal(view.showPayment, true);
});

test("pending Patreon checkout does not collapse back into the pricing state", () => {
  const view = getSubscriptionSettingsState({
    authorized: false,
    linked: false,
    connected: true,
    checkoutRequired: true,
  });
  assert.equal(view.awaitingCheckout, true);
  assert.equal(view.showConnect, false);
});

test("USD entitlement remains explicitly denominated", () => {
  assert.match(formatUsdEntitlement(1000, "es"), /USD/);
});
