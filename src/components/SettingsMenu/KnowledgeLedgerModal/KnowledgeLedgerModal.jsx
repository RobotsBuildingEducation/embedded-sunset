import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button,
  Text,
  Box,
  Input,
  Heading,
  VStack,
  Stack,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { database } from "../../../database/firebaseResources";
import { translation } from "../../../utility/translation";
import { useAlertStore } from "../../../useAlertStore";
import { usePasscodeModalStore } from "../../../usePasscodeModalStore";
import { PasscodeModal } from "../../PasscodeModal/PasscodeModal";
import { CloudCanvas } from "../../../elements/SunsetCanvas";
import { useSimpleGeminiChat } from "../../../hooks/useGeminiChat";
import LiveReactEditorModal from "../../LiveCodeEditor/LiveCodeEditor";

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

    // console.log("Isloading??")

    return !inline && match ? (
      <LiveReactEditorModal code={String(children).replace(/\n$/, "")} />
    ) : (
      // <SyntaxHighlighter
      //   // backgroundColor="white"
      //   // style={"light"}
      //   language={match[1]}
      //   PreTag="div"
      //   customStyle={{
      //     backgroundColor: "white", // Match this with the desired color
      //     color: "black", // Ensure the text matches the background
      //     padding: "1rem",
      //     borderRadius: "8px",
      //     fontSize: 12,
      //   }}
      //   {...props}
      // >
      //   {String(children).replace(/\n$/, "")}
      // </SyntaxHighlighter>
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
  const [isAnimating, setIsAnimating] = useState(false);
  // const { submitPrompt, messages, resetMessages } = useChatCompletion();
  const { submitPrompt, messages, resetMessages } = useSimpleGeminiChat();

  const { showAlert } = useAlertStore();
  const { openPasscodeModal } = usePasscodeModalStore();
  const [userInput, setUserInput] = useState(""); // State to manage
  const [userIdea, setUserIdea] = useState("");
  // user input

  useEffect(() => {
    if (isOpen) {
      fetchUserInput();
    }
  }, [isOpen]);

  const saveBuild = async (content, stage = "build") => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return;
      const group = steps[userLanguage][currentStep].group;
      await setDoc(
        doc(database, "users", userId, "buildHistory", group),
        {
          code: content,
          updatedAt: Date.now(),
          stage,
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving build", err);
    }
  };

  useEffect(() => {
    if (messages?.length > 0) {
      console.log("true..", messages);
      setIsAnimating(false);
      const last = messages[messages.length - 1];
      saveBuild(last.content, "build");
      // try {
      //   const lastMessage = messages[messages.length - 1];
      //   const isLastMessage =
      //     lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

      //   if (isLastMessage) {
      //     const jsonResponse = lastMessage.content;
      //     setSuggestion(jsonResponse);
      //     setIsLoading(false);
      //   } else {
      //     setSuggestion(lastMessage.content);

      //     console.log("placed content");

      //     if (lastMessage.content.length > 0) {
      //       setIsAnimating(false);
      //     }
      //   }
      // } catch (error) {
      //   showAlert("warning", translation[userLanguage]["ai.error"]);
      //   const delay = (ms) =>
      //     new Promise((resolve) => setTimeout(resolve, 4000));
      //   delay().then(() => {
      //     hideAlert();
      //   });
      // }
    } else {
      console.log("false...", messages);
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
      updateDoc(userDocRef, { userBuild: userInput });
      setUserIdea(userInput);

      // showAlert("success", translation[userLanguage]["input.saved.success"]);
    } catch (error) {
      console.error("Error saving input to Firestore:", error);
      // showAlert("error", translation[userLanguage]["input.saved.error"]);
    }
  };

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return [];
      const ref = collection(database, `users/${userId}/buildHistory`);
      const docs = await getDocs(ref);
      return docs.docs
        .filter(
          (d) =>
            !isNaN(parseInt(d.id)) &&
            parseInt(d.id) < parseInt(steps[userLanguage][currentStep].group)
        )
        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
        .map((d) => d.data().code)
        .filter(Boolean);
    } catch (e) {
      console.error("Error fetching history", e);
      return [];
    }
  };

  const handleSuggestNext = async () => {
    resetMessages();
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
    const history = await fetchHistory();

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
      )}, write an app that the user can copy and experiment with HTML or React (choose whichever fits the user's progress).${
        history.length
          ? ` Previous code snippets in order: ${JSON.stringify(history)}.`
          : ""
      }
      
  2. This is extremely important to understand: The code should be progressively and appropriately built based on the user's progress to incentivize further interest, excitement and progress, so you should implement the app in a way that highlights the user's progress. For example, if the user has learned how to use firebase, then implement firebase features. If the user has learned react, implement react UIs, etc. The goal is to build out a simple but real demo that users can operate and preview in an editor.

  3. When generating your response, you must format your software in this manner:
  Globally: Never use imports. Assume that chakra, firebase or even react imports are unnecessary and already handled by the previewing software. 

  A. If you are returning React, do NOT include any import statements or define dependencies and conclude the component or components with render(<TheComponentYouCreated />)
  B. If you are generating plain html, use !DOCTYPE
  C. Do NOT return plain JavaScript snippets. Use React components or HTML only.
  D. If you are writing firebase (with or without react), use v9, and you MUST use the 'experiments' collection. Never use any other collection or your firebase software will fail. Never use imports or we will fail. Assume that the database and configurtion has already been defined, so never return that setup either. Refer to the database element as "database" and not "db" or anything else. Do not use auth. Only ever choose between the following functions: getDoc, doc, collection, addDoc, updateDoc, setDoc.
  E. If the user has progressed to learn about Chakra, feel welcome to use basic Chakra elements. Never use the ChakraProvider element.
  
4. Strictly include a prompt that a user can submit to build the application first and then the code written by a formatted backticked code block. Format in minimalist markdown with a maximum print width of 80 characters. Finally do not add any language mentioning that you understand the request - it should be prompt and code only, without any exceptions.

5. The user is speaking in ${userLanguage.includes("en") ? "English" : "Spanish"}.`;

      if (userIdea) {
        prompt =
          prompt +
          `5. The user is also interested in building the following idea: ${userIdea}. Make the code about that theme in good faith.`;
      }
      submitPrompt(prompt).then(() => {
        //console.log("done")
        setIsLoading(false);
      });
      //   [
      //   {
      //     content: prompt,
      //     role: "user",
      //   },
      // ]

      console.log("submit prompt is done");
    } catch (error) {
      console.error("Error fetching suggestion:", error);
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
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        blockScrollOnMount={false}
        placement="bottom"
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent
          borderTopRadius={{ base: "2xl", md: "3xl" }}
          maxH={{ base: "85vh", md: "70vh" }}
          mx="auto"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" pb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="md">
                {translation[userLanguage]["modal.adaptiveLearning.title"]} (beta)
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {translation[userLanguage]["buildYourApp.onboarding.instruction"]}
              </Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody overflowY="auto" px={{ base: 4, md: 6 }} py={6}>
            <VStack spacing={8} align="center" w="full">
              <Box
                w="full"
                maxW="560px"
                bg="white"
                borderRadius="2xl"
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.2)"
                p={{ base: 5, md: 6 }}
              >
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      {translation[userLanguage]["about.title.buildYourApp"]}
                    </Text>
                    <Heading size="md">
                      {translation[userLanguage]["buildYourApp.input.label"]}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      {translation[userLanguage]["buildYourApp.how_to_use_feature"]}
                    </Text>
                  </Box>
                  <VStack align="stretch" spacing={3}>
                    <Input
                      placeholder={
                        translation[userLanguage]["buildYourApp.input.label"]
                      }
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                    <Stack
                      direction={{ base: "column", sm: "row" }}
                      spacing={3}
                      justify="flex-start"
                    >
                      <Button
                        colorScheme="pink"
                        variant="outline"
                        onMouseDown={saveUserInput}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            saveUserInput();
                          }
                        }}
                        isDisabled={!userInput.trim()}
                        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.2)"
                      >
                        {userIdea
                          ? translation[userLanguage][
                              "buildYourApp.button.label.2"
                            ]
                          : translation[userLanguage][
                              "buildYourApp.button.label.1"
                            ]}
                      </Button>
                    </Stack>
                    {userIdea ? (
                      <Box
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={3}
                        bg="gray.50"
                      >
                        <Text fontWeight="semibold" fontSize="sm" mb={1}>
                          {translation[userLanguage]["buildYourApp.idea.label"]}
                        </Text>
                        <Text fontSize="sm">{userIdea}</Text>
                      </Box>
                    ) : null}
                  </VStack>
                </VStack>
              </Box>

              <Box w="full" maxW="560px">
                <VStack spacing={4} align="stretch">
                  <Button
                    colorScheme="purple"
                    variant="solid"
                    onMouseDown={() => handleModalCheck(handleSuggestNext)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleModalCheck(handleSuggestNext);
                      }
                    }}
                    isDisabled={isLoading}
                  >
                    {
                      translation[userLanguage][
                        "modal.adaptiveLearning.recommendButton"
                      ]
                    }
                  </Button>

                  {isAnimating ? (
                    <Box py={4}>
                      <CloudCanvas isLoader={true} regulateWidth={false} />
                    </Box>
                  ) : null}

                  {messages.length > 0 && (
                    <VStack
                      spacing={4}
                      align="stretch"
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="2xl"
                      p={{ base: 4, md: 5 }}
                      bg="white"
                      boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.08)"
                    >
                      {messages.map((msg, index) => (
                        <Markdown
                          key={index}
                          components={ChakraUIRenderer(newTheme)}
                          isLoading={isLoading}
                        >
                          {msg.content}
                        </Markdown>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button
              onMouseDown={onClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onClose();
                }
              }}
              boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.2)"
            >
              {translation[userLanguage]["button.close"]}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <PasscodeModal userLanguage={userLanguage} />
    </>
  );
};
