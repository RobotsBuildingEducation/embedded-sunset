export function isPatreonAuthEnabled(env = {}) {
  return String(env?.VITE_PATREON_AUTH_ENABLED || "").toLowerCase() === "true";
}

export function resolveSubscriptionAccess({
  patreonEnabled = false,
  patreonAuthorized = false,
  legacyPasscodeVerified = false,
} = {}) {
  const authorized = patreonEnabled
    ? Boolean(patreonAuthorized)
    : Boolean(legacyPasscodeVerified);

  return {
    authorized,
    requiresPatreonMigration: Boolean(
      patreonEnabled && legacyPasscodeVerified && !patreonAuthorized,
    ),
  };
}

export const PATREON_AUTH_ENABLED = isPatreonAuthEnabled(import.meta.env || {});
