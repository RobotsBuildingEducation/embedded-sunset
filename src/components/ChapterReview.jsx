// ChapterReview.jsx
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Icon,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  QuestionIcon,
  RepeatIcon,
  StarIcon,
} from "@chakra-ui/icons";
import { motion } from "framer-motion";

// extra icons for comprehensive coverage
import { FiType, FiAlignLeft } from "react-icons/fi";
import {
  RiChat3Line,
  RiChatQuoteLine,
  RiCodeSSlashLine,
  RiTerminalLine,
  RiBookOpenLine,
} from "react-icons/ri";
import { BsCodeSquare } from "react-icons/bs";

/** -------------------- Styles & Kind Resolver -------------------- */

const CHAPTER_REVIEW_TYPE_STYLES = {
  // existing kinds
  order: {
    icon: RepeatIcon,
    accent: "#8b5cf6",
    gradient: "linear(to-br, rgba(139,92,246,0.22), rgba(59,130,246,0.18))",
  },
  multiAnswer: {
    icon: CheckCircleIcon,
    accent: "#10b981",
    gradient: "linear(to-br, rgba(16,185,129,0.22), rgba(59,130,246,0.14))",
  },
  multiChoice: {
    icon: QuestionIcon,
    accent: "#0ea5e9",
    gradient: "linear(to-br, rgba(14,165,233,0.22), rgba(99,102,241,0.16))",
  },

  // comprehensive additions
  singleLine: {
    icon: FiType,
    accent: "#fb923c",
    gradient: "linear(to-br, rgba(251,146,60,0.22), rgba(253,164,175,0.18))",
  },
  text: {
    icon: FiAlignLeft,
    accent: "#64748b",
    gradient: "linear(to-br, rgba(100,116,139,0.20), rgba(99,102,241,0.12))",
  },
  code: {
    icon: RiCodeSSlashLine,
    accent: "#06b6d4",
    gradient: "linear(to-br, rgba(6,182,212,0.22), rgba(14,165,233,0.16))",
  },
  codeCompletion: {
    icon: BsCodeSquare,
    accent: "#84cc16",
    gradient: "linear(to-br, rgba(132,204,22,0.22), rgba(16,185,129,0.16))",
  },
  terminal: {
    icon: RiTerminalLine,
    accent: "#f43f5e",
    gradient: "linear(to-br, rgba(244,63,94,0.22), rgba(59,130,246,0.12))",
  },
  prompt: {
    icon: RiChatQuoteLine,
    accent: "#e879f9",
    gradient: "linear(to-br, rgba(232,121,249,0.22), rgba(251,113,133,0.16))",
  },
  conversation: {
    icon: RiChat3Line,
    accent: "#6366f1",
    gradient: "linear(to-br, rgba(99,102,241,0.22), rgba(14,165,233,0.14))",
  },
  study: {
    icon: RiBookOpenLine,
    accent: "#a78bfa",
    gradient: "linear(to-br, rgba(167,139,250,0.22), rgba(14,165,233,0.14))",
  },

  default: {
    icon: StarIcon,
    accent: "#f59e0b",
    gradient: "linear(to-br, rgba(245,158,11,0.22), rgba(249,168,212,0.18))",
  },
};

const QUESTION_KIND_ALIASES = {
  // order
  order: "order",
  selectorder: "order",
  dragorder: "order",

  // multiple choice
  multichoice: "multiChoice",
  multiplechoice: "multiChoice",
  ismultiplechoice: "multiChoice",

  // multiple answer
  multianswer: "multiAnswer",
  multipleanswer: "multiAnswer",
  multiselect: "multiAnswer",
  ismultipleanswerchoice: "multiAnswer",

  // text
  text: "text",
  freetext: "text",
  istext: "text",

  // single-line text
  singleline: "singleLine",
  singlelinetext: "singleLine",
  shorttext: "singleLine",
  issinglelinetext: "singleLine",

  // code
  code: "code",
  writecode: "code",
  iscode: "code",

  // code completion
  codecompletion: "codeCompletion",
  completecode: "codeCompletion",
  fillinthecode: "codeCompletion",
  iscodecompletion: "codeCompletion",

  // terminal
  terminal: "terminal",
  shell: "terminal",
  bash: "terminal",
  isterminal: "terminal",

  // prompt writing
  prompt: "prompt",
  promptwriting: "prompt",
  writeprompt: "prompt",
  ispromptwriting: "prompt",

  // conversation review
  conversation: "conversation",
  conversationreview: "conversation",
  chatreview: "conversation",
  isconversationreview: "conversation",

  // study / guide
  study: "study",
  studyguide: "study",
  isstudyguide: "study",
};

const normalizeKind = (k) =>
  String(k ?? "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase();

const getStyleForKind = (kind) => {
  const norm = normalizeKind(kind);
  const canonical = QUESTION_KIND_ALIASES[norm] || "default";
  return (
    CHAPTER_REVIEW_TYPE_STYLES[canonical] || CHAPTER_REVIEW_TYPE_STYLES.default
  );
};

/** -------------------- Skill-tree Flow Layout Helpers -------------------- */

const FLOW_CARD_PATTERNS = [
  { alignSelf: "flex-start", translateX: "-12%", rotate: "-4deg" },
  { alignSelf: "center", translateX: "0%", rotate: "3deg" },
  { alignSelf: "flex-end", translateX: "12%", rotate: "-3deg" },
  { alignSelf: "center", translateX: "-6%", rotate: "2deg" },
];

const roundPoint = (value) => Math.round(value * 10) / 10;

const createFlowConnectorPath = (start, end, fallbackDirection = 1) => {
  const deltaX = end.x - start.x;
  const deltaY = Math.max(1, end.y - start.y);
  const direction =
    Math.abs(deltaX) > 8 ? Math.sign(deltaX) : fallbackDirection;
  const wave = Math.min(72, Math.max(28, Math.abs(deltaX) * 0.22 + 24));
  const midpointX =
    (start.x + end.x) / 2 + (Math.abs(deltaX) <= 8 ? direction * wave * 0.6 : 0);
  const midpointY = start.y + deltaY * 0.5;

  return [
    `M ${roundPoint(start.x)} ${roundPoint(start.y)}`,
    `C ${roundPoint(start.x)} ${roundPoint(start.y + deltaY * 0.28)},`,
    `${roundPoint(start.x + direction * wave)} ${roundPoint(start.y + deltaY * 0.3)},`,
    `${roundPoint(midpointX)} ${roundPoint(midpointY)}`,
    `S ${roundPoint(end.x - direction * wave)} ${roundPoint(end.y - deltaY * 0.3)},`,
    `${roundPoint(end.x)} ${roundPoint(end.y)}`,
  ].join(" ");
};

const resolvePattern = (index) =>
  FLOW_CARD_PATTERNS[index % FLOW_CARD_PATTERNS.length];

const getJustifyContent = (align) => {
  if (align === "flex-start") return "flex-start";
  if (align === "flex-end") return "flex-end";
  return "center";
};

/** -------------------- Drawer Mosaic Helpers -------------------- */

const isLong = (t) => (t ? String(t).length > 34 : false);
const getMosaicSpan = (index, title) => {
  const long = isLong(title);
  const mdPattern = [6, 4, 3, 3, 4, 6, 4, 3, 3, 4];
  const mdCol = long ? 8 : mdPattern[index % mdPattern.length]; // give long titles more width
  const baseCol = long || index % 5 === 0 ? 2 : 1;
  return { baseCol, mdCol };
};

/** -------------------- Component -------------------- */

const ChapterReview = ({
  nodes,
  text,
  onStart = () => {},
  defaultExpanded = false,
  showExpandControl = true,
  showStartButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [connectorPaths, setConnectorPaths] = useState([]);
  const treeRef = useRef(null);
  const cardRefs = useRef([]);
  const chapterCardBg = useColorModeValue(
    "rgba(255,255,255,0.94)",
    "rgba(12,21,40,0.98)",
  );
  const chapterCardShadow = useColorModeValue(
    "0 18px 38px rgba(15,23,42,0.14)",
    "0 24px 46px rgba(2,6,23,0.42)",
  );
  const activeChapterCardShadow = useColorModeValue(
    "0 24px 48px rgba(14,165,233,0.2)",
    "0 28px 56px rgba(2,6,23,0.48)",
  );
  const connectorBaseStroke = useColorModeValue(
    "rgba(148,163,184,0.26)",
    "rgba(148,163,184,0.2)",
  );
  const drawerQuestionBg = useColorModeValue(
    "rgba(255,255,255,0.96)",
    "rgba(12,21,40,0.96)",
  );
  const drawerQuestionShadow = useColorModeValue(
    "0 18px 36px rgba(15,23,42,0.1)",
    "0 20px 40px rgba(2,6,23,0.34)",
  );

  const {
    isOpen: isChapterDrawerOpen,
    onOpen: onChapterDrawerOpen,
    onClose: onChapterDrawerClose,
  } = useDisclosure();

  const previewCount = 2;
  const activeNodeIndex = Math.max(
    0,
    nodes.findIndex((node) => node.isActive),
  );
  const collapsedNodes = nodes.slice(
    activeNodeIndex,
    activeNodeIndex + previewCount,
  );
  const visibleNodes = isExpanded ? nodes : collapsedNodes;
  const hasHiddenNodes = nodes.length > visibleNodes.length;
  const isShowingExpandButton =
    showExpandControl && hasHiddenNodes && !isExpanded;
  const startButtonMarginTop = isExpanded
    ? { base: 0, md: 2 }
    : isShowingExpandButton
      ? { base: -2, md: -4 }
      : { base: -4, md: -8 };

  const closeChapterDrawer = useCallback(() => {
    setSelectedChapter(null);
    onChapterDrawerClose();
  }, [onChapterDrawerClose]);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
    closeChapterDrawer();
  }, [nodes, closeChapterDrawer, defaultExpanded]);

  const handleChapterSelect = (node) => {
    if (!node?.questions?.length) return;
    setSelectedChapter(node);
    onChapterDrawerOpen();
  };

  const handleChapterKeyDown = (event, node) => {
    if (!node?.questions?.length) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleChapterSelect(node);
    }
  };

  const handleDrawerClose = () => {
    setSelectedChapter(null);
    onChapterDrawerClose();
  };

  const updateConnectorPaths = useCallback(() => {
    const treeElement = treeRef.current;
    if (!treeElement || visibleNodes.length < 2) {
      setConnectorPaths((previousPaths) =>
        previousPaths.length ? [] : previousPaths,
      );
      return;
    }

    const treeRect = treeElement.getBoundingClientRect();
    const nextPaths = visibleNodes
      .slice(0, -1)
      .map((node, index) => {
        const currentCard = cardRefs.current[index];
        const nextCard = cardRefs.current[index + 1];
        if (!currentCard || !nextCard) return null;

        const currentRect = currentCard.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();
        const start = {
          x: currentRect.left + currentRect.width / 2 - treeRect.left,
          y: currentRect.bottom - treeRect.top,
        };
        const end = {
          x: nextRect.left + nextRect.width / 2 - treeRect.left,
          y: nextRect.top - treeRect.top,
        };

        return {
          id: `${node.id || index}-${visibleNodes[index + 1]?.id || index + 1}`,
          accent: getStyleForKind(node.questionKind).accent,
          d: createFlowConnectorPath(
            start,
            end,
            index % 2 === 0 ? 1 : -1,
          ),
        };
      })
      .filter(Boolean);

    setConnectorPaths((previousPaths) => {
      const previousSignature = JSON.stringify(previousPaths);
      const nextSignature = JSON.stringify(nextPaths);
      return previousSignature === nextSignature ? previousPaths : nextPaths;
    });
  }, [visibleNodes]);

  useLayoutEffect(() => {
    let frameId;
    const scheduleConnectorUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateConnectorPaths);
    };

    scheduleConnectorUpdate();
    window.addEventListener("resize", scheduleConnectorUpdate);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleConnectorUpdate)
        : null;

    if (resizeObserver) {
      if (treeRef.current) resizeObserver.observe(treeRef.current);
      cardRefs.current.forEach((card) => {
        if (card) resizeObserver.observe(card);
      });
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleConnectorUpdate);
      resizeObserver?.disconnect();
    };
  }, [updateConnectorPaths]);

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      pt={{ base: 0, md: 4 }}
      pb={{ base: 0, md: 4 }}
      px={{ base: 1, md: 6 }}
    >
      <VStack
        spacing={{ base: 3, md: 8 }}
        width="100%"
        maxW={{ base: "680px", lg: "820px" }}
        align="center"
      >
        <Box textAlign="center" px={{ base: 2, md: 6 }}>
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="widest"
            color="purple.300"
            lineHeight="1.1"
            mb={0}
          >
            {text?.title}
          </Text>
          <Text
            fontSize="xs"
            lineHeight="1.2"
            color="appTextMuted"
            maxW={{ base: "340px", md: "460px" }}
            mx="auto"
            mt={1}
            sx={{ fontSize: "var(--chakra-fontSizes-xs) !important" }}
          >
            {text?.subtitle}
          </Text>
        </Box>

        {/* ---------- SKILL TREE (restored) ---------- */}
        <Box
          ref={treeRef}
          w="100%"
          px={{ base: 0, md: 3 }}
          position="relative"
        >
          {connectorPaths.length ? (
            <Box
              as="svg"
              position="absolute"
              inset={0}
              width="100%"
              height="100%"
              overflow="visible"
              pointerEvents="none"
              zIndex={0}
            >
              {connectorPaths.map((connector) => (
                <g key={connector.id}>
                  <path
                    d={connector.d}
                    stroke={connectorBaseStroke}
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                  <path
                    d={connector.d}
                    stroke={`${connector.accent}80`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              ))}
            </Box>
          ) : null}

          <VStack
            align="stretch"
            spacing={{ base: 4, md: 10 }}
            w="100%"
            position="relative"
            zIndex={1}
          >
            {visibleNodes.map((node, index) => {
              const typeStyle = getStyleForKind(node.questionKind);
              const IconComponent = typeStyle.icon || StarIcon;
              const accent = typeStyle.accent;
              const gradient = typeStyle.gradient;
              const pattern = resolvePattern(index);
              const justifyContent = getJustifyContent(pattern.alignSelf);
              const isClickable = node?.questions?.length > 0;

              return (
                <Box key={node.id} position="relative">
                  <Flex
                    justify={{ base: "center", md: justifyContent }}
                    w="100%"
                  >
                    <Box
                      as={motion.div}
                      ref={(element) => {
                        cardRefs.current[index] = element;
                      }}
                      role={isClickable ? "button" : undefined}
                      tabIndex={isClickable ? 0 : -1}
                      onClick={() => handleChapterSelect(node)}
                      onKeyDown={(event) => handleChapterKeyDown(event, node)}
                      initial={{ opacity: 0, y: 24, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, delay: index * 0.06 }}
                      px={{ base: 3, md: 5 }}
                      py={{ base: 3, md: 5 }}
                      borderRadius="full"
                      bg={chapterCardBg}
                      borderWidth="1px"
                      borderColor={
                        node.isActive ? `${accent}85` : `${accent}45`
                      }
                      boxShadow={
                        node.isActive
                          ? `${activeChapterCardShadow}, 0 0 0 1px ${accent}30`
                          : `${chapterCardShadow}, 0 0 0 1px ${accent}18`
                      }
                      display="flex"
                      alignItems="center"
                      gap={{ base: 3, md: 5 }}
                      position="relative"
                      overflow="hidden"
                      cursor={isClickable ? "pointer" : "default"}
                      transform={{
                        base: "none",
                        md: `translateX(${pattern.translateX}) rotate(${pattern.rotate})`,
                      }}
                      _hover={
                        isClickable
                          ? {
                              transform: {
                                base: "scale(1.01)",
                                md: `translateX(${pattern.translateX}) rotate(${pattern.rotate}) scale(1.02)`,
                              },
                            }
                          : undefined
                      }
                      _focusVisible={{ boxShadow: `0 0 0 3px ${accent}55` }}
                    >
                      <Box
                        position="absolute"
                        inset={0}
                        borderRadius="inherit"
                        bgGradient={gradient}
                        opacity={0.32}
                        pointerEvents="none"
                      />
                      <Flex
                        align="center"
                        gap={{ base: 3, md: 5 }}
                        position="relative"
                        zIndex={1}
                        w="100%"
                      >
                        <Box
                          w={{ base: "44px", md: "64px" }}
                          h={{ base: "44px", md: "64px" }}
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bgGradient={`radial-gradient(circle at 30% 30%, ${accent}33, transparent 70%)`}
                          boxShadow={`0 20px 40px ${accent}30`}
                        >
                          <Icon
                            as={IconComponent}
                            boxSize={{ base: 5, md: 7 }}
                            color={accent}
                          />
                        </Box>
                        <Text
                          fontSize={{ base: "md", md: "xl" }}
                          lineHeight={{ base: "1.2", md: "1.3" }}
                          fontWeight={node.isActive ? "extrabold" : "semibold"}
                          color="appText"
                          letterSpacing={0}
                          textAlign={{ base: "center", md: "left" }}
                        >
                          {node.chapterLabel || node.title}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              );
            })}

            {showExpandControl && hasHiddenNodes && !isExpanded ? (
              <Box
                as={motion.div}
                position="relative"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: visibleNodes.length * 0.06,
                }}
                pt={{ base: 2, md: 4 }}
              >
                <Button
                  variant="ghost"
                  size={{ base: "sm", md: "lg" }}
                  borderRadius="full"
                  px={{ base: 4, md: 8 }}
                  py={{ base: 2, md: 5 }}
                  fontSize={{ base: "sm", md: "lg" }}
                  colorScheme="purple"
                  onClick={() => setIsExpanded(true)}
                >
                  {text?.expand || "Show more"}
                </Button>
              </Box>
            ) : null}
          </VStack>
        </Box>

        {showStartButton && text?.cta ? (
          <Button
            colorScheme="purple"
            size={{ base: "md", md: "lg" }}
            borderRadius="full"
            px={{ base: 6, md: 12 }}
            py={{ base: 4, md: 7 }}
            onMouseDown={onStart}
            mt={startButtonMarginTop}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onStart();
              }
            }}
          >
            {text?.cta}
          </Button>
        ) : null}

        {/* ---------- DRAWER (mosaic grid) ---------- */}
        {/* ---------- DRAWER (column list) ---------- */}
        <Drawer
          isOpen={isChapterDrawerOpen}
          placement="bottom"
          onClose={handleDrawerClose}
        >
          <DrawerOverlay bg="appOverlay" backdropFilter="blur(8px)" />
          <DrawerContent
            borderTopRadius={{ base: "3xl", md: "4xl" }}
            bg="appSurfaceElevated"
            color="appText"
            borderWidth="1px"
            borderColor="appBorder"
            maxH="80vh"
          >
            <DrawerCloseButton
              top={{ base: 3, md: 4 }}
              right={{ base: 4, md: 6 }}
            />
            <DrawerHeader pt={{ base: 8, md: 10 }} pb={{ base: 4, md: 6 }}>
              <VStack align="flex-start" spacing={{ base: 1, md: 2 }}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  color="purple.300"
                >
                  {text?.drawerTitle || "Inside this chapter"}
                </Text>
                {/* no ellipsis on the chapter title */}
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color="appText"
                >
                  {selectedChapter?.chapterLabel || selectedChapter?.title}
                </Text>
              </VStack>
            </DrawerHeader>

            <DrawerBody pb={{ base: 8, md: 12 }} pt={{ base: 2, md: 3 }}>
              {selectedChapter?.questions?.length ? (
                <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                  {selectedChapter.questions.map((question, index) => {
                    const questionStyle = getStyleForKind(
                      question.questionKind,
                    );
                    const QuestionIconComponent =
                      questionStyle.icon || StarIcon;
                    const questionAccent = questionStyle.accent;
                    const questionGradient = questionStyle.gradient;

                    return (
                      <Box
                        key={question.id || `${selectedChapter.id}-${index}`}
                        as={motion.div}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        w="100%"
                        borderRadius="2xl"
                        px={{ base: 3, md: 4 }}
                        py={{ base: 3, md: 4 }}
                        bg={drawerQuestionBg}
                        borderWidth="1px"
                        borderColor={`${questionAccent}55`}
                        boxShadow={`${drawerQuestionShadow}, 0 0 0 1px ${questionAccent}18`}
                        position="relative"
                        // important: NO overflow hiding (no clipping of long text)
                      >
                        <Box
                          position="absolute"
                          inset={0}
                          bgGradient={questionGradient}
                          opacity={0.2}
                          pointerEvents="none"
                        />
                        <Flex
                          align="center"
                          gap={{ base: 3, md: 4 }}
                          position="relative"
                          zIndex={1}
                        >
                          <Box
                            w={{ base: "44px", md: "52px" }}
                            h={{ base: "44px", md: "52px" }}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bgGradient={`radial-gradient(circle at 30% 30%, ${questionAccent}33, transparent 70%)`}
                            boxShadow={`0 12px 24px ${questionAccent}20`}
                            flexShrink={0}
                          >
                            <Icon
                              as={QuestionIconComponent}
                              boxSize={{ base: 5, md: 6 }}
                              color={questionAccent}
                            />
                          </Box>

                          {/* no ellipsis / no word-breaking; allow natural wrapping */}
                          <Text
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="semibold"
                            color="appText"
                            whiteSpace="normal"
                            wordBreak="normal"
                            overflow="visible"
                          >
                            {question.title}
                          </Text>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <Text color="appTextMuted" fontSize="md">
                  {text?.emptyChapter || "Lessons will appear here."}
                </Text>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </VStack>
    </Box>
  );
};

export default React.memo(ChapterReview);
