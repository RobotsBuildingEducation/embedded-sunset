// SetupWalletComponent.js
import React, { useState } from "react";
import { useNostrWallet } from "../../hooks/useNostrWallet";

/**
 * This component is displayed if the user has no existing wallet.
 * They can enter their desired relays, mints, and a wallet name.
 * On submit, createNewWallet is called to publish the wallet event.
 * After success, navigate the user to the main dashboard or TestSendComponent.
 */
function SetupWalletComponent({ setLocalCashu }) {
  const { createNewWallet, isConnected, errorMessage } = useNostrWallet(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  const [walletName, setWalletName] = useState("My New Wallet");
  const [relayUrls, setRelayUrls] = useState(
    "wss://relay.damus.io\nwss://relay.primal.net"
  );
  const [mintUrls, setMintUrls] = useState(
    "https://mint.minibits.cash/Bitcoin"
  );
  const [creating, setCreating] = useState(false);

  if (!isConnected) {
    return <div>Connecting to Nostr relays...</div>;
  }

  async function handleCreate() {
    setCreating(true);

    const relayList = relayUrls
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r);
    const mintList = mintUrls
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m);

    console.log("crea");
    const newWallet = await createNewWallet(mintList, relayList, walletName);
    setCreating(false);

    if (newWallet) {
      // Wallet created successfully
      setLocalCashu(newWallet);
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <h3>Create a New Wallet</h3>
      <div>
        <label>Wallet Name:</label>
        <br />
        <input
          type="text"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
        />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <label>Relays (one per line):</label>
        <br />
        <textarea
          rows={4}
          value={relayUrls}
          onChange={(e) => setRelayUrls(e.target.value)}
        />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <label>Mints (one per line):</label>
        <br />
        <textarea
          rows={2}
          value={mintUrls}
          onChange={(e) => setMintUrls(e.target.value)}
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={creating}
        style={{ marginTop: "1rem" }}
      >
        {creating ? "Creating wallet..." : "Create Wallet"}
      </button>
    </div>
  );
}

export default SetupWalletComponent;
