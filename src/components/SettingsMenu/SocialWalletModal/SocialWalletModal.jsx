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
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { translation } from "../../../utility/translation";
import { SunsetCanvas } from "../../../elements/SunsetCanvas";

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
          <Button
            onMouseDown={handleCopyKeys}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCopyKeys();
              }
            }}
          >
            🔑 `{translation[userLanguage]["button.copyKey"]}`
          </Button>
          <br />
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
