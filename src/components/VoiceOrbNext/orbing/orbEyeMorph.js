// All expressions share a clockwise outline, starting at the top center.
// Equal-distance samples let capsules, arches, hearts, and ovals become one
// another without overlapping drawings or switching paths mid-transition.
export const EYE_POINTS = 64;
export const EYE_COORDINATES = EYE_POINTS * 2 * 2;
const COLOR = EYE_COORDINATES;
const BLUSH = COLOR + 3;
const TAU = Math.PI * 2;

function resample(points) {
  const lengths = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return Math.hypot(next[0] - point[0], next[1] - point[1]);
  });
  const perimeter = lengths.reduce((total, length) => total + length, 0);
  let edge = 0, start = 0;
  return Array.from({ length: EYE_POINTS }, (_, index) => {
    const distance = index / EYE_POINTS * perimeter;
    while (edge < points.length - 1 && start + lengths[edge] < distance) start += lengths[edge++];
    const mix = lengths[edge] ? (distance - start) / lengths[edge] : 0;
    const a = points[edge], b = points[(edge + 1) % points.length];
    return [a[0] + (b[0] - a[0]) * mix, a[1] + (b[1] - a[1]) * mix];
  });
}

function arc(points, x, y, radius, from, to, steps = 24) {
  for (let i = 0; i <= steps; i++) {
    const angle = from + (to - from) * i / steps;
    points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
  }
}

function capsule(width, height) {
  const radius = width / 2;
  const points = [];
  arc(points, 0, -height / 2 + radius, radius, -Math.PI / 2, 0);
  arc(points, 0, height / 2 - radius, radius, 0, Math.PI);
  arc(points, 0, -height / 2 + radius, radius, Math.PI, Math.PI * 1.5);
  return resample(points);
}

function arch(height) {
  const points = [];
  const center = (t) => [-23 + 46 * t, 5 - (2 * height + 10) * t * (1 - t)];
  const normal = (t) => {
    const dy = -(2 * height + 10) * (1 - 2 * t);
    const length = Math.hypot(46, dy);
    return [dy / length, -46 / length];
  };
  const edge = (from, to, side) => {
    for (let i = 0; i <= 48; i++) {
      const t = from + (to - from) * i / 48;
      const c = center(t), n = normal(t);
      points.push([c[0] + n[0] * 10 * side, c[1] + n[1] * 10 * side]);
    }
  };
  edge(0.5, 1, 1);
  const right = center(1), rn = normal(1);
  const rightAngle = Math.atan2(rn[1], rn[0]);
  arc(points, right[0], right[1], 10, rightAngle, rightAngle + Math.PI);
  edge(1, 0, -1);
  const left = center(0), ln = normal(0);
  const leftAngle = Math.atan2(-ln[1], -ln[0]);
  arc(points, left[0], left[1], 10, leftAngle, leftAngle + Math.PI);
  edge(0, 0.5, 1);
  return resample(points);
}

function heart() {
  const points = [];
  const curve = (a, b, c, d) => {
    for (let i = 0; i < 64; i++) {
      const t = i / 64, s = 1 - t;
      points.push([0, 1].map((axis) => (s ** 3 * a[axis] + 3 * s * s * t * b[axis] + 3 * s * t * t * c[axis] + t ** 3 * d[axis]) * 0.9));
    }
  };
  curve([0, -23], [27, -49], [55, -10], [0, 22]);
  curve([0, 22], [-55, -10], [-27, -49], [0, -23]);
  return resample(points);
}

function expression(mood) {
  const values = new Float64Array(EYE_COORDINATES + 7);
  for (let eye = 0; eye < 2; eye++) {
    const side = eye ? 1 : -1;
    let outline, y, tilt = 0;
    switch (mood) {
      case "love": outline = heart(); y = 147; break;
      case "joy": case "excited":
        outline = arch(mood === "excited" ? 49 : 30); y = 146; tilt = side * -0.08; break;
      case "sleepy": outline = arch(-10); y = 145; break;
      case "sad": outline = capsule(27, 45); y = 151; tilt = side * -0.21; break;
      case "surprised":
        outline = resample(Array.from({ length: 128 }, (_, i) => {
          const angle = i / 128 * TAU - Math.PI / 2;
          return [Math.cos(angle) * 27, Math.sin(angle) * 36];
        }));
        y = 142; break;
      case "curious": outline = capsule(31, eye ? 76 : 51); y = 143 - eye * 10; tilt = side * -0.06; break;
      default: outline = capsule(33, 68); y = 142; tilt = side * -0.03;
    }
    outline.forEach(([px, py], index) => {
      const offset = eye * EYE_POINTS * 2 + index * 2;
      values[offset] = (eye ? 334 : 178) + px * Math.cos(tilt) - py * Math.sin(tilt);
      values[offset + 1] = y + px * Math.sin(tilt) + py * Math.cos(tilt);
    });
  }
  values.set(mood === "love" ? [232, 93, 120] : mood === "surprised" ? [0, 0, 0] : [16, 41, 34], COLOR);
  values.set(mood === "love" ? [248, 130, 142, 0.55] : [249, 164, 144, ["joy", "sad"].includes(mood) ? 0.3 : 0], BLUSH);
  return values;
}

const EXPRESSIONS = Object.fromEntries(["neutral", "joy", "curious", "love", "excited", "surprised", "sleepy", "sad"].map((mood) => [mood, expression(mood)]));

export function createEyeMorph(mood = "neutral") {
  return {
    values: new Float64Array(EXPRESSIONS[mood] || EXPRESSIONS.neutral),
    velocity: new Float64Array(EYE_COORDINATES + 7),
  };
}

export function advanceEyeMorph(morph, { mood, state = "idle", time = 0, dt = 0, immediate = false }) {
  const target = EXPRESSIONS[mood] || EXPRESSIONS.neutral;
  const gaze = mood === "curious" && state === "thinking" ? Math.sin(time * 0.9) * 7 : 0;
  const step = Math.max(0, dt);
  const frequency = 14;
  const decay = Math.exp(-frequency * step);
  for (let index = 0; index < target.length; index++) {
    const destination = target[index] + (index < EYE_COORDINATES && index % 2 === 0 ? gaze : 0);
    if (immediate) {
      morph.values[index] = destination;
      morph.velocity[index] = 0;
      continue;
    }
    // Exact critically damped spring step. Retarget the CURRENT outline and
    // velocity, so rapid mood changes never restart from an old expression.
    const offset = morph.values[index] - destination;
    const velocity = morph.velocity[index];
    const impulse = velocity + frequency * offset;
    morph.values[index] = destination + (offset + impulse * step) * decay;
    morph.velocity[index] = (velocity - frequency * impulse * step) * decay;
  }
  return morph;
}

export function eyeColors(morph) {
  const values = morph.values;
  const channel = (index) => Math.round(Math.max(0, Math.min(255, values[index])));
  return {
    ink: `rgb(${channel(COLOR)}, ${channel(COLOR + 1)}, ${channel(COLOR + 2)})`,
    blush: `${channel(BLUSH)}, ${channel(BLUSH + 1)}, ${channel(BLUSH + 2)}`,
    blushOpacity: Math.max(0, Math.min(1, values[BLUSH + 3])),
  };
}
