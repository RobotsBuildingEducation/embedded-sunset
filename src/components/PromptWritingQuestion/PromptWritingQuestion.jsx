import React, { useRef, useState, useEffect } from "react";
import {
  VStack,
  Textarea,
  Button,
  Box,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Markdown from "react-markdown";
import {
  useGeminiGradingChatCompletion,
  useSimpleGeminiChat,
} from "../../hooks/useGeminiChat";

export default function PromptWritingQuestion({
  question,
  onSubmitPrompt, // we'll hook into Step’s submit logic
}) {
  const [promptText, setPromptText] = useState("");
  const [aiMessages, setAiMessages] = useState("");
  const { messages: streamMsgs, submitPrompt: runPrompt } =
    useSimpleGeminiChat();
  const { submitPrompt: gradePrompt } = useGeminiGradingChatCompletion();
  const [feedback, setFeedback] = useState(null);
  const actionShadow = useColorModeValue(
    "0 12px 24px rgba(15, 23, 42, 0.12)",
    "0 16px 34px rgba(2, 6, 23, 0.42)",
  );
  const panelShadow = useColorModeValue(
    "0 14px 30px rgba(15, 23, 42, 0.08)",
    "0 18px 38px rgba(2, 6, 23, 0.42)",
  );

  // whenever the user clicks “Run Prompt”
  const handleRun = () => {
    runPrompt(promptText);
  };

  // collect streaming output
  useEffect(() => {
    if (streamMsgs.length) {
      const combined = streamMsgs.map((m) => m.content).join("");
      setAiMessages(combined.trimStart());
    }
  }, [streamMsgs]);

  const handleSubmit = async () => {
    // build a grading prompt
    await gradePrompt([
      {
        role: "user",
        content: `
      The user wrote this AI prompt:
      "${promptText}"

      The requirement was: "${question.questionText}". 
      Evaluate whether this prompt correctly drives the AI to fulfill that requirement.
      Return JSON: { "isCorrect": boolean, "feedback": string }.
      `,
      },
    ]);
    // you’d then parse the JSON response, setFeedback, and bubble isCorrect/grade up
    onSubmitPrompt();
  };

  console.log("AI, messages:", aiMessages);
  return (
    <VStack spacing={4} width="100%" maxWidth="600px" align="stretch">
      <Textarea
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        placeholder="Type your prompt here…"
        rows={6}
        boxShadow={panelShadow}
      />
      <Button
        onClick={handleRun}
        colorScheme="blue"
        alignSelf="center"
        boxShadow={actionShadow}
      >
        Run Prompt
      </Button>
      {aiMessages && (
        <Box
          p={4}
          bg="appSurfaceElevated"
          color="appText"
          w="100%"
          maxW="600px"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="appBorder"
          boxShadow={panelShadow}
        >
          <Markdown>{aiMessages}</Markdown>
        </Box>
      )}
      <Button
        onClick={handleSubmit}
        colorScheme="green"
        alignSelf="center"
        boxShadow={actionShadow}
      >
        Submit for Feedback
      </Button>
      {feedback && (
        <Box
          p={3}
          bg={feedback.isCorrect ? "appSuccessSubtle" : "appErrorSubtle"}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={feedback.isCorrect ? "green.300" : "red.300"}
          color="appText"
          boxShadow={panelShadow}
        >
          <Text fontWeight="bold" mb={1}>
            {feedback.isCorrect ? "Good prompt!" : "Needs work"}
          </Text>
          <Text>{feedback.feedback}</Text>
        </Box>
      )}
    </VStack>
  );
}
