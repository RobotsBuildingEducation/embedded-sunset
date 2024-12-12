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

const BitcoinModeModal = ({ isOpen, onClose, userLanguage }) => {
  const toast = useToast();
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

  useEffect(() => {
    let asyncStart = async () => {
      await init();
    };
    asyncStart();
  }, []);
  // Helper: sum up wallet balance
  const totalBalance =
    (walletBalance || [])?.reduce((sum, b) => sum + (b.amount || 0), 0) || null;

  useEffect(() => {
    // If we have a deposit in progress and the user pays it, after proofs update
    // the totalBalance should become > 0.
    // If totalBalance changes and we now have sats, clear invoice.

    if (totalBalance > 0) {
      setLnInvoice("");
    }
  }, [totalBalance]);

  const handleIdentityChange = async (e) => {
    const value = e.target.value;
    setSelectedIdentity(value);

    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setInitializingWallet(true);
    try {
      // Create a new wallet
      // await createNewWallet();
      if (cashuWallet) {
        // After wallet is created, show deposit instructions
        console.log("created wallet", cashuWallet);
        // await handleInitiateDeposit();
      }
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
    console.log("cashu wallet from modal", cashuWallet);
    if (cashuWallet) {
      setInitializingWallet(true);
    }
  }, [cashuWallet]);

  console.log("running cashu", cashuWallet);
  const renderContent = () => {
    if (!cashuWallet) {
      // Step 1: No wallet yet
      return (
        <>
          <Text
            mb={4}
            textAlign={"left"}
            background="#7a7a7a"
            color="white"
            p={6}
            borderRadius="12px"
          >
            <Text mb={2}>
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.createWallet.1"
                  ]
                }
              </b>
            </Text>

            <Text mb={2}>
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.createWallet.2"
                ]
              }
            </Text>
          </Text>

          <VStack>
            <Select
              mb={4}
              onChange={handleIdentityChange}
              value={selectedIdentity} // Bind to state
              isDisabled={loading} // Disable dropdown while saving
            >
              <option value="" disabled>
                {translation[userLanguage]["select.recipient"]}
              </option>
              <option value="npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt">
                sheilfer@primal.net
              </option>
              <option value="more-schools" disabled>
                {translation[userLanguage]["disabled.select.soon"]}
              </option>
            </Select>
            <Button
              onClick={createNewWallet}
              isLoading={initializingWallet}
              loadingText={translation[userLanguage]["loading"]}
            >
              {translation[userLanguage]["createWallet.button"]}
              {/* {
                translation[userLanguage][
                  "modal.bitcoinMode.createWalletButton"
                ]
              } */}
            </Button>

            <Text mt={2} fontSize="xs">
              {
                translation[userLanguage][
                  "modal.bitcoinMode.instructions.createWallet.3"
                ]
              }
            </Text>
          </VStack>
        </>
      );
    }

    console.log("wallet balance", walletBalance);
    console.log("Total balance...", totalBalance);
    // We have a wallet now
    if (totalBalance > 0) {
      // Step 4: Balance > 0, show Identity Card
      return (
        <>
          <Text
            mb={4}
            textAlign={"left"}
            background="#7a7a7a"
            color="white"
            p={6}
            pb={4}
            borderRadius="12px"
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
          <VStack>
            <IdentityCard
              number={
                cashuWallet.walletId || "Robots Building Education Wallet"
              }
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
              theme="BTC"
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
            <Text
              mb={4}
              textAlign={"left"}
              background="#7a7a7a"
              color="white"
              p={6}
              borderRadius="12px"
            >
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.deposit.1"
                  ]
                }
              </b>
            </Text>
            <VStack>
              <QRCode value={invoice} size={256} style={{ zIndex: 1000000 }} />
              <div style={{ marginTop: "8px" }}>
                {translation[userLanguage]["or"]} &nbsp;
                <Button onClick={handleCopyInvoice}>
                  🔑{" "}
                  {
                    translation[userLanguage][
                      "modal.bitcoinMode.copyAddressButton"
                    ]
                  }
                </Button>
              </div>
            </VStack>
          </>
        );
      } else {
        // Step 2: Wallet exists but no invoice yet
        return (
          <>
            <Text
              mb={4}
              textAlign={"left"}
              background="#7a7a7a"
              color="white"
              p={6}
              borderRadius="12px"
            >
              <b>
                {
                  translation[userLanguage][
                    "modal.bitcoinMode.instructions.deposit.1"
                  ]
                }
              </b>
            </Text>
            <IdentityCard
              number={
                cashuWallet.walletId || "Robots Building Education Wallet"
              }
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
              theme="BTC"
              animateOnChange={false}
              realValue={cashuWallet.walletId}
            />
            <br />
            <br />
            <VStack>
              {/* <SunsetCanvas /> */}
              <Button
                onClick={handleInitiateDeposit}
                isLoading={depositing}
                loadingText={translation[userLanguage]["loading"]}
              >
                {/* {
                  translation[userLanguage][
                    "modal.bitcoinMode.showInvoiceButton"
                  ]
                } */}
                {translation[userLanguage]["deposit.button"]}
              </Button>
            </VStack>
          </>
        );
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {translation[userLanguage]["modal.bitcoinMode.title"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>{renderContent()}</ModalBody>
        <ModalFooter>
          {/** You can add any footer actions if needed */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BitcoinModeModal;
