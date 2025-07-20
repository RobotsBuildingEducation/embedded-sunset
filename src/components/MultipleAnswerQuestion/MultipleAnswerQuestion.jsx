import React, { useState, useEffect, useRef } from "react";
import { Button, VStack, HStack, Box, Text } from "@chakra-ui/react";
import { translation } from "../../utility/translation";
import { IoChatbubblesOutline } from "react-icons/io5";

const MultipleAnswerQuestion = ({
  question,
  selectedOptions,
  setSelectedOptions,
  onLearnClick,
  userLanguage,
  handleModalCheck,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0); // Track the currently focused index
  const [isListFocused, setIsListFocused] = useState(true); // Track if the list is focused
  const optionRefs = useRef([]); // Track references to each option button
  const containerRef = useRef(null); // Reference to the list container

  // Handle keyboard navigation and selection
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault(); // Prevent scrolling
        if (!isListFocused) {
          setIsListFocused(true);
        }
        setFocusedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : question.options.length - 1
        );
        break;
      case "ArrowDown":
        e.preventDefault(); // Prevent scrolling
        if (!isListFocused) {
          setIsListFocused(true);
        }
        setFocusedIndex((prevIndex) =>
          prevIndex < question.options.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case "Tab":
        setIsListFocused(false); // Remove focus tracking on Tab navigation
        break;
      case "Enter":
      case " ":
        e.preventDefault(); // Prevent default behavior
        handleOptionClick(question.options[focusedIndex]);
        break;
      default:
        break;
    }
  };

  // Toggle selection of an option
  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== option)); // Deselect if already selected
    } else {
      setSelectedOptions([...selectedOptions, option]); // Select if not selected
    }
  };

  // Remove focus when the user navigates away from the list using Tab or clicks elsewhere
  const handleBlur = (e) => {
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        setIsListFocused(false);
      }
    }, 0);
  };

  // Refocus on the list when Arrow keys are used and ensure the correct item is focused
  useEffect(() => {
    if (isListFocused && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, isListFocused]);

  // Global keydown listener to bring back focus to the list if Arrow keys are pressed when focus is lost
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!isListFocused && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault(); // Prevent scrolling the page
        setIsListFocused(true); // Set list focus back to true
        setFocusedIndex(
          (prevIndex) =>
            (e.key === "ArrowUp" ? prevIndex - 1 : prevIndex + 1) %
            question.options.length
        );
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isListFocused, focusedIndex, question.options.length]);

  return (
    <VStack spacing={4} onBlur={handleBlur}>
      {/* Learn Button */}
      <Button
        onMouseDown={() => handleModalCheck(onLearnClick)}
        colorScheme="pink"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleModalCheck(onLearnClick);
          }
        }}
        background="pink.400"
        boxShadow="1px 1px 2px 0px var(--chakra-colors-pink-300)"
      >
        <IoChatbubblesOutline />
        &nbsp;
        {translation[userLanguage]["app.button.learn"]}
      </Button>

      {/* Options List */}
      <VStack
        ref={containerRef}
        align={"stretch"}
        width="100%"
        maxWidth={"600px"}
        tabIndex={-1} // Allow the container to be focusable if needed
        onFocus={() => setIsListFocused(true)} // Track focus when entering the container
        onKeyDown={handleKeyDown} // Handle keyboard navigation
        style={{ outline: isListFocused ? "none" : "none" }} // Remove focus outline on blur
      >
        {question.options.map((option, index) => (
          <Button
            ref={(el) => (optionRefs.current[index] = el)} // Assign reference to each option
            p={8}
            variant={"outline"}
            key={index}
            onMouseDown={() => {
              setFocusedIndex(index); // Update focus index on mouse click
              setIsListFocused(true); // Keep list focus state
              handleOptionClick(option);
            }}
            colorScheme={selectedOptions.includes(option) ? "pink" : "gray"}
            justifyContent="start"
            whiteSpace="normal"
            wordWrap="break-word"
            textAlign="left"
            tabIndex={0} // Make the option focusable
            onFocus={() => setFocusedIndex(index)} // Sync focus with state when focused via Tab
            style={{
              outline:
                focusedIndex === index && isListFocused
                  ? "2px solid #3182ce"
                  : "none", // Highlight focused option
            }}
          >
            <HStack spacing={4} width="100%" alignItems="center">
              <Box
                width="24px"
                height="24px"
                flexShrink={0}
                borderRadius="15%"
                borderWidth="2px"
                borderColor={
                  selectedOptions.includes(option) ? "pink.300" : "gray.300"
                }
                backgroundColor={
                  selectedOptions.includes(option) ? "pink.300" : "transparent"
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

export default MultipleAnswerQuestion;
