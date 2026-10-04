import { useEffect, useSyncExternalStore } from "react";
import { unlockStore } from "./unlockStore.js";
import { progressRevision, subscribeProgress } from "./progressionRuntime.js";
import { syncStatus } from "./syncStatus.js";

export function useAchievementAccount(npub, services, language = "en") {
  useEffect(() => unlockStore.setLanguage(language), [language]);
  useEffect(() => {
    unlockStore.setIdentity(npub || "");
    const refresh = () => {
      if (!npub) return;
      if (services.resumeAchievementSync) { services.resumeAchievementSync(npub); return; }
      void services.restoreAchievements?.(npub).catch(error => console.warn("Achievement account restore:", error));
      void services.syncAchievements(npub).catch(error => console.warn("Achievement account sync:", error));
    };
    refresh();
    const stopWatching = services.watchAchievementProgress?.(npub);
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    const onStorage = event => services.receiveAchievementStorage?.(npub, event);
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      services.pauseAchievementSync?.(npub);
      stopWatching?.();
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [npub, services]);
}

export function useAchievementProgress(npub, source) {
  return useSyncExternalStore(subscribeProgress, () => progressRevision(npub, source), () => 0);
}
export function useAchievementSyncStatus(npub) {
  useSyncExternalStore(syncStatus.subscribe, syncStatus.getSnapshot, syncStatus.getSnapshot);
  return syncStatus.forAccount(npub);
}

export function useAchievementUnlock() {
  const state = useSyncExternalStore(unlockStore.subscribe, unlockStore.getSnapshot, unlockStore.getSnapshot);
  return { unlock: state.queue[0] || null, revision: state.revision, language: state.language,
    dismiss: () => { if (state.queue[0]) unlockStore.dismiss(state.queue[0].key); } };
}
