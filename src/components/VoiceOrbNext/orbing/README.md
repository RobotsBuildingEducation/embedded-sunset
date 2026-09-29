# Orbing

Visit `/orbing` for the VoiceOrb 3D playground. The route is public and lazy loaded.
It uses the existing Three.js dependency and generates its materials, face, lighting,
and geometry locally. No downloaded models, textures, or new dependencies are needed.

App placements use `../VoiceOrbNext.jsx`, which keeps the original VoiceOrb theme,
size, and centering props. Its default `display` variant picks a random feeling,
voice state, and nudge on mount and refreshes them during longer waits. Display
orbs use maximum energy and respond to a tap with a boop. Icon-sized placements
use a CSS version with the same choices. The `tutor` variant follows the live
`state` prop and is used in Conversations, RealTimeTest, Tutor, and Proficiency.
It sleeps in Idle before a call, chooses Content or Surprised during a call,
and briefly reacts to answer verdicts. Correct answers get one positive
feeling and one nudge; wrong answers get Curious or Tender without a nudge.
Proficiency has no answer-by-answer verdict, so it uses the call states only.
App placements use the selected Chakra accent color in either light or dark mode,
including orange by default. Their 2D fallback and 3D material share those
colors. An explicit `palette` still selects a playground palette. The original
`../VoiceOrb.jsx` remains available.

## Reuse the character

`../VoiceOrb3D.jsx` accepts the original `state` vocabulary (`idle`, `listening`,
`speaking`) plus `thinking`. Feelings are controlled separately through `mood`:
`joy`, `curious`, `love`, `excited`, `surprised`, `sleepy`, `sad`, or `neutral`.

```jsx
<div style={{ position: "relative", width: 400, height: 400 }}>
  <VoiceOrb3D
    state="listening"
    mood="curious"
    palette="mint"
    audioLevelRef={normalizedAmplitudeRef}
    onInteract={(kind) => setReaction({ kind, id: ++reactionId.current })}
    reaction={reaction}
  />
</div>
```

Import `orbing.css` alongside the character. Its positioning and accessible
fallback are defined there. Pass a normalized 0–1 `audioLevelRef` for live audio;
without it, voice states use a simulated rhythm. No speech service is connected.
The playground's optional microphone only measures local amplitude and stops on
unmount, reset, a different voice state, or when the tab is hidden.

Other props: `energy` (0–1.5), `voiceLevel` (0–1), `followPointer`, `paused`,
`reducedMotion`, and `dark`. `reaction` takes a unique `id` plus `kind`:
`boop`, `wave`, `bounce`, `spin`, or `celebrate`. The playground respects the OS
reduced-motion setting and keeps voice and expression controls available when
animation is paused. The playground plays a short sound for each reaction and
has a Reaction sounds switch linked to the app's sound setting.

The renderer caps pixel density, suspends rendering outside the viewport or in a
hidden tab, and disposes its GPU resources and listeners on unmount. A CSS orb is
shown when WebGL cannot start or its context is lost.

Voice states also drive the material: idle drifts slowly, listening sends ripples
through the pigment, thinking curls the color inward, and speaking produces an
audio-reactive spiral. State changes smoothly blend the flow and color coverage
within the selected palette. The face uses only eyes and soft cheek color.
Eye outlines, positions, colors, and blush morph together with a damped spring.
Changing feelings during a transition preserves the current shape and movement;
blinking remains independent. Reduced motion applies the chosen expression directly.

Reactions complete on the renderer's clock after a gentle settle. Energy changes
the flourish without shortening a spin's full turn. `onReactionComplete(id)` lets
the parent clear its reaction UI once the animation has returned to rest.

## Checks

```sh
node --test src/components/orbing/*.test.js
npx eslint src/components/orbing src/components/VoiceOrb3D.jsx
npm run build
```
