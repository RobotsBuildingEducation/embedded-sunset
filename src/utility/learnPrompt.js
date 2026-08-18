export const getProgrammingLanguage = (language = "en") => {
  const languages = {
    en: "JavaScript",
    es: "JavaScript",
    "py-en": "Python",
    "swift-en": "Swift",
    "android-en": "Java",
    "compsci-en": "Python",
  };
  return languages[language] || "JavaScript";
};

export const buildLearnPrompt = (
  step,
  userLanguage = "en",
  relevantSteps = null,
) => {
  const languageName = getProgrammingLanguage(userLanguage);
  const isEnglish = String(userLanguage).toLowerCase().includes("en");
  const isGroupThreeOrHigher =
    Number(step?.group) >= 3 || Boolean(step?.showPreview);

  const visualWidgetInstruction = isGroupThreeOrHigher
    ? `
CRITICAL INTERACTIVE WIDGET RULES:
- Include at most ONE single interactive preview widget per lecture, placed toward the end of the explanation, wrapped in a \`\`\`preview ... \`\`\` code block.
- ONLY use \`\`\`preview for complete, standalone UI component simulations (such as interactive forms, toggle buttons, tab switchers, search filters, state machines, or throttled API/Auth simulators with buttons).
- ALL ordinary code examples, helper functions, backend routes, fetch calls, token handlers, and algorithmic logic MUST use standard \`\`\`${languageName.toLowerCase()} code blocks, NEVER \`\`\`preview.
- The \`\`\`preview code block MUST be a single, complete React functional component (e.g. \`function ExampleSimulator() { const [state, setState] = React.useState(...); return ( <div ...> ... </div> ); }\`) returning valid JSX.
- NEVER write raw statements, fragmented lines, or non-component code inside \`\`\`preview.
- PERFORMANCE & LOOP SAFETY: NEVER create unthrottled infinite loops or rapid useEffect triggers. If demonstrating loops, counts, or async state, throttle intervals to at least 400ms, cap trigger counts at a safe visual maximum (e.g. stop at 20), and ALWAYS clean up timers on unmount (return () => clearInterval(...)).
- RESPONSIVE MOBILE DESIGN: Ensure all widget containers and child elements are fully responsive and fit mobile screens under 360px. Always use flexWrap: 'wrap' or grid layouts for buttons and item groups, use width: '100%' and maxWidth: '100%', boxSizing: 'border-box', and ensure output/code boxes use whiteSpace: 'pre-wrap', wordBreak: 'break-word', or overflowX: 'auto'. Never allow UI elements or text to overflow or clip.
- Use inline styles (style={{ ... }}) or standard HTML/Chakra tags with no external package imports (React and Chakra UI are available globally). All UI text/labels inside the widget must be in ${
        isEnglish ? "English" : "Spanish"
      }.`
    : "";

  if (step?.isConversationReview) {
    const payload = relevantSteps ?? step;
    return `Generate educational material about ${JSON.stringify(
      payload,
    )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Format short identifiers, class names, method names, properties, and single expressions with single backticks so they remain inline with prose. Always wrap entire multiline code examples in a single complete fenced code block (e.g. \`\`\`javascript ... \`\`\`).${visualWidgetInstruction} Fenced code blocks may contain source code only, never explanatory prose. Keep code lines within 80 characters, and never interrupt a code snippet with unformatted text or split it into fragmented blocks. Do not begin the response with a fenced code block. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
      isEnglish ? "english" : "spanish"
    }`;
  }

  return `Generate educational ${languageName} material about ${JSON.stringify(
    step,
  )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Format short identifiers, class names, method names, properties, and single expressions with single backticks so they remain inline with prose. Always wrap entire multiline code examples in a single complete fenced code block (e.g. \`\`\`javascript ... \`\`\`).${visualWidgetInstruction} Fenced code blocks may contain source code only, never explanatory prose. Keep code lines within 80 characters, and never interrupt a code snippet with unformatted text or split it into fragmented blocks. Do not begin the response with a fenced code block. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
    isEnglish ? "english" : "spanish"
  }`;
};
