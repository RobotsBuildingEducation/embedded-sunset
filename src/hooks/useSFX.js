import { useEffect, useRef, useCallback } from "react";

// Gapless, click-free SFX player with fade-out + optional tail silence
export function useSFX(
  url,
  {
    volume = 0.25, // 0..1
    fadeOutMs = 120, // fade time at the end
    tailMs = 80, // extra silence after the buffer
  } = {}
) {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const bufferRef = useRef(null);

  useEffect(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    ctxRef.current = ctx;
    gainRef.current = gain;

    let alive = true;
    (async () => {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      if (alive) bufferRef.current = buf;
    })().catch(() => {});

    // iOS unlock
    const unlock = () => {
      ctx.resume().catch(() => {});
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      alive = false;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      ctx.close().catch(() => {});
    };
  }, [url]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (ctx && gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(volume, now);
    }
  }, [volume]);

  const play = useCallback(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !gain || !buffer) return;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);

    const now = ctx.currentTime;
    const dur = buffer.duration;
    const fade = Math.max(0.02, fadeOutMs / 1000);
    const tail = Math.max(0, tailMs / 1000);
    const stopAt = now + dur + tail;
    const fadeStart = stopAt - fade;

    // ensure clean level before scheduling
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(volume, now);
    // smooth fade to (almost) zero to avoid clicks
    gain.gain.linearRampToValueAtTime(0.0001, fadeStart + fade);

    src.start(now);
    src.stop(stopAt);

    // restore gain for the next play AFTER stop
    src.onended = () => {
      const t = ctx.currentTime + 0.001;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(volume, t);
    };
  }, [fadeOutMs, tailMs, volume]);

  return play;
}
