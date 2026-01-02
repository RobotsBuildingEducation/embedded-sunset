import React from "react";
import { motion } from "framer-motion";
import { useThemeStore } from "../../useThemeStore";

// Map theme colors to RGB values
const themeColorMap = {
  purple: { r: 159, g: 122, b: 234 }, // #9f7aea
  orange: { r: 237, g: 137, b: 54 }, // #ed8936
  green: { r: 72, g: 187, b: 120 }, // #48bb78
  blue: { r: 66, g: 153, b: 225 }, // #4299e1
  pink: { r: 237, g: 100, b: 166 }, // #ed64a6
};

/**
 * AnimatedBackground - A beautiful animated background with gradient orbs and subtle grid
 * Uses the user's selected theme color for accents
 */
const AnimatedBackground = () => {
  const themeColor = useThemeStore((state) => state.themeColor);
  const rgb = themeColorMap[themeColor] || themeColorMap.orange;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Base gradient - light theme */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 90%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06) 0%, transparent 90%),
            radial-gradient(ellipse 50% 30% at 10% 80%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 0%, transparent 90%),
            linear-gradient(to bottom, #F8F5F0 0%, #FAF8F5 50%, #F8F5F0 100%)
          `,
        }}
      />

      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
      />

      {/* Grid overlay - themed */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)",
        }}
      />

      {/* Noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.015,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
