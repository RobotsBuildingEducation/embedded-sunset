// A successful card exercise is distinct from graduating its SRS learning steps.
// Keep stable card IDs per language so replays and two-device uploads deduplicate.
export function flashcardCompletionEvent(language, cardId, progress = {}) {
  if (typeof language !== "string" || !/^[a-z]{2,3}(?:-[a-z0-9]+)*$/.test(language) ||
      typeof cardId !== "string" || !/^(pre-a1|a1|a2|b1|b2|c1|c2)-.+$/i.test(cardId) ||
      progress.isGoal || progress.isRepair) return null;
  // Legacy SRS normalization can default successfulReviews to 1 for a card in
  // learning. Require a saved successful rating/streak as well as that count.
  const succeeded = progress.completed === true ||
    (Number.isSafeInteger(progress.successfulReviews) && progress.successfulReviews > 0 &&
      (["good", "easy", "hard"].includes(progress.lastReviewOutcome) ||
        (Number.isSafeInteger(progress.consecutiveCorrect) && progress.consecutiveCorrect > 0)));
  return succeeded ? { metric: `flashcards_completed:${language}`, id: cardId } : null;
}

export function flashcardEvidenceForLedger(ledger = {}) {
  return Object.entries(ledger).flatMap(([metric, cards]) => {
    const match = /^flashcards_completed:([a-z]{2,3}(?:-[a-z0-9]+)*)$/.exec(metric);
    if (!match || !cards || typeof cards !== "object" || Array.isArray(cards)) return [];
    const count = Object.values(cards).filter(value => Number.isSafeInteger(value) && value > 0).length;
    return [{ language: match[1], counters: { flashcards_completed: count } }];
  });
}
