import React, { useEffect, useRef, useState } from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
  "rgba(255,255,255,0.3)", // soft white
  "rgba(224,240,255,0.25)", // powder blue
  "rgba(245,224,255,0.25)", // lavender
  "rgba(255,240,245,0.25)", // pink blush
  "rgba(255,255,224,0.25)", // light gold
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

  // Prevent the click that opens the overlay from immediately
  // triggering the Continue action by enabling the button only
  // after a short delay
  useEffect(() => {
    if (isActive) {
      setCanContinue(false);
      const id = setTimeout(() => setCanContinue(true), 100);
      return () => clearTimeout(id);
    }
    setCanContinue(false);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const clouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 20 + Math.random() * 40,
      speed: 0.6 + Math.random() * 0.6,
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            textAlign="center"
            color="purple.600"
            w="90%"
            maxW="400px"
          >
            {message && (
              <Text
                as={motion.p}
                fontSize="sm"
                mt={4}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Text
                  as={motion.p}
                  fontSize="2xl"
                  fontWeight="bold"
                  mb={2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  +${salary}/yr
                </Text>
                {detail && (
                  <Text
                    as={motion.p}
                    fontSize="sm"
                    mt={1}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {detail}
                  </Text>
                )}
                <Box w="100%" mx="auto" my={4}>
                  <Text fontSize="sm" mb={1} color="purple.500">
                    Salary
                  </Text>
                  <Box
                    h="8px"
                    bg="whiteAlpha.600"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${salaryProgress}%` }}
                      transition={{ duration: 0.3 }}
                      style={{
                        height: "100%",
                        backgroundColor: "#E9D8FD",
                      }}
                    />
                  </Box>
                </Box>
                <Box w="100%" mx="auto" mb={4}>
                  <Text fontSize="sm" mb={1} color="purple.500">
                    Progress
                  </Text>
                  <Box
                    h="8px"
                    bg="whiteAlpha.600"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stepProgress}%` }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      style={{
                        height: "100%",
                        backgroundColor: "#BEE3F8",
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
                    bg="whiteAlpha.600"
                    borderRadius="full"
                    overflow="hidden"
                    border="1px solid #ededed"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyGoalProgress}%` }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      style={{
                        height: "100%",
                        backgroundColor: "#FEEBC8",
                      }}
                    />
                  </Box>
                </Box>
                {message}
              </Text>
            )}

            <Button
              as={motion.button}
              mt={6}
              colorScheme="purple"
              variant="outline"
              borderRadius="full"
              px={6}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
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
