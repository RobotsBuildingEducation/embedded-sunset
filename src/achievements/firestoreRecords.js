import { ACHIEVEMENTS, CATALOG_VERSION } from "./catalog.js";
import { localizeAchievement } from "./copy.js";

export const isAchievementAccount = npub => /^npub1[023456789acdefghjklmnpqrstuvwxyz]{58}$/.test(npub || "");
export function preferAwardRecord(current, incoming) {
  if (!incoming || !Number.isFinite(incoming.unlockedAt) || incoming.unlockedAt <= 0) return current;
  if (!current || (current.test && !incoming.test) || (Boolean(current.test) === Boolean(incoming.test) && incoming.unlockedAt < current.unlockedAt)) return incoming;
  return current;
}

// Host adapters provide their own Firebase instance. One document per award
// prevents an ever-growing profile and makes repeated saves idempotent.
export function createAchievementPersistence({ database, collection, doc, getDocs, runTransaction }) {
  const saved = new Map();
  const pending = new Map();
  return {
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
