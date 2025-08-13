import React, { useEffect, useState } from "react";
import { Step } from "../../App";
import { steps } from "../../utility/content";
import { useSharedNostr } from "../../hooks/useNOSTR";

const GLOBAL_NSEC = "nsec1lh5zsdqguk2qf8xsua9dvnu74a9vmlpes3g74jkm4j4vadlulf9qq28j3p";

const DemoStep = ({ userLanguage }) => {
  const { auth } = useSharedNostr();
  const [allowPosts, setAllowPosts] = useState(true);

  useEffect(() => {
    auth(GLOBAL_NSEC);
  }, [auth]);

  return (
    <Step
      currentStep={4}
      userLanguage={userLanguage}
      setUserLanguage={() => {}}
      postNostrContent={() => {}}
      assignExistingBadgeToNpub={() => {}}
      emailStep={steps[userLanguage][4]}
      allowPosts={allowPosts}
      setAllowPosts={setAllowPosts}
      hasSubmittedPasscode={true}
      setCurrentStep={() => {}}
      navigateWithTransition={() => {}}
      setTransitionStats={() => {}}
      incorrectAttempts={0}
      setIncorrectAttempts={() => {}}
      lectureNextPath={null}
      setLectureNextPath={() => {}}
      lectureNextStep={null}
      setLectureNextStep={() => {}}
    />
  );
};

export default DemoStep;
