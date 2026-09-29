import { VStack, Text } from "@chakra-ui/react";
import VoiceOrbNext from "./VoiceOrbNext.jsx";

export default function VoiceOrbLoader({ label, size = 96, mood, state }) {
  return (
    <VStack role="status" spacing={2} textAlign="center" width="100%">
      <span aria-hidden="true">
        <VoiceOrbNext
          variant="loader"
          size={size}
          mood={mood}
          state={state}
          force3D
        />
      </span>
      {label ? <Text>{label}</Text> : null}
    </VStack>
  );
}
