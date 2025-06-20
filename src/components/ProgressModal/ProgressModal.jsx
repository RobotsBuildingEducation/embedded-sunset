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
          <UnorderedList spacing={2} listStyleType="none">
            {allSteps.map(({ step, idx }) => (
              <ListItem
                key={idx}
                color={idx <= currentStep - 1 ? "green.600" : "gray.500"}
              >
                {idx}. {step.title}
              </ListItem>
            ))}
          </UnorderedList>
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
