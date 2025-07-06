import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Heading,
} from "@chakra-ui/react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "../../database/firebaseResources";
import { useSimpleGeminiChat } from "../../hooks/useGeminiChat";
import { transcriptDisplay } from "../SettingsMenu/KnowledgeLedgerModal/KnowledgeLedgerModal";
import { translation } from "../../utility/translation";

const PreConversation = ({ steps, step, userLanguage, onContinue }) => {
  const [idea, setIdea] = useState("");
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
    const completed = steps[userLanguage]
      .slice(1, idx)
      .map((s) => s.title);
    const prompt = `Based on completed topics ${JSON.stringify(
      completed
    )} write code for the idea \"${idea}\". Respond only with code formatted in markdown.`;
    submitPrompt(prompt).then(() => setIsLoading(false));
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

  const groupedSteps = () => {
    const idx = steps[userLanguage].indexOf(step);
    const completed = steps[userLanguage].slice(1, idx);
    const groups = {};
    completed.forEach((s) => {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s.title);
    });
    return groups;
  };

  const groups = groupedSteps();

  return (
    <VStack spacing={6} alignItems="flex-start" width="100%" maxWidth="600px">
      <Heading size="md">
        {translation[userLanguage]["modal.adaptiveLearning.title"]}
      </Heading>
      <Input
        placeholder={translation[userLanguage]["buildYourApp.input.label"]}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />
      <Button onClick={handleGenerate} isDisabled={!idea.trim() || isLoading}>
        {translation[userLanguage]["modal.adaptiveLearning.recommendButton"]}
      </Button>
      {isLoading && <Text>{translation[userLanguage]["loading.suggestion"]}</Text>}
      {code && (
        <Box width="100%" border="1px solid" p={4} borderRadius="md">
          <Markdown components={ChakraUIRenderer()} children={code} />
        </Box>
      )}
      <Accordion allowMultiple width="100%">
        {Object.entries(groups).map(([g, titles]) => (
          <AccordionItem key={g}>
            <h2>
              <AccordionButton padding={4}>
                <Box flex="1" textAlign="left">
                  {transcriptDisplay[g]?.[userLanguage] || g}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} textAlign="left">
              {titles.map((t, i) => (
                <Text key={i}>{t}</Text>
              ))}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Button onClick={handleSave} isDisabled={!code.trim()}>
        {translation[userLanguage]["nextStep"]}
      </Button>
      <Button variant="outline" onClick={onContinue}>
        {translation[userLanguage]["skip"]}
      </Button>
    </VStack>
  );
};

export default PreConversation;
