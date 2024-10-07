import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  useToast,
  Text,
  FormControl,
  Switch,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import BitcoinModeModal from "./BitcoinModeModal/BitcoinModeModal";
import RoxModal from "./RoxModal/RoxModal";
import SocialWalletModal from "./SocialWalletModal/SocialWalletModal";
import SelfPacedModal from "./SelfPacedModal/SelfPacedModal";
import { KnowledgeLedgerModal } from "./KnowledgeLedgerModal/KnowledgeLedgerModal";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import { translation } from "../../utility/translation";
import { database } from "../../database/firebaseResources";
import { doc, updateDoc } from "firebase/firestore";
import TranscriptModal from "./TranscriptModal/TranscriptModal";

const SettingsMenu = ({
  isSignedIn,
  setIsSignedIn,
  steps,
  currentStep,
  userLanguage,
  setUserLanguage,
  view,
  setView,
  step,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const btnRef = useRef(); // Reference to the settings icon button
  const firstButtonRef = useRef(); // Reference to the first button in the drawer
  const toast = useToast();

  const {
    isOpen: isSelfPacedOpen,
    onOpen: onSelfPacedOpen,
    onClose: onSelfPacedClose,
  } = useDisclosure();

  const {
    isOpen: isBitcoinModeOpen,
    onOpen: onBitcoinModeOpen,
    onClose: onBitcoinModeClose,
  } = useDisclosure();

  const {
    isOpen: isRoxModalOpen,
    onOpen: onRoxModalOpen,
    onClose: onRoxModalClose,
  } = useDisclosure();

  const {
    isOpen: isSocialWalletOpen,
    onOpen: onSocialWalletOpen,
    onClose: onSocialWalletClose,
  } = useDisclosure();

  const {
    isOpen: isKnowledgeLedgerOpen,
    onOpen: onKnowledgeLedgerOpen,
    onClose: onKnowledgeLedgerClose,
  } = useDisclosure();

  const {
    isOpen: isFeedbackOpen,
    onOpen: onFeedbackOpen,
    onClose: onFeedbackClose,
  } = useDisclosure();

  const {
    isOpen: isTranscriptOpen,
    onOpen: onTranscriptOpen,
    onClose: onTranscriptClose,
  } = useDisclosure();

  const [interval, setIntervalState] = useState(120);

  const handleToggle = async () => {
    const newLanguage = userLanguage === "en" ? "es" : "en";
    setUserLanguage(newLanguage);

    // Update local storage
    localStorage.setItem("userLanguage", newLanguage);

    // Update Firestore
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      const userDoc = doc(database, "users", npub);
      await updateDoc(userDoc, {
        language: newLanguage,
      });
    }
  };

  useEffect(() => {
    const userDocRef = doc(
      database,
      "users",
      localStorage.getItem("local_npub")
    );
    updateDoc(userDocRef, {
      language: userLanguage,
    });
  }, [userLanguage]);

  // Manually focus the first button when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  return (
    <>
      {isSignedIn ? (
        <IconButton
          ref={btnRef}
          icon={<FiSettings />}
          onClick={onOpen}
          variant="outline"
          position="fixed"
          top={4}
          right={4}
          style={{ backgroundColor: "white", zIndex: 1000 }}
          aria-label="Settings"
        />
      ) : null}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        autoFocus={false} // Prevent Drawer from auto-focusing
        blockScrollOnMount={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {translation?.[userLanguage]?.["settings.title"]}
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <FormControl
                display="flex"
                alignItems="center"
                style={{ justifyContent: "center" }}
              >
                <FormLabel htmlFor="language-toggle" mb="0">
                  {userLanguage === "en" ? "English" : "Español"}
                </FormLabel>
                <Switch
                  colorScheme="pink"
                  id="language-toggle"
                  isChecked={userLanguage === "es"}
                  onChange={handleToggle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleToggle();
                    }
                  }}
                />
              </FormControl>
              <Button
                ref={firstButtonRef} // Assign the ref to the first button
                colorScheme="pink"
                background="pink.300"
                style={{ width: "100%" }}
                onClick={onSelfPacedOpen}
                p={6}
              >
                {translation[userLanguage]["settings.button.selfPace"]}
              </Button>
              <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                style={{ width: "100%" }}
                onClick={onKnowledgeLedgerOpen}
              >
                {translation[userLanguage]["settings.button.adaptiveLearning"]}
              </Button>
              <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                style={{ width: "100%" }}
                onClick={onBitcoinModeOpen}
              >
                {translation[userLanguage]["settings.button.bitcoinMode"]}
              </Button>
              <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                style={{ width: "100%" }}
                onClick={onTranscriptOpen}
              >
                {translation[userLanguage]["settings.button.transcript"]}
              </Button>
              <Button
                p={6}
                style={{ width: "100%" }}
                onClick={onSocialWalletOpen}
                variant={"outline"}
                boxShadow={"0px 0.5px 0.5px 1px black"}
              >
                {translation[userLanguage]["settings.button.socialWallet"]}
              </Button>
              <Button
                p={6}
                style={{ width: "100%" }}
                // as="a"

                onClick={() => {
                  window.open("https://chatgpt.com/g/g-LPoMAiBoa-sunset");
                }}
                variant={"outline"}
                boxShadow={"0px 0.5px 0.5px 1px black"}
              >
                <b>{translation[userLanguage]["settings.button.tutorGPT"]}</b>
              </Button>
              <Button
                p={6}
                style={{ width: "100%" }}
                // as="a"

                onClick={() => {
                  window.open("https://patreon.com/notesandotherstuff");
                }}
                variant={"outline"}
                boxShadow={"0px 0.5px 0.5px 1px black"}
              >
                <b> {translation[userLanguage]["settings.button.patreon"]}</b>
              </Button>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  onClose();
                  navigate("/about");
                }}
                p={6}
                variant={"transparent"}
              >
                {translation[userLanguage]["button.about"]}
              </Button>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  const translateValue = localStorage.getItem("userLanguage");
                  localStorage.removeItem("local_nsec");
                  localStorage.removeItem("local_npub");
                  if (translateValue) {
                    localStorage.setItem("userLanguage", translateValue);
                  }
                  onClose();
                  setView("buttons");
                  navigate("/");
                }}
                p={6}
                variant={"transparent"}
              >
                {translation[userLanguage]["settings.button.signOut"]}
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Always render modals without conditional rendering */}
      <SelfPacedModal
        isOpen={isSelfPacedOpen}
        onClose={onSelfPacedClose}
        interval={interval}
        setInterval={setIntervalState}
        userId={localStorage.getItem("local_npub")}
        userLanguage={userLanguage}
      />

      {isBitcoinModeOpen ? (
        <BitcoinModeModal
          isOpen={isBitcoinModeOpen}
          onClose={onBitcoinModeClose}
          userLanguage={userLanguage}
        />
      ) : null}

      <RoxModal
        isOpen={isRoxModalOpen}
        userLanguage={userLanguage}
        onClose={onRoxModalClose}
      />

      <SocialWalletModal
        isOpen={isSocialWalletOpen}
        onClose={onSocialWalletClose}
        userLanguage={userLanguage}
      />

      <KnowledgeLedgerModal
        userLanguage={userLanguage}
        isOpen={isKnowledgeLedgerOpen}
        onClose={onKnowledgeLedgerClose}
        steps={steps}
        currentStep={currentStep}
      />

      <FeedbackModal
        userLanguage={userLanguage}
        isOpen={isFeedbackOpen}
        onClose={onFeedbackClose}
      />

      <TranscriptModal
        userLanguage={userLanguage}
        isOpen={isTranscriptOpen}
        onClose={onTranscriptClose}
        step={step}
      />
    </>
  );
};

export default SettingsMenu;
