/* eslint-disable react/prop-types */
import { Box, Button, Heading, HStack, SimpleGrid, Stack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { FaPatreon } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { APP_SQUIRCLE_SHAPE } from "../theme.js";
import RandomCharacter from "../elements/RandomCharacter.jsx";
import { LEGACY_MIGRATION_COPY, PATREON_FLOW_COPY, SUBSCRIPTION_COPY, patreonCopyFor } from "./patreonSubscriptionCopy.js";

const RECOVERY_EXPIRED = {
  en: "That replacement request expired or changed. Please connect Patreon again.",
  es: "La solicitud de reemplazo venció o cambió. Vuelve a conectar Patreon.",
};

export default function SubscriptionGate({
  appLanguage = "en",
  onPatreonConnect,
  isPatreonChecking = false,
  isPatreonAvailable = true,
  patreonResult = "",
  patreonStatusError = "",
  onPatreonCheckout,
  isPatreonAwaiting = false,
  isLegacyPasscodeMigration = false,
}) {
  const lang = appLanguage === "es" ? "es" : "en";
  const copy = patreonCopyFor(SUBSCRIPTION_COPY, lang);
  const flowCopy = patreonCopyFor(PATREON_FLOW_COPY, lang);
  const migrationCopy = patreonCopyFor(LEGACY_MIGRATION_COPY, lang);
  const clarifyUsd = (text) => lang === "en" ? text : text.replace(/(\$\d+(?:\.\d+)?)/g, "$1 USD");
  const pageBg = useColorModeValue(
    "radial-gradient(circle at 14% 12%, rgba(236,72,153,0.13), transparent 27%), radial-gradient(circle at 86% 16%, rgba(59,130,246,0.13), transparent 25%), var(--chakra-colors-appBg)",
    "radial-gradient(circle at 14% 12%, rgba(236,72,153,0.16), transparent 28%), radial-gradient(circle at 86% 16%, rgba(59,130,246,0.16), transparent 26%), var(--chakra-colors-appBg)",
  );
  const cardShadow = useColorModeValue("0 28px 80px rgba(77,58,38,0.16)", "0 28px 80px rgba(2,6,23,0.48)");
  const errorColor = useColorModeValue("red.700", "red.200");
  const awaitingPanelBg = useColorModeValue(
    "linear-gradient(135deg, rgba(250,245,255,0.98), rgba(238,242,255,0.92))",
    "linear-gradient(135deg, rgba(76,29,149,0.24), rgba(30,58,138,0.18))",
  );
  const awaitingPanelBorder = useColorModeValue("purple.200", "purple.700");
  const patreonFeedback =
    ["replacement_expired", "replacement_state_changed"].includes(patreonStatusError)
      ? RECOVERY_EXPIRED[lang]
      : patreonStatusError === "membership_not_active"
        ? copy.notSubscribed
        : patreonStatusError === "unavailable" || patreonResult === "unavailable"
          ? copy.unavailable
          : patreonResult === "not_subscribed"
            ? copy.notSubscribed
            : ["oauth_error", "oauth_cancelled", "state_error", "link_conflict"].includes(patreonResult)
              ? copy.oauthError
              : "";

  const renderPatreonAction = () => isPatreonAwaiting ? (
    <Box
      bg={awaitingPanelBg}
      borderWidth="1px"
      borderColor={awaitingPanelBorder}
      borderRadius={{ base: "22px", md: "26px" }}
      style={{ cornerShape: APP_SQUIRCLE_SHAPE }}
      p={{ base: 4, md: 5 }}
      boxShadow="0 12px 32px rgba(107,70,193,0.10)"
    >
      <Stack spacing={4}>
        <HStack align="flex-start" spacing={3}>
          <Box
            bg="purple.500"
            color="white"
            borderRadius="16px"
            w="44px"
            h="44px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 18px rgba(107,70,193,0.25)"
          >
            <FaPatreon size="20px" />
          </Box>
          <Box pt="1px">
            <Text color="purple.500" fontSize="10px" fontWeight="black" letterSpacing="0.12em" textTransform="uppercase">
              {flowCopy.almostThere}
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="black" lineHeight="shorter" mt={1}>
              {flowCopy.finishTitle}
            </Text>
            <Text color="appTextMuted" fontSize={{ base: "xs", md: "sm" }} lineHeight="tall" mt={1.5} maxW="600px">
              {flowCopy.finishBody}
            </Text>
          </Box>
        </HStack>

        <Button
          type="button"
          w="100%"
          minH="48px"
          leftIcon={<FaPatreon />}
          rightIcon={<FiExternalLink />}
          bg="purple.500"
          color="white"
          boxShadow="0 4px 0 #553c9a"
          onClick={onPatreonCheckout}
          _hover={{ bg: "purple.600", color: "white", transform: "translateY(-1px)" }}
          _active={{ bg: "purple.700", color: "white", transform: "translateY(2px)", boxShadow: "0 2px 0 #553c9a" }}
        >
          {flowCopy.openCheckout}
        </Button>
      </Stack>
    </Box>
  ) : (
    <Button
      type="button"
      w="100%"
      h="auto"
      py={5}
      bg={isLegacyPasscodeMigration ? "purple.400" : "pink.400"}
      color="white"
      boxShadow={isLegacyPasscodeMigration ? "0 4px 0 #6b46c1" : "0 4px 0 var(--chakra-colors-pink-700)"}
      onClick={() => onPatreonConnect?.("annual")}
      isLoading={isPatreonChecking}
      loadingText={copy.checkingPatreon}
      isDisabled={!isPatreonAvailable}
      _hover={{ bg: isLegacyPasscodeMigration ? "purple.500" : "pink.500", color: "white", transform: "translateY(-1px)" }}
      _active={{ bg: isLegacyPasscodeMigration ? "purple.600" : "pink.600", color: "white", transform: "translateY(2px)" }}
    >
      {isLegacyPasscodeMigration ? migrationCopy.connectAction : flowCopy.membershipCta}
    </Button>
  );

  if (isLegacyPasscodeMigration) {
    return (
      <Box minH="100dvh" bg={pageBg} color="appText" display="flex" alignItems="center" justifyContent="center" px={{ base: 2, md: 4 }} py={{ base: 3, md: 8 }}>
        <Box bg="appSurfaceElevated" borderWidth="1px" borderColor="appBorderStrong" borderRadius={{ base: "30px", md: "36px" }} style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={{ base: 4, md: 7 }} maxW="620px" w="100%" boxShadow={cardShadow}>
          <VStack align="stretch" spacing={{ base: 5, md: 6 }}>
            <Box textAlign="center">
              <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} px={4} py={1} w="fit-content" mx="auto" mb={4}>
                <RandomCharacter notSoRandomCharacter="31" width="92px" />
              </Box>
              <Text color="purple.400" fontSize="xs" fontWeight="black" letterSpacing="wide" textTransform="uppercase" mb={2}>{migrationCopy.eyebrow}</Text>
              <Heading size={{ base: "md", md: "lg" }}>{migrationCopy.title}</Heading>
            </Box>
            <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={{ base: 5, md: 6 }}>
              <Text color="appTextMuted" fontSize={{ base: "sm", md: "md" }} lineHeight="tall">{migrationCopy.body}</Text>
              <Text color="appText" fontSize="sm" fontWeight="bold" mt={4}>{migrationCopy.reassurance}</Text>
            </Box>
            {renderPatreonAction()}
            {patreonFeedback && <Text role="alert" color={errorColor} fontSize="xs" textAlign="center">{patreonFeedback}</Text>}
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100dvh" bg={pageBg} color="appText" display="flex" alignItems="center" justifyContent="center" px={{ base: 1, md: 4 }} py={{ base: 2, md: 8 }}>
      <Box bg="appSurfaceElevated" borderWidth="1px" borderColor="appBorderStrong" borderRadius={{ base: "30px", md: "36px" }} style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={{ base: 3, md: 6 }} maxW="760px" w="100%" my={{ base: 0, md: 4 }} boxShadow={cardShadow}>
        <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
          <HStack align="center" spacing={{ base: 3, sm: 5 }} flexDirection={{ base: "column", sm: "row" }} textAlign={{ base: "center", sm: "left" }}>
            <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} px={4} py={1} minW="110px" display="flex" justifyContent="center">
              <RandomCharacter notSoRandomCharacter="31" width="92px" />
            </Box>
            <Box>
              <Heading size={{ base: "md", md: "lg" }} mb={2}>{copy.title}</Heading>
              <Text color="appTextMuted" fontSize={{ base: "12px", md: "xs" }}>{copy.subtitle}</Text>
            </Box>
          </HStack>
          <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={{ base: 4, md: 5 }}>
            <Text fontWeight="bold" fontSize="sm" mb={3}>{copy.benefitsHeading}</Text>
            <Box as="ul" color="appTextMuted" fontSize={{ base: "xs", md: "sm" }} lineHeight="tall" pl={5}>
              <Text as="li" mb={2}>{copy.benefitApps}</Text>
              <Text as="li" mb={2}>{copy.benefitContent}</Text>
              <Text as="li">{copy.benefitScholarships}</Text>
            </Box>
          </Box>
          {isPatreonAwaiting && renderPatreonAction()}
          <SimpleGrid columns={1} spacing={3} maxW="520px" w="100%" mx="auto">
            <Box bg="transparent" borderWidth="1px" borderColor="purple.300" borderRadius="28px" style={{ cornerShape: APP_SQUIRCLE_SHAPE }} p={4} position="relative" display="flex" flexDirection="column" minH="230px">
              <Text position="absolute" top="-12px" left="50%" transform="translateX(-50%)" bg="purple.500" color="white" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="black" lineHeight="short" whiteSpace="nowrap">{flowCopy.annualRecommended}</Text>
              <Text color="purple.300" fontWeight="black" fontSize="sm">{flowCopy.membershipTitle}</Text>
              <Text fontSize="2xl" fontWeight="black" mt={1}>{clarifyUsd(flowCopy.membershipPrice)}</Text>
              <Text color="appTextMuted" fontSize="sm" mt={1}>{clarifyUsd(flowCopy.annualValue)}</Text>
              <Box mt="auto" pt={4}>
                <Button
                  type="button"
                  onClick={() => isPatreonAwaiting ? onPatreonCheckout?.() : onPatreonConnect?.("annual")}
                  w="100%"
                  h="auto"
                  py={5}
                  isLoading={!isPatreonAwaiting && isPatreonChecking}
                  loadingText={copy.checkingPatreon}
                  isDisabled={!isPatreonAvailable}
                  bg="purple.300"
                  color="white"
                  boxShadow="0 4px 0 #6b46c1"
                  _hover={{ bg: "purple.400", color: "white", transform: "translateY(-1px)" }}
                  _active={{ bg: "purple.500", color: "white", transform: "translateY(2px)", boxShadow: "0 2px 0 #6b46c1" }}
                >
                  {flowCopy.membershipCta}
                </Button>
              </Box>
            </Box>
          </SimpleGrid>
          {patreonFeedback && (
            <Box pt={4} borderTopWidth="1px" borderColor="appBorder">
              <Text role="alert" color={errorColor} fontSize="xs" textAlign="center">{patreonFeedback}</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
