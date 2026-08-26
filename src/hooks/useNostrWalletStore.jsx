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
import {
  checkUnspentProofs,
  createBolt11MintQuote,
  getMintWallet,
  getProofsMissingFromState,
  sumProofAmounts,
  toNdkProofs,
  waitForBolt11MintQuote,
} from "../utils/cashuMintClient.js";

// Polyfill Buffer for browser
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

// Default configuration
const DEFAULT_MINT = "https://mint.minibits.cash/Bitcoin";
const DEFAULT_RELAYS = [
  "wss://relay.ditto.pub",
  "wss://relay.primal.net",
  "wss://nos.lol",
];
const DEFAULT_RECEIVER =
  "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt";
const PENDING_DEPOSIT_PREFIX = "cashu_pending_deposit_v1:";
const depositMonitors = new Map();

function pendingDepositKey(ownerPubkey) {
  return `${PENDING_DEPOSIT_PREFIX}${ownerPubkey}`;
}

function readPendingDeposit(ownerPubkey) {
  if (typeof localStorage === "undefined") return null;

  const serialized = localStorage.getItem(pendingDepositKey(ownerPubkey));
  if (!serialized) return null;

  try {
    const record = JSON.parse(serialized);
    if (
      record?.ownerPubkey !== ownerPubkey ||
      record?.mint !== DEFAULT_MINT ||
      !record?.quote?.quote
    ) {
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

function writePendingDeposit(record) {
  if (typeof localStorage === "undefined") {
    throw new Error("Browser storage is unavailable");
  }

  localStorage.setItem(
    pendingDepositKey(record.ownerPubkey),
    JSON.stringify(record),
  );
}

function removePendingDeposit(ownerPubkey) {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(pendingDepositKey(ownerPubkey));
  }
}

function abortDepositMonitors(exceptOwnerPubkey = null) {
  for (const [ownerPubkey, monitor] of depositMonitors) {
    if (ownerPubkey !== exceptOwnerPubkey) monitor.controller.abort();
  }
}

function callDepositCallback(callback, value) {
  if (typeof callback !== "function") return;

  try {
    callback(value);
  } catch {
    console.error("[Wallet] Deposit callback failed");
  }
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
  const proofs = wallet.state?.getProofs({ mint: mintUrl }) || [];
  console.log("[Wallet] Proofs from state:", proofs.length);

  const unspentProofs = await checkUnspentProofs(mintUrl, proofs);
  const balance = sumProofAmounts(unspentProofs);
  console.log("[Wallet] Verified balance from mint:", balance);
  return balance;
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
  isRefreshingAfterDeposit: false,

  // Setters
  setError: (msg) => set({ errorMessage: msg }),
  setInvoice: (data) => set({ invoice: data }),

  // Set manual private key for NIP-07 users who want to create a wallet
  setManualPrivateKey: (nsec) => {
    if (nsec && nsec.startsWith("nsec")) {
      const hexKey = decodeKey(nsec);
      if (hexKey) {
        set({ nostrPrivKey: nsec });
        return true;
      }
    }
    return false;
  },

  // Check if we're in NIP-07 mode
  isNip07Mode: () => localStorage.getItem("nip07_signer") === "true",

  // Utility: Get hex pubkey from npub
  getHexNPub: (npub) => decodeKey(npub),

  // Verify and update balance from mint
  verifyAndUpdateBalance: async () => {
    const { cashuWallet } = get();
    if (!cashuWallet) return 0;

    try {
      const balance = await verifyBalanceWithMint(cashuWallet, DEFAULT_MINT);
      set({ walletBalance: balance });
      return balance;
    } catch (error) {
      console.error("[Wallet] Error verifying with mint:", error);
      return get().walletBalance;
    }
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
      abortDepositMonitors(user.pubkey);
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
      wallet.on("balance_updated", () => {
        console.log("[Wallet] Balance update received; verifying with mint");
        void verifyAndUpdateBalance();
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
      void get().resumePendingDeposit(user.pubkey);

      return wallet;
    } catch (err) {
      console.error("[Wallet] Error loading wallet:", err);
      setError(err.message);
      return null;
    }
  },

  // Create and publish new wallet
  createNewWallet: async () => {
    const {
      ndkInstance,
      signer,
      setError,
      verifyAndUpdateBalance,
      nostrPrivKey,
    } = get();

    if (!ndkInstance || !signer) {
      console.error("[Wallet] NDK not ready");
      return null;
    }

    set({ isCreatingWallet: true });

    try {
      // Use signer's private key if available, otherwise use manually provided key
      let pk = signer.privateKey;

      // For NIP-07 users, use the manually provided private key
      if (!pk && nostrPrivKey && nostrPrivKey.startsWith("nsec")) {
        pk = decodeKey(nostrPrivKey);
        console.log(
          "[Wallet] Using manually provided private key for NIP-07 user",
        );
      }

      if (!pk) {
        console.error("[Wallet] No private key available for wallet creation");
        set({ isCreatingWallet: false });
        setError("Private key required to create wallet");
        return null;
      }

      const wallet = new NDKCashuWallet(ndkInstance);
      wallet.mints = [DEFAULT_MINT];
      wallet.privkey = pk;
      wallet.signer = new NDKPrivateKeySigner(pk);
      wallet.walletId = "Robots Building Education Wallet";

      ndkInstance.wallet = wallet;

      const user = await signer.user();
      abortDepositMonitors(user.pubkey);
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
      void get().resumePendingDeposit(user.pubkey);

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

  // Resume a deposit after quote creation, refresh, or identity restoration.
  resumePendingDeposit: async (ownerPubkey, options = {}) => {
    const activeMonitor = depositMonitors.get(ownerPubkey);
    if (activeMonitor) {
      activeMonitor.options = { ...activeMonitor.options, ...options };
      return activeMonitor.promise;
    }

    const initialRecord = readPendingDeposit(ownerPubkey);
    if (!initialRecord) return null;

    const controller = new AbortController();
    const monitor = { controller, options, promise: null };

    monitor.promise = (async () => {
      let record = initialRecord;

      try {
        const { cashuWallet } = get();
        if (!cashuWallet) return false;

        if (!record.proofs?.length) {
          set({ invoice: record.quote.request || "" });

          const mintWallet = await getMintWallet(record.mint);
          const result = await waitForBolt11MintQuote(
            mintWallet,
            record.quote,
            {
              signal: controller.signal,
              onQuote: (quote) => {
                record = { ...record, quote };
                writePendingDeposit(record);
              },
            },
          );

          if (result.state === "EXPIRED") {
            removePendingDeposit(ownerPubkey);
            set({
              invoice: "",
              isRefreshingAfterDeposit: false,
              errorMessage: "Deposit invoice expired",
            });
            callDepositCallback(
              monitor.options.onError,
              new Error("Deposit invoice expired"),
            );
            return false;
          }

          if (result.state === "ISSUED") {
            set({
              invoice: "",
              isRefreshingAfterDeposit: false,
              errorMessage:
                "This deposit was issued but its proofs could not be recovered",
            });
            callDepositCallback(
              monitor.options.onError,
              new Error("Issued deposit proofs are unavailable"),
            );
            return false;
          }

          set({ isRefreshingAfterDeposit: true });
          const modernProofs = await mintWallet.mintProofsBolt11(
            record.amount,
            result.quote,
          );

          // These proofs are bearer ecash. Persist them before the relay write so
          // a refresh can finish the operation without minting twice.
          record = {
            ...record,
            quote: result.quote,
            proofs: toNdkProofs(modernProofs),
          };
          writePendingDeposit(record);
        } else {
          set({ isRefreshingAfterDeposit: true });
        }

        // If the user switched identities while the mint request was in flight,
        // leave the recoverable record for that identity instead of writing its
        // bearer proofs into the newly active NDK wallet.
        if (controller.signal.aborted || get().cashuWallet !== cashuWallet) {
          return false;
        }

        const existingProofs =
          cashuWallet.state?.getProofs({ mint: record.mint }) || [];
        const proofsToStore = getProofsMissingFromState(
          record.proofs,
          existingProofs,
        );

        if (proofsToStore.length > 0) {
          await cashuWallet.state.update({
            store: proofsToStore,
            mint: record.mint,
          });
        }

        removePendingDeposit(ownerPubkey);
        const newBalance = await get().verifyAndUpdateBalance();
        set({
          invoice: "",
          isRefreshingAfterDeposit: false,
          errorMessage: null,
        });
        callDepositCallback(monitor.options.onSuccess, newBalance);
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return false;

        console.error("[Wallet] Deposit recovery failed");
        set({
          isRefreshingAfterDeposit: false,
          errorMessage: error.message || "Deposit failed",
        });
        callDepositCallback(monitor.options.onError, error);
        return false;
      } finally {
        if (depositMonitors.get(ownerPubkey) === monitor) {
          depositMonitors.delete(ownerPubkey);
        }
      }
    })();

    depositMonitors.set(ownerPubkey, monitor);
    return monitor.promise;
  },

  // Deposit sats
  initiateDeposit: async (amountInSats = 10, options = {}) => {
    const { cashuWallet, signer, setError, setInvoice } = get();
    const { onSuccess, onError } = options;

    if (!cashuWallet) {
      const error = new Error("Wallet not initialized");
      setError(error.message);
      callDepositCallback(onError, error);
      return null;
    }

    if (!signer) {
      const error = new Error("Nostr signer not initialized");
      setError(error.message);
      callDepositCallback(onError, error);
      return null;
    }

    try {
      const user = await signer.user();
      abortDepositMonitors(user.pubkey);

      const pending = readPendingDeposit(user.pubkey);
      if (pending) {
        const request = pending.quote.request || "";
        setInvoice(request);
        void get().resumePendingDeposit(user.pubkey, options);
        return request || null;
      }

      const quote = await createBolt11MintQuote(
        DEFAULT_MINT,
        amountInSats,
        "Deposit",
      );
      const record = {
        ownerPubkey: user.pubkey,
        mint: DEFAULT_MINT,
        amount: amountInSats,
        createdAt: Date.now(),
        quote,
      };

      writePendingDeposit(record);
      console.log("[Wallet] Invoice created");
      set({ invoice: quote.request, errorMessage: null });
      void get().resumePendingDeposit(user.pubkey, { onSuccess, onError });
      return quote.request;
    } catch (e) {
      console.error("[Wallet] Could not initiate deposit");
      setError(e.message || "Deposit failed");
      setInvoice("");
      callDepositCallback(onError, e);
      return null;
    }
  },

  // Send 1 sat via nutzap
  sendOneSatToNpub: async (
    recipientNpub = DEFAULT_RECEIVER,
    retryCount = 0,
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

      const cashuWalletInstance = await getMintWallet(DEFAULT_MINT);

      // Get proofs from wallet state
      let proofs = freshWallet.state?.getProofs({ mint: DEFAULT_MINT }) || [];
      if (proofs.length === 0) {
        throw new Error("No proofs available");
      }

      // Check which proofs are actually still spendable at the mint
      const validProofs = await checkUnspentProofs(DEFAULT_MINT, proofs);

      console.log("[Wallet] Total proofs:", proofs.length);
      console.log("[Wallet] Valid proofs:", validProofs.length);

      if (validProofs.length === 0) {
        throw new Error("No valid proofs available");
      }

      // Check if we have enough balance with valid proofs
      const validBalance = sumProofAmounts(validProofs);
      if (validBalance < amount) {
        throw new Error(`Insufficient valid balance: ${validBalance}`);
      }

      const recipientHex = decodeKey(recipientNpub);

      // Use only valid proofs for the send
      const result = await cashuWalletInstance.ops
        .send(amount, validProofs)
        .asP2PK({ pubkey: p2pkPubkey })
        .run();
      const keep = toNdkProofs(result.keep);
      const send = toNdkProofs(result.send);

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
          `[Wallet] Retrying... attempt ${retryCount + 1}/${MAX_RETRIES}`,
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
    abortDepositMonitors();
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
      isRefreshingAfterDeposit: false,
    });
  },
}));

export default useNostrWalletStore;
