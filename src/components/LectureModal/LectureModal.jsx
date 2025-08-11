import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Text,
  Box,
  Image,
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
import { PracticeModule } from "../PracticeModule/PracticeModule";
import { CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import CloudTransition from "../../elements/CloudTransition";
import { useNavigate } from "react-router-dom";
import {
  FadeInComponent,
  PanRightComponent,
  RiseUpAnimation,
} from "../../elements/RandomCharacter";

const newTheme = {
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h4: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h5: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h6: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ node, inline, className, children, ...props }) => {
    const content = Array.isArray(children)
      ? children.join("")
      : String(children);
    const isSingleWord = content.trim().split(/\s+/).length === 1;

    if (isSingleWord) {
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

const ProgressDisplay = ({
  videoWatched,
  summaryViewed,
  practiceCompleted,
}) => {
  return (
    <FadeInComponent speed="1s">
      <Box mb={4} p={4} bg="whiteAlpha.200" borderRadius="md" color="white">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          To earn a chapter review badge
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

const LectureModal = ({ isOpen, onClose, currentStep, userLanguage }) => {
  let navigate = useNavigate();
  const { getLastNotesByNpub, assignExistingBadgeToNpub } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  const toast = useToast();
  const [badges, setBadges] = useState([]);
  const [areBadgesLoading, setAreBadgesLoading] = useState(true);
  const { getUserBadges } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  const [hasViewedSummary, setHasViewedSummary] = useState(false);
  const [hasPracticedModule, setHasPracticedModule] = useState(false);
  const [videoDurationDetection, setVideoDurationDetection] = useState(false);

  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const step = steps[userLanguage][currentStep];

  const transcriptObject =
    step.group === "introduction"
      ? videoTranscript["tutorial"]
      : videoTranscript[step.group];

  const getBadges = async () => {
    const data = await getUserBadges();
    setBadges(data);
    setAreBadgesLoading(false);
  };

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

          const currentProgress = userData.moduleProgress?.[stepGroup] || {
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
      getBadges();
    } else {
      setAreBadgesLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const extractImageSources = (transcriptData) => {
    let images = [];
    if (transcriptData.tutorial?.imgSrc) {
      images.push({
        imageLink: transcriptData.tutorial.imgSrc,
        badgeLink: `https://badges.page/a/${transcriptData.tutorial.address}`,
      });
    }

    const numericKeys = Object.keys(transcriptData)
      .filter((key) => !isNaN(key))
      .sort((a, b) => Number(a) - Number(b));

    numericKeys.forEach((key) => {
      if (transcriptData[key]?.imgSrc) {
        images.push({
          imageLink: transcriptData[key].imgSrc,
          badgeLink: `https://badges.page/a/${transcriptData[key].address}`,
        });
      }
    });

    return images;
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
        <Box color="black" p={3} bg="#FEEBC8" borderRadius="md" boxShadow="lg">
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

      const currentProgress = userData.moduleProgress?.[stepGroup] || {
        videoWatched: false,
        summaryViewed: false,
        practiceCompleted: false,
        badgeAwarded: false,
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
      });

      if (
        updatedModuleProgress.videoWatched &&
        updatedModuleProgress.summaryViewed &&
        updatedModuleProgress.practiceCompleted &&
        !updatedModuleProgress.badgeAwarded
      ) {
        updatedModuleProgress.badgeAwarded = true;

        const updatedProgressWithBadge = {
          ...userData.moduleProgress,
          [stepGroup]: updatedModuleProgress,
        };

        await updateDoc(userDocRef, {
          moduleProgress: updatedProgressWithBadge,
        });

        toast({
          title: "Badge awarded",
          description: `Great job! You've earned the ${transcriptObject.name} badge on your decentralized transcript!`,
          status: "success",
          duration: 3000,
          position: "top",
          isClosable: true,
        });

        await assignExistingBadgeToNpub(
          transcriptObject.name.replace(/ /g, "-")
        );
        getBadges();
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

  const badgeImages = extractImageSources(videoTranscript);

  // ---- Progressive badge reveal (smooth trail) ----
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    if (!isOpen) return;

    setVisibleCount(0); // restart when opening
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisibleCount((prev) => (prev < badgeImages.length ? i : prev));
      if (i >= badgeImages.length) clearInterval(id);
    }, 120); // delay between each badge (ms)

    return () => clearInterval(id);
  }, [isOpen, badgeImages.length]);
  // -------------------------------------------------

  if (!isOpen) return null;

  return (
    <CloudTransition clonedStep="night" isActive={isOpen}>
      {/* <Heading as="h1" color="purple">
        Module Review
      </Heading> */}
      <Box p={4} color="white">
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
            <Box display="flex" flexDirection="row">
              <br />
              {badgeImages.slice(0, visibleCount).map((bdge, index) => {
                const isBadgeEarned = badges.some(
                  (badge) => badge.image === bdge.imageLink
                );

                return (
                  <PanRightComponent key={bdge.imageLink ?? index}>
                    <Box position="relative" m={1} mb={4}>
                      <Link href={bdge.badgeLink} target="_blank">
                        <Image
                          src={bdge.imageLink}
                          loading="lazy"
                          decoding="async"
                          width="60px"
                          borderRadius="20px"
                          alt={`Badge ${index + 1}`}
                          style={{
                            transition:
                              "opacity 240ms ease, transform 240ms ease",
                          }}
                          boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
                        />
                      </Link>
                      {!isBadgeEarned && (
                        <Link href={bdge.badgeLink} target="_blank">
                          <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bg="white"
                            opacity="0.7"
                            borderRadius="20px"
                          />
                        </Link>
                      )}
                    </Box>
                  </PanRightComponent>
                );
              })}
            </Box>

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
                    border="1px solid transparent"
                    height="100%"
                    padding="40px"
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
                <AccordionPanel pb={4} textAlign={"left"}>
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
                  <AccordionButton
                    border="1px solid transparent"
                    height="100%"
                    padding="40px"
                  >
                    <Box textAlign="left">Practice</Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} p={0}>
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

        <Box p={4} display="flex" justifyContent="flex-end" alignItems="center">
          <Button
            mt={4}
            onMouseDown={() => {
              navigate(`/q/${currentStep + 1}`);
              onClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/q/${currentStep + 1}`);
                onClose();
              }
            }}
            variant="solid"
            size="lg"
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
          >
            Next
          </Button>
        </Box>
      </Box>
    </CloudTransition>
  );
};

export default LectureModal;
