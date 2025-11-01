import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import sparkle from "../assets/sparkle.mp3";
import complete from "../assets/complete.mp3";
import { useOneShotAudio } from "../hooks/useOneShotAudio";
import WaveBar from "../components/WaveBar";
import {
  BASE_QUESTION_COUNT,
  subscribeToQuestionsAnswered,
} from "../utility/nosql";
import { translation } from "../utility/translation";
import { database } from "../database/firebaseResources";
import { doc, onSnapshot } from "firebase/firestore";
import { skillTreeGroupLabels } from "../components/SkillTreeBoard/groupLabels";
import {
  FiArrowRightCircle,
  FiCheckCircle,
  FiCornerLeftUp,
  FiMoreHorizontal,
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const timelineStatusMeta = {
  previous: {
    label: "Previous",
    icon: FiCornerLeftUp,
    badge: "gray",
    accent: "rgba(160, 174, 192, 0.3)",
  },
  current: {
    label: "Completed",
    icon: FiCheckCircle,
    badge: "green",
    accent: "rgba(56, 161, 105, 0.25)",
  },
  next: {
    label: "Next up",
    icon: FiArrowRightCircle,
    badge: "purple",
    accent: "rgba(129, 140, 248, 0.28)",
  },
  later: {
    label: "On deck",
    icon: FiMoreHorizontal,
    badge: "purple",
    accent: "rgba(167, 139, 250, 0.24)",
  },
};

const timelinePlaceholders = {
  previous: {
    title: "No earlier lesson",
    subtitle: "You're at the start of this chapter.",
  },
  current: {
    title: "Ready for a fresh start",
    subtitle: "Kick off this chapter to unlock progress.",
  },
  next: {
    title: "Next lesson unlocks soon",
    subtitle: "Continue forward to reveal the next challenge.",
  },
  later: {
    title: "Future checkpoints",
    subtitle: "Keep your momentum to see more lessons here.",
  },
};

// ---- Level-based background (clouds a bit stronger) ----
const THEMES = {
  tutorial: {
    skyTop: "#e3f2fd",
    skyBottom: "#ffffff",
    clouds: [
      "rgba(255,255,255,0.75)",
      "rgba(224,240,255,0.65)",
      "rgba(245,224,255,0.65)",
      "rgba(255,240,245,0.65)",
      "rgba(255,255,224,0.65)",
    ],
  },
  1: {
    skyTop: "#e1f5fe",
    skyBottom: "#ffffff",
    clouds: [
      "rgba(224,240,255,0.7)",
      "rgba(210,235,255,0.55)",
      "rgba(255,255,255,0.65)",
    ],
  },
  2: {
    skyTop: "#f3e5f5",
    skyBottom: "#ffffff",
    clouds: [
      "rgba(245,224,255,0.7)",
      "rgba(233,215,251,0.55)",
      "rgba(255,255,255,0.65)",
    ],
  },
  3: {
    skyTop: "#fff8e1",
    skyBottom: "#ffffff",
    clouds: [
      "rgba(255,255,224,0.7)",
      "rgba(255,244,214,0.55)",
      "rgba(255,255,255,0.65)",
    ],
  },
  4: {
    skyTop: "#e0f7fa",
    skyBottom: "#ffffff",
    clouds: [
      "rgba(224,247,250,0.7)",
      "rgba(204,242,245,0.55)",
      "rgba(255,255,255,0.65)",
    ],
  },
  5: {
    skyTop: "#e8f5e9",
    skyBottom: "#ffffff",
    clouds: [
      "rgba(232,245,233,0.7)",
      "rgba(220,240,225,0.55)",
      "rgba(255,255,255,0.65)",
    ],
  },
  night: {
    skyTop: "#0b1023",
    skyBottom: "#1a2038",
    clouds: [
      "rgba(255,255,255,0.15)",
      "rgba(160,170,210,0.1)",
      "rgba(120,130,180,0.12)",
    ],
  },
};

const CloudTransition = ({
  userLanguage,
  clonedStep,
  isActive,
  salary,
  salaryProgress,
  stepProgress,
  balanceProgress,
  dailyGoalProgress,
  dailyProgress,
  dailyGoals,
  dailyGoalLabel,
  message,
  detail,
  onContinue,
  children,
  steps,
  currentStep,
  pendingStep,
  groupLabels = skillTreeGroupLabels,
}) => {
  const canvasRef = useRef(null);
  const [canContinue, setCanContinue] = useState(false);
  const [displaySalary, setDisplaySalary] = useState(salary);
  const prevSalary = useRef(salary);
  const playSparkle = useOneShotAudio(sparkle);
  const playComplete = useOneShotAudio(complete);

  const [questionsAnswered, setQuestionsAnswered] =
    useState(BASE_QUESTION_COUNT);
  const QUESTION_GOAL = 7500;
  const questionProgress = Math.min(
    (questionsAnswered / QUESTION_GOAL) * 100,
    100
  );

  const [userNpub, setUserNpub] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("local_npub");
  });
  const [promotionStartTime, setPromotionStartTime] = useState(null);
  const [promotionDeadline, setPromotionDeadline] = useState(null);
  const [promotionProgress, setPromotionProgress] = useState(null);
  const [promotionTimeLeft, setPromotionTimeLeft] = useState("");
  const [promotionExpired, setPromotionExpired] = useState(false);

  const stepList = useMemo(
    () => steps?.[userLanguage] || [],
    [steps, userLanguage]
  );
  const safeCurrentStep = useMemo(
    () => (typeof currentStep === "number" ? currentStep : 0),
    [currentStep]
  );
  const boardActiveStep = useMemo(
    () =>
      typeof pendingStep === "number" ? pendingStep : safeCurrentStep,
    [pendingStep, safeCurrentStep]
  );
  const focusGroupId = useMemo(() => {
    const focusStep = stepList?.[boardActiveStep];
    return focusStep?.group;
  }, [boardActiveStep, stepList]);
  const focusGroupLabel = useMemo(() => {
    if (!focusGroupId) {
      return null;
    }
    const entry = groupLabels?.[focusGroupId];
    if (!entry) {
      return null;
    }
    if (typeof entry === "string") {
      return entry;
    }
    return entry?.[userLanguage] || entry?.en || null;
  }, [focusGroupId, groupLabels, userLanguage]);

  const timelineNodes = useMemo(() => {
    if (!focusGroupId) {
      return [];
    }

    const chapterSteps = stepList
      .map((item, index) => ({ ...item, index }))
      .filter((item) => item.group === focusGroupId);

    if (!chapterSteps.length) {
      return [];
    }

    const statuses = ["previous", "current", "next", "later"];
    const nodes = statuses.map((status) => ({ status, step: null }));
    const currentIndex = safeCurrentStep;
    const currentPosition = chapterSteps.findIndex(
      (item) => item.index === currentIndex
    );

    if (currentPosition >= 0) {
      nodes[1].step = chapterSteps[currentPosition];
      if (currentPosition > 0) {
        nodes[0].step = chapterSteps[currentPosition - 1];
      }

      if (chapterSteps[currentPosition + 1]) {
        nodes[2].step = chapterSteps[currentPosition + 1];
      }

      if (chapterSteps[currentPosition + 2]) {
        nodes[3].step = chapterSteps[currentPosition + 2];
      }
    } else {
      if (chapterSteps[0]) {
        nodes[2].step = chapterSteps[0];
      }
      if (chapterSteps[1]) {
        nodes[3].step = chapterSteps[1];
      }
    }

    return nodes;
  }, [focusGroupId, safeCurrentStep, stepList]);

  const displayedBalance = useMemo(() => {
    const numeric = Number(balanceProgress);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    if (numeric <= 0) {
      return 0;
    }
    return Math.max(0, Math.round(numeric - 1));
  }, [balanceProgress]);

  useEffect(() => {
    const unsubscribe = subscribeToQuestionsAnswered(setQuestionsAnswered);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key === "local_npub" && event.newValue) {
        setUserNpub(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    if (!userNpub) {
      const storedNpub = localStorage.getItem("local_npub");
      if (storedNpub) {
        setUserNpub(storedNpub);
      } else {
        const intervalId = window.setInterval(() => {
          const cachedNpub = localStorage.getItem("local_npub");
          if (cachedNpub) {
            setUserNpub(cachedNpub);
            window.clearInterval(intervalId);
          }
        }, 300);

        return () => {
          window.removeEventListener("storage", handleStorage);
          window.clearInterval(intervalId);
        };
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [userNpub]);

  useEffect(() => {
    if (!userNpub) return undefined;
    const userRef = doc(database, "users", userNpub);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPromotionStartTime(null);
        setPromotionDeadline(null);
        return;
      }
      const data = snapshot.data();
      setPromotionStartTime(
        data.promotionStartTime ? new Date(data.promotionStartTime) : null
      );
      setPromotionDeadline(
        data.promotionDeadline ? new Date(data.promotionDeadline) : null
      );
    });
    return () => unsubscribe();
  }, [userNpub]);

  useEffect(() => {
    if (!promotionStartTime || !promotionDeadline) {
      setPromotionProgress(null);
      setPromotionTimeLeft("");
      setPromotionExpired(false);
      return;
    }

    const totalMs = promotionDeadline.getTime() - promotionStartTime.getTime();
    if (totalMs <= 0) {
      setPromotionProgress(0);
      setPromotionTimeLeft("0d 00:00:00");
      setPromotionExpired(true);
      return;
    }

    const formatUnit = (value) => String(value).padStart(2, "0");

    const updateTime = () => {
      const now = new Date();
      const remaining = promotionDeadline.getTime() - now.getTime();
      const clampedRemaining = Math.max(remaining, 0);
      const remainingPct = Math.min(
        Math.max((clampedRemaining / totalMs) * 100, 0),
        100
      );
      setPromotionProgress(remainingPct);

      const days = Math.floor(clampedRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((clampedRemaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((clampedRemaining / (1000 * 60)) % 60);
      const seconds = Math.floor((clampedRemaining / 1000) % 60);

      setPromotionTimeLeft(
        `${days}d ${formatUnit(hours)}:${formatUnit(minutes)}:${formatUnit(
          seconds
        )}`
      );
      setPromotionExpired(clampedRemaining === 0);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [promotionStartTime, promotionDeadline]);

  // Chapter key
  const groupKey = useMemo(() => {
    const g = clonedStep?.group ?? clonedStep ?? "tutorial";
    const s = String(g).toLowerCase();
    return s === "0" ? "tutorial" : s;
  }, [clonedStep]);

  const theme = THEMES[groupKey] ?? THEMES.tutorial;

  useEffect(() => {
    if (!isActive) {
      setCanContinue(false);
      return;
    }
    setCanContinue(false);
    const id = setTimeout(() => setCanContinue(true), 200);

    if (String(clonedStep).toLowerCase() !== "night") {
      playSparkle();
    } else {
      playComplete();
    }

    return () => clearTimeout(id);
  }, [isActive, clonedStep, playSparkle, playComplete]);

  // salary count-up
  useEffect(() => {
    const start = prevSalary.current || 0;
    const end = salary || 0;
    if (start === end) {
      setDisplaySalary(end);
      return;
    }
    let startTime;
    let frameId;
    const step = (t) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / 800, 1);
      setDisplaySalary(Math.floor(start + (end - start) * p));
      if (p < 1) frameId = requestAnimationFrame(step);
      else prevSalary.current = end;
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [salary]);

  // level-based canvas sky with fluffier clouds + GOLD sparkles
  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const setSize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    setSize();

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Bigger, multi-lobe clouds for visibility
    const clouds = Array.from({ length: 16 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 90 + Math.random() * 150,
      speedY: 0.24 + Math.random() * 0.32,
      speedX: (Math.random() - 0.5) * 0.16,
      wobble: Math.random() * Math.PI * 2,
      color: theme.clouds[Math.floor(Math.random() * theme.clouds.length)],
    }));

    // Warm gold sparkles ✨
    const sparkles = Array.from({ length: 130 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.9 + Math.random() * 1.9,
      baseA: 0.3 + Math.random() * 0.55,
      flicker: Math.random() * Math.PI * 2,
      vy: 0.12 + Math.random() * 0.22,
      vx: (Math.random() - 0.5) * 0.05,
    }));

    const drawCloudLobe = (cx, cy, r, color) => {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, theme.skyTop);
      sky.addColorStop(1, theme.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Clouds (3-lobe puffs + soft gloss)
      clouds.forEach((c) => {
        c.wobble += 0.01;
        const wobbleY = Math.sin(c.wobble) * 0.18;

        // main lobe + sides
        drawCloudLobe(c.x, c.y, c.radius, c.color);
        drawCloudLobe(
          c.x - c.radius * 0.42,
          c.y - c.radius * 0.08,
          c.radius * 0.85,
          c.color
        );
        drawCloudLobe(
          c.x + c.radius * 0.46,
          c.y - c.radius * 0.1,
          c.radius * 0.88,
          c.color
        );

        // glossy highlight to pop clouds
        ctx.save();
        ctx.globalAlpha = 0.16;
        drawCloudLobe(
          c.x - c.radius * 0.18,
          c.y - c.radius * 0.28,
          c.radius * 0.9,
          "rgba(255,255,255,0.9)"
        );
        ctx.restore();

        // motion
        c.y -= c.speedY + wobbleY;
        c.x += c.speedX;

        if (c.y + c.radius < 0) {
          c.y = height + c.radius;
          c.x = Math.random() * width;
        }
        if (c.x - c.radius > width) c.x = -c.radius;
        if (c.x + c.radius < 0) c.x = width + c.radius;
      });

      // Sparkles (additive gold)
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      sparkles.forEach((s, i) => {
        s.flicker += 0.12 + (i % 5) * 0.005;
        const a = s.baseA * (0.5 + 0.5 * Math.sin(s.flicker));
        const r = s.r * (0.85 + 0.3 * Math.sin(s.flicker * 1.7));

        // soft gold dot
        ctx.fillStyle = `rgba(255,215,0,${a})`; // GOLD
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();

        // tiny cross twinkle
        if ((i + (s.flicker | 0)) % 7 === 0) {
          ctx.globalAlpha = a * 0.9;
          ctx.beginPath();
          ctx.moveTo(s.x - r * 1.8, s.y);
          ctx.lineTo(s.x + r * 1.8, s.y);
          ctx.moveTo(s.x, s.y - r * 1.8);
          ctx.lineTo(s.x, s.y + r * 1.8);
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = "rgba(255,215,0,0.9)"; // GOLD
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // drift
        s.y -= s.vy;
        s.x += s.vx;
        if (s.y < -4) {
          s.y = height + 4;
          s.x = Math.random() * width;
        }
        if (s.x < -4) s.x = width + 4;
        if (s.x > width + 4) s.x = -4;
      });
      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      setSize();
      width = window.innerWidth;
      height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [isActive, theme]);

  return (
    <AnimatePresence>
      {isActive && (
        <Box
          as={motion.div}
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          zIndex={2000}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          // justifyContent={children ? "flex-start" : "center"}
          alignItems="center"
        >
          <Box
            as="canvas"
            ref={canvasRef}
            position="fixed"
            top={0}
            left={0}
            w="100%"
            h="100%"
            zIndex={0}
            pointerEvents="none"
          />

          <MotionBox
            initial={{ opacity: 0, y: 18, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            textAlign="center"
            color="purple.600"
            w="86%"
            maxW="460px"
          >
            {message && (
              <Text
                as={motion.p}
                fontSize="md"
                mt={6}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.92, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
              >
                <Text
                  as={motion.p}
                  fontSize="3xl"
                  fontWeight="bold"
                  mb={4}
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.55 }}
                  color="#05f569"
                  style={{ textShadow: "0 0 12px rgba(5,245,105,0.25)" }}
                >
                  +${(displaySalary ?? 0).toLocaleString()}/yr
                </Text>

                {detail && (
                  <Text
                    as={motion.p}
                    fontSize="sm"
                    mt={2}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0.85, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                  >
                    {detail}
                  </Text>
                )}
              </Text>
            )}

            <Box
              mt={6}
              mb={8}
              borderRadius="2xl"
              border="1px solid rgba(128,90,213,0.22)"
              bg="rgba(255,255,255,0.92)"
              boxShadow="0 24px 44px rgba(79, 70, 229, 0.18)"
              px={{ base: 4, md: 5 }}
              py={{ base: 5, md: 6 }}
            >
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text
                    fontSize="sm"
                    textTransform="uppercase"
                    letterSpacing="0.12em"
                    color="purple.500"
                  >
                    Chapter path
                  </Text>
                  {focusGroupLabel && (
                    <Text fontWeight="semibold" fontSize="lg" color="purple.700" mt={1}>
                      {focusGroupLabel}
                    </Text>
                  )}
                </Box>
                {timelineNodes.length ? (
                  <Box position="relative" pt={2}>
                    <MotionBox
                      position="absolute"
                      left="50%"
                      top={0}
                      bottom={0}
                      width="3px"
                      bgGradient="linear(180deg, rgba(129, 140, 248, 0.2) 0%, rgba(56, 178, 172, 0.4) 100%)"
                      transform="translateX(-50%)"
                      borderRadius="full"
                      animate={{ opacity: [0.35, 0.75, 0.35] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden
                    />
                    <VStack spacing={6} align="stretch">
                      {timelineNodes.map((node, idx) => {
                        const meta = timelineStatusMeta[node.status] || timelineStatusMeta.later;
                        const placeholder =
                          timelinePlaceholders[node.status] || timelinePlaceholders.later;
                        const isEmpty = !node.step;
                        const side = idx % 2 === 0 ? "flex-start" : "flex-end";
                        const title = isEmpty
                          ? placeholder.title
                          : node.step.title || `Question ${node.step.index}`;
                        const subtitle = isEmpty
                          ? placeholder.subtitle
                          : `#${node.step.index} · ${node.step.type || "Lesson"}`;

                        return (
                          <MotionFlex
                            key={`${node.status}-${node.step?.index ?? idx}`}
                            justify={side}
                            initial={{ opacity: 0, x: side === "flex-start" ? -16 : 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            w="100%"
                          >
                            <MotionBox
                              position="relative"
                              maxW="88%"
                              bg={isEmpty ? "rgba(247, 245, 255, 0.65)" : "white"}
                              borderRadius="xl"
                              px={4}
                              py={3}
                              border={
                                isEmpty
                                  ? "1px solid rgba(203,213,224,0.6)"
                                  : "1px solid rgba(128,90,213,0.22)"
                              }
                              boxShadow={
                                isEmpty ? "none" : "0 14px 32px rgba(99, 102, 241, 0.18)"
                              }
                              _before={{
                                content: '""',
                                position: "absolute",
                                top: "50%",
                                width: "42px",
                                height: "2px",
                                bgGradient: `linear(90deg, transparent 0%, ${meta.accent} 45%, transparent 100%)`,
                                left: side === "flex-start" ? "100%" : "auto",
                                right: side === "flex-end" ? "100%" : "auto",
                                transform:
                                  side === "flex-start"
                                    ? "translateY(-50%) rotate(-6deg)"
                                    : "translateY(-50%) rotate(6deg)",
                              }}
                            >
                              <HStack align="flex-start" spacing={3}>
                                <Icon
                                  as={meta.icon}
                                  color={isEmpty ? "purple.300" : "purple.500"}
                                  boxSize={4}
                                  mt={1}
                                />
                                <VStack align="flex-start" spacing={1} w="100%">
                                  <Badge
                                    colorScheme={meta.badge}
                                    variant={isEmpty ? "outline" : "subtle"}
                                    borderRadius="full"
                                  >
                                    {meta.label}
                                  </Badge>
                                  <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                                    {title}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {subtitle}
                                  </Text>
                                </VStack>
                              </HStack>
                            </MotionBox>
                          </MotionFlex>
                        );
                      })}
                    </VStack>
                  </Box>
                ) : (
                  <Text fontSize="sm" color="gray.600">
                    We&apos;ll cue up the next lessons once this chapter begins.
                  </Text>
                )}
              </VStack>
            </Box>

            {message && (
              <Box fontSize="sm" color="purple.600" mb={6}>
                {message}
              </Box>
            )}

            <Box w="100%" mx="auto" mb={6}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="purple.500">
                  Salary
                </Text>
                <Text fontSize="xs" color="purple.400">
                  {Math.round(Number(salaryProgress) || 0)}%
                </Text>
              </HStack>
              <WaveBar
                value={salaryProgress}
                start="#43e97b"
                end="#38f9d7"
                delay={0.2}
                bg="rgba(255,255,255,0.65)"
                border="#ededed"
                aria-label="Salary progress"
              />
            </Box>
            <Box w="100%" mx="auto" mb={6}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="purple.500">
                  Bitcoin sats
                </Text>
                <Text fontSize="xs" color="purple.400">
                  {displayedBalance}
                </Text>
              </HStack>
              <WaveBar
                value={displayedBalance}
                start="#fce09d"
                end="#fef37b"
                delay={0}
                bg="rgba(255,255,255,0.65)"
                border="#ededed"
                aria-label="Bitcoin balance progress"
              />
            </Box>

            <Box w="100%" mx="auto" mb={6}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="purple.500">
                  Progress
                </Text>
                <Text fontSize="xs" color="purple.400">
                  {Math.round(Number(stepProgress) || 0)}%
                </Text>
              </HStack>
              <WaveBar
                value={stepProgress}
                start="#0345fc"
                end="#03f4fc"
                delay={0.1}
                bg="rgba(255,255,255,0.65)"
                border="#ededed"
                aria-label="Chapter completion progress"
              />
            </Box>

            <Box w="100%" mx="auto" mb={6}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="purple.500">
                  {dailyGoalLabel}
                </Text>
                <Text fontSize="xs" color="purple.400">
                  {dailyProgress}/{dailyGoals}
                </Text>
              </HStack>
              <WaveBar
                value={dailyGoalProgress}
                start="#03f4fc"
                end="#fef37b"
                delay={0}
                bg="rgba(255,255,255,0.65)"
                border="#ededed"
                aria-label="Daily goal progress"
              />
            </Box>

            <Box w="100%" mx="auto" mb={6}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="purple.500">
                  {translation[userLanguage]["communityGoal"]}
                </Text>
                <Text fontSize="xs" color="purple.400">
                  {questionsAnswered}/7500
                </Text>
              </HStack>
              <WaveBar
                value={questionProgress}
                start="#bf66ff"
                end="#7300ff"
                delay={0}
                bg="rgba(255,255,255,0.65)"
                border="#ededed"
                aria-label="Community goal progress"
              />
            </Box>

            {promotionProgress !== null && (
              <Box w="50%" mx="auto" mb={0}>
                <Text
                  fontSize="xs"
                  mt={2}
                  color={promotionExpired ? "red.500" : "purple.600"}
                >
                  {promotionExpired
                    ? translation[userLanguage]["promotion.timerExpired"]
                    : "Refund time left: " + promotionTimeLeft}
                </Text>
                <WaveBar
                  value={promotionProgress}
                  start="#ff8ba7"
                  end="#ffcc70"
                  delay={0}
                  bg="rgba(255,255,255,0.65)"
                  border="#ededed"
                />
              </Box>
            )}

            {children}

            <Button
              as={motion.button}
              mt={8}
              colorScheme="yellow"
              variant="outline"
              borderRadius="full"
              px={6}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.2, delay: 0.35 }}
              onClick={onContinue}
              disabled={!canContinue}
            >
              Continue
            </Button>
          </MotionBox>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default CloudTransition;
