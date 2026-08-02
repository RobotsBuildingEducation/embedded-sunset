import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  buildPatreonModalReturnPath,
  completePatreonModalReturn,
} from "../utils/patreonOAuthReturn.js";

export default function PatreonOAuthModalReturn() {
  const navigate = useNavigate();
  const returnPathRef = useRef("");
  const result = useMemo(
    () => new URLSearchParams(window.location.search).get("patreon") || "oauth_error",
    [],
  );

  useEffect(() => {
    if (!returnPathRef.current) {
      const completed = completePatreonModalReturn(result);
      returnPathRef.current = buildPatreonModalReturnPath(
        completed?.returnPath || "/",
        result,
      );
    }
    navigate(returnPathRef.current, { replace: true });
  }, [navigate, result]);

  return (
    <Center minH="100dvh" bg="appBg" color="appText" px={6}>
      <VStack spacing={4} textAlign="center">
        <Spinner color="purple.400" thickness="4px" size="lg" />
        <Text fontWeight="bold">Returning to your subscription…</Text>
      </VStack>
    </Center>
  );
}
