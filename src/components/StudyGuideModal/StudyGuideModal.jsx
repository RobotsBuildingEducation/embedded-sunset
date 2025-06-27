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
} from "@chakra-ui/react";
import Markdown from "react-markdown";

import { translation } from "../../utility/translation";
import { newTheme } from "../../App.theme";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

const StudyGuideModal = ({ isOpen, onClose, content, userLanguage }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {translation[userLanguage]["settings.button.studyGuide"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* <Button>Data</Button> */}
          <Markdown components={ChakraUIRenderer(newTheme)}>{content}</Markdown>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>
            {" "}
            {translation[userLanguage]["button.close"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StudyGuideModal;
