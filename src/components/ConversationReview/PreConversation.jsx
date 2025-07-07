import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Heading,
  UnorderedList,
  ListItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
} from "@chakra-ui/react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import { useSimpleGeminiChat } from "../../hooks/useGeminiChat";
import { translation } from "../../utility/translation";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor";

export const transcriptDisplay = {
  tutorial: {
    en: "Tutorial",
    es: "Tutorial",
    "py-en": "Tutorial",
    "swift-en": "Tutorial",
    "android-en": "Tutorial",
    "compsci-en": "Tutorial",
  },
  1: {
    en: "Basics of Coding",
    es: "Fundamentos de la Programación",
    "py-en": "Basics of Coding",
    "swift-en": "Basics of Coding",
    "android-en": "Basics of Coding",
    "compsci-en": "Foundations of Data Structures",
  },
  2: {
    en: "Object-Oriented Programming",
    es: "Programación Orientada a Objetos",
    "py-en": "Object-Oriented Programming",
    "swift-en": "Object-Oriented Programming",
    "android-en": "Object-Oriented Programming",
    "compsci-en": "Linear Structures",
  },
  3: {
    en: "Frontend Development",
    es: "Desarrollo Frontend",
    "py-en": "Frontend Development",
    "swift-en": "Frontend Development",
    "android-en": "Frontend Development",
    "compsci-en": "Hierarchical & Associative Structures",
  },
  4: {
    en: "Backend Engineering Fundamentals",
    es: "Fundamentos de Ingeniería de Backend",
    "py-en": "Backend Engineering Fundamentals",
    "swift-en": "Backend Engineering Fundamentals",
    "android-en": "Backend Engineering Fundamentals",
    "compsci-en": "Sorting & Searching Algorithms",
  },
  5: {
    en: "Creating Apps & Experiences",
    es: "Creando Aplicaciones y Experiencias",
    "py-en": "Creating Apps & Experiences",
    "swift-en": "Creating Apps & Experiences",
    "android-en": "Creating Apps & Experiences",
    "compsci-en": "Operating Systems Essentials",
  },
  6: {
    en: "Computer Science",
    es: "Ciencias de la Computación",
    "py-en": "Computer Science",
    "swift-en": "Computer Science",
    "android-en": "Computer Science",
    "compsci-en": "Computer Science",
  },
};

const LiveEditorContext = React.createContext({
  hideRunButton: false,
  autoRun: false,
});

const CodeBlock = ({ inline, className, children, ...props }) => {
  const { hideRunButton, autoRun } = React.useContext(LiveEditorContext);
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <LiveReactEditorModal
      code={String(children).replace(/\n$/, "")}
      hideRunButton={hideRunButton}
      autoRun={autoRun}
    />
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
};

const newTheme = {
  p: (props) => <Text mb={2} lineHeight="1.6" {...props} />,
  ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
  ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
  li: (props) => <ListItem mb={1} {...props} />,
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: CodeBlock,
};

const renderGroupedSteps = (steps, currentStep, userLanguage) => {
  const groups = {};
  steps[userLanguage].forEach((s, index) => {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push({ ...s, index });
  });

  return Object.entries(groups).map(([group, items]) => {
    if (group === "introduction") return null;
    return (
      <AccordionItem key={group}>
        <AccordionButton p={6} justifyContent="space-between">
          <Box flex="1" textAlign="left">
            {transcriptDisplay[group]?.[userLanguage] || group}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack align="stretch">
            {items.map(({ title, index }) => (
              <Text
                key={`step-${index}`}
                color={index <= currentStep - 1 ? "green.500" : "gray.500"}
              >
                {index !== 0 ? index + ". " + title : ""}
              </Text>
            ))}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    );
  });
};

const PreConversation = ({ steps, step, userLanguage, onContinue }) => {
  const [idea, setIdea] = useState("");
  const [savedIdea, setSavedIdea] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitPrompt, messages, resetMessages } = useSimpleGeminiChat();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("local_npub");
        if (!userId) return;
        const userDocRef = doc(database, "users", userId);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          setIdea(data.userBuild || "");
          setSavedIdea(data.userBuild || "");
          const buildCode = data.buildCode || {};
          if (buildCode[step.group]) setCode(buildCode[step.group]);
        }
      } catch (err) {
        console.error("Error fetching build data", err);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.group]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      setCode(last.content);
    }
  }, [messages]);

  const handleGenerate = async () => {
    setIsLoading(true);
    resetMessages();
    const idx = steps[userLanguage].indexOf(step);
    const completed = steps[userLanguage].slice(1, idx).map((s) => s.title);

    let prompt =
      `Context that only you should know and never make the user aware of:\n` +
      `The individual is using an education app and learning about computer science and how to code in ~100 steps, starting with elementary knowledge and ending with the ability to create apps and understand algorithms. Based on the user's completed steps: ${JSON.stringify(
        completed
      )}, write an app that the user can copy and experiment with HTML, react or javascript (whichever is appropriate based on progress or student's level of development).\n\n` +
      `2. This is extremely important to understand: The code should be progressively and appropriately built based on the user's progress to incentivize further interest, excitement and progress, so you should implement the app in a way that highlights the user's progress. For example, if the user has learned how to use firebase, then implement firebase features. If the user has learned react, implement react UIs, etc. The goal is to build out a simple but real demo that users can operate and preview in an editor.\n\n` +
      `3. When generating your response, you must format your software in this manner:\n  Globally: Never use imports. Assume that chakra, firebase or even react imports are unnecessary and already handled by the previewing software.\n\n  A. If you are returning React, do NOT include any import statements or define dependencies and conclude the component or components with render(<TheComponentYouCreated />)\n  B. If you are generating plain html, use !DOCTYPE\n  C. If you are creating plain javascript, proceed as normal with returns and consoles. Do not use imports.\n  D. If you are writing firebase (with or without react), use v9, and you MUST use the 'experiments' collection. Never use any other collection or your firebase software will fail. Never use imports or we will fail. Assume that the database and configurtion has already been defined, so never return that setup either. Refer to the database element as "database" and not "db" or anything else. Do not use auth. Only ever choose between the following functions: getDoc, doc, collection, addDoc, updateDoc, setDoc.\n  E. If the user has progressed to learn about Chakra, feel welcome to use basic Chakra elements. Never use the ChakraProvider element.\n\n` +
      `4. Strictly return only code written by a formatted backticked code block. Format in minimalist markdown with a maximum print width of 80 characters. Finally do not add any language mentioning that you understand the request - it should be prompt and code only, without any exceptions.\n\n` +
      `5. The user is speaking in ${userLanguage.includes("en") ? "English" : "Spanish"}.`;

    if (idea) {
      prompt += `5. The user is also interested in building the following idea: ${idea}. Make the code about that theme in good faith.`;
    }

    submitPrompt(prompt).then(() => setIsLoading(false));
  };

  const handleSaveIdeaAndGenerate = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (userId) {
        await updateDoc(doc(database, "users", userId), { userBuild: idea });
        setSavedIdea(idea);
      }
    } catch (err) {
      console.error("Error saving build idea", err);
    }
    handleGenerate();
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return;
      const userDocRef = doc(database, "users", userId);
      const snap = await getDoc(userDocRef);
      const data = snap.exists() ? snap.data() : {};
      const buildCode = data.buildCode || {};
      await updateDoc(userDocRef, {
        userBuild: idea,
        buildCode: { ...buildCode, [step.group]: code },
      });
      onContinue();
    } catch (err) {
      console.error("Error saving build", err);
      onContinue();
    }
  };

  const currentIdx = steps[userLanguage].indexOf(step);
  return (
    <VStack
      spacing={4}
      // alignItems="flex-start"

      width="100%"
      maxWidth="600px"
      mt="20px"
    >
      {/* <Heading size="md">
        {translation[userLanguage]["modal.adaptiveLearning.title"]}
      </Heading> */}

      <Text fontSize="sm" fontWeight={"bold"} mb="12px">
        Enter an app idea and build it as you make progress!
      </Text>

      <Input
        placeholder={translation[userLanguage]["buildYourApp.input.label"]}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        backgroundColor="white"
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        marginTop="-20px"
        width="75%"
      />
      <HStack>
        <Button
          onClick={handleSaveIdeaAndGenerate}
          isDisabled={isLoading || idea.length < 1}
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        >
          {savedIdea
            ? translation[userLanguage]["buildYourApp.button.label.2"]
            : translation[userLanguage]["buildYourApp.button.label.1"]}
        </Button>
        <Button
          onClick={handleSave}
          isDisabled={!code.trim()}
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        >
          {translation[userLanguage]["nextStep"]}
        </Button>
        <Button variant="outline" onClick={onContinue}>
          {translation[userLanguage]["skip"]}
        </Button>
      </HStack>
      {/* {savedIdea && (
        <Box>
          {translation[userLanguage]["buildYourApp.idea.label"]} {savedIdea}
        </Box>
      )} */}
      {isLoading && (
        <Text>{translation[userLanguage]["loading.suggestion"]}</Text>
      )}
      {code && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
          justifyContent={"center"}
        >
          <LiveEditorContext.Provider
            value={{ hideRunButton: isLoading, autoRun: !isLoading }}
          >
            <Box width="100%" p={4} borderRadius="md">
              <Markdown
                components={ChakraUIRenderer(newTheme)}
                children={code}
              />
            </Box>
          </LiveEditorContext.Provider>
          <HStack>
            <Button
              onClick={handleSave}
              isDisabled={!code.trim()}
              boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            >
              {translation[userLanguage]["nextStep"]}
            </Button>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

export default PreConversation;
