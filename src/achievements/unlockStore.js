import { ACHIEVEMENTS } from "./catalog.js";

// A session queue, separate from permanent transcript records. Switching
// accounts never exposes another learner's pending celebrations.
export function createUnlockStore() {
  let snapshot = { identity: "", language: "en", queue: [], revision: 0 };
  let serial = 0;
  const listeners = new Set();
  const update = next => { snapshot = next; listeners.forEach(listener => listener()); };
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    setIdentity(identity = "") {
      if (identity === snapshot.identity) return;
      update({ ...snapshot, identity, queue: [], revision: snapshot.revision + 1 });
    },
    setLanguage(language = "en") { if (snapshot.language !== language) update({ ...snapshot, language }); },
    recordsChanged() { update({ ...snapshot, revision: snapshot.revision + 1 }); },
    enqueue(identity, achievement, { test = false, preview = false } = {}) {
      if (identity !== snapshot.identity || !ACHIEVEMENTS[achievement?.id]) return;
      if (!preview && snapshot.queue.some(item => item.achievement.id === achievement.id && item.test === test)) return;
      update({ ...snapshot, queue: [...snapshot.queue, { key: ++serial, achievement: ACHIEVEMENTS[achievement.id], test, preview }] });
    },
    dismiss(key) { update({ ...snapshot, queue: snapshot.queue.filter(item => item.key !== key) }); },
  };
}

export const unlockStore = createUnlockStore();
export function previewAchievementUnlock(source) {
  const candidates = Object.values(ACHIEVEMENTS).filter(item => item.source === source && item.tier !== "completion");
  const achievement = candidates[Math.floor(Math.random() * candidates.length)];
  if (achievement) unlockStore.enqueue(unlockStore.getSnapshot().identity, achievement, { preview: true });
  return achievement;
}
