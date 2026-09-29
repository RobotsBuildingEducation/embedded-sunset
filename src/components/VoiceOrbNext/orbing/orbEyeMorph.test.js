import test from "node:test";
import assert from "node:assert/strict";
import { ORB_MOODS } from "./orbModel.js";
import { EYE_POINTS, createEyeMorph, advanceEyeMorph, eyeColors } from "./orbEyeMorph.js";

function largestDifference(a, b) {
  return Math.max(...a.map((value, index) => Math.abs(value - b[index])));
}

function area(values, eye) {
  const offset = eye * EYE_POINTS * 2;
  let sum = 0;
  for (let point = 0; point < EYE_POINTS; point++) {
    const a = offset + point * 2;
    const b = offset + ((point + 1) % EYE_POINTS) * 2;
    sum += values[a] * values[b + 1] - values[b] * values[a + 1];
  }
  return sum / 2;
}

test("every expression can morph into every other without collapsing or flipping", () => {
  for (const from of ORB_MOODS) {
    for (const to of ORB_MOODS) {
      const morph = createEyeMorph(from.id);
      for (let frame = 0; frame < 40; frame++) {
        advanceEyeMorph(morph, { mood: to.id, dt: 1 / 40 });
        assert.ok(morph.values.every(Number.isFinite));
        for (const eye of [0, 1]) assert.ok(area(morph.values, eye) > 100, `${from.id} → ${to.id}, eye ${eye}, frame ${frame}`);
      }
      assert.ok(largestDifference(morph.values, createEyeMorph(to.id).values) < 0.005, `${from.id} → ${to.id} must settle`);
    }
  }
});

test("retargeting partway through a morph preserves the visible shape and its velocity", () => {
  const morph = createEyeMorph("neutral");
  advanceEyeMorph(morph, { mood: "love", dt: 0.12 });
  const shape = morph.values.slice();
  const velocity = morph.velocity.slice();
  advanceEyeMorph(morph, { mood: "sleepy", dt: 0 });
  assert.ok(largestDifference(morph.values, shape) < 1e-10);
  assert.ok(largestDifference(morph.velocity, velocity) < 1e-10);
  advanceEyeMorph(morph, { mood: "sleepy", dt: 0.00001 });
  const expected = shape.map((value, index) => value + velocity[index] * 0.00001);
  assert.ok(largestDifference(morph.values, expected) < 0.00001);
});

test("eye motion has the same timing at 30 and 60 fps", () => {
  const slow = createEyeMorph("sleepy"), fast = createEyeMorph("sleepy");
  for (let i = 0; i < 12; i++) advanceEyeMorph(slow, { mood: "surprised", dt: 1 / 30 });
  for (let i = 0; i < 24; i++) advanceEyeMorph(fast, { mood: "surprised", dt: 1 / 60 });
  assert.ok(largestDifference(slow.values, fast.values) < 1e-9);
  assert.ok(largestDifference(slow.velocity, fast.velocity) < 1e-9);
});

test("heart color and blush interpolate along with the outline", () => {
  const morph = createEyeMorph("surprised");
  const black = eyeColors(morph), pink = eyeColors(createEyeMorph("love"));
  advanceEyeMorph(morph, { mood: "love", dt: 0.12 });
  const middle = eyeColors(morph);
  assert.notEqual(middle.ink, black.ink);
  assert.notEqual(middle.ink, pink.ink);
  assert.ok(middle.blushOpacity > black.blushOpacity && middle.blushOpacity < pink.blushOpacity);
  advanceEyeMorph(morph, { mood: "love", dt: 2 });
  assert.equal(eyeColors(morph).ink, pink.ink);
});

test("reduced motion applies the requested shape directly and clears all momentum", () => {
  const morph = createEyeMorph("joy");
  advanceEyeMorph(morph, { mood: "love", dt: 0.1 });
  advanceEyeMorph(morph, { mood: "sad", immediate: true });
  assert.deepEqual(morph.values, createEyeMorph("sad").values);
  assert.ok(morph.velocity.every((value) => value === 0));
});

test("thinking gaze also eases in without restarting the expression", () => {
  const morph = createEyeMorph("curious");
  const start = morph.values.slice();
  advanceEyeMorph(morph, { mood: "curious", state: "thinking", time: 1, dt: 1 / 40 });
  assert.ok(morph.values[0] > start[0] && morph.values[0] - start[0] < 1);
  assert.equal(morph.values[1], start[1]);
});
