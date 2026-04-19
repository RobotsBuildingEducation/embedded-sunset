import { useColorMode } from "@chakra-ui/react";
import { useEffect } from "react";

export const ThemeInitializer = () => {
  const { colorMode } = useColorMode();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = colorMode;
    root.dataset.themeMode = colorMode;
    root.style.colorScheme = colorMode;
  }, [colorMode]);

  return null;
};
