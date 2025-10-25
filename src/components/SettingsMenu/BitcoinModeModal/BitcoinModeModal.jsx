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
      <ModalContent>
        <ModalHeader>
          {translation[userLanguage]["modal.bitcoinMode.title"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* {renderContent()} */}
          <BitcoinOnboarding userLanguage={userLanguage} from={from} />
        </ModalBody>
        <ModalFooter>
          {/** You can add any footer actions if needed */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BitcoinModeModal;
