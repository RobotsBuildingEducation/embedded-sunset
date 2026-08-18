import React from "react";
import PreConversation from "./PreConversation";

const ConversationReview = ({
  userLanguage,
  steps,
  onSubmit,
  step,
  onBuildReady,
}) => {
  return (
    <PreConversation
      steps={steps}
      step={step}
      userLanguage={userLanguage}
      onSubmit={onSubmit}
      onBuildReady={onBuildReady}
    />
  );
};

export default React.memo(ConversationReview);
