import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  HStack,
  Image,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { translation } from "../../../utility/translation";
import {
  transcript,
  videoTranscript,
  computerScienceTranscript,
} from "../../../utility/transcript";
import { useSharedNostr } from "../../../hooks/useNOSTR";
import { nip19 } from "nostr-tools";

const TranscriptModal = ({ isOpen, onClose, userLanguage }) => {
  const transcriptset =
    userLanguage === "compsci-en" ? computerScienceTranscript : transcript;
  const [badges, setBadges] = useState([]);
  const { getUserBadges } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  useEffect(() => {
    async function fetchBadges() {
      if (isOpen) {
        const data = await getUserBadges();
        console.log("data", data);
        setBadges(Array.isArray(data) ? data : []);
      }
    }
    fetchBadges();
  }, [isOpen]);

  const getNaddr = (address) => {
    if (address.startsWith("naddr")) return address;
    const [kind, pubkey, identifier] = address.split(":");
    return nip19.naddrEncode({
      kind: parseInt(kind),
      pubkey,
      identifier,
    });
  };

  const cardImage = badges[0]?.image;
  const cardLink = badges[0]?.badgeAddress
    ? `https://badges.page/a/${getNaddr(badges[0].badgeAddress)}`
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
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
        <ModalBody p={6} color="gray.800">
          <HStack justifyContent="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              {translation[userLanguage]["modal.title.decentralizedTranscript"]}
            </Text>
          </HStack>
          <Box display="flex" justifyContent="center" mb={4}>
            {
              cardImage ? (
                cardLink ? (
                  <Link href={cardLink} target="_blank">
                    <Image
                      src={cardImage}
                      width={150}
                      borderRadius="33%"
                      boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
                    />
                  </Link>
                ) : (
                  <Image
                    src={cardImage}
                    width={150}
                    borderRadius="33%"
                    boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
                  />
                )
              ) : null
              // <ReactConfetti numberOfPieces={80} recycle={false} />
            }
          </Box>
          <Text mb={4}>
            {
              translation[userLanguage][
                "modal.decentralizedTranscript.awareness"
              ]
            }
          </Text>
          <Box display="flex" flexWrap="wrap" justifyContent="center">
            {badges.map((badge) => (
              <Box key={badge.badgeAddress} m={2} textAlign="center">
                <Link
                  href={`https://badges.page/a/${getNaddr(badge.badgeAddress)}`}
                  target="_blank"
                >
                  <Image
                    src={badge.image}
                    width={100}
                    borderRadius="33%"
                    boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
                    mb={2}
                  />
                </Link>
                <Text fontSize="sm">
                  {translation[userLanguage][badge.name] || badge.name}
                </Text>
              </Box>
            ))}
          </Box>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            onMouseDown={onClose}
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
