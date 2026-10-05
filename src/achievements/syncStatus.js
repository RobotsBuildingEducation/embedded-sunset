import { localJournal } from "./localJournal.js";

const channels = new Map(), listeners = new Set();
let revision = 0;
const notify = () => { revision++; listeners.forEach(listener => listener()); };
localJournal.subscribe(notify);
export const syncStatus = {
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  getSnapshot: () => revision,
  set(identity, channel, pending) {
    const key = `${identity}:${channel}`;
    if (channels.get(key) === pending) return;
    channels.set(key, pending); notify();
  },
  forAccount(identity) {
    return { pending: Boolean(identity && [...channels].some(([key, value]) => key.startsWith(`${identity}:`) && value)),
      storageError: Boolean(identity && localJournal.hasUnsaved(identity)) };
  },
};
