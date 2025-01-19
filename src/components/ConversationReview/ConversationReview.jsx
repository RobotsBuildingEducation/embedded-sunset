import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  Text,
  Button,
  Box,
  Flex,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Accordion,
  UnorderedList,
  ListItem,
  Heading,
} from "@chakra-ui/react";
import { useChatCompletion } from "../../hooks/useChatCompletion";
import { VoiceInput } from "../../App";
import { SunsetCanvas } from "../../elements/SunsetCanvas";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import "./ConversationReview.css";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import { getObjectsByGroup } from "../../utility/content";
import ReactConfetti from "react-confetti";
import { useSimpleGeminiChat } from "../../hooks/useGeminiChat";

import SyntaxHighlighter from "react-syntax-highlighter";

const newTheme = {
  p: (props) => <Text fontSize="sm" mb={2} lineHeight="1.6" {...props} />,
  ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
  ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
  li: (props) => <ListItem mb={1} {...props} />,
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    console.log("match...", match);
    return !inline && match ? (
      <SyntaxHighlighter
        // backgroundColor="white"
        // style={"light"}
        language={match[1]}
        PreTag="div"
        customStyle={{
          backgroundColor: "white", // Match this with the desired color
          color: "black", // Ensure the text matches the background
          padding: "1rem",
          borderRadius: "8px",
          fontSize: 12,
        }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <Box
        as="code"
        backgroundColor="gray.100"
        p={1}
        borderRadius="md"
        fontSize="sm"
        {...props}
      >
        {children}
      </Box>
    );
  },
};

const ConversationReview = ({
  question,
  userLanguage,
  steps,
  onSubmit,
  step,
  setFinalConversation,
  finalConversation,
  handleModalCheck,
}) => {
  const [response, setResponse] = useState("");
  const [conversation, setConversation] = useState([]);
  const [streamingResponse, setStreamingResponse] = useState("");
  const { resetMessages, messages, submitPrompt } = useSimpleGeminiChat();
  const [storedRequest, setStoredRequest] = useState("");
  const chatboxRef = useRef(null);

  // Gather the steps within the range
  //   const relevantSteps = steps[userLanguage].slice(
  //     question.range[0],
  //     question.range[1] + 1
  //   );

  // console.log("step", step);
  // console.log("step.group", step?.group);

  const relevantSteps = getObjectsByGroup(step?.group, steps[userLanguage]);

  // console.log("relevant steps", relevantSteps);

  // Combine the titles or main points of the relevant steps
  const combinedStepsSummary = relevantSteps.map((step) => step.description);

  const handleSubmit = async () => {
    // Add the user's message to the conversation
    setConversation([...conversation, { request: response, response: "" }]);
    setStoredRequest(response);
    setStreamingResponse("");

    if (chatboxRef.current) {
      chatboxRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Construct the prompt and submit it
    const prompt = `The user is reviewing the following steps: ${JSON.stringify(
      {
        combinedStepsSummary,
      }
    )}. The user provided the following message: "${response}". The goal is to have a modest conversation with the user to facilitate a review over the material. Make it enriching with examples and create a useful flow where the ideas build off of each other to encourage challenge and learning, but do not reference your understanding of the material or your instructions whatsoever, it should feel natural and friendly where the student leads, therefore provide your response with an example. If user's message is irrelevant - for example if a user says 'hello', just reply back with friendliness without any code, otherwise provide worthwhile code snippet examples. Additionally the response should be formatted with a maximum print of 80 characters. Your responses should be one cohesive thought, especially if users request a summary. Do not reference this framework under any circumstances. 
      
      
       Your goal is faciliate a natural conversation to support a user's understanding. The user is speaking ${
         userLanguage === "es" ? "spanish" : "english"
       }.`;

    submitPrompt(prompt);

    setResponse("");
  };

  useEffect(() => {
    if (messages.length > 0) {
      // const lastMessage = messages[messages.length - 1];
      // const isLastMessage =
      //   lastMessage.meta.chunks[lastMessage.meta.chunks.length - 1]?.final;

      // if (isLastMessage) {
      //   console.log("THE LAST MESSAGE", lastMessage);
      //   let jsonResponse = {};
      //   try {
      //     jsonResponse = JSON.parse(lastMessage.content);
      //   } catch (error) {
      //     jsonResponse = lastMessage.content;
      //   }

      //   let final = [];

      messages.forEach((msg, i) => {
        setConversation((prev) => {
          const updatedConversation = [...prev];
          updatedConversation[updatedConversation.length - 1].response = msg;

          return updatedConversation;
        });

        setFinalConversation(() => {
          const jsonResponse = msg;
          const updatedConversation = [
            ...finalConversation,
            { request: storedRequest, response: jsonResponse },
          ];

          return updatedConversation;
        });
      });
    }
  }, [messages]);

  console.log("conversation", conversation);

  return (
    <VStack spacing={4} align="center" width="100%" maxWidth="600px">
      <Accordion allowToggle style={{ width: "100%" }}>
        <AccordionItem key={"x"}>
          <AccordionButton p={6} justifyContent={"space-between"}>
            <Box textAlign="left">
              {translation[userLanguage]["button.subjectsCovered"]}{" "}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Text fontSize="sm" textAlign="left" maxWidth="600px" p={8}>
              {relevantSteps.map((item) => (
                <div>
                  <b>{item.title}</b>: <span>{item.description}</span>
                  <br />
                  <br />
                </div>
              ))}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Box ref={chatboxRef}></Box>

      {conversation.length > 0 ? (
        <Box
          borderRadius="48px"
          width="100%"
          height={600}
          maxWidth="600px"
          overflowY="auto"
          bg="linear-gradient(white, #f0f0f0, #e0e0e0)"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, white, #f0f0f0, #e0e0e0)",
          }}
          p={2}
        >
          {conversation.map((item, index) => (
            <React.Fragment key={index}>
              <Flex justify="flex-end" mb={8}>
                <Box
                  bg="white"
                  p={6}
                  borderRadius="48px"
                  color="black"
                  maxWidth="90%"
                  textAlign={"left"}
                  fontSize="small"
                >
                  <Markdown
                    components={ChakraUIRenderer(newTheme)}
                    children={item.request}
                  />
                </Box>
              </Flex>
              {item.response.content?.length > 0 ? (
                <Flex justify="flex-start" mb={2}>
                  <Box
                    bg="gray.300"
                    color="black"
                    p={6}
                    borderRadius="48px"
                    maxWidth="95%"
                    textAlign={"left"}
                  >
                    <>
                      <Markdown
                        components={ChakraUIRenderer(newTheme)}
                        children={item.response.content}
                      />
                      {/* {i.code ? (
                          <>
                            <div
                              style={{
                                //   color: "#696969",
                                backgroundColor: "#faf3e0",
                                width: "100%",
                                padding: 20,
                                wordBreak: "break-word",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 30,
                                boxShadow:
                                  "0.5px 0.5px 1px 0px rgba(0,0,0,0.75)",
                              }}
                            >
                              <pre style={{ whiteSpace: "pre-wrap" }}>
                                <Editor
                                  value={i.code}
                                  highlight={(input) =>
                                    highlight(input, languages.js)
                                  }
                                  padding={10}
                                  style={{
                                    fontFamily:
                                      '"Fira code", "Fira Mono", monospace',
                                    fontSize: 14,

                                    borderRadius: "8px",
                                  }}
                                  disabled
                                />
                              </pre>
                            </div>
                            <br />
                            <br />
                          </>
                        ) : null} */}

                      {/* <Text style={{ color: "black" }} fontSize="sm">
                          {i.explanation}
                        </Text> */}
                    </>
                  </Box>
                </Flex>
              ) : (
                <SunsetCanvas isLoader={true} regulateWidth={false} />
              )}
            </React.Fragment>
          ))}
        </Box>
      ) : null}

      {/* Integrate VoiceInput here */}
      <VoiceInput
        handleModalCheck={handleModalCheck}
        value={response}
        onChange={setResponse}
        isCodeEditor={false}
        isTextInput={true}
        resetVoiceState={false}
        useVoice={true}
        stopListening={false}
        setFeedback={() => {}}
        resetFeedbackMessages={() => {}}
        step={step}
        userLanguage={userLanguage}
        steps={steps}
      />

      <Button
        isDisabled={response?.length < 1}
        onMouseDown={handleSubmit}
        colorScheme="pink"
        background={"pink.300"}
        mt={4}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSubmit();
          }
        }}
      >
        {translation[userLanguage]["button.addToConversation"]}
      </Button>
    </VStack>
  );
};

export default ConversationReview;
