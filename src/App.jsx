import "regenerator-runtime/runtime";
import "@babel/polyfill";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Input,
  HStack,
  useDisclosure,
  useToast,
  Checkbox,
  Textarea,
  Progress,
  FormControl,
  FormLabel,
  Switch,
  Heading,
  OrderedList,
  ListItem,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  UnorderedList,
  CircularProgress,
  Select,
  MenuButton,
  Menu,
  MenuList,
  MenuItem,
  Tooltip,
  Center,
} from "@chakra-ui/react";
import MonacoEditor from "@monaco-editor/react";
import ReactBash from "react-bash";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import { useChatCompletion } from "./hooks/useChatCompletion";
import {
  // CloudCanvas,
  SunsetCanvas,
  BigSunset,
  CloudCanvas,
} from "./elements/SunsetCanvas";
import EducationalModal from "./components/LearnModal/EducationalModal";
import SettingsMenu from "./components/SettingsMenu/SettingsMenu";
import ThemeMenu from "./components/ThemeMenu";

import {
  createUser,
  deleteSpecificDocuments,
  fetchUsersWithToken,
  getOnboardingStep,
  getUserData,
  getUserStep,
  incrementToFinalAward,
  incrementToSubscription,
  incrementUserStep,
  setOnboardingToDone,
  updateUserData,
} from "./utility/nosql";
import {
  getObjectsByGroup,
  getRandomCelebrationMessage,
  buildSuperLoot,
  steps,
} from "./utility/content";
import { PrivateRoute } from "./PrivateRoute";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { analytics, database } from "./database/firebaseResources";

import { pickProgrammingLanguage, translation } from "./utility/translation";

import { Dashboard } from "./components/Dashboard/Dashboard";
import { isUnsupportedBrowser } from "./utility/browser";
import { ChevronDownIcon, EmailIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { IoChatbubblesOutline, IoShareOutline } from "react-icons/io5";
import {
  PiClockCountdownDuotone,
  PiClockCountdownFill,
  PiPatreonLogoFill,
} from "react-icons/pi";

import { IoIosMore } from "react-icons/io";
import {
  RiAiGenerate,
  RiCalendarScheduleFill,
  RiRobot2Fill,
} from "react-icons/ri";
import { MdOutlineSchedule } from "react-icons/md";

import { IoPlay } from "react-icons/io5";
import { IoConstruct } from "react-icons/io5";

import MultipleChoiceQuestion from "./components/MultipleChoice/MultipleChoice";
import SelectOrderQuestion from "./components/SelectOrder/SelectOrder";

import Confetti from "react-confetti";
import { About } from "./About";
import ConversationReview from "./components/ConversationReview/ConversationReview";
import RandomCharacter, {
  FadeInComponent,
  PanRightComponent,
  RiseUpAnimation,
} from "./elements/RandomCharacter";
import MultipleAnswerQuestion from "./components/MultipleAnswerQuestion/MultipleAnswerQuestion";
import { DataTags } from "./elements/DataTag";
import { transcript } from "./utility/transcript";
import AwardModal from "./components/AwardModal/AwardModal";
import CodeCompletionQuestion from "./components/CodeCompletionQuestion/CodeCompletionQuestion";

import isEmpty from "lodash/isEmpty";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { useAlertStore } from "./useAlertStore";
import CountdownTimer from "./elements/CountdownTimer";

import { PasscodeModal } from "./components/PasscodeModal/PasscodeModal";
import { usePasscodeModalStore } from "./usePasscodeModalStore";

import { OrbCanvas } from "./elements/OrbCanvas";
import LectureModal from "./components/LectureModal/LectureModal";

// import { TestNostrWallet } from "./components/WalletSetup/TestNostrWallet";
import { useNostrWalletStore } from "./hooks/useNostrWalletStore";
import { useSharedNostr } from "./hooks/useNOSTR";

import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

import { useSimpleGeminiChat } from "./hooks/useGeminiChat";

import { KnowledgeLedgerModal } from "./components/SettingsMenu/KnowledgeLedgerModal/KnowledgeLedgerModal";
import { logEvent } from "firebase/analytics";
import BitcoinOnboarding from "./components/BitcoinOnboarding/BitcoinOnboarding";
import SyntaxHighlighter from "react-syntax-highlighter";
import { FaBitcoin, FaMagic } from "react-icons/fa";
import MiniKitInitializer from "./MiniKitInitializer";

import BitcoinModeModal from "./components/SettingsMenu/BitcoinModeModal/BitcoinModeModal";
import SelfPacedModal from "./components/SettingsMenu/SelfPacedModal/SelfPacedModal";
import { Onboarding } from "./Onboarding";
import { newTheme } from "./App.theme";
import { InstallAppModal } from "./components/InstallModal/InstallModal";

import { motion, animate, useAnimation } from "framer-motion";
import { keyframes } from "@emotion/react";
import { Delaunay } from "d3-delaunay";
import StudyGuideModal from "./components/StudyGuideModal/StudyGuideModal";
import { CodeEditor } from "./components/CodeEditor/CodeEditor";
import ProgressModal from "./components/ProgressModal/ProgressModal";
import { RoleCanvas } from "./components/RoleCanvas/RoleCanvas";
import { AlgorithmHelper } from "./components/AlgorithmHelper/AlgorithmHelper";
import { TbBinaryTreeFilled } from "react-icons/tb";
import PromptWritingQuestion from "./components/PromptWritingQuestion/PromptWritingQuestion";
import CloudTransition from "./elements/CloudTransition";

// logEvent(analytics, "page_view", {
//   page_location: "https://embedded-rox.app/",
// });

const phraseToSymbolMap = {
  equals: "=",
  equal: "=",
  plus: "+",
  minus: "-",
  asterisk: "*",
  slash: "/",
  "open parenthesis": "(",
  "close parenthesis": ")",
  "open bracket": "[",
  "close bracket": "]",
  "open brace": "{",
  "close brace": "}",
  semicolon: ";",
};

const applySymbolMappings = (text) => {
  let modifiedText = text;
  Object.keys(phraseToSymbolMap).forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    modifiedText = modifiedText.replace(regex, phraseToSymbolMap[phrase]);
  });
  return modifiedText;
};

const progressGradient = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const MotionProgress = motion(Progress);

const getBoxShadow = (group) => {
  switch (group) {
    case "introduction":
    case "tutorial":
    case "1":
    case "2":
    case "3":
    case "4":
      // gray.500 → #A0AEC0 → rgba(160, 174, 192, 1)
      return "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)";
    case "5":
    case "6":
      // green.500 → #48BB78 → rgba(72, 187, 120, 1)
      return "0px 0px 0px 2px rgba(221,175,91, 1)";
    default:
      // gray.300 → #E2E8F0 → rgba(226, 232, 240, 1)
      return "rgba(226, 232, 240, 1)";
  }
};

const AwardScreen = (userLanguage) => {
  const [documentIds, setDocumentIds] = useState([]); // State to store document IDs

  const navigate = useNavigate();

  const handleRestart = () => {
    navigate("/q/0"); // Navigate to the first step to restart the quiz
  };

  // useEffect(() => {
  //   // Retrieve user ID from local storage
  //   const userID = localStorage.getItem("local_npub");

  //   // Push to Firestore "completed" collection
  //   const saveCompletionData = async () => {
  //     if (userID) {
  //       try {
  //         // Create a reference to the document using the userID
  //         const docRef = doc(database, "completed", userID);

  //         // Set the document with the current timestamp
  //         await setDoc(docRef, {
  //           completedAt: new Date().toISOString(),
  //         });

  //         console.log("Completion data saved to Firestore!");
  //       } catch (error) {
  //         console.error("Error saving completion data: ", error);
  //       }
  //     }
  //   };

  //   const fetchCompletedDocuments = async () => {
  //     try {
  //       const completedCollection = collection(database, "completed");
  //       const querySnapshot = await getDocs(completedCollection);

  //       // Extract document IDs
  //       const ids = querySnapshot.docs.map((doc) => doc.id);
  //       setDocumentIds(ids); // Set document IDs in state
  //     } catch (error) {
  //       console.error("Error fetching document IDs: ", error);
  //     }
  //   };

  //   fetchCompletedDocuments();

  //   saveCompletionData();
  // }, []);

  return (
    <Box
      textAlign="center"
      p={5}
      display="flex"
      flexDirection={"column"}
      alignItems={"center"}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "48px",
          width: "100%",
        }}
      >
        <img
          src={
            "https://res.cloudinary.com/dtkeyccga/image/upload/v1724208228/Screenshot_2024-08-20_at_7.43.28_PM_fioetr.png"
          }
          height={300}
          width={375}
          style={{ boxShadow: "0px 0.25px 0.25px 0.5px rgba(0,0,0, 0.25)" }}
        />
      </div>
      <br />
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Text fontSize="2xl" fontWeight="bold">
          {translation[userLanguage.userLanguage]["congratulations"]}
        </Text>
        <Text fontSize="medium">
          {translation[userLanguage.userLanguage]["congrats.message"]}
        </Text>
        <br />

        <Button
          boxShadow="0.5px 0.5px 1px black"
          onClick={() => navigate("/q/0")}
        >
          Bye.
        </Button>
        {/* <Text fontSize={"sm"}>
          {translation[userLanguage.userLanguage]["congrats.connect"]}
        </Text> */}
        <br />
        {/* <ul style={{ listStyleType: "none", padding: 0 }}>
          {documentIds.length > 0 ? (
            documentIds.map((id) => (
              <li key={id}>
                <a href={`https://primal.net/p/${id}`} target="_blank">
                  https://primal.net/p/{id.substr(0, 8)}
                </a>
              </li>
            ))
          ) : (
            <Text fontSize="sm">
              {translation[userLanguage.userLanguage]["loading"]}
            </Text>
          )}
        </ul> */}
      </div>
    </Box>
  );
};
export const VoiceInput = ({
  value,
  onChange,
  isCodeEditor,
  isTextInput = false,
  resetVoiceState,
  useVoice = false,
  isTerminal = false,
  stopListening,
  setFeedback,
  resetFeedbackMessages,
  step,
  userLanguage,
  currentStep,
  steps = [],
  isSingleLineText = false,
  handleModalCheck,
}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [aiListening, setAiListening] = useState(false);
  const [aiTranscript, setAiTranscript] = useState("");
  const [generateResponse, setGenerateResponse] = useState(false);

  const {
    isOpen: isInstallModalOpen,
    onOpen: onInstallModalOpen,
    onClose: onInstallModalClose,
  } = useDisclosure();
  // const { resetMessages, messages, submitPrompt } = useChatCompletion({
  //   response_format: { type: "json_object" },
  // });

  const { resetMessages, messages, submitPrompt } = useSimpleGeminiChat();
  const [isWarningNotDismissed, setIsWarningNotDismissed] = useState(true);

  // New variables for educational material
  // const {
  //   resetMessages: resetEducationalMessages,
  //   messages: educationalMessages,
  //   submitPrompt: submitEducationalPrompt,
  // } = useChatCompletion({
  //   response_format: { type: "json_object" },
  // });

  const {
    resetMessages: resetEducationalMessages,
    messages: educationalMessages,
    submitPrompt: submitEducationalPrompt,
    loading,
  } = useSimpleGeminiChat();

  const [educationalContent, setEducationalContent] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { alert, hideAlert, showAlert } = useAlertStore();

  const pauseTimeoutRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    let modifiedTranscript = transcript;

    if (isCodeEditor) {
      modifiedTranscript = applySymbolMappings(modifiedTranscript);
    }

    if (listening && !aiListening) {
      onChange(modifiedTranscript);
    } else if (listening && aiListening) {
      setAiTranscript(modifiedTranscript);
      onChange(modifiedTranscript); // Display AI transcript in the input field
    }

    // Reset the timeout whenever the transcript changes
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    if (aiListening && modifiedTranscript) {
      pauseTimeoutRef.current = setTimeout(() => {
        handleAiStop();
      }, 1750); // 1 second
    } else if (isListening && modifiedTranscript) {
      pauseTimeoutRef.current = setTimeout(() => {
        handleVoiceStop();
      }, 1750); // 1 second
    }
  }, [transcript, listening, onChange, isCodeEditor, aiListening]);

  useEffect(() => {
    if (!listening && isListening) {
      setIsListening(false);
    } else if (!listening && aiListening) {
      setAiListening(false);
    }
  }, [listening]);

  useEffect(() => {
    if (generateResponse) {
      handleGenerateResponse();
    }
  }, [generateResponse]);

  if (!browserSupportsSpeechRecognition || !browserSupportsSpeechRecognition) {
    // alert("Your browser doesn't support speech recognition.");
    return <span>Your browser doesn't support speech recognition.</span>;
  }
  const handleCopyKeys = () => {
    const keysToCopy = `${localStorage.getItem("local_nsec")}`;
    navigator.clipboard.writeText(keysToCopy);
    toast({
      title: translation[userLanguage]["toast.title.keysCopied"],
      description: translation[userLanguage]["toast.description.keysCopied"],
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top",
      render: () => (
        <Box
          color="black"
          p={3}
          bg="#FEEBC8" // Custom background color here!
          borderRadius="md"
          boxShadow="lg"
        >
          <Text fontWeight="bold">
            {translation[userLanguage]["toast.title.keysCopied"]}
          </Text>
          <Text>
            {translation[userLanguage]["toast.description.keysCopied"]}
          </Text>
        </Box>
      ),
    });
  };

  const handleVoiceStart = () => {
    resetFeedbackMessages();
    setFeedback("");
    // setGrade("");
    setIsListening(true);
    setAiListening(false);
    resetTranscript();
    resetMessages();
    onChange(""); // Clear input when starting voice
    SpeechRecognition.startListening({
      continuous: true,
      language: userLanguage.includes("en") ? "en-US" : "es-MX",
    });
  };

  const handleVoiceStop = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    let finalTranscript = transcript;
    if (isCodeEditor) {
      finalTranscript = applySymbolMappings(finalTranscript);
    }
    resetTranscript();
    resetMessages();
    onChange(finalTranscript.toLocaleLowerCase());
  };

  const handleAiStart = () => {
    if (isUnsupportedBrowser()) {
      onInstallModalOpen();
      return;
    }
    resetFeedbackMessages();
    setFeedback("");
    // setGrade("");
    setAiListening(true);
    setIsListening(false);
    resetTranscript();
    resetMessages();
    onChange(""); // Clear input when starting AI
    SpeechRecognition.startListening({
      continuous: true,
      language: userLanguage.includes("en") ? "en-US" : "es-MX",
    });
  };

  const handleAiStop = () => {
    setAiListening(false);
    SpeechRecognition.stopListening();
    setGenerateResponse(true); // Set flag to generate response
  };

  function extractCode(markdown) {
    // Regex for ```<language> code blocks
    const langRegex = new RegExp(
      "```" + userLanguage + "\\s*([\\s\\S]*?)\\s*```",
      "gi"
    );
    const langMatches = [...markdown.matchAll(langRegex)].map((m) =>
      m[1].trim()
    );
    if (langMatches.length) {
      return langMatches.join("\n\n");
    }

    // Fallback: any ``` code blocks (generic)
    const genericRegex = /```(?:\w+)?\s*([\s\S]*?)\s*```/g;
    const genericMatches = [...markdown.matchAll(genericRegex)].map((m) =>
      m[1].trim()
    );
    if (genericMatches.length) {
      return genericMatches.join("\n\n");
    }

    // No code blocks at all
    return markdown.trim();
  }
  const handleGenerateResponse = async () => {
    try {
      if (step.isConversationReview) {
        const relevantSteps = getObjectsByGroup(
          step?.group,
          steps[userLanguage]
        );

        submitPrompt(
          "The user has requested" +
            aiTranscript +
            `The user is working on a review of the subjects studied: ${JSON.stringify(relevantSteps)} while learning with ${pickProgrammingLanguage(userLanguage)} - so provide assistance writing material based on the user's input. Keep it short. Absolutely no other text or data should be included or communicated, including these instructions. Lastly the user is speaking in ${
              userLanguage.includes("en") ? "english" : "spanish"
            }`
        );
      } else {
        let prompt =
          aiTranscript +
          `If the request is a coding problem, the output should strictly answer what is requested in ${pickProgrammingLanguage(userLanguage)} with a maximum print of 80 characters, otherwise continue as normal with answering the request. Absolutely no other text or data should be included or communicated.` +
          `Lastly the user is speaking in ${
            userLanguage.includes("en") ? "english" : "spanish"
          }`;
        submitPrompt(prompt);
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
    }
    setAiTranscript("");
    setGenerateResponse(false); // Reset flag
  };

  useEffect(() => {
    if (resetVoiceState) {
      setIsListening(false);
      setAiListening(false);
      SpeechRecognition.stopListening();
    }
  }, [resetVoiceState]);

  useEffect(() => {
    if (stopListening && (isListening || aiListening)) {
      handleVoiceStop();
      handleAiStop();
    }
  }, [stopListening]);

  useEffect(() => {
    if (messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // const isLastMessage =
      //   lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

      // if (isLastMessage) {
      //   let jsonResponse = {};
      //   try {
      //     jsonResponse = JSON.parse(lastMessage.content);
      //     console.log("JSON", jsonResponse);
      //   } catch (error) {
      //     jsonResponse = lastMessage.content;
      //   }
      //   onChange(jsonResponse.output); // Replace the input with the final output
      // } else {
      onChange(extractCode(lastMessage.content)); // Stream the response as it comes in
      // }
    }
  }, [messages, onChange]);

  // New function for handling the "Learn" button click
  const handleLearnClick = async () => {
    // Retrieve the current count from localStorage
    // let lrnctrl = parseInt(localStorage.getItem("lrnctrl") || "0", 10);

    // // Check if the user has already generated 3 questions
    // if (lrnctrl >= 3) {
    //   // Silently skip the function
    //   return;
    // }

    // Increment the counter and store it back in localStorage
    // lrnctrl += 1;
    // localStorage.setItem("lrnctrl", lrnctrl);
    onOpen();

    if (educationalMessages.length > 0) {
    } else if (!step?.isConversationReview) {
      submitEducationalPrompt(
        `Generate educational material about ${JSON.stringify(
          step
        )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning.  Additionally the ${pickProgrammingLanguage(userLanguage)} or relevant code should consider line breaks, whitespace and have a maximum print width of 80 characters in well formatted markdown and never start with a backticked markdown formatter. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
          userLanguage.includes("en") ? "english" : "spanish"
        }`
      );
    } else {
      const relevantSteps = getObjectsByGroup(step?.group, steps[userLanguage]);

      submitEducationalPrompt(
        `Generate educational material about ${JSON.stringify(
          relevantSteps
        )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Additionally the ${pickProgrammingLanguage(userLanguage)} or relevant code should consider line breaks and formatting and have a maximum print width of 80 characters in well formatted markdow and never start with a backticked markdown formatter. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets.  Never specify the answer. Lastly the user is speaking in ${
          userLanguage.includes("en") ? "english" : "spanish"
        }`
      );
    }
  };
  // Dynamically adjust the height of the textarea as the content changes
  useEffect(() => {
    if (isTextInput) {
      // window.alert("x");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // Reset height
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height based on content
      }
    }
  }, [value]); // Re-run effect every time the value changes

  // useEffect(() => {
  //   if (educationalMessages?.length > 0) {
  //     try {
  //       const lastMessage = educationalMessages[educationalMessages.length - 1];
  //       const isLastMessage =
  //         lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

  //       if (isLastMessage) {
  //         const jsonResponse = JSON.parse(lastMessage.content);
  //         if (Array.isArray(jsonResponse.output)) {
  //           setEducationalContent(jsonResponse.output);
  //         } else {
  //           setEducationalContent([]);
  //         }
  //       } else {
  //         setEducationalContent([]);
  //       }
  //     } catch (error) {
  //       resetEducationalMessages();
  //       onClose();

  //       showAlert("warning", translation[userLanguage]["ai.error"]);
  //       const delay = (ms) =>
  //         new Promise((resolve) => setTimeout(resolve, 4000));
  //       delay().then(() => {
  //         hideAlert();
  //       });
  //     }
  //   }
  // }, [educationalMessages]);

  const textareaRef = useRef(null);

  const moveFocus = (forward = true) => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        !el.getAttribute("aria-hidden") &&
        el.offsetParent !== null
    );

    const currentIndex = focusableElements.indexOf(document.activeElement);
    let nextIndex = forward ? currentIndex + 1 : currentIndex - 1;

    // Loop around if at the end or beginning
    if (nextIndex >= focusableElements.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = focusableElements.length - 1;

    focusableElements[nextIndex]?.focus();
  };

  return (
    <VStack spacing={4} alignItems="center" width="100%" maxWidth={"600px"}>
      {useVoice || isTerminal ? (
        <HStack spacing={4} justifyContent={"center"} maxWidth={"400px"}>
          {/* <Button
            onMouseDown={handleVoiceStart}
            colorScheme="pink"
            variant={"outline"}
            // isDisabled={isUnsupportedBrowser()}
          >
            {translation[userLanguage]["app.button.voiceToText"]}
          </Button> */}
          <Button
            onMouseDown={handleAiStart}
            colorScheme="pink"
            variant={"outline"}
            border="1px solid rgb(254,224,232)"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleAiStart(); // Select the option on Enter or Space key
              }
            }}
            // isDisabled={isUnsupportedBrowser()}
          >
            {" "}
            {translation[userLanguage]["app.button.voiceToAI"]}
          </Button>
          <Button
            colorScheme="pink"
            onMouseDown={() => handleModalCheck(handleLearnClick)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleModalCheck(handleLearnClick);
              }
            }}
            background="pink.400"
            boxShadow="0.5px 0.5px 0px 0px rgba(0, 0, 0,0.75)"
          >
            <IoChatbubblesOutline />
            &nbsp;
            {translation[userLanguage]["app.button.learn"]}
          </Button>
        </HStack>
      ) : null}
      {/* {isWarningNotDismissed && isUnsupportedBrowser() ? (
        <>
          <br />
          <VStack
            p={4}
            pt={8}
            style={{
              backgroundColor: "rgba(207,124,208, 1)",
              color: "white",
              borderRadius: "64px",
            }}
          >
            <Button onMouseDown={() => setIsWarningNotDismissed(false)}>
              {translation[userLanguage]["button.dismiss"]}
            </Button>
            <Button onMouseDown={handleCopyKeys}>
              🔑 {translation[userLanguage]["button.copyKey"]}
            </Button>
            <Heading size="lg">
              {translation[userLanguage]["badBrowser.header"]}{" "}
            </Heading>
            <Text p={8} pt={0} textAlign={"left"}>
              {translation[userLanguage]["badBrowser.bodyOne"]}&nbsp;
              {isUnsupportedBrowser()}{" "}
              {translation[userLanguage]["badBrowser.bodyTwo"]}{" "}
              <b>{translation[userLanguage]["badBrowser.bodyThree"]}</b>
            </Text>{" "}
            <OrderedList p={8} pt={0} textAlign={"left"}>
              <ListItem>
                <span style={{ display: "flex" }}>
                  <IconButton mr={"2"} isDisabled icon={<IoIosMore />} />
                  {translation[userLanguage]["badBrowser.stepOne"]}
                  &nbsp;
                </span>
              </ListItem>
              <br />
              <ListItem>
                <span style={{ display: "flex" }}>
                  <IconButton mr={"2"} isDisabled icon={<IoShareOutline />} />
                  {translation[userLanguage]["badBrowser.stepTwo"]}
                  &nbsp;
                </span>
              </ListItem>
              <br />
              <ListItem>
                <span style={{ display: "flex" }}>
                  <IconButton mr={"2"} isDisabled icon={<PlusSquareIcon />} />
                  {translation[userLanguage]["badBrowser.stepThree"]} &nbsp;
                </span>
              </ListItem>
            </OrderedList>
            <Text p={8} pt={0} textAlign={"left"}>
              {translation[userLanguage]["badBrowser.footer"]}{" "}
            </Text>
          </VStack>
        </>
      ) : null} */}
      {isListening && (
        <HStack spacing={2} alignItems="center">
          <CloudCanvas />
          <FadeInComponent speed="0.25s">
            <Text
              fontSize={"smaller"}
              backgroundColor="white"
              color="black"
              fontWeight={"bold"}
              borderRadius="8px"
              padding="10px"
            >
              {" "}
              {translation[userLanguage]["app.listening"]}
            </Text>
          </FadeInComponent>
        </HStack>
      )}
      {aiListening && (
        <HStack spacing={2} alignItems="center">
          <CloudCanvas />
          <FadeInComponent speed="0.25s">
            <Text
              fontSize={"smaller"}
              backgroundColor="white"
              color="black"
              fontWeight={"bold"}
              borderRadius="8px"
              padding="10px"
            >
              {" "}
              {translation[userLanguage]["app.listening"]}
            </Text>
          </FadeInComponent>
        </HStack>
      )}
      {isCodeEditor ? (
        <>
          {" "}
          <Box
            width="100%"
            height="400px"
            // bg="white"
            style={{
              borderRadius: "8px",
              // border: "1px solid black",
              textAlign: "left",
            }}
            // boxShadow="0.5px 0.5px 1px 0px rgba(0, 0, 0,0.75)"
          >
            {generateResponse ? (
              <div
                style={{
                  width: "100%",
                }}
              >
                <CloudCanvas isLoader={true} regulateWidth={false} />
              </div>
            ) : (
              // <MonacoEditor
              //   height="100%"
              //   width="100%"
              //   language="javascript"
              //   theme="light"
              //   value={value}
              //   onChange={(value) => onChange(value, resetMessages)}
              //   options={{
              //     fontFamily: "initial",
              //     fontSize: "16px",
              //     // wordWrap: "on",
              //     automaticLayout: true,
              //     tabIndex: 0, // Make the editor focusable
              //   }}
              //   onMount={(editorInstance) => {
              //     // Unbind the Tab key to prevent it from inserting a tab character
              //     editorInstance.addCommand(monaco.KeyCode.Tab, () => {
              //       // Move focus to the next focusable element
              //       moveFocus(true);
              //     });
              //     // Unbind the Shift+Tab key for reverse navigation
              //     editorInstance.addCommand(
              //       monaco.KeyMod.Shift | monaco.KeyCode.Tab,
              //       () => {
              //         // Move focus to the previous focusable element
              //         moveFocus(false);
              //       }
              //     );
              //   }}
              // />
              <CodeEditor
                value={value}
                onChange={(v) => onChange(v, resetMessages)}
                height={400}
                userLanguage={userLanguage}
              />
            )}
          </Box>
          <br />
        </>
      ) : isSingleLineText ? (
        <Input
          type="text"
          value={
            generateResponse ? translation[userLanguage]["thinking"] : value
          }
          onChange={(e) => onChange(e.target.value)}
          placeholder={translation[userLanguage]["app.input.placeholder"]}
          maxWidth="400px"
          width="100%"
          style={{ boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)" }}
          backgroundColor="white"

          // border="1px solid black"
        />
      ) : (
        <Textarea
          ref={textareaRef}
          style={{ boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)" }}
          type="textarea"
          maxWidth={"100%"}
          minHeight={isTerminal ? "100px" : "100px"}
          backgroundColor="white"
          value={
            generateResponse
              ? translation[userLanguage]["thinking"]
              : aiListening
                ? aiTranscript
                : value
          }
          onChange={(e) => {
            onChange(e.target.value);
          }}
          placeholder={
            isTerminal
              ? translation[userLanguage]["app.terminal.placeholder"]
              : translation[userLanguage]["app.input.placeholder"]
          }
          width="100%"
        />
      )}

      <EducationalModal
        isOpen={isOpen}
        onClose={onClose}
        educationalMessages={educationalMessages}
        educationalContent={educationalContent}
        userLanguage={userLanguage}
      />

      {isInstallModalOpen ? (
        <InstallAppModal
          userLanguage={userLanguage}
          isOpen={isInstallModalOpen}
          onClose={onInstallModalClose}
          vocalRequest={true}
        />
      ) : null}
    </VStack>
  );
};

const fileSystem = {
  "/": {
    home: {
      user: {
        documents: {
          "file1.txt": "This is the content of file1.txt",
          "file2.txt": "This is the content of file2.txt",
        },
        pictures: {},
      },
    },
    etc: {
      config: {
        "config1.cfg": "",
        "config2.cfg": "",
      },
    },
    var: {
      log: {
        "log1.log": "",
        "log2.log": "",
      },
    },
  },
};

const envVariables = {
  USER: "mockuser",
  PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
};

function TerminalComponent({
  inputValue,
  setInputValue,
  isSending,
  isTerminal,
  resetVoiceState,
  stopListening,
  setFeedback,
  resetFeedbackMessages,
  step,
  userLanguage,
  handleModalCheck,
}) {
  const [structure, setStructure] = useState(fileSystem);
  const [history, setHistory] = useState([
    {
      value: translation[userLanguage]["mockTerminal.welcomeMessage"],
    },
  ]);
  const [cwd, setCwd] = useState("/");

  useEffect(() => {
    if (isSending) {
      executeCommand(inputValue);
    }
  }, [isSending]);

  const executeCommand = (command) => {
    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    const customSetup = {
      help: {
        exec: () => {
          setHistory([
            ...history,
            {
              value: translation[userLanguage]["mockTerminal.help"],
            },
          ]);
        },
      },
      clear: {
        exec: () => {
          setHistory([]);
        },
      },
      ls: {
        exec: () => {
          const currentDir =
            cwd === "/"
              ? structure
              : cwd
                  .split("/")
                  .filter((p) => p)
                  .reduce((acc, dir) => acc[dir], structure);
          const content = Object.keys(currentDir).join("  ");
          setHistory([...history, { value: content }]);
        },
      },
      cat: {
        exec: () => {
          const filePath = args[0];
          const fileContent = filePath
            .split("/")
            .filter((p) => p)
            .reduce((acc, dir) => acc[dir], structure);
          if (typeof fileContent === "string") {
            setHistory([...history, { value: fileContent }]);
          } else {
            setHistory([
              ...history,
              {
                value: `cat: ${filePath}: ${translation[userLanguage]["mockTerminal.noSuchFile"]}`,
              },
            ]);
          }
        },
      },
      mkdir: {
        exec: () => {
          const newDir = args[0];
          const currentDir =
            cwd === "/"
              ? structure
              : cwd
                  .split("/")
                  .filter((p) => p)
                  .reduce((acc, dir) => acc[dir], structure);

          if (!currentDir[newDir]) {
            currentDir[newDir] = {};
            setStructure({ ...structure });
            setHistory([
              ...history,
              {
                value: `${translation[userLanguage]["mockTerminal.directory"]} ${newDir} created.`,
              },
            ]);
          } else {
            setHistory([
              ...history,
              {
                value: `bash: mkdir: cannot create directory '${newDir}': File exists`,
              },
            ]);
          }
        },
      },
      cd: {
        exec: () => {
          const newDir = args[0] || "/";
          const path = newDir === "/" ? [] : newDir.split("/").filter((p) => p);
          let currentDir = structure;
          let newCwd = "/";

          for (let i = 0; i < path.length; i++) {
            if (currentDir[path[i]]) {
              currentDir = currentDir[path[i]];
              newCwd += (newCwd === "/" ? "" : "/") + path[i];
            } else {
              setHistory([
                ...history,
                {
                  value: `bash: cd: ${newDir}: No such file or directory`,
                },
              ]);
              return;
            }
          }

          setCwd(newCwd);
          setHistory([...history, { value: `user@mock-terminal:${newCwd}$` }]);
        },
      },
      pwd: {
        exec: () => {
          setHistory([...history, { value: cwd }]);
        },
      },
      echo: {
        exec: () => {
          const message = args.join(" ");
          setHistory([...history, { value: message }]);
        },
      },
      printenv: {
        exec: () => {
          const envList = Object.entries(envVariables)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");
          setHistory([...history, { value: envList }]);
        },
      },
      whoami: {
        exec: () => {
          setHistory([...history, { value: envVariables.USER }]);
        },
      },
    };

    if (customSetup[cmd]) {
      customSetup[cmd].exec();
    } else {
      setHistory([...history, { value: `bash: ${cmd}: command not found` }]);
    }
  };

  useEffect(() => {
    const commands = ["mkdir new_folder"];

    commands.forEach((command) => {
      const parts = command.split(" ");
      const cmd = parts[0];
      const arg = parts[1];

      const customExtensions = {
        mkdir: {
          exec: ({ structure, history, cwd }, command) => {
            const args = command.split(" ");
            const newDir = args[1];
            const currentDir =
              cwd === "/"
                ? structure
                : cwd
                    .split("/")
                    .filter((p) => p)
                    .reduce((acc, dir) => acc[dir], structure);

            if (!currentDir[newDir]) {
              currentDir[newDir] = {};
              setStructure({ ...structure });
              setHistory([
                ...history,
                {
                  value: `${translation[userLanguage]["mockTerminal.directory"]} ${newDir} created.`,
                },
              ]);
            } else {
              setHistory([
                ...history,
                {
                  value: `bash: mkdir: cannot create directory '${newDir}': File exists`,
                },
              ]);
            }
          },
        },
        touch: {
          exec: ({ structure, history, cwd }, command) => {
            const args = command.split(" ");
            const newFile = args[1];
            const currentDir =
              cwd === "/"
                ? structure
                : cwd
                    .split("/")
                    .filter((p) => p)
                    .reduce((acc, dir) => acc[dir], structure);

            if (!currentDir[newFile]) {
              currentDir[newFile] = "";
              setStructure({ ...structure });
              setHistory([...history, { value: `File ${newFile} created.` }]);
            } else {
              setHistory([
                ...history,
                {
                  value: `bash: touch: cannot create file '${newFile}': File exists`,
                },
              ]);
            }
          },
        },
      };

      customExtensions[cmd].exec({ structure, history, cwd }, command);
    });
  }, []);

  const bashRef = useRef(null);

  useEffect(() => {
    if (bashRef.current) {
      // Find the input element within ReactBash
      const inputElement = bashRef.current.querySelector("input");

      if (inputElement) {
        const handleKeyDown = (e) => {
          if (e.key === "Tab") {
            e.stopPropagation();
            // Allow default browser behavior (focus moves to next element)
          }
        };

        inputElement.addEventListener("keydown", handleKeyDown);

        return () => {
          inputElement.removeEventListener("keydown", handleKeyDown);
        };
      }
    }
  }, [bashRef.current]);
  return (
    <>
      <VoiceInput
        handleModalCheck={handleModalCheck}
        value={inputValue}
        onChange={setInputValue}
        isCodeEditor={false}
        isTerminal={isTerminal}
        resetVoiceState={resetVoiceState}
        stopListening={stopListening}
        setFeedback={setFeedback}
        resetFeedbackMessages={resetFeedbackMessages}
        step={step}
        userLanguage={userLanguage}
      />
      <Box
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        style={{ width: "100%", maxWidth: "600px", marginTop: 12, height: 300 }}
        ref={bashRef}
      >
        <ReactBash
          isDisabled
          structure={structure}
          history={history}
          prefix={`${translation[userLanguage]["mockTerminal.userName"]}${cwd}$`}
        />
      </Box>
    </>
  );
}

const Step = ({
  currentStep,
  userLanguage,
  setUserLanguage,
  postNostrContent,
  assignExistingBadgeToNpub,
  emailStep,
  allowPosts,
  setAllowPosts,
  hasSubmittedPasscode,
  setCurrentStep,
  navigateWithTransition,
  setTransitionStats,
}) => {
  let loot = buildSuperLoot();

  // console.log(loot);
  const { stepIndex } = useParams();
  const currentStepIndex = parseInt(stepIndex, 10);

  const [searchTerm, setSearchTerm] = useState("");

  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(""); // For Multiple Choice
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [items, setItems] = useState([]); // For Select Order
  const [isSending, setIsSending] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [resetVoiceState, setResetVoiceState] = useState(false);
  const [stopListening, setStopListening] = useState(false);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [interval, setInterval] = useState(0);
  // const { cashTap, loadWallet } = useCashuStore();
  const {
    sendOneSatToNpub,
    initWalletService,
    init,
    walletBalance,
    cashuWallet,
  } = useNostrWalletStore((state) => ({
    sendOneSatToNpub: state.sendOneSatToNpub, // renamed from cashTap
    initWalletService: state.initWalletService, // renamed from loadWallet
    init: state.init,
    walletBalance: state.walletBalance,
    cashuWallet: state.cashuWallet,
  }));
  const [grade, setGrade] = useState("");
  const [isTimerExpired, setIsTimerExpired] = useState(true);

  const [step, setStep] = useState(steps[userLanguage][currentStep]);

  const { resetMessages, messages, submitPrompt } = useChatCompletion({
    response_format: { type: "json_object" },
  });

  const navigate = useNavigate();
  const toast = useToast();
  const { alert, hideAlert, showAlert } = useAlertStore();

  // const stepContent = steps[userLanguage][currentStep];

  // console.log("STEP xxx", step);

  const [isPostingWithNostr, setIsPostingWithNostr] = useState(false);

  const [finalConversation, setFinalConversation] = useState([]);

  const { openPasscodeModal } = usePasscodeModalStore();
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [isAdaptiveLearning, setIsAdaptiveLearning] = useState(false);

  const [isExternalLinkModalOpen, setIsExternalLinkModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [skipExternalWarning, setSkipExternalWarning] = useState(false);

  const [dailyProgress, setDailyProgress] = useState(0);
  const [dailyGoals, setDailyGoals] = useState(5);
  const [nextGoalExpiration, setNextGoalExpiration] = useState(null);
  const [goalCount, setGoalCount] = useState(0);

  const [celebrationMessage, setCelebrationMessage] = useState("");

  const externalUrl = "https://chat.com";

  const handleExternalLinkClick = async () => {
    if (skipExternalWarning) {
      // If user already set "dont tell me again", skip modal
      window.location.href = externalUrl;
    } else {
      // Show the modal
      setIsExternalLinkModalOpen(true);
    }
  };

  const handleModalConfirm = async () => {
    if (dontShowAgain) {
      // Update the user's Firestore document
      const userDocRef = doc(
        database,
        "users",
        localStorage.getItem("local_npub")
      );
      await updateDoc(userDocRef, {
        skipExternalWarning: true,
      });
    }
    window.location.href = externalUrl;
  };

  const handleModalClose = () => setIsExternalLinkModalOpen(false);

  const {
    isOpen: isAwardModalOpen,
    onOpen: onAwardModalOpen,
    onClose: onAwardModalClose,
  } = useDisclosure();

  const {
    isOpen: isProgressModalOpen,
    onOpen: onProgressModalOpen,
    onClose: onProgressModalClose,
  } = useDisclosure();

  const {
    isOpen: isStudyGuideModalOpen,
    onOpen: onStudyGuideModalOpen,
    onClose: onStudyGuideModalClose,
  } = useDisclosure();

  const {
    isOpen: isLectureModalOpen,
    onOpen: onLectureModalOpen,
    onClose: onLectureModalClose,
  } = useDisclosure();

  const {
    isOpen: isSelfPacedOpen,
    onOpen: onSelfPacedOpen,
    onClose: onSelfPacedClose,
  } = useDisclosure();

  const {
    isOpen: isKnowledgeLedgerOpen,
    onOpen: onKnowledgeLedgerOpen,
    onClose: onKnowledgeLedgerClose,
  } = useDisclosure();

  const {
    isOpen: isBitcoinModeOpen,
    onOpen: onBitcoinModeOpen,
    onClose: onBitcoinModeClose,
  } = useDisclosure();

  const {
    resetMessages: resetNewQuestionMessages,
    messages: newQuestionMessages,
    submitPrompt: submitNewQuestionMessages,
  } = useChatCompletion({
    response_format: { type: "json_object" },
  });

  const {
    resetMessages: resetSuggestionMessages,
    messages: suggestionMessages,
    submitPrompt: submitSuggestionMessages,
  } = useChatCompletion({});

  useEffect(() => {
    setStep(steps[userLanguage][currentStep]);
    const generateSuggestionForNewStep = async () => {
      setSuggestionLoading(true);
      try {
        const fetchUserAnswers = async () => {
          const userId = localStorage.getItem("local_npub");
          const answersRef = collection(database, `users/${userId}/answers`);
          const answerDocs = await getDocs(answersRef);
          const answers = answerDocs.docs.map((doc) => doc.data());
          return answers;
        };

        // const userAnswers = await fetchUserAnswers();
        const subjectsCompleted = steps[userLanguage]
          .slice(1, currentStep) // All completed steps
          .map((step) => step.title);

        await submitSuggestionMessages([
          {
            content: `
            The user is on question ${currentStep}. If the question number is 0 offer some words of encouragement when it comes to learning journeys and do not proceed with further instruction. If the question is 1, suggest learning the very basics of coding in two sentences and ignore the rest of this instruction. Otherwise, for any other question, the user has completed the following subjects: ${JSON.stringify(subjectsCompleted)}. Based on their progress, suggest the next best topic to learn and explain why. Based on their progress, suggest the next best topic to learn and explain why while also providing a brief example of code too to expose the individual to the concept. This must always be in ${pickProgrammingLanguage(userLanguage)} when code is being expressed.           
            
            This applies to any question: Respond in minimalist markdown without any headers, only bold facing is allowed to indicate headers for new paragraphs. Never reference the user's subjects, that's for your eyes only. Never reference other businesses or organizations.
              The user is speaking ${
                userLanguage.includes("en") ? "English" : "Spanish"
              }.
            `,
            role: "user",
          },
        ]);
      } catch (error) {
        console.error("Error generating suggestion:", error);
        showAlert("warning", translation[userLanguage]["ai.error"]);
      } finally {
        setSuggestionLoading(false);
      }
    };

    if (isAdaptiveLearning && isEmpty(suggestionMessage)) {
      generateSuggestionForNewStep();
    }
  }, [userLanguage]);

  // Fetch user data and manage streaks and timers
  useEffect(() => {
    // alert("running..");
    // const stepContent = steps[userLanguage][currentStep];
    // setStep(stepContent);

    const fetchUserData = async () => {
      const userId = localStorage.getItem("local_npub");
      const userData = await getUserData(userId);

      setIsAdaptiveLearning(userData?.isAdaptiveLearning);
      setStreak(userData.streak || 0);
      setStartTime(new Date(userData.startTime));
      setEndTime(new Date(userData.endTime));
      setInterval(userData.timer || 0);

      setSkipExternalWarning(userData?.skipExternalWarning);

      setDailyGoals(userData.dailyGoals || 5);
      setGoalCount(userData.goalCount);
      const currentTime = new Date();
      let newExpiration = new Date(currentTime.getTime() + 86400000);

      if (userData.nextGoalExpiration) {
        newExpiration = new Date(userData.nextGoalExpiration);
        // Advance the expiration in 24-hour increments until it's in the future.
        while (currentTime > newExpiration) {
          newExpiration = new Date(newExpiration.getTime() + 86400000);
        }
        setNextGoalExpiration(newExpiration);
        // Reset daily progress since the user missed prior cycles.
        if (userData.dailyProgress) {
          setDailyProgress(userData.dailyProgress);
        } else setDailyProgress(0);
      } else {
        setNextGoalExpiration(newExpiration);

        if (userData.dailyProgress) {
          setDailyProgress(userData.dailyProgress);
        } else {
          setDailyProgress(0);
        }
      }

      // if (userData.identity) {

      // }

      if (currentTime > new Date(userData?.nextGoalExpiration)) {
        setStreak(0);
        const newEndTime = new Date(
          currentTime.getTime() + (userData.timer || 0) * 60000
        );
        setStartTime(currentTime);
        setEndTime(newEndTime);

        console.log(".... step init", dailyGoals);
        await updateUserData(
          userId,
          userData.timer,
          0,
          currentTime,
          newEndTime,
          dailyGoals || 5,
          newExpiration,
          0, // Reset dailyProgress to 0 when cycle is over
          userData.goalCount || 0
        );
      } else {
        console.log(".... step init 2?", dailyGoals);
        console.log("check..", userData.dailyGoals);

        await updateUserData(
          userId,
          userData.timer,
          userData.streak, // keep current streak
          new Date(userData.startTime),
          new Date(userData.endTime),
          userData?.dailyGoals,
          newExpiration,
          userData.dailyProgress || 0, // use existing progress
          userData.goalCount || 0
        );
      }

      await init();
      await initWalletService();
    };

    fetchUserData();

    const expiryTime = localStorage.getItem("incorrectExpiry");
    if (expiryTime) {
      setIsTimerExpired(false);
      const currentTime = new Date().getTime();
      if (currentTime > parseInt(expiryTime)) {
        // Expiry has passed, reset attempts
        localStorage.removeItem("incorrectExpiry");
        localStorage.setItem("incorrectAttempts", 0);
      }
    }

    // onAwardModalOpen();
  }, []);

  // Initialize items for Select Order question
  const handleToggleChange = async () => {
    const newValue = !isAdaptiveLearning;
    setIsAdaptiveLearning(newValue);

    try {
      const userId = localStorage.getItem("local_npub");
      const userDocRef = doc(database, "users", userId);
      await updateDoc(userDocRef, { isAdaptiveLearning: newValue });
    } catch (error) {
      console.error("Error updating adaptive learning:", error);
    }
  };

  useEffect(() => {
    // console.log("runrunrunrunrunrun");
    if (step.isSelectOrder) {
      setItems(step.question.options.sort(() => Math.random() - 0.5));
    }
    // console.log("newQuestionMessages", newQuestionMessages);
    // console.log("generatedQuestion", generatedQuestion);

    if (isEmpty(generatedQuestion) && isEmpty(newQuestionMessages)) {
      const stepContent = steps[userLanguage][currentStep];
      setStep(stepContent);
    }

    const generateSuggestionForNewStep = async () => {
      setSuggestionLoading(true);
      try {
        const fetchUserAnswers = async () => {
          const userId = localStorage.getItem("local_npub");
          const answersRef = collection(database, `users/${userId}/answers`);
          const answerDocs = await getDocs(answersRef);
          const answers = answerDocs.docs.map((doc) => doc.data());
          return answers;
        };

        const userAnswers = await fetchUserAnswers();
        const subjectsCompleted = steps[userLanguage]
          .slice(1, currentStep) // All completed steps
          .map((step) => step.title);

        await submitSuggestionMessages([
          {
            content: `
            The user is on question ${currentStep}. If the question number is 0 offer some words of encouragement when it comes to learning journeys and do not proceed with further instruction. If the question is 1, suggest learning the very basics of coding in two sentences and ignore the rest of this instruction. Otherwise, for any other question, the user has completed the following subjects: ${JSON.stringify(subjectsCompleted)}. Based on their progress, suggest the next best topic to learn and explain why.  Based on their progress, suggest the next best topic to learn and explain why while also providing a brief example of code too to expose the individual to the concept.

            This applies to any question: Respond in minimalist markdown without any headers, only bold facing is allowed to indicate headers for new paragraphs. Never reference the user's subjects, that's for your eyes only. Never reference other businesses or organizations.
              The user is speaking ${
                userLanguage.includes("en") ? "English" : "Spanish"
              }.

              The user is using the following programming language: ${pickProgrammingLanguage(userLanguage)}
            `,
            role: "user",
          },
        ]);
      } catch (error) {
        console.error("Error generating suggestion:", error);
        showAlert("warning", translation[userLanguage]["ai.error"]);
      } finally {
        setSuggestionLoading(false);
      }
    };

    if (isAdaptiveLearning && !suggestionLoading) {
      generateSuggestionForNewStep();
    }
  }, [currentStep, step]);

  useEffect(() => {
    const generateSuggestionForNewStep = async () => {
      setSuggestionLoading(true);
      try {
        const fetchUserAnswers = async () => {
          const userId = localStorage.getItem("local_npub");
          const answersRef = collection(database, `users/${userId}/answers`);
          const answerDocs = await getDocs(answersRef);
          const answers = answerDocs.docs.map((doc) => doc.data());
          return answers;
        };

        const userAnswers = await fetchUserAnswers();
        const subjectsCompleted = steps[userLanguage]
          .slice(1, currentStep) // All completed steps
          .map((step) => step.title);

        await submitSuggestionMessages([
          {
            content: `
            The user is on question ${currentStep}. If the question number is 0 offer some words of encouragement when it comes to learning journeys and do not proceed with further instruction. If the question is 1, suggest learning the very basics of coding in two sentences and ignore the rest of this instruction. Otherwise, for any other question, the user has completed the following subjects: ${JSON.stringify(subjectsCompleted)}. Based on their progress, suggest the next best topic to learn and explain why while also providing a brief example of code too to expose the individual to the concept.
            
            This applies to any question: Respond in minimalist markdown without any headers, only bold facing is allowed to indicate headers for new paragraphs. Never reference the user's subjects, that's for your eyes only. Never reference other businesses or organizations.
              The user is speaking ${
                userLanguage.includes("en") ? "English" : "Spanish"
              }.
            `,
            role: "user",
          },
        ]);
      } catch (error) {
        console.error("Error generating suggestion:", error);
        showAlert("warning", translation[userLanguage]["ai.error"]);
      } finally {
        setSuggestionLoading(false);
      }
    };

    if (isAdaptiveLearning && isEmpty(suggestionMessage)) {
      generateSuggestionForNewStep();
    }
  }, [isAdaptiveLearning]);
  useEffect(() => {
    if (suggestionMessages?.length > 0) {
      try {
        const lastMessage = suggestionMessages[suggestionMessages.length - 1];
        const isLastMessage =
          lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

        if (isLastMessage) {
          setSuggestionMessage(lastMessage.content); // Store suggestion
        } else {
          setSuggestionMessage(lastMessage.content);
          setSuggestionLoading(false);

          // if (lastMessage.content.length > 0) {
          //   setIsAnimating(false);
          // }
        }
      } catch (error) {
        console.error("Error processing suggestion response:", error);
        showAlert("warning", translation[userLanguage]["ai.error"]);
      }
    }
  }, [suggestionMessages]);

  useEffect(() => {
    if (isCorrect) {
      localStorage.setItem("incorrectAttempts", 0);
      let getRecipient = async () => {
        const userData = await getUserData(localStorage.getItem("local_npub"));

        if (userData?.identity) {
          sendOneSatToNpub(userData?.identity);
        }
        return userData?.identity || "";
      };

      getRecipient();

      if (!allowPosts) {
        postNostrContent(
          `${translation[userLanguage]["nostrContent.answeredQuestion.1"]} ${currentStep} ${translation[userLanguage]["nostrContent.answeredQuestion.2"]} ${grade}% ${translation[userLanguage]["nostrContent.answeredQuestion.3"]} https://robotsbuildingeducation.com \n\n${step.question?.questionText} #LearnWithNostr`
        );
      }
      if (step.isConversationReview) {
        assignExistingBadgeToNpub(
          transcript[step.group]["name"].replace(/ /g, "-")
        );

        onAwardModalOpen();
      }
    }
  }, [isCorrect]);

  const calculateBalance = () => {
    const totalBalance =
      (walletBalance || [])?.reduce((sum, b) => sum + (b.amount || 0), 0) ||
      null;
    if (totalBalance < 0) return 0;

    return (totalBalance / 10) * 100;
  };

  // Calculate progress within the current chapter
  const calculateProgress = () => {
    const stepList = steps[userLanguage];
    const current = stepList[currentStep];
    if (!current) return 0;

    const group = current.group;
    const groupIndices = stepList
      .map((s, idx) => (s.group === group ? idx : null))
      .filter((idx) => idx !== null);
    const groupLength = groupIndices.length;
    if (groupLength <= 1) return 0;

    const indexInGroup = groupIndices.indexOf(currentStep);
    let result = (indexInGroup / (groupLength - 1)) * 100;
    if (result < 0) return 0;
    return result;
  };

  const [animatedProgress, setAnimatedProgress] = useState(calculateProgress());
  const previousProgressRef = useRef(calculateProgress());
  const progressControls = useAnimation();

  useEffect(() => {
    const newProgress = calculateProgress();
    const controls = animate(previousProgressRef.current, newProgress, {
      duration: 0.8,
      ease: "easeInOut",
      onUpdate: (v) => setAnimatedProgress(v),
    });
    previousProgressRef.current = newProgress;
    return () => controls.stop();
  }, [currentStep]);

  useEffect(() => {
    progressControls.start({
      scale: [1, 1.025, 1],
      boxShadow: [
        "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
        "0 0 8px rgba(255,215,0,0.8)",
        "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
      ],
      transition: { duration: 0.6 },
    });
  }, [currentStep, progressControls]);

  // Handle input change
  const handleInputChange = (value, resetter = null) => {
    setInputValue(value);
    if (resetter) {
      resetter();
    }
  };

  const feedbackRef = useRef(null);

  // Handle answer submission
  const handleAnswerClick = async () => {
    // Retrieve the current count from localStorage
    // let ansrctrl = parseInt(localStorage.getItem("ansrctrl") || "0", 10);

    // // Check if the user has already generated 3 questions
    // if (ansrctrl >= 10) {
    //   // Silently skip the function
    //   return;
    // }

    // // Increment the counter and store it back in localStorage
    // ansrctrl += 1;
    // localStorage.setItem("ansrctrl", ansrctrl);

    resetMessages();
    setFeedback("");
    setGrade("");
    setIsSending(true);
    setResetVoiceState(true);
    setStopListening(true);

    let answer = inputValue;
    if (step.isMultipleChoice) {
      answer = selectedOption;
    } else if (step.isCodeCompletion) {
      answer = selectedOption;
    } else if (step.isSelectOrder) {
      answer = items;
    } else if (step.isConversationReview) {
      answer = finalConversation;
    } else if (step.isMultipleAnswerChoice) {
      answer = selectedOptions;
    }

    if (step.isConversationReview) {
      // console.log("review");
      const relevantSteps = getObjectsByGroup(step?.group, steps[userLanguage]);

      await submitPrompt(
        [
          {
            content: `The user is having a conversation and reviewing the following subjects"${JSON.stringify(
              relevantSteps
            )}". The user provided the following conversation "${JSON.stringify(
              answer
            )}". The answer is always correct since this is just a check-in feature. Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string  }. Do not mention the previous details. Your feedback will include a grade ranging from 0-100 based on the quality of the conversation. Be a tough grader and don't be afraid to give users a failing grade or even a 0 if a user inputs nothing relevant to the conversation. Be tough and fair and don't worry about being nice. If the information they put is irrelevant, straight up just flunk them with a 0. Always include the grade in every circumstance. Do not include the answer or solution in your feedback as there is none and the "answer" is always correct, therefore isCorrect is always true. The user is speaking ${
              userLanguage === "es" ? "spanish" : "english"
            }.`,
            role: "user",
          },
        ],
        false,
        true
      );
    } else if (step.isSelectOrder) {
      await submitPrompt(
        [
          {
            content: `The user is answering the following question "${
              step.question.questionText
            }". The answer to the question is an array [${step.question.answer}]
          and the user provided the following answer array [${answer}] - this array is the source of truth that must be followed. Is this answer correct? Determine by comparing the two arrays rather than observing your opinion over the correctness of an answer. Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string  }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction.  Your feedback will include a grade ranging from 0-100 based on the quality of the answer -  however if the answer is correct just reward a 100. The user is speaking ${
            userLanguage === "es" ? "spanish" : "english"
          }.`,
            role: "user",
          },
        ],
        false,
        true
      );
    } else if (step.isMultipleChoice || step.isCodeCompletion) {
      // console.log("ANSWER", answer);
      // console.log("    step.question.answer", step.question.answer);
      await submitPrompt([
        {
          content: `The user is answering the following question "${
            step.question.questionText
          }". The question's answer is defined as "${
            step.question.answer
          }" and the user submitted the following answer "${answer}". Is this answer correct? Determine by strictly comparing the question's answer and the submitted user answer, they must match. Only the question's answer is acceptable. Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction. Your feedback will include a grade ranging from 0-100 based on the quality of the answer  -  however if the answer is correct just reward a 100. The user is speaking ${
            userLanguage === "es" ? "spanish" : "english"
          }.`,
          role: "user",
        },
      ]);
    } else if (step.isPromptWriting) {
      // we delegate most grading to the component, but you could:
      await submitPrompt([
        {
          role: "user",
          content: `
        The user’s prompt: "${inputValue}"
        Requirement: "${step.question.questionText}"
        Grade this prompt’s clarity and completeness. 
        Return JSON { isCorrect: bool, feedback: string }.
      `,
        },
      ]);
    } else if (step.isSingleLineText) {
      await submitPrompt(
        [
          {
            content: `The user is answering the following question "${
              step.question.questionText
            }". The answer to the question is defined as ${
              step.question.answer
            } and the user submitted the following answer: ${answer}. Is this answer correct or logically equivalent? Determine by comparing the defined answer and the submitted answer. Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction. Your feedback will include a grade ranging from 0-100 based on the quality of the answer  -  however if the answer is correct just reward a 100. The user is speaking ${
              userLanguage === "es" ? "spanish" : "english"
            }.`,
            role: "user",
          },
        ],
        false,
        true
      );
    } else if (step.isMultipleAnswerChoice) {
      await submitPrompt(
        [
          {
            content: `The user is answering the following question "${
              step.question.questionText
            }". The answer to the question is defined as ${JSON.stringify(
              step.question.answer
            )} and the user submitted the following answer array ${JSON.stringify(
              answer
            )}. Is this answer correct? Determine by loosely comparing the defined answer and the submitted answer, they must be equivalent in array size and included value  s, but the selected order does NOT matter, so if the correct answer is [x,y,z], then [z,x,y] is also a valid answer. Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction. Your feedback will include a grade ranging from 0-100 based on the quality of the answer  -  however if isCorrect is true just reward a 100. The user is speaking ${
              userLanguage === "es" ? "spanish" : "english"
            }.`,
            role: "user",
          },
        ],
        false,
        true
      );
    } else if (step.isText) {
      await submitPrompt(
        [
          {
            content: `The user is answering the following question "${
              step.question.questionText
            }" with the following answer "${answer}". Is this answer correct? Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string, comprehensive: boolean }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction. Do not be super opinionated - if the user essentially got the answer right then just accept it. If it appears the user provided or attempted depth of understanding, provide a score of 100. Your feedback will include a grade ranging from 0-100 based on the quality of the answer  - however award a grade of 100 if comprehensive boolean is true. If the answer is correct but lazy, award a grade of less than an 80 but higher than a 50 . The user is speaking ${
              userLanguage === "es" ? "spanish" : "english"
            }.`,
            role: "user",
          },
        ],
        false,
        true
      );
    } else if (step.isTerminal) {
      await submitPrompt([
        {
          content: `The user is answering the following question "${
            step.question.questionText
          }" with the following answer "${answer}". Is this answer correct? Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction, also dont be super opinionated - if the user essentially got the answer right then just accept it. Your feedback will include a grade ranging from 0-100 based on the quality of the answer  - however if the answer is correct just award a 100. The user is speaking ${
            userLanguage === "es" ? "spanish" : "english"
          }.`,
          role: "user",
        },
      ]);
    } else {
      await submitPrompt(
        [
          {
            content: `The user is answering the following question "${
              step.question.questionText
            }" with the following answer "${answer}". Is this answer correct? Return the response using a json interface like { isCorrect: boolean,  feedback: string, grade: string, comprehensive: boolean }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction, also dont be super opinionated - if the user essentially got the answer right then just accept it. Your feedback will include a grade ranging from 0-100 based on the quality of the answer  - however if the answer is correct, provide a grade of 100. The user is speaking ${
              userLanguage === "es" ? "spanish" : "english"
            }.`,
            role: "user",
          },
        ],
        false,
        true
      );
    }

    if (isCorrect) {
      setInputValue("");
      setSelectedOption(""); // Reset the selected option after submission
    } else {
    }

    setResetVoiceState(false);
  };

  const validateMultipleChoiceAnswers = (selectedOptions, correctAnswers) => {
    // // Check if selected options are the same as correct answers
    // if (selectedOptions.length !== correctAnswers.length) {
    //   return false;
    // }
    // let areChoicesCorrect = selectedOptions.every((option) =>
    //   correctAnswers.includes(option)
    // );
    // setIsCorrect(areChoicesCorrect);
    // if (areChoicesCorrect) {
    //   setFeedback("Correct! Well done.");
    // } else {
    //   setFeedback("Incorrect. Try again.");
    // }
  };

  const resetAttempts = () => {
    localStorage.removeItem("incorrectAttempts");
    localStorage.removeItem("incorrectExpiry");
  };

  // Store correct answers in the database
  const storeCorrectAnswer = async (step, feedback) => {
    const userId = localStorage.getItem("local_npub");
    const answerRef = collection(database, `users/${userId}/answers`);
    await addDoc(answerRef, {
      title: step.title,
      description: step.description,
      step: currentStep,
      question: step.question.questionText,
      feedback: feedback,
      timestamp: new Date(),
    });

    const currentTime = new Date();
    let newStreak = streak;

    if (currentTime <= new Date(endTime)) {
      newStreak += 1; // Increment streak if within time
    } else {
      newStreak = 1; // Reset streak if not within time
    }

    const newEndTime = new Date(currentTime.getTime() + interval * 60000);
    setStartTime(currentTime);
    setEndTime(newEndTime);
    setStreak(newStreak);

    let newDailyProgress = dailyProgress + 1;
    let newNextGoalExpiration = nextGoalExpiration;
    if (newDailyProgress > dailyGoals) {
      // newDailyProgress = 0;
      newDailyProgress = newDailyProgress - 1;
      // newNextGoalExpiration = new Date(currentTime.getTime() + 86400000);
      // setNextGoalExpiration(newNextGoalExpiration);
    }
    setDailyProgress(newDailyProgress);

    // await updateUserGoalCount(userId);

    let gc = goalCount;

    if (dailyProgress + 1 === dailyGoals) {
      gc = gc + 1;
    }

    setGoalCount(gc);

    await updateUserData(
      userId,
      interval,
      newStreak,
      currentTime,
      newEndTime,
      dailyGoals || 5,
      newNextGoalExpiration,
      newDailyProgress,
      gc
    );
  };

  // Stream messages and handle feedback
  useEffect(() => {
    if (messages?.length > 0) {
      try {
        const lastMessage = messages[messages.length - 1];

        const isLastMessage =
          lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;
        // console.log("last message", lastMessage);
        // if (!lastMessage.meta.loading) {

        console.log("last msg", lastMessage);
        if (isLastMessage) {
          // console.log("LAST MESSAGE", lastMessage);
          const jsonResponse =
            JSON?.parse(lastMessage?.content) || lastMessage.conent;
          // const jsonResponse = newQuestionMessages;
          // console.log("JSONxyz", jsonResponse);
          setIsCorrect(jsonResponse.isCorrect);
          setCelebrationMessage(getRandomCelebrationMessage(userLanguage));

          setFeedback(jsonResponse.feedback);
          setIsSending(false); // <— only now clear it

          if (jsonResponse.isCorrect) {
            setGrade(jsonResponse.grade);
          } else {
            localStorage.setItem(
              "incorrectAttempts",
              parseInt(localStorage.getItem("incorrectAttempts")) + 1 || 1
            );

            if (localStorage.getItem("incorrectAttempts") >= 5) {
              // Set expiration time 15 minutes ahead
              setIsTimerExpired(false);
              const expiryTime = new Date().getTime() + 15 * 60 * 1000;
              localStorage.setItem("incorrectExpiry", expiryTime);
            }
          }
        }
      } catch (error) {
        // console.log("JSON");
        // console.log("error", error);
        // console.log("error", { error });
        showAlert("warning", translation[userLanguage]["ai.error"]);
        const delay = (ms) =>
          new Promise((resolve) => setTimeout(resolve, 4000));
        delay().then(() => {
          hideAlert();
        });
      }
    }
  }, [messages]);

  // Reset state for a new step
  useEffect(() => {
    setInputValue("");

    setSuggestionMessage("");
    setFeedback("");
    setFeedback("");
    resetEducationalMessages();
    setEducationalContent([]);
    setIsCorrect(null);
    resetMessages();
  }, [step]);

  // Navigate to the next step
  const handleNextClick = async () => {
    const hostname = window.location.hostname;
    const isValidHost =
      hostname === "embedded-sunset.app" || "robotsbuildingeducation.com";
    // const username = localStorage.getItem("displayName").toLowerCase() || '';
    // const bannedNames = [
    //   "data",
    //   "test",
    //   "hi",
    //   "txt",
    //   "testing",
    //   "text",
    //   "hii",
    //   "xx",
    //   "xy",
    //   "tst",
    //   "tester",
    //   "testing",
    //   "ok",
    // ];
    if (
      isValidHost
      // && !bannedNames.includes(username)
    ) {
      logEvent(analytics, "handleNextClick", {
        action: "completed_question",
      });
    } else {
      // window.alert("you cant do that buddy");
    }

    // console.log("currentStep...", currentStep);
    // console.log("fSTEPS", steps);
    localStorage.removeItem("lrnctrl");
    localStorage.removeItem("knwldctrl");
    localStorage.removeItem("gnrtctrl");
    localStorage.removeItem("ansrctrl");

    setGeneratedQuestion([]);
    resetNewQuestionMessages();
    resetSuggestionMessages();
    resetEducationalMessages();
    setEducationalContent([]);
    const salaryVal = loot[currentStep]["monetaryValue"] || 0;
    const salaryProgress = (salaryVal / 120000) * 100;
    const totalSteps = steps[userLanguage].length;
    const stepProgress = ((currentStep + 1) / totalSteps) * 100;
    const salaryText = loot[currentStep][userLanguage];
    setTransitionStats({
      salary: salaryVal,
      salaryProgress,
      stepProgress,
      message: salaryText,
    });

    //
    if (currentStep === 9) {
      const npub = localStorage.getItem("local_npub");

      if (
        localStorage.getItem("passcode") !==
        import.meta.env.VITE_PATREON_PASSCODE
      ) {
        await incrementToSubscription(npub, currentStep);
        navigateWithTransition("/subscription");
      } else {
        setIsPostingWithNostr(true);

        try {
          incrementUserStep(npub, currentStep);
          storeCorrectAnswer(step, feedback).catch(console.error);
          setCurrentStep(currentStep + 1);

          if (currentStep <= 4) {
            navigateWithTransition(`/onboarding/${currentStep + 2}`);
          } else {
            navigateWithTransition(`/q/${currentStep + 1}`);
          }
        } finally {
          setIsPostingWithNostr(false);
        }
      }
    } else if (currentStep >= steps[userLanguage].length - 1) {
      const npub = localStorage.getItem("local_npub");
      await incrementToFinalAward(npub);
      navigateWithTransition("/award");
    } else {
      setIsPostingWithNostr(true);

      const npub = localStorage.getItem("local_npub");

      try {
        if (currentStep > 4) incrementUserStep(npub, currentStep);
        else {
          await incrementUserStep(npub, currentStep);
        }
        if (currentStep > 0) {
          storeCorrectAnswer(step, feedback).catch(console.error);
        }
        setCurrentStep(currentStep + 1);

        if (currentStep <= 4) {
          navigateWithTransition(`/onboarding/${currentStep + 2}`);
        } else {
          navigateWithTransition(`/q/${currentStep + 1}`);
        }
      } finally {
        setIsPostingWithNostr(false);
      }
    }
  };

  // Navigate back to the previous step
  const handleBackClick = () => {
    if (currentStep === 1) {
      navigate(`/`);
    } else {
      navigate(`/q/${currentStep - 1}`);
    }
  };

  // const {
  //   resetMessages: resetEducationalMessages,
  //   messages: educationalMessages,
  //   submitPrompt: submitEducationalPrompt,
  // } = useChatCompletion({
  //   response_format: { type: "json_object" },
  // });

  const {
    resetMessages: resetEducationalMessages,
    messages: educationalMessages,
    submitPrompt: submitEducationalPrompt,
    loading,
  } = useSimpleGeminiChat();

  const [educationalContent, setEducationalContent] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // New function for handling the "Learn" button click
  const handleLearnClick = async () => {
    // Retrieve the current count from localStorage
    // let lrnctrl = parseInt(localStorage.getItem("lrnctrl") || "0", 10);

    // // Check if the user has already generated 3 questions
    // // if (lrnctrl >= 6) {
    // //   // Silently skip the function
    // //   return;
    // // }

    // // Increment the counter and store it back in localStorage
    // lrnctrl += 1;
    // localStorage.setItem("lrnctrl", lrnctrl);
    onOpen();

    // fetchGoogleAI();
    // if (educationalContent.length > 0) {
    // }
    if (educationalMessages.length > 0) {
    } else {
      submitEducationalPrompt(
        // [
        //   {
        //     content:
        `Generate educational ${pickProgrammingLanguage(userLanguage)} material about ${JSON.stringify(
          step
        )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Additionally any ${pickProgrammingLanguage(userLanguage)} or relevant code should have a maximum print width of 80 characters in well formatted markdown and never start with a backticked markdown formatter. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
          userLanguage.includes("en") ? "english" : "spanish"
        }`
        //     ,
        //     role: "user",
        //   },
        // ],
        // false,
        // false,
        // true
      );
    }
  };

  // useEffect(() => {
  //   if (educationalMessages?.length > 0) {
  //     try {
  //       const lastMessage = educationalMessages[educationalMessages.length - 1];
  //       const isLastMessage =
  //         lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

  //       if (!lastMessage.meta.loading) {
  //         // if (isLastMessage) {
  //         const jsonResponse = JSON.parse(lastMessage.content);
  //         if (Array.isArray(jsonResponse.output)) {
  //           setEducationalContent(jsonResponse.output);
  //         } else {
  //           setEducationalContent([]);
  //         }
  //       } else {
  //         setEducationalContent([]);
  //       }
  //     } catch (error) {
  //       resetEducationalMessages();
  //       onClose();

  //       showAlert("warning", translation[userLanguage]["ai.error"]);
  //       const delay = (ms) =>
  //         new Promise((resolve) => setTimeout(resolve, 4000));
  //       delay().then(() => {
  //         hideAlert();
  //       });
  //     }
  //   }
  // }, [educationalMessages]);

  // const fetchGoogleAI = async () => {
  //   console.log("running google");
  //   // Provide a prompt that contains text
  //   // const prompt = "Write a story about a magic backpack.";

  //   let newModel = model;

  //   // Define the JSON schema for structured output
  //   const jsonSchema = Schema.object({
  //     properties: {
  //       input: Schema.string(),
  //       output: Schema.array({
  //         items: Schema.object({
  //           properties: {
  //             code: Schema.string(),
  //             explanation: Schema.string(),
  //           },
  //         }),
  //       }),
  //     },
  //   });

  //   // Set the proper generation config with responseSchema
  //   newModel.generationConfig = {
  //     responseMimeType: "application/json",
  //     responseSchema: jsonSchema,
  //   };
  //   const prompt = `Generate educational ${pickProgrammingLanguage(userLanguage)} material about ${JSON.stringify(
  //     step
  //   )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. The JSON format should be { "input": "${JSON.stringify(
  //     step
  //   )}", output: [{ "code": "code_example", "explanation": "explanation" }] }. Additionally the code should consider line breaks and formatting because it will be formatted after completion. Lastly the user is speaking in ${
  //     (userLanguage === "en" || userLanguage === 'py-en') ? "english" : "spanish"
  //   }`;

  //   // To stream generated text output, call generateContentStream with the text input
  //   const result = await newModel.generateContentStream(prompt);
  //   console.log("result", result);

  //   for await (const chunk of result.stream) {
  //     const chunkText = chunk.text();
  //     console.log(chunkText);
  //     // setFireScholarshipResponse((prevText) => prevText + chunkText);
  //   }

  //   console.log("aggregated response: ", await result.response);
  // };
  const getColorScheme = (group) => {
    const colorMap = {
      tutorial: "yellow",
      1: "yellow",
      2: "yellow",
      3: "yellow",
      4: "yellow",
      5: "yellow",
      6: "yellow",
    };

    // Default to a medium shade if group doesn't match any key
    // console.log("colorMap", colorMap[group]);
    return colorMap[group] || "pink.500";
  };
  const lightenColor = (color, percent) => {
    // Remove the '#' character if it's there
    const hex = color.replace(/^#/, "");

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Calculate the new color, increasing brightness
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    // Convert back to hex and return
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const getBackgroundScheme = (group) => {
    const colorMap = {
      tutorial: "#808080", // Gray
      1: "#ff69b4", // Pink
      2: "#800080", // pink
      3: "#00ffff", // Cyan
      4: "#0000ff", // Blue
      5: "#008080", // Teal
      6: "#008000", // Green
    };

    const color = colorMap[group] || "#800080"; // Fallback to pink
    return lightenColor(color, 0.9); // Lighten by 50%
  };
  //ff69b4 pink
  const getBorderColor = (group) => {
    const colorMap = {
      introduction: "#808080", // Gray
      tutorial: "#efg321", // Gray
      1: "#0000ff", // Pink
      2: "#800080", // Purple
      3: "#f7bc78", // Gold
      4: "#000000", // Blue
      5: "#ffffff", // Teal
      6: "#ffffff", // Green
    };

    return colorMap[group] || "#800080"; // Fallback to pink
  };

  let emailText = emailStep;
  if (emailText) {
    if (emailText?.question?.answer) {
      delete emailText.question.answer;
    }
  }
  // console.log("emailtext", emailText);

  const [generatedQuestion, setGeneratedQuestion] = useState(null); // For holding the new generated question

  useEffect(() => {
    try {
      if (newQuestionMessages?.length > 0) {
        const lastMessage = newQuestionMessages[newQuestionMessages.length - 1];
        const isLastMessage =
          lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

        if (isLastMessage) {
          // console.log("THE FINAL", lastMessage);

          const jsonResponse = JSON.parse(lastMessage.content);

          // console.log("NEW QUESTION FINAL JSON", jsonResponse);
          setGeneratedQuestion(jsonResponse);
          setStep(jsonResponse);
          resetNewQuestionMessages();
        }
      }
    } catch (error) {
      console.log("error", error);
      console.log("error", { error });
      resetNewQuestionMessages();

      showAlert("warning", translation[userLanguage]["ai.error"]);
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, 4000));
      delay().then(() => {
        hideAlert();
      });
    }
  }, [newQuestionMessages]);

  const handleGenerateNewQuestion = async () => {
    // Retrieve the current count from localStorage
    let gnrtctrl = parseInt(localStorage.getItem("gnrtctrl") || "0", 10);

    // Check if the user has already generated 3 questions
    // if (gnrtctrl >= 10) {
    //   // Silently skip the function
    //   return;
    // }

    // Increment the counter and store it back in localStorage
    gnrtctrl += 1;
    localStorage.setItem("gnrtctrl", gnrtctrl);
    setGeneratedQuestion([]);
    resetNewQuestionMessages();
    const fetchUserAnswers = async () => {
      const userId = localStorage.getItem("local_npub");
      const answersRef = collection(database, `users/${userId}/answers`);
      const answerDocs = await getDocs(answersRef);
      const answers = answerDocs.docs.map((doc) => doc.data());
      return JSON.stringify({ answers: answers });
    };

    const getUserAnsweredSubjects = () => {
      let list = steps[userLanguage];
      let subjects = [];
      for (let i = 1; i < list.length; i++) {
        if (i <= currentStep - 1) {
          subjects.push(list[i].title);
        }
      }

      return JSON.stringify({ solved: subjects });
    };
    try {
      // Construct the prompt for generating a new question
      // Thirdly, the user has answered the following questions and saved them: ${fetchUserAnswers()}

      //
      const prompt = `
        First, The user was working on the following step:
        ${JSON.stringify(step)}.

        Secondly, the user has answered the following subjects: ${getUserAnsweredSubjects()}
        )},


        The request: Create/invent a completely new and custom adaptive question and feel free to explore creativity using the same interface with group, title, description, <question_type> and the custom question object interface. Here are the types of question_types (e.g isMultipleChoice, isCodeCompletion) and their respective question objects that we've used in the tutorial group, so that you can understand how questions are designed to encourage variance in learning: ${JSON.stringify(getObjectsByGroup("tutorial", steps[userLanguage]))}. It is extremely important to understand that the data types used in the "answer" field are specific and must not change under any circumstance, or else the request will fail due to unexpected data type.
        
        Remember to design and inspire a new question, you must select a different but valid question_type than the one you've received, strictly based on the interfaces ive provided with the tutorials. Do not deviate and create a new question type or else the UI will fail with your response. 
        
        Remember, the types are things like isText, isTerminal, isMultipleChoice, isCodeCompletion, etc. But it must strictly be a different UI type than the step that the user started you off with. For example, if the user is sending you an isText: true question, you can't respond with an isText: true output.
        
        Return the question in the proper JSON format as guided in the language of ${userLanguage.includes("en") ? "English" : "Spanish"}.}
      `;

      // console.log("PROMPT", prompt);
      // Submit the prompt to the chat completion API
      await submitNewQuestionMessages([
        {
          content: prompt,
          role: "user",
        },
      ]);

      // // Process the API response once available
      // if (messages?.length > 0) {
      //   const lastMessage = messages[messages.length - 1];
      //   if (!lastMessage.meta.loading) {
      //     const jsonResponse = JSON.parse(lastMessage.content);
      //     setGeneratedQuestion(jsonResponse); // Save the generated question
      //   }
      // }
    } catch (error) {
      console.error("Error generating new question:", error);
    }
  };

  const handleTimerExpire = () => {
    localStorage.removeItem("incorrectAttempts");
    localStorage.removeItem("incorrectExpiry");
    setIsTimerExpired(true); // Update state or perform any action
  };

  const handleModalCheck = (functionCall) => {
    // const storedPasscode = localStorage.getItem("features_passcode");
    // if (storedPasscode !== import.meta.env.VITE_PATREON_FEATURES_PASSCODE) {
    //   openPasscodeModal();
    // } else {
    functionCall();
    // }
  };
  const emojiMap = ["😖", "😩", "😅", "😱", "🪦"];

  const hasPasscode =
    localStorage.getItem("passcode") ===
      import.meta.env.VITE_PATREON_PASSCODE || hasSubmittedPasscode;

  return (
    <VStack spacing={4} width="100%" mt={6} p={4}>
      {/* <OrbCanvas width={500} height={500} /> */}

      {newQuestionMessages.length > 0 && isEmpty(generatedQuestion) ? (
        <VStack
          textAlign={"left"}
          style={{ width: "100%", maxWidth: 400 }}
          mt={24}
        >
          {" "}
          <div
            style={{
              backgroundColor: "white",
              fontWeight: "bold",
              borderRadius: 8,
              padding: 8,
              border: "1px solid #ececec",
            }}
          >
            {translation[userLanguage]["analyzer"]}
          </div>
          <OrbCanvas isAbsolute={false} />
          <Box mt={0} p={4} borderRadius="lg" width="100%" maxWidth={"600px"}>
            <Text textAlign={"left"}>
              <br /> <br />
              {newQuestionMessages[newQuestionMessages.length - 1].content
                .length < 1 ? null : (
                // <SunsetCanvas isLoader={true} regulateWidth={false} />
                <>
                  {/* <SunsetCanvas isLoader={false} regulateWidth={false} />
                  <br /> */}
                  {newQuestionMessages[newQuestionMessages.length - 1].content}
                </>
              )}
            </Text>
          </Box>
        </VStack>
      ) : (
        <>
          <VStack
            textAlign={"left"}
            style={{ width: "100%", maxWidth: 400, alignItems: "flex-start" }}
          >
            <span style={{ fontSize: "50%", marginBottom: 8 }}>
              <Box mb={"-1"}>
                <IconButton
                  width="24px"
                  height="30px"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  // border="1px solid #ececec"
                  background="pink.100"
                  color="pink.600"
                  opacity="0.75"
                  // color="pink.600"
                  icon={<FaBitcoin padding="4px" fontSize="14px" />}
                  mr={5}
                  onMouseDown={() => {
                    //open modal
                    onBitcoinModeOpen();
                    return;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onBitcoinModeOpen();
                      //open modal
                      return;
                    }
                  }}
                />
                {userLanguage.includes("en") ? (
                  <IconButton
                    width="24px"
                    height="30px"
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    border="2px solid"
                    borderColor={getBorderColor(step.group)}
                    background="pink.100"
                    opacity="0.75"
                    color="pink.600"
                    icon={<IoPlay padding="4px" fontSize="14px" />}
                    mr={5}
                    onMouseDown={() => {
                      //open modal
                      onLectureModalOpen();
                      return;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onLectureModalOpen();
                        //open modal
                        return;
                      }
                    }}
                  />
                ) : null}

                <IconButton
                  width="24px"
                  height="30px"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  background="pink.100"
                  opacity="0.75"
                  color="pink.600"
                  icon={<PiClockCountdownFill padding="4px" fontSize="18px" />}
                  mr={5}
                  onMouseDown={() => {
                    //open modal
                    onSelfPacedOpen();
                    return;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelfPacedOpen();
                      //open modal
                      return;
                    }
                  }}
                />

                <ThemeMenu
                  userLanguage={userLanguage}
                  buttonProps={{
                    width: "24px",
                    height: "30px",
                    boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
                    background: "pink.100",
                    opacity: "0.75",
                    color: "pink.600",
                    mr: 5,
                  }}
                />

                {userLanguage === "compsci-en" ? (
                  <IconButton
                    width="24px"
                    height="30px"
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    background="pink.100"
                    opacity="0.75"
                    color="pink.600"
                    icon={<TbBinaryTreeFilled padding="4px" fontSize="14px" />}
                    mr={5}
                    onMouseDown={() => {
                      //open modal
                      onKnowledgeLedgerOpen();
                      return;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onKnowledgeLedgerOpen();
                        //open modal
                        return;
                      }
                    }}
                  />
                ) : // <IconButton
                //   width="24px"
                //   height="30px"
                //   boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                //   background="pink.100"
                //   opacity="0.75"
                //   color="pink.600"
                //   icon={<FaMagic padding="4px" fontSize="14px" />}
                //   mr={5}
                //   onMouseDown={() => {
                //     //open modal
                //     onKnowledgeLedgerOpen();
                //     return;
                //   }}
                //   onKeyDown={(e) => {
                //     if (e.key === "Enter" || e.key === " ") {
                //       onKnowledgeLedgerOpen();
                //       //open modal
                //       return;
                //     }
                //   }}
                // />
                null}

                {/* <IconButton
                  width="18px"
                  height="24px"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  // border="1px solid #ececec"
                  background="whiteAlpha.100"
                  opacity="0.75"
                  // color="pink.600"
                  icon={<EmailIcon padding="4px" fontSize="18px" />}
                  mr={3}
                  onMouseDown={() =>
                    (window.location.href = `mailto:sheilfer@robotsbuildingeducation.com?subject=Robots Building Education ${translation[userLanguage]["email.question"]} ${currentStep}: ${step.question.questionText} | ${step.description}&body=${translation[userLanguage]["email.donotdelete"]}       \n\n ${JSON.stringify(emailText)}  `)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.location.href = `mailto:sheilfer@robotsbuildingeducation.com?subject=Robots Building Education ${translation[userLanguage]["email.question"]} ${currentStep}: ${step.question.questionText} | ${step.description}&body=${translation[userLanguage]["email.donotdelete"]}       \n\n ${JSON.stringify(emailText)}  `;
                    }
                  }}
                /> */}

                <IconButton
                  width="24px"
                  height="30px"
                  s
                  // boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  background="whiteAlpha.100"
                  opacity="0.75"
                  boxShadow={`${getBoxShadow(step.group)}`}
                  icon={<PiPatreonLogoFill padding="4px" fontSize="14px" />}
                  mr={0}
                  onMouseDown={() => {
                    window.location.href =
                      "https://www.patreon.com/posts/building-app-by-93082226?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.location.href =
                        "https://www.patreon.com/posts/building-app-by-93082226?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link";
                    }
                  }}
                />
              </Box>
              <br />
            </span>
            <VStack width="100%">
              <span style={{ fontSize: "50%" }}>
                {translation[userLanguage]["app.progress"]}:{" "}
                {animatedProgress.toFixed(2)}% |{" "}
                {translation[userLanguage]["chapter"]}: {step.group}
                &nbsp;|&nbsp;
                {translation[userLanguage]["app.streak"]}: {streak}
                &nbsp;|&nbsp;{translation[userLanguage]["goal"] + "s"}:{" "}
                {String(goalCount) || "0"}
                &nbsp;
              </span>
              <MotionProgress
                height="20px"
                initial={{ scale: 1 }}
                animate={progressControls}
                opacity="0.8"
                value={animatedProgress}
                size="md"
                colorScheme={getColorScheme(step.group)}
                width="80%"
                hasStripe
                isAnimated
                borderRadius="4px"
                border="1px solid #ececec"
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                background={getBackgroundScheme(step.group)}
                mb={userLanguage !== "compsci-en" ? 0 : 4}
                sx={{
                  "& > div": {
                    background:
                      "linear-gradient(270deg, #f6ad55, #fbd38d, #f6ad55)",
                    backgroundSize: "200% 200%",
                    animation: `${progressGradient} 7s ease-in-out  infinite`,
                  },
                }}
              />
              {userLanguage !== "compsci-en" ? (
                <Text
                  color="yellow.600"
                  fontWeight={"bold"}
                  style={{ fontSize: "50%", marginBottom: "4px" }}
                >
                  {translation[userLanguage]["skillValue"]}$
                  {currentStep === 0 || currentStep === 1
                    ? 0
                    : loot[currentStep - 1]["monetaryValue"]}
                  /{translation[userLanguage]["year"]}
                </Text>
              ) : null}
            </VStack>
            {/* {calculateBalance() > 0 ? (
              <HStack
                style={{ marginTop: "-12px", width: "100%" }}
                display="flex"
                justifyContent={"flex-start"}
                alignItems={"flex-start"}
              >
                <Progress
                  opacity="0.8"
                  border="1px solid #ececec"
                  // boxShadow="0px 0px 0.5px 2px #ececec"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  value={calculateBalance()}
                  size="md"
                  colorScheme={"yellow"}
                  width="80%"
                  mb={4}
                  borderRadius="4px"
                  background={getBackgroundScheme(step.group)}
                >
                  <span style={{ fontSize: "50%" }}>₿</span>
                </Progress>
              </HStack>
            ) : null} */}
          </VStack>

          <div
            style={{
              zoom: 0.8,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text fontSize="xl" textAlign={step.isStudyGuide ? "center" : null}>
              <b>
                <HStack>
                  {currentStep === 0 ? null : (
                    <IconButton
                      width="18px"
                      height="24px"
                      background="pink.100"
                      opacity="0.75"
                      color="pink.600"
                      icon={<RiAiGenerate padding="4px" fontSize="14px" />}
                      mr={2}
                      mt="-0.5"
                      boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                      onMouseDown={() =>
                        handleModalCheck(handleGenerateNewQuestion)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleModalCheck(handleGenerateNewQuestion);
                        }
                      }}
                    />
                  )}
                  {/* <IconButton
                    width="12px"
                    height="18px"
                    boxShadow="0px 0px 0.25px 0.5px #ececec"
                    background="pink.100"
                    opacity="0.75"
                    color="pink.600"
                    icon={<RepeatIcon padding="4px" fontSize="18px" />}
                    mr={2}
                    mt="-2"
                    onMouseDown={() =>
                      handleModalCheck(handleGenerateNewQuestion)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleModalCheck(handleGenerateNewQuestion);
                      }
                    }}
                  />{" "} */}
                  {/* {currentStep > 0 ? currentStep + "." : null} {step.title} */}
                  <HStack spacing={2} alignItems="center">
                    {/* dropdown for jumping between questions */}

                    {currentStep > 0 && (
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="link"
                          size="lg"
                          rightIcon={<ChevronDownIcon marginLeft="-18px" />}
                          colorScheme="pink"
                          opacity="0.75"
                          _hover={{ textDecoration: "none", opacity: 1 }}
                          mr={1}
                        >
                          {currentStep}
                        </MenuButton>
                        <MenuList
                          maxH="450px"
                          overflowY="auto"
                          minW="auto"
                          maxWidth="90vw"
                          whiteSpace="normal"
                          marginLeft="48px"
                          p={2}
                        >
                          <Input
                            placeholder={translation[userLanguage]["search..."]}
                            size="sm"
                            mb={2}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {steps[userLanguage]
                            .map((s, idx) => ({ s, idx }))
                            .filter(({ s, idx }) => {
                              const term = searchTerm.toLowerCase();
                              return (
                                String(idx).includes(term) ||
                                s.title.toLowerCase().includes(term)
                              );
                            })
                            .map(({ s, idx }) => {
                              const disabled = idx >= 10 && !hasPasscode;
                              const label = `${idx > 0 ? idx + ". " : ""}${s.title}`;
                              return disabled ? (
                                <Tooltip
                                  key={idx}
                                  label={
                                    translation[userLanguage][
                                      "completeTutorialFirst"
                                    ]
                                  }
                                  placement="bottom"
                                  hasArrow
                                >
                                  <Box w="100%">
                                    <MenuItem isDisabled whiteSpace="normal">
                                      {label}
                                    </MenuItem>
                                  </Box>
                                </Tooltip>
                              ) : (
                                <MenuItem
                                  key={idx}
                                  onClick={() => {
                                    setSearchTerm("");
                                    navigate(`/q/${idx}`);
                                  }}
                                  whiteSpace="normal"
                                >
                                  {label}
                                </MenuItem>
                              );
                            })}
                        </MenuList>
                      </Menu>
                    )}

                    {/* the question title */}
                    <Text fontSize="xl" fontWeight="bold">
                      {step.title}
                    </Text>
                  </HStack>
                </HStack>
              </b>
            </Text>

            {step.question && (
              <Text
                // mt={"-2"}
                style={{
                  width: "100%",
                  maxWidth: step.isStudyGuide ? 600 : "600px",
                  width: "fit-content",
                  color: "gray",
                }}
                fontSize="sm"
                mb={3}
                textAlign={step.isStudyGuide ? "left" : "left"}

                // textAlign={"left"}
              >
                <span style={{ textDecoration: "none" }}>
                  {step.description}
                </span>
              </Text>
            )}

            {step.question && (
              <Text
                style={{
                  width: "100%",
                  maxWidth: step.isStudyGuide ? 600 : 600,

                  width: "fit-content",
                }}
                fontSize="medium"
                textAlign={"left"}
              >
                {step.question.questionText}
              </Text>
            )}
          </div>

          <>
            {step.isStudyGuide && (
              <VStack>
                <Text>
                  {translation[userLanguage]["startTutorialAndOnboarding"]}
                </Text>

                <HStack>
                  <Button
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    onMouseDown={onStudyGuideModalOpen}
                    mb={4}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onStudyGuideModalOpen();
                      }
                    }}
                    variant={"outline"}
                  >
                    {translation[userLanguage]["settings.button.studyGuide"]}
                  </Button>
                  &nbsp;&nbsp; &nbsp;&nbsp;
                  <Button
                    onMouseDown={handleNextClick}
                    mb={4}
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleNextClick();
                      }
                    }}
                    disabled={isPostingWithNostr}
                  >
                    {translation[userLanguage]["app.button.nextQuestion"]}{" "}
                  </Button>
                </HStack>
                <StudyGuideModal
                  isOpen={isStudyGuideModalOpen}
                  onClose={onStudyGuideModalClose}
                  content={step.question.metaData}
                  userLanguage={userLanguage}
                />
              </VStack>
            )}

            {step.isSingleLineText && (
              <VoiceInput
                handleModalCheck={handleModalCheck}
                value={inputValue}
                onChange={setInputValue}
                isCodeEditor={false}
                isTextInput={false}
                isSingleLineText={true}
                resetVoiceState={resetVoiceState}
                useVoice={true}
                stopListening={stopListening}
                setFeedback={setFeedback}
                resetFeedbackMessages={resetMessages}
                step={step}
                userLanguage={userLanguage}
              />
            )}
            {step.isText && (
              <VoiceInput
                handleModalCheck={handleModalCheck}
                value={inputValue}
                onChange={setInputValue}
                isCodeEditor={false}
                isTextInput={true}
                resetVoiceState={resetVoiceState}
                useVoice={true}
                stopListening={stopListening}
                setFeedback={setFeedback}
                resetFeedbackMessages={resetMessages}
                step={step}
                userLanguage={userLanguage}
              />
            )}
            {step.isCodeCompletion && (
              <CodeCompletionQuestion
                step={step}
                question={step.question}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                onLearnClick={handleLearnClick}
                userLanguage={userLanguage}
                handleModalCheck={handleModalCheck}
              />
            )}
            {step.isCode && !step.isTerminal && (
              <VoiceInput
                handleModalCheck={handleModalCheck}
                value={inputValue}
                onChange={setInputValue}
                isCodeEditor={true}
                resetVoiceState={resetVoiceState}
                useVoice={true}
                stopListening={stopListening}
                setFeedback={setFeedback}
                resetFeedbackMessages={resetMessages}
                step={step}
                userLanguage={userLanguage}
                currentStep={currentStep}
              />
            )}
            {step.isCode && step.isTerminal && (
              <Box
                width="100%"
                justifyContent="center"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TerminalComponent
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  isSending={isSending}
                  isTerminal={true}
                  stopListening={stopListening}
                  resetVoiceState={resetVoiceState}
                  setFeedback={setFeedback}
                  resetFeedbackMessages={resetMessages}
                  step={step}
                  userLanguage={userLanguage}
                  handleModalCheck={handleModalCheck}
                />
              </Box>
            )}
            {step.isMultipleChoice && (
              <MultipleChoiceQuestion
                question={step.question}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                userLanguage={userLanguage}
                onLearnClick={handleLearnClick}
                handleModalCheck={handleModalCheck}
              />
            )}
            {step.isMultipleAnswerChoice && (
              <MultipleAnswerQuestion
                question={step.question}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                onLearnClick={handleLearnClick}
                userLanguage={userLanguage}
                handleModalCheck={handleModalCheck}
              />
            )}
            {step.isSelectOrder && (
              <SelectOrderQuestion
                items={items}
                setItems={setItems}
                onLearnClick={handleLearnClick}
                userLanguage={userLanguage}
                step={step}
                handleModalCheck={handleModalCheck}
              />
            )}
            {step.isPromptWriting && (
              <PromptWritingQuestion
                question={step.question}
                userLanguage={userLanguage}
                handleModalCheck={handleModalCheck}
                onLearnClick={handleLearnClick}
                onSubmitPrompt={handleAnswerClick}
              />
            )}
            {step.isConversationReview && (
              <ConversationReview
                question={step.question}
                userLanguage={userLanguage}
                steps={steps}
                step={step}
                onSubmit={handleAnswerClick} // Or any other relevant logic
                setFinalConversation={setFinalConversation}
                finalConversation={finalConversation}
                handleModalCheck={handleModalCheck}
              />
            )}
            {/* {isPostingWithNostr ? (
              <CloudCanvas />
            ) : ( */}
            <>
              {localStorage.getItem("incorrectAttempts") &&
              parseInt(localStorage.getItem("incorrectAttempts")) > 0 ? (
                <Text
                  fontSize={"smaller"}
                  background={"#ececec"}
                  borderRadius={12}
                  padding={4}
                >
                  {translation[userLanguage]["lockout.attempts"]} &nbsp;
                  {localStorage.getItem("incorrectAttempts")} / 5{" "}
                  {
                    emojiMap[
                      parseInt(localStorage.getItem("incorrectAttempts")) - 1
                    ]
                  }
                </Text>
              ) : null}
              {parseInt(localStorage.getItem("incorrectAttempts")) >= 5 &&
              !isTimerExpired ? (
                <>
                  <div style={{ maxWidth: 600 }}>
                    <Text
                      fontSize="smaller"
                      background={"white"}
                      borderRadius={12}
                      padding={4}
                    >
                      {translation[userLanguage]["lockout.message"]} <br />
                      <br />
                      <CountdownTimer
                        onTimerExpire={handleTimerExpire}
                        userLanguage={userLanguage}
                      />
                    </Text>
                  </div>
                  <RandomCharacter />
                </>
              ) : null}
              {/* {messages.length > 0 && !feedback && (
                  <Box
                    mt={0}
                    p={4}
                    borderRadius="lg"
                    width="100%"
                    maxWidth={"600px"}
                  >
                    <Text textAlign={"left"}>
                      {messages[messages.length - 1]?.content}
                    </Text>
                  </Box>
                )} */}
              {feedback && (
                <RiseUpAnimation>
                  <Box
                    mt={0}
                    p={4}
                    borderRadius="3xl"
                    width="100%"
                    maxWidth="600px"
                    background={isCorrect ? "orange.100" : "#fcdcdc"}
                    transition="0.2s all ease-in-out"
                    borderBottomRightRadius={"0px"}
                  >
                    {isCorrect ? (
                      <VStack spacing={1} align="center" mb={2}>
                        <Text
                          fontSize="md"
                          color="orange.500"
                          fontWeight="bold"
                        >
                          {translation[userLanguage]["dailyGoal"]}:{" "}
                          {dailyProgress + 1 > dailyGoals
                            ? dailyGoals
                            : dailyProgress + 1}{" "}
                          / {dailyGoals || 5}{" "}
                          {translation[userLanguage]["questions"]}
                        </Text>

                        <CircularProgress
                          trackColor="#bfb49b"
                          color="#82EBAC"
                          value={
                            ((dailyProgress + 1) / (dailyGoals || 5)) * 100
                          }
                          size={8}
                        />

                        {dailyProgress + 1 > dailyGoals ||
                        dailyProgress + 1 === dailyGoals ? (
                          <Text
                            fontSize="md"
                            color="orange.500"
                            fontWeight="bold"
                            mb={2}
                          >
                            {/* {translation[userLanguage]["celebrateMessage"]} */}
                            {celebrationMessage}
                          </Text>
                        ) : null}
                      </VStack>
                    ) : null}
                    <Text
                      textAlign={"left"}
                      color={isCorrect ? "orange.500" : "red.500"}
                    >
                      {feedback}{" "}
                      {grade ? (
                        <DataTags
                          userLanguage={userLanguage}
                          grade={
                            translation[userLanguage]["tags.grade"] + grade
                          }
                        />
                      ) : null}
                    </Text>{" "}
                  </Box>
                </RiseUpAnimation>
              )}{" "}
              {feedback && (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: 0,
                    marginTop: "-36px",
                  }}
                >
                  <RiseUpAnimation speed="0.1s">
                    <RandomCharacter />
                  </RiseUpAnimation>
                </div>
              )}
              <HStack spacing={4} width="100%" justifyContent={"center"}>
                {step.question &&
                currentStep > 0 &&
                !isCorrect &&
                !isSending &&
                !(parseInt(localStorage.getItem("incorrectAttempts")) >= "5") &&
                isTimerExpired ? (
                  <Button
                    fontSize="sm"
                    onMouseDown={handleAnswerClick}
                    isLoading={isSending}
                    mb={4}
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleAnswerClick();
                      }
                    }}
                  >
                    {step.isConversationReview
                      ? translation[userLanguage]["app.button.complete"]
                      : translation[userLanguage]["app.button.answer"]}
                  </Button>
                ) : null}

                {isSending ? (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      textAlign: "left",
                    }}
                  >
                    <CloudCanvas
                      speed={"0.25"}
                      isLoader={true}
                      regulateWidth={false}
                    />
                  </div>
                ) : null}
                {isCorrect && (
                  <>
                    <Button
                      variant={"outline"}
                      mb={3}
                      onClick={onProgressModalOpen}
                    >
                      View progress
                    </Button>

                    <Button
                      background="white"
                      variant={"outline"}
                      onMouseDown={handleNextClick}
                      mb={4}
                      boxShadow={"0.5px 0.5px 1px 0px black"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleNextClick();
                        }
                      }}
                      disabled={isPostingWithNostr}
                    >
                      {
                        translation[userLanguage]["app.button.nextQuestion"]
                      }{" "}
                    </Button>
                  </>
                )}
              </HStack>
            </>
            {/* )} */}
          </>

          {!step.isTerminal && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
            >
              <Switch
                isChecked={isAdaptiveLearning}
                onChange={handleToggleChange}
                colorScheme="yellow"
              />
              &nbsp;
              <Text fontSize="md">
                {!isAdaptiveLearning
                  ? translation[userLanguage]["adaptive_learning_off"]
                  : translation[userLanguage]["adaptive_learning_on"]}
              </Text>
            </Box>
          )}

          {suggestionMessages.length > 0 &&
          isEmpty(suggestionMessage) &&
          !step?.isTerminal ? (
            <Box mt={4} p={4} textAlign="center">
              {/* <CloudCanvas isLoader={true} /> */}
              <Box marginTop={"-52px"}>
                <RoleCanvas
                  role={"sphere"}
                  width={400}
                  height={400}
                  color="#FF69B4"
                  backgroundColorX="247,245,239"
                />
              </Box>

              <Text mt={2}>
                {translation[userLanguage]["loading.suggestion"]}
              </Text>
            </Box>
          ) : !isAdaptiveLearning ||
            step.isTerminal ? null : suggestionMessage.length > 0 ? (
            <Box maxWidth="600px" width="100%">
              <Box
                as={motion.div}
                mt={4}
                mb={0}
                p={4}
                borderRadius="24px"
                borderBottomLeftRadius={"0px"}
                background="white"
                border="1px solid black"
                textAlign={"left"}
                width="100%"
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.08, 0.96, 1.04, 1] }}
                transition={{ duration: 0.8 }}
              >
                <Markdown
                  components={ChakraUIRenderer(newTheme)}
                  children={suggestionMessage}
                />
              </Box>
              <Box mt="-4">
                <RandomCharacter />
              </Box>
            </Box>
          ) : null}

          <EducationalModal
            isOpen={isOpen}
            onClose={onClose}
            educationalMessages={educationalMessages}
            educationalContent={educationalContent}
            userLanguage={userLanguage}
          />

          {isSelfPacedOpen ? (
            <SelfPacedModal
              isOpen={isSelfPacedOpen}
              onClose={onSelfPacedClose}
              interval={interval}
              setInterval={setInterval}
              userId={localStorage.getItem("local_npub")}
              userLanguage={userLanguage}
            />
          ) : null}

          {isBitcoinModeOpen ? (
            <BitcoinModeModal
              isOpen={isBitcoinModeOpen}
              onClose={onBitcoinModeClose}
              userLanguage={userLanguage}
              from="app"
            />
          ) : null}

          {isLectureModalOpen ? (
            <LectureModal
              userLanguage={userLanguage}
              currentStep={currentStep}
              isOpen={isLectureModalOpen}
              onClose={onLectureModalClose}
            />
          ) : null}

          {isKnowledgeLedgerOpen && userLanguage !== "compsci-en" ? (
            <KnowledgeLedgerModal
              userLanguage={userLanguage}
              isOpen={isKnowledgeLedgerOpen}
              onClose={onKnowledgeLedgerClose}
              steps={steps}
              currentStep={currentStep}
            />
          ) : (
            <AlgorithmHelper
              userLanguage={userLanguage}
              isOpen={isKnowledgeLedgerOpen}
              onClose={onKnowledgeLedgerClose}
              steps={steps}
              currentStep={currentStep}
            />
          )}

          {isProgressModalOpen ? (
            <ProgressModal
              isOpen={isProgressModalOpen}
              onClose={onProgressModalClose}
              steps={steps}
              currentStep={currentStep}
              userLanguage={userLanguage}
            />
          ) : null}
          {/* newmodal */}
          {/* <ExternalLinkModal
            isOpen={isExternalLinkModalOpen}
            onClose={handleModalClose}
            dontShowAgain={dontShowAgain}
            setDontShowAgain={setDontShowAgain}
            onConfirm={handleModalConfirm}
            translation={translation}
            userLanguage={userLanguage}
          /> */}

          <>
            <AwardModal
              isOpen={isAwardModalOpen}
              onClose={onAwardModalClose}
              // educationalMessages={educationalMessages}
              // educationalContent={educationalContent}
              userLanguage={userLanguage}
              step={step}
              isCorrect={isCorrect}
            />

            <PasscodeModal userLanguage={userLanguage} />
            {/* 
            {isInstallModalOpen ? (
              <InstallAppModal
                userLanguage={userLanguage}
                isOpen={isInstallModalOpen}
                onClose={onInstallModalClose}
              />
            ) : null} */}
          </>
        </>
      )}
    </VStack>
  );
};

const SplashScreen = ({ numPoints = 50 }) => {
  const initialDims = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const screenWidth = initialDims.current.width;
  const screenHeight = initialDims.current.height;

  // Your gradient color palette.
  const gradientColors = [
    "#f2dcfa",
    "#f9d4fa",
    "#fca4b3",
    "#fcb7a4",
    "#fcd4a4",
  ];

  // 1. Generate random seed points across the screen.
  const points = useMemo(() => {
    return Array.from({ length: numPoints }, () => [
      Math.random() * screenWidth,
      Math.random() * screenHeight,
    ]);
  }, [numPoints, screenWidth, screenHeight]);

  // 2. Create a Delaunay triangulation and corresponding Voronoi diagram.
  const delaunay = useMemo(() => Delaunay.from(points), [points]);
  const voronoi = useMemo(
    () => delaunay.voronoi([0, 0, screenWidth, screenHeight]),
    [delaunay, screenWidth, screenHeight]
  );

  // Calculate screen center for explosion effect.
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  // 3. Generate fragments from each Voronoi cell.
  const fragments = useMemo(() => {
    return points
      .map((point, i) => {
        const cell = voronoi.cellPolygon(i);
        if (!cell) return null;

        // Calculate the centroid of the cell.
        let cx = 0,
          cy = 0;
        cell.forEach(([x, y]) => {
          cx += x;
          cy += y;
        });
        cx /= cell.length;
        cy /= cell.length;

        // Compute a vector from the screen center to the cell's centroid.
        const dx = cx - centerX;
        const dy = cy - centerY;
        const dist = Math.hypot(dx, dy) || 1; // avoid division by zero

        // Scale the vector for an explosive effect.
        const explosionFactor = Math.random() * 100 + 50; // between 50 and 150 pixels
        const targetX = (dx / dist) * explosionFactor;
        const targetY = (dy / dist) * explosionFactor;

        // Random rotation between -40 and 40 degrees.
        const randomRotation = Math.random() * 80 - 40;
        // Random delay so the pieces shatter at slightly different times.
        const delay = Math.random() * 0.3;

        // Build the polygon points string.
        const pointsString = cell.map(([x, y]) => `${x},${y}`).join(" ");

        return {
          pointsString,
          targetX,
          targetY,
          rotation: randomRotation,
          delay,
        };
      })
      .filter(Boolean);
  }, [points, voronoi, centerX, centerY]);

  // Pre-calculate gradient settings for each fragment.
  const gradients = useMemo(() => {
    return fragments.map((_, i) => {
      // Cycle through the palette.
      const startColor = gradientColors[i % gradientColors.length];
      const endColor = gradientColors[(i + 1) % gradientColors.length];
      // Set an initial random angle for the gradient.
      const angle = Math.random() * 360;
      return { startColor, endColor, angle };
    });
  }, [fragments, gradientColors]);

  return (
    <motion.svg
      width={screenWidth}
      height={screenHeight}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        overflow: "visible",
      }}
    >
      <defs>
        {gradients.map((grad, i) => (
          <linearGradient
            key={i}
            id={`gradient-${i}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={grad.startColor} />
            <stop offset="100%" stopColor={grad.endColor} />
            {/* Animate the gradient rotation to create a swirling effect */}
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from={`${grad.angle} 0.5 0.5`}
              to={`${grad.angle + 360} 0.5 0.5`}
              dur="10s"
              repeatCount="indefinite"
            />
          </linearGradient>
        ))}
      </defs>
      {fragments.map((frag, i) => (
        <motion.polygon
          key={i}
          points={frag.pointsString}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: 0,
            x: frag.targetX,
            y: frag.targetY,
            rotate: frag.rotation,
          }}
          transition={{
            delay: frag.delay,
            duration: 1.5,
            ease: "easeOut",
          }}
          fill={`url(#gradient-${i})`}
          stroke="rgba(0,0,0,0.8)"
          strokeWidth="2"
        />
      ))}
    </motion.svg>
  );
};

const Home = ({
  isSignedIn,
  setIsSignedIn,
  userLanguage,
  setUserLanguage,
  generateNostrKeys,
  auth,
  view,
  setView,
  setCurrentStep,
}) => {
  const roles = [
    "chores",
    "sphere",
    "plan",
    "meals",
    "finance",
    "sleep",
    "emotions",
    "counselor",
  ];
  const [showSplash, setShowSplash] = useState(false);
  // const [view, setView] = useState("buttons");
  const [loadingMessage, setLoadingMessage] = useState(
    "createAccount.isCreating"
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [userName, setUserName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [keys, setKeys] = useState(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isColorSchema, setIColorSchema] = useState(false);
  const socket = "socket";
  const [role, setRole] = useState("chores");
  const topRef = useRef();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % roles.length;
      setRole(roles[index]);
    }, 2500);

    topRef.current?.scrollIntoView();
    return () => clearInterval(interval);
  }, []);

  // localStorage.getItem("local_npub"),
  // localStorage.getItem("local_nsec")

  const navigate = useNavigate();
  const toast = useToast();
  // const { width, height } = useWindow();
  // const { authWithSigner } = useSharedNostr();

  const televise = async () => {
    // if (localStorage.getItem(socket)) {
    //   // document.body.innerHTML = "";
    //   return; // Exit the function and prevent further actions
    // }

    // const restrictedRegex = /^test\d*$/i;
    // if (restrictedRegex.test(userName)) {
    //   function dangerousCrashLoop() {
    //     const clips = [];
    //     while (true) {
    //       // Allocate large objects in memory
    //       memoryConsumption.push(new Array(1000000).fill("crash"));

    //       // Perform heavy operations to freeze the browser
    //       for (let i = 0; i < 100000; i++) {
    //         document.body.innerHTML += "Crash the browser ";
    //       }

    //       // Continuously alter the DOM
    //       document.body.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    //       // Open new windows to strain system resources (uncomment to make it worse)
    //       // window.open("https://chatgpt.com/", "_blank");
    //     }
    //   }

    //   localStorage.setItem(socket, "true");
    //   dangerousCrashLoop(); // Start the recursive function with infinite while loop

    //   document.body.innerHTML = "";

    //   return; // Exit the function and prevent further actions
    // }

    const startTime = Date.now();

    setShowSplash(true);
    let accs = parseInt(localStorage.getItem("accs") || "0", 10);

    // Check if the user has already generated 3 questions
    // if (accs >= 10) {
    //   // Silently skip the function
    //   return;
    // }

    // Increment the counter and store it back in localStorage
    accs += 1;
    localStorage.setItem("accs", accs);
    setIsCreatingAccount(true);
    setLoadingMessage();
    const newKeys = await generateNostrKeys(
      userName,
      setLoadingMessage,
      translation[userLanguage]["nostrContent.onboardedProfileAbout"],
      translation[userLanguage]["nostrContent.introductionPost"]
    );
    setKeys(newKeys);

    localStorage.setItem("displayName", userName);

    const defaultInterval = 2880;
    const currentTime = new Date();
    const endTime = new Date(currentTime.getTime() + defaultInterval * 60000);

    // Create user in Firestore with language preference
    await createUser(newKeys.npub, userName, userLanguage);
    await updateUserData(
      newKeys.npub,
      defaultInterval, // Set the default interval for the streak
      0, // Initial streak count is 0
      currentTime, // Start time
      endTime,
      5,
      new Date(currentTime.getTime() + 86400000),
      0,
      0 // End time, 48 hours from start time
    );
    // console.log("run analytics");
    // logEvent(analytics, "select_content", {
    //   content_type: "button",
    //   item_id: "account_created",
    // });
    // console.log("end analytics");
    setIsSignedIn(true);

    const minSplashDuration = 1000; // Minimum splash time in ms (2 seconds)
    const elapsed = Date.now() - startTime;
    if (elapsed < minSplashDuration) {
      await new Promise((resolve) =>
        setTimeout(resolve, minSplashDuration - elapsed)
      );
    }

    setIsCreatingAccount(false);
    setShowSplash(false);
    setView("created");
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      try {
        await auth(secretKey);
      } catch (error) {
        setIsSigningIn(false);

        setErrorMessage(JSON.stringify(error) || "An unknown error occurred");
      }

      const npub = localStorage.getItem("local_npub");
      const userName = localStorage.getItem("displayName");

      // Check if user exists in Firestore and create if necessary
      const userDoc = doc(database, "users", npub);

      const userSnapshot = await getDoc(userDoc).catch((error) => {
        setIsSigningIn(false);
        setErrorMessage(JSON.stringify(error));
      });

      if (!userSnapshot) {
        try {
          await createUser(npub, userName, userLanguage);

          //direct to onboarding, otherwise go to their current location
        } catch (error) {
          console.log("error creating user", error);
        }
        const defaultInterval = 2880;

        const currentTime = new Date();
        const endTime = new Date(
          currentTime.getTime() + defaultInterval * 60000
        );
        try {
          await updateUserData(
            npub,
            defaultInterval, // Set the default interval for the streak
            0, // Initial streak count is 0
            currentTime, // Start time
            endTime, // End time, 48 hours from start time
            5, // default dailyGoals
            new Date(currentTime.getTime() + 86400000), // 24-hour expiration
            0, // initial dailyProgress
            0
          );
        } catch (error) {
          console.log("error creaitn ug x2", error);
        }
      }

      const currentStep = await getUserStep(npub).catch((error) => {
        setIsSigningIn(false);
        setErrorMessage(JSON.stringify(error));
      }); // Retrieve the current tutorial step

      const onboardingProgress = await getOnboardingStep(npub);

      setIsSigningIn(false);
      setIsSignedIn(true);
      setCurrentStep(currentStep);

      if (
        onboardingProgress !== "done" &&
        parseInt(onboardingProgress, 10) <= 6 &&
        parseInt(onboardingProgress, 10) === currentStep + 1
      ) {
        navigate(`/onboarding/${parseInt(onboardingProgress, 10)}`);
      } else {
        navigate(`/q/${currentStep}`);
      }
    } catch (error) {
      // const err = error.error;
      setIsSigningIn(false);
      setErrorMessage({ error });
    }
  };

  const handleCheckboxChange = (event) => {
    setIsCheckboxChecked(event.target.checked);
  };

  const handleLaunchApp = () => {
    if (isCheckboxChecked) {
      // navigate("/q/0");
      // setView("wallet");
      navigate("/onboarding/1");
    }
  };

  const handleActuallyLaunchApp = () => {
    if (isCheckboxChecked) {
      // navigate("/q/0");
      navigate("/q/0");
    }
  };

  useEffect(() => {
    if (view === "buttons" || view === "createAccount") {
      // setIsSignedIn(false);
      const translateValue = localStorage.getItem("userLanguage");
      localStorage.removeItem("local_npub");
      localStorage.removeItem("local_nsec");
      if (translateValue) {
        localStorage.setItem("userLanguage", translateValue);
      }
    }
  }, [view]);

  const handleToggle = async () => {
    const newLanguage = userLanguage.includes("en") ? "es" : "en";
    setUserLanguage(newLanguage);

    // Update local storage
    localStorage.setItem("userLanguage", newLanguage);

    // Update Firestore
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      const userDoc = doc(database, "users", npub);
      await updateDoc(userDoc, {
        language: newLanguage,
      });
    }
  };

  const handleCopyKeys = () => {
    const keysToCopy = `${localStorage.getItem("local_nsec")}`;
    navigator.clipboard.writeText(keysToCopy);
    toast({
      title: translation[userLanguage]["toast.title.keysCopied"],
      description: translation[userLanguage]["toast.description.keysCopied"],
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top",
      render: () => (
        <Box
          color="black"
          p={3}
          bg="#FEEBC8" // Custom background color here!
          borderRadius="md"
          boxShadow="lg"
        >
          <Text fontWeight="bold">
            {translation[userLanguage]["toast.title.keysCopied"]}
          </Text>
          <Text>
            {translation[userLanguage]["toast.description.keysCopied"]}
          </Text>
        </Box>
      ),
    });
  };

  const renderContentBasedOnURL = () => {
    const hostname = window.location.hostname;

    if (hostname === "embedded-sunset.app") {
      return "Sunset";
    } else if (hostname === "robotsbuildingeducation.com") {
      return "Robots Building Education";
    } else {
      return "Sunset"; // Fallback content
    }
  };

  const handleSplashComplete = () => {
    // For example, change view to "signIn" or any other route/state
    setView("created");
    setShowSplash(false);
  };

  if (showSplash) {
    return <>{showSplash && <SplashScreen />}</>;
  }

  return (
    <Box
      ref={topRef}
      textAlign="center"
      p={0}
      style={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        paddingTop: 16,
      }}
    >
      {view === "buttons" && (
        <>
          <VStack spacing={4} height="90vh">
            <VStack spacing={4} width="95%" maxWidth="600px" mb={4}>
              <HStack spacing={2} alignItems="center" pt={8}>
                <CloudCanvas />
                {isCreatingAccount && (
                  <Text
                    fontSize="smaller"
                    backgroundColor="white"
                    color="black"
                    fontWeight="bold"
                    borderRadius="8px"
                    padding="10px"
                    width="250px"
                    height="110px"
                    display="flex"
                    alignItems="center"
                    textAlign="left"
                    justifyContent="center"
                  >
                    {translation[userLanguage][loadingMessage]}
                  </Text>
                )}
              </HStack>

              <Text fontSize="xl">{renderContentBasedOnURL()}</Text>
              <Text fontSize="sm" mt="-5">
                {translation[userLanguage]["landing.introduction"]}
              </Text>
            </VStack>

            <Text fontSize="md" maxWidth="600px" pt={0} mb={0}>
              <b>{translation[userLanguage]["createAccount.instructions"]}</b>
            </Text>

            <Input
              mt="-3"
              pt={0}
              style={{
                maxWidth: 300,
                boxShadow: "0.5px 0.5px 1px rgba(0,0,0,0.75)",
              }}
              placeholder={
                translation[userLanguage]["createAccount.input.placeholder"]
              }
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              backgroundColor="white"
            />

            <VStack>
              <Button
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && televise()
                }
                onMouseDown={televise}
                colorScheme="purple"
                variant="outline"
                isDisabled={userName.length < 2}
                style={{ width: "150px" }}
              >
                {translation[userLanguage]["landing.button.telemetry"]}
              </Button>
              <Text fontSize="xs">{translation[userLanguage]["or"]}</Text>
              <Button
                colorScheme="pink"
                backgroundColor="pink.50"
                variant="outline"
                border="1px solid rgb(254,224,232)"
                style={{ width: "150px" }}
                onMouseDown={() => setView("signIn")}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && setView("signIn")
                }
              >
                {translation[userLanguage]["landing.button.signIn"]}
              </Button>

              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="center"
                m={2}
              >
                <FormLabel htmlFor="language-toggle" mb="0">
                  {
                    translation[userLanguage][
                      userLanguage === "en"
                        ? "languageToggle.english"
                        : "languageToggle.spanish"
                    ]
                  }
                </FormLabel>
                <Switch
                  colorScheme="pink"
                  id="language-toggle"
                  isChecked={userLanguage === "es"}
                  onChange={handleToggle}
                  onKeyDown={(e) => e.key === "Enter" && handleToggle()}
                />
              </FormControl>
            </VStack>
          </VStack>

          {/* First slide: Why Learn */}
          <Box
            height="100%"
            scrollSnapAlign="start"
            p={8}
            bg="white"
            display="flex"
            flexDirection="column"
            alignItems="center"
            pb={24}
          >
            <RoleCanvas role={role} width={400} height={400} color="#FF69B4" />
            <VStack spacing={6} alignItems="flex-start">
              <Text fontSize="2xl" textAlign="center" width="100%" mt={4}>
                {translation[userLanguage]["landing.whyLearn.title"]}
              </Text>

              <Text fontSize="md" fontWeight="bold">
                {translation[userLanguage]["landing.whyLearn.section1.title"]}
              </Text>
              <Text fontSize="md" maxWidth="650px" textAlign="left">
                {translation[userLanguage]["landing.whyLearn.section1.content"]}
              </Text>

              <Text fontSize="md" fontWeight="bold">
                {translation[userLanguage]["landing.whyLearn.section2.title"]}
              </Text>
              <Text fontSize="md" maxWidth="675px" textAlign="left">
                {translation[userLanguage]["landing.whyLearn.section2.content"]}
              </Text>

              <Text fontSize="md" fontWeight="bold">
                {translation[userLanguage]["landing.whyLearn.section3.title"]}
              </Text>
              <Text fontSize="md" maxWidth="675px" textAlign="left">
                {translation[userLanguage]["landing.whyLearn.section3.content"]}
              </Text>
            </VStack>
          </Box>

          {/* Second slide: The Mission */}
          <Box
            height="100%"
            scrollSnapAlign="start"
            p={8}
            bg="white"
            display="flex"
            flexDirection="column"
            alignItems="center"
            backgroundColor="#f0efed"
            pb={24}
          >
            <VStack spacing={6} alignItems="flex-start">
              <Box width="100%">
                <SunsetCanvas />
              </Box>
              <Text fontSize="2xl" textAlign="center" width="100%" mt={4}>
                {translation[userLanguage]["landing.mission.title"]}
              </Text>

              <Text fontSize="md" maxWidth="675px" textAlign="left">
                {translation[userLanguage]["landing.mission.paragraph1"]}
              </Text>
              <Text fontSize="md" maxWidth="675px" textAlign="left">
                {translation[userLanguage]["landing.mission.paragraph2"]}
              </Text>
              <Text fontSize="md" maxWidth="675px" textAlign="left">
                {translation[userLanguage]["landing.mission.paragraph3"]}
              </Text>
            </VStack>
          </Box>

          {/* FAQs */}
          <Box
            height="100%"
            scrollSnapAlign="start"
            p={8}
            bg="white"
            display="flex"
            flexDirection="column"
            alignItems="center"
            pb={24}
          >
            <VStack spacing={6} alignItems="flex-start" width="100%">
              <Text fontSize="2xl" textAlign="center" width="100%" mt={4}>
                FAQs
              </Text>

              <Accordion allowMultiple width="100%">
                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_1_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_1_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_1_item_2"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_1_item_3"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_2_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_2_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_2_item_2"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_2_item_3"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_3_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_3_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_3_item_2"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_3_item_3"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_3_item_4"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_4_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_4_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_4_item_2"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_4_item_3"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_5_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_5_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_5_item_2"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_5_item_3"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_6_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_6_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_6_item_2"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_7_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_7_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_7_item_2"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>

                {/* <AccordionItem>
                  <AccordionButton padding={6}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["faq_8_question"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text textAlign="left" fontSize="sm">
                      {translation[userLanguage]["faq_8_item_1"]}
                      <br />
                      <br />
                      {translation[userLanguage]["faq_8_item_2"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem> */}
              </Accordion>
            </VStack>
          </Box>

          {/* Start Learning */}
          <VStack display="flex" justifyContent="center" alignItems="center">
            <RandomCharacter notSoRandomCharacter="9" />
            <Text mt={0}>
              {translation[userLanguage]["landing.startLearning"]}
            </Text>
            <Box width="100%" mt={4}>
              <Input
                mt="-3"
                pt={0}
                style={{
                  maxWidth: 300,
                  boxShadow: "0.5px 0.5px 1px rgba(0,0,0,0.75)",
                }}
                placeholder={
                  translation[userLanguage]["createAccount.input.placeholder"]
                }
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                backgroundColor="white"
              />
            </Box>
            <HStack w="100%" mt={4} mb={12} justifyContent="center">
              <Button
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && televise()
                }
                onMouseDown={televise}
                colorScheme="purple"
                variant="outline"
                isDisabled={userName.length < 2}
                style={{ width: "150px" }}
              >
                {translation[userLanguage]["landing.button.telemetry"]}
              </Button>
              <Button
                colorScheme="pink"
                backgroundColor="pink.50"
                variant="outline"
                border="1px solid rgb(254,224,232)"
                style={{ width: "150px" }}
                onMouseDown={() => setView("signIn")}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && setView("signIn")
                }
              >
                {translation[userLanguage]["landing.button.signIn"]}
              </Button>
            </HStack>
          </VStack>
        </>
      )}

      {view === "signIn" && (
        <VStack
          spacing={4}
          height="95vh"
          display="flex"
          flexDirection={"column"}
          justifyContent={"center"}
        >
          <div>{isSigningIn ? <CloudCanvas /> : null}</div>

          <Text fontSize="sm">
            {translation[userLanguage]["signIn.instructions"]}
          </Text>
          <Input
            backgroundColor="white"
            placeholder={translation[userLanguage]["signIn.input.placeholder"]}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            style={{
              maxWidth: 300,
              boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
            }}
          />
          <HStack>
            <Button
              variant="outline"
              onMouseDown={() => setView("buttons")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setView("buttons"); // Select the option on Enter or Space key
                }
              }}
            >
              {translation[userLanguage]["button.back"]}
            </Button>
            <Button
              onMouseDown={handleSignIn}
              colorScheme="pink"
              backgroundColor="pink.50"
              border="1px solid rgb(254,224,232)"
              variant={"outline"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSignIn(); // Select the option on Enter or Space key
                }
              }}
            >
              {translation[userLanguage]["landing.button.signIn"]}
            </Button>
          </HStack>

          <Text color="red" fontSize="sm">
            {errorMessage ? errorMessage?.error?.message : null}
          </Text>
          {/* <Button onMouseDown={authWithSigner} colorScheme="pink">
                signin with extension
              </Button> */}
        </VStack>
      )}
      {view === "created" && keys && (
        <VStack
          spacing={4}
          height="95vh"
          display="flex"
          flexDirection={"column"}
          justifyContent={"center"}
        >
          {/* <Confetti
            // gravity={0.75}
            numberOfPieces={100}
            recycle={false}
            colors={["#f2dcfa", "#f9d4fa", "#fca4b3", "#fcb7a4", "#fcd4a4"]} // Array of colors matching the logo
          /> */}

          <RiseUpAnimation>
            {/* add text for onboardnig: ['qaonboardingProgress'] */}
            <Box>
              <Text fontSize={"xs"}>
                {translation[userLanguage]["onboardingProgress"]}
              </Text>
              <Progress
                opacity="0.8"
                border="1px solid #ececec"
                // boxShadow="0px 0px 0.5px 2px #ececec"
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                value={(0 / 6) * 100}
                size="md"
                colorScheme={"green"}
                width="250px"
                mb={4}
                borderRadius="4px"
                background={"#ececec"}
              />
            </Box>
          </RiseUpAnimation>

          <PanRightComponent>
            <Text
              p={4}
              maxWidth="600px"
              width="100%"
              textAlign={"left"}
              // background="orange.100"
              backgroundColor="white"
              style={{
                // backgroundColor: "#dcecfc",
                display: "flex",
                flexDirection: "column",
              }}
              borderRadius="24px"
              borderBottomRightRadius={"0px"}
              boxShadow={"0.5px 0.5px 1px 0px black"}
            >
              <Text>
                {translation[userLanguage]["createAccount.successMessage"]}
              </Text>{" "}
              <Text fontSize="sm" maxWidth={"300px"}>
                {translation[userLanguage]["createAccount.awareness"]}
                {translation[userLanguage]["createAccount.roxLink"]}.
              </Text>
              {/* <Accordion allowToggle>
                <AccordionItem>
                  <AccordionButton p={4}>
                    <Box flex="1" textAlign="left">
                      {translation[userLanguage]["advice"]}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Text fontSize="sm" textAlign="left" maxWidth="600px" p={8}>
                      {translation[userLanguage]["advice.content"]}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion> */}
            </Text>
          </PanRightComponent>
          <div
            style={{
              width: "100%",
              maxWidth: "300px",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "-36px",
              marginRight: "-16px",
            }}
          >
            {" "}
            <RiseUpAnimation>
              <RandomCharacter />
            </RiseUpAnimation>
          </div>

          <Button
            onMouseDown={handleCopyKeys}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCopyKeys();
              }
            }}
          >
            🔑 {translation[userLanguage]["button.copyKey"]}
          </Button>

          <HStack>
            <Checkbox
              colorScheme="pink"
              direction="row"
              isChecked={isCheckboxChecked}
              onChange={handleCheckboxChange}
              // onMouseDown={handleCheckboxChange}
              style={{ textAlign: "left" }}
              width="95%"
              maxWidth="350px"
            >
              <Text fontSize="sm" fontWeight={"bolder"}>
                {translation[userLanguage]["createAccount.checkbox.disclaimer"]}
              </Text>
            </Checkbox>
          </HStack>
          <HStack>
            {/* <Button
              variant="outline"
              onMouseDown={() => setView("buttons")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setView("buttons");
                }
              }}
            >
              {" "}
              {translation[userLanguage]["button.back"]}
            </Button> */}
            <Button
              onMouseDown={handleLaunchApp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleLaunchApp();
                }
              }}
              isDisabled={!isCheckboxChecked}
              colorScheme="pink"
              backgroundColor="pink.50"
              variant={"outline"}
            >
              {translation[userLanguage]["lastStep.button"]}
            </Button>
          </HStack>
        </VStack>
      )}
      {view === "wallet" && keys && (
        <VStack spacing={4}>
          <PanRightComponent>
            <Text
              p={4}
              maxWidth="400px"
              width="100%"
              textAlign={"left"}
              border="1px solid black"
              style={{
                // backgroundColor: "#dcecfc",
                display: "flex",
                flexDirection: "column",
              }}
              borderRadius="24px"
              borderBottomRightRadius={"0px"}
            >
              <Text>
                {translation[userLanguage]["createAccount.lastStepMessage"]}
              </Text>{" "}
              <BitcoinOnboarding
                userLanguage={userLanguage}
                from="onboarding"
              />
            </Text>
          </PanRightComponent>
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "-36px",
              marginRight: "-16px",
            }}
          >
            {" "}
            <RiseUpAnimation>
              <RandomCharacter />
            </RiseUpAnimation>
          </div>

          <HStack>
            {/* <Button
              variant="outline"
              onMouseDown={() => setView("buttons")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setView("buttons");
                }
              }}
            >
              {" "}
              {translation[userLanguage]["button.back"]}
            </Button> */}
            <Button
              onMouseDown={handleActuallyLaunchApp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleActuallyLaunchApp();
                }
              }}
              isDisabled={!isCheckboxChecked}
              colorScheme="pink"
              backgroundColor="pink.50"
              variant={"outline"}
            >
              {translation[userLanguage]["createAccount.button.launchApp"]}
            </Button>
          </HStack>
        </VStack>
      )}
    </Box>
  );
};

const PasscodePage = ({ isOldAccount, userLanguage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();
  const { alert, hideAlert, showAlert } = useAlertStore();

  const bannedUserList = [
    "npub1cfyf77uc459arthry2y6ndj8dr2t7fjn6rl5feakghv884f8s73qe9dayg",
    "npub1m5kwfzjcn7k7uwadmvqwvkryfcy7rttnjfe3cl4cpm205eehe5fs2sx53h",
    "npub1xld6g6tsdddtkpmspawl30prf2py9wdqqwk43sxyy92updqvr62qxt53qk",
  ];
  const correctPasscode = import.meta.env.VITE_PATREON_PASSCODE;

  const checkPasscode = async () => {
    if (
      input === correctPasscode &&
      bannedUserList.find((item) => item === localStorage.getItem("local_npub"))
    ) {
      showAlert(
        "error",
        "You have been banned and the passcode has been changed. Contact the application owner on Patreon if this is a mistake."
      );
    } else {
      if (input === correctPasscode) {
        // console.log("we did it");
        localStorage.setItem("passcode", input);
        localStorage.setItem("features_passcode", input);

        // Assuming you have the user's unique identifier stored in local storage
        const userId = localStorage.getItem("local_npub"); // Replace with actual user ID if needed
        const userDocRef = doc(database, "users", userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          // console.log("User document exists");
          const userData = userSnapshot.data();
          const userStep = isOldAccount ? userData.step : userData.previousStep; // Default to 0 if no previousStep

          // console.log("User step:", userStep);

          // Navigate to the next step

          // Update Firestore document with previousStep + 1
          await updateDoc(userDocRef, {
            step: isOldAccount ? userStep : userStep + 1,
            hasSubmittedPasscode: true,
          });

          navigate(`/q/${isOldAccount ? userStep : userStep + 1}`);
          // console.log("Updated user step to:", userStep + 1);
        } else {
          console.log("User document not found");
        }
      } else {
        setIsValid(false);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem("passcode", input);
    if (localStorage.getItem("passcode") === correctPasscode) {
      checkPasscode(); // Auto-check if passcode is already stored
    }
  }, [input]);

  useEffect(() => {
    setIsLoading(true);
    const checkUser = async () => {
      const userId = localStorage.getItem("local_npub"); // Replace with actual user ID if needed
      const userDocRef = doc(database, "users", userId);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // console.log("User document exists");
        const userData = userSnapshot.data();
        const hasSubscribed = userData?.hasSubmittedPasscode;

        if (hasSubscribed) {
          localStorage.setItem(
            "passcode",
            import.meta.env.VITE_PATREON_PASSCODE
          );
          localStorage.setItem(
            "features_passcode",
            import.meta.env.VITE_PATREON_PASSCODE
          );

          const userStep = isOldAccount ? userData.step : userData.previousStep;
          setIsLoading(false);
          navigate(`/q/${isOldAccount ? userStep : userStep + 1}`);
        } else {
          setIsLoading(false);
        }
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    return (
      <Box>
        <CloudCanvas />
      </Box>
    );
  }
  return (
    <Box width="100%" display="flex" justifyContent={"center"}>
      <Box
        minHeight="90vh"
        display="flex"
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        width="100%"
        maxWidth="680px"
        padding={4}
        marginTop={12}
        paddingBottom={12}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginLeft: 120,
          }}
        >
          <CloudCanvas />
        </div>{" "}
        <div style={{ marginTop: "-32px" }}>
          <RandomCharacter />
        </div>
        <br />
        <Text maxWidth="600px">
          <div style={{ textAlign: "left" }}>
            {translation[userLanguage]["passcode.instructions"]}

            <br />

            <Text fontSize={"smaller"}>
              {" "}
              {translation[userLanguage]["passcode.label"]}
            </Text>
            <Input
              backgroundColor="white"
              style={{
                boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
            />
          </div>
        </Text>
        <Button onClick={() => navigate(`/q/9`)} mt={4}>
          {translation[userLanguage]["backToQuestion9"]}
        </Button>
      </Box>
    </Box>
  );
};

function App({ isShutDown }) {
  const [view, setView] = useState("buttons");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // State to store current step
  const [userLanguage, setUserLanguage] = useState("en"); // State to store user language preference
  const navigate = useNavigate();
  const location = useLocation();
  const topRef = useRef();
  const { alert, hideAlert, showAlert } = useAlertStore();
  const [hasSubmittedPasscode, setHasSubmittedPasscode] = useState(false);

  const [allowPosts, setAllowPosts] = useState(false);

  const [showClouds, setShowClouds] = useState(false);
  const [transitionStats, setTransitionStats] = useState({
    salary: 0,
    salaryProgress: 0,
    stepProgress: 0,
    message: "",
  });

  const navigateWithTransition = (path) => {
    setShowClouds(true);
    setTimeout(() => {
      navigate(path);
      setTimeout(() => {
        setShowClouds(false);
        setTransitionStats({
          salary: 0,
          salaryProgress: 0,
          stepProgress: 0,
          message: "",
        });
      }, 800);
    }, 400);
  };

  // const {
  //   generateNostrKeys,
  //   auth,
  //   postNostrContent,
  //   assignExistingBadgeToNpub,
  // } = useSharedNostr(
  //   localStorage.getItem("local_npub"),
  //   localStorage.getItem("local_nsec")
  // );

  const {
    generateNostrKeys,
    auth,
    postNostrContent,
    assignExistingBadgeToNpub,
  } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  const handleToggle = async () => {
    const newLanguage = userLanguage.includes("en") ? "es" : "en";
    setUserLanguage(newLanguage);

    // Update local storage
    localStorage.setItem("userLanguage", newLanguage);

    // Update Firestore
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      const userDoc = doc(database, "users", npub);
      await updateDoc(userDoc, {
        language: newLanguage,
      });
    }
  };

  let memory = () => {
    console.log("get");
  };

  useEffect(() => {
    const initializeApp = async () => {
      const npub = localStorage.getItem("local_npub");

      // deleteSpecificDocuments();
      // let count = await getTotalUsers();
      // window.alert("wtf");
      fetchUsersWithToken();
      if (npub && window.location.pathname !== "/dashboard") {
        try {
          const windowurl = window.location.href;

          // Regex to match and capture the number after "/q/"
          const matchnumber = windowurl.match(/\/q\/(\d+)$/);

          let step = matchnumber ? matchnumber[1] : null;

          if (!step) {
            step = await getUserStep(npub); // Fetch the current step
          }

          // if (step == 0) {
          //   localStorage.clear();
          //   navigate("/");
          // } else {

          if (location.pathname === "/about") {
            // Do nothing if on /about
          } else if (step > -1) {
            auth(localStorage.getItem("local_nsec"));
            setIsSignedIn(true);
            setCurrentStep(step);

            const userDoc = doc(database, "users", npub);
            const userSnapshot = await getDoc(userDoc);

            // Wrap Firestore getDoc in try...catch to handle potential errors
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();

              setHasSubmittedPasscode(userData?.hasSubmittedPasscode);

              setUserLanguage(
                userData.userLanguage ||
                  localStorage.getItem("userLanguage") ||
                  "en"
              );

              localStorage.setItem(
                "userLanguage",
                userData.language ||
                  localStorage.getItem("userLanguage") ||
                  "en"
              );

              if (userData.hasOwnProperty("allowPosts")) {
                // Use the value from Firestore (even if it's false)
                setAllowPosts(userData.allowPosts);
              } else {
                // If the field doesn't exist, update the document to set allowPosts to true
                setAllowPosts(false);
                const userDocRef = doc(
                  database,
                  "users",
                  localStorage.getItem("local_npub")
                );
                updateDoc(userDocRef, { allowPosts: false })
                  .then(() =>
                    console.log("allowPosts field added with value true")
                  )
                  .catch((error) =>
                    console.error("Error updating allowPosts:", error)
                  );
              }
            } else {
              localStorage.setItem("userLanguage", "en");
              setUserLanguage("en");
            }

            if (location.pathname === "/experiment") {
            } else if (location.pathname === "/about") {
              // Do nothing if on /about
            } else if (
              step === "subscription" ||
              (step > 9 &&
                localStorage.getItem("passcode") !==
                  import.meta.env.VITE_PATREON_PASSCODE)
            ) {
              navigate("/subscription");
            } else if (step === "award") {
              navigate("/award");
            } else if (location.pathname === "/subscription" && step < 10) {
              showAlert(
                "error",
                translation[userLanguage]["completeTutorialFirst"]
              );

              // topRef.current?.scrollIntoView();
              window.scrollTo(0, 0);

              navigate(`/q/${step}`);
            } else {
              // if (step !== 0) {

              // topRef.current?.scrollIntoView();
              window.scrollTo(0, 0);

              const onboardingProgress = await getOnboardingStep(npub);
              if (
                onboardingProgress !== "done" &&
                parseInt(onboardingProgress, 10) <= 6 &&
                parseInt(onboardingProgress, 10) === step + 1
              ) {
                navigate(`/onboarding/${parseInt(onboardingProgress, 10)}`);
              } else {
                navigate(`/q/${step}`);
              }
              // }
            }
          } else {
            //step is probably onboarding?
            if (step === "subscription") {
              navigate("/subscription");
            } else if (step === "onboarding") {
              const matchnumber = windowurl.match(/\/onboarding\/(\d+)$/);

              let step = matchnumber ? matchnumber[1] : null;
              const userDoc = doc(
                database,
                "users",
                localStorage.getItem("local_npub")
              );
              const userSnapshot = await getDoc(userDoc);
              if (userSnapshot.exists()) {
                const userData = userSnapshot.data();

                setUserLanguage(
                  userData.userLanguage ||
                    localStorage.getItem("userLanguage") ||
                    "en"
                );
              }

              if (step > 6) {
                setOnboardingToDone(localStorage.getItem("local_npub"), 0);

                navigate("/q/0");
              } else {
                // navigate("q/0");
                if (!step) {
                  step = await getOnboardingStep(npub); // Fetch the current step
                }

                setIsSignedIn(true);
                navigate(`/onboarding/${step}`);
              }
            }
          }
        } catch (error) {
          // Catch permission denied errors and handle them accordingly
          if (error.code === "permission-denied") {
            console.error("Permission Denied: ", error);
            // localStorage.clear(); // Clear any local state or authentication
            // navigate("/"); // Redirect to the root route or any other route
          } else {
            console.error("Unexpected Error: ", error);
          }
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, [navigate]);

  if (loading) {
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          height: "100vh",
          alignItems: "center",
        }}
        textAlign="center"
        fontSize="xl"
        p={4}
      >
        <CloudCanvas />
      </Box>
    );
  }

  // let list = steps["en"];
  // let finalOutcome = [];
  // for (let i = 0; i < list.length; i++) {
  //   if (list[i].isConversationReview) {
  //     finalOutcome.push({
  //       index: i,
  //       obj: list[i],
  //     });s
  //   }
  // }

  let clonedStep = JSON.parse(
    JSON.stringify(steps?.["en"]?.[currentStep] || {})
  );

  const testurl = window.location.href;

  const testIsMatch = /\/q\/\d+$/.test(testurl);

  return (
    <Box ref={topRef}>
      <CloudTransition
        isActive={showClouds}
        salary={transitionStats.salary}
        salaryProgress={transitionStats.salaryProgress}
        stepProgress={transitionStats.stepProgress}
        message={transitionStats.message}
      />
      {alert.isOpen && (
        <Alert
          status={alert.status}
          variant="subtle"
          position="fixed"
          // top="20px"
          width="100%"
          maxWidth="100%"
          zIndex={1000}
          borderRadius={24}
          border={"1px solid #ececec"}
          display="flex"
          justifyContent={"center"}
          top={0}
        >
          <AlertIcon />
          {/* <AlertTitle textAlign={"center"}>{alert.status}</AlertTitle> */}
          <AlertDescription>{alert.message}</AlertDescription>
          <CloseButton
            ml={2}
            border="1px solid black"
            // position="absolute"
            right="8px"
            top="8px"
            onMouseDown={hideAlert}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                hideAlert();
              }
            }}
          />
        </Alert>
      )}
      <Box textAlign="center" fontSize="xl" p={0} pt={0}>
        {isSignedIn && (
          <SettingsMenu
            testIsMatch={testIsMatch}
            isSignedIn={isSignedIn}
            setIsSignedIn={setIsSignedIn}
            steps={steps}
            userLanguage={userLanguage}
            setUserLanguage={setUserLanguage}
            currentStep={currentStep} // Pass current step to SettingsMenu
            view={view}
            setView={setView}
            step={steps?.[userLanguage]?.[currentStep]}
            allowPosts={allowPosts}
            setAllowPosts={setAllowPosts}
          />
        )}

        <Routes>
          {/* <Route path="/experiment" element={<TestFeed />} /> */}
          <Route
            path="/"
            element={
              <Home
                isSignedIn={isSignedIn}
                setIsSignedIn={setIsSignedIn}
                userLanguage={userLanguage}
                setUserLanguage={setUserLanguage}
                generateNostrKeys={generateNostrKeys}
                auth={auth}
                view={view}
                setView={setView}
                setCurrentStep={setCurrentStep}
              />
            }
          />
          <Route
            path="/onboarding/:step"
            element={
              <Onboarding
                isSignedIn={isSignedIn}
                setIsSignedIn={setIsSignedIn}
                userLanguage={userLanguage}
                setUserLanguage={setUserLanguage}
                generateNostrKeys={generateNostrKeys}
                auth={auth}
                view={view}
                setView={setView}
                setCurrentStep={setCurrentStep}
              />
            }
          />
          <Route
            path="/subscription"
            element={
              <PasscodePage
                userLanguage={userLanguage}
                isOldAccount={
                  currentStep > 9 &&
                  localStorage.getItem("passcode") !==
                    import.meta.env.VITE_PATREON_PASSCODE
                }
              />
            }
          />
          {location.pathname !== "/about" &&
            steps?.[userLanguage]?.map((_, index) => (
              <Route
                key={index}
                path={`/q/${index}`}
                element={
                  <PrivateRoute>
                    <Step
                      allowPosts={allowPosts}
                      setAllowPosts={setAllowPosts}
                      currentStep={index}
                      userLanguage={userLanguage}
                      setUserLanguage={setUserLanguage}
                      postNostrContent={postNostrContent}
                      assignExistingBadgeToNpub={assignExistingBadgeToNpub}
                      emailStep={clonedStep}
                      hasSubmittedPasscode={hasSubmittedPasscode}
                      setCurrentStep={setCurrentStep}
                      navigateWithTransition={navigateWithTransition}
                      setTransitionStats={setTransitionStats}
                    />
                  </PrivateRoute>
                }
              />
            ))}
          <Route
            path="/award"
            element={<AwardScreen userLanguage={userLanguage} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/about"
            element={
              <About userLanguage={userLanguage} handleToggle={handleToggle} />
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export const AppWrapper = () => {
  // console.log(
  //   JSON.parse(
  //     '{\n  "input": "tell me about what we\'ve learned",\n output": "We covered several fundamental concepts in coding, including the basics of coding as writing instructions for computers, the sequence of program execution such as writing code, compiling code, debugging, and executing programs. We\'ve explored how to declare variables in JavaScript, including using the correct keywords and naming conventions. We also learned how to declare arrays, specifically with the correct syntax for an array of items in JavaScript. Additionally, we discussed data types, the use of constants, and the purpose of variables in programming. Finally, we practiced changing directories in a bash terminal."\n}'
  //   )
  // );
  // const isBroken = true;
  const [isShutDown, setIsShutDown] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  // useEffect(() => {
  //   if (localStorage.getItem("security") === import.meta.env.VITE_SECURITY) {
  //     setIsBroken(false);
  //   }
  // }, []);

  // if (isBroken) {
  //   return (
  //     <div
  //       style={{
  //         padding: 50,
  //         maxWidth: "600px",
  //         height: "100vh",
  //         width: "100%",
  //         display: "flex",
  //         flexDirection: "column",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         textAlign: "left",
  //       }}
  //     >
  //       The app is currently down taken down due to malicious behavior. The app
  //       will not work as intended.
  //       <br />
  //       <br />
  //       If you are the person attacking my small education business, please
  //       accept the apology for whatever grievance I have created and allow folks
  //       to continue accessing resources they seek.
  //       <br />
  //       <br />
  //       <Input
  //         onChange={(event) => {
  //           localStorage.setItem("security", event.target.value);
  //           if (
  //             localStorage.getItem("security") === import.meta.env.VITE_SECURITY
  //           ) {
  //             setIsBroken(false);
  //           }
  //         }}
  //       />
  //       {/* Currently try to contact with OpenAI and my bank in order to handle this
  //       😔 */}
  //       {/* <Button onMouseDown={() => setIsShutDown(false)}>Enter anyway</Button> */}
  //       {/* "Why are AI features disabled?"{" "}
  //       <b>
  //         There seems to be something seriously wrong with the account owner's
  //         billing and I'm being charged thousands of dollars for something that
  //         shouldn't cost that much.
  //       </b>
  //       <br />
  //       <br /> */}
  //       <br />
  //       In the meantime, the lecture series and patreon content are still very
  //       valuable and will save you time, energy and money when it comes to
  //       learning so I encourage you to go through them during this down time!!
  //       Thank you for your patience D:
  //       <br /> <br />
  //       {/* <a
  //         href="https://robotsbuildingeducation.com"
  //         target="_blank"
  //         style={{ textDecoration: "underline" }}
  //       >
  //         Rox the tutor
  //       </a> */}
  //       <a
  //         href="https://patreon.com/robotsbuildingeducation"
  //         target="_blank"
  //         style={{ textDecoration: "underline" }}
  //       >
  //         Patreon
  //       </a>
  //       <br />
  //       <a
  //         href="https://chatgpt.com/g/g-09h5uQiFC-robots-building-education"
  //         target="_blank"
  //         style={{ textDecoration: "underline" }}
  //       >
  //         Robots Building Education GPT
  //       </a>
  //       <div style={{ display: "flex" }}>
  //         <RandomCharacter />
  //         <RandomCharacter /> <RandomCharacter /> <RandomCharacter />{" "}
  //         <RandomCharacter /> <RandomCharacter />
  //         <RandomCharacter /> <RandomCharacter /> <RandomCharacter />{" "}
  //         <RandomCharacter /> <RandomCharacter />
  //       </div>
  //     </div>
  //   );

  // }

  // let broke =
  //   "This browser is broken. Go to the menu option and open on your device.";
  // if (isUnsupportedBrowser()) {
  //   return <div>{broke}</div>;
  // }

  const bannedUserList = [
    "npub1cfyf77uc459arthry2y6ndj8dr2t7fjn6rl5feakghv884f8s73qe9dayg",
    "npub14sy47q3deak79pnw0snwwe0tevts5matlakn22egfkfs90r2dsdsglp0x6",
    "npub1gus0xkmpxg3ylkzaem5ytrrnzrjfqztjpysuad44855k8jppj7jsh4xxyp",
  ];

  if (
    bannedUserList.find((item) => item === localStorage.getItem("local_npub"))
  ) {
    return (
      <div style={{ padding: 24, maxWidth: 350 }}>
        This device and user has been banned after detecting misuse of the
        platform.
        <br /> <br /> If you believe this is a mistake, please contact the owner
        through email to unlock your account and receive the updated subscriber
        passcode:
        <br />
        sheilfer@robotsbuildingeducation.com
      </div>
    );
  }
  return (
    <Router>
      <MiniKitInitializer />
      <App isShutDown={isShutDown} />
    </Router>
  );
};
