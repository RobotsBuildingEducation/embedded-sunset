const SPANISH_TIME_ZONES = new Set([
  // Spain
  "Africa/Ceuta",
  "Atlantic/Canary",
  "Europe/Madrid",

  // Mexico
  "America/Bahia_Banderas",
  "America/Cancun",
  "America/Chihuahua",
  "America/Ciudad_Juarez",
  "America/Ensenada",
  "America/Hermosillo",
  "America/Matamoros",
  "America/Mazatlan",
  "America/Merida",
  "America/Mexico_City",
  "America/Monterrey",
  "America/Ojinaga",
  "America/Santa_Isabel",
  "America/Tijuana",
  "Mexico/BajaNorte",
  "Mexico/BajaSur",
  "Mexico/General",

  // Spanish-speaking Central America and the Caribbean
  "America/Costa_Rica",
  "America/El_Salvador",
  "America/Guatemala",
  "America/Havana",
  "America/Managua",
  "America/Panama",
  "America/Puerto_Rico",
  "America/Santo_Domingo",
  "America/Tegucigalpa",
  "Cuba",

  // Spanish-speaking South America
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Catamarca",
  "America/Argentina/Cordoba",
  "America/Argentina/Jujuy",
  "America/Argentina/La_Rioja",
  "America/Argentina/Mendoza",
  "America/Argentina/Rio_Gallegos",
  "America/Argentina/Salta",
  "America/Argentina/San_Juan",
  "America/Argentina/San_Luis",
  "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia",
  "America/Asuncion",
  "America/Bogota",
  "America/Buenos_Aires",
  "America/Caracas",
  "America/Catamarca",
  "America/Cordoba",
  "America/Guayaquil",
  "America/Jujuy",
  "America/La_Paz",
  "America/Lima",
  "America/Mendoza",
  "America/Montevideo",
  "America/Punta_Arenas",
  "America/Rosario",
  "America/Santiago",
  "Chile/Continental",
  "Chile/EasterIsland",
  "Pacific/Easter",

  // Equatorial Guinea
  "Africa/Malabo",
]);

export const resolveDefaultLanguage = ({ storedLanguage, timeZone } = {}) => {
  if (typeof storedLanguage === "string" && storedLanguage.trim()) {
    return storedLanguage;
  }

  return SPANISH_TIME_ZONES.has(timeZone) ? "es" : "en";
};

export const resolveAccountLanguage = ({
  accountLanguage,
  legacyAccountLanguage,
  localLanguage,
  detectedLanguage = "en",
} = {}) => {
  const candidates = [
    accountLanguage,
    legacyAccountLanguage,
    localLanguage,
    detectedLanguage,
  ];

  return (
    candidates.find(
      (candidate) => typeof candidate === "string" && candidate.trim(),
    ) || "en"
  );
};

export const getInitialUserLanguage = () => {
  if (typeof window === "undefined") return "en";

  let storedLanguage = null;
  let timeZone = "";

  try {
    storedLanguage = window.localStorage.getItem("userLanguage");
  } catch (error) {
    console.warn("Unable to read the saved language preference", error);
  }

  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn("Unable to detect the browser time zone", error);
  }

  return resolveDefaultLanguage({ storedLanguage, timeZone });
};
