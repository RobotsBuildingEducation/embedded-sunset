// Playable chapter groups in the Robots curriculum. Intro is Chapter 0.
export const CODING_CHAPTERS = [
  { group: "tutorial", number: 0 },
  ...[1, 2, 3, 4, 5].map(number => ({ group: String(number), number })),
];
