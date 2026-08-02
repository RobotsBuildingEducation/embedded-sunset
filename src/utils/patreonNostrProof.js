import { finalizeEvent, nip19 } from "nostr-tools";
import { fetchWithTimeout } from "./fetchWithTimeout.js";

const PATREON_CHALLENGE_ENDPOINT = "/api/patreon/link-challenge";

function storedNsec() {
  if (typeof window === "undefined") return "";
  return String(window.localStorage.getItem("local_nsec") || "").trim();
}

export function canSilentlySignPatreonProof() {
  return storedNsec().startsWith("nsec1");
}

async function signEventTemplate(eventTemplate, { allowExtension }) {
  const nsec = storedNsec();
  if (nsec.startsWith("nsec1")) {
    const decoded = nip19.decode(nsec);
    if (decoded.type !== "nsec") {
      throw new Error("Invalid Robots Building Education private key");
    }
    return finalizeEvent(eventTemplate, decoded.data);
  }

  if (
    allowExtension &&
    typeof window !== "undefined" &&
    typeof window.nostr?.signEvent === "function"
  ) {
    return window.nostr.signEvent(eventTemplate);
  }

  throw new Error("No Robots Building Education signer is available");
}

export async function createPatreonNostrProof({
  npub,
  action,
  allowExtension = true,
}) {
  let response;
  try {
    response = await fetchWithTimeout(PATREON_CHALLENGE_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ npub, action }),
    });
  } catch (error) {
    if (import.meta.env.DEV && error?.name !== "AbortError") {
      throw new Error(
        "The local Patreon backend is not running. Restart this app with npm run dev.",
        { cause: error },
      );
    }
    throw error;
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallbackMessage = import.meta.env.DEV && response.status >= 500
      ? "The local Patreon backend is not running or is not configured. Restart with npm run dev and check functions/.env.local and functions/.secret.local."
      : `Unable to create Patreon link proof (${response.status})`;
    throw new Error(payload.error || fallbackMessage);
  }
  if (!payload.challengeId || !payload.eventTemplate) {
    throw new Error("The Patreon backend returned an invalid link challenge");
  }

  const signedEvent = await signEventTemplate(payload.eventTemplate, {
    allowExtension,
  });
  return { challengeId: payload.challengeId, signedEvent };
}
