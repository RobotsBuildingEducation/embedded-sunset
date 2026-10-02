// A completed conversation goal is a finished learning task, independent of
// turn count. Stable object IDs deduplicate parallel grading callbacks.
const goalIds = new WeakMap();
export function conversationCompletionEvent({ goal, language, completed }) {
  if (completed !== true || !language || !goal || typeof goal !== "object" || typeof goal.text?.en !== "string" || !goal.text.en.trim()) return null;
  if (!goalIds.has(goal)) goalIds.set(goal, globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return { metric: "conversation_goals", id: `${language}:${goalIds.get(goal)}` };
}
