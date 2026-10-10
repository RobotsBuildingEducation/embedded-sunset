import React from "react";
import { useColorMode } from "@chakra-ui/react";

export default function BitcoinScholarshipGraphic({ label }) {
  const { colorMode } = useColorMode();
  const artworkSuffix = colorMode === "dark" ? "-dark" : "";
  return (
    <img
      className="lp-bitcoin-graphic"
      src={`/images/bitcoin-learning${artworkSuffix}.svg`}
      alt={label}
      width="480"
      height="360"
      loading="lazy"
      decoding="async"
    />
  );
}
