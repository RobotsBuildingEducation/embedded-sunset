import { create } from "zustand";
import NDK, { NDKPrivateKeySigner, NDKEvent } from "@nostr-dev-kit/ndk";

import { Buffer } from "buffer";
import { bech32 } from "bech32";

import NDKWalletService, { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";

const defaultMint = "https://mint.minibits.cash/Bitcoin";
const defaultRelays = ["wss://relay.damus.io", "wss://relay.primal.net"];

export const useNostrWalletStore = create((set, get) => ({
  // State
  isConnected: false,
  errorMessage: null,
  nostrPubKey: "",
  nostrPrivKey: "",
  ndkInstance: null,
  signer: null,
  walletService: null,
  cashuWallet: null,
  walletBalance: 0,
  invoice: "",

  // Utility methods
  setError: (msg) => set({ errorMessage: msg }),
  setInvoice: (data) => set({ invoice: data }),

  getHexNPub: (npub) => {
    const { words: npubWords } = bech32.decode(npub);
    return Buffer.from(bech32.fromWords(npubWords)).toString("hex");
  },

  connectToNostr: async (npubRef = null, nsecRef = null) => {
    const { setError, nostrPrivKey, nostrPubKey } = get();
    const defaultNsec = import.meta?.env?.VITE_GLOBAL_NOSTR_NSEC;
    const defaultNpub =
      "npub1mgt5c7qh6dm9rg57mrp89rqtzn64958nj5w9g2d2h9dng27hmp0sww7u2v";

    const nsec = nsecRef || nostrPrivKey || defaultNsec;
    const npub = npubRef || nostrPubKey || defaultNpub;

    try {
      const { words: nsecWords } = bech32.decode(nsec);
      const hexNsec = Buffer.from(bech32.fromWords(nsecWords)).toString("hex");

      const { words: npubWords } = bech32.decode(npub);
      const hexNpub = Buffer.from(bech32.fromWords(npubWords)).toString("hex");

      const ndkInstance = new NDK({
        explicitRelayUrls: defaultRelays,
      });

      await ndkInstance.connect();

      set({ isConnected: true });
      return { ndkInstance, hexNpub, signer: new NDKPrivateKeySigner(hexNsec) };
    } catch (err) {
      console.error("Error connecting to Nostr:", err);
      setError(err.message);
      return null;
    }
  },

  initWalletService: async (providedNdk, providedSigner) => {
    const {
      setError,
      ndkInstance,
      signer,
      nostrPubKey,
      nostrPrivKey,
      connectToNostr,
    } = get();

    try {
      let ndk = providedNdk || ndkInstance;
      let s = providedSigner || signer;

      // If we don't have ndk or signer, let's try to establish them
      // This covers the scenario where the user is already logged in
      // and the app loads up but we have not explicitly connected yet.
      if (!ndk || !s) {
        // Check if we have keys
        if (nostrPubKey && nostrPrivKey) {
          const connection = await connectToNostr(nostrPubKey, nostrPrivKey);
          if (connection) {
            ndk = connection.ndkInstance;
            s = connection.signer;
            // Store them for future use
            set({ ndkInstance: ndk, signer: s });
          } else {
            throw new Error(
              "Unable to connect to Nostr. No NDK or Signer available."
            );
          }
        } else {
          throw new Error("NDK or signer not found and no keys to reconnect.");
        }
      }

      // At this point, we must have ndk and signer
      ndk.signer = s;
      const user = await s.user();
      console.log("USER????????!!!", user.profile);
      user.signer = s;

      const wService = new NDKWalletService(ndk);
      wService.on("wallet:default", (w) => {
        get().setupWalletListeners(w);
      });
      wService.on("wallet", (w) => {
        // Could handle multiple wallets here if needed
        console.log("on wallet", w);
      });

      wService.start();
      set({ walletService: wService });
    } catch (error) {
      console.error("Error initializing wallet service:", error);
      setError(error.message);
    }
  },

  setupWalletListeners: async (wallet) => {
    if (!wallet || !(wallet instanceof NDKCashuWallet)) return;

    wallet.on("balance_updated", async () => {
      const bal = (await wallet.balance()) || [];
      set({ walletBalance: bal });
    });

    const initialBal = (await wallet.balance()) || [];
    set({
      walletBalance: initialBal,
      cashuWallet: wallet,
    });
  },

  // Initialization method to be called once (in App.jsx or similar)
  init: async () => {
    const storedNpub = localStorage.getItem("local_npub");
    const storedNsec = localStorage.getItem("local_nsec");

    if (storedNpub) set({ nostrPubKey: storedNpub });
    if (storedNsec) set({ nostrPrivKey: storedNsec });

    const { connectToNostr, initWalletService } = get();
    if (storedNpub && storedNsec) {
      const connection = await connectToNostr(storedNpub, storedNsec);
      if (connection) {
        const { ndkInstance: ndk, signer: s } = connection;
        set({ ndkInstance: ndk, signer: s });
        await initWalletService(ndk, s);
      }
    }
  },

  createNewWallet: async (
    mintUrls = [],
    relayUrls = defaultRelays,
    walletName = "Robots Building Education Wallet"
  ) => {
    const {
      ndkInstance,
      signer,
      setError,
      initWalletService,
      setupWalletListeners,
      connectToNostr,
    } = get();
    if (!ndkInstance || !signer) {
      setError("NDK or signer not initialized. Cannot create wallet yet.");
      return null;
    }

    try {
      const newWallet = new NDKCashuWallet(ndkInstance);
      newWallet.name = "Robots Building Education Wallet";
      newWallet.relays = relayUrls;
      newWallet.setPublicTag("relay", "wss://relay.damus.io");
      newWallet.setPublicTag("relay", "wss://relay.primal.net");

      newWallet.mints = mintUrls.length > 0 ? mintUrls : [defaultMint];
      newWallet.walletId = "Robots Building Education Wallet";
      newWallet.unit = "sat";
      newWallet.setPublicTag("unit", "sat");

      const pk = signer.privateKey;
      if (pk) {
        newWallet.privkey = pk;
      }

      await newWallet.publish();
      console.log("Published wallet event:", newWallet.event.rawEvent());

      const connection = await connectToNostr(
        localStorage.getItem("local_npub"),
        localStorage.getItem("local_nsec")
      );
      if (!connection) return null;

      const { ndkInstance: ndk, signer: s } = connection;
      set({ ndkInstance: ndk, signer: s });
      console.log("Initializing wallet service.");
      await initWalletService(ndk, s);
      await setupWalletListeners(newWallet);

      return newWallet;
    } catch (error) {
      console.error("Error creating new wallet:", error);
      setError(error.message);
      return null;
    }
  },

  fetchProfile: async (npubRef = null) => {
    const { nostrPubKey, ndkInstance, connectToNostr, setError, getHexNPub } =
      get();

    // Use the provided npubRef or fall back to the current user's public key
    const npub = npubRef || nostrPubKey;

    if (!npub) {
      console.error("Public key is required to fetch the profile.");
      setError("Public key is required to fetch the profile.");
      return null;
    }

    try {
      // Convert npub to hex format
      const hexNpub = getHexNPub(npub);

      // Ensure NDK instance is available and connected
      let ndk = ndkInstance;
      if (!ndk) {
        console.warn("NDK instance not found. Reconnecting...");
        const connection = await connectToNostr();
        if (!connection) throw new Error("Failed to reconnect to Nostr.");
        ndk = connection.ndkInstance;
      }

      // Fetch user metadata
      const user = ndk.getUser({ hexpubkey: hexNpub });
      const profileEvent = await user.fetchProfile();

      if (profileEvent) {
        console.log("Fetched profile:", profileEvent);
        return profileEvent; // Contains profile fields like name, about, picture, etc.
      } else {
        console.warn("No profile metadata found for this user.");
        return null;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
      return null;
    }
  },

  fetchUserPaymentInfo: async (recipientNpub) => {
    const { ndkInstance, getHexNPub } = get();
    if (!ndkInstance) {
      console.error("NDK instance not ready");
      return { mints: [defaultMint], p2pkPubkey: null, relays: [] };
    }

    const hexNpub = getHexNPub(recipientNpub);
    const filter = {
      kinds: [10019],
      authors: [hexNpub],
      limit: 1,
    };

    const subscription = ndkInstance.subscribe(filter, { closeOnEose: true });
    let userEvent = null;

    subscription.on("event", (event) => {
      userEvent = event;
    });

    await new Promise((resolve) => subscription.on("eose", resolve));

    if (!userEvent) {
      return { mints: [defaultMint], p2pkPubkey: hexNpub, relays: [] };
    }

    let mints = [];
    let relays = [];
    let p2pkPubkey = null;

    for (const tag of userEvent.tags) {
      const [t, v1] = tag;
      if (t === "mint" && v1) mints.push(v1);
      else if (t === "relay" && v1) relays.push(v1);
      else if (t === "pubkey" && v1) p2pkPubkey = v1;
    }

    if (mints.length === 0) mints = [defaultMint];
    if (!p2pkPubkey) p2pkPubkey = hexNpub;

    return { mints, p2pkPubkey, relays };
  },

  sendOneSatToNpub: async (
    recipientNpub = "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
  ) => {
    const {
      cashuWallet,
      getHexNPub,
      ndkInstance,
      signer,
      fetchUserPaymentInfo,
      setError,
    } = get();
    if (!cashuWallet) {
      console.error("Wallet not initialized or no balance.");
      return;
    }

    try {
      const amount = 1000;
      const unit = "msat";
      const mints =
        cashuWallet.mints.length > 0 ? cashuWallet.mints : [defaultMint];

      const { p2pkPubkey } = await fetchUserPaymentInfo(recipientNpub);

      const confirmation = await cashuWallet.cashuPay({
        amount,
        unit,
        mints,
        p2pk: p2pkPubkey,
      });

      const { proofs, mint } = confirmation;
      if (!proofs || !mint) {
        throw new Error("No proofs returned from cashuPay.");
      }

      const hexRecipient = getHexNPub(recipientNpub);
      const proofData = JSON.stringify({ proofs, mint });
      const tags = [
        ["amount", amount.toString()],
        ["unit", unit],
        ["proof", proofData],
        ["u", mint],
        ["p", hexRecipient],
      ];

      const content = "testing int";
      const nutzapEvent = new NDKEvent(ndkInstance, {
        kind: 9321,
        tags,
        content,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nutzapEvent.sign(signer);
      await nutzapEvent.publish();

      await cashuWallet.checkProofs();
      const updatedBalance = await cashuWallet.balance();
      set({ walletBalance: updatedBalance || [] });

      console.log(`Successfully sent nutzap (1 sat) to ${recipientNpub}!`);
    } catch (e) {
      console.error("Error sending nutzap:", e);
      setError(e.message);
    }
  },

  initiateDeposit: async (amountInSats = 10) => {
    const { cashuWallet, setError, setInvoice } = get();
    if (!cashuWallet) {
      console.error("Wallet not initialized.");
      return;
    }

    const deposit = cashuWallet.deposit(amountInSats, defaultMint, "sat");
    const pr = await deposit.start(); // pr is the LN invoice (bolt11)
    setInvoice(pr); // Store the invoice in Zustand

    deposit.on("success", async (token) => {
      console.log("Deposit successful!", token);
      await cashuWallet.checkProofs();
      const updatedBalance = await cashuWallet.balance();
      set({ walletBalance: updatedBalance || [] });
      setInvoice(""); // Clear invoice after success if desired
    });

    deposit.on("error", (e) => {
      console.error("Deposit failed:", e);
      setError(e.message);
    });

    return pr;
  },
}));
