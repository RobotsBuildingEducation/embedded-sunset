/* global require, Buffer */

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
} = require("nostr-tools");

const {
  buildBrowserSessionRecord,
  buildNostrAuthEvent,
  buildSubscriptionSummary,
  createPatreonHandler,
  decodeSessionCookieValue,
  decryptToken,
  encodeSessionCookieValue,
  encryptToken,
  evaluatePatreonIdentity,
  evaluatePatreonMemberResource,
  getPatreonConfig,
  parseCookies,
  serializeCookie,
  sha256,
  verifyNostrAuthEvent,
  webhookMemberState,
} = require("./patreon");

class FakeFirestore {
  constructor(seed = {}) {
    this.records = new Map(Object.entries(seed));
    this.queryCount = 0;
  }

  collection(name) {
    const database = this;
    return {
      doc(id) {
        const key = `${name}/${id}`;
        return {
          id,
          key,
          async get() {
            const value = database.records.get(key);
            return {
              exists: value !== undefined,
              id,
              ref: this,
              data: () => value,
            };
          },
          async set(value, options = {}) {
            const current = database.records.get(key) || {};
            database.records.set(key, options.merge ? { ...current, ...value } : value);
          },
          async delete() {
            database.records.delete(key);
          },
        };
      },
      where(field, operator, value) {
        assert.equal(operator, "==");
        return {
          limit(limitValue) {
            return {
              async get() {
                database.queryCount += 1;
                const docs = [];
                for (const [key, record] of database.records) {
                  if (!key.startsWith(`${name}/`) || record?.[field] !== value) continue;
                  const id = key.slice(name.length + 1);
                  const ref = database.collection(name).doc(id);
                  docs.push({ id, ref, data: () => record });
                  if (docs.length >= limitValue) break;
                }
                return { docs };
              },
            };
          },
        };
      },
    };
  }

  async runTransaction(callback) {
    return callback({
      get: (ref) => ref.get(),
      set: (ref, value, options) => ref.set(value, options),
      update: (ref, value) => ref.set(value, { merge: true }),
      delete: (ref) => ref.delete(),
    });
  }

  batch() {
    const deletions = [];
    return {
      delete(ref) {
        deletions.push(ref);
      },
      async commit() {
        await Promise.all(deletions.map((ref) => ref.delete()));
      },
    };
  }
}

function fakeResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: "",
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(value) {
      this.statusCode = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
    redirect(statusCode, location) {
      this.statusCode = statusCode;
      this.headers.Location = location;
      return this;
    },
  };
}

function handlerConfig(overrides = {}) {
  return {
    configured: true,
    webhookConfigured: true,
    webhookSecret: "webhook-secret",
    campaignId: "campaign-1",
    cookieSecure: false,
    allowStateCookieFallback: false,
    statusCacheMs: 60_000,
    staleGraceMs: 60_000,
    refreshCooldownMs: 30_000,
    sessionDurationMs: 60_000,
    tokenEncryptionKey: "encryption-secret",
    allowedTierIds: new Set(),
    ...overrides,
  };
}

function identityWithMembership({
  campaignId = "campaign-1",
  patronStatus = "active_patron",
  lastChargeStatus = "Paid",
  amountCents = 500,
  tierIds = ["tier-annual"],
} = {}) {
  return {
    data: {
      id: "patreon-user-1",
      type: "user",
      relationships: {
        memberships: {
          data: [{ id: "member-1", type: "member" }],
        },
      },
    },
    included: [
      {
        id: "member-1",
        type: "member",
        attributes: {
          patron_status: patronStatus,
          last_charge_status: lastChargeStatus,
          currently_entitled_amount_cents: amountCents,
        },
        relationships: {
          ...(campaignId
            ? { campaign: { data: { id: campaignId, type: "campaign" } } }
            : {}),
          currently_entitled_tiers: {
            data: tierIds.map((id) => ({ id, type: "tier" })),
          },
        },
      },
    ],
  };
}

function config(overrides = {}) {
  return {
    campaignId: "campaign-1",
    allowedTierIds: new Set(),
    ...overrides,
  };
}

function signedWebhookRequest(body, eventName = "members:update") {
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = crypto
    .createHmac("md5", "webhook-secret")
    .update(rawBody)
    .digest("hex");
  return {
    method: "POST",
    url: "/api/patreon/webhook",
    headers: {
      "x-patreon-event": eventName,
      "x-patreon-signature": signature,
    },
    rawBody,
    body,
  };
}

function storedAuthorization(now = Date.now()) {
  return {
    authorized: true,
    patreonUserId: "patreon-user-1",
    memberId: "member-1",
    tierIds: ["tier-annual"],
    entitledAmountCents: 500,
    patronStatus: "active_patron",
    lastChargeStatus: "paid",
    lastVerifiedAtMs: now - 120_000,
    oauthExpiresAtMs: now + 120_000,
    encryptedAccessToken: encryptToken("access", "encryption-secret"),
    encryptedRefreshToken: encryptToken("refresh", "encryption-secret"),
  };
}

test("authorizes an active paid member of the configured campaign", () => {
  const result = evaluatePatreonIdentity(identityWithMembership(), config());
  assert.equal(result.authorized, true);
  assert.equal(result.patreonUserId, "patreon-user-1");
  assert.equal(result.memberId, "member-1");
  assert.equal(result.entitledAmountCents, 500);
});

test("authorizes the sole client-campaign membership when Patreon omits its campaign relationship", () => {
  const result = evaluatePatreonIdentity(
    identityWithMembership({ campaignId: null }),
    config(),
  );

  assert.equal(result.authorized, true);
  assert.equal(result.reason, "active_paid_member");
  assert.equal(result.entitledAmountCents, 500);
});

test("denies users without a Patreon membership", () => {
  const result = evaluatePatreonIdentity(
    { data: { relationships: { memberships: { data: [] } } }, included: [] },
    config(),
  );
  assert.deepEqual(result, { authorized: false, reason: "no_membership" });
});

test("denies membership for another campaign", () => {
  const result = evaluatePatreonIdentity(
    identityWithMembership({ campaignId: "campaign-2" }),
    config(),
  );
  assert.equal(result.authorized, false);
  assert.equal(result.reason, "wrong_campaign");
});

test("denies inactive, declined, and zero-value memberships", () => {
  const inactive = evaluatePatreonIdentity(
    identityWithMembership({ patronStatus: "former_patron" }),
    config(),
  );
  const declined = evaluatePatreonIdentity(
    identityWithMembership({ lastChargeStatus: "Declined" }),
    config(),
  );
  const free = evaluatePatreonIdentity(
    identityWithMembership({ amountCents: 0 }),
    config(),
  );

  assert.equal(inactive.reason, "inactive_membership");
  assert.equal(declined.reason, "payment_not_current");
  assert.equal(free.reason, "no_paid_entitlement");
});

test("enforces configured tier ids", () => {
  const denied = evaluatePatreonIdentity(
    identityWithMembership({ tierIds: ["tier-monthly"] }),
    config({ allowedTierIds: new Set(["tier-annual"]) }),
  );
  const allowed = evaluatePatreonIdentity(
    identityWithMembership({ tierIds: ["tier-annual"] }),
    config({ allowedTierIds: new Set(["tier-annual"]) }),
  );

  assert.equal(denied.reason, "tier_not_allowed");
  assert.equal(allowed.authorized, true);
});

test("encrypts OAuth tokens with authenticated encryption", () => {
  const encrypted = encryptToken("patreon-token", "test-encryption-secret");
  assert.notEqual(encrypted, "patreon-token");
  assert.equal(
    decryptToken(encrypted, "test-encryption-secret"),
    "patreon-token",
  );
  assert.throws(() => decryptToken(encrypted, "wrong-secret"));
});

test("serializes and parses secure OAuth cookies", () => {
  const serialized = serializeCookie("__session", "abc 123", {
    maxAge: 60,
    secure: true,
  });
  assert.match(serialized, /HttpOnly/);
  assert.match(serialized, /Secure/);
  assert.match(serialized, /SameSite=Lax/);
  assert.equal(parseCookies("__session=abc%20123").__session, "abc 123");
});

test("keeps OAuth state and authenticated sessions distinct", () => {
  const stateCookie = encodeSessionCookieValue("oauth-state", "state-value");
  const authCookie = encodeSessionCookieValue("auth-session", "session-id");

  assert.equal(
    decodeSessionCookieValue(stateCookie, "oauth-state"),
    "state-value",
  );
  assert.equal(decodeSessionCookieValue(stateCookie, "auth-session"), "");
  assert.equal(
    decodeSessionCookieValue(authCookie, "auth-session"),
    "session-id",
  );
});

test("marks Patreon configuration complete only when secrets are present", () => {
  const incomplete = getPatreonConfig({ PATREON_CLIENT_ID: "client" });
  const complete = getPatreonConfig({
    PATREON_CLIENT_ID: "client",
    PATREON_CLIENT_SECRET: "secret",
    PATREON_CAMPAIGN_ID: "campaign",
    PATREON_REDIRECT_URI: "https://example.com/api/patreon/callback",
    PATREON_TOKEN_ENCRYPTION_KEY: "encryption-secret",
  });

  assert.equal(incomplete.configured, false);
  assert.equal(complete.configured, true);
  assert.equal(complete.cookieSecure, true);
  assert.equal(complete.webhookConfigured, false);
  assert.equal(
    getPatreonConfig({
      PATREON_CAMPAIGN_ID: "campaign",
      PATREON_WEBHOOK_SECRET: "webhook-secret",
    }).webhookConfigured,
    true,
  );
});

test("keeps every Patreon route inert until the environment opts in", async () => {
  const db = new FakeFirestore();
  const handler = createPatreonHandler({
    db,
    getConfig: () => ({ enabled: false }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/status",
      headers: {},
    },
    response,
  );

  assert.equal(response.statusCode, 404);
  assert.deepEqual(JSON.parse(response.body), { error: "not_found" });
  assert.equal(db.records.size, 0);
});

test("status requires the active Robots Building Education key", async () => {
  const db = new FakeFirestore();
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/status",
      headers: {},
    },
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(response.body).error, "active_key_required");
});

test("removes the unsigned OAuth start route", async () => {
  const db = new FakeFirestore();
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/start",
      headers: {},
    },
    response,
  );

  assert.equal(response.statusCode, 404);
  assert.deepEqual(JSON.parse(response.body), { error: "not_found" });
  assert.equal(db.records.size, 0);
});

test("enables Patreon auth automatically in the Functions emulator", () => {
  const config = getPatreonConfig({ FUNCTIONS_EMULATOR: "true" });
  assert.equal(config.enabled, true);
});

test("returns only sanitized subscription status to the browser", () => {
  const summary = buildSubscriptionSummary({
    authorized: true,
    entitledAmountCents: 500,
    lastChargeStatus: "Paid",
    lastVerifiedAtMs: 1234,
    encryptedAccessToken: "must-not-leak",
    patreonUserId: "must-not-leak",
  });

  assert.deepEqual(summary, {
    provider: "patreon",
    status: "active",
    entitledAmountCents: 500,
    lastChargeStatus: "paid",
    lastVerifiedAtMs: 1234,
    stale: false,
  });
  assert.equal("patreonUserId" in summary, false);
  assert.equal("encryptedAccessToken" in summary, false);
});

test("status restores a pending replacement from its key-bound recovery cookie", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const rawRecoveryId = "pending-recovery-status";
  const db = new FakeFirestore({
    [`patreonLinkRecoveries/${sha256(rawRecoveryId)}`]: {
      ...storedAuthorization(),
      status: "pending",
      nextNpubHash: sha256(npub),
      expiresAtMs: Date.now() + 60_000,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/status",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-recovery", rawRecoveryId),
        )}`,
        "x-rbe-npub": npub,
      },
    },
    response,
  );

  assert.equal(response.statusCode, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.authorized, false);
  assert.equal(payload.replacementRequired, true);
  assert.equal(payload.reason, "replace_required");
  assert.equal(payload.subscription.status, "active");
  assert.equal("encryptedAccessToken" in payload.subscription, false);
  assert.equal("patreonUserId" in payload.subscription, false);
});

test("browser sessions carry hashed link identifiers and a Firestore TTL", () => {
  const record = buildBrowserSessionRecord({
    record: {
      npub: "npub-test",
      patreonUserId: "patreon-user-1",
      memberId: "member-1",
      entitledAmountCents: 500,
      encryptedAccessToken: "access",
      encryptedRefreshToken: "refresh",
    },
    config: { sessionDurationMs: 60_000 },
    now: 1000,
  });

  assert.equal(record.expiresAtMs, 61_000);
  assert.equal(record.expiresAt instanceof Date, true);
  assert.equal(record.linkedNpubHash.length, 64);
  assert.equal(record.linkedPatreonUserHash.length, 64);
});

test("webhooks revoke explicit inactive states but never grant active state", () => {
  const relationship = {
    campaign: { data: { id: "campaign-1" } },
    user: { data: { id: "patreon-user-1" } },
  };
  const declined = webhookMemberState("members:update", {
    data: {
      attributes: {
        patron_status: "active_patron",
        last_charge_status: "Declined",
        currently_entitled_amount_cents: 500,
      },
      relationships: relationship,
    },
  });
  const active = webhookMemberState("members:update", {
    data: {
      attributes: {
        patron_status: "active_patron",
        last_charge_status: "Paid",
        currently_entitled_amount_cents: 500,
      },
      relationships: relationship,
    },
  });

  assert.equal(declined.inactive, true);
  assert.equal(declined.reason, "payment_not_current");
  assert.equal(active.inactive, false);
  assert.equal(active.reason, "verification_required");
});

test("member resource evaluation preserves inactive diagnostics", () => {
  const member = identityWithMembership({
    patronStatus: "former_patron",
    lastChargeStatus: "Paid",
  }).included[0];
  const result = evaluatePatreonMemberResource(member, config(), {
    patreonUserId: "patreon-user-1",
  });

  assert.equal(result.authorized, false);
  assert.equal(result.reason, "inactive_membership");
  assert.equal(result.patronStatus, "former_patron");
});

test("webhook endpoint rejects an invalid signature before processing data", async () => {
  const db = new FakeFirestore();
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const rawBody = Buffer.from(JSON.stringify({ data: {} }));
  const response = fakeResponse();

  await handler(
    {
      method: "POST",
      url: "/api/patreon/webhook",
      headers: {
        "x-patreon-event": "members:update",
        "x-patreon-signature": "invalid",
      },
      rawBody,
      body: { data: {} },
    },
    response,
  );

  assert.equal(response.statusCode, 401);
  assert.equal(JSON.parse(response.body).error, "invalid_webhook_signature");
  const auditRecords = [...db.records.entries()].filter(([key]) =>
    key.startsWith("patreonOAuthAuditEvents/"),
  );
  assert.equal(auditRecords.length, 1);
  assert.equal(auditRecords[0][1].type, "webhook_rejected");
  assert.equal(auditRecords[0][1].reason, "invalid_webhook_signature");
  assert.equal("body" in auditRecords[0][1], false);
});

test("active webhook marks a linked account for API verification without granting access", async () => {
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = crypto.createHash("sha256").update(patreonUserId).digest("hex");
  const npubHash = "npub-hash";
  const db = new FakeFirestore({
    [`patreonUserLinks/${patreonUserHash}`]: { npubHash },
    [`patreonAccountLinks/${npubHash}`]: { authorized: false, patreonUserId },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const body = {
    data: {
      attributes: {
        patron_status: "active_patron",
        last_charge_status: "Paid",
        currently_entitled_amount_cents: 500,
      },
      relationships: {
        campaign: { data: { id: "campaign-1" } },
        user: { data: { id: patreonUserId } },
      },
    },
  };
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = crypto
    .createHmac("md5", "webhook-secret")
    .update(rawBody)
    .digest("hex");
  const response = fakeResponse();

  await handler(
    {
      method: "POST",
      url: "/api/patreon/webhook",
      headers: {
        "x-patreon-event": "members:update",
        "x-patreon-signature": signature,
      },
      rawBody,
      body,
    },
    response,
  );

  assert.equal(response.statusCode, 200);
  const account = db.records.get(`patreonAccountLinks/${npubHash}`);
  assert.equal(account.authorized, false);
  assert.equal(account.verificationRequiredAtMs > 0, true);

  const replayResponse = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/webhook",
      headers: {
        "x-patreon-event": "members:update",
        "x-patreon-signature": signature,
      },
      rawBody,
      body,
    },
    replayResponse,
  );
  assert.equal(JSON.parse(replayResponse.body).duplicate, true);
  assert.equal(
    [...db.records.keys()].filter((key) =>
      key.startsWith("patreonWebhookReceipts/"),
    ).length,
    1,
  );
});

test("inactive webhook revokes once and duplicate delivery performs no second cleanup", async () => {
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = sha256(patreonUserId);
  const npubHash = "linked-npub-hash";
  const db = new FakeFirestore({
    [`patreonUserLinks/${patreonUserHash}`]: { npubHash },
    [`patreonAccountLinks/${npubHash}`]: {
      ...storedAuthorization(),
      patreonUserId,
    },
    "patreonOAuthSessions/session-one": {
      authorized: true,
      linkedNpubHash: npubHash,
      linkedPatreonUserHash: patreonUserHash,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const request = signedWebhookRequest({
    data: {
      attributes: {
        patron_status: "former_patron",
        last_charge_status: "Paid",
        currently_entitled_amount_cents: 0,
      },
      relationships: {
        campaign: { data: { id: "campaign-1" } },
        user: { data: { id: patreonUserId } },
      },
    },
  });

  const firstResponse = fakeResponse();
  await handler(request, firstResponse);
  assert.equal(firstResponse.statusCode, 200);
  assert.equal(
    db.records.get(`patreonAccountLinks/${npubHash}`).authorized,
    false,
  );
  assert.equal(db.records.has("patreonOAuthSessions/session-one"), false);
  const cleanupQueriesAfterFirstDelivery = db.queryCount;
  const receipt = [...db.records.entries()].find(([key]) =>
    key.startsWith("patreonWebhookReceipts/"),
  )[1];
  assert.equal(receipt.result, "processed");
  assert.equal(receipt.reason, "inactive_membership");
  assert.equal(receipt.campaignId, "campaign-1");
  assert.equal("body" in receipt, false);
  assert.equal("bodyHash" in receipt, false);

  const replayResponse = fakeResponse();
  await handler(request, replayResponse);
  assert.equal(JSON.parse(replayResponse.body).duplicate, true);
  assert.equal(db.queryCount, cleanupQueriesAfterFirstDelivery);
});

test("signed webhook for another campaign is rejected with a sanitized receipt", async () => {
  const db = new FakeFirestore();
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const request = signedWebhookRequest({
    data: {
      relationships: {
        campaign: { data: { id: "campaign-2" } },
        user: { data: { id: "patreon-user-1" } },
      },
    },
  });
  const response = fakeResponse();
  await handler(request, response);
  assert.equal(response.statusCode, 403);
  const receipt = [...db.records.entries()].find(([key]) =>
    key.startsWith("patreonWebhookReceipts/"),
  )[1];
  assert.equal(receipt.result, "rejected");
  assert.equal(receipt.reason, "wrong_campaign");
  assert.equal(receipt.patreonUserHash, null);
  assert.equal("bodyHash" in receipt, false);
});

test("unknown signed webhook event is acknowledged without account changes", async () => {
  const db = new FakeFirestore();
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();
  await handler(
    signedWebhookRequest({ data: {} }, "posts:publish"),
    response,
  );
  assert.equal(response.statusCode, 202);
  assert.equal(JSON.parse(response.body).ignored, true);
  const receipt = [...db.records.entries()].find(([key]) =>
    key.startsWith("patreonWebhookReceipts/"),
  )[1];
  assert.equal(receipt.result, "ignored");
  assert.equal(receipt.reason, "event_not_allowlisted");
});

test("forced refresh is atomically limited by both session and IP", async () => {
  const now = Date.now();
  const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
  const npubHash = sha256(npub);
  const patreonUserHash = sha256("patreon-user-1");
  const account = { ...storedAuthorization(now), npub };
  const configValue = handlerConfig();
  const sessionOne = buildBrowserSessionRecord({
    record: account,
    config: configValue,
    now,
  });
  const sessionTwo = buildBrowserSessionRecord({
    record: account,
    config: configValue,
    now,
  });
  const db = new FakeFirestore({
    [`patreonAccountLinks/${npubHash}`]: account,
    [`patreonUserLinks/${patreonUserHash}`]: { npubHash },
    [`patreonOAuthSessions/${sha256("session-one")}`]: sessionOne,
    [`patreonOAuthSessions/${sha256("session-two")}`]: sessionTwo,
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => configValue,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => identityWithMembership(),
    }),
    logger: { info() {}, warn() {}, error() {} },
  });

  const firstResponse = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/refresh-status",
      ip: "203.0.113.10",
      headers: {
        "x-rbe-npub": npub,
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", "session-one"),
        )}`,
      },
    },
    firstResponse,
  );
  assert.equal(firstResponse.statusCode, 200);
  assert.equal(JSON.parse(firstResponse.body).authorized, true);

  const sameSessionResponse = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/refresh-status",
      ip: "203.0.113.11",
      headers: {
        "x-rbe-npub": npub,
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", "session-one"),
        )}`,
      },
    },
    sameSessionResponse,
  );
  assert.equal(sameSessionResponse.statusCode, 429);
  assert.equal(JSON.parse(sameSessionResponse.body).error, "refresh_rate_limited");

  const sameIpResponse = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/refresh-status",
      ip: "203.0.113.10",
      headers: {
        "x-rbe-npub": npub,
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", "session-two"),
        )}`,
      },
    },
    sameIpResponse,
  );
  assert.equal(sameIpResponse.statusCode, 429);
  assert.equal(JSON.parse(sameIpResponse.body).error, "refresh_rate_limited");
});

test("status invalidates an old session after its Patreon mapping changes", async () => {
  const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
  const oldNpubHash = sha256(npub);
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = sha256(patreonUserId);
  const rawSessionId = "old-session";
  const sessionHash = sha256(rawSessionId);
  const db = new FakeFirestore({
    [`patreonOAuthSessions/${sessionHash}`]: {
      ...storedAuthorization(),
      npub,
      linkedNpub: npub,
      linkedNpubHash: oldNpubHash,
      linkedPatreonUserHash: patreonUserHash,
      expiresAtMs: Date.now() + 60_000,
    },
    [`patreonAccountLinks/${oldNpubHash}`]: {
      ...storedAuthorization(),
      npub,
    },
    [`patreonUserLinks/${patreonUserHash}`]: {
      npubHash: sha256("new-npub"),
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();
  await handler(
    {
      method: "GET",
      url: "/api/patreon/status",
      headers: {
        "x-rbe-npub": npub,
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", rawSessionId),
        )}`,
      },
    },
    response,
  );
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).authorized, false);
  assert.equal(JSON.parse(response.body).reason, "link_changed");
  assert.equal(db.records.has(`patreonOAuthSessions/${sessionHash}`), false);
});

test("status rejects a valid browser session when the active Robots Building Education key changes", async () => {
  const linkedNpub = nip19.npubEncode(getPublicKey(generateSecretKey()));
  const otherNpub = nip19.npubEncode(getPublicKey(generateSecretKey()));
  const linkedNpubHash = sha256(linkedNpub);
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = sha256(patreonUserId);
  const rawSessionId = "session-for-another-key";
  const sessionHash = sha256(rawSessionId);
  const db = new FakeFirestore({
    [`patreonOAuthSessions/${sessionHash}`]: {
      ...storedAuthorization(),
      linkedNpub,
      linkedNpubHash,
      linkedPatreonUserHash: patreonUserHash,
      expiresAtMs: Date.now() + 60_000,
    },
    [`patreonAccountLinks/${linkedNpubHash}`]: {
      ...storedAuthorization(),
      npub: linkedNpub,
    },
    [`patreonUserLinks/${patreonUserHash}`]: { npubHash: linkedNpubHash },
  });
  let patreonFetches = 0;
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    fetchImpl: async () => {
      patreonFetches += 1;
      return { ok: true, status: 200, json: async () => identityWithMembership() };
    },
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/status",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", rawSessionId),
        )}`,
        "x-rbe-npub": otherNpub,
      },
    },
    response,
  );

  const payload = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(payload.authorized, false);
  assert.equal(payload.reason, "active_key_changed");
  assert.equal(db.records.has(`patreonOAuthSessions/${sessionHash}`), false);
  assert.match(response.headers["Set-Cookie"], /Max-Age=0/);
  assert.equal(patreonFetches, 0);
});

test("first-time OAuth linking creates no recovery intent", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const state = "first-link-state";
  const db = new FakeFirestore({
    [`patreonOAuthStates/${sha256(state)}`]: {
      npub,
      hexPubkey,
      returnMode: "popup",
      expiresAtMs: Date.now() + 60_000,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () =>
      handlerConfig({
        clientId: "client-id",
        clientSecret: "client-secret",
        redirectUri: "https://tunnel.example/api/patreon/callback",
        appUrl: "http://localhost:4445",
      }),
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("/token")
          ? {
              access_token: "access",
              refresh_token: "refresh",
              expires_in: 3600,
            }
          : identityWithMembership(),
    }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();
  await handler(
    {
      method: "GET",
      url: "/api/patreon/callback",
      query: { state, code: "oauth-code" },
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-link-state", state),
        )}`,
      },
    },
    response,
  );
  assert.equal(response.statusCode, 302);
  assert.match(response.headers.Location, /patreon=connected/);
  assert.match(response.headers.Location, /patreon_popup=1/);
  assert.equal(db.records.has(`patreonAccountLinks/${sha256(npub)}`), true);
  assert.equal(
    [...db.records.keys()].some((key) =>
      key.startsWith("patreonLinkRecoveries/"),
    ),
    false,
  );
});

test("OAuth keeps a key-bound pending session when checkout is still required", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const state = "pending-checkout-state";
  const db = new FakeFirestore({
    [`patreonOAuthStates/${sha256(state)}`]: {
      npub,
      hexPubkey,
      selectedPlan: "monthly",
      expiresAtMs: Date.now() + 60_000,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () =>
      handlerConfig({
        clientId: "client-id",
        clientSecret: "client-secret",
        redirectUri: "https://robotsbuildingeducation.com/api/patreon/callback",
        appUrl: "https://robotsbuildingeducation.com",
      }),
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("/token")
          ? {
              access_token: "pending-access",
              refresh_token: "pending-refresh",
              expires_in: 3600,
            }
          : {
              data: {
                id: "patreon-user-1",
                type: "user",
                relationships: { memberships: { data: [] } },
              },
              included: [],
            },
    }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/callback",
      query: { state, code: "oauth-code" },
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-link-state", state),
        )}`,
      },
    },
    response,
  );

  assert.equal(response.statusCode, 302);
  assert.match(
    response.headers.Location,
    /patreon=checkout_required&plan=monthly/,
  );
  const sessionCookie = parseCookies(response.headers["Set-Cookie"]).__session;
  const rawSessionId = decodeSessionCookieValue(
    sessionCookie,
    "auth-session",
  );
  const pendingSession = db.records.get(
    `patreonOAuthSessions/${sha256(rawSessionId)}`,
  );
  assert.equal(pendingSession.authorized, false);
  assert.equal(pendingSession.pendingCheckout, true);
  assert.equal(pendingSession.selectedPlan, "monthly");
  assert.equal(pendingSession.linkedNpub, npub);
  assert.notEqual(pendingSession.encryptedAccessToken, "pending-access");
  assert.equal(db.records.has(`patreonAccountLinks/${sha256(npub)}`), false);
});

test("a pending checkout session links and unlocks after membership becomes active", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const rawSessionId = "pending-session-that-became-paid";
  const sessionHash = sha256(rawSessionId);
  const now = Date.now();
  const db = new FakeFirestore({
    [`patreonOAuthSessions/${sessionHash}`]: {
      authorized: false,
      pendingCheckout: true,
      selectedPlan: "annual",
      patreonUserId: "patreon-user-1",
      linkedNpub: npub,
      linkedNpubHash: sha256(npub),
      linkedHexPubkey: hexPubkey,
      linkedPatreonUserHash: sha256("patreon-user-1"),
      lastVerifiedAtMs: now - 1_000,
      expiresAtMs: now + 60_000,
      oauthExpiresAtMs: now + 120_000,
      encryptedAccessToken: encryptToken("access", "encryption-secret"),
      encryptedRefreshToken: encryptToken("refresh", "encryption-secret"),
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => identityWithMembership(),
    }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/status",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", rawSessionId),
        )}`,
        "x-rbe-npub": npub,
      },
    },
    response,
  );

  const payload = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(payload.authorized, true);
  assert.equal(payload.linked, true);
  assert.equal(
    db.records.get(`patreonOAuthSessions/${sessionHash}`).pendingCheckout,
    false,
  );
  assert.equal(
    db.records.get(`patreonAccountLinks/${sha256(npub)}`).authorized,
    true,
  );
  assert.equal(
    db.records.get(`patreonUserLinks/${sha256("patreon-user-1")}`).npubHash,
    sha256(npub),
  );
});

test("local callback tunnel can recover signed link state without a shared cookie", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const state = "local-tunnel-link-state";
  const db = new FakeFirestore({
    [`patreonOAuthStates/${sha256(state)}`]: {
      npub,
      hexPubkey,
      expiresAtMs: Date.now() + 60_000,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () =>
      handlerConfig({
        allowStateCookieFallback: true,
        clientId: "client-id",
        clientSecret: "client-secret",
        redirectUri: "https://tunnel.example/api/patreon/callback",
        appUrl: "http://localhost:4445",
      }),
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("/token")
          ? {
              access_token: "access",
              refresh_token: "refresh",
              expires_in: 3600,
            }
          : identityWithMembership(),
    }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/callback",
      query: { state, code: "oauth-code" },
      headers: {},
    },
    response,
  );

  assert.equal(response.statusCode, 302);
  assert.match(response.headers.Location, /patreon=connected/);
  assert.equal(db.records.has(`patreonAccountLinks/${sha256(npub)}`), true);
  assert.equal(
    db.records.has(`patreonOAuthStates/${sha256(state)}`),
    false,
  );
});

test("production callback still rejects a missing OAuth state cookie", async () => {
  const state = "no-cookie-production-state";
  const db = new FakeFirestore({
    [`patreonOAuthStates/${sha256(state)}`]: {
      npub: "npub1test",
      hexPubkey: "a".repeat(64),
      expiresAtMs: Date.now() + 60_000,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () =>
      handlerConfig({
        allowStateCookieFallback: false,
        appUrl: "https://robotsbuildingeducation.com",
      }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "GET",
      url: "/api/patreon/callback",
      query: { state, code: "oauth-code" },
      headers: {},
    },
    response,
  );

  assert.equal(response.statusCode, 302);
  assert.match(response.headers.Location, /patreon=state_error/);
  assert.equal(
    db.records.has(`patreonOAuthStates/${sha256(state)}`),
    true,
  );
});

test("OAuth conflict creates a pending recovery without moving the old link", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const nextNpub = nip19.npubEncode(hexPubkey);
  const nextNpubHash = sha256(nextNpub);
  const previousNpubHash = sha256("previous-npub");
  const patreonUserHash = sha256("patreon-user-1");
  const state = "replacement-link-state";
  const db = new FakeFirestore({
    [`patreonOAuthStates/${sha256(state)}`]: {
      npub: nextNpub,
      hexPubkey,
      expiresAtMs: Date.now() + 60_000,
    },
    [`patreonUserLinks/${patreonUserHash}`]: {
      npubHash: previousNpubHash,
      linkedAtMs: Date.now() - 60_000,
    },
    [`patreonAccountLinks/${previousNpubHash}`]: {
      ...storedAuthorization(),
      npub: "previous-npub",
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () =>
      handlerConfig({
        clientId: "client-id",
        clientSecret: "client-secret",
        redirectUri: "https://tunnel.example/api/patreon/callback",
        appUrl: "http://localhost:4445",
      }),
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes("/token")
          ? {
              access_token: "fresh-access",
              refresh_token: "fresh-refresh",
              expires_in: 3600,
            }
          : identityWithMembership(),
    }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();
  await handler(
    {
      method: "GET",
      url: "/api/patreon/callback",
      query: { state, code: "oauth-code" },
      ip: "203.0.113.25",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-link-state", state),
        )}`,
      },
    },
    response,
  );
  assert.equal(response.statusCode, 302);
  assert.match(response.headers.Location, /patreon=replace_required/);
  assert.equal(db.records.has(`patreonAccountLinks/${previousNpubHash}`), true);
  assert.equal(db.records.has(`patreonAccountLinks/${nextNpubHash}`), false);
  assert.equal(
    db.records.get(`patreonUserLinks/${patreonUserHash}`).npubHash,
    previousNpubHash,
  );
  const recoveries = [...db.records.entries()].filter(([key]) =>
    key.startsWith("patreonLinkRecoveries/"),
  );
  assert.equal(recoveries.length, 1);
  assert.equal(recoveries[0][1].status, "pending");
  assert.equal(recoveries[0][1].nextNpubHash, nextNpubHash);
});

test("cancelling replacement clears pending state and records a sanitized audit", async () => {
  const rawRecoveryId = "cancel-recovery";
  const recoveryHash = sha256(rawRecoveryId);
  const patreonUserHash = sha256("patreon-user-1");
  const previousNpubHash = sha256("previous-npub");
  const nextNpubHash = sha256("next-npub");
  const db = new FakeFirestore({
    [`patreonLinkRecoveries/${recoveryHash}`]: {
      status: "pending",
      patreonUserHash,
      previousNpubHash,
      nextNpubHash,
      createdAtMs: Date.now() - 1000,
    },
    [`patreonUserLinks/${patreonUserHash}`]: {
      npubHash: previousNpubHash,
      pendingRecoveryHash: recoveryHash,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/cancel-replacement",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-recovery", rawRecoveryId),
        )}`,
      },
    },
    response,
  );
  assert.equal(response.statusCode, 200);
  assert.equal(
    db.records.get(`patreonLinkRecoveries/${recoveryHash}`).status,
    "cancelled",
  );
  assert.equal(
    db.records.get(`patreonUserLinks/${patreonUserHash}`).pendingRecoveryHash,
    "",
  );
  assert.equal(
    [...db.records.values()].some(
      (record) => record.type === "replacement_cancelled",
    ),
    true,
  );
});

test("signed recovery atomically moves a Patreon link to the new key", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const nextNpubHash = sha256(npub);
  const previousNpubHash = sha256("old-npub");
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = sha256(patreonUserId);
  const rawRecoveryId = "recovery-secret";
  const recoveryHash = sha256(rawRecoveryId);
  const challengeId = "replace-challenge";
  const now = Date.now();
  const eventTemplate = buildNostrAuthEvent({
    action: "replace",
    challengeId,
    challenge: "random-replace-value",
    expiresAtMs: now + 60_000,
  });
  const signedEvent = finalizeEvent(eventTemplate, secretKey);
  const encryptedAccessToken = encryptToken("access", "encryption-secret");
  const encryptedRefreshToken = encryptToken("refresh", "encryption-secret");
  const recovery = {
    status: "pending",
    patreonUserId,
    patreonUserHash,
    previousNpubHash,
    nextNpub: npub,
    nextNpubHash,
    nextHexPubkey: hexPubkey,
    authorized: true,
    memberId: "member-1",
    tierIds: ["tier-annual"],
    entitledAmountCents: 500,
    patronStatus: "active_patron",
    lastChargeStatus: "paid",
    lastVerifiedAtMs: now,
    oauthExpiresAtMs: now + 60_000,
    encryptedAccessToken,
    encryptedRefreshToken,
    createdAtMs: now,
    expiresAtMs: now + 60_000,
  };
  const db = new FakeFirestore({
    [`patreonLinkRecoveries/${recoveryHash}`]: recovery,
    [`patreonLinkChallenges/${sha256(challengeId)}`]: {
      npub,
      hexPubkey,
      action: "replace",
      eventTemplateJson: JSON.stringify(eventTemplate),
      expiresAtMs: now + 60_000,
      usedAtMs: null,
    },
    [`patreonUserLinks/${patreonUserHash}`]: {
      npubHash: previousNpubHash,
      pendingRecoveryHash: recoveryHash,
      linkedAtMs: now - 1000,
    },
    [`patreonAccountLinks/${previousNpubHash}`]: {
      patreonUserId,
      npub: "old-npub",
    },
    "patreonOAuthSessions/old-session": {
      authorized: true,
      linkedNpubHash: previousNpubHash,
      linkedNpub: "old-npub",
      linkedPatreonUserHash: patreonUserHash,
    },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => identityWithMembership(),
    }),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "POST",
      url: "/api/patreon/replace-link",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-recovery", rawRecoveryId),
        )}`,
      },
      body: { challengeId, signedEvent },
    },
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).authorized, true);
  assert.equal(JSON.parse(response.body).replaced, true);
  assert.equal(db.records.has(`patreonAccountLinks/${previousNpubHash}`), false);
  const nextAccount = db.records.get(`patreonAccountLinks/${nextNpubHash}`);
  assert.equal(nextAccount.npub, npub);
  assert.equal(nextAccount.patreonUserId, patreonUserId);
  assert.equal("expiresAt" in nextAccount, false);
  assert.equal(
    db.records.get(`patreonUserLinks/${patreonUserHash}`).npubHash,
    nextNpubHash,
  );
  assert.equal(db.records.has("patreonOAuthSessions/old-session"), false);
  assert.equal(
    db.records.get(`patreonLinkRecoveries/${recoveryHash}`).status,
    "completed",
  );

  const replayResponse = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/replace-link",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("oauth-recovery", rawRecoveryId),
        )}`,
      },
      body: { challengeId, signedEvent },
    },
    replayResponse,
  );
  assert.equal(replayResponse.statusCode, 401);
  assert.equal(JSON.parse(replayResponse.body).error, "invalid_nostr_proof");
  assert.equal(
    [...db.records.keys()].filter((key) =>
      key.startsWith("patreonOAuthSessions/"),
    ).length,
    1,
  );
});

test("signed disconnect removes only the Robots Building Education link and sessions", async () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const npubHash = sha256(npub);
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = sha256(patreonUserId);
  const rawSessionId = "authenticated-session";
  const sessionHash = sha256(rawSessionId);
  const challengeId = "disconnect-challenge";
  const now = Date.now();
  const eventTemplate = buildNostrAuthEvent({
    action: "disconnect",
    challengeId,
    challenge: "random-disconnect-value",
    expiresAtMs: now + 60_000,
  });
  const signedEvent = finalizeEvent(eventTemplate, secretKey);
  const db = new FakeFirestore({
    [`patreonLinkChallenges/${sha256(challengeId)}`]: {
      npub,
      hexPubkey,
      action: "disconnect",
      eventTemplateJson: JSON.stringify(eventTemplate),
      expiresAtMs: now + 60_000,
      usedAtMs: null,
    },
    [`patreonOAuthSessions/${sessionHash}`]: {
      authorized: true,
      patreonUserId,
      linkedNpub: npub,
      linkedNpubHash: npubHash,
      linkedPatreonUserHash: patreonUserHash,
      expiresAtMs: now + 60_000,
    },
    [`patreonAccountLinks/${npubHash}`]: { patreonUserId, npub },
    [`patreonUserLinks/${patreonUserHash}`]: { npubHash },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();

  await handler(
    {
      method: "POST",
      url: "/api/patreon/disconnect",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", rawSessionId),
        )}`,
      },
      body: { challengeId, signedEvent },
    },
    response,
  );

  const payload = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.billingChanged, false);
  assert.equal(db.records.has(`patreonAccountLinks/${npubHash}`), false);
  assert.equal(db.records.has(`patreonUserLinks/${patreonUserHash}`), false);
  assert.equal(db.records.has(`patreonOAuthSessions/${sessionHash}`), false);
  const disconnectAudit = [...db.records.values()].find(
    (record) => record.type === "subscription_disconnected",
  );
  assert.equal(Boolean(disconnectAudit), true);
});

test("disconnect rejects the wrong signed key and preserves both mappings", async () => {
  const linkedSecretKey = generateSecretKey();
  const linkedHexPubkey = getPublicKey(linkedSecretKey);
  const linkedNpub = nip19.npubEncode(linkedHexPubkey);
  const linkedNpubHash = sha256(linkedNpub);
  const otherSecretKey = generateSecretKey();
  const otherHexPubkey = getPublicKey(otherSecretKey);
  const otherNpub = nip19.npubEncode(otherHexPubkey);
  const patreonUserId = "patreon-user-1";
  const patreonUserHash = sha256(patreonUserId);
  const rawSessionId = "wrong-key-session";
  const sessionHash = sha256(rawSessionId);
  const challengeId = "wrong-key-disconnect";
  const now = Date.now();
  const eventTemplate = buildNostrAuthEvent({
    action: "disconnect",
    challengeId,
    challenge: "wrong-key-challenge",
    expiresAtMs: now + 60_000,
  });
  const signedEvent = finalizeEvent(eventTemplate, otherSecretKey);
  const db = new FakeFirestore({
    [`patreonLinkChallenges/${sha256(challengeId)}`]: {
      npub: otherNpub,
      hexPubkey: otherHexPubkey,
      action: "disconnect",
      eventTemplateJson: JSON.stringify(eventTemplate),
      expiresAtMs: now + 60_000,
      usedAtMs: null,
    },
    [`patreonOAuthSessions/${sessionHash}`]: {
      ...storedAuthorization(now),
      patreonUserId,
      linkedNpub: linkedNpub,
      linkedNpubHash,
      linkedPatreonUserHash: patreonUserHash,
      expiresAtMs: now + 60_000,
    },
    [`patreonAccountLinks/${linkedNpubHash}`]: {
      ...storedAuthorization(now),
      patreonUserId,
      npub: linkedNpub,
    },
    [`patreonUserLinks/${patreonUserHash}`]: { npubHash: linkedNpubHash },
  });
  const handler = createPatreonHandler({
    db,
    getConfig: () => handlerConfig(),
    logger: { info() {}, warn() {}, error() {} },
  });
  const response = fakeResponse();
  await handler(
    {
      method: "POST",
      url: "/api/patreon/disconnect",
      headers: {
        cookie: `__session=${encodeURIComponent(
          encodeSessionCookieValue("auth-session", rawSessionId),
        )}`,
      },
      body: { challengeId, signedEvent },
    },
    response,
  );
  assert.equal(response.statusCode, 409);
  assert.equal(JSON.parse(response.body).error, "link_changed");
  assert.equal(db.records.has(`patreonAccountLinks/${linkedNpubHash}`), true);
  assert.equal(db.records.has(`patreonUserLinks/${patreonUserHash}`), true);
  assert.equal(db.records.has(`patreonOAuthSessions/${sessionHash}`), true);
  assert.equal(
    [...db.records.values()].some(
      (record) => record.type === "subscription_disconnect_rejected",
    ),
    true,
  );
});

test("verifies a one-use Nostr proof bound to the requested Robots Building Education key", () => {
  const secretKey = generateSecretKey();
  const hexPubkey = getPublicKey(secretKey);
  const npub = nip19.npubEncode(hexPubkey);
  const now = Date.now();
  const eventTemplate = buildNostrAuthEvent({
    action: "link",
    challengeId: "challenge-id",
    challenge: "random-challenge",
    expiresAtMs: now + 60_000,
  });
  const signedEvent = finalizeEvent(eventTemplate, secretKey);
  const storedChallenge = {
    npub,
    hexPubkey,
    action: "link",
    eventTemplateJson: JSON.stringify(eventTemplate),
    expiresAtMs: now + 60_000,
    usedAtMs: null,
  };

  assert.deepEqual(
    verifyNostrAuthEvent(storedChallenge, signedEvent, "link", now),
    { valid: true, npub, hexPubkey },
  );
  assert.equal(
    verifyNostrAuthEvent(
      storedChallenge,
      { ...signedEvent, content: "tampered" },
      "link",
      now,
    ).valid,
    false,
  );
  assert.equal(
    verifyNostrAuthEvent(
      { ...storedChallenge, usedAtMs: now },
      signedEvent,
      "link",
      now,
    ).reason,
    "challenge_used",
  );
  assert.equal(
    verifyNostrAuthEvent(storedChallenge, signedEvent, "replace", now).reason,
    "challenge_action_mismatch",
  );
  assert.equal(
    verifyNostrAuthEvent(
      { ...storedChallenge, expiresAtMs: now - 1 },
      signedEvent,
      "link",
      now,
    ).reason,
    "challenge_expired",
  );
});
