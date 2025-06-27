// src/components/ProgressModal/ProgressModal.tsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  UnorderedList,
  ListItem,
  Progress,
  Text,
  Box,
} from "@chakra-ui/react";
import { translation } from "../../utility/translation";

const ProgressModal = ({
  isOpen,
  onClose,
  steps,
  currentStep,
  userLanguage,
}) => {
  const transcriptDisplay = {
    introduction: {
      en: "Tutorial",
      es: "Tutorial",
      "py-en": "Tutorial",
      "swift-en": "Tutorial",
      "android-en": "Tutorial",
    },
    tutorial: {
      en: "Tutorial",
      es: "Tutorial",
      "py-en": "Tutorial",
      "swift-en": "Tutorial",
      "android-en": "Tutorial",
      "compsci-en": "Tutorial",
    },
    1: {
      en: "Basics of Coding",
      es: "Fundamentos de la Programación",
      "py-en": "Basics of Coding",
      "swift-en": "Basics of Coding",
      "android-en": "Basics of Coding",
      "compsci-en": "Foundations of Data Structures", // ✅ fixed
    },
    2: {
      en: "Object-Oriented Programming",
      es: "Programación Orientada a Objetos",
      "py-en": "Object-Oriented Programming",
      "swift-en": "Object-Oriented Programming",
      "android-en": "Object-Oriented Programming",
      "compsci-en": "Linear Structures", // ✅ fixed
    },
    3: {
      en: "Frontend Development",
      es: "Desarrollo Frontend",
      "py-en": "Frontend Development",
      "swift-en": "Frontend Development",
      "android-en": "Frontend Development",
      "compsci-en": "Hierarchical & Associative Structures", // ✅ fixed
    },
    4: {
      en: "Backend Engineering Fundamentals",
      es: "Fundamentos de Ingeniería de Backend",
      "py-en": "Backend Engineering Fundamentals",
      "swift-en": "Backend Engineering Fundamentals",
      "android-en": "Backend Engineering Fundamentals",
      "compsci-en": "Sorting & Searching Algorithms", // ✅ fixed
    },
    5: {
      en: "Creating Apps & Experiences",
      es: "Creando Aplicaciones y Experiencias",
      "py-en": "Creating Apps & Experiences",
      "swift-en": "Creating Apps & Experiences",
      "android-en": "Creating Apps & Experiences",
      "compsci-en": "Operating Systems Essentials", // ✅ fixed
    },
    6: {
      en: "Computer Science",
      es: "Ciencias de la Computación",
      "py-en": "Computer Science",
      "swift-en": "Computer Science",
      "android-en": "Computer Science",
      "compsci-en": "Computer Science",
    },
  };

  // build a list of all steps (exclude index 0 placeholder)
  const allSteps = steps[userLanguage]
    .map((step, idx) => ({ step, idx }))
    .filter(({ idx }) => idx > 0);

  const completedCount = Math.max(currentStep - 1, 0);
  const totalCount = allSteps.length;
  const progressValue =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      //   blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent height="600px" maxWidth="400px">
        {/* Sticky header */}
        <ModalHeader
          position="sticky"
          top="0"
          bg="white"
          //   borderBottom="1px solid"
          //   borderColor="gray.200"
          zIndex={2}
          pb={2}
        >
          {translation[userLanguage]["modal.progress.title"]}
        </ModalHeader>
        <ModalCloseButton zIndex={3} />

        {/* Progress bar */}
        <Box
          p={4}
          pt={2}
          pb={0}
          display="flex"
          flexDirection={"column"}
          alignItems="center"
        >
          <Text fontSize="sm" mb={1}>
            {`${completedCount}/${totalCount}`}
          </Text>
          <Progress
            value={progressValue}
            size="sm"
            colorScheme="yellow"
            borderRadius="4px"
            width="50%"
          />
        </Box>

        <ModalBody overflowY="auto" pt={2} pb={6}>
          {(() => {
            const elements = [];
            let lastGroup = null;

            allSteps.forEach(({ step, idx }) => {
              const group = step.group;

              if (group !== lastGroup) {
                const groupLabel =
                  transcriptDisplay[group]?.[userLanguage] || group;

                elements.push(
                  <Text
                    key={`group-${idx}`}
                    fontSize="sm"
                    fontWeight="bold"
                    color="green.400"
                    mt={4}
                  >
                    {group === "tutorial" ? "" : `${group + "."}`} {groupLabel}
                  </Text>
                );

                lastGroup = group;
              }

              elements.push(
                <Text
                  key={`step-${idx}`}
                  ml={2}
                  color={idx <= currentStep - 1 ? "green.600" : "gray.500"}
                  fontSize="sm"
                >
                  {idx}. {step.title}
                </Text>
              );
            });

            return elements;
          })()}
        </ModalBody>

        <ModalFooter
          position="sticky"
          bottom="0"
          bg="white"
          //   borderTop="1px solid"
          //   borderColor="gray.200"
          zIndex={2}
        >
          <Button onClick={onClose}>
            {translation[userLanguage]["button.close"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProgressModal;
