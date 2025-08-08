import React, { useEffect, useState } from "react";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import ReactConfetti from "react-confetti";

import {
  computerScienceTranscript,
  transcript,
  videoTranscript,
} from "../../../utility/transcript";

import { useSharedNostr } from "../../../hooks/useNOSTR";
import { CloudCanvas, SunsetCanvas } from "../../../elements/SunsetCanvas";
import { translation } from "../../../utility/translation";
import { CopyButtonIcon } from "../../../elements/CopyButtonIcon";

const TranscriptModal = ({ isOpen, onClose, userLanguage }) => {
  let transcriptset =
    userLanguage === "compsci-en" ? computerScienceTranscript : transcript;
  const toast = useToast();

  const [badges, setBadges] = useState([]);
  const [areBadgesLoading, setAreBadgesLoading] = useState(true);
  const { getUserBadges } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  useEffect(() => {
    async function getBadges() {
      let data = await getUserBadges();
      setBadges(data);
      setAreBadgesLoading(false);
    }

    if (isOpen) {
      getBadges();
    } else {
      setAreBadgesLoading(true);
    }
  }, [isOpen]);

  const handleCopyKeys = (id) => {
    if (id) {
      const keys = id; // replace with actual keys
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
    } else {
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
    }
  };

  console.log("badges", badges);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior={"inside"}
      isCentered
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
        p={6}
        width="100%"
        maxWidth="600px"
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
            Trainer Transcript
          </Text>
        </ModalHeader>

        <ModalBody p={8} style={{ width: "100%", color: "gray.800" }}>
          {/* <Button
            style={{
              display: "flex",
            }}
            tabIndex={0}
            onMouseDown={() => {
              handleCopyKeys(localStorage.getItem("local_npub") || "");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCopyKeys(localStorage.getItem("local_npub") || "");
              }
            }}
          >
            <div style={{ width: "min-content" }}>
              <CopyButtonIcon color="black" />
            </div>
            &nbsp;
            <div>
              <b>{translation[userLanguage]["yourID"]}</b>
              &nbsp;
              {localStorage?.getItem("local_npub")?.substr(0, 16) || ""}
            </div>
          </Button>

          <br />
          <br /> */}

          <div>
            {
              translation[userLanguage][
                "modal.decentralizedTranscript.awareness"
              ]
            }
            {/* &nbsp;
            <span>
              <a
                target="_blank"
                href="https://embedded-rox.app"
                style={{ textDecoration: "underline", fontWeight: "bold" }}
                onKeyDown={() => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.open("embedded-rox.app");
                  }
                }}
              >
                {translation[userLanguage][
                  "settings.button.yourTutor"
                ].toLowerCase()}
              </a>
              &nbsp;
            </span>
            <Button
              width="fit-content"
              onMouseDown={() =>
                handleCopyKeys(localStorage.getItem("local_nsec"))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCopyKeys(localStorage.getItem("local_nsec"));
                }
              }}
              fontSize={"smaller"}
            >
              🔑 {translation[userLanguage]["button.copyKey"]}
            </Button> */}
          </div>
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
              <br />
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
              {badges.map((badge) => {
                console.log("BDGE!!!!!@@@", badge);
                return (
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

                        const matchingTranscript = Object.values(
                          transcript
                        ).find((entry) => {
                          console.log("entry.name", entry.name);
                          return entry.name.replace(/\s+/g, "-") === badgeName;
                        });

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
                              const badgeName =
                                badge.badgeAddress.split(":")[2];

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
                      <img
                        src={badge.image}
                        width={100}
                        style={{
                          borderRadius: "33%",
                          boxShadow: "0px 1px 1px 2px black",
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
                );
              })}
            </Box>
          )}
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

export default TranscriptModal;
