// Firebase listeners emit optimistic writes before server acknowledgement.
// Evaluate only confirmed snapshots, and wait for all required documents.
export function createCommittedProgressObserver(onProgress) {
  const documents = new Map();
  let disposed = false;
  return {
    receive(name, snapshot) {
      if (disposed || snapshot.metadata?.hasPendingWrites || snapshot.metadata?.fromCache) return;
      documents.set(name, snapshot.exists() ? snapshot.data() : null);
      if (!["profile", "summary", "quest"].every(key => documents.has(key)) || !documents.get("profile")) return;
      onProgress(Object.fromEntries(documents));
    },
    dispose() { disposed = true; documents.clear(); },
  };
}
