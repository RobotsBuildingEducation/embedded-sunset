import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  extendTheme,
  useStyleConfig,
  useToast,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { CloudCanvas, SunsetCanvas } from "../../elements/SunsetCanvas";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import {
  transcript,
  videoTranscript,
  computerScienceTranscript,
} from "../../utility/transcript";
import ReactConfetti from "react-confetti";
import { useSharedNostr } from "../../hooks/useNOSTR";

const AwardModal = ({ isOpen, onClose, step, userLanguage, isCorrect }) => {
  let transcriptset =
    userLanguage === "compsci-en" ? computerScienceTranscript : transcript;

  const [badges, setBadges] = useState([]);
  const [areBadgesLoading, setAreBadgesLoading] = useState(true);
  const { getUserBadges } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  const toast = useToast();
  useEffect(() => {
    async function getBadges() {
      let data = await getUserBadges();
      setBadges(data);
      setAreBadgesLoading(false);
    }

    if (step.isConversationReview && isCorrect) getBadges();
  }, [step, isCorrect]);

  const handleCopyKeys = () => {
    const keys = localStorage.getItem("local_nsec"); // replace with actual keys
    navigator.clipboard.writeText(keys);
    toast({
      title: translation[userLanguage]["toast.title.keysCopied"],
      description: translation[userLanguage]["toast.description.keysCopied"],
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top",
      render: () => (
        <Box
          color="black"
          p={3}
          bg="#FEEBC8" // Custom background color here!
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior={"inside"}
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="rgba(255,255,255,0.8)" backdropFilter="blur(8px)" />
      <ModalContent
        as={motion.div}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.4 }}
        bg="white"
        borderRadius="xl"
        boxShadow="xl"
        p={0}
        width="100%"
        sx={{
          border: "4px solid transparent",
          background:
            "linear-gradient(white, white) padding-box, linear-gradient(135deg,#FFD700,#FF69B4,#DA70D6,#FFA500) border-box",
        }}
      >
        <ModalHeader
          fontSize="3xl"
          fontWeight="bold"
          marginTop={0}
          paddingTop={0}
          padding={3}
          color="gray.800"
        >
          <HStack>
            <div style={{ color: "gray.800" }}>
              {translation[userLanguage]["modal.title.decentralizedTranscript"]}
            </div>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            Achievement Unlocked!
          </Text>
        </ModalHeader>

        <ModalBody p={8} style={{ width: "100%", color: "gray.800" }}>
          <ReactConfetti
            // gravity={0.75}
            numberOfPieces={100}
            recycle={false}
            colors={["#f2dcfa", "#f9d4fa", "#fca4b3", "#fcb7a4", "#fcd4a4"]} // Array of colors matching the logo
          />
          {translation[userLanguage]["modal.decentralizedTranscript.youEarned"]}
          <br />
          <Text fontSize={"large"} fontWeight={"bold"} mb={2}>
            {translation[userLanguage][transcriptset[step.group]?.name]}
          </Text>
          <a
            target="_blank"
            href={`https://badges.page/a/${
              transcriptset[step.group]?.["address"] || ""
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.open(
                  `https://badges.page/a/${
                    transcriptset[step.group]?.["address"] || ""
                  }`
                );
              }
            }}
          >
            <Image
              loading="eager"
              src={transcriptset[step.group]?.["imgSrc"]}
              width={150}
              style={{
                borderRadius: "33%",
                boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
              }}
            />
          </a>
          <br />
          <br />
          {/* <Button
            onMouseDown={handleCopyKeys}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCopyKeys();
              }
            }}
            mb={2}
          >
            🔑 {translation[userLanguage]["button.copyKey"]}
          </Button> */}

          <div style={{ maxWidth: "600px" }}>
            {
              translation[userLanguage][
                "modal.decentralizedTranscript.awareness"
              ]
            }{" "}
            {/* <a
              target="_blank"
              href="https://embedded-rox.app"
              style={{ textDecoration: "underline", fontWeight: "bold" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  window.open("https://embedded-rox.app");
                }
              }}
            >
              {translation[userLanguage][
                "settings.button.yourTutor"
              ].toLowerCase()}
            </a> */}
          </div>

          <br />
          <br />
          <b>
            {
              translation[userLanguage][
                "modal.decentralizedTranscript.awardsEarned"
              ]
            }
          </b>
          {areBadgesLoading ? (
            <div style={{ width: "fit-content" }}>
              <CloudCanvas /> {translation[userLanguage]["loading"]}
            </div>
          ) : badges.length < 1 ? (
            <div>{translation[userLanguage]["noTranscriptFound"]}</div>
          ) : (
            <Box
              display="flex"
              m={2}
              width="fit-content"
              flexWrap="wrap"
              height="min-content"
            >
              {badges.map((badge) => (
                <div
                  style={{
                    margin: 6,

                    width: "250px",
                    height: "100px",
                    display: "flex",
                  }}
                >
                  <a
                    href={`https://badges.page/a/${(() => {
                      const badgeName = badge.badgeAddress.split(":")[2];

                      const matchingTranscript = Object.values(transcript).find(
                        (entry) => {
                          console.log("entry.name", entry.name);
                          return entry.name.replace(/\s+/g, "-") === badgeName;
                        }
                      );

                      const matchingVideoTranscript = Object.values(
                        videoTranscript
                      ).find((entry) => {
                        console.log("entry.name", entry.name);
                        return entry.name.replace(/\s+/g, "-") === badgeName;
                      });

                      const matchingComputerScienceTranscript = Object.values(
                        computerScienceTranscript
                      ).find((entry) => {
                        console.log("entry.name", entry.name);
                        return entry.name.replace(/\s+/g, "-") === badgeName;
                      });

                      console.log(
                        "matchingTranscript",
                        matchingTranscript ||
                          matchingVideoTranscript ||
                          matchingComputerScienceTranscript
                      );
                      let result =
                        matchingTranscript?.address ||
                        matchingVideoTranscript?.address ||
                        matchingComputerScienceTranscript?.address;

                      return result;
                    })()}`}
                    target="_blank"
                    onKeyDown={() => {
                      if (e.key === "Enter" || e.key === " ") {
                        window.open(
                          `https://badges.page/a/${(() => {
                            const badgeName = badge.badgeAddress.split(":")[2];

                            const matchingTranscript = Object.values(
                              transcript
                            ).find((entry) => {
                              console.log("entry.name", entry.name);
                              return (
                                entry.name.replace(/\s+/g, "-") === badgeName
                              );
                            });

                            const matchingVideoTranscript = Object.values(
                              videoTranscript
                            ).find((entry) => {
                              console.log("entry.name", entry.name);
                              return (
                                entry.name.replace(/\s+/g, "-") === badgeName
                              );
                            });

                            const matchingComputerScienceTranscript =
                              Object.values(computerScienceTranscript).find(
                                (entry) => {
                                  console.log("entry.name", entry.name);
                                  return (
                                    entry.name.replace(/\s+/g, "-") ===
                                    badgeName
                                  );
                                }
                              );
                            console.log(
                              "matchingTranscript",
                              matchingTranscript ||
                                matchingVideoTranscript ||
                                matchingComputerScienceTranscript
                            );
                            let result =
                              matchingTranscript?.address ||
                              matchingVideoTranscript?.address ||
                              matchingComputerScienceTranscript?.address;

                            return result;
                          })()}`
                        );
                      }
                    }}
                  >
                    <Image
                      loading="eager"
                      src={badge.image}
                      width={100}
                      style={{
                        borderRadius: "33%",
                        boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
                        marginBottom: 4,
                      }}
                    />
                  </a>
                  <div style={{ padding: 6 }}>
                    <Text fontSize={"sm"}>
                      {translation[userLanguage][badge.name] || badge.name}
                    </Text>
                  </div>
                </div>
              ))}
            </Box>
          )}
          <br />

          {/* {translation[userLanguage]["subscription.nudge"]}

          <br />
          <Button
            p={6}
            // as="a"

            onMouseDown={() => {
              window.open("https://patreon.com/notesandotherstuff/membership");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.open(
                  "https://patreon.com/notesandotherstuff/membership"
                );
              }
            }}
            boxShadow={"0px 0.5px 0.5px 1px black"}
          >
            <b>Subscribe</b>
          </Button> */}
        </ModalBody>
        <ModalFooter margin={0} padding={3}>
          <Button
            onMouseDown={onClose}
            variant="solid"
            size="md"
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
          >
            {translation[userLanguage]["button.close"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AwardModal;
