import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import {
  Box,
  Button,
  VStack,
  Text,
  Spinner,
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
import { BigSunset, SunsetCanvas } from "../../elements/SunsetCanvas";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import RandomCharacter from "../../elements/RandomCharacter";
import { CopyButtonIcon } from "../../elements/CopyButtonIcon";
import { animateBorderLoading } from "../../utility/animations";
import { OrbCanvas } from "../../elements/OrbCanvas";
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
    p: (props) => <Text mb={2} lineHeight="1.6" {...props} />,
    ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
    ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
    li: (props) => <ListItem mb={1} {...props} />,
    h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
    h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
    h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
    strong: (props) => {
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
    code: ({ inline, className, children, ...props }) => {
      const { colorMode } = useColorMode();
      const match = /language-(\w+)/.exec(className || "");

      return !inline && match ? (
        <SyntaxHighlighter
          language={match[1]}
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
};

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
      >
        <ModalOverlay />
        {/* Add OrbCanvas as a background */}

        {educationalMessages.length < 1 ? (
          <ModalContent
            bg="transparent"
            color="appText"
            borderWidth="0"
            borderColor="transparent"
            borderRadius="0"
            boxShadow="none"
            p={0}
            width="100%"
            minH="100dvh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <ModalBody
              p={0}
              style={{ width: "100%" }}
              display="flex"
              flex="1"
              minH="100dvh"
            >
              <Box color="appText" width="100%" flex="1" minH="100dvh">
                <OrbCanvas
                  hasStreamedText={false}
                  instructions={
                    <Markdown components={ChakraUIRenderer(newTheme())}>
                      {`${translation[userLanguage]["modal.learn.instructions"]}\n\n${
                        educationalMessages[educationalMessages.length - 1]
                          ?.content || ""
                      }`.trimStart()}
                    </Markdown>
                  }
                />
              </Box>
            </ModalBody>
          </ModalContent>
        ) : (
          <ModalContent
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
                        children={content.content.trimStart()}
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
                            {msg.content.trimStart()}
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
                          {(msg?.response?.content || "").trimStart()}
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
