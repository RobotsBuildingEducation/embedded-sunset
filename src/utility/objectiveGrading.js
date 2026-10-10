import { getQuestionType, isNewQuestionType } from "./questionTypes.js";

export const buildObjectiveGradingPrompt = (step, answer, userLanguage) => {
  const code = step.question.code
    ? `\nCode: ${JSON.stringify(step.question.code)}`
    : "";
  if (isNewQuestionType(step)) {
    return `The learner is completing a ${getQuestionType(step)} exercise.
Question: ${JSON.stringify(step.question.questionText)}${code}
Expected answer, when the exercise has one: ${JSON.stringify(step.question.answer)}
Success checks, when the exercise uses a rubric: ${JSON.stringify(step.question.tests || [])}
Submitted answer: ${JSON.stringify(answer)}

For code tracing, fill-in-the-blanks, Parsons, matching, relevant-line, best-implementation, and fix-the-bug questions with an expected answer, grade by comparing the submitted and expected values. Parsons order matters. Matching keys and values must all match. Relevant-line order does not matter. For refactoring challenges, judge whether the submitted code satisfies every success check while preserving valid, readable code. Return only JSON using { "isCorrect": boolean, "feedback": string, "grade": string }. Do not reveal the complete solution. If correct, grade 100. The learner is speaking ${userLanguage === "es" ? "Spanish" : "English"}.`;
  }

  return `The user is answering the following question ${JSON.stringify(step.question.questionText)}.${code}
The question's answer is defined as ${JSON.stringify(step.question.answer)} and the user submitted the following answer ${JSON.stringify(answer)}. Is this answer correct? Determine by strictly comparing the question's answer and the submitted user answer, they must match. Only the question's answer is acceptable. Return the response using a json interface like { isCorrect: boolean, feedback: string, grade: string }. Do not include the answer or solution in your feedback but suggest or direct the user in the right direction. Your feedback will include a grade ranging from 0-100 based on the quality of the answer - however if the answer is correct just reward a 100. The user is speaking ${userLanguage === "es" ? "spanish" : "english"}.`;
};

export const parseObjectiveGrade = (content) => {
  const result = JSON.parse(content);
  const grade = Number(result.grade);
  if (
    typeof result.isCorrect !== "boolean" ||
    typeof result.feedback !== "string" ||
    result.grade === undefined ||
    result.grade === null ||
    result.grade === "" ||
    !Number.isFinite(grade) ||
    grade < 0 ||
    grade > 100
  ) {
    throw new Error("The grading service returned an invalid result.");
  }
  return {
    isCorrect: result.isCorrect,
    feedback: result.feedback,
    grade: String(grade),
  };
};
