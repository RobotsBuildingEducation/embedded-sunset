// Keep one cadence for the app session so navigating between course views
// does not restart the interval. Question 1 always gets a transition; pick a
// fresh random interval after it and after every subsequent transition.
export const createQuestionTransitionCadence = (random = Math.random) => {
  const pickInterval = () => 3 + Math.floor(random() * 5);
  let questionsRemaining = pickInterval();

  return {
    isNextTransitionDue: (questionIndex) =>
      questionIndex === 1 || questionsRemaining === 1,
    completeQuestion: (questionIndex) => {
      questionsRemaining -= 1;
      if (questionIndex !== 1 && questionsRemaining > 0) return false;

      questionsRemaining = pickInterval();
      return true;
    },
  };
};
