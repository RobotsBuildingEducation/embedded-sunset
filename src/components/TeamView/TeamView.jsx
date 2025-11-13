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
import { translation } from "../../utility/translation";

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
  const t = translation?.[userLanguage] || translation?.en || {};

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
        title: t["teamView.errorTitle"] || "Error",
        description:
          t["teamView.loadError"] || "Failed to load team data",
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
        title: t["teamView.inviteAcceptedTitle"] || "Invite Accepted",
        description:
          t["teamView.inviteAcceptedDescription"] ||
          "You've joined the team!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reload all team data to show newly accepted team
      await loadData();
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast({
        title: t["teamView.errorTitle"] || "Error",
        description:
          error.message ||
          t["teamView.acceptError"] ||
          "Failed to accept invite",
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
        title: t["teamView.inviteRejectedTitle"] || "Invite Rejected",
        description:
          t["teamView.inviteRejectedDescription"] ||
          "You've declined the team invitation",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error rejecting invite:", error);
      toast({
        title: t["teamView.errorTitle"] || "Error",
        description:
          error.message ||
          t["teamView.rejectError"] ||
          "Failed to reject invite",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    const confirmMessage = (
      t["teamView.deleteConfirm"] ||
      `Are you sure you want to delete the team "{teamName}"? This action cannot be undone.`
    ).replace("{teamName}", teamName);

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteTeam(userNpub, teamId);
      toast({
        title: t["teamView.teamDeletedTitle"] || "Team Deleted",
        description:
          (t["teamView.teamDeletedDescription"] ||
            `Team "{teamName}" has been deleted`).replace(
            "{teamName}",
            teamName
          ),
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
        title: t["teamView.errorTitle"] || "Error",
        description:
          error.message ||
          t["teamView.deleteError"] ||
          "Failed to delete team",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLeaveTeam = async (teamId, teamName, creatorNpub) => {
    const leaveConfirm = (
      t["teamView.leaveConfirm"] ||
      `Are you sure you want to leave the team "{teamName}"?`
    ).replace("{teamName}", teamName);

    if (!window.confirm(leaveConfirm)) {
      return;
    }

    try {
      await leaveTeam(userNpub, creatorNpub, teamId);
      toast({
        title: t["teamView.leftTeamTitle"] || "Left Team",
        description:
          (t["teamView.leftTeamDescription"] ||
            `You've left the team "{teamName}"`).replace(
            "{teamName}",
            teamName
          ),
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reload all team data
      await loadData();
    } catch (error) {
      console.error("Error leaving team:", error);
      toast({
        title: t["teamView.errorTitle"] || "Error",
        description:
          error.message ||
          t["teamView.leaveError"] ||
          "Failed to leave team",
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
        <Text mt={4}>{t["teamView.loading"] || "Loading teams..."}</Text>
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
            {t["teamView.pendingInvitations"] || "Pending Invitations"}
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
                  {(t["teamView.invitedBy"] || "Invited by:") + " "}
                  {invite.invitedByName}
                </Text>
                <HStack mt={3} spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleAcceptInvite(invite.id)}
                    isLoading={processingInvite === invite.id}
                  >
                    {t["teamView.acceptButton"] || "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleRejectInvite(invite.id)}
                    isLoading={processingInvite === invite.id}
                  >
                    {t["teamView.declineButton"] || "Decline"}
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
          {`${t["teamView.myTeams"] || "My Teams"} (${myTeams.length})`}
        </Text>

        {myTeams.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            {(t["teamView.noTeamsAlert"] ||
              `You haven't created any teams yet. Use "{createTeam}" to get started!`
            ).replace(
              "{createTeam}",
              t["socialFeed.tab.createTeam"] || "Create Team"
            )}
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
                            <Badge colorScheme="purple">
                              {t["teamView.badge.creator"] || "Creator"}
                            </Badge>
                          )}
                          {!isCreator && (
                            <Badge colorScheme="green">
                              {t["teamView.badge.member"] || "Member"}
                            </Badge>
                          )}
                          <Badge colorScheme="blue">
                            {totalMembers}{" "}
                            {totalMembers === 1
                              ? t["teamView.memberCountSingular"] || "member"
                              : t["teamView.memberCountPlural"] || "members"}
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
                            {t["teamView.teamProgress"] || "Team Progress"}
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
                                      {t["teamView.badge.creator"] || "Creator"}
                                    </Badge>
                                  )}
                                </HStack>
                                <HStack spacing={2}>
                                  <Badge colorScheme="orange">
                                    {(t["teamView.streakLabel"] ||
                                      "{count} day streak").replace(
                                      "{count}",
                                      member.streak
                                    )}
                                  </Badge>
                                  <Badge colorScheme="green">
                                    {(t["teamView.questionsLabel"] ||
                                      "{count} questions").replace(
                                      "{count}",
                                      member.answeredStepsCount
                                    )}
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
                          {t["teamView.noMembers"] ||
                            "No members have accepted yet"}
                        </Text>
                      )}

                      {/* Pending Members */}
                      {pendingMembers.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            {`${t["teamView.pendingMembers"] ||
                              "Pending Invitations"} (${pendingMembers.length})`}
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
                          {t["teamView.deleteTeamButton"] || "Delete Team"}
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
                          {t["teamView.leaveTeamButton"] || "Leave Team"}
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
