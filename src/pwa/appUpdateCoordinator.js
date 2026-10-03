/* global __APP_BUILD_ID__, __APP_BUILT_AT__ */

/**
 * src/pwa/appUpdateCoordinator.js
 *
 * Singleton coordinator managing the PWA update lifecycle:
 * - Version metadata checks (/version.json)
 * - Service worker lifecycle via workbox-window
 * - Return-to-foreground and network revalidation
 * - Controlled activation with safety protection
 * - Reload verification and infinite-reload guards
 */

import * as workboxModule from "workbox-window";

const Workbox =
  workboxModule.Workbox ||
  Reflect.get(workboxModule, "default")?.Workbox ||
  Reflect.get(workboxModule, "default");
import {
  isUpdateSafe,
  requestSafetySettlement,
  coordinateClientsSafety,
  subscribeSafety,
} from "./updateSafety.js";

const COALESCE_INTERVAL_MS = 30 * 1000; // 30 seconds
const PERIODIC_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes while visible
const DEFERRAL_DURATION_MS = 30 * 60 * 1000; // 30 minutes deferral when user presses Later
const METADATA_FETCH_TIMEOUT_MS = 10 * 1000; // 10 seconds
const ACTIVATION_TIMEOUT_MS = 10 * 1000; // 10 seconds
const MAX_AUTO_RELOAD_ATTEMPTS = 2;
const DEV_SW_CLEANUP_KEY = "embedded_sunset_dev_sw_cleanup_reload";

export const STORAGE_KEYS = {
  RELOAD_TARGET: "embedded_sunset_update_reload_target",
  ATTEMPT_COUNT: "embedded_sunset_update_reload_attempts",
  DEFERRED_BUILD: "embedded_sunset_update_deferred_build",
  DEFERRED_AT: "embedded_sunset_update_deferred_at",
};

// Check if running in browser
const isBrowser = typeof window !== "undefined";

// Running build ID embedded by Vite build plugin (fallback to development)
const RUNNING_BUILD_ID =
  (typeof __APP_BUILD_ID__ !== "undefined" && __APP_BUILD_ID__) ||
  (isBrowser && window.__EMBEDDED_SUNSET_BUILD_ID__) ||
  "development";

const RUNNING_BUILT_AT =
  (typeof __APP_BUILT_AT__ !== "undefined" && __APP_BUILT_AT__) ||
  (isBrowser && window.__EMBEDDED_SUNSET_BUILT_AT__) ||
  null;

export class AppUpdateCoordinator {
  constructor(options = {}) {
    this.fetchFn = options.fetch || (isBrowser ? window.fetch.bind(window) : null);
    this.storage = options.storage || (isBrowser ? window.sessionStorage : null);
    this.location = options.location || (isBrowser ? window.location : null);
    this.navigator = options.navigator || (isBrowser ? window.navigator : null);
    this.document = options.document || (isBrowser ? window.document : null);

    this.runningBuildId = options.runningBuildId || RUNNING_BUILD_ID;
    this.runningBuiltAt = options.runningBuiltAt || RUNNING_BUILT_AT;

    this.state = {
      runningBuildId: this.runningBuildId,
      runningBuiltAt: this.runningBuiltAt,
      advertisedBuildId: null,
      targetBuildId: null,
      discoveryStatus: "idle", // 'idle' | 'checking' | 'different_detected' | 'check_failed'
      workerStatus: "unregistered", // 'unregistered' | 'installing' | 'waiting' | 'activating' | 'activated' | 'failed'
      uiState: "idle", // 'idle' | 'ready' | 'deferred' | 'applying' | 'error'
      isModalOpen: false,
      isUpdateReady: false,
      errorMessage: null,
      lastCheckTime: 0,
      retryCount: 0,
      isProtected: false,
      hasUserInteracted: false,
    };

    this.subscribers = new Set();
    this.inFlightCheck = null;
    this.periodicTimer = null;
    this.activationTimer = null;
    this.wb = null;
    this.registration = null;
    this.initialized = false;
    this.isApplying = false;
    this.reloadRequested = false;
    this.hadExistingController = Boolean(this.navigator?.serviceWorker?.controller);

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageShow = this.handlePageShow.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleUserInteraction = this.handleUserInteraction.bind(this);
  }

  handleUserInteraction() {
    this.setState({ hasUserInteracted: true });
  }

  getState() {
    return { ...this.state };
  }

  subscribe(callback) {
    if (typeof callback !== "function") return () => {};
    this.subscribers.add(callback);
    try {
      callback(this.getState());
    } catch (err) {
      console.error("Error in coordinator subscriber:", err);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    const currentState = this.getState();
    for (const callback of this.subscribers) {
      try {
        callback(currentState);
      } catch (err) {
        console.error("Error in coordinator subscriber:", err);
      }
    }
  }

  /**
   * Initialize the coordinator. Idempotent.
   */
  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Verify previous reload attempt
    this.verifyReloadResult();

    // Listen to safety changes
    subscribeSafety(({ safe }) => {
      this.setState({ isProtected: !safe });
      // If we became safe and an update is ready and not deferred, ready the banner
      if (safe && this.state.isUpdateReady && !this.isDeferred() && this.state.uiState !== "ready") {
        this.setState({ uiState: "ready" });
      }
    });

    if (!isBrowser) return;

    // Local development uses Vite's module graph and must never be controlled
    // by a production PWA worker. Unregister a worker left behind on this
    // origin by an earlier run, then reload once so the current document also
    // leaves the worker's control. This prevents stale precached HTML from
    // requesting hashed production chunks that no longer exist.
    if (import.meta.env.DEV) {
      await this.clearDevelopmentServiceWorkers();
    }

    // Track user interaction to distinguish cold starts from active usage
    const interactionEvents = ["pointerdown", "keydown", "touchstart"];
    const onFirstInteraction = () => {
      this.setState({ hasUserInteracted: true });
      for (const ev of interactionEvents) {
        window.removeEventListener(ev, onFirstInteraction, { capture: true });
      }
    };
    for (const ev of interactionEvents) {
      window.addEventListener(ev, onFirstInteraction, { capture: true, passive: true });
    }

    // Attach foreground & lifecycle listeners
    if (this.document) {
      this.document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", this.handlePageShow);
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("focus", this.handleFocus);
    }

    // The PWA plugin disables its worker in dev; keep the app-owned
    // registration in sync with that policy.
    if (!import.meta.env.DEV) {
      await this.initServiceWorker();
    }

    // Perform initial check
    this.checkForUpdate({ reason: "startup" }).catch(() => {});

    // Start periodic check if visible
    if (this.document?.visibilityState === "visible") {
      this.startPeriodicCheck();
    }
  }

  async clearDevelopmentServiceWorkers() {
    if (!this.navigator || !("serviceWorker" in this.navigator)) return;

    try {
      const registrations = await this.navigator.serviceWorker.getRegistrations();
      const appScope = new URL("/", this.location.href).href;
      await Promise.all(
        registrations
          .filter((registration) => registration.scope === appScope)
          .map((registration) => registration.unregister()),
      );

      if (this.navigator.serviceWorker.controller) {
        const alreadyReloaded = this.storage?.getItem(DEV_SW_CLEANUP_KEY) === "1";
        if (!alreadyReloaded) {
          this.storage?.setItem(DEV_SW_CLEANUP_KEY, "1");
          this.location?.reload();
        }
      } else {
        this.storage?.removeItem(DEV_SW_CLEANUP_KEY);
      }
    } catch (error) {
      console.warn("[PWA Update] Could not clear the development service worker:", error);
    }
  }

  /**
   * Check if a previous reload attempt was recorded and verify the result.
   */
  verifyReloadResult() {
    if (!this.storage) return;

    try {
      const pendingTarget = this.storage.getItem(STORAGE_KEYS.RELOAD_TARGET);
      const attemptsStr = this.storage.getItem(STORAGE_KEYS.ATTEMPT_COUNT);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

      if (pendingTarget) {
        if (this.runningBuildId === pendingTarget) {
          // Success: The newly booted build matches the target!
          this.storage.removeItem(STORAGE_KEYS.RELOAD_TARGET);
          this.storage.removeItem(STORAGE_KEYS.ATTEMPT_COUNT);
          this.storage.removeItem(STORAGE_KEYS.DEFERRED_BUILD);
          console.info(`[PWA Update] Verified update to build ${this.runningBuildId}`);
        } else {
          // Mismatch: Still running old build after reload attempt
          console.warn(
            `[PWA Update] Reload verification failed. Expected build ${pendingTarget}, but booted into ${this.runningBuildId}. Attempt: ${attempts}`,
          );
          if (attempts >= MAX_AUTO_RELOAD_ATTEMPTS) {
            // Guard against infinite reload loops: show recoverable failure
            this.storage.removeItem(STORAGE_KEYS.RELOAD_TARGET);
            this.setState({
              uiState: "error",
              isModalOpen: false,
              errorMessage:
                "We couldn't finish the update. Try again when your connection is ready.",
            });
          }
        }
      }
    } catch (e) {
      console.warn("[PWA Update] Could not access sessionStorage:", e);
    }
  }

  /**
   * Set up workbox-window and service worker listeners.
   */
  async initServiceWorker() {
    if (!this.navigator || !("serviceWorker" in this.navigator)) {
      return;
    }

    try {
      this.wb = new Workbox("/sw.js", { scope: "/" });

      this.wb.addEventListener("waiting", () => {
        console.info("[PWA Update] Service worker is waiting.");
        this.handleWorkerWaiting();
      });

      this.wb.addEventListener("controlling", () => {
        console.info("[PWA Update] Service worker took control.");
        // Only trigger reload if this tab initiated activation or update was ready
        if (this.isApplying) {
          this.executeReload();
        }
      });

      this.wb.addEventListener("installing", () => {
        this.setState({ workerStatus: "installing" });
      });

      this.wb.addEventListener("activated", (event) => {
        this.setState({ workerStatus: "activated" });
        if (!event.isUpdate) {
          this.hadExistingController = true;
        }
      });

      this.registration = await this.wb.register();

      // Crucial: inspect existing registration.waiting on startup
      if (this.registration?.waiting) {
        console.info("[PWA Update] Detected already-waiting worker on startup.");
        this.handleWorkerWaiting({ sw: this.registration.waiting });
      } else if (this.registration?.installing) {
        this.setState({ workerStatus: "installing" });
      }
    } catch (err) {
      console.warn("[PWA Update] Service worker registration failed:", err);
      this.setState({ workerStatus: "failed" });
    }
  }

  handleWorkerWaiting() {
    this.setState({
      workerStatus: "waiting",
      isUpdateReady: true,
      targetBuildId: this.state.advertisedBuildId || "updated-build",
    });

    // Check if user previously deferred this build during current session
    if (this.isDeferred()) {
      this.setState({ uiState: "deferred", isModalOpen: false });
      return;
    }

    // Safe automatic application check:
    // Cold start / idle return, no user interaction, no protected work
    const isSafe = isUpdateSafe();
    if (!this.state.hasUserInteracted && isSafe && this.state.discoveryStatus === "idle" && this.state.uiState !== "error") {
      console.info("[PWA Update] Applying waiting update automatically on idle start.");
      this.applyUpdate({ automatic: true }).catch(() => {});
      return;
    }

    // Ready UI: purely top navigation banner, no modal
    this.setState({
      uiState: "ready",
      isModalOpen: false,
    });
  }

  clearDeferral() {
    if (this.storage) {
      try {
        this.storage.removeItem(STORAGE_KEYS.DEFERRED_BUILD);
        this.storage.removeItem(STORAGE_KEYS.DEFERRED_AT);
      } catch (e) {
        console.warn("[PWA Update] Could not clear deferral:", e);
      }
    }
    if (this.state.uiState === "deferred") {
      this.setState({ uiState: "ready" });
    }
  }

  isDeferred() {
    if (!this.storage) return false;
    try {
      const deferredBuild = this.storage.getItem(STORAGE_KEYS.DEFERRED_BUILD);
      const target = this.state.targetBuildId || this.state.advertisedBuildId;
      if (!deferredBuild || !target || deferredBuild !== target) {
        return false;
      }
      const deferredAtStr = this.storage.getItem(STORAGE_KEYS.DEFERRED_AT);
      if (!deferredAtStr) return false;
      const deferredAt = parseInt(deferredAtStr, 10);
      const now = Date.now();
      if (now - deferredAt >= DEFERRAL_DURATION_MS) {
        // 30 minutes expired: clear deferral and restore ready
        this.clearDeferral();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  handleVisibilityChange() {
    if (!this.document) return;
    if (this.document.visibilityState === "visible") {
      this.startPeriodicCheck();
      // Option B: Gentle reminder on return — clear deferral so top banner reappears
      if (this.state.uiState === "deferred") {
        this.clearDeferral();
      }
      // Reconcile waiting worker if one installed while page was in background
      if (this.registration?.waiting && !this.state.isUpdateReady) {
        this.handleWorkerWaiting({ sw: this.registration.waiting });
      }
      this.checkForUpdate({ reason: "visibilitychange" }).catch(() => {});
    } else {
      this.stopPeriodicCheck();
    }
  }

  handlePageShow() {
    // Option B: Gentle reminder on return — clear deferral so top banner reappears
    if (this.state.uiState === "deferred") {
      this.clearDeferral();
    }
    if (this.registration?.waiting && !this.state.isUpdateReady) {
      this.handleWorkerWaiting({ sw: this.registration.waiting });
    }
    this.checkForUpdate({ reason: "pageshow" }).catch(() => {});
  }

  handleOnline() {
    // Reconnect allows fresh attempt and resets retry backoff
    this.setState({ retryCount: 0 });
    this.checkForUpdate({ reason: "online", force: true }).catch(() => {});
  }

  handleFocus() {
    this.checkForUpdate({ reason: "focus" }).catch(() => {});
  }

  startPeriodicCheck() {
    this.stopPeriodicCheck();
    this.periodicTimer = setInterval(() => {
      if (this.document?.visibilityState === "visible") {
        // If 30-minute deferral has expired while staying in app, clear deferral
        if (this.state.uiState === "deferred" && !this.isDeferred()) {
          this.clearDeferral();
        }
        this.checkForUpdate({ reason: "periodic" }).catch(() => {});
      }
    }, PERIODIC_CHECK_INTERVAL_MS);
    if (this.periodicTimer?.unref) {
      this.periodicTimer.unref();
    }
  }

  stopPeriodicCheck() {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }
  }

  /**
   * Check for an app update by fetching /version.json and requesting registration.update().
   * @param {Object} [options]
   * @param {boolean} [options.force=false]
   * @param {string} [options.reason='manual']
   * @returns {Promise<boolean>} Resolves to true if new deployment detected.
   */
  async checkForUpdate({ force = false, reason = "manual" } = {}) {
    const now = Date.now();

    // Coalesce foreground checks within 30 seconds unless forced (user retry)
    if (!force && now - this.state.lastCheckTime < COALESCE_INTERVAL_MS) {
      return Boolean(this.state.advertisedBuildId && this.state.advertisedBuildId !== this.runningBuildId);
    }

    // Return in-flight check if one is currently active
    if (this.inFlightCheck) {
      return this.inFlightCheck;
    }

    this.inFlightCheck = this._runCheck(now, reason);
    try {
      return await this.inFlightCheck;
    } finally {
      this.inFlightCheck = null;
    }
  }

  async _runCheck(now, reason) {
    console.info(`[PWA Update] Running check (trigger: ${reason})`);
    this.setState({
      discoveryStatus: "checking",
      lastCheckTime: now,
    });

    let newDeploymentFound = false;

    try {
      if (this.fetchFn) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), METADATA_FETCH_TIMEOUT_MS);

        try {
          const response = await this.fetchFn("/version.json", {
            cache: "no-store",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const contentType = response.headers.get("content-type") || "";
            // Validate content type is JSON to prevent HTML fallback interpretation
            if (contentType.includes("application/json")) {
              const data = await response.json();
              if (data && typeof data.buildId === "string") {
                this.setState({ advertisedBuildId: data.buildId });

                if (data.buildId !== this.runningBuildId) {
                  newDeploymentFound = true;
                  this.setState({
                    discoveryStatus: "different_detected",
                    targetBuildId: data.buildId,
                  });
                  // Trigger service worker update check so browser downloads the new worker
                  if (this.registration) {
                    this.registration.update().catch((e) => {
                      console.warn("[PWA Update] registration.update failed:", e);
                    });
                  }
                } else {
                  this.setState({ discoveryStatus: "idle" });
                }
              } else {
                console.warn("[PWA Update] Invalid version.json schema:", data);
                this.setState({ discoveryStatus: "check_failed" });
              }
            } else {
              // Received HTML fallback or unexpected type
              if (this.runningBuildId !== "development") {
                console.warn("[PWA Update] /version.json did not return application/json");
              }
              this.setState({ discoveryStatus: this.runningBuildId === "development" ? "idle" : "check_failed" });
            }
          } else {
            if (this.runningBuildId !== "development") {
              console.warn(`[PWA Update] /version.json returned status ${response.status}`);
            }
            this.setState({ discoveryStatus: this.runningBuildId === "development" ? "idle" : "check_failed" });
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          if (this.runningBuildId !== "development") {
            console.warn("[PWA Update] Fetching /version.json failed:", fetchErr);
          }
          this.setState({ discoveryStatus: this.runningBuildId === "development" ? "idle" : "check_failed" });
        }
      }

      // Also invoke registration.update() directly if SW is active
      if (this.registration) {
        this.registration.update().catch((e) => {
          console.warn("[PWA Update] SW update check failed:", e);
        });
      }

      return newDeploymentFound;
    } catch (err) {
      console.warn("[PWA Update] Error during check:", err);
      this.setState({ discoveryStatus: "check_failed" });
      return false;
    }
  }

  /**
   * Apply the update: verify safety, coordinate clients, trigger SKIP_WAITING, and reload.
   */
  async applyUpdate({ automatic = false } = {}) {
    if (this.isApplying) return;
    if (automatic) {
      console.info("[PWA Update] Executing automatic update application.");
    }

    // 1. Confirm local safety
    if (!isUpdateSafe()) {
      // Attempt to settle persistable drafts
      const settled = await requestSafetySettlement();
      if (!settled) {
        console.warn("[PWA Update] Cannot apply update: local client is busy with protected work.");
        this.setState({
          errorMessage: "Please finish or save your current activity before updating.",
        });
        return false;
      }
    }

    // 2. Coordinate with other clients sharing the registration
    const coordination = await coordinateClientsSafety();
    if (!coordination.safe) {
      console.warn("[PWA Update] Cannot apply update: another open tab is performing protected work.");
      this.setState({
        errorMessage: "Robots Building Education is active in another tab. Finish or save work there before updating.",
      });
      return false;
    }

    this.isApplying = true;
    this.setState({
      uiState: "applying",
      errorMessage: null,
    });

    // 3. Record target and attempt count before activation
    const target = this.state.targetBuildId || this.state.advertisedBuildId || "unknown";
    if (this.storage) {
      try {
        const attemptsStr = this.storage.getItem(STORAGE_KEYS.ATTEMPT_COUNT);
        const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
        this.storage.setItem(STORAGE_KEYS.RELOAD_TARGET, target);
        this.storage.setItem(STORAGE_KEYS.ATTEMPT_COUNT, String(attempts + 1));
      } catch (e) {
        console.warn("[PWA Update] Could not write attempt to sessionStorage:", e);
      }
    }

    // 4. Send SKIP_WAITING to waiting worker
    if (this.registration?.waiting) {
      // Set activation timeout guard: if controlling doesn't fire, recover without speculative reload
      this.activationTimer = setTimeout(() => {
        this.isApplying = false;
        this.setState({
          uiState: "error",
          errorMessage: "We couldn't finish the update. Try again when your connection is ready.",
        });
        console.warn("[PWA Update] Worker activation timed out.");
      }, ACTIVATION_TIMEOUT_MS);

      try {
        this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      } catch (err) {
        console.error("[PWA Update] Failed to postMessage SKIP_WAITING:", err);
      }
      return true;
    }

    // Fallback for browsers without waiting service worker (e.g. SW disabled or fallback reload)
    this.executeReload();
    return true;
  }

  executeReload() {
    if (this.reloadRequested) return;
    this.reloadRequested = true;
    if (this.activationTimer) {
      clearTimeout(this.activationTimer);
      this.activationTimer = null;
    }

    if (this.location?.reload) {
      console.info("[PWA Update] Reloading to apply target deployment.");
      this.location.reload();
    }
  }

  /**
   * User pressed "Later": dismiss modal and suppress automatic reopening for this build this session.
   */
  dismissUpdate() {
    const target = this.state.targetBuildId || this.state.advertisedBuildId;
    const now = Date.now();
    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEYS.DEFERRED_BUILD, target || "current");
        this.storage.setItem(STORAGE_KEYS.DEFERRED_AT, String(now));
      } catch (e) {
        console.warn("[PWA Update] Could not record deferred build:", e);
      }
    }

    this.setState({
      uiState: "deferred",
      isModalOpen: false,
      errorMessage: null,
    });
  }

  /**
   * User pressed "Try again" after recoverable failure.
   */
  async retryUpdate() {
    this.setState({
      uiState: "ready",
      errorMessage: null,
      retryCount: this.state.retryCount + 1,
    });
    return this.applyUpdate({ automatic: false });
  }

  openModal() {
    // Modal removed in favor of top navigation banner
  }

  closeModal() {
    this.dismissUpdate();
  }

  destroy() {
    this.stopPeriodicCheck();
    if (this.activationTimer) {
      clearTimeout(this.activationTimer);
      this.activationTimer = null;
    }
    if (this.document?.removeEventListener) {
      this.document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("pageshow", this.handlePageShow);
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("focus", this.handleFocus);
    }
    this.subscribers.clear();
    this.initialized = false;
  }
}

// Singleton instance
export const appUpdateCoordinator = new AppUpdateCoordinator();

export function initAppUpdateCoordinator() {
  return appUpdateCoordinator.init();
}
