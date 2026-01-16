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
import { soundManager } from "../utility/soundManager";

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
        color="white"
        {...buttonProps}
        // width="24px"
        // height="30px"
        padding="4px"
        fontSize="14px"
      >
        {isIcon ? null : translation[userLanguage]["settings.theme.select"]}
      </MenuButton>
      <MenuList>
        {colors.map((c, index) => (
          <MenuItem
            key={c}
            onClick={() => {
              soundManager.playColorSwitch(index, colors.length);
              setThemeColor(c);
            }}
          >
            <HStack>
              <Box w={3} h={3} borderRadius="full" bg={bubbleColors[c]} />
              <Text>{translation[userLanguage][`settings.theme.${c}`]}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeMenu;
