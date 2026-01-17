// src/components/KnowledgeLedgerOnboarding.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Input,
  Heading,
  useClipboard,
  Link,
  ChakraProvider,
  HStack,
  Progress,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { FaMagic } from "react-icons/fa";
import {
  useSimpleGeminiChat,
  useThinkingGeminiChat,
} from "../../hooks/useGeminiChat";
import { useAlertStore } from "../../useAlertStore";
import { usePasscodeModalStore } from "../../usePasscodeModalStore";
import RandomCharacter, {
  PanRightComponent,
} from "../../elements/RandomCharacter";
import { CloudCanvas } from "../../elements/SunsetCanvas";
import { translation } from "../../utility/translation";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import WaveBar from "../WaveBar";
import { soundManager } from "../../utility/soundManager";
import { triggerHaptic } from "tactus";

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
    "compsci-en": "Foundations of Data Structures", // ✅ fixed
  },
  2: {
    en: "Object-Oriented Programming",
    es: "Programación Orientada a Objetos",
    "py-en": "Object-Oriented Programming",
    "swift-en": "Object-Oriented Programming",
    "android-en": "Object-Oriented Programming",
    "compsci-en": "Linear Structures", // ✅ fixed
  },
  3: {
    en: "Frontend Development",
    es: "Desarrollo Frontend",
    "py-en": "Frontend Development",
    "swift-en": "Frontend Development",
    "android-en": "Frontend Development",
    "compsci-en": "Hierarchical & Associative Structures", // ✅ fixed
  },
  4: {
    en: "Backend Engineering Fundamentals",
    es: "Fundamentos de Ingeniería de Backend",
    "py-en": "Backend Engineering Fundamentals",
    "swift-en": "Backend Engineering Fundamentals",
    "android-en": "Backend Engineering Fundamentals",
    "compsci-en": "Sorting & Searching Algorithms", // ✅ fixed
  },
  5: {
    en: "Creating Apps & Experiences",
    es: "Creando Aplicaciones y Experiencias",
    "py-en": "Creating Apps & Experiences",
    "swift-en": "Creating Apps & Experiences",
    "android-en": "Creating Apps & Experiences",
    "compsci-en": "Operating Systems Essentials", // ✅ fixed
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

export default function KnowledgeLedgerOnboarding({
  userLanguage,
  moveToNext,
}) {
  // -- Onboarding state & hooks --
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunCode, setHasRunCode] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [userIdea, setUserIdea] = useState("");
  const { submitPrompt, messages, resetMessages } = useThinkingGeminiChat();
  const { showAlert } = useAlertStore();
  const { openPasscodeModal } = usePasscodeModalStore();
  const { hasCopied, onCopy } = useClipboard(
    userIdea + " (using mock data if necessary)"
  );

  // -- Editor state arrays, one slot per message --
  const [editorCodes, setEditorCodes] = useState([]);
  const [isPreviewings, setIsPreviewings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRefs = useRef([]);

  // load saved idea
  useEffect(() => {
    const saved = localStorage.getItem("userBuild");
    if (saved) setUserIdea(saved);
  }, []);

  // whenever AI messages change, init arrays
  useEffect(() => {
    setEditorCodes(messages.map((m) => stripCodeFences(m.content)));
    setIsPreviewings(messages.map(() => false));
    setErrors(messages.map(() => ""));
    setConsoleLogs(messages.map(() => []));
  }, [messages]);

  // reset run state when generating new code
  useEffect(() => {
    if (isLoading) {
      setHasRunCode(false);
    }
  }, [isLoading]);

  // automatically run the generated code once loading is finished
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasRunCode) {
      runCode(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, messages]);

  // handle console messages from iframes
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "log" && typeof e.data.idx === "number") {
        setConsoleLogs((prev) => {
          const copy = [...prev];
          copy[e.data.idx] = [...copy[e.data.idx], e.data.msg];
          return copy;
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const saveUserInput = async () => {
    triggerHaptic();
    soundManager.init().catch(() => {});
    soundManager.play("submitAction");
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("local_npub");
      const userDoc = doc(database, "users", userId);
      await updateDoc(userDoc, { userBuild: userInput });
      localStorage.setItem("userBuild", userInput);
      setUserIdea(userInput);
      triggerSuggestion(userInput);
    } catch (e) {
      console.error(e);
      showAlert("error", translation[userLanguage]["input.fetch.error"]);
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    triggerHaptic();
    soundManager.init().catch(() => {});
    soundManager.play("colorSwitch");
    moveToNext();
  };

  const triggerSuggestion = async (idea) => {
    resetMessages();

    try {
      let prompt = `The user wants to build an app with a great UI/UX with React. Build the app around the user's idea: ${userInput}. The user is speaking in ${userLanguage.includes("en") ? "English" : "Spanish"}.

        When generating your response, you must format your software in this manner:
        
        1. Never use imports. When writing React, do NOT include any import statements or define dependencies.
        
        2. Your code should conclude with the line: render(<TheComponentYouCreated />)
        
        3. Use the React object for useState and useEffect (React.useState, React.useEffect) without importing. Do not use it for createElement, just use the jsx notation instead.
        
        4. Print width of 80.
        
        5. The component should be aesthetically pleasing and beautiful minimist theme with interactivity and thoughtful spacing. This means that buttons, elements and all other visuals should make sense using proper color theory and responsive design. The background should be white and do not use green or green tones for any elements or buttons.

        6. Your code will be rendered inside of an already existing container on both mobile and desktop web browsers, so make certain that your outcome works responsively using margins and max widths and sensible wrapping. Never use table elements, since they create unresponsive designs.
        
        7. Do not return anything other code. Do not include markdown template with triple backticks for jsx or javascript either. This is a strict and absolute rule. Only return code that can be executed because it will be executed, anything else is unnecessary and unwanted and will break the feature. 
        `;
      await submitPrompt(prompt);

      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  // helpers
  const isReactCode = (txt) => /render\s*\(\s*<\w/.test(txt);
  const isHTML = (txt) => /<[^>]+>/.test(txt);

  const runJavaScript = (idx, sanitized) => {
    const html = `
      <script>
        window.console = {
          log: (...args) => parent.postMessage({ type:'log', idx: ${idx}, msg: args.join(' ') }, '*'),
          error: (...args) => parent.postMessage({ type:'log', idx: ${idx}, msg: 'Error: '+args.join(' ') }, '*')
        };
        try { ${sanitized} } catch(e) { console.error(e) }
      </script>`;
    iframeRefs.current[idx].srcdoc = html;
  };

  const runCode = (idx) => {
    setIsPreviewings((p) => p.map((v, i) => (i === idx ? true : v)));
    setErrors((e) => e.map((v, i) => (i === idx ? "" : v)));
    setConsoleLogs((l) => l.map((v, i) => (i === idx ? [] : v)));

    const code = editorCodes[idx];
    const clean = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    if (isReactCode(clean)) {
      // react-live will handle preview
    } else if (isHTML(clean)) {
      iframeRefs.current[idx].srcdoc = clean;
    } else {
      runJavaScript(idx, clean);
    }

    setHasRunCode(true);
  };

  console.log("messages", messages);
  const stripCodeFences = (input) => {
    // This regex looks for:
    //  - ``` then (jsx|javascript)
    //  - optional whitespace/newline
    //  - (capture) anything (including newlines) lazily
    //  - optional whitespace/newline then closing ```
    return input.replace(/```(?:jsx|javascript)\s*\n?([\s\S]*?)\n?```/g, "$1");
  };

  return (
    <>
      {/* Onboarding UI */}
      <Text fontSize={"xs"}>
        {" "}
        {translation[userLanguage]["onboardingProgress"]}
      </Text>

      {/* <Progress
        opacity="0.8"
        border="1px solid #ececec"
        // boxShadow="0px 0px 0.5px 2px #ececec"
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        value={(1 / 7) * 100}
        size="md"
        colorScheme={"green"}
        width="250px"
        mb={6}
        borderRadius="4px"
        background={"#ececec"}
      /> */}
      <Box width="250px" mb={6}>
        <WaveBar
          value={(1 / 6) * 100}
          start="#02fabc"
          end="#12ff69"
          delay={0}
          bg="rgba(255,255,255,0.65)"
          border="#ededed"
        />
      </Box>
      <Box
        bg="white"
        p={6}
        borderRadius="24px"
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        mb={8}
        textAlign="center"
        width="100%"
      >
        <Text mb={4} display="flex" alignItems="center" justifyContent="center">
          <FaMagic />
          &nbsp;{translation[userLanguage]["about.title.buildYourApp"]}
        </Text>
        <Text mb={4} maxW="400px" mx="auto" fontSize={"sm"} textAlign={"left"}>
          {/* {translation[userLanguage]["about.subtitle.buildYourApp"]} */}
          {translation[userLanguage]["buildYourApp.onboarding.instruction"]}
        </Text>
        <Input
          placeholder={translation[userLanguage]["buildYourApp.input.label"]}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          mb={2}
          maxW="400px"
        />
        <br />
        <HStack justifyContent={"center"}>
          <Button
            onClick={saveUserInput}
            isDisabled={!userInput.trim()}
            colorScheme="pink"
            variant={"outline"}
            data-sound-ignore-select="true"
          >
            {userIdea
              ? translation[userLanguage]["buildYourApp.button.label.2"]
              : translation[userLanguage]["buildYourApp.button.label.1"]}
          </Button>
          <Button onClick={handleSkip} data-sound-ignore-select="true">
            {" "}
            {translation[userLanguage]["skip"]}
          </Button>
        </HStack>
        <br />

        {isLoading && (
          <>
            <CloudCanvas />
            {translation[userLanguage]["generatingCode"]}

            <br />
          </>
        )}

        {/* Render each AI suggestion with inline editor + preview */}
        <VStack spacing={6} align="stretch">
          {messages.map((msg, idx) => (
            <Box key={idx}>
              {/* {isLoading ? null : (
                <>
                  <br />
                  <Button
                    onClick={() => runCode(idx)}
                    variant="outline"
                    mb={2}
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                  >
                    {translation[userLanguage]["runCode"]}
                  </Button>
                </>
              )}{" "} */}
              <div
                style={{
                  border: "1px solid #444",
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <Editor
                  height="300px"
                  language={"javascript"}
                  value={editorCodes[idx]}
                  onChange={(v) => {
                    const all = [...editorCodes];
                    all[idx] = v || "";
                    setEditorCodes(all);
                  }}
                  options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                  }}
                />
              </div>
              {hasRunCode ? (
                <>
                  <br />
                  <Text> {translation[userLanguage]["goodJob"]}</Text>
                  <Button
                    onClick={moveToNext}
                    mb={2}
                    boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
                    data-sound-ignore-select="true"
                  >
                    {translation[userLanguage]["nextStep"]}
                  </Button>
                </>
              ) : null}

              {/* React preview */}
              {isReactCode(editorCodes[idx]) && isPreviewings[idx] && (
                <ChakraProvider>
                  <LiveProvider
                    code={editorCodes[idx]}
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
                      UnorderedList: React.Fragment,
                      FormControl: React.Fragment,
                      FormLabel: React.Fragment,
                      List: React.Fragment,
                      ListItem: React.Fragment,
                      Flex: React.Fragment,
                      VStack,
                      HStack: React.Fragment,
                      Textarea: React.Fragment,
                      Select: React.Fragment,
                    }}
                  >
                    <LivePreview />
                    <LiveError />
                  </LiveProvider>
                </ChakraProvider>
              )}
              {/* HTML preview */}
              {isHTML(editorCodes[idx]) && !isReactCode(editorCodes[idx]) && (
                <iframe
                  ref={(el) => (iframeRefs.current[idx] = el)}
                  style={{ width: "100%", height: "300px", border: 0 }}
                />
              )}
              {/* JS console */}
              {!isReactCode(editorCodes[idx]) &&
                !isHTML(editorCodes[idx]) &&
                isPreviewings[idx] && (
                  <Box as="pre" bg="gray.800" color="white" p={2} mt={2}>
                    {consoleLogs[idx].join("\n")}
                  </Box>
                )}
              {errors[idx] && <Text color="red.500">{errors[idx]}</Text>}
            </Box>
          ))}
        </VStack>
      </Box>

      <Box display="flex" justifyContent="flex-end" mt="-36px" width="100%">
        <PanRightComponent>
          <RandomCharacter />
        </PanRightComponent>
      </Box>
    </>
  );
}
