// src/hooks/useNostrWalletStore.js
// NIP-60 (Cashu Wallets) and NIP-61 (Nutzaps) implementation
// Zustand store for global wallet state
import { create } from "zustand";
import NDK, { NDKPrivateKeySigner, NDKEvent } from "@nostr-dev-kit/ndk";
import NDKWalletService, { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import { Buffer } from "buffer";
import { bech32 } from "bech32";

// Default configuration
const DEFAULT_MINT = "https://mint.minibits.cash/Bitcoin";
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
];
const DEFAULT_RECEIVER =
  "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt";

// localStorage key for tracked balance
const TRACKED_BALANCE_KEY = "wallet_tracked_balance";

/**
 * Load tracked balance from localStorage
 */
function loadTrackedBalance() {
  try {
    const stored = localStorage.getItem(TRACKED_BALANCE_KEY);
    if (stored !== null) {
      const parsed = Number(stored);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  } catch (e) {
    console.warn("[Wallet] Error loading tracked balance:", e);
  }
  return null; // null means not yet initialized
}

/**
 * Save tracked balance to localStorage
 */
function saveTrackedBalance(balance) {
  try {
    localStorage.setItem(TRACKED_BALANCE_KEY, String(balance));
  } catch (e) {
    console.warn("[Wallet] Error saving tracked balance:", e);
  }
}

/**
 * Safely extract total balance from wallet.balance() response
 * The response can be: number, { amount }, or [{ amount, unit }]
 */
function extractBalance(bal) {
  if (bal === null || bal === undefined) return 0;

  // If it's a simple number
  if (typeof bal === "number") return bal;

  // If it's an array of balance entries
  if (Array.isArray(bal)) {
    return bal.reduce((sum, entry) => {
      if (typeof entry === "number") return sum + entry;
      if (entry && typeof entry.amount === "number") return sum + entry.amount;
      return sum;
    }, 0);
  }

  // If it's an object with amount
  if (typeof bal === "object" && typeof bal.amount === "number") {
    return bal.amount;
  }

  // Try to parse as number
  const parsed = Number(bal);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Decode bech32 key (npub/nsec) to hex
 */
function decodeKey(key) {
  try {
    const { words } = bech32.decode(key);
    return Buffer.from(bech32.fromWords(words)).toString("hex");
  } catch (e) {
    console.error("Error decoding key:", e);
    return null;
  }
}

/**
 * Encode hex to bech32 (npub/nsec)
 */
function encodeKey(hex, prefix) {
  try {
    const words = bech32.toWords(Buffer.from(hex, "hex"));
    return bech32.encode(prefix, words);
  } catch (e) {
    console.error("Error encoding key:", e);
    return null;
  }
}

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
  isCreatingWallet: false,
  isWalletReady: false,

  // Internal refs (not reactive)
  _balanceUpdateTimeout: null,

  // Setters
  setError: (msg) => set({ errorMessage: msg }),
  setInvoice: (data) => set({ invoice: data }),

  // Utility: Get hex pubkey from npub
  getHexNPub: (npub) => decodeKey(npub),

  // Refresh balance with debouncing
  refreshBalance: async () => {
    const { cashuWallet, _balanceUpdateTimeout } = get();
    if (!cashuWallet) return 0;

    // Clear any pending balance update
    if (_balanceUpdateTimeout) {
      clearTimeout(_balanceUpdateTimeout);
    }

    try {
      // Small delay to let wallet state settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      const bal = await cashuWallet.balance();
      const totalBalance = extractBalance(bal);

      console.log("[Wallet] Balance refreshed:", totalBalance);
      set({ walletBalance: totalBalance });
      return totalBalance;
    } catch (e) {
      console.error("[Wallet] Error refreshing balance:", e);
      return get().walletBalance;
    }
  },

  // Setup wallet listeners
  setupWalletListeners: async (wallet) => {
    if (!wallet || !(wallet instanceof NDKCashuWallet)) return;

    console.log("[Wallet] Setting up wallet listeners");

    // We no longer listen to balance_updated events from the wallet
    // because they're unreliable. Instead, we track balance ourselves.

    set({
      cashuWallet: wallet,
      isWalletReady: false,
    });

    // Initialize tracked balance: use localStorage if available,
    // otherwise sync from wallet.balance() on first load
    setTimeout(async () => {
      const storedBalance = loadTrackedBalance();
      if (storedBalance !== null) {
        // Use our tracked balance
        console.log(
          "[Wallet] Using tracked balance from localStorage:",
          storedBalance
        );
        set({ walletBalance: storedBalance, isWalletReady: true });
      } else {
        // First time: sync from wallet
        try {
          const bal = await wallet.balance();
          const initialBalance = extractBalance(bal);
          console.log("[Wallet] Initial balance from wallet:", initialBalance);
          saveTrackedBalance(initialBalance);
          set({ walletBalance: initialBalance, isWalletReady: true });
        } catch (e) {
          console.error("[Wallet] Error getting initial balance:", e);
          set({ walletBalance: 0, isWalletReady: true });
        }
      }
    }, 1500);
  },

  // Initialize wallet service
  initWalletService: async (providedNdk, providedSigner) => {
    const {
      setError,
      ndkInstance,
      signer,
      nostrPubKey,
      nostrPrivKey,
      connectToNostr,
      setupWalletListeners,
    } = get();

    try {
      let ndk = providedNdk || ndkInstance;
      let s = providedSigner || signer;

      if (!ndk || !s) {
        if (nostrPubKey && nostrPrivKey) {
          const connection = await connectToNostr(nostrPubKey, nostrPrivKey);
          if (connection) {
            ndk = connection.ndkInstance;
            s = connection.signer;
            set({ ndkInstance: ndk, signer: s });
          } else {
            throw new Error("Unable to connect to Nostr.");
          }
        } else {
          throw new Error("NDK or signer not found and no keys to reconnect.");
        }
      }

      ndk.signer = s;
      const user = await s.user();
      user.signer = s;

      const wService = new NDKWalletService(ndk);
      wService.start();

      // Listen for default wallet
      wService.on("wallet:default", (wallet) => {
        console.log("[Wallet] Default wallet detected:", wallet?.walletId);
        setupWalletListeners(wallet);
      });

      // Also listen for wallet ready
      wService.on("wallet:ready", (wallet) => {
        console.log("[Wallet] Wallet ready event");
        const { cashuWallet } = get();
        if (wallet && !cashuWallet) {
          setupWalletListeners(wallet);
        }
      });

      set({ walletService: wService });
      return true;
    } catch (error) {
      console.error("[Wallet] Error initializing wallet service:", error);
      setError(error.message);
      return false;
    }
  },

  // Connect to Nostr relays
  connectToNostr: async (npubRef = null, nsecRef = null) => {
    const { setError, nostrPrivKey, nostrPubKey } = get();

    const nsec = nsecRef || nostrPrivKey;
    const npub = npubRef || nostrPubKey;

    if (!nsec) {
      console.error("[Wallet] No nsec provided");
      return null;
    }

    try {
      const hexNsec = decodeKey(nsec);
      if (!hexNsec) throw new Error("Invalid nsec key");

      const ndkInstance = new NDK({
        explicitRelayUrls: DEFAULT_RELAYS,
      });

      await ndkInstance.connect();

      const signer = new NDKPrivateKeySigner(hexNsec);
      const user = await signer.user();
      const hexNpub = user.pubkey;

      set({ isConnected: true });

      return { ndkInstance, hexNpub, signer };
    } catch (err) {
      console.error("[Wallet] Error connecting to Nostr:", err);
      setError(err.message);
      return null;
    }
  },

  // Initialize wallet (called on app load)
  init: async () => {
    const storedNpub = localStorage.getItem("local_npub");
    const storedNsec = localStorage.getItem("local_nsec");

    if (storedNpub) set({ nostrPubKey: storedNpub });
    if (storedNsec) set({ nostrPrivKey: storedNsec });

    const { connectToNostr } = get();

    if (storedNpub && storedNsec) {
      console.log("[Wallet] Initializing with stored keys");
      const connection = await connectToNostr(storedNpub, storedNsec);
      if (connection) {
        const { ndkInstance: ndk, signer: s } = connection;
        set({ ndkInstance: ndk, signer: s });
        return true;
      }
    }
    return false;
  },

  // Create new wallet
  createNewWallet: async () => {
    const {
      ndkInstance,
      signer,
      setError,
      initWalletService,
      setupWalletListeners,
      init,
    } = get();

    set({ isCreatingWallet: true });

    try {
      let ndk = ndkInstance;
      let s = signer;

      if (!ndk || !s) {
        await init();
        await initWalletService();
        ndk = get().ndkInstance;
        s = get().signer;

        if (!ndk || !s) {
          throw new Error("Failed to initialize NDK");
        }
      }

      const newWallet = new NDKCashuWallet(ndk);
      newWallet.relays = DEFAULT_RELAYS;
      newWallet.setPublicTag("relay", "wss://relay.damus.io");
      newWallet.setPublicTag("relay", "wss://relay.primal.net");
      newWallet.walletId = "Robots Building Education Wallet";
      newWallet.mints = [DEFAULT_MINT];
      newWallet.unit = "sat";
      newWallet.setPublicTag("unit", "sat");
      newWallet.setPublicTag("d", "Robots Building Education Wallet");

      const pk = s.privateKey;
      if (pk) {
        newWallet.privkey = pk;
      }

      await newWallet.publish();
      console.log("[Wallet] New wallet created and published");

      await setupWalletListeners(newWallet);

      set({ isCreatingWallet: false });
      return newWallet;
    } catch (error) {
      console.error("[Wallet] Error creating new wallet:", error);
      setError(error.message);
      set({ isCreatingWallet: false });
      return null;
    }
  },

  // Fetch recipient's payment info (kind:10019)
  fetchUserPaymentInfo: async (recipientNpub) => {
    const { ndkInstance } = get();

    if (!ndkInstance) {
      console.error("[Wallet] NDK instance not ready");
      return { mints: [DEFAULT_MINT], p2pkPubkey: null, relays: [] };
    }

    const hexNpub = decodeKey(recipientNpub);
    if (!hexNpub) {
      return { mints: [DEFAULT_MINT], p2pkPubkey: null, relays: [] };
    }

    try {
      const filter = {
        kinds: [10019],
        authors: [hexNpub],
        limit: 1,
      };

      const events = await ndkInstance.fetchEvents(filter);
      const eventsArray = Array.from(events);

      if (eventsArray.length === 0) {
        return { mints: [DEFAULT_MINT], p2pkPubkey: hexNpub, relays: [] };
      }

      const userEvent = eventsArray[0];
      let mints = [];
      let relays = [];
      let p2pkPubkey = null;

      for (const tag of userEvent.tags) {
        const [t, v1] = tag;
        if (t === "mint" && v1) mints.push(v1);
        else if (t === "relay" && v1) relays.push(v1);
        else if (t === "pubkey" && v1) p2pkPubkey = v1;
      }

      if (mints.length === 0) mints = [DEFAULT_MINT];
      if (!p2pkPubkey) p2pkPubkey = hexNpub;

      return { mints, p2pkPubkey, relays };
    } catch (e) {
      console.error("[Wallet] Error fetching payment info:", e);
      return { mints: [DEFAULT_MINT], p2pkPubkey: hexNpub, relays: [] };
    }
  },

  // Send 1 sat to recipient via NIP-61 nutzap
  sendOneSatToNpub: async (recipientNpub = DEFAULT_RECEIVER) => {
    const {
      cashuWallet,
      ndkInstance,
      signer,
      fetchUserPaymentInfo,
      setError,
      walletBalance,
    } = get();

    if (!cashuWallet) {
      console.error("[Wallet] Wallet not initialized");
      return false;
    }

    // Check balance first
    const currentBalance = extractBalance(walletBalance);
    if (currentBalance < 1) {
      console.error("[Wallet] Insufficient balance:", currentBalance);
      return false;
    }

    try {
      const amount = 1;
      const unit = "sat";

      const mints =
        cashuWallet.mints?.length > 0 ? cashuWallet.mints : [DEFAULT_MINT];

      const { p2pkPubkey } = await fetchUserPaymentInfo(recipientNpub);

      console.log("[Wallet] Sending 1 sat to:", recipientNpub);

      // Perform cashu payment
      const confirmation = await cashuWallet.cashuPay({
        amount,
        unit,
        mints,
        p2pk: p2pkPubkey,
      });

      const { proofs, mint } = confirmation;
      if (!proofs || !mint) {
        throw new Error("No proofs returned from cashuPay");
      }

      console.log("[Wallet] Payment proofs received:", proofs.length);

      // Create kind:9321 nutzap event
      const recipientHex = decodeKey(recipientNpub);
      const proofTags = proofs.map((proof) => ["proof", JSON.stringify(proof)]);

      const nutzapEvent = new NDKEvent(ndkInstance, {
        kind: 9321,
        content: "Robots Building Education",
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ...proofTags,
          ["amount", amount.toString()],
          ["unit", unit],
          ["u", mint],
          ["p", recipientHex],
        ],
      });

      await nutzapEvent.sign(signer);
      await nutzapEvent.publish();

      console.log("[Wallet] Nutzap published!");

      // Update our tracked balance (decrement by amount spent)
      const newBalance = Math.max(0, currentBalance - amount);
      saveTrackedBalance(newBalance);
      set({ walletBalance: newBalance });
      console.log(
        "[Wallet] Tracked balance updated:",
        currentBalance,
        "->",
        newBalance
      );

      return true;
    } catch (e) {
      console.error("[Wallet] Error sending nutzap:", e);
      setError(e.message);
      return false;
    }
  },

  // Initiate deposit (create Lightning invoice)
  initiateDeposit: async (amountInSats = 10) => {
    const { cashuWallet, setError, setInvoice } = get();

    if (!cashuWallet) {
      console.error("[Wallet] Wallet not initialized");
      setError("Wallet not initialized");
      return null;
    }

    try {
      const deposit = cashuWallet.deposit(amountInSats, DEFAULT_MINT, "sat");
      const pr = await deposit.start();

      console.log("[Wallet] Invoice created:", pr?.substring(0, 50) + "...");
      setInvoice(pr);

      // Listen for success
      deposit.on("success", async (token) => {
        console.log("[Wallet] Deposit successful!");

        // Update our tracked balance (increment by deposit amount)
        // Use get() to get current balance at time of success, not at time of deposit start
        const currentBalance = extractBalance(get().walletBalance);
        const newBalance = currentBalance + amountInSats;
        saveTrackedBalance(newBalance);
        set({
          walletBalance: newBalance,
          invoice: "",
        });
        console.log(
          "[Wallet] Tracked balance updated:",
          currentBalance,
          "->",
          newBalance
        );
      });

      deposit.on("error", (e) => {
        console.error("[Wallet] Deposit error:", e);
        setError(e.message || "Deposit failed");
        setInvoice("");
      });

      return pr;
    } catch (e) {
      console.error("[Wallet] Error initiating deposit:", e);
      setError(e.message);
      return null;
    }
  },

  // Force sync balance from wallet (use if tracked balance drifts)
  syncBalanceFromWallet: async () => {
    const { cashuWallet } = get();
    if (!cashuWallet) {
      console.warn("[Wallet] Cannot sync - wallet not initialized");
      return;
    }

    try {
      const bal = await cashuWallet.balance();
      const syncedBalance = extractBalance(bal);
      saveTrackedBalance(syncedBalance);
      set({ walletBalance: syncedBalance });
      console.log("[Wallet] Balance synced from wallet:", syncedBalance);
      return syncedBalance;
    } catch (e) {
      console.error("[Wallet] Error syncing balance:", e);
    }
  },

  // Reset state (logout)
  resetState: () => {
    const { _balanceUpdateTimeout } = get();
    if (_balanceUpdateTimeout) {
      clearTimeout(_balanceUpdateTimeout);
    }

    // Clear tracked balance from localStorage
    try {
      localStorage.removeItem(TRACKED_BALANCE_KEY);
    } catch (e) {
      console.warn("[Wallet] Error clearing tracked balance:", e);
    }

    set({
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
      isCreatingWallet: false,
      isWalletReady: false,
      _balanceUpdateTimeout: null,
    });
  },
}));

export default useNostrWalletStore;
