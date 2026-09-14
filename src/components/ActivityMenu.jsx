import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  HStack,
  IconButton,
  Portal,
  Text,
  useColorModeValue,
  useToken,
} from "@chakra-ui/react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { IoSettingsOutline, IoClose } from "react-icons/io5";
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
  const dragY = useMotionValue(0);
  const dismissTimeoutRef = useRef(null);
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
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
      if (!isClosingRef.current) {
        dragY.set(0);
        if (cardRef.current) {
          cardRef.current.style.pointerEvents = "";
        }
      }
      return;
    }

    isClosingRef.current = false;
    if (cardRef.current) {
      cardRef.current.style.pointerEvents = "";
    }

    // Fluid subtle entrance slide from 16px to 0
    dragY.set(16);
    animate(dragY, 0, { duration: 0.22, ease: [0.16, 1, 0.3, 1] });

    const handleTouchMove = (e) => {
      // If dragging or downward drag activated, lock all background scrolling
      if (gestureRef.current?.hasActivated || gestureRef.current?.isDragging) {
        e.preventDefault();
        return;
      }
      // Prevent touch on backdrop from scrolling background app
      if (e.target.closest?.("[data-activity-menu-backdrop='true']")) {
        e.preventDefault();
        return;
      }
      // Prevent touch on drag handle from scrolling background app
      if (e.target.closest?.("[data-drag-handle='true']")) {
        e.preventDefault();
        return;
      }
      // If touching card at top and moving downward, prevent background pull
      if (e.target.closest?.("[data-activity-menu-card='true']")) {
        const card = cardRef.current;
        if (!card || card.scrollTop <= 0) {
          const touch = e.touches?.[0];
          if (
            touch &&
            gestureRef.current?.startY &&
            touch.clientY > gestureRef.current.startY
          ) {
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [isOpen, dragY]);

  const onPointerDown = (e) => {
    if (isClosingRef.current) return;

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

    if (card) {
      try {
        card.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  const onPointerMove = (e) => {
    if (isClosingRef.current) return;
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;

    const deltaX = Math.abs(e.clientX - g.startX);
    const deltaY = e.clientY - g.startY;

    const card = cardRef.current;
    if (!card) return;

    if (g.isDragging) {
      const now = Date.now();
      const dt = Math.max(1, now - g.lastTime);
      g.velocityY = (e.clientY - g.lastY) / dt;
      g.lastY = e.clientY;
      g.lastTime = now;

      const offsetY = Math.max(0, deltaY);
      dragY.set(offsetY);
      return;
    }

    // Only activate on downward drag
    if (deltaY <= 0) return;

    // Directional Ratio Guard: vertical must exceed horizontal by > 1.1
    if (deltaY <= deltaX * 1.1) return;

    // Threshold detection (4px for pill handle, 8px for card body)
    const threshold = g.isHandle ? 4 : 8;
    if (deltaY > threshold) {
      g.hasActivated = true;
      g.isDragging = true;
      try {
        card.setPointerCapture?.(e.pointerId);
      } catch (_) {}
      dragY.set(Math.max(0, deltaY));
    }
  };

  const endDrag = (e) => {
    if (isClosingRef.current) return;
    const g = gestureRef.current;
    if (!g) return;

    const card = cardRef.current;

    if (g.isDragging && card) {
      try {
        if (card.hasPointerCapture?.(e.pointerId)) {
          card.releasePointerCapture?.(e.pointerId);
        }
      } catch (_) {}

      const offsetY = Math.max(0, e.clientY - g.startY);
      const totalDt = Math.max(1, Date.now() - g.startTime);
      const totalVelocityY = (e.clientY - g.startY) / totalDt;
      const isDismiss =
        offsetY > 50 || g.velocityY > 0.25 || totalVelocityY > 0.25;

      if (isDismiss) {
        isClosingRef.current = true;
        card.style.pointerEvents = "none";

        const currentY = dragY.get();
        const targetY = Math.max(currentY + 300, 520);
        const velocity = Math.max(
          0.6,
          Math.abs(g.velocityY),
          Math.abs(totalVelocityY),
        );
        const duration = Math.min(
          0.22,
          Math.max(0.15, 160 / (velocity * 1000)),
        );

        animate(dragY, targetY, {
          duration,
          ease: [0.2, 0.9, 0.3, 1],
        });

        dismissTimeoutRef.current = setTimeout(() => {
          onClose();
        }, duration * 1000);
      } else {
        // Snap back cleanly to 0 with zero bounce
        animate(dragY, 0, {
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1],
        });
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
    dragY,
    isClosingRef,
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
    dragY,
    isClosingRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useMenuSwipeDismiss({ isOpen, onClose });

  const bentoGridItems = [
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
          {/* Transparent Backdrop to capture outside clicks and prevent background dragging without flicker */}
          <Portal>
            <Box
              data-activity-menu-backdrop="true"
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex={1390}
              pointerEvents="auto"
              touchAction="none"
              bg="transparent"
              onClick={onClose}
            />
          </Portal>

          {/* Floating Liquid Glass Bento Card (z-index: 1500) */}
          <MotionBox
            ref={cardRef}
            data-activity-menu-card="true"
            style={{ y: dragY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              duration: isClosingRef.current ? 0.01 : 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
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
            touchAction="none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {/* Header: Centered Pill Handle & Close 'X' Button */}
            <Box
              minH="48px"
              pt={{ base: 1.5, sm: 2 }}
              mb={{ base: 6, sm: 7 }}
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              touchAction="none"
              data-drag-handle="true"
              cursor="grab"
              _active={{ cursor: "grabbing" }}
            >
              {/* Centered Pill Drag Handle with expanded touch padding */}
              <Box
                py={2}
                px={6}
                cursor="grab"
                _active={{ cursor: "grabbing" }}
                data-drag-handle="true"
                touchAction="none"
              >
                <Box
                  w="48px"
                  h="5px"
                  borderRadius="full"
                  bg={dragHandleBg}
                  data-drag-handle="true"
                />
              </Box>

              {/* Close Button */}
              <IconButton
                aria-label="Close menu"
                icon={<IoClose fontSize="28px" />}
                size="md"
                position="absolute"
                right="0"
                top="50%"
                transform="translateY(-50%)"
                w={{ base: "44px", sm: "48px" }}
                h={{ base: "44px", sm: "48px" }}
                minW={{ base: "44px", sm: "48px" }}
                borderRadius="full"
                variant="ghost"
                color="appText"
                _hover={{ bg: "appSurfaceMuted" }}
                _active={{ bg: "appSurfaceInset" }}
                onClick={onClose}
              />
            </Box>

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

            {/* Bottom Full-Width Row: Settings */}
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
                onOpenSettings();
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
                <IoSettingsOutline fontSize="20px" color={themeIconColor} />
              </Box>
              <Text
                fontSize="sm"
                fontWeight="600"
                color="appText"
                textAlign="left"
                noOfLines={1}
              >
                {translation[userLanguage]?.["settings.title"] ||
                  (userLanguage?.startsWith("es") ? "Configuraciones" : "Settings")}
              </Text>
            </HStack>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityMenu;
