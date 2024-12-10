import { create } from "zustand";
import NDK, {
  NDKPrivateKeySigner,
  NDKKind,
  NDKEvent,
  NDKUser,
} from "@nostr-dev-kit/ndk";

import { Buffer } from "buffer";
import { bech32 } from "bech32";
import { getPublicKey, nip19 } from "nostr-tools";

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
      fetchProfile,
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

      console.log("USER????????!!!", user.npub);
      let profile = await fetchProfile(user.npub);
      console.log("PROFILE", profile);
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

  auth: (nsecPassword) => {
    const { setError } = get();
    try {
      let decoded = nip19.decode(nsecPassword);
      const pubkey = getPublicKey(decoded.data);

      const ndk = new NDK({
        explicitRelayUrls: defaultRelays,
      });

      let user = ndk.getUser({ pubkey: pubkey });

      localStorage.setItem("local_nsec", nsecPassword);
      localStorage.setItem("local_npub", user.npub);
      localStorage.setItem("uniqueId", user.npub);

      set({ nostrPrivKey: nsecPassword, nostrPubKey: user.npub });
    } catch (err) {
      console.error("Error in auth:", err);
      setError(err.message);
    }
  },

  generateNostrKeys: async (
    userDisplayName = null,
    setLoadingMessage,
    profileAbout,
    introductionPost
  ) => {
    const { postNostrContent } = get();
    setLoadingMessage && setLoadingMessage("createAccount.isCreating");

    const privateKeySigner = NDKPrivateKeySigner.generate();
    const privateKey = privateKeySigner.privateKey;
    const user = await privateKeySigner.user();
    const publicKey = user.npub;

    const encodedNsec = bech32.encode(
      "nsec",
      bech32.toWords(Buffer.from(privateKey, "hex"))
    );
    const encodedNpub = bech32.encode(
      "npub",
      bech32.toWords(Buffer.from(publicKey, "hex"))
    );

    set({ nostrPrivKey: encodedNsec, nostrPubKey: publicKey });

    if (!localStorage.getItem("local_nsec")) {
      setLoadingMessage && setLoadingMessage("createAccount.isCreatingProfile");
      await postNostrContent(
        JSON.stringify({
          name: userDisplayName,
          about: profileAbout,
        }),
        0,
        publicKey,
        encodedNsec
      );

      setLoadingMessage &&
        setLoadingMessage("createAccount.isCreatingIntroPost");
      if (window.location.hostname !== "localhost") {
        await postNostrContent(introductionPost, 1, publicKey, encodedNsec);
      }
    }

    localStorage.setItem("local_nsec", encodedNsec);
    localStorage.setItem("local_npub", publicKey);
    localStorage.setItem("uniqueId", publicKey);

    return { npub: publicKey, nsec: encodedNsec };
  },

  postNostrContent: async (
    content,
    kind = NDKKind.Text,
    npubRef = null,
    nsecRef = null
  ) => {
    const { connectToNostr } = get();
    const connection = await connectToNostr(npubRef, nsecRef);
    if (!connection) return;

    const { ndkInstance, hexNpub, signer } = connection;

    console.log("NDK at event", ndkInstance);

    const noteEvent = new NDKEvent(ndkInstance, {
      kind,
      tags: [],
      content,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: hexNpub,
    });

    console.log("notevent", noteEvent);

    try {
      await noteEvent.sign(signer);
      await noteEvent.publish();
    } catch (error) {
      console.error("Error publishing note event:", error);
    }
  },

  setProfilePicture: async (
    profilePictureUrl = "https://primal.b-cdn.net/media-cache?s=o&a=1&u=https%3A%2F%2Fm.primal.net%2FKBLq.png",
    npubRef,
    nsecRef
  ) => {
    const { connectToNostr } = get();
    const connection = await connectToNostr(npubRef, nsecRef);
    if (!connection) return;

    const { ndkInstance, hexNpub, signer } = connection;

    try {
      let currentMetadata = {};
      const subscription = ndkInstance.subscribe({
        kinds: [NDKKind.Metadata],
        authors: [hexNpub],
        limit: 1,
      });

      subscription.on("event", (event) => {
        currentMetadata = JSON.parse(event.content);
      });

      await new Promise((resolve) => subscription.on("eose", resolve));

      currentMetadata.picture = profilePictureUrl;

      const metadataEvent = new NDKEvent(ndkInstance, {
        kind: NDKKind.Metadata,
        pubkey: hexNpub,
        created_at: Math.floor(Date.now() / 1000),
        content: JSON.stringify(currentMetadata),
      });

      await metadataEvent.sign(signer);
      await metadataEvent.publish();

      console.log("Profile picture updated successfully.");
    } catch (err) {
      console.error("Error setting profile picture on Nostr:", err);
    }
  },

  assignExistingBadgeToNpub: async (
    badgeNaddr,
    awardeeNpub = localStorage.getItem("local_npub"),
    ownerNsec = import.meta?.env?.VITE_SECRET_KEY
  ) => {
    const { connectToNostr, getHexNPub } = get();
    if (!awardeeNpub) {
      console.error("Awardee public key is required to award the badge.");
      return;
    }

    if (!ownerNsec) {
      console.error("Owner's private key is required.");
      return;
    }

    const connection = await connectToNostr(
      "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
      ownerNsec
    );
    if (!connection) return;

    const { ndkInstance, signer } = connection;

    const badgeAwardEvent = new NDKEvent(ndkInstance, {
      kind: NDKKind.BadgeAward,
      tags: [
        [
          "a",
          `${NDKKind.BadgeDefinition}:${getHexNPub(
            "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
          )}:${badgeNaddr}`,
        ],
        ["p", getHexNPub(localStorage.getItem("local_npub"))],
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: getHexNPub(
        "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
      ),
    });

    try {
      await badgeAwardEvent.sign(signer);
      await badgeAwardEvent.publish();
      console.log("Badge awarded successfully to:", awardeeNpub);
    } catch (error) {
      console.error("Error publishing badge event:", error);
    }
  },

  getBadgeData: async (addy) => {
    const { connectToNostr, setError } = get();
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;

      let addressPointer = addy.split(":");
      const filter = {
        kinds: [NDKKind.BadgeDefinition],
        authors: [addressPointer[1]],
        "#d": [addressPointer[2]],
        limit: 1,
      };

      const subscription = ndkInstance.subscribe(filter, { closeOnEose: true });
      const badges = [];

      subscription.on("event", (event) => {
        const badgeInfo = {
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
          badgeAddress: addy,
        };
        badges.push(badgeInfo);
      });

      await new Promise((resolve) => subscription.on("eose", resolve));
      return badges;
    } catch (error) {
      console.error("Error retrieving badges:", error);
      setError(error.message);
      return [];
    }
  },

  getUserBadges: async (npub = localStorage.getItem("local_npub")) => {
    const { connectToNostr, getHexNPub, getBadgeData } = get();
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;
      const hexNpub = getHexNPub(npub);

      const filter = {
        kinds: [NDKKind.BadgeAward],
        "#p": [hexNpub],
        limit: 100,
      };

      const subscription = ndkInstance.subscribe(filter, { closeOnEose: true });
      const badges = [];

      subscription.on("event", (event) => {
        badges.push({
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
        });
      });

      await new Promise((resolve) => subscription.on("eose", resolve));

      const uniqueNAddresses = [
        ...new Set(
          badges.flatMap((badge) =>
            badge.tags
              .filter((tag) => tag[0] === "a" && tag[1])
              .map((tag) => tag[1])
          )
        ),
      ];

      let badgeData = uniqueNAddresses.map((naddress) =>
        getBadgeData(naddress)
      );
      let resolvedBadges = await Promise.all(badgeData);

      const formattedBadges = [];

      resolvedBadges.forEach((badgeArray) => {
        badgeArray.forEach((badge) => {
          let name = "";
          let image = "";

          badge.tags.forEach((tag) => {
            if (tag[0] === "name") name = tag[1];
            if (tag[0] === "image") image = tag[1];
          });

          if (name && image) {
            formattedBadges.push({
              name,
              image,
              badgeAddress: badge.badgeAddress,
            });
          }
        });
      });

      return formattedBadges;
    } catch (error) {
      console.error("Error retrieving badges:", error);
      return [];
    }
  },

  getLastNotesByNpub: async (npub) => {
    const { connectToNostr, getHexNPub, setError } = get();
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;
      const hexNpub = getHexNPub(npub);

      const filter = {
        kinds: [NDKKind.Text],
        authors: [hexNpub],
        limit: 5,
      };

      const subscription = ndkInstance.subscribe(filter, { closeOnEose: true });
      const notes = [];

      subscription.on("event", (event) => {
        notes.push({
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
          id: event.id,
        });
      });

      await new Promise((resolve) => subscription.on("eose", resolve));
      return notes;
    } catch (error) {
      console.error("Error retrieving notes:", error);
      setError(error.message);
      return [];
    }
  },

  createNewWallet: async (
    mintUrls = [],
    relayUrls = defaultRelays,
    walletName = "My Wallet"
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
