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

export const InstallAppModal = ({
  isOpen,
  onClose,
  userLanguage = localStorage.getItem("userLanguage"),
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{translation[userLanguage].installApp}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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

        <ModalFooter>
          <Button
            variant="ghost"
            onMouseDown={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
          >
            {translation[userLanguage].close}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
