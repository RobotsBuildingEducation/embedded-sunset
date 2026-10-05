import { ACHIEVEMENTS, CATALOG_VERSION } from "./catalog.js";
import { localizeAchievement } from "./copy.js";
import { mergeProgressLedgers } from "./progressionRuntime.js";
import { flashcardEvidenceForLedger } from "./flashcardProgress.js";

export const PROGRESS_SOURCES = ["nosabos", "robotsbuildingeducation"];
export async function completionDocumentId(metric, id) {
  // IDs may contain slashes or long provider IDs; hash the full tuple instead
  // of truncating it or using it as a Firestore path.
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify([metric, id])));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
function progressFromSnapshot(snapshot, source) {
  const ledger = {};
  for (const document of snapshot.docs) {
    const value = document.data();
    if (value.source !== source || typeof value.metric !== "string" || typeof value.completionId !== "string") continue;
    Object.defineProperty(ledger, value.metric, { value: { ...ledger[value.metric], [value.completionId]: 1 }, enumerable: true, configurable: true });
  }
  return mergeProgressLedgers(ledger);
}
async function withConcurrency(items, run, limit = 8) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await run(items[next++]);
  }));
}

export const isAchievementAccount = npub => /^npub1[023456789acdefghjklmnpqrstuvwxyz]{58}$/.test(npub || "");
export function preferAwardRecord(current, incoming) {
  if (!incoming || !Number.isFinite(incoming.unlockedAt) || incoming.unlockedAt <= 0) return current;
  if (!current || (current.test && !incoming.test) || (Boolean(current.test) === Boolean(incoming.test) && incoming.unlockedAt < current.unlockedAt)) return incoming;
  return current;
}

// Host adapters provide their own Firebase instance. One document per award
// prevents an ever-growing profile and makes repeated saves idempotent.
export function createAchievementPersistence({ database, collection, doc, getDocs, runTransaction, onSnapshot, progressEvidence }) {
  const saved = new Map();
  const pending = new Map();
  const rememberProgress = (npub, source, snapshot) => {
    for (const document of snapshot.docs) saved.set(`progress:${npub}:${source}:${document.id}`, true);
    return progressFromSnapshot(snapshot, source);
  };
  return {
    evidenceForProgress: (source, ledger) => [
      ...(source === "nosabos" ? flashcardEvidenceForLedger(ledger) : []),
      ...(progressEvidence?.(source, ledger) || []),
    ],
    async loadProgress(npub, source) {
      if (!isAchievementAccount(npub) || !PROGRESS_SOURCES.includes(source)) return {};
      const snapshot = await getDocs(collection(database, "users", npub, "achievementProgress", source, "events"));
      return rememberProgress(npub, source, snapshot);
    },
    watchProgress(npub, source, onProgress, onError) {
      if (!onSnapshot || !isAchievementAccount(npub) || !PROGRESS_SOURCES.includes(source)) return () => {};
      return onSnapshot(collection(database, "users", npub, "achievementProgress", source, "events"),
        { includeMetadataChanges: true }, snapshot => {
          if (!snapshot.metadata?.hasPendingWrites && !snapshot.metadata?.fromCache) onProgress(rememberProgress(npub, source, snapshot));
        }, onError);
    },
    async saveProgress(npub, source, ledger) {
      if (!isAchievementAccount(npub) || !PROGRESS_SOURCES.includes(source)) return;
      const entries = Object.entries(mergeProgressLedgers(ledger)).flatMap(([metric, completions]) => Object.keys(completions).map(id => ({ metric, id })));
      await withConcurrency(entries, async ({ metric, id }) => {
        const documentId = await completionDocumentId(metric, id);
        const key = `progress:${npub}:${source}:${documentId}`;
        if (saved.has(key)) return;
        const task = (pending.get(key) || Promise.resolve()).catch(() => {}).then(async () => {
          if (saved.has(key)) return;
          const ref = doc(database, "users", npub, "achievementProgress", source, "events", documentId);
          await runTransaction(database, async transaction => {
            const existing = await transaction.get(ref);
            if (!existing.exists()) transaction.set(ref, { source, metric, completionId: id, version: 1 });
          });
          saved.set(key, true);
        });
        pending.set(key, task);
        try { await task; } finally { if (pending.get(key) === task) pending.delete(key); }
      });
    },
    async load(npub) {
      if (!isAchievementAccount(npub)) return {};
      const snapshot = await getDocs(collection(database, "users", npub, "achievements"));
      return Object.fromEntries(snapshot.docs.map(item => {
        const value = item.data();
        return [item.id, { unlockedAt: value.unlockedAt, source: value.source,
          catalogVersion: value.catalogVersion, ...(value.test ? { test: true } : {}) }];
      }));
    },
    async save(npub, records) {
      if (!isAchievementAccount(npub)) return;
      await Promise.all(Object.entries(records).filter(([id]) => ACHIEVEMENTS[id]).map(async ([id, incoming]) => {
        const key = `${npub}:${id}`;
        const signature = JSON.stringify(incoming);
        if (saved.get(key) === signature) return;
        const prior = pending.get(key) || Promise.resolve();
        const task = prior.catch(() => {}).then(async () => {
          if (saved.get(key) === signature) return;
          const ref = doc(database, "users", npub, "achievements", id);
          await runTransaction(database, async transaction => {
            const existing = await transaction.get(ref);
            const current = existing.exists() ? existing.data() : null;
            const chosen = preferAwardRecord(current, incoming);
            if (chosen !== incoming) return;
            const achievement = localizeAchievement(ACHIEVEMENTS[id], "en");
            transaction.set(ref, { unlockedAt: incoming.unlockedAt, catalogVersion: incoming.catalogVersion || CATALOG_VERSION,
              achievementId: id, source: achievement.source,
              title: achievement.title, description: achievement.desc, orb: achievement.orb,
              number: achievement.number, test: Boolean(incoming.test) });
          });
          saved.set(key, signature);
        });
        pending.set(key, task);
        try { await task; } finally { if (pending.get(key) === task) pending.delete(key); }
      }));
    },
  };
}
