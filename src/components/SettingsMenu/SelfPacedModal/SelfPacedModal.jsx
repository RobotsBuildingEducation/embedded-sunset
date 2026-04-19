import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress,
  Box,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react";
import { getUserData, updateUserData } from "../../../utility/nosql";
import { translation } from "../../../utility/translation";
import {
  appCheck,
  database,
  messaging,
} from "../../../database/firebaseResources";
import { deleteToken, getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { getToken as getAppCheckToken } from "firebase/app-check";
import { soundManager } from "../../../utility/soundManager";

// CountdownTimer keeps a stable footprint even before saved dates load.
const CountdownTimer = ({
  targetTime,
  label,
  userLanguage,
  isLoading = false,
  loadingLabel = "Loading timer",
  inactiveLabel = "Not started yet",
}) => {
  const hasTargetTime =
    targetTime instanceof Date && !Number.isNaN(targetTime.getTime());

  const calculateTimeLeft = () => {
    if (!hasTargetTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const difference = targetTime.getTime() - new Date().getTime();
    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      return { days, hours, minutes, seconds };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!hasTargetTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return undefined;
    }

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [hasTargetTime, targetTime]);

  const pad = (num) => String(num).padStart(2, "0");
  const formattedTime = isLoading
    ? "--:--:--"
    : hasTargetTime
      ? `${
          timeLeft.days > 0
            ? `${timeLeft.days} ${translation[userLanguage]["modal.selfPace.day"]}${timeLeft.days === 1 ? "" : "s"}  `
            : ""
        }${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
      : "--:--:--";
  const supportingLabel = isLoading ? loadingLabel : inactiveLabel;
  const showSupportingLabel = isLoading || !hasTargetTime;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      width="100%"
      minH="52px"
      borderRadius="18px"
      bg="appSurfaceInset"
      border="1px solid var(--chakra-colors-appBorder)"
      px={4}
      py={3}
    >
      <Text fontSize="xs" color="appTextMuted" lineHeight="1.2">
        {label}
      </Text>
      <Box textAlign="right">
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={hasTargetTime && !isLoading ? "appText" : "appTextMuted"}
          fontFamily='"Fira Code", monospace'
          whiteSpace="nowrap"
        >
          {formattedTime}
        </Text>
        <Text
          fontSize="2xs"
          color="appTextMuted"
          minH="14px"
          lineHeight="14px"
          visibility={showSupportingLabel ? "visible" : "hidden"}
        >
          {supportingLabel}
        </Text>
      </Box>
    </Box>
  );
};

const SelfPacedModal = ({
  isOpen,
  onClose,
  interval,
  setInterval,
  userId,
  userLanguage,
  onSettingsSaved = () => {},
}) => {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [goalCount, setGoalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  // dailyGoals: number of questions the user wants to complete per day.
  const [dailyGoals, setDailyGoals] = useState(5);
  // dailyProgress: tracks the number of questions completed today.
  const [dailyProgress, setDailyProgress] = useState(0);
  // nextGoalExpiration: when the current 24-hour period expires.
  const [nextGoalExpiration, setNextGoalExpiration] = useState(null);

  // On mount, fetch the stored user data and update our state.
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      const userData = await getUserData(userId);

      if (!isMounted) {
        return;
      }

      setStreak(userData.streak || 0);
      setStartTime(userData.startTime ? new Date(userData.startTime) : null);
      setEndTime(userData.endTime ? new Date(userData.endTime) : null);
      setInterval(userData.timer);
      setDailyGoals(userData.dailyGoals ?? 5);
      setGoalCount(userData.goalCount ?? 0);
      // Initialize dailyProgress from stored data (or default to 0).
      setDailyProgress(userData.dailyProgress ?? 0);

      if (userData.nextGoalExpiration) {
        setNextGoalExpiration(new Date(userData.nextGoalExpiration));
      }

      setNotificationsEnabled(!!userData.fcmToken);
    };

    if (userId && isOpen) {
      setIsDataLoading(true);
      fetchUserData().finally(() => {
        if (isMounted) {
          setIsDataLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [userId, isOpen, setInterval]);

  const handleIntervalChange = (value) => {
    const nextValue = Number(value);
    setInterval(nextValue);
    soundManager.resume();
    soundManager.play("select");
  };

  const handleDailyGoalsChange = (val) => {
    setDailyGoals(val);
    soundManager.resume();
    soundManager.play("sliderTick");
  };

  const handleSave = async () => {
    const currentTime = new Date();
    // Calculate new end time based on the selected interval (in minutes)
    const newEndTime = new Date(currentTime.getTime() + interval * 60000);
    // The daily goal expiration is always 24 hours from now.
    const newNextGoalExpiration = new Date(currentTime.getTime() + 86400000);
    setStartTime(currentTime);
    setEndTime(newEndTime);
    setNextGoalExpiration(newNextGoalExpiration);

    // Update user data with timer, streak, dailyGoals, and nextGoalExpiration.
    // Note: updateUserData should also be updated to handle dailyProgress if needed.
    await updateUserData(
      userId,
      interval,
      streak,
      currentTime,
      newEndTime,
      dailyGoals,
      newNextGoalExpiration,
      dailyProgress, // include dailyProgress in the update
      goalCount,
    );
    onSettingsSaved({
      interval,
      streak,
      startTime: currentTime,
      endTime: newEndTime,
      dailyGoals,
      nextGoalExpiration: newNextGoalExpiration,
      dailyProgress,
      goalCount,
    });
    onClose();
  };

  // Build the label for the streak timer slider.
  const getMarkLabel = (val) => {
    let dayLabel, signal;
    if (val === 1440) {
      dayLabel = translation[userLanguage]["modal.selfPace.oneDay"];
      signal =
        translation[userLanguage]["modal.selfPace.signal.grind"] || "Grind";
    } else if (val === 2880) {
      dayLabel = translation[userLanguage]["modal.selfPace.twoDays"];
      signal =
        translation[userLanguage]["modal.selfPace.signal.motivated"] ||
        "Motivated";
    } else if (val === 4320) {
      dayLabel = translation[userLanguage]["modal.selfPace.threeDays"];
      signal =
        translation[userLanguage]["modal.selfPace.signal.casual"] || "Casual";
    } else {
      dayLabel = "";
      signal = "";
    }
    return (
      <div>
        {dayLabel}
        <br />({signal})
      </div>
    );
  };

  const intervalButtonBorder = useColorModeValue(
    "rgba(148, 163, 184, 0.46)",
    "rgba(148, 163, 184, 0.36)",
  );
  const intervalButtonBg = useColorModeValue(
    "rgba(255, 255, 255, 0.92)",
    "rgba(15, 23, 42, 0.9)",
  );
  const selectedIntervalButtonBg = useColorModeValue(
    "rgba(241, 245, 249, 0.98)",
    "rgba(30, 41, 59, 0.98)",
  );
  const selectedIntervalButtonBorder = useColorModeValue(
    "rgba(71, 85, 105, 0.76)",
    "rgba(226, 232, 240, 0.68)",
  );
  const intervalButtonTextColor = useColorModeValue("#0f172a", "#f8fafc");
  const modalShadow = useColorModeValue(
    "0 24px 60px rgba(15, 23, 42, 0.16)",
    "0 28px 70px rgba(2, 6, 23, 0.54)",
  );
  const sectionBg = useColorModeValue(
    "rgba(255, 255, 255, 0.76)",
    "rgba(15, 23, 42, 0.72)",
  );
  const sectionBorder = useColorModeValue(
    "rgba(148, 163, 184, 0.24)",
    "rgba(148, 163, 184, 0.22)",
  );
  const sectionShadow = useColorModeValue(
    "0 12px 24px rgba(15, 23, 42, 0.06)",
    "0 16px 32px rgba(2, 6, 23, 0.28)",
  );
  const sliderTrackBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const isSpanish = userLanguage?.startsWith("es");
  const modalCopy = {
    notificationsTitle: isSpanish ? "Recordatorios" : "Reminders",
    streakTitle: isSpanish ? "Ventana de racha" : "Streak window",
    dailyGoalTitle: translation[userLanguage]["dailyGoal"] || "Daily goal",
    progressTitle: isSpanish ? "Progreso de hoy" : "Today's progress",
    inactiveTimer: isSpanish ? "Aun no inicia" : "Not started yet",
    settingsLoading: isSpanish
      ? "Cargando ajustes guardados"
      : "Loading saved settings",
    timerLoading: isSpanish ? "Cargando temporizador" : "Loading timer",
    notificationLoading: isSpanish
      ? "Revisando recordatorios"
      : "Checking reminder status",
    valueLoading: isSpanish ? "..." : "...",
  };
  const dailyProgressPercent =
    dailyGoals > 0 ? Math.min((dailyProgress / dailyGoals) * 100, 100) : 0;

  const handleToggleNotifications = async () => {
    soundManager.resume();
    soundManager.play("modeSwitch");
    const userDocRef = doc(database, "users", userId);

    if (!notificationsEnabled) {
      // Enable notifications: request permission and get token

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        try {
          setNotificationsEnabled(true);
          const token = await getToken(messaging, {
            vapidKey:
              "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
          });
          console.log("FCM token retrieved:", token);
          // Save the token in Firestore
          await updateDoc(userDocRef, { fcmToken: token });
        } catch (error) {
          console.error("Error retrieving FCM token:", error);
          setNotificationsEnabled(false);
        }
      } else {
        console.log("Notification permission not granted.");
        setNotificationsEnabled(false);
      }
    } else {
      // Disable notifications: delete the token and update Firestore
      try {
        const currentToken = await getToken(messaging, {
          vapidKey:
            "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
        });
        if (currentToken) {
          const success = await deleteToken(messaging, currentToken);
          if (success) {
            console.log("FCM token deleted successfully.");
          } else {
            console.error("Failed to delete token.");
          }
        }
        // Remove token from Firestore
        await updateDoc(userDocRef, { fcmToken: null });
        setNotificationsEnabled(false);
      } catch (error) {
        console.error("Error deleting FCM token:", error);
      }
    }
  };

  const handlePushNotification = async () => {
    try {
      // Retrieve the device FCM token (ensure notifications are enabled)
      const token = await getToken(messaging, {
        vapidKey:
          "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
      });
      if (!token) {
        console.error(
          "No FCM token available. Make sure notifications are enabled.",
        );
        return;
      }
      console.log("FCM token:", token);
      const appCheckTokenResult = await getAppCheckToken(appCheck);
      const appCheckToken = appCheckTokenResult.token;

      // Call your backend endpoint to schedule the push notification
      const response = await fetch(
        "https://us-central1-test-data-895e2.cloudfunctions.net/app/sendTestPush",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Optionally include the App Check token if required
            "X-Firebase-AppCheck": appCheckToken,
          },
          body: JSON.stringify({ token }),
        },
      );

      const data = await response.json();
      console.log("Server response:", data);
    } catch (error) {
      console.error("Error scheduling push notification:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="appOverlay" backdropFilter="blur(8px)" />
      <ModalContent
        bg="appSurfaceElevated"
        color="appText"
        borderRadius="32px"
        border="1px solid var(--chakra-colors-appBorder)"
        boxShadow={modalShadow}
        overflow="hidden"
        maxH="92dvh"
      >
        <ModalHeader px={6} pt={6} pb={3}>
          <Text fontSize="2xl" fontWeight="bold">
            {translation[userLanguage]["modal.title.selfPace"]}
          </Text>
          <Text
            mt={1}
            fontSize="xs"
            color="appTextMuted"
            minH="16px"
            lineHeight="16px"
            visibility={isDataLoading ? "visible" : "hidden"}
          >
            {modalCopy.settingsLoading}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={6} py={2} overflowY="auto">
          <Box display="flex" flexDirection="column" gap={4}>
            <Box
              bg={sectionBg}
              border={`1px solid ${sectionBorder}`}
              borderRadius="24px"
              boxShadow={sectionShadow}
              p={4}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={4}
              >
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold">
                    {modalCopy.notificationsTitle}
                  </Text>
                  <Text mt={1} fontSize="xs" color="appTextMuted">
                    {messaging
                      ? translation[userLanguage][
                          "modal.selfPace.notificationDescription"
                        ]
                      : translation[userLanguage][
                          "modal.selfPace.notificationsUnavailable"
                        ]}
                  </Text>
                  <Text mt={2} fontSize="xs" color="appTextMuted">
                    {isDataLoading
                      ? modalCopy.notificationLoading
                      : notificationsEnabled
                        ? translation[userLanguage].notificationsEnabled
                        : translation[userLanguage].notificationsDisabled}
                  </Text>
                </Box>
                <Switch
                  isChecked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                  size="lg"
                  colorScheme="green"
                  disabled={!messaging || isDataLoading}
                  aria-busy={isDataLoading}
                  flexShrink={0}
                />
              </Box>

              {localStorage.getItem("local_nsec") ===
              "nsec1scxshk3tw8svuqmt676mnjqn4zsuskgmjzgy9j5kcc94jdj072jsud8gnz" ? (
                <Button
                  onClick={handlePushNotification}
                  colorScheme="blue"
                  size="sm"
                  mt={4}
                  width="100%"
                >
                  Demo phone notification
                </Button>
              ) : null}
            </Box>

            <Box
              bg={sectionBg}
              border={`1px solid ${sectionBorder}`}
              borderRadius="24px"
              boxShadow={sectionShadow}
              p={4}
            >
              <Text fontSize="sm" fontWeight="bold" textAlign="left">
                {modalCopy.streakTitle}
              </Text>
              <Text mt={1} fontSize="xs" color="appTextMuted" lineHeight="1.7">
                {translation[userLanguage]["modal.selfPace.instruction"]}
              </Text>

              <Box
                width="100%"
                display="flex"
                flexDirection={{ base: "column", md: "row" }}
                flexWrap="wrap"
                justifyContent="center"
                alignItems="center"
                gap={3}
                mt={4}
              >
                {[1440, 2880, 4320].map((option) => {
                  const isSelected = interval === option;
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant="outline"
                      data-sound-ignore-select="true"
                      aria-pressed={isSelected}
                      width={{ base: "100%", md: "auto" }}
                      maxW={{ base: "360px", md: "none" }}
                      minW={{ md: "150px" }}
                      minH="56px"
                      px={4}
                      py={3}
                      justifyContent="center"
                      borderColor={
                        isSelected
                          ? selectedIntervalButtonBorder
                          : intervalButtonBorder
                      }
                      bg={
                        isSelected ? selectedIntervalButtonBg : intervalButtonBg
                      }
                      boxShadow={
                        isSelected
                          ? "0 0 0 2px rgba(148, 163, 184, 0.18)"
                          : "none"
                      }
                      onMouseDown={() => handleIntervalChange(String(option))}
                      _hover={{
                        borderColor: selectedIntervalButtonBorder,
                        bg: isSelected
                          ? selectedIntervalButtonBg
                          : "appSurfaceMuted",
                      }}
                    >
                      <Text
                        color={intervalButtonTextColor}
                        fontWeight="semibold"
                        fontSize="sm"
                        textAlign="center"
                        lineHeight="1.35"
                      >
                        {getMarkLabel(option)}
                      </Text>
                    </Button>
                  );
                })}
              </Box>

              <Box mt={4}>
                <CountdownTimer
                  userLanguage={userLanguage}
                  targetTime={endTime}
                  label={translation[userLanguage]["countdown.streakTimeLeft"]}
                  isLoading={isDataLoading}
                  loadingLabel={modalCopy.timerLoading}
                  inactiveLabel={modalCopy.inactiveTimer}
                />
              </Box>
            </Box>

            <Box
              bg={sectionBg}
              border={`1px solid ${sectionBorder}`}
              borderRadius="24px"
              boxShadow={sectionShadow}
              p={4}
            >
              <Box
                display="flex"
                alignItems="baseline"
                justifyContent="space-between"
                gap={4}
              >
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold">
                    {modalCopy.dailyGoalTitle}
                  </Text>
                  <Text
                    mt={1}
                    fontSize="xs"
                    color="appTextMuted"
                    lineHeight="1.7"
                  >
                    {translation[userLanguage]["modal.dailyGoal.instruction"]}
                  </Text>
                </Box>
                <Text
                  fontSize="lg"
                  color="green.500"
                  fontWeight="bold"
                  whiteSpace="nowrap"
                >
                  {isDataLoading ? modalCopy.valueLoading : dailyGoals}
                </Text>
              </Box>

              <Slider
                aria-label="slider-daily-goals"
                value={dailyGoals}
                min={1}
                max={20}
                step={1}
                onChange={handleDailyGoalsChange}
                mt={4}
              >
                <SliderTrack h={3} borderRadius="full" bg={sliderTrackBg}>
                  <SliderFilledTrack bg="linear-gradient(90deg, #00CED1, #4169E1)" />
                </SliderTrack>
                <SliderThumb boxSize={6} bg="cyan.400" />
              </Slider>

              <Box mt={4}>
                <CountdownTimer
                  userLanguage={userLanguage}
                  label={
                    translation[userLanguage]["countdown.dailyGoalsTimeLeft"]
                  }
                  targetTime={nextGoalExpiration}
                  isLoading={isDataLoading}
                  loadingLabel={modalCopy.timerLoading}
                  inactiveLabel={modalCopy.inactiveTimer}
                />
              </Box>

              <Box mt={4}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Text fontSize="xs" color="appTextMuted">
                    {modalCopy.progressTitle}
                  </Text>
                  <Text fontSize="xs" color="appTextMuted">
                    {isDataLoading ? modalCopy.valueLoading : dailyProgress}/
                    {isDataLoading ? modalCopy.valueLoading : dailyGoals}{" "}
                    {translation[userLanguage]["questions"]}
                  </Text>
                </Box>
                <Progress
                  value={dailyProgressPercent}
                  size="sm"
                  borderRadius="full"
                  colorScheme="green"
                  bg="appSurfaceInset"
                />
              </Box>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter px={6} py={5} justifyContent="flex-end" gap={3}>
          <Button
            variant="secondary"
            onMouseDown={onClose}
            data-sound-close="true"
          >
            {translation[userLanguage]["button.close"]}
          </Button>
          <Button onMouseDown={handleSave}>
            {translation[userLanguage]["button.save"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelfPacedModal;
