import React, { useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Icon,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiCircle, FiFlag, FiTarget } from "react-icons/fi";

const MotionBox = motion(Box);

const clampProgress = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

const statusMeta = {
  complete: {
    color: "green.400",
    badge: "success",
    icon: FiCheckCircle,
    label: "Completed",
    bg: "green.50",
  },
  active: {
    color: "yellow.500",
    badge: "yellow",
    icon: FiTarget,
    label: "In progress",
    bg: "orange.50",
  },
  locked: {
    color: "gray.400",
    badge: "gray",
    icon: FiCircle,
    label: "Locked",
    bg: "white",
  },
};

const optionalMeta = {
  "not-started": {
    color: "gray.400",
    icon: FiFlag,
    label: "Optional quest available",
    scheme: "gray",
  },
  build: {
    color: "orange.400",
    icon: FiTarget,
    label: "Prototype in progress",
    scheme: "orange",
  },
  conversation: {
    color: "purple.400",
    icon: FiTarget,
    label: "Conversation ready",
    scheme: "purple",
  },
  chatting: {
    color: "purple.400",
    icon: FiTarget,
    label: "Conversation underway",
    scheme: "purple",
  },
  complete: {
    color: "green.500",
    icon: FiCheckCircle,
    label: "Optional quest complete",
    scheme: "green",
  },
  skipped: {
    color: "gray.400",
    icon: FiFlag,
    label: "Not started yet",
    scheme: "gray",
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
    const map = new Map();

    list.forEach((step, idx) => {
      if (!step || idx === 0) {
        return;
      }

      const id = step.group || `group-${idx}`;
      if (!map.has(id)) {
        map.set(id, {
          id,
          steps: [],
          start: idx,
          end: idx,
          optional: null,
        });
      }

      const entry = map.get(id);
      entry.steps.push({ ...step, index: idx });
      entry.start = Math.min(entry.start, idx);
      entry.end = Math.max(entry.end, idx);
      if (step.isConversationReview) {
        entry.optional = { ...step, index: idx };
      }
    });

    return Array.from(map.values()).sort((a, b) => a.start - b.start);
  }, [steps, userLanguage]);

  const handleSelect = (stepIndex) => {
    if (typeof onNodeSelect === "function" && typeof stepIndex === "number") {
      onNodeSelect(stepIndex);
    }
  };

  if (!groups.length) {
    return (
      <Box borderRadius="lg" borderWidth="1px" p={6} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          No progress data available yet.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6} width="100%">
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

        const optionalData = group.optional
          ? optionalQuestProgress?.[group.id]
          : null;

        let optionalStage = optionalData?.stage || "not-started";
        if (!optionalData && group.optional && currentStep > group.optional.index) {
          optionalStage = "skipped";
        }

        const optionalProgress = clampProgress(optionalData?.progress ?? 0);
        const optionalDescriptor = optionalMeta[optionalStage] || optionalMeta["not-started"];

        return (
          <React.Fragment key={group.id}>
            <Box
              role="group"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={meta.color}
              bg={meta.bg}
              boxShadow={status === "active" ? "0 6px 16px rgba(251, 211, 141, 0.35)" : "sm"}
              transition="transform 0.2s ease, box-shadow 0.2s ease"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              p={4}
              cursor="pointer"
              onClick={() => handleSelect(group.start)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelect(group.start);
                }
              }}
              tabIndex={0}
            >
              <Flex align="center" justify="space-between">
                <HStack spacing={4} align="center">
                  <Circle size="48px" bg={`${meta.color}15`} color={meta.color}>
                    <Icon as={meta.icon} boxSize={5} />
                  </Circle>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {completedSteps}/{totalSteps} lessons completed
                    </Text>
                  </Box>
                </HStack>
                <Badge colorScheme={meta.badge} fontSize="0.75rem" textTransform="capitalize">
                  {meta.label}
                </Badge>
              </Flex>

              {group.optional && (
                <Box
                  mt={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                  bg="white"
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
                  cursor="pointer"
                  aria-label={`${group.optional.title} optional quest`}
                >
                  <Flex align="center" justify="space-between" mb={2}>
                    <HStack spacing={3} align="center">
                      <Circle size="36px" bg={`${optionalDescriptor.color}15`} color={optionalDescriptor.color}>
                        <Icon as={optionalDescriptor.icon} boxSize={4} />
                      </Circle>
                      <Box>
                        <Text fontWeight="medium" fontSize="sm">
                          {group.optional.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {optionalDescriptor.label}
                        </Text>
                      </Box>
                    </HStack>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme={optionalDescriptor.scheme === "gray" ? "gray" : optionalDescriptor.scheme}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelect(group.optional.index);
                      }}
                    >
                      Open
                    </Button>
                  </Flex>
                  <Progress
                    value={(optionalStage === "skipped" ? 0 : optionalProgress) * 100}
                    size="xs"
                    borderRadius="full"
                    colorScheme={optionalDescriptor.scheme === "gray" ? "gray" : optionalDescriptor.scheme}
                    backgroundColor="gray.100"
                  />
                </Box>
              )}
            </Box>
            {idx < groups.length - 1 && (
              <MotionBox
                height="4px"
                bg={status === "locked" ? "gray.200" : "green.200"}
                borderRadius="full"
                mx={{ base: 4, md: 10 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: status === "locked" ? 0.4 : 1 }}
                transformOrigin="left"
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </VStack>
  );
};

export default SkillTreeBoard;
