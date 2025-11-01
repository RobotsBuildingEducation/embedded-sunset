import React, { useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiLock,
  FiStar,
  FiTarget,
  FiFlag,
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionCircle = motion(Circle);

const clampProgress = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

const statusMeta = {
  complete: {
    gradient: "linear(135deg, #3ddc97 0%, #38b26c 100%)",
    icon: FiCheckCircle,
    label: "Completed",
    accent: "green.300",
    shadow: "0 18px 30px rgba(61, 220, 151, 0.3)",
  },
  active: {
    gradient: "linear(135deg, #ffe066 0%, #ff922b 100%)",
    icon: FiTarget,
    label: "In progress",
    accent: "orange.300",
    shadow: "0 18px 32px rgba(255, 192, 72, 0.35)",
  },
  locked: {
    gradient: "linear(135deg, #e0e7ff 0%, #b3c1ff 100%)",
    icon: FiLock,
    label: "Locked",
    accent: "blue.200",
    shadow: "0 12px 20px rgba(176, 187, 230, 0.28)",
  },
};

const optionalMeta = {
  "not-started": {
    label: "Side quest available",
    cta: "Start quest",
    colorScheme: "purple",
  },
  build: {
    label: "Prototype in progress",
    cta: "Continue quest",
    colorScheme: "orange",
  },
  conversation: {
    label: "Conversation ready",
    cta: "Open conversation",
    colorScheme: "purple",
  },
  chatting: {
    label: "Conversation underway",
    cta: "Rejoin conversation",
    colorScheme: "purple",
  },
  complete: {
    label: "Side quest complete",
    cta: "Review quest",
    colorScheme: "green",
  },
  skipped: {
    label: "Side quest skipped",
    cta: "View quest",
    colorScheme: "gray",
  },
};

const connectorAnimation = {
  animate: {
    scaleY: [0.7, 1, 0.7],
    opacity: [0.4, 1, 0.4],
  },
  transition: {
    duration: 2.4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const SkillTreeBoard = ({
  steps,
  userLanguage,
  currentStep,
  onNodeSelect,
  groupLabels,
  optionalQuestProgress = {},
  activeStep,
  highlightStep,
  focusGroup,
  showOnlyFocus = false,
  isCompact = false,
  isInteractive = true,
}) => {
  const effectiveStep =
    typeof activeStep === "number" ? activeStep : currentStep ?? 0;
  const highlightIndex =
    typeof highlightStep === "number" ? highlightStep : null;

  const groups = useMemo(() => {
    const list = steps?.[userLanguage] || [];
    const mapping = new Map();

    list.forEach((step, idx) => {
      if (!step || idx === 0) {
        return;
      }

      const groupId = step.group || `group-${idx}`;
      if (!mapping.has(groupId)) {
        mapping.set(groupId, {
          id: groupId,
          steps: [],
          start: idx,
          end: idx,
          optional: null,
        });
      }

      const entry = mapping.get(groupId);
      entry.steps.push({ ...step, index: idx });
      entry.start = Math.min(entry.start, idx);
      entry.end = Math.max(entry.end, idx);
      if (step.isConversationReview) {
        entry.optional = { ...step, index: idx };
      }
    });

    return Array.from(mapping.values()).sort((a, b) => a.start - b.start);
  }, [steps, userLanguage]);

  const displayGroups = useMemo(() => {
    if (showOnlyFocus && focusGroup) {
      return groups.filter((group) => group.id === focusGroup);
    }
    return groups;
  }, [focusGroup, groups, showOnlyFocus]);

  const handleSelect = (stepIndex) => {
    if (!isInteractive) {
      return;
    }
    if (typeof onNodeSelect === "function" && typeof stepIndex === "number") {
      onNodeSelect(stepIndex);
    }
  };

  if (!displayGroups.length) {
    return (
      <Box borderRadius="xl" borderWidth="1px" p={6} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          No progress data available yet.
        </Text>
      </Box>
    );
  }

  const showSpine = !(showOnlyFocus && displayGroups.length <= 1);

  return (
    <Box
      position="relative"
      py={isCompact ? 4 : 8}
      px={isCompact ? { base: 0, sm: 2 } : { base: 2, sm: 6 }}
    >
      {showSpine && (
        <MotionBox
          position="absolute"
          left="50%"
          top={0}
          bottom={0}
          width="3px"
          bgGradient="linear(180deg, rgba(115, 152, 255, 0.15) 0%, rgba(56, 178, 172, 0.45) 100%)"
          transform="translateX(-50%)"
          borderRadius="full"
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}

      <VStack spacing={isCompact ? 10 : 16} align="stretch">
        {displayGroups.map((group, idx) => {
          const completedSteps = group.steps.filter(
            (step) => effectiveStep > step.index
          ).length;
          const totalSteps = group.steps.length;
          const status =
            effectiveStep > group.end
              ? "complete"
              : effectiveStep >= group.start
              ? "active"
              : "locked";
          const meta = statusMeta[status];
          const title =
            groupLabels?.[group.id]?.[userLanguage] ||
            groupLabels?.[group.id]?.en ||
            groupLabels?.[group.id] ||
            group.id;

          const optionalData = group.optional
            ? optionalQuestProgress?.[group.id]
            : null;
          let optionalStage = optionalData?.stage || "not-started";
          if (
            !optionalData &&
            group.optional &&
            effectiveStep > group.optional.index
          ) {
            optionalStage = "skipped";
          }
          const optionalDescriptor =
            optionalMeta[optionalStage] || optionalMeta["not-started"];
          const optionalProgress = clampProgress(
            optionalData?.progress ?? 0
          );
          const showProgress = typeof optionalData?.progress === "number";

          const isFocusedGroup = focusGroup && group.id === focusGroup;
          const isHighlightedGroup = highlightIndex
            ? group.steps.some((step) => step.index === highlightIndex)
            : false;

          const alignment = showOnlyFocus
            ? "center"
            : idx % 2 === 0
            ? "flex-start"
            : "flex-end";
          const spineOffset = idx % 2 === 0
            ? { left: "calc(50% + 12px)" }
            : { right: "calc(50% + 12px)" };

          const circleBorderColor = isHighlightedGroup
            ? "purple.400"
            : meta.accent;
          const circleBorderWidth = isHighlightedGroup
            ? "5px"
            : status === "active"
            ? "4px"
            : "2px";

          const cardBorder = isHighlightedGroup
            ? "1px solid rgba(128,90,213,0.4)"
            : isFocusedGroup
            ? "1px solid rgba(99,102,241,0.28)"
            : "1px solid rgba(226,232,240,0.6)";

          const cardShadow = isHighlightedGroup
            ? "0 20px 38px rgba(88, 28, 135, 0.22)"
            : meta.shadow;

          const badgeColorScheme =
            status === "locked"
              ? "gray"
              : isHighlightedGroup
              ? "purple"
              : "green";
          const badgeLabel =
            status === "locked"
              ? "Locked"
              : isHighlightedGroup
              ? "Up next"
              : status === "complete"
              ? "Done"
              : "Ready";

          return (
            <Flex
              key={group.id}
              justify={alignment}
              position="relative"
              minHeight="120px"
            >
              <MotionBox
                role={isInteractive ? "group" : undefined}
                onClick={() => handleSelect(group.start)}
                tabIndex={isInteractive ? 0 : undefined}
                onKeyDown={(event) => {
                  if (!isInteractive) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(group.start);
                  }
                }}
                cursor={isInteractive ? "pointer" : "default"}
                maxW={{ base: "78%", md: showOnlyFocus ? "72%" : "64%" }}
                whileHover={isInteractive ? { scale: 1.03 } : undefined}
                whileTap={isInteractive ? { scale: 0.97 } : undefined}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                aria-label={
                  isInteractive
                    ? `${title}: ${completedSteps} of ${totalSteps} lessons`
                    : undefined
                }
              >
                <MotionCircle
                  size={{ base: "68px", sm: isCompact ? "68px" : "76px" }}
                  bgGradient={meta.gradient}
                  color="white"
                  borderWidth={circleBorderWidth}
                  borderColor={circleBorderColor}
                  boxShadow={cardShadow}
                  animate={
                    status === "locked"
                      ? { y: 0 }
                      : { y: [-8, 0, -8] }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={meta.icon} boxSize={{ base: 6, sm: 7 }} />
                </MotionCircle>

                <Box
                  mt={4}
                  p={isCompact ? 3 : 4}
                  borderRadius="2xl"
                  bg="white"
                  boxShadow={cardShadow}
                  border={cardBorder}
                >
                  <HStack
                    justify="space-between"
                    align="flex-start"
                    spacing={4}
                    flexWrap="wrap"
                  >
                    <Box>
                      <Text
                        fontSize="xs"
                        textTransform="uppercase"
                        color="gray.500"
                        letterSpacing="0.08em"
                      >
                        {meta.label}
                      </Text>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        lineHeight="1.2"
                        mt={1}
                      >
                        {title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        {completedSteps}/{totalSteps} lessons completed
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={badgeColorScheme}
                      alignSelf="flex-start"
                    >
                      {badgeLabel}
                    </Badge>
                  </HStack>

                  {group.optional && (
                    <Box
                      mt={4}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={`${optionalDescriptor.colorScheme}.200`}
                      bg={`${optionalDescriptor.colorScheme}.50`}
                      p={3}
                      onClick={(event) => {
                        if (!isInteractive) {
                          return;
                        }
                        event.stopPropagation();
                        handleSelect(group.optional.index);
                      }}
                      onKeyDown={(event) => {
                        if (!isInteractive) {
                          return;
                        }
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          handleSelect(group.optional.index);
                        }
                      }}
                      tabIndex={isInteractive ? 0 : undefined}
                      role={isInteractive ? "button" : undefined}
                      aria-label={
                        isInteractive
                          ? `${group.optional.title} – ${optionalDescriptor.label}`
                          : undefined
                      }
                    >
                      <HStack spacing={3} align="center" justify="space-between">
                        <HStack spacing={3} align="center">
                          <Circle
                            size="32px"
                            bg={`${optionalDescriptor.colorScheme}.100`}
                            color={`${optionalDescriptor.colorScheme}.500`}
                          >
                            <Icon
                              as={
                                group.optional.isConversationReview
                                  ? FiFlag
                                  : FiStar
                              }
                              boxSize={4}
                            />
                          </Circle>
                          <Box>
                            <Text fontWeight="medium" fontSize="sm">
                              {group.optional.title}
                            </Text>
                            <Text
                              fontSize="xs"
                              color={`${optionalDescriptor.colorScheme}.600`}
                            >
                              {optionalDescriptor.label}
                              {showProgress
                                ? ` • ${Math.round(optionalProgress * 100)}%`
                                : ""}
                            </Text>
                          </Box>
                        </HStack>
                        <Button
                          size="xs"
                          colorScheme={optionalDescriptor.colorScheme}
                          variant={
                            optionalStage === "skipped" ? "outline" : "solid"
                          }
                          onClick={(event) => {
                            if (!isInteractive) {
                              return;
                            }
                            event.stopPropagation();
                            handleSelect(group.optional.index);
                          }}
                          isDisabled={!isInteractive}
                        >
                          {optionalDescriptor.cta}
                        </Button>
                      </HStack>
                    </Box>
                  )}
                </Box>
              </MotionBox>

              {showSpine && idx < displayGroups.length - 1 && (
                <MotionBox
                  position="absolute"
                  top="calc(50% + 38px)"
                  {...spineOffset}
                  width="2px"
                  height={isCompact ? "80px" : "100px"}
                  bgGradient="linear(180deg, rgba(56, 189, 248, 0.3) 0%, rgba(45, 212, 191, 0.6) 100%)"
                  borderRadius="full"
                  {...connectorAnimation}
                  transformOrigin="top"
                  aria-hidden
                />
              )}
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SkillTreeBoard;
