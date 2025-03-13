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
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";

import { SunsetCanvas } from "./elements/SunsetCanvas";

import {
  createUser,
  getUserStep,
  incrementUserOnboardingStep,
  setOnboardingToDone,
  updateUserData,
} from "./utility/nosql";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "./database/firebaseResources";

import { translation } from "./utility/translation";

import Confetti from "react-confetti";

import RandomCharacter, {
  FadeInComponent,
  PanRightComponent,
  RiseUpAnimation,
} from "./elements/RandomCharacter";

import BitcoinOnboarding from "./components/BitcoinOnboarding/BitcoinOnboarding";
import SelfPacedOnboarding from "./components/SettingsMenu/SelfPacedModal/SelfPacedOnboarding";

export const Onboarding = ({
  isSignedIn,
  setIsSignedIn,
  userLanguage,
  setUserLanguage,
  generateNostrKeys,
  auth,
  view,
  setView,
}) => {
  const { step } = useParams();
  const [interval, setInterval] = useState(1440);
  const navigate = useNavigate();
  const toast = useToast();

  // Function to launch the main app after onboarding
  const handleActuallyLaunchApp = () => {
    setOnboardingToDone(localStorage.getItem("local_npub"));

    navigate("/q/0");
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <Box display="flex" justifyContent="center" mt={16}>
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
        {step === "1" && (
          <VStack spacing={4} textAlign="left">
            <RiseUpAnimation>
              <Box
                borderRadius="24px"
                borderBottomRightRadius="0px"
                p={4}
                textAlign="center"
                backgroundColor="white"
                boxShadow="0.5px 0.5px 1px 0px black"
                marginTop="12px"
              >
                <Text mb={2}>
                  {translation[userLanguage]["onboarding.step1.challengeTitle"]}
                </Text>
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
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
                  {translation[userLanguage]["onboarding.step1.challengeText1"]}
                </Text>
                <Text
                  fontSize="md"
                  style={{ marginBottom: 12, textAlign: "left" }}
                >
                  {translation[userLanguage]["onboarding.step1.challengeText2"]}
                </Text>
                <Text
                  fontSize="md"
                  style={{ marginBottom: 12, textAlign: "left" }}
                >
                  {translation[userLanguage]["onboarding.step1.challengeText3"]}
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
                </Accordion>
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

            <Button
              onClick={() => {
                incrementUserOnboardingStep(localStorage.getItem("local_npub"));
                navigate("/onboarding/2");
              }}
              boxShadow="0.5px 0.5px 1px 0px black"
              mb={18}
            >
              {translation[userLanguage]["onboarding.step1.buttonLabel"]}
            </Button>
          </VStack>
        )}

        {/* Step 2: Setting up Daily Goals */}
        {step === "2" && (
          <VStack spacing={4}>
            <FadeInComponent>
              <Box
                borderRadius="24px"
                borderBottomRightRadius="0px"
                p={4}
                textAlign="center"
                backgroundColor="white"
                boxShadow="0.5px 0.5px 1px 0px black"
              >
                <Text mb={2}>
                  {
                    translation[userLanguage][
                      "onboarding.step2.dailyGoalsTitle"
                    ]
                  }
                </Text>
                <Text fontSize="sm" textAlign="left">
                  {
                    translation[userLanguage][
                      "onboarding.step2.dailyGoalsDescription"
                    ]
                  }
                </Text>
                <br />
                <SelfPacedOnboarding
                  interval={interval}
                  setInterval={setInterval}
                  userId={localStorage.getItem("local_npub")}
                  userLanguage={userLanguage}
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

        {/* Step 3: Final Step with Bitcoin Onboarding */}
        {step === "3" && (
          <VStack spacing={4}>
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
                <Text>
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
                backgroundColor="pink.50"
                variant="outline"
              >
                {translation[userLanguage]["onboarding.step3.launchAppButton"]}
              </Button>
            </HStack>
          </VStack>
        )}
      </Box>
    </Box>
  );
};
