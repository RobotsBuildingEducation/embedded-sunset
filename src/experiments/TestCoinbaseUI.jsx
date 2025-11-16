import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  Link,
  Progress,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useSharedNostr } from "../hooks/useNOSTR";
import { steps } from "../utility/content";
import { CloudCanvas, SunsetCanvas } from "../elements/SunsetCanvas";
import { translation } from "../utility/translation";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "../database/firebaseResources";
let totalSteps = steps["en"].length;

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

  // Default to a medium shade if group doesn't match any key
  // console.log("colorMap", colorMap[group]);
  return colorMap[group] || "pink.500";
};
const lightenColor = (color, percent) => {
  // Remove the '#' character if it's there
  const hex = color.replace(/^#/, "");

  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Calculate the new color, increasing brightness
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // Convert back to hex and return
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
const getBackgroundScheme = (group) => {
  const colorMap = {
    tutorial: "#808080", // Gray
    1: "#ff69b4", // Pink
    2: "#800080", // pink
    3: "#00ffff", // Cyan
    4: "#0000ff", // Blue
    5: "#008080", // Teal
    6: "#008000", // Green
  };

  const color = colorMap[group] || "#800080"; // Fallback to pink
  return lightenColor(color, 0.9); // Lighten by 50%
};

const parseNoSaboProgress = (text) => {
  if (!text) return null;

  const percentMatch = text.match(/(\d+)%\s+through\s+today's/i);
  const ratioMatch = text.match(/\((\d+)\s*\/\s*(\d+)\s*XP\)/i);

  let percent = percentMatch ? parseInt(percentMatch[1], 10) : null;

  if (!percent && ratioMatch) {
    const current = parseInt(ratioMatch[1], 10);
    const goal = parseInt(ratioMatch[2], 10);
    if (goal > 0) {
      percent = Math.min(100, Math.round((current / goal) * 100));
    }
  }

  return Number.isFinite(percent) ? percent : null;
};

const getNoSaboProgressColor = (percent) => {
  if (percent >= 100) return "green";
  if (percent >= 60) return "blue";
  return "orange";
};

const waveFillStyles = {
  "& > div": {
    backgroundImage:
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0 12px, rgba(255,255,255,0.2) 12px 24px)",
  },
};

function ReplaceHashtagWithLink({ text }) {
  // const parts = text.split(/(#LearnWithNostr)/g);
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <Link
              key={index}
              href={part}
              color="blue.500"
              isExternal
              textDecoration="underline"
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </>
  );
}

export const TestFeed = ({ userLanguage, allowPosts, setAllowPosts }) => {
  const toast = useToast();
  const [localLoad, setLocalLoad] = useState(false);
  const [profiles, setProfiles] = useState([]);

  const { getGlobalNotesWithProfilesByHashtag } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  useEffect(() => {
    const run = async () => {
      setLocalLoad(true);
      const data = await getGlobalNotesWithProfilesByHashtag();

      console.log("data list", data);
      const parse = data.filter((item) => {
        const name = item.profile?.name?.toLowerCase();
        return !["data", "test", "hi", "text", "hii"].includes(name);
      });
      setProfiles(parse);
      setLocalLoad(false);
    };

    run();
  }, []);

  const extractQuestionNumber = (text) => {
    // Match "question <number>"
    const match = text.match(/question (\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const handleToggleAllowPosts = async (e) => {
    const newValue = e.target.checked;
    setAllowPosts(newValue);
    const userDocRef = doc(
      database,
      "users",
      localStorage.getItem("local_npub")
    );
    await updateDoc(userDocRef, { allowPosts: newValue });
  };

  const handleCopyKeys = () => {
    const keysToCopy = `${localStorage.getItem("local_nsec")}`;
    navigator.clipboard.writeText(keysToCopy);
    toast({
      title: translation[userLanguage]["toast.title.keysCopied"],
      description: translation[userLanguage]["toast.description.keysCopied"],
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top",
      render: () => (
        <Box
          color="black"
          p={3}
          bg="#FEEBC8" // Custom background color here!
          borderRadius="md"
          boxShadow="lg"
        >
          <Text fontWeight="bold">
            {translation[userLanguage]["toast.title.keysCopied"]}
          </Text>
          <Text>
            {translation[userLanguage]["toast.description.keysCopied"]}
          </Text>
        </Box>
      ),
    });
  };

  if (localLoad) return <CloudCanvas />;

  return (
    <div>
      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="allow-posts-switch" mb="0">
          {translation[userLanguage]["tag.allowPosting"]}
        </FormLabel>
        <Switch
          id="allow-posts-switch"
          isChecked={allowPosts}
          onChange={handleToggleAllowPosts}
        />
      </FormControl>
      {profiles.map((profile, index) => {
        const questionNumber = extractQuestionNumber(profile.content);

        const hasScholarship = profile.content
          .toLowerCase()
          .includes("a new scholarship");

        const noSaboProgress = (profile.content || "")
          .toLowerCase()
          .includes("through today's");
        const noSaboPercent = noSaboProgress
          ? parseNoSaboProgress(profile.content)
          : null;
        // ||
        // profile.content.toLowerCase().includes("https://girlsoncampus.app") ||
        // profile.content.toLowerCase().includes("gm nostr!") ||
        // profile.content.toLowerCase().includes("¡Buenos días, Nostr!");

        return (
          (questionNumber || hasScholarship || noSaboProgress) && (
            <Box
              key={index}
              style={{ textAlign: "left" }}
              fontSize="sm"
              padding={4}
            >
              <Box display="flex" alignItems={"center"}>
                <Image
                  src={
                    profile.profile.picture ||
                    'https://primal.b-cdn.net/media-cache?s=o&a=1&u=https%3A%2F%2Fm.primal.net%2FKBLq.png"'
                  }
                  width={8}
                  height={8}
                  borderRadius={"46%"}
                />
                &nbsp;
                <Link
                  href={"https://primal.net/p/" + profile.npub}
                  textDecoration={"underline"}
                  target="_blank"
                >
                  {profile.profile.name}
                </Link>
              </Box>

              {questionNumber && (
                <Progress
                  value={(questionNumber / totalSteps) * 100} // Assuming a max question count of 100
                  mt={1}
                  colorScheme={getColorScheme(
                    steps["en"][questionNumber]["group"]
                  )}
                  width="80%"
                  mb={4}
                  borderRadius="4px"
                  background={getBackgroundScheme(
                    steps["en"][questionNumber]["group"]
                  )}
                />
              )}
              {noSaboPercent !== null && (
                <Progress
                  value={noSaboPercent}
                  mt={1}
                  colorScheme={getNoSaboProgressColor(noSaboPercent)}
                  width="80%"
                  mb={4}
                  borderRadius="4px"
                  background="rgba(255,255,255,0.2)"
                  sx={waveFillStyles}
                />
              )}
              <br />
              <div>
                <ReplaceHashtagWithLink text={profile.content} />
              </div>
              <br />
              <hr />
            </Box>
          )
        );
      })}
    </div>
  );
};
