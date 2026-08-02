/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Alert, AlertIcon, Box, Button, ButtonGroup, Center, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { FaPatreon } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { PATREON_FLOW_COPY, SETTINGS_COPY, SUBSCRIPTION_COPY, patreonCopyFor } from "./patreonSubscriptionCopy.js";
import { formatUsdEntitlement, getSubscriptionSettingsState, PATREON_MEMBERSHIP_URL, PATREON_PAYMENT_URL } from "./subscriptionSettingsModel.js";

export default function SubscriptionSettingsPanel({ appLanguage = "en", statusPayload = {}, statusError = "", isResolved = true, isBusy = false, onReconnect, onCheckout, onDisconnect }) {
  const lang = appLanguage === "es" ? "es" : "en";
  const copy = patreonCopyFor(SETTINGS_COPY, lang);
  const flowCopy = patreonCopyFor(PATREON_FLOW_COPY, lang);
  const subscriptionCopy = patreonCopyFor(SUBSCRIPTION_COPY, lang);
  const clarifyUsd = (text) => lang === "en" ? text : text.replace(/(\$\d+(?:\.\d+)?)/g, "$1 USD");
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const view = getSubscriptionSettingsState(statusPayload);
  const { subscription, linked, unavailable, status, entitledAmountCents } = view;
  const statusText = useMemo(() => {
    if (unavailable || status === "unknown") return copy.unavailable;
    if (status === "active") return copy.active;
    if (status === "payment_issue") return copy.paymentIssue;
    if (status === "inactive" || status === "expired") return copy.inactive;
    return copy.notLinked;
  }, [copy, status, unavailable]);
  const checkedAt = Number(subscription?.lastVerifiedAtMs || 0);
  const feedback = statusError === "not_subscribed"
    ? subscriptionCopy.notSubscribed
    : statusError === "unavailable"
      ? subscriptionCopy.unavailable
      : statusError
        ? subscriptionCopy.oauthError
        : "";

  if (!isResolved) {
    return (
      <Center minH="320px" flexDirection="column" gap={4} aria-live="polite">
        <Spinner color="purple.400" thickness="4px" size="lg" />
        <Text color="appTextMuted" fontSize="sm">{subscriptionCopy.checkingPatreon}</Text>
      </Center>
    );
  }

  if (view.awaitingCheckout) {
    return (
      <Stack spacing={4} pb={4}>
        <Box
          bg="appSurfaceMuted"
          borderWidth="1px"
          borderColor="purple.200"
          borderRadius="24px"
          p={{ base: 5, md: 6 }}
        >
          <Text color="purple.400" fontSize="xs" fontWeight="black" letterSpacing="wide" textTransform="uppercase">
            {flowCopy.almostThere}
          </Text>
          <Heading size="md" mt={2}>{flowCopy.finishTitle}</Heading>
          <Text color="appTextMuted" fontSize="sm" lineHeight="tall" mt={3}>{flowCopy.finishBody}</Text>
          <Button
            type="button"
            onClick={onCheckout}
            w="100%"
            h="auto"
            py={5}
            mt={5}
            leftIcon={<FaPatreon />}
            rightIcon={<FiExternalLink />}
            bg="purple.400"
            color="white"
            boxShadow="0 4px 0 #6b46c1"
            _hover={{ bg: "purple.500", color: "white", transform: "translateY(-1px)" }}
            _active={{ bg: "purple.600", color: "white", transform: "translateY(2px)" }}
          >
            {flowCopy.openCheckout}
          </Button>
        </Box>
        {feedback && <Alert status="error" borderRadius="16px"><AlertIcon /><Text fontSize="sm">{feedback}</Text></Alert>}
      </Stack>
    );
  }

  if (view.showConnect) {
    return (
      <Stack spacing={4} pb={4}>
        <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="24px" p={{ base: 4, md: 5 }}>
          <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center">{subscriptionCopy.benefitsHeading}</Text>
          <Box as="ul" color="appTextMuted" fontSize={{ base: "xs", md: "sm" }} lineHeight="tall" pl={5}>
            <Text as="li" mb={2}>{subscriptionCopy.benefitApps}</Text>
            <Text as="li" mb={2}>{subscriptionCopy.benefitContent}</Text>
            <Text as="li">{subscriptionCopy.benefitScholarships}</Text>
          </Box>
        </Box>

        <Box
          bg="transparent"
          borderWidth="1px"
          borderColor="purple.300"
          borderRadius="24px"
          p={4}
          pt={5}
          position="relative"
          display="flex"
          flexDirection="column"
          minH="220px"
          maxW="520px"
          w="100%"
          mx="auto"
        >
          <Text position="absolute" top="-12px" left="50%" transform="translateX(-50%)" bg="purple.500" color="white" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="black" lineHeight="short" whiteSpace="nowrap">
            {flowCopy.annualRecommended}
          </Text>
          <Text color="purple.300" fontWeight="black" fontSize="sm" textAlign="center">{flowCopy.membershipTitle}</Text>
          <Text fontSize="2xl" fontWeight="black" mt={1} textAlign="center">{clarifyUsd(flowCopy.membershipPrice)}</Text>
          <Text color="appTextMuted" fontSize="sm" mt={1} textAlign="center">{clarifyUsd(flowCopy.annualValue)}</Text>
          <Box mt="auto" pt={4}>
            <Button
              type="button"
              onClick={onReconnect}
              w="100%"
              h="auto"
              py={5}
              isLoading={isBusy}
              loadingText={subscriptionCopy.checkingPatreon}
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
        {feedback && <Alert status="error" borderRadius="16px"><AlertIcon /><Text fontSize="sm">{feedback}</Text></Alert>}
      </Stack>
    );
  }

  return (
    <Stack spacing={4} pb={4}>
      <Box bg="appSurfaceMuted" borderWidth="1px" borderColor="appBorder" borderRadius="24px" p={5}>
        <Box><Heading size="sm">{copy.title}</Heading><Text mt={2} color="appTextMuted">{statusText}</Text></Box>
        {subscription?.stale && <Alert status="warning" mt={4} borderRadius="16px"><AlertIcon /><Text fontSize="sm">{copy.stale}</Text></Alert>}
        {checkedAt > 0 && <Text fontSize="xs" color="appTextSubtle" mt={3}>{copy.lastChecked}: {new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(checkedAt))}</Text>}
        {entitledAmountCents > 0 && <Text fontSize="sm" color="appTextMuted" mt={3}>{copy.entitlement}: {formatUsdEntitlement(entitledAmountCents, lang)}</Text>}
      </Box>
      <ButtonGroup flexWrap="wrap" gap={2}>
        {view.showReconnect && <Button variant="outline" onClick={onReconnect} isDisabled={isBusy}>{copy.reconnect}</Button>}
        {view.showManage && <Button as="a" href={PATREON_MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer" variant="outline">{copy.manage}</Button>}
        {view.showPayment && <Button as="a" href={PATREON_PAYMENT_URL} target="_blank" rel="noopener noreferrer" variant="outline">{copy.payment}</Button>}
      </ButtonGroup>
      {view.showDisconnect && !confirmingDisconnect && <Button alignSelf="flex-start" colorScheme="red" variant="ghost" onClick={() => setConfirmingDisconnect(true)}>{copy.disconnect}</Button>}
      {linked && confirmingDisconnect && (
        <Alert status="warning" borderRadius="20px" alignItems="flex-start">
          <AlertIcon mt={1} />
          <Box flex="1"><Text fontWeight="bold">{copy.disconnectTitle}</Text><Text fontSize="sm" mt={1} color="appTextMuted">{copy.disconnectBody}</Text><ButtonGroup mt={4} size="sm"><Button variant="ghost" onClick={() => setConfirmingDisconnect(false)}>{copy.cancel}</Button><Button colorScheme="red" onClick={onDisconnect} isLoading={isBusy} loadingText={copy.disconnecting}>{copy.confirm}</Button></ButtonGroup></Box>
        </Alert>
      )}
    </Stack>
  );
}
