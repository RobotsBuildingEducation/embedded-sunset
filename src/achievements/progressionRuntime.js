import { addProgressEvents, ledgerCounters } from "./progressionEvidence.js";
import { ACHIEVEMENTS } from "./catalog.js";
import { localJournal } from "./localJournal.js";

const completionMetrics = new Set(Object.values(ACHIEVEMENTS).flatMap(({ requirement }) => [
  requirement.metric, ...(requirement.metrics || []),
]).filter(Boolean));

const keyFor = (npub, source) => `learning_achievement_progress_v4:${npub}:${source}`;
const listeners = new Set(), revisions = new Map();
export function subscribeProgress(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export const progressRevision = (npub, source) => revisions.get(keyFor(npub, source)) || 0;
export const refreshProgressRevision = (npub, source) => changed(npub, source);
function changed(npub, source) {
  const key = keyFor(npub, source);
  revisions.set(key, progressRevision(npub, source) + 1);
  listeners.forEach(listener => listener(npub, source));
}

// Completion IDs are set members, not independently incremented counters.
// Unioning two devices is commutative, idempotent and never loses a completion.
export function mergeProgressLedgers(...ledgers) {
  const events = [];
  for (const ledger of ledgers) {
    if (!ledger || typeof ledger !== "object" || Array.isArray(ledger)) continue;
    for (const [metric, entries] of Object.entries(ledger)) {
      if (!completionMetrics.has(metric.split(":")[0]) || !entries || typeof entries !== "object" || Array.isArray(entries)) continue;
      for (const [id, amount] of Object.entries(entries)) {
        if (id.trim() && Number.isSafeInteger(amount) && amount > 0) events.push({ metric, id });
      }
    }
  }
  return addProgressEvents({}, events);
}

export function readProgressLedger(npub, source) {
  if (!npub) return {};
  return mergeProgressLedgers(localJournal.read(keyFor(npub, source)));
}
export function mergeStoredProgress(npub, source, remote) {
  const current = readProgressLedger(npub, source);
  const merged = mergeProgressLedgers(current, remote);
  if (JSON.stringify(current) !== JSON.stringify(merged)) {
    void localJournal.write(keyFor(npub, source), merged);
    changed(npub, source);
  }
  return merged;
}
export async function restoreProgressJournal(npub, source) {
  const before = readProgressLedger(npub, source);
  const restored = await localJournal.restore(keyFor(npub, source), mergeProgressLedgers);
  if (JSON.stringify(before) !== JSON.stringify(restored)) changed(npub, source);
  return restored;
}
export function recordProgressEvents(npub, source, events) {
  if (!npub) return {};
  // Retired usage hooks can still fire; never grow achievement history for them.
  const completions = events.filter(event => completionMetrics.has(String(event?.metric || "").split(":")[0]));
  const ledger = mergeStoredProgress(npub, source, addProgressEvents({}, completions));
  return ledgerCounters(ledger);
}
export function progressionSnapshot(npub, source, evidence = {}, events = []) {
  const counters = recordProgressEvents(npub, source, events);
  const levelCounts = { goals: {}, repairs: {} };
  for (const [metric, count] of Object.entries(counters)) {
    const [kind, level] = metric.split(":");
    if (levelCounts[kind] && level) levelCounts[kind][level] = count;
  }
  return { ...evidence, levelCounts, counters: { ...counters, ...evidence.counters } };
}
