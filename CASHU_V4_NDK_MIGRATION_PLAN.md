# Cashu TS v4 + NDK Wallet Migration Plan

Use this plan when an app uses `@nostr-dev-kit/ndk-wallet` with Cashu TS 2.x
and a mint has migrated from legacy `00...` keysets to newer `01...` keysets.

## 1. Problem this migration solves

The typical browser error is:

```text
No active keyset found
unable to load wallet for mint https://example-mint/Bitcoin
```

The mint may still be healthy. Cashu TS 2.5.3 filters active keysets to IDs
beginning with `00`, while a migrated mint can advertise an active `01...`
keyset. `ndk-wallet` then catches the Cashu error and reports that it could not
load the wallet.

Do not switch mints merely to hide this error. Existing ecash proofs are tied
to their original mint.

## 2. Target architecture

Keep the two responsibilities separate:

```text
Nostr identity and encrypted proof persistence
                    |
                    v
        @nostr-dev-kit/ndk-wallet

Mint API, quotes, proof checks, minting, and swaps
                    |
                    v
             Cashu TS v4
```

NDK continues to manage the Nostr wallet and relay-backed proof state. Cashu
TS v4 communicates directly with the mint.

## 3. Pre-migration inventory

Before editing the other app, locate:

- The configured mint URL.
- Every call to `wallet.deposit(...)`.
- Every call to `wallet.getCashuWallet(...)`.
- Balance verification and proof-state checks.
- Send, receive, melt, or nutzap operations.
- The NDK proof persistence call, normally `wallet.state.update(...)`.
- Every UI caller that expects an invoice string or balance number.

Useful search:

```bash
rg -n "getCashuWallet|initiateDeposit|deposit\(|checkProofsStates|state\.update|send\(" src
```

Confirm the mint migration independently:

```bash
curl -sS https://example-mint/Bitcoin/v1/keysets
curl -sS https://example-mint/Bitcoin/v1/info
```

## 4. Dependency strategy

`@nostr-dev-kit/ndk-wallet@0.7.x` requires Cashu TS `^2.1`. Installing Cashu
TS 4.x over that dependency can break NDK at runtime. Keep the legacy package
for NDK and install v4 under an npm alias:

```bash
npm install cashu-ts-v4@npm:@cashu/cashu-ts@4.9.0
```

The resulting dependencies should include both generations:

```json
{
  "dependencies": {
    "@cashu/cashu-ts": "^2.5.3",
    "@nostr-dev-kit/ndk-wallet": "^0.7.0",
    "cashu-ts-v4": "npm:@cashu/cashu-ts@4.9.0"
  }
}
```

Pin the alias to an exact version during the migration. Cashu TS v4 is ESM
only and declares Node 22.4 or newer, so run installs, tests, and builds with a
compatible Node 22 release.

Do not use `--force` or `--legacy-peer-deps` to replace NDK's Cashu dependency.

## 5. Add a modern mint-client adapter

Create one small module that is the only place the rest of the app imports
`cashu-ts-v4`.

The adapter should provide:

1. A cached, mint-URL-keyed `Wallet` loader.
2. BOLT11 quote creation.
3. Quote polling until `PAID`, `ISSUED`, or expiry.
4. Paid-quote minting.
5. Proof-state checking.
6. Conversion from Cashu v4 `Amount` objects to safe JavaScript numbers.
7. Conversion of v4 proofs into plain NDK-compatible proof objects.

Minimal loader:

```js
import { Wallet } from "cashu-ts-v4";

const walletPromises = new Map();

export async function getMintWallet(mintUrl) {
  if (!walletPromises.has(mintUrl)) {
    const promise = (async () => {
      const wallet = new Wallet(mintUrl);
      await wallet.loadMint();
      return wallet;
    })().catch((error) => {
      walletPromises.delete(mintUrl);
      throw error;
    });

    walletPromises.set(mintUrl, promise);
  }

  return walletPromises.get(mintUrl);
}
```

Proof normalization:

```js
export function toNdkProof(proof) {
  const amount =
    typeof proof.amount?.toNumber === "function"
      ? proof.amount.toNumber()
      : Number(proof.amount);

  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error("Invalid Cashu proof amount");
  }

  return { ...proof, amount };
}
```

Keep the app's existing internal balance type as `number` unless it actually
needs values beyond JavaScript's safe integer range.

## 6. Replace the deposit flow

Replace:

```js
const deposit = ndkCashuWallet.deposit(amount, mintUrl);
const invoice = await deposit.start();
```

with this state machine:

```text
Create BOLT11 quote
        |
        v
Persist pending quote
        |
        v
Show invoice and poll quote
        |
        v
Quote PAID -> mint proofs
        |
        v
Persist issued proofs temporarily
        |
        v
Store proofs in NDK state
        |
        v
Remove pending record and refresh balance
```

Core v4 calls:

```js
const wallet = await getMintWallet(mintUrl);
const quote = await wallet.createMintQuoteBolt11(amount, "Deposit");

// After quote.state becomes PAID:
const modernProofs = await wallet.mintProofsBolt11(amount, paidQuote);
const proofs = modernProofs.map(toNdkProof);

await ndkCashuWallet.state.update({
  store: proofs,
  mint: mintUrl,
});
```

The public `initiateDeposit(amount)` contract can remain unchanged: return the
Lightning invoice string immediately and perform monitoring asynchronously.

## 7. Make paid deposits refresh-safe

Store one pending-deposit record per Nostr public key in browser storage:

```json
{
  "ownerPubkey": "hex-pubkey",
  "mint": "https://example-mint/Bitcoin",
  "amount": 100,
  "createdAt": 1780000000000,
  "quote": {
    "quote": "mint-quote-id",
    "request": "lnbc...",
    "state": "UNPAID",
    "expiry": 1780000900
  }
}
```

Recovery requirements:

- Resume monitoring after the NDK wallet opens.
- Check the mint once before declaring a restored quote expired. It may have
  been paid immediately before expiry.
- After minting succeeds, add the issued proofs to the pending record before
  writing them to NDK state.
- On restart, store those pending proofs without trying to mint the quote a
  second time.
- Compare proof secrets against existing NDK proofs before storing, preventing
  duplicates if the previous relay write actually succeeded.
- Remove the pending record only after NDK storage succeeds.
- Abort active polling when the user logs out or switches identities.

The temporary proof record contains bearer ecash and should be removed as soon
as NDK storage succeeds. Never log proof secrets, quote IDs, Nostr private
keys, or complete invoices in production logs.

## 8. Replace balance verification

Do not call the legacy `ndkCashuWallet.getCashuWallet(mintUrl)` when checking a
balance. It will encounter the same keyset failure.

Instead:

```js
const proofs = ndkCashuWallet.state.getProofs({ mint: mintUrl }) || [];
const wallet = await getMintWallet(mintUrl);
const states = await wallet.checkProofsStates(proofs);

const unspent = proofs.filter(
  (_, index) => states[index]?.state === "UNSPENT",
);
const balance = unspent.reduce((sum, proof) => sum + proof.amount, 0);
```

Only count `UNSPENT` proofs.

## 9. Replace send and nutzap mint operations

Any send path that still calls `getCashuWallet()` remains broken even after
deposit creation is fixed.

For an ordinary Cashu send:

```js
const { keep, send } = await wallet.send(amount, unspentProofs);
```

For a P2PK-locked nutzap:

```js
const { keep, send } = await wallet.ops
  .send(amount, unspentProofs)
  .asP2PK({ pubkey: recipientP2pkPubkey })
  .run();
```

Normalize both `keep` and `send` proofs before using NDK:

```js
const ndkKeep = keep.map(toNdkProof);
const ndkSend = send.map(toNdkProof);

await ndkCashuWallet.state.update({
  destroy: originalProofs,
  store: ndkKeep,
  mint: mintUrl,
});
```

Publish `ndkSend` in the existing NIP-61 event.

## 10. Preserve the UI contract

The UI should not need a rewrite. Preserve these state fields and behaviors:

- `invoice`: the BOLT11 string shown in the QR code.
- `walletBalance`: a plain satoshi number.
- `errorMessage`: a readable mint or deposit error.
- Clear `invoice` after successful proof storage or terminal expiry.
- Return `null` when invoice creation fails.
- Continue supporting existing `onSuccess` and `onError` callbacks.

When a pending invoice already exists, reuse it rather than creating multiple
simultaneous quotes for the same identity.

## 11. Testing plan

### Unit tests

Cover at least:

- v4 `Amount` to number conversion.
- Modern proof to NDK proof conversion.
- Spent/unspent proof filtering.
- Quote creation.
- `UNPAID` to `PAID` polling.
- Restored quote paid at the expiry boundary.
- `ISSUED`, expired, aborted, and repeated network-error behavior.
- Deduplication by proof secret.
- Recovery when proofs were minted but not yet written to NDK.

### Static verification

```bash
npx eslint path/to/wallet-store.js path/to/mint-client.js path/to/tests.js
npm test
npm run build
git diff --check
```

### Live read-only verification

Confirm that the modern wallet loads the mint and selects its `01...` keyset:

```js
const wallet = new Wallet(mintUrl);
await wallet.loadMint();
console.log(wallet.keysetId);
```

### Live invoice verification

Create the mint's minimum unpaid test invoice and immediately check that the
quote is `UNPAID`. Do not pay it during automated verification. It should
expire without moving funds.

### Manual paid test

After automated checks pass:

1. Use the smallest practical real amount.
2. Create and pay one invoice.
3. Confirm the invoice disappears.
4. Confirm the balance increases by the exact amount.
5. Refresh the page and confirm the balance remains.
6. Send the smallest supported amount and confirm the balance/proof state.

## 12. Rollout and rollback

Roll out to a staging or preview environment first. Watch for:

- Mint loading errors.
- Quotes stuck in `UNPAID` after payment.
- `ISSUED` quotes without stored proofs.
- Duplicate proof secrets.
- Balance differences before and after refresh.
- Failed NDK relay writes.

Rollback is a normal code rollback. Do not delete proof events or pending
deposit records during rollback; those records may be required to recover a
paid deposit.

## 13. Definition of done

The migration is complete when:

- The app loads the mint's active `01...` keyset.
- Deposit invoice creation no longer uses the NDK Cashu wrapper.
- Paid proofs are stored through the existing NDK state layer.
- Pending and just-issued deposits recover after refresh.
- Balance verification uses Cashu TS v4.
- Send/nutzap mint operations use Cashu TS v4.
- Existing UI callers require no changes.
- Unit tests, the full test suite, lint, and production build pass.
- One minimal manual paid deposit succeeds in the target environment.

## 14. Reference implementation in this app

- `src/utils/cashuMintClient.js`: modern Cashu adapter and polling.
- `src/hooks/useNostrWalletStore.js`: NDK persistence, deposit recovery,
  balance verification, and nutzap integration.
- `src/utils/cashuMintClient.test.js`: focused migration tests.
- `package.json`: version-aliased Cashu TS v4 dependency.
