import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Link,
  Progress,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { teamCopy } from "../../utility/teamCopy";
import { loadCourseFeed } from "../../utility/courseTeamFeed";
import { steps } from "../../utility/content";
import { usableProfileName } from "../../utility/learningTeams";
import RandomCharacter from "../../elements/RandomCharacter";

const courseQuestionCount = steps.en?.length || 0;
const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));

function LinkedText({ value }) {
  return (value || "").split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <Link
        key={index}
        href={part}
        isExternal
        color="teal.500"
        overflowWrap="anywhere"
      >
        {part}
      </Link>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
}

export function CourseTeamFeed({ userLanguage }) {
  const copy = teamCopy(userLanguage);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [request, setRequest] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus("loading");
    loadCourseFeed()
      .then((result) => {
        if (!active) return;
        setPosts(result);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [request]);
  const refresh = () => setRequest((current) => current + 1);
  if (status === "loading")
    return (
      <Box py={8} textAlign="center">
        <Spinner color="teal.400" />
        <Text mt={3}>{copy.feedLoading}</Text>
      </Box>
    );
  if (status === "error")
    return (
      <Box p={5} borderWidth="1px" borderColor="appBorder" borderRadius="xl">
        <Text>{copy.feedFailed}</Text>
        <Button mt={3} onClick={refresh}>
          {copy.refresh}
        </Button>
      </Box>
    );
  if (!posts.length)
    return (
      <Box p={5} borderWidth="1px" borderColor="appBorder" borderRadius="xl">
        <Text>{copy.feedEmpty}</Text>
        <Button mt={3} onClick={refresh} variant="outline">
          {copy.refresh}
        </Button>
      </Box>
    );
  return (
    <VStack align="stretch" spacing={3}>
      {posts.map((post) => (
        <Box
          key={post.id}
          p={4}
          bg="appSurfaceElevated"
          borderWidth="1px"
          borderColor="appBorder"
          borderRadius="xl"
        >
          <HStack mb={3}>
            <RandomCharacter
              notSoRandomCharacter={post.characterIndex}
              width="32px"
              height="32px"
            />
            <Link
              href={`https://ditto.pub/${post.npub}`}
              isExternal
              fontWeight="semibold"
            >
              {usableProfileName(post.profile?.name) || copy.nameNotSet}
            </Link>
          </HStack>
          {post.questionNumber !== null && courseQuestionCount > 0 && (
            <Box mb={3}>
              <Progress
                value={clampPercent((post.questionNumber / courseQuestionCount) * 100)}
                colorScheme="teal"
                borderRadius="full"
                aria-label={copy.courseProgress}
              />
              <Text mt={1} fontSize="sm" color="appTextMuted">
                {copy.courseProgress}: {clampPercent((post.questionNumber / courseQuestionCount) * 100)}%
              </Text>
            </Box>
          )}
          {post.dailyGoalPercent !== null && (
            <Box mb={3}>
              <Progress
                value={post.dailyGoalPercent}
                colorScheme="yellow"
                borderRadius="full"
                aria-label={copy.goalCompletion}
              />
              <Text mt={1} fontSize="sm" color="appTextMuted">
                {copy.goalCompletion}: {post.dailyGoalPercent}%
              </Text>
            </Box>
          )}
          <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
            <LinkedText value={post.content} />
          </Text>
        </Box>
      ))}
    </VStack>
  );
}
