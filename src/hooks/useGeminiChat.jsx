import { useCallback, useRef, useState } from "react";
import {
  model,
  simplemodel,
  promodel,
  thinkingmodel,
  educationmodel,
  conversationReviewModel,
  knowledgeLedgerOnboardingModel,
  knowledgeLedgerModalModel,
} from "../database/firebaseResources";
import { Schema } from "firebase/vertexai";

export const useGeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  let newModel = model;

  // Define the JSON schema for structured output
  const jsonSchema = Schema.object({
    properties: {
      input: Schema.string(),
      output: Schema.array({
        items: Schema.object({
          properties: {
            code: Schema.string(),
            explanation: Schema.string(),
          },
        }),
      }),
    },
  });

  // Set the proper generation config with responseSchema
  newModel.generationConfig = {
    responseMimeType: "application/json",
    responseSchema: jsonSchema,
  };

  const submitPrompt = async (prompt) => {
    setLoading(true);
    try {
      const result = await model.generateContentStream(prompt);

      // Create an initial message object
      const newMessage = {
        content: "",
        meta: {
          loading: true,
          chunks: [],
        },
      };

      setMessages((prev) => [...prev, newMessage]);

      let fullResponse = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        setMessages((prev) => {
          const updatedMessages = [...prev];
          const currentMessage = updatedMessages[updatedMessages.length - 1];
          currentMessage.content = fullResponse;
          currentMessage.meta.chunks.push({
            content: chunkText,
            final: false,
          });
          return updatedMessages;
        });
      }

      // Mark the last chunk as final
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const currentMessage = updatedMessages[updatedMessages.length - 1];
        currentMessage.meta.loading = false;
        if (currentMessage.meta.chunks.length > 0) {
          currentMessage.meta.chunks[
            currentMessage.meta.chunks.length - 1
          ].final = true;
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    submitPrompt,
    resetMessages,
    loading,
  };
};

const useStreamingGeminiChat = (geminiModel) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messageIdRef = useRef(0);
  const resetVersionRef = useRef(0);

  const submitPrompt = useCallback(async (prompt) => {
    const messageId = ++messageIdRef.current;
    const resetVersion = resetVersionRef.current;
    const isCurrentStream = () => resetVersionRef.current === resetVersion;
    setLoading(true);

    try {
      const result = await geminiModel.generateContentStream(prompt);

      const newMessage = {
        id: messageId,
        content: "",
        meta: {
          loading: true,
          chunks: [],
        },
      };

      if (!isCurrentStream()) return;
      setMessages((prev) => [...prev, newMessage]);

      let fullResponse = "";

      for await (const chunk of result.stream) {
        if (!isCurrentStream()) return;

        const chunkText = chunk.text();
        fullResponse += chunkText;

        setMessages((prev) => {
          if (!isCurrentStream()) return prev;

          return prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: fullResponse,
                  meta: {
                    ...message.meta,
                    chunks: [
                      ...message.meta.chunks,
                      {
                        content: chunkText,
                        final: false,
                      },
                    ],
                  },
                }
              : message,
          );
        });
      }

      if (!isCurrentStream()) return;
      setMessages((prev) => {
        if (!isCurrentStream()) return prev;

        return prev.map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          const chunks = [...message.meta.chunks];
          const lastChunkIndex = chunks.length - 1;
          if (lastChunkIndex >= 0) {
            chunks[lastChunkIndex] = {
              ...chunks[lastChunkIndex],
              final: true,
            };
          }

          return {
            ...message,
            meta: {
              ...message.meta,
              loading: false,
              chunks,
            },
          };
        });
      });
    } catch (error) {
      console.error("Error streaming from Gemini:", error);
      throw error;
    } finally {
      if (isCurrentStream()) {
        setLoading(false);
      }
    }
  }, [geminiModel]);

  const resetMessages = useCallback(() => {
    resetVersionRef.current += 1;
    setMessages([]);
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    submitPrompt,
    resetMessages,
  };
};

export const useSimpleGeminiChat = () => useStreamingGeminiChat(simplemodel);

export const useEducationGeminiChat = () =>
  useStreamingGeminiChat(educationmodel);

export const useConversationReviewGeminiChat = () =>
  useStreamingGeminiChat(conversationReviewModel);

export const useKnowledgeLedgerOnboardingGeminiChat = () =>
  useStreamingGeminiChat(knowledgeLedgerOnboardingModel);

export const useKnowledgeLedgerModalGeminiChat = () =>
  useStreamingGeminiChat(knowledgeLedgerModalModel);

export const useThinkingGeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * submitPrompt: Streams text from a given prompt (string).
   */
  const submitPrompt = async (prompt) => {
    setLoading(true);

    try {
      // 1) Make the streaming request
      const result = await thinkingmodel.generateContentStream(prompt);

      // 2) Create a new message object to store partial text
      const newMessage = {
        content: "",
        meta: {
          loading: true, // Whether the streaming is ongoing
          chunks: [], // We’ll store each chunk of text here
        },
      };

      // 3) Append this new message to the messages array
      setMessages((prev) => [...prev, newMessage]);

      // 4) Accumulate partial text in a local variable, updating state after each chunk
      let fullResponse = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        // 5) Update the last message with partial text
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const currentMessage = updatedMessages[updatedMessages.length - 1];

          currentMessage.content = fullResponse;
          currentMessage.meta.chunks.push({
            content: chunkText,
            final: false, // We’ll mark it final after the loop ends
          });

          return updatedMessages;
        });
      }

      // 6) Mark the last chunk as final
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const currentMessage = updatedMessages[updatedMessages.length - 1];
        currentMessage.meta.loading = false;

        const lastChunkIndex = currentMessage.meta.chunks.length - 1;
        if (lastChunkIndex >= 0) {
          currentMessage.meta.chunks[lastChunkIndex].final = true;
        }

        return updatedMessages;
      });
    } catch (error) {
      console.error("Error streaming from Gemini:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * resetMessages: Clears out all existing messages and resets streaming state.
   */
  const resetMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    submitPrompt,
    resetMessages,
  };
};

export const useProGeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * submitPrompt: Streams text from a given prompt (string).
   */
  const submitPrompt = async (prompt) => {
    setLoading(true);

    try {
      // 1) Make the streaming request
      const result = await promodel.generateContentStream(prompt);

      console.log("result?", result);

      // 2) Create a new message object to store partial text
      const newMessage = {
        content: "",
        meta: {
          loading: true, // Whether the streaming is ongoing
          chunks: [], // We’ll store each chunk of text here
        },
      };

      // 3) Append this new message to the messages array
      setMessages((prev) => [...prev, newMessage]);

      // 4) Accumulate partial text in a local variable, updating state after each chunk
      let fullResponse = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        // 5) Update the last message with partial text
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const currentMessage = updatedMessages[updatedMessages.length - 1];

          currentMessage.content = fullResponse;
          currentMessage.meta.chunks.push({
            content: chunkText,
            final: false, // We’ll mark it final after the loop ends
          });

          return updatedMessages;
        });
      }

      // 6) Mark the last chunk as final
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const currentMessage = updatedMessages[updatedMessages.length - 1];
        currentMessage.meta.loading = false;

        const lastChunkIndex = currentMessage.meta.chunks.length - 1;
        if (lastChunkIndex >= 0) {
          currentMessage.meta.chunks[lastChunkIndex].final = true;
        }

        return updatedMessages;
      });
    } catch (error) {
      console.error("Error streaming from Gemini:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * resetMessages: Clears out all existing messages and resets streaming state.
   */
  const resetMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    submitPrompt,
    resetMessages,
  };
};
