/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
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
  resolvePatreonStatus,
  shouldShowLegacyPatreonMigration,
} from "../utils/patreonRecoveryState.js";

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
  const patreonResult = useMemo(() => new URLSearchParams(window.location.search).get("patreon") || "", []);
  const patreonPlan = useMemo(() => {
    const requested = new URLSearchParams(window.location.search).get("plan");
    return ["annual", "monthly"].includes(requested) ? requested : "annual";
  }, []);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [status, setStatus] = useState({ authorized: false, linked: false, subscription: null });
  const awaiting = patreonResult === "awaiting_subscription" || Boolean(status.checkoutRequired);
  const showLegacyMigration = shouldShowLegacyPatreonMigration({
    passcodeVerified: legacyPasscodeVerified,
    patreonVerified: verified,
  });

  const checkSubscription = useCallback(async () => {
    if (!npub) {
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
      });
      setStatus(payload);
      setAvailable(payload.configured !== false);
      setVerified(Boolean(payload.authorized));
    } catch (error) {
      console.warn("Unable to check Patreon subscription", error);
      setAvailable(false);
      setVerified(false);
      setStatusError("unavailable");
      setStatus((current) => ({ ...current, authorized: false, error: "patreon_unavailable" }));
    } finally {
      setChecking(false);
    }
  }, [npub]);

  useEffect(() => { void checkSubscription(); }, [checkSubscription]);

  useEffect(() => {
    if (!verified) return;
    onAuthorized?.();
    const step = Number(currentStep);
    navigate(`/q/${Number.isFinite(step) && step > 9 ? step : 10}`, { replace: true });
  }, [currentStep, navigate, onAuthorized, verified]);

  useEffect(() => {
    if (patreonResult !== "checkout_required") return;
    const waitingUrl = new URL(window.location.href);
    waitingUrl.searchParams.set("patreon", "awaiting_subscription");
    waitingUrl.searchParams.set("plan", patreonPlan);
    window.history.replaceState(null, "", waitingUrl.toString());
    window.location.assign(checkoutUrl);
  }, [patreonPlan, patreonResult]);

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
    try {
      const result = await startPatreonLink(npub, plan);
      if (result?.authorizeUrl) window.location.assign(result.authorizeUrl);
    } catch (error) {
      console.warn("Unable to link Patreon", error);
      setStatusError("unavailable");
      setChecking(false);
    }
  };

  const replace = async () => {
    setChecking(true);
    setStatusError("");
    try {
      const payload = await replacePatreonLink(npub);
      const result = classifyPatreonReplacementResponse(true, payload);
      if (result.kind !== "success") throw new Error(result.error);
      setStatus(payload);
      setVerified(true);
    } catch (error) {
      const result = classifyPatreonReplacementResponse(false, error?.payload || { error: error?.message });
      if (result.kind === "restart") {
        await cancelPatreonReplacement().catch(() => {});
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
    try { await cancelPatreonReplacement(); }
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
