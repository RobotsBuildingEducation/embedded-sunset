import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import {
  Box,
  Button,
  VStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  extendTheme,
  useStyleConfig,
  useToast,
  Code,
  Heading,
  UnorderedList,
  ListItem,
  Textarea,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import RandomCharacter from "../../elements/RandomCharacter";
import { CopyButtonIcon } from "../../elements/CopyButtonIcon";
import { animateBorderLoading } from "../../utility/animations";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { IoMicCircleOutline } from "react-icons/io5";
import { PiMicrophoneFill, PiMicrophoneLight } from "react-icons/pi";
import {
  useSimpleGeminiChat,
  useThinkingGeminiChat,
} from "../../hooks/useGeminiChat";
import { LuSend } from "react-icons/lu";
import { isUnsupportedBrowser } from "../../utility/browser";
import { InstallAppModal } from "../InstallModal/InstallModal";
import {
  getThemedCodeBlockStyles,
  getThemedSyntaxHighlightTheme,
} from "../../theme";
import {
  nativeModalMotionProps,
  nativeOverlayMotionProps,
} from "../../utility/modalMotion";

const lightHighlightColors = [
  "green.100",
  "blue.100",
  "yellow.100",
  "orange.100",
  "purple.100",
];
const darkHighlightColors = [
  "whiteAlpha.200",
  "whiteAlpha.200",
  "whiteAlpha.200",
  "whiteAlpha.200",
  "whiteAlpha.200",
];
export const newTheme = () => {
  let highlightIndex = 0;
  return {
    p: ({ node, ...props }) => (
      <Text
        mb={4}
        color="appText"
        fontSize={{ base: "sm", md: "md" }}
        lineHeight="1.7"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <UnorderedList pl={5} spacing={2} mb={4} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <UnorderedList as="ol" pl={5} spacing={2} mb={4} {...props} />
    ),
    li: ({ node, ...props }) => <ListItem mb={1} {...props} />,
    h1: ({ node, ...props }) => (
      <Heading
        as="h2"
        mt={6}
        mb={2}
        fontSize={{ base: "lg", md: "xl" }}
        lineHeight="1.25"
        letterSpacing="0"
        fontWeight="700"
        color="appText"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <Heading
        as="h3"
        mt={5}
        mb={2}
        fontSize={{ base: "md", md: "lg" }}
        lineHeight="1.3"
        letterSpacing="0"
        fontWeight="700"
        color="appText"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <Heading
        as="h4"
        mt={5}
        mb={2}
        fontSize={{ base: "md", md: "lg" }}
        lineHeight="1.35"
        letterSpacing="0"
        fontWeight="700"
        color="appText"
        {...props}
      />
    ),
    h4: ({ node, ...props }) => (
      <Heading
        as="h5"
        mt={4}
        mb={2}
        fontSize="md"
        lineHeight="1.4"
        letterSpacing="0"
        fontWeight="700"
        color="appText"
        {...props}
      />
    ),
    strong: ({ node, ...props }) => {
      const { colorMode } = useColorMode();
      const highlightColors =
        colorMode === "dark" ? darkHighlightColors : lightHighlightColors;
      const color =
        highlightColors[Math.min(highlightIndex, highlightColors.length - 1)];
      highlightIndex += 1;
      return (
        <Text
          as="span"
          bg={color}
          color="appText"
          px={1}
          borderRadius="md"
          fontWeight="extrabold"
          {...props}
        />
      );
    },
    code: ({ node, inline, className, children, ...props }) => {
      const { colorMode } = useColorMode();
      const match = /language-(\w+)/.exec(className || "");

      return !inline ? (
        <SyntaxHighlighter
          language={match?.[1] || "javascript"}
          PreTag="div"
          style={getThemedSyntaxHighlightTheme(colorMode)}
          customStyle={getThemedCodeBlockStyles(colorMode)}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <Box
          as="code"
          backgroundColor="appCodeInlineBg"
          color="appCodeColor"
          px={1.5}
          py={0.5}
          borderRadius="md"
          fontSize="0.92em"
          {...props}
        >
          {children}
        </Box>
      );
    },
  };
};

const looksLikeLooseCode = (line = "") => {
  const value = line.trim();
  if (!value) return false;
  if (/^[-*]\s/.test(value)) return false;
  if (/^\d+\.\s/.test(value)) return false;
  return (
    /^(const|let|var|function|class|if|else|for|while|return|import|export|try|catch|async|await)\b/.test(
      value,
    ) ||
    /^console\./.test(value) ||
    /[;{}]|=>|<\/?[A-Z_a-z][^>]*>/.test(value)
  );
};

const normalizeLearnMarkdown = (content = "") => {
  const lines = String(content || "").trimStart().split("\n");
  const output = [];
  let inFence = false;
  let inLooseCode = false;

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inLooseCode) {
        output.push("```");
        inLooseCode = false;
      }
      inFence = !inFence;
      output.push(line);
      return;
    }

    if (!inFence && looksLikeLooseCode(line)) {
      if (!inLooseCode) {
        output.push("```javascript");
        inLooseCode = true;
      }
      output.push(line);
      return;
    }

    if (inLooseCode) {
      output.push("```");
      inLooseCode = false;
    }
    output.push(line);
  });

  if (inLooseCode) {
    output.push("```");
  }

  return output.join("\n");
};

const LearnLoadingAnimation = ({ userLanguage }) => (
  <VStack
    spacing={5}
    textAlign="center"
    maxW="420px"
    sx={{
      "@keyframes learnLoaderPulse": {
        "0%, 100%": {
          opacity: 0.48,
          transform: "scale(0.92)",
        },
        "50%": {
          opacity: 1,
          transform: "scale(1.06)",
        },
      },
      "@keyframes learnLoaderFloat": {
        "0%, 100%": {
          transform: "translateY(0)",
          boxShadow: "0 14px 36px rgba(236, 72, 153, 0.22)",
        },
        "50%": {
          transform: "translateY(-5px)",
          boxShadow: "0 20px 44px rgba(249, 115, 22, 0.28)",
        },
      },
      "@keyframes learnLoaderDot": {
        "0%, 100%": {
          opacity: 0.45,
          transform: "translateY(3px)",
        },
        "50%": {
          opacity: 1,
          transform: "translateY(-3px)",
        },
      },
    }}
  >
    <Box position="relative" w="92px" h="92px" aria-hidden="true">
      <Box
        position="absolute"
        inset="0"
        borderRadius="full"
        border="2px solid"
        borderColor="pink.200"
        opacity={0.72}
        animation="learnLoaderPulse 1.45s ease-in-out infinite"
      />
      <Box
        position="absolute"
        inset="10px"
        borderRadius="full"
        border="1px solid"
        borderColor="orange.200"
        opacity={0.5}
        animation="learnLoaderPulse 1.45s ease-in-out 160ms infinite"
      />
      <Box
        position="absolute"
        inset="18px"
        borderRadius="full"
        bgGradient="linear(to-br, pink.300, orange.300)"
        animation="learnLoaderFloat 1.8s ease-in-out infinite"
      />
      <HStack
        position="absolute"
        inset="0"
        align="center"
        justify="center"
        spacing={1.5}
      >
        {[0, 1, 2].map((idx) => (
          <Box
            key={idx}
            w="8px"
            h="8px"
            borderRadius="full"
            bg="white"
            boxShadow="0 0 12px rgba(255,255,255,0.72)"
            animation={`learnLoaderDot 900ms ease-in-out ${
              idx * 120
            }ms infinite`}
          />
        ))}
      </HStack>
    </Box>
    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="700">
      {translation[userLanguage]["modal.learn.instructions"]}
    </Text>
  </VStack>
);

const EducationalModal = ({
  isOpen,
  onClose,
  educationalMessages,
  educationalContent,
  userLanguage,
}) => {
  const topRef = useRef();
  const newMessageRef = useRef(null);

  const toast = useToast();
  const [borderState, setBorderState] = useState("0px solid #793feb");

  const [conversation, setConversation] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const pauseTimeoutRef = useRef(null);

  const [streamingResponse, setStreamingResponse] = useState("");
  const [storedRequest, setStoredRequest] = useState("");

  const {
    isOpen: isInstallModalOpen,
    onOpen: onInstallModalOpen,
    onClose: onInstallModalClose,
  } = useDisclosure();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
  } = useSpeechRecognition();
  const { resetMessages, messages, submitPrompt } = useThinkingGeminiChat();

  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (newMessageRef.current) {
      newMessageRef.current.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }, [conversation]);

  useEffect(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    if (listening && transcript) {
      pauseTimeoutRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
        console.log("Stopped listening due to 1.75s of inactivity.");
      }, 1750);
    }

    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [transcript, listening, finalTranscript]);

  //          feedbackRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    // if (educationalMessages.length > 0 && !educationalContent.length > 0) {
    //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // }
  }, [educationalMessages]);

  useEffect(() => {
    // if (educationalContent.length > 0) {
    //   topRef.current?.scrollIntoView({ behavior: "smooth" });
    // }
  }, [educationalContent]);
  const handleCopyKeys = (id) => {
    if (id) {
      const keys = id; // replace with actual keys
      navigator.clipboard.writeText(keys);
      // toast({
      //   title: translation[userLanguage]["toast.title.keysCopied"],
      //   description: translation[userLanguage]["toast.description.keysCopied"],
      //   status: "info",
      //   duration: 1500,
      //   isClosable: true,
      //   position: "top",
      //   render: () => (
      //     <Box
      //       color="black"
      //       p={3}
      //       bg="#FEEBC8" // Custom background color here!
      //       borderRadius="md"
      //       boxShadow="lg"
      //     >
      //       <Text fontWeight="bold">
      //         {translation[userLanguage]["toast.title.keysCopied"]}
      //       </Text>
      //       <Text>
      //         {translation[userLanguage]["toast.description.keysCopied"]}
      //       </Text>
      //     </Box>
      //   ),
      // });
    } else {
      const keys = localStorage.getItem("local_nsec"); // replace with actual keys
      navigator.clipboard.writeText(keys);
      // toast({
      //   title: translation[userLanguage]["toast.title.keysCopied"],
      //   description: translation[userLanguage]["toast.description.keysCopied"],
      //   status: "info",
      //   duration: 1500,
      //   isClosable: true,
      //   position: "top",
      //   render: () => (
      //     <Box
      //       color="black"
      //       p={3}
      //       bg="#FEEBC8" // Custom background color here!
      //       borderRadius="md"
      //       boxShadow="lg"
      //     >
      //       <Text fontWeight="bold">
      //         {translation[userLanguage]["toast.title.keysCopied"]}
      //       </Text>
      //       <Text>
      //         {translation[userLanguage]["toast.description.keysCopied"]}
      //       </Text>
      //     </Box>
      //   ),
      // });
    }

    animateBorderLoading(
      setBorderState,
      "2px solid teal",
      "0px solid #793feb",
      500,
    );
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: "user", content: inputValue };
    setConversation((prev) => [...prev, userMessage]);

    // const prompt = `You're an educational assistant helping a student learn via conversation. Respond informatively to: "${inputValue}" using examples and clear logic. Avoid any reference to AI or being an assistant.`;

    let filteredData = conversation;

    filteredData.forEach((item) => {
      if (item.response && item.response.meta) {
        delete item.response.meta;
      }
    });

    filteredData = {
      convo: filteredData,
    };

    // console.log("filteredData", filteredData);

    const prompt = `You're tutoring a student learning about lecture notes you've generated. Be helpful and keep your responses relatively short. Additionally, when asking users a question or providing context, repeat the lecture notes you're referencing exactly and any respective examples so users dont have to scroll up, formatted in markdown. The student said ${inputValue}. Never, under any circumstance, repeat the message a student sends you.
    
    This is the most important part: Do NOT ask follow up questions IF AND ONLY IF the user has provided a reasonable, fair or acceptable answer to a question you've asked, instead specifically say they've done a "great job!" so they're aware that they succeeded and so the conversation can naturally conclude and flow appropriately, otherwise you'll endlessly ask follow-ups which can be frustrating. Never repeat a response found in your previous_conversation instruction. The conversation and responses must always feel natural. If the user asks the same thing, come up with a better response.
    
    Afterward, you can follow up with "Any other questions?" to conclude. 

    Lastly, the user is speaking in ${userLanguage.includes("en") ? "English" : "Spanish"}.
    
    The following data is context to inform you and is strictly for your eyes only - do not reference this material in your response:
    {
      lectureNotes: ${educationalMessages[0]?.content}
      previous_conversation: ${JSON.stringify(filteredData)}
    
    }
    `;

    console.log("final promppt...", prompt);
    submitPrompt(prompt);
    setInputValue("");
    resetTranscript();
  };

  const handleVoiceToggle = () => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Unsupported browser",
        description: "Your browser doesn't support voice input.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({
        continuous: true,
        language: userLanguage === "es" ? "es-MX" : "en-US",
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((msg) => {
        const trimmed = { ...msg, content: msg.content.trimStart() };
        setConversation((prev) => {
          const updatedConversation = [...prev];
          updatedConversation[updatedConversation.length - 1].response =
            trimmed;
          return updatedConversation;
        });
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleGlobalEnter = (e) => {
      // Only trigger if Enter is pressed and inputValue isn’t empty
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        handleSend();
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener("keydown", handleGlobalEnter);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleGlobalEnter);
    };
  }, [inputValue]); // Ensure it has the latest inputValue

  return (
    <>
      {isInstallModalOpen ? (
        <InstallAppModal
          userLanguage={userLanguage}
          isOpen={isInstallModalOpen}
          onClose={onInstallModalClose}
          vocalRequest={true}
        />
      ) : null}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        scrollBehavior={"inside"}
        motionPreset="none"
        returnFocusOnClose={false}
      >
        <ModalOverlay motionProps={nativeOverlayMotionProps} />

        {educationalMessages.length < 1 ? (
          <ModalContent
            motionProps={nativeModalMotionProps}
            bg="appSurfaceElevated"
            color="appText"
            borderWidth="1px"
            borderColor="appBorder"
            borderRadius="lg"
            boxShadow="2xl"
            p={0}
            width="100%"
            minH="100dvh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <ModalHeader
              fontSize="xl"
              fontWeight="bold"
              marginTop={0}
              paddingTop={0}
              pb={0}
              borderBottomWidth="1px"
              borderBottomColor="appBorder"
            >
              <ModalCloseButton size="lg" />

              <HStack mb={0}>
                <div style={{ width: "fit-content" }}>
                  <RandomCharacter />
                </div>
                &nbsp;
                <div>{translation[userLanguage]["modal.learn.title"]}</div>
              </HStack>
            </ModalHeader>
            <ModalBody
              p={0}
              style={{ width: "100%" }}
              display="flex"
              flex="1"
              minH="calc(100dvh - 72px)"
            >
              <Box
                color="appText"
                width="100%"
                flex="1"
                minH="calc(100dvh - 72px)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={6}
              >
                <LearnLoadingAnimation userLanguage={userLanguage} />
              </Box>
            </ModalBody>
          </ModalContent>
        ) : (
          <ModalContent
            motionProps={nativeModalMotionProps}
            bg="appSurfaceElevated"
            color="appText"
            borderWidth="1px"
            borderColor="appBorder"
            borderRadius="lg"
            boxShadow="2xl"
            p={0}
            width="100%"
            scrollBehavior={"inside"}
            tabIndex={0}
            outlineColor="transparent"

            // style={{ fontFamily: "Roboto Serif, serif" }}
          >
            <ModalHeader
              fontSize="xl"
              fontWeight="bold"
              marginTop={0}
              paddingTop={0}
              pb={0}
              borderBottomWidth="1px"
              borderBottomColor="appBorder"

              // height="100%"
            >
              <ModalCloseButton size="lg" />

              <HStack mb={0}>
                <div style={{ width: "fit-content" }}>
                  {/* {educationalMessages.length > 0 
                &&
                !educationalContent.length > 0 ? 
                (
                  <BigSunset />
                ) : ( */}
                  <RandomCharacter />
                  {/* // )} */}
                </div>
                &nbsp;
                <div>{translation[userLanguage]["modal.learn.title"]}</div>
              </HStack>
            </ModalHeader>

            <ModalBody
              p={2}
              style={{
                width: "100%",

                display: "flex",
                justifyContent: "center",
              }}
            >
              <VStack
                spacing={6}
                alignItems="flex-start"
                maxWidth="600px"
                minWidth="300px"
                width="100%"
              >
                {/* <Box ref={topRef}></Box> */}
                {educationalMessages.length > 0 &&
                  educationalMessages.map((content, index) => (
                    <Box
                      fontFamily={"Avenir"}
                      key={index}
                      p={4}
                      bg="appSurface"
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="appBorder"
                      boxShadow="sm"
                      textAlign={"left"}
                      width="100%"
                    >
                      <Markdown
                        components={ChakraUIRenderer(newTheme())}
                        children={normalizeLearnMarkdown(content.content)}
                      />
                    </Box>
                  ))}
                {[...conversation].map((msg, idx) => {
                  const isNewest = idx === conversation.length - 1;

                  return (
                    <>
                      <Box
                        width="100%"
                        display="flex"
                        justifyContent={"flex-end"}
                      >
                        <Box
                          key={idx}
                          p={3}
                          bg="appSurfaceStrong"
                          maxWidth="75%"
                          width="fit-content"
                          borderRadius="16px"
                          borderWidth="1px"
                          borderColor="appBorder"
                          boxShadow="sm"
                        >
                          <Markdown components={ChakraUIRenderer(newTheme())}>
                            {normalizeLearnMarkdown(msg.content)}
                          </Markdown>
                        </Box>
                      </Box>
                      <Box
                        key={idx}
                        ref={isNewest ? newMessageRef : null} // Add ref to latest message
                        p={3}
                        bg="appSurface"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="appBorder"
                        boxShadow="sm"
                        width="100%"
                      >
                        <Markdown components={ChakraUIRenderer(newTheme())}>
                          {normalizeLearnMarkdown(msg?.response?.content || "")}
                        </Markdown>
                      </Box>
                    </>
                  );
                })}
              </VStack>
            </ModalBody>
            <ModalFooter
              mb={1}
              p={0}
              borderTopWidth="1px"
              borderTopColor="appBorder"
            >
              <Box width="100%" maxWidth="600px" mx="auto">
                <HStack
                  width="100%"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  pt={1}
                  pb={4}
                  pr={4}
                  pl={4}
                >
                  <IconButton
                    icon={
                      listening ? <PiMicrophoneFill /> : <PiMicrophoneLight />
                    }
                    aria-label="Voice input"
                    onClick={() => {
                      if (isUnsupportedBrowser()) {
                        onInstallModalOpen();
                      } else {
                        handleVoiceToggle();
                      }
                    }}
                    bg={listening ? "appSurfaceStrong" : "appSurface"}
                    color={listening ? "pink.300" : "appTextMuted"}
                    borderWidth="1px"
                    borderColor={listening ? "pink.400" : "appBorder"}
                    boxShadow="sm"
                    _hover={{ bg: "appSurfaceMuted" }}
                    _active={{ bg: "appSurfaceInset" }}
                  />
                  <Textarea
                    placeholder={translation[userLanguage]["askForHelp"]}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inputValue.trim()) {
                        handleSend();
                      }
                    }}
                    variant="outline"
                    resize="none"
                    overflowY="hidden"
                    background="appSurface"
                    boxShadow="sm"
                    flex="1"
                    minHeight="88px"
                    maxHeight="300px"
                    padding={3}
                  />
                  <Button
                    onClick={handleSend}
                    colorScheme="pink"
                    isDisabled={!inputValue.trim()}
                    boxShadow="sm"
                  >
                    <LuSend />
                  </Button>
                </HStack>
              </Box>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </>
  );
};

export default EducationalModal;
