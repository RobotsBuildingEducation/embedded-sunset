import { useEffect, useSyncExternalStore } from "react";
import { unlockStore } from "./unlockStore.js";

export function useAchievementAccount(npub, services, language = "en") {
  useEffect(() => unlockStore.setLanguage(language), [language]);
  useEffect(() => {
    unlockStore.setIdentity(npub || "");
    const refresh = () => {
      if (!npub) return;
      void services.restoreAchievements?.(npub).catch(error => console.warn("Achievement account restore:", error));
      void services.syncAchievements(npub).catch(error => console.warn("Achievement account sync:", error));
    };
    refresh();
    window.addEventListener("online", refresh);
    return () => window.removeEventListener("online", refresh);
  }, [npub, services]);
}

export function useAchievementUnlock() {
  const state = useSyncExternalStore(unlockStore.subscribe, unlockStore.getSnapshot, unlockStore.getSnapshot);
  return { unlock: state.queue[0] || null, revision: state.revision, language: state.language,
    dismiss: () => { if (state.queue[0]) unlockStore.dismiss(state.queue[0].key); } };
}
