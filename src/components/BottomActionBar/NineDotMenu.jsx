import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  useToken,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSettingsOutline } from "react-icons/io5";
import { FaBitcoin } from "react-icons/fa";
import { PiClockCountdownFill, PiPatreonLogoFill } from "react-icons/pi";
import { RiCodeAiFill } from "react-icons/ri";
import { useThemeStore } from "../../useThemeStore";

const MotionBox = motion(Box);

export const NineDotMenu = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenBitcoin,
  onOpenSelfPaced,
  onOpenHelper,
  onOpenPatreon,
  userLanguage = "en",
  translation = {},
}) => {
  const themeColor = useThemeStore((state) => state.themeColor);

  const [theme50, theme100, theme200, theme300, theme400, theme500, theme600] = useToken(
    "colors",
    [
      `${themeColor}.50`,
      `${themeColor}.100`,
      `${themeColor}.200`,
      `${themeColor}.300`,
      `${themeColor}.400`,
      `${themeColor}.500`,
      `${themeColor}.600`,
    ],
  );

  const themeIconColor = useColorModeValue(
    theme600 || "#d946ef",
    theme300 || "#f0abfc",
  );
  const themeIconBg = useColorModeValue(
    theme50 || "rgba(236, 72, 153, 0.08)",
    "rgba(255, 255, 255, 0.06)",
  );
  const themeIconBorder = useColorModeValue(
    theme200 || "rgba(236, 72, 153, 0.22)",
    "rgba(255, 255, 255, 0.12)",
  );

  const menuBg = useColorModeValue("appSurfaceElevated", "#131b2e");
  const menuBorder = useColorModeValue("appBorderStrong", "rgba(148, 163, 184, 0.2)");
  const itemHoverBg = useColorModeValue(
    theme50 || "appSurfaceMuted",
    "rgba(255, 255, 255, 0.06)",
  );
  const itemActiveBg = useColorModeValue("appSurfaceInset", "rgba(255, 255, 255, 0.1)");
  const menuShadow = useColorModeValue(
    "0 18px 40px rgba(15, 23, 42, 0.14)",
    "0 20px 45px rgba(2, 6, 23, 0.55)",
  );

  const menuItems = [
    {
      id: "settings",
      label: translation[userLanguage]?.["settings.title"] || "Settings",
      icon: <IoSettingsOutline fontSize="20px" color={themeIconColor} />,
      onClick: onOpenSettings,
    },
    {
      id: "bitcoin",
      label:
        userLanguage?.startsWith("es")
          ? "Billetera"
          : translation[userLanguage]?.["settings.button.bitcoinMode"] || "Wallet",
      icon: <FaBitcoin fontSize="20px" color={themeIconColor} />,
      onClick: onOpenBitcoin,
    },
    {
      id: "selfPaced",
      label:
        userLanguage?.startsWith("es")
          ? "A tu ritmo"
          : "Self-pace",
      icon: <PiClockCountdownFill fontSize="20px" color={themeIconColor} />,
      onClick: onOpenSelfPaced,
    },
    {
      id: "helper",
      label:
        userLanguage?.startsWith("es")
          ? "Crea tu app"
          : "Build your app",
      icon: <RiCodeAiFill fontSize="20px" color={themeIconColor} />,
      onClick: onOpenHelper,
    },
    {
      id: "patreon",
      label:
        userLanguage?.startsWith("es")
          ? "Tutorial para crear tu app"
          : "App Building Tutorial",
      icon: <PiPatreonLogoFill fontSize="20px" color={themeIconColor} />,
      onClick: onOpenPatreon,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for click outside */}
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={1400}
            onClick={onClose}
          />

          {/* Floating popover menu */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            position="absolute"
            bottom="calc(100% + 12px)"
            left={{ base: "8px", md: "0" }}
            zIndex={1500}
            bg={menuBg}
            border="1px solid"
            borderColor={menuBorder}
            borderRadius="24px"
            boxShadow={menuShadow}
            p={2.5}
            minW="260px"
            maxW="320px"
          >
            <VStack spacing={1} align="stretch">
              {menuItems.map((item) => (
                <HStack
                  key={item.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    onClose();
                    item.onClick();
                  }}
                  p={2}
                  borderRadius="16px"
                  transition="all 0.15s ease"
                  _hover={{ bg: itemHoverBg, transform: "translateX(2px)" }}
                  _active={{ bg: itemActiveBg, transform: "translateX(0)" }}
                  width="100%"
                  textAlign="left"
                  cursor="pointer"
                  outline="none"
                >
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="13px"
                    bg={themeIconBg}
                    border="1px solid"
                    borderColor={themeIconBorder}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color={themeIconColor}
                    flexShrink={0}
                    boxShadow="0 2px 6px rgba(0, 0, 0, 0.04)"
                  >
                    {item.icon}
                  </Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="appText"
                    noOfLines={1}
                  >
                    {item.label}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  );
};

export default NineDotMenu;
