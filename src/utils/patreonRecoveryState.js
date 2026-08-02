const RESTARTABLE_REPLACEMENT_ERRORS = new Set([
  "replacement_expired",
  "replacement_state_changed",
  "membership_not_active",
]);

export function shouldShowLegacyPatreonMigration({
  passcodeVerified = false,
  patreonVerified = false,
} = {}) {
  return Boolean(passcodeVerified) && !patreonVerified;
}

export function shouldRestorePatreonSession(statusPayload = {}, canSign = false) {
  const hasResolvedPatreonState =
    statusPayload.authorized ||
    statusPayload.connected ||
    statusPayload.linked ||
    statusPayload.replacementRequired ||
    statusPayload.checkoutRequired;

  return !hasResolvedPatreonState && Boolean(canSign);
}

export async function resolvePatreonStatus({
  npub,
  getStatus,
  restoreStatus,
  canRestore = false,
}) {
  let payload = await getStatus(npub);
  if (shouldRestorePatreonSession(payload, canRestore)) {
    payload = await restoreStatus(npub);
  }
  return payload;
}

export function classifyPatreonReplacementResponse(responseOk, payload = {}) {
  if (responseOk && payload.authorized) return { kind: "success", error: "" };
  const error = String(payload.error || "replacement_failed");
  if (RESTARTABLE_REPLACEMENT_ERRORS.has(error)) {
    return { kind: "restart", error };
  }
  return { kind: "failure", error };
}

export function createPatreonRecheckGate({
  minimumIntervalMs = 1500,
  now = () => Date.now(),
} = {}) {
  let lastCheckAt = 0;
  return (visibilityState = "visible") => {
    const currentTime = now();
    if (
      visibilityState === "hidden" ||
      currentTime - lastCheckAt < minimumIntervalMs
    ) {
      return false;
    }
    lastCheckAt = currentTime;
    return true;
  };
}
