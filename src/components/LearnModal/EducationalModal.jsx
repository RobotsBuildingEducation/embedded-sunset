import React, { useEffect, useMemo, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import {
  Box,
  Button,
  VStack,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerFooter,
  DrawerBody,
  DrawerCloseButton,
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
  Spinner,
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
import { useEducationGeminiChat } from "../../hooks/useGeminiChat";
import { LuSend } from "react-icons/lu";
import { isUnsupportedBrowser } from "../../utility/browser";
import { useLiteOverlayEffects } from "../../utility/perfProfile";
import { InstallAppModal } from "../InstallModal/InstallModal";
import {
  getThemedCodeBlockStyles,
  getThemedSyntaxHighlightTheme,
} from "../../theme";
import { pickProgrammingLanguage } from "../../utility/translation";
import { getObjectsByGroup, steps as allSteps } from "../../utility/content";
import {
  isInlineMarkdownCode,
  normalizeLearnMarkdown,
} from "../../utility/markdownCode";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor";

export const buildLearnPrompt = (step, userLanguage) => {
  const languageName = pickProgrammingLanguage(userLanguage);
  const isEnglish = userLanguage?.includes("en");
  const isGroupThreeOrHigher = Number(step?.group) >= 3 || step?.showPreview;

  const visualWidgetInstruction = isGroupThreeOrHigher
    ? ` For visual concepts (such as HTML document structure, forms, CSS box model, Flexbox layouts, React components, useState hooks, controlled inputs, conditional rendering, or interactive simulations), include a single self-contained interactive preview widget wrapped in a \`\`\`preview ... \`\`\` code block. The preview widget MUST be a runnable React functional component (e.g. \`function ExampleWidget() { ... return ( ... ); }\`) using inline styles and React hooks (useState, useEffect) with no external imports, and all UI text/labels inside the widget must be in ${
        isEnglish ? "English" : "Spanish"
      }. For non-visual, purely algorithmic, or terminal concepts, use standard \`\`\`${languageName.toLowerCase()} code blocks instead.`
    : "";

  if (step?.isConversationReview) {
    const relevantSteps = getObjectsByGroup(
      step?.group,
      allSteps[userLanguage],
    );
    return `Generate educational material about ${JSON.stringify(
      relevantSteps,
    )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Format short identifiers, class names, method names, properties, and single expressions with single backticks so they remain inline with prose. Always wrap entire multiline code examples in a single complete fenced code block (e.g. \`\`\`javascript ... \`\`\`).${visualWidgetInstruction} Fenced code blocks may contain source code only, never explanatory prose. Keep code lines within 80 characters, and never interrupt a code snippet with unformatted text or split it into fragmented blocks. Do not begin the response with a fenced code block. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
      isEnglish ? "english" : "spanish"
    }`;
  }

  return `Generate educational ${languageName} material about ${JSON.stringify(
    step,
  )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Format short identifiers, class names, method names, properties, and single expressions with single backticks so they remain inline with prose. Always wrap entire multiline code examples in a single complete fenced code block (e.g. \`\`\`javascript ... \`\`\`).${visualWidgetInstruction} Fenced code blocks may contain source code only, never explanatory prose. Keep code lines within 80 characters, and never interrupt a code snippet with unformatted text or split it into fragmented blocks. Do not begin the response with a fenced code block. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
    isEnglish ? "english" : "spanish"
  }`;
};

const learnLectureCache = new Map();
const maxLearnLectureCacheEntries = 20;

const getLearnCacheKey = (step, userLanguage) => {
  try {
    return `${userLanguage}:${JSON.stringify(step)}`;
  } catch {
    return `${userLanguage}:${step?.group || ""}:${step?.title || ""}:${
      step?.question?.questionText || ""
    }`;
  }
};

const cacheLearnLecture = (cacheKey, messages) => {
  if (!cacheKey || !Array.isArray(messages) || messages.length < 1) return;

  learnLectureCache.delete(cacheKey);
  learnLectureCache.set(cacheKey, messages);

  if (learnLectureCache.size > maxLearnLectureCacheEntries) {
    const [oldestKey] = learnLectureCache.keys();
    learnLectureCache.delete(oldestKey);
  }
};

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

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Learn preview widget error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export const InteractivePreviewCard = ({
  code = "",
  userLanguage = "en",
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const { colorMode } = useColorMode();
  const isSpanish = String(userLanguage).toLowerCase().includes("es");

  const previewLabel = isSpanish ? "Vista Previa" : "Live Preview";
  const codeLabel = isSpanish ? "Código" : "Code";
  const widgetBadgeLabel = isSpanish
    ? "Widget Interactivo"
    : "Interactive Widget";
  const generatingLabel = isSpanish
    ? "Generando vista interactiva..."
    : "Generating interactive preview...";

  const isCodeComplete = React.useMemo(() => {
    const trimmed = code.trim();
    if (!trimmed) return false;
    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openBraces !== closeBraces || openParens !== closeParens) return false;
    return true;
  }, [code]);

  const showLoader = isLoading || (!isCodeComplete && isLoading);
  const showCodeFallback = !isLoading && !isCodeComplete;

  return (
    <Box
      width="100%"
      maxWidth="100%"
      my={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="appBorder"
      bg="appSurface"
      boxShadow="sm"
      overflow="hidden"
      boxSizing="border-box"
    >
      <HStack
        justify="space-between"
        align="center"
        px={3}
        py={2}
        borderBottomWidth="1px"
        borderBottomColor="appBorder"
        bg={colorMode === "dark" ? "whiteAlpha.50" : "blackAlpha.50"}
      >
        <HStack spacing={2}>
          <Box
            w={2}
            h={2}
            borderRadius="full"
            bg="pink.400"
            boxShadow="0 0 8px rgba(236,72,153,0.6)"
          />
          <Text
            fontSize="xs"
            fontWeight="700"
            color="appTextMuted"
            letterSpacing="0.02em"
          >
            {widgetBadgeLabel}
          </Text>
        </HStack>
        <HStack spacing={1}>
          <Button
            size="xs"
            variant={
              activeTab === "preview" && !showCodeFallback ? "solid" : "ghost"
            }
            colorScheme={
              activeTab === "preview" && !showCodeFallback ? "pink" : "gray"
            }
            onClick={() => setActiveTab("preview")}
            borderRadius="md"
            fontSize="xs"
            fontWeight="600"
            isDisabled={showCodeFallback}
          >
            {previewLabel}
          </Button>
          <Button
            size="xs"
            variant={
              activeTab === "code" || showCodeFallback ? "solid" : "ghost"
            }
            colorScheme={
              activeTab === "code" || showCodeFallback ? "pink" : "gray"
            }
            onClick={() => setActiveTab("code")}
            borderRadius="md"
            fontSize="xs"
            fontWeight="600"
          >
            {codeLabel}
          </Button>
        </HStack>
      </HStack>
      <Box p={{ base: 1.5, md: 2.5 }} width="100%" maxWidth="100%" boxSizing="border-box">
        {showLoader ? (
          <HStack
            spacing={3}
            justify="center"
            align="center"
            py={8}
            px={4}
            borderRadius="lg"
            bg={colorMode === "dark" ? "gray.900" : "white"}
          >
            <Spinner
              size="sm"
              color="pink.400"
              thickness="2px"
              speed="0.8s"
            />
            <Text fontSize="xs" fontWeight="600" color="appTextMuted">
              {generatingLabel}
            </Text>
          </HStack>
        ) : activeTab === "preview" && !showCodeFallback ? (
          <PreviewErrorBoundary
            fallback={
              <SyntaxHighlighter
                language="javascript"
                PreTag="div"
                style={getThemedSyntaxHighlightTheme(colorMode)}
                customStyle={getThemedCodeBlockStyles(colorMode)}
              >
                {code}
              </SyntaxHighlighter>
            }
          >
            <Box
              borderRadius="lg"
              overflow="hidden"
              maxWidth="100%"
              bg={colorMode === "dark" ? "gray.900" : "white"}
              boxSizing="border-box"
              sx={{
                "& > *": {
                  maxWidth: "100%",
                  boxSizing: "border-box",
                },
                "& .react-live-preview": {
                  maxWidth: "100%",
                  overflowX: "auto",
                  overflowWrap: "anywhere",
                  boxSizing: "border-box",
                },
                "& .react-live-preview > *": {
                  maxWidth: "100%",
                  boxSizing: "border-box",
                },
                "& .react-live-error": {
                  fontSize: "xs",
                  p: 2.5,
                  my: 2,
                  borderRadius: "md",
                  bg: "red.50",
                  color: "red.700",
                  border: "1px solid",
                  borderColor: "red.200",
                  fontFamily: "mono",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "auto",
                },
              }}
            >
              <LiveReactEditorModal
                code={code}
                mode="preview"
                autoRun={true}
                hideRunButton={true}
                previewHeight="auto"
              />
            </Box>
          </PreviewErrorBoundary>
        ) : (
          <SyntaxHighlighter
            language="javascript"
            PreTag="div"
            style={getThemedSyntaxHighlightTheme(colorMode)}
            customStyle={getThemedCodeBlockStyles(colorMode)}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </Box>
    </Box>
  );
};

export const LearnMarkdownMessage = React.memo(
  ({ content = "", userLanguage = "en", isLoading = false }) => {
    const theme = useMemo(
      () => ChakraUIRenderer(newTheme(userLanguage, isLoading)),
      [userLanguage, isLoading],
    );
    const normalizedContent = useMemo(
      () => normalizeLearnMarkdown(content),
      [content],
    );

    return <Markdown components={theme}>{normalizedContent}</Markdown>;
  },
);

export const newTheme = (userLanguage = "en", isLoading = false) => {
  let highlightIndex = 0;
  return {
    p: ({ node, ...props }) => (
      <Text
        mb={4}
        color="appText"
        fontSize={{ base: "sm", md: "md" }}
        lineHeight="1.8"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <UnorderedList pl={5} spacing={3} mb={5} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <UnorderedList as="ol" pl={5} spacing={3} mb={5} {...props} />
    ),
    li: ({ node, ...props }) => <ListItem lineHeight="1.8" {...props} />,
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
      const lang = (match?.[1] || "").toLowerCase();
      const isInline = isInlineMarkdownCode({
        inline,
        className,
        children,
        node,
      });

      const rawCode = String(children).replace(/\n$/, "");
      const hasComponentStructure =
        /(?:function\s+[A-Z]|const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>|<\s*[A-Za-z][a-zA-Z0-9_]*|render\s*\()/.test(
          rawCode,
        ) &&
        (/(?:return\s*\(?|<[a-zA-Z][\s\S]*>|style\s*=\s*\{\{)/.test(rawCode) ||
          rawCode.includes("useState") ||
          rawCode.includes("useEffect"));

      const isPreview =
        !isInline &&
        (lang === "preview" ||
          /(?:^|\s)language-preview(?:\s|$)/.test(className || "")) &&
        hasComponentStructure;

      if (isPreview) {
        return (
          <InteractivePreviewCard
            code={rawCode}
            userLanguage={userLanguage}
            isLoading={isLoading}
          />
        );
      }

      return !isInline ? (
        <SyntaxHighlighter
          language={lang === "preview" ? "javascript" : lang || "javascript"}
          PreTag="div"
          style={getThemedSyntaxHighlightTheme(colorMode)}
          customStyle={getThemedCodeBlockStyles(colorMode)}
          {...props}
        >
          {rawCode}
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
          display="inline"
          boxDecorationBreak="clone"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
          overflowWrap="anywhere"
          maxWidth="100%"
          {...props}
        >
          {children}
        </Box>
      );
    },
  };
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

const LearnDrawerHeader = ({ userLanguage }) => (
  <HStack
    as="header"
    width="100%"
    justify="space-between"
    align="center"
    px={{ base: 4, md: 6 }}
    py={3}
    borderBottomWidth="1px"
    borderBottomColor="appBorder"
  >
    <HStack spacing={3} minWidth={0}>
      <Box width="fit-content" flexShrink={0}>
        <RandomCharacter />
      </Box>
      <Text fontSize="xl" fontWeight="bold" noOfLines={1}>
        {translation[userLanguage]["modal.learn.title"]}
      </Text>
    </HStack>
    <DrawerCloseButton
      position="static"
      size="lg"
      flexShrink={0}
      aria-label={userLanguage === "es" ? "Cerrar aprendizaje" : "Close Learn"}
    />
  </HStack>
);

const EducationalModal = ({ isOpen, onClose, step, userLanguage }) => {
  const liteOverlayEffects = useLiteOverlayEffects();
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
  const { resetMessages, messages, submitPrompt } = useEducationGeminiChat();

  const learnCacheKey = React.useMemo(
    () => getLearnCacheKey(step, userLanguage),
    [step, userLanguage],
  );

  // Educational content chat. Generated lectures are cached by step/language
  // so closing and reopening the modal shows the same lecture instead of
  // issuing another generation request.
  const {
    messages: generatedEducationalMessages,
    submitPrompt: submitEducationalPrompt,
    resetMessages: resetEducationalMessages,
  } = useEducationGeminiChat();
  const [cachedEducationalMessages, setCachedEducationalMessages] = useState(
    () => learnLectureCache.get(learnCacheKey) || [],
  );
  const educationalMessages =
    cachedEducationalMessages.length > 0
      ? cachedEducationalMessages
      : generatedEducationalMessages;
  const educationalContent = [];

  useEffect(() => {
    if (!isOpen || !step) return;
    const cachedMessages = learnLectureCache.get(learnCacheKey);
    if (cachedMessages?.length > 0) {
      setCachedEducationalMessages(cachedMessages);
      return;
    }

    setCachedEducationalMessages([]);
    resetEducationalMessages();
    submitEducationalPrompt(buildLearnPrompt(step, userLanguage)).catch(
      (error) => console.error("Failed to generate learning content:", error),
    );
    // Only fire when the modal opens (not when step/userLanguage change while
    // open) - matches the previous behaviour of LearnModalHost.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, learnCacheKey]);

  useEffect(() => {
    const lastMessage =
      generatedEducationalMessages[generatedEducationalMessages.length - 1];

    if (lastMessage?.content?.trim() && lastMessage?.meta?.loading === false) {
      cacheLearnLecture(learnCacheKey, generatedEducationalMessages);
      setCachedEducationalMessages(generatedEducationalMessages);
    }
  }, [generatedEducationalMessages, learnCacheKey]);

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
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        size="full"
        returnFocusOnClose={false}
      >
        <DrawerOverlay
          bg={liteOverlayEffects ? "blackAlpha.400" : "blackAlpha.300"}
          backdropFilter="none"
        />
        <DrawerContent
          bg="appSurfaceElevated"
          color="appText"
          borderLeftWidth={{ base: 0, md: "1px" }}
          borderLeftColor="appBorderStrong"
          boxShadow="none"
          width={{ base: "90vw", md: "78vw" }}
          maxWidth={{ base: "90vw", md: "720px" }}
          p={0}
          overflow="hidden"
        >
          {educationalMessages.length < 1 ? (
            <DrawerBody p={0} overflowY="auto">
              <LearnDrawerHeader userLanguage={userLanguage} />
              <Box
                color="appText"
                width="100%"
                minH="calc(100dvh - 80px)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={6}
              >
                <LearnLoadingAnimation userLanguage={userLanguage} />
              </Box>
            </DrawerBody>
          ) : (
            <>
              <DrawerBody p={0} overflowY="auto">
                <LearnDrawerHeader userLanguage={userLanguage} />
                <Box
                  width="100%"
                  display="flex"
                  justifyContent="center"
                  px={{ base: 3, md: 6 }}
                  py={4}
                >
                  <VStack
                    spacing={6}
                    alignItems="flex-start"
                    maxWidth="640px"
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
                          <LearnMarkdownMessage
                            content={content.content}
                            userLanguage={userLanguage}
                            isLoading={Boolean(content?.meta?.loading)}
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
                              <LearnMarkdownMessage
                                content={msg.content}
                                userLanguage={userLanguage}
                                isLoading={false}
                              />
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
                            <LearnMarkdownMessage
                              content={msg?.response?.content || ""}
                              userLanguage={userLanguage}
                              isLoading={Boolean(msg?.response?.meta?.loading)}
                            />
                          </Box>
                        </>
                      );
                    })}
                  </VStack>
                </Box>
              </DrawerBody>
              <DrawerFooter
                p={0}
                borderTopWidth="1px"
                borderTopColor="appBorder"
                bg="appSurfaceElevated"
              >
                <Box width="100%" maxWidth="640px" mx="auto">
                  <HStack
                    width="100%"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    pt={1}
                    pb={{ base: 3, md: 4 }}
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
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default EducationalModal;
