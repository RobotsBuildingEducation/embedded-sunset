import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  IconButton,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import { LuPuzzle } from "react-icons/lu";
import { getOnboardingStep } from "../../utility/nosql";
import { Onboarding } from "../../Onboarding";

const TOTAL_STEPS = 6;

export const OnboardingDrawer = ({
  userLanguage,
  setUserLanguage,
  setCurrentStep,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [step, setStep] = useState(null);

  useEffect(() => {
    const npub = localStorage.getItem("local_npub");
    if (npub) {
      getOnboardingStep(npub).then((s) => setStep(s));
    }
  }, []);

  const remaining =
    typeof step === "number"
      ? Math.max(TOTAL_STEPS - step, 0)
      : step && step !== "done"
      ? Math.max(TOTAL_STEPS - parseInt(step, 10), 0)
      : 0;

  if (step === "done" || remaining <= 0) {
    return null;
  }

  return (
    <>
      <IconButton
        icon={<LuPuzzle />}
        position="fixed"
        bottom={4}
        right={4}
        borderRadius="full"
        size="lg"
        onClick={onOpen}
        zIndex={1000}
        aria-label="Onboarding"
      />
      {remaining > 0 && (
        <Badge
          colorScheme="red"
          borderRadius="full"
          position="fixed"
          bottom={4}
          right={4}
          transform="translate(50%, -50%)"
          zIndex={1001}
        >
          {remaining}
        </Badge>
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <Onboarding
              userLanguage={userLanguage}
              setUserLanguage={setUserLanguage}
              setCurrentStep={setCurrentStep}
              step={String(step)}
              setStep={setStep}
              onClose={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OnboardingDrawer;
