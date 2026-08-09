import { nip19 } from "nostr-tools";

export function isNsecSecretKey(value) {
  const candidate = String(value || "").trim();

  if (!candidate.toLowerCase().startsWith("nsec1")) {
    return false;
  }

  try {
    const decoded = nip19.decode(candidate);
    return decoded.type === "nsec" && decoded.data?.length === 32;
  } catch {
    return false;
  }
}
