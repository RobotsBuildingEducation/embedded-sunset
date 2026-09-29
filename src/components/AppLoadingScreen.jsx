import { Box } from "@chakra-ui/react";
import VoiceOrbLoader from "./VoiceOrbNext/VoiceOrbLoader.jsx";

export default function AppLoadingScreen({ label }) {
  const loadingLabel =
    label ||
    (localStorage.getItem("userLanguage")?.startsWith("es")
      ? "Cargando…"
      : "Loading…");

  return (
    <Box
      minH="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      zIndex={1}
      bg="appBg"
      color="appText"
      p={6}
    >
      <VoiceOrbLoader label={loadingLabel} />
    </Box>
  );
}
