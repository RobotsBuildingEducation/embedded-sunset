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

test("when navigating to a new chapter with an existing saved app, status is 'update' before generation", () => {
  const state = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Previous Chapter App</div>; }",
    isLoading: false,
    hasGeneratedForCurrentStep: false,
  });

  assert.equal(state.status, "update");
  assert.equal(state.isDisabled, false);
});

test("in a new chapter, generating code updates hasGeneratedForCurrentStep and transitions status to 'complete'", () => {
  // Arriving at chapter review: status is update
  const beforeState = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Previous Chapter App</div>; }",
    isLoading: false,
    hasGeneratedForCurrentStep: false,
  });
  assert.equal(beforeState.status, "update");
  assert.equal(beforeState.isDisabled, false);

  // During generation: status is update, disabled is true
  const generatingState = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Previous Chapter App</div>; }",
    isLoading: true,
    hasGeneratedForCurrentStep: false,
  });
  assert.equal(generatingState.status, "update");
  assert.equal(generatingState.isDisabled, true);

  // After generation for current chapter completes: status becomes complete
  const afterState = calculateConversationReviewState({
    idea: "Flashcard tutor",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Progressively Updated App</div>; }",
    isLoading: false,
    hasGeneratedForCurrentStep: true,
  });
  assert.equal(afterState.status, "complete");
  assert.equal(afterState.isDisabled, false);
});

test("when an existing app is present in a new chapter, editing idea keeps status as 'update'", () => {
  const state = calculateConversationReviewState({
    idea: "Flashcard tutor with spaced repetition",
    savedIdea: "Flashcard tutor",
    code: "function App() { return <div>Previous Chapter App</div>; }",
    isLoading: false,
    hasGeneratedForCurrentStep: false,
  });

  assert.equal(state.status, "update");
  assert.equal(state.isDisabled, false);
});

test("translation contains generatingApp label for loader across all languages", async () => {
  const fs = await import("node:fs");
  const content = fs.readFileSync(
    new URL("../../utility/translation.jsx", import.meta.url),
    "utf8",
  );

  assert.ok(
    content.includes('generatingApp: "Generating app...",'),
    "contains generatingApp for English",
  );
  assert.ok(
    content.includes('generatingApp: "Generando app...",'),
    "contains generatingApp for Spanish",
  );
  const matches = content.match(/generatingApp:\s*["'][^"']+["']/g);
  assert.equal(matches?.length, 6);
});

