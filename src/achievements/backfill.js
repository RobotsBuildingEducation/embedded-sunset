import { isAchievementAccount } from "./firestoreRecords.js";

// Independent of catalog releases: normal earning continues after this pass.
export const ACHIEVEMENT_BACKFILL_VERSION = 1;

export function createAchievementBackfill({ source, readMarker, writeMarker, scan }) {
  const finished = new Set(), prepared = new Map(), inFlight = new Map();
  return {
    async prepareBackfill(npub) {
      if (!isAchievementAccount(npub) || finished.has(npub)) return null;
      if (prepared.has(npub)) return prepared.get(npub);
      if (!inFlight.has(npub)) {
        const task = (async () => {
          const marker = await readMarker(npub);
          if (marker?.complete === true && marker.version === ACHIEVEMENT_BACKFILL_VERSION) {
            finished.add(npub);
            return null;
          }
          const result = { source, ...(await scan(npub)) };
          prepared.set(npub, result);
          return result;
        })();
        inFlight.set(npub, task);
        void task.finally(() => { if (inFlight.get(npub) === task) inFlight.delete(npub); }).catch(() => {});
      }
      return inFlight.get(npub);
    },
    async completeBackfill(npub) {
      if (!prepared.has(npub) || finished.has(npub)) return;
      // Called only after the imported events and all resulting awards have
      // been acknowledged by Firestore. Failed writes leave the pass pending.
      await writeMarker(npub, { source, version: ACHIEVEMENT_BACKFILL_VERSION,
        complete: true, completedAt: Math.floor(Date.now() / 1000) });
      finished.add(npub);
      prepared.delete(npub);
    },
  };
}

export function createFirestoreAchievementBackfill({ database, doc, getDoc, runTransaction, source, scan }) {
  const refFor = npub => doc(database, "users", npub, "achievementMigrations", `${source}_v${ACHIEVEMENT_BACKFILL_VERSION}`);
  return createAchievementBackfill({ source, scan,
    readMarker: async npub => (await getDoc(refFor(npub))).data(),
    writeMarker: (npub, marker) => runTransaction(database, async transaction => {
      const ref = refFor(npub);
      const current = (await transaction.get(ref)).data();
      if (current?.complete === true && current.version === marker.version) return;
      transaction.set(ref, marker);
    }),
  });
}

export async function applyAchievementBackfill(npub, backfill, { awardProgressionAchievements, awardAchievements }) {
  if (!backfill) return;
  for (const proof of backfill.proofs || []) {
    await awardProgressionAchievements({ npub, source: backfill.source, ...proof, notify: false });
  }
  if (backfill.achievementIds?.length) {
    await awardAchievements({ npub, achievementIds: backfill.achievementIds, notify: false });
  }
}

export async function finishAchievementBackfill(npub, adapter, persist) {
  await persist();
  await adapter.completeBackfill?.(npub);
}
