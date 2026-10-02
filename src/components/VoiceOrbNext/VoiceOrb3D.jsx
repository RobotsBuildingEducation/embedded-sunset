import { useEffect, useRef, useState } from "react";
import { createOrbScene } from "./orbing/createOrbScene.js";
import { DEFAULT_ORB_PALETTE, REACTION_DURATION } from "./orbing/orbModel.js";

/** The original idle/listening/speaking API, plus a separate expressive layer.
 * audioLevelRef accepts normalized live amplitude without React frame updates.
 * With no audio source, listening/speaking use a local animated preview.
 */
export default function VoiceOrb3D({
  state = "idle", mood = "joy", palette = DEFAULT_ORB_PALETTE, colors, energy = 0.7,
  voiceLevel = 0.65, audioLevelRef, reaction, paused = false,
  reducedMotion = false, followPointer = true, dark = false, onInteract, onReactionComplete,
  interactive = true, compact = false, showShadow = true, fallback = null,
  palettes, orbFlow, reactionDurations, reactionPose, resolveOrbMood, expressions, sharedRenderer = false,
  maxDpr,
}) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const optionsRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    optionsRef.current = {
      state, mood, palette, colors, energy, voiceLevel, audioLevelRef, reaction, paused,
      reducedMotion, followPointer, dark, onInteract, onReactionComplete,
      interactive, compact, showShadow, palettes, orbFlow, reactionDurations,
      reactionPose, resolveOrbMood, expressions, sharedRenderer, maxDpr,
    };
    sceneRef.current?.update(optionsRef.current);
  }, [state, mood, palette, colors, energy, voiceLevel, audioLevelRef, reaction, paused, reducedMotion, followPointer, dark, onInteract, onReactionComplete, interactive, compact, showShadow, palettes, orbFlow, reactionDurations, reactionPose, resolveOrbMood, expressions, sharedRenderer, maxDpr]);

  useEffect(() => {
    let scene;
    const fail = () => {
      scene?.dispose();
      sceneRef.current = null;
      setUnavailable(true);
    };
    try {
      scene = createOrbScene(hostRef.current, optionsRef.current, fail);
      sceneRef.current = scene;
    } catch {
      fail();
    }
    return () => { sceneRef.current = null; scene?.dispose(); };
  }, []);

  // With no renderer, keep the accessible reaction message temporary as well.
  useEffect(() => {
    if (!unavailable || !reaction || paused) return;
    const duration = optionsRef.current?.reactionDurations?.[reaction.kind] || REACTION_DURATION[reaction.kind] || 2;
    const timeout = setTimeout(() => onReactionComplete?.(reaction.id), duration * 1000);
    return () => clearTimeout(timeout);
  }, [unavailable, reaction, paused, onReactionComplete]);

  return (
    <span
      ref={hostRef}
      className={`voice-orb-3d${unavailable ? " is-fallback" : ""}`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Pet the orb. Drag to turn it, or press Enter for a loving reaction." : undefined}
      aria-hidden={interactive ? undefined : true}
      onKeyDown={(event) => {
        if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onInteract?.("boop"); }
      }}
      onClick={unavailable && interactive ? () => onInteract?.("boop") : undefined}
    >
      {unavailable && (fallback || <>
        <span className="orb-fallback-character" data-palette={palette} data-mood={mood}><i /><i /></span>
        <span className="orb-fallback-notice">A little 2D hello. This browser couldn’t start 3D.</span>
      </>)}
    </span>
  );
}
