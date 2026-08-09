const PENDING_MODAL_RETURN_KEY = "rbe:patreon-modal-return:pending";
const READY_MODAL_RETURN_KEY = "rbe:patreon-modal-return:ready";
const REOPEN_MODAL_KEY = "rbe:patreon-modal-return:reopen";
const RETURN_LIFETIME_MS = 10 * 60 * 1000;
const PATREON_RETURN_RESULTS = new Set([
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
export const PATREON_MODAL_RETURN_PARAM = "patreon_modal";
export const PATREON_MODAL_RESULT_PARAM = "patreon_result";

export function hasPatreonOAuthReturn(search = globalThis.location?.search || "") {
  const params = new URLSearchParams(String(search || ""));
  return Boolean(
    params.get(PATREON_MODAL_RESULT_PARAM) ||
    params.get(PATREON_MODAL_RETURN_PARAM) === "1" ||
    params.get("patreon"),
  );
}

function browserStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function removeStoredValue(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage may be denied in private or embedded browser containers.
  }
}

export function normalizePatreonReturnResult(result) {
  const normalized = String(result || "");
  return PATREON_RETURN_RESULTS.has(normalized) ? normalized : "oauth_error";
}

export function normalizePatreonReturnLanguage(language, fallback = "en") {
  const requested = String(language || "").trim().toLowerCase();
  if (["en", "es"].includes(requested)) return requested;
  return String(fallback || "en").trim().toLowerCase().startsWith("es")
    ? "es"
    : "en";
}

export function sanitizePatreonReturnPath(returnPath) {
  const value = String(returnPath || "");
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  try {
    const url = new URL(value, "http://rbe.local");
    if (url.origin !== "http://rbe.local") return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function readStoredReturn(key, { storage, now = Date.now() } = {}) {
  const target = browserStorage(storage);
  if (!target) return null;
  try {
    const value = JSON.parse(target.getItem(key) || "null");
    if (
      !value ||
      (sanitizePatreonReturnPath(value.returnPath) === "/" &&
        String(value.returnPath || "") !== "/") ||
      now - Number(value.createdAtMs || 0) > RETURN_LIFETIME_MS
    ) {
      removeStoredValue(target, key);
      return null;
    }
    value.returnPath = sanitizePatreonReturnPath(value.returnPath);
    return value;
  } catch {
    removeStoredValue(target, key);
    return null;
  }
}

export function rememberPatreonModalReturn({
  location,
  npub,
  storage,
  now = Date.now(),
} = {}) {
  const target = browserStorage(storage);
  if (!target) return false;
  const activeLocation = location || globalThis.location;
  const pathname = String(activeLocation?.pathname || "/");
  const returnPath = pathname === "/subscription"
    ? "/"
    : `${pathname}${activeLocation?.search || ""}${activeLocation?.hash || ""}`;
  try {
    target.setItem(PENDING_MODAL_RETURN_KEY, JSON.stringify({
      returnPath,
      npub: String(npub || globalThis.localStorage?.getItem("local_npub") || ""),
      reopenModal: true,
      createdAtMs: now,
    }));
    target.setItem(REOPEN_MODAL_KEY, "1");
    target.removeItem(READY_MODAL_RETURN_KEY);
    return true;
  } catch {
    return false;
  }
}

export function rememberPatreonPageReturn({
  npub,
  storage,
  now = Date.now(),
} = {}) {
  const target = browserStorage(storage);
  if (!target) return false;
  try {
    target.setItem(PENDING_MODAL_RETURN_KEY, JSON.stringify({
      returnPath: "/subscription",
      npub: String(npub || globalThis.localStorage?.getItem("local_npub") || ""),
      reopenModal: false,
      createdAtMs: now,
    }));
    target.removeItem(REOPEN_MODAL_KEY);
    target.removeItem(READY_MODAL_RETURN_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasPendingPatreonModalReturn(options = {}) {
  return Boolean(readStoredReturn(PENDING_MODAL_RETURN_KEY, options));
}

export function completePatreonModalReturn(result, { storage, now = Date.now() } = {}) {
  const target = browserStorage(storage);
  if (!target) return null;
  const pending = readStoredReturn(PENDING_MODAL_RETURN_KEY, { storage: target, now });
  removeStoredValue(target, PENDING_MODAL_RETURN_KEY);
  if (!pending) return null;
  const ready = {
    returnPath: pending.returnPath,
    npub: String(pending.npub || ""),
    reopenModal: Boolean(pending.reopenModal),
    result: normalizePatreonReturnResult(result),
    createdAtMs: now,
  };
  try {
    target.setItem(READY_MODAL_RETURN_KEY, JSON.stringify(ready));
  } catch {
    return null;
  }
  return ready;
}

export function consumePatreonModalReturn(options = {}) {
  const target = browserStorage(options.storage);
  if (!target) return null;
  const ready = readStoredReturn(READY_MODAL_RETURN_KEY, { ...options, storage: target });
  removeStoredValue(target, READY_MODAL_RETURN_KEY);
  return ready;
}

export function shouldReopenPatreonModal({ storage, npub, now = Date.now() } = {}) {
  const target = browserStorage(storage);
  try {
    if (target?.getItem(REOPEN_MODAL_KEY) !== "1") return false;
    const activeNpub = String(
      npub || globalThis.localStorage?.getItem("local_npub") || "",
    );
    const stored = readStoredReturn(READY_MODAL_RETURN_KEY, {
      storage: target,
      now,
    }) || readStoredReturn(PENDING_MODAL_RETURN_KEY, { storage: target, now });
    return Boolean(stored?.reopenModal && stored.npub && stored.npub === activeNpub);
  } catch {
    return false;
  }
}

export function clearPatreonModalReopen({ storage } = {}) {
  const target = browserStorage(storage);
  try {
    target?.removeItem(REOPEN_MODAL_KEY);
    target?.removeItem(READY_MODAL_RETURN_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted embedded browsers.
  }
}

export function buildPatreonModalReturnPath(returnPath, result) {
  const url = new URL(sanitizePatreonReturnPath(returnPath), "http://rbe.local");
  url.searchParams.set(PATREON_MODAL_RETURN_PARAM, "1");
  url.searchParams.set(
    PATREON_MODAL_RESULT_PARAM,
    normalizePatreonReturnResult(result),
  );
  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildPatreonCompletedReturnPath(completed, result) {
  const safeResult = normalizePatreonReturnResult(result);
  const safePath = sanitizePatreonReturnPath(completed?.returnPath || "/");
  if (completed?.reopenModal) {
    return buildPatreonModalReturnPath(safePath, safeResult);
  }
  const url = new URL(safePath, "http://rbe.local");
  url.searchParams.set(PATREON_MODAL_RESULT_PARAM, safeResult);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function clearPendingPatreonModalReturn({ storage } = {}) {
  const target = browserStorage(storage);
  try {
    target?.removeItem(PENDING_MODAL_RETURN_KEY);
    target?.removeItem(REOPEN_MODAL_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted embedded browsers.
  }
}
