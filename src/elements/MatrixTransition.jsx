import React from "react";
import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MatrixTransition = ({ isActive }) => {
  if (!isActive) return null;

  const columns = new Array(20).fill(0);

  return (
    <Box
      as={motion.div}
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="black"
      zIndex={2000}
      overflow="hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {columns.map((_, i) => (
        <Box
          as={motion.div}
          key={i}
          position="absolute"
          left={`${(i / columns.length) * 100}%`}
          top="-100%"
          color="#00ff41"
          fontFamily="monospace"
          fontSize="20px"
          whiteSpace="nowrap"
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 1.2, delay: i * 0.1 }}
        >
          {Array(40)
            .fill("01")
            .join("")}
        </Box>
      ))}
    </Box>
  );
};

export default MatrixTransition;
