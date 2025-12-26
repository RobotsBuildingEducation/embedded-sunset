import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Link,
  Box,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { translation } from "../../../utility/translation";
import { SunsetCanvas } from "../../../elements/SunsetCanvas";
import { useNostrWalletStore } from "../../../hooks/useNostrWalletStore";

const ActionButton = ({ href, text, userLanguage }) => (
  <Button
    as="a"
    href={href}
    mt={2}
    mb={4}
    variant={"outline"}
    target="_blank"
    width="45%"
    margin={2}
    height={100}
    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
    fontSize={"small"}
  >
    {text}
  </Button>
);

const SocialWalletModal = ({ isOpen, onClose, userLanguage }) => {
  const toast = useToast();

  const { createNewWallet, isCreatingWallet, isWalletReady, walletBalance } = useNostrWalletStore(
    (state) => ({
      createNewWallet: state.createNewWallet,
      isCreatingWallet: state.isCreatingWallet,
      isWalletReady: state.isWalletReady,
      walletBalance: state.walletBalance,
    })
  );

  const handleCreateWallet = async () => {
    const hasNsec = localStorage.getItem("local_nsec");
    if (!hasNsec) {
      toast({
        title: translation[userLanguage]["wallet.needsNsec.title"] || "Secret Key Required",
        description: translation[userLanguage]["wallet.needsNsec.description"] || "Please add your secret key (nsec) to create a wallet. You can add it in the settings menu.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const wallet = await createNewWallet();
    if (wallet) {
      toast({
        title: translation[userLanguage]["wallet.created.title"] || "Wallet Created",
        description: translation[userLanguage]["wallet.created.description"] || "Your wallet has been created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleCopyKeys = () => {
    const keys = localStorage.getItem("local_nsec"); // replace with actual keys
    navigator.clipboard.writeText(keys);
    toast({
      title: translation[userLanguage]["toast.title.keysCopied"],
      description: translation[userLanguage]["toast.description.keysCopied"],
      // status: "info",
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent textAlign={"center"}>
        <ModalHeader>
          {translation[userLanguage]["modal.openSocialWallet.title"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {translation[userLanguage]["modal.openSocialWallet.instructions"]}
          <br />
          <br />
          <VStack spacing={3} width="100%">
            <Button
              onMouseDown={handleCopyKeys}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCopyKeys();
                }
              }}
              width="100%"
            >
              🔑 {translation[userLanguage]["button.copyKey"]}
            </Button>

            <Button
              colorScheme="purple"
              width="100%"
              onMouseDown={handleCreateWallet}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCreateWallet();
                }
              }}
              isLoading={isCreatingWallet}
              loadingText={translation[userLanguage]["wallet.creating"] || "Creating..."}
            >
              {isWalletReady
                ? `${translation[userLanguage]["wallet.balance"] || "Wallet Balance"}: ${walletBalance} sats`
                : translation[userLanguage]["wallet.create"] || "Create Wallet"}
            </Button>
          </VStack>
          <br />
          {/* <ActionButton
            href={`https://primal.net/p/${localStorage.getItem("local_npub")}`}
            text={translation[userLanguage]["settings.button.yourProfile"]}
            userLanguage={userLanguage}
          /> */}
          <ActionButton
            href={`https://primal.net/p/${localStorage.getItem("local_npub")}`}
            text={translation[userLanguage]["settings.button.yourProfile"]}
            userLanguage={userLanguage}
          />
          <ActionButton
            href="https://embedded-rox.app"
            text={translation[userLanguage]["settings.button.yourTutor"]}
            userLanguage={userLanguage}
          />
          <ActionButton
            href="https://primal.net/home"
            text={
              translation[userLanguage]["modal.openSocialWallet.startButton"]
            }
            userLanguage={userLanguage}
          />
          <ActionButton
            href="https://otherstuff.app"
            text={translation[userLanguage]["settings.button.nostrApps"]}
            userLanguage={userLanguage}
          />
          <br />
          <br />
          <a
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.open(
                  "https://primal.net/p/npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
                );
              }
            }}
            type="external"
            as="a"
            href="https://primal.net/p/npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
            target="_blank"
            style={{ textDecoration: "underline" }}
          >
            {translation[userLanguage]["link.connectWithMe"]}
          </a>
        </ModalBody>
        <ModalFooter>
          <Button
            mr={3}
            onMouseDown={onClose}
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
          >
            {translation[userLanguage]["button.close"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SocialWalletModal;
