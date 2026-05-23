import create from "zustand";

export const useSurfaceModalStore = create((set) => ({
  learnModal: null,
  actionModal: null,
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
