// src/App.tsx
import React from "react";

import { ConnectButton } from "./ConnectButton";
import { ChainInfo } from "./ChainInfo";
import { SignMessageForm } from "./SignMessageForm";
import { SendUsdc } from "./SendUSDC";

export const TestCoinbaseUI = () => {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Coinbase Wallet SDK Demo</h1>
      <ConnectButton />
      <ChainInfo />
      <SignMessageForm />
      <SendUsdc />
    </div>
  );
};
