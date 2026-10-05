// The data stays in the local journal until the remote destination confirms it.
// Persist the intent separately; resume only the currently active account.
export function createRetrySync(sync, { journal, channel, onStatus = () => {}, onError = () => {},
  baseDelay = 1000, maxDelay = 60000, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  const jobs = new Map();
  const key = identity => `learning_achievement_sync_v1:${channel}:${identity}`;
  const persist = (identity, pending) => { void journal.write(key(identity), { pending }); onStatus(identity, pending); };
  const arm = (identity, job, delay) => {
    if (!job.active || job.running) return;
    clearTimer(job.timer);
    job.timer = setTimer(() => run(identity, job), delay);
    job.timer?.unref?.();
  };
  const run = async (identity, job) => {
    if (!job.active || job.running) return;
    job.running = true;
    const generation = job.generation;
    let failed = false;
    try {
      await sync(identity);
      job.attempts = 0;
      if (generation === job.generation) persist(identity, false);
    } catch (error) {
      failed = true; job.attempts++;
      persist(identity, true); onError(error);
    } finally {
      job.running = false;
      if (failed || generation !== job.generation) {
        arm(identity, job, failed ? Math.min(maxDelay, baseDelay * 2 ** Math.min(job.attempts - 1, 10)) : 0);
      }
    }
  };
  const getJob = identity => {
    if (!jobs.has(identity)) jobs.set(identity, { active: true, running: false, generation: 0, attempts: 0 });
    return jobs.get(identity);
  };
  return {
    schedule(identity) {
      if (!identity) return;
      const job = getJob(identity);
      job.generation++; persist(identity, true); arm(identity, job, 0);
    },
    resume(identity) {
      if (!identity) return;
      const job = getJob(identity); job.active = true;
      // Always reconcile remote work on startup/focus, even with no local job.
      this.schedule(identity);
    },
    pause(identity) {
      const job = jobs.get(identity);
      if (job) { job.active = false; clearTimer(job.timer); }
    },
  };
}
