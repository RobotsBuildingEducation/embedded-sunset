export const playSoundEffect = (soundKey) => {
  if (typeof window === "undefined") {
    return;
  }

  const manager = window.soundManager;
  if (manager && typeof manager.play === "function") {
    manager.play(soundKey);
  }
};
