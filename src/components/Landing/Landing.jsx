import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Select,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CloudCanvas } from "../../elements/SunsetCanvas";
import { translation } from "../../utility/translation";
import { createUser, updateUserData } from "../../utility/nosql";

export const Landing = ({
  userLanguage,
  setUserLanguage,
  generateNostrKeys,
  setIsSignedIn,
  setView,
  televise,
  handleToggle,
  userName,
  setUserName,
  isCreatingAccount,
  setIsCreatingAccount,
  loadingMessage,
  setLoadingMessage,
}) => {
  const [userName, setUserName] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "createAccount.isCreating"
  );
  const [selectedCourse, setSelectedCourse] = useState(
    localStorage.getItem("userCourse") || "compsci"
  );

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setSelectedCourse(value);
    localStorage.setItem("userCourse", value);
  };

  const toast = useToast();
  const navigate = useNavigate();

  return (
    <VStack spacing={4}>
      <VStack spacing={4} width="95%" maxWidth="600px" mb={4}>
        <HStack spacing={2} alignItems="center">
          <CloudCanvas />
          {isCreatingAccount && (
            <Text fontSize="smaller" backgroundColor="white" p={2}>
              {translation[userLanguage][loadingMessage]}
            </Text>
          )}
        </HStack>
        <Text fontSize="xl">{translation[userLanguage]["landing.title"]}</Text>
        <Text fontSize="sm" mt={-2}>
          {translation[userLanguage]["landing.introduction"]}
        </Text>
      </VStack>

      <Text fontSize="md">
        <b>{translation[userLanguage]["createAccount.instructions"]}</b>
      </Text>

      <Input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder={
          translation[userLanguage]["createAccount.input.placeholder"]
        }
        maxWidth={300}
        backgroundColor="white"
        boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
      />

      <Select
        value={selectedCourse}
        onChange={handleCourseChange}
        maxWidth={300}
        backgroundColor="white"
        boxShadow="0.5px 0.5px 1px rgba(0,0,0,0.75)"
      >
        <option value="compsci">
          {translation[userLanguage]["course.compsci"]}
        </option>
        <option value="maya">
          {translation[userLanguage]["course.maya"]}
        </option>
        <option value="civics">
          {translation[userLanguage]["course.civics"]}
        </option>
      </Select>

      <HStack spacing={4}>
        <Button
          onMouseDown={televise}
          isDisabled={userName.length < 2}
          colorScheme="purple"
          variant="outline"
        >
          {translation[userLanguage]["landing.button.telemetry"]}
        </Button>
        <Button
          onMouseDown={() => setView("signIn")}
          colorScheme="pink"
          variant="outline"
          bg="pink.50"
        >
          {translation[userLanguage]["landing.button.signIn"]}
        </Button>
      </HStack>

      <FormControl display="flex" alignItems="center" mt={4}>
        <FormLabel mb="0">
          {userLanguage.includes("en") ? "English" : "Español"}
        </FormLabel>
        <Switch
          colorScheme="pink"
          isChecked={userLanguage === "es"}
          onChange={handleToggle}
        />
      </FormControl>

      <Button variant="ghost" onMouseDown={() => navigate("/about")}>
        {translation[userLanguage]["button.about"]}
      </Button>
    </VStack>
  );
};
