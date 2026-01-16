import React, { useState, useEffect } from "react";
import { VStack, Textarea, Button, Box } from "@chakra-ui/react";
import Markdown from "react-markdown";
import { useSimpleGeminiChat } from "../../hooks/useGeminiChat";
import { useChatCompletion } from "../../hooks/useChatCompletion";
import { playSoundEffect } from "../../utility/soundEffects";

export default function PromptWritingQuestion({
  question,
  onLearnClick,
  userLanguage,
  handleModalCheck,
  onSubmitPrompt, // we'll hook into Step’s submit logic
}) {
  const [promptText, setPromptText] = useState("");
  const [aiMessages, setAiMessages] = useState("");
  const { messages: streamMsgs, submitPrompt: runPrompt } =
    useSimpleGeminiChat();
  const { submitPrompt: gradePrompt } = useChatCompletion({
    response_format: { type: "json_object" },
  });
  const [feedback, setFeedback] = useState(null);

  // whenever the user clicks “Run Prompt”
  const handleRun = () => {
    playSoundEffect("select");
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
    playSoundEffect("select");
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
    <VStack spacing={4} width="100%">
      <Textarea
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        placeholder="Type your prompt here…"
        rows={6}
      />
      <Button onClick={handleRun} colorScheme="blue">
        Run Prompt
      </Button>
      {aiMessages && (
        <Box p={4} bg="gray.50" w="100%" maxW="600px">
          <Markdown>{aiMessages}</Markdown>
        </Box>
      )}
      <Button onClick={handleSubmit} colorScheme="green">
        Submit for Feedback
      </Button>
      {feedback && (
        <Box p={3} bg={feedback.isCorrect ? "green.50" : "red.50"}>
          <strong>
            {feedback.isCorrect ? "✅ Good prompt!" : "❌ Needs work"}
          </strong>
          <p>{feedback.feedback}</p>
        </Box>
      )}
    </VStack>
  );
}
