import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Link,
  VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { translation } from "../../utility/translation";

const DecentralizedIdentityModal = ({ isOpen, onClose, userLanguage = "en" }) => {
  const t = translation[userLanguage] || translation["en"];
  const title =
    t["settings.decentralizedIdentity.header"] ||
    (userLanguage?.includes("es")
      ? "Identidad descentralizada"
      : "Decentralized identity");
  const body =
    t["settings.decentralizedIdentity.body"] ||
    (userLanguage?.includes("es")
      ? "Aquí usamos identidad descentralizada, por lo que tu progreso se publica en el feed de tu perfil."
      : "Here we use decentralized identity, so your progress is published to your profile feed.");
  const viewProfileText =
    t["settings.decentralizedIdentity.viewProfile"] ||
    (userLanguage?.includes("es")
      ? "Ver perfil en Ditto"
      : "View profile on Ditto");

  const npub =
    typeof window !== "undefined" && window.localStorage
      ? localStorage.getItem("local_npub") || ""
      : "";
  const profileUrl = npub ? `https://ditto.pub/${npub}` : "https://ditto.pub";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="none" />
      <ModalContent
        bg="appSurfaceElevated"
        color="appText"
        borderWidth="1px"
        borderColor="appBorderStrong"
        borderRadius="2xl"
        boxShadow="none"
        mx={4}
      >
        <ModalHeader fontSize="lg" fontWeight="bold">
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={6} pb={6}>
          <VStack align="start" spacing={4}>
            <Text lineHeight="tall">{body}</Text>
            <Link
              href={profileUrl}
              isExternal
              color="pink.500"
              fontWeight="semibold"
              display="inline-flex"
              alignItems="center"
              gap={1}
              _hover={{ textDecoration: "underline" }}
            >
              {viewProfileText} <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DecentralizedIdentityModal;
