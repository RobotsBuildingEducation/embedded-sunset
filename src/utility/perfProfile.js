export const isIOSWebKit = () => {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return isIOS;
};

export const useLiteOverlayEffects = () => isIOSWebKit();
