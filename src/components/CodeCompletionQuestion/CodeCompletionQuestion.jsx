import React, { useState, useEffect, useRef } from "react";
import { VStack, Box, Button } from "@chakra-ui/react";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import Editor from "react-simple-code-editor";
import { IoChatbubblesOutline } from "react-icons/io5";
import { soundManager } from "../../utility/soundManager";
import { triggerHaptic } from "tactus";

const CodeCompletionQuestion = ({
  step,
  question,
  selectedOption,
  setSelectedOption,
  onLearnClick,
  userLanguage,
  handleModalCheck,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1); // Track the currently focused option index (-1 means no option is focused)
  const [isComponentFocused, setIsComponentFocused] = useState(false); // Track if the component is focused or not
  const optionRefs = useRef([]); // Track references to each code block option
  const learnButtonRef = useRef(null); // Reference to the Learn button

  // Handle keyboard navigation and selection when the component is focused
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
          soundManager.init().catch(() => {});
          soundManager.playHover(Math.random());
          soundManager.play("select");
        }
        break;
      case "Tab":
        // Allow the Tab key to behave naturally
        setIsComponentFocused(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle click selection and focus update
  const handleOptionClick = (option, index) => {
    setSelectedOption(option);
    setFocusedIndex(index);
    setIsComponentFocused(true); // Set component as focused on click
    soundManager.init().catch(() => {});
    soundManager.playHover(Math.random());
    soundManager.play("select");
  };

  // Set focus to the current option when the focusedIndex changes
  useEffect(() => {
    if (
      isComponentFocused &&
      focusedIndex >= 0 &&
      optionRefs.current[focusedIndex]
    ) {
      optionRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, isComponentFocused]);

  // Global keydown listener to bring back focus to the component if Arrow keys are pressed when focus is lost
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        !isComponentFocused &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        e.preventDefault(); // Prevent default scrolling behavior
        optionRefs.current[0]?.focus(); // Focus the first option
        setIsComponentFocused(true); // Set component as focused
        setFocusedIndex(0); // Set focus to the first option
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isComponentFocused]);

  // Remove unnecessary focus handlers from the container
  // The container should not intercept the focus
  // This allows the "Learn" button to be included in the natural tab order

  return (
    <VStack
      spacing={6}
      width="100%"
      maxWidth="600px"
      // Removed tabIndex, onFocus, onBlur, and onKeyDown from the container
    >
      {/* Learn Button */}
      <Button
        ref={learnButtonRef}
        onMouseDown={() => {
          triggerHaptic();
          handleModalCheck(onLearnClick);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            triggerHaptic();
            handleModalCheck(onLearnClick);
          }
        }}
        colorScheme="pink"
        // Removed tabIndex={0} as Button is focusable by default
        background="pink.400"
        boxShadow="0.5px 0.5px 0px 0px rgba(0, 0, 0,0.75)"
      >
        <IoChatbubblesOutline />
        &nbsp;
        {translation[userLanguage]["app.button.learn"]}
      </Button>

      {/* Code Block Options */}
      {question.options.map((option, index) => (
        <Box
          key={index}
          onClickCapture={() => handleOptionClick(option, index)} // Register click and update focus
          cursor="pointer"
          bg={selectedOption === option ? "#FDF8EF" : "#faf3e0"} // Background changes on selection
          borderWidth="2px"
          borderColor={selectedOption === option ? "pink.500" : "transparent"} // Emphasized border for selected
          _hover={{
            backgroundColor: selectedOption === option ? "#FDF8EF" : "#FDF8EF", // Hover effect
          }}
          textAlign="left"
          width="100%"
          p={4}
          borderRadius="lg" // Rounded corners
          boxShadow="0.5px 0.5px 1px 0px black"
          tabIndex={0} // Make each option focusable with Tab
          ref={(el) => (optionRefs.current[index] = el)} // Store reference to each code block
          onKeyDown={(e) => {
            handleKeyDown(e); // Attach the keyboard navigation handler to each option
          }}
          onFocus={() => {
            setFocusedIndex(index);
            setIsComponentFocused(true);
          }} // Sync focus state when an option gains focus
          style={{
            outline: focusedIndex === index ? "2px solid #3182ce" : "none", // Highlight the focused option
          }}
        >
          {/* Render cleaned-up and highlighted code block */}
          <Editor
            value={option}
            onValueChange={() => {}} // Disable editing
            highlight={(code) => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: "transparent", // Keep it transparent
              whiteSpace: "pre-wrap", // Handle long lines
              width: "100%",
              color: "#333333", // Ensure dark text for readability
              pointerEvents: "none", // Prevent editor from blocking clicks
            }}
            disabled
          />
        </Box>
      ))}
    </VStack>
  );
};

export default CodeCompletionQuestion;
