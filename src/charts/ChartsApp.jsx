import React, { Suspense } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { appTheme } from "../theme.js";
import AppLoadingScreen from "../components/AppLoadingScreen.jsx";
import ChartsPage from "./ChartsPage.jsx";

export default function ChartsApp() {
  return (
    <ChakraProvider theme={appTheme}>
      <BrowserRouter>
        <Suspense fallback={<AppLoadingScreen />}>
          <Routes>
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="*" element={<Navigate to="/charts" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ChakraProvider>
  );
}
