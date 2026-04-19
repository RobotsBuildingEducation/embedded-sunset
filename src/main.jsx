import React from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider } from "@chakra-ui/react";
import { MiniKitContextProvider } from "./providers/MiniKitProvider.jsx";

import { AppWrapper } from "./App.jsx";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { ThemeInitializer } from "./ThemeInitializer.jsx";
import { appTheme } from "./theme.js";
import "./index.css";
import "@coinbase/onchainkit/styles.css";
// localStorage.clear();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// localStorage.setItem("features_passcode", "ZEPHYR");
// localStorage.setItem("passcode", "ZEPHYR");

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider theme={appTheme}>
    <ThemeInitializer />
    <AnimatedBackground />
    <MiniKitContextProvider>
      <AppWrapper />
    </MiniKitContextProvider>
  </ChakraProvider>,
);
