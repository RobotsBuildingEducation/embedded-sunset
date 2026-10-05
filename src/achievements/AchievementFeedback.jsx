import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { achievementText, localizeAchievement } from "./copy.js";
import AchievementOrb from "./AchievementOrb.jsx";

export default function AchievementFeedback({ unlock, language = "en", onDismiss }) {
  if (!unlock) return null;
  const item = localizeAchievement(unlock.achievement, language);
  return <HStack data-achievement-feedback="" align="center" spacing={3} py={2} color="inherit" role="status" aria-live="polite" aria-atomic="true">
    <Box flexShrink={0}><AchievementOrb key={unlock.key} achievement={item} size={84} animated label={item.title} /></Box>
    <Box flex="1" minW={0}>
      <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing=".08em">{achievementText(unlock.preview ? "testUnlock" : unlock.test ? "testAward" : "achievementUnlocked", language)}</Text>
      <Text as="h3" fontSize="md" fontWeight="800" lineHeight="1.3" mt={1}>{item.title}</Text>
      <Text fontSize="sm" lineHeight="1.45" mt={1}>{item.desc}</Text>
    </Box>
    <IconButton flexShrink={0} alignSelf="start" size="xs" variant="ghost" color="inherit" aria-label={achievementText("close", language)} icon={<span aria-hidden="true">×</span>} onClick={onDismiss} />
  </HStack>;
}
