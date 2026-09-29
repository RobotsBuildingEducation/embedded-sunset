import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import { TeamCreation } from "../TeamCreation/TeamCreation";
import { TeamView } from "../TeamView/TeamView";
import { CourseTeamFeed } from "../TeamView/CourseTeamFeed";
import { loadVisibleTeams } from "../../utility/teamDirectory";
import { teamCopy } from "../../utility/teamCopy";
import { acceptTeamInvite, rejectTeamInvite } from "../../utility/nosql";
import { useSurfaceModalStore } from "../../useSurfaceModalStore";

const SocialFeedModal = ({ isOpen, onClose, userLanguage }) => {
  const copy = teamCopy(userLanguage);
  const toast = useToast();
  const accountNpub = localStorage.getItem("local_npub");
  const [selectedTab, setSelectedTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [busyInvite, setBusyInvite] = useState(null);
  const cacheAccount = useSurfaceModalStore(
    (state) => state.teamPreloadAccount,
  );
  const preloadStatus = useSurfaceModalStore(
    (state) => state.teamPreloadStatus,
  );
  const preloadedTeams = useSurfaceModalStore((state) => state.preloadedTeams);
  const preloadedProgress = useSurfaceModalStore(
    (state) => state.preloadedTeamProgress,
  );
  const preloadedProfiles = useSurfaceModalStore(
    (state) => state.preloadedTeamProfiles,
  );
  const preloadedOwnProgress = useSurfaceModalStore(
    (state) => state.preloadedOwnProgress,
  );
  const preloadedOwnSalary = useSurfaceModalStore(
    (state) => state.preloadedOwnSalary,
  );
  const pendingInvites = useSurfaceModalStore(
    (state) => state.pendingTeamInvites,
  );
  const unseenInvite = useSurfaceModalStore((state) => state.unseenTeamInvite);
  const viewInvites = useSurfaceModalStore((state) => state.viewTeamInvites);
  const hasCache = cacheAccount === accountNpub;
  const settled = hasCache && preloadStatus === "ready";
  const teams = hasCache ? preloadedTeams : [];
  const hasTeams = teams.length > 0;

  const updateTeams = useCallback(
    (nextTeams) => {
      useSurfaceModalStore.getState().setPreloadedTeams(accountNpub, nextTeams);
    },
    [accountNpub],
  );
  const reloadTeams = useCallback(async () => {
    if (!accountNpub) return;
    try {
      const result = await loadVisibleTeams(accountNpub);
      useSurfaceModalStore.getState().setPreloadedTeams(accountNpub, result);
    } catch {
      toast({ title: copy.loadFailed, status: "error" });
      if (!useSurfaceModalStore.getState().preloadedTeams.length) {
        useSurfaceModalStore.getState().failTeamPreload(accountNpub);
      }
    }
  }, [accountNpub, copy, toast]);

  useEffect(() => {
    if (!isOpen || !accountNpub) return;
    if (!hasCache) {
      useSurfaceModalStore.getState().startTeamPreload(accountNpub);
      reloadTeams();
    } else if (preloadStatus !== "loading") reloadTeams();
  }, [isOpen, accountNpub, hasCache, preloadStatus, reloadTeams]);

  const close = () => {
    setSelectedTab(0);
    setCreateOpen(false);
    onClose();
  };
  const created = async () => {
    setCreateOpen(false);
    await reloadTeams();
    setSelectedTab(0);
    setRefreshTrigger((count) => count + 1);
  };
  const copyId = async () => {
    try {
      if (!accountNpub) throw new Error(copy.unavailable);
      await navigator.clipboard.writeText(accountNpub);
      toast({ title: copy.copiedId, status: "success" });
    } catch (error) {
      toast({
        title: copy.copyFailed,
        description: error.message,
        status: "error",
      });
    }
  };
  const handleInvite = async (invite, accept) => {
    setBusyInvite(invite.id);
    try {
      if (accept) await acceptTeamInvite(accountNpub, invite.id);
      else await rejectTeamInvite(accountNpub, invite.id);
      toast({
        title: accept ? copy.accepted : copy.declined,
        status: "success",
      });
      if (accept) {
        await reloadTeams();
        setSelectedTab(0);
        setRefreshTrigger((count) => count + 1);
      }
    } catch (error) {
      toast({
        title: copy.inviteFailed,
        description: error.message,
        status: "error",
      });
    } finally {
      setBusyInvite(null);
    }
  };

  const teamsPanel = (
    <TabPanel key="teams" px={0}>
      <HStack justify="flex-end" flexWrap="wrap" mb={4}>
        <Button colorScheme="teal" onClick={() => setCreateOpen(true)}>
          {copy.createTeam}
        </Button>
        <Button
          variant="outline"
          onClick={copyId}
          _active={{ transform: "translateY(1px)" }}
        >
          {copy.copyId}
        </Button>
      </HStack>
      {pendingInvites.length > 0 && (
        <Box mb={5}>
          <Text fontWeight="bold" mb={3}>
            {copy.pendingInvitations} ({pendingInvites.length})
          </Text>
          {pendingInvites.map((invite) => (
            <Box
              key={invite.id}
              p={4}
              mb={2}
              borderWidth="1px"
              borderColor="appBorder"
              borderRadius="xl"
              bg="appSurfaceElevated"
            >
              <Text fontWeight="semibold">{invite.teamName}</Text>
              <Text fontSize="sm">
                {copy.invitedBy}: {invite.invitedByName || invite.invitedBy}
              </Text>
              <HStack justify="flex-end" mt={3}>
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={busyInvite === invite.id}
                  onClick={() => handleInvite(invite, true)}
                >
                  {copy.accept}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={busyInvite === invite.id}
                  onClick={() => handleInvite(invite, false)}
                >
                  {copy.decline}
                </Button>
              </HStack>
            </Box>
          ))}
        </Box>
      )}
      <TeamView
        userLanguage={userLanguage}
        initialTeams={teams}
        initialProgress={preloadedProgress}
        initialProfiles={hasCache ? preloadedProfiles : undefined}
        initialOwnProgress={preloadedOwnProgress}
        initialOwnSalary={preloadedOwnSalary}
        isOpen={isOpen}
        refreshTrigger={refreshTrigger}
        onTeamsChange={updateTeams}
      />
    </TabPanel>
  );
  const feedPanel = (
    <TabPanel key="feed" px={0}>
      <CourseTeamFeed userLanguage={userLanguage} />
    </TabPanel>
  );

  return (
    <Drawer isOpen={isOpen} onClose={close} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent
        display="flex"
        flexDirection="column"
        bg="appSurfaceElevated"
        color="appText"
      >
        <DrawerHeader>{copy.teams}</DrawerHeader>
        <DrawerCloseButton aria-label={copy.close} />
        <DrawerBody flex="1" overflowY="auto" px={{ base: 4, sm: 6 }}>
          <Box maxW="720px" mx="auto">
            {!settled ? (
              <Box textAlign="center" py={10}>
                {preloadStatus === "error" ? (
                  <>
                    <Text>{copy.loadFailed}</Text>
                    <Button mt={3} onClick={reloadTeams}>
                      {copy.refresh}
                    </Button>
                  </>
                ) : (
                  <>
                    <Spinner color="teal.400" />
                    <Text mt={3}>{copy.loadingTeams}</Text>
                  </>
                )}
              </Box>
            ) : (
              <Tabs
                index={selectedTab}
                onChange={(index) => {
                  setSelectedTab(index);
                  if ((hasTeams && index === 0) || (!hasTeams && index === 1))
                    viewInvites();
                }}
                variant="unstyled"
              >
                <TabList
                  justifyContent="center"
                  borderBottomWidth="1px"
                  borderColor="appBorder"
                  mb={4}
                >
                  {(hasTeams
                    ? [copy.teams, copy.globalFeed]
                    : [copy.globalFeed, copy.teams]
                  ).map((label) => (
                    <Tab
                      key={label}
                      fontWeight="semibold"
                      color="appTextMuted"
                      position="relative"
                      px={4}
                      _selected={{
                        color: "teal.500",
                        _after: {
                          content: '""',
                          position: "absolute",
                          bottom: "-2px",
                          left: 0,
                          width: "100%",
                          height: "3px",
                          bgGradient: "linear(to-r, cyan.400, teal.500)",
                          borderRadius: "full",
                        },
                      }}
                    >
                      {label}
                      {label === copy.teams && pendingInvites.length > 0
                        ? ` (${pendingInvites.length})`
                        : ""}
                      {label === copy.teams && unseenInvite && (
                        <Box
                          as="span"
                          display="inline-block"
                          ml={2}
                          w="7px"
                          h="7px"
                          bg="red.500"
                          borderRadius="full"
                        />
                      )}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {hasTeams ? [teamsPanel, feedPanel] : [feedPanel, teamsPanel]}
                </TabPanels>
              </Tabs>
            )}
          </Box>
        </DrawerBody>
        <DrawerFooter
          position="sticky"
          bottom={0}
          bg="appSurfaceElevated"
          borderTopWidth="1px"
          borderColor="appBorder"
          justifyContent="flex-end"
        >
          <Button
            onClick={close}
            data-sound-close="true"
            bg="appSurfaceStrong"
            color="appText"
            borderWidth="1px"
            borderColor="appBorderStrong"
            _hover={{ bg: "appSurfaceMuted" }}
          >
            {copy.close}
          </Button>
        </DrawerFooter>
      </DrawerContent>
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg="appSurfaceElevated" color="appText">
          <ModalHeader>{copy.createTeam}</ModalHeader>
          <ModalCloseButton aria-label={copy.close} />
          <ModalBody pb={6}>
            <TeamCreation userLanguage={userLanguage} onTeamCreated={created} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Drawer>
  );
};
export default SocialFeedModal;
