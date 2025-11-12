import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  useToast,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  getUserTeams,
  getUserTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
  subscribeToTeamInvites,
  subscribeToTeamUpdates,
  getTeamMemberProgress,
  deleteTeam,
  leaveTeam,
} from "../../utility/nosql";
import { steps } from "../../utility/content";

const totalSteps = steps["en"].length;

const getColorScheme = (group) => {
  const colorMap = {
    tutorial: "gray",
    1: "pink",
    2: "pink",
    3: "cyan",
    4: "blue",
    5: "teal",
    6: "green",
  };
  return colorMap[group] || "pink";
};

export const TeamView = ({ userLanguage, refreshTrigger }) => {
  const toast = useToast();
  const [myTeams, setMyTeams] = useState([]);
  const [teamInvites, setTeamInvites] = useState([]);
  const [teamMemberProgress, setTeamMemberProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState(null);

  const userNpub = localStorage.getItem("local_npub");

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [teams, invites] = await Promise.all([
        getUserTeams(userNpub),
        getUserTeamInvites(userNpub),
      ]);

      setMyTeams(teams);
      setTeamInvites(invites);

      // Load progress for each team
      const progressData = {};
      for (const team of teams) {
        try {
          // Use the correct creator npub for fetching progress
          const creatorNpub = team.isCreator ? userNpub : team.createdBy;
          const progress = await getTeamMemberProgress(creatorNpub, team.id);
          progressData[team.id] = progress;
        } catch (error) {
          console.error(`Error loading progress for team ${team.id}:`, error);
        }
      }
      setTeamMemberProgress(progressData);
    } catch (error) {
      console.error("Error loading team data:", error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userNpub, refreshTrigger]);

  // Subscribe to real-time team invite updates
  useEffect(() => {
    const unsubscribe = subscribeToTeamInvites(userNpub, (invites) => {
      setTeamInvites(invites);
    });

    return () => unsubscribe();
  }, [userNpub]);

  // Subscribe to real-time team updates
  useEffect(() => {
    const unsubscribers = myTeams.map((team) =>
      subscribeToTeamUpdates(userNpub, team.id, async (updatedTeam) => {
        if (updatedTeam) {
          // Update teams list
          setMyTeams((prevTeams) =>
            prevTeams.map((t) =>
              t.id === updatedTeam.id ? updatedTeam : t
            )
          );

          // Refresh progress for this team
          try {
            const progress = await getTeamMemberProgress(userNpub, team.id);
            setTeamMemberProgress((prev) => ({
              ...prev,
              [team.id]: progress,
            }));
          } catch (error) {
            console.error(
              `Error refreshing progress for team ${team.id}:`,
              error
            );
          }
        }
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [myTeams.length, userNpub]);

  const handleAcceptInvite = async (inviteId) => {
    setProcessingInvite(inviteId);
    try {
      await acceptTeamInvite(userNpub, inviteId);
      toast({
        title: "Invite Accepted",
        description: "You've joined the team!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reload all team data to show newly accepted team
      await loadData();
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invite",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    setProcessingInvite(inviteId);
    try {
      await rejectTeamInvite(userNpub, inviteId);
      toast({
        title: "Invite Rejected",
        description: "You've declined the team invitation",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error rejecting invite:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject invite",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteTeam(userNpub, teamId);
      toast({
        title: "Team Deleted",
        description: `Team "${teamName}" has been deleted`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Remove from local state
      setMyTeams(myTeams.filter((t) => t.id !== teamId));
      const newProgress = { ...teamMemberProgress };
      delete newProgress[teamId];
      setTeamMemberProgress(newProgress);
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLeaveTeam = async (teamId, teamName, creatorNpub) => {
    if (
      !window.confirm(
        `Are you sure you want to leave the team "${teamName}"?`
      )
    ) {
      return;
    }

    try {
      await leaveTeam(userNpub, creatorNpub, teamId);
      toast({
        title: "Left Team",
        description: `You've left the team "${teamName}"`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reload all team data
      await loadData();
    } catch (error) {
      console.error("Error leaving team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave team",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getProgressPercentage = (step) => {
    if (typeof step === "number") {
      return (step / totalSteps) * 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading teams...</Text>
      </Box>
    );
  }

  const pendingInvites = teamInvites.filter(
    (invite) => invite.status === "pending"
  );

  return (
    <VStack spacing={6} align="stretch">
      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            Pending Invitations
          </Text>
          <VStack spacing={3}>
            {pendingInvites.map((invite) => (
              <Box
                key={invite.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                width="100%"
                bg="yellow.50"
              >
                <Text fontWeight="bold">{invite.teamName}</Text>
                <Text fontSize="sm" color="gray.600">
                  Invited by: {invite.invitedByName}
                </Text>
                <HStack mt={3} spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleAcceptInvite(invite.id)}
                    isLoading={processingInvite === invite.id}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleRejectInvite(invite.id)}
                    isLoading={processingInvite === invite.id}
                  >
                    Decline
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* My Teams Section */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          My Teams ({myTeams.length})
        </Text>

        {myTeams.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            You haven't created any teams yet. Use "Create Team" to get started!
          </Alert>
        ) : (
          <Accordion allowMultiple>
            {myTeams.map((team) => {
              // Use the isCreator flag from getUserTeams
              const isCreator = team.isCreator === true || team.createdBy === userNpub;
              const acceptedMembers =
                team.members?.filter((m) => m.status === "accepted") || [];
              const pendingMembers =
                team.members?.filter((m) => m.status === "pending") || [];
              const progress = teamMemberProgress[team.id] || [];
              // Total members includes creator + accepted members
              const totalMembers = acceptedMembers.length + 1;

              return (
                <AccordionItem key={team.id}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <HStack>
                          <Text fontWeight="bold">{team.teamName}</Text>
                          {isCreator && (
                            <Badge colorScheme="purple">Creator</Badge>
                          )}
                          {!isCreator && (
                            <Badge colorScheme="green">Member</Badge>
                          )}
                          <Badge colorScheme="blue">
                            {totalMembers} {totalMembers === 1 ? "member" : "members"}
                          </Badge>
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack align="stretch" spacing={4}>
                      {/* Team Members Progress */}
                      {progress.length > 0 ? (
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Team Progress
                          </Text>
                          {progress.map((member) => (
                            <Box key={member.npub} mb={3}>
                              <HStack justify="space-between" mb={1}>
                                <HStack spacing={2}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {member.name}
                                  </Text>
                                  {member.isCreator && (
                                    <Badge colorScheme="purple" fontSize="xs">
                                      Creator
                                    </Badge>
                                  )}
                                </HStack>
                                <HStack spacing={2}>
                                  <Badge colorScheme="orange">
                                    {member.streak} day streak
                                  </Badge>
                                  <Badge colorScheme="green">
                                    {member.answeredStepsCount} questions
                                  </Badge>
                                </HStack>
                              </HStack>
                              <Progress
                                value={getProgressPercentage(member.step)}
                                colorScheme={getColorScheme(
                                  typeof member.step === "number" &&
                                    steps["en"][member.step]
                                    ? steps["en"][member.step]["group"]
                                    : 1
                                )}
                                size="sm"
                                borderRadius="md"
                              />
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          No members have accepted yet
                        </Text>
                      )}

                      {/* Pending Members */}
                      {pendingMembers.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Pending Invitations ({pendingMembers.length})
                          </Text>
                          {pendingMembers.map((member) => (
                            <Text
                              key={member.npub}
                              fontSize="xs"
                              color="gray.500"
                            >
                              {member.npub.substring(0, 20)}...
                            </Text>
                          ))}
                        </Box>
                      )}

                      <Divider />

                      {/* Actions */}
                      {isCreator ? (
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() =>
                            handleDeleteTeam(team.id, team.teamName)
                          }
                        >
                          Delete Team
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="orange"
                          variant="outline"
                          onClick={() =>
                            handleLeaveTeam(
                              team.id,
                              team.teamName,
                              team.createdBy
                            )
                          }
                        >
                          Leave Team
                        </Button>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </Box>
    </VStack>
  );
};
