import styled from "styled-components";

export const CopyButton = styled.button`
  /* default styles */
  background-color: transparent;
  width: fit-content;
  margin-bottom: 16px;

  border: 1px solid rgba(0, 0, 0, 0.05);
  &:hover {
    /* hover styles */
    background-color: white;
  }
`;

export const StyledTreeNode = styled.div`
  position: relative;
  margin-left: 20px;

  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: -20px;
    border-top: 2px solid #0099ff;
    width: 20px;
    height: 0;
  }
`;

export const TreeNodeButton = styled.button`
  display: inline-block;
  margin-top: 5px;
  cursor: pointer;
  background-color: #004466;
  border: 1px solid #00ff99;
  border-radius: 5px;
  padding: 5px 10px;
  color: white;

  &:hover {
    background-color: #002244;
  }
`;

export let colorPalette = {
  // CherryBlossomPink: "#FFB7C5", // Cherry Blossom
  KyotoPurple: "#663399", // Sweet Potato Purple
  FujiSanBlue: "#6f97d3", // Mount Fuji Blue
  TokyoTwilight: "#706fd3", // Twilight in Tokyo
  // SakuraMochiPink: "#FF92A9", // Sakura Mochi
  WisteriaPurple: "#89729E", // Wisteria Flower
  GoldenAccent: "#bf8902", // Gold in Japanese Art
  WoodenArchitectureBrown: "#d3a86f", // Japanese Wood Architecture
  BambooForestGreen: "#4aa89c", // Bamboo Forest
  DeepCherryBlossomPink: "#C71585", // Deep Cherry Blossom
  ProsperityEmeraldGreen: "#31d660", // Symbol of Wealth
  StrongRed: "#DC143C", // Japanese Flag Red
  PhthaloBluePurple: "#000f89", // Indigo Blue Textile
  DarkMetallicSilver: "#5A5A5A", // Darkened Steel Samurai Sword
  // Lavender: "rgba(220,205,255, 1)",
  PowerPurple: "rgba(102, 3, 252, 1)",
  PowerPink: "#f7059d",
  OrangeGold: "#FFD68B",
  CobaltBlue: "#0044B0",
  iphoneBlue: "2C2C2E",
  roxPink: "",
  themePurple: "4003ba",
  chill: "#003c94",
};

// opinionated
export let decoratedContainer = (
  backgroundColor,
  shadowSize = 4,
  borderRadius = 4,
  color = "white",
  boxShadow = "0px 0px 0px 0px rgba(0,0,0, 1)",
  padding = 16
) => {
  return {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    padding: padding,
    textShadow: `${shadowSize}px ${shadowSize}px ${shadowSize || 6}px black`,
    color: color,
    boxShadow: boxShadow,
  };
};

export const responsiveBox = {
  width: "100%",
  maxWidth: 700,
};
