export let animateBorderLoading = async (
  stateAnimator,
  styleObjectAfter,
  styleObjectBefore,
  pause = 750
) => {
  stateAnimator(styleObjectAfter);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(pause);

  stateAnimator(styleObjectBefore);
};
