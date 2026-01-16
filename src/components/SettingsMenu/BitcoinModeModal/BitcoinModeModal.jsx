import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  useToast,
  Select,
  Link,
} from "@chakra-ui/react";
import QRCode from "qrcode.react";
import { IdentityCard } from "../../../elements/IdentityCard";
import { translation } from "../../../utility/translation";
import { SunsetCanvas } from "../../../elements/SunsetCanvas";
import { useSharedNostr } from "../../../hooks/useNOSTR";
import { useNostrWalletStore } from "../../../hooks/useNostrWalletStore";
import { database } from "../../../database/firebaseResources";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { SiCashapp } from "react-icons/si";
import BitcoinOnboarding from "../../BitcoinOnboarding/BitcoinOnboarding";

const BitcoinModeModal = ({
  isOpen,
  onClose,
  userLanguage,
  from = "onboarding",
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
        <ModalHeader>
          {translation[userLanguage]["modal.bitcoinMode.title"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody flex="1" overflowY="auto">
          {/* {renderContent()} */}
          <BitcoinOnboarding userLanguage={userLanguage} from={from} />
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
          <Button size="lg" onClick={onClose} data-sound-close="true">
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BitcoinModeModal;
