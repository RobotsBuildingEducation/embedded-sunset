import { nip19 } from "nostr-tools";

/**
 * Returns a canonical ditto.pub URL for a Nostr badge address or naddr.
 * @param {string} address - An naddr1 string or kind:pubkey:identifier format
 * @returns {string|null} - The ditto.pub URL or null if invalid
 */
export const getDittoBadgeUrl = (address) => {
  if (!address || typeof address !== "string") return null;
  const trimmed = address.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("naddr1")) {
    return `https://ditto.pub/${trimmed}`;
  }

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length >= 3) {
      const kind = parseInt(parts[0], 10);
      const pubkey = parts[1];
      const identifier = parts.slice(2).join(":");

      if (!isNaN(kind) && pubkey && identifier !== undefined) {
        try {
          const naddr = nip19.naddrEncode({
            kind,
            pubkey,
            identifier,
            relays: ["wss://relay.ditto.pub"],
          });
          return `https://ditto.pub/${naddr}`;
        } catch {
          return `https://ditto.pub/${trimmed}`;
        }
      }
    }
  }

  return `https://ditto.pub/${trimmed}`;
};
