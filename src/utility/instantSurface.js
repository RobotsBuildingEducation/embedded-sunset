export const runImmediateSurfaceUpdate = (task) => {
  if (typeof task !== "function") return;
  task();
};

const getPressTime = () =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();

const markHandledPress = (pressRef, key) => {
  pressRef.current = {
    key,
    handledAt: getPressTime(),
    skipClick: true,
  };
};

const shouldSkipFollowUpClick = (pressRef, key) => {
  const recent = pressRef.current;
  if (!recent?.skipClick || recent.key !== key) return false;

  return getPressTime() - recent.handledAt < 1000;
};

export const getInstantSurfacePressProps = (pressRef, key, action) => ({
  "data-instant-surface-trigger": "true",
  touchAction: "manipulation",
  onTouchStart: (event) => {
    if (typeof window !== "undefined" && window.PointerEvent) {
      return;
    }

    if (event.touches?.length > 1) return;
    if (event.cancelable) {
      event.preventDefault();
    }

    markHandledPress(pressRef, key);
    action?.(event);
  },
  onPointerDown: (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (event.pointerType !== "mouse" && event.cancelable) {
      event.preventDefault();
    }

    markHandledPress(pressRef, key);
    action?.(event);
  },
  onClick: (event) => {
    if (shouldSkipFollowUpClick(pressRef, key)) {
      pressRef.current = { key: "", handledAt: 0, skipClick: false };
      return;
    }

    action?.(event);
  },
});
