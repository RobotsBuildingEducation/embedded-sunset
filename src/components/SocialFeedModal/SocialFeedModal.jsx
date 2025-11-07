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

const SocialFeedModal = ({
  isOpen,
  onClose,
  currentStep,
  userLanguage,
  allowPosts,
  setAllowPosts,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
      placement="right"
    >
      <DrawerOverlay />
      <DrawerContent display="flex" flexDirection="column">
        <DrawerHeader style={{ display: "flex", alignItems: "center" }}>
          {/* {translation[userLanguage]["settings.button.yourTutor"]} */}
          #LearnWithNostr
        </DrawerHeader>
        <DrawerCloseButton />
        <DrawerBody flex="1" overflowY="auto">
          <TestFeed
            userLanguage={userLanguage}
            allowPosts={allowPosts}
            setAllowPosts={setAllowPosts}
          />
        </DrawerBody>
        <DrawerFooter
          position="sticky"
          bottom="0"
          bg="chakra-body-bg"
          borderTopWidth="1px"
          borderColor="blackAlpha.200"
          boxShadow="sm"
          py={4}
          justifyContent="flex-end"
        >
          <Button size="lg" onClick={onClose}>
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SocialFeedModal;
