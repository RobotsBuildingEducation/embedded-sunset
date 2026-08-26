import assert from "node:assert/strict";
import test from "node:test";
import { Amount } from "cashu-ts-v4";
import {
  amountToNumber,
  createBolt11MintQuote,
  filterUnspentProofs,
  getProofsMissingFromState,
  toNdkProof,
  waitForBolt11MintQuote,
} from "./cashuMintClient.js";

const quote = {
  quote: "test-quote",
  request: "lnbc-test",
  state: "UNPAID",
  expiry: 200,
};

test("converts Cashu v4 Amount values to safe numbers", () => {
  assert.equal(amountToNumber(Amount.from(21)), 21);
  assert.throws(
    () => amountToNumber(Amount.from(2n ** 53n)),
    /MAX_SAFE_INTEGER|Invalid/,
  );
});

test("normalizes modern proofs for NDK", () => {
  const normalized = toNdkProof({
    amount: Amount.from(8),
    id: "01keyset",
    secret: "secret-a",
    C: "signature",
  });

  assert.equal(normalized.amount, 8);
  assert.equal(normalized.secret, "secret-a");
});

test("filters spent proofs and sums only unspent entries", () => {
  const proofs = [{ amount: 1 }, { amount: 2 }, { amount: 4 }];
  const states = [
    { state: "SPENT" },
    { state: "UNSPENT" },
    { state: "PENDING" },
  ];

  assert.deepEqual(filterUnspentProofs(proofs, states), [{ amount: 2 }]);
});

test("deduplicates recovered proofs by secret", () => {
  const existing = [{ secret: "a" }];
  const recovered = [
    { secret: "a" },
    { secret: "b" },
    { secret: "b" },
  ];

  assert.deepEqual(getProofsMissingFromState(recovered, existing), [
    { secret: "b" },
  ]);
});

test("creates a BOLT11 quote through the modern mint wallet", async () => {
  const expected = { ...quote };
  const loadWallet = async (mintUrl) => {
    assert.equal(mintUrl, "https://mint.example");
    return {
      async createMintQuoteBolt11(amount, description) {
        assert.equal(amount, 100);
        assert.equal(description, "Deposit");
        return expected;
      },
    };
  };

  assert.equal(
    await createBolt11MintQuote(
      "https://mint.example",
      100,
      "Deposit",
      loadWallet,
    ),
    expected,
  );
});

test("polls an unpaid quote until it is paid", async () => {
  const responses = [
    { ...quote, state: "UNPAID" },
    { ...quote, state: "PAID" },
  ];
  const wallet = {
    async checkMintQuoteBolt11() {
      return responses.shift();
    },
  };

  const result = await waitForBolt11MintQuote(wallet, quote, {
    now: () => 100_000,
    sleep: async () => {},
  });

  assert.equal(result.state, "PAID");
});

test("checks the mint before expiring a restored quote", async () => {
  const wallet = {
    async checkMintQuoteBolt11() {
      return { ...quote, state: "PAID", expiry: 100 };
    },
  };

  const result = await waitForBolt11MintQuote(wallet, quote, {
    now: () => 100_000,
  });

  assert.equal(result.state, "PAID");
});

test("returns terminal issued and expired states", async () => {
  const issuedWallet = {
    async checkMintQuoteBolt11() {
      return { ...quote, state: "ISSUED" };
    },
  };
  const expiredWallet = {
    async checkMintQuoteBolt11() {
      return { ...quote, expiry: 100 };
    },
  };

  assert.equal(
    (await waitForBolt11MintQuote(issuedWallet, quote)).state,
    "ISSUED",
  );
  assert.equal(
    (
      await waitForBolt11MintQuote(expiredWallet, quote, {
        now: () => 100_000,
      })
    ).state,
    "EXPIRED",
  );
});

test("supports aborting and transient network errors", async () => {
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    waitForBolt11MintQuote({}, quote, { signal: controller.signal }),
    { name: "AbortError" },
  );

  let attempts = 0;
  const flakyWallet = {
    async checkMintQuoteBolt11() {
      attempts += 1;
      if (attempts < 3) throw new Error("offline");
      return { ...quote, state: "PAID" };
    },
  };

  const result = await waitForBolt11MintQuote(flakyWallet, quote, {
    now: () => 100_000,
    sleep: async () => {},
  });

  assert.equal(result.state, "PAID");
  assert.equal(attempts, 3);
});
