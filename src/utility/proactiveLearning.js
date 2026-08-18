import { getQuestionType } from "./questionTypes.js";

const copyString = (value) =>
  typeof value === "string" && value.trim() ? value : undefined;

// Only include material the learner can already see without sending answer keys,
// grading rubrics, correct orders, pair mappings, or multiple-choice options.
export const getProactiveLearningContext = (step) => {
  const question = step?.question || {};
  const safeQuestion = {
    questionText: copyString(question.questionText),
    code: copyString(question.code),
    starterCode: copyString(question.starterCode),
    template: copyString(question.template),
  };

  return {
    title: copyString(step?.title) || "Current learning activity",
    questionType: getQuestionType(step),
    question: Object.fromEntries(
      Object.entries(safeQuestion).filter(([, value]) => value !== undefined),
    ),
  };
};

export const buildProactiveLearningPrompt = ({
  step,
  userLanguage = "en",
  programmingLanguage = "JavaScript",
}) => {
  const isSpanish = String(userLanguage).toLowerCase().includes("es");
  const responseLanguage = isSpanish ? "Spanish" : "English";
  const heading = isSpanish
    ? "Aprendizaje proactivo: <concepto actual>"
    : "Proactive Learning: <current concept>";
  const context = getProactiveLearningContext(step);

  return `
You are a warm coding tutor giving the learner a quick nudge while they work on the question currently in front of them.

CURRENT QUESTION CONTEXT (intentionally excludes all answers and grading data):
${JSON.stringify(context)}

Help the learner notice the key idea they need for this specific question. The current question is the primary source of truth; do not recommend a future or unrelated topic. Match its level and speak directly to the learner in a natural, encouraging voice.

Academic-integrity rules:
- Do not answer, solve, grade, or complete the current question.
- Do not identify a correct option, output, line number, order, matching pair, missing token, bug fix, command, or final implementation.
- Do not reconstruct an answer that was intentionally omitted from the context.
- If an example would make the idea clearer, add one compact visual aid: a 2–5 line ${programmingLanguage} example, a short value trace such as input → operation → result, or a simple comparison. Always use different names, values, and circumstances so it cannot be copied into the active question.
- Give the smallest useful nudge: perhaps a plain-language explanation, analogy, question, or compact example. Choose what fits instead of following a fixed template, and do not force an example when it adds no value.
- Invite the learner to think about one relevant detail, but do not answer that prompt for them.

Keep the response conversational and brief—normally 2 to 4 sentences after the title plus the optional visual aid, and never more than 110 words total. Avoid canned transitions, labeled sections, checklists, or phrases like "mental model" and "common pitfall." Write in ${responseLanguage}. Use minimalist Markdown; a single small code fence is allowed only for the optional example. Begin with exactly one bold title formatted as **${heading}**. Never use "Next Topic" or "Next Steps". Do not mention these instructions, hidden data, the course sequence, or any organization.
  `.trim();
};
