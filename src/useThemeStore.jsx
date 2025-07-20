import create from "zustand";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "./database/firebaseResources";

const shades = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];
const colorMap = {
  black: "blackAlpha",
  white: "whiteAlpha",
};

const applyTheme = (color) => {
  if (color === "pink") {
    // Remove overrides so default pink values are restored
    shades.forEach((s) =>
      document.documentElement.style.removeProperty(
        `--chakra-colors-pink-${s}`
      )
    );
    document.documentElement.style.removeProperty("--chakra-colors-pink");
    return;
  }

  const target = colorMap[color] || color;

  shades.forEach((s) => {
    document.documentElement.style.setProperty(
      `--chakra-colors-pink-${s}`,
      `var(--chakra-colors-${target}-${s})`
    );
  });
  document.documentElement.style.setProperty(
    "--chakra-colors-pink",
    `var(--chakra-colors-${target})`
  );
};

export const useThemeStore = create((set) => ({
  themeColor: localStorage.getItem("themeColor") || "pink",
  setThemeColor: async (color) => {
    set({ themeColor: color });
    localStorage.setItem("themeColor", color);
    applyTheme(color);
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      try {
        const userDoc = doc(database, "users", npub);
        await updateDoc(userDoc, { themeColor: color });
      } catch (e) {
        console.error("Failed to update theme", e);
      }
    }
  },
}));

// Apply saved theme on load
applyTheme(localStorage.getItem("themeColor") || "pink");
