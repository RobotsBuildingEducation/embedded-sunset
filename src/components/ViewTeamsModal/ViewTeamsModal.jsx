import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  VStack,
  Box,
  Text,
  Heading,
  useToast,
  Divider,
  HStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { translation } from "../../utility/translation";
import {
  getUserTeams,
  getUserPendingInvites,
  acceptTeamInvite,
  rejectTeamInvite,
} from "../../utility/nosql";

export const ViewTeamsModal = ({ isOpen, onClose, userLanguage }) => {
  const [teams, setTeams] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState(null);
  const toast = useToast();

  const loadTeamsAndInvites = async () => {
    setLoading(true);
    try {
      const npub = localStorage.getItem("local_npub");
      if (!npub) {
        setLoading(false);
        return;
      }

      const [userTeams, invites] = await Promise.all([
        getUserTeams(npub),
        getUserPendingInvites(npub),
      ]);

      setTeams(userTeams);
      setPendingInvites(invites);
    } catch (error) {
      console.error("Error loading teams and invites:", error);
      toast({
        title: translation[userLanguage]["teams.error.loading"] || "Error loading teams",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeamsAndInvites();
    }
  }, [isOpen]);

  const handleAcceptInvite = async (inviteId) => {
    setProcessingInvite(inviteId);
    try {
      const npub = localStorage.getItem("local_npub");
      await acceptTeamInvite(inviteId, npub);

      toast({
        title: translation[userLanguage]["teams.invite.accepted"] || "Invite accepted!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
        render: () => (
          <Box
            color="white"
            p={3}
            bg="green.500"
            borderRadius="md"
            boxShadow="lg"
          >
            <Text fontWeight="bold">
              {translation[userLanguage]["teams.invite.accepted"] || "Invite accepted!"}
            </Text>
          </Box>
        ),
      });

      // Reload data to show the new team
      await loadTeamsAndInvites();
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast({
        title: translation[userLanguage]["teams.error.accepting"] || "Error accepting invite",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    setProcessingInvite(inviteId);
    try {
      const npub = localStorage.getItem("local_npub");
      await rejectTeamInvite(inviteId, npub);

      toast({
        title: translation[userLanguage]["teams.invite.rejected"] || "Invite rejected",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      });

      // Reload data
      await loadTeamsAndInvites();
    } catch (error) {
      console.error("Error rejecting invite:", error);
      toast({
        title: translation[userLanguage]["teams.error.rejecting"] || "Error rejecting invite",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setProcessingInvite(null);
    }
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
          {translation[userLanguage]["teams.title"] || "Your Teams"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody flex="1" overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Pending Invites Section */}
            {pendingInvites.length > 0 && (
              <Box>
                <Heading size="md" mb={3}>
                  {translation[userLanguage]["teams.invites.pending"] || "Pending Invites"}{" "}
                  <Badge colorScheme="blue" fontSize="sm">
                    {pendingInvites.length}
                  </Badge>
                </Heading>
                <VStack spacing={3} align="stretch">
                  {pendingInvites.map((invite) => (
                    <Box
                      key={invite.id}
                      p={4}
                      borderWidth="2px"
                      borderColor="skyblue"
                      borderRadius="md"
                      bg="blue.50"
                    >
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          {invite.teamName || translation[userLanguage]["teams.invite.unknownTeam"]}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {translation[userLanguage]["teams.invite.from"] || "Invited by"}: {invite.inviterName || translation[userLanguage]["teams.invite.unknownUser"]}
                        </Text>
                        <HStack spacing={2} mt={2}>
                          <Button
                            colorScheme="green"
                            size="sm"
                            onClick={() => handleAcceptInvite(invite.id)}
                            isLoading={processingInvite === invite.id}
                            isDisabled={processingInvite !== null}
                          >
                            {translation[userLanguage]["teams.invite.accept"] || "Accept"}
                          </Button>
                          <Button
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectInvite(invite.id)}
                            isLoading={processingInvite === invite.id}
                            isDisabled={processingInvite !== null}
                          >
                            {translation[userLanguage]["teams.invite.reject"] || "Reject"}
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Teams Section */}
            {pendingInvites.length > 0 && teams.length > 0 && (
              <Divider />
            )}

            <Box>
              <Heading size="md" mb={3}>
                {translation[userLanguage]["teams.myTeams"] || "My Teams"}
                {teams.length > 0 && (
                  <Badge ml={2} colorScheme="purple" fontSize="sm">
                    {teams.length}
                  </Badge>
                )}
              </Heading>
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" color="purple.500" />
                  <Text mt={4} color="gray.600">
                    {translation[userLanguage]["teams.loading"] || "Loading teams..."}
                  </Text>
                </Box>
              ) : teams.length === 0 && pendingInvites.length === 0 ? (
                <Box
                  p={8}
                  textAlign="center"
                  borderWidth="1px"
                  borderRadius="md"
                  borderStyle="dashed"
                  borderColor="gray.300"
                >
                  <Text color="gray.500">
                    {translation[userLanguage]["teams.noTeams"] || "You haven't joined any teams yet"}
                  </Text>
                </Box>
              ) : teams.length === 0 ? (
                <Box
                  p={8}
                  textAlign="center"
                  borderWidth="1px"
                  borderRadius="md"
                  borderStyle="dashed"
                  borderColor="gray.300"
                >
                  <Text color="gray.500">
                    {translation[userLanguage]["teams.noTeamsYet"] || "No teams yet. Accept an invite to join a team!"}
                  </Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {teams.map((team) => (
                    <Box
                      key={team.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.200"
                      bg="white"
                      _hover={{ borderColor: "purple.300", shadow: "sm" }}
                      transition="all 0.2s"
                    >
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          {team.name}
                        </Text>
                        <HStack>
                          <Text fontSize="sm" color="gray.600">
                            {translation[userLanguage]["teams.members"] || "Members"}: {team.memberIds?.length || 0}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter
          position="sticky"
          bottom="0"
          bg="chakra-body-bg"
          borderTopWidth="1px"
          borderColor="blackAlpha.200"
          boxShadow="sm"
          justifyContent="flex-end"
        >
          <Button size="lg" onClick={onClose}>
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
