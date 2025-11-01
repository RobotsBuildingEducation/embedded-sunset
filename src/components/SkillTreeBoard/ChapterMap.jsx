import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRightCircle } from "react-icons/fi";
import SkillTreeBoard from "./SkillTreeBoard";
import { skillTreeGroupLabels } from "./groupLabels";

const parseStepFromQuery = (search) => {
  try {
    const params = new URLSearchParams(search);
    const value = params.get("step");
    if (value === null) {
      return null;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    console.error("Failed to parse chapter map query", error);
    return null;
  }
};

const ChapterMap = ({
  steps,
  userLanguage,
  optionalQuestProgress,
  onStartChapter,
  groupLabels = skillTreeGroupLabels,
}) => {
  const { groupId: rawGroupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = rawGroupId ? decodeURIComponent(rawGroupId) : null;

  const stepList = useMemo(() => steps?.[userLanguage] || [], [steps, userLanguage]);

  const groupSteps = useMemo(
    () =>
      stepList
        .map((step, index) => ({ ...step, index }))
        .filter((item) => item.group === groupId),
    [groupId, stepList]
  );

  const defaultStepIndex = groupSteps.length ? groupSteps[0].index : 0;
  const requestedStep = parseStepFromQuery(location.search);

  const initialStep = useMemo(() => {
    if (
      typeof requestedStep === "number" &&
      groupSteps.some((item) => item.index === requestedStep)
    ) {
      return requestedStep;
    }
    return defaultStepIndex;
  }, [defaultStepIndex, groupSteps, requestedStep]);

  const [selectedStep, setSelectedStep] = useState(initialStep);

  useEffect(() => {
    setSelectedStep(initialStep);
  }, [initialStep]);

  const chapterLabel = useMemo(() => {
    const entry = groupLabels?.[groupId];
    if (!entry) {
      return groupId || "";
    }
    if (typeof entry === "string") {
      return entry;
    }
    return entry?.[userLanguage] || entry?.en || groupId;
  }, [groupId, groupLabels, userLanguage]);

  const optionalState = optionalQuestProgress?.[groupId];

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleStart = useCallback(() => {
    const targetIndex = Number.isFinite(selectedStep)
      ? selectedStep
      : defaultStepIndex;

    if (typeof onStartChapter === "function") {
      onStartChapter(groupId, targetIndex);
    } else {
      navigate(`/q/${targetIndex}`);
    }
  }, [defaultStepIndex, groupId, navigate, onStartChapter, selectedStep]);

  const onNodeSelect = useCallback((index) => {
    if (!Number.isFinite(index)) {
      return;
    }
    setSelectedStep(index);
  }, []);

  if (!groupId || groupSteps.length === 0) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(180deg, rgba(237,233,254,0.6) 0%, rgba(255,255,255,0.9) 100%)"
        px={6}
      >
        <VStack
          spacing={6}
          maxW="480px"
          w="100%"
          bg="white"
          borderRadius="2xl"
          border="1px solid rgba(128,90,213,0.15)"
          boxShadow="0 18px 40px rgba(88, 28, 135, 0.12)"
          p={10}
          textAlign="center"
        >
          <Heading size="md" color="purple.600">
            Chapter map unavailable
          </Heading>
          <Text color="purple.500" fontSize="sm">
            We couldn’t find that chapter. Please return to the previous screen and try again.
          </Text>
          <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="purple"
            variant="outline"
            onClick={handleBack}
          >
            Go back
          </Button>
        </VStack>
      </Box>
    );
  }

  const previewSteps = useMemo(() => {
    const withinChapter = groupSteps.map((item) => ({
      index: item.index,
      title: item.title,
      type: item.type,
    }));
    const focusPosition = withinChapter.findIndex((item) => item.index === selectedStep);
    const start = Math.max(0, focusPosition - 1);
    const end = Math.min(withinChapter.length, start + 4);
    return withinChapter.slice(start, end);
  }, [groupSteps, selectedStep]);

  return (
    <Box
      minH="100vh"
      bgGradient="linear(180deg, rgba(237,233,254,0.8) 0%, rgba(255,255,255,0.95) 100%)"
      px={{ base: 4, md: 8 }}
      py={{ base: 8, md: 12 }}
      display="flex"
      justifyContent="center"
    >
      <VStack
        maxW="720px"
        w="100%"
        spacing={8}
        align="stretch"
        bg="rgba(255,255,255,0.92)"
        borderRadius="3xl"
        border="1px solid rgba(128,90,213,0.18)"
        boxShadow="0 24px 60px rgba(79, 70, 229, 0.18)"
        p={{ base: 6, md: 10 }}
      >
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={2} maxW="75%">
            <Button
              onClick={handleBack}
              size="sm"
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              colorScheme="purple"
              mb={2}
            >
              Back
            </Button>
            <Heading size="lg" color="purple.600">
              {chapterLabel}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Preview the path ahead for this chapter before you dive in. Select a node to focus on a lesson and press start when you’re ready.
            </Text>
            {optionalState ? (
              <Badge colorScheme="purple" borderRadius="full" px={3} py={1} fontSize="0.65rem">
                Side quest status: {optionalState.stage || "not-started"}
              </Badge>
            ) : null}
          </VStack>
          <Button
            colorScheme="purple"
            rightIcon={<FiArrowRightCircle />}
            borderRadius="full"
            onClick={handleStart}
          >
            Start
          </Button>
        </HStack>

        <SkillTreeBoard
          steps={steps}
          userLanguage={userLanguage}
          currentStep={selectedStep}
          activeStep={selectedStep}
          highlightStep={selectedStep}
          focusGroup={groupId}
          showOnlyFocus
          optionalQuestProgress={optionalQuestProgress}
          groupLabels={groupLabels}
          onNodeSelect={onNodeSelect}
          isInteractive
        />

        <Box
          borderRadius="2xl"
          border="1px solid rgba(128,90,213,0.1)"
          bg="rgba(247, 245, 255, 0.6)"
          p={{ base: 4, md: 6 }}
        >
          <Text fontSize="sm" fontWeight="semibold" color="purple.600" mb={3}>
            Upcoming checkpoints
          </Text>
          <VStack align="stretch" spacing={3}>
            {previewSteps.map((item, idx) => {
              const isSelected = item.index === selectedStep;
              return (
                <HStack
                  key={item.index}
                  spacing={3}
                  align="center"
                  bg={isSelected ? "rgba(128,90,213,0.12)" : "white"}
                  borderRadius="lg"
                  border="1px solid rgba(128,90,213,0.18)"
                  boxShadow={isSelected ? "0 12px 24px rgba(79, 70, 229, 0.16)" : "none"}
                  px={4}
                  py={3}
                >
                  <Badge colorScheme={isSelected ? "purple" : "gray"} borderRadius="full">
                    #{item.index}
                  </Badge>
                  <VStack align="flex-start" spacing={0} flex={1}>
                    <Text fontWeight={isSelected ? "bold" : "semibold"} color="purple.700" fontSize="sm">
                      {item.title || `Question ${item.index}`}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {item.type || (idx === 0 ? "Warm-up" : "Lesson")}
                    </Text>
                  </VStack>
                  <Button
                    size="xs"
                    variant={isSelected ? "solid" : "ghost"}
                    colorScheme="purple"
                    onClick={() => setSelectedStep(item.index)}
                  >
                    Focus
                  </Button>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ChapterMap;
