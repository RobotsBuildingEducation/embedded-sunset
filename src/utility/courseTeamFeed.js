import { nip19, verifyEvent } from "nostr-tools";
import { queryTeamEvents } from "./learningTeams.js";

export const characterIndexForId = (id) => {
  let hash = 2166136261;
  for (const character of id || "") {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return String(((hash >>> 0) % 40) + 1);
};

const legacyQuestionNumber = (content) => {
  const match =
    /^(?:Completed question|Acabo de completar la pregunta)\s+(\d+)\s+(?:with a grade of|con una calificación de)\s+\d+%/i.exec(
      content || "",
    );
  return match ? Number(match[1]) : null;
};

export const dailyGoalPercent = (content) => {
  const text = content || "";
  const reported = /\b(\d{1,3}(?:\.\d+)?)%\s+through\s+today['’]s\b/i.exec(text);
  const ratio = /\((\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*XP\)/i.exec(text);
  const value = reported
    ? Number(reported[1])
    : ratio && Number(ratio[2]) > 0
      ? (Number(ratio[1]) / Number(ratio[2])) * 100
      : null;
  return value === null || !Number.isFinite(value)
    ? null
    : Math.max(0, Math.min(100, Math.round(value)));
};

export const isCoursePost = (event) => {
  const content = event.content || "";
  const piyaliProgress =
    event.tags?.some(
      (tag) => tag[0] === "purpose" && tag[1] === "nosaboProgress",
    ) ||
    (/piyali\.app/i.test(content) && dailyGoalPercent(content) !== null);
  if (piyaliProgress) return true;
  if (/\b(xp|score|pet)\b/i.test(content)) return false;
  return (
    legacyQuestionNumber(content) !== null ||
    event.tags?.some(
      (tag) => tag[0] === "purpose" && tag[1] === "courseProgress",
    ) ||
    /\b(chapter|capítulo)\s+\d+\s+(complete|completed|completado|terminado)\b/i.test(
      content,
    ) ||
    /\b(daily goal|meta diaria|course complete|curso completado)\b/i.test(
      content,
    )
  );
};

export async function loadCourseFeed(query = queryTeamEvents) {
  const events = await query(
    { kinds: [1], "#t": ["LearnWithNostr"], limit: 50 },
    { timeoutMs: 7000, failOnTimeout: true },
  );
  const posts = [
    ...new Map(
      events
        .filter(
          (event) =>
            event.kind === 1 && verifyEvent(event) && isCoursePost(event),
        )
        .map((event) => [event.id, event]),
    ).values(),
  ].sort((a, b) => b.created_at - a.created_at);
  if (!posts.length) return [];

  const authors = [...new Set(posts.map((post) => post.pubkey))];
  let profiles = [];
  try {
    profiles = await query(
      { kinds: [0], authors, limit: Math.max(50, authors.length) },
      { timeoutMs: 4000 },
    );
  } catch {
    /* Posts remain readable without profiles. */
  }
  const latestProfiles = new Map();
  for (const event of profiles) {
    if (
      event.kind !== 0 ||
      !authors.includes(event.pubkey) ||
      !verifyEvent(event)
    )
      continue;
    const previous = latestProfiles.get(event.pubkey);
    if (!previous || event.created_at > previous.created_at)
      latestProfiles.set(event.pubkey, event);
  }
  return posts.map((post) => {
    let profile = {};
    try {
      profile = JSON.parse(latestProfiles.get(post.pubkey)?.content || "{}");
    } catch {
      /* Malformed metadata falls back to the npub. */
    }
    return {
      id: post.id,
      content: post.content,
      questionNumber: legacyQuestionNumber(post.content),
      dailyGoalPercent: dailyGoalPercent(post.content),
      createdAt: post.created_at,
      npub: nip19.npubEncode(post.pubkey),
      characterIndex: characterIndexForId(post.pubkey),
      profile: {
        name: typeof profile.name === "string" ? profile.name : "",
        picture: typeof profile.picture === "string" ? profile.picture : "",
      },
    };
  });
}
