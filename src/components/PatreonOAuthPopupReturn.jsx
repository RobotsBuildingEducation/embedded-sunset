import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";

export const PATREON_POPUP_MESSAGE = "rbe:patreon-oauth-complete";

export default function PatreonOAuthPopupReturn() {
  const result = useMemo(
    () => new URLSearchParams(window.location.search).get("patreon") || "oauth_error",
    [],
  );

  useEffect(() => {
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(
        { type: PATREON_POPUP_MESSAGE, result },
        window.location.origin,
      );
      const closeTimer = window.setTimeout(() => window.close(), 80);
      return () => window.clearTimeout(closeTimer);
    }
    return undefined;
  }, [result]);

  return (
    <Center minH="100dvh" bg="appBg" color="appText" px={6}>
      <VStack spacing={4} textAlign="center">
        <Spinner color="purple.400" thickness="4px" size="lg" />
        <Text fontWeight="bold">Returning to Robots Building Education…</Text>
        <Text color="appTextMuted" fontSize="sm">You can close this window if it does not close automatically.</Text>
      </VStack>
    </Center>
  );
}
