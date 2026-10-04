import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Box, Button, Flex, HStack, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalOverlay, SimpleGrid,
  Text, VStack, useColorMode,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { SORTED_ACHIEVEMENTS, normalizeAchievementLocale } from "./catalog.js";
import { achievementText, localizeAchievement } from "./copy.js";
import { transcriptSections } from "./transcriptGroups.js";
import AchievementOrb from "./AchievementOrb.jsx";
import { useAchievementUnlock, useAchievementSyncStatus } from "./useAchievementUnlock.js";

const MotionG = motion.g;

function AchievementWaveBar({
  value = 0,
  height = 14,
  start = "#43e97b",
  end = "#38f9d7",
  bg = "rgba(255, 255, 255, 0.12)",
  border = "rgba(255, 255, 255, 0.18)",
}) {
  const reduceMotion = useReducedMotion();
  const id = useRef(`ach-wave-${Math.random().toString(36).slice(2, 8)}`).current;
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const widthPct = `${clamped}%`;

  return (
    <Box
      position="relative"
      bg={bg}
      borderRadius="9999px"
      overflow="hidden"
      height={`${height}px`}
      border="1px solid"
      borderColor={border}
      w="100%"
    >
      <motion.div
        initial={reduceMotion ? { width: widthPct } : { width: 0 }}
        animate={{ width: widthPct }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
        style={{ position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: "9999px" }}
      >
        <Box
          as="svg"
          viewBox="0 0 120 30"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          display="block"
        >
          <defs>
            <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={start} />
              <stop offset="100%" stopColor={end} />
            </linearGradient>
          </defs>
          <rect
            width="120"
            height="30"
            fill={`url(#grad-${id})`}
            opacity="0.95"
          />
          <MotionG
            initial={{ x: 0 }}
            animate={{ x: reduceMotion ? 0 : [-10, 0, -10] }}
            transition={{
              duration: reduceMotion ? 0 : 10,
              repeat: reduceMotion ? 0 : Infinity,
              ease: "easeInOut",
            }}
            opacity={0.22}
          >
            <path
              d="M0,18 C10,14 20,22 30,18 S50,14 60,18 S80,22 90,18 S110,14 120,18 L120,30 L0,30 Z"
              fill="#fff"
            />
          </MotionG>
        </Box>
      </motion.div>
    </Box>
  );
}

function useAppThemeMode() {
  const { colorMode } = useColorMode();
  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      const docMode = document.documentElement.dataset.themeMode ||
        document.documentElement.dataset.theme ||
        document.body?.dataset?.themeMode;
      if (docMode === "light" || docMode === "dark") return docMode;
      const stored = localStorage.getItem("themeMode") || localStorage.getItem("chakra-ui-color-mode");
      if (stored === "light" || stored === "dark") return stored;
    }
    return colorMode === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const update = () => {
      if (typeof document === "undefined") return;
      const docMode = document.documentElement.dataset.themeMode ||
        document.documentElement.dataset.theme ||
        document.body?.dataset?.themeMode;
      if (docMode === "light" || docMode === "dark") {
        setTheme(docMode);
        return;
      }
      const stored = localStorage.getItem("themeMode") || localStorage.getItem("chakra-ui-color-mode");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
      if (colorMode === "light" || colorMode === "dark") {
        setTheme(colorMode);
      }
    };
    update();
    const observer = new MutationObserver(update);
    if (typeof document !== "undefined") {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-mode", "data-theme", "style"] });
      if (document.body) {
        observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme-mode", "data-theme"] });
      }
    }
    window.addEventListener("storage", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", update);
    };
  }, [colorMode]);

  return theme;
}

export default function AchievementCollection({
  isOpen, onClose, achievement: initialAchievement, npub, appSource = "nosabos",
  language = "en", services,
}) {
  const locale = normalizeAchievementLocale(language);
  const { revision } = useAchievementUnlock();
  const t = (key, values) => achievementText(key, locale, values);
  const format = (n) => new Intl.NumberFormat(locale, locale === "ar" ? { numberingSystem: "arab" } : {}).format(n);

  const themeMode = useAppThemeMode();
  const isLight = themeMode === "light";

  const themeColors = useMemo(() => {
    if (isLight) {
      return {
        modalBg: "#ffffff",
        modalOverlay: "rgba(15, 23, 42, 0.6)",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#94a3b8",
        border: "rgba(0, 0, 0, 0.08)",
        borderSubtle: "rgba(0, 0, 0, 0.04)",
        cardBgCompleted: "#ffffff",
        cardBgUncompleted: "#f8fafc",
        cardBorderCompleted: "#eab308",
        cardBorderUncompleted: "rgba(0, 0, 0, 0.08)",
        cardShadowCompleted: "0 4px 14px rgba(234, 179, 8, 0.16)",
        tabActiveBg: "#0f172a",
        tabActiveText: "#ffffff",
        tabActiveBorder: "#0f172a",
        tabInactiveBg: "#f1f5f9",
        tabInactiveText: "#475569",
        tabInactiveBorder: "#e2e8f0",
        tabHoverBg: "#e2e8f0",
        footerBg: "#f8fafc",
        waveBg: "rgba(0, 0, 0, 0.06)",
        waveBorder: "rgba(0, 0, 0, 0.1)",
        badgeCompletedBg: "rgba(234, 179, 8, 0.15)",
        badgeCompletedColor: "#b45309",
        badgeUncompletedBg: "rgba(0, 0, 0, 0.05)",
        badgeUncompletedColor: "#64748b",
      };
    }
    return {
      modalBg: "#101923",
      modalOverlay: "rgba(5, 10, 19, 0.82)",
      textPrimary: "#f4f4ee",
      textSecondary: "#cbd5e1",
      textMuted: "#64748b",
      border: "rgba(255, 255, 255, 0.12)",
      borderSubtle: "rgba(255, 255, 255, 0.06)",
      cardBgCompleted: "#192330",
      cardBgUncompleted: "#131c26",
      cardBorderCompleted: "#eab308",
      cardBorderUncompleted: "rgba(255, 255, 255, 0.08)",
      cardShadowCompleted: "0 4px 16px rgba(234, 179, 8, 0.14)",
      tabActiveBg: "#263440",
      tabActiveText: "#ffffff",
      tabActiveBorder: "#38f9d7",
      tabInactiveBg: "#192330",
      tabInactiveText: "#94a3b8",
      tabInactiveBorder: "rgba(255, 255, 255, 0.12)",
      tabHoverBg: "#222e3b",
      footerBg: "#0d141c",
      waveBg: "rgba(255, 255, 255, 0.12)",
      waveBorder: "rgba(255, 255, 255, 0.18)",
      badgeCompletedBg: "rgba(234, 179, 8, 0.2)",
      badgeCompletedColor: "#fbbf24",
      badgeUncompletedBg: "rgba(255, 255, 255, 0.06)",
      badgeUncompletedColor: "#94a3b8",
    };
  }, [isLight]);

  const [unlocked, setUnlocked] = useState({});
  const [activeTab, setActiveTab] = useState(() => {
    if (initialAchievement?.source === "robotsbuildingeducation") return "robotsbuildingeducation";
    if (initialAchievement?.source === "nosabos") return "nosabos";
    return appSource === "robotsbuildingeducation" ? "robotsbuildingeducation" : "nosabos";
  });

  const epoch = useRef(0);
  const identity = services?.resolveEffectiveIdentity?.(npub) || { npub: "" };
  const effectiveNpub = identity.npub;
  const syncState = useAchievementSyncStatus(effectiveNpub);

  const items = useMemo(() => SORTED_ACHIEVEMENTS.map(item => localizeAchievement(item, locale)), [locale]);

  useEffect(() => {
    if (isOpen && services?.getStoredAchievements) {
      setUnlocked(services.getStoredAchievements(effectiveNpub));
    }
  }, [revision, isOpen, effectiveNpub, services]);

  useEffect(() => {
    const request = ++epoch.current;
    if (!isOpen || !services) return;
    if (services.getStoredAchievements) {
      setUnlocked(services.getStoredAchievements(effectiveNpub));
    }
    if (effectiveNpub && services.syncAchievements) {
      services.syncAchievements(effectiveNpub).then(map => {
        if (epoch.current === request) setUnlocked(map);
      }).catch(() => {});
    }
    return () => { epoch.current = request + 1; };
  }, [isOpen, effectiveNpub, services]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialAchievement?.source === "robotsbuildingeducation") {
      setActiveTab("robotsbuildingeducation");
    } else if (initialAchievement?.source === "nosabos") {
      setActiveTab("nosabos");
    }
  }, [isOpen, initialAchievement?.id, initialAchievement?.source]);

  // Tab items: Piyali vs Robots Building Education
  const piyaliItems = useMemo(() => items.filter(item => item.source === "nosabos" || item.source === "shared"), [items]);
  const piyaliCompleted = useMemo(() => piyaliItems.filter(item => Boolean(unlocked[item.id])), [piyaliItems, unlocked]);

  const robotsItems = useMemo(() => items.filter(item => item.source === "robotsbuildingeducation" || item.source === "shared"), [items]);
  const robotsCompleted = useMemo(() => robotsItems.filter(item => Boolean(unlocked[item.id])), [robotsItems, unlocked]);

  const currentTabItems = activeTab === "robotsbuildingeducation" ? robotsItems : piyaliItems;
  const currentCompletedList = activeTab === "robotsbuildingeducation" ? robotsCompleted : piyaliCompleted;
  const sections = useMemo(() => transcriptSections(currentTabItems, unlocked), [currentTabItems, unlocked]);

  const tabTotal = currentTabItems.length;
  const tabCount = currentCompletedList.length;
  const tabPct = tabTotal > 0 ? (tabCount / tabTotal) * 100 : 0;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg={themeColors.modalOverlay} backdropFilter="blur(12px)" />
      <ModalContent
        className="achievement-collection"
        aria-label={t("title")}
        dir={locale === "ar" ? "rtl" : "ltr"}
        lang={locale}
        bg={themeColors.modalBg}
        color={themeColors.textPrimary}
        border="1px solid"
        borderColor={themeColors.border}
        borderRadius={{ base: "24px", md: "28px" }}
        w={{ base: "95vw", md: "calc(100% - 40px)" }}
        maxW={{ base: "95vw", md: "4xl" }}
        mx="auto"
        my={{ base: 0, md: 6 }}
        h={{ base: "90dvh", md: "auto" }}
        maxH={{ base: "90dvh", md: "92dvh" }}
        overflow="hidden"
      >
        <ModalCloseButton
          aria-label={t("close")}
          top={4}
          left={locale === "ar" ? 4 : "auto"}
          right={locale === "ar" ? "auto" : 4}
          color={themeColors.textSecondary}
          _hover={{ bg: themeColors.badgeUncompletedBg }}
        />
        <Box h="56px" flexShrink={0} />

        <ModalBody className="achievement-collection-body" minH={0} px={{ base: 4, md: 7 }} pb={5}>
          <Box as="header" className="achievement-collection-header" mb={5}>
            <Text as="h2" fontSize={{ base: "22px", md: "28px" }} fontWeight="700" letterSpacing="-.03em" color={themeColors.textPrimary}>
              {t("title")}
            </Text>
            <Text fontWeight="400" fontSize="sm" color={themeColors.textSecondary} mt={1}>
              {t("subtitle")}
            </Text>
          </Box>

          {/* Two tabs: Piyali & Robots Building Education */}
          <HStack spacing={3} mb={6} align="stretch">
            <Button
              flex="1"
              minW={0}
              h="auto"
              whiteSpace="normal"
              py={3}
              px={4}
              borderRadius="16px"
              onClick={() => setActiveTab("nosabos")}
              aria-pressed={activeTab === "nosabos"}
              bg={activeTab === "nosabos" ? themeColors.tabActiveBg : themeColors.tabInactiveBg}
              color={activeTab === "nosabos" ? themeColors.tabActiveText : themeColors.tabInactiveText}
              border="1px solid"
              borderColor={activeTab === "nosabos" ? themeColors.tabActiveBorder : themeColors.tabInactiveBorder}
              _hover={{ bg: activeTab === "nosabos" ? themeColors.tabActiveBg : themeColors.tabHoverBg }}
              boxShadow={activeTab === "nosabos" ? (isLight ? "0 4px 12px rgba(15, 23, 42, 0.12)" : "0 4px 14px rgba(0, 0, 0, 0.3)") : "none"}
              transition="all 0.2s ease"
            >
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="700">Piyali</Text>
            </Button>
            <Button
              flex="1"
              minW={0}
              h="auto"
              whiteSpace="normal"
              py={3}
              px={4}
              borderRadius="16px"
              onClick={() => setActiveTab("robotsbuildingeducation")}
              aria-pressed={activeTab === "robotsbuildingeducation"}
              bg={activeTab === "robotsbuildingeducation" ? themeColors.tabActiveBg : themeColors.tabInactiveBg}
              color={activeTab === "robotsbuildingeducation" ? themeColors.tabActiveText : themeColors.tabInactiveText}
              border="1px solid"
              borderColor={activeTab === "robotsbuildingeducation" ? themeColors.tabActiveBorder : themeColors.tabInactiveBorder}
              _hover={{ bg: activeTab === "robotsbuildingeducation" ? themeColors.tabActiveBg : themeColors.tabHoverBg }}
              boxShadow={activeTab === "robotsbuildingeducation" ? (isLight ? "0 4px 12px rgba(15, 23, 42, 0.12)" : "0 4px 14px rgba(0, 0, 0, 0.3)") : "none"}
              transition="all 0.2s ease"
            >
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="700">Robots Building Education</Text>
            </Button>
          </HStack>

          {sections.map(({ status, count, groups }) => (
            <Box as="section" key={status} mb={7} aria-label={t(status)}>
              <Flex align="center" gap={2} mb={4}>
                <Text as="h3" fontSize="xl" fontWeight="700" color={themeColors.textPrimary}>
                  {t(status)}
                </Text>
                <Badge borderRadius="full" px={2.5}
                  bg={status === "unlocked" ? themeColors.badgeCompletedBg : themeColors.badgeUncompletedBg}
                  color={status === "unlocked" ? themeColors.badgeCompletedColor : themeColors.badgeUncompletedColor}>
                  {format(count)}
                </Badge>
              </Flex>
              {count === 0 && status === "unlocked" && (
                <Text color={themeColors.textSecondary} fontSize="sm" mb={4}>{t("empty")}</Text>
              )}
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                {groups.flatMap(({ tiers }) => tiers.flatMap(({ items }) => items)).map(item => {
                  const completed = Boolean(unlocked[item.id]);
                  const status = unlocked[item.id]?.test ? "testAward" : completed ? "completed" : "uncompleted";
                  return (
                    <Box
                      key={item.id}
                      className={`achievement-card ${completed ? "is-completed" : "is-locked"}`}
                      bg={completed ? themeColors.cardBgCompleted : themeColors.cardBgUncompleted}
                      border={completed ? "2px solid" : "1px solid"}
                      borderColor={completed ? themeColors.cardBorderCompleted : themeColors.cardBorderUncompleted}
                      borderRadius="18px"
                      p={3.5}
                      boxShadow={completed ? themeColors.cardShadowCompleted : "none"}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      textAlign="center"
                      minW={0}
                      aria-label={`${item.title}. ${item.desc} ${t(status)}`}
                    >
                      <Flex justify="center" align="center" my={1} w="76px" h="76px">
                        <AchievementOrb achievement={item} size={76} />
                      </Flex>
                      <Text fontSize="12px" fontWeight="700" lineHeight="1.3" color={themeColors.textPrimary} mt={2} mb={1}>
                        {item.title}
                      </Text>
                      <Text fontSize="10px" lineHeight="1.4" color={themeColors.textSecondary}>
                        {item.desc}
                      </Text>
                      <Badge mt={2} borderRadius="full" px={2} whiteSpace="normal"
                        bg={completed ? themeColors.badgeCompletedBg : themeColors.badgeUncompletedBg}
                        color={completed ? themeColors.badgeCompletedColor : themeColors.badgeUncompletedColor}>
                        {t(status)}
                      </Badge>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          ))}
        </ModalBody>

        {/* Footer: Only dynamic progress bar changing based on active tab */}
        <ModalFooter
          px={{ base: 5, md: 7 }}
          py={4}
          borderTop="1px solid"
          borderColor={themeColors.border}
          bg={themeColors.footerBg}
          borderBottomRadius={{ base: "24px", md: "28px" }}
          display="block"
        >
          <VStack w="100%" spacing={2} align="stretch">
            {(syncState.pending || syncState.storageError) && (
              <Text role="status" aria-live="polite" fontSize="xs" color={themeColors.textSecondary}>
                {t(syncState.storageError ? "storageWarning" : "syncPending")}
              </Text>
            )}
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" fontWeight="600" color={themeColors.textSecondary}>
                {t("collectionLabel", { count: format(tabCount), total: format(tabTotal) })}
              </Text>
              <Text fontSize="xs" fontWeight="700" color={isLight ? "teal.600" : "#38f9d7"}>
                {Math.round(tabPct)}%
              </Text>
            </Flex>
            <AchievementWaveBar
              value={tabPct}
              height={14}
              start="#43e97b"
              end="#38f9d7"
              bg={themeColors.waveBg}
              border={themeColors.waveBorder}
            />
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
