import React, { useCallback, useRef } from "react";
import {
  Button,
  HStack,
  Box,
  Text,
  VStack,
  Switch,
  useColorMode,
  Divider,
} from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { persistThemeMode, useThemeStore } from "../useThemeStore";
import { translation } from "../utility/translation";

const colors = ["purple", "orange", "green", "blue", "pink"];
// Map each color to its base hex so menu swatches don't change with theme
const bubbleColors = {
  purple: "#9f7aea",
  orange: "#ed8936",
  green: "#48bb78",
  blue: "#4299e1",

  pink: "#ed64a6",
};

export const ThemeControls = ({ userLanguage }) => {
  const themeColor = useThemeStore((s) => s.themeColor);
  const setThemeColor = useThemeStore((s) => s.setThemeColor);
  const { colorMode, setColorMode } = useColorMode();
  const lastTouchColorRef = useRef(null);
  const languageKey = userLanguage?.includes("es") ? "es" : "en";
  const copy = {
    en: {
      appearance: "Appearance",
      accents: "Accent color",
    },
    es: {
      appearance: "Apariencia",
      accents: "Color de acento",
    },
  }[languageKey];
  const applyThemeColor = useCallback(
    (color) => {
      setThemeColor(color);
    },
    [setThemeColor],
  );

  return (
    <VStack align="stretch" spacing={4} width="100%">
      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" textTransform="uppercase" color="appTextSubtle">
          {copy.appearance}
        </Text>
        <Box>
          <HStack
            justify="space-between"
            spacing={3}
            borderWidth="1px"
            borderColor="appBorder"
            borderRadius="xl"
            bg="appSurface"
            px={3}
            py={3}
          >
            <Box
              color={colorMode === "light" ? "appText" : "appTextMuted"}
              fontSize="lg"
              lineHeight="1"
            >
              <FaSun />
            </Box>
            <Switch
              isChecked={colorMode === "dark"}
              onChange={(event) => {
                const nextColorMode = event.target.checked ? "dark" : "light";
                setColorMode(nextColorMode);
                persistThemeMode(nextColorMode);
              }}
              colorScheme={themeColor}
              aria-label={copy.appearance}
              size="md"
            />
            <Box
              color={colorMode === "dark" ? "appText" : "appTextMuted"}
              fontSize="lg"
              lineHeight="1"
            >
              <FaMoon />
            </Box>
          </HStack>
        </Box>
      </VStack>
      <Divider borderColor="appBorder" />
      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" textTransform="uppercase" color="appTextSubtle">
          {copy.accents}
        </Text>
        {colors.map((c) => (
          <Button
            key={c}
            variant="ghost"
            justifyContent="stretch"
            borderRadius="xl"
            py={5}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") return;
              lastTouchColorRef.current = c;
              applyThemeColor(c);
            }}
            onClick={() => {
              if (lastTouchColorRef.current === c) {
                lastTouchColorRef.current = null;
                return;
              }
              applyThemeColor(c);
            }}
            style={{ touchAction: "manipulation" }}
          >
            <HStack justify="space-between" width="100%">
              <HStack>
                <Box w={3} h={3} borderRadius="full" bg={bubbleColors[c]} />
                <Text>{translation[userLanguage][`settings.theme.${c}`]}</Text>
              </HStack>
              <Box w={3} h={3} borderRadius="full" bg={bubbleColors[c]} />
            </HStack>
          </Button>
        ))}
      </VStack>
    </VStack>
  );
};
