import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  ModalFooter,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

import { translation } from "../../utility/translation";
import { TestFeed } from "../../experiments/TestCoinbaseUI";
import { TeamCreation } from "../TeamCreation/TeamCreation";
import { TeamView } from "../TeamView/TeamView";

const SocialFeedModal = ({
  isOpen,
  onClose,
  currentStep,
  userLanguage,
  allowPosts,
  setAllowPosts,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTeamCreated = (teamId) => {
    // Switch to "View Team" tab after creating a team
    setSelectedTab(2);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
      placement="right"
    >
      <DrawerOverlay />
      <DrawerContent display="flex" flexDirection="column">
        <DrawerHeader style={{ display: "flex", alignItems: "center" }}>
          #LearnWithNostr
        </DrawerHeader>
        <DrawerCloseButton />
        <DrawerBody flex="1" overflowY="auto">
          <Tabs
            index={selectedTab}
            onChange={(index) => setSelectedTab(index)}
            isFitted
            variant="enclosed"
          >
            <TabList mb="1em">
              <Tab>Global Feed</Tab>
              <Tab>Create Team</Tab>
              <Tab>View Team</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <TestFeed
                  userLanguage={userLanguage}
                  allowPosts={allowPosts}
                  setAllowPosts={setAllowPosts}
                />
              </TabPanel>
              <TabPanel>
                <TeamCreation
                  userLanguage={userLanguage}
                  onTeamCreated={handleTeamCreated}
                />
              </TabPanel>
              <TabPanel>
                <TeamView userLanguage={userLanguage} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
        <DrawerFooter
          position="sticky"
          bottom="0"
          bg="chakra-body-bg"
          borderTopWidth="1px"
          borderColor="blackAlpha.200"
          boxShadow="sm"
          py={4}
          justifyContent="flex-end"
        >
          <Button size="lg" onClick={onClose}>
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SocialFeedModal;
