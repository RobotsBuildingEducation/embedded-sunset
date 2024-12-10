import { useState, useEffect } from "react";

import NDK, {
  NDKPrivateKeySigner,
  NDKKind,
  NDKEvent,
  NDKUser,
} from "@nostr-dev-kit/ndk";

import { Buffer } from "buffer";
import { bech32 } from "bech32";
import { getPublicKey, nip19 } from "nostr-tools";

// NEW IMPORTS FOR WALLET INTEGRATION
import NDKWalletService, { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";

/**
 * This hook manages Nostr keys, events (metadata, notes, etc.), and now also integrates
 * NDK-based Cashu wallet functionalities for cross-platform usage.
 *
 * All original logic from the initial provided snippet is retained.
 * We've added NDKWalletService and NDKCashuWallet initialization after the user keys are known.
 * We've also added a sendOneSatToNpub method to demonstrate sending 1 sat from
 * the configured cross-platform wallet.
 */

export const useNostrWallet = (
  initialNpub,
  initialNsec
  // setLocalCashu = null
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [nostrPubKey, setNostrPubKey] = useState(initialNpub || "");
  const [nostrPrivKey, setNostrPrivKey] = useState(initialNsec || "");

  // NEW STATES FOR WALLET INTEGRATION
  const [ndkInstance, setNdkInstance] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletService, setWalletService] = useState(null);
  const [cashuWallet, setCashuWallet] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const defaultMint = "https://mint.minibits.cash/Bitcoin";
  const defaultRelays = ["wss://relay.damus.io", "wss://relay.primal.net"];

  // useEffect(() => {
  //   if (cashuWallet) setLocalCashu(cashuWallet);
  // }, [cashuWallet]);
  useEffect(() => {
    // Load keys from local storage if they exist
    const storedNpub = localStorage.getItem("local_npub");
    const storedNsec = localStorage.getItem("local_nsec");

    if (storedNpub) {
      setNostrPubKey(storedNpub);
    }

    if (storedNsec) {
      setNostrPrivKey(storedNsec);
    }
  }, []);

  const fetchUserPaymentInfo = async (recipientNpub) => {
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
      // If no kind:10019, fallback to defaults
      return { mints: [defaultMint], p2pkPubkey: hexNpub, relays: [] };
    }

    // Parse tags
    let mints = [];
    let relays = [];
    let p2pkPubkey = null; // If provided in a 'pubkey' tag

    for (const tag of userEvent.tags) {
      const [t, v1, v2, v3] = tag;
      if (t === "mint" && v1) {
        mints.push(v1);
      } else if (t === "relay" && v1) {
        relays.push(v1);
      } else if (t === "pubkey" && v1) {
        p2pkPubkey = v1;
      }
    }

    if (mints.length === 0) {
      mints = [defaultMint];
    }

    // If no p2pkPubkey is provided, just use the recipient's main key.
    if (!p2pkPubkey) {
      p2pkPubkey = hexNpub;
    }

    return { mints, p2pkPubkey, relays };
  };
  const setProfilePicture = async (
    profilePictureUrl = "https://primal.b-cdn.net/media-cache?s=o&a=1&u=https%3A%2F%2Fm.primal.net%2FKBLq.png",
    npubRef,
    nsecRef
  ) => {
    const connection = await connectToNostr(npubRef, nsecRef);
    if (!connection) return;

    const { ndkInstance, hexNpub, signer } = connection;

    try {
      // Fetch current metadata (kind: 0 event)
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

      // Update the profile picture URL in the metadata
      currentMetadata.picture = profilePictureUrl;

      // Create a new metadata event (kind: 0)
      const metadataEvent = new NDKEvent(ndkInstance, {
        kind: NDKKind.Metadata,
        pubkey: hexNpub,
        created_at: Math.floor(Date.now() / 1000),
        content: JSON.stringify(currentMetadata),
      });

      // Sign and publish the metadata event
      await metadataEvent.sign(signer);
      await metadataEvent.publish();

      console.log("Profile picture updated successfully.");
    } catch (err) {
      console.error("Error setting profile picture on Nostr:", err);
    }
  };

  const generateNostrKeys = async (
    userDisplayName = null,
    setLoadingMessage,
    profileAbout,
    introductionPost
  ) => {
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

    setNostrPrivKey(encodedNsec);
    setNostrPubKey(publicKey);

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
        postNostrContent(introductionPost, 1, publicKey, encodedNsec);
      }
    }

    localStorage.setItem("local_nsec", encodedNsec);
    localStorage.setItem("local_npub", publicKey);
    localStorage.setItem("uniqueId", publicKey);

    return { npub: publicKey, nsec: encodedNsec };
  };

  const connectToNostr = async (npubRef = null, nsecRef = null) => {
    const defaultNsec = import.meta?.env?.VITE_GLOBAL_NOSTR_NSEC;
    const defaultNpub =
      "npub1mgt5c7qh6dm9rg57mrp89rqtzn64958nj5w9g2d2h9dng27hmp0sww7u2v";

    const nsec = nsecRef || nostrPrivKey || defaultNsec;
    const npub = npubRef || nostrPubKey || defaultNpub;

    try {
      // Decode the nsec from Bech32
      const { words: nsecWords } = bech32.decode(nsec);
      const hexNsec = Buffer.from(bech32.fromWords(nsecWords)).toString("hex");

      // Decode the npub from Bech32
      const { words: npubWords } = bech32.decode(npub);
      const hexNpub = Buffer.from(bech32.fromWords(npubWords)).toString("hex");

      // Create a new NDK instance
      const ndkInstance = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
      });

      await ndkInstance.connect();

      setIsConnected(true);

      return { ndkInstance, hexNpub, signer: new NDKPrivateKeySigner(hexNsec) };
    } catch (err) {
      console.error("Error connecting to Nostr:", err);
      setErrorMessage(err.message);
      return null;
    }
  };

  const auth = (nsecPassword) => {
    let testnsec = nsecPassword;

    let decoded = nip19.decode(testnsec);

    const pubkey = getPublicKey(decoded.data);

    const ndk = new NDK({
      explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
    });

    let user = ndk.getUser({ pubkey: pubkey });

    setNostrPrivKey(testnsec);
    setNostrPubKey(user.npub);

    localStorage.setItem("local_nsec", testnsec);
    localStorage.setItem("local_npub", user.npub);
    localStorage.setItem("uniqueId", user.npub);
  };

  const postNostrContent = async (
    content,
    kind = NDKKind.Text,
    npubRef = null,
    nsecRef = null
  ) => {
    const connection = await connectToNostr(npubRef, nsecRef);
    if (!connection) return;

    const { ndkInstance, hexNpub, signer } = connection;

    // Create a new note event
    const noteEvent = new NDKEvent(ndkInstance, {
      kind,
      tags: [],
      content: content,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: hexNpub,
    });

    try {
      await noteEvent.sign(signer);
    } catch (error) {
      console.error("Error signing note event:", error);
    }

    try {
      await noteEvent.publish();
    } catch (error) {
      console.log("error publishing note event:", error);
    }
  };

  const getHexNPub = (npub) => {
    const { words: npubWords } = bech32.decode(npub);
    const hexNpub = Buffer.from(bech32.fromWords(npubWords)).toString("hex");
    return hexNpub;
  };

  const assignExistingBadgeToNpub = async (
    badgeNaddr,
    awardeeNpub = localStorage.getItem("local_npub"),
    ownerNsec = import.meta?.env?.VITE_SECRET_KEY
  ) => {
    if (!awardeeNpub) {
      console.error("Awardee public key is required to award the badge.");
      return;
    }

    if (!ownerNsec) {
      console.error(
        "Owner's private key is required to sign the badge award event."
      );
      return;
    }

    const connection = await connectToNostr(
      "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
      ownerNsec
    );
    if (!connection) return;

    const { ndkInstance, signer } = connection;

    const badgeAwardEvent = new NDKEvent(ndkInstance, {
      kind: NDKKind.BadgeAward, // Badge Award event kind (30009)
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
    } catch (error) {
      console.error("Error signing badge event:", error);
    }

    try {
      await badgeAwardEvent.publish();
      console.log("Badge awarded successfully to:", awardeeNpub);
    } catch (error) {
      console.error("Error publishing badge event:", error);
    }
  };

  const getAddressPointer = (naddr) => {
    return nip19.decode(naddr).data;
  };

  const getBadgeData = async (addy) => {
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
      setErrorMessage(error.message);
      return [];
    }
  };

  const getUserBadges = async (npub = localStorage.getItem("local_npub")) => {
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
        const badgeInfo = {
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
        };
        badges.push(badgeInfo);
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
            if (tag[0] === "name") {
              name = tag[1];
            }
            if (tag[0] === "image") {
              image = tag[1];
            }
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
  };

  const getLastNotesByNpub = async (npub) => {
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
      setErrorMessage(error.message);
      return [];
    }
  };

  async function createNewWallet(
    mintUrls = [],
    relayUrls = defaultRelays,
    walletName = "My Wallet"
  ) {
    if (!ndkInstance || !signer) {
      setErrorMessage(
        "NDK or signer not initialized. Cannot create wallet yet."
      );
      return null;
    }

    // Create a new NDKCashuWallet event
    const newWallet = new NDKCashuWallet(ndkInstance);
    newWallet.name = walletName;
    newWallet.relays = relayUrls;
    newWallet.setPublicTag("relay", "wss://relay.damus.io");
    newWallet.setPublicTag("relay", "wss://relay.primal.net");

    newWallet.mints = mintUrls.length > 0 ? mintUrls : [defaultMint];
    newWallet.walletId = "my-wallet-id"; // This ensures a 'd' tag is included when publishing

    newWallet.unit = "sat";
    newWallet.setPublicTag("unit", "sat");
    // If you want P2PK locking:
    // For new users who have no privkey set, generate one:
    // Note: If you have a known privkey, you can set it here.
    const pk = signer.privateKey;
    if (pk) {
      newWallet.privkey = pk;
    }

    // Publish the wallet event so that it’s discoverable

    try {
      await newWallet.publish();
      console.log("Published wallet event:", newWallet.event.rawEvent());
      const connection = await connectToNostr(
        localStorage.getItem("local_npub"),
        localStorage.getItem("local_nsec")
      );
      // console.log("connection....d.d.d.d.d", connection);
      if (!connection) return;

      const { ndkInstance: ndk, hexNpub, signer: s } = connection;

      setNdkInstance(ndk);
      setSigner(s);
      console.log("initlizating wallet.");
      await initWalletService(ndk, s);
      await setupWalletListeners(newWallet); // This sets cashuWallet and balance

      setCashuWallet(newWallet);

      // After publishing, if you want a mint list event:
      // const cashuMintList = new NDKCashuMintList(ndkInstance);
      // cashuMintList.relays = relayUrls;
      // cashuMintList.mints = mintUrls;
      // await cashuMintList.publishReplaceable();
      // const connection = await connectToNostr(
      //   localStorage.getItem("local_npub", localStorage.getItem("local_nsec"))
      // );
      // // console.log("connection....d.d.d.d.d", connection);
      // if (!connection) return;

      // const { ndkInstance: ndk, hexNpub, signer: s } = connection;

      // setNdkInstance(ndk);
      // setSigner(s);
      // console.log("initlizating wallet.");
      // await initWalletService(ndk, s);

      return newWallet;
    } catch (error) {
      console.error("Error creating new wallet:", error);
      setErrorMessage(error.message);
      return null;
    }
  }
  // NEW FUNCTION: INIT WALLET SERVICE
  const initWalletService = async (ndk, signer) => {
    ndk.signer = signer;
    const user = await signer.user();
    console.log("User pubkey on refresh:", user.pubkey);

    user.signer = signer;

    const wService = new NDKWalletService(ndk);
    wService.on("wallet:default", (w) => {
      console.log("wallet:default", w);
      setupWalletListeners(w);
    });
    wService.on("wallet", (w) => {
      // could handle multiple wallets if needed
      console.log("on wallet", w);
    });

    wService.start();

    console.log("WSERV", wService);
    console.log("WALLETSXXXX", wService.wallets);
    setWalletService(wService);
  };

  // Initialize NDK and wallet once we have keys
  useEffect(() => {
    (async () => {
      // console.log("np", nostrPubKey);
      // console.log("ns", nostrPrivKey);
      if (!nostrPubKey || !nostrPrivKey) return;
      const connection = await connectToNostr(
        localStorage.getItem("local_npub"),
        localStorage.getItem("local_nsec")
      );
      // console.log("connection....d.d.d.d.d", connection);
      if (!connection) return;

      const { ndkInstance: ndk, hexNpub, signer: s } = connection;

      setNdkInstance(ndk);
      setSigner(s);
      console.log("initlizating wallet.");
      await initWalletService(ndk, s);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nostrPubKey, nostrPrivKey]);

  // NEW METHOD: SEND 1 SAT TO SPECIFIC NPUB
  // const sendOneSatToNpub = async (recipientNpub) => {
  //   if (!cashuWallet) {
  //     console.error("Wallet not initialized or no balance.");
  //     return;
  //   }

  //   try {
  //     const amount = 1; // sending 1 sat
  //     const unit = "sat";
  //     const { proofs, mint } = await cashuWallet.cashuPay({
  //       amount,
  //       unit,
  //       info: {
  //         mints: [defaultMint], // Ensure you have defined defaultMint somewhere as "https://mint.minibits.cash/Bitcoin"
  //       },
  //     });

  //     // Optionally notify the recipient via a Nostr event:
  //     await postNostrContent(
  //       Sent you ${amount} ${unit} using ${mint},
  //       NDKKind.Text,
  //       recipientNpub,
  //       nostrPrivKey
  //     );
  //     console.log(Successfully sent 1 sat to ${recipientNpub}!);
  //   } catch (e) {
  //     console.error("Error sending 1 sat:", e);
  //   }
  // };

  const sendOneSatToNpub = async (recipientNpub) => {
    if (!cashuWallet) {
      console.error("Wallet not initialized or no balance.");
      return;
    }

    try {
      const amount = 1000;
      const unit = "msat";
      const mints =
        cashuWallet.mints.length > 0 ? cashuWallet.mints : [defaultMint];

      // Fetch recipient payment info: mints, p2pkPubkey, etc.
      const {
        // mints,
        p2pkPubkey,
        relays,
      } = await fetchUserPaymentInfo(recipientNpub);

      // Use cashuPay instead of nutPay
      // NutPayment = { amount, unit, mints, p2pk?: string }
      const confirmation = await cashuWallet.cashuPay({
        amount,
        unit,
        mints,
        p2pk: p2pkPubkey,
      });

      // confirmation should have { proofs, mint } for the ecash
      const { proofs, mint } = confirmation;
      if (!proofs || !mint) {
        console.log("mint", mint);
        console.log("proofs", proofs);
        throw new Error("No proofs returned from cashuPay.");
      }

      // Create kind:9321 nutzap event,
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
      console.log("Updated balance after sending:", updatedBalance);
      setWalletBalance(updatedBalance || []);

      console.log(`Successfully sent nutzap (1 sat) to ${recipientNpub}!`);
    } catch (e) {
      console.error("Error sending nutzap:", e);
    }
  };

  const initiateDeposit = async (amountInSats = 10) => {
    console.log("CASHU", cashuWallet);

    if (!cashuWallet) {
      console.error("Wallet not initialized.");
      return;
    }

    // We assume the default mint and unit "sat" from the code above
    const deposit = cashuWallet.deposit(amountInSats, defaultMint, "sat");
    const pr = await deposit.start(); // This returns a LN invoice (bolt11)

    deposit.on("success", async (token) => {
      console.log("Deposit successful!", token);
      await cashuWallet.checkProofs();
      const updatedBalance = await cashuWallet.balance();
      setWalletBalance(updatedBalance || []);
      setInvoice(""); // Clear invoice after success
    });

    deposit.on("error", (e) => {
      console.error("Deposit failed:", e);
    });

    return pr;
  };

  const setupWalletListeners = async (wallet) => {
    if (!wallet) return;
    if (wallet && wallet instanceof NDKCashuWallet) {
      wallet.on("balance_updated", async () => {
        const bal = (await wallet.balance()) || [];
        setWalletBalance(bal);
      });

      // Set initial balance if available
      const initialBal = (await wallet.balance()) || [];
      setWalletBalance(initialBal);
      setCashuWallet(wallet);
    }
  };

  return {
    isConnected,
    errorMessage,
    nostrPubKey,
    nostrPrivKey,
    generateNostrKeys,
    postNostrContent,
    auth,
    assignExistingBadgeToNpub,
    getUserBadges,
    getLastNotesByNpub,
    setProfilePicture,
    // sendOneSatToNpub,
    initiateDeposit,
    sendOneSatToNpub,
    cashuWallet,
    walletBalance,
    createNewWallet,
  };
};
