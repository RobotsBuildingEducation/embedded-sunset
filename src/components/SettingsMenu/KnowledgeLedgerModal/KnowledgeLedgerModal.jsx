import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism"; // Syntax theme

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Box,
  Input,
  Heading,
  Code,
  useClipboard,
  Spinner,
  OrderedList,
  ListItem,
} from "@chakra-ui/react";
import { useChatCompletion } from "../../../hooks/useChatCompletion";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { database } from "../../../database/firebaseResources";
import { translation } from "../../../utility/translation";
import { useAlertStore } from "../../../useAlertStore";
import { usePasscodeModalStore } from "../../../usePasscodeModalStore";
import { PasscodeModal } from "../../PasscodeModal/PasscodeModal";
import { SunsetCanvas } from "../../../elements/SunsetCanvas";

const newTheme = {
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");

    return !inline && match ? (
      <SyntaxHighlighter
        // backgroundColor="white"
        // style={"light"}
        language={match[1]}
        PreTag="div"
        customStyle={{
          backgroundColor: "white", // Match this with the desired color
          color: "black", // Ensure the text matches the background
          padding: "1rem",
          borderRadius: "8px",
        }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
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

export const KnowledgeLedgerModal = ({
  isOpen,
  onClose,
  steps,
  currentStep,
  userLanguage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const { submitPrompt, messages, resetMessages } = useChatCompletion();
  const { alert, hideAlert, showAlert } = useAlertStore();
  const { openPasscodeModal } = usePasscodeModalStore();
  const [userInput, setUserInput] = useState(""); // State to manage
  const [userIdea, setUserIdea] = useState("");
  // user input

  const { hasCopied, onCopy } = useClipboard(
    suggestion + " using mock data rather than real config data if necessary."
  ); // Copy functionality

  useEffect(() => {
    if (isOpen) {
      fetchUserInput();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages?.length > 0) {
      try {
        const lastMessage = messages[messages.length - 1];
        const isLastMessage =
          lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

        if (isLastMessage) {
          const jsonResponse = lastMessage.content;
          setSuggestion(jsonResponse);
          setIsLoading(false);
        } else {
          setSuggestion(lastMessage.content);

          console.log("placed content");

          if (lastMessage.content.length > 0) {
            setIsAnimating(false);
          }
        }
      } catch (error) {
        showAlert("warning", translation[userLanguage]["ai.error"]);
        const delay = (ms) =>
          new Promise((resolve) => setTimeout(resolve, 4000));
        delay().then(() => {
          hideAlert();
        });
      }
    }
  }, [messages]);

  const fetchUserInput = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) throw new Error("User ID not found");

      const userDocRef = doc(database, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserIdea(userData.userBuild || ""); // Update state with user input
      }
    } catch (error) {
      console.error("Error fetching user input from Firestore:", error);
      showAlert("error", translation[userLanguage]["input.fetch.error"]);
    }
  };
  const fetchUserAnswers = async () => {
    const userId = localStorage.getItem("local_npub");
    const answersRef = collection(database, `users/${userId}/answers`);
    const answerDocs = await getDocs(answersRef);
    const answers = answerDocs.docs.map((doc) => doc.data());
    return answers;
  };

  const saveUserInput = async () => {
    try {
      const userId = localStorage.getItem("local_npub");

      const userDocRef = doc(database, "users", userId);
      await updateDoc(userDocRef, { userBuild: userInput });
      setUserIdea(userInput);

      // showAlert("success", translation[userLanguage]["input.saved.success"]);
    } catch (error) {
      console.error("Error saving input to Firestore:", error);
      // showAlert("error", translation[userLanguage]["input.saved.error"]);
    }
  };

  const handleSuggestNext = async () => {
    setIsAnimating(true);
    // let knwldctrl = parseInt(localStorage.getItem("knwldctrl") || "0", 10);

    // Check if the user has already generated 3 questions
    // if (knwldctrl >= 3) {
    //   // Silently skip the function
    //   return;
    // }

    // Increment the counter and store it back in localStorage
    // knwldctrl += 1;
    // localStorage.setItem("knwldctrl", knwldctrl);
    setIsLoading(true);
    setSuggestion("");
    resetMessages();

    try {
      // const userAnswers = await fetchUserAnswers();

      const subjectsCompleted = steps[userLanguage]
        .slice(1, currentStep) // All completed steps
        .map((step) => step.title);

      const totalSteps = steps[userLanguage].map((step) => step.title);

      console.log("json completed", JSON.stringify(subjectsCompleted, null, 2));

      console.log("user prog", subjectsCompleted);
      console.log("total ANSWERS", totalSteps);

      let prompt = `Context that only you should know and never make the user aware of: 
1. The individual is using an education app and learning about computer science and how to code in 130 steps, starting with elementary knowledge and ending with the ability to create apps and understand algorithms. Based on the user's completed steps: ${JSON.stringify(
        subjectsCompleted
      )}, write an app that the user can copy and experiment with in react or javascript.

  2. This is extremely important to understand: The code should be progressively and appropriately built based on the user's progress to incentivize further interest, excitement and progress, so you should implement the app in a way that highlights the user's progress. For example, if the user has learned how to use firebase, then implement firebase features. If the user has learned react, implement react UIs, etc. The goal is to eventually build out a simple but real app that the user can send to an app builder like Bolt or Cursor.
  
3. Strictly include the code only with the exception of writing a prompt that a user can submit to build the application. Format in minimalist markdown. Make sure the prompt is first, followed by the code!

4. The user is speaking in ${userLanguage === "en" ? "English" : "Spanish"}.`;

      if (userIdea) {
        prompt =
          prompt +
          `5. The user is also interested in building the following idea: ${userIdea}. Make the code about that theme in good faith.`;
      }
      await submitPrompt([
        {
          content: prompt,
          role: "user",
        },
      ]);

      console.log("submit prompt is done");
      setIsAnimating(false);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setSuggestion("Error fetching suggestion");
      setIsLoading(false);
    }
  };

  const handleModalCheck = (functionCall) => {
    const storedPasscode = localStorage.getItem("features_passcode");
    if (storedPasscode !== import.meta.env.VITE_PATREON_FEATURES_PASSCODE) {
      openPasscodeModal();
    } else {
      functionCall();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        blockScrollOnMount={false}
        scrollBehavior={"inside"}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {" "}
            {translation[userLanguage]["modal.adaptiveLearning.title"]} (beta)
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="scroll">
            How to use this feature:
            <OrderedList mb={4}>
              <ListItem>Define the idea or app you want to build.</ListItem>
              <ListItem>Generate code based on your progress.</ListItem>
              <ListItem>Copy the code & prompt after generating it.</ListItem>
              <ListItem>
                Submit the code to the app you get redirected to.
              </ListItem>
              <ListItem>Congrats! You're building your app using AI!</ListItem>
            </OrderedList>
            <Box mb={4}>
              <Input
                placeholder={
                  "Your idea"
                  // translation[userLanguage]["input.placeholder.build"]
                }
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                maxWidth="400"
              />
              <br />
              <Button
                mt={2}
                onClick={saveUserInput}
                isDisabled={!userInput.trim()}
              >
                {userIdea ? "Update your idea" : "Create your idea"}
                {/* {translation[userLanguage]["button.saveInput"]} */}
              </Button>
            </Box>
            {userIdea ? <Box>Idea you're building: {userIdea}</Box> : null}
            <Box maxHeight="400px">
              <Box mt={16}>
                <Button
                  colorScheme="purple"
                  onMouseDown={handleSuggestNext}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSuggestNext();
                    }
                  }}
                  isDisabled={isLoading}
                  variant={"outline"}
                >
                  {/* {isLoading ? (
                    <Spinner size="sm" />
                  ) : ( */}
                  {
                    translation[userLanguage][
                      "modal.adaptiveLearning.recommendButton"
                    ]
                  }
                  {/* )} */}
                </Button>

                {isAnimating ? (
                  <>
                    <br />
                    <br />
                    <SunsetCanvas isLoader={true} regulateWidth={false} />
                  </>
                ) : null}

                <br />
                <br />
                {suggestion && (
                  <Box
                    mt={4}
                    style={{
                      width: "100%",
                    }}
                  >
                    <Button
                      onClick={() => {
                        onCopy();
                        window.location.href = "https://v0.dev/";
                      }}
                      mb={4}
                    >
                      {hasCopied
                        ? "Copied!"
                        : "Copy Code And Launch AI Builder"}
                    </Button>
                    <Markdown
                      components={ChakraUIRenderer(newTheme)}
                      children={suggestion}
                      // skipHtml
                    />
                  </Box>
                )}
              </Box>
              <br />
              <VStack align="stretch">
                <b>
                  {" "}
                  {
                    translation[userLanguage][
                      "modal.adaptiveLearning.stepsTaken"
                    ]
                  }
                </b>
                {steps[userLanguage].map((step, index) => (
                  <Text
                    key={index}
                    color={index <= currentStep - 1 ? "green.500" : "gray.500"}
                  >
                    {index !== 0 ? index + ". " + step.title : ""}
                  </Text>
                ))}
              </VStack>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              onMouseDown={onClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onClose();
                }
              }}
            >
              {translation[userLanguage]["button.close"]}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PasscodeModal userLanguage={userLanguage} />
    </>
  );
};
