import React, { useEffect, useState } from "react";
import EducationalModal from "./LearnModal/EducationalModal";
import BitcoinModeModal from "./SettingsMenu/BitcoinModeModal/BitcoinModeModal";
import SelfPacedModal from "./SettingsMenu/SelfPacedModal/SelfPacedModal";
import KnowledgeLedgerModal from "./KnowledgeLedgerModal/KnowledgeLedgerModal";
import StudyGuideModal from "./StudyGuideModal/StudyGuideModal";
import { AlgorithmHelper } from "./AlgorithmHelper/AlgorithmHelper";
import { useSurfaceModalStore } from "../useSurfaceModalStore";

const LearnModalHost = () => {
  const learnModal = useSurfaceModalStore((state) => state.learnModal);
  const closeLearnModal = useSurfaceModalStore((state) => state.closeLearnModal);

  if (!learnModal) {
    return null;
  }

  return (
    <EducationalModal
      key={learnModal.openedAt}
      isOpen
      onClose={closeLearnModal}
      step={learnModal.step}
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
        isOpen
        onClose={closeActionModal}
        steps={actionModal.steps}
        step={actionModal.step}
        userLanguage={actionModal.userLanguage}
      />
    ) : (
      <AlgorithmHelper
        isOpen
        onClose={closeActionModal}
        steps={actionModal.steps}
        currentStep={actionModal.currentStep}
        userLanguage={actionModal.userLanguage}
      />
    );
  }

  if (actionModal.type === "studyGuide") {
    return (
      <StudyGuideModal
        isOpen
        onClose={closeActionModal}
        content={actionModal.content}
        userLanguage={actionModal.userLanguage}
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
