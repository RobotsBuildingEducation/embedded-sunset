import "regenerator-runtime/runtime";
import "@babel/polyfill";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Switch,
  Progress,
  useDisclosure,
  Select,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { GiBullseye } from "react-icons/gi";
import { TbBellHeart } from "react-icons/tb";

import {
  incrementUserOnboardingStep,
  setOnboardingToDone,
} from "./utility/nosql";

import { translation } from "./utility/translation";

import RandomCharacter, {
  FadeInComponent,
  PanRightComponent,
  RiseUpAnimation,
} from "./elements/RandomCharacter";

import BitcoinOnboarding from "./components/BitcoinOnboarding/BitcoinOnboarding";
import SelfPacedOnboarding from "./components/SettingsMenu/SelfPacedModal/SelfPacedOnboarding";
import { database, messaging } from "./database/firebaseResources";
import { isUnsupportedBrowser } from "./utility/browser";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";

import { LuPuzzle } from "react-icons/lu";
import { FaBitcoin, FaCode } from "react-icons/fa";

import KnowledgeLedgerOnboarding from "./components/KnowledgeLedgerOnboarding/KnowledgeLedgerOnboarding";
import { Image } from "@chakra-ui/image";
import AwardModalOnboarding from "./components/AwardModalOnboarding/AwardModalOnboarding";
import { onboardingTranscript } from "./utility/transcript";
import { useSharedNostr } from "./hooks/useNOSTR";
import { TechOverview } from "./components/TechOverview/TechOverview";
import { ChevronDownIcon } from "@chakra-ui/icons";
import WaveBar from "./components/WaveBar";

export const Onboarding = ({
  userLanguage,
  setUserLanguage,
  setCurrentStep,
}) => {
  const { assignExistingBadgeToNpub } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  const { step } = useParams();
  const [interval, setInterval] = useState(2880);
  const navigate = useNavigate();
  const toast = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const {
    isOpen: isAwardModalOpen,
    onOpen: onAwardModalOpen,
    onClose: onAwardModalClose,
  } = useDisclosure();

  const handleActuallyLaunchApp = () => {
    // setOnboardingToDone(localStorage.getItem("local_npub"));
    assignExistingBadgeToNpub(
      onboardingTranscript["name"][userLanguage].replace(/ /g, "-")
    );

    // navigate("/q/0");
    onAwardModalOpen();
  };

  const handleActuallyReallySeriouslyLaunchApp = () => {
    setOnboardingToDone(localStorage.getItem("local_npub"), 5);

    setCurrentStep(5);
    navigate("/q/5");
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    async function fetchNotificationStatus() {
      const userDocRef = doc(
        database,
        "users",
        localStorage.getItem("local_npub")
      );
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // If the user has an FCM token, consider notifications enabled.
          if (userData.fcmToken) {
            setNotificationsEnabled(true);
          } else {
            setNotificationsEnabled(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchNotificationStatus();
  }, []);

  const handleToggleNotifications = async () => {
    const userDocRef = doc(
      database,
      "users",
      localStorage.getItem("local_npub")
    );

    if (!notificationsEnabled) {
      // Enable notifications: request permission and get token
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(true);
      if (permission === "granted") {
        try {
          const token = await getToken(messaging, {
            vapidKey:
              "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
          });

          // Save the token in Firestore
          updateDoc(userDocRef, { fcmToken: token });
        } catch (error) {
          console.error("Error retrieving FCM token:", error);
          setNotificationsEnabled(false);
        }
      } else {
        console.log("Notification permission not granted.");
        setNotificationsEnabled(false);
      }
    } else {
      // Disable notifications: delete the token and update Firestore
      try {
        const currentToken = await getToken(messaging, {
          vapidKey:
            "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
        });
        if (currentToken) {
          const success = await deleteToken(messaging, currentToken);
          if (success) {
            console.log("FCM token deleted successfully.");
          } else {
            console.error("Failed to delete token.");
          }
        }
        // Remove token from Firestore
        await updateDoc(userDocRef, { fcmToken: null });
        setNotificationsEnabled(false);
      } catch (error) {
        console.error("Error deleting FCM token:", error);
      }
    }
  };

  // inside Onboarding, before the return
  const handleLanguageSelect = async (e) => {
    const newLanguage = e.target.value;
    setUserLanguage(newLanguage);
    localStorage.setItem("userLanguage", newLanguage);

    const npub = localStorage.getItem("local_npub");
    if (npub) {
      const userDoc = doc(database, "users", npub);
      await updateDoc(userDoc, { language: newLanguage });
    }
  };

  const renderNotifications = () => {
    if (messaging) {
      // the app has been installed
      return (
        <VStack>
          <Box textAlign="left" fontSize="md" mb={2} width="100%">
            {translation[userLanguage].notifications_available_line1}
          </Box>

          <Box textAlign="left" fontSize="md" mb={4}>
            {translation[userLanguage].notifications_available_line2}
          </Box>

          <Text fontSize="sm" mb={1}>
            {notificationsEnabled
              ? translation[userLanguage].notifications_status_enabled
              : translation[userLanguage].notifications_status_disabled}
          </Text>
          <Switch
            isChecked={notificationsEnabled}
            onChange={() => {
              if (messaging) {
                handleToggleNotifications();
              } else {
              }
            }}
            size="lg"
            colorScheme="green"
          />

          <br />
        </VStack>
      );
    } else {
      // can't use this
      return (
        <VStack textAlign="left" fontSize="md" mb={10}>
          <Text mb={1}>
            {translation[userLanguage].notifications_unavailable_line1.replace(
              "{browser}",
              isUnsupportedBrowser()
            )}
          </Text>

          <Text mb={1}>
            {translation[userLanguage].notifications_unavailable_line2}
          </Text>

          <Text mb={1}>
            {translation[userLanguage].notifications_unavailable_line3}
          </Text>

          <Text width="100%" mb={3}>
            <b>
              {translation[userLanguage].notifications_installation_directions}
            </b>
          </Text>
          <Text fontSize="sm" mb={1}>
            {translation[userLanguage].notificationsDisabled}
          </Text>
          <Switch
            isChecked={notificationsEnabled}
            onChange={handleToggleNotifications}
            size="lg"
            colorScheme="green"
            disabled={true}
          />
        </VStack>
      );
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      mt={16}
      p={4}
      pb={12}
    >
      {/* <Button
        variant={"ghost"}
        backgroundColor="#fcf3eb"
        size="sm"
        mb={3}
        boxShadow={"0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"}
        onClick={handleActuallyLaunchApp}
      >
        Skip Account Setup
      </Button> */}

      {step === "1" ? (
        <Box
          textAlign="center"
          p={0}
          style={{
            height: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "95%",
            maxWidth: 600,
            // width: "100%",
          }}
          spacing={4}
        >
          <KnowledgeLedgerOnboarding
            userLanguage={userLanguage}
            moveToNext={() => {
              incrementUserOnboardingStep(localStorage.getItem("local_npub"));
              setCurrentStep(0);
              navigate("/q/0");
            }}
          />
        </Box>
      ) : (
        <Box
          textAlign="center"
          p={0}
          style={{
            height: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 600,
            width: "100%",
          }}
        >
          {/* Step 1: Introduction to the Challenge */}
          {step === "2" && (
            <VStack spacing={4}>
              <Box>
                <Text fontSize={"xs"}>
                  {" "}
                  {translation[userLanguage]["onboardingProgress"]}
                </Text>
                {/* <Progress
                  opacity="0.8"
                  border="1px solid #ececec"
                  // boxShadow="0px 0px 0.5px 2px #ececec"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  value={(2 / 7) * 100}
                  size="md"
                  colorScheme={"green"}
                  width="250px"
                  mb={4}
                  borderRadius="4px"
                  background={"#ececec"}
                /> */}
                <Box width="250px" mb={4}>
                  <WaveBar
                    value={(2 / 7) * 100}
                    start="#02fabc"
                    end="#12ff69"
                    delay={0}
                    bg="rgba(255,255,255,0.65)"
                    border="#ededed"
                  />
                </Box>
              </Box>
              <RiseUpAnimation>
                <Box
                  borderRadius="24px"
                  borderBottomRightRadius="0px"
                  p={4}
                  textAlign="center"
                  backgroundColor="white"
                  boxShadow="0.5px 0.5px 1px 0px black"
                >
                  <Text
                    mb={2}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <LuPuzzle color="#53bd91" />
                    &nbsp;
                    {
                      translation[userLanguage][
                        "onboarding.step1.challengeTitle"
                      ]
                    }
                  </Text>
                  <div
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      loading="eager"
                      width="400px"
                      src={
                        userLanguage === "es"
                          ? "https://res.cloudinary.com/dtkeyccga/image/upload/v1741230168/Add_a_subheading_2_d2uv03.png"
                          : "https://res.cloudinary.com/dtkeyccga/image/upload/v1741218674/Add_a_subheading_1_lsi5fw.png"
                      }
                      alt="Challenge Illustration"
                    />
                  </div>
                  <Text
                    fontSize="md"
                    style={{ marginBottom: 12, textAlign: "left" }}
                  >
                    {
                      translation[userLanguage][
                        "onboarding.step1.challengeText1"
                      ]
                    }
                  </Text>
                  <Text
                    fontSize="md"
                    style={{ marginBottom: 12, textAlign: "left" }}
                  >
                    {
                      translation[userLanguage][
                        "onboarding.step1.challengeText2"
                      ]
                    }
                  </Text>
                  <Text
                    fontSize="md"
                    style={{ marginBottom: 12, textAlign: "left" }}
                  >
                    {
                      translation[userLanguage][
                        "onboarding.step1.challengeText3"
                      ]
                    }
                  </Text>

                  <Accordion allowMultiple>
                    <AccordionItem>
                      <AccordionButton padding={6}>
                        <Box flex="1" textAlign="left">
                          {
                            translation[userLanguage][
                              "onboarding.step1.accordionTitle"
                            ]
                          }
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter0.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter0.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter0.content"
                              ]
                            }
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter1.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter1.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter1.content"
                              ]
                            }
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter2.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter2.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter2.content"
                              ]
                            }
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter3.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter3.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter3.content"
                              ]
                            }
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter4.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter4.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter4.content"
                              ]
                            }
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter5.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter5.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter5.content"
                              ]
                            }
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {
                              translation[userLanguage][
                                "onboarding.chapter6.title"
                              ]
                            }
                          </Text>
                          <Text fontSize="xs" mb={2}>
                            {
                              translation[userLanguage][
                                "onboarding.chapter6.questions"
                              ]
                            }
                          </Text>
                          <p>
                            {
                              translation[userLanguage][
                                "onboarding.chapter6.content"
                              ]
                            }
                          </p>
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton padding={6}>
                        <Box flex="1" textAlign="left">
                          FAQs
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_1_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_1_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_1_item_2"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_1_item_3"]}
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_2_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_2_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_2_item_2"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_2_item_3"]}
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_3_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_3_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_3_item_2"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_3_item_3"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_3_item_4"]}
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_4_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_4_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_4_item_2"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_4_item_3"]}
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_5_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_5_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_5_item_2"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_5_item_3"]}
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_6_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_6_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_6_item_2"]}
                          </p>
                        </Text>
                        <Text
                          textAlign="left"
                          fontSize="sm"
                          style={{ marginBottom: "20px" }}
                        >
                          <Text fontWeight="bold">
                            {translation[userLanguage]["faq_7_question"]}
                          </Text>
                          <p>
                            {translation[userLanguage]["faq_7_item_1"]}
                            <br />
                            <br />
                            {translation[userLanguage]["faq_7_item_2"]}
                          </p>
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                  <br />
                  <br />
                  <Button
                    onClick={() => {
                      incrementUserOnboardingStep(
                        localStorage.getItem("local_npub")
                      );
                      setCurrentStep(1);
                      navigate("/q/1");
                    }}
                    boxShadow="0.5px 0.5px 1px 0px black"
                    mb={18}
                  >
                    {translation[userLanguage]["onboarding.step1.buttonLabel"]}
                  </Button>
                </Box>
              </RiseUpAnimation>

              <div style={{ width: "100%" }}>
                <FadeInComponent>
                  <div
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <img
                      style={{ marginBottom: 8, width: "60px" }}
                      src="https://res.cloudinary.com/dtkeyccga/image/upload/v1737544415/character_stickers_4_miarcs.png"
                      alt="Character Sticker"
                    />
                  </div>
                </FadeInComponent>
              </div>
            </VStack>
          )}

          {/* Step 2: Setting up Daily Goals */}
          {step === "3" && (
            <VStack spacing={4}>
              <Box>
                <Text fontSize={"sm"}>
                  {" "}
                  {translation[userLanguage]["onboardingProgress"]}
                </Text>
                {/* <Progress
                  opacity="0.8"
                  border="1px solid #ececec"
                  // boxShadow="0px 0px 0.5px 2px #ececec"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  value={(3 / 7) * 100}
                  size="md"
                  colorScheme={"green"}
                  width="250px"
                  mb={4}
                  borderRadius="4px"
                  background={"#ececec"}
                /> */}
                <Box width="250px" mb={4}>
                  <WaveBar
                    value={(3 / 7) * 100}
                    start="#02fabc"
                    end="#12ff69"
                    delay={0}
                    bg="rgba(255,255,255,0.65)"
                    border="#ededed"
                  />
                </Box>
              </Box>
              <FadeInComponent>
                <Box
                  borderRadius="24px"
                  borderBottomRightRadius="0px"
                  p={4}
                  textAlign="center"
                  backgroundColor="white"
                  boxShadow="0.5px 0.5px 1px 0px black"
                >
                  <Text
                    mb={6}
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <GiBullseye color="#fa6b83" />
                    &nbsp;
                    {
                      translation[userLanguage][
                        "onboarding.step2.dailyGoalsTitle"
                      ]
                    }
                  </Text>

                  <SelfPacedOnboarding
                    interval={interval}
                    setInterval={setInterval}
                    userId={localStorage.getItem("local_npub")}
                    userLanguage={userLanguage}
                    setCurrentStep={setCurrentStep}
                  />
                </Box>
              </FadeInComponent>
              <div style={{ width: "100%" }}>
                <RiseUpAnimation>
                  <div
                    style={{
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "-36px",
                      width: "100%",
                    }}
                  >
                    <RandomCharacter />
                  </div>
                </RiseUpAnimation>
              </div>
            </VStack>
          )}

          {/* New Step 4: Choose your language */}
          {step === "4" && (
            <VStack spacing={4}>
              <Box>
                <Text fontSize="sm">
                  {translation[userLanguage]["onboardingProgress"]}
                </Text>
                {/* 
                <Progress
                  opacity="0.8"
                  border="1px solid #ececec"
                  // boxShadow="0px 0px 0.5px 2px #ececec"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  value={(4 / 7) * 100}
                  size="md"
                  colorScheme={"green"}
                  width="250px"
                  mb={4}
                  borderRadius="4px"
                  background={"#ececec"}
                /> */}

                <Box width="250px" mb={4}>
                  <WaveBar
                    value={(4 / 7) * 100}
                    start="#02fabc"
                    end="#12ff69"
                    delay={0}
                    bg="rgba(255,255,255,0.65)"
                    border="#ededed"
                  />
                </Box>
              </Box>

              <RiseUpAnimation>
                <Box
                  borderRadius="24px"
                  p={4}
                  bg="white"
                  boxShadow="0.5px 0.5px 1px black"
                >
                  <Text
                    mb={6}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FaCode color="#9f6bfa" />
                    &nbsp;
                    {translation[userLanguage]["onboarding.languages.title"]}
                  </Text>

                  <Text mb={6} textAlign="left" fontSize="sm" width="100%">
                    {
                      translation[userLanguage][
                        "onboarding.languages.description"
                      ]
                    }
                  </Text>

                  {/* Replace Select with Menu */}
                  <Menu width="100%" mb={6}>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      width="250px"
                      boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    >
                      {
                        {
                          en: translation[userLanguage][
                            "language.javascript.english"
                          ],
                          es: translation[userLanguage][
                            "language.javascript.spanish"
                          ],
                          "py-en":
                            translation[userLanguage][
                              "language.python.english"
                            ],
                          "swift-en":
                            translation[userLanguage]["language.swift.english"],
                          "android-en":
                            translation[userLanguage][
                              "language.android.english"
                            ],
                          "compsci-en":
                            translation[userLanguage][
                              "language.compsci.english"
                            ],
                        }[userLanguage]
                      }
                    </MenuButton>
                    <MenuList boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)">
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({ target: { value: "en" } })
                        }
                      >
                        {
                          translation[userLanguage][
                            "language.javascript.english"
                          ]
                        }
                      </MenuItem>
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({ target: { value: "es" } })
                        }
                      >
                        {
                          translation[userLanguage][
                            "language.javascript.spanish"
                          ]
                        }
                      </MenuItem>
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({ target: { value: "py-en" } })
                        }
                      >
                        {translation[userLanguage]["language.python.english"]}
                      </MenuItem>
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({
                            target: { value: "swift-en" },
                          })
                        }
                      >
                        {translation[userLanguage]["language.swift.english"]}
                      </MenuItem>
                      <MenuItem
                        p={6}
                        onClick={() =>
                          handleLanguageSelect({
                            target: { value: "android-en" },
                          })
                        }
                      >
                        {translation[userLanguage]["language.android.english"]}
                      </MenuItem>

                      <MenuItem
                        p={6}
                        onClick={() =>
                          handleLanguageSelect({
                            target: { value: "compsci-en" },
                          })
                        }
                      >
                        {translation[userLanguage]["language.compsci.english"]}
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <TechOverview userLanguage={userLanguage} />

                  <Menu width="100%" mb={6}>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      width="250px"
                      boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    >
                      {
                        {
                          en: translation[userLanguage][
                            "language.javascript.english"
                          ],
                          es: translation[userLanguage][
                            "language.javascript.spanish"
                          ],
                          "py-en":
                            translation[userLanguage][
                              "language.python.english"
                            ],
                          "swift-en":
                            translation[userLanguage]["language.swift.english"],
                          "android-en":
                            translation[userLanguage][
                              "language.android.english"
                            ],
                          "compsci-en":
                            translation[userLanguage][
                              "language.compsci.english"
                            ],
                        }[userLanguage]
                      }
                    </MenuButton>
                    <MenuList boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)">
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({ target: { value: "en" } })
                        }
                      >
                        {
                          translation[userLanguage][
                            "language.javascript.english"
                          ]
                        }
                      </MenuItem>
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({ target: { value: "es" } })
                        }
                      >
                        {
                          translation[userLanguage][
                            "language.javascript.spanish"
                          ]
                        }
                      </MenuItem>
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({ target: { value: "py-en" } })
                        }
                      >
                        {translation[userLanguage]["language.python.english"]}
                      </MenuItem>
                      <MenuItem
                        p={6}
                        borderBottom="1px solid #ececec"
                        onClick={() =>
                          handleLanguageSelect({
                            target: { value: "swift-en" },
                          })
                        }
                      >
                        {translation[userLanguage]["language.swift.english"]}
                      </MenuItem>
                      <MenuItem
                        p={6}
                        onClick={() =>
                          handleLanguageSelect({
                            target: { value: "android-en" },
                          })
                        }
                      >
                        {translation[userLanguage]["language.android.english"]}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  <br />
                  <br />
                  <br />
                  <Button
                    onClick={() => {
                      incrementUserOnboardingStep(
                        localStorage.getItem("local_npub")
                      );
                      setCurrentStep(3);
                      navigate("/q/3");
                    }}
                    boxShadow="0.5px 0.5px 1px 0px black"
                    mb={18}
                  >
                    {translation[userLanguage]["button.setLanguage"]}
                  </Button>
                </Box>
              </RiseUpAnimation>

              <Box
                width="100%"
                display="flex"
                justifyContent="flex-end"
                mt="-36px"
              >
                <RiseUpAnimation>
                  <Box>
                    <RandomCharacter />
                  </Box>
                </RiseUpAnimation>
              </Box>
            </VStack>
          )}

          {step === "5" && (
            <VStack spacing={4}>
              <Box>
                <Text fontSize={"sm"}>
                  {" "}
                  {translation[userLanguage]["onboardingProgress"]}
                </Text>
                {/* <Progress
                  opacity="0.8"
                  border="1px solid #ececec"
                  // boxShadow="0px 0px 0.5px 2px #ececec"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  value={(5 / 7) * 100}
                  size="md"
                  colorScheme={"green"}
                  width="250px"
                  mb={4}
                  borderRadius="4px"
                  background={"#ececec"}
                /> */}
                <Box width="250px" mb={4}>
                  <WaveBar
                    value={(5 / 7) * 100}
                    start="#02fabc"
                    end="#12ff69"
                    delay={0}
                    bg="rgba(255,255,255,0.65)"
                    border="#ededed"
                  />
                </Box>
              </Box>
              <RiseUpAnimation>
                <Box
                  borderRadius="24px"
                  borderBottomRightRadius="0px"
                  p={4}
                  textAlign="center"
                  backgroundColor="white"
                  boxShadow="0.5px 0.5px 1px 0px black"
                >
                  <Text
                    mb={2}
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <TbBellHeart color="#537dbd" />
                    &nbsp;
                    {translation[userLanguage].notificationsHeader}
                  </Text>
                  {renderNotifications()}
                  <Button
                    onClick={() => {
                      incrementUserOnboardingStep(
                        localStorage.getItem("local_npub")
                      );
                      setCurrentStep(4);
                      navigate("/q/4");
                    }}
                    boxShadow="0.5px 0.5px 1px 0px black"
                    mb={18}
                  >
                    {translation[userLanguage].gotItButton}
                  </Button>
                </Box>
              </RiseUpAnimation>
              <div
                style={{
                  width: "100%",
                }}
              >
                <RiseUpAnimation>
                  <div
                    style={{
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "-36px",
                      width: "100%",
                    }}
                  >
                    <RandomCharacter />
                  </div>
                </RiseUpAnimation>
              </div>
            </VStack>
          )}
          {/* Step 3: Final Step with Bitcoin Onboarding */}
          {step === "6" && (
            <VStack spacing={4}>
              <Box>
                <Text fontSize={"sm"}>
                  {translation[userLanguage]["onboardingProgress"]}
                </Text>
                {/* <Progress
                  opacity="0.8"
                  border="1px solid #ececec"
                  // boxShadow="0px 0px 0.5px 2px #ececec"
                  boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  value={(6 / 7) * 100}
                  size="md"
                  colorScheme={"green"}
                  width="250px"
                  mb={4}
                  borderRadius="4px"
                  background={"#ececec"}
                /> */}
                <Box width="250px" mb={4}>
                  <WaveBar
                    value={(6 / 7) * 100}
                    start="#02fabc"
                    end="#12ff69"
                    delay={0}
                    bg="rgba(255,255,255,0.65)"
                    border="#ededed"
                  />
                </Box>
              </Box>
              <PanRightComponent>
                <Text
                  p={4}
                  maxWidth="400px"
                  width="100%"
                  textAlign="left"
                  style={{ display: "flex", flexDirection: "column" }}
                  borderRadius="24px"
                  borderBottomRightRadius="0px"
                  backgroundColor="white"
                  boxShadow="0.5px 0.5px 1px 0px black"
                >
                  <Text
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <FaBitcoin color="#f7931a" />
                    &nbsp;
                    {translation[userLanguage]["createAccount.lastStepMessage"]}
                  </Text>
                  <BitcoinOnboarding
                    userLanguage={userLanguage}
                    from="onboarding"
                  />
                </Text>
              </PanRightComponent>
              <div
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "-36px",
                  marginRight: "-16px",
                }}
              >
                <RiseUpAnimation>
                  <RandomCharacter />
                </RiseUpAnimation>
              </div>
              <HStack>
                {/* Optional back button */}

                <Button
                  onMouseDown={handleActuallyLaunchApp}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleActuallyLaunchApp();
                    }
                  }}
                  colorScheme="pink"
                  // backgroundColor="pink.50"
                  variant="outline"
                >
                  {
                    translation[userLanguage][
                      "onboarding.step3.launchAppButton"
                    ]
                  }
                </Button>
              </HStack>
            </VStack>
          )}
        </Box>
      )}

      {isAwardModalOpen ? (
        <AwardModalOnboarding
          isOpen={isAwardModalOpen}
          onClose={onAwardModalClose}
          // educationalMessages={educationalMessages}
          // educationalContent={educationalContent}
          userLanguage={userLanguage}
          handleActuallyReallySeriouslyLaunchApp={
            handleActuallyReallySeriouslyLaunchApp
          }
        />
      ) : null}
    </Box>
  );
};
