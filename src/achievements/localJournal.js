// Keep foreground reads/writes synchronous. IndexedDB is a second durable copy
// so a full or unavailable localStorage does not discard a completion/outbox.
function browserBackup() {
  let database;
  const open = () => database ||= new Promise((resolve, reject) => {
    const request = indexedDB.open("learning-achievement-journal-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("records");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = undefined; reject(request.error); };
    request.onblocked = () => { database = undefined; reject(new Error("Achievement storage is blocked")); };
  });
  return {
    async read(key) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const request = db.transaction("records").objectStore("records").get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async write(key, value) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("records", "readwrite");
        transaction.objectStore("records").put(value, key);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error("Achievement storage aborted"));
      });
    },
  };
}

export function createLocalJournal({ storage = () => globalThis.localStorage, backup = () => null } = {}) {
  const memory = new Map(), pending = new Map(), volatile = new Set(), preferMemory = new Set(), listeners = new Set();
  const notify = () => listeners.forEach(listener => listener());
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    hasUnsaved(identity) { return [...volatile].some(key => !key.startsWith("learning_achievement_sync_v1:") && key.includes(identity)); },
    confirmRemoteSave(key, value) {
      // A confirmed cloud copy is durable too. Never acknowledge newer work
      // that arrived while this older snapshot was being uploaded.
      if (JSON.stringify(memory.get(key)) === JSON.stringify(value)) { volatile.delete(key); notify(); }
    },
    read(key, fallback = {}) {
      // Prefer unsaved memory over an older durable copy after a quota error.
      if (preferMemory.has(key) && memory.has(key)) return memory.get(key);
      try {
        const raw = storage()?.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch { /* The backup is hydrated on account activation. */ }
      return memory.get(key) ?? fallback;
    },
    write(key, value) {
      memory.set(key, value);
      let localSaved = false;
      try {
        const local = storage();
        if (local) { local.setItem(key, JSON.stringify(value)); localSaved = true; }
      } catch { /* Preserve in memory and try IndexedDB independently. */ }
      if (localSaved) { volatile.delete(key); preferMemory.delete(key); }
      else { volatile.add(key); preferMemory.add(key); }
      notify();
      const secondary = backup();
      if (!secondary) return Promise.resolve(localSaved);
      // Serialize backups so an older slow write cannot replace a newer one.
      const task = (pending.get(key) || Promise.resolve()).catch(() => {}).then(async () => {
        try {
          await secondary.write(key, value);
          if (memory.get(key) === value) volatile.delete(key);
          return true;
        } catch { return localSaved; }
        finally { notify(); }
      });
      pending.set(key, task);
      void task.finally(() => { if (pending.get(key) === task) pending.delete(key); });
      return task;
    },
    async restore(key, merge) {
      const secondary = backup();
      if (!secondary) return this.read(key);
      await pending.get(key);
      try {
        const saved = await secondary.read(key);
        const current = this.read(key);
        if (saved) {
          const merged = merge(current, saved);
          await this.write(key, merged);
          return merged;
        }
      } catch { /* Network sync can also restore records. */ }
      return this.read(key);
    },
  };
}

let backup;
export const localJournal = createLocalJournal({ backup: () => {
  if (typeof window === "undefined" || !window.document || typeof indexedDB === "undefined") return null;
  return backup ||= browserBackup();
} });
