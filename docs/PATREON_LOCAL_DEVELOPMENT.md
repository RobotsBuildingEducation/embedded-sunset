# Patreon authentication: local development

The Patreon rearchitecture is enabled automatically inside the Firebase
Functions emulator and the Vite development build. Production does not set the
feature flag and production builds exclude the local OAuth UI, so the existing
production subscription experience remains authoritative while the migration
is being tested.

## Prerequisites

- Node.js 20
- Firebase CLI
- Java 21 for the Firestore emulator
- A separate RBE Patreon test OAuth client with this exact redirect URI:
  `http://localhost:4445/api/patreon/callback`

## Configure the emulator

1. Optionally copy `.env.local.example` to `.env.local`; the local-only UI is
   enabled by default, and the file provides an explicit kill switch.
2. Copy `functions/.env.local.example` to `functions/.env.local`.
3. Copy `functions/.secret.local.example` to `functions/.secret.local`.
4. Replace every placeholder with test values. Never use production secrets.
5. Generate an environment-specific encryption key, for example with
   `openssl rand -base64 32`, and store it only in `.secret.local`.

Both local files are ignored by Git. Do not add secrets to frontend `VITE_*`
variables because browser code can read them.

## Run locally

From the repository root:

```bash
npm run dev
```

The existing `npm run breaking-change` command is now an alias for this same
full-stack launcher; it no longer starts Vite without the required emulators.

The launcher starts the Firestore and Functions emulators, waits for both, and
then starts Vite at `http://localhost:4445`. Vite proxies relative
`/api/patreon/*` requests to the local `patreonAuth` function, preserving the
single-origin cookie flow used by OAuth.

Firestore emulator data is imported from and exported to the ignored
`.firebase-emulator-data/` directory. Patreon links and sessions therefore
survive normal local-stack restarts, which lets the same app key restore its
subscription state just as it does in the deployed flow.

Run the backend test suite separately with:

```bash
npm --prefix functions test
```

Local Firestore data is isolated from production. Authorization and learning
data restoration should be tested as separate concerns.

## Production safety

- Do not add `PATREON_AUTH_ENABLED=true` to production yet.
- Do not deploy Hosting until the backend, webhook, UI, localization, and manual
  test matrix in `PATREON_AUTH_REARCHITECTURE_PLAN.md` are complete.
- If backend configuration is deployed early, leave the feature flag unset so
  every new Patreon route stays inert.
