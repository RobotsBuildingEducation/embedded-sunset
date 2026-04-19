import create from "zustand";
import { doc, setDoc } from "firebase/firestore";
import { database } from "./database/firebaseResources";

export const themeColors = ["purple", "orange", "green", "blue", "pink"];
export const themeModes = ["light", "dark"];

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

export const normalizeThemeColor = (color, fallback = "orange") =>
  themeColors.includes(color) ? color : fallback;

export const normalizeThemeMode = (mode, fallback = "light") =>
  themeModes.includes(mode) ? mode : fallback;

export const getLocalThemeMode = () => {
  if (typeof window === "undefined") return "light";
  return normalizeThemeMode(
    localStorage.getItem("chakra-ui-color-mode") ||
      localStorage.getItem("themeMode"),
  );
};

export const getLocalThemeColor = () => {
  if (typeof window === "undefined") return "orange";
  return normalizeThemeColor(localStorage.getItem("themeColor"));
};

const persistUserTheme = async (updates) => {
  if (typeof window === "undefined") return;

  const npub = localStorage.getItem("local_npub");
  if (!npub) return;

  try {
    const userDoc = doc(database, "users", npub);
    await setDoc(userDoc, updates, { merge: true });
  } catch (e) {
    console.error("Failed to update theme", e);
  }
};

const applyTheme = (color) => {
  if (typeof document === "undefined") return;

  if (color === "pink") {
    // Remove overrides so default pink values are restored
    shades.forEach((s) =>
      document.documentElement.style.removeProperty(
        `--chakra-colors-pink-${s}`,
      ),
    );
    document.documentElement.style.removeProperty("--chakra-colors-pink");
    return;
  }

  shades.forEach((s) => {
    document.documentElement.style.setProperty(
      `--chakra-colors-pink-${s}`,
      `var(--chakra-colors-${color}-${s})`,
    );
  });
  document.documentElement.style.setProperty(
    "--chakra-colors-pink",
    `var(--chakra-colors-${color})`,
  );
};

const hydrateThemeColor = (color) => {
  const themeColor = normalizeThemeColor(color);
  localStorage.setItem("themeColor", themeColor);
  applyTheme(themeColor);
  return themeColor;
};

export const persistThemeMode = async (mode) => {
  if (typeof window === "undefined") return;

  const colorMode = normalizeThemeMode(mode);
  localStorage.setItem("chakra-ui-color-mode", colorMode);
  localStorage.setItem("themeMode", colorMode);
  await persistUserTheme({ colorMode, themeMode: colorMode });
};

export const applyUserThemePreferences = (userData, setColorMode) => {
  if (!userData) return;

  if (themeColors.includes(userData.themeColor)) {
    useThemeStore.getState().hydrateThemeColor(userData.themeColor);
  }

  const savedMode = userData.colorMode || userData.themeMode;
  if (themeModes.includes(savedMode)) {
    localStorage.setItem("chakra-ui-color-mode", savedMode);
    localStorage.setItem("themeMode", savedMode);
    setColorMode(savedMode);
  }
};

export const useThemeStore = create((set) => ({
  themeColor: getLocalThemeColor(),
  hydrateThemeColor: (color) => {
    const themeColor = hydrateThemeColor(color);
    set({ themeColor });
  },
  setThemeColor: async (color) => {
    const themeColor = hydrateThemeColor(color);
    set({ themeColor });
    await persistUserTheme({ themeColor });
  },
}));

// Apply saved theme on load
applyTheme(getLocalThemeColor());
