import React from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { MiniKitContextProvider } from "./providers/MiniKitProvider.jsx";

import { AppWrapper } from "./App.jsx";
import { AnimatedBackground } from "./components/AnimatedBackground";
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
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

const theme = extendTheme({
  components: {
    Modal: {
      baseStyle: {
        footer: {
          bg: "transparent",
        },
      },
    },
    // Toast: {
    //   baseStyle: {
    //     container: {
    //       bg: "#FEEBC8", // You can set your preferred color here
    //     },
    //   },
    // },
  },

  styles: {
    global: {
      body: {
        height: "100vh",
        background: "transparent",
      },
    },
  },

  // colors: {
  //   pink: {
  //     50: "#FFF5F7",
  //     100: "#FED7E2",
  //     200: "#FBB6CE",
  //     300: "#F687B3",
  //     400: "#ED64A6",
  //     500: "#D53F8C",
  //     600: "#B83280",
  //     700: "#97266D",
  //     800: "#702459",
  //     900: "#521B41",
  //   },
  // },
});

localStorage.setItem("CANARY_KEY", "Y2FuYXJ5");

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider theme={theme}>
    <AnimatedBackground />
    <MiniKitContextProvider>
      <AppWrapper />
    </MiniKitContextProvider>
  </ChakraProvider>
);
