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
  Box,
  Text,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { translation } from "../../../utility/translation";

const RoxModal = ({ isOpen, onClose, userLanguage }) => {
  console.log("IDDKDKDKDKKDKDKDKK");
  const toast = useToast();

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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent textAlign={"center"}>
        <ModalHeader>
          {translation[userLanguage]["modal.openTutor.title"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {translation[userLanguage]["modal.openTutor.instructions"]}
          <br />
          <br />
          <Button onMouseDown={handleCopyKeys}>
            🔑 {translation[userLanguage]["button.copyKey"]}
          </Button>
          <br />
          <br />
          <Button
            as="a"
            href="https://embedded-rox.app"
            mt={2}
            mb={4}
            variant={"outline"}
          >
            {translation[userLanguage]["modal.openTutor.startButton"]}
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onMouseDown={onClose}>
            {translation[userLanguage]["button.close"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoxModal;
