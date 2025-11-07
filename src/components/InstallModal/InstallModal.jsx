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
  Flex,
  Divider,
  Text,
} from "@chakra-ui/react";
import { IoShareOutline } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import { BsPlusSquare } from "react-icons/bs";
import { LuBadgeCheck } from "react-icons/lu";

import { translation } from "../../utility/translation";
import { FaHeartBroken } from "react-icons/fa";

export const InstallAppModal = ({
  isOpen,
  onClose,
  userLanguage = localStorage.getItem("userLanguage"),
  vocalRequest = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        display="flex"
        flexDirection="column"
        maxH="90vh"
        overflow="hidden"
      >
        <ModalHeader>{translation[userLanguage].installApp}</ModalHeader>
        <ModalCloseButton />
        <ModalBody flex="1" overflowY="auto">
          {vocalRequest ? (
            <>
              {" "}
              <Flex direction="column" pb={6}>
                <FaHeartBroken color="red" fontSize="16px" />
                <Text mt={3}>
                  {translation[userLanguage]["badBrowser.install"]}
                </Text>
              </Flex>
              <Divider mb={6} />
            </>
          ) : null}
          <Flex direction="column" pb={6}>
            <IoIosMore size={32} />
            <Text mt={2}>
              1. {translation[userLanguage].installAppInstructions1}
            </Text>
          </Flex>
          <Divider mb={6} />

          <Flex direction="column" pb={6}>
            <IoShareOutline size={32} />
            <Text mt={2}>
              2. {translation[userLanguage].installAppInstructions2}
            </Text>
          </Flex>
          <Divider mb={6} />

          <Flex direction="column" pb={6}>
            <BsPlusSquare size={32} />
            <Text mt={2}>
              3. {translation[userLanguage].installAppInstructions3}
            </Text>
          </Flex>
          <Divider mb={6} />

          <Flex direction="column" pb={6}>
            <LuBadgeCheck size={32} />
            <Text mt={2}>
              4. {translation[userLanguage].installAppInstructions4}
            </Text>
          </Flex>
        </ModalBody>

        <ModalFooter
          position="sticky"
          bottom="0"
          bg="chakra-body-bg"
          borderTopWidth="1px"
          borderColor="blackAlpha.200"
          boxShadow="sm"
          justifyContent="flex-end"
        >
          <Button
            size="lg"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
          >
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
