import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Box,
} from "@chakra-ui/react";
import { FaPaintBrush } from "react-icons/fa";
import { useThemeStore } from "../useThemeStore";

const colors = ["purple", "orange", "green", "blue"];

const ThemeMenu = () => {
  const themeColor = useThemeStore((s) => s.themeColor);
  const setThemeColor = useThemeStore((s) => s.setThemeColor);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Choose theme"
        icon={<FaPaintBrush />}
        variant="outline"
        colorScheme={themeColor}
        m={2}
      />
      <MenuList>
        {colors.map((c) => (
          <MenuItem key={c} onClick={() => setThemeColor(c)}>
            <HStack>
              <Box w={3} h={3} borderRadius="full" bg={`${c}.400`} />
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeMenu;
