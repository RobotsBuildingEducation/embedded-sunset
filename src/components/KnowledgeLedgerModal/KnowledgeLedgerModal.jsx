// src/components/KnowledgeLedgerOnboarding.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button,
  Box,
  VStack,
  Text,
  Input,
  Heading,
  HStack,
  Grid,
  GridItem,
  ChakraProvider,
  Link,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { FaMagic } from "react-icons/fa";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import { useThinkingGeminiChat } from "../../hooks/useGeminiChat";
import { translation } from "../../utility/translation";
import { CloudCanvas } from "../../elements/SunsetCanvas";

/* ------------------------ helpers: extract + detect ------------------------ */
const stripCodeFences = (input = "") =>
  input.replace(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g, "$1");

const isReactCode = (txt = "") =>
  /(?:^|\n)\s*render\s*\(\s*<\w/i.test(txt) ||
  /createRoot\s*\(.+?\)\.render\s*\(\s*<\w/i.test(txt);

const isHTML = (txt = "") => /<!DOCTYPE|<html|<head|<body/i.test(txt);

const isRunnable = (txt = "") => {
  const t = (txt || "").trim();
  if (!t) return false;
  return (
    isReactCode(t) ||
    isHTML(t) ||
    /(^|\n)\s*(function|const|let|var|\(|document\.|console\.)/.test(t)
  );
};

const extractCodeFromMessage = (content = "") => {
  const withoutFences = stripCodeFences(content).trim();
  if (!withoutFences) return "";
  // prefer the last block-ish section (LLMs often narrate then code)
  const sections = withoutFences.split(/\n{2,}/);
  const candidate =
    sections.length > 1 ? sections[sections.length - 1] : withoutFences;

  // if narration leaked in, try to find code start
  const lines = candidate.split("\n");
  const start = lines.findIndex(
    (line) =>
      /render\s*\(/i.test(line) ||
      /createRoot\s*\(.+?\)\.render\s*\(/i.test(line) ||
      line.trim().startsWith("<") ||
      line.trim().startsWith("function") ||
      line.trim().startsWith("const") ||
      line.trim().startsWith("let") ||
      line.trim().startsWith("var")
  );
  const code = start > 0 ? lines.slice(start).join("\n") : candidate;
  return code.trim();
};

const buildJSRunnerDoc = (idx, raw = "") => {
  const sanitized = raw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  return `<!DOCTYPE html><html><body><script>
window.console = {
  log: (...a) => parent.postMessage({ type:'log', idx:${idx}, msg:a.join(' ') }, '*'),
  error: (...a) => parent.postMessage({ type:'log', idx:${idx}, msg:'Error: '+a.join(' ') }, '*')
};
try { ${sanitized} } catch(e) { console.error(e); }
</script></body></html>`;
};

/* -------------------------------- component -------------------------------- */
export default function KnowledgeLedgerOnboarding({
  isOpen,
  onClose,
  userLanguage,
  steps,
  currentStep,
  moveToNext,
}) {
  const [idea, setIdea] = useState("");
  const [savedIdea, setSavedIdea] = useState("");
  const [code, setCode] = useState(""); // editor code (user-visible)
  const [remoteCode, setRemoteCode] = useState(""); // last runnable from model
  const [isLoading, setIsLoading] = useState(false);

  const { submitPrompt, messages, resetMessages } = useThinkingGeminiChat();

  // preview state
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRef = useRef(null);

  // guards to avoid clobbering user edits
  const userTypingRef = useRef(false);
  const typingTimerRef = useRef(null);
  const latestRunnableRef = useRef("");

  /* ----------------------- load idea + saved code on open ----------------------- */
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const userId = localStorage.getItem("local_npub");
        if (!userId) return;
        const userRef = doc(database, "users", userId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const prevIdea = data.userBuild || "";
          setIdea(prevIdea);
          setSavedIdea(prevIdea);

          const group = steps?.[userLanguage]?.[currentStep]?.group;
          if (group) {
            const codeSnap = await getDoc(
              doc(database, "users", userId, "buildHistory", group)
            );
            if (codeSnap.exists()) {
              const { code: savedCode } = codeSnap.data();
              if (savedCode && savedCode.trim()) {
                setCode(savedCode);
                setRemoteCode(savedCode);
              }
            }
          }
        }
      } catch (e) {
        console.error("Init load failed", e);
      }
    })();
  }, [isOpen, steps, currentStep, userLanguage]);

  /* --------------------- adopt new code from messages safely -------------------- */
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    const extracted = extractCodeFromMessage(last.content);
    const isFinalChunk = last?.meta?.loading === false;

    if (extracted && isRunnable(extracted)) {
      latestRunnableRef.current = extracted;
      setRemoteCode(extracted);

      if (!isFinalChunk) {
        return;
      }

      if (!userTypingRef.current) {
        setCode(extracted);
      }
      setIsLoading(false);
      saveBuild(extracted, "build").catch(() => {});
      return;
    }

    if (isFinalChunk) {
      setIsLoading(false);
      if (latestRunnableRef.current && !userTypingRef.current) {
        setCode(latestRunnableRef.current);
      }
      if (latestRunnableRef.current) {
        saveBuild(latestRunnableRef.current, "build").catch(() => {});
      }
    }
  }, [messages]);

  /* -------------------------- console piping from iframe ------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "log" && typeof e.data.idx === "number") {
        setConsoleLogs((prev) => [...prev, e.data.msg]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ----------------------------- auto-run on change ----------------------------- */
  useEffect(() => {
    if (!code.trim()) return;
    const t = setTimeout(() => {
      setIsPreviewing(true);
      if (isHTML(code)) {
        if (iframeRef.current) iframeRef.current.srcdoc = code;
      } else if (!isReactCode(code)) {
        if (iframeRef.current)
          iframeRef.current.srcdoc = buildJSRunnerDoc(0, code);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [code]);

  /* --------------------------------- firestore --------------------------------- */
  const saveBuild = async (content, stage = "build") => {
    try {
      if (!content || !content.trim()) return; // don't save empties
      const userId = localStorage.getItem("local_npub");
      if (!userId) return;
      const group = steps?.[userLanguage]?.[currentStep]?.group || "ungrouped";
      await setDoc(
        doc(database, "users", userId, "buildHistory", group),
        { code: content, updatedAt: Date.now(), stage },
        { merge: true }
      );
      await updateDoc(doc(database, "users", userId), {
        userBuild: idea,
      }).catch(() => {});
    } catch (e) {
      console.error("saveBuild error", e);
    }
  };

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return [];
      const ref = collection(database, `users/${userId}/buildHistory`);
      const docs = await getDocs(ref);
      const group = steps?.[userLanguage]?.[currentStep]?.group;
      return docs.docs
        .filter(
          (d) =>
            !isNaN(parseInt(d.id)) && group && parseInt(d.id) < parseInt(group)
        )
        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
        .map((d) => d.data().code)
        .filter(Boolean);
    } catch (e) {
      console.error("history error", e);
      return [];
    }
  };

  /* ---------------------------------- actions ---------------------------------- */
  const handleGenerate = async () => {
    setIsLoading(true);
    latestRunnableRef.current = "";
    resetMessages();

    const completed = steps[userLanguage]
      .slice(1, currentStep)
      .map((s) => s.title);
    const history = await fetchHistory();

    const prompt = `Context:
The individual is learning to code. Based on completed steps: ${JSON.stringify(
      completed
    )}, produce a runnable demo in HTML or React.

Strict rules:
- Return only runnable code (no imports, no narration).
- If React: end with render(<TheComponentYouCreated />).
- If HTML: start with <!DOCTYPE html>.
- Responsive, minimalist white UI (avoid greens).
- If Firebase used: v9 API, "experiments" collection, refer to it as "database".
- Labels in ${userLanguage.includes("en") ? "English" : "Spanish"}.
- Theme around this idea: ${idea}.
${history.length ? `- Prior snippets in order: ${JSON.stringify(history)}` : ""}`;

    await submitPrompt(prompt);
    // messages effect will adopt code if present
  };

  const handleSaveIdeaAndGenerate = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (userId) {
        await updateDoc(doc(database, "users", userId), { userBuild: idea });
        setSavedIdea(idea);
        localStorage.setItem("userBuild", idea);
      }
    } catch (e) {
      console.error("save idea error", e);
    }
    await handleGenerate();
  };

  const handleUseThisAndNext = async () => {
    window.scrollTo(0, 0);
    if (code.trim()) await saveBuild(code, "conversation");
    moveToNext?.();
  };

  /* -------------------------- editor typing detection -------------------------- */
  const handleEditorChange = (v) => {
    setCode(v || "");
    userTypingRef.current = true;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      userTypingRef.current = false;
    }, 600);
  };

  /* ------------------------------------ UI ------------------------------------ */
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      size="full"
      blockScrollOnMount={false}
    >
      <DrawerOverlay bg="blackAlpha.500" />
      <DrawerContent
        borderRadius="0"
        w="100vw"
        maxW="100vw"
        h="100dvh"
        maxH="100dvh"
        inset="0"
        overflow="hidden"
        bg="white"
        sx={{
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" pb={4}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3} align="center">
              <Box
                bg="purple.500"
                color="white"
                borderRadius="full"
                p={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0px 4px 12px rgba(128, 90, 213, 0.35)"
              >
                <FaMagic />
              </Box>
              <Heading size="md">
                {translation[userLanguage]["modal.adaptiveLearning.title"]}{" "}
                (beta)
              </Heading>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {translation[userLanguage]["buildYourApp.onboarding.instruction"]}
            </Text>
          </VStack>
        </DrawerHeader>

        <DrawerBody px={{ base: 4, md: 6 }} py={6} overflow="hidden">
          {/* base: column; md+: two columns (LEFT editor/prompt, RIGHT preview) */}
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={{ base: 6, md: 6 }}
            h="full"
          >
            {/* LEFT: Prompt + Editor */}
            <GridItem
              colSpan={1}
              display="flex"
              flexDir="column"
              gap={6}
              minHeight={0}
            >
              <Box
                bg="white"
                p={6}
                borderRadius="24px"
                boxShadow="0 1px 2px rgba(0,0,0,0.08)"
                width="100%"
              >
                <Text
                  mb={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FaMagic />
                  &nbsp;{translation[userLanguage]["about.title.buildYourApp"]}
                </Text>

                <Text mb={4} fontSize="sm" color="gray.600">
                  {
                    translation[userLanguage][
                      "buildYourApp.onboarding.instruction"
                    ]
                  }
                </Text>

                <Input
                  placeholder={
                    translation[userLanguage]["buildYourApp.input.label"]
                  }
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  mb={3}
                  bg="white"
                />

                <HStack justifyContent="flex-start">
                  <Button
                    onClick={handleSaveIdeaAndGenerate}
                    isDisabled={isLoading || idea.length < 1}
                    colorScheme="pink"
                    variant="solid"
                  >
                    {savedIdea
                      ? translation[userLanguage]["buildYourApp.button.label.2"]
                      : translation[userLanguage][
                          "buildYourApp.button.label.1"
                        ]}
                  </Button>
                  <Button variant="outline" onClick={moveToNext}>
                    {translation[userLanguage]["skip"]}
                  </Button>
                </HStack>

                {isLoading && (
                  <Box mt={6}>
                    <CloudCanvas />
                    <Text mt={2}>
                      {translation[userLanguage]["loading.suggestion"]}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Editor under prompt; grows to fill remaining height */}
              <Box
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="xl"
                overflow="hidden"
                bg="white"
                flex="1"
                minH={{ base: "320px", md: "400px" }}
                minHeight={0}
              >
                <Editor
                  height="100%"
                  language="javascript"
                  theme="light"
                  value={code}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </Box>
            </GridItem>

            {/* RIGHT: Live Preview (full right side on md+) */}
            <GridItem
              colSpan={1}
              display="flex"
              flexDir="column"
              overflow="hidden"
            >
              <Box
                flex="1"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="xl"
                bg="gray.50"
                p={{ base: 3, md: 4 }}
                overflow="auto"
                minHeight={0}
              >
                {!code.trim() && !isLoading ? (
                  <Text color="gray.500" fontSize="sm">
                    {translation[userLanguage]["generatingCode"]}
                  </Text>
                ) : null}

                {isLoading && (
                  <Box>
                    <CloudCanvas />
                    <Text mt={2}>
                      {translation[userLanguage]["loading.suggestion"]}
                    </Text>
                  </Box>
                )}

                {/* React Preview */}
                {code.trim() &&
                  isReactCode(code) &&
                  isPreviewing &&
                  !isLoading && (
                    <ChakraProvider>
                      <LiveProvider
                        code={code}
                        noInline
                        scope={{
                          React,
                          useState: React.useState,
                          useEffect: React.useEffect,
                          Button,
                          Input,
                          Text,
                          Box,
                          Link,
                          Heading,
                          HStack,
                          VStack,
                        }}
                      >
                        <Box
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          overflow="hidden"
                          bg="white"
                          p={{ base: 3, md: 4 }}
                        >
                          <LivePreview />
                        </Box>
                        <LiveError
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#dc2626",
                            marginTop: "12px",
                          }}
                        />
                      </LiveProvider>
                    </ChakraProvider>
                  )}

                {/* HTML Preview */}
                {code.trim() &&
                  !isReactCode(code) &&
                  isHTML(code) &&
                  isPreviewing &&
                  !isLoading && (
                    <iframe
                      ref={iframeRef}
                      title="kl-preview-html"
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "320px",
                        border: 0,
                        background: "#fff",
                      }}
                    />
                  )}

                {/* JS Console (runs in hidden iframe; logs shown below) */}
                {code.trim() &&
                  !isReactCode(code) &&
                  !isHTML(code) &&
                  isPreviewing &&
                  !isLoading && (
                    <>
                      <iframe
                        ref={iframeRef}
                        title="kl-preview-js"
                        style={{ display: "none" }}
                      />
                      <Box
                        as="pre"
                        bg="gray.900"
                        color="green.200"
                        borderRadius="md"
                        p={3}
                        fontSize="sm"
                        overflowX="auto"
                        mt={3}
                      >
                        {consoleLogs.join("\n")}
                      </Box>
                    </>
                  )}
              </Box>

              {/* Next button pinned below preview (when we have code) */}
              {code.trim() && !isLoading && (
                <HStack mt={3} justify="flex-end">
                  <Button onClick={handleUseThisAndNext}>
                    {translation[userLanguage]["nextStep"]}
                  </Button>
                </HStack>
              )}
            </GridItem>
          </Grid>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" justifyContent="flex-end">
          <Button onClick={onClose}>
            {translation[userLanguage]["button.close"]}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
