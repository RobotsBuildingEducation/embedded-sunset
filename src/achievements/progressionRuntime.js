import { addProgressEvents, ledgerCounters } from "./progressionEvidence.js";
import { ACHIEVEMENTS } from "./catalog.js";

const completionMetrics = new Set(Object.values(ACHIEVEMENTS).flatMap(({ requirement }) => [
  requirement.metric, ...(requirement.metrics || []),
]).filter(Boolean));

const keyFor = (npub, source) => `learning_achievement_progress_v4:${npub}:${source}`;
export function readProgressLedger(npub, source) {
  if (!npub || typeof localStorage === "undefined") return {};
  try { const data = JSON.parse(localStorage.getItem(keyFor(npub, source)) || "{}"); return data && typeof data === "object" && !Array.isArray(data) ? data : {}; }
  catch { return {}; }
}
export function recordProgressEvents(npub, source, events) {
  if (!npub || typeof localStorage === "undefined") return {};
  // Retired usage hooks can still fire; never grow achievement history for them.
  const completions = events.filter(event => completionMetrics.has(String(event?.metric || "").split(":")[0]));
  const ledger = addProgressEvents(readProgressLedger(npub, source), completions);
  localStorage.setItem(keyFor(npub, source), JSON.stringify(ledger));
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
