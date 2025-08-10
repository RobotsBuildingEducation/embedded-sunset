import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionG = motion.g;

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

const clampPct = (n) => Math.max(0, Math.min(100, Number(n) || 0));

// ---- Subtle wave bar (unchanged) ----
const WaveBar = ({
  value,
  height = 30,
  start = "#000",
  end = "#000",
  delay = 0,
  bg = "rgba(255,255,255,0.6)",
  border = "#ededed",
}) => {
  const id = useRef(`wave-${Math.random().toString(36).slice(2, 9)}`).current;
  const widthPct = `${clampPct(value)}%`;
  return (
    <Box
      position="relative"
      bg={bg}
      borderRadius="9999px"
      overflow="hidden"
      height={`${height}px`}
      border={`1px solid ${border}`}
      backdropFilter="saturate(120%) blur(4px)"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: widthPct }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", top: 0, left: 0, bottom: 0 }}
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
            opacity="0.9"
          />
          <MotionG
            initial={{ x: 0 }}
            animate={{ x: [-10, 0, -10] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            opacity={0.18}
          >
            <path
              d="M0,18 C10,14 20,22 30,18 S50,14 60,18 S80,22 90,18 S110,14 120,18 L120,30 L0,30 Z"
              fill="#fff"
            />
          </MotionG>
          <MotionG
            initial={{ x: 0 }}
            animate={{ x: [10, 0, 10] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 0.2,
            }}
            opacity={0.12}
          >
            <path
              d="M0,16 C12,12 22,20 32,16 S52,12 62,16 S82,20 92,16 S112,12 122,16 L122,30 L0,30 Z"
              fill="#fff"
            />
          </MotionG>
          <rect
            y="0"
            width="120"
            height="2"
            fill="rgba(255,255,255,0.45)"
            rx="1"
          />
        </Box>
      </motion.div>
    </Box>
  );
};

const CloudTransition = ({
  clonedStep,
  isActive,
  salary,
  salaryProgress,
  stepProgress,
  dailyGoalProgress,
  dailyProgress,
  dailyGoals,
  dailyGoalLabel,
  message,
  detail,
  onContinue,
  children,
}) => {
  const canvasRef = useRef(null);
  const [canContinue, setCanContinue] = useState(false);
  const [displaySalary, setDisplaySalary] = useState(salary);
  const prevSalary = useRef(salary);

  // Chapter key
  const groupKey = useMemo(() => {
    const g = clonedStep?.group ?? clonedStep ?? "tutorial";
    const s = String(g).toLowerCase();
    return s === "0" ? "tutorial" : s;
  }, [clonedStep]);

  const theme = THEMES[groupKey] ?? THEMES.tutorial;

  useEffect(() => {
    if (isActive) {
      setCanContinue(false);
      const id = setTimeout(() => setCanContinue(true), 200);
      return () => clearTimeout(id);
    }
    setCanContinue(false);
  }, [isActive]);

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
          justifyContent={children ? "flex-start" : "center"}
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

                  <br />
                  <br />

                  {/* Salary bar */}
                  <Box w="100%" mx="auto" mb={6}>
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

                  {/* Step progress bar */}
                  <Box w="100%" mx="auto" mb={6}>
                    <Text fontSize="sm" mb={1} color="purple.500">
                      Progress
                    </Text>
                    <WaveBar
                      value={stepProgress}
                      start="#6a11cb"
                      end="#72a2f2"
                      delay={0.1}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>

                  {/* Daily goal bar */}
                  <Box w="100%" mx="auto">
                    <Text fontSize="sm" mb={1} color="purple.500">
                      {dailyGoalLabel} {dailyProgress}/{dailyGoals}
                    </Text>
                    <WaveBar
                      value={dailyGoalProgress}
                      start="#fce09d"
                      end="#fef37b"
                      delay={0}
                      bg="rgba(255,255,255,0.65)"
                      border="#ededed"
                    />
                  </Box>

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
