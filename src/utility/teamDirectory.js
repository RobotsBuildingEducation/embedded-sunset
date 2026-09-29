import { loadTeams, toHexPubkey } from "./learningTeams";
import { getUserTeams } from "./nosql";

export async function loadVisibleTeams(accountNpub) {
  const [nostrTeams, legacyTeams] = await Promise.all([
    loadTeams(accountNpub),
    getUserTeams(accountNpub).catch(() => []),
  ]);
  const normalized = legacyTeams.flatMap((team) => {
    try {
      const creatorHex = toHexPubkey(team.createdBy);
      const accepted = (team.members || []).filter(
        (member) => member.status === "accepted",
      );
      const members = [
        creatorHex,
        ...accepted.flatMap((member) => {
          try {
            return [toHexPubkey(member.npub)];
          } catch {
            return [];
          }
        }),
      ];
      return [
        {
          id: team.id,
          legacy: true,
          creatorNpub: team.createdBy,
          creatorHex,
          name: team.teamName || "Team",
          members: [...new Set(members)],
          allMembers: [...new Set(members)],
          pendingMembers: (team.members || [])
            .filter((member) => member.status === "pending")
            .map((member) => member.npub),
        },
      ];
    } catch {
      return [];
    }
  });
  return [...nostrTeams, ...normalized];
}
