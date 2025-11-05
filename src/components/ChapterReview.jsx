// ChapterReview.jsx
import { useCallback, useEffect, useState } from "react";
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
  { alignSelf: "flex-start", translateX: "-12%", rotate: "-4deg", anchor: 80 },
  { alignSelf: "center", translateX: "0%", rotate: "3deg", anchor: 200 },
  { alignSelf: "flex-end", translateX: "12%", rotate: "-3deg", anchor: 320 },
  { alignSelf: "center", translateX: "-6%", rotate: "2deg", anchor: 200 },
];

const createFlowConnectorPath = (startAnchor, endAnchor) => {
  const controlOffset = (endAnchor - startAnchor) * 0.5;
  const controlPoint1 = startAnchor + controlOffset * 0.6;
  const controlPoint2 = endAnchor - controlOffset * 0.6;
  return `M ${startAnchor} 10 C ${controlPoint1} -6, ${controlPoint2} 70, ${endAnchor} 54`;
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

  const {
    isOpen: isChapterDrawerOpen,
    onOpen: onChapterDrawerOpen,
    onClose: onChapterDrawerClose,
  } = useDisclosure();

  const previewCount = 2;
  const activeNodeIndex = Math.max(
    0,
    nodes.findIndex((node) => node.isActive)
  );
  const collapsedNodes = nodes.slice(
    activeNodeIndex,
    activeNodeIndex + previewCount
  );
  const visibleNodes = isExpanded ? nodes : collapsedNodes;
  const hasHiddenNodes = nodes.length > visibleNodes.length;

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

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      py={{ base: 10, md: 14 }}
      px={{ base: 3, md: 6 }}
    >
      <VStack
        spacing={{ base: 10, md: 12 }}
        width="100%"
        maxW={{ base: "680px", lg: "820px" }}
        align="center"
      >
        <Box textAlign="center" px={{ base: 4, md: 6 }}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="widest"
            color="purple.400"
            mb={2}
          >
            {text?.title}
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} color="gray.600">
            {text?.subtitle}
          </Text>
        </Box>

        {/* ---------- SKILL TREE (restored) ---------- */}
        <Box w="100%" borderRadius="4xl" p={{ base: 6, md: 8 }}>
          <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
            {visibleNodes.map((node, index) => {
              const typeStyle = getStyleForKind(node.questionKind);
              const IconComponent = typeStyle.icon || StarIcon;
              const accent = typeStyle.accent;
              const gradient = typeStyle.gradient;
              const pattern = resolvePattern(index);
              const nextPattern = resolvePattern(index + 1);
              const justifyContent = getJustifyContent(pattern.alignSelf);
              const isClickable = node?.questions?.length > 0;

              return (
                <Box
                  key={node.id}
                  display="flex"
                  flexDirection="column"
                  gap={4}
                >
                  <Flex justify={justifyContent} w="100%">
                    <Box
                      as={motion.div}
                      role={isClickable ? "button" : undefined}
                      tabIndex={isClickable ? 0 : -1}
                      onClick={() => handleChapterSelect(node)}
                      onKeyDown={(event) => handleChapterKeyDown(event, node)}
                      initial={{ opacity: 0, y: 24, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, delay: index * 0.06 }}
                      px={{ base: 4, md: 5 }}
                      py={{ base: 4, md: 5 }}
                      borderRadius="full"
                      bg="rgba(255,255,255,0.96)"
                      borderWidth="1px"
                      borderColor={
                        node.isActive ? `${accent}85` : `${accent}45`
                      }
                      boxShadow={
                        node.isActive
                          ? `0 28px 54px ${accent}35`
                          : `0 18px 38px rgba(15,23,42,0.14)`
                      }
                      display="flex"
                      alignItems="center"
                      gap={{ base: 4, md: 5 }}
                      position="relative"
                      cursor={isClickable ? "pointer" : "default"}
                      style={{
                        transform: `translateX(${pattern.translateX}) rotate(${pattern.rotate})`,
                      }}
                      _hover={
                        isClickable
                          ? {
                              transform: `translateX(${pattern.translateX}) rotate(${pattern.rotate}) scale(1.02)`,
                            }
                          : undefined
                      }
                      _focusVisible={{ boxShadow: `0 0 0 3px ${accent}55` }}
                    >
                      <Box
                        position="absolute"
                        inset={0}
                        // bgGradient={gradient}
                        opacity={0.22}
                        pointerEvents="none"
                      />
                      <Flex
                        align="center"
                        gap={{ base: 4, md: 5 }}
                        position="relative"
                        zIndex={1}
                        w="100%"
                      >
                        <Box
                          w={{ base: "56px", md: "64px" }}
                          h={{ base: "56px", md: "64px" }}
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bgGradient={`radial-gradient(circle at 30% 30%, ${accent}33, transparent 70%)`}
                          boxShadow={`0 20px 40px ${accent}30`}
                        >
                          <Icon
                            as={IconComponent}
                            boxSize={{ base: 6, md: 7 }}
                            color={accent}
                          />
                        </Box>
                        <Text
                          fontSize={{ base: "lg", md: "xl" }}
                          fontWeight={node.isActive ? "extrabold" : "semibold"}
                          color="gray.800"
                          letterSpacing="tight"
                        >
                          {node.chapterLabel || node.title}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>

                  {/* connector between cards */}
                  {index < visibleNodes.length - 1 ? (
                    <Box
                      h={{ base: 16, md: 20 }}
                      w="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      px={{ base: 6, md: 8 }}
                    >
                      <Box
                        as="svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 400 80"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={createFlowConnectorPath(
                            pattern.anchor,
                            nextPattern.anchor
                          )}
                          stroke="rgba(148,163,184,0.18)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <path
                          d={createFlowConnectorPath(
                            pattern.anchor,
                            nextPattern.anchor
                          )}
                          stroke={`${accent}55`}
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                      </Box>
                    </Box>
                  ) : null}
                </Box>
              );
            })}

            {showExpandControl && hasHiddenNodes && !isExpanded ? (
              <Box
                as={motion.div}
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
                  size="lg"
                  borderRadius="full"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 4, md: 5 }}
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
            size="lg"
            borderRadius="full"
            px={{ base: 8, md: 12 }}
            py={{ base: 6, md: 7 }}
            onMouseDown={onStart}
            mt="-48px"
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
          <DrawerOverlay bg="blackAlpha.400" backdropFilter="blur(8px)" />
          <DrawerContent
            borderTopRadius={{ base: "3xl", md: "4xl" }}
            bg="rgba(255,255,255,0.96)"
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
                  color="purple.400"
                >
                  {text?.drawerTitle || "Inside this chapter"}
                </Text>
                {/* no ellipsis on the chapter title */}
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color="gray.800"
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
                      question.questionKind
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
                        bg="rgba(255,255,255,0.95)"
                        borderWidth="1px"
                        borderColor={`${questionAccent}40`}
                        boxShadow={`0 18px 36px ${questionAccent}26`}
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
                            color="gray.900"
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
                <Text color="gray.500" fontSize="md">
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

export default ChapterReview;
