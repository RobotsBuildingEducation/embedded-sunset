import React, { useEffect, useRef } from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export const ThinkingOrb = ({ size = 38 }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const colors = isDark
      ? [
          "rgba(168, 85, 247, 0.95)", // purple
          "rgba(236, 72, 153, 0.95)", // pink
          "rgba(96, 165, 250, 0.95)", // blue
          "rgba(251, 146, 60, 0.95)", // orange
        ]
      : [
          "rgba(147, 51, 234, 0.95)", // purple
          "rgba(219, 39, 119, 0.95)", // pink
          "rgba(37, 99, 235, 0.95)",  // blue
          "rgba(234, 88, 12, 0.95)",  // orange
        ];

    const particleCount = 10;
    const particles = Array.from({ length: particleCount }, (_, index) => ({
      x: Math.random() * (size - 8) + 4,
      y: Math.random() * (size - 8) + 4,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 1.6 + 1.2,
      colorIndex: index % colors.length,
      colorOffset: Math.random(),
    }));

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw faint connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = size * 0.48;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.4;
            ctx.strokeStyle = colors[particles[i].colorIndex].replace(
              /[\d.]+\)$/,
              `${alpha})`,
            );
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Keep inside bounds
        const pad = p.radius + 1;
        if (p.x < pad || p.x > size - pad) p.vx *= -1;
        if (p.y < pad || p.y > size - pad) p.vy *= -1;

        const color = colors[p.colorIndex];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [size, isDark]);

  return (
    <MotionBox
      width={`${size}px`}
      height={`${size}px`}
      minW={`${size}px`}
      borderRadius="full"
      position="relative"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      bg={
        isDark
          ? "radial-gradient(circle at 35% 35%, rgba(168,85,247,0.3) 0%, rgba(59,130,246,0.2) 60%, rgba(15,23,42,0.8) 100%)"
          : "radial-gradient(circle at 35% 35%, rgba(244,114,182,0.35) 0%, rgba(168,85,247,0.25) 50%, rgba(243,244,246,0.9) 100%)"
      }
      boxShadow={
        isDark
          ? "0 0 16px rgba(168, 85, 247, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.15)"
          : "0 0 14px rgba(168, 85, 247, 0.3), inset 0 0 6px rgba(255, 255, 255, 0.8)"
      }
      border="1px solid"
      borderColor={isDark ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.3)"}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "block",
          borderRadius: "50%",
        }}
      />
    </MotionBox>
  );
};

export default ThinkingOrb;
