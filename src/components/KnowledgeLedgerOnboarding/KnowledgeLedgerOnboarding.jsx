import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import {
  Box,
  Button,
  VStack,
  Text,
  Input,
  Heading,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { useClipboard } from "@chakra-ui/react";

import { usePasscodeModalStore } from "../../usePasscodeModalStore";
import { translation } from "../../utility/translation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor";
import { CloudCanvas } from "../../elements/SunsetCanvas";
import { useSimpleGeminiChat } from "../../hooks/useGeminiChat";
import { useAlertStore } from "../../useAlertStore";

// Transcript display text for grouped steps.
export const transcriptDisplay = {
  tutorial: { en: "Tutorial", es: "Tutorial" },
  1: { en: "Basics of Coding", es: "Fundamentos de la Programación" },
  2: {
    en: "Object-Oriented Programming",
    es: "Programación Orientada a Objetos",
  },
  3: { en: "Frontend Development", es: "Desarrollo Frontend" },
  4: {
    en: "Backend Engineering Fundamentals",
    es: "Fundamentos de Ingeniería de Backend",
  },
  5: {
    en: "Creating Apps & Experiences",
    es: "Creando Aplicaciones y Experiencias",
  },
  6: { en: "Computer Science", es: "Ciencias de la Computación" },
};

// Customized Markdown theme for Chakra UI elements.
const newTheme = {
  p: (props) => <Text mb={2} lineHeight="1.6" {...props} />,
  ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
  ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
  li: (props) => <ListItem mb={1} {...props} />,
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <LiveReactEditorModal code={String(children).replace(/\n$/, "")} />
    ) : (
      <Box
        as="code"
        backgroundColor="gray.100"
        p={1}
        borderRadius="md"
        fontSize="sm"
        {...props}
      >
        {children}
      </Box>
    );
  },
};

// Standalone onboarding step component for KnowledgeLedger.
const KnowledgeLedgerOnboarding = ({ userLanguage, steps }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [userIdea, setUserIdea] = useState("");

  const { submitPrompt, messages, resetMessages } = useSimpleGeminiChat();
  const { showAlert } = useAlertStore();
  const { openPasscodeModal } = usePasscodeModalStore();
  const { hasCopied, onCopy } = useClipboard(
    suggestion + " using mock data rather than real config data if necessary."
  );

  // Fetch user input on mount.
  useEffect(() => {
    fetchUserInput();
  }, []);

  const fetchUserInput = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) throw new Error("User ID not found");
      const userDocRef = doc(database, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserIdea(userData.userBuild || "");
      }
    } catch (error) {
      console.error("Error fetching user input from Firestore:", error);
      showAlert("error", translation[userLanguage]["input.fetch.error"]);
    }
  };

  const saveUserInput = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      const userDocRef = doc(database, "users", userId);
      await updateDoc(userDocRef, { userBuild: userInput });
      setUserIdea(userInput);
    } catch (error) {
      console.error("Error saving input to Firestore:", error);
    }
  };

  const handleSuggestNext = async () => {
    resetMessages();
    setIsAnimating(true);
    setIsLoading(true);
    setSuggestion("");

    try {
      // Collect completed step titles from the provided steps data.
      const subjectsCompleted = steps[userLanguage]
        .slice(1)
        .map((step) => step.title);

      let prompt = `Context (Do not reveal to the user): 
1. The user is learning computer science through a 130-step curriculum.
2. They have completed these steps: ${JSON.stringify(subjectsCompleted)}.
3. Write a copy-and-paste app demo in HTML, React, or JavaScript (whichever is best for the student’s level).
4. Format the response with a prompt followed by a code block in minimalist Markdown.

${userIdea ? `5. Build the app around the user's idea: ${userIdea}.` : ""}`;

      submitPrompt(prompt).then(() => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setSuggestion("Error fetching suggestion");
      setIsLoading(false);
    }
  };

  const renderGroupedSteps = () => {
    const stepElements = [];
    let lastGroup = null;
    steps[userLanguage].forEach((step, index) => {
      if (step.group !== lastGroup) {
        stepElements.push(
          step.group === "introduction" ? null : (
            <Heading
              as="h5"
              size="sm"
              mt={4}
              key={`group-${index}`}
              color="green.400"
            >
              {transcriptDisplay[step.group]?.[userLanguage] || ""}
            </Heading>
          )
        );
        lastGroup = step.group;
      }
      stepElements.push(
        <Text
          key={`step-${index}`}
          color={index === 0 ? "green.500" : "gray.500"}
        >
          {index !== 0 ? `${index}. ${step.title}` : ""}
        </Text>
      );
    });
    return stepElements;
  };

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="md"
      boxShadow="md"
      maxWidth="800px"
      mx="auto"
      my={8}
    >
      <Heading mb={4}>
        {translation[userLanguage]["modal.adaptiveLearning.title"]} (beta)
      </Heading>
      <Box mb={4}>
        <Input
          placeholder={translation[userLanguage]["buildYourApp.input.label"]}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          maxWidth="400px"
        />
        <Button mt={2} onClick={saveUserInput} isDisabled={!userInput.trim()}>
          {userIdea
            ? translation[userLanguage]["buildYourApp.button.label.2"]
            : translation[userLanguage]["buildYourApp.button.label.1"]}
        </Button>
      </Box>
      {userIdea && (
        <Box mb={4}>
          {translation[userLanguage]["buildYourApp.idea.label"]} {userIdea}
        </Box>
      )}
      <Box mb={4}>
        <Button
          colorScheme="purple"
          onClick={handleSuggestNext}
          isDisabled={isLoading}
          variant="outline"
        >
          {translation[userLanguage]["modal.adaptiveLearning.recommendButton"]}
        </Button>
        {isAnimating && (
          <Box mt={4}>
            <CloudCanvas isLoader={true} regulateWidth={false} />
          </Box>
        )}
      </Box>
      <Box mt={4}>
        {messages.length > 0 && (
          <Box mt={4} w="100%">
            {messages.map((msg, index) => (
              <Markdown key={index} components={ChakraUIRenderer(newTheme)}>
                {msg.content}
              </Markdown>
            ))}
          </Box>
        )}
      </Box>
      <VStack align="stretch" mt={6}>
        <Text fontSize="lg">
          {translation[userLanguage]["modal.adaptiveLearning.stepsTaken"]}
        </Text>
        <Box as="hr" />
        {renderGroupedSteps()}
      </VStack>
      <Button mt={4} onClick={() => console.log("Proceed to next step")}>
        {translation[userLanguage]["button.close"]}
      </Button>
    </Box>
  );
};

export default KnowledgeLedgerOnboarding;
