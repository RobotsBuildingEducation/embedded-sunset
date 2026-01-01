import React, { useRef } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";

const clampPct = (n) => Math.max(0, Math.min(100, Number(n) || 0));
const MotionG = motion.g;

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
  const surfaceBg = useColorModeValue("rgba(255,255,255,0.6)", "rgba(255,255,255,0.08)");
  const surfaceBorder = useColorModeValue("#ededed", "rgba(255,255,255,0.18)");
  const waveFill = useColorModeValue("#fff", "rgba(255,255,255,0.6)");

  return (
    <Box
      position="relative"
      bg={bg || surfaceBg}
      borderRadius="9999px"
      overflow="hidden"
      height={`${height}px`}
      border={`1px solid ${border || surfaceBorder}`}
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
          <rect width="120" height="30" fill={`url(#grad-${id})`} opacity="0.9" />
          <MotionG
            initial={{ x: 0 }}
            animate={{ x: [-10, 0, -10] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay }}
            opacity={0.18}
          >
            <path
              d="M0,18 C10,14 20,22 30,18 S50,14 60,18 S80,22 90,18 S110,14 120,18 L120,30 L0,30 Z"
              fill={waveFill}
            />
          </MotionG>
        </Box>
      </motion.div>
    </Box>
  );
};

export default WaveBar;
