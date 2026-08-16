export const CREATOR_NPUB =
  "npub1anf7634v6rmwjzjnraf09kudr4nsmwy4ggre74sqgqaljd7c5susc8xpev";

export function isCreatorAccount(npub) {
  return String(npub || "").trim() === CREATOR_NPUB;
}

export function isPatreonAuthEnabled(env = {}) {
  return String(env?.VITE_PATREON_AUTH_ENABLED || "").toLowerCase() === "true";
}

export function resolveSubscriptionAccess({
  patreonEnabled = false,
  patreonAuthorized = false,
  legacyPasscodeVerified = false,
  creatorAuthorized = false,
} = {}) {
  const authorized =
    Boolean(creatorAuthorized) ||
    (patreonEnabled
      ? Boolean(patreonAuthorized)
      : Boolean(legacyPasscodeVerified));

  return {
    authorized,
    requiresPatreonMigration: Boolean(
      !creatorAuthorized &&
      patreonEnabled &&
      legacyPasscodeVerified &&
      !patreonAuthorized,
    ),
  };
}

export const PATREON_AUTH_ENABLED = isPatreonAuthEnabled(import.meta.env || {});
