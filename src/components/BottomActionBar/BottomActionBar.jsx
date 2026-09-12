import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Icon,
  useColorModeValue,
  useToken,
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaRegHeart, FaFire } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { RiBookOpenLine, RiFlag2Line } from "react-icons/ri";
import { IoChatbubblesOutline } from "react-icons/io5";
import RandomCharacter from "../../elements/RandomCharacter";
import CountdownTimer from "../../elements/CountdownTimer";
import ThinkingOrb from "../../elements/ThinkingOrb";
import NineDotMenu from "./NineDotMenu";
import { useThemeStore } from "../../useThemeStore";
import { useSurfaceModalStore } from "../../useSurfaceModalStore";

const progressGradient = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const AnimatedEllipsis = () => (
  <Box as="span" display="inline-flex" alignItems="center" ml={1}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
        style={{
          display: "inline-block",
          marginRight: "1.5px",
          fontWeight: "bold",
        }}
      >
        .
      </motion.span>
    ))}
  </Box>
);

const colorToRgba = (color, alpha = 1) => {
  if (!color) return `rgba(0, 0, 0, ${alpha})`;
  if (color.startsWith("rgba")) {
    return color.replace(/[\d\.]+\)$/g, `${alpha})`);
  }
  if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
  }
  const normalizedHex = color.replace("#", "");
  const fullHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((char) => char + char)
          .join("")
      : normalizedHex;
  const bigint = parseInt(fullHex, 16);
  if (isNaN(bigint)) return color;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// 3x3 Dots Grid Icon matching screenshot
const NineDotIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <circle cx="3" cy="3" r="1.6" />
    <circle cx="9" cy="3" r="1.6" />
    <circle cx="15" cy="3" r="1.6" />
    <circle cx="3" cy="9" r="1.6" />
    <circle cx="9" cy="9" r="1.6" />
    <circle cx="15" cy="9" r="1.6" />
    <circle cx="3" cy="15" r="1.6" />
    <circle cx="9" cy="15" r="1.6" />
    <circle cx="15" cy="15" r="1.6" />
  </svg>
);

export const BottomActionBar = ({
  currentStep,
  step,
  steps,
  userLanguage = "en",
  translation = {},
  isCorrect,
  feedback,
  grade,
  incorrectAttempts = 0,
  isSending = false,
  isTimerExpired = true,
  handleTimerExpire,
  isAILearningMode = false,
  animatedProgress = 0,
  chapterMetricLabel = "",
  metricTooltips,
  streak = 0,
  goalCount = 0,
  handleAnswerClick,
  handleNextQuestionButtonPress,
  handleGenerateNewQuestion,
  handleLearnClick,
  handleModalCheck,
  openSurfaceModal,
  onOpenSettings,
  showLearnSparkles = false,
  learnSparkleFloat,
  learnHaloDrift,
  triggerHaptic = () => {},
  playActionBarSound = () => {},
  soundManager,
  interval = 0,
  handleSelfPacedSettingsSaved,
  isPostingWithNostr = false,
  isActionBarTourActive = false,
  renderActionBarTour = (child) => child,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeColor = useThemeStore((state) => state.themeColor);

  const [
    accent50,
    accent100,
    accent200,
    accent300,
    accent400,
    accent500,
    accent600,
    accent700,
    accent800,
  ] = useToken("colors", [
    `${themeColor}.50`,
    `${themeColor}.100`,
    `${themeColor}.200`,
    `${themeColor}.300`,
    `${themeColor}.400`,
    `${themeColor}.500`,
    `${themeColor}.600`,
    `${themeColor}.700`,
    `${themeColor}.800`,
  ]);

  const themeIconColor = useColorModeValue(
    accent600 || "#d946ef",
    accent300 || "#f0abfc",
  );

  // Color tokens
  const defaultBarBg = useColorModeValue("appSurfaceElevated", "#10192e");
  const defaultBarBorder = useColorModeValue(
    "appBorderStrong",
    "rgba(148, 163, 184, 0.22)",
  );
  const defaultShadow = useColorModeValue(
    "0 12px 32px rgba(15, 23, 42, 0.12)",
    "0 16px 40px rgba(2, 6, 23, 0.5)",
  );

  // Loading feedback colors (white/theme)
  const loadingBg = useColorModeValue("white", "#10192e");
  const loadingBorder = useColorModeValue(
    accent200 || "appBorderStrong",
    accent700 || "rgba(148, 163, 184, 0.28)",
  );
  const loadingShadow = useColorModeValue(
    "0 12px 32px rgba(15, 23, 42, 0.12)",
    "0 16px 40px rgba(2, 6, 23, 0.5)",
  );

  // Correct feedback colors (light green card, green border)
  const successBg = useColorModeValue("#eaf7ee", "#143522");
  const successBorder = useColorModeValue("#81c995", "#2e7d32");
  const successText = useColorModeValue("#1e4620", "#d1fae5");
  const successShadow = useColorModeValue(
    "0 12px 36px rgba(46, 125, 50, 0.22)",
    "0 16px 40px rgba(4, 120, 87, 0.35)",
  );

  // Incorrect feedback colors (light red/pink card, red border)
  const errorBg = useColorModeValue("#fde8e8", "#381818");
  const errorBorder = useColorModeValue("#f98080", "#771d1d");
  const errorText = useColorModeValue("#9b1c1c", "#ffe4e6");
  const errorShadow = useColorModeValue(
    "0 12px 36px rgba(224, 36, 36, 0.22)",
    "0 16px 40px rgba(127, 29, 29, 0.35)",
  );

  // Primary button colors themed with active theme color
  const primaryButtonBg = useColorModeValue(
    accent400 || "#a78bfa",
    accent500 || "#8b5cf6",
  );
  const primaryButtonHoverBg = useColorModeValue(
    accent500 || "#9061f9",
    accent600 || "#7c3aed",
  );
  const primaryNextButtonBg = "#198754";
  const primaryNextButtonHoverBg = "#157347";

  // Dynamic box shadow using accents of the active theme base color
  const primaryButtonBevel = useColorModeValue(
    accent600 || accent700 || "#c2410c",
    accent700 || accent800 || "#9a3412",
  );
  const primaryButtonGlow = colorToRgba(accent500 || accent400, 0.35);
  const primaryButtonShadow = `0 4px 0 ${primaryButtonBevel}, 0 6px 16px ${primaryButtonGlow}`;
  const primaryButtonActiveShadow = `0 2px 0 ${primaryButtonBevel}`;

  const feedbackHeartColor = useColorModeValue("#dc2626", "#fb7185");
  const learnGlowColor = accent400 || "#a78bfa";
  const learnGlowSoft = accent300 || "#c4b5fd";

  const isFeedbackActive = Boolean(feedback || isCorrect !== null);
  const isQuestionZero = currentStep === 0 || Boolean(step?.isStudyGuide);
  const isLockout = incorrectAttempts >= 5 && !isTimerExpired;

  // Calculate starting and completed chapter progress percentages
  const calculateChapterProgress = (isCompleted = false) => {
    if (!steps || !steps[userLanguage]) return Math.round(animatedProgress || 0);
    const stepList = steps[userLanguage];
    const current = stepList[currentStep];
    if (!current) return Math.round(animatedProgress || 0);

    const group = current.group;
    const groupIndices = stepList
      .map((s, idx) => (s.group === group ? idx : null))
      .filter((idx) => idx !== null);
    const groupLength = groupIndices.length;
    if (groupLength <= 1) return isCompleted ? 100 : 0;

    const indexInGroup = groupIndices.indexOf(currentStep);
    const count = isCompleted ? indexInGroup + 1 : indexInGroup;
    const result = Math.round((count / (groupLength - 1)) * 100);
    return Math.min(100, Math.max(0, result));
  };

  const startingProgress = calculateChapterProgress(false);
  const completedProgress = calculateChapterProgress(true);
  const displayProgress = isCorrect ? completedProgress : startingProgress;

  const tooltips =
    metricTooltips ||
    (userLanguage?.includes("es")
      ? {
          chapter: "Capítulo actual del curso",
          progress: "Progreso dentro del capítulo actual",
          streak:
            "Respuestas correctas completadas antes de que venza tu temporizador de racha",
          goals: "Metas diarias completadas",
        }
      : {
          chapter: "Your current course chapter",
          progress: "Your progress through the current chapter",
          streak:
            "Correct answers completed before your streak timer expires",
          goals: "Daily learning goals completed",
        });

  const badgeTooltipStyle = {
    hasArrow: true,
    placement: "top",
    openDelay: 200,
    closeOnClick: false,
    px: 3.5,
    py: 2,
    maxW: "260px",
    borderRadius: "xl",
    borderWidth: "1px",
    borderColor: "pink.200",
    bg: "appSurfaceElevated",
    color: "appText",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    fontSize: "xs",
    fontWeight: "semibold",
    lineHeight: "1.45",
  };

  // Active styles based on state
  let currentBg = defaultBarBg;
  let currentBorder = defaultBarBorder;
  let currentShadow = defaultShadow;

  if (isSending) {
    currentBg = loadingBg;
    currentBorder = loadingBorder;
    currentShadow = loadingShadow;
  } else if (isCorrect) {
    currentBg = successBg;
    currentBorder = successBorder;
    currentShadow = successShadow;
  } else if (isFeedbackActive && !isCorrect) {
    currentBg = errorBg;
    currentBorder = errorBorder;
    currentShadow = errorShadow;
  }

  // Menu action handlers
  const handleOpenBitcoin = () => {
    openSurfaceModal("bitcoin", { userLanguage }, "bitcoin");
  };

  const handleOpenSelfPaced = () => {
    openSurfaceModal(
      "selfPaced",
      {
        interval,
        userId: localStorage.getItem("local_npub"),
        userLanguage,
        onSettingsSaved: handleSelfPacedSettingsSaved,
      },
      "selfPaced",
    );
  };

  const handleOpenHelper = () => {
    openSurfaceModal(
      "helper",
      { currentStep, step, steps, userLanguage },
      "helper",
    );
  };

  const handleOpenPatreon = () => {
    triggerHaptic();
    playActionBarSound("patreon");
    window.open(
      "https://www.patreon.com/posts/building-app-by-93082226?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link",
      "_blank",
    );
  };

  const barContent = (
    <Box
      position="fixed"
      bottom={{ base: "14px", md: "20px" }}
      left="0"
      right="0"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      pointerEvents="none"
      zIndex={1300}
      px={{ base: 3, sm: 4 }}
    >
      <MotionBox
        layout
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        pointerEvents="auto"
        position="relative"
        width={{ base: "100%", sm: "460px", md: "500px" }}
        bg={currentBg}
        border="1px solid"
        borderColor={currentBorder}
        borderRadius="4px"
        boxShadow={currentShadow}
        px={
          isSending
            ? { base: 4, sm: 5 }
            : isCorrect
              ? { base: 4, sm: 5, md: 6 }
              : isFeedbackActive
                ? { base: 4, sm: 5 }
                : { base: 3.5, sm: 4.5 }
        }
        py={
          isSending
            ? { base: 3, sm: 3.5 }
            : isCorrect
              ? { base: 3.5, sm: 4 }
              : isFeedbackActive
                ? { base: 3, sm: 3.5 }
                : { base: 2.5, sm: 3 }
        }
        overflow="visible"
      >
        {/* 9-dot flyout popover menu */}
        <NineDotMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenSettings={() => {
            setIsMenuOpen(false);
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              useSurfaceModalStore.getState().openSettings();
            }
          }}
          onOpenBitcoin={handleOpenBitcoin}
          onOpenSelfPaced={handleOpenSelfPaced}
          onOpenHelper={handleOpenHelper}
          onOpenPatreon={handleOpenPatreon}
          userLanguage={userLanguage}
          translation={translation}
        />

        {/* Dynamic Island Expandable Feedback Section */}
        <AnimatePresence mode="wait">
          {isSending ? (
            <MotionBox
              key="loading-feedback"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              mb={3}
              pt={1}
              width="100%"
            >
              <HStack
                spacing={3.5}
                align="center"
                justify="center"
                py={1.5}
                px={{ base: 2, sm: 3 }}
              >
                <ThinkingOrb size={36} />
                <HStack spacing={0.5} align="baseline">
                  <Text
                    fontWeight="700"
                    fontSize={{ base: "md", sm: "lg" }}
                    color="appText"
                    letterSpacing="-0.01em"
                  >
                    {userLanguage?.startsWith("es") ? "Pensando" : "Thinking"}
                  </Text>
                  <AnimatedEllipsis />
                </HStack>
              </HStack>
            </MotionBox>
          ) : isCorrect ? (
            <MotionBox
              key="correct-feedback"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              mb={3}
              pt={1}
              width="100%"
            >
              {/* Row 1: Chapter Badges matching top header */}
              <HStack
                spacing={2}
                width="100%"
                justify="space-between"
                align="center"
                mb={2.5}
                px={{ base: 1, sm: 2 }}
                flexWrap="wrap"
                rowGap={1.5}
              >
                <Tooltip label={tooltips.chapter} {...badgeTooltipStyle}>
                  <HStack
                    spacing={1.5}
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    bg={useColorModeValue("white", "rgba(255, 255, 255, 0.08)")}
                    border="1px solid rgba(102, 133, 255, 0.45)"
                    boxShadow="0 1px 3px rgba(0,0,0,0.04)"
                    tabIndex={0}
                    cursor="help"
                    aria-label={`${tooltips.chapter}: ${chapterMetricLabel || "Tutorial"}`}
                    onPointerDown={(event) => {
                      if (event.pointerType === "touch") {
                        event.currentTarget.focus();
                      }
                    }}
                  >
                    <Icon as={RiBookOpenLine} color="blue.400" boxSize={3.5} />
                    <Text fontSize="xs" fontWeight="700" color="appText">
                      {chapterMetricLabel || (userLanguage?.startsWith("es") ? "Tutorial" : "Tutorial")}
                    </Text>
                  </HStack>
                </Tooltip>

                <HStack spacing={1.5}>
                  <Tooltip label={tooltips.progress} {...badgeTooltipStyle}>
                    <HStack
                      spacing={1}
                      px={2}
                      py={1}
                      borderRadius="full"
                      bg={useColorModeValue("white", "rgba(255, 255, 255, 0.08)")}
                      border="1px solid rgba(246, 173, 85, 0.45)"
                      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
                      tabIndex={0}
                      cursor="help"
                      aria-label={`${tooltips.progress}: ${displayProgress}%`}
                      onPointerDown={(event) => {
                        if (event.pointerType === "touch") {
                          event.currentTarget.focus();
                        }
                      }}
                    >
                      <Icon as={FiTrendingUp} color="orange.500" boxSize={3.5} />
                      <Text fontSize="xs" fontWeight="700" color="appText">
                        {displayProgress}%
                      </Text>
                    </HStack>
                  </Tooltip>

                  <Tooltip label={tooltips.streak} {...badgeTooltipStyle}>
                    <HStack
                      spacing={1}
                      px={2}
                      py={1}
                      borderRadius="full"
                      bg={useColorModeValue("white", "rgba(255, 255, 255, 0.08)")}
                      border="1px solid rgba(252, 129, 129, 0.45)"
                      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
                      tabIndex={0}
                      cursor="help"
                      aria-label={`${tooltips.streak}: ${Math.max(1, streak || 0)}`}
                      onPointerDown={(event) => {
                        if (event.pointerType === "touch") {
                          event.currentTarget.focus();
                        }
                      }}
                    >
                      <Icon as={FaFire} color="red.400" boxSize={3.5} />
                      <Text fontSize="xs" fontWeight="700" color="appText">
                        {Math.max(1, streak || 0)}
                      </Text>
                    </HStack>
                  </Tooltip>

                  <Tooltip label={tooltips.goals} {...badgeTooltipStyle}>
                    <HStack
                      spacing={1}
                      px={2}
                      py={1}
                      borderRadius="full"
                      bg={useColorModeValue("white", "rgba(255, 255, 255, 0.08)")}
                      border="1px solid rgba(183, 148, 244, 0.5)"
                      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
                      tabIndex={0}
                      cursor="help"
                      aria-label={`${tooltips.goals}: ${String(goalCount) || "0"}`}
                      onPointerDown={(event) => {
                        if (event.pointerType === "touch") {
                          event.currentTarget.focus();
                        }
                      }}
                    >
                      <Icon as={RiFlag2Line} color="purple.400" boxSize={3.5} />
                      <Text fontSize="xs" fontWeight="700" color="appText">
                        {String(goalCount) || "0"}
                      </Text>
                    </HStack>
                  </Tooltip>
                </HStack>
              </HStack>

              {/* Row 2: Chapter Progress Bar - Golden Bar Style */}
              <Box width="100%" px={{ base: 1, sm: 2 }} mb={3}>
                <Progress
                  value={displayProgress}
                  height="22px"
                  borderRadius="6px"
                  border="1px solid"
                  borderColor={useColorModeValue(
                    "#ececec",
                    "rgba(255, 255, 255, 0.15)",
                  )}
                  background={useColorModeValue("#f4f4f5", "#1f2937")}
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.15)"
                  width="100%"
                  sx={{
                    "& > div:first-of-type": {
                      background:
                        "linear-gradient(270deg, #f6ad55, #fbd38d, #f6ad55)",
                      backgroundSize: "200% 200%",
                      animation: `${progressGradient} 20s linear infinite`,
                      transitionProperty: "width",
                      transitionDuration: "0.8s",
                      transitionTimingFunction: "ease-in-out",
                      borderRadius: "5px",
                    },
                  }}
                />
              </Box>

              {/* Row 3: Proactive learning style speech bubble and snug RandomCharacter */}
              <Box width="100%" px={{ base: 1, sm: 2 }} mb={2}>
                <Box
                  px={{ base: 3.5, sm: 4 }}
                  py={{ base: 2.5, sm: 3 }}
                  borderRadius="20px"
                  borderBottomLeftRadius="0px"
                  background="appSurface"
                  border="1px solid var(--chakra-colors-appBorderStrong)"
                  boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
                  textAlign="left"
                  width="100%"
                >
                  <Text
                    fontWeight="700"
                    fontSize={{ base: "sm", sm: "md" }}
                    color={successText}
                    lineHeight="1.4"
                    wordBreak="break-word"
                  >
                    {feedback ||
                      (userLanguage?.startsWith("es")
                        ? "¡Correcto!"
                        : "Correct!")}
                  </Text>
                </Box>
                <Box mt="4px" pl={1} display="flex" justifyContent="flex-start">
                  <RandomCharacter width="46px" height="auto" />
                </Box>
              </Box>
            </MotionBox>
          ) : isFeedbackActive && !isCorrect ? (
            <MotionBox
              key="incorrect-feedback"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              mb={3}
              pt={1}
              width="100%"
            >
              <VStack spacing={2} align="center" width="100%" px={{ base: 2, sm: 3 }}>
                {/* Hearts row: top, vertically stacked over text, centered */}
                <HStack spacing={1.5} justify="center" align="center">
                  {Array.from({ length: 5 }, (_, i) =>
                    i < 5 - incorrectAttempts ? (
                      <Icon as={FaHeart} key={i} color={feedbackHeartColor} boxSize={4} />
                    ) : (
                      <Icon as={FaRegHeart} key={i} color={feedbackHeartColor} boxSize={4} />
                    ),
                  )}
                </HStack>

                {/* Feedback message: centered, no leading '✕' */}
                <Text
                  fontWeight="700"
                  fontSize={{ base: "sm", sm: "md" }}
                  color={errorText}
                  lineHeight="short"
                  textAlign="center"
                  wordBreak="break-word"
                >
                  {feedback || (userLanguage?.startsWith("es") ? "Intenta de nuevo" : "Try again")}
                </Text>
              </VStack>

              {/* Lockout countdown message if attempts >= 5 */}
              {isLockout && (
                <Box mt={2} p={2} bg="appSurface" borderRadius="xl" fontSize="xs">
                  <CountdownTimer
                    onTimerExpire={handleTimerExpire}
                    userLanguage={userLanguage}
                  />
                </Box>
              )}
            </MotionBox>
          ) : null}
        </AnimatePresence>

        {/* Action Bar Bottom Row: 9-Dot Button | Learn Icon | Answer / Next */}
        <HStack spacing={3} width="100%" justify="space-between" align="center">
          {/* 9-Dot Menu Button applying theme */}
          <IconButton
            aria-label="Open menu"
            icon={<NineDotIcon />}
            variant="ghost"
            boxSize={{ base: "44px", sm: "48px" }}
            minW={{ base: "44px", sm: "48px" }}
            borderRadius="full"
            color={themeIconColor}
            _hover={{ bg: "appSurfaceMuted" }}
            _active={{ bg: "appSurfaceInset" }}
            onClick={() => {
              triggerHaptic();
              playActionBarSound("next");
              setIsMenuOpen((prev) => !prev);
            }}
          />

          {/* Correct State: wide 'Next question →' primary button */}
          {isCorrect ? (
            <Button
              flex="1"
              height={{ base: "44px", sm: "48px" }}
              borderRadius="8px"
              bg={primaryNextButtonBg}
              color="white"
              fontWeight="700"
              fontSize="md"
              boxShadow="0 4px 0 #0f5132, 0 6px 16px rgba(16, 185, 129, 0.35)"
              _hover={{ bg: primaryNextButtonHoverBg }}
              _active={{
                bg: primaryNextButtonHoverBg,
                transform: "translateY(2px)",
                boxShadow: "0 2px 0 #0f5132",
              }}
              onPointerDown={(event) =>
                handleNextQuestionButtonPress(event, () => {
                  triggerHaptic();
                  soundManager?.resume?.();
                  soundManager?.play?.("next");
                })
              }
              onClick={(event) =>
                handleNextQuestionButtonPress(event, () => {
                  triggerHaptic();
                  soundManager?.resume?.();
                  soundManager?.play?.("next");
                })
              }
              disabled={isPostingWithNostr || isActionBarTourActive}
            >
              {translation[userLanguage]?.["app.button.nextQuestion"] || "Next question"} →
            </Button>
          ) : (
            <>
              {/* Secondary Button: Learn Icon button (applying theme) */}
              <Box position="relative" display="inline-flex">
                {showLearnSparkles && (
                  <>
                    <Box
                      aria-hidden="true"
                      position="absolute"
                      inset="-8px"
                      borderRadius="full"
                      bg={`conic-gradient(from 20deg, transparent 0deg, ${learnGlowSoft} 75deg, transparent 145deg, ${learnGlowColor} 235deg, transparent 315deg)`}
                      filter="blur(4px)"
                      pointerEvents="none"
                      zIndex={0}
                    />
                    {[
                      { top: "-14px", right: "1px", fontSize: "16px", delay: "0.08s" },
                      { bottom: "-12px", left: "2px", fontSize: "12px", delay: "0.48s" },
                      { top: "4px", right: "-12px", fontSize: "11px", delay: "0.82s" },
                    ].map((sparkle, index) => (
                      <Text
                        key={index}
                        aria-hidden="true"
                        position="absolute"
                        top={sparkle.top}
                        right={sparkle.right}
                        bottom={sparkle.bottom}
                        left={sparkle.left}
                        color={learnGlowColor}
                        fontSize={sparkle.fontSize}
                        lineHeight="1"
                        textShadow={`0 0 10px ${learnGlowSoft}`}
                        pointerEvents="none"
                        animation={`${learnSparkleFloat} 1.65s ease-out ${sparkle.delay} both`}
                        zIndex={2}
                      >
                        ✦
                      </Text>
                    ))}
                  </>
                )}
                <IconButton
                  aria-label={
                    translation[userLanguage]?.["app.button.learn"] || "Learn"
                  }
                  icon={<IoChatbubblesOutline fontSize="22px" />}
                  variant="ghost"
                  boxSize={{ base: "44px", sm: "48px" }}
                  minW={{ base: "44px", sm: "48px" }}
                  borderRadius="full"
                  color={themeIconColor}
                  _hover={{ bg: "appSurfaceMuted" }}
                  _active={{ bg: "appSurfaceInset" }}
                  position="relative"
                  zIndex={1}
                  onClick={() => {
                    handleModalCheck?.(handleLearnClick);
                    triggerHaptic();
                    playActionBarSound("learn");
                  }}
                />
              </Box>

              {/* Primary Button: Answer / Next (for Question 0) */}
              {isQuestionZero ? (
                <Button
                  flex="1"
                  height={{ base: "44px", sm: "48px" }}
                  borderRadius="8px"
                  bg={primaryButtonBg}
                  color="white"
                  fontWeight="700"
                  fontSize="md"
                  boxShadow={primaryButtonShadow}
                  _hover={{ bg: primaryButtonHoverBg }}
                  _active={{
                    bg: primaryButtonHoverBg,
                    transform: "translateY(2px)",
                    boxShadow: primaryButtonActiveShadow,
                  }}
                  onPointerDown={handleNextQuestionButtonPress}
                  onClick={handleNextQuestionButtonPress}
                  disabled={isPostingWithNostr || isActionBarTourActive}
                >
                  {translation[userLanguage]?.["app.button.nextQuestion"] || "Next question"} →
                </Button>
              ) : (
                <Button
                  flex="1"
                  height={{ base: "44px", sm: "48px" }}
                  borderRadius="8px"
                  bg={primaryButtonBg}
                  color="white"
                  fontWeight="700"
                  fontSize="md"
                  boxShadow={primaryButtonShadow}
                  _hover={{ bg: primaryButtonHoverBg }}
                  _active={{
                    bg: primaryButtonHoverBg,
                    transform: "translateY(2px)",
                    boxShadow: primaryButtonActiveShadow,
                  }}
                  isLoading={isSending}
                  isDisabled={isLockout || isPostingWithNostr || isActionBarTourActive}
                  onClick={() => {
                    triggerHaptic();
                    soundManager?.resume?.();
                    soundManager?.play?.("submit");
                    handleAnswerClick?.();
                  }}
                >
                  {translation[userLanguage]?.["app.button.answer"] || "Answer"}
                </Button>
              )}
            </>
          )}
        </HStack>
      </MotionBox>
    </Box>
  );

  return renderActionBarTour(barContent);
};

export default BottomActionBar;
