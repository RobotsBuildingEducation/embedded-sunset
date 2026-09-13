import React, { useEffect, useRef } from "react";
import {
  Box,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
  useToken,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSettingsOutline, IoClose, IoArrowBackOutline } from "react-icons/io5";
import { FaBitcoin } from "react-icons/fa";
import { PiClockCountdownFill, PiPatreonLogoFill } from "react-icons/pi";
import { RiCodeAiFill } from "react-icons/ri";
import { useThemeStore } from "../useThemeStore";

const MotionBox = motion(Box);

/**
 * useMenuSwipeDismiss
 *
 * Hardware-accelerated drag-to-dismiss gesture hook.
 * Directly mutates DOM transforms without triggering React re-renders,
 * locks body scrolling via data-attribute, prevents touchmove pulling,
 * and dismisses cleanly with zero bounce.
 */
export function useMenuSwipeDismiss({ isOpen, onClose }) {
  const cardRef = useRef(null);
  const backdropRef = useRef(null);
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
    hasActivated: false,
    lastY: 0,
    lastTime: 0,
    velocityY: 0,
    isHandle: false,
    pointerId: null,
  });
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      document.documentElement.removeAttribute("data-activity-menu-open");
      document.body.removeAttribute("data-activity-menu-open");
      if (cardRef.current) {
        cardRef.current.style.transform = "";
        cardRef.current.style.transition = "";
      }
      if (backdropRef.current) {
        backdropRef.current.style.opacity = "";
        backdropRef.current.style.transition = "";
      }
      isClosingRef.current = false;
      return;
    }

    document.documentElement.setAttribute("data-activity-menu-open", "true");
    document.body.setAttribute("data-activity-menu-open", "true");

    const handleTouchMove = (e) => {
      if (gestureRef.current?.hasActivated) {
        e.preventDefault();
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.documentElement.removeAttribute("data-activity-menu-open");
      document.body.removeAttribute("data-activity-menu-open");
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen]);

  const onPointerDown = (e) => {
    // Skip gesture tracking if close button was pressed
    if (e.target.closest?.("button[aria-label='Close menu']")) {
      return;
    }

    const isHandle = Boolean(e.target.closest?.("[data-drag-handle='true']"));
    const card = cardRef.current;

    // If dragging the card body (not handle), only activate if scrolled to top
    if (!isHandle && card && card.scrollTop > 0) {
      return;
    }

    gestureRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      isDragging: false,
      hasActivated: false,
      lastY: e.clientY,
      lastTime: Date.now(),
      velocityY: 0,
      isHandle,
      pointerId: e.pointerId,
    };
  };

  const onPointerMove = (e) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;

    const deltaX = Math.abs(e.clientX - g.startX);
    const deltaY = e.clientY - g.startY;

    const card = cardRef.current;
    const backdrop = backdropRef.current;
    if (!card) return;

    if (g.isDragging) {
      const now = Date.now();
      const dt = Math.max(1, now - g.lastTime);
      g.velocityY = (e.clientY - g.lastY) / dt;
      g.lastY = e.clientY;
      g.lastTime = now;

      const offsetY = Math.max(0, deltaY);
      card.style.transform = `translateY(${offsetY}px)`;
      card.style.transition = "none";
      if (backdrop) {
        backdrop.style.opacity = String(Math.max(0.1, 1 - offsetY / 240));
        backdrop.style.transition = "none";
      }
      return;
    }

    // Only activate on downward drag
    if (deltaY <= 0) return;

    // Directional Ratio Guard: vertical must exceed horizontal by > 1.15
    if (deltaY <= deltaX * 1.15) return;

    // Threshold detection (10px for pill handle, 14px for card body)
    const threshold = g.isHandle ? 10 : 14;
    if (deltaY > threshold) {
      g.hasActivated = true;
      g.isDragging = true;
      try {
        card.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  const endDrag = (e) => {
    const g = gestureRef.current;
    if (!g) return;

    const card = cardRef.current;
    const backdrop = backdropRef.current;

    if (g.isDragging && card) {
      try {
        if (card.hasPointerCapture?.(e.pointerId)) {
          card.releasePointerCapture?.(e.pointerId);
        }
      } catch (_) {}

      const offsetY = Math.max(0, e.clientY - g.startY);
      const isDismiss = offsetY > 90 || g.velocityY > 0.45;

      if (isDismiss) {
        // Zero-bounce dismissal: keep current offset and invoke onClose
        isClosingRef.current = true;
        onClose();
      } else {
        // Smooth spring snap-back
        card.style.transition = "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
        card.style.transform = "translateY(0)";
        if (backdrop) {
          backdrop.style.transition = "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
          backdrop.style.opacity = "1";
        }
      }
    }

    gestureRef.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isDragging: false,
      hasActivated: false,
      lastY: 0,
      lastTime: 0,
      velocityY: 0,
      isHandle: false,
      pointerId: null,
    };
  };

  return {
    cardRef,
    backdropRef,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}

/**
 * ActivityMenu
 *
 * Implements the Liquid Glass Bento box surface and drag-to-dismiss
 * gesture system specified in ACTIVITY_MENU_DESIGN_AND_GESTURES.md.
 */
export const ActivityMenu = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenBitcoin,
  onOpenSelfPaced,
  onOpenHelper,
  onOpenPatreon,
  onExitLesson,
  userLanguage = "en",
  translation = {},
}) => {
  const themeColor = useThemeStore((state) => state.themeColor);

  const [theme50, theme100, theme200, theme300, theme500, theme600] = useToken(
    "colors",
    [
      `${themeColor}.50`,
      `${themeColor}.100`,
      `${themeColor}.200`,
      `${themeColor}.300`,
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

  // Liquid Glass Material Tokens
  const cardBg = useColorModeValue(
    "rgba(247, 243, 237, 0.94)",
    "rgba(26, 26, 26, 0.94)",
  );
  const cardBorder = useColorModeValue(
    "rgba(180, 164, 144, 0.65)",
    "rgba(255, 255, 255, 0.16)",
  );
  const cardShadow = useColorModeValue(
    "0 20px 50px rgba(15, 23, 42, 0.18)",
    "0 24px 60px rgba(2, 6, 23, 0.65)",
  );

  // Bento Tile Tokens
  const tileBg = useColorModeValue(
    "rgba(255, 255, 255, 0.72)",
    "rgba(255, 255, 255, 0.05)",
  );
  const tileBorder = useColorModeValue(
    "rgba(180, 164, 144, 0.35)",
    "rgba(255, 255, 255, 0.08)",
  );
  const tileHoverBg = useColorModeValue(
    "rgba(255, 255, 255, 0.96)",
    "rgba(255, 255, 255, 0.09)",
  );
  const dragHandleBg = useColorModeValue(
    "rgba(180, 164, 144, 0.7)",
    "rgba(255, 255, 255, 0.3)",
  );

  const {
    cardRef,
    backdropRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useMenuSwipeDismiss({ isOpen, onClose });

  const bentoGridItems = [
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
      label: userLanguage?.startsWith("es") ? "A tu ritmo" : "Self-pace",
      icon: <PiClockCountdownFill fontSize="20px" color={themeIconColor} />,
      onClick: onOpenSelfPaced,
    },
    {
      id: "helper",
      label: userLanguage?.startsWith("es") ? "Crea tu app" : "Build your app",
      icon: <RiCodeAiFill fontSize="20px" color={themeIconColor} />,
      onClick: onOpenHelper,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (z-index: 1390) */}
          <Box
            ref={backdropRef}
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={1390}
            bg="rgba(0, 0, 0, 0.4)"
            onClick={onClose}
          />

          {/* Floating Liquid Glass Bento Card (z-index: 1500) */}
          <MotionBox
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            position="absolute"
            bottom="calc(100% + 12px)"
            left="0"
            right="0"
            width="100%"
            maxW={{ base: "100%", sm: "460px", md: "500px" }}
            margin="0 auto"
            zIndex={1500}
            bg={cardBg}
            backdropFilter="blur(24px) saturate(180%)"
            WebkitBackdropFilter="blur(24px) saturate(180%)"
            border="2px solid"
            borderColor={cardBorder}
            borderRadius={{ base: "24px", sm: "28px" }}
            boxShadow={cardShadow}
            p={{ base: 3, sm: 3.5 }}
            maxH="min(580px, calc(100dvh - 96px))"
            overflowY="auto"
            touchAction="pan-y"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {/* Header: Centered Pill Handle & Close 'X' Button */}
            <Box
              minH="32px"
              pt={{ base: 1.5, sm: 2 }}
              pb={{ base: 3.5, sm: 4 }}
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Centered Pill Drag Handle (48px × 5px) */}
              <Box
                w="48px"
                h="5px"
                borderRadius="full"
                bg={dragHandleBg}
                data-drag-handle="true"
                cursor="grab"
                _active={{ cursor: "grabbing" }}
              />

              {/* Close Button (32px × 32px) */}
              <IconButton
                aria-label="Close menu"
                icon={<IoClose fontSize="16px" />}
                size="sm"
                position="absolute"
                right="0"
                top="50%"
                transform="translateY(-50%)"
                w="32px"
                h="32px"
                minW="32px"
                borderRadius="full"
                variant="ghost"
                color="appText"
                _hover={{ bg: "appSurfaceMuted" }}
                _active={{ bg: "appSurfaceInset" }}
                onClick={onClose}
              />
            </Box>

            {/* Top Full-Width Row: Exit Lesson (when in lesson) */}
            {onExitLesson && (
              <HStack
                as="button"
                type="button"
                w="100%"
                mb={{ base: 2, sm: 2.5 }}
                p={3}
                borderRadius="18px"
                bg={tileBg}
                border="1px solid"
                borderColor={tileBorder}
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{ bg: tileHoverBg, transform: "translateY(-1px)" }}
                _active={{ transform: "scale(0.97)" }}
                _focusVisible={{ outline: "2px solid", outlineColor: "pink.400" }}
                onClick={() => {
                  onClose();
                  onExitLesson();
                }}
                spacing={3}
              >
                <Box
                  w="38px"
                  h="38px"
                  borderRadius="12px"
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
                  <IoArrowBackOutline fontSize="20px" color={themeIconColor} />
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="appText"
                  textAlign="left"
                  noOfLines={1}
                >
                  {translation[userLanguage]?.["menu.exitLesson"] ||
                    (userLanguage?.startsWith("es")
                      ? "Salir de la lección"
                      : "Exit lesson")}
                </Text>
              </HStack>
            )}

            {/* 2-Column Bento Grid */}
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, minmax(0, 1fr))"
              gap={{ base: 2, sm: 2.5 }}
              mb={{ base: 2, sm: 2.5 }}
            >
              {bentoGridItems.map((item) => (
                <Box
                  key={item.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    onClose();
                    item.onClick();
                  }}
                  p={3.5}
                  minH="88px"
                  borderRadius="18px"
                  bg={tileBg}
                  border="1px solid"
                  borderColor={tileBorder}
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  cursor="pointer"
                  transition="all 0.15s ease"
                  _hover={{ bg: tileHoverBg, transform: "translateY(-1px)" }}
                  _active={{ transform: "scale(0.97)" }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "pink.400",
                  }}
                  outline="none"
                >
                  {/* Top: Icon Box */}
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="12px"
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

                  {/* Bottom: Pinned Text */}
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="appText"
                    textAlign="left"
                    lineHeight="short"
                    noOfLines={2}
                    mt={2}
                  >
                    {item.label}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Bottom Full-Width Row: App Building Tutorial */}
            <HStack
              as="button"
              type="button"
              w="100%"
              p={3}
              borderRadius="18px"
              bg={tileBg}
              border="1px solid"
              borderColor={tileBorder}
              cursor="pointer"
              transition="all 0.15s ease"
              _hover={{ bg: tileHoverBg, transform: "translateY(-1px)" }}
              _active={{ transform: "scale(0.97)" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "pink.400" }}
              onClick={() => {
                onClose();
                onOpenPatreon();
              }}
              spacing={3}
            >
              <Box
                w="38px"
                h="38px"
                borderRadius="12px"
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
                <PiPatreonLogoFill fontSize="20px" color={themeIconColor} />
              </Box>
              <Text
                fontSize="sm"
                fontWeight="600"
                color="appText"
                textAlign="left"
                noOfLines={1}
              >
                {userLanguage?.startsWith("es")
                  ? "Tutorial para crear tu app"
                  : "App Building Tutorial"}
              </Text>
            </HStack>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityMenu;
