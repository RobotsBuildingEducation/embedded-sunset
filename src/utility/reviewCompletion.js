// Reaching the 90% timeline checkpoint completes a review, including seeking.
export function hasWatchedReviewVideo(video) {
  return Number.isFinite(video?.duration) && video.duration > 0 &&
    Number.isFinite(video?.currentTime) && video.currentTime >= video.duration * 0.9;
}

export function reviewCompletionEvents(course, group, progress) {
  const id = `${course}:${group === "introduction" ? "tutorial" : group}`;
  if (!progress?.videoWatched) return [];
  return [
    { metric: "review_videos", id },
    ...(progress.summaryViewed && progress.practiceCompleted
      ? [{ metric: "review_checklists", id }] : []),
  ];
}
