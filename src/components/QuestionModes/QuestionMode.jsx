import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Code,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { CodeEditor } from "../CodeEditor/CodeEditor";
import LiveReactEditorModal from "../LiveCodeEditor/LiveCodeEditor";
import { getQuestionType, scrambleArray } from "../../utility/questionTypes";

const copy = {
  en: {
    blank: "Blank",
    choose: "Choose an answer",
    tests: "Success checks",
    pair: "Matching definition",
  },
  es: {
    blank: "Espacio",
    choose: "Elige una respuesta",
    tests: "Criterios de éxito",
    pair: "Definición correspondiente",
  },
};

const localeFor = (userLanguage) => (userLanguage === "es" ? "es" : "en");

export const CodePanel = ({ code, selectedLines = [], onLineClick }) => {
  const panelBg = useColorModeValue("gray.900", "#07101f");
  const lineHover = useColorModeValue("whiteAlpha.200", "whiteAlpha.200");
  return (
    <Box
      width="100%"
      bg={panelBg}
      color="gray.100"
      borderRadius="2xl"
      py={4}
      overflowX="auto"
      boxShadow="lg"
      fontFamily="mono"
      fontSize="sm"
    >
      {String(code || "")
        .split("\n")
        .map((line, index) => {
          const lineNumber = index + 1;
          const selected = selectedLines.includes(lineNumber);
          return (
            <Box
              as={onLineClick ? "button" : "div"}
              type={onLineClick ? "button" : undefined}
              key={`${lineNumber}-${line}`}
              display="grid"
              gridTemplateColumns="44px minmax(0, 1fr)"
              width="100%"
              textAlign="left"
              bg={selected ? "pink.700" : "transparent"}
              _hover={
                onLineClick ? { bg: selected ? "pink.700" : lineHover } : {}
              }
              onClick={onLineClick ? () => onLineClick(lineNumber) : undefined}
              aria-pressed={onLineClick ? selected : undefined}
            >
              <Text
                as="span"
                color="gray.500"
                textAlign="right"
                pr={3}
                userSelect="none"
              >
                {lineNumber}
              </Text>
              <Text
                as="span"
                whiteSpace="pre-wrap"
                overflowWrap="anywhere"
                pr={4}
              >
                {line || " "}
              </Text>
            </Box>
          );
        })}
    </Box>
  );
};

const OptionCards = ({ options, value, onChange, code = false }) => (
  <VStack width="100%" align="stretch" spacing={3}>
    {(options || []).map((option, index) => (
      <Button
        key={`${index}-${option}`}
        variant="unstyled"
        height="auto"
        minH="64px"
        p={4}
        whiteSpace="pre-wrap"
        textAlign="left"
        justifyContent="flex-start"
        borderWidth="2px"
        borderColor={value === option ? "pink.300" : "appBorder"}
        bg={value === option ? "appSurfaceElevated" : "appSurface"}
        borderRadius="2xl"
        boxShadow="sm"
        onClick={() => onChange(option)}
      >
        {code ? <Code whiteSpace="pre-wrap">{option}</Code> : option}
      </Button>
    ))}
  </VStack>
);

const FillCodeBlanks = ({ question, value, onChange, labels }) => {
  const blanks = question.blanks || [];
  const template = String(question.template || "");
  const parts = template.split(/(\{\{[^}]+\}\})/g);
  return (
    <VStack width="100%" align="stretch" spacing={4}>
      <Box
        bg="appCodeBg"
        color="appCodeColor"
        borderRadius="2xl"
        p={4}
        fontFamily="mono"
        whiteSpace="pre-wrap"
        boxShadow="sm"
      >
        {parts.map((part, index) => {
          const match = part.match(/^\{\{([^}]+)\}\}$/);
          if (!match)
            return <React.Fragment key={index}>{part}</React.Fragment>;
          const key = match[1];
          return (
            <Input
              key={`${key}-${index}`}
              aria-label={`${labels.blank}: ${key}`}
              value={value?.[key] || ""}
              onChange={(event) =>
                onChange({ ...(value || {}), [key]: event.target.value })
              }
              display="inline-block"
              width={`${Math.max(80, (value?.[key]?.length || key.length) * 12)}px`}
              height="32px"
              mx={1}
              px={2}
              bg="appSurface"
              borderColor="pink.300"
              fontFamily="mono"
            />
          );
        })}
      </Box>
      {blanks.map((blank) => (
        <Text key={blank.key} fontSize="sm" color="appTextMuted">
          {blank.label || blank.key}: {blank.hint}
        </Text>
      ))}
    </VStack>
  );
};

const ReorderLines = ({ question, value, onChange }) => {
  const lines =
    Array.isArray(value) && value.length > 0 ? value : question.lines || [];
  const move = (index, offset) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= lines.length) return;
    const next = [...lines];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };
  return (
    <VStack width="100%" align="stretch" spacing={3}>
      {lines.map((line, index) => (
        <HStack
          key={`${index}-${line}`}
          bg="appSurface"
          borderWidth="1.5px"
          borderColor="appBorder"
          borderRadius="2xl"
          minHeight="72px"
          p={{ base: 3, md: 4 }}
          spacing={3}
          boxShadow="sm"
          _hover={{ borderColor: "pink.300", boxShadow: "md" }}
          transition="all 0.2s ease"
        >
          <Badge
            colorScheme="pink"
            borderRadius="full"
            px={2.5}
            py={1}
            fontSize="xs"
            fontWeight="bold"
          >
            {index + 1}
          </Badge>
          <Code
            flex="1"
            p={3}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            whiteSpace="pre-wrap"
            fontSize="sm"
            bg="appCodeBg"
            color="appCodeColor"
          >
            {line}
          </Code>
          <VStack spacing={1.5} justify="center" flexShrink={0}>
            <Button
              type="button"
              size="sm"
              width="40px"
              height="34px"
              p={0}
              borderRadius="lg"
              aria-label="Move line up"
              onClick={() => move(index, -1)}
              isDisabled={index === 0}
              colorScheme="pink"
              variant="ghost"
              _hover={{ bg: "pink.50", color: "pink.600" }}
            >
              <ChevronUpIcon boxSize={5} />
            </Button>
            <Button
              type="button"
              size="sm"
              width="40px"
              height="34px"
              p={0}
              borderRadius="lg"
              aria-label="Move line down"
              onClick={() => move(index, 1)}
              isDisabled={index === lines.length - 1}
              colorScheme="pink"
              variant="ghost"
              _hover={{ bg: "pink.50", color: "pink.600" }}
            >
              <ChevronDownIcon boxSize={5} />
            </Button>
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
};

const MatchPairs = ({ question, value, onChange, labels }) => {
  const pairs = question.pairs || [];
  const choices = useMemo(
    () => question.choices || pairs.map((pair) => pair.right),
    [pairs, question.choices],
  );
  return (
    <VStack width="100%" align="stretch" spacing={3}>
      {pairs.map((pair) => {
        const selected = value?.[pair.left] || "";
        return (
          <Menu key={pair.left} matchWidth>
            <MenuButton
              as={Button}
              variant="unstyled"
              display="block"
              width="100%"
              height="auto"
              bg="appSurface"
              borderRadius="2xl"
              borderWidth="1.5px"
              borderColor={selected ? "pink.300" : "appBorder"}
              p={4}
              boxShadow="sm"
              textAlign="left"
              cursor="pointer"
              transition="all 0.2s ease"
              _hover={{
                borderColor: "pink.400",
                boxShadow: "md",
                bg: "appSurfaceHover",
              }}
              _active={{ bg: "appSurfaceElevated", transform: "scale(0.995)" }}
            >
              <HStack justify="space-between" mb={2}>
                <Code
                  px={3}
                  py={1}
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="bold"
                  colorScheme="pink"
                >
                  {pair.left}
                </Code>
                <ChevronDownIcon boxSize={5} color="pink.400" />
              </HStack>
              <Text
                fontSize="sm"
                color={selected ? "inherit" : "gray.400"}
                fontWeight={selected ? "semibold" : "normal"}
                whiteSpace="normal"
                wordBreak="break-word"
                lineHeight="1.5"
              >
                {selected || labels.pair}
              </Text>
            </MenuButton>
            <MenuList
              zIndex="popover"
              bg="appSurfaceElevated"
              borderColor="appBorder"
              maxH="300px"
              overflowY="auto"
              borderRadius="xl"
              boxShadow="xl"
              p={1.5}
            >
              {choices.map((choice) => (
                <MenuItem
                  key={choice}
                  onClick={() =>
                    onChange({ ...(value || {}), [pair.left]: choice })
                  }
                  bg={selected === choice ? "pink.50" : "transparent"}
                  color={selected === choice ? "pink.600" : "inherit"}
                  fontWeight={selected === choice ? "bold" : "normal"}
                  _hover={{ bg: "pink.100", color: "pink.700" }}
                  borderRadius="lg"
                  whiteSpace="normal"
                  wordBreak="break-word"
                  py={2.5}
                  px={3}
                  my={0.5}
                >
                  {choice}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        );
      })}
    </VStack>
  );
};

const Workbench = ({ question, value, onChange, userLanguage, labels }) => {
  const starterCode =
    typeof question.starterCode === "string" ? question.starterCode : "";
  const editorValue = typeof value === "string" ? value : starterCode;

  return (
    <VStack width="100%" align="stretch" spacing={4}>
      <CodeEditor
        value={editorValue}
        onChange={onChange}
        height={280}
        userLanguage={userLanguage}
      />
      {question.tests?.length > 0 && (
        <Box
          bg="appSurface"
          borderWidth="1px"
          borderColor="appBorder"
          borderRadius="xl"
          p={4}
        >
          <Text fontWeight="bold" mb={2}>
            {labels.tests}
          </Text>
          {question.tests.map((test) => (
            <Text key={test} fontSize="sm">
              ✓ {test}
            </Text>
          ))}
        </Box>
      )}
    </VStack>
  );
};

export default function QuestionMode({ step, value, onChange, userLanguage }) {
  const type = getQuestionType(step);
  const question = step.question || {};
  const locale = localeFor(userLanguage);
  const labels = copy[locale];
  const [initializedType, setInitializedType] = useState("");
  const projectStorageKey = `courseProject:${question.projectId || "course-app"}:${question.checkpointId || step.title}`;

  useEffect(() => {
    const initializationKey = `${step.title}-${type}`;
    const hasAnswer = value !== null && value !== undefined;
    if (initializedType === initializationKey && hasAnswer) return;
    if (type === "parsons")
      onChange(scrambleArray(question.lines || []));
    else if (type === "projectCheckpoint") {
      const savedCode =
        typeof window !== "undefined"
          ? window.localStorage.getItem(projectStorageKey)
          : "";
      onChange(savedCode || question.starterCode || "");
    } else if (["fixBug", "refactoring"].includes(type))
      onChange(question.starterCode || "");
    else if (["fillCodeBlanks", "matchPairs"].includes(type)) onChange({});
    else if (type === "relevantLine") onChange([]);
    else onChange("");
    setInitializedType(initializationKey);
  }, [
    initializedType,
    onChange,
    question.lines,
    question.starterCode,
    projectStorageKey,
    step.title,
    type,
    value,
  ]);

  useEffect(() => {
    if (
      type === "projectCheckpoint" &&
      typeof window !== "undefined" &&
      typeof value === "string" &&
      value.trim()
    ) {
      window.localStorage.setItem(projectStorageKey, value);
    }
  }, [projectStorageKey, type, value]);

  const toggleLine = (lineNumber) => {
    const selected = Array.isArray(value) ? value : [];
    if (question.allowMultiple) {
      onChange(
        selected.includes(lineNumber)
          ? selected.filter((line) => line !== lineNumber)
          : [...selected, lineNumber],
      );
    } else {
      onChange([lineNumber]);
    }
  };

  const previewSource = useMemo(() => {
    if (question.previewCode) return question.previewCode;
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value) && value.length > 0 && type === "parsons") {
      return value.join("\n");
    }
    if (question.starterCode && typeof question.starterCode === "string") {
      return question.starterCode;
    }
    return "";
  }, [question.previewCode, question.starterCode, type, value]);

  const shouldRenderPreview = Boolean(
    (step.showPreview || question.showPreview) &&
      previewSource &&
      previewSource.trim(),
  );

  return (
    <VStack spacing={5} width="100%" maxWidth="600px" align="stretch">
      {shouldRenderPreview && (
        <Box
          width="100%"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="appBorder"
          overflow="hidden"
          bg="white"
          height="180px"
          boxShadow="sm"
          p={2}
        >
          <LiveReactEditorModal
            code={previewSource}
            mode="preview"
            autoRun={true}
            hideRunButton={true}
            previewHeight="100%"
          />
        </Box>
      )}
      {type === "codeTracing" && (
        <>
          <CodePanel code={question.code} />
          {question.options?.length ? (
            <OptionCards
              options={question.options}
              value={value}
              onChange={onChange}
              code
            />
          ) : (
            <Input
              value={value || ""}
              onChange={(event) => onChange(event.target.value)}
              placeholder={question.placeholder || labels.choose}
            />
          )}
        </>
      )}
      {type === "fillCodeBlanks" && (
        <FillCodeBlanks
          question={question}
          value={value}
          onChange={onChange}
          labels={labels}
        />
      )}
      {type === "parsons" && (
        <ReorderLines question={question} value={value} onChange={onChange} />
      )}
      {type === "matchPairs" && (
        <MatchPairs
          question={question}
          value={value}
          onChange={onChange}
          labels={labels}
        />
      )}
      {type === "relevantLine" && (
        <CodePanel
          code={question.code}
          selectedLines={Array.isArray(value) ? value : []}
          onLineClick={toggleLine}
        />
      )}
      {type === "bestImplementation" && (
        <OptionCards
          options={question.options}
          value={value}
          onChange={onChange}
          code
        />
      )}
      {["fixBug", "refactoring", "projectCheckpoint"].includes(type) && (
        <Workbench
          question={question}
          value={value}
          onChange={onChange}
          userLanguage={userLanguage}
          labels={labels}
        />
      )}
    </VStack>
  );
}
