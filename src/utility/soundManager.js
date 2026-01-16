const hasWindow = typeof window !== "undefined";
const AudioContextRef = hasWindow
  ? window.AudioContext || window.webkitAudioContext
  : null;

let audioContext;
let masterGain;
let unlockListenerAdded = false;

const ensureContext = () => {
  if (!AudioContextRef) return null;

  if (!audioContext) {
    audioContext = new AudioContextRef();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(audioContext.destination);
  }

  if (!unlockListenerAdded && hasWindow) {
    unlockListenerAdded = true;
    window.addEventListener(
      "pointerdown",
      () => {
        if (audioContext.state === "suspended") {
          audioContext.resume().catch(() => {});
        }
      },
      { once: true }
    );
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
};

const scheduleTone = (
  ctx,
  {
    start,
    frequency,
    duration = 0.1,
    type = "sine",
    volume = 0.12,
    attack = 0.01,
    release = 0.08,
    detune = 0,
  }
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (detune) {
    osc.detune.setValueAtTime(detune, start);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + attack);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration + release
  );

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(start);
  osc.stop(start + duration + release + 0.02);
};

const playSequence = (steps) => {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;

  const baseTime = ctx.currentTime + 0.02;
  let cursor = baseTime;

  steps.forEach((step) => {
    const start = step.offset != null ? baseTime + step.offset : cursor;
    scheduleTone(ctx, { ...step, start });
    if (step.offset == null) {
      cursor = start + (step.duration ?? 0.1) + (step.gap ?? 0.02);
    }
  });
};

const playClick = () => {
  playSequence([
    { frequency: 640, duration: 0.05, volume: 0.11, type: "triangle" },
  ]);
};

const playSelect = () => {
  playSequence([
    { frequency: 760, duration: 0.06, volume: 0.12, type: "triangle" },
  ]);
};

const playSuccess = () => {
  playSequence([
    { frequency: 523.25, duration: 0.08, volume: 0.14, type: "sine" },
    {
      frequency: 659.25,
      duration: 0.1,
      volume: 0.12,
      type: "sine",
      offset: 0.03,
    },
    {
      frequency: 783.99,
      duration: 0.12,
      volume: 0.1,
      type: "triangle",
      offset: 0.06,
    },
  ]);
};

const playError = () => {
  playSequence([
    { frequency: 220, duration: 0.12, volume: 0.14, type: "sawtooth" },
    {
      frequency: 180,
      duration: 0.12,
      volume: 0.11,
      type: "sawtooth",
      offset: 0.08,
    },
  ]);
};

const playTransition = (variant = "sparkle") => {
  if (variant === "complete") {
    playSequence([
      { frequency: 392, duration: 0.1, volume: 0.13, type: "triangle" },
      { frequency: 523.25, duration: 0.1, volume: 0.12, type: "triangle" },
      { frequency: 659.25, duration: 0.12, volume: 0.11, type: "sine" },
    ]);
    return;
  }

  playSequence([
    { frequency: 740, duration: 0.07, volume: 0.12, type: "sine" },
    { frequency: 988, duration: 0.07, volume: 0.1, type: "sine" },
    { frequency: 1318, duration: 0.09, volume: 0.09, type: "triangle" },
  ]);
};

export const soundManager = {
  playClick,
  playSelect,
  playSuccess,
  playError,
  playTransition,
};
