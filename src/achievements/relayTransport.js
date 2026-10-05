import { withSyncDeadline } from "./syncDeadline.js";

// Read every relay's snapshot. Pool.get selects just one event, which can
// discard awards when relays hold different versions of the transcript.
export async function readAchievementRelayEvents(pool, urls, filter, { authenticate, timeout = 6000 } = {}) {
  const results = await Promise.allSettled(urls.map(async url => {
    const relay = await withSyncDeadline(pool.ensureRelay(url, { connectionTimeout: timeout }), timeout);
    const read = () => new Promise((resolve, reject) => {
      const events = [];
      let subscription, settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        subscription?.close();
        if (error) reject(error); else resolve(events);
      };
      const timer = setTimeout(() => finish(new Error(`Achievement relay read timed out: ${url}`)), timeout);
      try {
        subscription = relay.prepareSubscription([filter], {
          // nostr-tools synthesizes EOSE on its timeout. Our deadline must
          // expire first so an unavailable relay isn't a confirmed empty read.
          eoseTimeout: timeout + 1000,
          onevent: event => events.push(event),
          oneose: () => finish(),
          onclose: reason => finish(new Error(reason || "Achievement relay closed")),
        });
        subscription.fire();
      } catch (error) { finish(error); }
    });
    try { return await read(); }
    catch (error) {
      if (!error.message.startsWith("auth-required:") || !authenticate) throw error;
      await withSyncDeadline(relay.auth(authenticate));
      return read();
    }
  }));
  const successful = results.filter(result => result.status === "fulfilled");
  if (!successful.length) throw new globalThis.AggregateError(results.map(result => result.reason), "No achievement relay could be read");
  return successful.flatMap(result => result.value);
}
