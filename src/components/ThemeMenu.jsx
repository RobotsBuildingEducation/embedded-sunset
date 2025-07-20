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

const colors = ["purple", "orange", "green", "blue", "yellow", "pink"];

const ThemeMenu = ({ userLanguage, isIcon = true, buttonProps = {} }) => {
  const themeColor = useThemeStore((s) => s.themeColor);
  const setThemeColor = useThemeStore((s) => s.setThemeColor);

  return (
    <Menu>
      <MenuButton
        as={isIcon ? IconButton : Button}
        aria-label={translation[userLanguage]["settings.theme.select"]}
        icon={<FaPaintBrush />}
        variant={isIcon ? "outline" : "solid"}
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
              <Box w={3} h={3} borderRadius="full" bg={`${c}.400`} />
              <Text>{translation[userLanguage][`settings.theme.${c}`]}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeMenu;
