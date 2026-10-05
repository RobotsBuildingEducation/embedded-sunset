import { useEffect, useRef, useState } from "react";
import OrbRenderer from "./OrbRenderer.jsx";
import {
  PLAYGROUND_EXPRESSIONS, PLAYGROUND_FLOW, PLAYGROUND_PALETTES,
  PLAYGROUND_REACTION_DURATIONS, playgroundReactionPose, resolvePlaygroundMood,
} from "./orbPresets.js";
import "./achievements.css";
import { ACHIEVEMENT_COLOR_STAGES } from "./orbThemes.js";

const achievementPalettes = [...PLAYGROUND_PALETTES, ...ACHIEVEMENT_COLOR_STAGES];

export default function AchievementOrb({ achievement, size = 180, animated = false, label }) {
  const orb = achievement.orb;
  const host = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [reaction, setReaction] = useState(() => ({id: 1, kind: orb.reaction}));
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "250px 0px" });
    if (host.current) observer.observe(host.current);
    const media = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const update = () => setReducedMotion(media?.matches ?? false);
    media?.addEventListener?.("change", update);
    return () => {
      observer.disconnect();
      media?.removeEventListener?.("change", update);
    };
  }, []);
  useEffect(() => {
    if (!visible || reducedMotion) return;
    // Each character repeats its own dance; no random personality changes.
    const timer = setInterval(() => setReaction(previous => ({ id: previous.id + 1, kind: orb.reaction })), (PLAYGROUND_REACTION_DURATIONS[orb.reaction] + 3.5) * 1000);
    return () => clearInterval(timer);
  }, [orb.reaction, visible, reducedMotion]);
  return <span ref={host} className="achievement-orb" style={{width:size,aspectRatio:"1"}} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    {visible && <OrbRenderer
      state={orb.state} mood={orb.mood} palette={orb.palette}
      palettes={achievementPalettes} orbFlow={PLAYGROUND_FLOW} expressions={PLAYGROUND_EXPRESSIONS}
      reactionDurations={PLAYGROUND_REACTION_DURATIONS} reactionPose={playgroundReactionPose} resolveOrbMood={resolvePlaygroundMood}
      reaction={reaction} energy={animated ? .9 : .7} reducedMotion={reducedMotion}
      sharedRenderer interactive={false} followPointer={false} dark showShadow
    />}
  </span>;
}
