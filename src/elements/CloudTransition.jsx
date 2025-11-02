import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Text,
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
import { steps as defaultSteps } from "../utility/content";

const MotionBox = motion(Box);

const SKILL_NODE_STYLES = {
  previous: {
    accent: "#7c3aed",
    gradient: "linear(to-br, rgba(124,58,237,0.28), rgba(249,168,212,0.26))",
    shadow: "rgba(124,58,237,0.28)",
    highlight: "#c4b5fd",
  },
  current: {
    accent: "#0ea5e9",
    gradient: "linear(to-br, rgba(34,197,94,0.32), rgba(14,165,233,0.28))",
    shadow: "rgba(45,212,191,0.34)",
    highlight: "#99f6e4",
  },
  upcoming: {
    accent: "#6366f1",
    gradient: "linear(to-br, rgba(99,102,241,0.28), rgba(168,85,247,0.24))",
    shadow: "rgba(99,102,241,0.26)",
    highlight: "#a5b4fc",
  },
};

const CONNECTOR_GRADIENT =
  "linear(to-b, rgba(124,58,237,0.45), rgba(56,189,248,0))";
const BRANCH_GRADIENT =
  "linear(to-r, rgba(124,58,237,0.05), rgba(56,189,248,0.4), rgba(14,165,233,0.05))";

const skillTreeContainerVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { when: "beforeChildren", staggerChildren: 0.08 },
  },
};

const skillNodeVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      delay: i * 0.05,
    },
  }),
};

const extractTextFromNode = (node) => {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((child) => extractTextFromNode(child)).join(" ");
  }
  if (React.isValidElement(node)) {
    return extractTextFromNode(node.props?.children);
  }
  if (typeof node === "object") {
    return Object.values(node)
      .map((value) => extractTextFromNode(value))
      .join(" ");
  }
  return "";
};

const sanitizeText = (value) =>
  extractTextFromNode(value).replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();

const truncateText = (value, limit = 140) => {
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}…`;
};

const buildStepSummary = (step) => {
  if (!step) return "";
  const description = sanitizeText(step.description);
  const questionText = sanitizeText(step.question?.questionText);
  const summary = description || questionText;
  return truncateText(summary);
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
  currentStepIndex,
  stepsMap,
  children,
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

  const skillTreeNodes = useMemo(() => {
    if (!clonedStep || typeof clonedStep !== "object") {
      return [];
    }

    const mapSource = stepsMap ?? defaultSteps;
    const availableMap = mapSource ?? {};
    const mapKeys = Object.keys(availableMap);

    const localeKey = (() => {
      if (
        userLanguage &&
        Array.isArray(availableMap[userLanguage]) &&
        availableMap[userLanguage].length > 0
      ) {
        return userLanguage;
      }
      if (Array.isArray(availableMap.en) && availableMap.en.length > 0) {
        return "en";
      }
      if (userLanguage && availableMap[userLanguage]) {
        return userLanguage;
      }
      if (availableMap.en) {
        return "en";
      }
      return mapKeys[0];
    })();

    const localeSteps = (availableMap && availableMap[localeKey]) || [];
    if (!localeSteps?.length) {
      return [];
    }

    let activeIndex =
      typeof currentStepIndex === "number" && currentStepIndex >= 0
        ? currentStepIndex
        : -1;

    if (activeIndex < 0) {
      activeIndex = localeSteps.findIndex((step) => {
        if (!step || typeof step !== "object") return false;
        if (step?.title && clonedStep?.title) {
          return step.title === clonedStep.title;
        }
        if (step?.group && clonedStep?.group) {
          return step.group === clonedStep.group;
        }
        const stepSummary = buildStepSummary(step);
        const clonedSummary = buildStepSummary(clonedStep);
        return stepSummary && clonedSummary
          ? stepSummary === clonedSummary
          : false;
      });
    }

    if (activeIndex < 0) {
      return [];
    }

    const nodes = [];
    let order = 0;

    const pushNode = (step, index, type, label) => {
      if (!step) return;
      nodes.push({
        id: `${type}-${index}`,
        index,
        type,
        title: step?.title || `Question ${index + 1}`,
        summary: buildStepSummary(step),
        label,
        order,
      });
      order += 1;
    };

    if (activeIndex - 1 >= 0) {
      pushNode(localeSteps[activeIndex - 1], activeIndex - 1, "previous", "Previously");
    }

    pushNode(localeSteps[activeIndex], activeIndex, "current", "Current Question");

    if (activeIndex + 1 < localeSteps.length) {
      pushNode(
        localeSteps[activeIndex + 1],
        activeIndex + 1,
        "upcoming",
        "Next Question"
      );
    }

    if (activeIndex + 2 < localeSteps.length) {
      pushNode(
        localeSteps[activeIndex + 2],
        activeIndex + 2,
        "upcoming",
        "On the Horizon"
      );
    }

    return nodes;
  }, [clonedStep, currentStepIndex, stepsMap, userLanguage]);

  const previousNode = useMemo(
    () => skillTreeNodes.find((node) => node.type === "previous"),
    [skillTreeNodes]
  );
  const currentNode = useMemo(
    () => skillTreeNodes.find((node) => node.type === "current"),
    [skillTreeNodes]
  );
  const upcomingNodes = useMemo(
    () => skillTreeNodes.filter((node) => node.type === "upcoming"),
    [skillTreeNodes]
  );
  const hasSkillTree = Boolean(currentNode);

  const renderSkillNode = (node) => {
    if (!node) return null;
    const style = SKILL_NODE_STYLES[node.type] ?? SKILL_NODE_STYLES.upcoming;
    const questionNumber = `Q${String(node.index + 1).padStart(2, "0")}`;

    return (
      <MotionBox
        variants={skillNodeVariants}
        custom={node.order}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        borderRadius="xl"
        px={6}
        py={5}
        bg="rgba(255,255,255,0.92)"
        backdropFilter="blur(12px)"
        boxShadow={`0 22px 48px ${style.shadow}`}
        borderWidth="1px"
        borderColor={`${style.accent}33`}
        position="relative"
        overflow="hidden"
        minW="230px"
      >
        <Box
          position="absolute"
          inset={0}
          bgGradient={style.gradient}
          opacity={0.28}
          pointerEvents="none"
        />
        <MotionBox
          position="absolute"
          top="-32px"
          right="-24px"
          w="110px"
          h="110px"
          borderRadius="full"
          bgGradient={`radial-gradient(circle at center, ${style.highlight}66, transparent 65%)`}
          opacity={0.8}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          pointerEvents="none"
        />
        <MotionBox
          position="absolute"
          bottom="-36px"
          left="-20px"
          w="120px"
          h="120px"
          borderRadius="full"
          bgGradient={`radial-gradient(circle at center, ${style.accent}40, transparent 70%)`}
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          opacity={0.5}
          pointerEvents="none"
        />
        <Text
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="0.24em"
          color={`${style.accent}cc`}
        >
          {node.label}
        </Text>
        <Text fontWeight="extrabold" fontSize="xl" color={style.accent} mt={1}>
          {questionNumber}
        </Text>
        <Text fontSize="md" fontWeight="semibold" color="purple.700" mt={1}>
          {node.title}
        </Text>
        {node.summary && (
          <Text mt={3} fontSize="sm" color="purple.500" lineHeight={1.5}>
            {node.summary}
          </Text>
        )}
      </MotionBox>
    );
  };

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

          {children ? (
            <Box w="100%" maxW="600px" zIndex={1}>
              {children}
            </Box>
          ) : (
            <MotionBox
              initial={{ opacity: 0, y: 18, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              textAlign="center"
              color="purple.600"
              w="90%"
              maxW="420px"
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

                  {/* Salary bar */}
                  <Box w="100%" mx="auto" mb={6} mt={6}>
                    <Text fontSize="sm" mb={1} color="purple.500">
                      Salary
                    </Text>
                    <WaveBar
                      value={salaryProgress}
                      start="#43e97b"
                      end="#38f9d7"
                      delay={0.2}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>
                  {/* Balance bar */}
                  <Box w="100%" mx="auto" mb={6}>
                    <Text fontSize="sm" mb={1} color="purple.500">
                      {balanceProgress === 0 ? "0" : balanceProgress - 1}{" "}
                      Bitcoin sats
                    </Text>
                    <WaveBar
                      value={balanceProgress === 0 ? "0" : balanceProgress - 1}
                      start="#fce09d"
                      end="#fef37b"
                      delay={0}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>

                  {/* Step progress bar */}
                  <Box w="100%" mx="auto" mb={6}>
                    <Text fontSize="sm" mb={1} color="purple.500">
                      Progress
                    </Text>
                    <WaveBar
                      value={stepProgress}
                      start="#0345fc"
                      end="#03f4fc"
                      delay={0.1}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>

                  {/* Daily goal bar */}
                  <Box w="100%" mx="auto" mb={6}>
                    <Text fontSize="sm" mb={1} color="purple.500">
                      {dailyGoalLabel} {dailyProgress}/{dailyGoals}
                    </Text>
                    <WaveBar
                      value={dailyGoalProgress}
                      start="#03f4fc"
                      end="#fef37b"
                      delay={0}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>

                  <Box w="100%" mx="auto" mb={6}>
                    <Text fontSize="sm" mb={1} color="purple.500">
                      {translation[userLanguage]["communityGoal"]}
                      {questionsAnswered}/7500{" "}
                      {translation[userLanguage]["questions"]}
                    </Text>
                    <WaveBar
                      value={questionProgress}
                      start="#bf66ff"
                      end="#7300ff"
                      delay={0}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>

                  {hasSkillTree && (
                    <Accordion
                      allowToggle
                      mt={10}
                      border="none"
                      bg="transparent"
                    >
                      <AccordionItem border="none">
                        {({ isExpanded }) => (
                          <Box
                            borderRadius="2xl"
                            border="1px solid rgba(124,58,237,0.16)"
                            bg={
                              isExpanded
                                ? "rgba(255,255,255,0.92)"
                                : "rgba(255,255,255,0.78)"
                            }
                            boxShadow={
                              isExpanded
                                ? "0 22px 48px rgba(79,70,229,0.22)"
                                : "0 14px 36px rgba(79,70,229,0.14)"
                            }
                            transition="all 0.3s ease"
                            overflow="hidden"
                          >
                            <AccordionButton
                              px={5}
                              py={4}
                              _hover={{ bg: "rgba(255,255,255,0.95)" }}
                              _expanded={{
                                bg: "rgba(255,255,255,0.98)",
                                color: "purple.700",
                              }}
                            >
                              <Box textAlign="left" flex="1">
                                <Text fontWeight="bold" color="purple.600">
                                  Journey Skill Tree
                                </Text>
                                <Text fontSize="xs" color="purple.400">
                                  Trace how your next questions blossom ahead
                                </Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel
                              pt={6}
                              pb={4}
                              px={{ base: 3, md: 6 }}
                              bg="rgba(255,255,255,0.88)"
                            >
                              <MotionBox
                                variants={skillTreeContainerVariants}
                                initial="hidden"
                                animate={isExpanded ? "show" : "hidden"}
                              >
                                {previousNode && (
                                  <Box
                                    position="relative"
                                    pb={currentNode ? 12 : 0}
                                    display="flex"
                                    justifyContent="center"
                                  >
                                    {currentNode && (
                                      <Box
                                        position="absolute"
                                        bottom="-14px"
                                        left="50%"
                                        transform="translateX(-50%)"
                                        width="2px"
                                        height="38px"
                                        bgGradient={CONNECTOR_GRADIENT}
                                        opacity={0.7}
                                      />
                                    )}
                                    {renderSkillNode(previousNode)}
                                  </Box>
                                )}

                                {currentNode && (
                                  <Box
                                    position="relative"
                                    pb={upcomingNodes.length ? 18 : 0}
                                    display="flex"
                                    justifyContent="center"
                                  >
                                    {upcomingNodes.length > 0 && (
                                      <Box
                                        position="absolute"
                                        bottom="-18px"
                                        left="50%"
                                        transform="translateX(-50%)"
                                        width="2px"
                                        height="46px"
                                        bgGradient={CONNECTOR_GRADIENT}
                                        opacity={0.7}
                                      />
                                    )}
                                    {renderSkillNode(currentNode)}
                                  </Box>
                                )}

                                {upcomingNodes.length > 0 && (
                                  <Box position="relative" pt={12}>
                                    <Box
                                      position="absolute"
                                      top="0"
                                      left={{ base: "12%", md: "18%" }}
                                      right={{ base: "12%", md: "18%" }}
                                      height="2px"
                                      bgGradient={BRANCH_GRADIENT}
                                      opacity={0.65}
                                    />
                                    <Flex
                                      justifyContent={
                                        upcomingNodes.length === 1
                                          ? "center"
                                          : "space-between"
                                      }
                                      gap={6}
                                      flexWrap="wrap"
                                    >
                                      {upcomingNodes.map((node) => (
                                        <Box
                                          key={node.id}
                                          position="relative"
                                          pt={8}
                                          flex="1 1 220px"
                                          maxW={{ base: "100%", md: "calc(50% - 12px)" }}
                                          display="flex"
                                          justifyContent="center"
                                        >
                                          <Box
                                            position="absolute"
                                            top="-10px"
                                            left="50%"
                                            transform="translate(-50%, -100%)"
                                            width="2px"
                                            height="40px"
                                            bgGradient={CONNECTOR_GRADIENT}
                                            opacity={0.65}
                                          />
                                          {renderSkillNode(node)}
                                        </Box>
                                      ))}
                                    </Flex>
                                  </Box>
                                )}
                              </MotionBox>
                            </AccordionPanel>
                          </Box>
                        )}
                      </AccordionItem>
                    </Accordion>
                  )}

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

                  <br />
                  <br />
                  {message}
                </Text>
              )}

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
          )}
        </Box>
      )}
    </AnimatePresence>
  );
};

export default CloudTransition;
