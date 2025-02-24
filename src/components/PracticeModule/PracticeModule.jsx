import { useState, useEffect, useRef } from "react";
import { Box, Button, Progress, Text, VStack, Code } from "@chakra-ui/react";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import RandomCharacter from "../../elements/RandomCharacter";
import Editor from "react-simple-code-editor";

export const PracticeModule = ({ currentTranscript, onPracticeComplete }) => {
  const editorRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [validationMap, setValidationMap] = useState([]);

  const steps = currentTranscript?.practice?.steps || [];
  const isComplete = currentStep === steps.length && isValid;
  const progressPercent = (currentStep / Math.max(steps.length, 1)) * 100;

  useEffect(() => {
    setCurrentStep(0);
    setUserInput("");
    setIsValid(false);
    setValidationMap([]);
  }, [currentTranscript]);

  useEffect(() => {
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, [currentStep]);

  const handleAutoComplete = () => {
    if (steps[currentStep]) {
      setUserInput(steps[currentStep].code);
      setIsValid(true);
      setValidationMap(new Array(steps[currentStep].code.length).fill(true));
    }
  };

  const handleChange = (input) => {
    setUserInput(input);
    if (steps[currentStep]) {
      const targetCode = steps[currentStep].code;
      const newValidationMap = input
        .split("")
        .map((char, index) => char === targetCode[index]);
      setValidationMap(newValidationMap);
      setIsValid(input === targetCode);
    }
  };

  const customHighlight = (code) => {
    if (!steps[currentStep]) return highlight(code, languages.js);

    return code
      .split("")
      .map((char, index) => {
        const isCharValid = validationMap[index];
        const backgroundColor = isCharValid
          ? "rgba(129, 230, 217, 0.2)"
          : "rgba(255, 182, 193, 0.2)";
        return `<span style="background-color: ${backgroundColor}">${char}</span>`;
      })
      .join("");
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserInput("");
      setIsValid(false);
      setValidationMap([]);
    } else if (currentStep === steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (onPracticeComplete) {
        onPracticeComplete(currentTranscript.name);
      }
    }
  };

  if (!steps.length) {
    return <Text>No practice content available for this module.</Text>;
  }

  const editorStyles = {
    fontFamily: "Fira code, Fira Mono, monospace",
    fontSize: 10,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    lineHeight: 1.5,
  };

  return (
    <Box
      bg="#faf3e0"
      p={6}
      borderRadius="lg"
      color="#696969"
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
    >
      <VStack spacing={6} align="stretch" width="100%">
        {steps
          .slice(0, Math.min(currentStep, steps.length - 1) + 1)
          .map((step, index) => (
            <Box key={index} mb={4}>
              <Box mb={2}>{step.guidance}</Box>

              {step.knowledge && (
                <Box p={4} mb={4}>
                  {step.knowledge}
                  <Box mt={"-6"}>
                    <RandomCharacter speed={0.44} />
                  </Box>
                </Box>
              )}

              <Code
                mt={"-8"}
                p={3}
                borderRadius="md"
                display="block"
                width="100%"
                overflowX="auto"
                bg={
                  index === currentStep
                    ? isValid
                      ? "rgba(129, 230, 217, 0.2)"
                      : "rgba(255, 182, 193, 0.2)"
                    : "gray.100"
                }
                border="2px solid"
                borderColor={
                  index === currentStep
                    ? isValid
                      ? "rgb(129, 230, 217)"
                      : "rgb(255, 182, 193)"
                    : "gray.300"
                }
              >
                <Editor
                  value={step.code}
                  highlight={(code) => highlight(code, languages.js)}
                  padding={10}
                  style={editorStyles}
                  disabled
                />
              </Code>

              {index === currentStep && (
                <Box ref={editorRef}>
                  <Editor
                    value={userInput}
                    onValueChange={handleChange}
                    highlight={customHighlight}
                    padding={10}
                    style={{
                      ...editorStyles,
                      marginTop: 10,
                      border: "1px solid gray",
                      borderRadius: 8,
                    }}
                    autoFocus
                    placeholder="Enter your code here"
                  />
                </Box>
              )}
            </Box>
          ))}
      </VStack>

      <Button
        onMouseDown={handleAutoComplete}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleAutoComplete();
          }
        }}
        variant="outline"
        colorScheme="blue"
        mb={4}
      >
        🪄 Auto Complete
      </Button>

      <Progress
        value={progressPercent}
        size="sm"
        colorScheme={isComplete ? "teal" : "purple"}
        width="100%"
        mb={4}
      />
      <Text>{progressPercent.toFixed(2)}%</Text>

      {!isComplete ? (
        <Button
          onMouseDown={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleSubmit();
            }
          }}
          colorScheme={isValid ? "teal" : "pink"}
          isDisabled={!isValid || isComplete}
          boxShadow="1px 1px 2px 0px rgba(207, 128, 197,0.75)"
        >
          Submit
        </Button>
      ) : (
        <VStack spacing={4} mt={4}>
          {currentTranscript?.practice?.reward && (
            <Box>{currentTranscript.practice.reward}</Box>
          )}

          {currentTranscript?.practice?.displayCode && (
            <Box width="100%" overflowX="auto">
              <Editor
                value={currentTranscript.practice.displayCode}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                style={editorStyles}
                disabled
              />
            </Box>
          )}

          <Text color="blue.300" fontWeight="bold">
            🎉 Congratulations on completing the practice!
          </Text>
        </VStack>
      )}
    </Box>
  );
};

export default PracticeModule;
