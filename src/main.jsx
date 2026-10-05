import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { initAppUpdateCoordinator } from "./pwa/appUpdateCoordinator.js";

initAppUpdateCoordinator().catch((error) => {
  console.warn("[PWA Update] Initialization failed:", error);
});
// localStorage.clear();

const AppWrapper = lazy(() =>
  import("./App.jsx").then((module) => ({ default: module.AppWrapper })),
);
// Chess has its own public entry point, independent of learning/onboarding redirects.
const ChessApp = lazy(() => import("./chess/ChessApp.jsx"));
const InvestingApp = lazy(() => import("./investing/InvestingApp.jsx"));
const ChartsApp = lazy(() => import("./charts/ChartsApp.jsx"));
const isInvestingRoute = /^\/investing(?:\/|$)/.test(window.location.pathname);
const isChessRoute = /^\/chess(?:\/|$)/.test(window.location.pathname);
const isChartsRoute = /^\/charts(?:\/|$)/.test(window.location.pathname);

const BootFallback = () => {
  const isDark =
    typeof window !== "undefined" &&
    localStorage.getItem("chakra-ui-color-mode") === "dark";
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "#050815" : "#f8f5f0",
        color: isDark ? "#ffffff" : "#1f2937",
      }}
    />
  );
};

if (!import.meta.env.DEV && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", {
        scope: "/firebase-cloud-messaging-push-scope",
      })
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
  isInvestingRoute ? (
    <Suspense fallback={<BootFallback />}>
      <InvestingApp />
    </Suspense>
  ) : isChessRoute ? (
    <Suspense fallback={<BootFallback />}>
      <ChessApp />
    </Suspense>
  ) : isChartsRoute ? (
    <Suspense fallback={<BootFallback />}>
      <ChartsApp />
    </Suspense>
  ) : (
    <Suspense fallback={<BootFallback />}>
      <AppWrapper />
    </Suspense>
  ),
);
