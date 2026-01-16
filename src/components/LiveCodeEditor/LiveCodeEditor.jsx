// src/components/LiveCodeEditor/LiveCodeEditor.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChakraProvider,
  ColorModeScript,
  Toast,

  // Layout
  AbsoluteCenter,
  AspectRatio,
  Box,
  Center,
  Container,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Spacer,
  Stack,
  HStack,
  VStack,
  Wrap,
  WrapItem,

  // Typography
  Text,
  Heading,
  Highlight,
  Kbd,
  Code,
  Divider,

  // Forms
  Button,
  IconButton,
  Checkbox,
  CheckboxGroup,
  Editable,
  EditableInput,
  EditableTextarea,
  EditablePreview,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputLeftElement,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  PinInput,
  PinInputField,
  Radio,
  RadioGroup,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Switch,
  Textarea,
  SelectField,

  // Data Display
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Square,
  StackDivider,
  ButtonGroup,

  // Feedback
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  CircularProgressLabel,
  Progress,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Circle,

  // Overlays
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  MenuOptionGroup,
  MenuItemOption,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Tooltip,
  Portal,

  // Disclosure & Navigation
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  TabIndicator,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Indicator,
  Link,
  LinkBox,
  LinkOverlay,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepNumber,
  StepSeparator,
  StepIcon,
  FormErrorIcon,
  SkipNavLink,
  SkipNavContent,

  // Media & Icons
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Icon,
  Image,
  CloseButton,

  // Utilities
  VisuallyHidden,
  VisuallyHiddenInput,
  Show,
  Hide,
  Collapse,
  Fade,
  ScaleFade,
  Slide,
  SlideFade,
  useClipboard,
  Img,
  Mark,
  RequiredIndicator,
  FocusLock,
  ControlBox,
} from "@chakra-ui/react";

import Editor from "@monaco-editor/react";
import { LiveError, LivePreview, LiveProvider } from "react-live";

import { database } from "../../database/firebaseResources";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { soundManager } from "../../utility/soundManager";

/**
 * LiveReactEditorModal
 * Modes:
 *  - "full"    : editor + preview
 *  - "editor"  : editor only
 *  - "preview" : preview only
 *
 * Props:
 *  - controlledCode/onCodeChange for external control
 *  - instanceKey forces hard remount of preview surfaces
 *  - autoRun triggers evaluation automatically
 */
const LiveReactEditorModal = ({
  code,
  isOnboarding = false,
  hideRunButton = false,
  autoRun = false,

  mode = "full", // 'full' | 'editor' | 'preview'
  controlledCode,
  onCodeChange,
  editorHeight = "400px",
  previewHeight = "400px",
  instanceKey,
}) => {
  const [editorCode, setEditorCode] = useState(controlledCode ?? code ?? "");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState("");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRef = useRef(null);

  const { hasCopied, onCopy } = useClipboard(editorCode || "");

  useEffect(() => {
    const next = controlledCode ?? code ?? "";
    setEditorCode(next);
    if (autoRun && mode !== "editor" && next.trim()) {
      // ensure surface is visible for react-live path
      setIsPreviewing(true);
    }
  }, [controlledCode, code]); // eslint-disable-line

  // ---------------- detection helpers
  const looksLikeReact = (src = "") =>
    /render\s*\(/i.test(src) ||
    /ReactDOM\s*\.\s*render\s*\(/i.test(src) ||
    /createRoot\s*\(/i.test(src) ||
    /ReactDOM\s*\.\s*createRoot\s*\(/i.test(src);

  const looksLikeHTML = (src = "") =>
    /<!DOCTYPE/i.test(src) ||
    /<html/i.test(src) ||
    /<body/i.test(src) ||
    /<\/?[a-z-]+/i.test(src);

  const cleanCode = (inputCode) =>
    (inputCode || "").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "").trim();

  const currentCode = useMemo(
    () => controlledCode ?? editorCode ?? "",
    [controlledCode, editorCode]
  );

  // Normalize React 18 root/render patterns to react-live's `render(el)`
  const normalizeReactEntry = (src = "") => {
    let s = src;

    // ReactDOM.createRoot(root).render(<App />)
    s = s.replace(
      /ReactDOM\s*\.\s*createRoot\s*\([^)]*\)\s*\.?\s*render\s*\(/gi,
      "render("
    );
    // createRoot(root).render(<App />)
    s = s.replace(/createRoot\s*\([^)]*\)\s*\.?\s*render\s*\(/gi, "render(");
    // ReactDOM.render(<App />, root)
    s = s.replace(
      /ReactDOM\s*\.\s*render\s*\(\s*([^,]+)\s*,\s*[^)]+\)/gi,
      "render($1)"
    );

    // Some models put a manual #root div; react-live supplies the container,
    // so it's fine to leave extra HTML in strings; no-op here intentionally.
    return s;
  };

  // For preview: if it's React-like, pass normalized code to LiveProvider
  const codeForPreview = useMemo(() => {
    if (looksLikeReact(currentCode)) return normalizeReactEntry(currentCode);
    return currentCode;
  }, [currentCode]);

  // ---------------- runners
  const runJavaScriptCode = (sanitizedCode) => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>Live JavaScript Preview</title></head>
  <body>
    <script>
      // pipe console back to parent
      window.console = {
        log: (...args) =>
          window.parent.postMessage({ type: 'console', message: args.join(" ") }, '*'),
        error: (...args) =>
          window.parent.postMessage({ type: 'console', message: 'Error: ' + args.join(" ") }, '*'),
        warn: (...args) =>
          window.parent.postMessage({ type: 'console', message: 'Warn: ' + args.join(" ") }, '*'),
      };
      try { ${sanitizedCode} } catch (err) { console.error(err); }
    <\/script>
  </body>
</html>`;
      if (iframeRef.current) iframeRef.current.srcdoc = htmlContent;
    } catch (err) {
      setError(err.message);
    }
  };

  const runHTMLCode = (raw) => {
    try {
      const html = raw.startsWith("<!DOCTYPE")
        ? raw
        : `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Live HTML Preview</title></head><body>${raw}</body></html>`;
      if (iframeRef.current) iframeRef.current.srcdoc = html;
    } catch (err) {
      setError(err.message);
    }
  };

  const runCode = () => {
    setIsPreviewing(true);
    setError("");
    setConsoleLogs([]);

    const sanitized = cleanCode(currentCode);

    if (looksLikeReact(sanitized)) {
      // react-live path — nothing else to do
      return;
    }
    if (looksLikeHTML(currentCode)) {
      runHTMLCode(currentCode);
      return;
    }
    runJavaScriptCode(sanitized);
  };

  // autorun when code changes (preview modes only)
  useEffect(() => {
    if (autoRun && mode !== "editor" && currentCode.trim()) {
      runCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, mode, currentCode]);

  // autorun when instanceKey changes (force refresh)
  useEffect(() => {
    if (autoRun && mode !== "editor" && currentCode.trim()) {
      runCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceKey]);

  // console piping from iframe
  useEffect(() => {
    const handleConsoleMessage = (event) => {
      if (event?.data?.type === "console") {
        setConsoleLogs((prev) => [...prev, event.data.message]);
      }
    };
    window.addEventListener("message", handleConsoleMessage);
    return () => window.removeEventListener("message", handleConsoleMessage);
  }, []);

  const handleEditChange = (value) => {
    const next = value ?? "";
    if (controlledCode === undefined) setEditorCode(next);
    onCodeChange?.(next);
  };

  // ---------------- UI
  const showEditor = mode !== "preview";
  const showPreview = mode !== "editor";

  return (
    <>
      {!hideRunButton && showPreview && !autoRun && (
        <Button
          variant="outline"
          mt={4}
          onClick={() => {
            soundManager.playSelect();
            runCode();
          }}
          mb={4}
          boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
        >
          Run Code
        </Button>
      )}

      {showEditor && (
        <Box
          width="100%"
          mb={{ base: 4, md: 0 }}
          boxShadow="0.5px 0.5px 1px 0px rgba(0, 0, 0, 0.75)"
          height={editorHeight}
        >
          <Editor
            // height={editorHeight}
            defaultLanguage={looksLikeHTML(currentCode) ? "html" : "javascript"}
            language={looksLikeHTML(currentCode) ? "html" : "javascript"}
            value={currentCode}
            onChange={handleEditChange}
            theme="light"
            width="100%"
            options={{
              minimap: { enabled: false },
              fontFamily: "initial",
              fontSize: "16px",
              automaticLayout: true,
              tabIndex: 0,
            }}
          />
        </Box>
      )}

      {showPreview && (
        <Box
          width="100%"
          borderRadius="2xl"
          mt="8px"
          border="1px solid black"
          boxSizing="border-box"
          height={previewHeight}
          overflow="hidden"
        >
          {/* React preview */}
          {looksLikeReact(codeForPreview) && (isPreviewing || autoRun) ? (
            <Box height="100%">
              <ChakraProvider>
                <LiveProvider
                  key={instanceKey} // force re-mount if needed
                  code={codeForPreview}
                  noInline={true}
                  scope={{
                    React,
                    useState: React.useState,
                    useEffect: React.useEffect,
                    useCallback: React.useCallback,
                    ChakraProvider,
                    ColorModeScript,

                    // Layout
                    AbsoluteCenter,
                    AspectRatio,
                    Box,
                    Center,
                    Container,
                    Flex,
                    Grid,
                    GridItem,
                    SimpleGrid,
                    Spacer,
                    Stack,
                    HStack,
                    VStack,
                    Wrap,
                    WrapItem,
                    Toast,
                    StepIcon,
                    FormErrorIcon,
                    SkipNavLink,
                    SkipNavContent,

                    // Typography
                    Text,
                    Heading,
                    Highlight,
                    Kbd,
                    Code,
                    Divider,
                    Square,
                    StackDivider,
                    ButtonGroup,

                    // Forms
                    Button,
                    IconButton,
                    Checkbox,
                    CheckboxGroup,
                    Editable,
                    FocusLock,
                    EditableInput,
                    EditableTextarea,
                    ControlBox,
                    EditablePreview,
                    FormControl,
                    FormLabel,
                    RequiredIndicator,
                    FormErrorMessage,
                    FormHelperText,
                    Input,
                    InputGroup,
                    InputLeftAddon,
                    InputRightAddon,
                    InputLeftElement,
                    InputRightElement,
                    NumberInput,
                    NumberInputField,
                    NumberInputStepper,
                    NumberIncrementStepper,
                    NumberDecrementStepper,
                    PinInput,
                    PinInputField,
                    Radio,
                    RadioGroup,
                    RangeSlider,
                    RangeSliderTrack,
                    RangeSliderFilledTrack,
                    RangeSliderThumb,
                    Select,
                    SelectField,
                    Slider,
                    SliderTrack,
                    SliderFilledTrack,
                    SliderThumb,
                    SliderMark,
                    Mark,
                    Switch,
                    Textarea,

                    // Data Display
                    Badge,
                    Card,
                    CardHeader,
                    CardBody,
                    CardFooter,
                    List,
                    ListItem,
                    ListIcon,
                    OrderedList,
                    UnorderedList,
                    Stat,
                    StatLabel,
                    StatNumber,
                    StatHelpText,
                    StatArrow,
                    StatGroup,
                    Table,
                    Thead,
                    Tbody,
                    Tfoot,
                    Tr,
                    Th,
                    Td,
                    TableCaption,
                    TableContainer,
                    Tag,
                    TagLabel,
                    TagLeftIcon,
                    TagRightIcon,
                    TagCloseButton,

                    // Feedback
                    Alert,
                    AlertIcon,
                    AlertTitle,
                    AlertDescription,
                    CircularProgress,
                    CircularProgressLabel,
                    Progress,
                    Skeleton,
                    SkeletonCircle,
                    Circle,
                    SkeletonText,
                    Spinner,

                    // Overlays
                    AlertDialog,
                    AlertDialogBody,
                    AlertDialogFooter,
                    AlertDialogHeader,
                    AlertDialogContent,
                    AlertDialogOverlay,
                    AlertDialogCloseButton,
                    Drawer,
                    DrawerBody,
                    DrawerFooter,
                    DrawerHeader,
                    DrawerOverlay,
                    DrawerContent,
                    DrawerCloseButton,
                    Menu,
                    MenuButton,
                    MenuList,
                    MenuItem,
                    MenuGroup,
                    MenuDivider,
                    MenuOptionGroup,
                    MenuItemOption,
                    Modal,
                    ModalOverlay,
                    ModalContent,
                    ModalHeader,
                    ModalFooter,
                    ModalBody,
                    ModalCloseButton,
                    Popover,
                    PopoverTrigger,
                    PopoverContent,
                    PopoverHeader,
                    PopoverBody,
                    PopoverFooter,
                    PopoverArrow,
                    PopoverCloseButton,
                    PopoverAnchor,
                    Tooltip,
                    Portal,

                    // Disclosure & Navigation
                    Accordion,
                    AccordionItem,
                    AccordionButton,
                    AccordionPanel,
                    AccordionIcon,
                    Tabs,
                    Tab,
                    TabList,
                    TabPanels,
                    TabPanel,
                    TabIndicator,
                    Indicator,
                    Breadcrumb,
                    BreadcrumbItem,
                    BreadcrumbLink,
                    BreadcrumbSeparator,
                    Link,
                    LinkBox,
                    LinkOverlay,
                    Stepper,
                    Step,
                    StepIndicator,
                    StepStatus,
                    StepTitle,
                    StepDescription,
                    StepNumber,
                    StepSeparator,

                    // Media & Icons
                    Avatar,
                    AvatarBadge,
                    AvatarGroup,
                    Icon,
                    Image,
                    Img,
                    CloseButton,

                    // Utilities
                    VisuallyHidden,
                    VisuallyHiddenInput,
                    Show,
                    Hide,
                    Collapse,
                    Fade,
                    ScaleFade,
                    Slide,
                    SlideFade,
                    // Firestore helpers & db handle for demos
                    database,
                    getDoc,
                    doc,
                    collection,
                    addDoc,
                    updateDoc,
                    setDoc,
                    getDocs,
                    onSnapshot,
                  }}
                >
                  <Box height="100%" overflow="auto" p={2}>
                    <LivePreview />
                    <LiveError />
                  </Box>
                </LiveProvider>
              </ChakraProvider>
            </Box>
          ) : looksLikeHTML(currentCode) ? (
            // HTML preview
            <Box width="100%" height="100%" borderRadius="md">
              <iframe
                key={instanceKey}
                ref={iframeRef}
                title="Live Preview"
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          ) : isPreviewing || autoRun ? (
            // Vanilla JS console logs
            <VStack
              align="start"
              mt={0}
              p={2}
              borderTop="1px solid #ccc"
              bg="blackAlpha.800"
              color="white"
              height="100%"
              overflowY="auto"
            >
              {consoleLogs.map((log, i) => (
                <Text key={i}>{log}</Text>
              ))}
            </VStack>
          ) : null}
        </Box>
      )}

      {error && <Text color="red.500">{error}</Text>}
    </>
  );
};

export default LiveReactEditorModal;
