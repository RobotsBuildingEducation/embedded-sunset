// src/components/SendUsdc.js
import React, { useState } from "react";

import { provider } from "./provider";
import { useWalletStore } from "./useCoinbaseWallet";

// USDC mainnet contract address
const USDC_CONTRACT = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const DECIMALS = 6;
const AMOUNT_IN_USDC = 0.01;
const amountBaseUnits = BigInt(AMOUNT_IN_USDC * 10 ** DECIMALS);

// Replace with your desired recipient address
const RECIPIENT = "0x2c80BC2AF5c5a642520BF27617D0984A63A56dac".toLowerCase();

export const SendUsdc = () => {
  const { connected, address } = useWalletStore((state) => ({
    connected: state.connected,
    address: state.address,
  }));
  const [txHash, setTxHash] = useState();
  const [error, setError] = useState();

  const sendTransaction = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first.");
      return;
    }
    try {
      // Encode the `transfer(address,uint256)` call
      const functionSelector = "0xa9059cbb";
      const recipientNo0x = RECIPIENT.replace("0x", "");
      const recipientPadded = recipientNo0x.padStart(64, "0");
      const amountHex = amountBaseUnits.toString(16).padStart(64, "0");
      const data = functionSelector + recipientPadded + amountHex;

      const txParams = {
        from: address,
        to: USDC_CONTRACT,
        data: data,
        value: "0x0",
      };

      // Use the provider from Coinbase Wallet SDK
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      setTxHash(hash);
      setError(undefined);
    } catch (err) {
      console.error(err);
      setError(err.message || "Transaction failed");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        maxWidth: "300px",
        margin: "1rem auto",
      }}
    >
      <h3>Send $0.01 USDC</h3>
      {connected ? (
        <>
          <p>From: {address}</p>
          <p>To: {RECIPIENT}</p>
          <p>Amount: $0.01 USDC</p>
          <button onClick={sendTransaction}>Send</button>
          {txHash && (
            <p style={{ marginTop: "1rem" }}>
              Transaction Hash:{" "}
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {txHash}
              </a>
            </p>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <p>Please connect your wallet first.</p>
      )}
    </div>
  );
};
