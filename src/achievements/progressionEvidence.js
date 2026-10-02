import { ACHIEVEMENTS } from "./catalog.js";

const integer = value => Number.isSafeInteger(value) && value >= 0;
export const levelKey = level => String(level).toLowerCase().replaceAll("-", "_");
export const completeLevel = stats => Boolean(stats && integer(stats.total) && stats.total > 0 && integer(stats.completed) && stats.completed >= stats.total);
const completeSet = set => Array.isArray(set?.required) && set.required.length > 0 &&
  Array.isArray(set.completed) && set.required.every(id => typeof id === "string" && id.trim() && set.completed.includes(id));

// Snapshots describe a single language/course. Award IDs deliberately carry no
// language; the full-course award must be proved by one complete snapshot.
export function meetsProgressionRequirement(requirement, evidence = {}) {
  const { type, metric, target } = requirement;
  switch (type) {
    case "level_set": return Boolean(evidence.language) && completeLevel(evidence.levels?.[metric]?.[levelKey(requirement.level)]);
    case "level_counter": return integer(evidence.levelCounts?.[metric]?.[levelKey(requirement.level)]) && evidence.levelCounts[metric][levelKey(requirement.level)] >= target;
    case "counter": return integer(evidence.counters?.[metric]) && evidence.counters[metric] >= target;
    case "complete_set": return Boolean(evidence.course || evidence.language) && completeSet(evidence.sets?.[metric]);
    case "chapter_completion": return Boolean(evidence.course) && evidence.chapters?.completed?.includes(requirement.chapter) === true;
    case "chapter_review": return Boolean(evidence.course) && evidence.chapters?.reviewed?.includes(requirement.chapter) === true;
    case "member": return evidence.members?.[metric]?.includes(requirement.member) === true;
    case "any_member": return requirement.members.some(member => evidence.members?.[metric]?.includes(member));
    case "members": return requirement.members.every(member => evidence.members?.[metric]?.includes(member));
    case "score": return Number.isFinite(evidence.score) && evidence.score >= target && integer(evidence.gradedCount) && evidence.gradedCount > 0;
    case "full_language_course": return Boolean(evidence.language) && requirement.modes.every(mode => requirement.levels.every(level => completeLevel(evidence.levels?.[mode]?.[levelKey(level)])));
    case "full_coding_course": return Boolean(evidence.course) && requirement.metrics.every(key => completeSet(evidence.sets?.[key]));
    default: return false;
  }
}

export function earnedProgressionIds(source, evidence) {
  return Object.values(ACHIEVEMENTS).filter(item => item.progression && item.source === source && meetsProgressionRequirement(item.requirement, evidence)).map(item => item.id);
}

export function localDayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
const dayIndex = key => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return NaN;
  const ms = Date.parse(`${key}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === key ? ms / 86400000 : NaN;
};
export function longestCalendarStreak(days = []) {
  const sorted = [...new Set(days.map(dayIndex).filter(Number.isFinite))].sort((a,b) => a-b);
  let longest = 0, run = 0, previous;
  for (const day of sorted) { run = day === previous + 1 ? run + 1 : 1; longest = Math.max(longest, run); previous = day; }
  return longest;
}

// Only finite event IDs survive. The identity/source-specific ledger is a
// local history of completion evidence, never published practice/private text.
export function addProgressEvents(ledger = {}, events = []) {
  const next = { ...ledger };
  for (const event of events) {
    if (!event?.metric || typeof event.id !== "string" || !event.id.trim()) continue;
    let amount = 1;
    if (event.metric === "spent_sats") {
      if (event.status !== "confirmed" || !["purchase", "tip"].includes(event.purpose) ||
          typeof event.sender !== "string" || typeof event.recipient !== "string" || !event.sender || !event.recipient || event.sender.toLowerCase() === event.recipient.toLowerCase() || !integer(event.amount) || !event.amount) continue;
      amount = event.amount;
    }
    const prior = next[event.metric] || {};
    if (Object.hasOwn(prior, event.id)) continue;
    next[event.metric] = { ...prior, [event.id]: amount };
  }
  return next;
}
export function ledgerCounters(ledger = {}) {
  return Object.fromEntries(Object.entries(ledger).map(([metric, entries]) => [metric,
    metric === "calendar_streak" ? longestCalendarStreak(Object.keys(entries)) : Object.values(entries).reduce((sum, amount) => sum + (integer(amount) ? amount : 0), 0)]));
}
