import { useState, useEffect, useCallback } from "react";
import NDK, {
  NDKPrivateKeySigner,
  NDKEvent,
  NDKKind,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

export function useNostrTest() {
  const [ndk, setNdk] = useState(null);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize NDK instance once
    const _ndk = new NDK({
      explicitRelayUrls: ["wss://relay.damus.io"],
    });
    setNdk(_ndk);

    // Connect to the relay
    _ndk
      .connect()
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => console.error("Failed to connect to relay:", err));
  }, []);

  const login = useCallback(
    async (nsecKey) => {
      if (!ndk) return;
      try {
        const decoded = nip19.decode(nsecKey);
        if (decoded.type !== "nsec" || typeof decoded.data !== "string") {
          throw new Error("Invalid nsec key");
        }

        const hexPrivateKey = decoded.data;
        const _signer = new NDKPrivateKeySigner(hexPrivateKey);
        ndk.signer = _signer; // Assign signer to NDK instance

        // Wait for the signer to be ready and fetch the user
        const _user = await _signer.user();
        setSigner(_signer);
        setUser(_user);
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
    [ndk]
  );

  const postNote = useCallback(
    async (content) => {
      if (!ndk || !signer || !user) {
        throw new Error("Not logged in or NDK not ready");
      }

      const event = new NDKEvent(ndk, {
        kind: NDKKind.Text,
        content,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: user.pubkey, // hex pubkey
      });

      await event.sign(signer);
      const publishedTo = await event.publish();
      return publishedTo; // set of relays that accepted the event
    },
    [ndk, signer, user]
  );

  return {
    isConnected,
    user,
    login,
    postNote,
  };
}
