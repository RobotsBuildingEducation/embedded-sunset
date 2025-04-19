import { useState } from "react";
import { model, simplemodel, promodel } from "../database/firebaseResources";
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

export const useSimpleGeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * submitPrompt: Streams text from a given prompt (string).
   */
  const submitPrompt = async (prompt) => {
    setLoading(true);

    try {
      // 1) Make the streaming request
      const result = await simplemodel.generateContentStream(prompt);

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
   * submitPrompt: Streams text from a given prompt (string),
   * first showing “thinking” chunks, then the final answer.
   */
  const submitPrompt = async (prompt) => {
    setLoading(true);

    // 1) Immediately show a thinking placeholder
    const thinkingMessage = {
      content: "",
      type: "thinking",
      meta: { loading: true, chunks: [] },
    };
    setMessages((prev) => [...prev, thinkingMessage]);
    const thinkingIndex = messages.length;

    try {
      // 2) Kick off a single combined stream that includes reasoning & answer
      //    (your SDK may require a flag like includeReasoning:true)
      const result = await promodel.generateContentStream(prompt, {
        stream: true,
      });

      // 3) Prepare a second message for the final answer
      const answerMessage = {
        content: "",
        type: "answer",
        meta: { loading: true, chunks: [] },
      };
      setMessages((prev) => [...prev, answerMessage]);
      const answerIndex = thinkingIndex + 1;

      // 4) Consume chunks and route them based on chunk.tag (or however your SDK labels them)
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (chunk.tag === "thought") {
          // update thinking message
          setMessages((prev) => {
            const msgs = [...prev];
            const msg = msgs[thinkingIndex];
            msg.content += text;
            msg.meta.chunks.push({ content: text });
            return msgs;
          });
        } else {
          // update answer message
          setMessages((prev) => {
            const msgs = [...prev];
            const msg = msgs[answerIndex];
            msg.content += text;
            msg.meta.chunks.push({ content: text });
            return msgs;
          });
        }
      }

      // 5) Mark both as done
      setMessages((prev) => {
        const msgs = [...prev];
        msgs[thinkingIndex].meta.loading = false;
        msgs[answerIndex].meta.loading = false;
        return msgs;
      });
    } catch (error) {
      console.error("Error streaming from Gemini:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetMessages = () => setMessages([]);

  return { messages, loading, submitPrompt, resetMessages };
};
