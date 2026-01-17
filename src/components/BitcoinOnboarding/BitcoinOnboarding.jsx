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
  Input,
} from "@chakra-ui/react";
import QRCode from "qrcode.react";
import { SiCashapp } from "react-icons/si";
import { BsQrCode } from "react-icons/bs";

import { translation } from "../../utility/translation";

import { useNostrWalletStore } from "../../hooks/useNostrWalletStore";
import { database } from "../../database/firebaseResources";
import { doc, updateDoc } from "firebase/firestore";
import { IdentityCard } from "../../elements/IdentityCard";
import { soundManager } from "../../utility/soundManager";
import { triggerHaptic } from "tactus";

const BitcoinOnboarding = ({ userLanguage, from, onDepositComplete }) => {
  const toast = useToast();
  const [isGenerateNewQR, setIsGeneratingNewQR] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState(""); // State to track selected identity
  const [manualNsec, setManualNsec] = useState(""); // State for NIP-07 users to enter their private key

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
    initWallet,
    isCreatingWallet,
    isRefreshingAfterDeposit,
    isNip07Mode,
    setManualPrivateKey,
    nostrPrivKey,
  } = useNostrWalletStore((state) => ({
    cashuWallet: state.cashuWallet,
    walletBalance: state.walletBalance,
    createNewWallet: state.createNewWallet,
    initiateDeposit: state.initiateDeposit,
    invoice: state.invoice,
    init: state.init,
    initWallet: state.initWallet,
    isCreatingWallet: state.isCreatingWallet,
    isRefreshingAfterDeposit: state.isRefreshingAfterDeposit,
    isNip07Mode: state.isNip07Mode,
    setManualPrivateKey: state.setManualPrivateKey,
    nostrPrivKey: state.nostrPrivKey,
  }));

  console.log("total balance", walletBalance);
  // walletBalance is now tracked as a number in the store
  const totalBalance = typeof walletBalance === "number" ? walletBalance : 0;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const connected = await init();
        if (connected) {
          await initWallet();
        }
      } catch (e) {
        console.warn("Wallet hydrate failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [init, initWallet]);

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
    triggerHaptic();
    soundManager.resume();
    soundManager.play("select");
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

  // Check if user is logged in via NIP-07 extension
  const isUsingNip07 = isNip07Mode();
  // Check if we have a valid private key (either from store or manually entered)
  const hasPrivateKey = nostrPrivKey && nostrPrivKey.startsWith("nsec");

  const handleManualNsecChange = (e) => {
    const value = e.target.value;
    setManualNsec(value);
    if (value.startsWith("nsec")) {
      setManualPrivateKey(value);
    }
  };

  const handleCreateWallet = async () => {
    // For NIP-07 users, ensure the manual key is set before creating wallet
    if (isUsingNip07 && manualNsec && !hasPrivateKey) {
      const success = setManualPrivateKey(manualNsec);
      if (!success) {
        toast({
          title: "Invalid Key",
          description: "Please enter a valid nsec private key",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        return;
      }
    }

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
              data-sound-ignore-select="true"
              onChange={handleIdentityChange}
              value={selectedIdentity}
            >
              <VStack align="start">
                {recipientOptions.map(({ value, label }) => (
                  <Radio
                    colorScheme="pink"
                    value={value}
                    key={value}
                    data-sound-ignore-select="true"
                  >
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
      // Check if NIP-07 user needs to provide private key
      const needsPrivateKey = isUsingNip07 && !hasPrivateKey;
      const canCreateWallet =
        selectedIdentity.length > 0 && (!isUsingNip07 || hasPrivateKey);

      return (
        <>
          <Text mb={4} textAlign={"left"} fontSize="sm">
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

            <Text size="sm">
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.createWallet.2"
                ]
              }
            </Text>
          </Text>

          <VStack>
            {/* NIP-07 Private Key Input - only show for NIP-07 users without a wallet */}
            {isUsingNip07 && (
              <Box width="100%" px={6} mb={4}>
                <Text fontSize="sm" mb={2} fontWeight="bold">
                  {translation[userLanguage]["nip07.privateKey.label"] ||
                    "Enter your private key to enable wallet creation:"}
                </Text>
                <Input
                  type="password"
                  placeholder={
                    translation[userLanguage]["nip07.privateKey.placeholder"] ||
                    "nsec..."
                  }
                  value={manualNsec}
                  onChange={handleManualNsecChange}
                  size="sm"
                  mb={2}
                />
                <Text fontSize="xs" color="gray.500">
                  {translation[userLanguage]["nip07.privateKey.hint"] ||
                    "Your extension doesn't share your private key. Enter it here to create a wallet."}
                </Text>
              </Box>
            )}
            <Button
              onMouseDown={() => {
                triggerHaptic();
                handleCreateWallet();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  triggerHaptic();
                  handleCreateWallet();
                }
              }}
              m={6}
              isLoading={isCreatingWallet}
              loadingText={translation[userLanguage]["loading.wallet"]}
              isDisabled={!canCreateWallet}
              boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            >
              {translation[userLanguage]["createWallet.button"]}
            </Button>

            <Text flex="1" textAlign="left" fontSize="sm">
              {translation[userLanguage]["select.recipient"]}
            </Text>
            {/* </AccordionButton>
                <AccordionPanel> */}
            <RadioGroup
              data-sound-ignore-select="true"
              onChange={handleIdentityChange}
              value={selectedIdentity}
            >
              <VStack align="start">
                {recipientOptions.map(({ value, label }) => (
                  <Radio
                    colorScheme="pink"
                    value={value}
                    key={value}
                    data-sound-ignore-select="true"
                  >
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
                      onMouseDown={() => {
                        triggerHaptic();
                        handleCopyInvoice();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          triggerHaptic();
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
                onMouseDown={() => {
                  triggerHaptic();
                  generateNewQR();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    triggerHaptic();
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
                onMouseDown={() => {
                  triggerHaptic();
                  handleInitiateDeposit();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    triggerHaptic();
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
