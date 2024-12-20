// src/components/ConnectButton.js
import React from "react";
import { useWalletStore } from "./useCoinbaseWallet";

export const ConnectButton = () => {
  const { connected, address, connect, disconnect } = useWalletStore(
    (state) => ({
      connected: state.connected,
      address: state.address,
      connect: state.connect,
      disconnect: state.disconnect,
    })
  );

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        maxWidth: "300px",
        margin: "1rem auto",
      }}
    >
      {connected ? (
        <>
          <p>Connected as: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect Coinbase Wallet</button>
      )}
    </div>
  );
};
