// Coalesce requests while retaining a follow-up when another award arrives
// during a relay operation. Callers never await this network queue.
export function createBackgroundSync(sync, onError = console.warn) {
  const jobs = new Map();
  return identity => {
    if (!identity) return;
    const existing = jobs.get(identity);
    if (existing) { existing.dirty = true; return; }
    const job = { dirty: true };
    jobs.set(identity, job);
    setTimeout(async () => {
      try {
        while (job.dirty) {
          job.dirty = false;
          try { await sync(identity); } catch (error) { onError(error); }
        }
      } finally { jobs.delete(identity); }
    }, 0);
  };
}
