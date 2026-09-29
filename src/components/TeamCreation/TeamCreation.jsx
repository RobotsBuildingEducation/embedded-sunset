import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  List,
  ListItem,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import {
  addLearningTeamMembers,
  createLearningTeam,
  toHexPubkey,
} from "../../utility/learningTeams";
import { teamCopy } from "../../utility/teamCopy";
import { getUserData, inviteUserToTeam } from "../../utility/nosql";

export const TeamCreation = ({ userLanguage, onTeamCreated, team }) => {
  const copy = teamCopy(userLanguage);
  const toast = useToast();
  const [teamName, setTeamName] = useState("");
  const [memberNpub, setMemberNpub] = useState("");
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const accountNpub = localStorage.getItem("local_npub");

  const stageMember = () => {
    const value = memberNpub.trim();
    if (!value.startsWith("npub")) {
      toast({ title: copy.invalidNpub, status: "error", duration: 3500 });
      return;
    }
    let hex;
    try {
      hex = toHexPubkey(value);
    } catch {
      toast({ title: copy.invalidNpub, status: "error", duration: 3500 });
      return;
    }
    if (hex === toHexPubkey(accountNpub)) {
      toast({ title: copy.selfInvite, status: "warning", duration: 3500 });
      return;
    }
    if (
      members.some((member) => toHexPubkey(member) === hex) ||
      team?.members?.includes(hex)
    ) {
      toast({ title: copy.duplicateMember, status: "warning", duration: 3500 });
      return;
    }
    setMembers((current) => [...current, value]);
    setMemberNpub("");
  };

  const submit = async () => {
    if (!team && !teamName.trim())
      return toast({ title: copy.nameRequired, status: "error" });
    if (!members.length)
      return toast({ title: copy.memberRequired, status: "error" });
    setSaving(true);
    try {
      if (team?.legacy) {
        const creator = await getUserData(accountNpub);
        await Promise.all(
          members.map((member) =>
            inviteUserToTeam(
              accountNpub,
              team.id,
              team.name,
              member,
              creator?.name || "",
            ),
          ),
        );
      } else if (team) await addLearningTeamMembers(accountNpub, team, members);
      else await createLearningTeam(accountNpub, teamName.trim(), members);
      toast({
        title: team?.legacy
          ? copy.invitesSent
          : team
            ? copy.membersAdded
            : copy.teamCreated,
        status: "success",
        duration: 3500,
      });
      setTeamName("");
      setMemberNpub("");
      setMembers([]);
      onTeamCreated?.();
    } catch (error) {
      toast({
        title: copy.updateFailed,
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {!team && (
        <FormControl isRequired>
          <FormLabel>{copy.teamName}</FormLabel>
          <Input
            value={teamName}
            maxLength={80}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder={copy.teamName}
          />
        </FormControl>
      )}
      <FormControl isRequired>
        <FormLabel>{copy.inviteTeammates}</FormLabel>
        <HStack align="stretch">
          <Input
            value={memberNpub}
            onChange={(event) => setMemberNpub(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                stageMember();
              }
            }}
            placeholder="npub1…"
          />
          <Button variant="outline" onClick={stageMember}>
            {copy.invite}
          </Button>
        </HStack>
      </FormControl>
      {members.length > 0 && (
        <Box>
          <Text fontWeight="semibold" mb={2}>
            {copy.membersToInvite} ({members.length})
          </Text>
          <List spacing={2}>
            {members.map((npub) => (
              <ListItem key={npub}>
                <HStack
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  justify="space-between"
                >
                  <Text fontSize="sm" isTruncated minW={0}>
                    {npub}
                  </Text>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<CloseIcon />}
                    aria-label={copy.removeMember}
                    onClick={() =>
                      setMembers((current) =>
                        current.filter((member) => member !== npub),
                      )
                    }
                  />
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      <Button
        colorScheme="teal"
        w="full"
        isLoading={saving}
        isDisabled={!members.length || (!team && !teamName.trim())}
        onClick={submit}
      >
        {team ? copy.addMember : copy.createTeam}
      </Button>
    </VStack>
  );
};
