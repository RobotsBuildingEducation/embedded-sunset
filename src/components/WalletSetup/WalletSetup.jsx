import React, { useEffect, useState } from "react";
import { useWalletStore } from "../../hooks/useWalletStore";

export function WalletSetup() {
  const {
    initialize,
    relayUrls,
    setRelayUrls,
    mintUrls,
    setMintUrls,
    saveWallet,
    depositBitcoin,
  } = useWalletStore();

  const [tempRelayUrls, setTempRelayUrls] = useState(relayUrls);
  const [tempMintUrl, setTempMintUrl] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    setTempRelayUrls(relayUrls);
  }, [relayUrls]);

  function addMint() {
    if (tempMintUrl.trim()) {
      setMintUrls([...mintUrls, tempMintUrl.trim()]);
      setTempMintUrl("");
    }
  }

  async function handleSave() {
    setRelayUrls(tempRelayUrls);
    await saveWallet();
  }

  async function handleDeposit() {
    // Example deposit of 10k sats
    await depositBitcoin(10000);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Wallet Setup</h1>

      <div>
        <h3>Mints</h3>
        <ul>
          {mintUrls.map((url, i) => (
            <li key={i}>{url}</li>
          ))}
        </ul>
        <input
          type="text"
          value={tempMintUrl}
          onChange={(e) => setTempMintUrl(e.target.value)}
          placeholder="Add a mint URL"
        />
        <button onClick={addMint}>Add Mint</button>
      </div>

      <div>
        <h3>Relays</h3>
        <textarea
          value={tempRelayUrls}
          onChange={(e) => setTempRelayUrls(e.target.value)}
          placeholder="One relay URL per line"
          rows={5}
          cols={40}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave}>Save Wallet</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleDeposit}>Deposit 10k sats</button>
      </div>
    </div>
  );
}
