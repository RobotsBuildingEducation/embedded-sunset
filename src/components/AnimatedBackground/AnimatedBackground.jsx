import React from "react";
import { motion } from "framer-motion";

/**
 * AnimatedBackground - A beautiful animated background with gradient orbs and subtle grid
 * Used as the global background for the entire app
 */
const AnimatedBackground = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    {/* Base gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(14, 165, 233, 0.1) 0%, transparent 40%),
          radial-gradient(ellipse 50% 30% at 10% 80%, rgba(167, 139, 250, 0.08) 0%, transparent 40%),
          linear-gradient(to bottom, #030712 0%, #0f172a 50%, #030712 100%)
        `,
      }}
    />

    {/* Animated orbs */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)`,
        filter: "blur(60px)",
      }}
    />
    <motion.div
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.2, 0.4, 0.2],
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
        background: `radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)`,
        filter: "blur(50px)",
      }}
    />

    {/* Grid overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(20, 184, 166, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20, 184, 166, 0.03) 1px, transparent 1px)
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
        opacity: 0.02,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

export default AnimatedBackground;
