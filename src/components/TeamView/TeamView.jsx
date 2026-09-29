import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { doc, onSnapshot } from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import {
  deleteLearningTeam,
  leaveLearningTeam,
  loadCourseProgress,
  loadNostrProfileNames,
  publishCourseProgress,
  renameLearningTeam,
  toHexPubkey,
  usableProfileName,
} from "../../utility/learningTeams";
import { loadVisibleTeams } from "../../utility/teamDirectory";
import {
  deleteTeam as deleteLegacyTeam,
  leaveTeam as leaveLegacyTeam,
  renameLegacyTeam,
} from "../../utility/nosql";
import {
  clampPercent,
  makeCourseProgressSnapshot,
  ownSalaryValue,
} from "../../utility/courseTeamProgress";
import { teamCopy } from "../../utility/teamCopy";
import { TeamCreation } from "../TeamCreation/TeamCreation";
import WaveBar from "../WaveBar";
import ChapterProgressBar from "../ChapterProgressBar";

const percent = (part, total) =>
  Number.isFinite(part) && Number.isFinite(total) && total > 0
    ? clampPercent(Math.round((part / total) * 100))
    : null;
const EMPTY_PROFILES = new Map();

function Measure({ label, completed, total, copy, variant = "chapter" }) {
  const value = percent(completed, total);
  return (
    <Box>
      <HStack justify="space-between" align="start" gap={2} mb={2}>
        <Text fontSize="sm" fontWeight="semibold">
          {label}
        </Text>
        <Text fontSize="sm" textAlign="right">
          {value === null
            ? copy.unavailable
            : `${value}%`}
        </Text>
      </HStack>
      {value !== null &&
        (variant === "dailyGoal" ? (
          <WaveBar
            value={value}
            height={14}
            start="#03f4fc"
            end="#fef37b"
          />
        ) : (
          <ChapterProgressBar value={value} label={label} />
        ))}
    </Box>
  );
}

function MemberCard({
  pubkey,
  viewer,
  data,
  displayName,
  salary,
  language,
  copy,
}) {
  const chapter = data?.chapters?.find(
    (item) => item.id === data.currentChapterId,
  );
  const course = data?.courseProgress;
  const coursePct =
    course?.percent == null
      ? percent(course?.completed, course?.total)
      : clampPercent(course.percent);
  return (
    <Box
      bg="appSurfaceElevated"
      borderWidth="1px"
      borderColor="appBorder"
      borderRadius="xl"
      p={{ base: 3, sm: 4 }}
      boxShadow="sm"
    >
      <HStack justify="space-between" align="start" gap={2}>
        <Text fontWeight="bold" overflowWrap="anywhere">
          {usableProfileName(displayName) ||
            usableProfileName(data?.name) ||
            copy.nameNotSet}
          {pubkey === viewer ? ` (${copy.you})` : ""}
        </Text>
      </HStack>
      {!data ? (
        <Text mt={3} fontSize="sm" color="appTextMuted">
          {copy.noProgress}
        </Text>
      ) : (
        <VStack align="stretch" spacing={4} mt={4}>
          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            }}
            gap={2}
          >
            <Box bg="appSurfaceMuted" p={3} borderRadius="lg">
              <Text fontSize="xs" color="appTextMuted">
                {copy.currentChapter}
              </Text>
              <Text fontWeight="semibold" overflowWrap="anywhere">
                {data.currentChapterId
                  ? ["introduction", "tutorial"].includes(
                      String(data.currentChapterId).toLowerCase(),
                    )
                    ? "Tutorial"
                    : String(data.currentChapterId)
                  : copy.noChapter}
              </Text>
            </Box>
            <Box bg="appSurfaceMuted" p={3} borderRadius="lg">
              <Text fontSize="xs" color="appTextMuted">
                {copy.courseProgress}
              </Text>
              <Text fontWeight="semibold">
                {coursePct == null ? "—" : `${coursePct}%`}
              </Text>
            </Box>
            <Box bg="appSurfaceMuted" p={3} borderRadius="lg">
              <Text fontSize="xs" color="appTextMuted">
                {copy.salary}
              </Text>
              <Text fontWeight="semibold" overflowWrap="anywhere">
                {salary
                  ? `$${new Intl.NumberFormat(language?.startsWith("es") ? "es-MX" : "en-US", { maximumFractionDigits: 0 }).format(salary.amount)}`
                  : "—"}
              </Text>
            </Box>
          </Box>
          {chapter ? (
            <Measure
              label={copy.chapterProgress}
              completed={chapter.completed}
              total={chapter.total}
              copy={copy}
            />
          ) : (
            <Text fontSize="sm">{copy.noChapter}</Text>
          )}
          {data.dailyGoal?.target > 0 ? (
            <Measure
              label={copy.dailyGoal}
              completed={data.dailyGoal.completed}
              total={data.dailyGoal.target}
              copy={copy}
              variant="dailyGoal"
            />
          ) : (
            <Text fontSize="sm">{copy.noGoal}</Text>
          )}
        </VStack>
      )}
    </Box>
  );
}

export const TeamView = ({
  userLanguage,
  refreshTrigger,
  isOpen,
  initialTeams = [],
  initialProgress = new Map(),
  initialProfiles = EMPTY_PROFILES,
  initialOwnProgress = null,
  initialOwnSalary = null,
  onTeamsChange,
}) => {
  const copy = teamCopy(userLanguage);
  const toast = useToast();
  const accountNpub = localStorage.getItem("local_npub");
  const [teams, setTeams] = useState(initialTeams);
  const [progress, setProgress] = useState(initialProgress);
  const [profileNames, setProfileNames] = useState(initialProfiles);
  const [ownProgress, setOwnProgress] = useState(initialOwnProgress);
  const [ownSalary, setOwnSalary] = useState(initialOwnSalary);
  const [loading, setLoading] = useState(false);
  const [memberError, setMemberError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [name, setName] = useState("");
  const lastProgressRef = useRef("");
  const viewer = accountNpub ? toHexPubkey(accountNpub) : "";
  const ownProfileName = profileNames.get(viewer);

  useEffect(() => {
    setProfileNames(initialProfiles || new Map());
  }, [accountNpub, initialProfiles]);
  useEffect(() => {
    if (initialProgress?.size)
      setProgress((current) => (current.size ? current : initialProgress));
  }, [initialProgress]);
  useEffect(() => {
    if (initialOwnProgress)
      setOwnProgress((current) => current || initialOwnProgress);
  }, [initialOwnProgress]);
  useEffect(() => {
    if (initialOwnSalary)
      setOwnSalary((current) => current || initialOwnSalary);
  }, [initialOwnSalary]);

  const refresh = useCallback(async () => {
    if (!accountNpub) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const nextTeams = await loadVisibleTeams(accountNpub);
      setTeams(nextTeams);
      onTeamsChange?.(nextTeams);
      setMemberError(false);
      const memberHexes = [
        ...new Set(nextTeams.flatMap((team) => team.members)),
      ];
      loadNostrProfileNames(memberHexes)
        .then((names) => {
          if (localStorage.getItem("local_npub") === accountNpub && names.size)
            setProfileNames(names);
        })
        .catch(() => {});
      try {
        setProgress(await loadCourseProgress(memberHexes));
      } catch {
        setMemberError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [accountNpub, onTeamsChange]);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh, refreshTrigger]);
  useEffect(() => {
    if (!isOpen || !teams.length) return;
    let active = true;
    const syncProgress = async () => {
      const memberHexes = [...new Set(teams.flatMap((team) => team.members))];
      try {
        const latest = await loadCourseProgress(memberHexes);
        if (active) setProgress(latest);
      } catch {
        if (active) setMemberError(true);
      }
    };
    const interval = setInterval(syncProgress, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isOpen, teams]);
  useEffect(() => {
    if (!isOpen || !accountNpub) return;
    lastProgressRef.current = "";
    let first = true;
    let timer;
    let active = true;
    const unsubscribe = onSnapshot(
      doc(database, "users", accountNpub),
      (snapshot) => {
        const source = snapshot.data() || {};
        const value = makeCourseProgressSnapshot({
          ...source,
          name: ownProfileName || source.name,
        });
        setOwnProgress(value);
        setOwnSalary(ownSalaryValue(source));
        const comparable = JSON.stringify({ ...value, updatedAt: 0 });
        if (comparable === lastProgressRef.current) return;
        lastProgressRef.current = comparable;
        clearTimeout(timer);
        const publish = async () => {
          try {
            await publishCourseProgress(accountNpub, value);
          } catch (error) {
            if (active)
              toast({
                title: copy.syncFailed,
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
              });
          }
        };
        if (first) {
          first = false;
          publish();
        } else timer = setTimeout(publish, 700);
      },
      () => {
        if (active) toast({ title: copy.syncFailed, status: "error" });
      },
    );
    return () => {
      active = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [accountNpub, isOpen, copy, toast, ownProfileName]);

  const act = async (team, operation) => {
    if (
      !window.confirm(
        operation === "delete"
          ? copy.confirmDelete(team.name)
          : copy.confirmLeave(team.name),
      )
    )
      return;
    setBusyId(team.id);
    try {
      if (team.legacy) {
        if (operation === "delete")
          await deleteLegacyTeam(accountNpub, team.id);
        else await leaveLegacyTeam(accountNpub, team.creatorNpub, team.id);
      } else if (operation === "delete")
        await deleteLearningTeam(accountNpub, team);
      else await leaveLearningTeam(accountNpub, team);
      const next = teams.filter((item) => item.id !== team.id);
      setTeams(next);
      onTeamsChange?.(next);
      toast({
        title: operation === "delete" ? copy.deleted : copy.left,
        status: "success",
      });
    } catch (error) {
      toast({
        title: copy.updateFailed,
        description: error.message,
        status: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const rename = async () => {
    if (!editingTeam || !name.trim() || name.trim() === editingTeam.name)
      return;
    setBusyId(editingTeam.id);
    try {
      if (editingTeam.legacy)
        await renameLegacyTeam(accountNpub, editingTeam.id, name.trim());
      else await renameLearningTeam(accountNpub, editingTeam, name.trim());
      setEditingTeam(null);
      toast({ title: copy.renamed, status: "success" });
      await refresh();
    } catch (error) {
      toast({
        title: copy.updateFailed,
        description: error.message,
        status: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const teamContent = (team) => (
    <VStack align="stretch" spacing={4} p={{ base: 3, sm: 4 }}>
      {team.creatorHex === viewer && (
        <Button
          size="sm"
          colorScheme="teal"
          alignSelf="end"
          onClick={() => setAddingTo(team)}
        >
          {copy.addMember}
        </Button>
      )}
      {memberError ? (
        <Text>{copy.memberLoadFailed}</Text>
      ) : team.members.length ? (
        team.members.map((pubkey) => (
          <MemberCard
            key={pubkey}
            pubkey={pubkey}
            viewer={viewer}
            data={pubkey === viewer ? ownProgress : progress.get(pubkey)}
            displayName={profileNames.get(pubkey)}
            salary={pubkey === viewer ? ownSalary : null}
            language={userLanguage}
            copy={copy}
          />
        ))
      ) : (
        <Text>{copy.noMembers}</Text>
      )}
      {team.pendingMembers?.length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="semibold">
            {copy.pendingInvitations}
          </Text>
          {team.pendingMembers.map((member) => (
            <Text key={member} fontSize="sm" overflowWrap="anywhere">
              {member}
            </Text>
          ))}
        </Box>
      )}
      <HStack justify="end">
        <IconButton
          size="sm"
          variant="outline"
          colorScheme="red"
          aria-label={
            team.creatorHex === viewer ? copy.deleteTeam : copy.leaveTeam
          }
          title={team.creatorHex === viewer ? copy.deleteTeam : copy.leaveTeam}
          icon={<DeleteIcon />}
          isLoading={busyId === team.id}
          onClick={() =>
            act(team, team.creatorHex === viewer ? "delete" : "leave")
          }
        />
      </HStack>
    </VStack>
  );
  const heading = (team) => (
    <HStack minW={0} flex="1">
      <Text fontWeight="bold" isTruncated>
        {team.name}
      </Text>
      {team.creatorHex === viewer && (
        <IconButton
          size="xs"
          variant="ghost"
          icon={<EditIcon />}
          aria-label={copy.editName}
          onClick={(event) => {
            event.stopPropagation();
            setName(team.name);
            setEditingTeam(team);
          }}
        />
      )}
      <Badge>
        {team.members.length}{" "}
        {team.members.length === 1
          ? copy.memberCountSingular
          : copy.memberCount}
      </Badge>
    </HStack>
  );

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="lg" fontWeight="bold">
        {copy.myTeams} ({teams.length}){" "}
        {loading && <Spinner size="xs" ml={2} />}
      </Text>
      {loadError && teams.length > 0 && (
        <Text color="red.500">{copy.loadFailed}</Text>
      )}
      {loadError && !teams.length ? (
        <Box>
          <Text>{copy.loadFailed}</Text>
          <Button mt={2} onClick={refresh}>
            {copy.refresh}
          </Button>
        </Box>
      ) : teams.length === 0 ? (
        <Text>{copy.emptyTeams}</Text>
      ) : teams.length === 1 ? (
        <Box
          borderWidth="1px"
          borderColor="appBorder"
          borderRadius="xl"
          bg="appBgMuted"
        >
          <HStack p={4}>{heading(teams[0])}</HStack>
          {teamContent(teams[0])}
        </Box>
      ) : (
        <Accordion allowMultiple>
          {teams.map((team) => (
            <AccordionItem
              key={`${team.creatorHex}:${team.id}`}
              borderWidth="1px"
              borderColor="appBorder"
              borderRadius="xl"
              mb={3}
              bg="appBgMuted"
            >
              <h2>
                <AccordionButton py={4}>
                  {heading(team)}
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel p={0}>{teamContent(team)}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      <Modal
        isOpen={Boolean(editingTeam)}
        onClose={() => {
          if (!busyId) setEditingTeam(null);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg="appSurfaceElevated" color="appText">
          <ModalHeader>{copy.editName}</ModalHeader>
          <ModalCloseButton isDisabled={Boolean(busyId)} />
          <ModalBody pb={6}>
            <Input
              autoFocus
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") rename();
              }}
            />
            <HStack justify="end" mt={4}>
              <Button
                variant="outline"
                isDisabled={Boolean(busyId)}
                onClick={() => setEditingTeam(null)}
              >
                {copy.cancel}
              </Button>
              <Button
                colorScheme="teal"
                isLoading={Boolean(busyId)}
                isDisabled={!name.trim() || name.trim() === editingTeam?.name}
                onClick={rename}
              >
                {copy.save}
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={Boolean(addingTo)}
        onClose={() => setAddingTo(null)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg="appSurfaceElevated" color="appText">
          <ModalHeader>{copy.addMember}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {addingTo && (
              <TeamCreation
                team={addingTo}
                userLanguage={userLanguage}
                onTeamCreated={() => {
                  setAddingTo(null);
                  refresh();
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
