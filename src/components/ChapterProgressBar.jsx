import React from "react";
import { Progress, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const progressGradient = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const ChapterProgressBar = ({ value, label }) => (
  <Progress
    value={value}
    aria-label={label}
    height="22px"
    borderRadius="6px"
    border="1px solid"
    borderColor={useColorModeValue("#ececec", "rgba(255, 255, 255, 0.15)")}
    background={useColorModeValue("#f4f4f5", "#1f2937")}
    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.15)"
    width="100%"
    sx={{
      "& > div:first-of-type": {
        background: "linear-gradient(270deg, #f6ad55, #fbd38d, #f6ad55)",
        backgroundSize: "200% 200%",
        animation: `${progressGradient} 20s linear infinite`,
        transitionProperty: "width",
        transitionDuration: "0.8s",
        transitionTimingFunction: "ease-in-out",
        borderRadius: "5px",
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
          transition: "none",
        },
      },
    }}
  />
);

export default ChapterProgressBar;
