/* eslint-disable react/prop-types */
import { Box, Button, Heading, Text, VStack, useColorModeValue, useToken } from "@chakra-ui/react";
import { APP_SQUIRCLE_SHAPE } from "../theme.js";
import RandomCharacter from "../elements/RandomCharacter.jsx";
import { KEY_REPLACEMENT_COPY, patreonCopyFor } from "./patreonSubscriptionCopy.js";
import { useThemeStore } from "../useThemeStore.jsx";

export default function PatreonKeyReplacementGate({ appLanguage = "en", onConfirm, onCancel, isChecking = false, statusError = "", embedded = false }) {
  const lang = appLanguage === "es" ? "es" : "en";
  const themeColor = useThemeStore((state) => state.themeColor);
  const [accent400, accent500, accent600] = useToken("colors", [
    `${themeColor}.400`,
    `${themeColor}.500`,
    `${themeColor}.600`,
  ]);
  const copy = patreonCopyFor(KEY_REPLACEMENT_COPY, lang);
  const pageBg = useColorModeValue("radial-gradient(circle at 18% 18%, rgba(168,85,247,.13), transparent 28%), radial-gradient(circle at 84% 10%, rgba(59,130,246,.12), transparent 24%), var(--chakra-colors-appBg)", "radial-gradient(circle at 20% 15%, rgba(168,85,247,.2), transparent 28%), radial-gradient(circle at 82% 18%, rgba(59,130,246,.14), transparent 26%), var(--chakra-colors-appBg)");
  const errorMessage = statusError === "membership_not_active" ? copy.membershipInactive : statusError === "unavailable" ? copy.unavailable : statusError ? copy.failed : "";
  const content = (
    <VStack align="stretch" spacing={{ base: 5, md: 6 }}>
      <Box textAlign="center">
        <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} px={4} py={1} w="fit-content" mx="auto" mb={4}><RandomCharacter notSoRandomCharacter="31" width="92px" /></Box>
        <Text color={accent400} fontSize="xs" fontWeight="black" letterSpacing="wide" textTransform="uppercase" mb={2}>{copy.eyebrow}</Text>
        <Heading size={{ base: "md", md: "lg" }}>{copy.title}</Heading>
      </Box>
      <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={{ base: 5, md: 6 }}>
        <Text color="appTextMuted" fontSize={{ base: "sm", md: "md" }} lineHeight="tall">{copy.body}</Text>
        <Text color="appText" fontSize="sm" fontWeight="bold" mt={4}>{copy.reassurance}</Text>
      </Box>
      <VStack spacing={3}>
        <Button w="100%" h="auto" py={5} bg={accent400} color="white" boxShadow={`0 4px 0 ${accent600}`} onClick={onConfirm} isLoading={isChecking} loadingText={copy.replacing} _hover={{ bg: accent500, color: "white", transform: "translateY(-1px)" }} _active={{ bg: accent600, color: "white", transform: "translateY(2px)" }}>{copy.confirm}</Button>
        <Button w="100%" variant="ghost" color={accent500} onClick={onCancel} isDisabled={isChecking}>{copy.cancel}</Button>
      </VStack>
      {errorMessage && <Text role="alert" color="red.300" fontSize="xs" textAlign="center">{errorMessage}</Text>}
    </VStack>
  );

  if (embedded) return <Box color="appText" py={2}>{content}</Box>;

  return (
    <Box minH="100dvh" bg={pageBg} color="appText" display="flex" alignItems="center" justifyContent="center" px={{ base: 2, md: 4 }} py={{ base: 3, md: 8 }}>
      <Box bg="appSurfaceElevated" borderWidth="1px" borderColor="appBorderStrong" borderRadius={{ base: "30px", md: "36px" }} style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={{ base: 4, md: 7 }} maxW="620px" w="100%" boxShadow="xl">
        {content}
      </Box>
    </Box>
  );
}
