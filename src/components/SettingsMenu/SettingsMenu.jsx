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
  HStack,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoAppsOutline } from "react-icons/io5";

import BitcoinModeModal from "./BitcoinModeModal/BitcoinModeModal";
import RoxModal from "./RoxModal/RoxModal";
import SocialWalletModal from "./SocialWalletModal/SocialWalletModal";
import SelfPacedModal from "./SelfPacedModal/SelfPacedModal";
import { KnowledgeLedgerModal } from "./KnowledgeLedgerModal/KnowledgeLedgerModal";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import { translation } from "../../utility/translation";
import { database } from "../../database/firebaseResources";
import { doc, updateDoc } from "firebase/firestore";
import { FaBitcoin, FaRegUser } from "react-icons/fa";

import TranscriptModal from "./TranscriptModal/TranscriptModal";
import { InstallAppModal } from "../InstallModal/InstallModal";
import { AlgorithmHelper } from "../AlgorithmHelper/AlgorithmHelper";
import LiveCodeEditorModal from "../LiveCodeEditor/LiveCodeEditor";
import { CareerAgent } from "../CareerAgent/CareerAgent";
import { CopyButtonIcon } from "../../elements/CopyButtonIcon";
import { useNostrWalletStore } from "../../hooks/useNostrWalletStore";

const SettingsMenu = ({
  testIsMatch,
  isSignedIn,
  setIsSignedIn,
  steps,
  currentStep,
  userLanguage,
  setUserLanguage,
  view,
  setView,
  step,
  allowPosts,
  setAllowPosts,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const btnRef = useRef(); // Reference to the settings icon button
  const firstButtonRef = useRef(); // Reference to the first button in the drawer
  const toast = useToast();

  const { resetState, walletService } = useNostrWalletStore((state) => ({
    resetState: state.resetState, // renamed from cashTap
    walletService: state.walletService,
  }));

  const {
    isOpen: isSelfPacedOpen,
    onOpen: onSelfPacedOpen,
    onClose: onSelfPacedClose,
  } = useDisclosure();

  const {
    isOpen: isAlgorithmHelperOpen,
    onOpen: onAlgorithmHelperOpen,
    onClose: onAlgorithmHelperClose,
  } = useDisclosure();

  const {
    isOpen: isInstallModalOpen,
    onOpen: onInstallModalOpen,
    onClose: onInstallModalClose,
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

  const {
    isOpen: isCareerAgentOpen,
    onOpen: onCareerAgentOpen,
    onClose: onCareerAgentClose,
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

  const handleCopyKeys = (id) => {
    if (id) {
      const keys = id; // replace with actual keys
      navigator.clipboard.writeText(keys);
      toast({
        title: translation[userLanguage]["toast.title.idCopied"],
        description: translation[userLanguage]["toast.description.idCopied"],
        status: "info",
        duration: 1000,
        isClosable: true,
        position: "top",
        render: () => (
          <Box
            color="black"
            p={3}
            bg="#FEEBC8" // Custom background color here!
            borderRadius="md"
            boxShadow="lg"
          >
            <Text fontWeight="bold">
              {translation[userLanguage]["toast.title.idCopied"]}
            </Text>
            <Text>
              {translation[userLanguage]["toast.description.idCopied"]}
            </Text>
          </Box>
        ),
      });
    } else {
      const keys = localStorage.getItem("local_nsec"); // replace with actual keys
      navigator.clipboard.writeText(keys);
      toast({
        title: translation[userLanguage]["toast.title.keysCopied"],
        description: translation[userLanguage]["toast.description.keysCopied"],
        status: "info",
        duration: 1500,
        isClosable: true,
        position: "top",
        render: () => (
          <Box
            color="black"
            p={3}
            bg="#FEEBC8" // Custom background color here!
            borderRadius="md"
            boxShadow="lg"
          >
            <Text fontWeight="bold">
              {translation[userLanguage]["toast.title.keysCopied"]}
            </Text>
            <Text>
              {translation[userLanguage]["toast.description.keysCopied"]}
            </Text>
          </Box>
        ),
      });
    }
  };

  return (
    <>
      {isSignedIn ? (
        <IconButton
          ref={btnRef}
          icon={<IoAppsOutline />}
          onMouseDown={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onOpen();
            }
          }}
          // variant="outline"
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
          position="fixed"
          top={4}
          right={4}
          style={{ backgroundColor: "white", zIndex: 1000 }}
          aria-label="Settings"
        />
      ) : null}
      {/* {isSignedIn && testIsMatch ? (
        <IconButton
          ref={btnRef}
          icon={<FaBitcoin />}
          onClick={onBitcoinModeOpen}
          // variant="outline"
          boxShadow="0px 1px 1px 2px lightgray"
          position="fixed"
          // color="orange"
          top={16}
          right={4}
          style={{ backgroundColor: "white", zIndex: 1000 }}
          aria-label="Bitcoin"
        />
      ) : null} */}
      <Drawer
        position="absolute"
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
              <HStack>
                <Button
                  style={{
                    display: "flex",
                  }}
                  tabIndex={0}
                  onMouseDown={() => {
                    handleCopyKeys(localStorage.getItem("local_npub") || "");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCopyKeys(localStorage.getItem("local_npub") || "");
                    }
                  }}
                >
                  {/* <div style={{ width: "min-content" }}>
                    <CopyButtonIcon color="black" />
                  </div>
                  &nbsp; */}
                  <HStack>
                    <FaRegUser />
                    <span>{translation[userLanguage]["yourID"]}</span>
                  </HStack>
                </Button>

                <Button
                  style={{
                    display: "flex",
                  }}
                  tabIndex={0}
                  onMouseDown={() => {
                    handleCopyKeys();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCopyKeys();
                    }
                  }}
                >
                  {/* <div style={{ width: "min-content" }}>
                    <CopyButtonIcon color="black" />
                  </div>
                  &nbsp; */}
                  <div>
                    🔑 {translation[userLanguage]["button.secretKey"]}
                    {/* <b>{translation[userLanguage]["yourID"]}</b> */}
                    {/* &nbsp;
                  {localStorage?.getItem("local_npub")?.substr(0, 16) || ""} */}
                  </div>
                </Button>
              </HStack>
              {/* <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                style={{ width: "100%" }}
                onMouseDown={onCareerAgentOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onCareerAgentOpen();
                  }
                }}
              >
                Career Agent
              </Button> */}
              {/* <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                boxShadow="1px 1px 2px 0px rgba(207, 128, 197,0.75)"
                style={{ width: "100%" }}
                onMouseDown={onBitcoinModeOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCopyKeys();
                  }
                }}
              >
                <FaBitcoin />
                &nbsp;
                {translation[userLanguage]["settings.button.bitcoinMode"]}
              </Button> */}
              <Button
                ref={firstButtonRef} // Assign the ref to the first button
                colorScheme="pink"
                background="pink.300"
                boxShadow="1px 1px 2px 0px rgba(207, 128, 197,0.75)"
                style={{ width: "100%" }}
                onMouseDown={onSelfPacedOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelfPacedOpen();
                  }
                }}
                p={6}
              >
                {translation[userLanguage]["settings.button.selfPace"]}
              </Button>
              {/* <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                style={{ width: "100%" }}
                onClick={onKnowledgeLedgerOpen}
              >
                {translation[userLanguage]["settings.button.adaptiveLearning"]}
              </Button> */}

              {userLanguage === "en" ? (
                <Button
                  p={6}
                  colorScheme="pink"
                  background="pink.300"
                  boxShadow="1px 1px 2px 0px rgba(207, 128, 197,0.75)"
                  style={{ width: "100%" }}
                  onMouseDown={onAlgorithmHelperOpen}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onAlgorithmHelperOpen();
                    }
                  }}
                >
                  {translation[userLanguage]["settings.button.algorithmHelper"]}
                </Button>
              ) : null}
              <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                boxShadow="1px 1px 2px 0px rgba(207, 128, 197,0.75)"
                style={{ width: "100%" }}
                onMouseDown={onTranscriptOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onTranscriptOpen();
                  }
                }}
              >
                {translation[userLanguage]["settings.button.transcript"]}
              </Button>
              <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                boxShadow="1px 1px 2px 0px rgba(207, 128, 197,0.75)"
                style={{ width: "100%" }}
                onMouseDown={onInstallModalOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onInstallModalOpen();
                  }
                }}
              >
                {translation[userLanguage]["installApp"]}
              </Button>
              <Button
                p={6}
                style={{ width: "100%" }}
                onMouseDown={onSocialWalletOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSocialWalletOpen();
                  }
                }}
                variant={"outline"}
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
              >
                {translation[userLanguage]["settings.button.socialWallet"]}
              </Button>
              {/* <Button
                p={6}
                style={{ width: "100%" }}
                // as="a"

                onClick={() => {
                  window.open(
                    "https://chatgpt.com/g/g-LPoMAiBoa-robots-building-education"
                  );
                }}
                variant={"outline"}
                boxShadow={"0px 0.5px 0.5px 1px black"}
              >
                <b>{translation[userLanguage]["settings.button.tutorGPT"]}</b>
              </Button> */}
              <Button
                p={6}
                style={{ width: "100%" }}
                // as="a"
                onMouseDown={() => {
                  window.open(
                    "https://github.com/RobotsBuildingEducation/RobotsBuildingEducation/blob/main/README.md"
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.open(
                      "https://github.com/RobotsBuildingEducation/RobotsBuildingEducation/blob/main/README.md"
                    );
                  }
                }}
                variant={"outline"}
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
              >
                <b>{translation[userLanguage]["settings.button.studyGuide"]}</b>
              </Button>
              <Button
                p={6}
                style={{ width: "100%" }}
                // as="a"

                onMouseDown={() => {
                  window.open(
                    "https://patreon.com/notesandotherstuff/membership"
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.open(
                      "https://patreon.com/notesandotherstuff/membership"
                    );
                  }
                }}
                variant={"outline"}
                boxShadow={"0px 0.5px 0.5px 1px black"}
                border="2px solid gold"
              >
                <b> {translation[userLanguage]["settings.button.patreon"]}</b>
              </Button>

              <Button
                style={{ width: "100%" }}
                onMouseDown={() => {
                  onClose();
                  navigate("/about");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onClose();
                    navigate("/about");
                  }
                }}
                p={6}
                variant={"transparent"}
              >
                {translation[userLanguage]["button.about"]}
              </Button>
              <Button
                style={{ width: "100%" }}
                onMouseDown={() => {
                  // walletService.stop();
                  resetState();
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
                onKeyDown={(e) => {
                  // walletService.stop();
                  resetState();

                  if (e.key === "Enter" || e.key === " ") {
                    const translateValue = localStorage.getItem("userLanguage");
                    localStorage.removeItem("local_nsec");
                    localStorage.removeItem("local_npub");
                    if (translateValue) {
                      localStorage.setItem("userLanguage", translateValue);
                    }
                    onClose();
                    setView("buttons");
                    navigate("/");
                  }
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
      {isSelfPacedOpen ? (
        <SelfPacedModal
          isOpen={isSelfPacedOpen}
          onClose={onSelfPacedClose}
          interval={interval}
          setInterval={setIntervalState}
          userId={localStorage.getItem("local_npub")}
          userLanguage={userLanguage}
        />
      ) : null}

      {isBitcoinModeOpen ? (
        <BitcoinModeModal
          isOpen={isBitcoinModeOpen}
          onClose={onBitcoinModeClose}
          userLanguage={userLanguage}
        />
      ) : null}

      {/* I dont think this is in use anymore */}
      {isRoxModalOpen ? (
        <RoxModal
          isOpen={isRoxModalOpen}
          userLanguage={userLanguage}
          onClose={onRoxModalClose}
        />
      ) : null}

      {isSocialWalletOpen ? (
        <SocialWalletModal
          isOpen={isSocialWalletOpen}
          onClose={onSocialWalletClose}
          userLanguage={userLanguage}
        />
      ) : null}
      {/* {isKnowledgeLedgerOpen ? (
        <KnowledgeLedgerModal
          userLanguage={userLanguage}
          isOpen={isKnowledgeLedgerOpen}
          onClose={onKnowledgeLedgerClose}
          steps={steps}
          currentStep={currentStep}
        />
      ) : null} */}

      {isAlgorithmHelperOpen ? (
        <AlgorithmHelper
          userLanguage={userLanguage}
          isOpen={isAlgorithmHelperOpen}
          onClose={onAlgorithmHelperClose}
          steps={steps}
          currentStep={currentStep}
        />
      ) : null}

      {/* not in use anymore */}
      {isFeedbackOpen ? (
        <FeedbackModal
          userLanguage={userLanguage}
          isOpen={isFeedbackOpen}
          onClose={onFeedbackClose}
        />
      ) : null}

      {isTranscriptOpen ? (
        <TranscriptModal
          userLanguage={userLanguage}
          isOpen={isTranscriptOpen}
          onClose={onTranscriptClose}
          step={step}
        />
      ) : null}

      {isTranscriptOpen ? (
        <TranscriptModal
          userLanguage={userLanguage}
          isOpen={isTranscriptOpen}
          onClose={onTranscriptClose}
          step={step}
        />
      ) : null}

      {isInstallModalOpen ? (
        <InstallAppModal
          userLanguage={userLanguage}
          isOpen={isInstallModalOpen}
          onClose={onInstallModalClose}
        />
      ) : null}

      {isCareerAgentOpen ? (
        <CareerAgent
          userLanguage={userLanguage}
          isOpen={isCareerAgentOpen}
          onClose={onCareerAgentClose}
        />
      ) : null}
    </>
  );
};

export default SettingsMenu;
