import { useCallback, useEffect, useRef, useState } from "react";

export function useOrbMicrophone() {
  const [status, setStatus] = useState("off");
  const [error, setError] = useState("");
  const levelRef = useRef(0);
  const resources = useRef({ request: 0 });

  const stop = useCallback(() => {
    const current = resources.current;
    current.request++;
    cancelAnimationFrame(current.frame);
    current.stream?.getTracks().forEach((track) => track.stop());
    current.source?.disconnect();
    current.analyser?.disconnect();
    current.context?.close().catch(() => {});
    resources.current = { request: current.request };
    levelRef.current = 0;
    setStatus("off");
  }, []);

  const start = useCallback(async () => {
    stop();
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access needs localhost or HTTPS in a supported browser.");
      return false;
    }
    const request = resources.current.request;
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (resources.current.request !== request) { stream.getTracks().forEach((track) => track.stop()); return false; }
      resources.current.stream = stream;
      const context = new (window.AudioContext || window.webkitAudioContext)();
      resources.current.context = context;
      await context.resume();
      if (resources.current.request !== request) return false;
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const current = { request, stream, context, source, analyser };
      resources.current = current;
      const sample = () => {
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (const value of samples) sum += value * value;
        levelRef.current = Math.min(1, Math.sqrt(sum / samples.length) * 5);
        current.frame = requestAnimationFrame(sample);
      };
      sample();
      stream.getAudioTracks()[0]?.addEventListener("ended", stop, { once: true });
      setStatus("on");
      return true;
    } catch (cause) {
      if (resources.current.request !== request) return false;
      stop();
      setError(cause.name === "NotAllowedError"
        ? "Microphone permission was declined. You can still try the voice preview."
        : "The microphone is unavailable. You can still try the voice preview.");
      return false;
    }
  }, [stop]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); stop(); };
  }, [stop]);
  return { status, error, levelRef, start, stop };
}
