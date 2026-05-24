import { flushSync } from "react-dom";

export const runImmediateSurfaceUpdate = (task) => {
  if (typeof task !== "function") return;

  try {
    flushSync(task);
  } catch {
    task();
  }
};

export const getInstantSurfacePressProps = (pressRef, key, action) => ({
  touchAction: "manipulation",
  onTouchStart: (event) => {
    if (event.touches?.length > 1) return;
    if (event.cancelable) {
      event.preventDefault();
    }

    const recent = pressRef.current;
    if (recent?.key === key && Date.now() - recent.at < 750) {
      return;
    }

    pressRef.current = { key, at: Date.now() };
    action?.(event);
  },
  onPointerDown: (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const recent = pressRef.current;
    if (recent?.key === key && Date.now() - recent.at < 750) {
      return;
    }

    if (event.pointerType !== "mouse" && event.cancelable) {
      event.preventDefault();
    }

    pressRef.current = { key, at: Date.now() };
    action?.(event);
  },
  onClick: (event) => {
    const recent = pressRef.current;
    if (recent?.key === key && Date.now() - recent.at < 750) {
      pressRef.current = { key: "", at: 0 };
      return;
    }

    action?.(event);
  },
});
