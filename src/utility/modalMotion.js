export const nativeOverlayMotionProps = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.08, ease: "linear" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0 },
  },
};

export const nativeModalMotionProps = {
  initial: { opacity: 0, y: 8, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0 },
  },
};

export const nativeDrawerMotionProps = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    y: "100%",
    transition: { duration: 0 },
  },
};

export const nativeRightDrawerMotionProps = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    x: "100%",
    transition: { duration: 0 },
  },
};
