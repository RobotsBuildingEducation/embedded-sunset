import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  VStack,
  HStack,
  Box,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const MultipleChoiceQuestion = ({
  question,
  selectedOption,
  setSelectedOption,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionRefs = useRef([]);
  const optionShadow = useColorModeValue(
    "0 14px 30px rgba(15, 23, 42, 0.08)",
    "0 18px 38px rgba(2, 6, 23, 0.42)",
  );
  const focusRing = useColorModeValue(
    "0 0 0 3px rgba(236, 72, 153, 0.22)",
    "0 0 0 3px rgba(244, 114, 182, 0.3)",
  );

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : question.options.length - 1,
        );
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex < question.options.length - 1 ? prevIndex + 1 : 0,
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) {
          setSelectedOption(question.options[focusedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const handleOptionClick = (option, index) => {
    setSelectedOption(option);
    setFocusedIndex(index);
  };

  useEffect(() => {
    if (
      focusedIndex >= 0 &&
      optionRefs.current[focusedIndex] &&
      document.activeElement !== optionRefs.current[focusedIndex]
    ) {
      optionRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  const handleOptionFocus = (index) => {
    setFocusedIndex(index);
  };

  return (
    <VStack spacing={4} onKeyDown={handleKeyDown} width="100%" maxWidth="600px">
      <VStack align={"stretch"} width="100%" maxWidth={"600px"}>
        {question.options.map((option, index) => (
          <Button
            ref={(el) => (optionRefs.current[index] = el)}
            p={6}
            height="auto"
            minH="unset"
            variant="unstyled"
            key={index}
            onMouseDown={() => handleOptionClick(option, index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOptionClick(option, index);
              }
            }}
            justifyContent="start"
            whiteSpace="normal"
            wordWrap="break-word"
            textAlign="left"
            tabIndex={0}
            onFocus={() => handleOptionFocus(index)}
            bg={selectedOption === option ? "appSurfaceElevated" : "appSurface"}
            color="appText"
            borderWidth="1px"
            borderColor={selectedOption === option ? "pink.300" : "appBorder"}
            borderRadius="2xl"
            boxShadow={
              focusedIndex === index
                ? `${optionShadow}, ${focusRing}`
                : optionShadow
            }
            transition="background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
            _hover={{
              bg:
                selectedOption === option
                  ? "appSurfaceElevated"
                  : "appSurfaceMuted",
              borderColor:
                selectedOption === option ? "pink.300" : "appBorderStrong",
            }}
            _active={{
              bg:
                selectedOption === option
                  ? "appSurfaceMuted"
                  : "appSurfaceInset",
            }}
          >
            <HStack spacing={4} width="100%" alignItems="center">
              <Box
                width="24px"
                height="24px"
                flexShrink={0}
                borderRadius="44%"
                borderWidth="2px"
                borderColor={
                  selectedOption === option ? "pink.300" : "appBorderStrong"
                }
                backgroundColor={
                  selectedOption === option ? "pink.300" : "transparent"
                }
              />
              <Text flex="1" color="appText">
                {option}
              </Text>
            </HStack>
          </Button>
        ))}
      </VStack>
    </VStack>
  );
};

export default MultipleChoiceQuestion;
