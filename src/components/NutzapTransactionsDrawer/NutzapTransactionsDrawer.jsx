/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import NDK, { NDKNutzap, profileFromEvent } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

import { useNostrWalletStore } from "../../hooks/useNostrWalletStore";
import {
  nativeOverlayMotionProps,
  nativeRightDrawerMotionProps,
} from "../../utility/modalMotion";
import { useLiteOverlayEffects } from "../../utility/perfProfile";

const DEFAULT_RELAYS = [
  "wss://relay.ditto.pub",
  "wss://relay.primal.net",
  "wss://nos.lol",
];
const LOOKBACK_SECONDS = 30 * 24 * 60 * 60;
const EVENT_LIMIT = 100;
const RELAY_QUERY_TIMEOUT = 6000;
const REQUIRED_NOTE = "Robots Building Education";

const COPY = {
  en: {
    title: "Public transactions",
    from: "From",
    to: "To",
    loading: "Reading public transactions…",
    empty: "No public transactions found.",
    error: "Could not read transactions from the Nostr relays.",
    retry: "Try again",
    refresh: "Refresh transactions",
  },
  es: {
    title: "Transacciones públicas",
    from: "De",
    to: "Para",
    loading: "Leyendo transacciones públicas…",
    empty: "No se encontraron transacciones públicas.",
    error: "No se pudieron leer las transacciones de los relays de Nostr.",
    retry: "Intentar de nuevo",
    refresh: "Actualizar transacciones",
  },
};

function shortKey(value = "") {
  if (value.length < 18) return value || "unknown";
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

function npubFor(pubkey) {
  try {
    return nip19.npubEncode(pubkey);
  } catch {
    return pubkey || "";
  }
}

function displayName(pubkey, profiles) {
  const profile = profiles.get(pubkey);
  return (
    profile?.displayName ||
    profile?.name ||
    profile?.nip05 ||
    shortKey(npubFor(pubkey))
  );
}

function formatTime(timestamp, language) {
  const date = new Date(timestamp * 1000);
  if (!Number.isFinite(date.getTime())) return "";

  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function latestEventsByAuthor(events) {
  const latest = new Map();

  for (const event of events) {
    const current = latest.get(event.pubkey);
    if (!current || (current.created_at || 0) < (event.created_at || 0)) {
      latest.set(event.pubkey, event);
    }
  }

  return latest;
}

function fetchEventsWithTimeout(ndk, filters) {
  return new Promise((resolve, reject) => {
    const events = new Map();
    let finished = false;
    let subscription;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      subscription?.stop();
      resolve(new Set(events.values()));
    };
    const timer = setTimeout(finish, RELAY_QUERY_TIMEOUT);

    try {
      subscription = ndk.subscribe(
        filters,
        { closeOnEose: false },
        {
          onEvent: (event) => events.set(event.id, event),
          onEose: finish,
        },
      );
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

function parsePublicNutzap(event) {
  try {
    const nutzap = NDKNutzap.from(event);
    const amount = Number(nutzap?.amount);
    const proofsAreValid =
      nutzap?.proofs?.length > 0 &&
      nutzap.proofs.every(
        (proof) => Number.isFinite(proof.amount) && proof.amount > 0,
      );

    if (
      !nutzap ||
      event.verifySignature(false) !== true ||
      !nutzap.isValid ||
      !proofsAreValid ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !nutzap.pubkey ||
      !nutzap.recipientPubkey
    ) {
      return null;
    }

    return {
      id: nutzap.id,
      createdAt: nutzap.created_at || 0,
      sender: nutzap.pubkey,
      recipient: nutzap.recipientPubkey,
      amount,
      note: nutzap.comment?.trim() || "",
    };
  } catch {
    return null;
  }
}

function Person({ label, pubkey, profiles }) {
  return (
    <Flex align="baseline" gap={4} minW={0}>
      <Text
        color="appTextMuted"
        flex="0 0 52px"
        fontSize="11px"
        fontWeight="bold"
        letterSpacing="0.1em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text
        color="appText"
        fontSize="md"
        fontWeight="semibold"
        minW={0}
        noOfLines={1}
      >
        {displayName(pubkey, profiles)}
      </Text>
    </Flex>
  );
}

function Transaction({ transaction, profiles, copy, language }) {
  const amountColor = useColorModeValue("teal.600", "teal.200");

  return (
    <VStack
      align="stretch"
      bg="appSurfaceMuted"
      borderColor="appBorderStrong"
      borderRadius="2xl"
      borderWidth="1px"
      p={5}
      spacing={4}
    >
      <Flex align="baseline" justify="space-between" gap={3}>
        <Text color={amountColor} fontSize="md" fontWeight="bold">
          ₿{transaction.amount.toLocaleString()}
        </Text>
        <Text color="appTextSubtle" fontSize="xs" whiteSpace="nowrap">
          {formatTime(transaction.createdAt, language)}
        </Text>
      </Flex>

      <VStack align="stretch" spacing={3}>
        <Person
          label={copy.from}
          pubkey={transaction.sender}
          profiles={profiles}
        />
        <Person
          label={copy.to}
          pubkey={transaction.recipient}
          profiles={profiles}
        />
      </VStack>

      {transaction.note ? (
        <Text
          bg="appSurfaceGlass"
          borderRadius="xl"
          color="appText"
          fontSize="sm"
          lineHeight="1.55"
          overflowWrap="anywhere"
          px={4}
          py={3}
        >
          “{transaction.note}”
        </Text>
      ) : null}
    </VStack>
  );
}

export default function NutzapTransactionsDrawer({
  isOpen,
  onClose,
  userLanguage = "en",
}) {
  const liteOverlayEffects = useLiteOverlayEffects();
  const ndkInstance = useNostrWalletStore((state) => state.ndkInstance);
  const fallbackNdkRef = useRef(null);
  const requestRef = useRef(0);
  const [transactions, setTransactions] = useState([]);
  const [profiles, setProfiles] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const language = userLanguage === "es" ? "es" : "en";
  const copy = COPY[language];

  const loadTransactions = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setHasError(false);

    try {
      let ndk = ndkInstance;
      if (!ndk) {
        if (!fallbackNdkRef.current) {
          fallbackNdkRef.current = new NDK({ explicitRelayUrls: DEFAULT_RELAYS });
          await fallbackNdkRef.current.connect(RELAY_QUERY_TIMEOUT);
        }
        ndk = fallbackNdkRef.current;
      }

      const zapEvents = await fetchEventsWithTimeout(ndk, {
        kinds: [9321],
        since: Math.floor(Date.now() / 1000) - LOOKBACK_SECONDS,
        limit: EVENT_LIMIT,
      });
      const nextTransactions = Array.from(zapEvents)
        .map(parsePublicNutzap)
        .filter((transaction) => transaction?.note === REQUIRED_NOTE)
        .sort((a, b) => b.createdAt - a.createdAt);

      if (requestId === requestRef.current) {
        setTransactions(nextTransactions);
      }

      const people = Array.from(
        new Set(
          nextTransactions.flatMap((transaction) => [
            transaction.sender,
            transaction.recipient,
          ]),
        ),
      );
      const nextProfiles = new Map();

      if (people.length > 0) {
        const profileEvents = await fetchEventsWithTimeout(ndk, {
          kinds: [0],
          authors: people,
          limit: people.length,
        });

        for (const [pubkey, event] of latestEventsByAuthor(profileEvents)) {
          try {
            nextProfiles.set(pubkey, profileFromEvent(event));
          } catch {
            // A malformed profile should not hide a valid public transaction.
          }
        }
      }

      if (requestId === requestRef.current) {
        setProfiles(nextProfiles);
      }
    } catch {
      if (requestId === requestRef.current) setHasError(true);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [ndkInstance]);

  useEffect(() => {
    if (!isOpen) return undefined;
    void loadTransactions();

    return () => {
      requestRef.current += 1;
    };
  }, [isOpen, loadTransactions]);

  useEffect(
    () => () => {
      const ndk = fallbackNdkRef.current;
      fallbackNdkRef.current = null;
      if (ndk) {
        for (const relay of ndk.pool.relays.values()) relay.disconnect();
      }
    },
    [],
  );

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      returnFocusOnClose={false}
      size="xs"
    >
      <DrawerOverlay
        motionProps={nativeOverlayMotionProps}
        bg={liteOverlayEffects ? "blackAlpha.500" : "appOverlay"}
        backdropFilter={liteOverlayEffects ? "none" : "blur(8px)"}
      />
      <DrawerContent
        motionProps={nativeRightDrawerMotionProps}
        bg="appSurfaceElevated"
        borderLeftColor="appBorder"
        borderLeftWidth="1px"
        color="appText"
        maxW={{ base: "88vw", md: "sm" }}
      >
        <DrawerCloseButton top={4} right={4} />
        <DrawerHeader pb={2} pr={20}>
          <Flex align="center" gap={1}>
            <Text fontSize="md" fontWeight="semibold">
              {copy.title}
            </Text>
            <IconButton
              aria-label={copy.refresh}
              icon={<RepeatIcon />}
              isLoading={loading && transactions.length > 0}
              onClick={loadTransactions}
              size="xs"
              variant="ghost"
            />
          </Flex>
        </DrawerHeader>
        <DrawerBody pb={6}>
          {loading && transactions.length === 0 ? (
            <VStack color="appTextMuted" py={16} spacing={4}>
              <Spinner color="appTextMuted" size="sm" />
              <Text fontSize="sm">{copy.loading}</Text>
            </VStack>
          ) : hasError ? (
            <VStack align="stretch" py={8} spacing={4}>
              <Text color="appTextMuted" fontSize="sm">
                {copy.error}
              </Text>
              <Button onClick={loadTransactions} size="sm" variant="outline">
                {copy.retry}
              </Button>
            </VStack>
          ) : transactions.length === 0 ? (
            <Text color="appTextMuted" fontSize="sm" py={12} textAlign="center">
              {copy.empty}
            </Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {transactions.map((transaction) => (
                <Transaction
                  key={transaction.id}
                  transaction={transaction}
                  profiles={profiles}
                  copy={copy}
                  language={language}
                />
              ))}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
