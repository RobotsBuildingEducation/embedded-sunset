import React, { useState, useEffect, useRef } from "react";
import { Button, VStack, HStack, Box, Text } from "@chakra-ui/react";
import { translation } from "../../utility/translation";
import { IoChatbubblesOutline } from "react-icons/io5";
import { soundManager } from "../../utility/soundManager";

const MultipleChoiceQuestion = ({
  question,
  selectedOption,
  setSelectedOption,
  onLearnClick,
  userLanguage,
  handleModalCheck,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionRefs = useRef([]);
  const learnButtonRef = useRef(null);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : question.options.length - 1
        );
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex < question.options.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) {
          soundManager.play("select");
          setSelectedOption(question.options[focusedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const handleOptionClick = (option, index) => {
    soundManager.play("select");
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
    <VStack spacing={4} onKeyDown={handleKeyDown}>
      <Button
        ref={learnButtonRef}
        onMouseDown={() => {
          soundManager.play("intro");
          handleModalCheck(onLearnClick);
        }}
        colorScheme="pink"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            soundManager.play("intro");
            handleModalCheck(onLearnClick);
          }
        }}
        background="pink.300"
        boxShadow="0.5px 0.5px 0px 0px rgba(0, 0, 0,0.75)"
      >
        <IoChatbubblesOutline />
        &nbsp;
        {translation[userLanguage]["app.button.learn"]}
      </Button>

      <VStack align={"stretch"} width="100%" maxWidth={"600px"}>
        {question.options.map((option, index) => (
          <Button
            ref={(el) => (optionRefs.current[index] = el)}
            p={8} // Responsive padding
            variant={"outline"}
            key={index}
            onMouseDown={() => handleOptionClick(option, index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleOptionClick(option, index);
              }
            }}
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
              <Text flex="1">{option}</Text>
            </HStack>
          </Button>
        ))}
      </VStack>
    </VStack>
  );
};

export default MultipleChoiceQuestion;
