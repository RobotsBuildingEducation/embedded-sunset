import React, { useState, useEffect, useRef } from "react";
import { Button, VStack, HStack, Box, Text } from "@chakra-ui/react";
import { translation } from "../../utility/translation";

const MultipleChoiceQuestion = ({
  question,
  selectedOption,
  setSelectedOption,
  onLearnClick,
  userLanguage,
  handleModalCheck,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isComponentFocused, setIsComponentFocused] = useState(false);
  const optionRefs = useRef([]);
  const learnButtonRef = useRef(null);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (!isComponentFocused) {
          setIsComponentFocused(true);
        }
        setFocusedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : question.options.length - 1
        );
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isComponentFocused) {
          setIsComponentFocused(true);
        }
        setFocusedIndex((prevIndex) =>
          prevIndex < question.options.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) {
          setSelectedOption(question.options[focusedIndex]);
        }
        break;
      case "Tab":
        if (e.shiftKey && focusedIndex === 0) {
          learnButtonRef.current.focus();
          setFocusedIndex(-1);
        } else if (!e.shiftKey && focusedIndex === -1) {
          e.preventDefault();
          optionRefs.current[0]?.focus();
          setFocusedIndex(0);
        } else if (
          !e.shiftKey &&
          focusedIndex === question.options.length - 1
        ) {
          setIsComponentFocused(false);
          setFocusedIndex(-1);
        }
        break;
      default:
        break;
    }
  };

  const handleOptionClick = (option, index) => {
    setSelectedOption(option);
    setFocusedIndex(index);
    setIsComponentFocused(true);
  };

  useEffect(() => {
    if (
      isComponentFocused &&
      focusedIndex >= 0 &&
      optionRefs.current[focusedIndex]
    ) {
      optionRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, isComponentFocused]);

  const handleContainerFocus = () => {
    if (!isComponentFocused) {
      setIsComponentFocused(true);
      setFocusedIndex(-1); // Start with no focus initially
    }
  };

  const handleContainerBlur = (e) => {
    setTimeout(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setIsComponentFocused(false);
        setFocusedIndex(-1);
      }
    }, 0);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        !isComponentFocused &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        e.preventDefault();
        optionRefs.current[0]?.focus();
        setIsComponentFocused(true);
        setFocusedIndex(0);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isComponentFocused]);

  const handleOptionFocus = (index) => {
    setFocusedIndex(index);
    setIsComponentFocused(true);
  };

  return (
    <VStack
      spacing={4}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
      onKeyDown={handleKeyDown}
    >
      <Button
        ref={learnButtonRef}
        onMouseDown={() => handleModalCheck(onLearnClick)}
        colorScheme="pink"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleModalCheck(onLearnClick);
          }
        }}
        background="pink.300"
      >
        {translation[userLanguage]["app.button.learn"]}
      </Button>

      <VStack align={"stretch"} width="100%" maxWidth={"600px"}>
        {question.options.map((option, index) => (
          <Button
            ref={(el) => (optionRefs.current[index] = el)}
            p={8}
            variant={"outline"}
            key={index}
            onMouseDown={() => handleOptionClick(option, index)}
            colorScheme={selectedOption === option ? "pink" : "gray"}
            justifyContent="start"
            whiteSpace="normal"
            wordWrap="break-word"
            textAlign="left"
            tabIndex={0}
            onFocus={() => handleOptionFocus(index)}
            style={{
              outline: focusedIndex === index ? "2px solid #3182ce" : "none",
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
                  selectedOption === option ? "pink.300" : "gray.300"
                }
                backgroundColor={
                  selectedOption === option ? "pink.300" : "transparent"
                }
              />
              <Text flex="1" noOfLines={[2, 3, 4]}>
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
