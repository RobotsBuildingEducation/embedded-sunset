// src/hooks/useNostrWalletStore.js
// NIP-60 (Cashu Wallets) and NIP-61 (Nutzaps) implementation
// Zustand store for global wallet state
import { create } from "zustand";
import NDK, {
  NDKPrivateKeySigner,
  NDKNip07Signer,
  NDKEvent,
} from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import { Buffer } from "buffer";
import { bech32 } from "bech32";

// Polyfill Buffer for browser
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

// Default configuration
const DEFAULT_MINT = "https://mint.minibits.cash/Bitcoin";
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
];
const DEFAULT_RECEIVER =
  "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt";

/**
 * Safely extract total balance from wallet.balance response
 */
function extractBalance(bal) {
  if (bal === null || bal === undefined) return 0;
  if (typeof bal === "number") return bal;
  if (typeof bal === "object" && typeof bal.amount === "number") {
    return bal.amount;
  }
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
 * Verify proofs with mint and return only unspent balance
 */
async function verifyBalanceWithMint(wallet, mintUrl) {
  try {
    const proofs = wallet.state?.getProofs({ mint: mintUrl }) || [];
    console.log("[Wallet] Proofs from state:", proofs.length);

    if (proofs.length === 0) {
      return 0;
    }

    const cashuWallet = await wallet.getCashuWallet(mintUrl);
    const proofStates = await cashuWallet.checkProofsStates(proofs);

    const unspentProofs = proofs.filter((proof, i) => {
      const state = proofStates[i];
      return state?.state === "UNSPENT";
    });

    const balance = unspentProofs.reduce((sum, p) => sum + p.amount, 0);
    console.log("[Wallet] Verified balance from mint:", balance);
    return balance;
  } catch (e) {
    console.error("[Wallet] Error verifying with mint:", e);
    return extractBalance(wallet.balance);
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
  cashuWallet: null,
  walletBalance: 0,
  proofs: [],
  invoice: "",
  isCreatingWallet: false,
  isWalletReady: false,

  // Setters
  setError: (msg) => set({ errorMessage: msg }),
  setInvoice: (data) => set({ invoice: data }),

  // Utility: Get hex pubkey from npub
  getHexNPub: (npub) => decodeKey(npub),

  // Verify and update balance from mint
  verifyAndUpdateBalance: async () => {
    const { cashuWallet } = get();
    if (!cashuWallet) return 0;

    const balance = await verifyBalanceWithMint(cashuWallet, DEFAULT_MINT);
    set({ walletBalance: balance });
    return balance;
  },

  // Connect to Nostr relays
  connectToNostr: async (npubRef = null, nsecRef = null) => {
    const { setError, nostrPrivKey, nostrPubKey } = get();

    const storedNsec = localStorage.getItem("local_nsec");
    const isNip07 = localStorage.getItem("nip07_signer") === "true";
    const nsec = nsecRef || (storedNsec !== "nip07" ? nostrPrivKey : null);

    try {
      const ndkInstance = new NDK({
        explicitRelayUrls: DEFAULT_RELAYS,
      });

      await ndkInstance.connect();

      // Handle NIP-07 mode
      if (isNip07 && typeof window !== "undefined" && window.nostr) {
        console.log("[Wallet] Using NIP-07 signer");
        const signer = new NDKNip07Signer();
        await signer.blockUntilReady();
        ndkInstance.signer = signer;
        const user = await signer.user();
        ndkInstance.activeUser = user;

        set({ isConnected: true, ndkInstance, signer });
        return { ndkInstance, signer };
      }

      // Handle private key mode
      if (!nsec || !nsec.startsWith("nsec")) {
        console.error("[Wallet] No valid nsec provided");
        return null;
      }

      const hexNsec = decodeKey(nsec);
      if (!hexNsec) throw new Error("Invalid nsec key");

      const signer = new NDKPrivateKeySigner(hexNsec);
      await signer.blockUntilReady();
      ndkInstance.signer = signer;
      const user = await signer.user();
      ndkInstance.activeUser = user;

      set({ isConnected: true, ndkInstance, signer });
      return { ndkInstance, signer };
    } catch (err) {
      console.error("[Wallet] Error connecting to Nostr:", err);
      setError(err.message);
      return null;
    }
  },

  // Initialize (called on app load)
  init: async () => {
    const storedNpub = localStorage.getItem("local_npub");
    const storedNsec = localStorage.getItem("local_nsec");
    const isNip07 = localStorage.getItem("nip07_signer") === "true";

    if (storedNpub) set({ nostrPubKey: storedNpub });
    if (storedNsec && storedNsec !== "nip07") set({ nostrPrivKey: storedNsec });

    const { connectToNostr } = get();

    if ((isNip07 && storedNpub) || (storedNpub && storedNsec)) {
      const connection = await connectToNostr(storedNpub, storedNsec);
      return !!connection;
    }

    return false;
  },

  // Initialize wallet
  // Initialize wallet (load existing only - does NOT create new)
  // Initialize wallet (load existing only - does NOT create new)
  initWallet: async () => {
    const {
      ndkInstance,
      signer,
      cashuWallet,
      setError,
      verifyAndUpdateBalance,
    } = get();

    if (cashuWallet) {
      cashuWallet.removeAllListeners();
    }

    if (!ndkInstance || !signer) {
      console.error("[Wallet] NDK not ready");
      return null;
    }

    try {
      const user = await signer.user();
      console.log("[Wallet] Looking for wallet for pubkey:", user.pubkey);

      // Check for wallet events - try multiple possible kinds
      const walletEvents = await ndkInstance.fetchEvents({
        kinds: [37513, 7374, 7375], // wallet, token, and proof kinds
        authors: [user.pubkey],
        limit: 5,
      });

      console.log("[Wallet] Found events:", walletEvents.size);
      walletEvents.forEach((e) => console.log("[Wallet] Event kind:", e.kind));

      if (walletEvents.size === 0) {
        console.log("[Wallet] No existing wallet found");
        return null;
      }

      console.log("[Wallet] Found existing wallet, loading...");

      const pk = signer.privateKey;
      const wallet = new NDKCashuWallet(ndkInstance);
      wallet.mints = [DEFAULT_MINT];
      wallet.walletId = "Robots Building Education Wallet"; // Add this line

      if (pk) {
        wallet.privkey = pk;
        wallet.signer = new NDKPrivateKeySigner(pk);
      }

      ndkInstance.wallet = wallet;

      await wallet.start({ pubkey: user.pubkey });

      console.log("[Wallet] Wallet status:", wallet.status);
      console.log("[Wallet] Wallet relaySet:", wallet.relaySet);
      wallet.on("balance_updated", (balance) => {
        console.log("[Wallet] >>> BALANCE EVENT FIRED:", balance);
        console.log("[Wallet] Balance updated event:", balance);
        if (balance?.amount !== undefined) {
          set({ walletBalance: balance.amount });
        } else {
          // Fallback to manual check
          verifyAndUpdateBalance();
        }
      });

      wallet.on("ready", () => {
        console.log("[Wallet] Wallet ready event");
        verifyAndUpdateBalance();
      });

      wallet.on("warning", (warning) => {
        console.warn("[Wallet] Warning:", warning.msg);
      });
      console.log("[Wallet] Wallet loaded, status:", wallet.status);

      set({ cashuWallet: wallet, isWalletReady: true });

      await verifyAndUpdateBalance();

      return wallet;
    } catch (err) {
      console.error("[Wallet] Error loading wallet:", err);
      setError(err.message);
      return null;
    }
  },

  // Create and publish new wallet
  // Create and publish new wallet
  createNewWallet: async () => {
    const { ndkInstance, signer, setError, verifyAndUpdateBalance } = get();

    if (!ndkInstance || !signer) {
      console.error("[Wallet] NDK not ready");
      return null;
    }

    set({ isCreatingWallet: true });

    try {
      const pk = signer.privateKey;

      const wallet = new NDKCashuWallet(ndkInstance);
      wallet.mints = [DEFAULT_MINT];
      wallet.privkey = pk;
      wallet.signer = new NDKPrivateKeySigner(pk);
      wallet.walletId = "Robots Building Education Wallet";

      ndkInstance.wallet = wallet;

      const user = await signer.user();
      await wallet.start({ pubkey: user.pubkey });
      console.log("[Wallet] Wallet started");

      try {
        await wallet.publish();
        console.log("[Wallet] Wallet published to relays");
      } catch (pubErr) {
        console.warn("[Wallet] Could not publish (non-critical):", pubErr);
      }

      set({
        cashuWallet: wallet,
        isWalletReady: true,
        isCreatingWallet: false,
      });

      await verifyAndUpdateBalance();

      return wallet;
    } catch (err) {
      console.error("[Wallet] Error creating wallet:", err);
      setError(err.message);
      set({ isCreatingWallet: false });
      return null;
    }
  },

  // Fetch recipient's payment info (kind:10019)
  fetchUserPaymentInfo: async (recipientNpub) => {
    const { ndkInstance } = get();

    if (!ndkInstance) {
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

  // Deposit sats
  initiateDeposit: async (amountInSats = 10, options = {}) => {
    const { cashuWallet, setError, setInvoice, verifyAndUpdateBalance } = get();
    const { onSuccess, onError } = options;

    if (!cashuWallet) {
      setError("Wallet not initialized");
      return null;
    }

    try {
      const deposit = cashuWallet.deposit(amountInSats, DEFAULT_MINT);

      deposit.on("success", async (token) => {
        console.log("[Wallet] Deposit successful!", token.proofs);

        // Save proofs to relay
        await cashuWallet.state.update({
          store: token.proofs,
          mint: DEFAULT_MINT,
        });

        // Verify balance with mint
        const newBalance = await verifyAndUpdateBalance();
        set({ invoice: "" });

        if (typeof onSuccess === "function") {
          onSuccess(newBalance);
        }
      });

      deposit.on("error", (e) => {
        console.error("[Wallet] Deposit error:", e);
        setError(e.message || "Deposit failed");
        setInvoice("");
        if (typeof onError === "function") {
          onError(e);
        }
      });

      const pr = await deposit.start();
      console.log("[Wallet] Invoice created");
      setInvoice(pr);
      return pr;
    } catch (e) {
      console.error("[Wallet] Error initiating deposit:", e);
      setError(e.message);
      return null;
    }
  },

  // Send 1 sat via nutzap
  sendOneSatToNpub: async (
    recipientNpub = DEFAULT_RECEIVER,
    retryCount = 0
  ) => {
    const {
      cashuWallet,
      ndkInstance,
      signer,
      fetchUserPaymentInfo,
      setError,
      walletBalance,
      verifyAndUpdateBalance,
      initWallet,
    } = get();

    const MAX_RETRIES = 2;

    if (!cashuWallet) {
      console.error("[Wallet] Wallet not initialized");
      return false;
    }

    if (walletBalance < 1) {
      console.error("[Wallet] Insufficient balance:", walletBalance);
      return false;
    }

    await initWallet();

    const freshWallet = get().cashuWallet;

    if (!freshWallet) {
      console.error("[Wallet] Wallet not available after refresh");
      return false;
    }

    try {
      const amount = 1;
      const unit = "sat";

      const { p2pkPubkey } = await fetchUserPaymentInfo(recipientNpub);
      console.log("[Wallet] Sending 1 sat to:", recipientNpub);

      const cashuWalletInstance =
        await freshWallet.getCashuWallet(DEFAULT_MINT);

      // Get proofs from wallet state
      let proofs = freshWallet.state?.getProofs({ mint: DEFAULT_MINT }) || [];
      if (proofs.length === 0) {
        throw new Error("No proofs available");
      }

      // Check which proofs are actually still spendable at the mint
      const proofStates = await cashuWalletInstance.checkProofsStates(proofs);

      // Filter to only unspent proofs
      const validProofs = proofs.filter((proof, index) => {
        const state = proofStates[index];
        return state?.state === "UNSPENT";
      });

      console.log("[Wallet] Total proofs:", proofs.length);
      console.log("[Wallet] Valid proofs:", validProofs.length);

      if (validProofs.length === 0) {
        throw new Error("No valid proofs available");
      }

      // Check if we have enough balance with valid proofs
      const validBalance = validProofs.reduce((sum, p) => sum + p.amount, 0);
      if (validBalance < amount) {
        throw new Error(`Insufficient valid balance: ${validBalance}`);
      }

      const recipientHex = decodeKey(recipientNpub);

      // Use only valid proofs for the send
      const { keep, send } = await cashuWalletInstance.send(
        amount,
        validProofs,
        {
          pubkey: p2pkPubkey,
        }
      );

      console.log("[Wallet] Keep proofs:", keep);
      console.log("[Wallet] Send proofs:", send);

      // Destroy ALL original proofs (including spent ones), store the change
      await freshWallet.state.update({
        store: keep,
        destroy: proofs,
        mint: DEFAULT_MINT,
      });

      const proofTags = send.map((proof) => ["proof", JSON.stringify(proof)]);

      const nutzapEvent = new NDKEvent(ndkInstance, {
        kind: 9321,
        content: "Robots Building Education",
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ...proofTags,
          ["amount", amount.toString()],
          ["unit", unit],
          ["u", DEFAULT_MINT],
          ["p", recipientHex],
        ],
      });

      await nutzapEvent.sign(signer);
      await nutzapEvent.publish();
      console.log("[Wallet] Nutzap published!");

      await verifyAndUpdateBalance();

      return true;
    } catch (e) {
      console.error("[Wallet] Error sending nutzap:", e);

      const isSpentError =
        e.message?.toLowerCase().includes("already spent") ||
        e.message?.toLowerCase().includes("no valid proofs") ||
        e.message?.toLowerCase().includes("insufficient valid");

      if (isSpentError && retryCount < MAX_RETRIES) {
        console.log(
          `[Wallet] Retrying... attempt ${retryCount + 1}/${MAX_RETRIES}`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return get().sendOneSatToNpub(recipientNpub, retryCount + 1);
      }

      setError(e.message);
      await verifyAndUpdateBalance();

      return false;
    }
  },

  // Reset state (logout)
  resetState: () => {
    set({
      isConnected: false,
      errorMessage: null,
      nostrPubKey: "",
      nostrPrivKey: "",
      ndkInstance: null,
      signer: null,
      cashuWallet: null,
      walletBalance: 0,
      proofs: [],
      invoice: "",
      isCreatingWallet: false,
      isWalletReady: false,
    });
  },
}));

export default useNostrWalletStore;
