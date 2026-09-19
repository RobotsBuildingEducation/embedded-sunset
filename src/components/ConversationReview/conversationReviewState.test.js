import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateConversationReviewState,
  useConversationReviewStore,
} from "../../useConversationReviewStore.js";

test("initial review question state with no prior idea or code defaults to 'create' and disabled", () => {
  const state = calculateConversationReviewState({
    idea: "",
    savedIdea: "",
    code: "",
    isLoading: false,
  });

  assert.equal(state.status, "create");
  assert.equal(state.isDisabled, true);
});

test("entering an idea enables the 'create' button", () => {
  const state = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "",
    code: "",
    isLoading: false,
  });

  assert.equal(state.status, "create");
  assert.equal(state.isDisabled, false);
});

test("when loading during generation, button is disabled", () => {
  const state = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "",
    code: "",
    isLoading: true,
  });

  assert.equal(state.status, "create");
  assert.equal(state.isDisabled, true);
});

test("when an idea was previously saved but code has not been generated for this chapter, status is 'update'", () => {
  const state = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "Flashcard tutor",
    code: "",
    isLoading: false,
  });

  assert.equal(state.status, "update");
  assert.equal(state.isDisabled, false);
});

test("when code is generated and idea matches saved idea, status is 'complete'", () => {
  const state = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Flashcard</div>; }",
    isLoading: false,
  });

  assert.equal(state.status, "complete");
  assert.equal(state.isDisabled, false);
});

test("when code is present but learner edits the idea input, status becomes 'update'", () => {
  const state = calculateConversationReviewState({
    idea: "Quiz game with timer",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Flashcard</div>; }",
    isLoading: false,
  });

  assert.equal(state.status, "update");
  assert.equal(state.isDisabled, false);
});

test("when learner clears the idea input while having saved code, status is 'update' and disabled", () => {
  const state = calculateConversationReviewState({
    idea: "",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Flashcard</div>; }",
    isLoading: false,
  });

  assert.equal(state.status, "update");
  assert.equal(state.isDisabled, true);
});

test("useConversationReviewStore manages state updates and resets cleanly", () => {
  useConversationReviewStore.getState().resetReviewState();
  assert.equal(useConversationReviewStore.getState().status, "create");
  assert.equal(useConversationReviewStore.getState().isDisabled, true);

  const mockCreate = () => {};
  const mockComplete = () => {};

  useConversationReviewStore.getState().setReviewState({
    status: "complete",
    isLoading: false,
    isDisabled: false,
    onCreateOrUpdate: mockCreate,
    onComplete: mockComplete,
  });

  assert.equal(useConversationReviewStore.getState().status, "complete");
  assert.equal(useConversationReviewStore.getState().isDisabled, false);
  assert.equal(useConversationReviewStore.getState().onCreateOrUpdate, mockCreate);
  assert.equal(useConversationReviewStore.getState().onComplete, mockComplete);

  useConversationReviewStore.getState().resetReviewState();
  assert.equal(useConversationReviewStore.getState().status, "create");
  assert.equal(useConversationReviewStore.getState().isDisabled, true);
  assert.equal(useConversationReviewStore.getState().onCreateOrUpdate, null);
  assert.equal(useConversationReviewStore.getState().onComplete, null);
});

test("chapter completion flow triggers onComplete and allows immediate review reset", () => {
  let completed = false;
  const onComplete = () => {
    completed = true;
    useConversationReviewStore.getState().resetReviewState();
  };

  useConversationReviewStore.getState().setReviewState({
    status: "complete",
    isLoading: false,
    isDisabled: false,
    onCreateOrUpdate: null,
    onComplete,
  });

  const stateBefore = useConversationReviewStore.getState();
  assert.equal(stateBefore.status, "complete");
  assert.equal(stateBefore.isDisabled, false);

  // Invoke onComplete directly as BottomActionBar does
  stateBefore.onComplete();
  assert.equal(completed, true);

  // State should be immediately reset so no lingering review state or feedback
  const stateAfter = useConversationReviewStore.getState();
  assert.equal(stateAfter.status, "create");
  assert.equal(stateAfter.isDisabled, true);
  assert.equal(stateAfter.onComplete, null);
});

