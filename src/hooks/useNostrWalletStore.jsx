import { create } from "zustand";
import NDK, {
  NDKPrivateKeySigner,
  NDKEvent,
  NDKUser,
  NDKZapper,
} from "@nostr-dev-kit/ndk";

import { Buffer } from "buffer";
import { bech32 } from "bech32";

import NDKWalletService, { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import {
  clearStoredCashuBalance,
  loadStoredCashuBalance,
  normalizeCashuBalance,
  persistNormalizedCashuBalance,
} from "../utility/cashu";

const defaultMint = "https://mint.minibits.cash/Bitcoin";
const defaultRelays = ["wss://relay.damus.io", "wss://relay.primal.net"];
const defaultReceiver =
  "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt";

// using a global state with zustand.
// Basically, when this state updates, the app refreshes.

/**
 *  I don't recommend using stores because it can get developers in the habit of injecting data,
 *  eventually resulting in poor design of data.
 * */
export const useNostrWalletStore = create((set, get) => ({
  // State, not all is used
  isConnected: false, //not used: needed to create less connections to nostr
  errorMessage: null, //not used: needed to improve user experience if stuff goes wrong
  nostrPubKey: "",
  nostrPrivKey: "",
  ndkInstance: null,
  signer: null,
  walletService: null,
  cashuWallet: null,
  walletBalance: loadStoredCashuBalance(),
  invoice: "", //not used: needs to add ability to generate new QR/address (invoice) in case things expire

  isCreatingWallet: false,
  // functions to define state when the data gets created
  setError: (msg) => set({ errorMessage: msg }),
  setInvoice: (data) => set({ invoice: data }),

  updateWalletBalance: (rawBalance) => {
    const normalized = persistNormalizedCashuBalance(rawBalance);
    set({ walletBalance: normalized });
    return normalized;
  },

  // Converts your public identity into a public key.
  // think of your "npub key" as something identifiable for humans
  // think of a public key as something identifiable for machines
  // Kinda like using a visa card to pay
  getHexNPub: (npub) => {
    const { words: npubWords } = bech32.decode(npub);

    return Buffer.from(bech32.fromWords(npubWords)).toString("hex");
  },

  //Connect the user to the servers/transmitters
  connectToNostr: async (npubRef = null, nsecRef = null) => {
    //grab some state
    const { setError, nostrPrivKey, nostrPubKey } = get();

    //slop because I was testing blindly
    const defaultNsec = import.meta?.env?.VITE_GLOBAL_NOSTR_NSEC;
    const defaultNpub =
      "npub1mgt5c7qh6dm9rg57mrp89rqtzn64958nj5w9g2d2h9dng27hmp0sww7u2v";

    //grab nostr keypair we choose, or the one in state, or the default
    //pray to God it works
    const nsec = nsecRef || nostrPrivKey || defaultNsec;
    const npub = npubRef || nostrPubKey || defaultNpub;

    try {
      //convert human keypair into machine keypair
      const { words: nsecWords } = bech32.decode(nsec);
      const hexNsec = Buffer.from(bech32.fromWords(nsecWords)).toString("hex");

      const { words: npubWords } = bech32.decode(npub);
      const hexNpub = Buffer.from(bech32.fromWords(npubWords)).toString("hex");

      //define an object that gives you nostr's interface/abilities
      const ndkInstance = new NDK({
        explicitRelayUrls: defaultRelays,
      });

      // run the connection function
      await ndkInstance.connect();

      set({ isConnected: true });

      // return the object, the machine key, and the ability to sign/verify your actions/behvior
      return { ndkInstance, hexNpub, signer: new NDKPrivateKeySigner(hexNsec) };
    } catch (err) {
      console.error("Error connecting to Nostr:", err);
      setError(err.message);
      return null;
    }
  },

  //the library has refactored this away, so this is technically legacy code
  //sets up listeners that detect changes/updates to wallets
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
      // *another sanity check or ineffeciency
      // just make sure this data is defined before running the function
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
            throw new Error(
              "Unable to connect to Nostr. No NDK or Signer available."
            );
          }
        } else {
          throw new Error("NDK or signer not found and no keys to reconnect.");
        }
      }
      ndk.signer = s;
      const user = await s.user();
      user.signer = s;

      // get our wallet service capabilities
      const wService = new NDKWalletService(ndk);

      // Start the wallet service, listen for changes
      wService.start();

      // the valid and default wallet has been detected, a wallet exists
      wService.on("wallet:default", (w) => {
        `     `;
        // listen for balance changes
        setupWalletListeners(w);
      });

      set({ walletService: wService });
    } catch (error) {
      console.error("Error initializing wallet service:", error);
      setError(error.message);
    }
  },

  //detects balance changes
  setupWalletListeners: async (wallet) => {
    //*inefficiency, sanity check, make sure a wallet is defined
    if (!wallet || !(wallet instanceof NDKCashuWallet)) return;

    let testdata = await wallet.getP2pk();
    console.log("WALLET P2pk", testdata);
    // listen for updates to the balance, when a user answers a question, the balance should update
    wallet.on("balance_updated", async (balance) => {
      console.log("arg balance", balance);
      const bal = normalizeCashuBalance(balance || (await wallet.balance()));
      console.log("balanace...", bal);
      const { updateWalletBalance } = get();
      updateWalletBalance(bal);
    });

    // potentially writing a bug here
    // essentially checking the balance redundantly, resulting in outdated balance
    //woudn't be surprised if this runs first actually, we'll see
    try {
      await wallet.checkProofs();
    } catch (error) {
      console.error("Error validating wallet proofs:", error);
    }
    const initialBal = normalizeCashuBalance(await wallet.balance());
    console.log("initialBal", initialBal);
    const { updateWalletBalance } = get();
    updateWalletBalance(initialBal);
    set({
      cashuWallet: wallet,
    });
  },

  // The starting function,
  // Gets invoked when a real session is active & the user has created a wallet
  // - Define our identity in state
  // - Define our connection to nostr
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

        // await initWalletService(ndk, s);
      }
    }
  },

  createNewWallet: async () => {
    //grab state
    const {
      ndkInstance,
      signer,
      setError,
      initWalletService,
      setupWalletListeners,
      init,
      createNewWallet,
    } = get();

    set({ isCreatingWallet: true });

    if (!ndkInstance || !signer) {
      setError("NDK or signer not initialized. Cannot create wallet yet.");
      await init();
      await initWalletService();
      createNewWallet();
      return null;
    }

    try {
      const newWallet = new NDKCashuWallet(ndkInstance);
      newWallet.relays = defaultRelays;
      newWallet.setPublicTag("relay", "wss://relay.damus.io");
      newWallet.setPublicTag("relay", "wss://relay.primal.net");

      //define our wallet's ID
      newWallet.walletId = "Robots Building Education Wallet";

      //define our wallet's token issuer/bank
      newWallet.mints = [defaultMint];

      //define the unit of Bitcoin we're working with
      newWallet.unit = "sat";
      newWallet.setPublicTag("unit", "sat");
      newWallet.setPublicTag("d", "Robots Building Education Wallet");

      //define our wallet's signer
      const pk = signer.privateKey;
      if (pk) {
        newWallet.privkey = pk;
      }

      //publish the wallet to the transmitter so it knows what you've created for future reference
      await newWallet.publish();

      await init();
      await initWalletService();

      await setupWalletListeners(newWallet);

      set({ isCreatingWallet: false });
      return newWallet;
    } catch (error) {
      console.error("Error creating new wallet:", error);
      setError(error.message);
      return null;
    }
  },

  // gets payment data for the receiver
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

  // handles sending money to the receiver.
  sendOneSatToNpub: async (recipientNpub = defaultReceiver) => {
    const {
      cashuWallet,
      getHexNPub,
      ndkInstance,
      signer,
      fetchUserPaymentInfo,
      setError,
    } = get();

    //safety check, if a wallet is never defined, just exit the function
    if (!cashuWallet) {
      console.error("Wallet not initialized or no balance.");
      return;
    }

    try {
      const amount = 1000;
      const unit = "msat";

      // define user's issuer/bank or our default
      const mints =
        cashuWallet.mints.length > 0 ? cashuWallet.mints : [defaultMint];

      // get receiver's payment daata
      const { p2pkPubkey } = await fetchUserPaymentInfo(recipientNpub);

      //pass the information into a pay function
      const confirmation = await cashuWallet.cashuPay({
        amount,
        unit,
        mints,
        p2pk: p2pkPubkey,
      });

      // if expected payment success data isnt returned, throw an error
      const { proofs, mint } = confirmation;
      console.log("proofs", proofs);
      if (!proofs || !mint) {
        throw new Error("No proofs returned from cashuPay.");
      }

      //set up receiver's data
      const hexRecipient = getHexNPub(recipientNpub);
      const proofData = JSON.stringify({ proofs, mint });

      // set up call to the relays with payment information
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

      //sign it/confirm it and publish it to be stored
      await nutzapEvent.sign(signer);
      await nutzapEvent.publish();

      //sanity check
      await cashuWallet.checkProofs();

      //update the balance after the spend event occurs, deducting 1 sat from your deposits
      const updatedBalance = normalizeCashuBalance(await cashuWallet.balance());
      const { updateWalletBalance } = get();
      updateWalletBalance(updatedBalance);
    } catch (e) {
      console.error("Error sending nutzap:", e);
      setError(e.message);
    }
  },

  sendOneSatToNpubX: async (recipientNpub = defaultReceiver) => {
    const { ndkInstance, setError, set } = get();
    // set({ isSendingMoney: true });

    try {
      // 1) resolve the recipient to an NDKUser via NIP-05
      const user = await NDKUser.fromNip05(
        // recipientNpub,
        "sheilfer@primal.net",
        ndkInstance
      );

      // 2) create a zapper for 1 satoshi
      const zapper = new NDKZapper(user, 1, "sat", {
        comment: "testing from RO.B.E",
      });

      // 3) when it completes, flip the loading flag off
      zapper.on("complete", () => {
        console.log(`${recipientNpub} received your sat!`);
        // set({ isSendingMoney: false });
      });

      // 4) fire the zap
      await zapper.zap();
    } catch (err) {
      console.error("Error sending zap:", err);
      setError(err.message);
      // set({ isSendingMoney: false });
    }
  },

  //handles the deposit... gotta love self describing code

  initiateDeposit: async (amountInSats = 10) => {
    //get state
    const { cashuWallet, setError, setInvoice, init, initWalletService } =
      get();

    //safety check, if a wallet is never defined, just exit the function
    if (!cashuWallet) {
      console.error("Wallet not initialized.");
      return;
    }

    //run the deposit function with the cashu object
    const deposit = cashuWallet.deposit(amountInSats, defaultMint, "sat");

    // create the address/QR and start listening for changes
    const pr = await deposit.start();
    setInvoice(pr); // Store the invoice in Zustand

    // detect a successful deposit from a wallet like cash app
    deposit.on("success", async (token) => {
      await cashuWallet.checkProofs(); //sanity check, probably not needed

      // get new balance
      const updatedBalance = normalizeCashuBalance(await cashuWallet.balance());

      //updates balance state, probably triggers wallet listeners too
      const { updateWalletBalance } = get();
      updateWalletBalance(updatedBalance);

      setInvoice("");
    });

    deposit.on("error", (e) => {
      console.error("Deposit failed:", e);
      setError(e.message);
    });

    return pr;
  },

  // just resets state for log outs
  resetState: () => {
    clearStoredCashuBalance();
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
    });
  },
}));
