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
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import {
  useSimpleGeminiChat,
  useThinkingGeminiChat,
} from "../../hooks/useGeminiChat";
import { translation } from "../../utility/translation";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor";
import { CloudCanvas, SunsetCanvas } from "../../elements/SunsetCanvas";
import { soundManager } from "../../utility/soundManager";

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
  const { submitPrompt, messages, resetMessages } = useThinkingGeminiChat();

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

        const codeSnap = await getDoc(
          doc(database, "users", userId, "buildHistory", step.group)
        );
        if (codeSnap.exists()) {
          const data = codeSnap.data();
          if (data.code) setCode(data.code);
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
      saveBuild(last.content, "build");
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return [];
      const ref = collection(database, `users/${userId}/buildHistory`);
      const docs = await getDocs(ref);
      return docs.docs
        .filter(
          (d) => !isNaN(parseInt(d.id)) && parseInt(d.id) < parseInt(step.group)
        )
        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
        .map((d) => d.data().code)
        .filter(Boolean);
    } catch (e) {
      console.error("Error fetching history", e);
      return [];
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    resetMessages();
    const idx = steps[userLanguage].indexOf(step);
    const completed = steps[userLanguage].slice(1, idx).map((s) => s.title);
    const history = await fetchHistory();

    console.log("completed..", completed);
    let prompt =
      `Context for the prompt:
      The individual is using an education app and learning about computer science and how to code, starting with elementary knowledge and ending with the ability to create apps. Based on the user's completed steps: ${JSON.stringify(
        completed
      )}, write an app that the user can copy and experiment with HTML or React (choose whichever is appropriate based on the user's progress).` +
      (history.length
        ? ` Previous code snippets in order: ${JSON.stringify(history)}.`
        : "") +
      `\n\n` +
      `Strict requirements: 
      
      1. This is the MOST important to understand: The code should be progressively and appropriately built based on the user's progress to incentivize further interest, excitement and progress, so you should implement the app in a way that highlights the user's progress. For example, if the user's most recent progress/group has learned how to use firebase, then implement firebase features. If the user has recently learned react, implement react UIs, etc. If it's just javascript, then use HMTL. The goal is to build out a simple but real demo that users can operate and preview in an editor and to generate an awesome user experience to highlight one's growth.\n\n` +
      `2. When generating your response, you MUST format your software in this manner:\n  Globally: Never use imports. Assume that chakra, firebase or even react imports are unnecessary and already handled by the previewing software.\n\n  
      - A. If you are upgrading to React, do NOT include any import statements or define dependencies (for example, if you use useEffect or useState, you use React.useEffect and React.useState),and conclude the component or components with render(<TheComponentYouCreated />). This means React code is only ever about writing component functions, nothing else.\n  
      - B. If you are generating plain html, use !DOCTYPE\n  
      - C. Do NOT return purely plain JavaScript snippets. Use React components or HTML only based on the criteria.\n  
      - D. If you are writing firebase (with or without react), use v9, and you MUST use a unique document in the 'experiments' collection. Never use any other collection or your firebase software will fail. Never use imports or we will fail. Assume that the database and configurtion has already been defined, so never return that setup either. Refer to the database element as "database" and not "db" or anything else. Do not use auth. Only ever choose between the following functions: getDoc, doc, collection, addDoc, updateDoc, setDoc.\n  
      - E. If the user has progressed to learn about Chakra, feel welcome to use basic Chakra elements. Never use the ChakraProvider element.\n\n` +
      `3. Strictly return only code written by a formatted backticked code block. Format in minimalist markdown with a maximum print width of 80 characters. Finally do not add any language mentioning that you understand the request - it should the code only, without any exceptions. I repeat, do not return anything other than code or appropriate comments with the code. \n\n` +
      `4. The user is speaking in ${userLanguage.includes("en") ? "English" : "Spanish"}. So theme the code that you're writing based on the language.` +
      `5. The user is also interested in building the following idea: ${idea}. Make the code about that theme in good faith.` +
      `6. The code you return MUST be responsive for both mobile and desktop views. Do not allow renders that awkwardly break out of containers, err on the side of being as mobile friendly as possible!`;

    console.log("prompt", prompt);
    submitPrompt(prompt).then(() => setIsLoading(false));
  };

  const handleSaveIdeaAndGenerate = async () => {
    soundManager.init().catch(() => {});
    soundManager.play("submitAction");
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

  const saveBuild = async (content, stage = "build") => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return;
      const userDocRef = doc(database, "users", userId);
      const snap = await getDoc(userDocRef);
      const data = snap.exists() ? snap.data() : {};
      const buildCode = data.buildCode || {};
      await updateDoc(userDocRef, {
        userBuild: idea,
        buildCode: { ...buildCode, [step.group]: content },
      });
      await setDoc(
        doc(database, "users", userId, "buildHistory", step.group),
        {
          code: content,
          updatedAt: Date.now(),
          stage,
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving build", err);
    }
  };

  const handleSave = async () => {
    window.scrollTo(0, 0);
    await saveBuild(code, "conversation");
    onContinue();
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
          colorScheme="pink"
          background="pink.300"
          data-sound-ignore-select="true"
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
        <>
          <CloudCanvas />
          <Text>{translation[userLanguage]["loading.suggestion"]}</Text>
        </>
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
