import React, { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
  "rgba(255,215,0,0.6)", // gold
  "rgba(255,105,180,0.6)", // pink
  "rgba(186,85,211,0.6)", // purple
  "rgba(255,165,0,0.6)", // orange
  "rgba(255,140,0,0.6)", // sunset orange
];

const CloudTransition = ({ isActive }) => {
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
      radius: 60 + Math.random() * 120,
      speed: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      ctx.fillStyle = "#FFFFFF";
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
          as={motion.canvas}
          ref={canvasRef}
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          zIndex={2000}
          bg="transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );
};

export default CloudTransition;

