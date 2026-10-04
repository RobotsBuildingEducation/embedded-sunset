export function withSyncDeadline(task, timeout = 12000) {
  let timer;
  return Promise.race([Promise.resolve(task), new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Achievement sync timed out")), timeout);
  })]).finally(() => clearTimeout(timer));
}
export const confirmRelayPublish = (publications, timeout) => withSyncDeadline(Promise.any(publications), timeout);

// A timeout releases the retry worker, but extension dialogs cannot be
// cancelled. Reuse their pending request rather than opening duplicate prompts.
export function createSingleFlight() {
  const requests = new Map();
  return (key, task) => {
    if (!requests.has(key)) {
      const request = Promise.resolve().then(task);
      requests.set(key, request);
      void request.finally(() => { if (requests.get(key) === request) requests.delete(key); }).catch(() => {});
    }
    return requests.get(key);
  };
}
