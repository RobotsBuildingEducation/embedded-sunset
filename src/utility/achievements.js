import { earnedProgressionIds, meetsProgressionRequirement } from "../achievements/progressionEvidence.js";
import { unlockStore } from "../achievements/unlockStore.js";
import { createRetrySync } from "../achievements/retrySync.js";
import { localJournal } from "../achievements/localJournal.js";
import { syncStatus } from "../achievements/syncStatus.js";
import { withSyncDeadline, confirmRelayPublish, createSingleFlight } from "../achievements/syncDeadline.js";
import { progressionSnapshot, readProgressLedger, mergeStoredProgress, restoreProgressJournal, subscribeProgress, refreshProgressRevision } from "../achievements/progressionRuntime.js";
import { ACHIEVEMENTS, CATALOG_VERSION, completeCollectionAwards, earnedTutorAchievementIds, hasEarnedRequirement, hasCompletedCourses, isCatalogAchievement } from "../achievements/catalog.js";
export { ACHIEVEMENTS } from "../achievements/catalog.js";
import { finalizeEvent, getPublicKey, nip19, SimplePool, verifyEvent } from "nostr-tools";

export const ACHIEVEMENT_KIND = 30078;
export const ACHIEVEMENT_D = "learning-achievements";
export const ACHIEVEMENT_TAG = "learning-achievements";
export const ACHIEVEMENT_RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.ditto.pub",
  "wss://nos.lol",
];

const LOCAL_STORAGE_KEY_PREFIX = "learning_achievements_v1_";
const QUERY_TIMEOUT_MS = 6000;
const hasBrowserStorage = () => typeof window !== "undefined" && Boolean(window.document);
const persistence = () => import("../achievements/hostPersistence.js").then(module => module.achievementPersistence);
const PROGRESS_SOURCES = ["nosabos", "robotsbuildingeducation"];
const retryOptions = channel => ({ journal: localJournal, channel,
  onStatus: (npub, pending) => syncStatus.set(npub, channel, pending),
  onError: error => console.warn(`Achievement ${channel} sync pending:`, error) });
const cloudSync = createRetrySync(syncCloudAchievements, retryOptions("cloud"));
const relaySync = createRetrySync(npub => syncAchievements(npub, { strict: true }), retryOptions("relay"));
const signerRequest = createSingleFlight();
const scheduleAchievementSync = npub => { cloudSync.schedule(npub); relaySync.schedule(npub); };
subscribeProgress(npub => { if (hasBrowserStorage()) cloudSync.schedule(npub); });

const hydrated = new Map();
const storedKey = key => { try { return localStorage.getItem(key) || ""; } catch { return ""; } };
async function hydrateAchievementJournal(npub) {
  if (!hydrated.has(npub)) hydrated.set(npub, (async () => {
    const before = getStoredAchievements(npub);
    await localJournal.restore(`${LOCAL_STORAGE_KEY_PREFIX}${npub || "guest"}`, mergeAchievementMaps);
    await Promise.all(PROGRESS_SOURCES.map(source => restoreProgressJournal(npub, source)));
    if (JSON.stringify(before) !== JSON.stringify(getStoredAchievements(npub))) unlockStore.recordsChanged();
  })());
  await hydrated.get(npub);
}

async function evaluateRestoredProgress(npub, adapter) {
  for (const source of PROGRESS_SOURCES) {
    await awardProgressionAchievements({ npub, source });
    for (const evidence of adapter?.evidenceForProgress(source, readProgressLedger(npub, source)) || []) {
      await awardProgressionAchievements({ npub, source, evidence });
    }
  }
}

async function syncCloudAchievements(npub) {
  await withSyncDeadline(hydrateAchievementJournal(npub));
  const adapter = await persistence();
  const [remoteAwards, ...remoteProgress] = await withSyncDeadline(Promise.all([
    adapter.load(npub), ...PROGRESS_SOURCES.map(source => adapter.loadProgress(npub, source)),
  ]));
  // Read local state after the network returns: a task may finish during it.
  const current = getStoredAchievements(npub);
  const merged = completeCourseAward(mergeAchievementMaps(current, remoteAwards));
  storeAchievements(npub, merged, { schedule: false });
  if (JSON.stringify(current) !== JSON.stringify(merged)) relaySync.schedule(npub);
  PROGRESS_SOURCES.forEach((source, index) => mergeStoredProgress(npub, source, remoteProgress[index]));
  await evaluateRestoredProgress(npub, adapter);
  const awards = getStoredAchievements(npub);
  const ledgers = PROGRESS_SOURCES.map(source => readProgressLedger(npub, source));
  await withSyncDeadline(Promise.all([
    adapter.save(npub, awards),
    ...PROGRESS_SOURCES.map((source, index) => adapter.saveProgress(npub, source, ledgers[index])),
  ]));
  localJournal.confirmRemoteSave(`${LOCAL_STORAGE_KEY_PREFIX}${npub}`, awards);
  PROGRESS_SOURCES.forEach((source, index) => localJournal.confirmRemoteSave(`learning_achievement_progress_v4:${npub}:${source}`, ledgers[index]));
}

export function resumeAchievementSync(npub) {
  if (!npub || !hasBrowserStorage()) return;
  cloudSync.resume(npub); relaySync.resume(npub);
}
export function pauseAchievementSync(npub) { cloudSync.pause(npub); relaySync.pause(npub); }
export function receiveAchievementStorage(npub, event) {
  if (!npub || !event.newValue) return;
  try {
    if (event.key === `${LOCAL_STORAGE_KEY_PREFIX}${npub}`) {
      storeAchievements(npub, mergeAchievementMaps(getStoredAchievements(npub), JSON.parse(event.newValue)));
      unlockStore.recordsChanged();
    }
    for (const source of PROGRESS_SOURCES) {
      if (event.key !== `learning_achievement_progress_v4:${npub}:${source}`) continue;
      mergeStoredProgress(npub, source, JSON.parse(event.newValue));
      refreshProgressRevision(npub, source);
      void evaluateRestoredProgress(npub).catch(error => console.warn("Achievement tab progress:", error));
    }
  } catch { /* Ignore unrelated/malformed browser storage events. */ }
}
export function watchAchievementProgress(npub) {
  let disposed = false;
  const unsubscribe = [];
  if (npub && hasBrowserStorage()) {
    void persistence().then(adapter => {
      if (disposed) return;
      for (const source of PROGRESS_SOURCES) unsubscribe.push(adapter.watchProgress(npub, source, ledger => {
        mergeStoredProgress(npub, source, ledger);
        void evaluateRestoredProgress(npub, adapter).catch(error => console.warn("Achievement restored progress:", error));
      }, () => cloudSync.schedule(npub)));
    }).catch(() => cloudSync.schedule(npub));
  }
  return () => { disposed = true; unsubscribe.forEach(stop => stop()); };
}

export const pubkeyFromNpub = (npub) => {
  if (!npub) return "";
  try {
    const decoded = nip19.decode(npub);
    return decoded.type === "npub" ? decoded.data : "";
  } catch {
    return /^[0-9a-f]{64}$/i.test(npub) ? npub : "";
  }
};

export const resolveEffectiveIdentity = (providedNpub) => {
  if (typeof window === "undefined") {
    return { npub: providedNpub || "", nsec: "", isNip07: false };
  }

  let npub = (providedNpub || "").trim();
  const storedNpub = storedKey("local_npub").trim();
  const storedNsec = storedKey("local_nsec").trim();
  const isNip07 = storedKey("nip07_signer") === "true" || storedNsec === "nip07";

  if (!npub) {
    if (storedNpub) {
      npub = storedNpub;
    } else if (storedNsec && storedNsec.startsWith("nsec1")) {
      try {
        const decoded = nip19.decode(storedNsec);
        if (decoded.type === "nsec") {
          npub = nip19.npubEncode(getPublicKey(decoded.data));
          localStorage.setItem("local_npub", npub);
        }
      } catch {
        // ignore invalid stored key
      }
    }
  }

  return { npub, nsec: storedNsec, isNip07 };
};

export const setLocalNostrKey = (keyString) => {
  if (typeof window === "undefined" || !keyString) return null;
  const trimmed = keyString.trim();

  if (trimmed.startsWith("nsec1")) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === "nsec") {
        const derivedNpub = nip19.npubEncode(getPublicKey(decoded.data));
        localStorage.setItem("local_nsec", trimmed);
        localStorage.setItem("local_npub", derivedNpub);
        return { nsec: trimmed, npub: derivedNpub };
      }
    } catch {
      throw new Error("Invalid nsec private key format");
    }
  }

  if (trimmed.startsWith("npub1")) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === "npub") {
        localStorage.setItem("local_npub", trimmed);
        return { npub: trimmed };
      }
    } catch {
      throw new Error("Invalid npub public key format");
    }
  }

  throw new Error("Key must start with nsec1 or npub1");
};

export const getSigner = async (expectedNpub) => {
  const { npub, nsec, isNip07 } = resolveEffectiveIdentity(expectedNpub);
  const expectedHex = pubkeyFromNpub(npub);

  if (typeof window !== "undefined") {
    if (isNip07 && window.nostr?.signEvent) {
      try {
        const actualHex = await window.nostr.getPublicKey();
        if (!expectedHex || actualHex === expectedHex) {
          return (template) => window.nostr.signEvent(template);
        }
      } catch (err) {
        console.warn("NIP-07 signer error:", err);
      }
    }

    if (nsec) {
      let secretBytes = null;
      if (nsec.startsWith("nsec1")) {
        try {
          const decoded = nip19.decode(nsec);
          if (decoded.type === "nsec") {
            secretBytes = decoded.data;
          }
        } catch (err) {
          console.warn("Invalid stored nsec:", err);
        }
      } else if (/^[0-9a-f]{64}$/i.test(nsec)) {
        secretBytes = new Uint8Array(nsec.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
      }

      if (secretBytes) {
        const derivedHex = getPublicKey(secretBytes);
        if (!expectedHex || derivedHex === expectedHex) {
          return (template) => finalizeEvent(template, secretBytes);
        } else {
          console.warn(`Signer mismatch: derivedHex (${derivedHex}) !== expectedHex (${expectedHex})`);
        }
      }
    }
  }

  return null;
};

export const getStoredAchievements = (npub) => {
  if (typeof window === "undefined") return {};
  const { npub: effectiveNpub } = resolveEffectiveIdentity(npub);
  const effectiveKey = effectiveNpub || "guest";
  return mergeAchievementMaps(localJournal.read(`${LOCAL_STORAGE_KEY_PREFIX}${effectiveKey}`));
};

export const storeAchievements = (npub, unlockedMap, { schedule = true } = {}) => {
  if (typeof window === "undefined") return;
  const { npub: effectiveNpub } = resolveEffectiveIdentity(npub);
  const effectiveKey = effectiveNpub || "guest";
  const current = getStoredAchievements(effectiveNpub);
  if (JSON.stringify(current) !== JSON.stringify(unlockedMap)) {
    void localJournal.write(`${LOCAL_STORAGE_KEY_PREFIX}${effectiveKey}`, unlockedMap);
    unlockStore.recordsChanged();
  }
  if (schedule && hasBrowserStorage() && effectiveNpub) scheduleAchievementSync(effectiveNpub);
};

export const buildAchievementEvent = (unlockedMap) => ({
  kind: ACHIEVEMENT_KIND,
  content: JSON.stringify({
    schemaVersion: 1,
    catalogVersion: CATALOG_VERSION,
    unlocked: unlockedMap,
    updatedAt: Math.floor(Date.now() / 1000),
  }),
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["d", ACHIEVEMENT_D],
    ["t", ACHIEVEMENT_TAG],
  ],
});

export const parseAchievementEvent = (event) => {
  if (!event || event.kind !== ACHIEVEMENT_KIND) return null;
  const dTag = event.tags?.find((t) => t[0] === "d")?.[1];
  if (dTag !== ACHIEVEMENT_D) return null;
  try {
    const parsed = JSON.parse(event.content || "{}");
    return mergeAchievementMaps(parsed?.unlocked);
  } catch {
    return {};
  }
};

export async function restoreAchievements(npub) {
  const { npub: effectiveNpub } = resolveEffectiveIdentity(npub);
  if (hasBrowserStorage() && effectiveNpub) {
    await hydrateAchievementJournal(effectiveNpub);
    cloudSync.schedule(effectiveNpub);
  }
  return getStoredAchievements(effectiveNpub);
}

const syncQueues = new Map();
export function syncAchievements(npub, options = {}) {
  const { npub: effectiveNpub } = resolveEffectiveIdentity(npub);
  const key = effectiveNpub || "guest";
  const task = (syncQueues.get(key) || Promise.resolve()).catch(() => {}).then(() => syncAccountAchievements(effectiveNpub, options));
  syncQueues.set(key, task);
  void task.finally(() => { if (syncQueues.get(key) === task) syncQueues.delete(key); }).catch(() => {});
  return task;
}

async function syncAccountAchievements(effectiveNpub, { strict = false } = {}) {
  const hex = pubkeyFromNpub(effectiveNpub);
  let localMap = completeCourseAward(getStoredAchievements(effectiveNpub));
  storeAchievements(effectiveNpub, localMap, { schedule: false });
  if (!hex) return localMap;

  const pool = new SimplePool();
  try {
    const event = await pool.get(ACHIEVEMENT_RELAYS, {
      kinds: [ACHIEVEMENT_KIND],
      "#d": [ACHIEVEMENT_D],
      authors: [hex],
    }, { maxWait: QUERY_TIMEOUT_MS });

    if (event && verifyEvent(event)) {
      const remoteUnlocked = parseAchievementEvent(event) || {};
      localMap = completeCourseAward(mergeAchievementMaps(getStoredAchievements(effectiveNpub), remoteUnlocked));
      const before = getStoredAchievements(effectiveNpub);
      storeAchievements(effectiveNpub, localMap, { schedule: false });
      if (hasBrowserStorage() && JSON.stringify(before) !== JSON.stringify(localMap)) cloudSync.schedule(effectiveNpub);

      // If local has unlocked items that remote event didn't include yet, publish the unified union back to Nostr!
      const hasNewLocal = Object.entries(localMap).some(([id, record]) => JSON.stringify(record) !== JSON.stringify(remoteUnlocked[id]));
      if (hasNewLocal) {
        await publishStoredAchievements(effectiveNpub, pool);
      }
    } else if (Object.keys(getStoredAchievements(effectiveNpub)).length > 0) {
      // Remote had no event yet, but we have local achievements: broadcast them now!
      await publishStoredAchievements(effectiveNpub, pool);
    }
  } catch (err) {
    console.warn("Nostr achievement sync warning:", err);
    if (strict) throw err;
    if (hasBrowserStorage()) relaySync.schedule(effectiveNpub);
  } finally {
    pool.destroy();
  }

  return getStoredAchievements(effectiveNpub);
}

async function publishStoredAchievements(npub, pool) {
  const signer = await withSyncDeadline(signerRequest(`${npub}:key`, () => getSigner(npub)));
  if (!signer) throw new Error("A matching signer is needed to publish achievements");
  // Include awards earned while the relay read or signer was waiting.
  const signed = await withSyncDeadline(signerRequest(`${npub}:sign`, () => signer(buildAchievementEvent(getStoredAchievements(npub)))));
  if (!verifyEvent(signed) || signed.pubkey !== pubkeyFromNpub(npub)) throw new Error("Invalid achievement signature");
  // At least one relay must acknowledge the event. Waiting for every relay
  // would let a stalled one hide a successful publish to another.
  await confirmRelayPublish(pool.publish(ACHIEVEMENT_RELAYS, signed));
}

// Awards from older catalogs remain in the event, but only current IDs count
// toward this collection. A test record can never overwrite a real award.
export function mergeAchievementMaps(...maps) {
  const merged = {};
  for (const map of maps) {
    if (!map || Array.isArray(map) || typeof map !== "object") continue;
    for (const [id, record] of Object.entries(map)) {
      if (!record || typeof record !== "object" || !Number.isFinite(record.unlockedAt) || record.unlockedAt <= 0) continue;
      const previous = merged[id];
      if (!previous || (previous.test && !record.test) || (Boolean(previous.test) === Boolean(record.test) && record.unlockedAt < previous.unlockedAt)) {
        Object.defineProperty(merged, id, { value: record, enumerable: true, writable: true, configurable: true });
      }
    }
  }
  return merged;
}

export function completeCourseAward(unlocked) {
  return completeCollectionAwards(unlocked);
}

// Serialize writes for one identity. Simultaneous learning handlers must not
// publish different replaceable events that each omit the other's award.
const awardQueues = new Map();
export const awardAchievements = ({ npub, achievementIds, test = false, progressionEvidence }) => {
  const { npub: effectiveNpub } = resolveEffectiveIdentity(npub);
  const key = effectiveNpub || "guest";
  const pending = (awardQueues.get(key) || Promise.resolve()).catch(() => {}).then(() =>
    awardAchievementBatch({ npub: effectiveNpub, achievementIds, test, progressionEvidence }));
  awardQueues.set(key, pending);
  void pending.finally(() => { if (awardQueues.get(key) === pending) awardQueues.delete(key); }).catch(() => {});
  return pending;
};

async function awardAchievementBatch({ npub: effectiveNpub, achievementIds, test, progressionEvidence }) {
  let currentUnlocked = getStoredAchievements(effectiveNpub);
  const alreadyRecorded = id => currentUnlocked[id] && (!currentUnlocked[id].test || test);
  const ids = [...new Set(achievementIds)].filter(isCatalogAchievement).filter(id => !alreadyRecorded(id));
  if (!ids.length) return [];
  const awarded = [];
  let updatedUnlocked = completeCourseAward(currentUnlocked);
  for (const id of ids) {
    if (alreadyRecorded(id)) continue;
    const achievement = ACHIEVEMENTS[id];
    if (achievement.progression && !test && !meetsProgressionRequirement(achievement.requirement, progressionEvidence)) continue;
    if (achievement.tier === "completion" && (test || !hasCompletedCourses(updatedUnlocked))) continue;
    if (achievement.requirement.all && !test && !hasEarnedRequirement(updatedUnlocked, achievement.requirement.all)) continue;
    awarded.push(achievement);
    const record = {
      unlockedAt: Math.floor(Date.now() / 1000), source: achievement.source,
      catalogVersion: CATALOG_VERSION, ...(test ? { test: true } : {}),
    };
    updatedUnlocked = completeCourseAward(mergeAchievementMaps(updatedUnlocked, { [id]: record }));
  }
  if (!awarded.length) return [];
  storeAchievements(effectiveNpub, updatedUnlocked);
  for (const [id, record] of Object.entries(updatedUnlocked)) {
    const previous = currentUnlocked[id];
    if (isCatalogAchievement(id) && (!previous || (previous.test && !record.test))) {
      unlockStore.enqueue(effectiveNpub || "", ACHIEVEMENTS[id], { test: Boolean(record.test) });
    }
  }
  if (hasBrowserStorage()) scheduleAchievementSync(effectiveNpub);
  return awarded;
}

export const awardAchievement = async ({ npub, achievementId, test = false }) => {
  const awarded = await awardAchievements({ npub, achievementIds: [achievementId], test });
  return awarded[0] || null;
};

// Only call this with the earned, contiguous curriculum unlock. Do not pass
// placement, selected lesson difficulty, or the adaptive practice Score.
export const awardProgressionAchievements = async ({ npub, source, evidence = {}, events = [] }) => {
  if (!npub) return [];
  const snapshot = progressionSnapshot(npub, source, evidence, events);
  const current = getStoredAchievements(npub);
  const ids = earnedProgressionIds(source, snapshot).filter(id => !hasEarnedRequirement(current, [id]));
  return ids.length ? awardAchievements({ npub, achievementIds: ids, progressionEvidence: snapshot }) : [];
};

export const awardTutorLevelAchievements = async ({ npub, level }) => {
  const current = getStoredAchievements(npub);
  const ids = earnedTutorAchievementIds(level).filter(id => !hasEarnedRequirement(current, [id]));
  return ids.length ? awardAchievements({ npub, achievementIds: ids }) : [];
};

export const awardRandomAchievement = async (npub, preferredSource = "robotsbuildingeducation") => {
  const { npub: effectiveNpub } = resolveEffectiveIdentity(npub);
  const current = getStoredAchievements(effectiveNpub);
  // Finish a tier before sampling the next one. Exhaustion is a no-op: no
  // duplicates, foreign-platform fallbacks, or random course completions.
  const eligible = Object.values(ACHIEVEMENTS).filter(item => item.source === preferredSource && !current[item.id] && item.tier !== "completion");
  const tier = ["beginner", "intermediate", "advanced"].find(level => eligible.some(item => item.tier === level));
  const pool = eligible.filter(item => item.tier === tier);
  if (!pool.length) return null;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  return awardAchievement({ npub: effectiveNpub, achievementId: selected.id, test: true });
};
