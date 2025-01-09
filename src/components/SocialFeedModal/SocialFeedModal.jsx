import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  ModalFooter,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
} from "@chakra-ui/react";

import { translation } from "../../utility/translation";
import { TestFeed } from "../../experiments/TestCoinbaseUI";

const SocialFeedModal = ({ isOpen, onClose, currentStep, userLanguage }) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
      placement="right"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader style={{ display: "flex", alignItems: "center" }}>
          {/* {translation[userLanguage]["settings.button.yourTutor"]} */}
          #LearnWithNostr
        </DrawerHeader>
        <DrawerCloseButton />
        <DrawerBody>
          <TestFeed userLanguage={userLanguage} />
        </DrawerBody>
        {/* <DrawerFooter
          display="flex"
          justifyContent="space-between"
          alignContent={"center"}
        >
          <Button
            mt={4}
            onClick={onClose}
            variant="solid"
            size="lg"
            boxShadow={"0px 0.5px 0.5px 1px black"}
          >
            Close
          </Button>
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
};

export default SocialFeedModal;
