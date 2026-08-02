const PENDING_MODAL_RETURN_KEY = "rbe:patreon-modal-return:pending";
const READY_MODAL_RETURN_KEY = "rbe:patreon-modal-return:ready";
const REOPEN_MODAL_KEY = "rbe:patreon-modal-return:reopen";
const RETURN_LIFETIME_MS = 10 * 60 * 1000;
export const PATREON_MODAL_RETURN_PARAM = "patreon_modal";
export const PATREON_MODAL_RESULT_PARAM = "patreon_result";

function browserStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function readStoredReturn(key, { storage, now = Date.now() } = {}) {
  const target = browserStorage(storage);
  if (!target) return null;
  try {
    const value = JSON.parse(target.getItem(key) || "null");
    if (
      !value ||
      !String(value.returnPath || "").startsWith("/") ||
      String(value.returnPath || "").startsWith("//") ||
      now - Number(value.createdAtMs || 0) > RETURN_LIFETIME_MS
    ) {
      target.removeItem(key);
      return null;
    }
    return value;
  } catch {
    target.removeItem(key);
    return null;
  }
}

export function rememberPatreonModalReturn({ location, storage, now = Date.now() } = {}) {
  const target = browserStorage(storage);
  if (!target) return false;
  const activeLocation = location || globalThis.location;
  const pathname = String(activeLocation?.pathname || "/");
  const returnPath = pathname === "/subscription"
    ? "/"
    : `${pathname}${activeLocation?.search || ""}${activeLocation?.hash || ""}`;
  try {
    target.setItem(PENDING_MODAL_RETURN_KEY, JSON.stringify({ returnPath, createdAtMs: now }));
    target.setItem(REOPEN_MODAL_KEY, "1");
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
  target.removeItem(PENDING_MODAL_RETURN_KEY);
  if (!pending) return null;
  const ready = {
    returnPath: pending.returnPath,
    result: String(result || "oauth_error"),
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
  target.removeItem(READY_MODAL_RETURN_KEY);
  return ready;
}

export function shouldReopenPatreonModal({ storage } = {}) {
  const target = browserStorage(storage);
  try {
    return target?.getItem(REOPEN_MODAL_KEY) === "1";
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
  const url = new URL(String(returnPath || "/"), "http://rbe.local");
  url.searchParams.set(PATREON_MODAL_RETURN_PARAM, "1");
  url.searchParams.set(PATREON_MODAL_RESULT_PARAM, String(result || "oauth_error"));
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
