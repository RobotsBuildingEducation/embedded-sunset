import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Progress,
  Text,
  VStack,
  Code,
  useColorModeValue,
} from "@chakra-ui/react";

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
  const codeSurfaceBg = useColorModeValue(
    "rgba(248, 250, 252, 0.96)",
    "rgba(10, 19, 38, 0.96)",
  );
  const codeSurfaceBorder = useColorModeValue(
    "rgba(148, 163, 184, 0.45)",
    "rgba(148, 163, 184, 0.38)",
  );
  const inactiveCodeBg = useColorModeValue(
    "rgba(241, 245, 249, 0.96)",
    "rgba(15, 23, 42, 0.92)",
  );
  const activeValidBg = useColorModeValue(
    "rgba(209, 250, 229, 0.92)",
    "rgba(6, 78, 59, 0.34)",
  );
  const activeInvalidBg = useColorModeValue(
    "rgba(255, 228, 230, 0.92)",
    "rgba(127, 29, 29, 0.28)",
  );
  const activeValidBorder = useColorModeValue(
    "rgba(20, 184, 166, 0.72)",
    "rgba(94, 234, 212, 0.62)",
  );
  const activeInvalidBorder = useColorModeValue(
    "rgba(251, 113, 133, 0.72)",
    "rgba(251, 113, 133, 0.58)",
  );
  const editorShadow = useColorModeValue(
    "0 16px 34px rgba(15, 23, 42, 0.08)",
    "0 18px 40px rgba(2, 6, 23, 0.42)",
  );
  const highlightValidBg = useColorModeValue(
    "rgba(129, 230, 217, 0.24)",
    "rgba(45, 212, 191, 0.22)",
  );
  const highlightInvalidBg = useColorModeValue(
    "rgba(255, 182, 193, 0.24)",
    "rgba(251, 113, 133, 0.2)",
  );
  const completedRewardBg = useColorModeValue(
    "rgba(236, 253, 245, 0.96)",
    "rgba(6, 78, 59, 0.32)",
  );
  const completedRewardBorder = useColorModeValue(
    "rgba(16, 185, 129, 0.28)",
    "rgba(94, 234, 212, 0.36)",
  );
  const syntaxCommentColor = useColorModeValue(
    "#64748b",
    "var(--chakra-colors-appTextMuted)",
  );
  const syntaxNumberColor = useColorModeValue("#b45309", "#f97316");
  const syntaxStringColor = useColorModeValue("#047857", "#5eead4");
  const syntaxOperatorColor = useColorModeValue("#1d4ed8", "#93c5fd");
  const syntaxFunctionColor = useColorModeValue("#0369a1", "#7dd3fc");
  const syntaxKeywordColor = useColorModeValue("#6d28d9", "#c4b5fd");

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
          ? highlightValidBg
          : highlightInvalidBg;
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
    color: "var(--chakra-colors-appCodeColor)",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    lineHeight: 1.5,
  };

  const codeEditorSx = {
    color: "appCodeColor",
    "& textarea": {
      caretColor: "var(--chakra-colors-appCodeColor)",
      outline: "none !important",
    },
    "& pre, & textarea": {
      color: "var(--chakra-colors-appCodeColor) !important",
    },
    "& .token.comment, & .token.prolog, & .token.doctype, & .token.cdata": {
      color: `${syntaxCommentColor} !important`,
    },
    "& .token.punctuation": {
      color: "var(--chakra-colors-appCodeColor) !important",
    },
    "& .token.property, & .token.tag, & .token.boolean, & .token.number, & .token.constant, & .token.symbol, & .token.deleted":
      {
        color: `${syntaxNumberColor} !important`,
      },
    "& .token.selector, & .token.attr-name, & .token.string, & .token.char, & .token.builtin, & .token.inserted":
      {
        color: `${syntaxStringColor} !important`,
      },
    "& .token.operator, & .token.entity, & .token.url, & .token.variable": {
      color: `${syntaxOperatorColor} !important`,
    },
    "& .token.atrule, & .token.attr-value, & .token.function, & .token.class-name":
      {
        color: `${syntaxFunctionColor} !important`,
      },
    "& .token.keyword": {
      color: `${syntaxKeywordColor} !important`,
    },
  };

  return (
    <Box
      bg="appSurfaceMuted"
      p={6}
      borderRadius="lg"
      color="appText"
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
    >
      <VStack spacing={6} align="stretch" width="100%">
        {steps
          .slice(0, Math.min(currentStep, steps.length - 1) + 1)
          .map((step, index) => (
            <Box key={index} mb={4} color="appText">
              <Box mb={2} color="appText">
                {step.guidance}
              </Box>

              {step.knowledge && (
                <Box p={4} mb={4} color="appText">
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
                      ? activeValidBg
                      : activeInvalidBg
                    : inactiveCodeBg
                }
                border="2px solid"
                borderColor={
                  index === currentStep
                    ? isValid
                      ? activeValidBorder
                      : activeInvalidBorder
                    : codeSurfaceBorder
                }
                color="appCodeColor"
                boxShadow={editorShadow}
                sx={codeEditorSx}
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
                <Box
                  ref={editorRef}
                  bg={codeSurfaceBg}
                  border="1px solid"
                  borderColor="appBorderStrong"
                  borderRadius="10px"
                  boxShadow={editorShadow}
                  overflow="hidden"
                  sx={codeEditorSx}
                >
                  <Editor
                    value={userInput}
                    onValueChange={handleChange}
                    highlight={customHighlight}
                    padding={10}
                    style={{
                      ...editorStyles,
                      minHeight: "72px",
                      backgroundColor: "transparent",
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
        color="appText"
        borderColor="blue.300"
        _hover={{ bg: "appSurfaceMuted" }}
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
      <Text color="appTextMuted">{progressPercent.toFixed(2)}%</Text>

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
            <Box
              width="100%"
              textAlign="center"
              color="appText"
              bg={completedRewardBg}
              border="1px solid"
              borderColor={completedRewardBorder}
              borderRadius="16px"
              px={4}
              py={3}
            >
              {currentTranscript.practice.reward}
            </Box>
          )}

          {currentTranscript?.practice?.displayCode && (
            <Box
              width="100%"
              overflowX="auto"
              bg={codeSurfaceBg}
              border="1px solid"
              borderColor="appBorderStrong"
              borderRadius="10px"
              color="appCodeColor"
              boxShadow={editorShadow}
              sx={codeEditorSx}
            >
              <Editor
                value={currentTranscript.practice.displayCode}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                style={editorStyles}
                disabled
              />
            </Box>
          )}

          {/* <Text color="blue.300" fontWeight="bold">
            🎉 Congratulations on completing the practice!
          </Text> */}
        </VStack>
      )}
    </Box>
  );
};

export default PracticeModule;
