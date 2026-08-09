/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PatreonKeyReplacementGate from "./PatreonKeyReplacementGate.jsx";
import SubscriptionGate from "./SubscriptionGate.jsx";
import {
  cancelPatreonReplacement,
  getPatreonStatus,
  replacePatreonLink,
  restorePatreonSession,
  startPatreonLink,
} from "../utils/patreonApi.js";
import { canSilentlySignPatreonProof } from "../utils/patreonNostrProof.js";
import {
  classifyPatreonReplacementResponse,
  createPatreonRecheckGate,
  replaceAndResolvePatreonStatus,
  resolvePatreonStatus,
  shouldShowLegacyPatreonMigration,
} from "../utils/patreonRecoveryState.js";
import {
  clearPendingPatreonModalReturn,
  rememberPatreonPageReturn,
} from "../utils/patreonOAuthReturn.js";

const checkoutUrl = import.meta.env.VITE_PATREON_CHECKOUT_URL || "https://subscribe.piyali.app/";

function normalizedStatusError(error) {
  const value = String(error?.payload?.error || error?.message || "");
  if (["replacement_expired", "replacement_state_changed", "membership_not_active"].includes(value)) return value;
  return "unavailable";
}

export default function PatreonAuthDevGate({
  legacyPasscodeVerified = false,
  userLanguage = "en",
  currentStep = 10,
  onAuthorized,
}) {
  const navigate = useNavigate();
  const npub = String(localStorage.getItem("local_npub") || "").trim();
  const patreonResult = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("patreon") || params.get("patreon_result") || "";
  }, []);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [status, setStatus] = useState({ authorized: false, linked: false, subscription: null });
  const checkGenerationRef = useRef(0);
  const awaiting =
    ["awaiting_subscription", "checkout_required"].includes(patreonResult) ||
    Boolean(status.checkoutRequired);
  const showLegacyMigration = shouldShowLegacyPatreonMigration({
    passcodeVerified: legacyPasscodeVerified,
    patreonVerified: verified,
  });

  const checkSubscription = useCallback(async () => {
    const generation = ++checkGenerationRef.current;
    const isCurrent = () => checkGenerationRef.current === generation;
    if (!npub) {
      if (!isCurrent()) return;
      setChecking(false);
      setAvailable(false);
      setStatusError("unavailable");
      return;
    }
    setChecking(true);
    setStatusError("");
    try {
      const payload = await resolvePatreonStatus({
        npub,
        getStatus: getPatreonStatus,
        restoreStatus: (activeNpub) =>
          restorePatreonSession(activeNpub, { allowExtension: false }),
        canRestore: canSilentlySignPatreonProof(),
        preferRestore: [
          "checkout_required",
          "connected",
          "replace_required",
        ].includes(patreonResult),
        isCurrent,
      });
      if (!isCurrent() || !payload) return;
      setStatus(payload);
      setAvailable(payload.configured !== false);
      setVerified(Boolean(payload.authorized));
    } catch (error) {
      if (!isCurrent()) return;
      console.warn("Unable to check Patreon subscription", error);
      setAvailable(false);
      setVerified(false);
      setStatusError("unavailable");
      setStatus((current) => ({ ...current, authorized: false, error: "patreon_unavailable" }));
    } finally {
      if (isCurrent()) setChecking(false);
    }
  }, [npub, patreonResult]);

  useEffect(() => {
    checkGenerationRef.current += 1;
    setVerified(false);
    setStatus({ authorized: false, linked: false, subscription: null });
  }, [npub]);

  useEffect(() => { void checkSubscription(); }, [checkSubscription]);

  useEffect(() => {
    if (!verified) return;
    onAuthorized?.();
    const step = Number(currentStep);
    navigate(`/q/${Number.isFinite(step) && step > 9 ? step : 10}`, { replace: true });
  }, [currentStep, navigate, onAuthorized, verified]);

  useEffect(() => {
    const shouldRecheck = createPatreonRecheckGate();
    const recheck = () => {
      if (shouldRecheck(document.visibilityState)) void checkSubscription();
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [checkSubscription]);

  const connect = async (plan = "annual") => {
    setChecking(true);
    setStatusError("");
    rememberPatreonPageReturn({ npub });
    try {
      const result = await startPatreonLink(npub, plan, {
        language: userLanguage === "es" ? "es" : "en",
      });
      if (result?.authorizeUrl) window.location.assign(result.authorizeUrl);
    } catch (error) {
      clearPendingPatreonModalReturn();
      console.warn("Unable to link Patreon", error);
      setStatusError("unavailable");
      setChecking(false);
    }
  };

  const replace = async () => {
    setChecking(true);
    setStatusError("");
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
      setVerified(true);
    } catch (error) {
      const result = classifyPatreonReplacementResponse(false, error?.payload || { error: error?.message });
      if (result.kind === "restart") {
        await cancelPatreonReplacement(npub).catch(() => {});
        setStatusError(result.error);
        navigate("/subscription", { replace: true });
      } else {
        setStatusError(normalizedStatusError(error));
      }
    } finally {
      setChecking(false);
    }
  };

  const cancelReplacement = async () => {
    setChecking(true);
    try { await cancelPatreonReplacement(npub); }
    catch (error) { console.warn("Unable to cancel Patreon replacement", error); }
    finally { setChecking(false); navigate("/subscription", { replace: true }); }
  };

  if (verified) return <Box minH="100dvh" bg="appBg" />;
  if (patreonResult === "replace_required" || status.replacementRequired) {
    return <PatreonKeyReplacementGate appLanguage={userLanguage} onConfirm={replace} onCancel={cancelReplacement} isChecking={checking} statusError={statusError} />;
  }
  return (
    <SubscriptionGate
      appLanguage={userLanguage}
      onPatreonConnect={connect}
      isPatreonChecking={checking}
      isPatreonAvailable={available}
      patreonResult={patreonResult}
      patreonStatusError={statusError}
      onPatreonCheckout={() => window.location.assign(checkoutUrl)}
      isPatreonAwaiting={awaiting}
      isLegacyPasscodeMigration={showLegacyMigration}
    />
  );
}
