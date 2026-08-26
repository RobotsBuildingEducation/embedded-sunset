import { Wallet } from "cashu-ts-v4";

const walletPromises = new Map();

function abortError() {
  const error = new Error("Cashu operation aborted");
  error.name = "AbortError";
  return error;
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function wait(ms, signal) {
  throwIfAborted(signal);

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeout);
      reject(abortError());
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function amountToNumber(amount) {
  const value =
    typeof amount?.toNumber === "function" ? amount.toNumber() : Number(amount);

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid Cashu amount");
  }

  return value;
}

export function toNdkProof(proof) {
  if (!proof || typeof proof.secret !== "string" || !proof.secret) {
    throw new Error("Invalid Cashu proof");
  }

  return { ...proof, amount: amountToNumber(proof.amount) };
}

export function toNdkProofs(proofs) {
  return proofs.map(toNdkProof);
}

export function getProofsMissingFromState(proofs, existingProofs = []) {
  const existingSecrets = new Set(existingProofs.map((proof) => proof.secret));
  const seen = new Set(existingSecrets);

  return proofs.filter((proof) => {
    if (!proof?.secret || seen.has(proof.secret)) return false;
    seen.add(proof.secret);
    return true;
  });
}

export function filterUnspentProofs(proofs, states) {
  return proofs.filter((_, index) => states[index]?.state === "UNSPENT");
}

export function sumProofAmounts(proofs) {
  return proofs.reduce((sum, proof) => sum + amountToNumber(proof.amount), 0);
}

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

export async function createBolt11MintQuote(
  mintUrl,
  amount,
  description,
  loadWallet = getMintWallet,
) {
  const wallet = await loadWallet(mintUrl);
  return wallet.createMintQuoteBolt11(amount, description);
}

export async function checkUnspentProofs(mintUrl, proofs) {
  if (proofs.length === 0) return [];

  const wallet = await getMintWallet(mintUrl);
  const states = await wallet.checkProofsStates(proofs);
  return filterUnspentProofs(proofs, states);
}

export function isQuoteExpired(quote, now = Date.now()) {
  const expiry = Number(quote?.expiry);
  return Number.isFinite(expiry) && expiry > 0 && now >= expiry * 1000;
}

/**
 * Poll a BOLT11 quote. The mint is always checked before local expiry is
 * considered, which protects quotes paid at the expiry boundary.
 */
export async function waitForBolt11MintQuote(
  wallet,
  initialQuote,
  {
    signal,
    pollIntervalMs = 2500,
    now = () => Date.now(),
    sleep = wait,
    maxConsecutiveErrors = Number.POSITIVE_INFINITY,
    onQuote,
  } = {},
) {
  let quote = initialQuote;
  let consecutiveErrors = 0;

  while (true) {
    throwIfAborted(signal);

    try {
      quote = await wallet.checkMintQuoteBolt11(quote);
      consecutiveErrors = 0;
      onQuote?.(quote);

      const state = String(quote.state || "").toUpperCase();
      if (state === "PAID" || state === "ISSUED") {
        return { state, quote };
      }

      if (isQuoteExpired(quote, now())) {
        return { state: "EXPIRED", quote };
      }
    } catch (error) {
      throwIfAborted(signal);
      consecutiveErrors += 1;
      if (consecutiveErrors >= maxConsecutiveErrors) throw error;
    }

    await sleep(pollIntervalMs, signal);
  }
}

export function __clearMintWalletCacheForTests() {
  walletPromises.clear();
}
