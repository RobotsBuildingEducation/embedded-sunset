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

export const CodeWindowHeader = ({ title = "script.js" }) => (
  <HStack
    bg="blackAlpha.300"
    px={4}
    py={2.5}
    borderBottomWidth="1px"
    borderBottomColor="whiteAlpha.100"
    justify="space-between"
    align="center"
  >
    <HStack spacing={2}>
      <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" />
      <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" />
      <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" />
    </HStack>
    <Text
      fontSize="xs"
      fontWeight="semibold"
      color="gray.400"
      letterSpacing="wider"
      fontFamily="mono"
      userSelect="none"
    >
      {title}
    </Text>
    <Box w="36px" />
  </HStack>
);

export const CodePanel = ({ code, selectedLines = [], onLineClick }) => {
  const panelBg = useColorModeValue("#1e1e2e", "#0f172a");
  const lineHover = useColorModeValue("whiteAlpha.200", "whiteAlpha.200");
  return (
    <Box
      width="100%"
      bg={panelBg}
      color="gray.100"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      boxShadow="xl"
      fontFamily="'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace"
      fontSize={{ base: "xs", md: "sm" }}
    >
      <CodeWindowHeader title="preview.js" />
      <Box py={3} overflowX="auto">
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
                lineHeight="1.8"
                px={1}
                transition="background 0.15s ease"
              >
                <Text
                  as="span"
                  color="gray.500"
                  textAlign="right"
                  pr={3}
                  userSelect="none"
                  borderRightWidth="1px"
                  borderRightColor="whiteAlpha.100"
                >
                  {lineNumber}
                </Text>
                <Text
                  as="span"
                  whiteSpace="pre-wrap"
                  overflowWrap="anywhere"
                  pl={3}
                  pr={4}
                  color="gray.100"
                >
                  {line || " "}
                </Text>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

const isCodeSnippet = (text) => {
  const str = String(text || "").trim();
  return (
    str.includes("\n") ||
    str.startsWith("<") ||
    str.includes("</") ||
    str.includes("/>") ||
    str.includes("onClick") ||
    str.startsWith("const ") ||
    str.startsWith("let ") ||
    str.startsWith("var ") ||
    str.startsWith("function") ||
    str.startsWith("return ") ||
    str.startsWith("import ") ||
    str.startsWith("export ") ||
    str.startsWith("class ") ||
    str.includes("=>") ||
    str.includes("console.") ||
    str.includes("eval(") ||
    str.includes("arr.")
  );
};

const OptionCards = ({ options, value, onChange, code = false }) => (
  <VStack width="100%" align="stretch" spacing={3}>
    {(options || []).map((option, index) => {
      const isCode = code || isCodeSnippet(option);
      const isSelected = value === option;

      return (
        <Button
          key={`${index}-${option}`}
          variant="unstyled"
          height="auto"
          minH="54px"
          p={{ base: 3.5, md: 4 }}
          display="block"
          width="100%"
          textAlign="left"
          borderWidth="2px"
          borderColor={isSelected ? "pink.400" : "appBorder"}
          bg={isSelected ? "appSurfaceElevated" : "appSurface"}
          borderRadius="xl"
          boxShadow={isSelected ? "md" : "sm"}
          _hover={{
            borderColor: isSelected ? "pink.400" : "pink.300",
            bg: isSelected ? "appSurfaceElevated" : "appSurfaceHover",
          }}
          transition="all 0.15s ease"
          onClick={() => onChange(option)}
        >
          {isCode ? (
            <Box width="100%" py={0.5}>
              <Text
                as="pre"
                fontFamily="'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace"
                fontSize={{ base: "12px", sm: "13px", md: "13.5px" }}
                lineHeight="1.6"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                textAlign="left"
                color="inherit"
                letterSpacing="-0.01em"
              >
                {option}
              </Text>
            </Box>
          ) : (
            <Text
              fontSize={{ base: "sm", md: "md" }}
              whiteSpace="normal"
              lineHeight="1.5"
            >
              {option}
            </Text>
          )}
        </Button>
      );
    })}
  </VStack>
);

const FillCodeBlanks = ({ question, value, onChange, labels }) => {
  const blanks = question.blanks || [];
  const template = String(question.template || "");
  const lines = template.split("\n");
  const panelBg = useColorModeValue("#1e1e2e", "#0f172a");

  const getHeaderTitle = () => {
    if (question.filename) return question.filename;
    if (
      template.includes("<input") ||
      template.includes("<div") ||
      template.includes("<button") ||
      template.includes("<html") ||
      template.includes("</")
    ) {
      return template.includes("React") ||
        template.includes("useState") ||
        template.includes("className")
        ? "App.jsx"
        : "index.html";
    }
    if (template.trim().startsWith("{") && template.includes('"scripts"')) {
      return "package.json";
    }
    return "script.js";
  };

  return (
    <VStack width="100%" align="stretch" spacing={4}>
      <Box
        width="100%"
        bg={panelBg}
        color="gray.100"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        boxShadow="xl"
      >
        <CodeWindowHeader title={getHeaderTitle()} />
        <Box
          py={{ base: 3, md: 4 }}
          px={{ base: 2, md: 3 }}
          overflowX="auto"
          fontFamily="'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace"
          fontSize={{ base: "13px", md: "14px" }}
          lineHeight="1.8"
        >
          {lines.map((line, lineIndex) => {
            const lineParts = line.split(/(\{\{[^}]+\}\})/g);
            return (
              <Box
                key={lineIndex}
                display="flex"
                alignItems="center"
                minH={{ base: "30px", md: "34px" }}
                whiteSpace="pre"
              >
                <Text
                  as="span"
                  color="gray.500"
                  width="36px"
                  textAlign="right"
                  pr={3}
                  userSelect="none"
                  flexShrink={0}
                  borderRightWidth="1px"
                  borderRightColor="whiteAlpha.100"
                  fontSize="xs"
                >
                  {lineIndex + 1}
                </Text>
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  pl={3}
                  pr={4}
                  whiteSpace="pre"
                >
                  {lineParts.map((part, partIndex) => {
                    const match = part.match(/^\{\{([^}]+)\}\}$/);
                    if (!match)
                      return (
                        <Text as="span" key={partIndex} whiteSpace="pre">
                          {part}
                        </Text>
                      );
                    const key = match[1];
                    const currentValue = value?.[key] || "";
                    const charLength = Math.max(currentValue.length, 3);
                    const inputWidth = `${Math.max(48, Math.min(150, charLength * 9.5 + 16))}px`;

                    return (
                      <Input
                        key={`${key}-${partIndex}`}
                        aria-label={labels.blank}
                        placeholder="..."
                        value={currentValue}
                        onChange={(event) =>
                          onChange({
                            ...(value || {}),
                            [key]: event.target.value,
                          })
                        }
                        display="inline-flex"
                        alignItems="center"
                        width={inputWidth}
                        height={{ base: "24px", md: "26px" }}
                        mx="2px"
                        px="6px"
                        fontSize={{ base: "12px", md: "13px" }}
                        fontWeight="bold"
                        textAlign="center"
                        bg="#1e293b"
                        color="#f59e0b"
                        borderColor="#f97316"
                        borderWidth="1.5px"
                        borderRadius="md"
                        _placeholder={{
                          color: "whiteAlpha.400",
                          fontSize: "11px",
                          fontStyle: "italic",
                        }}
                        _hover={{
                          borderColor: "#fb923c",
                          bg: "#334155",
                        }}
                        _focus={{
                          borderColor: "#f97316",
                          bg: "#0f172a !important",
                          color: "#fbbf24",
                          boxShadow: "0 0 0 2px rgba(249, 115, 22, 0.45)",
                        }}
                        _focusVisible={{
                          borderColor: "#f97316",
                          bg: "#0f172a !important",
                          color: "#fbbf24",
                          boxShadow: "0 0 0 2px rgba(249, 115, 22, 0.45)",
                          outline: "none",
                        }}
                        _active={{
                          bg: "#0f172a !important",
                        }}
                        _autofill={{
                          textFillColor: "#fbbf24",
                          boxShadow: "0 0 0 1000px #0f172a inset !important",
                        }}
                        fontFamily="'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace"
                      />
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
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
    <VStack width="100%" align="stretch" spacing={2}>
      {lines.map((line, index) => (
        <HStack
          key={`${index}-${line}`}
          bg="appSurface"
          borderWidth="1.5px"
          borderColor="appBorder"
          borderRadius="xl"
          minHeight="48px"
          p={{ base: 2, md: 2.5 }}
          spacing={{ base: 2, md: 2.5 }}
          boxShadow="sm"
          _hover={{ borderColor: "pink.300", boxShadow: "md" }}
          transition="all 0.15s ease"
        >
          <Badge
            colorScheme="pink"
            borderRadius="md"
            minW="22px"
            textAlign="center"
            px={1.5}
            py={0.5}
            fontSize="xs"
            fontWeight="bold"
            flexShrink={0}
          >
            {index + 1}
          </Badge>
          <Code
            flex="1"
            p={{ base: 2, md: 2.5 }}
            borderRadius="lg"
            display="flex"
            alignItems="center"
            textAlign="left"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            fontFamily="'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace"
            fontSize={{ base: "11.5px", sm: "12.5px", md: "13px" }}
            lineHeight="1.5"
            bg="appCodeBg"
            color="appCodeColor"
          >
            {line}
          </Code>
          <VStack spacing={0.5} justify="center" flexShrink={0}>
            <Button
              type="button"
              size="xs"
              width="26px"
              height="22px"
              p={0}
              borderRadius="md"
              aria-label="Move line up"
              onClick={() => move(index, -1)}
              isDisabled={index === 0}
              colorScheme="pink"
              variant="ghost"
              _hover={{ bg: "pink.50", color: "pink.600" }}
            >
              <ChevronUpIcon boxSize={3.5} />
            </Button>
            <Button
              type="button"
              size="xs"
              width="26px"
              height="22px"
              p={0}
              borderRadius="md"
              aria-label="Move line down"
              onClick={() => move(index, 1)}
              isDisabled={index === lines.length - 1}
              colorScheme="pink"
              variant="ghost"
              _hover={{ bg: "pink.50", color: "pink.600" }}
            >
              <ChevronDownIcon boxSize={3.5} />
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
  const isStale =
    typeof value === "string" &&
    starterCode &&
    starterCode.includes("appName") &&
    value.includes("console.log(1)");
  const editorValue =
    typeof value === "string" && !isStale ? value : starterCode;

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

  useEffect(() => {
    const initializationKey = `${step.title}-${type}`;
    const hasAnswer = value !== null && value !== undefined;
    if (initializedType === initializationKey && hasAnswer) return;
    if (type === "parsons")
      onChange(scrambleArray(question.lines || []));
    else if (["fixBug", "refactoring"].includes(type))
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
    step.title,
    type,
    value,
  ]);

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
      {["fixBug", "refactoring"].includes(type) && (
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
