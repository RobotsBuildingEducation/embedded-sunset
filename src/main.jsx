import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { appTheme } from "./theme.js";
import AppLoadingScreen from "./components/AppLoadingScreen.jsx";

import "./index.css";
// localStorage.clear();

const AppWrapper = lazy(() =>
  import("./App.jsx").then((module) => ({ default: module.AppWrapper })),
);
// Chess has its own public entry point, independent of learning/onboarding redirects.
const ChessApp = lazy(() => import("./chess/ChessApp.jsx"));
const InvestingApp = lazy(() => import("./investing/InvestingApp.jsx"));
const isInvestingRoute = /^\/investing(?:\/|$)/.test(window.location.pathname);
const isChessRoute = /^\/chess(?:\/|$)/.test(window.location.pathname);

const BootFallback = () => (
  <ChakraProvider theme={appTheme}>
    <AppLoadingScreen />
  </ChakraProvider>
);

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
  <Suspense fallback={<BootFallback />}>
    {isInvestingRoute ? (
      <InvestingApp />
    ) : isChessRoute ? (
      <ChessApp />
    ) : (
      <AppWrapper />
    )}
  </Suspense>,
);
