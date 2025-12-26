import { useState, useEffect } from "react";

import { Buffer } from "buffer";
import { bech32 } from "bech32";
import { nip19, nip04 } from "nostr-tools";
import NDK, {
  NDKPrivateKeySigner,
  NDKNip07Signer,
  NDKKind,
  NDKEvent,
} from "@nostr-dev-kit/ndk";

const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
});

const isHex64 = (s) => typeof s === "string" && /^[0-9a-f]{64}$/i.test(s);

const toHexPriv = (nsecOrHex) => {
  if (isHex64(nsecOrHex)) return nsecOrHex.toLowerCase();
  const { words } = bech32.decode(nsecOrHex);
  return Buffer.from(bech32.fromWords(words)).toString("hex");
};

const toHexPub = (npubOrHex) => {
  if (isHex64(npubOrHex)) return npubOrHex.toLowerCase();
  const { words } = bech32.decode(npubOrHex);
  return Buffer.from(bech32.fromWords(words)).toString("hex");
};

const ensureConnectedWithSigner = async (hexPriv) => {
  const signer = new NDKPrivateKeySigner(hexPriv);
  ndk.signer = signer;
  await signer.blockUntilReady();
  // Connect once (idempotent if already connected)
  await ndk.connect();
  return signer;
};

export const useSharedNostr = (initialNpub, initialNsec) => {
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [nostrPubKey, setNostrPubKey] = useState(initialNpub || "");
  const [nostrPrivKey, setNostrPrivKey] = useState(initialNsec || "");

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

    ndk
      .connect()
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => {
        console.error("Error connecting to Nostr:", err);
        setErrorMessage(err.message);
      });
  }, []);

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
      const metadataEvent = new (ndkInstance,
      {
        kind: NDKKind.Metadata,
        pubkey: hexNpub,
        created_at: Math.floor(Date.now() / 1000),
        content: JSON.stringify(currentMetadata),
      })();

      // Sign and publish the metadata event
      await metadataEvent.sign(signer);
      await metadataEvent.publish();
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
    setLoadingMessage("createAccount.isCreating");
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
      //Creating profile... 2/4
      setLoadingMessage("createAccount.isCreatingProfile");

      postNostrContent(
        JSON.stringify({
          name: userDisplayName,
          about: profileAbout,
          // profilePictureUrl:
          //   "https://image.nostr.build/c8d21fe8773d7c5ddf3d6ef73ffe76dbeeec881c131bfb59927ce0b8b71a5607.png",
          // // "https://primal.b-cdn.net/media-cache?s=o&a=1&u=https%3A%2F%2Fm.primal.net%2FKBLq.png",
        }),
        0,
        publicKey,
        encodedNsec
      );

      // setLoadingMessage("createAccount.isCreatingProfilePicture");
      // //Creating profile picture... 3/4
      // setProfilePicture(
      //   "https://primal.b-cdn.net/media-cache?s=o&a=1&u=https%3A%2F%2Fm.primal.net%2FKBLq.png",
      //   publicKey,
      //   encodedNsec
      // );

      // if (
      //   window.location.hostname !== "localhost" &&
      //   window.location.hostname !== "127.0.0.1"
      // ) {

      setLoadingMessage("createAccount.isCreatingIntroPost");
      //Creating introduction post... 4/4
      if (window.location.hostname !== "localhost") {
        postNostrContent(introductionPost, 1, publicKey, encodedNsec);
      }
      // await followUserOnNostr(
      //   "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
      //   publicKey,
      //   encodedNsec
      // );
    }

    localStorage.setItem("local_nsec", encodedNsec);
    localStorage.setItem("local_npub", publicKey);
    localStorage.setItem("uniqueId", publicKey);

    return { npub: publicKey, nsec: encodedNsec };
  };

  const connectToNostr = async (npubRef = null, nsecRef = null) => {
    const defaultNsec = import.meta.env.VITE_GLOBAL_NOSTR_NSEC;
    const defaultNpub =
      "npub1mgt5c7qh6dm9rg57mrp89rqtzn64958nj5w9g2d2h9dng27hmp0sww7u2v";

    const nsec =
      nsecRef ||
      localStorage.getItem("local_nsec") ||
      nostrPrivKey ||
      defaultNsec;
    const npub =
      npubRef ||
      localStorage.getItem("local_npub") ||
      nostrPubKey ||
      defaultNpub;

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

      // Return the connected NDK instance and signer
      return { ndkInstance, hexNpub, signer: new NDKPrivateKeySigner(hexNsec) };
    } catch (err) {
      console.error("Error connecting to Nostr:", err);
      setErrorMessage(err.message);
      return null;
    }
  };

  const auth = async (nsec) => {
    try {
      // Decode nsec to hex
      const { words: nsecWords } = bech32.decode(nsec);
      const hexNsec = Buffer.from(bech32.fromWords(nsecWords)).toString("hex");

      const signer = new NDKPrivateKeySigner(hexNsec);
      await signer.blockUntilReady(); // Wait for signer user resolution
      ndk.signer = signer;

      const user = await signer.user();
      setNostrPubKey(user.npub);
      setNostrPrivKey(nsec);
      localStorage.setItem("local_npub", user.npub);
      localStorage.setItem("local_nsec", nsec);
      setErrorMessage(null);

      return { user, signer };
    } catch (error) {
      console.error("Error logging in with keys:", error);
      setErrorMessage(error.message);
      return null;
    }
  };

  const checkNip07Available = () => {
    return typeof window !== "undefined" && window.nostr;
  };

  const authWithNip07 = async () => {
    try {
      if (!checkNip07Available()) {
        setErrorMessage("No NIP-07 extension found. Please install a Nostr signer extension like nos2x, Alby, or similar.");
        return null;
      }

      const nip07Signer = new NDKNip07Signer();
      await nip07Signer.blockUntilReady();
      ndk.signer = nip07Signer;

      const user = await nip07Signer.user();
      const npub = user.npub;

      setNostrPubKey(npub);
      localStorage.setItem("local_npub", npub);
      localStorage.setItem("nip07_login", "true");
      setErrorMessage(null);

      return { user, signer: nip07Signer, isNip07: true };
    } catch (error) {
      console.error("Error logging in with NIP-07:", error);
      setErrorMessage(error.message);
      return null;
    }
  };

  const saveNsecForNip07User = (nsec) => {
    try {
      // Validate the nsec
      const { words: nsecWords } = bech32.decode(nsec);
      Buffer.from(bech32.fromWords(nsecWords)).toString("hex");

      localStorage.setItem("local_nsec", nsec);
      setNostrPrivKey(nsec);
      return true;
    } catch (error) {
      console.error("Invalid nsec provided:", error);
      setErrorMessage("Invalid secret key format");
      return false;
    }
  };

  const postNostrContent = async (
    content,
    kind = NDKKind.Text,
    npubRef = null,
    nsecRef = null
  ) => {
    try {
      // If a nsecRef is provided, login with it
      if (nsecRef) {
        const loginResult = await auth(nsecRef);
        if (!loginResult) return;
      }

      // Ensure we have a signer after login
      if (!ndk.signer) {
        setErrorMessage("No signer available. Please login first.");
        return;
      }

      // If npubRef is provided, we can decode it to hex if needed.
      // But it's generally not required since NDKEvent uses ndk.signer to determine the pubkey.
      const event = new NDKEvent(ndk, {
        kind,
        tags: [],
        content: content,
        created_at: Math.floor(Date.now() / 1000),
      });

      await event.sign(ndk.signer);
      const relays = await event.publish();

      if (relays.size > 0) {
        console.log("Posted successfully to relays:", Array.from(relays));
      } else {
        console.warn("No relay acknowledged the event.");
      }
    } catch (error) {
      console.error("Error posting content:", error);
      setErrorMessage(error.message);
    }
  };

  const getHexNPub = (npub) => {
    // Decode the npub from Bech32
    const { words: npubWords } = bech32.decode(npub);
    const hexNpub = Buffer.from(bech32.fromWords(npubWords)).toString("hex");

    return hexNpub;
  };

  const assignExistingBadgeToNpub = async (
    badgeNaddr, //name or address
    awardeeNpub = localStorage.getItem("local_npub"), // The public key of the user being awarded
    ownerNsec = import.meta.env.VITE_SECRET_KEY // Your private key to sign the event
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

    const { words: nsecWords } = bech32.decode(ownerNsec);
    const hexNsec = Buffer.from(bech32.fromWords(nsecWords)).toString("hex");

    let signer = new NDKPrivateKeySigner(hexNsec);

    // Connect to Nostr as the badge owner
    // const connection = await connectToNostr(
    //   "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
    //   ownerNsec
    // );

    // Create the event for awarding the badge
    const badgeAwardEvent = new NDKEvent(ndk, {
      kind: NDKKind.BadgeAward, // Badge Award event kind
      tags: [
        // ["a", badgeNaddr], // Reference to the Badge Definition event
        [
          "a",
          `${NDKKind.BadgeDefinition}:${getHexNPub(
            "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
          )}:${badgeNaddr}`,
        ],
        ["p", getHexNPub(localStorage.getItem("local_npub"))],
      ],
      created_at: Math.floor(Date.now() / 1000),
      //npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt
      // pubkey: getHexNPub(
      //   "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
      // ),
      // Your public key as the issuer
    });

    // Sign the badge event
    try {
      await badgeAwardEvent.sign(signer);
    } catch (error) {
      console.error("Error signing badge event:", error);
    }

    // Publish the badge event
    try {
      await badgeAwardEvent.publish();
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

      // Parse a-pointer robustly
      const parts = String(addy).split(":");
      const off = parts[0] === "a" ? 1 : 0;
      if (parts.length - off < 3) return [];

      const kind = Number(parts[off + 0]);
      const issuer = (parts[off + 1] || "").toLowerCase();
      const d = parts[off + 2];

      const BADGE_DEFINITION_KIND =
        typeof NDKKind !== "undefined" &&
        typeof NDKKind.BadgeDefinition === "number"
          ? NDKKind.BadgeDefinition
          : 30009;

      const filter = {
        kinds: [BADGE_DEFINITION_KIND], // definition (NIP-58)
        authors: [issuer],
        "#d": [d],
        limit: 1,
      };

      return await new Promise((resolve) => {
        const sub = ndkInstance.subscribe(filter, { closeOnEose: true });

        const out = [];
        const seen = new Set();

        // We aim to see EOSE from all relays in the relaySet, then wait a tiny idle period.
        // If relaySet is unknown, we still finish via idle/hard timeout.
        const targetRelays =
          (sub.relaySet && sub.relaySet.size) ||
          (ndkInstance.pool?.relays ? ndkInstance.pool.relays.size : 0);

        let eoseCount = 0;
        let idleTimer = null;

        const IDLE_MS = 800; // wait this long after the last event/EOSE
        const HARD_MS = 8000; // absolute cap so we never hang

        const armIdle = () => {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            clearTimeout(idleTimer);
            try {
              sub.stop?.();
            } catch {}
            resolve(out);
          }, IDLE_MS);
        };

        sub.on("event", (event) => {
          if (!seen.has(event.id)) {
            seen.add(event.id);
            out.push({
              id: event.id,
              content: event.content,
              createdAt: event.created_at,
              tags: event.tags,
              badgeAddress: addy,
            });
          }
          armIdle(); // every event restarts the idle timer
        });

        sub.on("eose", () => {
          eoseCount += 1;
          // If we know the relay count, wait for all of them; otherwise, just rely on idle window.
          if (targetRelays === 0 || eoseCount >= targetRelays) {
            armIdle(); // let any straggler events flush before resolving
          }
        });

        // Hard safety cap
        setTimeout(() => {
          try {
            sub.stop?.();
          } catch {}
          resolve(out);
        }, HARD_MS);
      });
    } catch (error) {
      console.error("Error retrieving badges:", error);
      setErrorMessage?.(error.message);
      return [];
    }
  };
  const getUserBadges = async (npub = localStorage.getItem("local_npub")) => {
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;

      const hexNpub = getHexNPub(npub); // Convert npub to hex

      // Create a filter for badge award events (kind 30009) where the user is the recipient
      const filter = {
        kinds: [NDKKind.BadgeAward], // Kind 30009 for badge awards
        "#p": [hexNpub], // Filter by the user's hex-encoded public key as the recipient
        limit: 100, // Adjust the limit as needed
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
          badges.flatMap(
            (badge) =>
              badge.tags
                .filter((tag) => tag[0] === "a" && tag[1]) // Find tags where the first element is "a"
                .map((tag) => tag[1]) // Extract the naddress
          )
        ),
      ];

      let badgeData = uniqueNAddresses.map((naddress) =>
        getBadgeData(naddress)
      );

      let resolvedBadges = await Promise.all(badgeData);

      const formattedBadges = [];

      // Loop through each outer array in the badgeDataArray
      resolvedBadges.forEach((badgeArray) => {
        // For each inner badge object array (which should have one object), extract name and image

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

          // Push the object containing name and image to the badges array
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

  // const followUserOnNostr = async (pubkeyToFollow, npubRef, nsecRef) => {
  //   const connection = await connectToNostr(npubRef, nsecRef);
  //   if (!connection) return;

  //   const { ndkInstance, hexNpub, signer } = connection;

  //   try {
  //     const contactList = [];
  //     let subscription;

  //     // Subscribe to current user's kind-3 (Follow List) event
  //     subscription = ndkInstance.subscribe({
  //       kinds: [NDKKind.ContactList],
  //       authors: [getHexNPub(pubkeyToFollow)],
  //       limit: 1,
  //     });

  //     subscription.on("event", (event) => {
  //       // Extract the follow list from the 'p' tags
  //       event.tags.forEach((tag) => {
  //         console.log("there is an event tag");
  //         if (tag[0] === "p") {
  //           console.log("there is a key", tag);

  //           contactList.push(tag[1]); // Push hex key of followed profile
  //         }
  //       });
  //     });

  //     console.log("contactList...", contactList);
  //     // Wait for the subscription to finish or timeout after 5 seconds
  //     await new Promise((resolve, reject) => {
  //       const timeout = setTimeout(() => {
  //         console.warn("Subscription timed out.");
  //         resolve();
  //       }, 5000);

  //       subscription.on("eose", () => {
  //         clearTimeout(timeout);
  //         subscription.unsub(); // Unsubscribe once we receive 'eose'
  //         resolve();
  //       });
  //     });

  //     // Check if the user is already being followed
  //     if (!contactList.includes(pubkeyToFollow)) {
  //       contactList.push(getHexNPub(pubkeyToFollow)); // Add new pubkey if not already in the list
  //     }

  //     // Construct the new kind-3 (Follow List) event
  //     const contactListEvent = new NDKEvent(ndkInstance, {
  //       kind: NDKKind.ContactList, // Kind 3 - Follow List
  //       tags: contactList.map((pubkey) => ["p", pubkey, "", ""]), // Format as per NIP-02
  //       pubkey: hexNpub, // Your public key
  //       created_at: Math.floor(Date.now() / 1000), // Unix timestamp
  //       content: "", // Content not used in kind 3 events
  //     });

  //     // Sign the event with the user's private key (via signer)
  //     await contactListEvent.sign(signer);

  //     // Publish the new kind-3 event (updated follow list)
  //     await contactListEvent.publish();

  //     console.log(Successfully followed user with pubkey: ${pubkeyToFollow});
  //   } catch (err) {
  //     console.error("Error following user on Nostr:", err);
  //   }
  // };

  const getGlobalNotesByHashtag = async (hashtag = "LearnWithNostr") => {
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;

      // Create a filter for kind: 1 (text notes) that contain the specified hashtag
      const filter = {
        kinds: [NDKKind.Text], // Kind 1 is for text notes
        "#t": [hashtag], // Filter for tags where the first element is "t" and matches the hashtag
        limit: 100, // Adjust the limit as needed
      };

      // Create a subscription to fetch the events
      const subscription = ndkInstance.subscribe(filter, { closeOnEose: true });

      const notes = [];

      subscription.on("event", (event) => {
        const npub = bech32.encode(
          "npub",
          bech32.toWords(Buffer.from(event.pubkey, "hex"))
        );
        notes.push({
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
          id: event.id,
          npub,
        });
      });

      // Wait for the subscription to finish
      await new Promise((resolve) => subscription.on("eose", resolve));

      // Return the retrieved notes
      // console.log("global notes...", notes);

      // const encodedNpub = bech32.encode(
      //   "npub",
      //   bech32.toWords(Buffer.from(publicKey, "hex"))
      // );

      // console.log('npub', encodedNpub)

      return notes;
    } catch (error) {
      console.error("Error retrieving global notes by hashtag:", error);
      setErrorMessage(error.message);
      return [];
    }
  };

  const getUserProfile = async (npub) => {
    try {
      const connection = await connectToNostr();
      if (!connection) return null;

      const { ndkInstance } = connection;
      const hexNpub = getHexNPub(npub); // Convert npub to hex

      // Create a filter for kind: 0 (profile metadata) by the author
      const filter = {
        kinds: [NDKKind.Metadata],
        authors: [hexNpub],
        limit: 1,
      };

      // Create a subscription to fetch the metadata
      const subscription = ndkInstance.subscribe(filter, { closeOnEose: true });

      let profile = null;

      subscription.on("event", (event) => {
        profile = JSON.parse(event.content); // Parse the profile metadata
      });

      // Wait for the subscription to finish
      await new Promise((resolve) => subscription.on("eose", resolve));

      return profile;
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      setErrorMessage(error.message);
      return null;
    }
  };
  const getLastNotesByNpub = async (
    npub = localStorage.getItem("local_npub")
  ) => {
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;
      const hexNpub = getHexNPub(npub); // Convert npub to hex

      // Create a filter for kind: 1 (text notes) by the author
      const filter = {
        kinds: [NDKKind.Text], // Kind 1 is for text notes
        authors: [hexNpub], // Filter by the author's public key
        limit: 5, // Limit to the last 100 events
      };

      // Create a subscription to fetch the events
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

      // Wait for the subscription to finish
      await new Promise((resolve) => subscription.on("eose", resolve));

      // Return the retrieved notes

      return notes;
    } catch (error) {
      console.error("Error retrieving notes:", error);
      setErrorMessage(error.message);
      return [];
    }
  };
  const getGlobalNotesWithProfilesByHashtag = async (
    hashtag = "LearnWithNostr"
  ) => {
    try {
      const connection = await connectToNostr();
      if (!connection) return [];

      const { ndkInstance } = connection;

      // Step 1: Fetch notes with the hashtag
      const notesFilter = {
        kinds: [NDKKind.Text], // Kind 1 for text notes
        "#t": [hashtag], // Filter for the hashtag
        limit: 50, // Adjust the limit as needed
      };

      const notesSubscription = ndkInstance.subscribe(notesFilter, {
        closeOnEose: true,
      });

      const notes = [];
      const pubkeys = new Set(); // To store unique pubkeys

      notesSubscription.on("event", (event) => {
        notes.push({
          content: event.content,
          createdAt: event.created_at,
          tags: event.tags,
          id: event.id,
          pubkey: event.pubkey, // Store the pubkey for later use
          npub: bech32.encode(
            "npub",
            bech32.toWords(Buffer.from(event.pubkey, "hex"))
          ),
          profile: null, // Placeholder for profile data
        });
        pubkeys.add(event.pubkey); // Add the author's pubkey to the set
      });

      await new Promise((resolve) => notesSubscription.on("eose", resolve));

      // Step 2: Fetch profiles for all unique pubkeys
      const profilesFilter = {
        kinds: [NDKKind.Metadata], // Kind 0 for metadata
        authors: Array.from(pubkeys), // Batch query for all pubkeys
      };

      const profilesSubscription = ndkInstance.subscribe(profilesFilter, {
        closeOnEose: true,
      });

      const profilesMap = new Map(); // Map to store profiles by pubkey

      profilesSubscription.on("event", (event) => {
        const metadata = JSON.parse(event.content);
        profilesMap.set(event.pubkey, {
          name: metadata.name || "New Private User",
          about: metadata.about || "",
          picture: metadata.picture || "",
        });
      });

      await new Promise((resolve) => profilesSubscription.on("eose", resolve));

      // Step 3: Merge notes with profiles
      const notesWithProfiles = notes.map((note) => {
        note.profile = profilesMap.get(note.pubkey) || {
          name: "New Private User",
          about: "",
          picture: "",
        };
        return note;
      });

      return notesWithProfiles;
    } catch (error) {
      console.error("Error fetching notes with profiles:", error);
      return [];
    }
  };

  /**
   * Send a direct message (DM) via Nostr
   * @param {string} recipientNpub - The recipient's npub
   * @param {string} message - The message content
   * @param {string} senderNsec - Optional sender's nsec (defaults to logged in user)
   * @returns {boolean} success - Whether the DM was sent successfully
   */
  const sendDirectMessage = async (
    recipientNpub, // npub... or hex
    message, // plaintext to encrypt
    senderNsec = null // nsec... or hex; falls back to local
  ) => {
    try {
      const nsec =
        senderNsec || localStorage.getItem("local_nsec") || nostrPrivKey;

      if (!nsec) {
        setErrorMessage("No private key available to send DM");
        return false;
      }

      // Normalize keys
      const hexPriv = toHexPriv(nsec);
      const hexRecipient = toHexPub(recipientNpub);

      // Ensure ndk + signer ready
      await ensureConnectedWithSigner(hexPriv);

      // NIP-04 encrypt plaintext -> ciphertext "?iv=" formatted string
      const ciphertext = await nip04.encrypt(hexPriv, hexRecipient, message);

      // Build kind:4 event (Encrypted Direct Message)
      const dmEvent = new NDKEvent(ndk, {
        kind: 4,
        tags: [["p", hexRecipient]], // optionally add relay hint as third param
        content: ciphertext, // <-- encrypted!
        created_at: Math.floor(Date.now() / 1000),
      });

      await dmEvent.sign(ndk.signer);
      const relays = await dmEvent.publish();

      if (relays && relays.size > 0) {
        console.log("DM sent to relays:", Array.from(relays));
        return true;
      } else {
        console.warn("No relay acknowledged the DM.");
        return false;
      }
    } catch (err) {
      console.error("Error sending direct message:", err);
      setErrorMessage(err.message);
      return false;
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
    authWithNip07,
    checkNip07Available,
    saveNsecForNip07User,
    assignExistingBadgeToNpub,
    getUserBadges,
    getLastNotesByNpub,
    getGlobalNotesWithProfilesByHashtag,
    sendDirectMessage,
  };
};
