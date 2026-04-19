import { useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import RandomCharacter from "../../elements/RandomCharacter";
import { soundManager } from "../../utility/soundManager";

const MotionModalContent = motion(ModalContent);

const DailyGoalCelebrationModal = ({
  isOpen,
  onClose,
  userLanguage,
  dailyGoals = 0,
  completedGoalCount = 0,
}) => {
  const isSpanish = String(userLanguage || "").startsWith("es");
  const cardBg = useColorModeValue(
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(240,253,244,0.98) 100%)",
    "linear-gradient(180deg, rgba(12,21,40,0.98) 0%, rgba(6,46,33,0.96) 100%)",
  );
  const accentBg = useColorModeValue(
    "rgba(16,185,129,0.12)",
    "rgba(94,234,212,0.12)",
  );
  const textMuted = useColorModeValue("#475569", "appTextMuted");
  const glowShadow = useColorModeValue(
    "0 18px 44px rgba(16,185,129,0.16)",
    "0 24px 54px rgba(2,6,23,0.46)",
  );

  useEffect(() => {
    if (!isOpen) return;
    soundManager.resume();
    soundManager.play("dailyGoal");
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="appOverlay" backdropFilter="blur(10px)" />
      <MotionModalContent
        initial={{ y: 34, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 34, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        bg={cardBg}
        color="appText"
        borderRadius="32px"
        border="1px solid"
        borderColor="appBorderStrong"
        boxShadow={glowShadow}
        overflow="hidden"
      >
        <ModalCloseButton top={4} right={4} />
        <ModalBody px={{ base: 6, md: 8 }} py={{ base: 8, md: 10 }}>
          <VStack spacing={5} textAlign="center">
            <Box
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="140px"
              h="120px"
            >
              <Box
                position="absolute"
                inset="10px"
                borderRadius="full"
                bg={accentBg}
                filter="blur(2px)"
              />
              <Box position="relative" zIndex={1}>
                <RandomCharacter noSoRancomCharacter="32" width="104px" />
              </Box>
            </Box>

            <VStack spacing={2}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                {isSpanish ? "Meta diaria completa" : "Daily goal complete"}
              </Text>
              <Text color={textMuted} fontSize={{ base: "md", md: "lg" }}>
                {isSpanish
                  ? `Terminaste ${dailyGoals} pregunta${dailyGoals === 1 ? "" : "s"} de hoy.`
                  : `You finished today's ${dailyGoals} question${dailyGoals === 1 ? "" : "s"}.`}
              </Text>
            </VStack>

            <Box width="100%">
              <Progress
                value={100}
                borderRadius="full"
                size="sm"
                colorScheme="green"
                bg="appSurfaceInset"
              />
              <Text mt={2} fontSize="sm" color={textMuted}>
                {isSpanish
                  ? `${completedGoalCount} meta${completedGoalCount === 1 ? "" : "s"} completada${completedGoalCount === 1 ? "" : "s"}`
                  : `${completedGoalCount} goal${completedGoalCount === 1 ? "" : "s"} completed`}
              </Text>
            </Box>

            <Button
              onMouseDown={onClose}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onClose();
                }
              }}
              colorScheme="green"
              borderRadius="full"
              px={8}
            >
              {isSpanish ? "Seguir aprendiendo" : "Keep learning"}
            </Button>
          </VStack>
        </ModalBody>
      </MotionModalContent>
    </Modal>
  );
};

export default DailyGoalCelebrationModal;
