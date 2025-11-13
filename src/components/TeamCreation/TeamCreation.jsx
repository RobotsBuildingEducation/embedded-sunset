import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  useToast,
  IconButton,
  List,
  ListItem,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import {
  createTeam,
  inviteUserToTeam,
  checkUserExists,
  getUserData,
} from "../../utility/nosql";
import { useSharedNostr } from "../../hooks/useNOSTR";
import { translation } from "../../utility/translation";

export const TeamCreation = ({ userLanguage, onTeamCreated }) => {
  const toast = useToast();
  const [teamName, setTeamName] = useState("");
  const [memberNpub, setMemberNpub] = useState("");
  const [membersToInvite, setMembersToInvite] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const t = translation?.[userLanguage] || translation?.en || {};

  const { sendDirectMessage } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  const handleAddMember = () => {
    if (!memberNpub.trim()) {
      toast({
        title: t["teamCreation.errorTitle"] || "Error",
        description:
          t["teamCreation.invalidNpub"] || "Please enter a valid npub",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Basic npub validation
    if (!memberNpub.startsWith("npub")) {
      toast({
        title: t["teamCreation.errorTitle"] || "Error",
        description:
          t["teamCreation.invalidNpubFormat"] ||
          "Invalid npub format. It should start with 'npub'",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if already added
    if (membersToInvite.includes(memberNpub)) {
      toast({
        title: t["teamCreation.errorTitle"] || "Error",
        description:
          t["teamCreation.duplicateMember"] ||
          "This user is already in the invite list",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setMembersToInvite([...membersToInvite, memberNpub]);
    setMemberNpub("");
  };

  const handleRemoveMember = (npub) => {
    setMembersToInvite(membersToInvite.filter((m) => m !== npub));
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: t["teamCreation.errorTitle"] || "Error",
        description:
          t["teamCreation.missingTeamName"] || "Please enter a team name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (membersToInvite.length === 0) {
      toast({
        title: t["teamCreation.errorTitle"] || "Error",
        description:
          t["teamCreation.missingMember"] ||
          "Please add at least one member to invite",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreating(true);

    try {
      const creatorNpub = localStorage.getItem("local_npub");
      const creatorData = await getUserData(creatorNpub);
      const creatorName =
        creatorData?.name || t["teamCreation.unknownUser"] || "Unknown User";

      // Create the team
      const teamId = await createTeam(creatorNpub, teamName);

      // Send invites to all members
      const invitePromises = membersToInvite.map(async (inviteeNpub) => {
        try {
          // Check if user exists in Firestore
          const userExists = await checkUserExists(inviteeNpub);

          // Send invite to Firestore
          await inviteUserToTeam(
            creatorNpub,
            teamId,
            teamName,
            inviteeNpub,
            creatorName
          );

          // If user doesn't exist, send NOSTR DM
          if (!userExists) {
            const dmTemplate =
              t["teamCreation.dmMessage"] ||
              `Hi! You've been invited to join the team "{teamName}" on Robots Building Education (https://robotsbuildingeducation.com). Create an account to accept the invite and track your progress with your team!`;
            const dmMessage = dmTemplate.replace("{teamName}", teamName);
            await sendDirectMessage(inviteeNpub, dmMessage);
          }

          return { npub: inviteeNpub, success: true };
        } catch (error) {
          console.error(`Error inviting ${inviteeNpub}:`, error);
          return { npub: inviteeNpub, success: false, error };
        }
      });

      const results = await Promise.all(invitePromises);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      const successDescription = (
        t["teamCreation.successDescription"] ||
        `Team "{teamName}" created successfully. {successCount} invites sent`
      )
        .replace("{teamName}", teamName)
        .replace("{successCount}", successCount);
      const failSuffix = (
        t["teamCreation.successFailSuffix"] || ", {failCount} failed"
      ).replace("{failCount}", failCount);

      toast({
        title: t["teamCreation.successTitle"] || "Team Created!",
        description: successDescription + (failCount > 0 ? failSuffix : ""),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setTeamName("");
      setMembersToInvite([]);

      // Notify parent component
      if (onTeamCreated) {
        onTeamCreated(teamId);
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: t["teamCreation.errorTitle"] || "Error",
        description:
          error.message ||
          t["teamCreation.errorCreate"] ||
          "Failed to create team",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        {t["teamCreation.heading"] || "Create a New Team"}
      </Text>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>
            {t["teamCreation.teamNameLabel"] || "Team Name"}
          </FormLabel>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={
              t["teamCreation.teamNamePlaceholder"] || "Enter team name"
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            {t["teamCreation.addMembersLabel"] || "Add Team Members"}
          </FormLabel>
          <HStack>
            <Input
              value={memberNpub}
              onChange={(e) => setMemberNpub(e.target.value)}
              placeholder={
                t["teamCreation.npubPlaceholder"] ||
                "Enter npub (e.g., npub1...)"
              }
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddMember();
                }
              }}
            />
            <Button
              onClick={handleAddMember}
              boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
            >
              {t["teamCreation.addButton"] || "Add"}
            </Button>
          </HStack>
        </FormControl>

        {membersToInvite.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              {`${t["teamCreation.membersToInvite"] || "Members to Invite"} (${
                membersToInvite.length
              })`}
            </Text>
            <List spacing={2}>
              {membersToInvite.map((npub) => (
                <ListItem key={npub}>
                  <HStack
                    justify="space-between"
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <Text fontSize="sm" isTruncated maxWidth="80%">
                      {npub}
                    </Text>
                    <IconButton
                      size="xs"
                      icon={<CloseIcon />}
                      onClick={() => handleRemoveMember(npub)}
                      aria-label={
                        t["teamCreation.removeMemberAria"] || "Remove member"
                      }
                    />
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button
          // variant={"outline"}
          colorScheme="pink"
          onClick={handleCreateTeam}
          isLoading={isCreating}
          loadingText={t["teamCreation.creatingButton"] || "Creating Team..."}
          isDisabled={!teamName.trim() || membersToInvite.length === 0}
        >
          {t["teamCreation.createButton"] || "Create Team"}
        </Button>
      </VStack>
    </Box>
  );
};
