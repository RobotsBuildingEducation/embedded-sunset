import { getToken } from "firebase/app-check";
import React, { useState } from "react";
import { ReadableStream } from "web-streams-polyfill";
import { appCheck } from "../database/firebaseResources";

// Converts the OpenAI API params + chat messages list + an optional AbortSignal into a shape that
// the fetch interface expects.
export const getOpenAiRequestOptions = (
  { apiKey, model, ...restOfApiParams },
  messages,
  signal
) => ({
  headers: {
    "Content-Type": "application/json",
    // "X-Firebase-AppCheck": appCheckToken.token,
    // Authorization: `Bearer ${apiKey}`,
  },
  method: "POST",
  body: JSON.stringify({
    model,
    // Includes all settings related to how the user wants the OpenAI API to execute their request.
    ...restOfApiParams,
    messages,
    stream: false, // Disable streaming
  }),
  signal,
});

// const CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const CHAT_COMPLETIONS_URL =
  "https://us-central1-test-data-895e2.cloudfunctions.net/app/obsessed-stalker";

/**
   *       const updatedChunks = [
          ...msg.meta.chunks,
          {
            content: chunkContent,
            role: chunkRole,
            timestamp: Date.now(),
            final: isFinal,
          },
        ];
   */
const textDecoder = new TextDecoder("utf-8");
// Takes a set of fetch request options and calls the onIncomingChunk and onCloseStream functions
// as chunks of a chat completion's data are returned to the client, in real-time.
export const openAiCompletionHandler = async (requestOpts) => {
  const appCheckTokenResult = await getToken(appCheck);
  const appCheckToken = appCheckTokenResult.token;
  requestOpts["headers"]["X-Firebase-AppCheck"] = appCheckToken;

  const response = await fetch(CHAT_COMPLETIONS_URL, requestOpts);
  if (!response.ok) {
    throw new Error(
      `Network response was not ok: ${response.status} - ${response.statusText}`
    );
  }

  const result = await response.json(); // Await the entire response as JSON
  return result; // Return the full JSON response
};

const MILLISECONDS_PER_SECOND = 1000;
// Utility method for transforming a chat message decorated with metadata to a more limited shape
// that the OpenAI API expects.
const officialOpenAIParams = ({ content, role }) => ({ content, role });
// Utility method for transforming a chat message that may or may not be decorated with metadata
// to a fully-fledged chat message with metadata.
const createChatMessage = ({ content, role, ...restOfParams }) => ({
  content,
  role,
  timestamp: restOfParams.timestamp ?? Date.now(),
  meta: {
    loading: false,
    responseTime: "",
    chunks: [],
    ...restOfParams.meta,
  },
});
// Utility method for updating the last item in a list.
export const updateLastItem = (msgFn) => (currentMessages) =>
  currentMessages.map((msg, i) => {
    if (currentMessages.length - 1 === i) {
      return msgFn(msg);
    }
    return msg;
  });
export const useChatCompletion = (apiParams) => {
  const [messages, _setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [controller, setController] = useState(null);
  // Abort an in-progress streaming response
  const abortResponse = () => {
    if (controller) {
      controller.abort();
      setController(null);
    }
  };
  // Reset the messages list as long as a response isn't being loaded.
  const resetMessages = () => {
    if (!loading) {
      _setMessages([]);
    }
  };
  // Overwrites all existing messages with the list of messages passed to it.
  const setMessages = (newMessages) => {
    if (!loading) {
      _setMessages(newMessages.map(createChatMessage));
    }
  };
  // When new data comes in, add the incremental chunk of data to the last message.
  const handleNewData = async (content, role, isFinal = false) => {
    _setMessages(
      updateLastItem((msg) => {
        const updatedChunks = [
          ...msg.meta.chunks,
          {
            content: content,
            role: role,
            timestamp: Date.now(),
            final: isFinal,
          },
        ];

        return {
          ...msg,
          content: `${msg.content}${content}`, // Append final content
          role: msg.role || role,
          meta: {
            ...msg.meta,
            chunks: updatedChunks,
          },
        };
      })
    );
  };

  // Handles what happens when the stream of a given completion is finished.
  const closeStream = (beforeTimestamp) => {
    // Determine the final timestamp, and calculate the number of seconds the full request took.
    const afterTimestamp = Date.now();
    const diffInSeconds =
      (afterTimestamp - beforeTimestamp) / MILLISECONDS_PER_SECOND;
    const formattedDiff = diffInSeconds.toFixed(2) + " sec.";
    // Update the messages list, specifically update the last message entry with the final
    // details of the full request/response.
    _setMessages(
      updateLastItem((msg) => ({
        ...msg,
        timestamp: afterTimestamp,
        meta: {
          ...msg.meta,
          loading: false,
          responseTime: formattedDiff,
          done: true,
        },
      }))
    );
  };
  const submitPrompt = React.useCallback(
    async (newMessages) => {
      // Don't let two calls happen at the same time
      if (messages[messages.length - 1]?.meta?.loading) return;

      // Don't make a request if no new messages
      if (!newMessages || newMessages.length < 1) {
        return;
      }
      setLoading(true);

      // Update the messages with a placeholder for the response
      const updatedMessages = [
        ...messages,
        ...newMessages.map(createChatMessage),
        createChatMessage({
          content: "",
          role: "",
          timestamp: 0,
          meta: { loading: true },
        }),
      ];

      _setMessages(updatedMessages);

      // Create a controller for aborting the request
      const newController = new AbortController();
      const signal = newController.signal;
      setController(newController);

      // Define request options
      const requestOpts = getOpenAiRequestOptions(
        apiParams,
        updatedMessages
          .filter((m, i) => updatedMessages.length - 1 !== i) // Remove placeholder
          .map(officialOpenAIParams),
        signal
      );

      try {
        // Fetch the full completion response
        const openaiResponse = await openAiCompletionHandler(requestOpts);

        // Handle the final response (assumes the final result is in openaiResponse)
        handleNewData(
          openaiResponse.choices[0].message.content,
          openaiResponse.choices[0].message.role,
          true
        );

        // Finalize stream (closeStream is optional now since it's not streaming)
        closeStream(Date.now());
      } catch (err) {
        if (signal.aborted) {
          console.error(`Request aborted`, err);
        } else {
          console.error(`Error during chat completion`, err);
        }
      } finally {
        setController(null);
        setLoading(false);
      }
    },
    [messages]
  );

  return {
    messages,
    loading,
    submitPrompt,
    abortResponse,
    resetMessages,
    setMessages,
  };
};
