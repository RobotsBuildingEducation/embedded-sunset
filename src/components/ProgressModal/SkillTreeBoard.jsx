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
}) => {
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

  const handleSelect = (stepIndex) => {
    if (typeof onNodeSelect === "function" && typeof stepIndex === "number") {
      onNodeSelect(stepIndex);
    }
  };

  if (!groups.length) {
    return (
      <Box borderRadius="xl" borderWidth="1px" p={6} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          No progress data available yet.
        </Text>
      </Box>
    );
  }

  return (
    <Box position="relative" py={8} px={{ base: 2, sm: 6 }}>
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

      <VStack spacing={16} align="stretch">
        {groups.map((group, idx) => {
          const completedSteps = group.steps.filter((step) => currentStep > step.index).length;
          const totalSteps = group.steps.length;
          const status =
            currentStep > group.end
              ? "complete"
              : currentStep >= group.start
              ? "active"
              : "locked";
          const meta = statusMeta[status];
          const title =
            groupLabels?.[group.id]?.[userLanguage] ||
            groupLabels?.[group.id]?.en ||
            groupLabels?.[group.id] ||
            group.id;

          const optionalData = group.optional ? optionalQuestProgress?.[group.id] : null;
          let optionalStage = optionalData?.stage || "not-started";
          if (!optionalData && group.optional && currentStep > group.optional.index) {
            optionalStage = "skipped";
          }
          const optionalDescriptor = optionalMeta[optionalStage] || optionalMeta["not-started"];
          const optionalProgress = clampProgress(optionalData?.progress ?? 0);
          const showProgress = typeof optionalData?.progress === "number";

          const alignment = idx % 2 === 0 ? "flex-start" : "flex-end";
          const spineOffset = idx % 2 === 0 ? { left: "calc(50% + 12px)" } : { right: "calc(50% + 12px)" };

          return (
            <Flex key={group.id} justify={alignment} position="relative" minHeight="120px">
              <MotionBox
                role="group"
                onClick={() => handleSelect(group.start)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(group.start);
                  }
                }}
                cursor="pointer"
                maxW={{ base: "72%", md: "64%" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                aria-label={`${title}: ${completedSteps} of ${totalSteps} lessons`}
              >
                <MotionCircle
                  size={{ base: "68px", sm: "76px" }}
                  bgGradient={meta.gradient}
                  color="white"
                  borderWidth={status === "active" ? "4px" : "2px"}
                  borderColor={meta.accent}
                  boxShadow={meta.shadow}
                  animate={
                    status === "locked"
                      ? { y: 0 }
                      : { y: [-8, 0, -8] }
                  }
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={meta.icon} boxSize={{ base: 6, sm: 7 }} />
                </MotionCircle>

                <Box mt={4} p={4} borderRadius="2xl" bg="white" boxShadow="0 12px 30px rgba(15, 23, 42, 0.12)">
                  <HStack justify="space-between" align="flex-start" spacing={4}>
                    <Box>
                      <Text fontSize="xs" textTransform="uppercase" color="gray.500" letterSpacing="0.08em">
                        {meta.label}
                      </Text>
                      <Text fontWeight="bold" fontSize="lg" lineHeight="1.2" mt={1}>
                        {title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        {completedSteps}/{totalSteps} lessons completed
                      </Text>
                    </Box>
                    <Badge colorScheme={status === "locked" ? "gray" : "green"} alignSelf="flex-start">
                      {status === "locked" ? "Locked" : "Ready"}
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
                        event.stopPropagation();
                        handleSelect(group.optional.index);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          handleSelect(group.optional.index);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${group.optional.title} – ${optionalDescriptor.label}`}
                    >
                      <HStack spacing={3} align="center" justify="space-between">
                        <HStack spacing={3} align="center">
                          <Circle size="32px" bg={`${optionalDescriptor.colorScheme}.100`} color={`${optionalDescriptor.colorScheme}.500`}>
                            <Icon as={group.optional.isConversationReview ? FiFlag : FiStar} boxSize={4} />
                          </Circle>
                          <Box>
                            <Text fontWeight="medium" fontSize="sm">
                              {group.optional.title}
                            </Text>
                            <Text fontSize="xs" color={`${optionalDescriptor.colorScheme}.600`}>
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
                          variant={optionalStage === "skipped" ? "outline" : "solid"}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleSelect(group.optional.index);
                          }}
                        >
                          {optionalDescriptor.cta}
                        </Button>
                      </HStack>
                    </Box>
                  )}
                </Box>
              </MotionBox>

              {idx < groups.length - 1 && (
                <MotionBox
                  position="absolute"
                  top="calc(50% + 38px)"
                  {...spineOffset}
                  width="2px"
                  height="100px"
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
