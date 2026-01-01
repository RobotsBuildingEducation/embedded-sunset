import React from "react";
import ReactDOM from "react-dom/client";
import { keyframes } from "@emotion/react";

import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { MiniKitContextProvider } from "./providers/MiniKitProvider.jsx";

import { AppWrapper } from "./App.jsx";
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

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};
const theme = extendTheme({
  config,
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
    global: (props) => ({
      body: {
        height: "100vh",
        background:
          props.colorMode === "dark"
            ? "radial-gradient(circle at 20% 20%, #1f2937, #0f172a 50%, #0b1020)"
            : "#F8F5F0",
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "inherit",
        backgroundSize: "800% 800%",
        animation: `${gradientAnimation} 20s ease infinite`,
      },
    }),
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
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <MiniKitContextProvider>
      <AppWrapper />
    </MiniKitContextProvider>
  </ChakraProvider>
);
