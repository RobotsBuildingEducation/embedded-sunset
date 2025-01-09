import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import {
  ArrayTree,
  EdgeListTree,
  LinkedListTree,
  MatrixTree,
  StringTree,
  TreeTree,
} from "./AlgorithmHelper.data";
import {
  StyledTreeNode,
  TreeNodeButton,
  colorPalette,
} from "./AlgorithmHelper.styles";

import { model, simplemodel } from "../../database/firebaseResources";
import { Box, Button, Code, Heading } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

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
/**
 * Selects a random tree function from a predefined list, executes it, and prunes the 'code' attribute from the result.
 *
 * @returns {Object} - The pruned tree object returned by the randomly selected function.
 */
export const getRandomTree = () => {
  /**
   * Prunes the 'code' attribute from a tree object recursively.
   *
   * @param {Object} tree - The tree object to be pruned.
   * @returns {Object} - The pruned tree object without the 'code' attribute.
   */
  const pruneCodeAttribute = (tree) => {
    // Base case: if the tree is null or not an object, return it
    if (tree === null || typeof tree !== "object") return tree;

    // Create a new object without the 'code' attribute
    const prunedTree = {};
    for (const key in tree) {
      if (key !== "code") {
        prunedTree[key] = pruneCodeAttribute(tree[key]);
      }
    }

    return prunedTree;
  };
  // Define an array of the available functions
  const treeFunctions = [
    LinkedListTree,
    StringTree,
    ArrayTree,
    TreeTree,
    EdgeListTree,
    MatrixTree,
  ];

  // Generate a random index based on the length of the array
  const randomIndex = Math.floor(Math.random() * treeFunctions.length);

  // Select and execute the function at the random index
  const selectedFunction = treeFunctions[randomIndex];

  // Get the result of the selected function
  const tree = selectedFunction();

  // Prune the 'code' attribute from the tree
  const prunedTree = pruneCodeAttribute(tree);

  // Return the pruned tree
  return prunedTree;
};

// Example usage:

/**
 * Configuration for POST requests to the instructions endpoint.
 * @type {Object}
 * @property {string} url - The URL of the endpoint.
 * @property {string} method - The HTTP method.
 * @property {Object} headers - The headers for the request.
 */
export const postInstructions = {
  url: "https://us-central1-learn-robotsbuildingeducation.cloudfunctions.net/app/prompt",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Generates a technical coding interview question based on a decision framework.
 * @returns {Promise<string>} The generated problem in markdown format.
 * @throws Will throw an error if there is an issue with the request.
 */
export const generateProblem = async () => {
  let problemSet = getRandomTree();

  // console.log("probem set", problemSet);

  let prompt = `You are generating an easy to medium level technical coding interview question so that users can prepare for technical interviews using a decision framework. Do not provide the answer. In minimalist markdown (i.e dont make unnecesasry headers called "Title"), where all headers are kept the same small size with ####, provide a title, a description, input and output examples, constraints and a hint using the following decision framework and select a genuinely random topic based on the trees here.: ${JSON.stringify(
    problemSet
  )}

  However, despite being minimalist, make sure to provide clear, effective and helpful communication the example and constraints.
  `;

  // const { url, method, headers } = postInstructions;

  // try {
  //   const response = await fetch(url, {
  //     method: method,
  //     headers: headers,
  //     body: JSON.stringify({
  //       prompt,
  //     }),
  //   });

  //   if (!response.ok) {
  //     throw new Error("Error generating problem");
  //   }

  //   const data = await response.json();
  //   const result = data?.bot?.content;
  //   console.log("res", result);
  //   return result;
  // } catch (error) {
  //   console.error("Error:", error);
  //   throw error;
  // }

  // const prompt = "Write a story about a magic backpack.";

  // To generate text output, call generateContent with the text input
  const result = await model.generateContent(prompt);

  const response = result.response;
  const text = response.text();
  console.log(text);
  return text;
};

/**
 * Requests feedback for a student's coding decisions and code.
 * @param {Object} problem - The coding problem.
 * @param {Array} path - The decision path taken.
 * @param {Array} contentStack - The content stack.
 * @param {Array} codeStack - The code stack.
 * @returns {Promise<string>} The feedback in markdown format.
 * @throws Will throw an error if there is an issue with the request.
 */
export const requestFeedback = async (
  problem,
  path,
  contentStack,
  codeStack,
  setGeneratedFeedback,
  feedbackRequest
) => {
  //3. What the user submitted for feedback (IMPORTANT INSTRUCTION: analyze this closely.): ${feedbackRequest}

  let prompt = `You are providing constructive feedback for a student's coding decisions and code. The individual has followed a decision path and written some code. Provide detailed feedback while considering the decision path and the code provided. Here are 5 things to consider to help you understand the nature of the data you're workign with:

1. Problem JSON: ${JSON.stringify(problem)}

2. Decision Path JSON: ${JSON.stringify(path)}


3. Content JSON (IMPORTANT INSTRUCTION: This is not the code the user has written, this is UI content they've created to inform you of the general strategy they're working with to make choices. Do not analyze the code found here under any circumstances): ${JSON.stringify(
    contentStack
  )}

4. Code and solution JSON (IMPORTANT INSTRUCTION: This is not the code the user has written, this is UI content they've created to inform you of the general strategy they're working with to make choices. Do not analyze the code found here under any circumstances): ${JSON.stringify(
    codeStack
  )}


Provide your feedback in minimalist markdown, where all headers are kept the same small size with ####,

Additionally, in your feedback don't forget to include what the user has done well too. Fit that in naturally. However, do not confuse that with tolerating or accepting the wrong answer or direction. If the person is wrong, redirect them in the right way and make it clear that the process was incorrect.
`;

  // const { url, method, headers } = postInstructions;

  // try {
  //   const response = await fetch(url, {
  //     method: method,
  //     headers: headers,
  //     body: JSON.stringify({
  //       prompt,
  //     }),
  //   });

  //   if (!response.ok) {
  //     throw new Error("Error requesting feedback");
  //   }

  //   const data = await response.json();
  //   const result = data?.bot?.content;
  //   console.log("Feedback response:", result);
  //   return result;
  // } catch (error) {
  //   console.error("Error:", error);
  //   throw error;
  // }

  const result = await simplemodel.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    setGeneratedFeedback((prevText) => prevText + chunkText);
  }
};

/**
 * Component to render a tree node.
 * @param {Object} props - The props for the component.
 * @param {Object} props.node - The tree node.
 * @param {Function} props.onNodeSelect - The function to call when a node is selected.
 * @param {boolean} props.isSelected - Whether the node is selected.
 * @returns {JSX.Element} The rendered tree node component.
 */
export const NodeComponent = ({ node, onNodeSelect, isSelected }) => {
  const isLeafNode = !node.children || Object.keys(node.children).length === 0;

  return (
    <StyledTreeNode>
      <TreeNodeButton onClick={() => onNodeSelect(node, isLeafNode)}>
        {node.name}
      </TreeNodeButton>
      {isSelected && node.children && (
        <div style={{ marginLeft: "20px" }}>
          {Object.keys(node.children).map((childKey) => (
            <NodeComponent
              key={childKey}
              node={{ name: childKey, ...node.children[childKey] }}
              onNodeSelect={onNodeSelect}
              isSelected={false}
            />
          ))}
        </div>
      )}
    </StyledTreeNode>
  );
};

/**
 * Component to render a stack tile.
 * @param {Object} props - The props for the component.
 * @param {string} props.name - The name of the stack tile.
 * @returns {JSX.Element} The rendered stack tile component.
 */
export const StackTile = ({ name }) => {
  return (
    <div
      style={{
        color: "white",
        padding: "10px",
        margin: "5px",
        borderRadius: "12px",
      }}
    >
      {name}
    </div>
  );
};

/**
 * Creates a decision map for coding problems.
 * @returns {Object} The decision map.
 */
export const createDecisionMap = () => {
  function createNode(content = "", children = {}) {
    return { content, children };
  }

  function createTree(structure) {
    if (typeof structure === "string") {
      return createNode(structure);
    }
    const node = createNode();
    for (const key in structure) {
      node.children[key] = createTree(structure[key]);
    }
    return node;
  }
  let mapStructure = {
    "Linked Lists": LinkedListTree(),
    Strings: StringTree(),
    Arrays: ArrayTree(),
    Trees: TreeTree(),
    "Edge List": EdgeListTree(),
    Matrix: MatrixTree(),
  };

  let mapImage = createTree(mapStructure);

  return mapImage;
};

/**
 * TreeNode component renders buttons for each child node.
 * @param {Object} props - Component props.
 * @param {Object} props.node - The current node object.
 * @param {Function} props.onSelect - Function to handle selection of a node.
 * @returns {JSX.Element} The rendered component.
 */
export const TreeNode = ({ node, onSelect }) => {
  return (
    <div>
      {Object.keys(node.children).map((childKey) => {
        if (
          childKey === "content" ||
          childKey === "code" ||
          childKey === "children"
        )
          return null;
        return (
          <Button
            key={childKey}
            onClick={() => onSelect(childKey)}
            mr={2}
            mt={2}
            // style={{
            //   margin: 4,
            //   backgroundColor: colorPalette.chill,
            //   color: "white",
            // }}
          >
            {childKey}
          </Button>
        );
      })}
    </div>
  );
};

/**
 * SelectedPath component renders the selected path, content, and code.
 * @param {Object} props - Component props.
 * @param {Array} props.path - Array of selected path nodes.
 * @param {Array} props.contentStack - Array of content for each node in the path.
 * @param {Array} props.codeStack - Array of code for each node in the path.
 * @param {Function} props.onUndo - Function to handle undo action.
 * @param {Function} props.onReset - Function to handle reset action.
 * @returns {JSX.Element} The rendered component.
 */
export const SelectedPath = ({
  path,
  contentStack,
  codeStack,
  onUndo,
  onReset,
  problem,
}) => {
  const [collapsed, setCollapsed] = useState({});
  const [generatedFeedback, setGeneratedFeedback] = useState("");

  useEffect(() => {
    // Initialize only new items in the path as collapsed
    const newCollapsedState = { ...collapsed };
    path.forEach((_, index) => {
      if (newCollapsedState[index] === undefined) {
        newCollapsedState[index] = true; // Start new items as collapsed (closed)
      }
    });
    setCollapsed(newCollapsedState);
  }, [path]);

  const toggleCollapse = (index) => {
    setCollapsed((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div>
      <ul>
        {path
          .map((node, index) => (
            <li key={index} style={{ marginBottom: "20px", listStyle: "none" }}>
              {contentStack[index] && (
                <div
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    borderRadius: 10,
                    padding: 20,
                    marginTop: 10,
                    marginLeft: 20,
                  }}
                >
                  <div>
                    <h4>{node}</h4>
                  </div>
                  <Markdown
                    components={ChakraUIRenderer(newTheme)}
                    children={contentStack[index]}
                  />
                  {codeStack[index] && (
                    <div>
                      <Button
                        variant={"outline"}
                        onClick={() => toggleCollapse(index)}
                        style={{ marginTop: 10 }}
                      >
                        {collapsed[index] ? "Show Code" : "Hide Code"}
                      </Button>

                      {!collapsed[index] && (
                        <Box
                          as="pre"
                          fontFamily={"Fira code, Fira Mono, monospace"}
                          fontSize="xs"
                          p={3}
                          borderRadius={8}
                        >
                          <Code
                            p={6}
                            display="block"
                            wordBreak="break-word"
                            fontSize="sm"
                            overflowX="scroll"
                          >
                            {codeStack[index]}
                          </Code>
                        </Box>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))
          .reverse()}
      </ul>
      <br />
      <br />
      <Button variant="ghost" onClick={onUndo}>
        Undo
      </Button>
      &nbsp;&nbsp;
      <Button variant="ghost" onClick={onReset}>
        Reset
      </Button>
      <br />
      <br />
      <Button
        onClick={() =>
          requestFeedback(
            problem,
            path,
            contentStack,
            codeStack,
            setGeneratedFeedback
            // feedbackRequest
          )
        }
      >
        Request Feedback
      </Button>
      <br />
      <br />
      <Markdown
        components={ChakraUIRenderer(newTheme)}
        children={generatedFeedback}
      />
    </div>
  );
};

/**
 * CopyableMarkdown component renders Markdown content with a copy button.
 * @param {Object} props - Component props.
 * @param {String} props.content - The markdown content to be displayed and copied.
 * @returns {JSX.Element} The rendered component.
 */
export const CopyableMarkdown = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const markdownRef = useRef(null);

  const handleCopy = () => {
    if (markdownRef.current) {
      navigator.clipboard.writeText(content).then(
        () => {
          console.log("Content copied to clipboard!");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Revert back to "Copy" after 2 seconds
        },
        (err) => {
          console.error("Failed to copy: ", err);
        }
      );
    }
  };

  return (
    <div>
      <div
        ref={markdownRef}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          //   variant="secondary"
          onClick={handleCopy}
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        <br />
        <br />
        <br />
        <Markdown components={ChakraUIRenderer(newTheme)} children={content} />
      </div>
    </div>
  );
};
