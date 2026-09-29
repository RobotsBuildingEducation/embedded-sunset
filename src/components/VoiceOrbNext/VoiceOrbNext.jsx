import { useCallback, useEffect, useRef, useState } from "react";
import { useColorMode, useToken } from "@chakra-ui/react";
import { useThemeStore } from "../../useThemeStore";
import VoiceOrb3D from "./VoiceOrb3D.jsx";
import { ORB_PALETTES, randomDisplayOrb, randomLoaderOrb, randomTutorFeedback, REACTION_DURATION, REACTION_SETTLE_DURATION, TUTOR_DEFAULT_MOODS } from "./orbing/orbModel.js";
import "./voiceOrbNext.css";

function MiniOrb({ state, palette, mood, reaction }) {
  return (
    <span key={reaction?.id} className="voice-orb-next-mini" data-state={state} data-theme={palette} data-mood={mood} data-reaction={reaction?.kind} aria-hidden="true">
      <span className="voice-orb-next-pigment" />
      <span className="voice-orb-next-wash" />
      <span className="voice-orb-next-face"><i /><i /></span>
    </span>
  );
}

/** Display and loader orbs choose their own personality; tutor orbs follow the live voice state. */
export default function VoiceOrbNext({ state = "idle", theme, palette, size = 75, centered = true, variant = "display", excludeThinking = false, callActive = true, feedback = null, force3D = false, showShadow = true }) {
  const { colorMode } = useColorMode();
  const themeColor = useThemeStore((store) => store.themeColor);
  const dark = (theme || colorMode) === "dark";
  const resolvedPalette = palette || themeColor;
  const themeColors = useToken("colors", [`${themeColor}.700`, `${themeColor}.300`, `${themeColor}.50`]);
  const paletteColors = (palette && ORB_PALETTES.find((entry) => entry.id === palette)?.colors)
    || (themeColors.every(Boolean) ? themeColors : ORB_PALETTES[0].colors);
  const isDisplay = variant === "display";
  const isLoader = variant === "loader";
  const isRandomized = isDisplay || isLoader;
  const useMini = size < 64 && !force3D;
  const [personality, setPersonality] = useState(() => isLoader ? randomLoaderOrb() : randomDisplayOrb(Math.random, { excludeThinking }));
  const personalityRef = useRef(personality);
  const [reaction, setReaction] = useState(() => ({ id: 1, kind: personality.reaction }));
  const [defaultTutorMood] = useState(() => TUTOR_DEFAULT_MOODS[Math.floor(Math.random() * TUTOR_DEFAULT_MOODS.length)]);
  const [tutorFeedback, setTutorFeedback] = useState(null);
  const reactionId = useRef(1);
  const voiceState = isRandomized ? (isDisplay && excludeThinking && personality.state === "thinking" ? "idle" : personality.state) : (callActive && ["idle", "listening", "thinking", "speaking"].includes(state) ? state : "idle");
  const mood = isRandomized ? personality.mood : tutorFeedback?.mood || (callActive ? defaultTutorMood : "sleepy");
  const currentReaction = isRandomized ? reaction : tutorFeedback?.reaction;

  useEffect(() => {
    if (!isRandomized) return undefined;
    const timer = window.setInterval(() => {
      const next = isLoader
        ? randomLoaderOrb(Math.random, personalityRef.current)
        : randomDisplayOrb(Math.random, { excludeThinking });
      personalityRef.current = next;
      setPersonality(next);
      setReaction({ id: ++reactionId.current, kind: next.reaction });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isRandomized, isLoader, excludeThinking]);

  useEffect(() => {
    if (!isRandomized || !reaction) return undefined;
    const timer = window.setTimeout(() => {
      setReaction((current) => current?.id === reaction.id ? null : current);
    }, (REACTION_DURATION[reaction.kind] + REACTION_SETTLE_DURATION) * 1000);
    return () => window.clearTimeout(timer);
  }, [isRandomized, reaction]);

  useEffect(() => {
    if (isRandomized || feedback?.id == null) return undefined;
    const next = randomTutorFeedback(feedback.result);
    if (!next) return undefined;
    setTutorFeedback({ mood: next.mood, reaction: next.reaction ? { id: feedback.id, kind: next.reaction } : null });
    const duration = next.reaction ? REACTION_DURATION[next.reaction] + REACTION_SETTLE_DURATION : 3.5;
    const timer = window.setTimeout(() => setTutorFeedback(null), duration * 1000);
    return () => window.clearTimeout(timer);
  }, [isRandomized, feedback?.id, feedback?.result]);

  const boop = useCallback(() => {
    if (isDisplay) setReaction({ id: ++reactionId.current, kind: "boop" });
  }, [isDisplay]);

  return (
    <span
      className={`voice-orb-next${isDisplay ? " is-interactive" : ""}`}
      data-state={voiceState}
      data-mood={mood}
      data-reaction={currentReaction?.kind}
      style={{ width: size, height: size, margin: centered ? "0 auto" : 0,
        "--orb-deep": paletteColors[0], "--orb-mid": paletteColors[1], "--orb-light": paletteColors[2] }}
      role={isDisplay ? (useMini ? "button" : undefined) : "img"}
      tabIndex={isDisplay && useMini ? 0 : undefined}
      aria-label={isDisplay && !useMini ? undefined : `${isDisplay ? "Boop" : isLoader ? "Loading" : "Tutor"} orb, ${mood}, ${voiceState}`}
      onClick={isDisplay && useMini ? boop : undefined}
      onKeyDown={isDisplay && useMini ? (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); boop(); }
      } : undefined}
    >
      {useMini ? <MiniOrb state={voiceState} palette={resolvedPalette} mood={mood} reaction={currentReaction} /> : (
        <VoiceOrb3D
          state={voiceState}
          mood={mood}
          palette={resolvedPalette}
          colors={paletteColors}
          dark={dark}
          energy={isRandomized ? 1.5 : 0.7}
          followPointer={false}
          interactive={isDisplay}
          onInteract={isDisplay ? boop : undefined}
          reaction={currentReaction}
          compact
          showShadow={showShadow}
          fallback={<MiniOrb state={voiceState} palette={resolvedPalette} mood={mood} reaction={currentReaction} />}
        />
      )}
    </span>
  );
}
