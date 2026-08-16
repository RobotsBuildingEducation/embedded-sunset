import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { ThemeControls } from "../ThemeMenu";

const ThemeModal = ({ isOpen, onClose, userLanguage }) => {
  const title = userLanguage?.includes("es") ? "Cambiar tema" : "Change Theme";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="none" />
      <ModalContent
        bg="appSurfaceElevated"
        color="appText"
        borderWidth="1px"
        borderColor="appBorderStrong"
        borderRadius="2xl"
        boxShadow="none"
        mx={4}
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={5} pb={6}>
          <ThemeControls userLanguage={userLanguage} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ThemeModal;
