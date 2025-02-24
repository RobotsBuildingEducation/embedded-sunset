import React, { useEffect, useState } from "react";
import {
  Button,
  Text,
  VStack,
  useToast,
  Select,
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { IdentityCard } from "../../elements/IdentityCard";

const BitcoinOnboarding = ({ userLanguage }) => {
  const toast = useToast();
  const [isGenerateNewQR, setIsGeneratingNewQR] = useState(false);
  const [lnInvoice, setLnInvoice] = useState(""); // LN invoice for deposit
  const [initializingWallet, setInitializingWallet] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState(""); // State to track selected identity
  const [loading, setLoading] = useState(false);

  /**
   * Hook from useSharedNostr:
   * - createNewWallet(): creates a new Cashu wallet event and sets up the wallet
   * - initiateDeposit(amount): returns a LN invoice to deposit sats
   * - walletBalance: array of proofs; sum their values to get total balance
   * - cashuWallet: if null, no wallet yet
   */

  const {
    cashuWallet,
    walletBalance,
    createNewWallet,
    initiateDeposit,
    invoice,
    init,
  } = useNostrWalletStore((state) => ({
    cashuWallet: state.cashuWallet,
    walletBalance: state.walletBalance,
    createNewWallet: state.createNewWallet,
    initiateDeposit: state.initiateDeposit,
    invoice: state.invoice,
    init: state.init,
  }));

  // useEffect(() => {
  //   const loadUserIdentity = async () => {
  //     try {
  //       const userDocRef = doc(
  //         database,
  //         "users",
  //         localStorage.getItem("local_npub")
  //       );
  //       const docSnap = await getDoc(userDocRef);
  //       if (docSnap.exists()) {
  //         const data = docSnap.data();
  //         if (data.identity) {
  //           setSelectedIdentity(data.identity);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error loading user identity:", error);
  //     }
  //   };
  //   loadUserIdentity();
  // }, []);
  // Helper: sum up wallet balance

  console.log("wallet balance..x...", walletBalance);
  const totalBalance =
    (walletBalance || [])?.reduce((sum, b) => sum + (b.amount || 0), 0) || null;

  console.log("TOTAL BALANCE", totalBalance);

  useEffect(() => {
    // If we have a deposit in progress and the user pays it, after proofs update
    // the totalBalance should become > 0.
    // If totalBalance changes and we now have sats, clear invoice.

    if (totalBalance > 0) {
      setLnInvoice("");
    }
  }, [totalBalance]);

  const handleIdentityChange = async (value) => {
    setSelectedIdentity(value);

    try {
      //   setLoading(true);

      // Save the selected identity to Firestore under the user's document
      const userDocRef = doc(
        database,
        "users",
        localStorage.getItem("local_npub")
      ); // Replace "users" with your Firestore collection
      await updateDoc(userDocRef, { identity: value });

      console.log("Identity saved successfully:", value);
    } catch (error) {
      console.error("Error saving identity to Firestore:", error);
    } finally {
      //   setLoading(false);
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
    setInitializingWallet(false);
  };

  const handleInitiateDeposit = async () => {
    setDepositing(true);
    try {
      // Initiate a deposit for 10 sats (example)
      const pr = await initiateDeposit(10);
      // pr is a LN invoice (bolt11)
      // if (pr) {
      //   setLnInvoice(pr);
      // }
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
      // Initiate a deposit for 10 sats (example)
      const pr = await initiateDeposit(10);
      // pr is a LN invoice (bolt11)
      // if (pr) {
      //   setLnInvoice(pr);
      // }
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

  /**
   * Render logic:
   * 1. If no wallet exists (cashuWallet === null), show instructions & create wallet button.
   * 2. If wallet exists but balance = 0 and no invoice yet, show instructions to deposit & a button to generate invoice.
   * 3. If wallet exists and we have an invoice (lnInvoice) and balance=0, show QR code and copy button.
   * 4. If wallet exists and balance > 0, show the Identity card with balance.
   */

  useEffect(() => {
    if (cashuWallet) {
      setInitializingWallet(true);
    }
  }, [cashuWallet]);

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

    // return parts.map((part, index) =>
    //   part === "Cash App" ? (
    //     <Link
    //       key={index}
    //       href="https://click.cash.app/ui6m/home2022"
    //       isExternal
    //       color="blue.500"
    //       fontWeight="bold"
    //       display="flex"
    //     >
    //       <SiCashapp color="00C852" /> {part}
    //     </Link>
    //   ) : (
    //     part
    //   )
    // );
  };

  const renderContent = () => {
    if (!cashuWallet) {
      // Step 1: No wallet yet
      return (
        <>
          <Text mb={4} textAlign={"left"} p={6} fontSize="sm">
            <Text mb={2}>
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.createWallet.1"
                  ]
                }
              </b>
            </Text>

            <Text size="sm" mb={2}>
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.createWallet.2"
                ]
              }
              &nbsp;
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
            {/* <Select
              mb={4}
              onChange={handleIdentityChange}
              value={selectedIdentity} // Bind to state
              isDisabled={loading} // Disable dropdown while saving
              transition="0s all linear"
            >
              <option value="" disabled>
                {translation[userLanguage]["select.recipient"]}
              </option>
              <option value="npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt">
                robotsbuildingeducation.com
              </option>
              <option value="npub166md04uzz4ksy4zv2c8maz4lprrezmtfkwq6yfevtqel3tchkthsemwtwm">
                ladderly.io
              </option>
              <option value="npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2">
                girlsoncampus.org
              </option>
              <option value="more-schools" disabled>
                {translation[userLanguage]["disabled.select.soon"]}
              </option>
            </Select> */}

            {/* <Accorrdion toggmb={4} reduceMotion={true}>
              <AccordionItem>
                <AccordionButton
                  display="flex"
                  justifyContent={"space-between"}
                >
                  {/* <AccordionIcon mr={2} p={0} ml={0} /> */}
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
                <Radio
                  colorScheme="pink"
                  value="npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
                >
                  robotsbuildingeducation.com
                </Radio>
                <Radio
                  colorScheme="pink"
                  value="npub166md04uzz4ksy4zv2c8maz4lprrezmtfkwq6yfevtqel3tchkthsemwtwm"
                >
                  ladderly.io
                </Radio>
                <Radio
                  colorScheme="pink"
                  value="npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
                >
                  girlsoncampus.org
                </Radio>
              </VStack>
            </RadioGroup>
            {/* </AccordionPanel>
              </AccordionItem>
            </Accordion> */}

            <Link
              mb={4}
              fontSize="sm"
              target="_blank"
              textDecoration={"underline"}
              textAlign={"center"}
              href={
                selectedIdentity ===
                "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
                  ? "https://www.girlsoncampus.org/"
                  : selectedIdentity ===
                      "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
                    ? "https://robotsbuildingeducation.com"
                    : selectedIdentity ===
                        "npub166md04uzz4ksy4zv2c8maz4lprrezmtfkwq6yfevtqel3tchkthsemwtwm"
                      ? "https://ladderly.io"
                      : null
              }
            >
              {selectedIdentity ===
              "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
                ? "https://girlsoncampus.org"
                : selectedIdentity ===
                    "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
                  ? "https://robotsbuildingeducation.com"
                  : selectedIdentity ===
                      "npub166md04uzz4ksy4zv2c8maz4lprrezmtfkwq6yfevtqel3tchkthsemwtwm"
                    ? "https://ladderly.io"
                    : null}
            </Link>
            <Button
              onMouseDown={() => createNewWallet()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  createNewWallet();
                }
              }}
              m={6}
              isLoading={initializingWallet}
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

    console.log("cashuWalletcashuWalletcashuWallet", cashuWallet);
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

                  <Text mt={2} fontSize="xs">
                    {renderButtonText(
                      translation[userLanguage][
                        "modal.bitcoinMode.instructions.createWallet.3"
                      ]
                    )}
                  </Text>
                </>
              )}

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

              <Box marginTop="2" width="100%">
                <Accordion allowToggle reduceMotion={true} mb={4}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box
                        flex="1"
                        textAlign="left"
                        fontSize="sm"
                        textAlign="center"
                      >
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
                          <Radio
                            colorScheme="pink"
                            value="npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
                          >
                            robotsbuildingeducation.com
                          </Radio>
                          <Radio
                            colorScheme="pink"
                            value="npub166md04uzz4ksy4zv2c8maz4lprrezmtfkwq6yfevtqel3tchkthsemwtwm"
                          >
                            ladderly.io
                          </Radio>
                          <Radio
                            colorScheme="pink"
                            value="npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
                          >
                            girlsoncampus.org
                          </Radio>
                        </VStack>
                      </RadioGroup>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>
            </VStack>
          </Box>
        );
      }
    }
  };

  return <Box>{renderContent()}</Box>;
};

export default BitcoinOnboarding;
