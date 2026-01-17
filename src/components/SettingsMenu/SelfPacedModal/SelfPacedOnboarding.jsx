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
  Stack,
  Progress,
  CircularProgress,
  Box,
  Spinner,
  Switch,
} from "@chakra-ui/react";
import {
  getUserData,
  incrementUserOnboardingStep,
  updateUserData,
} from "../../../utility/nosql";
import { translation } from "../../../utility/translation";
import { useNavigate } from "react-router-dom";
import {
  database,
  // messaging
} from "../../../database/firebaseResources";
// import { deleteToken, getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarStyles.css";
import { FaFireAlt } from "react-icons/fa";
import { RiSlowDownLine, RiSpeedUpLine } from "react-icons/ri";
import { COURSE_LESSON_COUNT } from "../../../utility/nosql";
import { soundManager } from "../../../utility/soundManager";
import { triggerHaptic } from "tactus";

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
  );
};

const SelfPacedOnboarding = ({
  interval,
  setInterval,
  userId,
  userLanguage,
  setCurrentStep,
}) => {
  const navigate = useNavigate();
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
      setStreak(userData.streak || 0);
      setStartTime(userData.startTime ? new Date(userData.startTime) : null);
      setEndTime(userData.endTime ? new Date(userData.endTime) : null);
      setInterval(userData.timer);
      setDailyGoals(userData.dailyGoals || 5);
      setGoalCount(userData.goalCount || 0);
      setDailyProgress(userData.dailyProgress || 0);

      if (userData.nextGoalExpiration) {
        setNextGoalExpiration(new Date(userData.nextGoalExpiration));
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, setInterval]);

  const handleIntervalChange = (value) => {
    const nextValue = Number(value);
    setInterval(nextValue);
    setInputValue(nextValue);
    triggerHaptic();
    soundManager.init().catch(() => {});
    soundManager.play("select");
  };

  const handleDailyGoalsChange = (val) => {
    setDailyGoals(val);
    triggerHaptic();
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

    Promise.all([
      updateUserData(
        userId,
        interval,
        streak,
        currentTime,
        newEndTime,
        dailyGoals,
        newNextGoalExpiration,
        dailyProgress,
        goalCount
      ),
      incrementUserOnboardingStep(userId),
    ]).catch(console.error);

    setCurrentStep(2);
    navigate("/q/2");
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

  const getMarkColor = (val) => {
    if (val === 1440) return "purple.500";
    if (val === 2880) return "green.500";
    if (val === 4320) return "blue.500";
    return "gray.500";
  };

  //   const handleToggleNotifications = async () => {
  //     const userDocRef = doc(database, "users", userId);

  //     if (!notificationsEnabled) {
  //       // Enable notifications: request permission and get token
  //       const permission = await Notification.requestPermission();
  //       if (permission === "granted") {
  //         try {
  //           const token = await getToken(messaging, {
  //             vapidKey:
  //               "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
  //           });
  //           console.log("FCM token retrieved:", token);
  //           // Save the token in Firestore
  //           await updateDoc(userDocRef, { fcmToken: token });
  //           setNotificationsEnabled(true);
  //         } catch (error) {
  //           console.error("Error retrieving FCM token:", error);
  //           setNotificationsEnabled(false);
  //         }
  //       } else {
  //         console.log("Notification permission not granted.");
  //         setNotificationsEnabled(false);
  //       }
  //     } else {
  //       // Disable notifications: delete the token and update Firestore
  //       try {
  //         const currentToken = await getToken(messaging, {
  //           vapidKey:
  //             "BPLqRrVM3iUvh90ENNZJbJA3FoRkvMql6iWtC4MJaHzhyz9uRTEitwEax9ot05_b6TPoCVnD-tlQtbeZFn1Z_Bg",
  //         });
  //         if (currentToken) {
  //           const success = await deleteToken(messaging, currentToken);
  //           if (success) {
  //             console.log("FCM token deleted successfully.");
  //           } else {
  //             console.error("Failed to delete token.");
  //           }
  //         }
  //         // Remove token from Firestore
  //         await updateDoc(userDocRef, { fcmToken: null });
  //         setNotificationsEnabled(false);
  //       } catch (error) {
  //         console.error("Error deleting FCM token:", error);
  //       }
  //     }
  //   };

  // window.alert(interval);

  const setPresetGoal = (event, goalType) => {
    if (goalType === "week") {
      setDailyGoals(16);
      setInterval(1440);
    } else {
      //month
      const dailyTarget = Math.ceil(COURSE_LESSON_COUNT / 30);
      setDailyGoals(dailyTarget);
      setInterval(1440);
    }
  };

  const estimatedDays =
    dailyGoals > 0 ? Math.ceil(COURSE_LESSON_COUNT / dailyGoals) : 0;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Button
        fontSize="sm"
        textAlign="left"
        mb={4}
        onMouseDown={(event) => {
          triggerHaptic();
          setPresetGoal(event, "week");
        }}
        colorScheme="orange"
        variant={"outline"}
        width="100%"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            triggerHaptic();
            setPresetGoal(e, "week"); // Select the option on Enter or Space key
          }
        }}
      >
        <FaFireAlt color="Tomato" /> &nbsp;{" "}
        {translation[userLanguage]["modal.selfPace.weekPlan"]}&nbsp;&nbsp;&nbsp;
      </Button>

      <Button
        fontSize="sm"
        textAlign="left"
        mb={10}
        onMouseDown={(event) => {
          triggerHaptic();
          setPresetGoal(event, "month");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            triggerHaptic();
            setPresetGoal(e, "month"); // Select the option on Enter or Space key
          }
        }}
        colorScheme="yellow"
        variant={"outline"}
        width="100%"
      >
        <RiSpeedUpLine />
        &nbsp; {translation[userLanguage]["modal.selfPace.monthPlan"]}
      </Button>

      <Text fontSize="xs" width="70%" mb={2} color="gray.600">
        {translation[userLanguage]["modal.selfPace.instruction"]}
      </Text>

      <Stack direction="row" spacing={3} flexWrap="wrap">
        {[1440, 2880, 4320].map((option) => {
          const isSelected = interval === option;
          return (
            <Button
              key={option}
              type="button"
              variant="outline"
              data-sound-ignore-select="true"
              aria-pressed={isSelected}
              borderColor={isSelected ? "teal.400" : "gray.200"}
              bg={isSelected ? "teal.50" : "transparent"}
              boxShadow={
                isSelected
                  ? "0 0 0 2px rgba(56, 178, 172, 0.2)"
                  : "none"
              }
              onMouseDown={() => {
                triggerHaptic();
                handleIntervalChange(String(option));
              }}
              _hover={{
                borderColor: "teal.300",
              }}
            >
              <Text color={getMarkColor(option)} fontWeight="semibold">
                {getMarkLabel(option)}
              </Text>
            </Button>
          );
        })}
      </Stack>

      <br />
      <br />
      <Text fontSize="xs" width="70%" mb={2} color="gray.600">
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
        <SliderTrack h={3} borderRadius="full">
          <SliderFilledTrack bg="linear-gradient(90deg, #00CED1, #4169E1)" />
        </SliderTrack>
        <SliderThumb boxSize={6} bg="cyan.400" />
      </Slider>
      <Text mt={2} fontSize="sm" color="green.500" fontWeight="bold">
        {translation[userLanguage]["modal.dailyGoal.dailyGoalLabel"]}{" "}
        {dailyGoals}
      </Text>

      <br />
      {dailyGoals > 0 && (
        <Text mt={1} fontSize="sm" color="gray.600" mb={2}>
          {translation[userLanguage]["modal.dailyGoal.estimate"]
            .replace("{days}", estimatedDays)
            .replace("{plural}", estimatedDays > 1 ? "s" : "")}
        </Text>
      )}

      <Box mt={2} borderRadius="md" overflow="hidden" width="100%">
        <Calendar
          locale={userLanguage}
          value={estimatedDate}
          tileDisabled={({ date }) =>
            date.toDateString() !== estimatedDate.toDateString()
          }
          formatShortWeekday={(locale, date) =>
            date.toLocaleDateString(userLanguage, { weekday: "narrow" })
          }
          nextLabel={null}
          prevLabel={null}
          next2Label={null}
          prev2Label={null}
          // view="month"
          // view="month"
          navigationLabel={null}
          onViewChange={() => {}}
        />
      </Box>

      {/* <Box width="100%" textAlign={"left"} mb={2}>
        {endTime ? (
          <Text mt={2} fontSize="sm">
            <CountdownTimer
              userLanguage={userLanguage}
              targetTime={endTime}
              initialTime={startTime}
              label={translation[userLanguage]["countdown.streakTimeLeft"]}
            />
          </Text>
        ) : (
          <Spinner />
        )}
      </Box>
      <Box width="100%" textAlign={"left"}>
        {nextGoalExpiration ? (
          <Text mt={2} fontSize="sm">
            <CountdownTimer
              userLanguage={userLanguage}
              label={translation[userLanguage]["countdown.dailyGoalsTimeLeft"]}
              targetTime={nextGoalExpiration}
              initialTime={new Date(nextGoalExpiration.getTime() - 86400000)}
            />
          </Text>
        ) : (
          <Spinner />
        )}
      </Box> */}
      {/* <br />
      <br />
      <Box mt={4} display="flex" flexDirection="column" alignItems="center">
        <Text fontSize="sm" mb={2}>
          {notificationsEnabled
            ? "Notifications Enabled"
            : "Notifications Disabled"}
        </Text>
        <Switch
          isChecked={notificationsEnabled}
          onChange={handleToggleNotifications}
          size="lg"
          colorScheme="green"
        />
      </Box> */}

      <br />
      <br />

      <Button
        boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        mr={3}
        onMouseDown={() => {
          triggerHaptic();
          handleSave();
        }}
      >
        {translation[userLanguage]["button.save"]}
      </Button>
    </Box>
  );
};

export default SelfPacedOnboarding;
