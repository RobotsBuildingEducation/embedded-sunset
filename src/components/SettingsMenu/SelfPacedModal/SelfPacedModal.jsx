import React, { useState, useRef, useEffect } from "react";
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
  CircularProgress,
  Box,
  Switch,
  Spinner,
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

// CountdownTimer now supports days along with hours:minutes:seconds and shows a progress bar.
const CountdownTimer = ({ targetTime, initialTime, label, userLanguage }) => {
  const calculateTimeLeft = () => {
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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      if (initialTime) {
        const totalTime = targetTime.getTime() - initialTime.getTime();
        const elapsed = new Date().getTime() - initialTime.getTime();
        let p = (elapsed / totalTime) * 100;
        if (p > 100) p = 100;
        if (p < 0) p = 0;
        setProgress(p);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime, initialTime]);

  const pad = (num) => String(num).padStart(2, "0");

  return (
    <>
      <Text as="span">
        {initialTime && (
          <CircularProgress color="#82EBAC" value={100 - progress} size={8} />
        )}
        &nbsp;{label}
        {timeLeft.days > 0
          ? `${timeLeft.days} ${translation[userLanguage]["modal.selfPace.day"]}${timeLeft.days === 1 ? "" : "s"} & `
          : ""}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </Text>
    </>
  );
};

const SelfPacedModal = ({
  isOpen,
  onClose,
  interval,
  setInterval,
  userId,
  userLanguage,
}) => {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [goalCount, setGoalCount] = useState(0);
  const [inputValue, setInputValue] = useState(interval);
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
    const fetchUserData = async () => {
      const userData = await getUserData(userId);
      console.log("USER DATA....", userData);
      setStreak(userData.streak || 0);
      setStartTime(userData.startTime ? new Date(userData.startTime) : null);
      setEndTime(userData.endTime ? new Date(userData.endTime) : null);
      setInterval(userData.timer);
      setDailyGoals(userData.dailyGoals || 5);
      setGoalCount(userData.goalCount || 0);
      // Initialize dailyProgress from stored data (or default to 0).
      setDailyProgress(userData.dailyProgress || 0);

      console.log("userData", userData);
      if (userData.nextGoalExpiration) {
        setNextGoalExpiration(new Date(userData.nextGoalExpiration));
      }

      setNotificationsEnabled(!!userData.fcmToken);
    };

    if (userId || isOpen) {
      fetchUserData().then(() => {
        setIsDataLoading(false);
      });
    }
  }, [userId, isOpen, setInterval]);

  const handleSliderChange = (val) => {
    setInterval(val);
    setInputValue(val);
    soundManager.init().catch(() => {});
    soundManager.play("sliderTick");
  };

  const handleDailyGoalsChange = (val) => {
    setDailyGoals(val);
    soundManager.init().catch(() => {});
    soundManager.play("sliderTick");
  };

  const debounceTimeout = useRef(null);
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

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
      goalCount
    );
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
    return `${dayLabel} (${signal})`;
  };

  const getMarkColor = (interval) => {
    if (interval === 1440) return "purple.500";
    if (interval === 2880) return "green.500";
    if (interval === 4320) return "blue.500";
    return "gray.500";
  };

  const handleToggleNotifications = async () => {
    soundManager.init().catch(() => {});
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
          "No FCM token available. Make sure notifications are enabled."
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
        }
      );

      const data = await response.json();
      console.log("Server response:", data);
    } catch (error) {
      console.error("Error scheduling push notification:", error);
    }
  };

  console.log("messaging from modal", messaging);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {translation[userLanguage]["modal.title.selfPace"]}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="left"
            >
              <Text width="100%" mb={3}>
                {
                  translation[userLanguage][
                    "modal.selfPace.notificationDescription"
                  ]
                }
              </Text>

              <Text>
                {!messaging
                  ? translation[userLanguage][
                      "modal.selfPace.notificationsUnavailable"
                    ]
                  : null}
              </Text>
              <Text fontSize="sm" mb={2}>
                {notificationsEnabled
                  ? translation[userLanguage].notificationsEnabled
                  : translation[userLanguage].notificationsDisabled}
              </Text>

              {isDataLoading ? (
                <Spinner />
              ) : (
                <Switch
                  isChecked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                  size="lg"
                  colorScheme="green"
                  disabled={!messaging}
                />
              )}
            </Box>{" "}
            <br />
            {localStorage.getItem("local_nsec") ===
            "nsec1scxshk3tw8svuqmt676mnjqn4zsuskgmjzgy9j5kcc94jdj072jsud8gnz" ? (
              <>
                <Button onClick={handlePushNotification} colorScheme="blue">
                  Demo phone notification
                </Button>
                <br />
                <br />
              </>
            ) : null}
            <Text fontSize="xs">
              {translation[userLanguage]["modal.selfPace.instruction"]}
            </Text>
            <Slider
              aria-label="slider-days"
              value={interval}
              min={1440}
              max={4320}
              step={1440}
              onChange={handleSliderChange}
            >
              <SliderTrack bg="whiteAlpha.300" h={3} borderRadius="full">
                <SliderFilledTrack bg="linear-gradient(90deg, #00CED1, #4169E1)" />
              </SliderTrack>
              <SliderThumb boxSize={6} bg="cyan.400" />
            </Slider>
            <Text mt={2} color={getMarkColor(interval)}>
              <b>{getMarkLabel(interval)}</b>
            </Text>
            {/* Render the streak timer countdown only if endTime is defined */}
            {endTime && (
              <Text mt={2} fontSize="sm">
                <CountdownTimer
                  userLanguage={userLanguage}
                  targetTime={endTime}
                  initialTime={startTime}
                  label={translation[userLanguage]["countdown.streakTimeLeft"]}
                />
              </Text>
            )}
            <br />
            <br />
            <Text fontSize="xs">
              {" "}
              {translation[userLanguage]["modal.dailyGoal.instruction"]}
            </Text>
            <Slider
              aria-label="slider-daily-goals"
              value={dailyGoals}
              min={1}
              max={20}
              step={1}
              onChange={handleDailyGoalsChange}
              mt={2}
            >
              <SliderTrack bg="whiteAlpha.300" h={3} borderRadius="full">
                <SliderFilledTrack bg="linear-gradient(90deg, #00CED1, #4169E1)" />
              </SliderTrack>
              <SliderThumb boxSize={6} bg="cyan.400" />
            </Slider>
            <Text mt={2} fontSize="sm" color={"green.500"} fontWeight="bold">
              {translation[userLanguage]["modal.dailyGoal.dailyGoalLabel"]}{" "}
              {dailyGoals}
            </Text>
            {/* Render the daily progress tracking */}
            {/* Render the daily goals timer countdown only if nextGoalExpiration is defined */}
            {nextGoalExpiration && (
              <Text mt={2} fontSize="sm">
                <CountdownTimer
                  userLanguage={userLanguage}
                  label={
                    translation[userLanguage]["countdown.dailyGoalsTimeLeft"]
                  }
                  capIsRound
                  targetTime={nextGoalExpiration}
                  initialTime={
                    new Date(nextGoalExpiration.getTime() - 86400000)
                  }
                />
              </Text>
            )}
            <br />
            <Progress
              value={(dailyProgress / dailyGoals) * 100}
              size="sm"
              mt={2}
              borderRadius="md"
              colorScheme="green"
            />
            <Text mt={1} fontSize="sm">
              {/* {translation[userLanguage]["Progress"]}:  */}
              {dailyProgress}/{dailyGoals}{" "}
              {translation[userLanguage]["questions"]}{" "}
              {translation[userLanguage]["completed"]}
            </Text>
            {/* <Text mt={1} fontSize="sm">
            {goalCount} {translation[userLanguage]["goal"]}
            {goalCount > 1 || goalCount === 0 ? "s" : ""}{" "}
            {translation[userLanguage]["completed"]}!
          </Text> */}
          </>
        </ModalBody>
        <ModalFooter>
          <Button
            variant={"secondary"}
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            mr={3}
            onMouseDown={onClose}
          >
            {translation[userLanguage]["button.close"]}
          </Button>
          <Button
            boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            mr={3}
            onMouseDown={handleSave}
          >
            {translation[userLanguage]["button.save"]}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelfPacedModal;
