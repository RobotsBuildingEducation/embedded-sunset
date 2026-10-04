import BottomActionBar from "../BottomActionBar/BottomActionBar.jsx";
import { watchedSeconds } from "../../achievements/codingProgress.js";
import { awardRobotsProgress } from "../../utility/robotsAchievementProgress.js";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Link,
  useToast,
  Heading,
  Code,
  UnorderedList,
  VStack,
  HStack,
  Icon,
  OrderedList,
  CloseButton,
} from "@chakra-ui/react";
import { steps } from "../../utility/content";
import { videoTranscript } from "../../utility/transcript";
import { useSharedNostr } from "../../hooks/useNOSTR";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import { translation } from "../../utility/translation";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { isInlineMarkdownCode } from "../../utility/markdownCode";
import { PracticeModule } from "../PracticeModule/PracticeModule";
import { CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import CloudTransition from "../../elements/CloudTransition";
import { useNavigate } from "react-router-dom";
import {
  FadeInComponent,
  RiseUpAnimation,
} from "../../elements/RandomCharacter";

const newTheme = {
  h1: (props) => (
    <Heading as="h4" mt={6} size="md" color="inherit" {...props} />
  ),
  h2: (props) => (
    <Heading as="h4" mt={6} size="md" color="inherit" {...props} />
  ),
  h3: (props) => (
    <Heading as="h4" mt={6} size="md" color="inherit" {...props} />
  ),
  h4: (props) => (
    <Heading as="h4" mt={6} size="md" color="inherit" {...props} />
  ),
  h5: (props) => (
    <Heading as="h4" mt={6} size="md" color="inherit" {...props} />
  ),
  h6: (props) => (
    <Heading as="h4" mt={6} size="md" color="inherit" {...props} />
  ),
  p: (props) => <Text mb={2} color="inherit" {...props} />,
  text: (props) => <Text as="span" color="inherit" {...props} />,
  strong: (props) => <Box as="strong" color="inherit" {...props} />,
  a: (props) => <Link color="#90CDF4" textDecoration="underline" {...props} />,
  code: ({ node, inline, className, children, ...props }) => {
    const content = Array.isArray(children)
      ? children.join("")
      : String(children);
    const isInline = isInlineMarkdownCode({
      inline,
      className,
      children,
      node,
    });

    if (isInline) {
      return (
        <Code
          p={1}
          borderRadius={8}
          display="inline"
          fontFamily={"Fira code, Fira Mono, monospace"}
          fontSize="xs"
          {...props}
        >
          {children}
        </Code>
      );
    }

    return (
      <Box
        as="pre"
        fontFamily={"Fira code, Fira Mono, monospace"}
        fontSize="xs"
        p={3}
        borderRadius={8}
        {...props}
      >
        <Code
          p={6}
          display="block"
          wordBreak="break-word"
          fontSize="sm"
          overflowX="scroll"
        >
          {children}
        </Code>
      </Box>
    );
  },
};

const REVIEW_TEXT_COLOR = "#F7FAFC";
const reviewAccordionButtonStyles = {
  border: "1px solid transparent",
  height: "100%",
  padding: "40px",
  color: REVIEW_TEXT_COLOR,
  bg: "rgba(5,8,21,0.42)",
  transition: "background-color 160ms ease, border-color 160ms ease",
  _hover: {
    bg: "rgba(12,21,40,0.96)",
    color: REVIEW_TEXT_COLOR,
    borderColor: "rgba(144,205,244,0.48)",
  },
  _focusVisible: {
    bg: "rgba(12,21,40,0.96)",
    color: REVIEW_TEXT_COLOR,
    borderColor: "#90CDF4",
    boxShadow: "0 0 0 3px rgba(144,205,244,0.28)",
  },
  _expanded: {
    bg: "rgba(12,21,40,0.82)",
    color: REVIEW_TEXT_COLOR,
  },
};

const ProgressDisplay = ({
  videoWatched,
  summaryViewed,
  practiceCompleted,
}) => {
  return (
    <FadeInComponent speed="1s">
      <Box mb={4} p={4} bg="whiteAlpha.200" borderRadius="md" color="white">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          To earn a chapter review achievement
        </Text>
        <VStack align="start" spacing={2}>
          <HStack>
            <Icon
              as={videoWatched ? CheckCircleIcon : TimeIcon}
              color={videoWatched ? "#07fc92" : "gray.400"}
            />
            <Text>Watch Video Lecture</Text>
          </HStack>
          <HStack>
            <Icon
              as={summaryViewed ? CheckCircleIcon : TimeIcon}
              color={summaryViewed ? "#07fc92" : "gray.400"}
            />
            <Text>Review Summary</Text>
          </HStack>
          <HStack>
            <Icon
              as={practiceCompleted ? CheckCircleIcon : TimeIcon}
              color={practiceCompleted ? "#07fc92" : "gray.400"}
            />
            <Text>Complete Practice Module</Text>
          </HStack>
        </VStack>
      </Box>
    </FadeInComponent>
  );
};

const ProgressDisplayBottom = ({
  videoWatched,
  summaryViewed,
  practiceCompleted,
}) => {
  return (
    <Box mb={4} p={4} bg="whiteAlpha.200" borderRadius="md" color="white">
      <HStack display="flex" justify={"space-around"} spacing={2}>
        <HStack>
          <Icon
            as={videoWatched ? CheckCircleIcon : TimeIcon}
            color={videoWatched ? "#07fc92" : "gray.400"}
          />
          <Text>Video </Text>
        </HStack>
        <HStack>
          <Icon
            as={summaryViewed ? CheckCircleIcon : TimeIcon}
            color={summaryViewed ? "#07fc92" : "gray.400"}
          />
          <Text>Summary</Text>
        </HStack>
        <HStack>
          <Icon
            as={practiceCompleted ? CheckCircleIcon : TimeIcon}
            color={practiceCompleted ? "#07fc92" : "gray.400"}
          />
          <Text>Practice </Text>
        </HStack>
      </HStack>
    </Box>
  );
};

const LectureModal = ({
  isOpen,
  onClose,
  currentStep,
  userLanguage,
  handleNextClick,
}) => {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceReview = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try { await handleNextClick(); onClose(); } finally { setIsAdvancing(false); }
  };
  let navigate = useNavigate();
  const { getLastNotesByNpub } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec"),
  );
  const toast = useToast();
  const [hasViewedSummary, setHasViewedSummary] = useState(false);
  const [hasPracticedModule, setHasPracticedModule] = useState(false);
  const [videoDurationDetection, setVideoDurationDetection] = useState(false);

  const videoRef = useRef(null);
  const viewedRangesRef = useRef([]);
  const lastVideoTimeRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const step = steps[userLanguage][currentStep];

  const transcriptObject =
    step.group === "introduction"
      ? videoTranscript["tutorial"]
      : videoTranscript[step.group];

  useEffect(() => {
    async function getProgress() {
      try {
        const npub = localStorage.getItem("local_npub");
        if (npub) {
          const userDocRef = doc(database, "users", npub);
          const userSnapshot = await getDoc(userDocRef);
          const userData = userSnapshot.data();

          let stepGroup = step.group;
          if (stepGroup === "introduction") {
            stepGroup = "tutorial";
          }

          const currentProgress = userData.moduleProgressByCourse?.[userLanguage]?.[stepGroup] || {
            videoWatched: false,
            summaryViewed: false,
            practiceCompleted: false,
          };

          setVideoDurationDetection(currentProgress.videoWatched || false);
          setHasViewedSummary(currentProgress.summaryViewed || false);
          setHasPracticedModule(currentProgress.practiceCompleted || false);
        } else {
          console.error("No npub found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    }

    if (isOpen) {
      getProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.paused || video.seeking) return;
    const previous = lastVideoTimeRef.current;
    const next = video.currentTime;
    if (previous !== null && next > previous && next - previous <= 2) viewedRangesRef.current.push([previous, next]);
    lastVideoTimeRef.current = next;
  };
  const handleVideoEnded = () => {
    const video = videoRef.current;
    const watched = watchedSeconds(viewedRangesRef.current);
    if (!Number.isFinite(video?.duration) || video.duration <= 0 || watched < video.duration * 0.95) return;
    const npub = localStorage.getItem("local_npub");
    const group = step.group === "introduction" ? "tutorial" : String(step.group);
    void awardRobotsProgress({ npub, course: userLanguage, courseSteps: steps[userLanguage],
      events: [{ metric: "review_videos", id: `${userLanguage}:${group}` }],
    }).catch(error => console.warn("Video achievement:", error));
  };
  useEffect(() => { viewedRangesRef.current = []; lastVideoTimeRef.current = null; }, [userLanguage, step.group]);

  const handlePlay = () => {
    setIsVideoPlaying(true);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let periodicCheckInterval;

    const handlePause = () => {
      setIsVideoPlaying(false);
      if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
      }
    };

    const checkVideoProgress = async () => {
      if (!videoElement || videoDurationDetection) return;

      const ninetyPercentDuration = videoElement.duration * 0.9;

      if (
        videoElement.currentTime >= ninetyPercentDuration &&
        !videoDurationDetection
      ) {
        setVideoDurationDetection(true);
        if (periodicCheckInterval) {
          clearInterval(periodicCheckInterval);
        }

        checkAndUpdateProgress();
      }
    };

    const handleMetadataLoaded = () => {
      // duration available
    };

    periodicCheckInterval = setInterval(() => {
      checkVideoProgress();
    }, 10000);

    videoElement.addEventListener("loadedmetadata", handleMetadataLoaded);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("ended", handlePause);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleMetadataLoaded);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
      }
      videoElement.removeEventListener("ended", handlePause);
    };
  }, [videoDurationDetection, isVideoPlaying]);

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
          color="appToastColor"
          p={3}
          bg="appToastBg"
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

  const checkAndUpdateProgress = async () => {
    try {
      const npub = localStorage.getItem("local_npub");
      if (!npub) {
        console.error("No npub found in localStorage");
        return;
      }

      const userDocRef = doc(database, "users", npub);
      const userSnapshot = await getDoc(userDocRef);
      const userData = userSnapshot.data();

      let stepGroup = step.group;
      if (stepGroup === "introduction") {
        stepGroup = "tutorial";
      }

      const currentProgress = userData.moduleProgressByCourse?.[userLanguage]?.[stepGroup] || {
        videoWatched: false,
        summaryViewed: false,
        practiceCompleted: false,
      };

      const updatedModuleProgress = {
        ...currentProgress,
        videoWatched: videoDurationDetection || currentProgress.videoWatched,
        summaryViewed: hasViewedSummary || currentProgress.summaryViewed,
        practiceCompleted:
          hasPracticedModule || currentProgress.practiceCompleted,
      };

      const updatedProgress = {
        ...userData.moduleProgress,
        [stepGroup]: updatedModuleProgress,
      };

      await updateDoc(userDocRef, {
        moduleProgress: updatedProgress,
        [`moduleProgressByCourse.${userLanguage}.${stepGroup}`]: updatedModuleProgress,
      });

      if (updatedModuleProgress.videoWatched && updatedModuleProgress.summaryViewed && updatedModuleProgress.practiceCompleted) {
        void awardRobotsProgress({ npub, course: userLanguage, courseSteps: steps[userLanguage],
          events: [{ metric: "review_checklists", id: `${userLanguage}:${stepGroup}` }],
        }).catch(error => console.warn("Checklist achievement:", error));
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleSummaryView = () => {
    setHasViewedSummary(true);
  };

  const handlePracticeComplete = () => {
    setHasPracticedModule(true);
  };

  useEffect(() => {
    if (videoDurationDetection) {
      checkAndUpdateProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoDurationDetection]);

  useEffect(() => {
    if (hasViewedSummary) {
      checkAndUpdateProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasViewedSummary]);

  useEffect(() => {
    if (hasPracticedModule) {
      checkAndUpdateProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPracticedModule]);

  if (!isOpen) return null;

  return (
    <CloudTransition clonedStep="night" isActive={isOpen} showContinueButton={false}>
      {/* <Heading as="h1" color="purple">
        Module Review
      </Heading> */}
      <Box p={4} color={REVIEW_TEXT_COLOR}>
        <Box
          p={4}
          borderColor="transparent"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        ></Box>

        <Box>
          <Accordion allowToggle mb={4} border="1px solid transparent">
            <AccordionItem>
              <AccordionPanel pb={4}>
                <Box>
                  {translation[userLanguage]["tutorModal.instructions.1.66"]}
                </Box>
                <br />
                <Box>
                  {translation[userLanguage]["tutorModal.instructions.2"]}
                  <OrderedList ml={8}>
                    <li>
                      {translation[userLanguage]["tutorModal.instructions.3"]}
                    </li>
                    <li>
                      {translation[userLanguage]["tutorModal.instructions.4"]}
                    </li>
                  </OrderedList>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Box mb={4}>
            <ProgressDisplay
              videoWatched={videoDurationDetection}
              summaryViewed={hasViewedSummary}
              practiceCompleted={hasPracticedModule}
            />

            <Box display="flex" justifyContent={"center"}>
              <RiseUpAnimation speed="0.75s">
                <video
                  poster="https://res.cloudinary.com/dtkeyccga/image/upload/v1706481474/Untitled_Desktop_Wallpaper_qrpmgm.png"
                  style={{
                    width: "100%",
                    maxWidth: 350,
                    height: "100%",
                    borderRadius: "30px",
                    boxShadow:
                      "0px 10px 20px rgba(0,0,0,1), 0px 6px 6px rgba(0,0,0,1)",
                    // marginTop: 8,
                  }}
                  controls
                  autoPlay={false}
                  ref={videoRef}
                  playsInline
                  onPlay={handlePlay}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onSeeking={() => { lastVideoTimeRef.current = null; }}
                  onEnded={handleVideoEnded}
                >
                  <source src={transcriptObject.videoSrc} type="video/mp4" />
                  <source src={transcriptObject.videoSrc} type="video/mov" />
                  Your browser does not support the video tag.
                </video>
              </RiseUpAnimation>
            </Box>

            <Accordion allowToggle mb={4} mt={6}>
              <AccordionItem
                border="1px solid transparent"
                borderBottom="1px solid #3f4247"
              >
                <h2>
                  <AccordionButton
                    {...reviewAccordionButtonStyles}
                    onMouseDown={handleSummaryView}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSummaryView();
                      }
                    }}
                  >
                    <Box flex="1" textAlign="left">
                      Summary
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  textAlign="left"
                  color={REVIEW_TEXT_COLOR}
                >
                  <Markdown
                    components={ChakraUIRenderer(newTheme)}
                    children={
                      translation[userLanguage][
                        `video.summary.${
                          step.group === "introduction"
                            ? "tutorial"
                            : step.group
                        }`
                      ]
                    }
                  />
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px solid transparent">
                <h2>
                  <AccordionButton {...reviewAccordionButtonStyles}>
                    <Box textAlign="left">Practice</Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} p={0} color={REVIEW_TEXT_COLOR}>
                  <PracticeModule
                    currentTranscript={transcriptObject}
                    userLanguage={userLanguage}
                    onPracticeComplete={() => {
                      handlePracticeComplete();
                    }}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Box>

        <ProgressDisplayBottom
          videoWatched={videoDurationDetection}
          summaryViewed={hasViewedSummary}
          practiceCompleted={hasPracticedModule}
        />

        <BottomActionBar currentStep={currentStep} step={step} steps={steps} userLanguage={userLanguage}
          translation={translation} isCorrect={null} feedback="" layer={2100}
          primaryAction={{ label: translation[userLanguage]?.["app.button.nextQuestion"] || "Next", loading: isAdvancing, onClick: advanceReview }} />
      </Box>
    </CloudTransition>
  );
};

export default React.memo(LectureModal);
