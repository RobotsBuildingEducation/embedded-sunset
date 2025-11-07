import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import { TechOverview } from "../TechOverview/TechOverview";
import { translation } from "../../utility/translation";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const ChangeLanguageModal = ({
  userLanguage,
  isOpen,
  onClose,
  onSelect,
}) => {
  const labelMap = {
    en: translation[userLanguage]["language.javascript.english"],
    es: translation[userLanguage]["language.javascript.spanish"],
    "py-en": translation[userLanguage]["language.python.english"],
    "swift-en": translation[userLanguage]["language.swift.english"],
    "android-en": translation[userLanguage]["language.android.english"],
    "compsci-en": translation[userLanguage]["language.compsci.english"],
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent
        display="flex"
        flexDirection="column"
        maxH="90vh"
        overflow="hidden"
      >
        <ModalHeader>
          {translation[userLanguage]["onboarding.languages.title"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody flex="1" overflowY="auto">
          <VStack width="100%">
            <Menu width="100%">
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                mb={4}
              >
                {labelMap[userLanguage] || labelMap.en}
              </MenuButton>
              <MenuList>
                {Object.entries(labelMap).map(([val, label]) => (
                  <MenuItem
                    key={val}
                    p={4}
                    onClick={async () => {
                      await onSelect(val);
                      //   onClose();
                    }}
                  >
                    {label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </VStack>
          <TechOverview userLanguage={userLanguage} />
        </ModalBody>
        <ModalFooter
          position="sticky"
          bottom="0"
          bg="chakra-body-bg"
          borderTopWidth="1px"
          borderColor="blackAlpha.200"
          boxShadow="sm"
        >
          <Button width="100%" size="lg" onClick={onClose}>
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
