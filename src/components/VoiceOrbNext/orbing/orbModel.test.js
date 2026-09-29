import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ORB_COLORS, DEFAULT_ORB_PALETTE, DISPLAY_MOODS, DISPLAY_REACTIONS, LOADER_ORB, ORB_MOODS, ORB_PALETTES, ORB_STATES, REACTION_DURATION, TUTOR_CORRECT_MOODS, TUTOR_WRONG_MOODS, randomDisplayOrb, randomLoaderOrb, randomTutorFeedback, reactionPose, resolveOrbMood, simulatedVoiceLevel } from "./orbModel.js";

test("reactions settle back to the base pose and stay bounded throughout", () => {
  const limits = { x: 0.3, y: 1.6, squash: 0.4, roll: 0.4, turn: 10, pitch: 0.3, burst: 1.5 };
  for (const [kind, duration] of Object.entries(REACTION_DURATION)) {
    for (let elapsed = 0; elapsed <= duration; elapsed += 0.005) {
      const pose = reactionPose(kind, elapsed, 1.5);
      for (const [key, value] of Object.entries(pose)) {
        assert.ok(Number.isFinite(value) && Math.abs(value) <= limits[key], `${kind}.${key} at ${elapsed}: ${value}`);
      }
      assert.ok(1 - pose.squash > 0, "squash must never invert the mesh");
    }
    for (const elapsed of [-1, duration, duration + 1]) {
      assert.ok(Object.values(reactionPose(kind, elapsed)).every((value) => value === 0));
    }
  }
});

test("zero motion removes every action offset, including a celebration", () => {
  for (const [kind, duration] of Object.entries(REACTION_DURATION)) {
    for (const fraction of [0.1, 0.3, 0.5, 0.9]) {
      assert.ok(Object.values(reactionPose(kind, duration * fraction, 0)).every((value) => value === 0));
    }
  }
});

test("hop anticipates before leaving the floor and spin completes a full turn", () => {
  const anticipation = reactionPose("bounce", 0.11);
  assert.equal(anticipation.y, 0);
  assert.ok(anticipation.squash > 0.2);
  assert.ok(reactionPose("bounce", 0.4).y > 0.5);
  assert.ok(Math.abs(reactionPose("spin", 2.3).turn - Math.PI * 2) < 0.001);
});

test("spins return to the front at every energy, rather than cutting from a partial turn", () => {
  for (const energy of [0.1, 0.4, 0.7, 1, 1.5]) {
    const before = reactionPose("spin", REACTION_DURATION.spin - 0.001, energy);
    const after = reactionPose("spin", REACTION_DURATION.spin, energy);
    assert.ok(Math.abs(before.turn - Math.PI * 2) < 0.001);
    assert.ok(Math.abs(Math.sin((before.turn - after.turn) / 2)) < 0.001, `orientation changed at energy ${energy}`);
  }
});

test("all reactions finish at rest with negligible displacement and velocity", () => {
  const dt = 0.001;
  for (const [kind, duration] of Object.entries(REACTION_DURATION)) {
    for (const energy of [0.3, 0.7, 1.5]) {
      const before = reactionPose(kind, duration - dt * 2, energy);
      const end = reactionPose(kind, duration - dt, energy);
      for (const key of ["x", "y", "squash", "roll", "pitch", "burst"]) {
        assert.ok(Math.abs(end[key]) < 0.00001, `${kind}.${key} must arrive at rest`);
        assert.ok(Math.abs((end[key] - before[key]) / dt) < 0.001, `${kind}.${key} must slow down before stopping`);
      }
    }
  }
});

test("voice states and nudges preserve the selected feeling; boop reacts with love", () => {
  for (const state of ["idle", "listening", "thinking", "speaking"]) {
    assert.equal(resolveOrbMood("sad", state, null), "sad");
    assert.equal(resolveOrbMood("sad", state, "celebrate"), "sad");
    assert.equal(resolveOrbMood("sad", state, "wave"), "sad");
    assert.equal(resolveOrbMood("sad", state, "boop"), "love");
  }
  assert.equal(resolveOrbMood("joy", "thinking", null), "joy");
  assert.equal(resolveOrbMood("unknown", "idle", null), "neutral");
});

test("display orb draws from every requested feeling, voice state, and nudge", () => {
  const choices = Array.from({ length: 28 }, (_, index) => randomDisplayOrb(() => (index + 0.01) / 28));
  assert.deepEqual(new Set(choices.map((choice) => choice.mood)), new Set(DISPLAY_MOODS));
  assert.deepEqual(new Set(choices.map((choice) => choice.state)), new Set(ORB_STATES.map((state) => state.id)));
  assert.deepEqual(new Set(choices.map((choice) => choice.reaction)), new Set(DISPLAY_REACTIONS));
});

test("links display orbs never select thinking", () => {
  const states = Array.from({ length: 100 }, (_, index) => randomDisplayOrb(() => index / 100, { excludeThinking: true }).state);
  assert.deepEqual(new Set(states), new Set(["idle", "listening", "speaking"]));
});

test("loaders can independently select every feeling, voice state, and behavior", () => {
  const combinations = new Set();
  for (let mood = 0; mood < ORB_MOODS.length; mood++) {
    for (let state = 0; state < ORB_STATES.length; state++) {
      for (let reaction = 0; reaction < DISPLAY_REACTIONS.length; reaction++) {
        const draws = [mood / ORB_MOODS.length, state / ORB_STATES.length, reaction / DISPLAY_REACTIONS.length];
        const choice = randomLoaderOrb(() => draws.shift());
        assert.ok(ORB_MOODS.some((item) => item.id === choice.mood));
        assert.ok(ORB_STATES.some((item) => item.id === choice.state));
        assert.ok(DISPLAY_REACTIONS.includes(choice.reaction));
        combinations.add(JSON.stringify(choice));
      }
    }
  }
  assert.equal(combinations.size, ORB_MOODS.length * ORB_STATES.length * DISPLAY_REACTIONS.length);
});

test("a loader changes all three choices on each reroll, even with repeated random draws", () => {
  for (const draw of [0, 0.25, 0.5, 0.75, 0.999]) {
    let previous = randomLoaderOrb(() => draw);
    for (let turn = 0; turn < 20; turn++) {
      const next = randomLoaderOrb(() => draw, previous);
      assert.notEqual(next.mood, previous.mood);
      assert.notEqual(next.state, previous.state);
      assert.notEqual(next.reaction, previous.reaction);
      previous = next;
    }
  }
});

test("correct tutor feedback gets one positive feeling and behavior; wrong feedback has no behavior", () => {
  const outcomes = Array.from({ length: 20 }, (_, index) => randomTutorFeedback("correct", () => index / 20));
  assert.deepEqual(new Set(outcomes.map((outcome) => outcome.mood)), new Set(TUTOR_CORRECT_MOODS));
  assert.deepEqual(new Set(outcomes.map((outcome) => outcome.reaction)), new Set(DISPLAY_REACTIONS));
  const wrong = Array.from({ length: 20 }, (_, index) => randomTutorFeedback("wrong", () => index / 20));
  assert.deepEqual(new Set(wrong.map((outcome) => outcome.mood)), new Set(TUTOR_WRONG_MOODS));
  assert.ok(wrong.every((outcome) => outcome.reaction === null));
});

test("simulated voice amplitude is finite, normalized, and varies over time", () => {
  const levels = Array.from({ length: 300 }, (_, index) => simulatedVoiceLevel(index / 30));
  assert.ok(levels.every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
  assert.ok(Math.max(...levels) - Math.min(...levels) > 0.5);
});

test("default palette is orange and resolves to three valid hex tones", () => {
  assert.equal(DEFAULT_ORB_PALETTE, "orange");
  const orangePalette = ORB_PALETTES.find((p) => p.id === "orange");
  assert.ok(orangePalette, "Orange palette must exist in ORB_PALETTES");
  assert.deepEqual(DEFAULT_ORB_COLORS, orangePalette.colors);
  assert.equal(DEFAULT_ORB_COLORS.length, 3);
  for (const color of DEFAULT_ORB_COLORS) {
    assert.match(color, /^#[0-9a-fA-F]{6}$/);
  }
});

test("LOADER_ORB defines a single steady expression for loaders", () => {
  assert.equal(LOADER_ORB.mood, "neutral");
  assert.equal(LOADER_ORB.state, "thinking");
  assert.equal(LOADER_ORB.reaction, null);
});

