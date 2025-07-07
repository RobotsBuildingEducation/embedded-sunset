import React, { useState, useRef, useEffect } from "react";
import {
  ChakraProvider,
  Button,
  Input,
  Box,
  Heading,
  UnorderedList,
  ListItem,
  Text,
  Center,
  FormControl,
  FormLabel,
  List,
  Flex,
  useBreakpointValue,
  useClipboard,
  Link,
  VStack,
  HStack,
  Textarea,
  Select,
} from "@chakra-ui/react";

import { CodeEditor } from "../CodeEditor/CodeEditor";

import { LiveError, LivePreview, LiveProvider } from "react-live";
import { database } from "../../database/firebaseResources";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { translation } from "../../utility/translation";

// const code = `
// function FirestoreDemo() {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);

//   // 📝 Add a new message to Firestore
//   const sendMessage = async () => {
//     if (message) {
//       await addDoc(collection(database, 'experiments'), { text: message });
//       setMessage('');
//     }
//   };

//   // 📡 Listen for real-time updates
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(database, 'experiments'), (snapshot) => {
//       const data = snapshot.docs.map(doc => doc.data());
//       setMessages(data);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <div>
//       <h2>Firebase v9 Messages</h2>
//       <input
//         type="text"
//         placeholder="Type a message"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button onClick={sendMessage}>Send</button>
//       <ul>
//         {messages.map((msg, index) => (
//           <li key={index}>{msg.text}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

//
// ;
// `;

const LiveReactEditorModal = ({
  code,
  isOnboarding = false,
  hideRunButton = false,
  autoRun = false,
}) => {
  const [editorCode, setEditorCode] = useState(code);
  const { hasCopied, onCopy } = useClipboard(
    editorCode +
      " using mock data rather than real config data if necessary. Given that we're using v0, use supabase to replce firebase if firebase is discussed."
  ); // Copy functionality
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isPreviewing) {
      setIsPreviewing(false);
    }
    setEditorCode(code);
  }, [code]);

  useEffect(() => {
    if (autoRun && editorCode.trim()) {
      runCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  const isReactCode = (code) =>
    /(ReactDOM\s*\.\s*)?render\s*\(\s*<\s*[A-Z][\w]*\s*\/?>/.test(code);

  const isHTMLCode = (code) => /<[^>]+>/.test(code);

  const cleanCode = (inputCode) => {
    return inputCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "").trim();
  };

  const runHTMLCode = (sanitizedCode) => {
    try {
      iframeRef.current.srcdoc = `
       <!DOCTYPE html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <title>Live HTML Preview</title>
         </head>
         <body>
           ${sanitizedCode}
         </body>
       </html>
     `;
    } catch (err) {
      setError(err.message);
    }
  };

  const runCode = () => {
    setIsPreviewing(true);
    setError("");
    const sanitizedCode = cleanCode(editorCode);
    if (isReactCode(sanitizedCode)) {
      // React preview handled by LiveProvider
    } else if (isHTMLCode(sanitizedCode)) {
      runHTMLCode(editorCode);
    } else {
      setError("Unsupported code format");
    }
  };

  // const flexDirection = useBreakpointValue({
  //   base: "column",
  //   md: isOnboarding ? "100%" : "100%",
  // });
  // const editorWidth = useBreakpointValue({
  //   base: "100%",
  //   md: isOnboarding ? "100%" : "100%",
  // });
  // const previewWidth = useBreakpointValue({
  //   base: "100%",
  //   md: isOnboarding ? "100%" : "100%",
  // });

  return (
    <>
      {/* {!hideRunButton && (
        <Button
          variant="outline"
          mt={4}
          onClick={runCode}
          mb={4}
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        >
          Run Code
        </Button>
      )} */}
      {/* {!isOnboarding && (
        <>
          {" "}
          &nbsp;
          {translation[localStorage.getItem("userLanguage") || "en"]["or"]}
          &nbsp;
          <Link
            textDecoration={"underline"}
            as="button"
            onMouseDown={() => {
              onCopy();
              window.location.href = "https://v0.dev/";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onCopy();
                window.location.href = "https://v0.dev/";
              }
            }}
            mb={4}
          >
            {hasCopied
              ? translation[localStorage.getItem("userLanguage") || "en"][
                  "copied"
                ]
              : translation[localStorage.getItem("userLanguage") || "en"][
                  "copy_code_launch_builder"
                ]}
          </Link>
        </>
      )} */}
      <Box display="flex" flexDirection={"column"} width="100%" mt={4}>
        <Box
          width={"100%"}
          mb={{ base: 4, md: 0 }}
          boxShadow="0.5px 0.5px 1px 0px rgba(0, 0, 0, 0.75)"
        >
          <CodeEditor
            value={editorCode}
            onChange={(value) => setEditorCode(value)}
            height={400}
            userLanguage={
              isHTMLCode(editorCode) ? "en" : localStorage.getItem("userLanguage") || "en"
            }
          />
        </Box>

        <Box
          width={"100%"}
          borderRadius="2xl"
          marginTop="8px"
          border="1px solid black"
        >
          {isReactCode(editorCode) && isPreviewing ? (
            <ChakraProvider>
              <LiveProvider
                code={editorCode}
                noInline={true}
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
                  UnorderedList,
                  FormControl,
                  FormLabel,
                  List,
                  ListItem,
                  Flex,
                  VStack,
                  HStack,
                  Textarea,
                  Select,

                  Center,
                  database,

                  getDoc,
                  doc,
                  collection,
                  addDoc,
                  updateDoc,
                  setDoc,
                  getDocs,
                }}
              >
                <LivePreview />
                <LiveError />
                {/* <LiveEditor /> */}
              </LiveProvider>
            </ChakraProvider>
          ) : null}
          {isHTMLCode(editorCode) && !isReactCode(editorCode) ? (
            <Box width="50%" borderRadius="md" ml={4}>
              <iframe
                ref={iframeRef}
                title="Live Preview"
                style={{
                  width: "100%",
                  height: "400px",
                  //   border: "none",
                }}
              />
            </Box>
          ) : null}
          {isPreviewing && error && (
            <Text color="red.500" mt={2}>
              {error}
            </Text>
          )}
        </Box>
      </Box>
      {error && !isPreviewing && <Text color="red.500">{error}</Text>}
    </>
  );
};

export default LiveReactEditorModal;
