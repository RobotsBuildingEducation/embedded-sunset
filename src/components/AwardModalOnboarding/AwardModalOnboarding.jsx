import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  HStack,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { CloudCanvas } from "../../elements/SunsetCanvas";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import { onboardingTranscript } from "../../utility/transcript";
import ReactConfetti from "react-confetti";
import { useSharedNostr } from "../../hooks/useNOSTR";

const AwardModalOnboarding = ({
  isOpen,
  onClose,
  userLanguage,
  handleActuallyReallySeriouslyLaunchApp,
}) => {
  const [areBadgesLoading, setAreBadgesLoading] = useState(true);
  const { getUserBadges } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  const [badges, setBadges] = useState([]);
  useEffect(() => {
    async function getBadges() {
      let data = await getUserBadges();
      setBadges(data);
      setAreBadgesLoading(false);
    }

    getBadges();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={false}
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
        p={0}
        sx={{
          position: "relative",
          border: "8px solid transparent",
          background:
            "linear-gradient(white, white) padding-box, linear-gradient(135deg,#FFD700,#FF69B4,#DA70D6,#FFA500) border-box",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "8px",
            left: "8px",
            right: "8px",
            bottom: "8px",
            border: "2px solid #FFD700",
            borderRadius: "calc(var(--chakra-radii-xl) - 8px)",
            pointerEvents: "none",
          },
        }}
      >
        <ModalBody p={6} color="gray.800" textAlign="center">
          <HStack justifyContent="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              {translation[userLanguage]["modal.title.decentralizedTranscript"]}
            </Text>
          </HStack>
          {/* <ReactConfetti
            gravity={1.35}
            numberOfPieces={100}
            recycle={false}
            colors={["#f2dcfa", "#f9d4fa", "#fca4b3", "#fcb7a4", "#fcd4a4"]} // Array of colors matching the logo
          /> */}
          {translation[userLanguage]["modal.decentralizedTranscript.youEarned"]}
          <br />
          <Text mb={2}>{onboardingTranscript.name[userLanguage]}</Text>
          <Box
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <a
              target="_blank"
              href={`https://badges.page/a/${
                onboardingTranscript["address"] || ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  window.open(
                    `https://badges.page/a/${
                      onboardingTranscript["address"] || ""
                    }`
                  );
                }
              }}
            >
              <Image
                loading="eager"
                src={onboardingTranscript["imgSrc"]}
                width={150}
                style={{
                  borderRadius: "33%",
                  boxShadow: "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
                }}
              />
            </a>
          </Box>
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
              justifyContent="center"
              marginInline="auto"
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
                      let matchingTranscript =
                        onboardingTranscript["name"]["en"].replace(
                          /\s+/g,
                          "-"
                        ) === badgeName;

                      let result = matchingTranscript
                        ? onboardingTranscript.address
                        : null;
                      return result;
                    })()}`}
                    target="_blank"
                    onKeyDown={() => {
                      if (e.key === "Enter" || e.key === " ") {
                        window.open(
                          `https://badges.page/a/${(() => {
                            const badgeName = badge.badgeAddress.split(":")[2];

                            let matchingTranscript =
                              onboardingTranscript["name"]["en"].replace(
                                /\s+/g,
                                "-"
                              ) === badgeName;

                            let result = matchingTranscript
                              ? onboardingTranscript.address
                              : null;
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
                  <div
                    style={{
                      padding: 6,
                      marginLeft: "12px",

                      display: "flex",
                      alignItems: "center",
                    }}
                  >
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
            onMouseDown={handleActuallyReallySeriouslyLaunchApp}
            variant="solid"
            size="md"
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleActuallyReallySeriouslyLaunchApp();
              }
            }}
          >
            {translation[userLanguage]["onboarding.final.launch"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AwardModalOnboarding;
