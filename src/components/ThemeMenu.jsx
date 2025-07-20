import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Button,
  HStack,
  Box,
  Text,
} from "@chakra-ui/react";
import { FaPaintBrush } from "react-icons/fa";
import { useThemeStore } from "../useThemeStore";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { translation } from "../utility/translation";

const colors = [
  "purple",
  "orange",
  "green",
  "blue",
  "yellow",
  "pink",
  "black",
  "white",
];
// Map each color to its base hex so menu swatches don't change with theme
const bubbleColors = {
  purple: "#9f7aea",
  orange: "#ed8936",
  green: "#48bb78",
  blue: "#4299e1",
  yellow: "#ecc94b",
  pink: "#ed64a6",
  black: "#000",
  white: "#fff",
};

const ThemeMenu = ({ userLanguage, isIcon = true, buttonProps = {} }) => {
  const themeColor = useThemeStore((s) => s.themeColor);
  const setThemeColor = useThemeStore((s) => s.setThemeColor);

  return (
    <Menu>
      <MenuButton
        as={isIcon ? IconButton : Button}
        aria-label={translation[userLanguage]["settings.theme.select"]}
        icon={<FaPaintBrush />}
        variant={isIcon ? "ghost" : "solid"}
        colorScheme={isIcon ? themeColor : "pink"}
        // m={2}
        rightIcon={isIcon ? undefined : <ChevronDownIcon />}
        {...buttonProps}
      >
        {isIcon ? null : translation[userLanguage]["settings.theme.select"]}
      </MenuButton>
      <MenuList>
        {colors.map((c) => (
          <MenuItem
            key={c}
            onClick={() => {
              console.log("color...", c);
              setThemeColor(c);
            }}
          >
            <HStack>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={bubbleColors[c]}
                border={c === "white" ? "1px solid #aaa" : undefined}
              />
              <Text>{translation[userLanguage][`settings.theme.${c}`]}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeMenu;
