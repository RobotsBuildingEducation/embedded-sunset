import { GENERATED_REACT_RUNTIME_REQUIREMENTS } from "./generatedReactCode.js";

/**
 * Determine the app development stage based on chapter group and completed curriculum titles.
 * Progression:
 * - "html": Beginner stages (Tutorial, Chapter 1, Chapter 2). Clean standalone HTML/CSS/JS render.
 * - "react": Frontend component development (Chapter 3, Chapter 4). React components with hooks.
 * - "fullstack": Advanced application experiences (Chapter 5, Chapter 6). React + Firebase & Chakra UI.
 */
export const determineAppStage = ({ group, completed = [] }) => {
  const g = String(group ?? "").toLowerCase();

  if (g === "tutorial" || g === "0" || g === "" || g === "1" || g === "2") {
    return "html";
  }

  if (g === "3" || g === "4") {
    return "react";
  }

  if (g === "5" || g === "6") {
    return "fullstack";
  }

  const hasFirebaseInCurriculum = completed.some((title) =>
    /firestore|firebase/i.test(String(title)),
  );
  if (hasFirebaseInCurriculum) return "fullstack";

  const hasReactInCurriculum = completed.some((title) =>
    /react|component|jsx/i.test(String(title)),
  );
  if (hasReactInCurriculum) return "react";

  return "html";
};

/**
 * Build the AI prompt for generating an app tailored precisely to the user's progress level.
 */
export const buildAppPrompt = ({
  completed = [],
  history = [],
  idea = "",
  userLanguage = "en",
  group = "tutorial",
}) => {
  const stage = determineAppStage({ group, completed });
  const isSpanish = String(userLanguage || "").toLowerCase().includes("es");

  let stageInstructions = "";

  if (stage === "html") {
    stageInstructions = `
CRITICAL STAGE RULE — BEGINNER LEVEL (BASIC HTML RENDER ONLY):
The learner is an elementary beginner (current chapter: ${group}) who has only completed introductory coding exercises. They have NOT learned React yet.
1. You MUST generate a basic HTML render. Return a complete, self-contained HTML page starting with <!DOCTYPE html>.
2. Structure requirements:
   - Must begin with <!DOCTYPE html>
   - <html lang="${isSpanish ? "es" : "en"}">
   - <head> with <meta charset="UTF-8">, mobile viewport meta tag, and an embedded <style> tag with modern, aesthetic, and responsive CSS.
   - <body> containing semantic HTML elements (header, main, buttons, inputs, cards) styled nicely for mobile and desktop.
   - Optional <script> tag before </body> with vanilla JavaScript to handle user interaction (e.g. event listeners, state in JS variables, button clicks, DOM updates) based on their idea.
3. ABSOLUTELY FORBIDDEN:
   - DO NOT generate React.
   - DO NOT use JSX syntax.
   - DO NOT write React.useState, React.useEffect, or React hooks.
   - DO NOT use render(...).
   - DO NOT import or require any external libraries.
   The learner has not been introduced to React, and generating React at this stage breaks the educational progression.
`;
  } else if (stage === "react") {
    stageInstructions = `
CRITICAL STAGE RULE — FRONTEND COMPONENT LEVEL (REACT):
The learner has reached frontend development (current chapter: ${group}) and has learned React, JSX, and component state.
1. You MUST generate a single React component that concludes with: render(<TheComponentYouCreated />)
2. Globally: Never use imports or require. React and dependencies are already in scope.
3. Call hooks directly through the React object (React.useState, React.useEffect, React.useRef).
4. Do NOT include DOCTYPE or full HTML structure; return React component code only.
${GENERATED_REACT_RUNTIME_REQUIREMENTS}
`;
  } else {
    stageInstructions = `
CRITICAL STAGE RULE — ADVANCED FULLSTACK LEVEL (REACT + FIREBASE & CHAKRA UI):
The learner has reached advanced application development (current chapter: ${group}) and has learned fullstack apps, cloud databases, and component design systems.
1. You MUST generate a React component concluding with: render(<TheComponentYouCreated />)
2. Globally: Never use imports or require.
${GENERATED_REACT_RUNTIME_REQUIREMENTS}
3. If writing Firebase features, use Firebase v9 and the 'experiments' collection. Never use any other collection. Assume the database is already initialized as the global identifier "database". Do not use auth. Only choose between: getDoc, doc, collection, addDoc, updateDoc, setDoc.
4. Feel welcome to use Chakra UI components directly (Box, Button, Flex, VStack, HStack, Text, Input, etc.). Never render ChakraProvider.
`;
  }

  const historyContext = history.length
    ? `\nPrevious code versions from earlier chapters in chronological order: ${JSON.stringify(history)}.\nBuild upon and progressively refine the user's previous work while respecting their current stage.\n`
    : "";

  const themeIdea = idea
    ? `\nApp Idea: "${idea}". Design and theme the application around this idea in good faith.\n`
    : "";

  return (
    `Context for the prompt:\n` +
    `The individual is using an educational coding app learning computer science and development in sequential stages. Based on the user's completed steps: ${JSON.stringify(
      completed,
    )}, generate an application that matches their exact current learning stage.\n` +
    historyContext +
    `\nStrict requirements:\n` +
    `1. Educational Progression: The code must strictly reflect the user's stage. Do not jump ahead to advanced frameworks before the student has learned them.\n` +
    stageInstructions +
    `\n` +
    `2. Code formatting: Strictly return ONLY the code block enclosed in triple backticks. Do not include introductory text, conversational pleasantries, or explanations outside the code block.\n` +
    `3. Language: The user's preferred language is ${isSpanish ? "Spanish" : "English"}. User-facing strings and comments in the generated app should be in ${isSpanish ? "Spanish" : "English"}.\n` +
    themeIdea +
    `4. Responsiveness: The code MUST be mobile-friendly and responsive for both mobile and desktop viewports.`
  );
};
