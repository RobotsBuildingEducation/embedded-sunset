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
import VoiceOrbLoader from "../VoiceOrbNext/VoiceOrbLoader.jsx";
import { soundManager } from "../../utility/soundManager";
import {
  GENERATED_REACT_RUNTIME_REQUIREMENTS,
  normalizeGeneratedReactCode,
} from "../../utility/generatedReactCode";
import { buildAppPrompt } from "../../utility/buildAppPrompt";
import {
  useConversationReviewStore,
  calculateConversationReviewState,
} from "../../useConversationReviewStore";

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

const CHAPTER_GROUPS = ["tutorial", "1", "2", "3", "4", "5", "6"];

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
  loadingLabel: "Loading",
});

const CodeBlock = ({ inline, className, children, ...props }) => {
  const { hideRunButton, autoRun, loadingLabel } = React.useContext(LiveEditorContext);
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <Suspense fallback={<VoiceOrbLoader label={loadingLabel} />}>
      <LiveReactEditorModal
        code={String(children).replace(/\n$/, "")}
        hideRunButton={hideRunButton}
        autoRun={autoRun}
        previewHeight={{ base: "420px", md: "500px" }}
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
  const [hasGeneratedForCurrentStep, setHasGeneratedForCurrentStep] = useState(false);
  const { submitPrompt, messages, resetMessages } =
    useConversationReviewGeminiChat();

  useEffect(() => {
    setHasGeneratedForCurrentStep(false);
    resetMessages();
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
            if (buildCode[step?.group]) {
              loadedCode = buildCode[step?.group];
            } else {
              // Carry over latest previous app code so learner can preview their app
              const currentGroupIndex = CHAPTER_GROUPS.indexOf(String(step?.group));
              const searchLimit = currentGroupIndex > 0 ? currentGroupIndex : CHAPTER_GROUPS.length;
              for (let i = searchLimit - 1; i >= 0; i--) {
                const prevGroup = CHAPTER_GROUPS[i];
                if (buildCode[prevGroup]) {
                  loadedCode = buildCode[prevGroup];
                  break;
                }
              }
            }
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

        // If fallback code is not present for this group, check previous groups
        if (!loadedCode) {
          const currentGroupIndex = CHAPTER_GROUPS.indexOf(String(step?.group));
          const searchLimit = currentGroupIndex > 0 ? currentGroupIndex : CHAPTER_GROUPS.length;
          for (let i = searchLimit - 1; i >= 0; i--) {
            const prevFallback = readBuildFallback(userId, CHAPTER_GROUPS[i]);
            if (prevFallback?.code) {
              loadedCode = prevFallback.code;
              if (!loadedIdea && prevFallback?.idea) loadedIdea = prevFallback.idea;
              break;
            }
          }
        }

        if (!loadedIdea && typeof window !== "undefined") {
          try {
            loadedIdea = window.localStorage.getItem("userBuild") || "";
          } catch {}
        }

        loadedCode = normalizeGeneratedReactCode(loadedCode);

        setIdea(loadedIdea);
        setSavedIdea(loadedIdea);
        if (loadedCode) {
          setCode(loadedCode);
          onBuildReady?.(true);
        } else {
          setCode("");
          onBuildReady?.(false);
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
        setHasGeneratedForCurrentStep(true);
      }
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const currentGroupIndex = CHAPTER_GROUPS.indexOf(String(step?.group));
      const userId = localStorage.getItem("local_npub");
      if (!userId) {
        const searchLimit = currentGroupIndex > 0 ? currentGroupIndex : 0;
        const localHistory = [];
        for (let i = 0; i < searchLimit; i++) {
          const fb = readBuildFallback(null, CHAPTER_GROUPS[i]);
          if (fb?.code) localHistory.push(fb.code);
        }
        return localHistory;
      }
      const ref = collection(database, `users/${userId}/buildHistory`);
      const docs = await getDocs(ref);
      return docs.docs
        .filter((d) => {
          const idx = CHAPTER_GROUPS.indexOf(String(d.id));
          return idx !== -1 && (currentGroupIndex === -1 || idx < currentGroupIndex);
        })
        .sort((a, b) => CHAPTER_GROUPS.indexOf(String(a.id)) - CHAPTER_GROUPS.indexOf(String(b.id)))
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

    const prompt = buildAppPrompt({
      completed,
      history,
      idea,
      userLanguage,
      group: step?.group,
    });

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

  const handleCompleteChapter = () => {
    window.scrollTo(0, 0);
    soundManager.resume();
    soundManager.play("submit");
    saveBuild(code, "build").catch((err) =>
      console.error("Error saving build on completion", err),
    );
    if (onSubmit) {
      onSubmit();
    }
  };

  useEffect(() => {
    const { status, isDisabled } = calculateConversationReviewState({
      idea,
      savedIdea,
      code,
      isLoading,
      hasGeneratedForCurrentStep,
    });

    useConversationReviewStore.getState().setReviewState({
      status,
      isLoading,
      isDisabled,
      onCreateOrUpdate: handleSaveIdeaAndGenerate,
      onComplete: handleCompleteChapter,
    });
  }, [idea, savedIdea, code, isLoading, hasGeneratedForCurrentStep]);

  useEffect(() => {
    return () => {
      useConversationReviewStore.getState().resetReviewState();
    };
  }, []);

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
        onKeyDown={(e) => {
          if (e.key === "Enter" && idea.trim().length > 0 && !isLoading) {
            handleSaveIdeaAndGenerate();
          }
        }}
        backgroundColor="appSurface"
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        marginTop="-20px"
        width="75%"
      />

      {isLoading && (
        <VoiceOrbLoader
          label={
            translation[userLanguage]?.generatingApp ||
            (userLanguage?.startsWith("es")
              ? "Generando app..."
              : "Generating app...")
          }
        />
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
            value={{
              hideRunButton: isLoading,
              autoRun: !isLoading,
              loadingLabel: translation[userLanguage]["loading"],
            }}
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
