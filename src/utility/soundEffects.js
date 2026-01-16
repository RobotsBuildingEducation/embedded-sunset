const getSoundManager = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.soundManager ||
    window.SoundManager ||
    window.soundManagerInstance ||
    null
  );
};

export const playSoundEffect = (soundName) => {
  const manager = getSoundManager();
  if (!manager) {
    return;
  }

  if (typeof manager.play === "function") {
    manager.play(soundName);
    return;
  }

  if (typeof manager.playSound === "function") {
    manager.playSound(soundName);
    return;
  }

  if (typeof manager.trigger === "function") {
    manager.trigger(soundName);
  }
};
