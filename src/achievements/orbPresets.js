import {
  arch, BLUSH, capsule, COLOR, EYE_COORDINATES, EYE_POINTS, heart, resample, TAU,
} from "./hostOrb.js";
import { clamp, smooth } from "./hostOrb.js";

export const PLAYGROUND_MOODS = [
  { id: "joy", label: "Joyful", line: "Oh, hi. You just made my day." },
  { id: "curious", label: "Curious", line: "Ooh. Tell me a little more?" },
  { id: "love", label: "Loving", line: "A little love, just for you." },
  { id: "excited", label: "Excited", line: "We did it! We actually did it!" },
  { id: "surprised", label: "Surprised", line: "Wait… really? That's amazing." },
  { id: "sleepy", label: "Sleepy", line: "Just resting my eyes. Promise." },
  { id: "tender", label: "Tender", line: "It's okay. We'll figure it out together." },
  { id: "content", label: "Content", line: "Nowhere else I'd rather be." },
  { id: "playful", label: "Playful", line: "Bet you can't catch me!" },
  { id: "bashful", label: "Bashful", line: "You're making me blush..." },
  { id: "zen", label: "Zen", line: "Breathe in calm, breathe out noise." },
  { id: "proud", label: "Proud", line: "Standing a little taller today." },
  { id: "goofy", label: "Goofy", line: "Blebbbb. Hehehe." },
  { id: "determined", label: "Determined", line: "Watch me. I've got this!" },
  { id: "daydreaming", label: "Daydreaming", line: "Floating through cloud castles..." },
  { id: "grateful", label: "Grateful", line: "My heart is completely full." },
  { id: "awestruck", label: "Awestruck", line: "The universe is so big and magical." },
  { id: "hopeful", label: "Hopeful", line: "Tomorrow is full of good things." },
  { id: "cheeky", label: "Cheeky", line: "Who, me? Couldn't be!" },
  { id: "cozy", label: "Cozy", line: "Warm cocoa and wool socks vibes." },
];

export const PLAYGROUND_PALETTES = [
  { id: "mint", name: "Celadon", swatch: "#7fe3ac", colors: ["#124e46", "#7fe3ac", "#e6f0b0"], material: { roughness: 0.6, metalness: 0.03, clearcoat: 0.4 } },
  { id: "blue", name: "Glacier", swatch: "#36b0b5", colors: ["#14235c", "#36b0b5", "#d1d0f8"], material: { roughness: 0.18, metalness: 0.15, clearcoat: 0.9 } },
  { id: "lilac", name: "Lilac", swatch: "#f4b0da", colors: ["#422063", "#f4b0da", "#bbddeb"], material: { roughness: 0.32, metalness: 0.1, clearcoat: 0.75 } },
  { id: "peach", name: "Peach", swatch: "#ffb96a", colors: ["#70301c", "#ffb96a", "#f2ddc1"], material: { roughness: 0.75, metalness: 0.0, clearcoat: 0.2 } },
  { id: "pearl", name: "Pearl", swatch: "#d7d8c7", colors: ["#60736e", "#d7d8c7", "#fffaf0"], material: { roughness: 0.12, metalness: 0.22, clearcoat: 1 } },
  { id: "rose", name: "Rose quartz", swatch: "#e16b90", colors: ["#752454", "#e16b90", "#ffd5a3"], material: { roughness: 0.24, metalness: 0.1, clearcoat: 0.95 } },
  { id: "sunset", name: "Golden sunset", swatch: "#e6835b", colors: ["#4f326a", "#e6835b", "#f0c766"], material: { roughness: 0.45, metalness: 0.12, clearcoat: 0.7 } },
  { id: "emerald", name: "Deep emerald", swatch: "#18b698", colors: ["#053c38", "#18b698", "#d0e766"], material: { roughness: 0.2, metalness: 0.16, clearcoat: 0.9 } },
  { id: "amber", name: "Warm amber", swatch: "#d09537", colors: ["#483326", "#d09537", "#f9e8b0"], material: { roughness: 0.35, metalness: 0.45, clearcoat: 0.55 } },
  { id: "lavender", name: "Wild lavender", swatch: "#a7a1d9", colors: ["#434165", "#a7a1d9", "#eec2c6"], material: { roughness: 0.72, metalness: 0.05, clearcoat: 0.25 } },
  { id: "midnight", name: "Midnight velvet", swatch: "#385375", colors: ["#101b35", "#385375", "#a68cb4"], material: { roughness: 0.8, metalness: 0.12, clearcoat: 0.2 } },
  { id: "coral", name: "Living coral", swatch: "#f27669", colors: ["#8f3342", "#f27669", "#f7d79c"], material: { roughness: 0.4, metalness: 0.05, clearcoat: 0.75 } },
  { id: "ocean", name: "Ocean abyss", swatch: "#249fbc", colors: ["#12355e", "#249fbc", "#b9e6de"], material: { roughness: 0.1, metalness: 0.12, clearcoat: 1 } },
  { id: "matcha", name: "Ceremonial matcha", swatch: "#9bbf77", colors: ["#35482a", "#9bbf77", "#f2dfa1"], material: { roughness: 0.9, metalness: 0, clearcoat: 0.12 } },
  { id: "solar", name: "Solar flare", swatch: "#ecc25d", colors: ["#73461d", "#ecc25d", "#fff4d5"], material: { roughness: 0.24, metalness: 0.5, clearcoat: 0.9 } },
  { id: "cottoncandy", name: "Cotton candy", swatch: "#e98cba", colors: ["#743585", "#e98cba", "#a9c6ef"], material: { roughness: 0.42, metalness: 0.04, clearcoat: 0.6 } },
  { id: "berry", name: "Blackberry cream", swatch: "#9b436f", colors: ["#361632", "#9b436f", "#e7b8bd"], material: { roughness: 0.3, metalness: 0.18, clearcoat: 0.8 } },
  { id: "aurora", name: "Aurora borealis", swatch: "#57b9a5", colors: ["#243d61", "#57b9a5", "#d2a9e4"], material: { roughness: 0.18, metalness: 0.24, clearcoat: 0.9 } },
  { id: "nebula", name: "Cosmic nebula", swatch: "#8b70c4", colors: ["#28264b", "#8b70c4", "#e0979e"], material: { roughness: 0.58, metalness: 0.18, clearcoat: 0.4 } },
  { id: "citrus", name: "Yuzu citrus", swatch: "#c8d664", colors: ["#3c652a", "#c8d664", "#ffe5aa"], material: { roughness: 0.65, metalness: 0.04, clearcoat: 0.35 } },
];

export const PLAYGROUND_STATES = [
  { id: "idle", label: "Ice Floes", caption: "Just happy to be here" },
  { id: "listening", label: "Radar Trail", caption: "You have my full attention" },
  { id: "thinking", label: "Circuit Garden", caption: "Connecting a few little dots" },
  { id: "speaking", label: "Chromatic Pipes", caption: "So much to share with you" },
  { id: "whisper", label: "Woven Silk", caption: "Quiet secrets in the dark" },
  { id: "echo", label: "Twin Resonators", caption: "Bouncing back to you" },
  { id: "aurora", label: "Aurora Curtains", caption: "Dancing like the northern lights" },
  { id: "storm", label: "Branching Plasma", caption: "Electric currents gathering" },
  { id: "breathe", label: "Unfolding Blossom", caption: "Inhale life, exhale worry" },
  { id: "shimmer", label: "Crystal Facets", caption: "Glittering on the horizon" },
  { id: "hypnotic", label: "Infinity Bands", caption: "Lost in the spiral" },
  { id: "cascade", label: "Rainfall", caption: "Flowing downward effortlessly" },
  { id: "flame", label: "Rising Embers", caption: "Warm embers rising" },
  { id: "nebula", label: "Nebula Clouds", caption: "A galaxy in formation" },
  { id: "heartbeat", label: "Signal Pulse", caption: "Lub-dub... lub-dub..." },
  { id: "kaleidoscope", label: "Mirrored Prisms", caption: "Faceted crystal reflections" },
  { id: "surge", label: "Layered Tides", caption: "Waves rolling upon the shore" },
  { id: "serenade", label: "Crossing Ribbons", caption: "Melodies made visible" },
  { id: "quantum", label: "Pixel Packets", caption: "Possibilities collapsing" },
  { id: "zenith", label: "Solar Convection", caption: "Reaching maximum radiance" },
];

// Experimental pigment programs use their own motion; only their clocks are shared.
export const PLAYGROUND_FLOW = {
  idle: { pattern: 1, speed: 0.68 },
  listening: { pattern: 2, speed: 0.85 },
  thinking: { pattern: 3, speed: 0.80 },
  speaking: { pattern: 4, speed: 0.65 },
  whisper: { pattern: 5, speed: 0.60 },
  echo: { pattern: 6, speed: 0.68 },
  aurora: { pattern: 7, speed: 0.72 },
  storm: { pattern: 8, speed: 0.72 },
  breathe: { pattern: 9, speed: 0.65 },
  shimmer: { pattern: 10, speed: 0.70 },
  hypnotic: { pattern: 11, speed: 0.70 },
  cascade: { pattern: 12, speed: 0.85 },
  flame: { pattern: 13, speed: 0.75 },
  nebula: { pattern: 14, speed: 0.62 },
  heartbeat: { pattern: 15, speed: 0.70 },
  kaleidoscope: { pattern: 16, speed: 0.65 },
  surge: { pattern: 17, speed: 0.80 },
  serenade: { pattern: 18, speed: 0.70 },
  quantum: { pattern: 19, speed: 0.72 },
  zenith: { pattern: 20, speed: 0.80 },
};

export const PLAYGROUND_REACTIONS = [
  { id: "wave", label: "Say hello", icon: "Hand", message: "Hello, favorite human." },
  { id: "bounce", label: "Little hop", icon: "ArrowUpRight", message: "A little hop. A lot of happiness." },
  { id: "spin", label: "Do a spin", icon: "RotateCw", message: "Wheee. How was that?" },
  { id: "celebrate", label: "Celebrate", icon: "Sparkles", message: "Look at us go!" },
  { id: "wiggle", label: "Happy wiggle", icon: "Activity", message: "Can't contain the excitement!" },
  { id: "twirl", label: "Ballet twirl", icon: "RotateCcw", message: "Graceful like a dandelion seed." },
  { id: "shimmy", label: "Salsa shimmy", icon: "Music", message: "Feel the rhythm in the air!" },
  { id: "flip", label: "Somersault", icon: "Compass", message: "Tada! Landed right on target." },
  { id: "groove", label: "Disco groove", icon: "Headphones", message: "Catching the beat!" },
  { id: "snooze", label: "Cozy nod", icon: "Moon", message: "Just dozing off for a moment... Zzz." },
  { id: "float", label: "Zero gravity", icon: "Cloud", message: "Weightless drifting into the stars." },
  { id: "nod", label: "Eager nod", icon: "CheckCircle2", message: "Yes, absolutely yes!" },
  { id: "shake", label: "Playful shiver", icon: "Zap", message: "Brrr! Shaking off the dust." },
  { id: "bow", label: "Curtsy & bow", icon: "HeartHandshake", message: "A polite bow, at your service." },
  { id: "heartbeat", label: "Love flutter", icon: "Heart", message: "Thump-thump, thump-thump!" },
  { id: "orbit", label: "Planetary loop", icon: "Orbit", message: "Making a loop around your world." },
  { id: "peek", label: "Peek-a-boo", icon: "Eye", message: "Peek-a-boo! Found you." },
  { id: "jiggle", label: "Jelly jiggle", icon: "Flame", message: "Boing-boing-boing! All wobbly." },
  { id: "dizzy", label: "Goofy dizzy", icon: "Shuffle", message: "Whoa, the stars are swirling!" },
  { id: "blastoff", label: "Rocket blastoff", icon: "Rocket", message: "3... 2... 1... Blastoff!" },
];

export const PLAYGROUND_REACTION_DURATIONS = {
  boop: 1.4,
  wave: 2.3,
  bounce: 2.2,
  spin: 2.4,
  celebrate: 3.4,
  wiggle: 2.2,
  twirl: 2.8,
  shimmy: 2.4,
  flip: 2.2,
  groove: 2.6,
  snooze: 3.0,
  float: 3.2,
  nod: 1.8,
  shake: 1.6,
  bow: 2.5,
  heartbeat: 2.4,
  orbit: 3.2,
  peek: 2.4,
  jiggle: 2.0,
  dizzy: 2.8,
  blastoff: 3.6,
};

export const PLAYGROUND_REACTION_SOUNDS = {
  boop: "select",
  wave: "listeningCue",
  bounce: "next",
  spin: "sparkle",
  celebrate: "correct",
  wiggle: "sparkle",
  twirl: "select",
  shimmy: "next",
  flip: "correct",
  groove: "listeningCue",
  snooze: "select",
  float: "sparkle",
  nod: "next",
  shake: "select",
  bow: "listeningCue",
  heartbeat: "correct",
  orbit: "sparkle",
  peek: "next",
  jiggle: "select",
  dizzy: "listeningCue",
  blastoff: "correct",
};

export function playgroundReactionPose(kind, elapsed, amount = 1) {
  const pose = { y: 0, x: 0, squash: 0, roll: 0, turn: 0, pitch: 0, burst: 0 };
  const duration = PLAYGROUND_REACTION_DURATIONS[kind];
  if (!duration || elapsed < 0 || elapsed >= duration) return pose;
  const t = elapsed;
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
  } else if (kind === "wiggle") {
    pose.roll = Math.sin(t * 18) * envelope * 0.22;
    pose.x = Math.sin(t * 12) * envelope * 0.15;
    pose.squash = Math.sin(t * 16) * envelope * 0.08;
    pose.y = envelope * 0.12;
  } else if (kind === "twirl") {
    pose.turn = Math.PI * 4 * smooth((t - 0.2) / 2.2);
    pose.y = Math.sin(Math.PI * t / duration) * 0.45;
    pose.squash = Math.sin(t * 8) * envelope * 0.12;
    pose.roll = Math.sin(t * 6) * envelope * 0.14;
  } else if (kind === "shimmy") {
    pose.roll = Math.sin(t * 14) * envelope * 0.18;
    pose.squash = Math.sin(t * 14 + Math.PI / 2) * envelope * 0.14;
    pose.x = Math.cos(t * 7) * envelope * 0.11;
    pose.y = Math.abs(Math.sin(t * 7)) * envelope * 0.18;
  } else if (kind === "flip") {
    pose.pitch = Math.PI * 2 * smooth((t - 0.15) / 1.7);
    pose.y = Math.sin(Math.PI * t / duration) * 0.58;
    pose.squash = (t < 0.2 ? Math.sin(t / 0.2 * Math.PI) * 0.2 : -Math.sin(t * 8) * 0.12) * envelope;
  } else if (kind === "groove") {
    pose.pitch = Math.sin(t * 10) * envelope * 0.18;
    pose.y = Math.abs(Math.sin(t * 10)) * envelope * 0.18;
    pose.roll = Math.sin(t * 5) * envelope * 0.15;
    pose.squash = -Math.sin(t * 10) * envelope * 0.10;
  } else if (kind === "snooze") {
    pose.y = -envelope * 0.16;
    pose.pitch = envelope * 0.14;
    pose.squash = envelope * 0.09;
    pose.roll = Math.sin(t * 2) * envelope * 0.05;
  } else if (kind === "float") {
    pose.y = Math.sin(t * 3.5) * envelope * 0.35;
    pose.roll = Math.sin(t * 2.5) * envelope * 0.12;
    pose.turn = Math.sin(t * 2.0) * envelope * 0.25;
    pose.x = Math.cos(t * 2.0) * envelope * 0.12;
  } else if (kind === "nod") {
    pose.pitch = Math.sin(t * 14) * envelope * 0.24;
    pose.y = Math.abs(Math.sin(t * 14)) * envelope * 0.09;
    pose.squash = Math.sin(t * 14) * envelope * 0.07;
  } else if (kind === "shake") {
    pose.roll = Math.sin(t * 36) * envelope * 0.16;
    pose.squash = Math.sin(t * 30) * envelope * 0.12;
    pose.x = Math.sin(t * 24) * envelope * 0.08;
  } else if (kind === "bow") {
    const bowCurve = Math.sin(Math.PI * t / duration);
    pose.pitch = bowCurve * 0.32;
    pose.y = -bowCurve * 0.16;
    pose.squash = bowCurve * 0.06;
  } else if (kind === "heartbeat") {
    const beat = Math.abs(Math.sin(t * 10)) * Math.exp(-((t % 0.6) * 4));
    pose.squash = -beat * envelope * 0.22;
    pose.y = beat * envelope * 0.16;
    pose.burst = envelope * 0.85;
  } else if (kind === "orbit") {
    const phase = t / duration * Math.PI * 2;
    pose.x = Math.sin(phase) * 0.34 * envelope;
    pose.y = Math.sin(phase * 2) * 0.12 * envelope;
    pose.turn = Math.sin(phase) * 0.45 * envelope;
    pose.roll = Math.cos(phase) * 0.14 * envelope;
  } else if (kind === "peek") {
    const duckTime = duration * 0.38;
    if (t < duckTime) {
      pose.y = -Math.sin(t / duckTime * Math.PI) * 0.36;
      pose.squash = Math.sin(t / duckTime * Math.PI) * 0.15;
    } else {
      const popT = (t - duckTime) / (duration - duckTime);
      pose.y = Math.sin(popT * Math.PI) * 0.22 * settle;
      pose.squash = -Math.sin(popT * Math.PI) * 0.12 * settle;
    }
  } else if (kind === "jiggle") {
    pose.squash = Math.sin(t * 22) * Math.exp(-t * 2.2) * 0.25;
    pose.roll = Math.sin(t * 18) * Math.exp(-t * 2.5) * 0.14;
    pose.y = Math.abs(Math.sin(t * 11)) * Math.exp(-t * 2.0) * 0.18;
  } else if (kind === "dizzy") {
    pose.turn = Math.sin(t * 7) * envelope * 1.5;
    pose.roll = Math.sin(t * 7 + Math.PI / 4) * envelope * 0.28;
    pose.pitch = Math.cos(t * 7) * envelope * 0.18;
    pose.squash = Math.sin(t * 14) * envelope * 0.09;
  } else if (kind === "blastoff") {
    if (t < 0.9) {
      pose.squash = (t / 0.9) * 0.24;
      pose.x = Math.sin(t * 40) * 0.05 * (t / 0.9);
      pose.y = -(t / 0.9) * 0.12;
    } else {
      const flyT = (t - 0.9) / (duration - 0.9);
      pose.y = (Math.sin(flyT * Math.PI) * 1.05) * settle;
      pose.squash = -Math.sin(flyT * Math.PI) * 0.18 * settle;
      pose.burst = Math.sin(flyT * Math.PI) * 1.2;
    }
  }

  for (const key of Object.keys(pose)) {
    if ((key === "turn" && (kind === "spin" || kind === "twirl")) || (key === "pitch" && kind === "flip")) {
      pose[key] *= amount > 0 ? 1 : 0;
    } else {
      pose[key] *= clamp(amount, 0, 1.5) * settle;
    }
  }
  return pose;
}

export function resolvePlaygroundMood(mood, state, reaction) {
  if (reaction === "boop" || reaction === "heartbeat") return "love";
  return PLAYGROUND_MOODS.some((item) => item.id === mood) ? mood : "content";
}

function diamondStar(points = 8) {
  const shape = [];
  for (let i = 0; i < 64; i++) {
    const angle = i / 64 * TAU - Math.PI / 2;
    const r = (i % (64 / points) < (32 / points)) ? 32 : 16;
    shape.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  return resample(shape);
}

function oval(rx, ry) {
  const shape = [];
  for (let i = 0; i < 64; i++) {
    const angle = i / 64 * TAU - Math.PI / 2;
    shape.push([Math.cos(angle) * rx, Math.sin(angle) * ry]);
  }
  return resample(shape);
}

function curvedSlit(tilt = 0) {
  const shape = [];
  for (let i = 0; i <= 32; i++) {
    const x = -26 + i * (52 / 32);
    const y = 3 - (x * x) * 0.008;
    shape.push([x, y]);
  }
  for (let i = 32; i >= 0; i--) {
    const x = -26 + i * (52 / 32);
    const y = -3 - (x * x) * 0.008;
    shape.push([x, y]);
  }
  const cos = Math.cos(tilt), sin = Math.sin(tilt);
  const rotated = shape.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos]);
  return resample(rotated);
}

function buildPlaygroundExpression(mood) {
  const values = new Float64Array(EYE_COORDINATES + 7);
  for (let eye = 0; eye < 2; eye++) {
    const side = eye ? 1 : -1;
    let outline;
    let y = 144;
    let tilt = 0;

    switch (mood) {
      case "love":
        outline = heart();
        y = 147;
        break;
      case "joy":
        outline = arch(30);
        y = 146;
        tilt = side * -0.08;
        break;
      case "excited":
        outline = resample([[0,-25],[26,-4],[8,0],[26,16],[15,26],[-14,0]]);
        y = 146;
        tilt = side * -0.08;
        break;
      case "sleepy":
        outline = arch(-10);
        y = 145;
        break;
      case "tender":
        outline = capsule(27, 45);
        y = 151;
        tilt = side * -0.21;
        break;
      case "surprised":
        outline = oval(27, 36);
        y = 142;
        break;
      case "curious":
        outline = capsule(31, eye ? 76 : 51);
        y = 143 - eye * 10;
        tilt = side * -0.06;
        break;
      case "content":
        outline = capsule(33, 68);
        y = 142;
        tilt = side * -0.03;
        break;
      case "playful":
        outline = eye ? arch(28) : capsule(33, 62);
        y = 144 - (eye ? 2 : 0);
        tilt = side * -0.08;
        break;
      case "bashful":
        outline = resample([[0,-17],[25,-4],[8,29],[-10,20],[-21,0]]);
        y = 148;
        tilt = side * -0.16;
        break;
      case "zen":
        outline = curvedSlit(0);
        y = 144;
        break;
      case "proud":
        outline = resample([[0,-17],[27,-10],[25,1],[0,12],[-25,1],[-27,-10]]);
        y = 142;
        tilt = side * 0.05;
        break;
      case "goofy":
        outline = eye ? resample([[0,-24],[8,-8],[24,0],[8,8],[0,24],[-8,8],[-24,0],[-8,-8]]) : oval(24, 18);
        y = 144 + (eye ? 3 : -3);
        tilt = side * 0.12;
        break;
      case "determined":
        outline = resample([[0,-12],[27,-24],[23,18],[-20,18],[-27,-1]]);
        y = 145;
        tilt = side * 0.18;
        break;
      case "daydreaming":
        outline = resample([[0,-26],[21,-16],[27,1],[17,23],[3,26],[12,12],[11,-4],[0,-16],[-13,-20]]);
        y = 140;
        tilt = side * -0.05;
        break;
      case "grateful":
        outline = heart().map(([x,y])=>[x*.72,y*.9]);
        y = 144;
        tilt = side * -0.04;
        break;
      case "awestruck":
        outline = diamondStar(8);
        y = 142;
        break;
      case "hopeful":
        outline = resample([[0,-36],[15,-9],[23,12],[15,29],[0,36],[-15,29],[-23,12],[-15,-9]]);
        y = 141;
        tilt = side * -0.06;
        break;
      case "cheeky":
        outline = eye ? arch(-13) : resample([[0,-21],[25,-8],[14,21],[-10,21],[-25,-8]]);
        y = 143;
        tilt = side * 0.14;
        break;
      case "cozy":
        outline = resample([[0,-6],[27,0],[18,9],[0,13],[-18,9],[-27,0]]);
        y = 146;
        tilt = side * -0.02;
        break;
      default:
        outline = capsule(33, 68);
        y = 142;
        tilt = side * -0.03;
    }

    outline.forEach(([px, py], index) => {
      const offset = eye * EYE_POINTS * 2 + index * 2;
      values[offset] = (eye ? 334 : 178) + px * Math.cos(tilt) - py * Math.sin(tilt);
      values[offset + 1] = y + px * Math.sin(tilt) + py * Math.cos(tilt);
    });
  }

  // Ink Color
  if (mood === "love") {
    values.set([232, 93, 120], COLOR);
  } else if (mood === "surprised" || mood === "awestruck") {
    values.set([18, 24, 48], COLOR);
  } else if (mood === "bashful" || mood === "tender") {
    values.set([42, 35, 40], COLOR);
  } else {
    values.set([16, 41, 34], COLOR);
  }

  // Blush Color and Opacity
  if (mood === "love") {
    values.set([248, 130, 142, 0.55], BLUSH);
  } else if (mood === "bashful") {
    values.set([255, 128, 148, 0.65], BLUSH);
  } else if (["joy", "tender", "grateful", "cozy", "excited", "hopeful"].includes(mood)) {
    values.set([249, 164, 144, 0.38], BLUSH);
  } else {
    values.set([249, 164, 144, 0], BLUSH);
  }

  return values;
}

export const PLAYGROUND_EXPRESSIONS = Object.fromEntries(
  PLAYGROUND_MOODS.map((m) => [m.id, buildPlaygroundExpression(m.id)])
);
