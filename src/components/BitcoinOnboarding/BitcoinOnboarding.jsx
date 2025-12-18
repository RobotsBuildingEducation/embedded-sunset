import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Text,
  VStack,
  useToast,
  Link,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  RadioGroup,
  Radio,
  Spinner,
} from "@chakra-ui/react";
import QRCode from "qrcode.react";
import { SiCashapp } from "react-icons/si";
import { BsQrCode } from "react-icons/bs";

import { translation } from "../../utility/translation";

import { useNostrWalletStore } from "../../hooks/useNostrWalletStore";
import { database } from "../../database/firebaseResources";
import { doc, updateDoc } from "firebase/firestore";
import { IdentityCard } from "../../elements/IdentityCard";

const BitcoinOnboarding = ({ userLanguage, from, onDepositComplete }) => {
  const toast = useToast();
  const [isGenerateNewQR, setIsGeneratingNewQR] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState(""); // State to track selected identity

  const recipientOptions = useMemo(
    () => [
      {
        value:
          "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt",
        label: "robotsbuildingeducation.com",
        href: "https://robotsbuildingeducation.com",
      },
      {
        value:
          "npub166md04uzz4ksy4zv2c8maz4lprrezmtfkwq6yfevtqel3tchkthsemwtwm",
        label: "ladderly.io",
        href: "https://ladderly.io",
      },
      {
        value:
          "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2",
        label: "girlsoncampus.org",
        href: "https://www.girlsoncampus.org/",
      },
    ],
    []
  );

  const selectedIdentityOption = useMemo(
    () =>
      recipientOptions.find((option) => option.value === selectedIdentity) ||
      null,
    [recipientOptions, selectedIdentity]
  );

  const depositOptions = useMemo(() => {
    if (typeof onDepositComplete === "function") {
      return { onSuccess: onDepositComplete };
    }

    return {};
  }, [onDepositComplete]);

  const refreshDescription = useMemo(() => {
    if (from === "onboarding") {
      return "We'll move you forward in just a moment so you can see your updated sats.";
    }

    return "We'll update things in just a moment so you can see your updated sats.";
  }, [from]);

  /**
   * Hook from useNostrWalletStore:
   * - createNewWallet(): creates a new Cashu wallet event and sets up the wallet
   * - initiateDeposit(amount): returns a LN invoice to deposit sats
   * - walletBalance: tracked balance as a number (self-managed, not from wallet.balance())
   * - cashuWallet: if null, no wallet yet
   */

  const {
    cashuWallet,
    walletBalance,
    createNewWallet,
    initiateDeposit,
    invoice,
    init,
    isCreatingWallet,
    isRefreshingAfterDeposit,
  } = useNostrWalletStore((state) => ({
    cashuWallet: state.cashuWallet,
    walletBalance: state.walletBalance,
    createNewWallet: state.createNewWallet,
    initiateDeposit: state.initiateDeposit,
    invoice: state.invoice,
    init: state.init,
    isCreatingWallet: state.isCreatingWallet,
    isRefreshingAfterDeposit: state.isRefreshingAfterDeposit,
  }));

  console.log("total balance", walletBalance);
  // walletBalance is now tracked as a number in the store
  const totalBalance = typeof walletBalance === "number" ? walletBalance : 0;

  useEffect(() => {
    if (isRefreshingAfterDeposit) {
      if (!toast.isActive("deposit-refresh")) {
        toast({
          id: "deposit-refresh",
          title: "Refreshing your balance",
          description: refreshDescription,
          status: "warning",
          variant: "solid",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      toast.close("deposit-refresh");
    }

    return () => {
      toast.close("deposit-refresh");
    };
  }, [isRefreshingAfterDeposit, toast, refreshDescription]);

  const handleIdentityChange = async (value) => {
    setSelectedIdentity(value);

    try {
      // Save the selected identity to Firestore under the user's document
      const userDocRef = doc(
        database,
        "users",
        localStorage.getItem("local_npub")
      ); // Replace "users" with your Firestore collection
      await updateDoc(userDocRef, { identity: value });
    } catch (error) {
      console.error("Error saving identity to Firestore:", error);
    }
  };

  const handleCreateWallet = async () => {
    try {
      const userDocRef = doc(
        database,
        "users",
        localStorage.getItem("local_npub")
      ); // Replace "users" with your Firestore collection
      await updateDoc(userDocRef, { createdWallet: true });
      createNewWallet();
    } catch (err) {
      console.error("Error creating wallet:", err);
      toast({
        title: "Error",
        description: "Failed to create wallet",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleInitiateDeposit = async () => {
    setDepositing(true);
    try {
      const pr = await initiateDeposit(100, depositOptions);
    } catch (err) {
      console.error("Error initiating deposit:", err);
      toast({
        title: "Error",
        description: "Failed to initiate deposit",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
    setDepositing(false);
  };

  const generateNewQR = async () => {
    setIsGeneratingNewQR(true);
    try {
      const pr = await initiateDeposit(100, depositOptions);
    } catch (err) {
      console.error("Error initiating deposit:", err);
      toast({
        title: "Error",
        description: "Failed to initiate deposit",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
    setIsGeneratingNewQR(false);
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(invoice);
    toast({
      title: translation[userLanguage]["toast.title.addressCopied"],
      description: translation[userLanguage]["toast.description.addressCopied"],
      status: "warning",
      duration: 1500,
      isClosable: true,
      position: "top",
    });
  };

  const renderButtonText = (buttonText) => {
    const parts = buttonText.split(/(Cash App)/); // Split by "Cash App"

    return (
      <Text as="span">
        {buttonText.split("Cash App").map((part, index, array) => (
          <span key={index} style={{ textAlign: "center" }}>
            {part}
            {index !== array.length - 1 && (
              <Link
                href="https://click.cash.app/ui6m/home2022"
                isExternal
                color="blue.500"
                display="inline-flex" // Ensures icon and text stay inline
                alignItems="center" // Aligns icon and text vertically
                gap="4px" // Optional: small space between icon and text
                lineHeight={"0px"}
                ml="-1.5"
              >
                &nbsp;
                <SiCashapp color="#00C852" />
                <Text>Cash App</Text>
              </Link>
            )}
          </span>
        ))}
      </Text>
    );
  };

  const renderRecipientAccordion = (accordionProps = {}) => (
    <Box marginTop="2" width="100%" {...accordionProps}>
      <Accordion allowToggle reduceMotion={true} mb={4}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="center" fontSize="sm">
              {translation[userLanguage]["change.recipient"]}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <RadioGroup
              onChange={handleIdentityChange}
              value={selectedIdentity}
            >
              <VStack align="start">
                {recipientOptions.map(({ value, label }) => (
                  <Radio colorScheme="pink" value={value} key={value}>
                    {label}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );

  const renderContent = () => {
    if (!cashuWallet) {
      // Step 1: No wallet yet
      return (
        <>
          <Text mb={4} textAlign={"left"} p={6} fontSize="sm">
            <Text mb={4}>
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.createWallet.1"
                  ]
                }
              </b>{" "}
              <Text size="sm" mb={2}>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.createWallet.2.25"
                  ]
                }
              </Text>
            </Text>

            <Text size="sm" mb={4}>
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.createWallet.2"
                ]
              }
            </Text>

            <Text size="sm" mb={2}>
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.createWallet.2.5"
                  ]
                }
              </b>
            </Text>
          </Text>

          <VStack>
            <Text flex="1" textAlign="left" fontSize="sm">
              {translation[userLanguage]["select.recipient"]}
            </Text>
            {/* </AccordionButton>
                <AccordionPanel> */}
            <RadioGroup
              onChange={handleIdentityChange}
              value={selectedIdentity}
            >
              <VStack align="start">
                {recipientOptions.map(({ value, label }) => (
                  <Radio colorScheme="pink" value={value} key={value}>
                    {label}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
            {/* </AccordionPanel>
              </AccordionItem>
            </Accordion> */}

            {selectedIdentityOption ? (
              <Link
                mb={4}
                fontSize="sm"
                target="_blank"
                textDecoration={"underline"}
                textAlign={"center"}
                href={selectedIdentityOption.href}
              >
                {selectedIdentityOption.href}
              </Link>
            ) : null}

            <Button
              onMouseDown={() => createNewWallet()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  createNewWallet();
                }
              }}
              m={6}
              isLoading={isCreatingWallet}
              loadingText={translation[userLanguage]["loading.wallet"]}
              isDisabled={!selectedIdentity.length > 0}
              boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            >
              {translation[userLanguage]["createWallet.button"]}
            </Button>
          </VStack>
        </>
      );
    }

    // We have a wallet now
    if (totalBalance > 0) {
      // Step 4: Balance > 0, show Identity Card
      return (
        <>
          <Text
            mb={4}
            textAlign={"left"}
            p={6}
            pb={4}
            borderRadius="12px"
            fontSize="sm"
          >
            <Text mb={2} fontWeight={"bold"}>
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.activeWallet.1"
                ]
              }
            </Text>
            <Text mb={4}>
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.activeWallet.2"
                ]
              }
            </Text>

            <Text fontSize="sm">
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.activeWallet.3"
                ]
              }{" "}
              <Link
                href="https://nutlife.lol"
                target="_blank"
                style={{ textDecoration: "underline" }}
              >
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.activeWallet.4"
                  ]
                }
              </Link>
            </Text>
          </Text>
          <VStack fontSize="sm">
            <IdentityCard
              number={cashuWallet.walletId}
              name={
                <div>
                  {translation[userLanguage]["modal.bitcoinMode.cardNameLabel"]}
                  <div>
                    {
                      translation[userLanguage][
                        "modal.bitcoinMode.balanceLabel"
                      ]
                    }
                    : {totalBalance || 0} sats
                  </div>
                </div>
              }
              theme={totalBalance > 0 ? "nostr" : "BTC"}
              animateOnChange={false}
              realValue={cashuWallet.walletId}
            />
            {renderRecipientAccordion()}
          </VStack>
        </>
      );
    } else {
      // Balance = 0, so either show invoice or show button to get invoice
      if (invoice) {
        // Step 3: We have an invoice but no balance yet
        return (
          <>
            <Text mb={4} textAlign={"left"} p={6} fontSize="sm">
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.deposit.1"
                  ]
                }
              </b>
            </Text>
            <VStack>
              {isGenerateNewQR ? (
                <Spinner />
              ) : (
                <>
                  <QRCode value={invoice} size={256} style={{ zIndex: 10 }} />
                  <div style={{ marginTop: "8px" }}>
                    {translation[userLanguage]["or"]} &nbsp;
                    <Button
                      boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                      onMouseDown={() => handleCopyInvoice()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleCopyInvoice();
                        }
                      }}
                    >
                      🔑{" "}
                      {
                        translation[userLanguage][
                          "modal.bitcoinMode.copyAddressButton"
                        ]
                      }
                    </Button>
                  </div>
                  <Text fontSize={"sm"}>
                    {translation[userLanguage]["deposit.ps"]}
                  </Text>

                  <Text
                    mt={2}
                    fontSize="xs"
                    textAlign="center"
                    color="gray.600"
                  >
                    After your deposit arrives, we'll update things
                    automatically so your wallet balance stays up to date.
                  </Text>

                  <Text mt={2} fontSize="xs">
                    {renderButtonText(
                      translation[userLanguage][
                        "modal.bitcoinMode.instructions.createWallet.3"
                      ]
                    )}
                  </Text>
                </>
              )}

              {renderRecipientAccordion({ marginTop: "2" })}

              <Button
                mt={2}
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                onMouseDown={() => generateNewQR()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    generateNewQR();
                  }
                }}
              >
                <BsQrCode />
                &nbsp;Generate New Address
              </Button>
            </VStack>
          </>
        );
      } else {
        // Step 2: Wallet exists but no invoice yet
        return (
          <Box fontSize={"sm"}>
            <Text mb={4} textAlign={"left"} fontSize="sm" p={6}>
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.deposit.1"
                  ]
                }
              </b>
            </Text>
            <IdentityCard
              number={cashuWallet.walletId}
              name={
                <div>
                  {translation[userLanguage]["modal.bitcoinMode.cardNameLabel"]}
                  <div>
                    {
                      translation[userLanguage][
                        "modal.bitcoinMode.balanceLabel"
                      ]
                    }
                    : {totalBalance || 0} sats
                  </div>
                </div>
              }
              theme={totalBalance > 0 ? "nostr" : "BTC"}
              animateOnChange={false}
              realValue={cashuWallet.walletId}
              totalBalance={totalBalance || 0}
            />
            <br />
            <br />
            <VStack>
              {/* <SunsetCanvas /> */}
              <Button
                onMouseDown={() => handleInitiateDeposit()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleInitiateDeposit();
                  }
                }}
                boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                isLoading={depositing}
                loadingText={
                  translation[userLanguage]["loading.wallet.address"]
                }
              >
                {/* {
                  translation[userLanguage][
                    "modal.bitcoinMode.showInvoiceButton"
                  ]
                } */}
                {translation[userLanguage]["deposit.button"]}
              </Button>

              <Text mt={2} fontSize="xs" textAlign="center" color="gray.600">
                After your deposit is detected, we'll update things
                automatically to show your updated balance.
              </Text>

              {renderRecipientAccordion({ marginTop: "2" })}
            </VStack>
          </Box>
        );
      }
    }
  };

  return <Box>{renderContent()}</Box>;
};

export default BitcoinOnboarding;
