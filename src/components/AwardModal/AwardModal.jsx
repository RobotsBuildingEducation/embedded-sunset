import React from "react";
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { translation } from "../../utility/translation";
import {
  transcript,
  videoTranscript,
  computerScienceTranscript,
} from "../../utility/transcript";

const AwardModal = ({ isOpen, onClose, step, userLanguage }) => {
  const transcriptset =
    userLanguage === "compsci-en" ? computerScienceTranscript : transcript;
  const badge = transcriptset[step.group] || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
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
        <ModalBody p={6} textAlign="center" color="gray.800">
          {/* <ReactConfetti
            numberOfPieces={100}
            recycle={false}
            colors={["#f2dcfa", "#f9d4fa", "#fca4b3", "#fcb7a4", "#fcd4a4"]}
          /> */}
          <HStack justifyContent="space-between" mb={4}>
            {/* <Text fontSize="xl" fontWeight="bold">
              {translation[userLanguage][badge.name] || badge.name}
            </Text> */}
            <Text fontSize="xl" fontWeight="bold">
              {translation[userLanguage][badge.name] || badge.name}
            </Text>
          </HStack>
          <Box display="flex" justifyContent="center" mb={4}>
            <Image
              src={badge.imgSrc}
              width={150}
              borderRadius="33%"
              boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
            />
          </Box>
          <Text>
            {
              translation[userLanguage][
                "modal.decentralizedTranscript.awareness"
              ]
            }
          </Text>
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

export default AwardModal;
