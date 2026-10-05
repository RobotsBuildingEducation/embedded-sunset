export const ORB_MOODS = [
  { id: "joy", label: "Joyful", line: "Oh, hi. You just made my day." },
  { id: "curious", label: "Curious", line: "Ooh. Tell me a little more?" },
  { id: "love", label: "Loving", line: "A little love, just for you." },
  { id: "excited", label: "Excited", line: "We did it! We actually did it!" },
  { id: "surprised", label: "Surprised", line: "Wait… really? That's amazing." },
  { id: "sleepy", label: "Sleepy", line: "Just resting my eyes. Promise." },
  { id: "sad", label: "Tender", line: "It's okay. We'll figure it out together." },
  { id: "neutral", label: "Content", line: "Nowhere else I'd rather be." },
];

export const ORB_STATES = [
  { id: "idle", label: "Idle", caption: "Just happy to be here" },
  { id: "listening", label: "Listening", caption: "You have my full attention" },
  { id: "thinking", label: "Thinking", caption: "Connecting a few little dots" },
  { id: "speaking", label: "Speaking", caption: "So much to share with you" },
];

export const DISPLAY_MOODS = ["joy", "curious", "love", "excited", "sad", "neutral", "surprised"];
export const DISPLAY_REACTIONS = ["wave", "bounce", "celebrate", "spin"];
export const TUTOR_DEFAULT_MOODS = ["neutral", "surprised"];
export const TUTOR_CORRECT_MOODS = ["joy", "love", "excited"];
export const TUTOR_WRONG_MOODS = ["curious", "sad"];

export function randomTutorFeedback(result, random = Math.random) {
  const choose = (items) => items[Math.min(items.length - 1, Math.floor(random() * items.length))];
  if (result === "correct") return { mood: choose(TUTOR_CORRECT_MOODS), reaction: choose(DISPLAY_REACTIONS) };
  if (result === "wrong") return { mood: choose(TUTOR_WRONG_MOODS), reaction: null };
  return null;
}

export function randomDisplayOrb(random = Math.random, { excludeThinking = false } = {}) {
  const choose = (items) => items[Math.min(items.length - 1, Math.floor(random() * items.length))];
  const states = excludeThinking ? ORB_STATES.filter((state) => state.id !== "thinking") : ORB_STATES;
  return {
    mood: choose(DISPLAY_MOODS),
    state: choose(states).id,
    reaction: choose(DISPLAY_REACTIONS),
  };
}

export function randomLoaderOrb(random = Math.random, previous = {}) {
  const choose = (items, last) => {
    const choices = items.filter((item) => item !== last);
    return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
  };
  return {
    mood: choose(ORB_MOODS.map((mood) => mood.id), previous.mood),
    state: choose(ORB_STATES.map((state) => state.id), previous.state),
    reaction: choose(DISPLAY_REACTIONS, previous.reaction),
  };
}

export const ORB_PALETTES = [
  { id: "mint", name: "Original mint", swatch: "#72dabb", colors: ["#039b89", "#74edc5", "#e6fff2"] },
  { id: "blue", name: "VoiceOrb blue", swatch: "#69aff3", colors: ["#1656c1", "#65c7ff", "#e0f8ff"] },
  { id: "lilac", name: "Lilac", swatch: "#b59ae8", colors: ["#7253c4", "#c3a2f6", "#f6e8ff"] },
  { id: "peach", name: "Peach", swatch: "#f3ad81", colors: ["#e97438", "#ffbb82", "#fff3de"] },
  { id: "pearl", name: "Pearl", swatch: "#e0dfd9", colors: ["#aaa9a3", "#e8e7df", "#ffffff"] },
  { id: "orange", name: "Orange", swatch: "#ed8936", colors: ["#c05621", "#f6ad55", "#fff1d6"] },
  { id: "purple", name: "Purple", swatch: "#9f7aea", colors: ["#6b46c1", "#b794f4", "#f3e8ff"] },
  { id: "green", name: "Green", swatch: "#48bb78", colors: ["#2f855a", "#68d391", "#e8fff0"] },
  { id: "pink", name: "Pink", swatch: "#ed64a6", colors: ["#b83280", "#f687b3", "#fff0f7"] },
  { id: "gold", name: "Solar gold", swatch: "#f6c445", colors: ["#c67d0a", "#f6c445", "#fff6d6"] },
  { id: "rose", name: "Ruby rose", swatch: "#fb7185", colors: ["#b91c1c", "#fb7185", "#ffe4e6"] },
  { id: "emerald", name: "Emerald", swatch: "#34d399", colors: ["#047857", "#34d399", "#ecfdf5"] },
  { id: "obsidian", name: "Obsidian", swatch: "#6366f1", colors: ["#1e1b4b", "#6366f1", "#e0e7ff"] },
];

export const DEFAULT_ORB_PALETTE = "orange";
export const DEFAULT_ORB_COLORS = ORB_PALETTES.find((palette) => palette.id === DEFAULT_ORB_PALETTE)?.colors
  || ["#c05621", "#f6ad55", "#fff1d6"];

export const LOADER_ORB = {
  mood: "neutral",
  state: "thinking",
  reaction: null,
};

export const REACTION_DURATION = { boop: 1.4, wave: 2.3, bounce: 2.2, spin: 2.4, celebrate: 3.4 };
export const REACTION_SETTLE_DURATION = 0.65;
export const ORB_FLOW = {
  idle: { speed: 0.16, listening: 0, thinking: 0, speaking: 0 },
  listening: { speed: 0.36, listening: 1, thinking: 0, speaking: 0 },
  thinking: { speed: 0.46, listening: 0, thinking: 1, speaking: 0 },
  speaking: { speed: 0.68, listening: 0, thinking: 0, speaking: 1 },
};
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const smooth = (value) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };

// Each action has anticipation, a main gesture, and a damped settle. The returned
// offsets layer over idle/voice movement, so a reaction never changes voice state.
export function reactionPose(kind, elapsed, amount = 1) {
  const pose = { y: 0, x: 0, squash: 0, roll: 0, turn: 0, pitch: 0, burst: 0 };
  const duration = REACTION_DURATION[kind];
  if (!duration || elapsed < 0 || elapsed >= duration) return pose;
  const t = elapsed;
  // Zero slope at either end lets every gesture arrive and leave gently.
  const envelope = Math.sin(Math.PI * t / duration) ** 2;
  const tail = clamp((t - duration + 0.65) / 0.65, 0, 1);
  const settle = 1 - tail ** 3 * (tail * (tail * 6 - 15) + 10);
  if (kind === "boop") {
    pose.squash = Math.sin(t * 15) * Math.exp(-t * 4.2) * 0.24;
    pose.pitch = -Math.sin(t * 7) * Math.exp(-t * 3) * 0.18;
    pose.roll = Math.sin(t * 13) * Math.exp(-t * 4) * 0.09;
  } else if (kind === "wave") {
    pose.roll = Math.sin(t * 9) * envelope * 0.26;
    pose.x = Math.sin(t * 4.5) * envelope * 0.12;
    pose.y = envelope * 0.1;
  } else if (kind === "bounce") {
    if (t < 0.22) pose.squash = Math.sin(t / 0.22 * Math.PI) * 0.23;
    else {
      const b = t - 0.22;
      pose.y = Math.abs(Math.sin(b * 5.5)) * Math.exp(-b * 1.6) * 1.0;
      pose.squash = -Math.sin(b * 11) * Math.exp(-b * 1.7) * 0.16;
      pose.roll = Math.sin(b * 5.5) * Math.exp(-b * 1.7) * 0.12;
    }
  } else if (kind === "spin") {
    pose.turn = Math.PI * 2 * smooth((t - 0.2) / 1.8);
    pose.squash = Math.sin(t * 6) * envelope * 0.1;
    pose.y = envelope * 0.26;
    pose.roll = envelope * 0.16;
  } else if (kind === "celebrate") {
    pose.y = Math.abs(Math.sin(t * 6)) * envelope * 0.43;
    pose.roll = Math.sin(t * 8) * envelope * 0.25;
    pose.x = Math.sin(t * 4) * envelope * 0.17;
    pose.squash = Math.sin(t * 12) * envelope * 0.11;
    pose.burst = envelope;
  }
  for (const key of Object.keys(pose)) {
    // Energy can change the flourish, but a spin must still finish a whole turn.
    if (key === "turn") pose[key] *= amount > 0 ? 1 : 0;
    else pose[key] *= clamp(amount, 0, 1.5) * settle;
  }
  return pose;
}

export function resolveOrbMood(mood, state, reaction) {
  if (reaction === "boop") return "love";
  return ORB_MOODS.some((item) => item.id === mood) ? mood : "neutral";
}

export function simulatedVoiceLevel(time) {
  return clamp((Math.sin(time * 8.7) * 0.3 + Math.sin(time * 13.1) * 0.2 + 0.48) * (0.6 + Math.sin(time * 2.1) * 0.4), 0, 1);
}
