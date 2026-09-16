import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";

export function ensureIdentity(storage = localStorage) {
  let npub = storage.getItem("local_npub");
  let nsec = storage.getItem("local_nsec");
  if (nsec && nsec !== "nip07" && !nsec.startsWith("nsec1")) {
    throw new Error(
      "Your saved private key could not be read. Restore your account in the main app.",
    );
  }
  if (nsec?.startsWith("nsec1")) {
    const decoded = nip19.decode(nsec);
    const derived = nip19.npubEncode(getPublicKey(decoded.data));
    if (npub && derived !== npub)
      throw new Error(
        "Your saved Nostr keys do not match. Restore your account in the main app.",
      );
    npub = derived;
  } else if (npub) {
    if (nip19.decode(npub).type !== "npub")
      throw new Error("Your saved account is invalid.");
    if (typeof window !== "undefined" && !window.nostr?.signEvent)
      throw new Error(
        "Connect the Nostr extension for your saved account, then retry.",
      );
    return { npub };
  } else {
    const secret = generateSecretKey();
    npub = nip19.npubEncode(getPublicKey(secret));
    nsec = nip19.nsecEncode(secret);
  }
  // Save the private key locally before making network requests. It is never
  // included in a profile, room, URL, or request to the server.
  storage.setItem("local_nsec", nsec);
  storage.setItem("local_npub", npub);
  storage.setItem("uniqueId", npub);
  return { npub };
}
