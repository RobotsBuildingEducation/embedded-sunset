import { VStack, Text } from "@chakra-ui/react";
import VoiceOrbNext from "./VoiceOrbNext.jsx";

export default function VoiceOrbLoader({ label, size = 96, mood, state, sharedRenderer, maxDpr }) {
  return (
    <VStack role="status" spacing={2} textAlign="center" width="100%">
      <span aria-hidden="true">
        <VoiceOrbNext
          variant="loader"
          size={size}
          mood={mood}
          state={state}
          force3D
          sharedRenderer={sharedRenderer}
          maxDpr={maxDpr}
        />
      </span>
      {label ? <Text>{label}</Text> : null}
    </VStack>
  );
}
