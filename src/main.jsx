import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
// localStorage.clear();

const AppWrapper = lazy(() =>
  import("./App.jsx").then((module) => ({ default: module.AppWrapper })),
);

const BootFallback = () => (
  <div
    style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      zIndex: 1,
      background: "#f8f5f0",
      color: "#1f2937",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >
    <div
      aria-label="Loading"
      style={{
        width: 44,
        height: 44,
        borderRadius: "999px",
        border: "3px solid rgba(148, 163, 184, 0.28)",
        borderTopColor: "currentColor",
        animation: "appBootSpin 0.9s linear infinite",
      }}
    />
  </div>
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
    <AppWrapper />
  </Suspense>,
);
