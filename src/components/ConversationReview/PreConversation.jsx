import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import { useConversationReviewGeminiChat } from "../../hooks/useGeminiChat";
import { translation } from "../../utility/translation";
const LiveReactEditorModal = lazy(() => import("../LiveCodeEditor/LiveCodeEditor"));
import { CloudCanvas } from "../../elements/SunsetCanvas";
import { soundManager } from "../../utility/soundManager";
import {
  GENERATED_REACT_RUNTIME_REQUIREMENTS,
  normalizeGeneratedReactCode,
} from "../../utility/generatedReactCode";

const getBuildStorageKey = (userId, groupId) =>
  `buildYourApp:${userId || "local"}:${groupId}`;

const readBuildFallback = (userId, groupId) => {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      window.localStorage.getItem(getBuildStorageKey(userId, groupId)) ||
      window.localStorage.getItem(getBuildStorageKey("local", groupId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeBuildFallback = (userId, groupId, payload) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getBuildStorageKey(userId, groupId),
      JSON.stringify(payload),
    );
  } catch {}
};

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
    <Suspense fallback={<CloudCanvas isLoader={true} regulateWidth={false} />}>
      <LiveReactEditorModal
        code={String(children).replace(/\n$/, "")}
        hideRunButton={hideRunButton}
        autoRun={autoRun}
      />
    </Suspense>
  ) : (
    <Box
      as="code"
      backgroundColor="appCodeInlineBg"
      color="appCodeColor"
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
  p: (props) => <Text fontSize="sm" mb={2} lineHeight="1.6" {...props} />,
  code: CodeBlock,
};

const PreConversation = ({ steps, step, userLanguage, onSubmit, onBuildReady }) => {
  const [idea, setIdea] = useState("");
  const [savedIdea, setSavedIdea] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitPrompt, messages, resetMessages } =
    useConversationReviewGeminiChat();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("local_npub");
        let loadedIdea = "";
        let loadedCode = "";

        if (userId) {
          const userDocRef = doc(database, "users", userId);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            loadedIdea = data.userBuild || "";
            const buildCode = data.buildCode || {};
            if (buildCode[step?.group]) loadedCode = buildCode[step?.group];
          }

          const codeSnap = await getDoc(
            doc(database, "users", userId, "buildHistory", step?.group)
          );
          if (codeSnap.exists()) {
            const data = codeSnap.data();
            if (data.code) loadedCode = data.code;
          }
        }

        const fallback = readBuildFallback(userId, step?.group);
        if (!loadedIdea && fallback?.idea) loadedIdea = fallback.idea;
        if (!loadedCode && fallback?.code) loadedCode = fallback.code;
        loadedCode = normalizeGeneratedReactCode(loadedCode);

        setIdea(loadedIdea);
        setSavedIdea(loadedIdea);
        if (loadedCode) {
          setCode(loadedCode);
          onBuildReady?.(true);
        }
      } catch (err) {
        console.error("Error fetching build data", err);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.group]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      const normalizedCode = normalizeGeneratedReactCode(last.content);
      setCode(normalizedCode);
      saveBuild(normalizedCode, "build");
      if (normalizedCode.trim()) {
        onBuildReady?.(true);
      }
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
          (d) => !isNaN(parseInt(d.id)) && parseInt(d.id) < parseInt(step?.group)
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
      ${GENERATED_REACT_RUNTIME_REQUIREMENTS}\n
      - B. If you are generating plain html, use !DOCTYPE\n  
      - C. Do NOT return purely plain JavaScript snippets. Use React components or HTML only based on the criteria.\n  
      - D. If you are writing firebase (with or without react), use v9, and you MUST use a unique document in the 'experiments' collection. Never use any other collection or your firebase software will fail. Never use imports or we will fail. Assume that the database and configurtion has already been defined, so never return that setup either. Refer to the database element as "database" and not "db" or anything else. Do not use auth. Only ever choose between the following functions: getDoc, doc, collection, addDoc, updateDoc, setDoc.\n  
      - E. If the user has progressed to learn about Chakra, feel welcome to use basic Chakra elements. Never use the ChakraProvider element.\n\n` +
      `3. Strictly return only code written by a formatted backticked code block. Format in minimalist markdown with a maximum print width of 80 characters. Finally do not add any language mentioning that you understand the request - it should the code only, without any exceptions. I repeat, do not return anything other than code or appropriate comments with the code. \n\n` +
      `4. The user is speaking in ${userLanguage?.includes("en") ? "English" : "Spanish"}. So theme the code that you're writing based on the language.` +
      `5. The user is also interested in building the following idea: ${idea}. Make the code about that theme in good faith.` +
      `6. The code you return MUST be responsive for both mobile and desktop views. Do not allow renders that awkwardly break out of containers, err on the side of being as mobile friendly as possible!`;

    submitPrompt(prompt).then(() => setIsLoading(false));
  };

  const handleSaveIdeaAndGenerate = async () => {
    soundManager.resume();
    soundManager.play("submitAction");
    try {
      const userId = localStorage.getItem("local_npub");
      writeBuildFallback(userId, step?.group, {
        idea,
        code,
        stage: "idea",
        updatedAt: Date.now(),
      });
      if (userId) {
        await setDoc(
          doc(database, "users", userId),
          { userBuild: idea },
          { merge: true },
        );
      }
      setSavedIdea(idea);
    } catch (err) {
      console.error("Error saving build idea", err);
    }
    handleGenerate();
  };

  const saveBuild = async (content, stage = "build") => {
    try {
      const userId = localStorage.getItem("local_npub");
      writeBuildFallback(userId, step?.group, {
        idea,
        code: content,
        stage,
        updatedAt: Date.now(),
      });
      if (!userId) return;
      const userDocRef = doc(database, "users", userId);
      const snap = await getDoc(userDocRef);
      const data = snap.exists() ? snap.data() : {};
      const buildCode = data.buildCode || {};
      await setDoc(
        userDocRef,
        {
          userBuild: idea,
          buildCode: { ...buildCode, [step?.group]: content },
        },
        { merge: true },
      );
      await setDoc(
        doc(database, "users", userId, "buildHistory", step?.group),
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

  const handleCompleteChapter = async () => {
    window.scrollTo(0, 0);
    soundManager.resume();
    soundManager.play("submit");
    await saveBuild(code, "build");
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <VStack
      spacing={4}
      width="100%"
      maxWidth="600px"
      mt="20px"
    >
      <Text fontSize="sm" fontWeight={"bold"} mb="12px">
        {userLanguage?.includes("es")
          ? "¡Ingresa una idea de aplicación y constrúyela a medida que avanzas!"
          : "Enter an app idea and build it as you make progress!"}
      </Text>

      <Input
        placeholder={translation[userLanguage]["buildYourApp.input.label"]}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        backgroundColor="appSurface"
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        marginTop="-20px"
        width="75%"
      />
      <VStack spacing={3} mt={1}>
        <Button
          onClick={handleSaveIdeaAndGenerate}
          isDisabled={isLoading || idea.length < 1}
          colorScheme="pink"
          background="pink.300"
          data-sound-ignore-select="true"
          isLoading={isLoading}
        >
          {savedIdea
            ? translation[userLanguage]["buildYourApp.button.label.2"]
            : translation[userLanguage]["buildYourApp.button.label.1"]}
        </Button>
        <Button
          onClick={handleCompleteChapter}
          isDisabled={!code?.trim() || isLoading}
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
          data-sound-ignore-select="true"
        >
          {translation[userLanguage]["app.button.complete"]}
        </Button>
      </VStack>

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
        </Box>
      )}
    </VStack>
  );
};

export default PreConversation;
