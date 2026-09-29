export const COLOR_PALETTES = {
  sunset: {
    name: "Sunset Glow",
    description: "Warm coral, amber, and crimson tones",
    colors: ["#F97316", "#EF4444", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6", "#FB923C", "#E11D48"],
  },
  ocean: {
    name: "Ocean Depths",
    description: "Cool blues, cyans, and emerald greens",
    colors: ["#0284C7", "#06B6D4", "#3B82F6", "#10B981", "#6366F1", "#14B8A6", "#0EA5E9", "#2563EB"],
  },
  cyber: {
    name: "Cyber Neon",
    description: "High-voltage purple, pink, and bright cyan",
    colors: ["#8B5CF6", "#D946EF", "#06B6D4", "#F43F5E", "#10B981", "#EAB308", "#A855F7", "#38BDF8"],
  },
  forest: {
    name: "Botanical Forest",
    description: "Earthy moss, olive, and warm ochre",
    colors: ["#10B981", "#059669", "#84CC16", "#14B8A6", "#D97706", "#B45309", "#15803D", "#4D7C0F"],
  },
  berry: {
    name: "Velvet Berry",
    description: "Rich plum, wine, and rose hues",
    colors: ["#BE185D", "#9333EA", "#E11D48", "#C026D3", "#7C3AED", "#DB2777", "#A21CAF", "#F43F5E"],
  },
  pastel: {
    name: "Pastel Dream",
    description: "Soft lavender, mint, buttercup, and peach",
    colors: ["#93C5FD", "#A7F3D0", "#FDE68A", "#FBCFE8", "#DDD6FE", "#FED7AA", "#BAE6FD", "#C7D2FE"],
  },
  slate: {
    name: "Midnight Slate",
    description: "Clean modern slates and graphite",
    colors: ["#475569", "#64748B", "#334155", "#0EA5E9", "#6366F1", "#94A3B8", "#1E293B", "#38BDF8"],
  },
  citrus: {
    name: "Tropical Citrus",
    description: "Sunny mango, lime, and tangerine",
    colors: ["#F59E0B", "#84CC16", "#FB923C", "#10B981", "#E11D48", "#FBBF24", "#65A30D", "#EA580C"],
  },
};

export const SWATCH_COLORS = [
  // Warm Reds & Oranges
  "#EF4444", "#F87171", "#F97316", "#FB923C", "#EA580C",
  // Yellows & Ambers
  "#F59E0B", "#FBBF24", "#EAB308", "#FDE047",
  // Greens & Teals
  "#10B981", "#34D399", "#059669", "#84CC16", "#14B8A6", "#2DD4BF",
  // Blues & Cyans
  "#06B6D4", "#0EA5E9", "#3B82F6", "#60A5FA", "#2563EB", "#1D4ED8",
  // Purples & Violets
  "#6366F1", "#8B5CF6", "#A855F7", "#7C3AED", "#9333EA",
  // Pinks & Magentas
  "#EC4899", "#F43F5E", "#D946EF", "#FB7185", "#BE185D",
  // Neutrals / Slates
  "#64748B", "#475569", "#334155", "#94A3B8",
];

export const getNextColor = (index, paletteKey = "sunset") => {
  const palette = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.sunset;
  return palette.colors[index % palette.colors.length];
};
