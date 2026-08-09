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
  preferRestore = false,
  isCurrent = () => true,
}) {
  let payload = await getStatus(npub);
  if (!isCurrent()) return null;
  if (
    Boolean(preferRestore && canRestore) ||
    shouldRestorePatreonSession(payload, canRestore)
  ) {
    payload = await restoreStatus(npub);
    if (!isCurrent()) return null;
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

export async function replaceAndResolvePatreonStatus({
  npub,
  replaceLink,
  getStatus,
  restoreStatus,
  canRestore = false,
}) {
  let replacementError;
  try {
    const payload = await replaceLink(npub);
    if (payload?.authorized) return payload;
    replacementError = Object.assign(
      new Error(payload?.error || "replacement_failed"),
      { payload },
    );
  } catch (error) {
    replacementError = error;
  }

  // The replacement transaction may commit even if a mobile browser loses or
  // cannot parse its success response. Reconcile from the key-bound source of
  // truth before treating the action as failed or cancelling its recovery.
  try {
    const reconciled = await resolvePatreonStatus({
      npub,
      getStatus,
      restoreStatus,
      canRestore,
      preferRestore: true,
    });
    if (reconciled?.authorized) return reconciled;
  } catch {
    // Preserve the original replacement error for the UI below.
  }

  throw replacementError;
}

export function shouldShowPatreonReplacement({
  statusPayload,
  returnResult = "",
  isResolved = false,
} = {}) {
  if (statusPayload?.authorized) return false;
  if (statusPayload?.replacementRequired) return true;

  // A typed OAuth result is only an initial navigation hint. Once live status
  // resolves, it must not pin the drawer to the replacement screen after a
  // successful replacement or cancellation.
  return !isResolved && returnResult === "replace_required";
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
