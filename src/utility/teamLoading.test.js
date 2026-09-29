import assert from "node:assert/strict";
import test from "node:test";

function mergeOptimisticTeams(currentTeams, incomingTeams) {
  const incomingIds = new Set(incomingTeams.map((t) => t.id));
  const optimistic = (currentTeams || []).filter((t) => !incomingIds.has(t.id));
  return [...optimistic, ...incomingTeams];
}

function computeMemberLoading({
  pubkey,
  viewer,
  ownProgress,
  progressMap,
  progressLoading,
}) {
  const isViewer = pubkey === viewer;
  const data = isViewer ? ownProgress : progressMap.get(pubkey);
  const isLoading = isViewer
    ? !ownProgress && progressLoading
    : !progressMap.has(pubkey) && progressLoading;
  return { isViewer, data, isLoading };
}

test("optimistic team preservation retains newly created team if relay response is stale", () => {
  const optimisticTeam = { id: "team-new-1", name: "New Team", members: ["pub1", "pub2"] };
  const staleRelayTeams = [{ id: "team-old-1", name: "Old Team", members: ["pub1"] }];

  const merged = mergeOptimisticTeams([optimisticTeam], staleRelayTeams);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, "team-new-1");
  assert.equal(merged[1].id, "team-old-1");

  // When relay finally indexes the new team, optimistic duplicate is cleanly replaced
  const indexedRelayTeams = [
    { id: "team-new-1", name: "New Team", members: ["pub1", "pub2"] },
    { id: "team-old-1", name: "Old Team", members: ["pub1"] },
  ];
  const refreshed = mergeOptimisticTeams(merged, indexedRelayTeams);
  assert.equal(refreshed.length, 2);
  assert.deepEqual(refreshed.map((t) => t.id), ["team-new-1", "team-old-1"]);
});

test("viewer with populated ownProgress renders immediately without skeleton loading", () => {
  const viewer = "hex-viewer";
  const ownProgress = {
    schemaVersion: 1,
    name: "Viewer",
    currentChapterId: "chapter-1",
    courseProgress: { completed: 5, total: 10, percent: 50 },
  };
  const progressMap = new Map();

  const state = computeMemberLoading({
    pubkey: viewer,
    viewer,
    ownProgress,
    progressMap,
    progressLoading: true, // Relay query still running
  });

  assert.equal(state.isViewer, true);
  assert.equal(state.isLoading, false);
  assert.deepEqual(state.data, ownProgress);
});

test("invited teammates display skeleton loading while progress query is in flight", () => {
  const viewer = "hex-viewer";
  const teammate = "hex-teammate";
  const ownProgress = { schemaVersion: 1, name: "Viewer" };
  const progressMap = new Map();

  const stateWhileLoading = computeMemberLoading({
    pubkey: teammate,
    viewer,
    ownProgress,
    progressMap,
    progressLoading: true,
  });

  assert.equal(stateWhileLoading.isViewer, false);
  assert.equal(stateWhileLoading.isLoading, true);
  assert.equal(stateWhileLoading.data, undefined);

  // When loading completes and teammate has progress
  progressMap.set(teammate, { schemaVersion: 1, name: "Teammate", chapters: [] });
  const stateLoadedWithData = computeMemberLoading({
    pubkey: teammate,
    viewer,
    ownProgress,
    progressMap,
    progressLoading: false,
  });

  assert.equal(stateLoadedWithData.isLoading, false);
  assert.equal(stateLoadedWithData.data?.name, "Teammate");

  // When loading completes and teammate has NO reported progress
  const otherTeammate = "hex-empty";
  const stateLoadedEmpty = computeMemberLoading({
    pubkey: otherTeammate,
    viewer,
    ownProgress,
    progressMap,
    progressLoading: false,
  });

  assert.equal(stateLoadedEmpty.isLoading, false);
  assert.equal(stateLoadedEmpty.data, undefined);
});
