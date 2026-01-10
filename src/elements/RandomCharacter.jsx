import React, { useState, useEffect } from "react";

import character1 from "../assets/1.png";

import character3 from "../assets/3.png";
import character4 from "../assets/4.png";
import character5 from "../assets/5.png";
import character6 from "../assets/6.png";
import character7 from "../assets/7.png";
import character8 from "../assets/8.png";
import character9 from "../assets/9.png";
import character10 from "../assets/10.png";
import character11 from "../assets/11.png";
import character12 from "../assets/12.png";
import character13 from "../assets/13.png";
import character14 from "../assets/14.png";
import character15 from "../assets/15.png";
import character16 from "../assets/16.png";
import character17 from "../assets/17.png";
import character18 from "../assets/18.png";
import character19 from "../assets/19.png";
import character20 from "../assets/20.png";
import character21 from "../assets/21.png";
import character22 from "../assets/22.png";
import character23 from "../assets/23.png";
import character24 from "../assets/24.png";
import character25 from "../assets/25.png";
import character26 from "../assets/26.png";
import character27 from "../assets/27.png";
import character28 from "../assets/28.png";
import character29 from "../assets/29.png";
import character30 from "../assets/30.png";
import character31 from "../assets/31.png";
import character32 from "../assets/32.png";
import character33 from "../assets/33.png";
import character34 from "../assets/34.png";
import character35 from "../assets/35.png";
import character36 from "../assets/36.png";
import character37 from "../assets/37.png";
import character38 from "../assets/38.png";
import character39 from "../assets/39.png";
import character40 from "../assets/40.png";
import character41 from "../assets/41.png";

import { keyframes } from "@emotion/react";
import { Box } from "@chakra-ui/react";

const riseAnimation = keyframes`
  from {
    transform: translateY(25px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const panLeft = keyframes`
from {
  transform: translateX(-25px);
}
to {
  transform: translateX(0); // Adjust as needed
}
`;

const panRight = keyframes`
  from {
    transform: translateX(25px);
  }
  to {
    transform: translateX(0); // Adjust as needed
  }
`;

// Create the FadeInComponent using Chakra UI
export const PanRightComponent = ({ children, speed = "0.15s" }) => {
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      animation={`${panRight} ${speed} ease-in-out`} // Apply the animation with dynamic speed
    >
      {children}
    </Box>
  );
};

// Create the FadeInComponent using Chakra UI
export const PanLeftComponent = ({ children, speed = "0.15s" }) => {
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      animation={`${panLeft} ${speed} ease-in-out`} // Apply the animation with dynamic speed
    >
      {children}
    </Box>
  );
};

// Create the FadeInComponent using Chakra UI
export const RiseUpAnimation = ({ children, speed = "0.15s" }) => {
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      animation={`${riseAnimation} ${speed} ease-in-out`} // Apply the animation with dynamic speed
    >
      {children}
    </Box>
  );
};

// Create the FadeInComponent using Chakra UI
export const FadeInComponent = ({ children, speed = "0.15s" }) => {
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      animation={`${fadeInAnimation} ${speed} ease-in`} // Apply the animation with dynamic speed
    >
      {children}
    </Box>
  );
};

const characterImages = [
  character1,

  character3,
  character4,
  character5,
  character6,
  character7,
  character8,
  character9,
  character10,
  character11,
  character12,
  character13,
  character14,
  character15,
  character16,
  character17,
  character18,
  character19,
  character20,
  character21,
  character22,
  character23,
  character24,
  character25,
  character26,
  character27,
  character28,
  character29,
  character30,
  character31,
  character32,
  character33,
  character34,
  character35,
  character36,
  character37,
  character38,
  character39,
  character40,
  character41,
];

const characterImagesMap = {
  1: character1,
  2: character3,
  3: character4,
  4: character5,
  5: character6,
  6: character7,
  7: character8,
  8: character9,
  9: character10,
  10: character11,
  11: character12,
  12: character13,
  13: character14,
  14: character15,
  15: character16,
  16: character17,
  17: character18,
  18: character19,
  19: character20,
  20: character21,
  21: character22,
  22: character23,
  23: character24,
  24: character25,
  25: character26,
  26: character27,
  27: character28,
  28: character29,
  29: character30,
  30: character31,
  31: character32,
  32: character33,
  33: character34,
  34: character35,
  35: character36,
  36: character37,
  37: character38,
  38: character39,
  39: character40,
  40: character41,
};

const RandomCharacter = ({
  width = "50px",
  speed = 1.33,
  borderRadius = null,
  notSoRandomCharacter = null,
  isTimed = false,
}) => {
  const [image, setImage] = useState("");
  const [showSplash, setShowSplash] = useState(isTimed);

  useEffect(() => {
    if (showSplash && isTimed) {
      const timer = setTimeout(() => setShowSplash(false), 3000); // Adjust the delay as needed
      return () => clearTimeout(timer);
    } else {
      const usedIndices = JSON.parse(localStorage.getItem("usedIndices")) || [];

      // Filter out used characters
      const availableCharacters = characterImages.filter(
        (_, index) => !usedIndices.includes(index)
      );

      // Select a random character from the available ones
      const randomIndex = Math.floor(
        Math.random() * availableCharacters.length
      );
      const randomImage = availableCharacters[randomIndex];

      // Update used indices
      const newUsedIndices = [
        ...usedIndices,
        characterImages?.indexOf(randomImage) || 1,
      ];
      if (newUsedIndices.length === characterImages.length) {
        // Reset if all characters have been used
        localStorage.setItem("usedIndices", JSON.stringify([]));
      } else {
        localStorage.setItem("usedIndices", JSON.stringify(newUsedIndices));
      }

      setImage(randomImage);
    }
  }, [showSplash, isTimed]);

  useEffect(() => {
    if (!isTimed) {
      const usedIndices = JSON.parse(localStorage.getItem("usedIndices")) || [];

      // Filter out used characters
      const availableCharacters = characterImages.filter(
        (_, index) => !usedIndices.includes(index)
      );

      // Select a random character from the available ones
      const randomIndex = Math.floor(
        Math.random() * availableCharacters.length
      );
      const randomImage = availableCharacters[randomIndex];

      // Update used indices
      const newUsedIndices = [
        ...usedIndices,
        characterImages?.indexOf(randomImage) || 1,
      ];
      if (newUsedIndices.length === characterImages.length) {
        // Reset if all characters have been used
        localStorage.setItem("usedIndices", JSON.stringify([]));
      } else {
        localStorage.setItem("usedIndices", JSON.stringify(newUsedIndices));
      }

      setImage(randomImage);
    }
  }, [isTimed]);

  return (
    <div
      style={{
        height: 100,
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <img
          src={
            notSoRandomCharacter
              ? characterImagesMap[notSoRandomCharacter]
              : image
          }
          alt=""
          width={width}
          height={width}
        />
      </div>
    </div>
  );
};

export default RandomCharacter;
