import React, { useState, useEffect, useRef } from "react";
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
  HStack,
  ChakraProvider,
  Link,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Flex,
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
import Editor from "@monaco-editor/react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { FaMagic } from "react-icons/fa";

export const KnowledgeLedgerModal = ({
  isOpen,
  onClose,
  steps,
  currentStep,
  userLanguage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { submitPrompt, messages, resetMessages } = useSimpleGeminiChat();

  const { showAlert } = useAlertStore();
  const { openPasscodeModal } = usePasscodeModalStore();
  const [userInput, setUserInput] = useState("");
  const [userIdea, setUserIdea] = useState("");
  const [editorCodes, setEditorCodes] = useState([]);
  const [isPreviewings, setIsPreviewings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRefs = useRef([]);
  const lastAutoRunIndexRef = useRef(-1);

  const stripCodeFences = (input = "") =>
    input.replace(/```(?:\w+)?\s*([\s\S]*?)```/g, "$1");

  const extractCodeFromMessage = (content = "") => {
    const withoutFences = stripCodeFences(content).trim();
    if (!withoutFences) return "";
    const sections = withoutFences.split(/\n{2,}/);
    const candidate =
      sections.length > 1 ? sections[sections.length - 1] : withoutFences;
    const lines = candidate.split("\n");
    const codeStart = lines.findIndex(
      (line) =>
        /render\s*\(/.test(line) ||
        line.trim().startsWith("<") ||
        line.trim().startsWith("function") ||
        line.trim().startsWith("const") ||
        line.trim().startsWith("let") ||
        line.trim().startsWith("var")
    );
    if (codeStart > 0) {
      return lines.slice(codeStart).join("\n");
    }
    return candidate;
  };

  const extractPromptFromMessage = (content = "") => {
    const fenceIndex = content.indexOf("```");
    const text = fenceIndex !== -1 ? content.slice(0, fenceIndex) : content;
    return text.trim();
  };

  const isReactCode = (txt = "") => /render\s*\(\s*<\w/.test(txt);
  const isHTML = (txt = "") => /<!DOCTYPE|<html|<body|<div/i.test(txt);

  const runJavaScript = (idx, sanitized) => {
    const html = `
      <script>
        window.console = {
          log: (...args) => parent.postMessage({ type: 'log', idx: ${idx}, msg: args.join(' ') }, '*'),
          error: (...args) => parent.postMessage({ type: 'log', idx: ${idx}, msg: 'Error: ' + args.join(' ') }, '*')
        };
        try { ${sanitized} } catch(e) { console.error(e); }
      </script>
    `;
    if (iframeRefs.current[idx]) {
      iframeRefs.current[idx].srcdoc = html;
    }
  };

  const runCode = (idx) => {
    setIsPreviewings((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setErrors((prev) => prev.map((v, i) => (i === idx ? "" : v)));
    setConsoleLogs((prev) => prev.map((v, i) => (i === idx ? [] : v)));

    const code = editorCodes[idx] || "";
    if (!code.trim()) {
      return;
    }

    const sanitized = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");

    if (isReactCode(sanitized)) {
      return;
    }

    if (isHTML(sanitized)) {
      if (iframeRefs.current[idx]) {
        iframeRefs.current[idx].srcdoc = code;
      }
      return;
    }

    runJavaScript(idx, sanitized);
  };

  const resetPreviewState = () => {
    setEditorCodes([]);
    setIsPreviewings([]);
    setErrors([]);
    setConsoleLogs([]);
    iframeRefs.current = [];
    lastAutoRunIndexRef.current = -1;
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserInput();
    }
  }, [isOpen]);

  useEffect(() => {
    setEditorCodes(messages.map((msg) => extractCodeFromMessage(msg.content)));
    setIsPreviewings(messages.map(() => false));
    setErrors(messages.map(() => ""));
    setConsoleLogs(messages.map(() => []));
    iframeRefs.current = messages.map(() => null);

    if (messages?.length > 0) {
      setIsAnimating(false);
      setIsLoading(false);
      const last = messages[messages.length - 1];
      saveBuild(last.content, "build");
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && editorCodes.length > 0) {
      const lastIndex = editorCodes.length - 1;
      const latest = editorCodes[lastIndex];

      if (
        lastIndex !== lastAutoRunIndexRef.current &&
        latest &&
        latest.trim()
      ) {
        lastAutoRunIndexRef.current = lastIndex;
        runCode(lastIndex);
      }
    }
  }, [editorCodes, isLoading]);

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === "log" && typeof event.data.idx === "number") {
        setConsoleLogs((prev) => {
          const clone = [...prev];
          const idx = event.data.idx;
          const current = clone[idx] ? [...clone[idx]] : [];
          current.push(event.data.msg);
          clone[idx] = current;
          return clone;
        });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

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

  const fetchUserInput = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) throw new Error("User ID not found");

      const userDocRef = doc(database, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const savedIdea = userData.userBuild || "";
        setUserIdea(savedIdea);
        setUserInput(savedIdea);
      }
    } catch (error) {
      console.error("Error fetching user input from Firestore:", error);
      showAlert("error", translation[userLanguage]["input.fetch.error"]);
    }
  };

  const saveUserInput = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) throw new Error("User ID not found");

      const userDocRef = doc(database, "users", userId);
      await updateDoc(userDocRef, { userBuild: userInput });
      setUserIdea(userInput);
      localStorage.setItem("userBuild", userInput);
      return true;
    } catch (error) {
      console.error("Error saving input to Firestore:", error);
      return false;
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
    resetPreviewState();
    setIsAnimating(true);
    setIsLoading(true);

    const history = await fetchHistory();

    try {
      const subjectsCompleted = steps[userLanguage]
        .slice(1, currentStep)
        .map((step) => step.title);

      const promptLines = [
        "Context that only you should know and never make the user aware of:",
        `1. The individual is using an education app and learning about computer science and how to code in 130 steps, starting with elementary knowledge and ending with the ability to create apps and understand algorithms. Based on the user's completed steps: ${JSON.stringify(
          subjectsCompleted
        )}, write an app that the user can copy and experiment with HTML or React (choose whichever fits the user's progress).${
          history.length
            ? ` Previous code snippets in order: ${JSON.stringify(history)}.`
            : ""
        }`,
        "2. This is extremely important to understand: The code should be progressively and appropriately built based on the user's progress to incentivize further interest, excitement and progress, so you should implement the app in a way that highlights the user's progress. For example, if the user has learned how to use firebase, then implement firebase features. If the user has learned react, implement react UIs, etc. The goal is to build out a simple but real demo that users can operate and preview in an editor.",
        "3. When generating your response, you must format your software in this manner:",
        "  A. Never include import statements. Assume that Chakra UI, Firebase, or React imports are unnecessary and already handled by the previewing software.",
        "  B. If you are returning React, conclude the component or components with render(<TheComponentYouCreated />).",
        "  C. If you are generating plain html, start with <!DOCTYPE html>.",
        "  D. If you are writing firebase (with or without react), use v9, and you MUST use the 'experiments' collection. Never use any other collection or your firebase software will fail. Assume that the database and configuration has already been defined, so never return that setup either. Refer to the database element as \"database\".",
        "  E. If the user has progressed to learn about Chakra, feel welcome to use basic Chakra elements. Never use the ChakraProvider element.",
        "4. Return only the runnable code with no additional narration. Do not wrap the output in Markdown fences.",
        `5. The user is speaking in ${
          userLanguage.includes("en") ? "English" : "Spanish"
        }.`,
      ];

      if (userIdea) {
        promptLines.push(
          `6. The user is also interested in building the following idea: ${userIdea}. Make the code about that theme in good faith.`
        );
      }

        await submitPrompt(promptLines.join("\n"));
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setIsAnimating(false);
    } finally {
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

  const handleGenerate = () => {
    handleModalCheck(async () => {
      let didSave = true;
      if (userInput.trim()) {
        didSave = await saveUserInput();
      } else if (userIdea) {
        setUserInput(userIdea);
      } else {
        didSave = false;
      }

      if (didSave || userIdea) {
        await handleSuggestNext();
      } else {
        setIsAnimating(false);
        setIsLoading(false);
      }
    });
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        blockScrollOnMount={false}
        placement="bottom"
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent
          borderRadius={0}
          maxW="100vw"
          maxH="100vh"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" pb={4}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3} align="center">
                <Box
                  bg="purple.500"
                  color="white"
                  borderRadius="full"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0px 4px 12px rgba(128, 90, 213, 0.35)"
                >
                  <FaMagic />
                </Box>
                <Heading size="md">
                  {translation[userLanguage]["modal.adaptiveLearning.title"]} (beta)
                </Heading>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {translation[userLanguage]["buildYourApp.onboarding.instruction"]}
              </Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody overflowY="auto" px={{ base: 4, md: 6 }} py={6}>
            <VStack
              spacing={8}
              align="stretch"
              w="full"
              mx="auto"
              maxW="920px"
            >
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="0px 12px 24px rgba(15, 23, 42, 0.08)"
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
                    <Text fontSize="sm" color="gray.500" mt={3}>
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
                      align={{ base: "stretch", sm: "center" }}
                    >
                      <Button
                        colorScheme="pink"
                        variant="outline"
                        onClick={saveUserInput}
                        isDisabled={!userInput.trim()}
                        boxShadow="0px 4px 10px rgba(236, 72, 153, 0.25)"
                      >
                        {userIdea
                          ? translation[userLanguage]["buildYourApp.button.label.2"]
                          : translation[userLanguage]["buildYourApp.button.label.1"]}
                      </Button>
                      <Button
                        colorScheme="purple"
                        onClick={handleGenerate}
                        isLoading={isLoading}
                        isDisabled={!userInput.trim() && !userIdea}
                      >
                        {translation[userLanguage]["modal.adaptiveLearning.recommendButton"]}
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

              {isAnimating ? (
                <Box py={6} textAlign="center">
                  <CloudCanvas isLoader={true} regulateWidth={false} />
                  <Text mt={4} fontSize="sm" color="gray.500">
                    {translation[userLanguage]["generatingCode"]}
                  </Text>
                </Box>
              ) : null}

              {messages.length > 0 ? (
                <VStack spacing={6} align="stretch">
                  {messages.map((msg, idx) => {
                    const promptText = extractPromptFromMessage(msg.content);
                    const code = editorCodes[idx] || "";
                    const reactPreview = isReactCode(code);
                    const htmlPreview = !reactPreview && isHTML(code);

                    return (
                      <Box
                        key={idx}
                        bg="white"
                        borderRadius="2xl"
                        boxShadow="0px 12px 24px rgba(15, 23, 42, 0.06)"
                        p={{ base: 4, md: 5 }}
                      >
                        <VStack align="stretch" spacing={4}>
                          {promptText ? (
                            <Box
                              borderWidth="1px"
                              borderColor="purple.100"
                              borderRadius="lg"
                              bg="purple.50"
                              p={3}
                            >
                              <Text fontSize="sm" color="purple.700">
                                {promptText}
                              </Text>
                            </Box>
                          ) : null}

                          <Box
                            borderWidth="1px"
                            borderColor="gray.200"
                            borderRadius="lg"
                            overflow="hidden"
                          >
                            <Editor
                              height="320px"
                              language="javascript"
                              theme="light"
                              value={code}
                              onChange={(value) => {
                                const nextCodes = [...editorCodes];
                                nextCodes[idx] = value || "";
                                setEditorCodes(nextCodes);
                              }}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                              }}
                            />
                          </Box>

                          <Text fontSize="xs" color="gray.500">
                            {translation[userLanguage]["buildYourApp.onboarding.instruction"]}
                          </Text>

                          {!reactPreview ? (
                            <iframe
                              ref={(el) => {
                                iframeRefs.current[idx] = el;
                              }}
                              title={`knowledge-ledger-preview-${idx}`}
                              style={{
                                width: "100%",
                                height:
                                  htmlPreview && isPreviewings[idx] ? "360px" : "0px",
                                border: "0",
                                background: "#fff",
                                transition: "height 0.2s ease",
                              }}
                            />
                          ) : null}

                          {reactPreview && isPreviewings[idx] ? (
                            <ChakraProvider>
                              <LiveProvider
                                code={editorCodes[idx]}
                                noInline
                                scope={{
                                  React,
                                  useState: React.useState,
                                  useEffect: React.useEffect,
                                  Button,
                                  Input,
                                  Text,
                                  Box,
                                  Link,
                                  Heading,
                                  VStack,
                                  HStack,
                                  Stack,
                                  Flex,
                                  Textarea,
                                  Select,
                                  FormControl,
                                  FormLabel,
                                }}
                              >
                                <Box
                                  borderWidth="1px"
                                  borderColor="gray.200"
                                  borderRadius="xl"
                                  overflow="hidden"
                                  bg="gray.50"
                                  p={{ base: 4, md: 5 }}
                                >
                                  <LivePreview />
                                </Box>
                                <LiveError
                                  style={{
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                    color: "#dc2626",
                                    marginTop: "16px",
                                  }}
                                />
                              </LiveProvider>
                            </ChakraProvider>
                          ) : null}

                          {!reactPreview && isPreviewings[idx] && !htmlPreview &&
                          consoleLogs[idx]?.length ? (
                            <Box
                              as="pre"
                              bg="gray.900"
                              color="green.200"
                              borderRadius="md"
                              p={3}
                              fontSize="sm"
                              overflowX="auto"
                            >
                                {consoleLogs[idx].join("\n")}
                            </Box>
                          ) : null}

                          {errors[idx] ? (
                            <Text color="red.500" fontSize="sm">
                              {errors[idx]}
                            </Text>
                          ) : null}
                        </VStack>
                      </Box>
                    );
                  })}
                </VStack>
              ) : null}
            </VStack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button
              onClick={onClose}
              boxShadow="0px 4px 12px rgba(15, 23, 42, 0.12)"
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
