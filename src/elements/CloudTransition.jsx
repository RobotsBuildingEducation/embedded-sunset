// CloudTransition.jsx
import React, { useEffect, useRef, useState, useMemo, useId } from "react";
import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import {
  CheckCircleIcon,
  QuestionIcon,
  RepeatIcon,
  StarIcon,
} from "@chakra-ui/icons";
// Icons for additional types
import { FiType, FiAlignLeft } from "react-icons/fi";
import {
  RiCodeSSlashLine,
  RiTerminalLine,
  RiBookOpenLine,
  RiChatQuoteLine,
  RiChat3Line,
} from "react-icons/ri";
import { BsCodeSquare } from "react-icons/bs";

import { motion, AnimatePresence } from "framer-motion";
import { soundManager } from "../utility/soundManager";
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

const QUESTION_TYPE_STYLES = {
  order: {
    icon: RepeatIcon,
    label: "Ordering Challenge",
    accent: "#8b5cf6",
    gradient: "linear(to-br, rgba(139,92,246,0.22), rgba(59,130,246,0.18))",
    halo: "rgba(139,92,246,0.22)",
  },
  multiAnswer: {
    icon: CheckCircleIcon,
    label: "Multi-Select",
    accent: "#10b981",
    gradient: "linear(to-br, rgba(16,185,129,0.22), rgba(59,130,246,0.14))",
    halo: "rgba(16,185,129,0.18)",
  },
  multiChoice: {
    icon: QuestionIcon,
    label: "Multiple Choice",
    accent: "#0ea5e9",
    gradient: "linear(to-br, rgba(14,165,233,0.22), rgba(99,102,241,0.16))",
    halo: "rgba(14,165,233,0.2)",
  },

  // Expanded types
  singleLine: {
    icon: FiType,
    label: "Single-line Answer",
    accent: "#fb923c",
    gradient: "linear(to-br, rgba(251,146,60,0.22), rgba(253,164,175,0.18))",
    halo: "rgba(251,146,60,0.18)",
  },
  text: {
    icon: FiAlignLeft,
    label: "Open Response",
    accent: "#64748b",
    gradient: "linear(to-br, rgba(100,116,139,0.20), rgba(99,102,241,0.12))",
    halo: "rgba(100,116,139,0.18)",
  },
  code: {
    icon: RiCodeSSlashLine,
    label: "Code (Editor)",
    accent: "#06b6d4",
    gradient: "linear(to-br, rgba(6,182,212,0.22), rgba(14,165,233,0.16))",
    halo: "rgba(6,182,212,0.18)",
  },
  codeCompletion: {
    icon: BsCodeSquare,
    label: "Code Completion",
    accent: "#84cc16",
    gradient: "linear(to-br, rgba(132,204,22,0.22), rgba(16,185,129,0.16))",
    halo: "rgba(132,204,22,0.18)",
  },
  terminal: {
    icon: RiTerminalLine,
    label: "Terminal Task",
    accent: "#f43f5e",
    gradient: "linear(to-br, rgba(244,63,94,0.22), rgba(59,130,246,0.12))",
    halo: "rgba(244,63,94,0.18)",
  },
  study: {
    icon: RiBookOpenLine,
    label: "Study Guide",
    accent: "#a78bfa",
    gradient: "linear(to-br, rgba(167,139,250,0.22), rgba(14,165,233,0.14))",
    halo: "rgba(167,139,250,0.20)",
  },
  prompt: {
    icon: RiChatQuoteLine,
    label: "Prompt",
    accent: "#e879f9",
    gradient: "linear(to-br, rgba(232,121,249,0.22), rgba(251,113,133,0.16))",
    halo: "rgba(232,121,249,0.20)",
  },
  conversation: {
    icon: RiChat3Line,
    label: "Conversation",
    accent: "#6366f1",
    gradient: "linear(to-br, rgba(99,102,241,0.22), rgba(14,165,233,0.14))",
    halo: "rgba(99,102,241,0.20)",
  },

  default: {
    icon: StarIcon,
    label: "Skill Quest",
    accent: "#f59e0b",
    gradient: "linear(to-br, rgba(245,158,11,0.22), rgba(249,168,212,0.18))",
    halo: "rgba(245,158,11,0.18)",
  },
};

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
  extractTextFromNode(value)
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();

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

// Returns:
// 'study' | 'order' | 'multiAnswer' | 'multiChoice' |
// 'codeCompletion' | 'terminal' | 'code' | 'singleLine' | 'text' | 'default'
const detectQuestionKind = (step) => {
  if (!step || typeof step !== "object") return "default";
  const q = step.question ?? step;

  // 1) Explicit flags
  if (step.isStudyGuide || q?.isStudyGuide) return "study";
  if (step.isSelectOrder || q?.isSelectOrder) return "order";
  if (step.isMultipleAnswerChoice || q?.isMultipleAnswerChoice)
    return "multiAnswer";
  if (step.isMultipleChoice || q?.isMultipleChoice) return "multiChoice";
  if (step.isCodeCompletion || q?.isCodeCompletion) return "codeCompletion";

  // 2) Code family
  if (step.isCode || q?.isCode) {
    const isTerminal = Boolean(step.isTerminal ?? q?.isTerminal);
    return isTerminal ? "terminal" : "code";
  }

  // 3) Text inputs
  if (step.isSingleLineText || q?.isSingleLineText) return "singleLine";
  if (step.isText || q?.isText) return "text";

  // 4) Lightweight inference
  const answer = q?.answer ?? q?.answers ?? step.answer;
  if (Array.isArray(answer) && answer.length > 1) return "multiAnswer";

  const options = q?.options ?? q?.choices ?? q?.variants ?? q?.items;
  if (Array.isArray(options) && options.length > 0) return "multiChoice";

  return "default";
};

// ---- Level-based background ----
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
  const connectorBaseId = useId();

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
    const mapSource = stepsMap ?? defaultSteps;
    const availableMap = mapSource ?? {};
    const mapKeys = Object.keys(availableMap);

    if (mapKeys.length === 0) {
      return [];
    }

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

    const normalizeIndex = (value) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return null;
    };

    let activeIndex = normalizeIndex(currentStepIndex);

    if (
      activeIndex === null ||
      activeIndex < 0 ||
      activeIndex >= localeSteps.length
    ) {
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

    if (activeIndex === null || activeIndex < 0) {
      activeIndex = 0;
    }

    activeIndex = Math.min(Math.max(activeIndex, 0), localeSteps.length - 1);

    const nodes = [];

    const pushNode = (step, index, type) => {
      if (!step) return;
      const questionKind = detectQuestionKind(step);
      nodes.push({
        id: `${type}-${index}`,
        index,
        type,
        title: step?.title || `Question ${index + 1}`,
        questionKind,
      });
    };

    // Previous node is intentionally NOT added anymore
    pushNode(localeSteps[activeIndex], activeIndex, "current");

    if (activeIndex + 1 < localeSteps.length) {
      pushNode(localeSteps[activeIndex + 1], activeIndex + 1, "upcoming");
    }

    if (activeIndex + 2 < localeSteps.length) {
      pushNode(localeSteps[activeIndex + 2], activeIndex + 2, "upcoming");
    }

    return nodes;
  }, [clonedStep, currentStepIndex, stepsMap, userLanguage]);

  const currentNode = useMemo(
    () => skillTreeNodes.find((node) => node.type === "current"),
    [skillTreeNodes]
  );
  const upcomingNodes = useMemo(
    () => skillTreeNodes.filter((node) => node.type === "upcoming"),
    [skillTreeNodes]
  );
  const hasSkillTree = skillTreeNodes.length > 0;

  // Only show current + upcoming (no previous)
  const displayNodes = useMemo(() => {
    const list = [];
    if (currentNode) list.push(currentNode);
    if (upcomingNodes.length) list.push(...upcomingNodes);
    return list;
  }, [currentNode, upcomingNodes]);

  // Node renderer — no hover/tap; current node emphasized with border & glow
  const renderSkillNode = (node, index) => {
    if (!node) return null;
    const typeStyle =
      QUESTION_TYPE_STYLES[node.questionKind] ?? QUESTION_TYPE_STYLES.default;
    const IconComponent = typeStyle.icon ?? StarIcon;

    const statusStyle =
      SKILL_NODE_STYLES[node.type] ?? SKILL_NODE_STYLES.upcoming;

    const accent = typeStyle.accent ?? statusStyle.accent;
    const gradient = typeStyle.gradient ?? statusStyle.gradient;
    const isCurrent = node.type === "current";

    return (
      <MotionBox
        variants={skillNodeVariants}
        custom={index}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        borderRadius="full"
        px={{ base: 4, md: 5 }}
        py={{ base: 3, md: 4 }}
        bg="rgba(255,255,255,0.88)"
        backdropFilter="blur(10px)"
        boxShadow={
          isCurrent
            ? `0 18px 36px ${accent}40, 0 0 0 2px ${accent}33 inset`
            : `0 8px 16px rgba(0,0,0,0.06)`
        }
        borderWidth={isCurrent ? "2px" : "1px"}
        borderColor={isCurrent ? accent : `${accent}33`}
        position="relative"
        overflow="hidden"
        width="100%"
        maxW="360px"
      >
        <Box
          position="absolute"
          inset={0}
          bgGradient={gradient}
          opacity={isCurrent ? 0.26 : 0.14}
          pointerEvents="none"
        />
        <Flex align="center" gap={4} position="relative" zIndex={1}>
          <Box
            w="52px"
            h="52px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgGradient={`radial-gradient(circle at 30% 30%, ${accent}33, transparent 70%)`}
            boxShadow={
              isCurrent ? `0 14px 28px ${accent}33` : `0 10px 20px ${accent}22`
            }
          >
            <Icon as={IconComponent} boxSize={7} color={accent} />
          </Box>
          <Text
            fontSize="lg"
            fontWeight={isCurrent ? "bold" : "semibold"}
            color={isCurrent ? "purple.700" : "purple.500"}
          >
            {node.title}
          </Text>
        </Flex>
      </MotionBox>
    );
  };

  const renderConnector = (fromNode, toNode, index) => {
    const fromStyle =
      QUESTION_TYPE_STYLES[fromNode?.questionKind] ??
      QUESTION_TYPE_STYLES.default;
    const toStyle =
      QUESTION_TYPE_STYLES[toNode?.questionKind] ??
      QUESTION_TYPE_STYLES.default;
    const gradientId = `${connectorBaseId}-connector-${index}`;

    return (
      <Box
        as="svg"
        key={`connector-${index}`}
        width="160px"
        height="120px"
        viewBox="0 0 160 120"
        preserveAspectRatio="none"
        opacity={0.8}
        mx="auto"
      >
        <defs>
          <linearGradient id={gradientId} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={fromStyle.accent} stopOpacity="0.72" />
            <stop offset="100%" stopColor={toStyle.accent} stopOpacity="0.72" />
          </linearGradient>
        </defs>
        <path
          d="M80 0 C 132 28, 36 72, 80 120"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M80 0 C 108 32, 52 68, 80 120"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
      </Box>
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
      soundManager.playTransition("sparkle");
    } else {
      soundManager.playTransition("complete");
    }

    return () => clearTimeout(id);
  }, [isActive, clonedStep]);

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

  // level-based canvas sky
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

      // Clouds
      clouds.forEach((c) => {
        c.wobble += 0.01;
        const wobbleY = Math.sin(c.wobble) * 0.18;

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

        // glossy highlight
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

      // Sparkles (additive)
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      sparkles.forEach((s, i) => {
        s.flicker += 0.12 + (i % 5) * 0.005;
        const a = s.baseA * (0.5 + 0.5 * Math.sin(s.flicker));
        const r = s.r * (0.85 + 0.3 * Math.sin(s.flicker * 1.7));

        ctx.fillStyle = `rgba(255,215,0,${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();

        if ((i + (s.flicker | 0)) % 7 === 0) {
          ctx.globalAlpha = a * 0.9;
          ctx.beginPath();
          ctx.moveTo(s.x - r * 1.8, s.y);
          ctx.lineTo(s.x + r * 1.8, s.y);
          ctx.moveTo(s.x, s.y - r * 1.8);
          ctx.lineTo(s.x, s.y + r * 1.8);
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = "rgba(255,215,0,0.9)";
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

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
      // Optionally update references if you want clouds to adapt immediately:
      // width = window.innerWidth;
      // height = window.innerHeight;
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
                borderRadius="12px"
                py={8}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2, delay: 0.35 }}
                onClick={onContinue}
                disabled={!canContinue}
                width="100%"
              >
                Continue
              </Button>

              {hasSkillTree && (
                <MotionBox
                  variants={skillTreeContainerVariants}
                  initial="hidden"
                  animate="show"
                  mt={10}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={{ base: 6, md: 7 }}
                  mb={12}
                >
                  {displayNodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      {renderSkillNode(node, index)}
                      {index < displayNodes.length - 1 &&
                        renderConnector(node, displayNodes[index + 1], index)}
                    </React.Fragment>
                  ))}
                </MotionBox>
              )}
            </MotionBox>
          )}
        </Box>
      )}
    </AnimatePresence>
  );
};

export default CloudTransition;
