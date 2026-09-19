import { create } from "zustand";

/**
 * Calculates the current review status and disabled state:
 * - If code is present and idea is unchanged from savedIdea: status = "complete", disabled = isLoading || !code?.trim()
 * - If idea has changed (idea !== savedIdea) or no code is present:
 *   - If savedIdea is truthy: status = "update", disabled = isLoading || idea.trim().length < 1
 *   - If savedIdea is falsy: status = "create", disabled = isLoading || idea.trim().length < 1
 */
export const calculateConversationReviewState = ({
  idea = "",
  savedIdea = "",
  code = "",
  isLoading = false,
} = {}) => {
  const hasCode = Boolean(code && code.trim().length > 0);
  const trimmedIdea = String(idea || "").trim();
  const trimmedSavedIdea = String(savedIdea || "").trim();
  const isIdeaEdited = trimmedIdea !== trimmedSavedIdea;

  if (hasCode && !isIdeaEdited) {
    return {
      status: "complete",
      isDisabled: Boolean(isLoading || !hasCode),
    };
  }

  const status = trimmedSavedIdea ? "update" : "create";
  const isDisabled = Boolean(isLoading || trimmedIdea.length < 1);

  return {
    status,
    isDisabled,
  };
};

export const useConversationReviewStore = create((set) => ({
  status: "create", // "create" | "update" | "complete"
  isLoading: false,
  isDisabled: true,
  onCreateOrUpdate: null,
  onComplete: null,
  setReviewState: (partial) =>
    set((state) => ({
      ...state,
      ...(typeof partial === "function" ? partial(state) : partial),
    })),
  resetReviewState: () =>
    set({
      status: "create",
      isLoading: false,
      isDisabled: true,
      onCreateOrUpdate: null,
      onComplete: null,
    }),
}));

export default useConversationReviewStore;
