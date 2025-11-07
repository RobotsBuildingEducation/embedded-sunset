// src/components/KnowledgeLedgerModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerFooter,
  Flex,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import { useThinkingGeminiChat } from "../../hooks/useGeminiChat";
import { translation } from "../../utility/translation";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor";
import { CloudCanvas } from "../../elements/SunsetCanvas";

// --- tiny parser to safely stream fenced code
function parseFenced(text = "") {
  const start = text.indexOf("```");
  if (start === -1) return { hasFence: false, closed: false };
  let i = start + 3;
  let lang = "";
  while (i < text.length && text[i] !== "\n") {
    lang += text[i];
    i++;
  }
  if (text[i] === "\n") i++;
  const end = text.indexOf("```", i);
  if (end === -1)
    return {
      hasFence: true,
      closed: false,
      lang: lang.trim(),
      inner: text.slice(i),
    };
  const inner = text.slice(i, end);
  const fullBlock = text.slice(start, end + 3);
  return { hasFence: true, closed: true, lang: lang.trim(), inner, fullBlock };
}

function KnowledgeLedgerContent({ steps, step, userLanguage, onContinue }) {
  const [idea, setIdea] = useState("");
  const [savedIdea, setSavedIdea] = useState("");
  const [code, setCode] = useState(""); // full fenced block
  const [draft, setDraft] = useState(""); // inner code only
  const [lang, setLang] = useState("");

  // streaming state
  const [streamingView, setStreamingView] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // NEW: prevent post-close tokens from flipping UI back to streaming
  const fenceClosedRef = useRef(false);

  // NEW: force-remount preview so react-live/iframe always refresh
  const [previewKey, setPreviewKey] = useState(0);

  const { submitPrompt, messages, resetMessages } = useThinkingGeminiChat();
  const groupId = useMemo(
    () => String(step?.group ?? "default"),
    [step?.group]
  );

  const wrapFenced = (body, language = lang || "jsx") =>
    "```" + (language || "") + "\n" + (body || "") + "\n```";

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("local_npub");
        if (!userId) return;

        const userDocRef = doc(database, "users", userId);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data() || {};
          const initIdea = data.userBuild || "";
          setIdea(initIdea);
          setSavedIdea(initIdea);

          const buildCode = data.buildCode || {};
          if (buildCode[groupId]) {
            const stored = buildCode[groupId];
            setCode(stored);
            const parsed = parseFenced(stored);
            if (parsed?.hasFence) {
              setDraft(parsed.inner || "");
              setLang((parsed.lang || "").trim());
            }
          }
        }

        const codeSnap = await getDoc(
          doc(database, "users", userId, "buildHistory", groupId)
        );
        if (codeSnap.exists()) {
          const d = codeSnap.data() || {};
          if (d.code) {
            setCode(d.code);
            const p2 = parseFenced(d.code);
            if (p2?.hasFence) {
              setDraft(p2.inner || "");
              setLang((p2.lang || "").trim());
            }
          }
        }
      } catch (err) {
        console.error("Error fetching build data", err);
      }
    };
    fetchData();
  }, [groupId]);

  // Stream handler
  useEffect(() => {
    if (!messages.length) return;

    // If we've already seen a closed fence, ignore any trailing tokens.
    if (fenceClosedRef.current) return;

    const last = messages[messages.length - 1];
    const content = last?.content || "";
    const parsed = parseFenced(content);

    if (!parsed.hasFence) {
      setIsStreaming(true);
      setStreamingView(content);
      return;
    }

    if (!parsed.closed) {
      setIsStreaming(true);
      setStreamingView(parsed.inner);
    } else {
      fenceClosedRef.current = true; // ⬅️ lock
      const finalBlock = parsed.fullBlock;
      setCode(finalBlock);
      setDraft(parsed.inner || "");
      setLang((parsed.lang || "").trim());
      setStreamingView("");
      setIsStreaming(false);

      // force preview re-mount so it always refreshes
      setPreviewKey((k) => k + 1);

      saveBuild(finalBlock, "build").catch((e) =>
        console.error("saveBuild error", e)
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (!userId) return [];
      const ref = collection(database, `users/${userId}/buildHistory`);
      const docs = await getDocs(ref);
      const currentIdx = parseInt(groupId, 10);
      return docs.docs
        .filter((d) => !isNaN(parseInt(d.id)) && parseInt(d.id) < currentIdx)
        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
        .map((d) => d.data()?.code)
        .filter(Boolean);
    } catch (e) {
      console.error("Error fetching history", e);
      return [];
    }
  };

  const handleGenerate = async () => {
    // reset streaming guard so a new run can update the UI
    fenceClosedRef.current = false;

    setIsStreaming(true);
    setStreamingView("");
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
      - A. If you are upgrading to React, do NOT include any import statements or define dependencies and conclude the component or components with render(<TheComponentYouCreated />). This means React code is only ever about writing component functions, nothing else.\n  
      - B. If you are generating plain html, use !DOCTYPE\n  
      - C. Do NOT return purely plain JavaScript snippets. Use React components or HTML only based on the criteria.\n  
      - D. If you are writing firebase (with or without react), use v9, and you MUST use a unique document in the 'experiments' collection. Never use any other collection or your firebase software will fail. Never use imports or we will fail. Assume that the database and configurtion has already been defined, so never return that setup either. Refer to the database element as "database" and not "db" or anything else. Do not use auth. Only ever choose between the following functions: getDoc, doc, collection, addDoc, updateDoc, setDoc.\n  
      - E. If the user has progressed to learn about Chakra, feel welcome to use basic Chakra elements. Never use the ChakraProvider element.\n\n` +
      `3. Strictly return only code written by a formatted backticked code block. Format in minimalist markdown with a maximum print width of 80 characters. Finally do not add any language mentioning that you understand the request - it should the code only, without any exceptions. I repeat, do not return anything other than code or appropriate comments with the code. \n\n` +
      `4. The user is speaking in ${userLanguage.includes("en") ? "English" : "Spanish"}. So theme the code that you're writing based on the language.` +
      `5. The user is also interested in building the following idea: ${idea}. Make the code about that theme in good faith.` +
      `6. The code you return MUST be responsive for both mobile and desktop views. Do not allow renders that awkwardly break out of containers, err on the side of being as mobile friendly as possible!`;

    await submitPrompt(prompt);
  };

  const handleSaveIdeaAndGenerate = async () => {
    try {
      const userId = localStorage.getItem("local_npub");
      if (userId) {
        try {
          await updateDoc(doc(database, "users", userId), { userBuild: idea });
        } catch {
          await setDoc(
            doc(database, "users", userId),
            { userBuild: idea },
            { merge: true }
          );
        }
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
      const userSnap = await getDoc(userDocRef);
      const data = userSnap.exists() ? userSnap.data() : {};
      const buildCode = data?.buildCode || {};

      try {
        await updateDoc(userDocRef, {
          userBuild: idea,
          buildCode: { ...buildCode, [groupId]: content },
        });
      } catch {
        await setDoc(
          userDocRef,
          { userBuild: idea, buildCode: { ...buildCode, [groupId]: content } },
          { merge: true }
        );
      }

      await setDoc(
        doc(database, "users", userId, "buildHistory", groupId),
        { code: content, updatedAt: Date.now(), stage },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving build", err);
    }
  };

  const handleSaveAndContinue = async () => {
    window.scrollTo(0, 0);
    if (draft.trim())
      await saveBuild(wrapFenced(draft, lang || "jsx"), "conversation");
    onContinue?.();
  };

  return (
    <VStack spacing={4} width="100%" maxWidth="1200px" mt="8" mx="auto">
      <Text fontSize="sm" fontWeight="bold" mb="12px">
        Enter an app idea and build it as you make progress!
      </Text>

      {/* Prompt row */}
      <VStack width="100%" align="center" flexWrap="wrap" gap={3}>
        <Input
          placeholder={translation[userLanguage]["buildYourApp.input.label"]}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          backgroundColor="white"
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
          width={{ base: 300, md: 300 }}
        />
        <HStack>
          <Button
            onClick={handleSaveIdeaAndGenerate}
            isDisabled={idea.length < 1}
            colorScheme="pink"
            background="pink.300"
            width="300px"
          >
            {savedIdea
              ? translation[userLanguage]["buildYourApp.button.label.2"]
              : translation[userLanguage]["buildYourApp.button.label.1"]}
          </Button>
        </HStack>
      </VStack>

      {/* Streaming state: safe monospace preview */}
      {isStreaming ? (
        <VStack w="100%" pt="2" align="stretch">
          <CloudCanvas />
          <Text>{translation[userLanguage]["loading.suggestion"]}</Text>
          <Box
            mt={2}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
            fontFamily="mono"
            fontSize="sm"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            maxH="60vh"
            overflowY="auto"
          >
            {streamingView || "Generating…"}
          </Box>
        </VStack>
      ) : (
        // Final: Split layout (desktop) / stacked (mobile)
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align="stretch"
          w="100%"
        >
          {/* LEFT: editor */}
          <Box
            flexBasis={{ base: "100%", md: "50%" }}
            maxW={{ base: "100%", md: "50%" }}
          >
            <LiveReactEditorModal
              mode="editor"
              controlledCode={draft}
              onCodeChange={setDraft}
              editorHeight={{ base: "280px", md: "calc(100vh - 320px)" }}
            />
          </Box>

          {/* RIGHT: full-height renderer */}
          <Box
            flex="1"
            position={{ base: "static", md: "sticky" }}
            top={{ md: "64px" }}
            alignSelf="stretch"
          >
            <LiveReactEditorModal
              mode="preview"
              controlledCode={draft}
              autoRun
              // ⬇️ key so preview hard-resets when final code lands
              instanceKey={previewKey}
              previewHeight={{ base: "360px", md: "calc(100vh - 160px)" }}
            />
          </Box>
        </Flex>
      )}
    </VStack>
  );
}

export default function KnowledgeLedgerModal({
  isOpen,
  onClose,
  steps,
  step,
  userLanguage,
  onContinue,
  title = "Build Your App",
}) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      size="full"
      trapFocus
      closeOnOverlayClick={false}
      blockScrollOnMount
    >
      <DrawerOverlay />
      <DrawerContent display="flex" flexDirection="column" maxH="100vh">
        <DrawerCloseButton />
        <DrawerHeader>{title}</DrawerHeader>
        <DrawerBody
          display="flex"
          flexDir="column"
          p={{ base: 3, md: 6 }}
          flex="1"
          overflowY="auto"
        >
          <KnowledgeLedgerContent
            steps={steps}
            step={step}
            userLanguage={userLanguage}
            onContinue={onContinue}
          />
        </DrawerBody>
        <DrawerFooter
          position="sticky"
          bottom="0"
          bg="chakra-body-bg"
          borderTopWidth="1px"
          borderColor="blackAlpha.200"
          boxShadow="sm"
          justifyContent="flex-end"
        >
          <Button size="lg" onClick={onClose}>
            {translation?.[userLanguage]?.["button.close"] || "Close"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
