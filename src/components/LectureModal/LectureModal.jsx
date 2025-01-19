import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
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
  ModalFooter,
  VStack,
  HStack,
  Icon,
  OrderedList,
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

const newTheme = {
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h4: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h5: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h6: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ node, inline, className, children, ...props }) => {
    // Detect if it's a single word or short phrase
    const content = Array.isArray(children)
      ? children.join("")
      : String(children);

    // Check if the content is a single word
    const isSingleWord = content.trim().split(/\s+/).length === 1;

    // Inline code styling
    if (isSingleWord) {
      return (
        <Code
          p={1}
          borderRadius={8}
          display="inline" // Prevent block display
          fontFamily={"Fira code, Fira Mono, monospace"}
          fontSize="xs"
          {...props}
        >
          {children}
        </Code>
      );
    }

    // Multi-line or multi-word code block styling
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
    <Box mb={4} p={4} bg="gray.50" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Module Progress:
      </Text>
      <VStack align="start" spacing={2}>
        <HStack>
          <Icon
            as={videoWatched ? CheckCircleIcon : TimeIcon}
            color={videoWatched ? "green.500" : "gray.400"}
          />
          <Text>Watch Video Lecture</Text>
        </HStack>
        <HStack>
          <Icon
            as={summaryViewed ? CheckCircleIcon : TimeIcon}
            color={summaryViewed ? "green.500" : "gray.400"}
          />
          <Text>Review Summary</Text>
        </HStack>
        <HStack>
          <Icon
            as={practiceCompleted ? CheckCircleIcon : TimeIcon}
            color={practiceCompleted ? "green.500" : "gray.400"}
          />
          <Text>Complete Practice Module</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

const LectureModal = ({ isOpen, onClose, currentStep, userLanguage }) => {
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

          // Update state variables based on fetched progress
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
  }, [isOpen]);
  const handlePlay = () => {
    console.log("xxx");

    setIsVideoPlaying(true);
  };
  useEffect(() => {
    const videoElement = videoRef.current;
    console.log("videoRef.current:", videoElement);
    if (!videoElement) return;

    let periodicCheckInterval;

    const handlePause = () => {
      console.log("Video paused!");
      setIsVideoPlaying(false);
      if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval); // Stop periodic checks when paused
      }
    };
    const checkVideoProgress = async () => {
      console.log("checking");

      if (!videoElement || videoDurationDetection) return;

      const ninetyPercentDuration = videoElement.duration * 0.9;

      console.log("running");
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
      console.log(`Video duration: ${videoElement.duration}`);
    };

    periodicCheckInterval = setInterval(() => {
      checkVideoProgress();
    }, 10000);
    videoElement.addEventListener("loadedmetadata", handleMetadataLoaded);

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("ended", handlePause);
    // videoElement.addEventListener("timeupdate", checkVideoProgress);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleMetadataLoaded);

      videoElement.removeEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
      }
      videoElement.removeEventListener("ended", handlePause);
      // videoElement.removeEventListener("timeupdate", checkVideoProgress);
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

      // Get current progress or initialize it
      const currentProgress = userData.moduleProgress?.[stepGroup] || {
        videoWatched: false,
        summaryViewed: false,
        practiceCompleted: false,
        badgeAwarded: false,
      };

      console.log("videoDurationDetection", videoDurationDetection);

      // Update the module progress for the current module
      const updatedModuleProgress = {
        ...currentProgress,
        videoWatched: videoDurationDetection || currentProgress.videoWatched,
        summaryViewed: hasViewedSummary || currentProgress.summaryViewed,
        practiceCompleted:
          hasPracticedModule || currentProgress.practiceCompleted,
      };

      // Create the updated moduleProgress object
      const updatedProgress = {
        ...userData.moduleProgress,
        [stepGroup]: updatedModuleProgress,
      };

      // Update the document with the new progress
      await updateDoc(userDocRef, {
        moduleProgress: updatedProgress,
      });

      // Check if all components are completed
      if (
        updatedModuleProgress.videoWatched &&
        updatedModuleProgress.summaryViewed &&
        updatedModuleProgress.practiceCompleted &&
        !updatedModuleProgress.badgeAwarded
      ) {
        // Award the badge
        console.log("awarding badge..");

        // Update badge awarded status
        updatedModuleProgress.badgeAwarded = true;

        // Update the moduleProgress with badgeAwarded = true
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
  }, [videoDurationDetection]);

  useEffect(() => {
    if (hasViewedSummary) {
      checkAndUpdateProgress();
    }
  }, [hasViewedSummary]);

  useEffect(() => {
    if (hasPracticedModule) {
      checkAndUpdateProgress();
    }
  }, [hasPracticedModule]);

  const badgeImages = extractImageSources(videoTranscript);

  // console.log(
  //   "Markdown content:",
  //   translation[userLanguage][
  //     `video.summary.${step.group === "introduction" ? "tutorial" : step.group}`
  //   ]
  // );

  // useEffect(() => {
  //   assignExistingBadgeToNpub(transcriptObject.name.replace(/ /g, "-"));
  // }, []);
  console.log("name", transcriptObject.name.replace(/ /g, "-"));
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader style={{ display: "flex", alignItems: "center" }}>
          {translation[userLanguage]["settings.button.yourTutor"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Accordion allowToggle mb={4}>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {translation[userLanguage]["instructions"]}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {/* <Button onClick={handleCopyKeys}>
                  🔑 {translation[userLanguage]["button.copyKey"]}
                </Button>
                <br /> */}
                {/* <br /> */}
                <Box>
                  {/* {translation[userLanguage]["tutorModal.instructions.1"]}
                  <Link
                    href="https://embedded-rox.app"
                    target="_blank"
                    style={{ textDecoration: "underline" }}
                  >
                    {translation[userLanguage]["tutorModal.instructions.1.33"]}
                  </Link> */}
                  {translation[userLanguage]["tutorModal.instructions.1.66"]}
                </Box>
                <br />
                <Box>
                  {translation[userLanguage]["tutorModal.instructions.2"]}
                  <OrderedList ml={8}>
                    <li>
                      {" "}
                      {translation[userLanguage]["tutorModal.instructions.3"]}
                    </li>
                    <li>
                      {" "}
                      {translation[userLanguage]["tutorModal.instructions.4"]}
                    </li>
                  </OrderedList>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          <Box mb={4}>
            <Box fontSize="sm">
              {translation[userLanguage]["transcriptBadges"]}
            </Box>
            <Box display="flex" flexDirection="row">
              <br />
              {badgeImages.map((bdge, index) => {
                const isBadgeEarned = badges.some(
                  (badge) => badge.image === bdge.imageLink
                );

                return (
                  <Box key={index} position="relative" m={1} mb={4}>
                    <Link href={bdge.badgeLink} target="_blank">
                      <Image
                        src={bdge.imageLink}
                        loading="lazy"
                        width="60px"
                        borderRadius="20px"
                        alt={`Badge ${index + 1}`}
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
                );
              })}
            </Box>

            <Box display="flex" justifyContent={"center"}>
              <video
                poster="https://res.cloudinary.com/dtkeyccga/image/upload/v1706481474/Untitled_Desktop_Wallpaper_qrpmgm.png"
                style={{
                  width: "100%",
                  maxWidth: 350,
                  height: "100%",
                  borderRadius: "30px",
                  boxShadow:
                    "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
                  marginTop: 8,
                }}
                controls
                autoPlay={false}
                ref={videoRef}
                playsInline
                onPlay={handlePlay} // Attach handlePlay to the play event
              >
                <source src={transcriptObject.videoSrc} type="video/mp4" />
                <source src={transcriptObject.videoSrc} type="video/mov" />
                Your browser does not support the video tag.
              </video>
            </Box>
            <Accordion allowToggle mb={4} mt={6}>
              <AccordionItem>
                <h2>
                  <AccordionButton
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
                <AccordionPanel pb={4}>
                  <Markdown
                    components={ChakraUIRenderer(newTheme)}
                    children={
                      translation[userLanguage][
                        `video.summary.${step.group === "introduction" ? "tutorial" : step.group}`
                      ]
                    }
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Practice
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <PracticeModule
                    currentTranscript={transcriptObject}
                    userLanguage={userLanguage}
                    onPracticeComplete={(moduleName) => {
                      handlePracticeComplete();
                    }}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="space-between"
          alignContent={"center"}
        >
          <ProgressDisplay
            videoWatched={videoDurationDetection}
            summaryViewed={hasViewedSummary}
            practiceCompleted={hasPracticedModule}
          />
          <Button
            mt={4}
            onMouseDown={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
            variant="solid"
            size="lg"
            boxShadow={"0px 0.5px 0.5px 1px black"}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LectureModal;
