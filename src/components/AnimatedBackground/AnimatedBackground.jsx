import React from "react";
import { motion } from "framer-motion";
import { useColorMode } from "@chakra-ui/react";
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
  const { colorMode } = useColorMode();
  const rgb = themeColorMap[themeColor] || themeColorMap.orange;
  const isMidnight = colorMode === "dark";

  const baseBackground = isMidnight
    ? `
      radial-gradient(ellipse 85% 65% at 50% -20%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 85%),
      radial-gradient(circle at 18% 20%, rgba(96, 165, 250, 0.05) 0%, transparent 35%),
      radial-gradient(circle at 82% 12%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.055) 0%, transparent 38%),
      radial-gradient(circle at 78% 82%, rgba(168, 85, 247, 0.03) 0%, transparent 42%),
      linear-gradient(180deg, #040814 0%, #091123 42%, #0b1730 100%)
    `
    : `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 90%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06) 0%, transparent 90%),
      radial-gradient(ellipse 50% 30% at 10% 80%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 0%, transparent 90%),
      linear-gradient(to bottom, #F8F5F0 0%, #FAF8F5 50%, #F8F5F0 100%)
    `;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Base gradient - light theme */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: baseBackground,
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
          background: `radial-gradient(circle, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${
            isMidnight ? 0.06 : 0.12
          }) 0%, transparent 70%)`,
          filter: `blur(${isMidnight ? 84 : 60}px)`,
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
          background: `radial-gradient(circle, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${
            isMidnight ? 0.045 : 0.1
          }) 0%, transparent 70%)`,
          filter: `blur(${isMidnight ? 72 : 50}px)`,
        }}
      />

      {/* Grid overlay - themed */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isMidnight ? 0.08 : 0.1}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isMidnight ? 0.08 : 0.1}) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)",
          opacity: isMidnight ? 0.8 : 1,
        }}
      />

      {/* Noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: isMidnight ? 0.03 : 0.015,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {isMidnight && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 12% 18%, rgba(255,255,255,0.65) 0 1px, transparent 1.5px),
              radial-gradient(circle at 24% 72%, rgba(255,255,255,0.45) 0 1px, transparent 1.5px),
              radial-gradient(circle at 56% 28%, rgba(255,255,255,0.55) 0 1px, transparent 1.5px),
              radial-gradient(circle at 78% 20%, rgba(255,255,255,0.5) 0 1px, transparent 1.5px),
              radial-gradient(circle at 88% 64%, rgba(255,255,255,0.45) 0 1px, transparent 1.5px)
            `,
            opacity: 0.55,
          }}
        />
      )}
    </div>
  );
};

export default AnimatedBackground;
