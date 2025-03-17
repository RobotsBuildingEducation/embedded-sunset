export const isUnsupportedBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  console.log("user agent", userAgent);
  console.log("navigatior", navigator);
  const isByteDanceWebview = /ByteDanceWebview/.test(userAgent) && "Tiktok";
  const isByteLocale = /ByteLocale/.test(userAgent) && "Tiktok";
  const isMusicalLy = /musical_ly/.test(userAgent) && "Tiktok";
  const isInstagram = /Instagram/.test(userAgent) && "Instagram";
  const isPinterest = /Pinterest/.test(userAgent) && "Pinterest";
  const isNotValid =
    !(/Safari/.test(userAgent) || /Chrome/.test(userAgent)) &&
    "Instagram or other invalid browsers";

  const isInAppBrowser =
    isByteDanceWebview ||
    isByteLocale ||
    isMusicalLy ||
    isInstagram ||
    isPinterest ||
    isNotValid;

  return isInAppBrowser;
};
