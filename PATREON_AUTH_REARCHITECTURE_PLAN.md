# Patreon Auth Rearchitecture Plan

## Purpose

This document is the implementation blueprint for replacing the legacy shared-passcode paywall in **Robots Building Education** (`https://robotsbuildingeducation.com`) with the production-ready Patreon authentication system developed for Piyali.

It records the final decisions, UI, backend behavior, security model, Firebase and Patreon configuration, local-test workflow, deployment order, and the problems already discovered while building the Piyali version. It is intended to make the Robots Building Education implementation repeatable without redoing the same research and debugging.

This is a plan, not an instruction to deploy. Build and test it on a feature branch first. Deploy the backend before exposing the new UI.

> Never copy real secrets into this file, source control, frontend environment variables, screenshots, tickets, or logs. Every secret below is represented by a placeholder.

## Reference implementation

The working Piyali implementation is the source of truth for behavior:

- Branch at the time this plan was written: `codex/patreon-oauth`
- Main backend: `functions/patreon.js`
- Function registration and secrets: `functions/index.js`
- Backend tests: `functions/patreon.test.js`
- App orchestration: `src/App.jsx`
- Main and legacy paywalls: `src/components/SubscriptionGate.jsx`
- Key-replacement screen: `src/components/PatreonKeyReplacementGate.jsx`
- Subscription settings: `src/components/SubscriptionSettingsPanel.jsx`
- Nostr proof helper: `src/utils/patreonNostrProof.js`
- Firebase routing: `firebase.json`
- TTL configuration: `firestore.indexes.json`
- Local API proxy: `vite.config.js`
- Local development launcher: `scripts/startLocalDev.mjs`

Port the behavior, tests, and security invariants. Do not blindly copy Piyali names, URLs, collection identifiers, header names, branding, or secrets.

## Target outcome

After this work:

1. A Robots Building Education user possesses a local Nostr key and proves possession by signing a short-lived server challenge.
2. The user authorizes the Robots Building Education Patreon OAuth client.
3. The backend verifies an active paid membership in the configured Patreon campaign.
4. The backend links exactly one Patreon account to exactly one Robots Building Education Nostr public key.
5. The app remembers the link across browser sessions without storing the Nostr private key.
6. Patreon cancellation, deletion, payment failure, and entitlement changes revoke or recheck access promptly through authenticated webhooks.
7. A user who loses a Nostr key can explicitly move the Patreon link to a new key after fresh Patreon OAuth verification.
8. Existing shared-passcode users see a clear migration screen and must connect Patreon before continuing.
9. Users can view and manage the parts of the connection that the app controls from a Subscription settings tab.
10. The shared passcode and unauthenticated one-time-purchase paths are no longer visible or accepted as subscription authorization.

## Decisions to make before coding

### 1. Separate Firebase project or shared Firebase project

This is the most important cross-app decision.

**Recommended: use a separate Firebase project for Robots Building Education.** It isolates secrets, Firestore links, sessions, webhooks, functions, logs, rollback, and billing from Piyali.

If both apps must share one Firebase/Firestore project, every Patreon document and hash must include an app namespace. For example:

```text
sha256("robots-building-education:" + npub)
sha256("robots-building-education:" + patreonUserId)
```

Alternatively, put documents beneath an app path such as:

```text
apps/robots-building-education/patreonAccountLinks/{npubHash}
```

Do not reuse Piyali's un-namespaced `patreonAccountLinks` and `patreonUserLinks` collections in a shared project. Otherwise, a key replacement or disconnect in one app could move or remove the other app's link.

### 2. Same Patreon campaign or a separate campaign

Robots Building Education may use the same creator campaign as Piyali if the same Patreon membership intentionally unlocks both apps. In that case, both apps can use the same campaign ID but should still use separate OAuth clients and separate secrets.

Use a separate campaign only if Robots Building Education has a genuinely separate membership product. The membership campaign and acceptance policy must be decided before configuring the client and webhook.

### 3. One Patreon account to one app key

Retain the Piyali rule:

```text
one Patreon account <-> one Robots Building Education Nostr public key
```

This prevents one paid Patreon account from authorizing unlimited shared keys. A Patreon-linked `nsec` can still be shared, just like any account credential; the app cannot prevent the owner from deliberately sharing the private key. The protection is that creating an unrelated new key does not inherit access.

### 4. Checkout URL

If both apps use the same Patreon creator page, Robots Building Education may send users to the existing custom Patreon domain, such as `https://subscribe.piyali.app/`. A custom Patreon domain affects branding and checkout navigation only. It is not the OAuth callback domain and does not share cookies or local storage with either app.

If Robots Building Education gets its own Patreon custom domain, define it as an app configuration value rather than hard-coding it throughout the UI.

## What changes from the legacy paywall

### Remove as authorization mechanisms

- Shared membership passcode submission.
- A passcode stored in local storage or a user document as sufficient authorization.
- A `$120` Patreon post or one-time “buy the apps” action that cannot be authoritatively verified by the membership API.
- A standalone “Connect with Patreon” block beneath the primary subscription CTA.
- Separate monthly and annual cards when both choices represent the same Patreon tier.

The passcode form may remain temporarily in source behind a disabled feature flag while migration is verified, but production authorization must resolve only from Patreon.

### Final authorization rule

Use the equivalent of:

```js
export function resolveSubscriptionAccess({
  patreonVerified = false,
  passcodeVerified = false,
} = {}) {
  const authorized = Boolean(patreonVerified);

  return {
    authorized,
    requiresPatreonMigration: Boolean(passcodeVerified) && !authorized,
  };
}
```

`passcodeVerified` identifies a legacy user who needs the migration explanation; it no longer unlocks the application.

## Final paywall UX

### New or unverified user

Show one membership card:

- Label: `Membership`
- Primary price: `$10/mo`
- Badge: `ANNUAL · 50% OFF`
- Supporting line: `or $5/mo for annual subscriptions`
- CTA: `Subscribe with Patreon`

Patreon does not provide a dependable supported URL parameter for forcing the annual billing toggle. Recommend annual clearly in the app, then let the user choose billing frequency on Patreon.

The primary button performs both “existing member” and “new subscriber” work:

1. Prove the active Nostr key.
2. Complete Patreon OAuth.
3. If the Patreon account is already an active paid member, link and unlock immediately.
4. Otherwise, remember a pending checkout state and direct the user to the Patreon membership page.
5. When the user returns to the app, recheck membership on focus/visibility and offer an explicit **I've subscribed — check again** action.

Patreon may keep the user on Patreon after checkout. Do not promise an automatic redirect unless Patreon later provides a supported mechanism. The app should explain that the user can return after subscribing.

### Legacy passcode user

Do not show the normal pricing page. Show a dedicated migration view:

- Eyebrow: `Existing member`
- Heading: `One quick update to keep your access`
- Explain that the old passcode is being replaced with secure Patreon verification.
- State clearly that no new subscription or passcode is required.
- CTA: `Connect to Patreon`
- Use the same purple membership styling as the normal membership card.

This view exists only when the legacy passcode marker is present and Patreon has not yet been verified. Once OAuth succeeds, remove the migration state naturally by treating Patreon as the only authorization source.

### Key replacement

The key-replacement workflow must have its own full-screen UI. Do not mix it with pricing, passcodes, or the normal subscription card.

Explain:

- This Patreon account is already linked to another app key.
- Confirming moves membership access to the current key.
- The old key will lose subscription access.
- Learning data remains attached to its original Nostr key; replacement changes authorization, not user data ownership.
- The user may cancel safely.

Actions:

- `Replace old connection`
- `Cancel`

### Account settings: Subscription

Add a localized **Subscription** tab or section to the existing account settings UI. It should show:

- Provider: Patreon.
- Linked or not linked.
- Membership state: active, payment problem, inactive, stale, or temporarily unavailable.
- Current entitled USD amount when available.
- Last verified time.

App-controlled actions:

- Refresh status.
- Reconnect Patreon.
- Disconnect Patreon from the app.

Patreon-controlled actions should open Patreon in a new tab:

- Manage membership.
- Update payment method.
- Change tier, renewal, or billing frequency.
- Cancel membership.

Before disconnecting, explicitly state that disconnecting removes app access and the saved link but **does not cancel Patreon billing**.

### Visual details carried over from Piyali

- Use rounded/squircle containers, approximately 28–36 px radii where consistent with the app's design language.
- Keep the main container close to the viewport edges on mobile; avoid the excessive nested margins from the original paywall.
- Make payment CTAs taller with generous top/bottom padding. Do not apply that special padding to unrelated submit buttons.
- Keep CTA text white on hover and press.
- Darken or strengthen the button accent on hover/press instead of changing text to purple.
- Use purple for membership/annual emphasis.
- Keep benefit/body copy smaller than the main sales message.
- Remove first-year, first-month, extra promo, promo-code-copy, and other obsolete promotional clutter.
- Include the mission benefit: `Support the mission to create scholarships with learning.` Adapt the exact wording to the coding app's mission if needed.

### Localization requirements

Port every new screen, error, status, confirmation, button, and accessibility label to every support language offered by Robots Building Education.

For parity with Piyali, the current language set is:

```text
en, es, pt, it, fr, de, ja, hi, ar, zh
```

If Robots Building Education supports a different set, use that app's canonical language list. Requirements:

- Non-English pricing explicitly includes `USD` when the currency might otherwise be ambiguous.
- Arabic layout supports RTL.
- Prices remain values controlled by product configuration/copy, not translated numerals with accidental currency changes.
- Test long German/French/Spanish strings on mobile.
- Do not ship a developer-only language preview toggle.

## End-to-end architecture

```mermaid
sequenceDiagram
    participant Browser as RBE browser
    participant Fn as Firebase Function
    participant DB as Firestore
    participant Patreon as Patreon OAuth/API

    Browser->>Fn: Request signed-action challenge (npub)
    Fn->>DB: Store 5-minute one-use challenge
    Fn-->>Browser: Exact Nostr event template
    Browser->>Browser: Sign with local nsec or NIP-07
    Browser->>Fn: Signed proof + link request
    Fn->>Fn: Verify event, key, action, expiry, one-use
    Fn->>DB: Store hashed OAuth state
    Fn-->>Browser: Patreon authorize URL + typed HttpOnly state cookie
    Browser->>Patreon: OAuth authorization
    Patreon->>Fn: Same-origin callback with code and state
    Fn->>Patreon: Exchange code; fetch identity and membership
    Fn->>Fn: Enforce campaign, paid status, payment, entitlement, tier
    Fn->>DB: Encrypt tokens; write one-to-one mappings and hashed session
    Fn-->>Browser: 30-day typed HttpOnly session cookie; redirect
    Browser->>Fn: GET status + active npub header
    Fn->>DB: Validate session and both link directions
    Fn-->>Browser: Sanitized authorized/subscription state
```

## Nostr proof model

The app already has a Nostr identity, so use that key to prove which local account is being authorized.

1. The browser sends only the current `npub` and requested action.
2. The backend creates a cryptographically random challenge.
3. It stores a hash-addressed, five-minute, one-use challenge record.
4. It returns the exact event template to sign.
5. The browser signs locally with the `nsec`, or asks a NIP-07 extension to sign.
6. The backend checks the signature, event ID, public key, action, timestamps, challenge text, and exact tags.
7. The backend atomically consumes the challenge so it cannot be replayed.

Use Nostr event kind `27235` and support these actions:

```text
link | restore | replace | disconnect
```

The Nostr private key must never be sent to or stored by Firebase, Patreon, Firestore, logs, analytics, or error reporting. The server stores the public key or a hash of it as needed.

## Patreon membership policy

A Patreon identity authorizes access only when all configured checks pass:

1. It belongs to the configured campaign.
2. `patron_status` is `active_patron`.
3. The latest charge is not declined or failed.
4. `currently_entitled_amount_cents` is greater than zero.
5. If `PATREON_ALLOWED_TIER_IDS` is non-empty, at least one entitled tier is allowlisted.

Leaving `PATREON_ALLOWED_TIER_IDS` empty means any active paid membership in the configured campaign is accepted. That intentionally includes an unpublished tier when an existing member is still paying and Patreon continues reporting an active positive entitlement.

Use the minimum OAuth scope required by the proven implementation:

```text
identity
```

Patreon has sometimes omitted an explicit campaign relationship while returning one membership resource to the campaign-owned OAuth client. Preserve the Piyali defensive behavior: accept that sole member resource only when the campaign relationship is omitted, while rejecting any explicit campaign mismatch.

Do not test subscriber behavior with only the creator account. Use an actual paid patron account; a creator is not automatically an active paying member.

## Session and persistent restore model

### Session cookie

Use the Firebase Hosting-compatible cookie name:

```text
__session
```

Firebase Hosting forwards this specially named cookie to rewritten Functions. Prefix/encode its value with a type so different cookies cannot be confused:

```text
oauth-state
oauth-link-state
oauth-recovery
auth-session
```

Production attributes:

```text
HttpOnly; Secure; SameSite=Lax; Path=/
```

The cookie contains an opaque random session ID. Firestore stores only the SHA-256 hash as the session document ID. The default authenticated lifetime is 30 days.

### Bind every session to the active key

Every status request must include the active public key in a header. Rename the Piyali-specific header while porting, for example:

```text
X-RBE-Npub: npub...
```

or use a generic internal convention such as `X-App-Npub`. Client and server must agree exactly.

The backend verifies:

- Session is present, unexpired, and not revoked.
- Session's linked key equals the active key header.
- The forward Nostr-key mapping still points to the same Patreon account.
- The reverse Patreon-user mapping still points back to that Nostr key.

If the active key changes, the client must immediately clear its optimistic `patreonVerified` state and wait for the new status result. This prevents signing out, creating another key in the same browser, and inheriting the prior session cookie.

### Fresh browser or cross-session restore

On `/subscribe`, if there is no usable cookie but the current Nostr key is available:

1. Request a `restore` challenge.
2. Sign it silently when the app holds the local `nsec`; allow normal NIP-07 approval when using an extension.
3. POST the proof to `/key-status`.
4. Verify both mappings and current Patreon membership server-side.
5. Issue a new 30-day browser session.

This requires no extra text input from the user. It proves possession of the same key and recreates the browser session.

## OAuth and checkout flow

### Existing paid member

1. User presses `Subscribe with Patreon` or the legacy migration CTA.
2. Client requests and signs a `link` challenge.
3. Client POSTs the proof to `/link-start`.
4. Backend verifies the proof, stores hashed OAuth state, and sets a typed state cookie.
5. Client navigates to the returned Patreon authorize URL.
6. Patreon returns to the exact same-origin callback.
7. Backend exchanges the code and evaluates membership.
8. Backend writes the one-to-one link and encrypted tokens, creates a session, and redirects into the app.

### Not yet subscribed

If OAuth succeeds but membership is not active:

1. Preserve a pending/checkout-required state associated with the key.
2. Redirect the user to the configured Patreon checkout/membership URL.
3. When the user returns, recheck on browser focus or document visibility.
4. Debounce these checks; the Piyali implementation uses a minimum interval of about 1.5 seconds.
5. Provide a manual `I've subscribed — check again` button.

The app must not unlock merely because the user visited checkout. Only an authoritative Patreon API result grants access.

## Key replacement flow

When OAuth identifies a Patreon account already linked to a different RBE key:

1. Do not overwrite the link automatically.
2. Verify the Patreon account is still actively paid.
3. Create a random, ten-minute recovery record containing the proposed old-to-new mapping and fresh encrypted tokens.
4. Set a typed `oauth-recovery` HttpOnly cookie; never put the recovery secret in the URL.
5. Redirect to the dedicated replacement screen.
6. On confirmation, request a new five-minute `replace` challenge for the new key.
7. Verify the signed proof and recovery state.
8. Force a fresh Patreon membership check.
9. In one Firestore transaction:
   - Confirm the reverse mapping has not changed.
   - Confirm the new key is not linked to another Patreon account.
   - Delete the old key's forward mapping.
   - Write the new key's forward mapping.
   - Point the Patreon reverse mapping to the new key.
   - Create a session for the new key.
   - Mark recovery completed.
10. After commit, revoke sessions tied to the old key.
11. Replace the recovery cookie with a normal auth-session cookie.

The old private key is deliberately not required; fresh Patreon OAuth is the recovery authority.

Use a 30-second client request timeout for `/replace-link`. The live membership refresh can exceed a generic 8-second timeout.

The Piyali implementation intentionally removed per-Patreon-account retry caps after testing. Retain the broad abuse guard of at most 20 recovery starts per IP per hour, or replace it with an equivalent documented policy. Do not reintroduce stale “3 per day” or “6 per hour per account” limits from older planning notes.

## Disconnect flow

Disconnecting the app is not cancelling Patreon.

1. Require a valid authenticated app session.
2. Require a new `disconnect` challenge signed by the currently linked key.
3. Verify both directions of the stored mapping.
4. In one transaction, delete both mappings and the current session.
5. Revoke other sessions for the same link after commit.
6. Clear the browser cookie.
7. Return a sanitized result such as `{ ok: true, billingChanged: false }`.
8. Record a sanitized audit event.

## API contract

Expose the function through same-origin routes:

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/patreon/link-challenge` | Create a one-use Nostr challenge for `link`, `restore`, `replace`, or `disconnect`. |
| `POST` | `/api/patreon/link-start` | Verify `link` proof and return a Patreon authorization URL. |
| `GET` | `/api/patreon/callback` | Validate OAuth state, exchange code, verify membership, link/recover, and redirect. |
| `GET` | `/api/patreon/status` | Validate session/key binding and return sanitized access/subscription state. |
| `POST` | `/api/patreon/key-status` | Restore a browser session using a signed `restore` proof. |
| `POST` | `/api/patreon/refresh-status` | Force an authoritative Patreon refresh with cooldown. |
| `POST` | `/api/patreon/replace-link` | Confirm an old-key-to-new-key transfer. |
| `POST` | `/api/patreon/cancel-replacement` | Cancel and clear a pending recovery. |
| `POST` | `/api/patreon/disconnect` | Remove app link and sessions without changing Patreon billing. |
| `POST` | `/api/patreon/webhook` | Receive authenticated Patreon membership events. |
| `POST` | `/api/patreon/logout` | Clear/revoke the browser's Patreon auth session when appropriate. |

The Piyali backend retains a legacy `GET /start` route. New UI should use the signed `/link-start` flow.

All browser calls must use relative, same-origin URLs. Do not call `cloudfunctions.net` directly from the browser; that previously caused CORS failures and blank callback behavior.

## Sanitized status response

Return only frontend-safe fields, for example:

```json
{
  "authorized": true,
  "configured": true,
  "linked": true,
  "stale": false,
  "subscription": {
    "provider": "patreon",
    "status": "active",
    "entitledAmountCents": 1000,
    "lastChargeStatus": "Paid",
    "lastVerifiedAtMs": 1785600000000
  }
}
```

Never return access tokens, refresh tokens, raw Patreon user IDs, raw recovery values, internal Firestore IDs, or private-key material.

## Patreon API cache behavior

Recommended values carried over from Piyali:

- Successful status cache: 10 minutes.
- Manual refresh cooldown: 30 seconds per session and IP.
- Stale grace: 6 hours only when Patreon is temporarily unavailable and the last authoritative state was active.
- Session lifetime: 30 days.

A 30-day session is not a promise of 30 days of access. Each status check still validates the key mapping and cached/current subscription result. Webhooks can revoke a session sooner, and normal refreshes detect membership changes.

## Webhook architecture

### Why webhooks exist

Without webhooks, the app learns about cancellation or payment failure only when it next polls Patreon. Webhooks let Patreon notify the backend quickly.

Webhooks are a fast invalidation signal, not an independent way to grant access:

- An inactive/deleted/failed/zero-entitlement event revokes authorization and sessions immediately.
- An active-looking event sets `verificationRequiredAtMs`; the next status check bypasses cache and verifies against Patreon API.
- A webhook must never grant access on its own.

### Enable only these events

```text
members:create
members:update
members:delete
members:pledge:create
members:pledge:update
members:pledge:delete
```

Do not enable post publish/update/delete events. Legacy `pledges:*` events shown as deprecated in Patreon should remain off.

### Signature verification

Before reading trusted JSON:

1. Read the exact `req.rawBody` bytes.
2. Read `X-Patreon-Signature`.
3. Compute HMAC-MD5 using `PATREON_WEBHOOK_SECRET`.
4. Compare in constant time.
5. Reject invalid or missing signatures.
6. Validate the event's campaign ID.

Create an idempotency receipt from the event name, signature, and raw-body hash. Duplicate deliveries should return `200` without performing the mutation twice.

## Firestore data model

Use these logical collections, namespaced if the Firebase project is shared:

| Collection | Purpose | TTL |
|---|---|---|
| `patreonOAuthSessions` | Hashed browser sessions and key/link binding. | `expiresAt` |
| `patreonLinkChallenges` | Five-minute one-use Nostr challenges. | `expiresAt` |
| `patreonOAuthStates` | Ten-minute hashed OAuth state. | `expiresAt` |
| `patreonAccountLinks` | Nostr key to encrypted Patreon membership record. | No |
| `patreonUserLinks` | Hashed Patreon user to Nostr key reverse mapping. | No |
| `patreonLinkRecoveries` | Ten-minute replacement intents. | `expiresAt` |
| `patreonOAuthAuditEvents` | Sanitized security/operations events. | `expiresAt` |
| `patreonWebhookReceipts` | Webhook idempotency records. | `expiresAt` |
| `patreonRecoveryRateLimits` | Recovery abuse-control windows. | `expiresAt` |
| `patreonRefreshRateLimits` | Manual-refresh cooldowns. | `expiresAt` |

Firestore client rules must deny direct access to these collections. Only Admin SDK code in trusted Functions should read or write them.

Deploy the TTL field overrides in `firestore.indexes.json`. TTL deletion is asynchronous, so application logic must still reject expired records by timestamp.

## Token encryption

OAuth access and refresh tokens remain backend-only and encrypted at rest with AES-256-GCM using `PATREON_TOKEN_ENCRYPTION_KEY`.

Requirements:

- Generate a new encryption key for Robots Building Education.
- Use a different key per application/environment.
- Never copy Piyali's encryption key.
- Store it only in Firebase Secret Manager or `.secret.local` for the emulator.
- Preserve the key during normal deployments; rotating it without a migration makes old encrypted tokens unreadable and forces users to reconnect.

## Patreon setup for Robots Building Education

### Create a new OAuth client

Create a separate Patreon client for this app. Suggested fields:

```text
App name: Robots Building Education
Description: Connect your Patreon membership to unlock subscriber access in Robots Building Education.
Category: Member Benefits
Company domain: robotsbuildingeducation.com
Redirect URI: https://robotsbuildingeducation.com/api/patreon/callback
```

Also add real icon, privacy-policy, and terms-of-service URLs before production.

The redirect URI must be an exact string match—including scheme, hostname, path, and trailing slash behavior. Use the same exact value in Patreon and `PATREON_REDIRECT_URI`.

Record:

- New RBE client ID.
- New RBE client secret.
- Campaign ID (may equal Piyali's only when intentionally sharing the membership campaign).

### Create a separate webhook

In Patreon's webhook UI, paste this endpoint before pressing the add button:

```text
https://robotsbuildingeducation.com/api/patreon/webhook
```

Patreon generates a webhook secret for that webhook. Store the RBE secret in the RBE Firebase project. Do not reuse the Piyali webhook secret.

Turn on only the six member events listed above. Send a test after the function is deployed; expect HTTP `200`.

## Production configuration

### Non-secret Functions environment

Create or update `functions/.env`:

```dotenv
PATREON_CLIENT_ID=<RBE_PATREON_CLIENT_ID>
PATREON_CAMPAIGN_ID=<AUTHORIZED_CAMPAIGN_ID>
PATREON_REDIRECT_URI=https://robotsbuildingeducation.com/api/patreon/callback
PATREON_APP_URL=https://robotsbuildingeducation.com

# Blank accepts any active paid tier in the campaign.
PATREON_ALLOWED_TIER_IDS=

PATREON_SESSION_DAYS=30
PATREON_STATUS_CACHE_MINUTES=10
PATREON_STALE_GRACE_HOURS=6
PATREON_REFRESH_COOLDOWN_SECONDS=30
PATREON_COOKIE_SECURE=true
PATREON_ALLOW_STATE_COOKIE_FALLBACK=false
```

These are server values. Even the non-secret values do not need a `VITE_` prefix.

### Firebase Secret Manager

Create three new secrets in the target Firebase project:

```text
PATREON_CLIENT_SECRET
PATREON_TOKEN_ENCRYPTION_KEY
PATREON_WEBHOOK_SECRET
```

Example commands, run against the Robots Building Education Firebase project:

```bash
firebase functions:secrets:set PATREON_CLIENT_SECRET --project <RBE_FIREBASE_PROJECT_ID>
firebase functions:secrets:set PATREON_TOKEN_ENCRYPTION_KEY --project <RBE_FIREBASE_PROJECT_ID>
firebase functions:secrets:set PATREON_WEBHOOK_SECRET --project <RBE_FIREBASE_PROJECT_ID>
```

The CLI securely prompts for each value. Do not put the value in the shell command or history.

Verify existence without sharing values:

```bash
firebase functions:secrets:access PATREON_CLIENT_SECRET --project <RBE_FIREBASE_PROJECT_ID>
firebase functions:secrets:access PATREON_TOKEN_ENCRYPTION_KEY --project <RBE_FIREBASE_PROJECT_ID>
firebase functions:secrets:access PATREON_WEBHOOK_SECRET --project <RBE_FIREBASE_PROJECT_ID>
```

Accessing prints the secret, so do this privately. For a safer metadata-only check, use Google Cloud Secret Manager's version list in the console.

Declare all three secrets on the `patreonAuth` function. Merely storing a secret does not make it available to a deployed function; deploy a new revision after changing it.

## Firebase and PWA routing

### Function

Use a second-generation HTTP function:

```text
function: patreonAuth
region: us-central1
timeout: 30 seconds
memory: 256 MiB
```

The Patreon callback and webhook must not require Firebase App Check. Patreon cannot send a browser App Check token. Other application Functions may continue enforcing App Check independently.

### Hosting rewrite

Put the Patreon rewrite before the SPA fallback:

```json
{
  "source": "/api/patreon/**",
  "function": {
    "region": "us-central1",
    "functionId": "patreonAuth"
  }
}
```

Then retain the app fallback:

```json
{ "source": "**", "destination": "/index.html" }
```

### PWA/service worker

The service worker must never serve `index.html` for OAuth or webhook/API requests. In Vite PWA/Workbox configuration:

```js
navigateFallbackDenylist: [/^\/api(?:\/|$)/]
```

This rule fixes the previous blank/off-white callback page and endless loading orb caused by the PWA swallowing `/api/patreon/callback`.

## Local development setup

### Recommended local topology

Run Firestore emulator, Functions emulator, and Vite. Proxy the browser's relative `/api/patreon` calls through Vite to the Functions emulator.

Example Vite proxy:

```js
"/api/patreon": {
  target: "http://127.0.0.1:5001",
  changeOrigin: true,
  rewrite: (path) =>
    `/<RBE_FIREBASE_PROJECT_ID>/us-central1/patreonAuth${path}`,
}
```

Use Java 21 for the Firestore emulator. A single `npm run dev` launcher like Piyali's `scripts/startLocalDev.mjs` prevents the common mistake of opening Vite while the emulator is not running.

### Local non-secret environment

Create `functions/.env.local` or the equivalent emulator environment file:

```dotenv
PATREON_CLIENT_ID=<RBE_TEST_CLIENT_ID>
PATREON_CAMPAIGN_ID=<AUTHORIZED_CAMPAIGN_ID>
PATREON_REDIRECT_URI=http://localhost:4445/api/patreon/callback
PATREON_APP_URL=http://localhost:4445
PATREON_ALLOWED_TIER_IDS=
PATREON_COOKIE_SECURE=false
PATREON_ALLOW_STATE_COOKIE_FALLBACK=false
```

### Local secrets

Create ignored `functions/.secret.local`:

```dotenv
PATREON_CLIENT_SECRET=<RBE_TEST_CLIENT_SECRET>
PATREON_TOKEN_ENCRYPTION_KEY=<LOCAL_RANDOM_ENCRYPTION_KEY>
PATREON_WEBHOOK_SECRET=<LOCAL_OR_TEST_WEBHOOK_SECRET>
```

Confirm `.secret.local`, `.env.local`, emulator data, and logs are excluded from Git.

### Local OAuth client

Prefer a separate Patreon test client whose redirect URI is exactly:

```text
http://localhost:4445/api/patreon/callback
```

If Patreon rejects localhost HTTP, use one HTTPS tunnel for the entire UI origin. Update the test client with the exact tunnel callback every time the quick-tunnel hostname changes.

Cloudflare quick tunnels are ephemeral:

- Restarting the tunnel creates a new hostname.
- An old hostname returns `NXDOMAIN`.
- An unregistered new callback returns Patreon `invalid_request`.
- Mixing tunnel callback and localhost UI origins can break `SameSite` OAuth state cookies.

Only set `PATREON_ALLOW_STATE_COOKIE_FALLBACK=true` for a deliberate split-origin local test. Never enable it in production.

### App Check during local testing

Use Firebase emulators or an App Check debug token for app data requests during onboarding. Do not weaken production App Check globally. The Patreon callback and webhook remain exempt because they are external server callbacks protected by OAuth state or webhook signature instead.

### Local data is not production data

The same Nostr key may look like a new empty account locally because the Firestore emulator does not contain live progress. That does not mean Patreon linked the wrong identity. Test authorization and learning-data restoration as separate concerns.

## Automated tests to port

Port the Piyali Patreon backend tests and adapt names/configuration. At minimum cover:

### OAuth and membership

- Valid OAuth callback and active paid membership unlocks.
- Wrong campaign is denied.
- Inactive patron is denied.
- Failed/declined charge is denied.
- Zero entitlement is denied.
- Allowed-tier filtering works when configured.
- Unpublished but still-paid tier works when all membership checks pass.
- Sole membership fallback works only when campaign relationship is omitted, never on explicit mismatch.
- OAuth state is one-use and expires.
- Callback handles denial/cancellation safely.

### Nostr proofs and sessions

- Valid `link`, `restore`, `replace`, and `disconnect` signatures work.
- Wrong signer, action, challenge, event fields, or expired/replayed challenge fails.
- No private key is present in requests or stored records.
- Fresh browser restore works for the linked key.
- A different active key cannot use an existing browser session.
- Changing keys clears optimistic client authorization.
- Expired/revoked sessions fail.
- Both mapping directions are validated.

### Replacement

- Conflict produces pending recovery, not silent overwrite.
- Recovery expires and cancels safely.
- Wrong new key is rejected.
- Concurrent mapping change is rejected.
- Successful replacement atomically moves both mappings.
- Old sessions are revoked.
- Old key is denied in a fresh browser; new key restores successfully.
- Replacement request supports the 30-second client timeout.
- Broad IP abuse guard works without obsolete per-account retry caps.

### Disconnect

- Requires current session and current linked-key signature.
- Removes both mappings and all sessions.
- Does not alter Patreon billing.
- Returns no sensitive fields.

### Webhooks

- Exact raw-body signature succeeds.
- Missing/incorrect signature fails.
- Wrong campaign fails.
- Non-allowlisted events are ignored safely.
- Duplicate delivery returns success and is idempotent.
- Active-looking update forces an API verification instead of granting.
- Inactive/delete/payment-failure event revokes access and sessions.
- Unlinked Patreon user is ignored safely.

### Frontend

- New user sees one membership card.
- Legacy passcode user sees the migration screen, not normal pricing.
- Passcode does not authorize.
- Primary Patreon CTA handles both active and unsubscribed accounts.
- Pending checkout shows return/check-again guidance.
- Replacement has dedicated UI.
- Subscription settings states/actions render correctly.
- All supported locales have complete copy and currency clarity.
- Arabic RTL and mobile layouts render correctly.
- Pay button remains white-text and accent-darkens on hover/press.

## Manual end-to-end test matrix

Use fresh/incognito profiles and record the expected/actual result.

| Scenario | Expected result |
|---|---|
| Existing paid patron, new app key | OAuth links and unlocks immediately. |
| Non-patron, new app key | OAuth succeeds, app sends to checkout, remains locked until Patreon confirms payment. |
| User returns after subscribing | Focus or manual refresh verifies and unlocks. |
| Creator account without paid pledge | Remains locked. |
| Legacy passcode account | Sees migration explanation and unlocks only after Patreon OAuth. |
| Fresh browser, same linked key | Signed restore creates a new session and unlocks. |
| Same browser, switch to unrelated key | Old cookie does not unlock the new key. |
| Patreon linked to an old lost key | Dedicated replacement screen appears. |
| Confirm replacement | New key unlocks; old key fails in fresh browser. |
| Cancel/expire replacement | No mappings change. |
| Refresh status repeatedly | Cooldown prevents Patreon API spam. |
| Disconnect | App locks; Patreon billing remains active. |
| Webhook `members:update` test | HTTP 200; receipt stored; active-looking state requires next verification. |
| Same webhook replayed | HTTP 200; duplicate recorded/ignored; no duplicate mutation. |
| Invalid webhook secret | HTTP 401/403 according to route handling; no account change. |
| Cancel or fail real membership | Webhook/API revokes authorization and sessions. |
| PWA installed/cached | OAuth callback reaches Function, never SPA fallback. |

## Testing a real webhook safely

You do not need to unsubscribe a real user for the first delivery check.

1. Deploy the backend function with the exact RBE webhook secret.
2. In Patreon's webhook UI, use **Send test** for `members:update`.
3. Expect status `200`.
4. Check Functions logs for a sanitized processed/ignored result.
5. Check `patreonWebhookReceipts` for the receipt.
6. Send the same test again; expect another `200` and idempotent duplicate handling.

A Patreon test payload may reference an unlinked or synthetic member. That is acceptable for proving delivery, signature, campaign validation, and idempotency. It does not fully prove real cancellation revocation, so test the inactive path with automated fixtures and later monitor a legitimate membership lifecycle event.

If Patreon returns `403`, first compare the secret attached to that exact webhook with the active Secret Manager version and verify that a new Function revision was deployed after the secret change.

## Deployment sequence

### Phase 0: isolate work

- Create a feature branch in the Robots Building Education repository.
- Record the current production Hosting release for rollback.
- Confirm whether Firebase and Patreon campaign are shared or separate.
- Add the app namespace before creating any shared-project documents.

### Phase 1: backend and data model

- Port and rename `functions/patreon.js` and its tests.
- Register the function and Secret Manager bindings.
- Add Firestore-deny rules and TTL field overrides.
- Add Hosting API rewrite and PWA denylist.
- Configure the RBE Patreon OAuth client and callback.
- Configure RBE secrets.
- Deploy Functions and Firestore configuration only.
- Leave the production UI on the legacy flow during backend verification.

### Phase 2: webhook

- Create `https://robotsbuildingeducation.com/api/patreon/webhook` in Patreon.
- Store its generated secret.
- Redeploy the Function revision.
- Enable only the six member events.
- Send and replay a test; confirm `200` and idempotency.

### Phase 3: frontend locally

- Port Nostr proof, status, link, restore, checkout, replacement, disconnect, and settings logic.
- Build the final single-card paywall.
- Build the dedicated legacy migration screen.
- Build the dedicated replacement screen.
- Remove visible passcode and one-time purchase actions.
- Complete localization.
- Run automated tests and the manual matrix locally/staging.

### Phase 4: controlled UI release

- Deploy Hosting only after backend checks pass.
- Test production OAuth with an active paid account and a non-member account.
- Test legacy migration with a real legacy marker.
- Test fresh-browser restore and active-key switching.
- Test replacement and disconnect.
- Watch Function errors, webhook delivery history, and audit events.

### Phase 5: legacy cleanup

After a defined migration window and confirmed metrics:

- Delete or permanently remove the passcode form instead of leaving dead source indefinitely.
- Remove passcode authorization environment variables and write paths.
- Decide whether to retain only a historical `subscriptionPasscodeVerified` marker for migration analytics.
- Remove obsolete $120 purchase copy and translation keys.
- Document support procedures for users who cannot access the correct Patreon account.

## Rollback strategy

- Roll back or hide the new Hosting UI first if user-facing OAuth breaks.
- Keep the backend endpoints backward-compatible during the rollout.
- Do not delete account links or encrypted tokens during an ordinary UI rollback.
- Pause the Patreon webhook only if the endpoint is mutating incorrectly; a delivery outage alone can fall back to API verification.
- Preserve the previous Hosting release and Function revision identifiers.
- Never restore passcode authorization as an unplanned emergency bypass; use a deliberate feature flag and support process if a temporary migration exception is truly required.

## Monitoring and operations

Track at least:

- OAuth starts, callbacks, success, cancellation, state errors, and membership denial reasons.
- Restore attempts and results.
- Replacement requested, completed, cancelled, expired, or rejected.
- Disconnect events.
- Forced refreshes and rate limits.
- Webhook accepted, rejected, wrong campaign, duplicate, active recheck, and revocation.
- Function latency and Patreon upstream failures.

Logs and audit records must contain only hashes and sanitized reason codes. Never log:

- OAuth access or refresh tokens.
- Client secret, encryption key, or webhook secret.
- Nostr private keys.
- Full signed events when they are not required for debugging.
- Raw Patreon user IDs when a stable hash is sufficient.
- Raw recovery/session IDs.

Prepare a support runbook for:

- User subscribed with a different Patreon login.
- Membership payment problem.
- Lost Nostr key and replacement.
- User wants to disconnect versus cancel billing.
- Webhook secret rotation.
- OAuth client-secret rotation.
- Encryption-key rotation, which requires a token migration or user reconnect.

## Known failure modes and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Browser reports CORS calling `cloudfunctions.net` | Frontend used direct Function URL. | Use relative `/api/patreon/*` through Hosting/Vite proxy. |
| Blank cream page or loading orb on callback | Service worker/SPA swallowed callback. | Denylist `/api` from PWA navigation fallback and order Hosting rewrite before SPA. |
| `state_error` after Patreon allow | OAuth state cookie missing/mismatched due origin change. | Keep start and callback on one origin; use fallback only for controlled local split-origin tests. |
| Patreon `invalid_request` redirect not supported | Registered callback is not an exact match. | Update client and environment to identical URI. |
| Tunnel callback returns `NXDOMAIN` | Quick tunnel stopped or hostname changed. | Start a new tunnel and update the Patreon test callback. |
| `not_subscribed` for known patron | Wrong Patreon login, creator account, campaign mismatch, or membership parsing. | Test paid patron, inspect sanitized diagnostics, retain sole-member fallback only for omitted campaign relationship. |
| Webhook test returns `403` | Secret mismatch or Function revision still uses old secret. | Set the exact webhook's secret, redeploy Function, retry. |
| Webhook add button returns internal error | Endpoint field was empty/invalid. | Paste full HTTPS webhook endpoint before pressing add. |
| Replacement hangs or has blank network status | Client aborted at old short timeout or Patreon refresh is slow. | Use 30-second `/replace-link` timeout and inspect Function logs. |
| New key in same browser appears already unlocked | Authorization state/cookie carried across key change. | Clear optimistic state on active npub change and require status header/session binding. |
| New incognito tab returns to `/subscribe` | No browser session exists. | Signed `restore` flow should recreate it for the linked key. |
| Local account is empty while live account has data | Firestore emulator has separate data. | Treat this as expected; do not diagnose it as OAuth identity loss. |
| Onboarding stalls on App Check locally | Local app data calls lack emulator/debug configuration. | Use emulators or debug token; do not weaken production App Check. |
| Patreon checkout leaves user on Patreon | No reliable return-to-app behavior. | Show return instructions and recheck when user focuses the app. |

## Security review checklist

- [ ] Separate RBE OAuth client created.
- [ ] Separate RBE client secret stored in Secret Manager.
- [ ] New per-app/per-environment token-encryption key stored securely.
- [ ] Separate RBE webhook and secret created.
- [ ] Shared Firebase project, if any, uses an app namespace everywhere.
- [ ] Exact production callback registered.
- [ ] Production state-cookie fallback disabled.
- [ ] Production cookies are HttpOnly, Secure, SameSite=Lax, and Path=/.
- [ ] Session values are opaque and Firestore IDs are hashed.
- [ ] Nostr proofs are exact, five-minute, one-use, and action-bound.
- [ ] Private key never leaves the browser.
- [ ] Tokens are encrypted AES-256-GCM at rest.
- [ ] Both forward and reverse mappings are checked for every restoration/session.
- [ ] Active npub header is required and client state clears when key changes.
- [ ] Membership requires active status, acceptable charge, positive entitlement, and correct campaign/tier.
- [ ] Webhook HMAC checks exact raw bytes before JSON is trusted.
- [ ] Webhooks cannot grant access.
- [ ] Duplicate webhooks are idempotent.
- [ ] Replacement is explicit, short-lived, freshly reverified, and atomic.
- [ ] Disconnect requires current-key proof and cannot cancel billing.
- [ ] Firestore client rules deny all Patreon auth collections.
- [ ] Secrets and local emulator files are ignored by Git.
- [ ] Logs and frontend responses contain no sensitive identifiers or credentials.

## Production acceptance criteria

The implementation is ready to expose only when all of the following are true:

- [ ] Backend and frontend automated tests pass.
- [ ] Production build passes.
- [ ] Patreon-specific lint passes; unrelated repository lint debt is documented separately.
- [ ] All production configuration and Secret Manager values exist in the correct Firebase project.
- [ ] Function deployment is healthy before Hosting exposes the UI.
- [ ] Real OAuth succeeds for an active paid member.
- [ ] A non-member remains locked before checkout and unlocks only after Patreon confirms payment.
- [ ] A legacy passcode user receives the special migration screen and can migrate.
- [ ] A fresh browser restores with the same Nostr key.
- [ ] Switching to an unrelated key cannot inherit a cookie/session.
- [ ] Lost-key replacement works and invalidates the old key.
- [ ] Disconnect removes app access without cancelling Patreon.
- [ ] Real webhook test returns 200; replay is idempotent.
- [ ] Invalid webhook signature and wrong campaign cannot mutate data.
- [ ] Callback works with the PWA/service worker installed.
- [ ] Every supported language and mobile breakpoint has been inspected.
- [ ] Monitoring and rollback steps are written down and accessible.

## Suggested implementation order inside the RBE repository

1. Copy the Piyali backend and backend tests, then rename app-specific identifiers.
2. Add Firebase secret bindings, Hosting rewrite, Firestore TTL/rules, and PWA API denylist.
3. Make all backend tests pass against RBE configuration.
4. Add the Nostr proof helper and its tests.
5. Add app-level Patreon status, restore, link, refresh, replacement, disconnect, and key-change state handling.
6. Add the dedicated replacement screen.
7. Add the Subscription settings panel.
8. Replace the legacy paywall with the single-card Patreon UI.
9. Add the dedicated legacy-user migration view.
10. Hide/remove passcode and one-time-purchase entry points.
11. Complete translations and UI QA.
12. Execute local and production-staging test matrices.
13. Deploy in the backend-first sequence above.

## Final notes

- The OAuth client secret proves the app's identity to Patreon.
- The webhook secret proves webhook messages came from Patreon.
- The token-encryption key protects stored OAuth tokens.
- These are three different secrets and must not be reused.
- The campaign ID is not a secret, but it controls which membership is accepted.
- The callback URL is not a secret, but it must match exactly.
- A custom Patreon domain is not an OAuth domain and does not create shared storage with the app.
- Patreon remains the authority for checkout, billing frequency, payment, tier changes, cancellation, and renewal.
- Robots Building Education remains the authority for its Nostr-key link, app session, recovery, settings display, and access gate.

Following this plan reproduces the final Piyali architecture while giving Robots Building Education its own credentials, domain routing, data namespace, branding, and safe production rollout.
