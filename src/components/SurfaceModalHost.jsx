import React, { useEffect, useRef, useState } from "react";
import EducationalModal from "./LearnModal/EducationalModal";
import BitcoinModeModal from "./SettingsMenu/BitcoinModeModal/BitcoinModeModal";
import SelfPacedModal from "./SettingsMenu/SelfPacedModal/SelfPacedModal";
import KnowledgeLedgerModal from "./KnowledgeLedgerModal/KnowledgeLedgerModal";
import { AlgorithmHelper } from "./AlgorithmHelper/AlgorithmHelper";
import { useSimpleGeminiChat } from "../hooks/useGeminiChat";
import { getObjectsByGroup, steps } from "../utility/content";
import { pickProgrammingLanguage } from "../utility/translation";
import { soundManager } from "../utility/soundManager";
import { useSurfaceModalStore } from "../useSurfaceModalStore";

const buildLearnPrompt = (step, userLanguage) => {
  const languageName = pickProgrammingLanguage(userLanguage);
  const isEnglish = userLanguage?.includes("en");

  if (step?.isConversationReview) {
    const relevantSteps = getObjectsByGroup(step?.group, steps[userLanguage]);

    return `Generate educational material about ${JSON.stringify(
      relevantSteps,
    )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Additionally the ${languageName} or relevant code should consider line breaks and formatting and have a maximum print width of 80 characters and never start with a backticking markdown with triple backticks specifically as the format. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets.  Never specify the answer. Lastly the user is speaking in ${
      isEnglish ? "english" : "spanish"
    }`;
  }

  return `Generate educational ${languageName} material about ${JSON.stringify(
    step,
  )} with code examples and explanations. Make it enriching and create a useful flow where the ideas build off of each other to encourage challenge and learning. Additionally any ${languageName} or relevant code should have a maximum print width of 80 characters and never start with a backticking markdown with triple backticks specifically as the format. Do not reference these instructions, simply display the educational content and do not use comments in the code snippets. Never specify the answer. Lastly the user is speaking in ${
    isEnglish ? "english" : "spanish"
  }`;
};

const getLearnCacheKey = (step, userLanguage) => {
  try {
    return `${userLanguage}:${JSON.stringify(step)}`;
  } catch {
    return `${userLanguage}:${step?.group || ""}:${step?.title || ""}:${
      step?.question?.questionText || ""
    }`;
  }
};

const LearnModalHost = () => {
  const learnModal = useSurfaceModalStore((state) => state.learnModal);
  const closeLearnModal = useSurfaceModalStore((state) => state.closeLearnModal);
  const activeKeyRef = useRef(null);
  const learnCacheRef = useRef(new Map());
  const { messages, submitPrompt, resetMessages } = useSimpleGeminiChat();
  const submitPromptRef = useRef(submitPrompt);
  const resetMessagesRef = useRef(resetMessages);
  const [educationalContent, setEducationalContent] = useState([]);
  const [pendingGeneration, setPendingGeneration] = useState(null);
  const [, refreshCache] = useState(0);

  useEffect(() => {
    submitPromptRef.current = submitPrompt;
  }, [submitPrompt]);

  useEffect(() => {
    resetMessagesRef.current = resetMessages;
  }, [resetMessages]);

  useEffect(() => {
    if (!learnModal) {
      setPendingGeneration(null);
      return;
    }

    const cacheKey = getLearnCacheKey(learnModal.step, learnModal.userLanguage);
    const cachedMessages = learnCacheRef.current.get(cacheKey);
    const isActiveGeneration = activeKeyRef.current === cacheKey;
    const isPendingGeneration = pendingGeneration?.cacheKey === cacheKey;

    if (cachedMessages || isActiveGeneration || isPendingGeneration) {
      return;
    }

    activeKeyRef.current = null;
    resetMessagesRef.current();
    setEducationalContent([]);
    setPendingGeneration({
      cacheKey,
      prompt: buildLearnPrompt(learnModal.step, learnModal.userLanguage),
    });
  }, [learnModal, pendingGeneration?.cacheKey]);

  useEffect(() => {
    if (!learnModal || !pendingGeneration || messages.length > 0) return;

    activeKeyRef.current = pendingGeneration.cacheKey;

    let timeoutId = null;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        setPendingGeneration(null);
        soundManager.resume();
        soundManager.play("pattern");
        submitPromptRef
          .current(pendingGeneration.prompt)
          .catch((error) => {
            console.error("Failed to generate learning content:", error);
          });
      }, 0);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [learnModal, messages.length, pendingGeneration]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      activeKeyRef.current &&
      lastMessage?.content?.trim() &&
      lastMessage?.meta?.loading === false
    ) {
      learnCacheRef.current.set(activeKeyRef.current, messages);
      refreshCache((value) => value + 1);
    }
  }, [messages]);

  if (!learnModal) {
    return null;
  }

  const cacheKey = getLearnCacheKey(learnModal.step, learnModal.userLanguage);
  const cachedMessages = learnCacheRef.current.get(cacheKey);
  const visibleMessages =
    cachedMessages || (activeKeyRef.current === cacheKey ? messages : []);

  return (
    <EducationalModal
      isOpen
      onClose={closeLearnModal}
      educationalMessages={visibleMessages}
      educationalContent={educationalContent}
      userLanguage={learnModal.userLanguage}
    />
  );
};

const ActionModalHost = () => {
  const actionModal = useSurfaceModalStore((state) => state.actionModal);
  const closeActionModal = useSurfaceModalStore(
    (state) => state.closeActionModal,
  );
  const [selfPacedInterval, setSelfPacedInterval] = useState(0);

  useEffect(() => {
    if (actionModal?.type === "selfPaced") {
      setSelfPacedInterval(actionModal.interval ?? 0);
    }
  }, [actionModal]);

  if (!actionModal) {
    return null;
  }

  if (actionModal.type === "bitcoin") {
    return (
      <BitcoinModeModal
        isOpen
        onClose={closeActionModal}
        userLanguage={actionModal.userLanguage}
        from="app"
      />
    );
  }

  if (actionModal.type === "selfPaced") {
    return (
      <SelfPacedModal
        isOpen
        onClose={closeActionModal}
        interval={selfPacedInterval}
        setInterval={setSelfPacedInterval}
        userId={actionModal.userId}
        userLanguage={actionModal.userLanguage}
        onSettingsSaved={actionModal.onSettingsSaved}
      />
    );
  }

  if (actionModal.type === "helper") {
    return actionModal.userLanguage !== "compsci-en" ? (
      <KnowledgeLedgerModal
        userLanguage={actionModal.userLanguage}
        isOpen
        onClose={closeActionModal}
        steps={actionModal.steps}
        step={actionModal.step}
      />
    ) : (
      <AlgorithmHelper
        userLanguage={actionModal.userLanguage}
        isOpen
        onClose={closeActionModal}
        steps={actionModal.steps}
        currentStep={actionModal.currentStep}
      />
    );
  }

  return null;
};

const SurfaceModalHost = () => (
  <>
    <LearnModalHost />
    <ActionModalHost />
  </>
);

export default React.memo(SurfaceModalHost);
