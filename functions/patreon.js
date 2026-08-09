/* global require, Buffer, module, process */

const crypto = require("node:crypto");
const { nip19, verifyEvent } = require("nostr-tools");

const PATREON_AUTHORIZE_URL = "https://www.patreon.com/oauth2/authorize";
const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
const PATREON_IDENTITY_URL =
  "https://www.patreon.com/api/oauth2/v2/identity";
// Firebase Hosting forwards only the specially named __session cookie to
// rewritten Functions. Prefix its payload so OAuth state and authenticated
// sessions share that transport without being interchangeable.
const FIREBASE_SESSION_COOKIE = "__session";
const OAUTH_STATE_COOKIE_KIND = "oauth-state";
const OAUTH_LINK_STATE_COOKIE_KIND = "oauth-link-state";
const OAUTH_RECOVERY_COOKIE_KIND = "oauth-recovery";
const AUTH_SESSION_COOKIE_KIND = "auth-session";
const SESSION_COLLECTION = "patreonOAuthSessions";
const LINK_CHALLENGE_COLLECTION = "patreonLinkChallenges";
const OAUTH_STATE_COLLECTION = "patreonOAuthStates";
const ACCOUNT_LINK_COLLECTION = "patreonAccountLinks";
const PATREON_USER_LINK_COLLECTION = "patreonUserLinks";
const RECOVERY_COLLECTION = "patreonLinkRecoveries";
const RECOVERY_RESUME_COLLECTION = "patreonLinkRecoveryResumes";
const PENDING_CHECKOUT_COLLECTION = "patreonPendingCheckouts";
const AUDIT_COLLECTION = "patreonOAuthAuditEvents";
const WEBHOOK_RECEIPT_COLLECTION = "patreonWebhookReceipts";
const RECOVERY_RATE_LIMIT_COLLECTION = "patreonRecoveryRateLimits";
const REFRESH_RATE_LIMIT_COLLECTION = "patreonRefreshRateLimits";
const NOSTR_AUTH_EVENT_KIND = 27235;
const LINK_CHALLENGE_DURATION_MS = 5 * 60 * 1000;
const OAUTH_STATE_DURATION_MS = 10 * 60 * 1000;
const RECOVERY_DURATION_MS = 10 * 60 * 1000;
const WEBHOOK_RECEIPT_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_REVOCATION_BATCH_SIZE = 250;
const SESSION_REVOCATION_MAX_BATCHES = 5;
const SESSION_REVOCATION_RETRY_ATTEMPTS = 2;
const WEBHOOK_EVENTS = new Set([
  "members:create",
  "members:update",
  "members:delete",
  "members:pledge:create",
  "members:pledge:update",
  "members:pledge:delete",
]);
const OAUTH_COMPLETION_RESULTS = new Set([
  "checkout_required",
  "connected",
  "link_conflict",
  "not_subscribed",
  "oauth_cancelled",
  "oauth_error",
  "replace_rate_limited",
  "replace_required",
  "state_error",
  "unavailable",
]);
const USER_AGENT = "Robots Building Education - Patreon subscription verification";

function splitIds(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getPatreonConfig(env = process.env) {
  const redirectUri = String(env.PATREON_REDIRECT_URI || "").trim();
  const appUrl = String(env.PATREON_APP_URL || "").trim();
  const cookieSecureSetting = String(
    env.PATREON_COOKIE_SECURE || "",
  ).toLowerCase();
  const inferredSecure = redirectUri.startsWith("https://");

  const config = {
    enabled:
      String(env.PATREON_AUTH_ENABLED || "").toLowerCase() === "true" ||
      String(env.FUNCTIONS_EMULATOR || "").toLowerCase() === "true",
    clientId: String(env.PATREON_CLIENT_ID || "").trim(),
    clientSecret: String(env.PATREON_CLIENT_SECRET || "").trim(),
    campaignId: String(env.PATREON_CAMPAIGN_ID || "").trim(),
    redirectUri,
    appUrl,
    tokenEncryptionKey: String(
      env.PATREON_TOKEN_ENCRYPTION_KEY || "",
    ).trim(),
    webhookSecret: String(env.PATREON_WEBHOOK_SECRET || "").trim(),
    allowedTierIds: splitIds(env.PATREON_ALLOWED_TIER_IDS),
    sessionDurationMs:
      positiveNumber(env.PATREON_SESSION_DAYS, 30) * 24 * 60 * 60 * 1000,
    statusCacheMs:
      positiveNumber(env.PATREON_STATUS_CACHE_MINUTES, 10) * 60 * 1000,
    staleGraceMs:
      positiveNumber(env.PATREON_STALE_GRACE_HOURS, 6) * 60 * 60 * 1000,
    refreshCooldownMs:
      positiveNumber(env.PATREON_REFRESH_COOLDOWN_SECONDS, 30) * 1000,
    cookieSecure:
      cookieSecureSetting === "true"
        ? true
        : cookieSecureSetting === "false"
          ? false
          : inferredSecure,
  };

  config.configured = Boolean(
    config.clientId &&
      config.clientSecret &&
      config.campaignId &&
      config.redirectUri &&
      config.tokenEncryptionKey,
  );
  config.webhookConfigured = Boolean(
    config.webhookSecret && config.campaignId,
  );

  return config;
}

function getMembershipResources(identityPayload) {
  const membershipRefs =
    identityPayload?.data?.relationships?.memberships?.data || [];
  const membershipIds = new Set(
    membershipRefs.map((membership) => String(membership?.id || "")),
  );

  return (identityPayload?.included || []).filter(
    (resource) =>
      resource?.type === "member" && membershipIds.has(String(resource.id)),
  );
}

function getMembershipDiagnostics(identityPayload, config) {
  const membershipRefs =
    identityPayload?.data?.relationships?.memberships?.data || [];
  const includedMembers = (identityPayload?.included || []).filter(
    (resource) => resource?.type === "member",
  );

  return {
    expectedCampaignId: String(config.campaignId || ""),
    relationshipMembershipCount: membershipRefs.length,
    includedMemberCount: includedMembers.length,
    memberships: includedMembers.map((membership) => ({
      campaignId: String(
        membership?.relationships?.campaign?.data?.id || "",
      ),
      patronStatus: String(membership?.attributes?.patron_status || ""),
      lastChargeStatus: String(
        membership?.attributes?.last_charge_status || "",
      ),
      currentlyEntitledAmountCents: Number(
        membership?.attributes?.currently_entitled_amount_cents || 0,
      ),
      entitledTierCount: (
        membership?.relationships?.currently_entitled_tiers?.data || []
      ).length,
    })),
  };
}

function evaluatePatreonMemberResource(
  membership,
  config,
  { patreonUserId = "" } = {},
) {
  if (!membership || membership.type !== "member") {
    return { authorized: false, reason: "no_membership" };
  }

  const attributes = membership.attributes || {};
  const patronStatus = String(attributes.patron_status || "").toLowerCase();
  const lastChargeStatus = String(
    attributes.last_charge_status || "",
  ).toLowerCase();
  const entitledAmountCents = Number(
    attributes.currently_entitled_amount_cents || 0,
  );
  const tierIds = (
    membership?.relationships?.currently_entitled_tiers?.data || []
  )
    .map((tier) => String(tier?.id || ""))
    .filter(Boolean);

  if (patronStatus !== "active_patron") {
    return {
      authorized: false,
      reason: "inactive_membership",
      patronStatus,
      lastChargeStatus,
      entitledAmountCents,
      tierIds,
    };
  }

  if (lastChargeStatus.includes("declin") || lastChargeStatus === "failed") {
    return {
      authorized: false,
      reason: "payment_not_current",
      patronStatus,
      lastChargeStatus,
      entitledAmountCents,
      tierIds,
    };
  }

  if (!Number.isFinite(entitledAmountCents) || entitledAmountCents <= 0) {
    return {
      authorized: false,
      reason: "no_paid_entitlement",
      patronStatus,
      lastChargeStatus,
      entitledAmountCents: 0,
      tierIds,
    };
  }

  if (
    config.allowedTierIds?.size > 0 &&
    !tierIds.some((tierId) => config.allowedTierIds.has(tierId))
  ) {
    return {
      authorized: false,
      reason: "tier_not_allowed",
      patronStatus,
      lastChargeStatus,
      entitledAmountCents,
      tierIds,
    };
  }

  return {
    authorized: true,
    reason: "active_paid_member",
    patreonUserId: String(patreonUserId || ""),
    memberId: String(membership.id || ""),
    patronStatus,
    lastChargeStatus,
    entitledAmountCents,
    tierIds,
  };
}

function evaluatePatreonIdentity(identityPayload, config) {
  const memberships = getMembershipResources(identityPayload);

  if (!memberships.length) {
    return { authorized: false, reason: "no_membership" };
  }

  let matchingMembership = memberships.find((membership) => {
    const campaignId = String(
      membership?.relationships?.campaign?.data?.id || "",
    );
    return campaignId === String(config.campaignId);
  });

  // With the basic `identity` scope, Patreon returns only the user's
  // membership to the OAuth client's own campaign, but can omit the campaign
  // relationship from that Member resource. Accept that documented one-member
  // shape while continuing to reject any explicit campaign mismatch.
  if (!matchingMembership && memberships.length === 1) {
    const soleCampaignId = String(
      memberships[0]?.relationships?.campaign?.data?.id || "",
    );
    if (!soleCampaignId) matchingMembership = memberships[0];
  }

  if (!matchingMembership) {
    return { authorized: false, reason: "wrong_campaign" };
  }

  return evaluatePatreonMemberResource(matchingMembership, config, {
    patreonUserId: String(identityPayload?.data?.id || ""),
  });
}

function parseCookies(cookieHeader = "") {
  return String(cookieHeader)
    .split(";")
    .reduce((cookies, part) => {
      const separator = part.indexOf("=");
      if (separator < 0) return cookies;
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      if (!key) return cookies;
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
      return cookies;
    }, {});
}

function encodeSessionCookieValue(kind, value) {
  return `${kind}.${String(value || "")}`;
}

function decodeSessionCookieValue(value, expectedKind) {
  const prefix = `${expectedKind}.`;
  const normalized = String(value || "");
  return normalized.startsWith(prefix) ? normalized.slice(prefix.length) : "";
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  parts.push(`SameSite=${options.sameSite || "Lax"}`);
  return parts.join("; ");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function decodeNpub(npub) {
  try {
    const decoded = nip19.decode(String(npub || "").trim());
    if (decoded.type !== "npub" || typeof decoded.data !== "string") return "";
    return /^[0-9a-f]{64}$/i.test(decoded.data) ? decoded.data.toLowerCase() : "";
  } catch {
    return "";
  }
}

function buildNostrAuthEvent({ action, challengeId, challenge, expiresAtMs }) {
  return {
    kind: NOSTR_AUTH_EVENT_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["action", action],
      ["challenge", challengeId],
      ["expires", new Date(expiresAtMs).toISOString()],
    ],
    content: `Authorize Robots Building Education Patreon ${action}: ${challenge}`,
  };
}

function verifyNostrAuthEvent(storedChallenge, signedEvent, expectedAction, now) {
  if (!storedChallenge) {
    return { valid: false, reason: "challenge_not_found" };
  }
  if (storedChallenge.usedAtMs) {
    return { valid: false, reason: "challenge_used" };
  }
  if (Number(storedChallenge.expiresAtMs || 0) <= now) {
    return { valid: false, reason: "challenge_expired" };
  }
  if (storedChallenge.action !== expectedAction) {
    return { valid: false, reason: "challenge_action_mismatch" };
  }
  if (!signedEvent || typeof signedEvent !== "object") {
    return { valid: false, reason: "missing_signed_event" };
  }
  if (String(signedEvent.pubkey || "").toLowerCase() !== storedChallenge.hexPubkey) {
    return { valid: false, reason: "public_key_mismatch" };
  }

  let template = storedChallenge.eventTemplate || {};
  if (storedChallenge.eventTemplateJson) {
    try {
      template = JSON.parse(storedChallenge.eventTemplateJson);
    } catch {
      return { valid: false, reason: "challenge_content_mismatch" };
    }
  }
  if (
    signedEvent.kind !== template.kind ||
    signedEvent.created_at !== template.created_at ||
    signedEvent.content !== template.content ||
    JSON.stringify(signedEvent.tags || []) !== JSON.stringify(template.tags || [])
  ) {
    return { valid: false, reason: "challenge_content_mismatch" };
  }

  try {
    if (!verifyEvent(signedEvent)) {
      return { valid: false, reason: "invalid_signature" };
    }
  } catch {
    return { valid: false, reason: "invalid_signature" };
  }

  return {
    valid: true,
    npub: storedChallenge.npub,
    hexPubkey: storedChallenge.hexPubkey,
  };
}

async function consumeNostrChallenge({
  db,
  challengeId,
  signedEvent,
  expectedAction,
}) {
  const challengeRef = db
    .collection(LINK_CHALLENGE_COLLECTION)
    .doc(sha256(challengeId));

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    const verification = verifyNostrAuthEvent(
      snapshot.exists ? snapshot.data() : null,
      signedEvent,
      expectedAction,
      Date.now(),
    );
    if (!verification.valid) {
      const error = new Error(verification.reason);
      error.code = verification.reason;
      error.isNostrProofError = true;
      throw error;
    }
    transaction.update(challengeRef, { usedAtMs: Date.now() });
    return verification;
  });
}

function encryptionKey(secret) {
  return crypto.createHash("sha256").update(String(secret)).digest();
}

function encryptToken(value, secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decryptToken(value, secret) {
  const [ivValue, tagValue, ciphertextValue] = String(value || "").split(".");
  if (!ivValue || !tagValue || !ciphertextValue) {
    throw new Error("Invalid encrypted token");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(secret),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function redirectTarget(config, result, searchParams = {}) {
  let baseUrl = config.appUrl;
  if (!baseUrl) {
    try {
      const callbackUrl = new URL(config.redirectUri);
      baseUrl = callbackUrl.origin;
    } catch {
      baseUrl = "";
    }
  }

  const safeResult = OAUTH_COMPLETION_RESULTS.has(String(result))
    ? String(result)
    : "oauth_error";
  const safeSearchParams = {};
  if (["annual", "monthly"].includes(String(searchParams.plan))) {
    safeSearchParams.plan = String(searchParams.plan);
  }
  if (["en", "es"].includes(String(searchParams.lang))) {
    safeSearchParams.lang = String(searchParams.lang);
  }
  const appendSearchParams = (params) => {
    Object.entries(safeSearchParams).forEach(([key, value]) => {
      params.set(key, value);
    });
  };

  if (!baseUrl) {
    const params = new URLSearchParams({ patreon: safeResult });
    appendSearchParams(params);
    return `/patreon-return?${params.toString()}`;
  }
  const url = new URL("/patreon-return", baseUrl);
  url.searchParams.set("patreon", safeResult);
  appendSearchParams(url.searchParams);
  return url.toString();
}

function completedOAuthRedirect(config, oauthState = {}) {
  return redirectTarget(
    config,
    String(oauthState.completionResult || "oauth_error"),
    oauthState.completionSearchParams || {},
  );
}

async function parseJsonResponse(response, label) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(`${label} failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function exchangeAuthorizationCode(code, config, fetchImpl) {
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });
  const response = await fetchImpl(PATREON_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body,
  });
  return parseJsonResponse(response, "Patreon token exchange");
}

async function refreshAccessToken(refreshToken, config, fetchImpl) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const response = await fetchImpl(PATREON_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body,
  });
  return parseJsonResponse(response, "Patreon token refresh");
}

async function fetchIdentity(accessToken, fetchImpl) {
  const url = new URL(PATREON_IDENTITY_URL);
  url.searchParams.set("include", "memberships");
  url.searchParams.set(
    "fields[member]",
    [
      "patron_status",
      "last_charge_status",
      "currently_entitled_amount_cents",
      "is_free_trial",
      "is_gifted",
    ].join(","),
  );

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
    },
  });
  return parseJsonResponse(response, "Patreon identity request");
}

function buildAuthorizedRecord({ membership, tokens, config, now }) {
  return {
    authorized: true,
    patreonUserId: membership.patreonUserId,
    memberId: membership.memberId,
    tierIds: membership.tierIds,
    entitledAmountCents: membership.entitledAmountCents,
    patronStatus: membership.patronStatus,
    lastChargeStatus: membership.lastChargeStatus,
    lastVerifiedAtMs: now,
    oauthExpiresAtMs: now + positiveNumber(tokens.expires_in, 3600) * 1000,
    encryptedAccessToken: encryptToken(
      tokens.access_token,
      config.tokenEncryptionKey,
    ),
    encryptedRefreshToken: encryptToken(
      tokens.refresh_token,
      config.tokenEncryptionKey,
    ),
  };
}

function buildPendingCheckoutRecord({
  identity,
  membership,
  tokens,
  config,
  now,
  linkProof,
}) {
  const patreonUserId = String(
    membership?.patreonUserId || identity?.data?.id || "",
  );
  if (!patreonUserId) {
    throw new Error("Patreon identity did not include a user id");
  }

  return {
    authorized: false,
    pendingCheckout: true,
    selectedPlan: ["annual", "monthly"].includes(linkProof?.selectedPlan)
      ? linkProof.selectedPlan
      : "annual",
    patreonUserId,
    memberId: String(membership?.memberId || ""),
    tierIds: Array.isArray(membership?.tierIds) ? membership.tierIds : [],
    entitledAmountCents: Number(membership?.entitledAmountCents || 0),
    patronStatus: String(membership?.patronStatus || ""),
    lastChargeStatus: String(membership?.lastChargeStatus || ""),
    lastVerifiedAtMs: now,
    oauthExpiresAtMs: now + positiveNumber(tokens.expires_in, 3600) * 1000,
    encryptedAccessToken: encryptToken(
      tokens.access_token,
      config.tokenEncryptionKey,
    ),
    encryptedRefreshToken: encryptToken(
      tokens.refresh_token,
      config.tokenEncryptionKey,
    ),
    npub: String(linkProof?.npub || ""),
    hexPubkey: String(linkProof?.hexPubkey || ""),
  };
}

function buildStoredAuthorization(record = {}) {
  return {
    authorized: true,
    patreonUserId: String(record.patreonUserId || ""),
    memberId: String(record.memberId || ""),
    tierIds: Array.isArray(record.tierIds) ? record.tierIds : [],
    entitledAmountCents: Number(record.entitledAmountCents || 0),
    patronStatus: String(record.patronStatus || "active_patron"),
    lastChargeStatus: String(record.lastChargeStatus || "paid"),
    lastVerifiedAtMs: Number(record.lastVerifiedAtMs || Date.now()),
    verificationRequiredAtMs: Number(record.verificationRequiredAtMs || 0),
    oauthExpiresAtMs: Number(record.oauthExpiresAtMs || 0),
    encryptedAccessToken: String(record.encryptedAccessToken || ""),
    encryptedRefreshToken: String(record.encryptedRefreshToken || ""),
  };
}

function subscriptionStatus(record = {}, reason = "") {
  if (record.authorized) return "active";
  if (reason === "payment_not_current") return "payment_issue";
  if (
    reason === "inactive_membership" ||
    reason === "no_paid_entitlement" ||
    reason === "tier_not_allowed"
  ) {
    return "inactive";
  }
  if (reason === "session_expired") return "expired";
  return "unknown";
}

function sanitizeChargeStatus(value, authorized = false) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("declin")) return "declined";
  if (["failed", "paid", "pending", "refunded"].includes(normalized)) {
    return normalized;
  }
  return authorized ? "paid" : "unknown";
}

function buildSubscriptionSummary(record = {}, { stale = false, reason = "" } = {}) {
  const entitledAmountCents = Number(record.entitledAmountCents || 0);
  const lastVerifiedAtMs = Number(record.lastVerifiedAtMs || 0);
  return {
    provider: "patreon",
    status: subscriptionStatus(record, reason),
    entitledAmountCents:
      Number.isFinite(entitledAmountCents) && entitledAmountCents > 0
        ? entitledAmountCents
        : 0,
    lastChargeStatus: sanitizeChargeStatus(
      record.lastChargeStatus,
      Boolean(record.authorized),
    ),
    lastVerifiedAtMs:
      Number.isFinite(lastVerifiedAtMs) && lastVerifiedAtMs > 0
        ? lastVerifiedAtMs
        : 0,
    stale: Boolean(stale),
  };
}

async function evaluateStoredPatreonRecord(
  record,
  config,
  fetchImpl,
  { forceRefresh = false } = {},
) {
  const now = Date.now();
  const verificationRequiredAtMs = Number(
    record.verificationRequiredAtMs || 0,
  );
  const lastVerifiedAtMs = Number(record.lastVerifiedAtMs || 0);
  if (
    !forceRefresh &&
    record.authorized &&
    verificationRequiredAtMs <= lastVerifiedAtMs &&
    now - lastVerifiedAtMs < config.statusCacheMs
  ) {
    return { authorized: true, stale: false, updates: null };
  }

  try {
    let accessToken = decryptToken(
      record.encryptedAccessToken,
      config.tokenEncryptionKey,
    );
    let refreshToken = decryptToken(
      record.encryptedRefreshToken,
      config.tokenEncryptionKey,
    );
    let oauthExpiresAtMs = Number(record.oauthExpiresAtMs || 0);

    if (oauthExpiresAtMs <= now + 60_000) {
      const refreshed = await refreshAccessToken(
        refreshToken,
        config,
        fetchImpl,
      );
      if (!refreshed?.access_token) {
        throw new Error("Patreon refresh response did not include an access token");
      }
      accessToken = refreshed.access_token;
      refreshToken = refreshed.refresh_token || refreshToken;
      oauthExpiresAtMs =
        now + positiveNumber(refreshed.expires_in, 3600) * 1000;
    }

    const identity = await fetchIdentity(accessToken, fetchImpl);
    const membership = evaluatePatreonIdentity(identity, config);
    if (!membership.authorized) {
      return {
        authorized: false,
        reason: membership.reason,
        identity,
        updates: {
          authorized: false,
          patronStatus: membership.patronStatus || "",
          lastChargeStatus: membership.lastChargeStatus || "",
          entitledAmountCents: Number(
            membership.entitledAmountCents || 0,
          ),
          tierIds: membership.tierIds || [],
          lastVerifiedAtMs: now,
          verificationRequiredAtMs: 0,
          oauthExpiresAtMs,
          encryptedAccessToken: encryptToken(
            accessToken,
            config.tokenEncryptionKey,
          ),
          encryptedRefreshToken: encryptToken(
            refreshToken,
            config.tokenEncryptionKey,
          ),
        },
      };
    }

    return {
      authorized: true,
      stale: false,
      membership,
      updates: {
        authorized: true,
        patreonUserId: membership.patreonUserId,
        memberId: membership.memberId,
        tierIds: membership.tierIds,
        entitledAmountCents: membership.entitledAmountCents,
        patronStatus: membership.patronStatus,
        lastChargeStatus: membership.lastChargeStatus,
        lastVerifiedAtMs: now,
        verificationRequiredAtMs: 0,
        oauthExpiresAtMs,
        encryptedAccessToken: encryptToken(
          accessToken,
          config.tokenEncryptionKey,
        ),
        encryptedRefreshToken: encryptToken(
          refreshToken,
          config.tokenEncryptionKey,
        ),
      },
    };
  } catch (error) {
    if (
      record.authorized &&
      now - Number(record.lastVerifiedAtMs || 0) <= config.staleGraceMs
    ) {
      return { authorized: true, stale: true, updates: null };
    }
    throw error;
  }
}

function buildBrowserSessionRecord({ record, config, now = Date.now() }) {
  const linkedNpub = String(record.npub || "");
  const patreonUserId = String(record.patreonUserId || "");
  return {
    authorized: Boolean(record.authorized),
    pendingCheckout: Boolean(record.pendingCheckout),
    selectedPlan: String(record.selectedPlan || ""),
    patreonUserId,
    memberId: record.memberId,
    tierIds: record.tierIds || [],
    entitledAmountCents: record.entitledAmountCents,
    patronStatus: record.patronStatus || "",
    lastChargeStatus: record.lastChargeStatus || "",
    linkedNpub,
    linkedNpubHash: linkedNpub ? sha256(linkedNpub) : "",
    linkedHexPubkey: String(record.hexPubkey || ""),
    linkedPatreonUserHash: patreonUserId ? sha256(patreonUserId) : "",
    createdAtMs: now,
    lastVerifiedAtMs: Number(record.lastVerifiedAtMs || now),
    expiresAtMs: now + config.sessionDurationMs,
    expiresAt: new Date(now + config.sessionDurationMs),
    oauthExpiresAtMs: record.oauthExpiresAtMs,
    encryptedAccessToken: record.encryptedAccessToken,
    encryptedRefreshToken: record.encryptedRefreshToken,
  };
}

async function createBrowserSession({ db, record, config }) {
  const rawSessionId = crypto.randomBytes(32).toString("base64url");
  await db
    .collection(SESSION_COLLECTION)
    .doc(sha256(rawSessionId))
    .set(buildBrowserSessionRecord({ record, config }));
  return rawSessionId;
}

async function storePendingCheckoutForKey({ db, record, config, now = Date.now() }) {
  const npub = String(record.npub || "");
  if (!npub || !decodeNpub(npub)) {
    throw new Error("Pending Patreon checkout is missing a valid key");
  }
  const expiresAtMs = now + config.sessionDurationMs;
  const pendingRef = db
    .collection(PENDING_CHECKOUT_COLLECTION)
    .doc(sha256(npub));
  await pendingRef.set({
    ...record,
    npub,
    npubHash: sha256(npub),
    hexPubkey: String(record.hexPubkey || ""),
    pendingCheckout: true,
    createdAtMs: now,
    updatedAtMs: now,
    expiresAtMs,
    expiresAt: new Date(expiresAtMs),
  });
  return pendingRef;
}

async function pendingCheckoutForProvenKey(db, npub) {
  const npubHash = sha256(npub);
  const pendingRef = db
    .collection(PENDING_CHECKOUT_COLLECTION)
    .doc(npubHash);
  const snapshot = await pendingRef.get();
  const pending = snapshot.exists ? snapshot.data() || {} : null;
  if (
    !pending ||
    !pending.pendingCheckout ||
    pending.npubHash !== npubHash ||
    Number(pending.expiresAtMs || 0) <= Date.now()
  ) {
    return null;
  }
  return { pending, pendingRef };
}

async function linkPatreonAccount({ db, npub, hexPubkey, record }) {
  const now = Date.now();
  const npubHash = sha256(npub);
  const patreonUserHash = sha256(record.patreonUserId);
  const accountRef = db.collection(ACCOUNT_LINK_COLLECTION).doc(npubHash);
  const patreonUserRef = db
    .collection(PATREON_USER_LINK_COLLECTION)
    .doc(patreonUserHash);

  await db.runTransaction(async (transaction) => {
    const [accountSnapshot, patreonUserSnapshot] = await Promise.all([
      transaction.get(accountRef),
      transaction.get(patreonUserRef),
    ]);
    const existingAccount = accountSnapshot.exists
      ? accountSnapshot.data()
      : null;
    const existingPatreonUser = patreonUserSnapshot.exists
      ? patreonUserSnapshot.data()
      : null;

    if (
      existingAccount?.patreonUserId &&
      existingAccount.patreonUserId !== record.patreonUserId
    ) {
      const error = new Error("rbe_key_already_linked");
      error.code = "rbe_key_already_linked";
      throw error;
    }
    if (
      existingPatreonUser?.npubHash &&
      existingPatreonUser.npubHash !== npubHash
    ) {
      const error = new Error("patreon_account_already_linked");
      error.code = "patreon_account_already_linked";
      throw error;
    }

    transaction.set(accountRef, {
      ...record,
      npub,
      npubHash,
      hexPubkey,
      patreonUserHash,
      linkedAtMs: Number(existingAccount?.linkedAtMs || now),
      updatedAtMs: now,
    });
    transaction.set(patreonUserRef, {
      npubHash,
      linkedAtMs: Number(existingPatreonUser?.linkedAtMs || now),
      updatedAtMs: now,
    });
  });

  return accountRef;
}

function requestIpHash(req) {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return sha256(forwarded || req.ip || "unknown");
}

async function writeAuditEvent(db, type, data = {}) {
  const now = Date.now();
  const id = sha256(`${type}:${now}:${crypto.randomBytes(16).toString("hex")}`);
  await db.collection(AUDIT_COLLECTION).doc(id).set({
    type,
    ...data,
    createdAtMs: now,
    expiresAt: new Date(now + WEBHOOK_RECEIPT_DURATION_MS),
  });
}

async function writeAuditEventSafely(db, log, type, data = {}) {
  try {
    await writeAuditEvent(db, type, data);
  } catch (error) {
    log.error("Unable to write Patreon audit event", {
      type,
      message: error?.message || String(error),
    });
  }
}

async function enforceForcedRefreshRateLimit({
  db,
  sessionRef,
  ipHash,
  cooldownMs,
}) {
  const now = Date.now();
  const ipRef = db
    .collection(REFRESH_RATE_LIMIT_COLLECTION)
    .doc(sha256(`refresh:ip:${ipHash}`));
  let retryAfterMs = 0;

  await db.runTransaction(async (transaction) => {
    const [sessionSnapshot, ipSnapshot] = await Promise.all([
      transaction.get(sessionRef),
      transaction.get(ipRef),
    ]);
    const session = sessionSnapshot.exists ? sessionSnapshot.data() || {} : {};
    const ipRecord = ipSnapshot.exists ? ipSnapshot.data() || {} : {};
    const sessionRemaining =
      cooldownMs - (now - Number(session.lastForcedRefreshAtMs || 0));
    const ipRemaining =
      cooldownMs - (now - Number(ipRecord.lastForcedRefreshAtMs || 0));
    retryAfterMs = Math.max(sessionRemaining, ipRemaining, 0);
    if (retryAfterMs > 0) {
      const error = new Error("refresh_rate_limited");
      error.code = "refresh_rate_limited";
      error.retryAfterMs = retryAfterMs;
      throw error;
    }

    transaction.set(
      sessionRef,
      { lastForcedRefreshAtMs: now },
      { merge: true },
    );
    transaction.set(ipRef, {
      lastForcedRefreshAtMs: now,
      updatedAtMs: now,
      expiresAt: new Date(now + cooldownMs),
    });
  });

  return { now, retryAfterMs: 0 };
}

async function enforceRecoveryCreationRateLimits({
  db,
  ipHash,
}) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const limits = [["ip", ipHash, 20]];
  const refs = limits.map(([kind, value]) =>
    db
      .collection(RECOVERY_RATE_LIMIT_COLLECTION)
      .doc(sha256(`create:${kind}:${value}`)),
  );

  await db.runTransaction(async (transaction) => {
    const snapshots = await Promise.all(
      refs.map((ref) => transaction.get(ref)),
    );
    const nextTimestamps = snapshots.map((snapshot, index) => {
      const recent = (snapshot.exists
        ? snapshot.data()?.timestampsMs || []
        : []
      ).filter((value) => Number(value) > now - windowMs);
      if (recent.length >= limits[index][2]) {
        const error = new Error("recovery_rate_limited");
        error.code = "recovery_rate_limited";
        throw error;
      }
      return [...recent, now];
    });

    refs.forEach((ref, index) => {
      transaction.set(ref, {
        timestampsMs: nextTimestamps[index],
        updatedAtMs: now,
        expiresAt: new Date(now + windowMs),
      });
    });
  });
}

async function createRecoveryIntent({
  db,
  linkProof,
  authorizedRecord,
  ipHash,
}) {
  const now = Date.now();
  const rawRecoveryId = crypto.randomBytes(32).toString("base64url");
  const recoveryHash = sha256(rawRecoveryId);
  const patreonUserHash = sha256(authorizedRecord.patreonUserId);
  const nextNpubHash = sha256(linkProof.npub);
  const reverseRef = db
    .collection(PATREON_USER_LINK_COLLECTION)
    .doc(patreonUserHash);
  const recoveryRef = db.collection(RECOVERY_COLLECTION).doc(recoveryHash);
  const resumeRef = db
    .collection(RECOVERY_RESUME_COLLECTION)
    .doc(nextNpubHash);

  await enforceRecoveryCreationRateLimits({
    db,
    ipHash,
  });

  await db.runTransaction(async (transaction) => {
    const reverseSnapshot = await transaction.get(reverseRef);
    const reverse = reverseSnapshot.exists ? reverseSnapshot.data() || {} : {};
    const previousNpubHash = String(reverse.npubHash || "");
    if (!previousNpubHash || previousNpubHash === nextNpubHash) {
      const error = new Error("replacement_state_changed");
      error.code = "replacement_state_changed";
      throw error;
    }

    let previousRecoveryRef = null;
    let previousRecovery = null;
    if (reverse.pendingRecoveryHash) {
      previousRecoveryRef = db
        .collection(RECOVERY_COLLECTION)
        .doc(String(reverse.pendingRecoveryHash));
      const previousSnapshot = await transaction.get(previousRecoveryRef);
      previousRecovery = previousSnapshot.exists
        ? previousSnapshot.data() || {}
        : null;
    }

    if (previousRecoveryRef && previousRecovery?.status === "pending") {
      transaction.set(previousRecoveryRef, {
        status: "cancelled",
        patreonUserHash,
        previousNpubHash: previousRecovery.previousNpubHash || "",
        nextNpubHash: previousRecovery.nextNpubHash || "",
        createdAtMs: Number(previousRecovery.createdAtMs || now),
        cancelledAtMs: now,
        expiresAt: new Date(now + RECOVERY_DURATION_MS),
      });
      if (
        previousRecovery.nextNpubHash &&
        previousRecovery.nextNpubHash !== nextNpubHash
      ) {
        transaction.delete(
          db
            .collection(RECOVERY_RESUME_COLLECTION)
            .doc(String(previousRecovery.nextNpubHash)),
        );
      }
    }

    transaction.set(recoveryRef, {
      status: "pending",
      patreonUserId: authorizedRecord.patreonUserId,
      patreonUserHash,
      previousNpubHash,
      nextNpub: linkProof.npub,
      nextNpubHash,
      nextHexPubkey: linkProof.hexPubkey,
      authorized: true,
      memberId: authorizedRecord.memberId,
      tierIds: authorizedRecord.tierIds || [],
      entitledAmountCents: authorizedRecord.entitledAmountCents,
      patronStatus: authorizedRecord.patronStatus || "active_patron",
      lastChargeStatus: authorizedRecord.lastChargeStatus || "paid",
      lastVerifiedAtMs: authorizedRecord.lastVerifiedAtMs,
      oauthExpiresAtMs: authorizedRecord.oauthExpiresAtMs,
      encryptedAccessToken: authorizedRecord.encryptedAccessToken,
      encryptedRefreshToken: authorizedRecord.encryptedRefreshToken,
      createdAtMs: now,
      expiresAtMs: now + RECOVERY_DURATION_MS,
      completedAtMs: null,
      expiresAt: new Date(now + RECOVERY_DURATION_MS),
    });
    transaction.set(
      reverseRef,
      { pendingRecoveryHash: recoveryHash, updatedAtMs: now },
      { merge: true },
    );
    transaction.set(resumeRef, {
      recoveryHash,
      nextNpubHash,
      createdAtMs: now,
      expiresAtMs: now + RECOVERY_DURATION_MS,
      expiresAt: new Date(now + RECOVERY_DURATION_MS),
    });
  });

  await writeAuditEvent(db, "replacement_requested", {
    patreonUserHash,
    previousNpubHash: null,
    nextNpubHash,
  });
  return rawRecoveryId;
}

async function validateLinkedSession(db, session) {
  const linkedNpubHash = String(
    session.linkedNpubHash ||
      (session.linkedNpub ? sha256(session.linkedNpub) : ""),
  );
  const linkedPatreonUserHash = String(
    session.linkedPatreonUserHash ||
      (session.patreonUserId ? sha256(session.patreonUserId) : ""),
  );
  if (!linkedNpubHash || !linkedPatreonUserHash) {
    return { valid: true, linked: false, record: session };
  }

  const accountRef = db
    .collection(ACCOUNT_LINK_COLLECTION)
    .doc(linkedNpubHash);
  const reverseRef = db
    .collection(PATREON_USER_LINK_COLLECTION)
    .doc(linkedPatreonUserHash);
  const [accountSnapshot, reverseSnapshot] = await Promise.all([
    accountRef.get(),
    reverseRef.get(),
  ]);
  const account = accountSnapshot.exists ? accountSnapshot.data() || {} : null;
  const reverse = reverseSnapshot.exists ? reverseSnapshot.data() || {} : null;
  const valid = Boolean(
    account &&
      reverse &&
      reverse.npubHash === linkedNpubHash &&
      String(account.patreonUserId || "") ===
        String(session.patreonUserId || ""),
  );
  return {
    valid,
    linked: true,
    linkedNpubHash,
    linkedPatreonUserHash,
    account,
    accountRef,
    reverseRef,
  };
}

async function revokeSessionsByField(db, field, value, excludeSessionHash = "") {
  if (!value || typeof db.collection(SESSION_COLLECTION).where !== "function") {
    return 0;
  }
  let deleted = 0;
  for (let batchIndex = 0; batchIndex < SESSION_REVOCATION_MAX_BATCHES; batchIndex += 1) {
    const snapshot = await db
      .collection(SESSION_COLLECTION)
      .where(field, "==", value)
      .limit(SESSION_REVOCATION_BATCH_SIZE)
      .get();
    const docs = (snapshot.docs || []).filter(
      (document) => document.id !== excludeSessionHash,
    );
    if (!docs.length) break;
    const batch = db.batch();
    docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
    deleted += docs.length;
    if ((snapshot.docs || []).length < SESSION_REVOCATION_BATCH_SIZE) break;
  }
  return deleted;
}

async function revokeLinkedSessions({
  db,
  linkedNpubHash = "",
  linkedNpub = "",
  linkedPatreonUserHash = "",
  excludeSessionHash = "",
}) {
  const counts = await Promise.all([
    revokeSessionsByField(
      db,
      "linkedNpubHash",
      linkedNpubHash,
      excludeSessionHash,
    ),
    revokeSessionsByField(
      db,
      "linkedNpub",
      linkedNpub,
      excludeSessionHash,
    ),
    revokeSessionsByField(
      db,
      "linkedPatreonUserHash",
      linkedPatreonUserHash,
      excludeSessionHash,
    ),
  ]);
  return Math.max(...counts, 0);
}

async function revokeLinkedSessionsWithRetry(options, log) {
  let lastError = null;
  for (
    let attempt = 1;
    attempt <= SESSION_REVOCATION_RETRY_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await revokeLinkedSessions(options);
    } catch (error) {
      lastError = error;
      log.error("Patreon session cleanup attempt failed", {
        attempt,
        message: error?.message || String(error),
      });
    }
  }
  throw lastError;
}

async function pendingRecoveryForProvenKey(db, npub) {
  const now = Date.now();
  const nextNpubHash = sha256(npub);
  const resumeRef = db
    .collection(RECOVERY_RESUME_COLLECTION)
    .doc(nextNpubHash);
  const resumeSnapshot = await resumeRef.get();
  const resume = resumeSnapshot.exists ? resumeSnapshot.data() || {} : null;
  if (
    !resume ||
    !resume.recoveryHash ||
    resume.nextNpubHash !== nextNpubHash ||
    Number(resume.expiresAtMs || 0) <= now
  ) {
    return null;
  }

  const recoveryHash = String(resume.recoveryHash);
  const recoveryRef = db.collection(RECOVERY_COLLECTION).doc(recoveryHash);
  const recoverySnapshot = await recoveryRef.get();
  const recovery = recoverySnapshot.exists
    ? recoverySnapshot.data() || {}
    : null;
  if (
    !recovery ||
    recovery.status !== "pending" ||
    recovery.nextNpubHash !== nextNpubHash ||
    Number(recovery.expiresAtMs || 0) <= now
  ) {
    return null;
  }

  return { recovery, recoveryHash, recoveryRef, resumeRef };
}

async function restorePendingCheckoutForProvenKey({
  req,
  res,
  db,
  config,
  fetchImpl,
  proof,
}) {
  const result = await pendingCheckoutForProvenKey(db, proof.npub);
  if (!result) return null;

  const { pending, pendingRef } = result;
  const evaluation = await evaluateStoredPatreonRecord(
    pending,
    config,
    fetchImpl,
  );
  const currentRecord = {
    ...pending,
    ...(evaluation.updates || {}),
    npub: proof.npub,
    hexPubkey: proof.hexPubkey,
  };

  if (!evaluation.authorized) {
    const now = Date.now();
    await pendingRef.set(
      {
        ...(evaluation.updates || {}),
        pendingCheckout: true,
        updatedAtMs: now,
      },
      { merge: true },
    );
    const rawSessionId = await createBrowserSession({
      db,
      record: currentRecord,
      config,
    });
    res.setHeader(
      "Set-Cookie",
      serializeCookie(
        FIREBASE_SESSION_COOKIE,
        encodeSessionCookieValue(AUTH_SESSION_COOKIE_KIND, rawSessionId),
        {
          maxAge: config.sessionDurationMs / 1000,
          secure: config.cookieSecure,
        },
      ),
    );
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: false,
      connected: true,
      checkoutRequired: true,
      selectedPlan: currentRecord.selectedPlan || "annual",
      reason: evaluation.reason,
      subscription: buildSubscriptionSummary(currentRecord, {
        reason: evaluation.reason,
      }),
    });
  }

  const authorizedRecord = buildStoredAuthorization({
    ...currentRecord,
    authorized: true,
  });
  try {
    await linkPatreonAccount({
      db,
      npub: proof.npub,
      hexPubkey: proof.hexPubkey,
      record: authorizedRecord,
    });
  } catch (error) {
    if (error?.code === "patreon_account_already_linked") {
      const rawRecoveryId = await createRecoveryIntent({
        db,
        linkProof: proof,
        authorizedRecord,
        ipHash: requestIpHash(req),
      });
      await pendingRef.delete();
      res.setHeader(
        "Set-Cookie",
        serializeCookie(
          FIREBASE_SESSION_COOKIE,
          encodeSessionCookieValue(OAUTH_RECOVERY_COOKIE_KIND, rawRecoveryId),
          {
            maxAge: RECOVERY_DURATION_MS / 1000,
            secure: config.cookieSecure,
          },
        ),
      );
      return sendJson(res, 200, {
        authorized: false,
        configured: true,
        linked: false,
        replacementRequired: true,
        reason: "replace_required",
        subscription: buildSubscriptionSummary(authorizedRecord),
      });
    }
    if (error?.code === "rbe_key_already_linked") {
      await pendingRef.delete();
      return sendJson(res, 409, {
        authorized: false,
        configured: true,
        linked: false,
        reason: "link_conflict",
        subscription: null,
      });
    }
    throw error;
  }

  const linkedRecord = {
    ...authorizedRecord,
    npub: proof.npub,
    hexPubkey: proof.hexPubkey,
  };
  const rawSessionId = await createBrowserSession({
    db,
    record: linkedRecord,
    config,
  });
  await pendingRef.delete();
  res.setHeader(
    "Set-Cookie",
    serializeCookie(
      FIREBASE_SESSION_COOKIE,
      encodeSessionCookieValue(AUTH_SESSION_COOKIE_KIND, rawSessionId),
      {
        maxAge: config.sessionDurationMs / 1000,
        secure: config.cookieSecure,
      },
    ),
  );
  return sendJson(res, 200, {
    authorized: true,
    configured: true,
    linked: true,
    subscription: buildSubscriptionSummary(linkedRecord),
  });
}

function webhookMemberState(eventName, payload) {
  const data = payload?.data || {};
  const attributes = data.attributes || {};
  const patronStatus = String(attributes.patron_status || "").toLowerCase();
  const lastChargeStatus = String(
    attributes.last_charge_status || "",
  ).toLowerCase();
  const amountValue = attributes.currently_entitled_amount_cents;
  const amountCents = Number(amountValue);
  const deleted = eventName.endsWith(":delete");
  const inactive =
    deleted ||
    (patronStatus && patronStatus !== "active_patron") ||
    lastChargeStatus.includes("declin") ||
    lastChargeStatus === "failed" ||
    (amountValue !== undefined &&
      Number.isFinite(amountCents) &&
      amountCents <= 0);

  return {
    inactive,
    reason: deleted
      ? "membership_deleted"
      : lastChargeStatus.includes("declin") || lastChargeStatus === "failed"
        ? "payment_not_current"
        : patronStatus && patronStatus !== "active_patron"
          ? "inactive_membership"
          : inactive
            ? "no_paid_entitlement"
            : "verification_required",
    patronStatus,
    lastChargeStatus,
    entitledAmountCents:
      Number.isFinite(amountCents) && amountCents >= 0 ? amountCents : null,
  };
}

function setJsonHeaders(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

function sendJson(res, status, payload) {
  setJsonHeaders(res);
  return res.status(status).send(JSON.stringify(payload));
}

function clearCookie(name, secure) {
  return serializeCookie(name, "", { maxAge: 0, secure });
}

function requestPath(req) {
  try {
    return new URL(req.originalUrl || req.url || "/", "http://localhost")
      .pathname;
  } catch {
    return req.path || "/";
  }
}

function firstQueryValue(value) {
  return String(Array.isArray(value) ? value[0] || "" : value || "");
}

function readOAuthCallbackParams(req, config) {
  const result = {
    state: firstQueryValue(req.query?.state),
    code: firstQueryValue(req.query?.code),
    error: firstQueryValue(req.query?.error),
  };

  let expectedCallback;
  try {
    expectedCallback = new URL(config.redirectUri);
  } catch {
    return result;
  }

  const candidates = [
    req.originalUrl,
    req.url,
    req.headers?.["x-original-url"],
    req.headers?.["x-forwarded-url"],
    req.headers?.["x-forwarded-uri"],
    req.headers?.["x-original-uri"],
    req.headers?.["x-rewrite-url"],
    req.headers?.["x-envoy-original-path"],
    req.headers?.referer,
  ];
  for (const candidate of candidates) {
    if (!candidate || (result.state && result.code)) continue;
    try {
      const candidateUrl = new URL(String(candidate), expectedCallback.origin);
      if (
        candidateUrl.origin !== expectedCallback.origin ||
        candidateUrl.pathname !== expectedCallback.pathname
      ) {
        continue;
      }
      result.state ||= candidateUrl.searchParams.get("state") || "";
      result.code ||= candidateUrl.searchParams.get("code") || "";
      result.error ||= candidateUrl.searchParams.get("error") || "";
    } catch {
      // Ignore malformed proxy metadata and continue with other transports.
    }
  }
  return result;
}

async function handleSessionStatus({
  req,
  res,
  db,
  config,
  fetchImpl,
  log,
  forceRefresh = false,
}) {
  const activeNpub = String(
    req.headers?.["x-rbe-npub"] || req.header?.("X-RBE-Npub") || "",
  ).trim();
  if (!activeNpub || !decodeNpub(activeNpub)) {
    return sendJson(res, 400, {
      authorized: false,
      configured: true,
      linked: false,
      error: "active_key_required",
      subscription: null,
    });
  }

  const cookies = parseCookies(req.headers.cookie);
  const rawSessionId = decodeSessionCookieValue(
    cookies[FIREBASE_SESSION_COOKIE],
    AUTH_SESSION_COOKIE_KIND,
  );
  const rawRecoveryId = decodeSessionCookieValue(
    cookies[FIREBASE_SESSION_COOKIE],
    OAUTH_RECOVERY_COOKIE_KIND,
  );
  if (!rawSessionId && rawRecoveryId) {
    const now = Date.now();
    const recoveryRef = db
      .collection(RECOVERY_COLLECTION)
      .doc(sha256(rawRecoveryId));
    const recoverySnapshot = await recoveryRef.get();
    const recovery = recoverySnapshot.exists
      ? recoverySnapshot.data() || {}
      : null;
    const recoveryIsValid =
      recovery?.status === "pending" &&
      Number(recovery.expiresAtMs || 0) > now &&
      activeNpub &&
      decodeNpub(activeNpub) &&
      safeEqual(String(recovery.nextNpubHash || ""), sha256(activeNpub));

    if (recoveryIsValid) {
      return sendJson(res, 200, {
        authorized: false,
        configured: true,
        linked: false,
        replacementRequired: true,
        reason: "replace_required",
        subscription: buildSubscriptionSummary(recovery),
      });
    }

    res.setHeader(
      "Set-Cookie",
      clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
    );
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: false,
      reason: "replacement_expired",
      subscription: null,
    });
  }
  if (!rawSessionId) {
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: false,
      subscription: null,
    });
  }

  const sessionHash = sha256(rawSessionId);
  const sessionRef = db.collection(SESSION_COLLECTION).doc(sessionHash);
  const sessionSnapshot = await sessionRef.get();
  if (!sessionSnapshot.exists) {
    res.setHeader(
      "Set-Cookie",
      clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
    );
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: false,
      subscription: null,
    });
  }

  const session = sessionSnapshot.data() || {};
  const now = Date.now();
  const sessionNpubHash = String(
    session.linkedNpubHash ||
      (session.linkedNpub ? sha256(session.linkedNpub) : ""),
  );
  if (
    !sessionNpubHash ||
    !safeEqual(sessionNpubHash, sha256(activeNpub))
  ) {
    await sessionRef.delete();
    res.setHeader(
      "Set-Cookie",
      clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
    );
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: false,
      reason: "active_key_changed",
      subscription: null,
    });
  }
  if (
    (!session.authorized && !session.pendingCheckout) ||
    Number(session.expiresAtMs || 0) <= now
  ) {
    await sessionRef.delete();
    res.setHeader(
      "Set-Cookie",
      clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
    );
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: Boolean(session.linkedNpub || session.linkedNpubHash),
      subscription: buildSubscriptionSummary(
        { ...session, authorized: false },
        { reason: "session_expired" },
      ),
    });
  }

  const mapping = session.pendingCheckout
    ? { valid: true, linked: false, account: null, accountRef: null }
    : await validateLinkedSession(db, session);
  if (!mapping.valid) {
    await sessionRef.delete();
    res.setHeader(
      "Set-Cookie",
      clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
    );
    return sendJson(res, 200, {
      authorized: false,
      configured: true,
      linked: false,
      reason: "link_changed",
      subscription: null,
    });
  }

  if (forceRefresh) {
    try {
      await enforceForcedRefreshRateLimit({
        db,
        sessionRef,
        ipHash: requestIpHash(req),
        cooldownMs: config.refreshCooldownMs,
      });
    } catch (error) {
      if (error?.code !== "refresh_rate_limited") throw error;
      return sendJson(res, 429, {
        authorized: Boolean(session.authorized),
        configured: true,
        linked: Boolean(mapping.linked),
        error: "refresh_rate_limited",
        retryAfterMs: Number(error.retryAfterMs || config.refreshCooldownMs),
        subscription: buildSubscriptionSummary(session),
      });
    }
  }

  const storedRecord = mapping.linked ? mapping.account : session;
  try {
    const evaluation = await evaluateStoredPatreonRecord(
      storedRecord,
      config,
      fetchImpl,
      { forceRefresh },
    );
    const mergedRecord = {
      ...storedRecord,
      ...(evaluation.updates || {}),
    };
    if (!evaluation.authorized) {
      log.warn("Patreon session membership rejected", {
        reason: evaluation.reason,
        ...getMembershipDiagnostics(evaluation.identity, config),
      });
      if (session.pendingCheckout) {
        if (evaluation.updates) {
          await sessionRef.set(
            {
              ...evaluation.updates,
              pendingCheckout: true,
              ...(forceRefresh ? { lastForcedRefreshAtMs: now } : {}),
            },
            { merge: true },
          );
        }
        return sendJson(res, 200, {
          authorized: false,
          configured: true,
          linked: false,
          connected: true,
          checkoutRequired: true,
          selectedPlan: session.selectedPlan || "annual",
          reason: evaluation.reason,
          subscription: buildSubscriptionSummary(mergedRecord, {
            reason: evaluation.reason,
          }),
        });
      }
      if (mapping.linked && evaluation.updates) {
        await mapping.accountRef.set(
          { ...evaluation.updates, updatedAtMs: now },
          { merge: true },
        );
      }
      await sessionRef.delete();
      res.setHeader(
        "Set-Cookie",
        clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
      );
      return sendJson(res, 200, {
        authorized: false,
        configured: true,
        linked: Boolean(mapping.linked),
        subscription: buildSubscriptionSummary(mergedRecord, {
          reason: evaluation.reason,
        }),
      });
    }

    let linked = Boolean(mapping.linked);
    if (session.pendingCheckout) {
      const authorizedRecord = buildStoredAuthorization({
        ...mergedRecord,
        authorized: true,
      });
      const linkProof = {
        npub: String(session.linkedNpub || ""),
        hexPubkey: String(session.linkedHexPubkey || ""),
      };
      if (!linkProof.npub || !linkProof.hexPubkey) {
        throw new Error("Pending Patreon checkout lost its Robots Building Education key link");
      }
      const pendingCheckoutRef = db
        .collection(PENDING_CHECKOUT_COLLECTION)
        .doc(sha256(linkProof.npub));

      try {
        await linkPatreonAccount({
          db,
          npub: linkProof.npub,
          hexPubkey: linkProof.hexPubkey,
          record: authorizedRecord,
        });
        linked = true;
      } catch (error) {
        if (error?.code === "patreon_account_already_linked") {
          const rawRecoveryId = await createRecoveryIntent({
            db,
            linkProof,
            authorizedRecord,
            ipHash: requestIpHash(req),
          });
          await sessionRef.delete();
          await pendingCheckoutRef.delete();
          res.setHeader(
            "Set-Cookie",
            serializeCookie(
              FIREBASE_SESSION_COOKIE,
              encodeSessionCookieValue(
                OAUTH_RECOVERY_COOKIE_KIND,
                rawRecoveryId,
              ),
              {
                maxAge: RECOVERY_DURATION_MS / 1000,
                secure: config.cookieSecure,
              },
            ),
          );
          return sendJson(res, 200, {
            authorized: false,
            configured: true,
            linked: false,
            replacementRequired: true,
            reason: "replace_required",
            subscription: buildSubscriptionSummary(authorizedRecord),
          });
        }
        if (error?.code === "rbe_key_already_linked") {
          await sessionRef.delete();
          await pendingCheckoutRef.delete();
          res.setHeader(
            "Set-Cookie",
            clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
          );
          return sendJson(res, 409, {
            authorized: false,
            configured: true,
            linked: false,
            reason: "link_conflict",
            subscription: null,
          });
        }
        throw error;
      }
      await pendingCheckoutRef.delete();
    }

    if (evaluation.updates) {
      const update = {
        ...evaluation.updates,
        pendingCheckout: false,
        ...(forceRefresh ? { lastForcedRefreshAtMs: now } : {}),
      };
      await sessionRef.set(update, { merge: true });
      if (mapping.linked) {
        await mapping.accountRef.set(
          { ...evaluation.updates, updatedAtMs: now },
          { merge: true },
        );
      }
    }

    return sendJson(res, 200, {
      authorized: true,
      configured: true,
      linked,
      stale: Boolean(evaluation.stale),
      subscription: buildSubscriptionSummary(mergedRecord, {
        stale: Boolean(evaluation.stale),
      }),
    });
  } catch (error) {
    log.error("Patreon status refresh failed", error?.message || error);
    return sendJson(res, 503, {
      authorized: false,
      configured: true,
      linked: Boolean(mapping.linked),
      error: "patreon_unavailable",
      subscription: buildSubscriptionSummary(
        { ...storedRecord, authorized: false },
        { reason: "unknown" },
      ),
    });
  }
}

function authSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return decodeSessionCookieValue(
    cookies[FIREBASE_SESSION_COOKIE],
    AUTH_SESSION_COOKIE_KIND,
  );
}

async function handleReplacement({ req, res, db, config, fetchImpl, log }) {
  const rejectReplacement = async (status, error, data = {}) => {
    await writeAuditEventSafely(db, log, "replacement_rejected", {
      reason: error,
      ipHash: requestIpHash(req),
      ...data,
    });
    return sendJson(res, status, { error });
  };
  let proof;
  try {
    proof = await consumeNostrChallenge({
      db,
      challengeId: String(req.body?.challengeId || ""),
      signedEvent: req.body?.signedEvent,
      expectedAction: "replace",
    });
  } catch (error) {
    if (error?.isNostrProofError) {
      return rejectReplacement(401, "invalid_nostr_proof");
    }
    throw error;
  }

  const now = Date.now();
  const cookies = parseCookies(req.headers.cookie);
  const rawRecoveryId = decodeSessionCookieValue(
    cookies[FIREBASE_SESSION_COOKIE],
    OAUTH_RECOVERY_COOKIE_KIND,
  );
  let recoveryHash = rawRecoveryId ? sha256(rawRecoveryId) : "";
  const usingResumePointer = !recoveryHash;
  let resumeRef = null;
  if (!recoveryHash) {
    const pendingRecovery = await pendingRecoveryForProvenKey(db, proof.npub);
    if (!pendingRecovery) {
      return rejectReplacement(401, "replacement_expired", {
        nextNpubHash: sha256(proof.npub),
      });
    }
    recoveryHash = pendingRecovery.recoveryHash;
    resumeRef = pendingRecovery.resumeRef;
  } else {
    resumeRef = db
      .collection(RECOVERY_RESUME_COLLECTION)
      .doc(sha256(proof.npub));
  }
  const recoveryRef = db.collection(RECOVERY_COLLECTION).doc(recoveryHash);
  const recoverySnapshot = await recoveryRef.get();
  const recovery = recoverySnapshot.exists
    ? recoverySnapshot.data() || {}
    : null;
  if (
    !recovery ||
    recovery.status !== "pending" ||
    Number(recovery.expiresAtMs || 0) <= now ||
    recovery.nextNpubHash !== sha256(proof.npub)
  ) {
    res.setHeader(
      "Set-Cookie",
      clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
    );
    return rejectReplacement(409, "replacement_expired", {
      patreonUserHash: recovery?.patreonUserHash || null,
      nextNpubHash: recovery?.nextNpubHash || sha256(proof.npub),
    });
  }

  let evaluation;
  try {
    evaluation = await evaluateStoredPatreonRecord(
      recovery,
      config,
      fetchImpl,
      { forceRefresh: true },
    );
  } catch (error) {
    log.error("Patreon replacement verification failed", error?.message || error);
    return rejectReplacement(503, "patreon_unavailable", {
      patreonUserHash: recovery.patreonUserHash || null,
      nextNpubHash: recovery.nextNpubHash || null,
    });
  }
  if (!evaluation.authorized) {
    return rejectReplacement(403, "membership_not_active", {
      patreonUserHash: recovery.patreonUserHash || null,
      nextNpubHash: recovery.nextNpubHash || null,
    });
  }

  const currentRecord = buildStoredAuthorization({
    ...recovery,
    ...(evaluation.updates || {}),
  });
  const previousNpubHash = String(recovery.previousNpubHash || "");
  const nextNpubHash = sha256(proof.npub);
  const patreonUserHash = String(recovery.patreonUserHash || "");
  const oldAccountRef = db
    .collection(ACCOUNT_LINK_COLLECTION)
    .doc(previousNpubHash);
  const newAccountRef = db
    .collection(ACCOUNT_LINK_COLLECTION)
    .doc(nextNpubHash);
  const reverseRef = db
    .collection(PATREON_USER_LINK_COLLECTION)
    .doc(patreonUserHash);
  const recoveryResumeRef = resumeRef || db
    .collection(RECOVERY_RESUME_COLLECTION)
    .doc(nextNpubHash);
  const rawSessionId = crypto.randomBytes(32).toString("base64url");
  const sessionRef = db.collection(SESSION_COLLECTION).doc(sha256(rawSessionId));

  try {
    await db.runTransaction(async (transaction) => {
      const [
        freshRecoverySnapshot,
        reverseSnapshot,
        oldSnapshot,
        newSnapshot,
        resumeSnapshot,
      ] =
        await Promise.all([
          transaction.get(recoveryRef),
          transaction.get(reverseRef),
          transaction.get(oldAccountRef),
          transaction.get(newAccountRef),
          transaction.get(recoveryResumeRef),
        ]);
      const freshRecovery = freshRecoverySnapshot.exists
        ? freshRecoverySnapshot.data() || {}
        : {};
      const reverse = reverseSnapshot.exists ? reverseSnapshot.data() || {} : {};
      const oldAccount = oldSnapshot.exists ? oldSnapshot.data() || {} : {};
      const newAccount = newSnapshot.exists ? newSnapshot.data() || {} : null;
      const resume = resumeSnapshot.exists ? resumeSnapshot.data() || {} : {};
      if (
        freshRecovery.status !== "pending" ||
        Number(freshRecovery.expiresAtMs || 0) <= now ||
        (usingResumePointer &&
          (resume.recoveryHash !== recoveryHash ||
            resume.nextNpubHash !== nextNpubHash ||
            Number(resume.expiresAtMs || 0) <= now)) ||
        reverse.pendingRecoveryHash !== recoveryHash ||
        reverse.npubHash !== previousNpubHash ||
        oldAccount.patreonUserId !== currentRecord.patreonUserId ||
        (newAccount?.patreonUserId &&
          newAccount.patreonUserId !== currentRecord.patreonUserId)
      ) {
        const error = new Error("replacement_state_changed");
        error.code = "replacement_state_changed";
        throw error;
      }
      transaction.set(newAccountRef, {
        ...currentRecord,
        npub: proof.npub,
        npubHash: nextNpubHash,
        hexPubkey: proof.hexPubkey,
        patreonUserHash,
        linkedAtMs: now,
        updatedAtMs: now,
      });
      transaction.set(reverseRef, {
        npubHash: nextNpubHash,
        linkedAtMs: Number(reverse.linkedAtMs || now),
        updatedAtMs: now,
        pendingRecoveryHash: "",
      });
      transaction.delete(oldAccountRef);
      transaction.delete(recoveryResumeRef);
      transaction.set(recoveryRef, {
        status: "completed",
        patreonUserHash,
        previousNpubHash,
        nextNpubHash,
        createdAtMs: Number(freshRecovery.createdAtMs || now),
        completedAtMs: now,
        expiresAt: new Date(now + WEBHOOK_RECEIPT_DURATION_MS),
      });
      transaction.set(
        sessionRef,
        buildBrowserSessionRecord({
          record: { ...currentRecord, npub: proof.npub },
          config,
          now,
        }),
      );
    });
  } catch (error) {
    const code = String(error?.code || error?.message || "");
    if (code === "replacement_state_changed") {
      return rejectReplacement(409, code, {
        patreonUserHash,
        nextNpubHash,
      });
    }
    log.error("Patreon replacement transaction failed", error?.message || error);
    return rejectReplacement(503, "replacement_unavailable", {
      patreonUserHash,
      nextNpubHash,
    });
  }

  try {
    await revokeLinkedSessionsWithRetry(
      {
        db,
        linkedNpubHash: previousNpubHash,
        linkedPatreonUserHash: patreonUserHash,
        excludeSessionHash: sessionRef.id,
      },
      log,
    );
  } catch (error) {
    log.error("Old Patreon session cleanup failed", error?.message || error);
  }
  try {
    await writeAuditEvent(db, "replacement_completed", {
      patreonUserHash,
      previousNpubHash,
      nextNpubHash,
    });
  } catch (error) {
    log.error("Patreon replacement audit failed", error?.message || error);
  }
  res.setHeader(
    "Set-Cookie",
    serializeCookie(
      FIREBASE_SESSION_COOKIE,
      encodeSessionCookieValue(AUTH_SESSION_COOKIE_KIND, rawSessionId),
      {
        maxAge: config.sessionDurationMs / 1000,
        secure: config.cookieSecure,
      },
    ),
  );
  return sendJson(res, 200, {
    authorized: true,
    linked: true,
    replaced: true,
    subscription: buildSubscriptionSummary(currentRecord),
  });
}

async function handleCancelReplacement({ req, res, db, config, log }) {
  const cookies = parseCookies(req.headers.cookie);
  const rawRecoveryId = decodeSessionCookieValue(
    cookies[FIREBASE_SESSION_COOKIE],
    OAUTH_RECOVERY_COOKIE_KIND,
  );
  res.setHeader(
    "Set-Cookie",
    clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
  );
  let recoveryHash = rawRecoveryId ? sha256(rawRecoveryId) : "";
  if (!recoveryHash && req.body?.challengeId && req.body?.signedEvent) {
    try {
      const proof = await consumeNostrChallenge({
        db,
        challengeId: String(req.body.challengeId),
        signedEvent: req.body.signedEvent,
        expectedAction: "restore",
      });
      const pendingRecovery = await pendingRecoveryForProvenKey(db, proof.npub);
      recoveryHash = pendingRecovery?.recoveryHash || "";
    } catch (error) {
      if (error?.isNostrProofError) {
        return sendJson(res, 401, { error: "invalid_nostr_proof" });
      }
      throw error;
    }
  }
  if (!recoveryHash) return sendJson(res, 200, { ok: true });

  const now = Date.now();
  const recoveryRef = db.collection(RECOVERY_COLLECTION).doc(recoveryHash);
  let auditData = null;
  await db.runTransaction(async (transaction) => {
    const recoverySnapshot = await transaction.get(recoveryRef);
    if (!recoverySnapshot.exists) return;
    const recovery = recoverySnapshot.data() || {};
    if (recovery.status !== "pending") return;
    auditData = {
      patreonUserHash: recovery.patreonUserHash || null,
      previousNpubHash: recovery.previousNpubHash || null,
      nextNpubHash: recovery.nextNpubHash || null,
    };
    const reverseRef = db
      .collection(PATREON_USER_LINK_COLLECTION)
      .doc(String(recovery.patreonUserHash || ""));
    const reverseSnapshot = await transaction.get(reverseRef);
    const reverse = reverseSnapshot.exists ? reverseSnapshot.data() || {} : {};
    transaction.set(recoveryRef, {
      status: "cancelled",
      patreonUserHash: recovery.patreonUserHash || "",
      previousNpubHash: recovery.previousNpubHash || "",
      nextNpubHash: recovery.nextNpubHash || "",
      createdAtMs: Number(recovery.createdAtMs || now),
      cancelledAtMs: now,
      expiresAt: new Date(now + WEBHOOK_RECEIPT_DURATION_MS),
    });
    if (reverse.pendingRecoveryHash === recoveryHash) {
      transaction.set(
        reverseRef,
        { pendingRecoveryHash: "", updatedAtMs: now },
        { merge: true },
      );
    }
    if (recovery.nextNpubHash) {
      transaction.delete(
        db
          .collection(RECOVERY_RESUME_COLLECTION)
          .doc(String(recovery.nextNpubHash)),
      );
    }
  });
  if (auditData) {
    await writeAuditEventSafely(
      db,
      log,
      "replacement_cancelled",
      auditData,
    );
  }
  return sendJson(res, 200, { ok: true });
}

async function handleDisconnect({ req, res, db, config, log }) {
  const rejectDisconnect = async (status, error, data = {}) => {
    await writeAuditEventSafely(db, log, "subscription_disconnect_rejected", {
      reason: error,
      ipHash: requestIpHash(req),
      ...data,
    });
    return sendJson(res, status, { error });
  };
  const rawSessionId = authSessionFromRequest(req);
  if (!rawSessionId) return rejectDisconnect(401, "not_authenticated");
  const sessionHash = sha256(rawSessionId);
  const sessionRef = db.collection(SESSION_COLLECTION).doc(sessionHash);
  const sessionSnapshot = await sessionRef.get();
  const session = sessionSnapshot.exists ? sessionSnapshot.data() || {} : null;
  if (!session) return rejectDisconnect(401, "not_authenticated");

  let proof;
  try {
    proof = await consumeNostrChallenge({
      db,
      challengeId: String(req.body?.challengeId || ""),
      signedEvent: req.body?.signedEvent,
      expectedAction: "disconnect",
    });
  } catch (error) {
    if (error?.isNostrProofError) {
      return rejectDisconnect(401, "invalid_nostr_proof", {
        npubHash: session.linkedNpubHash || null,
      });
    }
    throw error;
  }

  const mapping = await validateLinkedSession(db, session);
  if (!mapping.valid || !mapping.linked || mapping.linkedNpubHash !== sha256(proof.npub)) {
    return rejectDisconnect(409, "link_changed", {
      npubHash: sha256(proof.npub),
    });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const [accountSnapshot, reverseSnapshot] = await Promise.all([
        transaction.get(mapping.accountRef),
        transaction.get(mapping.reverseRef),
      ]);
      if (
        !accountSnapshot.exists ||
        !reverseSnapshot.exists ||
        reverseSnapshot.data()?.npubHash !== mapping.linkedNpubHash
      ) {
        const error = new Error("link_changed");
        error.code = "link_changed";
        throw error;
      }
      transaction.delete(mapping.accountRef);
      transaction.delete(mapping.reverseRef);
      transaction.delete(sessionRef);
    });
  } catch (error) {
    if (String(error?.code || error?.message || "") === "link_changed") {
      return rejectDisconnect(409, "link_changed", {
        patreonUserHash: mapping.linkedPatreonUserHash,
        npubHash: mapping.linkedNpubHash,
      });
    }
    log.error("Patreon disconnect transaction failed", error?.message || error);
    return rejectDisconnect(503, "disconnect_unavailable", {
      patreonUserHash: mapping.linkedPatreonUserHash,
      npubHash: mapping.linkedNpubHash,
    });
  }
  try {
    await revokeLinkedSessionsWithRetry(
      {
        db,
        linkedNpubHash: mapping.linkedNpubHash,
        linkedNpub: session.linkedNpub,
        linkedPatreonUserHash: mapping.linkedPatreonUserHash,
      },
      log,
    );
  } catch (error) {
    log.error("Disconnected Patreon session cleanup failed", error?.message || error);
  }
  await writeAuditEventSafely(db, log, "subscription_disconnected", {
    patreonUserHash: mapping.linkedPatreonUserHash,
    npubHash: mapping.linkedNpubHash,
  });
  res.setHeader(
    "Set-Cookie",
    clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
  );
  return sendJson(res, 200, { ok: true, billingChanged: false });
}

function webhookRawBody(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === "string") return Buffer.from(req.rawBody, "utf8");
  return null;
}

function webhookReceiptRef(db, eventName, signature, rawBody) {
  const bodyHash = sha256(rawBody);
  const receiptId = sha256(`${eventName}:${signature}:${bodyHash}`);
  return db.collection(WEBHOOK_RECEIPT_COLLECTION).doc(receiptId);
}

async function recordWebhookReceiptOnce({ db, receiptRef, metadata, now }) {
  let duplicate = false;
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(receiptRef);
    if (snapshot.exists) {
      duplicate = true;
      return;
    }
    transaction.set(receiptRef, {
      ...metadata,
      receivedAtMs: now,
      expiresAt: new Date(now + WEBHOOK_RECEIPT_DURATION_MS),
    });
  });
  return duplicate;
}

async function handleWebhook({ req, res, db, config, log }) {
  if (!config.webhookConfigured) {
    return sendJson(res, 503, { error: "webhook_unavailable" });
  }
  const rawBody = webhookRawBody(req);
  const signature = String(req.headers?.["x-patreon-signature"] || "").trim();
  const expected = rawBody
    ? crypto
        .createHmac("md5", config.webhookSecret)
        .update(rawBody)
        .digest("hex")
    : "";
  if (!rawBody || !signature || !safeEqual(expected, signature)) {
    await writeAuditEventSafely(db, log, "webhook_rejected", {
      reason: "invalid_webhook_signature",
      ipHash: requestIpHash(req),
    });
    return sendJson(res, 401, { error: "invalid_webhook_signature" });
  }

  const eventName = String(req.headers?.["x-patreon-event"] || "").trim();
  const now = Date.now();
  const receiptRef = webhookReceiptRef(db, eventName, signature, rawBody);
  if (!WEBHOOK_EVENTS.has(eventName)) {
    const duplicate = await recordWebhookReceiptOnce({
      db,
      receiptRef,
      now,
      metadata: {
        eventName: eventName.slice(0, 128),
        campaignId: "",
        patreonUserHash: null,
        result: "ignored",
        reason: "event_not_allowlisted",
      },
    });
    return sendJson(res, 202, { ok: true, ignored: true, duplicate });
  }
  const payload = req.body || {};
  const campaignId = String(
    payload?.data?.relationships?.campaign?.data?.id || "",
  );
  if (campaignId !== config.campaignId) {
    await recordWebhookReceiptOnce({
      db,
      receiptRef,
      now,
      metadata: {
        eventName,
        campaignId: campaignId.slice(0, 128),
        patreonUserHash: null,
        result: "rejected",
        reason: "wrong_campaign",
      },
    });
    return sendJson(res, 403, { error: "wrong_campaign" });
  }
  const patreonUserId = String(
    payload?.data?.relationships?.user?.data?.id ||
      payload?.data?.relationships?.patron?.data?.id ||
      "",
  );
  if (!patreonUserId) {
    await recordWebhookReceiptOnce({
      db,
      receiptRef,
      now,
      metadata: {
        eventName,
        campaignId,
        patreonUserHash: null,
        result: "rejected",
        reason: "missing_patreon_user",
      },
    });
    return sendJson(res, 400, { error: "missing_patreon_user" });
  }

  const patreonUserHash = sha256(patreonUserId);
  const reverseRef = db
    .collection(PATREON_USER_LINK_COLLECTION)
    .doc(patreonUserHash);
  const state = webhookMemberState(eventName, payload);

  let duplicate = false;
  let linkedNpubHash = "";
  let accountFound = false;
  await db.runTransaction(async (transaction) => {
    const receiptSnapshot = await transaction.get(receiptRef);
    if (receiptSnapshot.exists) {
      duplicate = true;
      return;
    }
    const reverseSnapshot = await transaction.get(reverseRef);
    const reverse = reverseSnapshot.exists
      ? reverseSnapshot.data() || {}
      : null;
    linkedNpubHash = String(reverse?.npubHash || "");
    const accountRef = linkedNpubHash
      ? db.collection(ACCOUNT_LINK_COLLECTION).doc(linkedNpubHash)
      : null;
    const accountSnapshot = accountRef
      ? await transaction.get(accountRef)
      : null;
    accountFound = Boolean(accountSnapshot?.exists);
    transaction.set(receiptRef, {
      eventName,
      campaignId,
      patreonUserHash,
      result: accountFound ? "processed" : "ignored",
      reason: accountFound
        ? state.inactive
          ? state.reason
          : "verification_required"
        : "unlinked_patreon_user",
      receivedAtMs: now,
      expiresAt: new Date(now + WEBHOOK_RECEIPT_DURATION_MS),
    });
    if (!accountFound) return;
    if (state.inactive) {
      transaction.set(
        accountRef,
        {
          authorized: false,
          patronStatus: state.patronStatus,
          lastChargeStatus: state.lastChargeStatus,
          entitledAmountCents: state.entitledAmountCents || 0,
          webhookReason: state.reason,
          lastWebhookAtMs: now,
          updatedAtMs: now,
        },
        { merge: true },
      );
    } else {
      transaction.set(
        accountRef,
        {
          verificationRequiredAtMs: now,
          lastWebhookAtMs: now,
          updatedAtMs: now,
        },
        { merge: true },
      );
    }
  });

  if (duplicate) return sendJson(res, 200, { ok: true, duplicate: true });
  if (state.inactive && linkedNpubHash && accountFound) {
    try {
      await revokeLinkedSessionsWithRetry(
        {
          db,
          linkedNpubHash,
          linkedPatreonUserHash: patreonUserHash,
        },
        log,
      );
    } catch (error) {
      log.error("Webhook session cleanup failed", error?.message || error);
    }
  }
  log.info("Processed Patreon webhook", {
    eventName,
    action: state.inactive ? "revoked" : "verification_required",
    linked: Boolean(linkedNpubHash && accountFound),
  });
  return sendJson(res, 200, { ok: true });
}

function createPatreonHandler({ db, getConfig, fetchImpl = fetch, logger }) {
  const log = logger || console;

  return async function patreonHandler(req, res) {
    const config = getConfig();
    const path = requestPath(req).replace(/\/+$/, "") || "/";
    res.setHeader("Cache-Control", "no-store, max-age=0");

    // The surface is inert unless a specific environment explicitly enables it.
    // Local emulators opt in automatically; production requires its own flag.
    if (config.enabled === false) {
      return sendJson(res, 404, { error: "not_found" });
    }

    if (path.endsWith("/webhook")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      return handleWebhook({ req, res, db, config, log });
    }

    if (path.endsWith("/link-challenge")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 503, { error: "patreon_unavailable" });
      }

      const npub = String(req.body?.npub || "").trim();
      const action = String(req.body?.action || "").trim();
      const hexPubkey = decodeNpub(npub);
      if (
        !hexPubkey ||
        !["link", "restore", "replace", "disconnect"].includes(action)
      ) {
        return sendJson(res, 400, { error: "invalid_link_request" });
      }

      const challengeId = crypto.randomBytes(24).toString("base64url");
      const challenge = crypto.randomBytes(32).toString("base64url");
      const expiresAtMs = Date.now() + LINK_CHALLENGE_DURATION_MS;
      const eventTemplate = buildNostrAuthEvent({
        action,
        challengeId,
        challenge,
        expiresAtMs,
      });
      await db
        .collection(LINK_CHALLENGE_COLLECTION)
        .doc(sha256(challengeId))
        .set({
          npub,
          hexPubkey,
          action,
          // Firestore does not allow an array nested directly inside another
          // array, which Nostr tags use. Preserve the exact signed template as
          // JSON so round-trip verification remains byte-for-byte strict.
          eventTemplateJson: JSON.stringify(eventTemplate),
          createdAtMs: Date.now(),
          expiresAtMs,
          expiresAt: new Date(expiresAtMs),
          usedAtMs: null,
        });

      return sendJson(res, 200, { challengeId, eventTemplate });
    }

    if (path.endsWith("/link-start")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 503, { error: "patreon_unavailable" });
      }

      try {
        const proof = await consumeNostrChallenge({
          db,
          challengeId: String(req.body?.challengeId || ""),
          signedEvent: req.body?.signedEvent,
          expectedAction: "link",
        });
        const requestedPlan = String(req.body?.plan || "").trim();
        const selectedPlan = ["annual", "monthly"].includes(requestedPlan)
          ? requestedPlan
          : "annual";
        const requestedReturnMode = String(req.body?.returnMode || "");
        const returnMode = requestedReturnMode === "modal"
          ? requestedReturnMode
          : "page";
        const requestedLanguage = String(req.body?.language || "")
          .trim()
          .toLowerCase();
        const language = ["en", "es"].includes(requestedLanguage)
          ? requestedLanguage
          : "";
        const state = crypto.randomBytes(32).toString("base64url");
        await db
          .collection(OAUTH_STATE_COLLECTION)
          .doc(sha256(state))
          .set({
            npub: proof.npub,
            hexPubkey: proof.hexPubkey,
            selectedPlan,
            returnMode,
            ...(language ? { language } : {}),
            status: "pending",
            createdAtMs: Date.now(),
            expiresAtMs: Date.now() + OAUTH_STATE_DURATION_MS,
            expiresAt: new Date(Date.now() + OAUTH_STATE_DURATION_MS),
          });

        const authorizeUrl = new URL(PATREON_AUTHORIZE_URL);
        authorizeUrl.searchParams.set("response_type", "code");
        authorizeUrl.searchParams.set("client_id", config.clientId);
        authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
        authorizeUrl.searchParams.set("scope", "identity");
        authorizeUrl.searchParams.set("state", state);
        res.setHeader(
          "Set-Cookie",
          serializeCookie(
            FIREBASE_SESSION_COOKIE,
            encodeSessionCookieValue(OAUTH_LINK_STATE_COOKIE_KIND, state),
            {
              maxAge: OAUTH_STATE_DURATION_MS / 1000,
              secure: config.cookieSecure,
            },
          ),
        );
        return sendJson(res, 200, { authorizeUrl: authorizeUrl.toString() });
      } catch (error) {
        if (error?.isNostrProofError) {
          log.warn("Invalid Patreon link proof", error?.code || error?.message);
          return sendJson(res, 401, { error: "invalid_nostr_proof" });
        }
        log.error("Unable to start Patreon linking", error?.message || error);
        return sendJson(res, 503, { error: "patreon_unavailable" });
      }
    }

    if (path.endsWith("/key-status")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 503, {
          authorized: false,
          configured: false,
        });
      }

      try {
        const proof = await consumeNostrChallenge({
          db,
          challengeId: String(req.body?.challengeId || ""),
          signedEvent: req.body?.signedEvent,
          expectedAction: "restore",
        });
        const accountRef = db
          .collection(ACCOUNT_LINK_COLLECTION)
          .doc(sha256(proof.npub));
        const accountSnapshot = await accountRef.get();
        if (!accountSnapshot.exists) {
          const pendingRecovery = await pendingRecoveryForProvenKey(
            db,
            proof.npub,
          );
          if (pendingRecovery) {
            return sendJson(res, 200, {
              authorized: false,
              configured: true,
              linked: false,
              replacementRequired: true,
              reason: "replace_required",
              subscription: buildSubscriptionSummary(
                pendingRecovery.recovery,
              ),
            });
          }
          const restoredCheckout = await restorePendingCheckoutForProvenKey({
            req,
            res,
            db,
            config,
            fetchImpl,
            proof,
          });
          if (restoredCheckout) return restoredCheckout;
          return sendJson(res, 200, {
            authorized: false,
            configured: true,
            linked: false,
          });
        }

        const account = accountSnapshot.data() || {};
        const reverseSnapshot = account.patreonUserId
          ? await db
              .collection(PATREON_USER_LINK_COLLECTION)
              .doc(sha256(account.patreonUserId))
              .get()
          : null;
        if (
          !reverseSnapshot?.exists ||
          reverseSnapshot.data()?.npubHash !== sha256(proof.npub)
        ) {
          return sendJson(res, 200, {
            authorized: false,
            configured: true,
            linked: false,
            reason: "link_changed",
          });
        }
        const evaluation = await evaluateStoredPatreonRecord(
          account,
          config,
          fetchImpl,
        );
        if (evaluation.updates) {
          await accountRef.set(
            { ...evaluation.updates, updatedAtMs: Date.now() },
            { merge: true },
          );
        }
        if (!evaluation.authorized) {
          return sendJson(res, 200, {
            authorized: false,
            configured: true,
            linked: true,
            reason: evaluation.reason,
            subscription: buildSubscriptionSummary(
              { ...account, ...(evaluation.updates || {}) },
              { reason: evaluation.reason },
            ),
          });
        }

        const currentRecord = {
          ...account,
          ...(evaluation.updates || {}),
          npub: proof.npub,
        };
        const rawSessionId = await createBrowserSession({
          db,
          record: currentRecord,
          config,
        });
        res.setHeader(
          "Set-Cookie",
          serializeCookie(
            FIREBASE_SESSION_COOKIE,
            encodeSessionCookieValue(AUTH_SESSION_COOKIE_KIND, rawSessionId),
            {
              maxAge: config.sessionDurationMs / 1000,
              secure: config.cookieSecure,
            },
          ),
        );
        return sendJson(res, 200, {
          authorized: true,
          configured: true,
          linked: true,
          stale: Boolean(evaluation.stale),
          subscription: buildSubscriptionSummary(currentRecord, {
            stale: Boolean(evaluation.stale),
          }),
        });
      } catch (error) {
        if (error?.isNostrProofError) {
          return sendJson(res, 401, { error: "invalid_nostr_proof" });
        }
        log.error("Patreon key restore failed", error?.message || error);
        return sendJson(res, 503, {
          authorized: false,
          configured: true,
          error: "patreon_unavailable",
        });
      }
    }

    if (path.endsWith("/refresh-status")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 503, {
          authorized: false,
          configured: false,
        });
      }
      return handleSessionStatus({
        req,
        res,
        db,
        config,
        fetchImpl,
        log,
        forceRefresh: true,
      });
    }

    if (path.endsWith("/replace-link")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 503, { error: "patreon_unavailable" });
      }
      return handleReplacement({ req, res, db, config, fetchImpl, log });
    }

    if (path.endsWith("/cancel-replacement")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      return handleCancelReplacement({ req, res, db, config, log });
    }

    if (path.endsWith("/disconnect")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 503, { error: "patreon_unavailable" });
      }
      return handleDisconnect({ req, res, db, config, log });
    }

    if (path.endsWith("/status")) {
      if (req.method !== "GET") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return sendJson(res, 200, {
          authorized: false,
          configured: false,
        });
      }
      return handleSessionStatus({
        req,
        res,
        db,
        config,
        fetchImpl,
        log,
      });
    }

    if (path.endsWith("/start")) {
      return sendJson(res, 404, { error: "not_found" });
    }

    if (path.endsWith("/callback")) {
      if (req.method !== "GET") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      if (!config.configured) {
        return res.redirect(302, redirectTarget(config, "unavailable"));
      }

      const cookies = parseCookies(req.headers.cookie);
      const expectedLinkState = decodeSessionCookieValue(
        cookies[FIREBASE_SESSION_COOKIE],
        OAUTH_LINK_STATE_COOKIE_KIND,
      );
      const expectedState =
        expectedLinkState ||
        decodeSessionCookieValue(
          cookies[FIREBASE_SESSION_COOKIE],
          OAUTH_STATE_COOKIE_KIND,
        );
      const callbackParams = readOAuthCallbackParams(req, config);
      const receivedState = callbackParams.state || expectedState;
      const code = callbackParams.code;
      const oauthError = callbackParams.error;
      // The server-side, one-use state record is authoritative. The shared
      // __session cookie is only a cleanup hint: status/key restoration and a
      // newer link attempt can legitimately replace it while Patreon is open.
      // Rejecting a valid returned state because that cookie is stale makes
      // callback success depend on response timing across browser surfaces.
      if (!receivedState) {
        log.warn("Patreon OAuth callback rejected", {
          reason: "missing_returned_state",
          hadStateCookie: Boolean(expectedState),
        });
        return res.redirect(302, redirectTarget(config, "state_error"));
      }

      const oauthStateRef = db
        .collection(OAUTH_STATE_COLLECTION)
        .doc(sha256(receivedState));
      let oauthState = null;
      try {
        const oauthStateSnapshot = await oauthStateRef.get();
        oauthState = oauthStateSnapshot.exists
          ? oauthStateSnapshot.data() || {}
          : null;
      } catch (error) {
        log.error("Unable to read Patreon link state", error?.message || error);
      }
      if (
        !oauthState ||
        Number(oauthState.expiresAtMs || 0) <= Date.now() ||
        !oauthState.npub ||
        !oauthState.hexPubkey
      ) {
        log.warn("Patreon OAuth callback rejected", {
          reason: "invalid_server_state",
          hadStateCookie: Boolean(expectedState),
          stateCookieMatched: Boolean(
            expectedState && safeEqual(expectedState, receivedState),
          ),
        });
        return res.redirect(302, redirectTarget(config, "state_error"));
      }
      if (oauthState.status === "completed") {
        return res.redirect(302, completedOAuthRedirect(config, oauthState));
      }

      const linkProof = {
        npub: String(oauthState.npub),
        hexPubkey: String(oauthState.hexPubkey),
        selectedPlan: ["annual", "monthly"].includes(oauthState.selectedPlan)
          ? oauthState.selectedPlan
          : "annual",
      };
      const finishCallback = async (
        result,
        searchParams = {},
        { preserveCookie = false } = {},
      ) => {
        const completionResult = OAUTH_COMPLETION_RESULTS.has(String(result))
          ? String(result)
          : "oauth_error";
        const completionSearchParams = {};
        if (["annual", "monthly"].includes(String(searchParams.plan))) {
          completionSearchParams.plan = String(searchParams.plan);
        }
        if (["en", "es"].includes(String(oauthState.language))) {
          completionSearchParams.lang = String(oauthState.language);
        }
        const completedAtMs = Date.now();
        await oauthStateRef.set(
          {
            status: "completed",
            completionResult,
            completionSearchParams,
            completedAtMs,
          },
          { merge: true },
        );
        log.info("Patreon OAuth callback completed", {
          result: completionResult,
          hadStateCookie: Boolean(expectedState),
          stateCookieMatched: Boolean(
            expectedState && safeEqual(expectedState, receivedState),
          ),
        });
        if (!preserveCookie && expectedState) {
          res.setHeader(
            "Set-Cookie",
            clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
          );
        }
        return res.redirect(
          302,
          redirectTarget(config, completionResult, completionSearchParams),
        );
      };

      if (oauthError) {
        return finishCallback("oauth_cancelled");
      }
      if (!code) {
        return finishCallback("oauth_error");
      }

      try {
        const tokens = await exchangeAuthorizationCode(code, config, fetchImpl);
        if (!tokens?.access_token || !tokens?.refresh_token) {
          throw new Error("Patreon OAuth response did not include both tokens");
        }
        const identity = await fetchIdentity(tokens.access_token, fetchImpl);
        const membership = evaluatePatreonIdentity(identity, config);

        if (!membership.authorized) {
          log.warn("Patreon OAuth membership rejected", {
            reason: membership.reason,
            ...getMembershipDiagnostics(identity, config),
          });
          if (linkProof.npub && linkProof.hexPubkey) {
            const now = Date.now();
            const pendingRecord = buildPendingCheckoutRecord({
              identity,
              membership,
              tokens,
              config,
              now,
              linkProof,
            });
            const rawSessionId = await createBrowserSession({
              db,
              record: pendingRecord,
              config,
            });
            await storePendingCheckoutForKey({
              db,
              record: pendingRecord,
              config,
              now,
            });
            res.setHeader(
              "Set-Cookie",
              serializeCookie(
                FIREBASE_SESSION_COOKIE,
                encodeSessionCookieValue(
                  AUTH_SESSION_COOKIE_KIND,
                  rawSessionId,
                ),
                {
                  maxAge: config.sessionDurationMs / 1000,
                  secure: config.cookieSecure,
                },
              ),
            );
            return finishCallback(
              "checkout_required",
              { plan: pendingRecord.selectedPlan },
              { preserveCookie: true },
            );
          }
          return finishCallback("not_subscribed");
        }

        const now = Date.now();
        const authorizedRecord = buildAuthorizedRecord({
          membership,
          tokens,
          config,
          now,
        });
        if (linkProof.npub && linkProof.hexPubkey) {
          try {
            await linkPatreonAccount({
              db,
              npub: linkProof.npub,
              hexPubkey: linkProof.hexPubkey,
              record: authorizedRecord,
            });
            authorizedRecord.npub = linkProof.npub;
          } catch (error) {
            if (error?.code === "patreon_account_already_linked") {
              try {
                const rawRecoveryId = await createRecoveryIntent({
                  db,
                  linkProof,
                  authorizedRecord,
                  ipHash: requestIpHash(req),
                });
                res.setHeader(
                  "Set-Cookie",
                  serializeCookie(
                    FIREBASE_SESSION_COOKIE,
                    encodeSessionCookieValue(
                      OAUTH_RECOVERY_COOKIE_KIND,
                      rawRecoveryId,
                    ),
                    {
                      maxAge: RECOVERY_DURATION_MS / 1000,
                      secure: config.cookieSecure,
                    },
                  ),
                );
                return finishCallback(
                  "replace_required",
                  {},
                  { preserveCookie: true },
                );
              } catch (recoveryError) {
                const recoveryCode = String(
                  recoveryError?.code || recoveryError?.message || "",
                );
                if (recoveryCode === "recovery_rate_limited") {
                  return finishCallback("replace_rate_limited");
                }
                throw recoveryError;
              }
            }
            if (error?.code === "rbe_key_already_linked") {
              return finishCallback("link_conflict");
            }
            throw error;
          }
        }

        const rawSessionId = await createBrowserSession({
          db,
          record: authorizedRecord,
          config,
        });

        res.setHeader(
          "Set-Cookie",
          serializeCookie(
            FIREBASE_SESSION_COOKIE,
            encodeSessionCookieValue(AUTH_SESSION_COOKIE_KIND, rawSessionId),
            {
              maxAge: config.sessionDurationMs / 1000,
              secure: config.cookieSecure,
            },
          ),
        );
        return finishCallback("connected", {}, { preserveCookie: true });
      } catch (error) {
        log.error("Patreon OAuth callback failed", error?.message || error);
        return finishCallback("oauth_error");
      }
    }

    if (path.endsWith("/logout")) {
      if (req.method !== "POST") {
        return sendJson(res, 405, { error: "method_not_allowed" });
      }
      const cookies = parseCookies(req.headers.cookie);
      const rawSessionId = decodeSessionCookieValue(
        cookies[FIREBASE_SESSION_COOKIE],
        AUTH_SESSION_COOKIE_KIND,
      );
      if (rawSessionId) {
        await db
          .collection(SESSION_COLLECTION)
          .doc(sha256(rawSessionId))
          .delete()
          .catch(() => {});
      }
      res.setHeader(
        "Set-Cookie",
        clearCookie(FIREBASE_SESSION_COOKIE, config.cookieSecure),
      );
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { error: "not_found" });
  };
}

module.exports = {
  buildBrowserSessionRecord,
  buildNostrAuthEvent,
  buildSubscriptionSummary,
  createPatreonHandler,
  decodeNpub,
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
};
