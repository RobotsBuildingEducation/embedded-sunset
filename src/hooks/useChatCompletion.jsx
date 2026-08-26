import { useChatCompletion as useOpenAIChatCompletion } from "../utility/stream";

const useChatCompletion = (config) => {
  return useOpenAIChatCompletion({
    model: "gpt-5-nano",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    reasoning: { effort: "minimal" },
    text: { verbosity: "low" },
    ...config,
  });
};

export { useChatCompletion };
