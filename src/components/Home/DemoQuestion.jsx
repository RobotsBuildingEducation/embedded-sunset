import React, { useState } from "react";
import { VStack, Button, Text } from "@chakra-ui/react";
import CodeCompletionQuestion from "../CodeCompletionQuestion/CodeCompletionQuestion";
import { steps } from "../../utility/content";
import { translation } from "../../utility/translation";

// Global user used for demo purposes
const GLOBAL_USER = { id: "demo-user" };

const DemoQuestion = ({ userLanguage }) => {
  const demoStep = steps["compsci-en"][4];
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const checkAnswer = () => {
    const isCorrect = selectedOption === demoStep.question.answer;
    GLOBAL_USER.lastAnswerCorrect = isCorrect;
    setFeedbackKey(isCorrect ? "demo.correct" : "demo.incorrect");
    setIsComplete(isCorrect);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setFeedbackKey("");
    setIsComplete(false);
  };

  return (
    <VStack spacing={4} mt={8} width="100%" maxWidth="600px">
      <Text fontSize="md" fontWeight="bold">
        {demoStep.title}
      </Text>
      <CodeCompletionQuestion
        step={demoStep}
        question={demoStep.question}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        onLearnClick={() => {}}
        userLanguage={userLanguage}
        handleModalCheck={(fn) => fn()}
      />
      {!isComplete && (
        <Button
          colorScheme="green"
          onMouseDown={checkAnswer}
          isDisabled={!selectedOption}
        >
          {translation[userLanguage]["app.button.answer"]}
        </Button>
      )}
      {feedbackKey && (
        <Text fontSize="sm">
          {translation[userLanguage][feedbackKey]}
        </Text>
      )}
      {isComplete && (
        <>
          <Button variant="outline" onMouseDown={() => {}}>
            View progress
          </Button>
          <Button
            colorScheme="purple"
            variant="outline"
            onMouseDown={nextQuestion}
          >
            {translation[userLanguage]["app.button.nextQuestion"]}
          </Button>
        </>
      )}
    </VStack>
  );
};

export default DemoQuestion;
