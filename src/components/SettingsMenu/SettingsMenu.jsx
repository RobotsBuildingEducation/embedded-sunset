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
  Select,
  MenuItem,
  MenuList,
  MenuButton,
  Menu,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { IoAppsOutline } from "react-icons/io5";

import BitcoinModeModal from "./BitcoinModeModal/BitcoinModeModal";
import RoxModal from "./RoxModal/RoxModal";
import SocialWalletModal from "./SocialWalletModal/SocialWalletModal";

import FeedbackModal from "./FeedbackModal/FeedbackModal";
import { translation } from "../../utility/translation";
import { database } from "../../database/firebaseResources";
import { doc, updateDoc } from "firebase/firestore";
import { FaRegUser } from "react-icons/fa";

import TranscriptModal from "./TranscriptModal/TranscriptModal";
import { InstallAppModal } from "../InstallModal/InstallModal";
import { AlgorithmHelper } from "../AlgorithmHelper/AlgorithmHelper";

import { CareerAgent } from "../CareerAgent/CareerAgent";

import { useNostrWalletStore } from "../../hooks/useNostrWalletStore";
import StudyGuideModal from "../StudyGuideModal/StudyGuideModal";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { ChangeLanguageModal } from "../ChangeLanguageModal/ChangeLanguageModal";
import { soundManager } from "../../utility/soundManager";

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
  actionTourStep,
  isActionTourActive,
  onActionTourAdvance,
  onActionTourComplete,
  menuButtonRef,
  menuTourStep,
  allowPosts,
  setAllowPosts,
  soundEnabled,
  setSoundEnabled,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const btnRef = menuButtonRef || useRef(); // Reference to the settings icon button
  const firstButtonRef = useRef(); // Reference to the first button in the drawer
  const toast = useToast();

  const { resetState, walletService } = useNostrWalletStore((state) => ({
    resetState: state.resetState, // renamed from cashTap
    walletService: state.walletService,
  }));

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

  const {
    isOpen: isStudyGuideModalOpen,
    onOpen: onStudyGuideModalOpen,
    onClose: onStudyGuideModalClose,
  } = useDisclosure();

  const {
    isOpen: isLangOpen,
    onOpen: onLangOpen,
    onClose: onLangClose,
  } = useDisclosure();

  // const [interval, setIntervalState] = useState(2880);

  const handleToggle = async () => {
    const newLanguage = userLanguage.includes("en") ? "es" : "en";
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
    if (isSignedIn && localStorage.getItem("local_npub")?.length > 0) {
      const userDocRef = doc(
        database,
        "users",
        localStorage.getItem("local_npub")
      );
      updateDoc(userDocRef, {
        language: userLanguage,
      });
    }
  }, [userLanguage]);

  // Manually focus the first button when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);
  const handleLanguageSelect = async (value) => {
    setUserLanguage(value);
    localStorage.setItem("userLanguage", value);
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      const userDoc = doc(database, "users", npub);
      await updateDoc(userDoc, { language: value });
    }
    // onLangClose();
  };

  const handleToggleAllowPosts = async (e) => {
    soundManager.resume();
    soundManager.play("modeSwitch");
    const newValue = e.target.checked;
    setAllowPosts(newValue);
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      const userDocRef = doc(database, "users", npub);
      await updateDoc(userDocRef, { allowPosts: newValue });
    }
  };

  const handleToggleSound = (e) => {
    soundManager.resume();
    soundManager.play("modeSwitch");
    setSoundEnabled(e.target.checked);
  };

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

  const isMenuTourStep =
    isActionTourActive && actionTourStep === 0 && menuTourStep;

  const handleMenuTourNext = () => {
    if (onActionTourAdvance) {
      onActionTourAdvance();
    }
  };

  const handleMenuTourSkip = () => {
    if (onActionTourComplete) {
      onActionTourComplete();
    }
  };

  const menuButton = (
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
  );

  return (
    <>
      {isSignedIn && localStorage.getItem("local_npub") ? (
        isMenuTourStep ? (
          <Popover
            isOpen={isMenuTourStep}
            closeOnBlur={false}
            placement={menuTourStep?.placement || "bottom-end"}
            strategy="fixed"
          >
            <PopoverTrigger>{menuButton}</PopoverTrigger>
            <Portal>
              <PopoverContent maxW="280px">
                <PopoverArrow />

                <PopoverHeader fontWeight="bold">
                  {menuTourStep?.title}
                </PopoverHeader>
                <PopoverBody>
                  <Text fontSize="sm">{menuTourStep?.description}</Text>
                  <HStack justifyContent="flex-end" mt={3} spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="pink"
                      onMouseDown={handleMenuTourNext}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleMenuTourNext();
                        }
                      }}
                    >
                      {translation[userLanguage]["actionTour.next"]}
                    </Button>
                  </HStack>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        ) : (
          <Box ref={btnRef} display="inline-flex">
            {menuButton}
          </Box>
        )
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

              <FormControl display="flex" alignItems="center" width="100%">
                <FormLabel htmlFor="allow-posts-menu-switch" mb="0" flex="1">
                  {translation[userLanguage]["tag.allowPosting"]}
                </FormLabel>
                <Switch
                  id="allow-posts-menu-switch"
                  isChecked={allowPosts}
                  onChange={handleToggleAllowPosts}
                  colorScheme="pink"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" width="100%">
                <FormLabel htmlFor="sound-effects-menu-switch" mb="0" flex="1">
                  Sound effects
                </FormLabel>
                <Switch
                  id="sound-effects-menu-switch"
                  isChecked={soundEnabled}
                  onChange={handleToggleSound}
                  colorScheme="pink"
                />
              </FormControl>

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

              {localStorage.getItem("passcode") !==
              import.meta.env.VITE_PATREON_PASSCODE ? (
                <Button
                  p={6}
                  w="100%"
                  color="#2e2200"
                  fontWeight="700"
                  bgGradient="linear(to-r, #f6e7b6 0%,rgb(248, 233, 137) 50%,rgb(248, 234, 108) 100%)"
                  border="1px solid #c4a035"
                  borderRadius="md"
                  transition="opacity .15s ease"
                  _hover={{ opacity: 0.98 }}
                  _active={{ opacity: 0.95 }}
                  onMouseDown={() =>
                    window.open("https://patreon.com/notesandotherstuff/about")
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.open(
                        "https://patreon.com/notesandotherstuff/about"
                      );
                    }
                  }}
                >
                  {translation[userLanguage]["settings.button.patreon"]}
                </Button>
              ) : null}

              <Button
                background="pink.300"
                color="white"
                width="100%"
                onClick={onLangOpen}
                ref={firstButtonRef}
              >
                {translation[userLanguage]["settings.button.changeLanguage"]}
              </Button>

              <Button
                onMouseDown={onStudyGuideModalOpen}
                p={6}
                colorScheme="pink"
                background="pink.300"
                boxShadow="1px 1px 2px 0px rgba(0, 0, 0,0.75)"
                style={{ width: "100%" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onStudyGuideModalOpen();
                  }
                }}
              >
                {translation[userLanguage]["settings.button.studyGuide"]}
              </Button>
              <Button
                p={6}
                colorScheme="pink"
                background="pink.300"
                boxShadow="1px 1px 2px 0px rgba(0, 0, 0,0.75)"
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
                boxShadow="1px 1px 2px 0px rgba(0, 0, 0,0.75)"
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
              <Button
                p={6}
                style={{ width: "100%" }}
                // as="a"

                onClick={() => {
                  window.open(
                    "https://chatgpt.com/g/g-LPoMAiBoa-robots-building-education"
                  );
                }}
                variant={"outline"}
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
              >
                {translation[userLanguage]["settings.button.tutorGPT"]}
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
                  window.location.reload();
                }}
                onKeyDown={(e) => {
                  // walletService.stop();
                  resetState();
                  setIsSignedIn(false);
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
                    window.location.reload();
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

      {isStudyGuideModalOpen ? (
        <StudyGuideModal
          isOpen={isStudyGuideModalOpen}
          onClose={onStudyGuideModalClose}
          content={steps[userLanguage][0].question.metaData}
          userLanguage={userLanguage}
        />
      ) : null}

      {isLangOpen ? (
        <ChangeLanguageModal
          userLanguage={userLanguage}
          isOpen={isLangOpen}
          onClose={onLangClose}
          onSelect={handleLanguageSelect}
        />
      ) : null}
    </>
  );
};

export default SettingsMenu;
