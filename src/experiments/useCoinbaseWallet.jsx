import { create } from "zustand";
import { provider } from "./provider";

export const useWalletStore = create((set, get) => ({
  connected: false,
  address: undefined,
  chainId: undefined,

  connect: async () => {
    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        set({ address: accounts[0], connected: true });
      }

      const chain = await provider.request({ method: "eth_chainId" });
      set({ chainId: chain });
    } catch (error) {
      console.error("Failed to connect", error);
    }
  },

  disconnect: () => {
    // Simulate disconnect by resetting state
    set({ address: undefined, connected: false });
  },

  signMessage: async (message) => {
    const address = get().address;
    if (!address) return;
    try {
      const signature = await provider.request({
        method: "personal_sign",
        params: [message, address],
      });
      return signature;
    } catch (error) {
      console.error("Failed to sign message", error);
    }
  },
}));

// Listen to account and chain changes
provider.on("accountsChanged", (accounts) => {
  const set = useWalletStore.setState;
  if (accounts && accounts.length > 0) {
    set({ address: accounts[0], connected: true });
  } else {
    set({ address: undefined, connected: false });
  }
});

provider.on("chainChanged", (chainId) => {
  useWalletStore.setState({ chainId });
});
