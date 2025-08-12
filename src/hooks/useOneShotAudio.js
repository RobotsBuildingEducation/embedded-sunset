// useOneShotAudio.js
import { useCallback, useEffect, useRef } from "react";

export function useOneShotAudio(
  src,
  { volume = 0.25, disableOnIOSSafari = true } = {}
) {
  const ref = useRef(null);

  // Detect iOS Safari (incl. iPadOS that spoofs Mac)
  const isIOSSafari =
    typeof navigator !== "undefined" &&
    (() => {
      const ua = navigator.userAgent || "";
      const isIOS =
        /iP(hone|od|ad)/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isSafari =
        /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
      return isIOS && isSafari;
    })();

  useEffect(() => {
    // Skip entirely on iOS Safari if requested
    if (disableOnIOSSafari && isIOSSafari) return;

    const el = new Audio(src);
    el.preload = "auto";
    el.playsInline = true;
    el.volume = volume;
    ref.current = el;

    // Desktop / non-iOS: no unlock dance needed
    const unlock = () => {};
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => {
      try {
        el.pause();
      } catch {}
      ref.current = null;
      window.removeEventListener("pointerdown", unlock);
    };
  }, [src, volume, disableOnIOSSafari, isIOSSafari]);

  const play = useCallback(() => {
    // No-op on iOS Safari
    if (disableOnIOSSafari && isIOSSafari) return;

    const el = ref.current;
    if (!el) return;
    try {
      el.pause(); // ensure no overlap
      el.currentTime = 0; // restart from beginning
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }, [disableOnIOSSafari, isIOSSafari]);

  return play;
}
