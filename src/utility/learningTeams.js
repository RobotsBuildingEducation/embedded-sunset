import {
  finalizeEvent,
  getPublicKey,
  nip19,
  SimplePool,
  verifyEvent,
} from "nostr-tools";

export const TEAM_RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.ditto.pub",
  "wss://nos.lol",
];
const KIND = 30078;
const pool = new SimplePool();
const lastPublished = new Map();
const hexKey = /^[0-9a-f]{64}$/;
const teamIdPattern = /^[0-9a-f]{32}$/;

export function toHexPubkey(value) {
  if (hexKey.test(value || "")) return value;
  const decoded = nip19.decode(value || "");
  if (decoded.type !== "npub" || !hexKey.test(decoded.data))
    throw new Error("Invalid npub");
  return decoded.data;
}

export function usableProfileName(value) {
  if (typeof value !== "string") return "";
  const name = value.trim();
  if (
    /^(?:[0-9a-f]{12,64}|npub1[0-9a-z]{7,})(?:\.\.\.|…)?$/i.test(name)
  )
    return "";
  return name;
}

export function teamAddress(creatorHex, id) {
  return `30078:${creatorHex}:learning-team:${id}`;
}

export function teamNaddr(creatorHex, id) {
  return nip19.naddrEncode({
    kind: KIND,
    pubkey: creatorHex,
    identifier: `learning-team:${id}`,
    relays: TEAM_RELAYS,
  });
}

export function newestReplaceable(events) {
  const latest = new Map();
  for (const event of events) {
    if (
      event.kind !== KIND ||
      !hexKey.test(event.pubkey || "") ||
      !verifyEvent(event)
    )
      continue;
    const d = event.tags?.find((tag) => tag[0] === "d")?.[1];
    if (!d) continue;
    const key = `${event.kind}:${event.pubkey}:${d}`;
    const previous = latest.get(key);
    if (
      !previous ||
      event.created_at > previous.created_at ||
      (event.created_at === previous.created_at && event.id > previous.id)
    )
      latest.set(key, event);
  }
  return [...latest.values()];
}

export function parseTeams(teamEvents, leaveEvents, viewerHex) {
  const leaves = new Map(
    newestReplaceable(leaveEvents).flatMap((event) => {
      const d = event.tags.find((tag) => tag[0] === "d")?.[1];
      if (
        !d?.startsWith("learning-team-left:") ||
        !event.tags.some(
          (tag) => tag[0] === "t" && tag[1] === "learning-team-left",
        )
      )
        return [];
      const address = d
        .replace(/^learning-team-left:/, "30078:")
        .replace(/:([0-9a-f]{32})$/, ":learning-team:$1");
      if (!event.tags.some((tag) => tag[0] === "a" && tag[1] === address))
        return [];
      return [[`${event.pubkey}:${d}`, event.created_at]];
    }),
  );
  return newestReplaceable(teamEvents).flatMap((event) => {
    const identifier = event.tags.find((tag) => tag[0] === "d")?.[1];
    if (
      !identifier?.startsWith("learning-team:") ||
      !teamIdPattern.test(identifier.slice(14))
    )
      return [];
    if (event.tags.some((tag) => tag[0] === "deleted")) return [];
    const id = identifier.slice(14);
    const members = [
      ...new Set(
        event.tags
          .filter((tag) => tag[0] === "p" && hexKey.test(tag[1] || ""))
          .map((tag) => tag[1]),
      ),
    ];
    if (!members.includes(event.pubkey) || !members.includes(viewerHex))
      return [];
    const active = members.filter(
      (pubkey) =>
        pubkey === event.pubkey ||
        (leaves.get(`${pubkey}:learning-team-left:${event.pubkey}:${id}`) ??
          -1) < event.created_at,
    );
    if (!active.includes(viewerHex)) return [];
    let content = {};
    try {
      content = JSON.parse(event.content);
    } catch {
      /* name tag is enough */
    }
    return [
      {
        id,
        creatorHex: event.pubkey,
        name: String(
          content.name ||
            event.tags.find((tag) => tag[0] === "name")?.[1] ||
            "Team",
        ),
        members: active,
        allMembers: members,
        createdAt: content.createdAt,
        eventCreatedAt: event.created_at,
        naddr: teamNaddr(event.pubkey, id),
      },
    ];
  });
}

export async function activeSigner(accountNpub) {
  const expected = accountNpub ? toHexPubkey(accountNpub) : null;
  const storedNsec =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("local_nsec")
      : null;
  const isNip07 =
    typeof localStorage !== "undefined" &&
    (localStorage.getItem("nip07_signer") === "true" || storedNsec === "nip07");

  if (isNip07) {
    const nostrExtension = typeof window !== "undefined" ? window.nostr : null;
    if (!nostrExtension?.signEvent) {
      throw new Error("Nostr extension signer is unavailable");
    }
    if (expected && nostrExtension.getPublicKey) {
      const actual = await nostrExtension.getPublicKey();
      if (actual !== expected) {
        throw new Error("Nostr signer does not match this account");
      }
    }
    return (template) => nostrExtension.signEvent(template);
  }

  if (!storedNsec) {
    throw new Error("Nostr key is unavailable");
  }
  const secret = nip19.decode(storedNsec || "");
  if (secret.type !== "nsec" || (expected && getPublicKey(secret.data) !== expected)) {
    throw new Error("Nostr key does not match this account");
  }
  return (template) => finalizeEvent(template, secret.data);
}

export async function queryTeamEvents(
  filter,
  { timeoutMs = 7000, failOnTimeout = false, onauth = null } = {},
) {
  let authHandler = onauth;
  if (!authHandler && typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      try {
        authHandler = await activeSigner(npub);
      } catch {
        authHandler = null;
      }
    }
  }

  return new Promise((resolve, reject) => {
    const events = [];
    let done = false;
    let closedBeforeEose = false;
    let subscription;
    const finish = (failed = false) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      subscription?.close("query complete");
      if (failed && failOnTimeout && events.length === 0)
        reject(new Error("Relay query did not complete"));
      else resolve(events);
    };
    const timer = setTimeout(() => finish(true), timeoutMs);
    subscription = pool.subscribeMany(TEAM_RELAYS, filter, {
      // Let our timer distinguish a stalled query from the pool's synthetic EOSE.
      maxWait: timeoutMs + 2000,
      onevent: (event) => events.push(event),
      oneose: () => queueMicrotask(() => finish(closedBeforeEose)),
      onclose: () => {
        closedBeforeEose = true;
        finish(true);
      },
      ...(authHandler ? { onauth: authHandler } : {}),
    });
    if (done) subscription.close("query complete");
  });
}

export async function loadNostrProfileNames(pubkeys, query = queryTeamEvents) {
  const authors = [...new Set(pubkeys)].filter((pubkey) => hexKey.test(pubkey));
  if (!authors.length) return new Map();
  const events = await query(
    { kinds: [0], authors, limit: Math.max(50, authors.length * 2) },
    { timeoutMs: 4000 },
  );
  const newest = new Map();
  for (const event of events) {
    if (event.kind !== 0 || !authors.includes(event.pubkey) || !verifyEvent(event))
      continue;
    const previous = newest.get(event.pubkey);
    if (!previous || event.created_at > previous.created_at)
      newest.set(event.pubkey, event);
  }
  const names = new Map();
  for (const [pubkey, event] of newest) {
    try {
      const profile = JSON.parse(event.content);
      const name = [profile.display_name, profile.displayName, profile.name]
        .map(usableProfileName)
        .find(Boolean)
        ?.slice(0, 100);
      if (name) names.set(pubkey, name);
    } catch {
      /* Ignore malformed public profiles. */
    }
  }
  return names;
}

async function signAndPublish(
  tags,
  content,
  accountNpub,
  minimumTimestamp = 0,
) {
  const expected = toHexPubkey(accountNpub);
  const d = tags.find((tag) => tag[0] === "d")[1];
  const key = `${expected}:${d}`;
  const created_at = Math.max(
    Math.floor(Date.now() / 1000),
    minimumTimestamp,
    (lastPublished.get(key) || 0) + 1,
  );
  const template = { kind: KIND, created_at, tags, content };
  const sign = await activeSigner(accountNpub);
  const event = await sign(template);
  if (event.pubkey !== expected || !verifyEvent(event))
    throw new Error("Nostr signature does not match this account");
  lastPublished.set(key, created_at);
  const writes = pool.publish(TEAM_RELAYS, event);
  try {
    await Promise.any(
      writes.map((write) =>
        Promise.race([
          write,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Relay write timed out")), 7000),
          ),
        ]),
      ),
    );
  } catch {
    throw new Error("Neither relay accepted the update");
  }
  return event;
}

export async function loadTeams(accountNpub) {
  const viewer = toHexPubkey(accountNpub);
  const sign = await activeSigner(accountNpub).catch(() => undefined);
  const events = await queryTeamEvents(
    {
      kinds: [KIND],
      "#t": ["learning-team"],
      "#p": [viewer],
      limit: 100,
    },
    { onauth: sign },
  );
  const latest = newestReplaceable(events);
  const leaveIds = latest.flatMap((event) => {
    const d = event.tags.find((tag) => tag[0] === "d")?.[1];
    return d?.startsWith("learning-team:") && teamIdPattern.test(d.slice(14))
      ? [`learning-team-left:${event.pubkey}:${d.slice(14)}`]
      : [];
  });
  const leaves = leaveIds.length
    ? await queryTeamEvents(
        { kinds: [KIND], "#d": leaveIds, limit: 500 },
        { onauth: sign },
      )
    : [];
  return parseTeams(events, leaves, viewer);
}

export async function createLearningTeam(accountNpub, name, memberNpubs) {
  const creator = toHexPubkey(accountNpub);
  if (!name?.trim() || name.trim().length > 80)
    throw new Error("Team name must be 1–80 characters");
  if (!memberNpubs?.length) throw new Error("Add at least one teammate");
  const invitees = memberNpubs.map(toHexPubkey);
  if (invitees.includes(creator)) throw new Error("You cannot invite yourself");
  const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const members = [...new Set([creator, ...invitees])];
  const createdAt = Math.floor(Date.now() / 1000);
  const event = await signAndPublish(
    [
      ["d", `learning-team:${id}`],
      ["t", "learning-team"],
      ["name", name.trim()],
      ...members.map((member) => ["p", member]),
    ],
    JSON.stringify({ name: name.trim(), createdAt }),
    accountNpub,
  );
  return {
    id,
    creatorHex: event.pubkey,
    name: name.trim(),
    members,
    allMembers: members,
    createdAt,
    eventCreatedAt: event.created_at,
    naddr: teamNaddr(event.pubkey, id),
    event,
  };
}

export async function renameLearningTeam(accountNpub, team, name) {
  if (toHexPubkey(accountNpub) !== team.creatorHex)
    throw new Error("Only the creator can rename this team");
  if (!name?.trim() || name.trim().length > 80)
    throw new Error("Team name must be 1–80 characters");
  return signAndPublish(
    [
      ["d", `learning-team:${team.id}`],
      ["t", "learning-team"],
      ["name", name.trim()],
      ...team.members.map((member) => ["p", member]),
    ],
    JSON.stringify({ name: name.trim(), createdAt: team.createdAt }),
    accountNpub,
    team.eventCreatedAt + 1,
  );
}

export async function addLearningTeamMembers(accountNpub, team, memberNpubs) {
  if (toHexPubkey(accountNpub) !== team.creatorHex)
    throw new Error("Only the creator can add members");
  const additions = memberNpubs.map(toHexPubkey);
  if (!additions.length) throw new Error("Add at least one teammate");
  if (additions.some((member) => team.members.includes(member)))
    throw new Error("A teammate is already on this team");
  const members = [...new Set([...team.members, ...additions])];
  return signAndPublish(
    [
      ["d", `learning-team:${team.id}`],
      ["t", "learning-team"],
      ["name", team.name],
      ...members.map((member) => ["p", member]),
    ],
    JSON.stringify({ name: team.name, createdAt: team.createdAt }),
    accountNpub,
    team.eventCreatedAt + 1,
  );
}

export async function deleteLearningTeam(accountNpub, team) {
  if (toHexPubkey(accountNpub) !== team.creatorHex)
    throw new Error("Only the creator can delete this team");
  return signAndPublish(
    [
      ["d", `learning-team:${team.id}`],
      ["t", "learning-team"],
      ["name", team.name],
      ...team.allMembers.map((member) => ["p", member]),
      ["deleted", ""],
    ],
    JSON.stringify({ name: team.name, createdAt: team.createdAt }),
    accountNpub,
    team.eventCreatedAt + 1,
  );
}

export async function leaveLearningTeam(accountNpub, team) {
  const viewer = toHexPubkey(accountNpub);
  if (viewer === team.creatorHex)
    throw new Error("The creator must delete the team");
  return signAndPublish(
    [
      ["d", `learning-team-left:${team.creatorHex}:${team.id}`],
      ["t", "learning-team-left"],
      ["a", teamAddress(team.creatorHex, team.id)],
    ],
    "",
    accountNpub,
    team.eventCreatedAt,
  );
}

export function makeProgressSnapshot(data = {}, targetLang = "en") {
  const numeric = (value) =>
    Number.isFinite(Number(value)) ? Number(value) : 0;
  const goal = Math.max(0, numeric(data.dailyGoalXp ?? data.goal));
  const dailyXp = Math.max(0, numeric(data.dailyXp));
  const score = data.scoreScale === "0-100" ? data.score : data.practiceScore;
  const validScore =
    Number.isFinite(Number(score)) &&
    score !== null &&
    score !== "" &&
    Number(score) >= 0 &&
    Number(score) <= 100;
  const companion =
    data.companion && typeof data.companion === "object"
      ? {
          name: data.companion.name,
          type: data.companion.type,
          level: numeric(data.companion.level),
          health: Math.min(100, Math.max(0, numeric(data.companion.health))),
        }
      : undefined;
  return {
    schemaVersion: 2,
    targetLang: data.targetLang || targetLang,
    xp: numeric(data.xp),
    ...(validScore
      ? {
          score: Number(score),
          scoreScale: "0-100",
          scoreLevel: data.scoreLevel || data.level || "",
        }
      : {}),
    level: data.level || "",
    proficiency: data.proficiency || {},
    goal,
    dailyGoalXp: goal,
    dailyXp,
    streak: numeric(data.streak),
    answeredStepsCount: numeric(data.answeredStepsCount),
    progressPercent:
      goal > 0 ? Math.min(100, Math.round((dailyXp / goal) * 100)) : 0,
    name: data.name || "",
    ...(companion ? { companion } : {}),
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

export async function publishLearningProgress(accountNpub, snapshot) {
  return signAndPublish(
    [
      ["d", "learning-progress"],
      ["t", "learning-progress"],
    ],
    JSON.stringify(snapshot),
    accountNpub,
  );
}

export async function publishCourseProgress(accountNpub, snapshot) {
  return signAndPublish(
    [
      ["d", "course-progress"],
      ["t", "course-progress"],
    ],
    JSON.stringify(snapshot),
    accountNpub,
  );
}

export async function loadCourseProgress(memberHexes, accountNpub = null) {
  if (!memberHexes.length) return new Map();
  const npub =
    accountNpub ||
    (typeof window !== "undefined" && typeof localStorage !== "undefined"
      ? localStorage.getItem("local_npub")
      : null);
  const sign = npub
    ? await activeSigner(npub).catch(() => undefined)
    : undefined;
  const events = await queryTeamEvents(
    {
      kinds: [KIND],
      "#d": ["course-progress"],
      authors: memberHexes,
      limit: Math.max(50, memberHexes.length * 2),
    },
    { onauth: sign },
  );
  return new Map(
    newestReplaceable(events).flatMap((event) => {
      if (!memberHexes.includes(event.pubkey)) return [];
      try {
        const data = JSON.parse(event.content);
        if (data?.schemaVersion !== 1 || !Array.isArray(data.chapters))
          return [];
        const count = (value) =>
          Number.isFinite(value) && value >= 0 ? value : null;
        const chapters = data.chapters
          .slice(0, 30)
          .filter((chapter) => chapter && typeof chapter.id === "string")
          .map((chapter) => ({
            id: chapter.id,
            completed: count(chapter.completed),
            total: count(chapter.total),
          }));
        return [
          [
            event.pubkey,
            {
              schemaVersion: 1,
              name:
                typeof data.name === "string" ? data.name.slice(0, 100) : "",
              currentChapterId:
                typeof data.currentChapterId === "string"
                  ? data.currentChapterId
                  : null,
              chapters,
              courseProgress:
                data.courseProgress && typeof data.courseProgress === "object"
                  ? {
                      completed: count(data.courseProgress.completed),
                      total: count(data.courseProgress.total),
                      percent: count(data.courseProgress.percent),
                    }
                  : null,
              dailyGoal:
                data.dailyGoal && typeof data.dailyGoal === "object"
                  ? {
                      completed: count(data.dailyGoal.completed),
                      target: count(data.dailyGoal.target),
                      unit: "questions",
                      localDate:
                        typeof data.dailyGoal.localDate === "string"
                          ? data.dailyGoal.localDate
                          : null,
                    }
                  : null,
            },
          ],
        ];
      } catch {
        return [];
      }
    }),
  );
}

export async function loadLearningProgress(memberHexes) {
  if (!memberHexes.length) return new Map();
  const events = await queryTeamEvents({
    kinds: [KIND],
    "#d": ["learning-progress"],
    authors: memberHexes,
    limit: 50,
  });
  return new Map(
    newestReplaceable(events).flatMap((event) => {
      if (!memberHexes.includes(event.pubkey)) return [];
      try {
        const data = JSON.parse(event.content);
        const trustedScore =
          data.schemaVersion >= 2 &&
          data.scoreScale === "0-100" &&
          Number.isFinite(data.score) &&
          data.score >= 0 &&
          data.score <= 100;
        return [
          [event.pubkey, { ...data, score: trustedScore ? data.score : null }],
        ];
      } catch {
        return [];
      }
    }),
  );
}
