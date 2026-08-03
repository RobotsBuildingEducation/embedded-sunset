/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useToken } from "@chakra-ui/react";
import PatreonKeyReplacementGate from "./PatreonKeyReplacementGate.jsx";
import SubscriptionSettingsPanel from "./SubscriptionSettingsPanel.jsx";
import { cancelPatreonReplacement, disconnectPatreon, getPatreonStatus, replacePatreonLink, restorePatreonSession, startPatreonLink } from "../utils/patreonApi.js";
import { canSilentlySignPatreonProof } from "../utils/patreonNostrProof.js";
import { classifyPatreonReplacementResponse, createPatreonRecheckGate, resolvePatreonStatus } from "../utils/patreonRecoveryState.js";
import { SETTINGS_COPY, patreonCopyFor } from "./patreonSubscriptionCopy.js";
import {
  clearPendingPatreonModalReturn,
  rememberPatreonModalReturn,
} from "../utils/patreonOAuthReturn.js";
import { useThemeStore } from "../useThemeStore.jsx";

const checkoutUrl = import.meta.env.VITE_PATREON_CHECKOUT_URL || "https://subscribe.piyali.app/";

export default function PatreonSubscriptionSettingsModal({ isOpen, onClose, appLanguage = "en" }) {
  const npub = String(localStorage.getItem("local_npub") || "").trim();
  const themeColor = useThemeStore((state) => state.themeColor);
  const [accent300] = useToken("colors", [`${themeColor}.300`]);
  const copy = patreonCopyFor(SETTINGS_COPY, appLanguage);
  const [status, setStatus] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [actionError, setActionError] = useState("");
  const load = useCallback(async ({ preserveActionError = false } = {}) => {
    if (!npub) {
      setStatus({ authorized: false, linked: false, error: "patreon_unavailable" });
      setBusy(false);
      setResolved(true);
      return;
    }
    setBusy(true);
    setResolved(false);
    if (!preserveActionError) setActionError("");
    try {
      const payload = await resolvePatreonStatus({
        npub,
        getStatus: getPatreonStatus,
        restoreStatus: (activeNpub) =>
          restorePatreonSession(activeNpub, { allowExtension: false }),
        canRestore: canSilentlySignPatreonProof(),
      });
      setStatus(payload);
    }
    catch { setStatus((current) => ({ ...(current || {}), error: "patreon_unavailable" })); }
    finally { setBusy(false); setResolved(true); }
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
    rememberPatreonModalReturn();
    try {
      const result = await startPatreonLink(npub, "annual", { returnMode: "modal" });
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
    setBusy(true);
    setActionError("");
    try {
      const payload = await replacePatreonLink(npub);
      const result = classifyPatreonReplacementResponse(true, payload);
      if (result.kind !== "success") throw new Error(result.error);
      setStatus(payload);
    } catch (error) {
      const result = classifyPatreonReplacementResponse(false, error?.payload || { error: error?.message });
      if (result.kind === "restart") {
        await cancelPatreonReplacement().catch(() => {});
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
      await cancelPatreonReplacement();
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
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="appSurfaceElevated" color="appText" borderRadius="28px">
        <ModalHeader>{copy.tab}</ModalHeader><ModalCloseButton _focusVisible={{ boxShadow: `0 0 0 3px ${accent300}` }} />
        <ModalBody>
          {status?.replacementRequired ? (
            <PatreonKeyReplacementGate appLanguage={appLanguage} onConfirm={replace} onCancel={cancelReplacement} isChecking={busy} statusError={actionError} embedded />
          ) : (
            <SubscriptionSettingsPanel appLanguage={appLanguage} statusPayload={status || {}} statusError={actionError} isResolved={resolved} isBusy={busy} onReconnect={reconnect} onCheckout={() => window.location.assign(checkoutUrl)} onDisconnect={disconnect} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
