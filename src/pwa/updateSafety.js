/**
 * src/pwa/updateSafety.js
 *
 * Manages safety blockers for active tasks (lessons, recordings, assessments, unsaved drafts)
 * and coordinates update readiness across multiple open tabs/clients sharing the same registration.
 */

import { useEffect } from "react";

const CHANNEL_NAME = "embedded_sunset-update-coordination";

// In-memory blocker registry for the current page/client
const activeBlockers = new Map();
const safetySubscribers = new Set();

let channel = null;
const localTabId =
  typeof window !== "undefined" && typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab-${Math.random().toString(36).slice(2, 9)}`;

function notifySubscribers() {
  const safe = isUpdateSafe();
  const blockers = getActiveBlockers();
  for (const callback of safetySubscribers) {
    try {
      callback({ safe, blockers });
    } catch (err) {
      console.error("Error in safety subscriber:", err);
    }
  }
}

/**
 * Register a blocker preventing automatic activation or reload.
 * @param {string} id - Unique identifier for the blocker.
 * @param {Object} [options]
 * @param {string} [options.description] - Human-readable reason.
 * @param {Function} [options.persist] - Optional async callback to flush/persist unsaved state.
 * @returns {Function} Unregister cleanup function.
 */
export function registerUpdateBlocker(id, options = {}) {
  if (!id) return () => {};

  activeBlockers.set(id, {
    id,
    description: options.description || "Active activity",
    persist: typeof options.persist === "function" ? options.persist : null,
    registeredAt: Date.now(),
  });

  notifySubscribers();

  return () => {
    unregisterUpdateBlocker(id);
  };
}

/**
 * Unregister a blocker.
 * @param {string} id
 */
export function unregisterUpdateBlocker(id) {
  if (!id || !activeBlockers.has(id)) return;
  activeBlockers.delete(id);
  notifySubscribers();
}

/**
 * Check if the local client is safe to update (no active blockers).
 * @returns {boolean}
 */
export function isUpdateSafe() {
  return activeBlockers.size === 0;
}

/**
 * Get details on current active blockers.
 * @returns {Array<{ id: string, description: string, registeredAt: number }>}
 */
export function getActiveBlockers() {
  return Array.from(activeBlockers.values()).map(({ id, description, registeredAt }) => ({
    id,
    description,
    registeredAt,
  }));
}

/**
 * Reset all blockers (primarily for testing).
 */
export function resetBlockersForTest() {
  activeBlockers.clear();
  notifySubscribers();
}

/**
 * Subscribe to safety state changes.
 * @param {Function} callback - ({ safe: boolean, blockers: Array }) => void
 * @returns {Function} Unsubscribe function.
 */
export function subscribeSafety(callback) {
  if (typeof callback !== "function") return () => {};
  safetySubscribers.add(callback);
  // Emit initial state immediately
  try {
    callback({ safe: isUpdateSafe(), blockers: getActiveBlockers() });
  } catch (err) {
    console.error("Error in safety subscriber:", err);
  }
  return () => {
    safetySubscribers.delete(callback);
  };
}

/**
 * Attempt to flush any blockers that declare a persistence callback.
 * Returns true if all blockers settled and no blockers remain.
 * @param {number} [timeoutMs=3000]
 * @returns {Promise<boolean>}
 */
export async function requestSafetySettlement(timeoutMs = 3000) {
  if (isUpdateSafe()) return true;

  const persistableBlockers = Array.from(activeBlockers.values()).filter(
    (b) => typeof b.persist === "function",
  );

  if (persistableBlockers.length === 0) {
    // There are blockers, but none can auto-persist (e.g. user is actively in a live lesson)
    return false;
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Persistence timeout")), timeoutMs),
    );

    const persistPromises = persistableBlockers.map(async (b) => {
      try {
        await b.persist();
      } catch (err) {
        console.warn(`Failed to persist blocker ${b.id}:`, err);
        throw err;
      }
    });

    await Promise.race([Promise.all(persistPromises), timeoutPromise]);
  } catch {
    return false;
  }

  return isUpdateSafe();
}

/**
 * React hook for components to register an update blocker.
 * @param {string} id - Unique blocker ID.
 * @param {boolean} isBlocked - Whether the blocker is currently active.
 * @param {string} [description] - Human-readable description.
 * @param {Function} [persist] - Optional persistence callback.
 */
export function useUpdateBlocker(id, isBlocked, description = "Active task", persist = null) {
  useEffect(() => {
    if (!isBlocked) return;
    return registerUpdateBlocker(id, { description, persist });
  }, [id, isBlocked, description, persist]);
}

// Multi-client coordination over BroadcastChannel
function getBroadcastChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = handleChannelMessage;
    } catch (e) {
      console.warn("BroadcastChannel initialization failed:", e);
      channel = null;
    }
  }
  return channel;
}

function handleChannelMessage(event) {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "EMBEDDED_SUNSET_QUERY_SAFETY" && data.tabId !== localTabId) {
    // Another client is querying our safety. Report our current state.
    const ch = getBroadcastChannel();
    if (ch) {
      ch.postMessage({
        type: "EMBEDDED_SUNSET_REPORT_SAFETY",
        tabId: localTabId,
        queryId: data.queryId,
        isSafe: isUpdateSafe(),
        blockers: getActiveBlockers(),
      });
    }
  }
}

/**
 * Coordinate with all open clients/tabs sharing the registration.
 * Ensures no other tab has active protected work before proceeding with activation.
 * @param {number} [timeoutMs=1200]
 * @returns {Promise<{ safe: boolean, reason?: string, otherBlockers?: Array }>}
 */
export async function coordinateClientsSafety(timeoutMs = 1200) {
  // First check local client
  if (!isUpdateSafe()) {
    return {
      safe: false,
      reason: "local_client_busy",
      blockers: getActiveBlockers(),
    };
  }

  const ch = getBroadcastChannel();
  if (!ch) {
    // If BroadcastChannel is unavailable, local safety is all we can verify
    return { safe: true };
  }

  const queryId = `query-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return new Promise((resolve) => {
    let resolved = false;
    let timer = null;
    const busyBlockers = [];

    function cleanup() {
      if (timer) clearTimeout(timer);
      if (ch) {
        ch.removeEventListener("message", onMessage);
      }
    }

    function onMessage(event) {
      const data = event.data;
      if (
        !data ||
        data.type !== "EMBEDDED_SUNSET_REPORT_SAFETY" ||
        data.queryId !== queryId ||
        data.tabId === localTabId
      ) {
        return;
      }

      if (!data.isSafe) {
        busyBlockers.push(...(data.blockers || []));
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            safe: false,
            reason: "other_client_busy",
            otherBlockers: busyBlockers,
          });
        }
      }
    }

    ch.addEventListener("message", onMessage);

    // Broadcast safety query to other tabs
    ch.postMessage({
      type: "EMBEDDED_SUNSET_QUERY_SAFETY",
      tabId: localTabId,
      queryId,
    });

    // Wait for other tabs to respond within timeoutMs
    timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({ safe: busyBlockers.length === 0 });
      }
    }, timeoutMs);
  });
}

/**
 * Notify other clients that an update is about to activate.
 */
export function broadcastPrepareUpdate() {
  const ch = getBroadcastChannel();
  if (ch) {
    ch.postMessage({
      type: "EMBEDDED_SUNSET_PREPARE_UPDATE",
      tabId: localTabId,
      timestamp: Date.now(),
    });
  }
}

// Initialize channel listener if running in browser
if (typeof window !== "undefined") {
  getBroadcastChannel();
}
