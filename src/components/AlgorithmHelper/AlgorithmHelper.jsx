import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  HStack,
  Heading,
  Code,
  OrderedList,
  ListItem,
  Box,
  Flex,
  Text,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { translation } from "../../utility/translation";
import Markdown from "react-markdown";
import {
  createDecisionMap,
  generateProblem,
  TreeNode,
  SelectedPath,
  getRandomTree,
} from "./AlgorithmHelper.utils";
// import { useSimpleGeminiChat } from "../../hooks/useGeminiChat";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import {
  // model,
  simplemodel,
} from "../../database/firebaseResources";

import { ArrowDownIcon, ArrowForwardIcon } from "@chakra-ui/icons";

const newTheme = {
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h4: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h5: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h6: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ node, inline, className, children, ...props }) => {
    // Detect if it's a single word or short phrase
    const content = Array.isArray(children)
      ? children.join("")
      : String(children);

    // Check if the content is a single word
    const isSingleWord = content.trim().split(/\s+/).length === 1;

    // Inline code styling
    if (isSingleWord) {
      return (
        <Code
          p={1}
          borderRadius={8}
          display="inline" // Prevent block display
          fontFamily={"Fira code, Fira Mono, monospace"}
          fontSize="xs"
          {...props}
        >
          {children}
        </Code>
      );
    }

    // Multi-line or multi-word code block styling
    return (
      <Box
        as="pre"
        fontFamily={"Fira code, Fira Mono, monospace"}
        fontSize="xs"
        p={3}
        borderRadius={8}
        {...props}
      >
        <Code
          p={6}
          display="block"
          wordBreak="break-word"
          fontSize="sm"
          overflowX="scroll"
        >
          {children}
        </Code>
      </Box>
    );
  },
};

export const AlgorithmHelper = ({ isOpen, onClose, userLanguage }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  let mapImage = createDecisionMap();

  const [currentNode, setCurrentNode] = useState(mapImage);
  const [selectedPath, setSelectedPath] = useState([]);
  const [contentStack, setContentStack] = useState([]);
  const [codeStack, setCodeStack] = useState([]);

  const [generatedProblem, setGeneratedProblem] = useState("");
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [generationError, setGenerationError] = useState(false);

  // ---------- Streaming Hook from your gemini chat ----------
  //   const {
  //     messages: generateProblemMessages,
  //     submitPrompt: submitGenerateProblemPrompt,
  //     loading: generateProblemLoading, //  (boolean indicating streaming is in progress)
  //     resetMessages: resetProblemMessages,
  //   } = useSimpleGeminiChat();
  // ---------- Streaming Hook from your gemini chat ----------

  const handleSelect = (childKey) => {
    const newNode = currentNode.children[childKey];
    setCurrentNode(newNode);
    setSelectedPath((prev) => [...prev, childKey]);
    setContentStack((prev) => [
      ...prev,
      newNode?.children?.content?.content || "",
    ]);
    setCodeStack((prev) => [...prev, newNode?.children?.code?.content || ""]);
  };

  const handleUndo = () => {
    if (selectedPath.length > 0) {
      const newPath = [...selectedPath];
      newPath.pop();
      setSelectedPath(newPath);

      const newContentStack = [...contentStack];
      newContentStack.pop();
      setContentStack(newContentStack);

      const newCodeStack = [...codeStack];
      newCodeStack.pop();
      setCodeStack(newCodeStack);

      let node = mapImage;
      newPath.forEach((key) => {
        node = node.children[key];
      });
      setCurrentNode(node);
    }
  };

  const handleReset = () => {
    setCurrentNode(mapImage);
    setSelectedPath([]);
    setContentStack([]);
    setCodeStack([]);
  };

  const handleGenerateProblem = async () => {
    try {
      setGenerationError(false);
      setIsGeneratingProblem(true);

      // Clear any old text
      setGeneratedProblem("");
      // Clear old messages from the chat hook

      let problemSet = getRandomTree();

      // To stream generated text output, call generateContentStream with the text input

      const prompt = `You are generating an easy to medium level technical coding interview question so that users can prepare for technical interviews using a decision framework. Do not provide the answer. In minimalist markdown (i.e dont make unnecesasry headers called "Title"), where all headers are a maximum size of h4. Provide a title, a description, input and output examples, constraints and a hint using the following decision framework and select a genuinely random topic based on the trees here.: ${JSON.stringify(
        problemSet
      )}.

    However, despite being minimalist, make sure to provide clear, effective and helpful communication the example and constraints. Your response should not be a JSON output.
    Lastly, the user is speaking in ${
      userLanguage.includes("en") ? "english" : "spanish"
    }
    `;
      // Fire off a prompt to the AI. It will stream back in `messages`.

      const result = await simplemodel.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        setGeneratedProblem((prevText) => prevText + chunkText);
      }
    } catch (error) {
      setGenerationError(true);
      console.log({ error });
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  //   useEffect(() => {
  //     if (!generateProblemMessages || generateProblemMessages.length === 0)
  //       return;

  //     // Grab the last streamed message
  //     const lastMessage =
  //       generateProblemMessages[generateProblemMessages.length - 1];

  //     console.log("last message", lastMessage);
  //     // Example: partial streaming. Append new chunk to existing text.
  //     // If you only want final content, check last chunk's `final` property.
  //     setGeneratedProblem((prevText) => prevText + lastMessage.content);
  //   }, [generateProblemMessages]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="2xl" p={0} width="100%">
        <ModalHeader fontSize="3xl" fontWeight="bold" marginTop={0} padding={3}>
          <HStack>
            <div>
              {translation[userLanguage]["modal.title.algorithmHelper"]}
            </div>
          </HStack>
        </ModalHeader>
        <ModalBody p={8} style={{ width: "100%" }}>
          <Box mb={4}>
            <OrderedList>
              <ListItem>Generate a problem</ListItem>
              <ListItem>Select a path to solve the problem</ListItem>
              <ListItem>
                Request feedback to see if you the path you selected was correct
              </ListItem>
            </OrderedList>
          </Box>
          <div>
            <Button
              boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
              variant="solid"
              onMouseDown={handleGenerateProblem}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleGenerateProblem();
                }
              }}
              isDisabled={isGeneratingProblem}
            >
              {
                translation[userLanguage][
                  "algorithmHelper.button.generateProblem"
                ]
              }
            </Button>

            <br />
            <br />

            {/* might remove */}
            {isGeneratingProblem && <p>Creating problem set...</p>}
            {generatedProblem && (
              <>
                <Markdown
                  //   components={ChakraUIRenderer(newTheme)}
                  //   children={generatedProblem}
                  components={ChakraUIRenderer(newTheme)}
                  children={generatedProblem}
                />

                <TreeNode node={currentNode} onSelect={handleSelect} />
                {selectedPath.length > 0 && (
                  <>
                    <Flex
                      mt={8}
                      align="center"
                      justify="center"
                      direction={isMobile ? "column" : "row"}
                      //   bgGradient="linear(to-br, pink.300, purple.500)"
                      p={6}
                      borderRadius="xl"
                      maxW="90%"
                      mx="auto"
                    >
                      {selectedPath.map((node, index) => (
                        <Flex
                          key={index}
                          align="center"
                          justify="center"
                          direction={isMobile ? "column" : "row"}
                          position="relative"
                          zIndex={1}
                          mb={isMobile ? 6 : 0}
                        >
                          {/* Node */}
                          <Box
                            bg={
                              index === selectedPath.length - 1
                                ? "purple.600"
                                : "pink.500"
                            }
                            color="white"
                            w="150px"
                            h="100px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="20px"
                            fontWeight="bold"
                            fontSize="md"
                            boxShadow="sm"
                            textAlign="center"
                            transition="all 0.3s ease-in-out"
                          >
                            <Text px={2} noOfLines={2}>
                              {node}
                            </Text>
                          </Box>

                          {/* Arrow */}
                          {index < selectedPath.length - 1 && (
                            <Flex
                              align="center"
                              justify="center"
                              mt={isMobile ? 2 : 0}
                              ml={isMobile ? 0 : 2}
                              position="relative"
                              zIndex={0}
                            >
                              {isMobile ? (
                                <ArrowDownIcon
                                  boxSize={6}
                                  color="pink.400"
                                  _hover={{ color: "purple.400" }}
                                />
                              ) : (
                                <ArrowForwardIcon
                                  boxSize={6}
                                  color="pink.400"
                                  _hover={{ color: "purple.400" }}
                                />
                              )}
                            </Flex>
                          )}
                        </Flex>
                      ))}
                    </Flex>

                    <SelectedPath
                      path={selectedPath}
                      contentStack={contentStack}
                      codeStack={codeStack}
                      onUndo={handleUndo}
                      onReset={handleReset}
                      problem={generatedProblem}
                    />
                  </>
                )}
              </>
            )}
            {generationError && <p>Error generating problem. Try again.</p>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onMouseDown={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            data-sound-close="true"
          >
            {translation[userLanguage]["button.close"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
