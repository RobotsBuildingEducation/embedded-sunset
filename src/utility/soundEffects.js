const getSoundManager = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.soundManager ||
    window.SoundManager ||
    window.soundManagerInstance ||
    window.soundLab ||
    window.soundLabManager ||
    window.soundLabInstance ||
    null
  );
};

const invokeManager = (manager, soundName) => {
  if (!manager) {
    return false;
  }

  if (typeof manager === "function") {
    manager(soundName);
    return true;
  }

  if (typeof manager.play === "function") {
    manager.play(soundName);
    return true;
  }

  if (typeof manager.playSound === "function") {
    manager.playSound(soundName);
    return true;
  }

  if (typeof manager.playSoundEffect === "function") {
    manager.playSoundEffect(soundName);
    return true;
  }

  if (typeof manager.trigger === "function") {
    manager.trigger(soundName);
    return true;
  }

  if (soundName && typeof manager[soundName] === "function") {
    manager[soundName]();
    return true;
  }

  return false;
};

export const playSoundEffect = (soundName, { retries = 2 } = {}) => {
  const manager = getSoundManager();
  if (invokeManager(manager, soundName)) {
    return;
  }

  if (retries <= 0) {
    return;
  }

  setTimeout(() => {
    playSoundEffect(soundName, { retries: retries - 1 });
  }, 75);
};
