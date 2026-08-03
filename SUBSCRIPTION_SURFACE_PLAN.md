# Subscription Surface Port Plan

## Purpose

This document explains how Robots Building Education moved the Patreon subscription experience out of the dedicated `/subscription` page and into an app-level modal, and how to port the same architecture into Piyali's existing drawer.

The goal is not to create a second subscription flow. The page, modal, and future drawer must be different containers around the same Patreon state machine, API calls, recovery behavior, and presentation states.

This is an implementation plan, not a production deployment instruction. Build and test the Piyali drawer behind its existing development or feature flag before changing the live subscription experience.

## Target outcome in Piyali

When the port is complete:

1. Opening Piyali's subscription drawer immediately resolves the current Patreon state.
2. The drawer renders the same meaningful states as Piyali's `/subscription` page.
3. Patreon OAuth uses the current tab rather than a popup.
4. After OAuth, the user returns to the exact app route they left.
5. The subscription drawer opens automatically after the return.
6. The drawer remains open even if authentication, onboarding, or route state remounts the drawer host.
7. A replacement-required response cannot be overwritten by a generic key-restore response.
8. Closing the drawer explicitly clears the durable reopen request.
9. No Patreon secret, OAuth code, recovery secret, Nostr private key, or access token enters a URL or browser storage.
10. The dedicated subscription page continues to use the same underlying behavior without regressions.

## Robots Building Education reference implementation

The working implementation is split across these files:

- Surface controller and modal container: `src/components/PatreonSubscriptionSettingsModal.jsx`
- Shared subscription presentation: `src/components/SubscriptionSettingsPanel.jsx`
- Pure presentation-state model: `src/components/subscriptionSettingsModel.js`
- Embedded key-replacement view: `src/components/PatreonKeyReplacementGate.jsx`
- Shared status resolution and recovery classification: `src/utils/patreonRecoveryState.js`
- Browser API client: `src/utils/patreonApi.js`
- Same-tab OAuth return persistence: `src/utils/patreonOAuthReturn.js`
- OAuth callback transition screen: `src/components/PatreonOAuthModalReturn.jsx`
- App-level surface reopen ownership: `src/components/SettingsMenu/SettingsMenu.jsx`
- Callback route selection: `src/App.jsx`
- Backend OAuth return-mode persistence: `functions/patreon.js`
- State and return tests: `src/utils/patreonRecoveryState.test.js`, `src/utils/patreonOAuthReturn.test.js`, and `src/components/subscriptionSettingsModel.test.js`

Port the behavior and boundaries. Rename the modal-specific concepts to drawer-specific concepts in Piyali rather than preserving RBE naming.

## Architecture

The subscription surface has five layers:

```text
Piyali drawer host
  -> subscription surface controller
    -> shared status resolver
      -> Patreon API client
        -> Patreon backend
    -> shared presentation-state model
      -> drawer UI / embedded replacement UI

OAuth callback
  -> same-tab return coordinator
    -> original Piyali route
      -> drawer host reopens the subscription drawer
```

### 1. Drawer host

The existing Piyali drawer owner should remain responsible for:

- Opening and closing the drawer.
- Detecting a Patreon drawer return marker.
- Reopening the drawer after an app remount.
- Clearing the durable reopen request only when the user explicitly closes the drawer.
- Removing temporary return parameters from the visible URL.

The host must not decide whether a membership is active, inactive, awaiting checkout, or awaiting key replacement.

### 2. Subscription surface controller

Create a controller component or hook that owns:

- `status`
- `resolved`
- `busy`
- `actionError`
- Initial loading whenever the drawer opens.
- Focus and visibility rechecks while the drawer is open.
- Connect/reconnect.
- Confirm or cancel key replacement.
- Disconnect.
- Checkout navigation.

Recommended Piyali shape:

```text
usePatreonSubscriptionSurface({ isOpen, npub })
  -> status
  -> resolved
  -> busy
  -> actionError
  -> connect
  -> replace
  -> cancelReplacement
  -> disconnect
  -> openCheckout
```

Keeping this logic outside the drawer's visual shell makes the page and drawer use the same behavior.

### 3. Shared status resolver

The surface must use the same resolver as the subscription page:

1. Call `GET /api/patreon/status` with the active app public key.
2. If the browser session is genuinely absent and the app can silently prove key ownership, call the signed `POST /api/patreon/key-status` restore flow.
3. Preserve any meaningful state already returned by `/status`.

The restore fallback must not run when any of these are true:

- `authorized`
- `connected`
- `linked`
- `replacementRequired`
- `checkoutRequired`

This guard is essential. The RBE modal originally received `replacementRequired: true`, then incorrectly called key restoration and replaced that response with a generic unlinked state. The result was a paid user seeing the paywall again.

### 4. Pure presentation-state model

Convert the backend response into view flags in one pure function. Do not scatter status checks throughout the drawer JSX.

The RBE model produces these flags:

- `awaitingCheckout`
- `showConnect`
- `showReconnect`
- `showManage`
- `showPayment`
- `showDisconnect`

Piyali should either reuse its existing equivalent or add a pure `getSubscriptionSurfaceState(statusPayload)` function with unit tests.

### 5. Presentational content

The drawer body should remain mostly presentational. It receives resolved state and action callbacks from the controller.

Reuse the page's:

- Membership benefits.
- Pricing tier.
- Checkout-required panel.
- Active membership summary.
- Payment-problem state.
- Manage-membership action.
- Disconnect confirmation.
- Key-replacement content.
- Localization source.

Only spacing, responsive layout, theme tokens, and drawer chrome should differ.

## Required state matrix

| Backend/controller state | Drawer content | Primary action |
| --- | --- | --- |
| Status unresolved | Centered loading state; never flash pricing | None |
| Patreon unavailable, no known link | Paywall with a scoped error | Retry connect |
| Unlinked | Benefits and pricing tier | Connect/subscribe with Patreon |
| `checkoutRequired` | “Finish subscribing on Patreon” state above the tier area | Open Patreon checkout |
| `replacementRequired` | Embedded existing-member/key-replacement view | Confirm replacement or cancel |
| Active linked membership | Membership summary, last checked, paid tier | Manage membership |
| Payment issue/inactive/expired | Status summary and payment guidance | Update payment or reconnect |
| Linked but temporarily stale | Last verified membership plus stale warning | Manage/reconnect as appropriate |
| Disconnect confirmation | Inline warning, not a browser confirm dialog | Confirm disconnect or cancel |

The unresolved state must be explicit. Rendering the default paywall before the first status request completes creates the false impression that a subscribed user is unsubscribed.

## Drawer-specific UI rules

The Piyali drawer should:

- Put the subscription heading and close control in the drawer header.
- Give the body its own vertical scrolling area.
- Respect mobile safe-area insets.
- Render the key-replacement view in embedded mode so it does not create another page shell.
- Keep one primary action visible without forcing horizontal scrolling.
- Use the same theme tokens as the rest of Piyali.
- Treat overlay click, swipe-to-close, Escape, and the close button as explicit drawer closure and clear the durable reopen flag.
- Avoid nesting a modal inside the drawer.
- Avoid opening Patreon in a popup.

## Same-tab OAuth return protocol

This was the most important surface-specific addition in RBE.

### Before leaving Piyali

When the user selects Connect:

1. Save the current internal route, query string, and hash in `sessionStorage`.
2. Save a separate durable `reopen` flag in `sessionStorage`.
3. Start Patreon linking with a signed Nostr proof.
4. Send `returnMode: "drawer"` to the backend.
5. Navigate the current tab to the returned Patreon authorization URL.

Suggested Piyali storage names:

```text
piyali:patreon-drawer-return:pending
piyali:patreon-drawer-return:ready
piyali:patreon-drawer-return:reopen
```

The pending record should contain only:

```json
{
  "returnPath": "/the/original/piyali/route?with=query#and-hash",
  "createdAtMs": 0
}
```

Validate that the path begins with one `/`, does not begin with `//`, and has not exceeded the OAuth lifetime.

### Backend behavior

Piyali's Patreon link-start endpoint should:

1. Accept `returnMode: "drawer"` in addition to existing page modes.
2. Store the return mode inside the short-lived server-side OAuth state record.
3. Never trust a return mode supplied directly to the callback.
4. After consuming the OAuth state, append a harmless marker such as `patreon_drawer=1` to the app callback result.

The callback URL may include sanitized result values such as:

```text
patreon=connected
patreon=replace_required
patreon=checkout_required
patreon=oauth_cancelled
patreon=oauth_error
```

It must never include OAuth tokens, recovery IDs, session IDs, Nostr private keys, or raw Patreon identity data.

### Returning to Piyali

Add a lightweight callback-route component equivalent to RBE's `PatreonOAuthModalReturn`:

1. Read the sanitized Patreon result.
2. Read and consume the pending original route.
3. Preserve the durable reopen flag.
4. Add a one-use drawer marker to the original route.
5. Navigate with `replace: true` to the original route.

Example restored route:

```text
/learn/lesson-12?patreon_drawer=1&patreon_result=replace_required
```

### Reopening the drawer reliably

The drawer host should open the subscription drawer when either condition is true:

- The current route contains `patreon_drawer=1`.
- The durable tab-level reopen flag is set.

After opening, remove the temporary URL parameters with route replacement. Do not clear the durable reopen flag at that point.

The reopen flag must survive component remounts. Clear it only when the user explicitly closes the drawer. RBE initially consumed the return instruction immediately after calling `onOpen`; onboarding then remounted the menu and reset the modal state, leaving the user back in the app with no modal. The durable flag fixed that race.

If link-start fails before navigation, clear the pending and reopen flags immediately.

## Controller behavior

### Initial load

Whenever the drawer becomes open:

```text
busy = true
resolved = false
clear non-preserved action error
resolve shared Patreon status
store status
resolved = true
busy = false
```

If the app has no active public key, resolve to a safe unavailable/unlinked state rather than throwing during render.

### Focus and visibility rechecks

While open, recheck status when the app becomes visible or focused. Throttle duplicate focus/visibility events; RBE uses a minimum interval of 1.5 seconds.

Remove listeners when the drawer closes or unmounts.

### Connect or reconnect

- Set the surface busy state.
- Clear the action error.
- Record the OAuth return intent.
- Request a link URL using `returnMode: "drawer"`.
- Navigate the same tab.
- On failure, clear the return intent and show a scoped error.

### Key replacement

- Call the signed replace-link endpoint using the current Piyali key.
- On success, store the returned active status directly.
- For `replacement_expired`, `replacement_state_changed`, or `membership_not_active`, cancel the stale replacement and restart from the unlinked/connect state.
- For other failures, keep the replacement view visible and show an inline error.

### Disconnect

- Require an inline confirmation.
- Call the signed disconnect endpoint.
- Refresh the drawer state or route to the canonical Piyali post-disconnect location.
- Make clear that disconnecting app access does not cancel Patreon billing.

## Proposed Piyali file structure

Adapt this to Piyali's conventions:

```text
src/components/subscription/SubscriptionDrawer.jsx
src/components/subscription/SubscriptionSurfaceContent.jsx
src/components/subscription/PatreonKeyReplacementContent.jsx
src/hooks/usePatreonSubscriptionSurface.js
src/utils/patreonSubscriptionState.js
src/utils/patreonDrawerReturn.js
src/routes/PatreonOAuthDrawerReturn.jsx
```

If Piyali already has page equivalents, extract shared code instead of adding duplicate files.

## Implementation sequence

### Phase 1: Inventory and extract

- [ ] Identify Piyali's current drawer owner and close pathways.
- [ ] Identify the `/subscription` page controller, status resolver, presentation, and localization sources.
- [ ] Extract a pure shared presentation-state model if one does not exist.
- [ ] Make the key-replacement component support an embedded mode.
- [ ] Confirm that page behavior remains unchanged after extraction.

### Phase 2: Add the drawer surface

- [ ] Mount a subscription drawer from the existing Piyali drawer host.
- [ ] Connect it to the shared controller/status resolver.
- [ ] Add an explicit unresolved/loading state.
- [ ] Render every state in the matrix above.
- [ ] Add focus and visibility rechecks.
- [ ] Ensure the drawer uses Piyali theme tokens and responsive spacing.

### Phase 3: Add same-tab OAuth return

- [ ] Add `returnMode: "drawer"` to the frontend API contract.
- [ ] Persist that mode in server-side OAuth state.
- [ ] Add the sanitized callback marker.
- [ ] Save and validate the original Piyali route.
- [ ] Add the callback transition component.
- [ ] Add the one-use route marker.
- [ ] Add the durable reopen flag.
- [ ] Clear the reopen flag only on explicit drawer closure.
- [ ] Clear all pending flags when link-start fails.

### Phase 4: Tests

- [ ] Unit-test the pure state matrix.
- [ ] Unit-test that replacement and checkout states do not trigger fallback restoration.
- [ ] Unit-test route validation and expiry.
- [ ] Unit-test the callback marker added to a route with an existing query and hash.
- [ ] Unit-test that the durable reopen flag survives consumption of the pending return record.
- [ ] Unit-test that explicit close clears the reopen flag.
- [ ] Backend-test that `returnMode: "drawer"` is stored and returned only from authenticated OAuth state.
- [ ] Run the existing Patreon backend suite.
- [ ] Run the Piyali build and lint/type checks.

### Phase 5: Manual verification

- [ ] Unlinked user opens the drawer and sees benefits plus the pricing tier.
- [ ] Active linked user opens the drawer and never sees a paywall flash.
- [ ] Paid account already linked to another key sees key replacement after OAuth.
- [ ] Confirming replacement changes the drawer to active membership.
- [ ] An unpaid account sees checkout-required state.
- [ ] Returning from checkout triggers a status recheck.
- [ ] OAuth denial returns to the original route with the drawer open and an error.
- [ ] OAuth error returns to the original route with the drawer open and an error.
- [ ] App/onboarding remount after OAuth still leaves the drawer open.
- [ ] Explicit close prevents the drawer from reopening again.
- [ ] Back/forward navigation does not create a reopen loop.
- [ ] Instagram, TikTok, Facebook, and other embedded mobile browsers stay in the same tab.
- [ ] Desktop browsers also stay in the same tab.
- [ ] Refreshing during the return transition fails safely.

## Production safety and rollout

- Keep the drawer behind Piyali's existing feature flag until the full matrix passes.
- Do not change Patreon campaign acceptance rules while porting the UI surface.
- Do not introduce a second set of Patreon collections or link semantics for the drawer.
- Do not deploy frontend code that sends `returnMode: "drawer"` before the backend accepts it.
- The backend may accept the new inert return mode before the drawer is exposed.
- Verify the exact production callback URL and app URL separately from local values.
- Never put Patreon or encryption secrets in frontend environment variables.
- Roll out to internal/test accounts before making the drawer entry visible to all users.
- Preserve the existing subscription page as a fallback until the drawer flow is proven.

## Anti-patterns to avoid

- Do not duplicate the subscription page's state machine inside the drawer.
- Do not infer subscription status from the fact that OAuth completed.
- Do not render pricing while the initial status is unresolved.
- Do not let key restoration overwrite `replacementRequired` or `checkoutRequired`.
- Do not open OAuth in a popup.
- Do not place Patreon OAuth inside an iframe.
- Do not clear the drawer reopen flag immediately after calling `onOpen`.
- Do not trust a callback query parameter as authorization.
- Do not put recovery secrets or OAuth tokens in return URLs or browser storage.
- Do not make disconnect imply Patreon billing cancellation.

## Definition of done

The Piyali port is complete when the subscription page and drawer produce the same result for every backend state, same-tab OAuth returns users to their original route with the drawer visibly open, drawer remounts cannot lose the reopen request, all automated and manual checks pass, and no live behavior is exposed until the feature flag is deliberately enabled.
