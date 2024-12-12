import React, { useEffect, useState } from "react";
import { ChakraProvider, Box, Text, CSSReset } from "@chakra-ui/react";
import { translation } from "../utility/translation";

// Utility function to generate a random binary string of fixed length
const generateRandomBinarySet = (length = 8) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 2).toString(); // Generate 0 or 1 randomly
  }
  return result;
};

// Function to transform an existing binary set into a new random binary set
const transformBinarySet = (binarySet) => {
  let transformed = "";
  for (let i = 0; i < binarySet.length; i++) {
    // Randomly flip some bits for the transformation effect
    transformed +=
      Math.random() > 0.5 ? (binarySet[i] === "0" ? "1" : "0") : binarySet[i];
  }
  return transformed;
};

export const StreamLoader = ({ isAbsolute, instructions }) => {
  const [displayedText, setDisplayedText] = useState(""); // Holds the streamed out JSON structure and binary sets
  const [thinkingValue, setThinkingValue] = useState([]); // Holds the array of binary sets as the value of "thinking"
  const [isJsonStructureDisplayed, setIsJsonStructureDisplayed] =
    useState(false); // Tracks if the JSON structure has been fully displayed

  // The complete JSON structure to display, with the closing bracket already included
  const completeJsonStructure = `{""${translation[localStorage.getItem("userLanguage")]["thinking"]}": ""}`;

  useEffect(() => {
    let intervalId;
    let jsonIndex = 0; // Index to track the current position in the JSON structure

    // Function to stream the JSON structure one character at a time
    const streamJsonStructure = () => {
      if (jsonIndex < completeJsonStructure.length - 1) {
        setDisplayedText((prev) => prev + completeJsonStructure[jsonIndex]);
        jsonIndex++;
      } else {
        // Once the entire JSON structure is displayed, start streaming binary sets
        clearInterval(intervalId);
        setIsJsonStructureDisplayed(true);
        startBinaryStreaming();
      }
    };

    // Function to start streaming binary sets and transforming them after JSON structure is displayed
    const startBinaryStreaming = () => {
      intervalId = setInterval(() => {
        setThinkingValue((prevSets) => {
          // Generate a new random binary set and add it to the value of "thinking"
          const newBinarySet = generateRandomBinarySet(8); // Each binary set is 8 characters long
          const transformedSets = prevSets.map(transformBinarySet); // Transform existing sets
          const updatedSets = [...transformedSets, newBinarySet]; // Add the new binary set

          // Update the displayed text with the new value for "thinking"
          const updatedJson = `{"${translation[localStorage.getItem("userLanguage")]["thinking"]}": "${updatedSets.join(" ")}"}`;
          setDisplayedText(updatedJson);
          return updatedSets;
        });
      }, 120); // Update the "thinking" value every second
    };

    // Start streaming the JSON structure first
    intervalId = setInterval(streamJsonStructure, 25); // Stream one character every 100ms

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <ChakraProvider>
      <CSSReset />
      <Box
        p={6}
        borderRadius="md"
        overflow="hidden"
        // whiteSpace="pre-wrap"
        wordBreak={"break-all"}
        // margin="20px auto"
        maxWidth="600px"
        fontFamily="monospace"
        width="100%"
        position={isAbsolute ? "absolute" : ""}
      >
        {/* Display the single JSON object with the "thinking" key */}
        <Text
          fontSize={isAbsolute ? "sm" : "lg"}
          lineHeight="1.6"
          color={isAbsolute ? "gray" : ""}
          textShadow={"1px 1px 1px solid black"}
        >
          {instructions}
          <br />
          {displayedText !== undefined && displayedText !== null
            ? displayedText
            : ""}
        </Text>
      </Box>
    </ChakraProvider>
  );
};

export default StreamLoader;
