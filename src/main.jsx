import React from "react";
import ReactDOM from "react-dom/client";
import { keyframes } from "@emotion/react";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import { AppWrapper } from "./App.jsx";
import "./index.css";
// localStorage.clear();

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
const theme = extendTheme({
  components: {
    Modal: {
      baseStyle: {
        footer: {
          bg: "transparent",
        },
      },
    },
  },

  styles: {
    global: {
      body: {
        height: "100vh",
        background:
          "linear-gradient(270deg, #f0f0f0, #F8F5F0, #fcfcfc, #F8F5F0)", // Adding a soft beige-like color
        backgroundSize: "800% 800%",
        animation: `${gradientAnimation} 20s ease infinite`,
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

// localStorage.setItem("features_passcode", "TEST1234");

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider theme={theme}>
    <AppWrapper />
  </ChakraProvider>
);
