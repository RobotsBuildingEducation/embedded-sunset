import React, { useEffect, useRef, useState } from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
  "rgba(255,255,255,0.6)", // soft white
  "rgba(224,240,255,0.4)", // powder blue
  "rgba(245,224,255,0.4)", // lavender
  "rgba(255,240,245,0.4)", // pink blush
  "rgba(255,255,224,0.4)", // light gold
];

const MotionBox = motion(Box);

const CloudTransition = ({
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
}) => {
  const canvasRef = useRef(null);
  const [canContinue, setCanContinue] = useState(false);
  const [displaySalary, setDisplaySalary] = useState(salary);
  const prevSalary = useRef(salary);

  // Prevent the click that opens the overlay from immediately
  // triggering the Continue action by enabling the button only
  // after a short delay
  useEffect(() => {
    if (isActive) {
      setCanContinue(false);
      const id = setTimeout(() => setCanContinue(true), 200);
      return () => clearTimeout(id);
    }
    setCanContinue(false);
  }, [isActive]);

  useEffect(() => {
    const start = prevSalary.current || 0;
    const end = salary || 0;
    if (start === end) {
      setDisplaySalary(end);
      return;
    }
    let startTime;
    let frameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 800, 1);
      const value = Math.floor(start + (end - start) * progress);
      setDisplaySalary(value);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        prevSalary.current = end;
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [salary]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const clouds = Array.from({ length: 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 40 + Math.random() * 80,
      speed: 0.4 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#e3f2fd");
      sky.addColorStop(1, "#ffffff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      clouds.forEach((cloud) => {
        const grad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        grad.addColorStop(0, cloud.color);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();

        cloud.y -= cloud.speed;
        if (cloud.y + cloud.radius < 0) {
          cloud.y = height + cloud.radius;
          cloud.x = Math.random() * width;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive]);

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
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            as="canvas"
            ref={canvasRef}
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
          />
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            textAlign="center"
            color="purple.600"
            w="90%"
            maxW="400px"
          >
            {message && (
              <Text
                as={motion.p}
                fontSize="md"
                mt={6}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Text
                  as={motion.p}
                  fontSize="3xl"
                  fontWeight="bold"
                  mb={4}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  color="#05f569"
                >
                  +${displaySalary.toLocaleString()}/yr
                </Text>
                {detail && (
                  <Text
                    as={motion.p}
                    fontSize="sm"
                    mt={2}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {detail}
                  </Text>
                )}
                <br />
                <br />
                <Box w="100%" mx="auto" mb={6}>
                  <Text fontSize="sm" mb={1} color="purple.500">
                    Salary
                  </Text>
                  <Box
                    h="8px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${salaryProgress}%` }}
                      transition={{ duration: 0.6 }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg,#ff7e5f,#feb47b)",
                      }}
                    />
                  </Box>
                </Box>
                <Box w="100%" mx="auto" mb={6}>
                  <Text fontSize="sm" mb={1} color="purple.500">
                    Progress
                  </Text>
                  <Box
                    h="8px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stepProgress}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg,#6a11cb,#2575fc)",
                      }}
                    />
                  </Box>
                </Box>
                <Box w="100%" mx="auto">
                  <Text fontSize="sm" mb={1} color="purple.500">
                    {dailyGoalLabel} {dailyProgress}/{dailyGoals}
                  </Text>
                  <Box
                    h="8px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                    border="1px solid #ededed"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyGoalProgress}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg,#43e97b,#38f9d7)",
                      }}
                    />
                  </Box>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
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
