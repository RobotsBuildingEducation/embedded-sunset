import assert from "node:assert/strict";
import test from "node:test";
import { finalizeEvent, getPublicKey, nip19 } from "nostr-tools";
import {
  characterIndexForId,
  dailyGoalPercent,
  isCoursePost,
  loadCourseFeed,
} from "./courseTeamFeed.js";

const secret = new Uint8Array(32).fill(7);
const pubkey = getPublicKey(secret);
const note = (content, created_at = 100, purpose = null) =>
  finalizeEvent(
    {
      kind: 1,
      created_at,
      tags: [
        ["t", "LearnWithNostr"],
        ...(purpose ? [["purpose", purpose]] : []),
      ],
      content,
    },
    secret,
  );
const metadata = finalizeEvent(
  {
    kind: 0,
    created_at: 101,
    tags: [],
    content: JSON.stringify({
      name: "Ada",
      picture: "https://example.com/ada.png",
    }),
  },
  secret,
);

test("a Nostr author keeps the same character across feed posts", () => {
  const first = characterIndexForId(pubkey);
  assert.equal(characterIndexForId(pubkey), first);
  assert.ok(Number(first) >= 1 && Number(first) <= 40);
});

test("no usable posts skip the profile request", async () => {
  const calls = [];
  const posts = await loadCourseFeed(async (filter) => {
    calls.push(filter);
    return [];
  });
  assert.deepEqual(posts, []);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0]["#t"], ["LearnWithNostr"]);
});

test("course posts load without a signer and receive optional profile metadata", async () => {
  const posts = await loadCourseFeed(async (filter) =>
    filter.kinds[0] === 1
      ? [note("Chapter 2 completed"), note("Chapter 3 completed", 102)]
      : [metadata],
  );
  assert.equal(posts.length, 2);
  assert.equal(posts[0].createdAt, 102);
  assert.equal(posts[0].profile.name, "Ada");
  assert.equal(posts[0].npub, nip19.npubEncode(pubkey));
  assert.equal(posts[0].characterIndex, posts[1].characterIndex);
});

test("unsupported XP posts are filtered before profile lookup", async () => {
  let calls = 0;
  const posts = await loadCourseFeed(async () => {
    calls += 1;
    return [note("Chapter 2 completed · 50 XP")];
  });
  assert.deepEqual(posts, []);
  assert.equal(calls, 1);
  assert.equal(isCoursePost(note("Chapter 2 completed · 50 XP")), false);
});

test("existing question posts retain their full note and question number", async () => {
  const content =
    "Completed question 29 with a grade of 100% on https://robotsbuildingeducation.com\n\nArrange the execution steps #LearnWithNostr";
  const posts = await loadCourseFeed(async (filter) =>
    filter.kinds[0] === 1
      ? [note(content)]
      : [],
  );
  assert.equal(posts.length, 1);
  assert.equal(posts[0].questionNumber, 29);
  assert.equal(posts[0].content, content);
  assert.equal(posts[0].dailyGoalPercent, null);
});

test("Piyali daily goal notes retain their text and percent", async () => {
  const content =
    "I'm 15% through today's 100 XP goal (15/100 XP) and now have 15 XP total on https://piyali.app practicing Inglés! #LearnWithNostr";
  const posts = await loadCourseFeed(async (filter) =>
    filter.kinds[0] === 1 ? [note(content)] : [],
  );
  assert.equal(posts.length, 1);
  assert.equal(posts[0].content, content);
  assert.equal(posts[0].dailyGoalPercent, 15);
  assert.equal(posts[0].questionNumber, null);
  assert.equal(dailyGoalPercent("(3/4 XP)"), 75);
  assert.equal(dailyGoalPercent("I'm 120% through today's goal"), 100);
  assert.equal(
    isCoursePost(note("I just reached my goal", 100, "nosaboProgress")),
    true,
  );
});

test("relay errors reach the feed error state", async () => {
  await assert.rejects(
    loadCourseFeed(async () => {
      throw new Error("Relay query did not complete");
    }),
    /Relay query did not complete/,
  );
});
