import {
  Box,
  Center,
  Heading,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { APP_SQUIRCLE_SHAPE } from "../theme.js";
import {
  buildPatreonCompletedReturnPath,
  completePatreonModalReturn,
  normalizePatreonReturnLanguage,
  normalizePatreonReturnResult,
} from "../utils/patreonOAuthReturn.js";

const ACTION_REQUIRED_RESULTS = new Set([
  "checkout_required",
  "link_conflict",
  "not_subscribed",
  "replace_rate_limited",
  "replace_required",
]);

const COPY = {
  en: {
    eyebrow: "Patreon return",
    connectedTitle: "Patreon is connected",
    connectedBody:
      "Your membership was linked successfully. Close this temporary tab and return to the app where you started.",
    actionTitle: "Subscribed!",
    actionBody:
      "Your Patreon account was verified. Close this tab and return to your original app to unlock your session.",
    cancelledTitle: "Patreon connection cancelled",
    cancelledBody:
      "No account changes were made. Close this tab and return to the original app when you are ready to try again.",
    errorTitle: "Patreon connection incomplete",
    errorBody:
      "We could not finish this Patreon connection. Close this tab, return to the original app, and try again.",
    returning: "Returning to your subscription…",
    code: "Result code",
  },
  es: {
    eyebrow: "Regreso de Patreon",
    connectedTitle: "Patreon está conectado",
    connectedBody:
      "Tu membresía se vinculó correctamente. Cierra esta pestaña temporal y vuelve a la aplicación donde comenzaste.",
    actionTitle: "¡Suscripción confirmada!",
    actionBody:
      "Tu cuenta de Patreon fue verificada. Cierra esta pestaña y vuelve a tu aplicación original para desbloquear tu sesión.",
    cancelledTitle: "Conexión con Patreon cancelada",
    cancelledBody:
      "No se hicieron cambios en tu cuenta. Cierra esta pestaña y vuelve a la aplicación original cuando quieras intentarlo de nuevo.",
    errorTitle: "La conexión con Patreon quedó incompleta",
    errorBody:
      "No pudimos terminar esta conexión con Patreon. Cierra esta pestaña, vuelve a la aplicación original e inténtalo de nuevo.",
    returning: "Volviendo a tu suscripción…",
    code: "Código de resultado",
  },
};

function browserLanguage() {
  const callbackLanguage = new URLSearchParams(
    globalThis.location?.search || "",
  ).get("lang");
  let storedLanguage = "";
  try {
    storedLanguage = String(
      globalThis.localStorage?.getItem("userLanguage") || "",
    );
  } catch {
    // The callback must work when storage is unavailable.
  }
  return normalizePatreonReturnLanguage(
    callbackLanguage,
    storedLanguage || globalThis.navigator?.language || "en",
  );
}

export default function PatreonOAuthDrawerReturn() {
  const [isReturning, setIsReturning] = useState(false);
  const result = useMemo(
    () => normalizePatreonReturnResult(
      new URLSearchParams(globalThis.location?.search || "").get("patreon"),
    ),
    [],
  );
  const copy = COPY[browserLanguage()];
  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    const completed = completePatreonModalReturn(result);
    if (!completed) return;
    setIsReturning(true);
    // This callback is intentionally mounted outside the main application so
    // it can render without auth or storage. A hard same-origin navigation is
    // required to boot the normal app and re-run its Patreon status restore;
    // an in-router transition would leave this isolated callback root mounted.
    globalThis.location.replace(
      buildPatreonCompletedReturnPath(completed, result),
    );
  }, [result]);

  let title = copy.errorTitle;
  let body = copy.errorBody;
  if (result === "connected") {
    title = copy.connectedTitle;
    body = copy.connectedBody;
  } else if (ACTION_REQUIRED_RESULTS.has(result)) {
    title = copy.actionTitle;
    body = copy.actionBody;
  } else if (result === "oauth_cancelled") {
    title = copy.cancelledTitle;
    body = copy.cancelledBody;
  }
  const genuineFailure =
    result !== "connected" &&
    result !== "oauth_cancelled" &&
    !ACTION_REQUIRED_RESULTS.has(result);

  return (
    <Center minH="100dvh" bg={pageBg} color="appText" px={4} py={8}>
      <Box
        w="100%"
        maxW="560px"
        bg={cardBg}
        borderWidth="1px"
        borderColor="appBorderStrong"
        borderRadius="32px"
        style={{ cornerShape: APP_SQUIRCLE_SHAPE }}
        boxShadow="xl"
        p={{ base: 6, md: 9 }}
      >
        <VStack spacing={5} textAlign="center">
          {isReturning && <Spinner color="purple.400" thickness="4px" />}
          <Text
            color="purple.400"
            fontSize="xs"
            fontWeight="black"
            letterSpacing="wide"
            textTransform="uppercase"
          >
            {copy.eyebrow}
          </Text>
          <Heading size={{ base: "md", md: "lg" }}>
            {isReturning ? copy.returning : title}
          </Heading>
          {!isReturning && (
            <Text color="appTextMuted" fontSize={{ base: "sm", md: "md" }} lineHeight="tall">
              {body}
            </Text>
          )}
          {!isReturning && genuineFailure && (
            <Text color="appTextMuted" fontSize="xs">
              {copy.code}: <Box as="code">{result}</Box>
            </Text>
          )}
        </VStack>
      </Box>
    </Center>
  );
}
