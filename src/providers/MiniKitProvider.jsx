import React from "react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";

export function MiniKitContextProvider({ children }) {
  return (
    <MiniKitProvider
      apiKey={import.meta.env.VITE_CDP_CLIENT_API_KEY}
      chain={base}
    >
      {children}
    </MiniKitProvider>
  );
}
