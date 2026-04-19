import React from "react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuList,
  MenuItem,
  IconButton,
  Button,
  HStack,
  Box,
  Text,
  VStack,
  Switch,
  useColorMode,
} from "@chakra-ui/react";
import { FaMoon, FaPaintBrush, FaSun } from "react-icons/fa";
import { useThemeStore } from "../useThemeStore";
import { ChevronDownIcon } from "@chakra-ui/icons";
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

const ThemeMenu = ({ userLanguage, isIcon = true, buttonProps = {} }) => {
  const themeColor = useThemeStore((s) => s.themeColor);
  const setThemeColor = useThemeStore((s) => s.setThemeColor);
  const { colorMode, setColorMode } = useColorMode();
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

  return (
    <Menu>
      <MenuButton
        as={isIcon ? IconButton : Button}
        aria-label={translation[userLanguage]["settings.theme.select"]}
        icon={<FaPaintBrush padding="4px" fontSize="14px" />}
        variant={"ghost"}
        colorScheme={isIcon ? themeColor : "pink"}
        // m={2}
        rightIcon={isIcon ? undefined : <ChevronDownIcon />}
        color={buttonProps.color}
        // width="24px"
        // height="30px"
        padding="4px"
        fontSize="14px"
        {...buttonProps}
      >
        {isIcon ? null : translation[userLanguage]["settings.theme.select"]}
      </MenuButton>
      <MenuList>
        <VStack align="stretch" spacing={1} px={3} py={1}>
          <Text fontSize="xs" textTransform="uppercase" color="appTextSubtle">
            {copy.appearance}
          </Text>
        </VStack>
        <Box px={3} py={3}>
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
              onChange={(event) =>
                setColorMode(event.target.checked ? "dark" : "light")
              }
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
        <MenuDivider />
        <VStack align="stretch" spacing={1} px={3} py={1}>
          <Text fontSize="xs" textTransform="uppercase" color="appTextSubtle">
            {copy.accents}
          </Text>
        </VStack>
        {colors.map((c) => (
          <MenuItem
            key={c}
            onClick={() => {
              setThemeColor(c);
            }}
          >
            <HStack justify="space-between" width="100%">
              <HStack>
                <Box w={3} h={3} borderRadius="full" bg={bubbleColors[c]} />
                <Text>{translation[userLanguage][`settings.theme.${c}`]}</Text>
              </HStack>
              <Box w={3} h={3} borderRadius="full" bg={bubbleColors[c]} />
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeMenu;
