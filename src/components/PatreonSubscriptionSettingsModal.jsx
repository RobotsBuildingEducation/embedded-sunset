/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useToken } from "@chakra-ui/react";
import PatreonKeyReplacementGate from "./PatreonKeyReplacementGate.jsx";
import SubscriptionSettingsPanel from "./SubscriptionSettingsPanel.jsx";
import { cancelPatreonReplacement, disconnectPatreon, getPatreonStatus, replacePatreonLink, restorePatreonSession, startPatreonLink } from "../utils/patreonApi.js";
import { canSilentlySignPatreonProof } from "../utils/patreonNostrProof.js";
import { classifyPatreonReplacementResponse, createPatreonRecheckGate, replaceAndResolvePatreonStatus, resolvePatreonStatus, shouldShowPatreonReplacement } from "../utils/patreonRecoveryState.js";
import { SETTINGS_COPY, patreonCopyFor } from "./patreonSubscriptionCopy.js";
import {
  clearPendingPatreonModalReturn,
  rememberPatreonModalReturn,
} from "../utils/patreonOAuthReturn.js";
import { useThemeStore } from "../useThemeStore.jsx";

const checkoutUrl = import.meta.env.VITE_PATREON_CHECKOUT_URL || "https://subscribe.piyali.app/";

export default function PatreonSubscriptionSettingsModal({
  isOpen,
  onClose,
  appLanguage = "en",
  onAuthorized,
  returnResult = "",
}) {
  const npub = String(localStorage.getItem("local_npub") || "").trim();
  const themeColor = useThemeStore((state) => state.themeColor);
  const [accent300] = useToken("colors", [`${themeColor}.300`]);
  const copy = patreonCopyFor(SETTINGS_COPY, appLanguage);
  const [status, setStatus] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [actionError, setActionError] = useState("");
  const loadGenerationRef = useRef(0);
  const load = useCallback(async ({ preserveActionError = false } = {}) => {
    const generation = ++loadGenerationRef.current;
    const isCurrent = () => loadGenerationRef.current === generation;
    if (!npub) {
      if (!isCurrent()) return;
      setStatus({ authorized: false, linked: false, error: "patreon_unavailable" });
      setBusy(false);
      setResolved(true);
      return;
    }
    setBusy(true);
    setResolved(false);
    if (!preserveActionError) setActionError("");
    try {
      let payload = await resolvePatreonStatus({
        npub,
        getStatus: getPatreonStatus,
        restoreStatus: (activeNpub) =>
          restorePatreonSession(activeNpub, { allowExtension: false }),
        canRestore: canSilentlySignPatreonProof(),
        preferRestore: [
          "checkout_required",
          "connected",
          "replace_required",
        ].includes(returnResult),
        isCurrent,
      });
      if (!isCurrent() || !payload) return;
      if (
        returnResult === "checkout_required" &&
        !payload.authorized &&
        !payload.replacementRequired &&
        !payload.checkoutRequired
      ) {
        payload = {
          ...payload,
          connected: true,
          checkoutRequired: true,
          selectedPlan: "annual",
        };
      }
      setStatus(payload);
      if (payload.authorized) onAuthorized?.();
    }
    catch {
      if (isCurrent()) {
        setStatus((current) => ({ ...(current || {}), error: "patreon_unavailable" }));
      }
    }
    finally {
      if (isCurrent()) {
        setBusy(false);
        setResolved(true);
      }
    }
  }, [npub, onAuthorized, returnResult]);
  useEffect(() => {
    loadGenerationRef.current += 1;
    setStatus(null);
    setResolved(false);
  }, [npub]);
  useEffect(() => { if (isOpen) void load(); }, [isOpen, load]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const shouldRecheck = createPatreonRecheckGate();
    const recheck = () => {
      if (shouldRecheck(document.visibilityState)) void load();
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [isOpen, load]);
  const reconnect = async () => {
    setBusy(true);
    setActionError("");
    rememberPatreonModalReturn({ npub });
    try {
      const result = await startPatreonLink(npub, "annual", {
        returnMode: "modal",
        language: appLanguage === "es" ? "es" : "en",
      });
      if (!result?.authorizeUrl) throw new Error("missing_authorize_url");
      window.location.assign(result.authorizeUrl);
    } catch {
      clearPendingPatreonModalReturn();
      setStatus((current) => ({ ...current, error: "patreon_unavailable" }));
      setActionError("unavailable");
      setBusy(false);
    }
  };
  const replace = async () => {
    // A focus/visibility status request may still be in flight after the
    // mobile OAuth handoff. It must not overwrite the replacement response.
    loadGenerationRef.current += 1;
    setBusy(true);
    setActionError("");
    try {
      const payload = await replaceAndResolvePatreonStatus({
        npub,
        replaceLink: replacePatreonLink,
        getStatus: getPatreonStatus,
        restoreStatus: (activeNpub) =>
          restorePatreonSession(activeNpub, { allowExtension: false }),
        canRestore: canSilentlySignPatreonProof(),
      });
      const result = classifyPatreonReplacementResponse(true, payload);
      if (result.kind !== "success") throw new Error(result.error);
      setStatus(payload);
      setResolved(true);
      onAuthorized?.();
      onClose?.();
    } catch (error) {
      const result = classifyPatreonReplacementResponse(false, error?.payload || { error: error?.message });
      if (result.kind === "restart") {
        await cancelPatreonReplacement(npub).catch(() => {});
        setStatus({ authorized: false, linked: false, subscription: null });
      } else {
        setActionError(error?.status === 403 ? "membership_not_active" : "unavailable");
      }
    } finally {
      setBusy(false);
    }
  };
  const cancelReplacement = async () => {
    setBusy(true);
    try {
      await cancelPatreonReplacement(npub);
      setStatus({ authorized: false, linked: false, subscription: null });
    } finally {
      setBusy(false);
    }
  };
  const disconnect = async () => {
    setBusy(true);
    try { await disconnectPatreon(npub); window.location.assign("/subscription"); }
    finally { setBusy(false); }
  };
  const showReplacement = shouldShowPatreonReplacement({
    statusPayload: status,
    returnResult,
    isResolved: resolved,
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="appSurfaceElevated" color="appText" borderRadius="28px">
        <ModalHeader>{copy.tab}</ModalHeader><ModalCloseButton _focusVisible={{ boxShadow: `0 0 0 3px ${accent300}` }} />
        <ModalBody>
          {showReplacement ? (
            <PatreonKeyReplacementGate appLanguage={appLanguage} onConfirm={replace} onCancel={cancelReplacement} isChecking={busy} statusError={actionError} embedded />
          ) : (
            <SubscriptionSettingsPanel appLanguage={appLanguage} statusPayload={status || {}} statusError={actionError} isResolved={resolved} isBusy={busy} onReconnect={reconnect} onCheckout={() => window.location.assign(checkoutUrl)} onDisconnect={disconnect} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
