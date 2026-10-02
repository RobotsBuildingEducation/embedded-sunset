export function phonicsCompletionEvidence(language, baseCards, documents) {
  const generated = documents.filter(card => card.generated === true);
  const required = [...new Set([...baseCards.map(card => card.id), ...generated.map(card => card.letterId)])];
  const completed = documents.filter(card => Number.isSafeInteger(card.correctCount) && card.correctCount > 0).map(card => card.letterId);
  const groups = new Map();
  for (const card of generated) {
    const match = /^gen_(\d+)_(\d+)$/.exec(card.letterId || "");
    if (!match || !Number.isSafeInteger(card.generatedDeckSize) || card.generatedDeckSize <= 0) continue;
    const group = groups.get(match[1]) || { size: card.generatedDeckSize, ids: new Set() };
    if (group.size !== card.generatedDeckSize) group.size = Infinity;
    group.ids.add(card.letterId); groups.set(match[1], group);
  }
  const events = [...groups].filter(([id, group]) => Number.isSafeInteger(group.size) && group.ids.size === group.size &&
    Array.from({length:group.size},(_,i)=>`gen_${id}_${i}`).every(card => group.ids.has(card) && completed.includes(card)))
    .map(([id]) => ({ metric:"phonics_decks", id:`${language}:${id}` }));
  return { evidence: { language, sets: { phonics_cards: { required, completed } } }, events };
}
