import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  Switch,
  Badge,
  useColorMode,
  useColorModeValue,
  useToast,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  SimpleGrid,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Skeleton,
} from "@chakra-ui/react";
import {
  FaSun,
  FaMoon,
  FaPlus,
  FaTrash,
  FaSave,
  FaFolderOpen,
  FaArrowLeft,
  FaFileAlt,
  FaCheck,
  FaPalette,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PieChartRenderer } from "./PieChartRenderer";
import {
  COLOR_PALETTES,
  SWATCH_COLORS,
  getNextColor,
} from "./palettePresets";
import {
  getCurrentNostrIdentity,
  saveChartToFirestore,
  fetchUserChartsFromFirestore,
  deleteChartFromFirestore,
  saveLocalDraft,
  loadLocalDraft,
} from "./chartStorage";
import { persistThemeMode } from "../useThemeStore";

const INITIAL_ROWS = [
  { id: "row_1", name: "Housing", value: "1200", color: "#F97316" },
  { id: "row_2", name: "Food & Groceries", value: "450", color: "#EF4444" },
  { id: "row_3", name: "Savings", value: "600", color: "#F59E0B" },
  { id: "row_4", name: "Utilities", value: "200", color: "#EC4899" },
  { id: "row_5", name: "Entertainment", value: "150", color: "#8B5CF6" },
];

const CHART_STYLES = [
  { id: "pie", label: "Classic Pie", icon: "🥧" },
  { id: "donut", label: "Donut", icon: "🍩" },
  { id: "semi", label: "Semi-Circle", icon: "🧭" },
  { id: "rose", label: "Polar / Rose", icon: "🌸" },
  { id: "exploded", label: "Segmented", icon: "💥" },
];

export const ChartsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, setColorMode } = useColorMode();

  // Theme values
  const bg = useColorModeValue("#F8F5F0", "#050815");
  const surfaceBg = useColorModeValue("#FFFFFF", "#0C1528");
  const surfaceElevated = useColorModeValue("#FFFFFF", "#111C33");
  const borderColor = useColorModeValue("rgba(104,85,64,0.15)", "rgba(148,163,184,0.18)");
  const textColor = useColorModeValue("#201B16", "#ECF2FF");
  const textMuted = useColorModeValue("#5E564C", "#A9B8D7");
  const inputBg = useColorModeValue("#F2EDE6", "#15213A");

  // User identity
  const [identity, setIdentity] = useState({ npub: null, nsec: null });

  // Current Chart State
  const [chartId, setChartId] = useState(null);
  const [title, setTitle] = useState("My Pie Chart");
  const [chartType, setChartType] = useState("pie");
  const [donutHolePercent, setDonutHolePercent] = useState(55);
  const [activePalette, setActivePalette] = useState("sunset");
  const [rows, setRows] = useState(INITIAL_ROWS);

  // Status & Saved charts
  const [isSaving, setIsSaving] = useState(false);
  const [savedCharts, setSavedCharts] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [deletingChartId, setDeletingChartId] = useState(null);

  // Drawer & Alert states
  const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const cancelDeleteRef = React.useRef();

  // Load identity on mount
  useEffect(() => {
    const id = getCurrentNostrIdentity();
    setIdentity(id);

    // Try loading local draft if available
    const draft = loadLocalDraft();
    if (draft && Array.isArray(draft.rows) && draft.rows.length > 0) {
      setTitle(draft.title || "My Pie Chart");
      setChartType(draft.type || "pie");
      setRows(draft.rows);
      if (draft.id) setChartId(draft.id);
      if (draft.settings?.donutHoleSize) setDonutHolePercent(draft.settings.donutHoleSize);
      if (draft.settings?.paletteKey) setActivePalette(draft.settings.paletteKey);
    }
  }, []);

  // Sync draft to local storage on edits
  useEffect(() => {
    saveLocalDraft({
      id: chartId,
      title,
      type: chartType,
      rows,
      settings: {
        donutHoleSize: donutHolePercent,
        paletteKey: activePalette,
      },
    });
  }, [chartId, title, chartType, rows, donutHolePercent, activePalette]);

  // Load saved charts from Firestore subcollection
  const loadSavedCharts = useCallback(async () => {
    if (!identity.npub) return;
    setIsLoadingSaved(true);
    try {
      const charts = await fetchUserChartsFromFirestore(identity.npub);
      setSavedCharts(charts);
    } catch (err) {
      toast({
        title: "Could not load saved charts",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoadingSaved(false);
    }
  }, [identity.npub, toast]);

  const handleOpenDrawer = () => {
    loadSavedCharts();
    onOpenDrawer();
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextMode = colorMode === "light" ? "dark" : "light";
    setColorMode(nextMode);
    persistThemeMode(nextMode);
  };

  // Row Manipulation
  const handleAddRow = () => {
    const nextIdx = rows.length;
    const nextCol = getNextColor(nextIdx, activePalette);
    const newRow = {
      id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `Item ${nextIdx + 1}`,
      value: "100",
      color: nextCol,
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (rowId) => {
    if (rows.length <= 1) {
      toast({
        title: "At least one row required",
        description: "A chart needs at least one data row.",
        status: "warning",
        duration: 2500,
      });
      return;
    }
    setRows(rows.filter((r) => r.id !== rowId));
  };

  const handleUpdateRow = (rowId, key, val) => {
    setRows(
      rows.map((r) => (r.id === rowId ? { ...r, [key]: val } : r))
    );
  };

  // Quick Apply Palette
  const handleApplyPalette = (paletteKey) => {
    setActivePalette(paletteKey);
    const palette = COLOR_PALETTES[paletteKey];
    if (!palette) return;

    setRows(
      rows.map((row, idx) => ({
        ...row,
        color: palette.colors[idx % palette.colors.length],
      }))
    );
  };

  // Reset to New Chart
  const handleNewChart = () => {
    setChartId(null);
    setTitle("My Pie Chart");
    setChartType("pie");
    setRows(INITIAL_ROWS);
    setActivePalette("sunset");
    toast({
      title: "New chart created",
      status: "info",
      duration: 2000,
    });
  };

  // Save Chart to Firestore Subcollection
  const handleSaveChart = async () => {
    if (!identity.npub) {
      toast({
        title: "No identity detected",
        description: "Unable to find your npub identity.",
        status: "error",
        duration: 4000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveChartToFirestore(identity.npub, {
        id: chartId,
        title,
        type: chartType,
        rows,
        settings: {
          donutHoleSize: donutHolePercent,
          paletteKey: activePalette,
        },
      });

      setChartId(saved.id);
      toast({
        title: "Chart saved successfully!",
        description: `Saved to subcollection users/${identity.npub.slice(0, 10)}.../charts`,
        status: "success",
        duration: 3500,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to save chart",
        description: err.message || "Please check connection.",
        status: "error",
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load a Saved Chart
  const handleSelectChart = (chart) => {
    setChartId(chart.id);
    setTitle(chart.title || "Untitled Chart");
    setChartType(chart.type || "pie");
    setRows(Array.isArray(chart.rows) && chart.rows.length > 0 ? chart.rows : INITIAL_ROWS);
    if (chart.settings?.donutHoleSize) setDonutHolePercent(chart.settings.donutHoleSize);
    if (chart.settings?.paletteKey) setActivePalette(chart.settings.paletteKey);
    onCloseDrawer();
    toast({
      title: `Loaded "${chart.title || "Chart"}"`,
      status: "info",
      duration: 2500,
    });
  };

  // Delete a Chart
  const confirmDeleteChart = async () => {
    if (!deleteCandidate || !identity.npub) return;
    setDeletingChartId(deleteCandidate.id);
    try {
      await deleteChartFromFirestore(identity.npub, deleteCandidate.id);
      setSavedCharts(savedCharts.filter((c) => c.id !== deleteCandidate.id));
      if (chartId === deleteCandidate.id) {
        handleNewChart();
      }
      toast({
        title: "Chart deleted",
        status: "success",
        duration: 2500,
      });
    } catch (err) {
      toast({
        title: "Could not delete chart",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setDeletingChartId(null);
      setDeleteCandidate(null);
    }
  };

  // Calculations for row stats
  const totalValue = useMemo(() => {
    return rows.reduce((acc, r) => acc + (Math.max(0, parseFloat(r.value)) || 0), 0);
  }, [rows]);

  return (
    <Box minH="100vh" bg={bg} color={textColor} transition="background 0.2s ease">
      {/* Top Header Bar */}
      <Box
        bg={surfaceBg}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={20}
        backdropFilter="blur(8px)"
      >
        <Container maxW="7xl" px={{ base: 4, md: 6 }} py={3}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            {/* Left Brand & Title */}
            <HStack spacing={3}>
              <IconButton
                icon={<FaArrowLeft />}
                aria-label="Back"
                size="sm"
                variant="ghost"
                onClick={() => navigate("/")}
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text fontSize="xl" fontWeight="black" letterSpacing="tight">
                    🥧 Pie Charts
                  </Text>
                  <Badge colorScheme="purple" fontSize="xs" borderRadius="full" px={2}>
                    Simple Tool
                  </Badge>
                </HStack>
              </VStack>
            </HStack>

            {/* Editable Chart Title Input */}
            <Box flex="1" maxW={{ base: "100%", md: "320px" }} mx={{ base: 0, md: 4 }}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chart Title..."
                size="sm"
                borderRadius="lg"
                bg={inputBg}
                borderColor={borderColor}
                fontWeight="semibold"
                _focus={{ borderColor: "orange.400" }}
              />
            </Box>

            {/* Right Controls & Actions */}
            <HStack spacing={2}>
              {/* User npub pill */}
              {identity.npub && (
                <Tooltip
                  label={`Nostr identity: ${identity.npub}\nSubcollection: users/${identity.npub}/charts`}
                  hasArrow
                >
                  <Badge
                    variant="subtle"
                    colorScheme="teal"
                    fontSize="xs"
                    borderRadius="md"
                    px={2}
                    py={1}
                    cursor="default"
                    display={{ base: "none", sm: "inline-flex" }}
                  >
                    {identity.npub.slice(0, 8)}...{identity.npub.slice(-4)}
                  </Badge>
                </Tooltip>
              )}

              {/* My Saved Charts */}
              <Button
                size="sm"
                leftIcon={<FaFolderOpen />}
                variant="outline"
                borderColor={borderColor}
                onClick={handleOpenDrawer}
              >
                My Charts
              </Button>

              {/* New Chart */}
              <Button
                size="sm"
                leftIcon={<FaFileAlt />}
                variant="ghost"
                onClick={handleNewChart}
              >
                New
              </Button>

              {/* Save Chart */}
              <Button
                size="sm"
                leftIcon={<FaSave />}
                colorScheme="orange"
                isLoading={isSaving}
                loadingText="Saving..."
                onClick={handleSaveChart}
              >
                Save
              </Button>

              {/* Light/Dark Mode Toggle */}
              <HStack
                spacing={1.5}
                pl={2}
                borderLeft="1px"
                borderColor={borderColor}
                align="center"
              >
                <Box color={colorMode === "light" ? "orange.400" : textMuted} fontSize="sm">
                  <FaSun />
                </Box>
                <Switch
                  size="sm"
                  colorScheme="orange"
                  isChecked={colorMode === "dark"}
                  onChange={handleToggleTheme}
                  aria-label="Toggle dark mode"
                />
                <Box color={colorMode === "dark" ? "purple.300" : textMuted} fontSize="sm">
                  <FaMoon />
                </Box>
              </HStack>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={6}>
        {/* Style Selection Tabs */}
        <Box
          bg={surfaceBg}
          p={3}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={2} wrap="wrap">
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={textMuted} mr={1}>
                Chart Style:
              </Text>
              {CHART_STYLES.map((style) => {
                const isActive = chartType === style.id;
                return (
                  <Button
                    key={style.id}
                    size="sm"
                    variant={isActive ? "solid" : "ghost"}
                    colorScheme={isActive ? "orange" : "gray"}
                    onClick={() => setChartType(style.id)}
                    borderRadius="xl"
                    px={3}
                  >
                    <HStack spacing={1.5}>
                      <Text>{style.icon}</Text>
                      <Text>{style.label}</Text>
                    </HStack>
                  </Button>
                );
              })}
            </HStack>

            {/* Donut Hole Slider if donut */}
            {chartType === "donut" && (
              <HStack spacing={3} minW="190px">
                <Text fontSize="xs" color={textMuted} whiteSpace="nowrap">
                  Hole Size: {donutHolePercent}%
                </Text>
                <Slider
                  aria-label="donut-hole-size"
                  value={donutHolePercent}
                  min={25}
                  max={80}
                  step={5}
                  onChange={(val) => setDonutHolePercent(val)}
                  colorScheme="orange"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={4} />
                </Slider>
              </HStack>
            )}
          </Flex>
        </Box>

        {/* Two-Column Tool Layout */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6} alignItems="start">
          {/* LEFT: Data Rows & Palette Control (7 columns) */}
          <Box gridColumn={{ base: "span 1", lg: "span 7" }}>
            <VStack
              spacing={5}
              align="stretch"
              bg={surfaceBg}
              p={{ base: 4, md: 5 }}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
            >
              {/* Palette Quick-Picker */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={1.5}>
                    <FaPalette size={12} color="#F97316" />
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={textMuted}>
                      Curated Palettes
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={textMuted}>
                    Click to recolor all rows
                  </Text>
                </Flex>
                <Flex wrap="wrap" gap={2}>
                  {Object.entries(COLOR_PALETTES).map(([key, pal]) => {
                    const isSelected = activePalette === key;
                    return (
                      <Button
                        key={key}
                        size="xs"
                        variant={isSelected ? "solid" : "outline"}
                        colorScheme={isSelected ? "orange" : "gray"}
                        borderColor={borderColor}
                        borderRadius="lg"
                        px={2.5}
                        py={1.5}
                        onClick={() => handleApplyPalette(key)}
                      >
                        <HStack spacing={1.5}>
                          <HStack spacing={0.5}>
                            {pal.colors.slice(0, 3).map((c, i) => (
                              <Box key={i} w={2} h={2} borderRadius="full" bg={c} />
                            ))}
                          </HStack>
                          <Text fontSize="xs">{pal.name}</Text>
                        </HStack>
                      </Button>
                    );
                  })}
                </Flex>
              </Box>

              {/* Rows Header */}
              <Flex justify="space-between" align="center" pt={1}>
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize="md">
                    Data Slices
                  </Text>
                  <Badge colorScheme="blue" borderRadius="md" px={2}>
                    {rows.length} rows
                  </Badge>
                </HStack>
                <Button
                  size="sm"
                  leftIcon={<FaPlus />}
                  colorScheme="orange"
                  variant="solid"
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>
              </Flex>

              {/* Table / List of Rows */}
              <VStack spacing={2.5} align="stretch">
                {rows.map((row, index) => {
                  const numVal = Math.max(0, parseFloat(row.value) || 0);
                  const percent = totalValue > 0 ? ((numVal / totalValue) * 100).toFixed(1) : 0;

                  return (
                    <Flex
                      key={row.id}
                      bg={inputBg}
                      p={2.5}
                      borderRadius="xl"
                      align="center"
                      gap={2.5}
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      {/* Row Index */}
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={textMuted}
                        w="20px"
                        textAlign="center"
                      >
                        {index + 1}
                      </Text>

                      {/* Color Picker Swatch Popover */}
                      <Popover placement="bottom-start">
                        <PopoverTrigger>
                          <Box
                            as="button"
                            w="32px"
                            h="32px"
                            borderRadius="lg"
                            bg={row.color || "#3B82F6"}
                            border="2px solid white"
                            boxShadow="0 1px 4px rgba(0,0,0,0.2)"
                            flexShrink={0}
                            cursor="pointer"
                            transition="transform 0.15s ease"
                            _hover={{ transform: "scale(1.1)" }}
                            title="Choose color"
                          />
                        </PopoverTrigger>
                        <PopoverContent
                          bg={surfaceElevated}
                          borderColor={borderColor}
                          borderRadius="xl"
                          p={3}
                          w="280px"
                          boxShadow="xl"
                          zIndex={50}
                        >
                          <PopoverArrow bg={surfaceElevated} />
                          <PopoverHeader
                            border="none"
                            p={0}
                            mb={2}
                            fontSize="xs"
                            fontWeight="bold"
                            color={textMuted}
                            textTransform="uppercase"
                          >
                            Choose Color
                          </PopoverHeader>
                          <PopoverBody p={0}>
                            {/* Preset Swatches */}
                            <SimpleGrid columns={7} spacing={2} mb={3}>
                              {SWATCH_COLORS.map((c) => (
                                <Box
                                  key={c}
                                  as="button"
                                  w="26px"
                                  h="26px"
                                  borderRadius="md"
                                  bg={c}
                                  cursor="pointer"
                                  border={row.color === c ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)"}
                                  transition="transform 0.1s ease"
                                  _hover={{ transform: "scale(1.15)" }}
                                  onClick={() => handleUpdateRow(row.id, "color", c)}
                                />
                              ))}
                            </SimpleGrid>

                            {/* Custom Hex / Color Input */}
                            <HStack spacing={2} pt={2} borderTop="1px" borderColor={borderColor}>
                              <Input
                                type="color"
                                value={row.color || "#3B82F6"}
                                onChange={(e) => handleUpdateRow(row.id, "color", e.target.value)}
                                w="36px"
                                h="32px"
                                p={0.5}
                                borderRadius="md"
                                cursor="pointer"
                              />
                              <Input
                                size="xs"
                                value={row.color || ""}
                                onChange={(e) => handleUpdateRow(row.id, "color", e.target.value)}
                                placeholder="#HEX"
                                fontFamily="monospace"
                                borderRadius="md"
                              />
                            </HStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>

                      {/* Name / Label Input */}
                      <Input
                        value={row.name}
                        onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                        placeholder="Slice name..."
                        size="sm"
                        borderRadius="lg"
                        flex="3"
                        bg={surfaceBg}
                        borderColor={borderColor}
                        _focus={{ borderColor: "orange.400" }}
                      />

                      {/* Value Input */}
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={row.value}
                        onChange={(e) => handleUpdateRow(row.id, "value", e.target.value)}
                        placeholder="Value..."
                        size="sm"
                        borderRadius="lg"
                        flex="2"
                        maxW="110px"
                        bg={surfaceBg}
                        borderColor={borderColor}
                        _focus={{ borderColor: "orange.400" }}
                      />

                      {/* Percentage Badge */}
                      <Badge
                        fontSize="xs"
                        colorScheme="gray"
                        borderRadius="md"
                        w="54px"
                        textAlign="center"
                        py={1}
                        display={{ base: "none", sm: "inline-block" }}
                      >
                        {percent}%
                      </Badge>

                      {/* Delete Row Button */}
                      <IconButton
                        icon={<FaTrash />}
                        aria-label="Delete row"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteRow(row.id)}
                      />
                    </Flex>
                  );
                })}
              </VStack>

              {/* Bottom Add Row + Summary */}
              <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                <Button
                  size="sm"
                  leftIcon={<FaPlus />}
                  variant="outline"
                  borderColor={borderColor}
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>

                <HStack spacing={4}>
                  <Text fontSize="sm" color={textMuted}>
                    Total Sum:
                  </Text>
                  <Text fontSize="lg" fontWeight="black" color={textColor}>
                    {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* RIGHT: Live Chart Viewer (5 columns) */}
          <Box gridColumn={{ base: "span 1", lg: "span 5" }} position={{ lg: "sticky" }} top={{ lg: "80px" }}>
            <PieChartRenderer
              rows={rows}
              chartType={chartType}
              title={title}
              donutHolePercent={donutHolePercent}
              showLegend={true}
              showPercentages={true}
            />
          </Box>
        </SimpleGrid>
      </Container>

      {/* Saved Charts Drawer */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onCloseDrawer} size="md">
        <DrawerOverlay />
        <DrawerContent bg={surfaceBg} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold">
                My Saved Charts
              </Text>
              <Text fontSize="xs" color={textMuted}>
                Stored in subcollection: users/{identity.npub ? `${identity.npub.slice(0, 12)}...` : ""}/charts
              </Text>
            </VStack>
          </DrawerHeader>

          <DrawerBody py={4}>
            {isLoadingSaved ? (
              <VStack spacing={3} align="stretch">
                <Skeleton height="60px" borderRadius="xl" />
                <Skeleton height="60px" borderRadius="xl" />
                <Skeleton height="60px" borderRadius="xl" />
              </VStack>
            ) : savedCharts.length === 0 ? (
              <VStack spacing={4} py={12} align="center" justify="center">
                <Text fontSize="4xl">📂</Text>
                <Text fontWeight="semibold" color={textColor}>
                  No saved charts yet
                </Text>
                <Text fontSize="sm" color={textMuted} textAlign="center">
                  Click the &quot;Save&quot; button at the top to save your current chart to your Nostr account.
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {savedCharts.map((chart) => {
                  const isCurrent = chart.id === chartId;
                  const rowCount = Array.isArray(chart.rows) ? chart.rows.length : 0;
                  const updatedStr = chart.updatedAt
                    ? new Date(chart.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <Box
                      key={chart.id}
                      p={3.5}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={isCurrent ? "orange.400" : borderColor}
                      bg={isCurrent ? useColorModeValue("orange.50", "rgba(249, 115, 22, 0.1)") : inputBg}
                      transition="all 0.15s ease"
                    >
                      <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex="1" mr={2}>
                          <HStack spacing={2}>
                            <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={1}>
                              {chart.title || "Untitled Chart"}
                            </Text>
                            {isCurrent && (
                              <Badge colorScheme="orange" fontSize="2xs">
                                Active
                              </Badge>
                            )}
                          </HStack>
                          <HStack spacing={2} fontSize="xs" color={textMuted}>
                            <Badge variant="outline" fontSize="2xs">
                              {chart.type || "pie"}
                            </Badge>
                            <Text>• {rowCount} slices</Text>
                            <Text>• {updatedStr}</Text>
                          </HStack>
                        </VStack>

                        <HStack spacing={1}>
                          <Button
                            size="xs"
                            colorScheme="orange"
                            variant={isCurrent ? "solid" : "outline"}
                            onClick={() => handleSelectChart(chart)}
                          >
                            Load
                          </Button>
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete saved chart"
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setDeleteCandidate(chart)}
                          />
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={!!deleteCandidate}
        leastDestructiveRef={cancelDeleteRef}
        onClose={() => setDeleteCandidate(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={surfaceBg} color={textColor} borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Saved Chart
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete &quot;{deleteCandidate?.title || "this chart"}&quot;?
              This will permanently remove it from your Nostr subcollection.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={() => setDeleteCandidate(null)} size="sm">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteChart}
                ml={3}
                size="sm"
                isLoading={deletingChartId === deleteCandidate?.id}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
export default ChartsPage;
