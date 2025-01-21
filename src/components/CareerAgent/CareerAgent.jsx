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

export const CareerAgent = ({
  isOpen,
  onClose,
  userLanguage = localStorage.getItem("userLanguage"),
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Career Agent</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Career</ModalBody>

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
