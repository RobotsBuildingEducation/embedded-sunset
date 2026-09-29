import create from "zustand";

export const useSurfaceModalStore = create((set) => ({
  learnModal: null,
  actionModal: null,
  isSettingsOpen: false,
  isTeamsOpen: false,
  teamPreloadAccount: null,
  teamPreloadStatus: "idle",
  preloadedTeams: [],
  preloadedTeamProgress: new Map(),
  preloadedTeamProfiles: new Map(),
  preloadedOwnProgress: null,
  preloadedOwnSalary: null,
  startTeamPreload: (account) =>
    set({
      teamPreloadAccount: account,
      teamPreloadStatus: "loading",
      preloadedTeams: [],
      preloadedTeamProgress: new Map(),
      preloadedTeamProfiles: new Map(),
      preloadedOwnProgress: null,
      preloadedOwnSalary: null,
    }),
  setPreloadedTeams: (account, teams) =>
    set((state) =>
      state.teamPreloadAccount === account
        ? { preloadedTeams: teams, teamPreloadStatus: "ready" }
        : {},
    ),
  setPreloadedTeamProgress: (account, progress, ownProgress, ownSalary) =>
    set((state) =>
      state.teamPreloadAccount === account
        ? {
            preloadedTeamProgress: progress,
            preloadedOwnProgress: ownProgress,
            preloadedOwnSalary: ownSalary,
          }
        : {},
    ),
  setPreloadedTeamProfiles: (account, profiles) =>
    set((state) =>
      state.teamPreloadAccount === account
        ? { preloadedTeamProfiles: profiles }
        : {},
    ),
  failTeamPreload: (account) =>
    set((state) =>
      state.teamPreloadAccount === account
        ? { teamPreloadStatus: "error" }
        : {},
    ),
  resetTeamPreload: () =>
    set({
      teamPreloadAccount: null,
      teamPreloadStatus: "idle",
      preloadedTeams: [],
      preloadedTeamProgress: new Map(),
      preloadedTeamProfiles: new Map(),
      preloadedOwnProgress: null,
      preloadedOwnSalary: null,
    }),
  pendingTeamInvites: [],
  unseenTeamInvite: false,
  seenInviteIds: [],
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openTeams: () =>
    set((state) => ({
      isTeamsOpen: true,
      unseenTeamInvite: false,
      seenInviteIds: state.pendingTeamInvites.map((invite) => invite.id),
    })),
  closeTeams: () => set({ isTeamsOpen: false }),
  viewTeamInvites: () =>
    set((state) => ({
      unseenTeamInvite: false,
      seenInviteIds: state.pendingTeamInvites.map((invite) => invite.id),
    })),
  setTeamInvites: (invites) =>
    set((state) => {
      const pending = invites.filter((invite) => invite.status === "pending");
      return {
        pendingTeamInvites: pending,
        unseenTeamInvite:
          pending.some((invite) => !state.seenInviteIds.includes(invite.id)) &&
          !state.isTeamsOpen,
        seenInviteIds: state.isTeamsOpen
          ? pending.map((invite) => invite.id)
          : state.seenInviteIds,
      };
    }),
  openLearnModal: (payload) =>
    set({
      learnModal: {
        ...payload,
        openedAt: Date.now(),
      },
    }),
  closeLearnModal: () => set({ learnModal: null }),
  openActionModal: (type, payload = {}) =>
    set({
      actionModal: {
        ...payload,
        type,
        openedAt: Date.now(),
      },
    }),
  closeActionModal: () => set({ actionModal: null }),
}));
