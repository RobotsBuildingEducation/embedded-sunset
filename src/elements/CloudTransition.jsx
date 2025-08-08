import React, { useEffect, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
  "rgba(255,255,255,0.8)", // soft white
  "rgba(224,240,255,0.6)", // powder blue
  "rgba(245,224,255,0.6)", // lavender
  "rgba(255,240,245,0.6)", // pink blush
  "rgba(255,255,224,0.6)", // light gold
];

const MotionBox = motion(Box);

const CloudTransition = ({
  isActive,
  salary,
  salaryProgress,
  stepProgress,
  message,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const clouds = Array.from({ length: 20 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 80 + Math.random() * 140,
      speed: 0.2 + Math.random() * 0.3,
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
            transition={{ duration: 0.8 }}
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            color="purple.600"
          >
            <>
              <Text
                as={motion.p}
                fontSize="3xl"
                fontWeight="bold"
                mb={4}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                +${salary}/yr
              </Text>
              <Box w="60%" mx="auto" mb={6}>
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
                    transition={{ duration: 1.2 }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg,#FFDEE9,#B5FFFC)",
                    }}
                  />
                </Box>
              </Box>
              <Box w="60%" mx="auto">
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
                    transition={{ duration: 1.2, delay: 0.2 }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg,#C3E4FD,#EFD3FF)",
                    }}
                  />
                </Box>
              </Box>
              {message && (
                <Text fontSize="md" mt={6}>
                  {message}
                </Text>
              )}
            </>
          </MotionBox>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default CloudTransition;

