import create from "zustand";
import NDK, {
  NDKUser,
  NDKPrivateKeySigner,
  NDKCashuMintList,
} from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";

export const useWalletStore = create((set, get) => ({
  ndk: null,
  user: null,
  signer: null,
  relayUrls: "",
  mintUrls: [],
  cashuMintList: null,
  cashuWallet: null,

  setRelayUrls: (urls) => set({ relayUrls: urls }),
  setMintUrls: (mints) => set({ mintUrls: mints }),

  initialize: async () => {
    const localPubkey = localStorage.getItem("local_npub");
    const localPrivkey = localStorage.getItem("local_nsec");

    if (!localPubkey) {
      console.error("No npub found in local storage.");
      return;
    }

    const ndk = new NDK({ explicitRelayUrls: [] });
    const user = new NDKUser({ pubkey: localPubkey });

    let signer = null;
    if (localPrivkey) {
      signer = new NDKPrivateKeySigner(localPrivkey);
    }

    set({ ndk, user, signer });
  },

  createWallet: async () => {
    const { ndk, signer, relayUrls, mintUrls, cashuWallet, cashuMintList } =
      get();
    if (!ndk) {
      console.error("NDK is not initialized");
      return false;
    }

    if (mintUrls.length < 1) {
      console.error("Please add at least one mint before creating wallet.");
      return false;
    }

    let finalSigner = signer;
    if (!finalSigner) {
      finalSigner = NDKPrivateKeySigner.generate();
      set({ signer: finalSigner });
    }

    const user = await finalSigner.user();

    let newMintList = cashuMintList;
    if (!newMintList) {
      newMintList = new NDKCashuMintList(ndk);
      newMintList.relays = relayUrls.split("\n").filter((r) => r.trim() !== "");
      newMintList.mints = mintUrls;
      newMintList.p2pk = user.pubkey;
    }

    let newWallet = cashuWallet;
    if (!newWallet) {
      newWallet = new NDKCashuWallet(undefined, ndk);
      newWallet.name = "My wallet";
    }
    newWallet.relays = newMintList.relays;
    newWallet.mints = newMintList.mints;

    if (finalSigner.privateKey) {
      newWallet.privkey = finalSigner.privateKey;
    }

    await newWallet.publish();

    set({ cashuMintList: newMintList, cashuWallet: newWallet });
    return true;
  },

  saveWallet: async () => {
    const { createWallet, cashuMintList } = get();
    const success = await createWallet();
    if (!success) return;

    if (cashuMintList) {
      await cashuMintList.publishReplaceable();
    }

    console.log(
      "Wallet and MintList saved successfully. Redirect to home or another page."
    );
  },

  depositBitcoin: async (amount) => {
    const { cashuWallet } = get();
    if (!cashuWallet) {
      console.error("No wallet available to deposit into.");
      return;
    }

    try {
      const invoice = await cashuWallet.requestInvoice(amount);
      console.log("Please pay this invoice to deposit:", invoice);

      const result = await cashuWallet.redeemInvoice(invoice);
      console.log("Deposit successful, updated balance:", result);
    } catch (err) {
      console.error("Failed to deposit:", err);
    }
  },
}));
