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
import { subscribeToTeamInvites } from "../../utility/nosql";

const SocialFeedModal = ({
  isOpen,
  onClose,
  currentStep,
  userLanguage,
  allowPosts,
  setAllowPosts,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);

  const handleTeamCreated = (teamId) => {
    // Trigger refresh and switch to "View Team" tab after creating a team
    setRefreshTrigger((prev) => prev + 1);
    setSelectedTab(2);
  };

  const handleTabChange = (index) => {
    setSelectedTab(index);
    // Trigger refresh when switching to View Team tab
    if (index === 2) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // Subscribe to team invites to show count on View Team tab
  useEffect(() => {
    const userNpub = localStorage.getItem("local_npub");
    if (!userNpub) return;

    const unsubscribe = subscribeToTeamInvites(userNpub, (invites) => {
      const pendingCount = invites.filter(
        (invite) => invite.status === "pending"
      ).length;
      setPendingInviteCount(pendingCount);
    });

    return () => unsubscribe();
  }, []);

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
            onChange={handleTabChange}
            isFitted
            variant="enclosed"
          >
            <TabList mb="1em">
              <Tab>Global Feed</Tab>
              <Tab>Create Team</Tab>
              <Tab>
                View Team
                {pendingInviteCount > 0 ? ` (${pendingInviteCount})` : ""}
              </Tab>
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
                <TeamView
                  userLanguage={userLanguage}
                  refreshTrigger={refreshTrigger}
                />
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
