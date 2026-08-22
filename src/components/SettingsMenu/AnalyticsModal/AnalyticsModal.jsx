// src/components/SettingsMenu/AnalyticsModal/AnalyticsModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaGraduationCap,
  FaCalendarCheck,
  FaTrophy,
  FaClock,
  FaSearch,
  FaShareAlt,
  FaCheckCircle,
  FaLock,
  FaSun,
  FaMoon,
  FaBookOpen,
} from "react-icons/fa";
import { FiTrendingUp, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { fetchUserAnalytics } from "../../../utility/analytics";
import { translation } from "../../../utility/translation";
import { useThemeStore } from "../../../useThemeStore";

const AnalyticsModal = ({ isOpen, onClose, userLanguage = "en", steps = {} }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAnswerId, setExpandedAnswerId] = useState(null);
  const toast = useToast();

  const themeColor = useThemeStore((state) => state.themeColor) || "pink";
  const isSpanish = userLanguage?.includes("es");

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const innerBg = useColorModeValue("gray.50", "gray.900");
  const highlightColor = useColorModeValue(`${themeColor}.500`, `${themeColor}.300`);
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("local_npub") : null;

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    fetchUserAnalytics(userId, steps, userLanguage)
      .then((analyticsResult) => {
        if (isMounted) {
          setData(analyticsResult);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, userLanguage, steps]);

  const filteredAnswers = useMemo(() => {
    if (!data?.answers) return [];
    if (!searchQuery.trim()) return data.answers;
    const q = searchQuery.toLowerCase();
    return data.answers.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.question?.toLowerCase().includes(q) ||
        a.feedback?.toLowerCase().includes(q) ||
        String(a.step).includes(q)
    );
  }, [data?.answers, searchQuery]);

  const handleShareSummary = () => {
    if (!data) return;
    const { totalUniqueSteps, totalCurriculumSteps, streak, unlockedBadgesCount } =
      data.summary;

    const shareText = isSpanish
      ? `📊 ¡Mi progreso en Sunset!\n🎓 Lecciones dominadas: ${totalUniqueSteps}/${totalCurriculumSteps} (${data.summary.completionPercentage}%)\n🔥 Racha actual: ${streak} días\n🏆 Logros desbloqueados: ${unlockedBadgesCount}\n¡Aprende a programar paso a paso!`
      : `📊 My Sunset Learning Stats:\n🎓 Lessons Mastered: ${totalUniqueSteps}/${totalCurriculumSteps} (${data.summary.completionPercentage}%)\n🔥 Current Streak: ${streak} days\n🏆 Badges Earned: ${unlockedBadgesCount}\nLearning code and building software!`;

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast({
          title: isSpanish ? "¡Copiado al portapapeles!" : "Copied to clipboard!",
          description: isSpanish
            ? "Comparte tus estadísticas con tus amigos."
            : "Share your learning stats with friends.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: isSpanish ? "Error al copiar" : "Failed to copy",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const toggleAnswerExpand = (id) => {
    setExpandedAnswerId((prev) => (prev === id ? null : id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="appOverlay" backdropFilter="blur(8px)" />
      <ModalContent
        bg="appSurfaceElevated"
        color="appText"
        m={0}
        borderRadius={{ base: 0, md: "2xl" }}
        maxW="1150px"
        mx="auto"
        my={{ base: 0, md: 6 }}
        maxH={{ base: "100vh", md: "calc(100vh - 48px)" }}
        borderWidth={{ base: 0, md: "1px" }}
        borderColor="appBorderStrong"
        boxShadow="2xl"
        overflow="hidden"
      >
        <ModalHeader
          borderBottomWidth="1px"
          borderColor="appBorderStrong"
          py={4}
          px={6}
          bg={innerBg}
        >
          <Flex justify="space-between" align="center" pr={8}>
            <HStack spacing={3}>
              <Box
                p={2}
                borderRadius="lg"
                bg={`${themeColor}.500`}
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiTrendingUp} boxSize={5} />
              </Box>
              <Box>
                <Heading size="md">
                  {isSpanish ? "Analíticas de Aprendizaje" : "Learning Analytics"}
                </Heading>
                <Text fontSize="xs" color={mutedTextColor}>
                  {isSpanish
                    ? "Historial de progreso, dominio de temas y evaluaciones de IA"
                    : "Progress history, topic mastery, and AI evaluation logs"}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FaShareAlt />}
                variant="outline"
                borderColor="appBorderStrong"
                onClick={handleShareSummary}
                isDisabled={isLoading || !data}
              >
                {isSpanish ? "Compartir" : "Share"}
              </Button>
            </HStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody p={{ base: 4, md: 6 }} overflowY="auto">
          {isLoading ? (
            <Flex justify="center" align="center" minH="400px" direction="column" gap={4}>
              <Spinner size="xl" color={`${themeColor}.500`} thickness="4px" />
              <Text fontSize="sm" color={mutedTextColor}>
                {isSpanish
                  ? "Analizando tus registros de aprendizaje..."
                  : "Crunching your learning data..."}
              </Text>
            </Flex>
          ) : !data ? (
            <Flex justify="center" align="center" minH="300px">
              <Text color={mutedTextColor}>
                {isSpanish ? "No hay datos disponibles" : "No analytics data available"}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={6} align="stretch">
              {/* Top Overview KPI Cards */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {/* 1. Lessons Mastered */}
                <Box
                  p={4}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={cardBorder}
                  boxShadow="sm"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedTextColor}>
                      {isSpanish ? "Progreso del Curso" : "Curriculum Mastery"}
                    </Text>
                    <Icon as={FaGraduationCap} color={highlightColor} boxSize={4} />
                  </HStack>
                  <Heading size="lg" mb={1}>
                    {data.summary.totalUniqueSteps}
                    <Text as="span" fontSize="sm" color={mutedTextColor} fontWeight="normal">
                      /{data.summary.totalCurriculumSteps}
                    </Text>
                  </Heading>
                  <Progress
                    value={data.summary.completionPercentage}
                    size="xs"
                    colorScheme={themeColor}
                    borderRadius="full"
                    mt={2}
                  />
                  <Text fontSize="2xs" color={mutedTextColor} mt={1}>
                    {data.summary.completionPercentage}% {isSpanish ? "completado" : "completed"}
                  </Text>
                </Box>

                {/* 2. Streak & Goals */}
                <Box
                  p={4}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={cardBorder}
                  boxShadow="sm"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedTextColor}>
                      {isSpanish ? "Racha Actual" : "Current Streak"}
                    </Text>
                    <Icon as={FaFire} color="orange.400" boxSize={4} />
                  </HStack>
                  <Heading size="lg" mb={1} color="orange.500">
                    {data.summary.streak}
                    <Text as="span" fontSize="sm" color={mutedTextColor} fontWeight="normal">
                      {" "}{isSpanish ? "días" : "days"}
                    </Text>
                  </Heading>
                  <Text fontSize="2xs" color={mutedTextColor} mt={2}>
                    {isSpanish ? "Meta diaria:" : "Daily goal:"} {data.summary.dailyProgress}/{data.summary.dailyGoals}
                  </Text>
                </Box>

                {/* 3. Study Days & Velocity */}
                <Box
                  p={4}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={cardBorder}
                  boxShadow="sm"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedTextColor}>
                      {isSpanish ? "Días Activos" : "Active Days"}
                    </Text>
                    <Icon as={FaCalendarCheck} color="green.400" boxSize={4} />
                  </HStack>
                  <Heading size="lg" mb={1}>
                    {data.summary.uniqueActiveDays}
                    <Text as="span" fontSize="sm" color={mutedTextColor} fontWeight="normal">
                      {" "}{isSpanish ? "sesiones" : "sessions"}
                    </Text>
                  </Heading>
                  <Text fontSize="2xs" color={mutedTextColor} mt={2}>
                    ~{data.summary.avgPerActiveDay} {isSpanish ? "ejercicios / día activo" : "exercises / active day"}
                  </Text>
                </Box>

                {/* 4. Badges / Achievements */}
                <Box
                  p={4}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={cardBorder}
                  boxShadow="sm"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedTextColor}>
                      {isSpanish ? "Logros" : "Badges Earned"}
                    </Text>
                    <Icon as={FaTrophy} color="yellow.400" boxSize={4} />
                  </HStack>
                  <Heading size="lg" mb={1} color="yellow.500">
                    {data.summary.unlockedBadgesCount}
                    <Text as="span" fontSize="sm" color={mutedTextColor} fontWeight="normal">
                      /{data.summary.totalBadgesCount}
                    </Text>
                  </Heading>
                  <Text fontSize="2xs" color={mutedTextColor} mt={2}>
                    {data.summary.totalSubmissions} {isSpanish ? "evaluaciones registradas" : "submissions logged"}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Main Tabs Navigation */}
              <Tabs variant="soft-rounded" colorScheme={themeColor} isLazy>
                <TabList
                  overflowX="auto"
                  py={2}
                  borderBottomWidth="1px"
                  borderColor="appBorderStrong"
                  gap={2}
                >
                  <Tab fontWeight="600" fontSize="sm">
                    📊 {isSpanish ? "Actividad y Hábitos" : "Activity & Habits"}
                  </Tab>
                  <Tab fontWeight="600" fontSize="sm">
                    📚 {isSpanish ? "Dominio de Temas" : "Topic Mastery"}
                  </Tab>
                  <Tab fontWeight="600" fontSize="sm">
                    🤖 {isSpanish ? "Diario y Feedback de IA" : "AI Feedback Journal"} ({data.answers.length})
                  </Tab>
                  <Tab fontWeight="600" fontSize="sm">
                    🏆 {isSpanish ? "Logros y Medallas" : "Achievements"} ({data.summary.unlockedBadgesCount})
                  </Tab>
                </TabList>

                <TabPanels pt={4}>
                  {/* TAB 1: Activity & Habits */}
                  <TabPanel p={0}>
                    <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
                      {/* Weekly Activity Bar Chart */}
                      <GridItem>
                        <Box
                          p={5}
                          borderRadius="xl"
                          bg={cardBg}
                          borderWidth="1px"
                          borderColor={cardBorder}
                          boxShadow="sm"
                        >
                          <Heading size="sm" mb={1}>
                            {isSpanish ? "Actividad de los Últimos 7 Días" : "Last 7 Days Activity"}
                          </Heading>
                          <Text fontSize="xs" color={mutedTextColor} mb={6}>
                            {isSpanish
                              ? "Preguntas resueltas exitosamente por día"
                              : "Questions successfully answered per day"}
                          </Text>

                          <HStack spacing={3} align="flex-end" justify="space-around" h="160px" pt={4}>
                            {data.recentDays.map((day, idx) => {
                              const maxCount = Math.max(
                                ...data.recentDays.map((d) => d.count),
                                1
                              );
                              const heightPct = Math.max(8, Math.round((day.count / maxCount) * 100));

                              return (
                                <VStack key={idx} spacing={2} flex={1} h="100%" justify="flex-end">
                                  <Text fontSize="xs" fontWeight="bold" color={day.count > 0 ? highlightColor : mutedTextColor}>
                                    {day.count}
                                  </Text>
                                  <Box
                                    w="100%"
                                    maxW="36px"
                                    h={`${heightPct}%`}
                                    borderRadius="md"
                                    bg={
                                      day.isToday
                                        ? `${themeColor}.500`
                                        : day.count > 0
                                        ? `${themeColor}.300`
                                        : innerBg
                                    }
                                    borderWidth={day.count === 0 ? "1px" : "0"}
                                    borderColor={cardBorder}
                                    transition="all 0.3s"
                                    _hover={{ opacity: 0.8 }}
                                  />
                                  <Text
                                    fontSize="2xs"
                                    fontWeight={day.isToday ? "bold" : "normal"}
                                    color={day.isToday ? highlightColor : mutedTextColor}
                                  >
                                    {day.dayLabel}
                                  </Text>
                                </VStack>
                              );
                            })}
                          </HStack>
                        </Box>
                      </GridItem>

                      {/* Time-of-Day Study Habit */}
                      <GridItem>
                        <Box
                          p={5}
                          borderRadius="xl"
                          bg={cardBg}
                          borderWidth="1px"
                          borderColor={cardBorder}
                          boxShadow="sm"
                          h="100%"
                        >
                          <Heading size="sm" mb={1}>
                            {isSpanish ? "Horario Preferido" : "Study Time Habits"}
                          </Heading>
                          <Text fontSize="xs" color={mutedTextColor} mb={4}>
                            {isSpanish ? "Momento del día con más sesiones" : "When you study most actively"}
                          </Text>

                          <VStack spacing={3} align="stretch">
                            <Box p={3} borderRadius="lg" bg={innerBg}>
                              <HStack justify="space-between" mb={1}>
                                <HStack>
                                  <Icon as={FaSun} color="yellow.400" />
                                  <Text fontSize="xs" fontWeight="500">
                                    {isSpanish ? "Mañana (5am - 12pm)" : "Morning (5am - 12pm)"}
                                  </Text>
                                </HStack>
                                <Tag size="sm" colorScheme="yellow">
                                  {data.timeOfDayCounts.morning}
                                </Tag>
                              </HStack>
                            </Box>

                            <Box p={3} borderRadius="lg" bg={innerBg}>
                              <HStack justify="space-between" mb={1}>
                                <HStack>
                                  <Icon as={FaClock} color="orange.400" />
                                  <Text fontSize="xs" fontWeight="500">
                                    {isSpanish ? "Tarde (12pm - 5pm)" : "Afternoon (12pm - 5pm)"}
                                  </Text>
                                </HStack>
                                <Tag size="sm" colorScheme="orange">
                                  {data.timeOfDayCounts.afternoon}
                                </Tag>
                              </HStack>
                            </Box>

                            <Box p={3} borderRadius="lg" bg={innerBg}>
                              <HStack justify="space-between" mb={1}>
                                <HStack>
                                  <Icon as={FaMoon} color="purple.400" />
                                  <Text fontSize="xs" fontWeight="500">
                                    {isSpanish ? "Noche (5pm - 10pm)" : "Evening (5pm - 10pm)"}
                                  </Text>
                                </HStack>
                                <Tag size="sm" colorScheme="purple">
                                  {data.timeOfDayCounts.evening}
                                </Tag>
                              </HStack>
                            </Box>

                            <Box p={3} borderRadius="lg" bg={innerBg}>
                              <HStack justify="space-between" mb={1}>
                                <HStack>
                                  <Icon as={FaMoon} color="blue.400" />
                                  <Text fontSize="xs" fontWeight="500">
                                    {isSpanish ? "Madrugada (10pm - 5am)" : "Late Night (10pm - 5am)"}
                                  </Text>
                                </HStack>
                                <Tag size="sm" colorScheme="blue">
                                  {data.timeOfDayCounts.night}
                                </Tag>
                              </HStack>
                            </Box>
                          </VStack>
                        </Box>
                      </GridItem>
                    </Grid>
                  </TabPanel>

                  {/* TAB 2: Topic Mastery */}
                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch">
                      {data.chapters.map((chapter) => (
                        <Box
                          key={chapter.groupId}
                          p={4}
                          borderRadius="xl"
                          bg={cardBg}
                          borderWidth="1px"
                          borderColor={cardBorder}
                          boxShadow="sm"
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <HStack spacing={3}>
                              <Box
                                p={2}
                                borderRadius="md"
                                bg={chapter.percentage === 100 ? "green.500" : `${themeColor}.500`}
                                color="white"
                              >
                                <Icon
                                  as={chapter.percentage === 100 ? FaCheckCircle : FaBookOpen}
                                  boxSize={4}
                                />
                              </Box>
                              <Box>
                                <Text fontWeight="700" fontSize="sm">
                                  {chapter.name}
                                </Text>
                                <Text fontSize="xs" color={mutedTextColor}>
                                  {chapter.completedSteps} / {chapter.totalSteps} {isSpanish ? "lecciones" : "lessons"}
                                </Text>
                              </Box>
                            </HStack>
                            <Tag
                              size="md"
                              colorScheme={
                                chapter.percentage === 100
                                  ? "green"
                                  : chapter.percentage > 0
                                  ? themeColor
                                  : "gray"
                              }
                              borderRadius="full"
                            >
                              {chapter.percentage}%
                            </Tag>
                          </Flex>
                          <Progress
                            value={chapter.percentage}
                            size="sm"
                            colorScheme={chapter.percentage === 100 ? "green" : themeColor}
                            borderRadius="full"
                            mt={2}
                          />
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>

                  {/* TAB 3: AI Feedback & Study Journal */}
                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch">
                      {/* Search Bar */}
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color={mutedTextColor} />
                        </InputLeftElement>
                        <Input
                          placeholder={
                            isSpanish
                              ? "Buscar por título, pregunta o palabras clave de feedback..."
                              : "Search by title, question, or AI feedback keywords..."
                          }
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          bg={cardBg}
                          borderColor={cardBorder}
                          borderRadius="xl"
                        />
                      </InputGroup>

                      {filteredAnswers.length === 0 ? (
                        <Box
                          p={8}
                          textAlign="center"
                          borderRadius="xl"
                          bg={innerBg}
                          borderWidth="1px"
                          borderColor={cardBorder}
                        >
                          <Icon as={RiRobot2Line} boxSize={10} color={mutedTextColor} mb={2} />
                          <Text fontWeight="600" fontSize="sm">
                            {searchQuery
                              ? isSpanish
                                ? "No se encontraron coincidencias para tu búsqueda."
                                : "No answers match your search filter."
                              : isSpanish
                              ? "Aún no tienes preguntas registradas en el diario."
                              : "No submissions recorded in the study journal yet."}
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor} mt={1}>
                            {isSpanish
                              ? "Resuelve ejercicios en el curso para ver aquí las explicaciones y feedback de la IA."
                              : "Complete exercises in the course to review AI feedback and explanations here."}
                          </Text>
                        </Box>
                      ) : (
                        filteredAnswers.map((item) => {
                          const isExpanded = expandedAnswerId === item.id;
                          const formattedDate = item.timestamp.toLocaleDateString(
                            isSpanish ? "es-ES" : "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          );

                          return (
                            <Box
                              key={item.id}
                              borderRadius="xl"
                              bg={cardBg}
                              borderWidth="1px"
                              borderColor={cardBorder}
                              overflow="hidden"
                              transition="all 0.2s"
                              _hover={{ borderColor: highlightColor }}
                            >
                              <Flex
                                p={4}
                                justify="space-between"
                                align="center"
                                cursor="pointer"
                                onClick={() => toggleAnswerExpand(item.id)}
                              >
                                <HStack spacing={3} flex={1} mr={3}>
                                  <Tag size="sm" colorScheme={themeColor} fontWeight="bold">
                                    #{item.step}
                                  </Tag>
                                  <Box flex={1}>
                                    <Text fontWeight="700" fontSize="sm">
                                      {item.title || (isSpanish ? `Lección ${item.step}` : `Lesson ${item.step}`)}
                                    </Text>
                                    <Text fontSize="2xs" color={mutedTextColor}>
                                      {formattedDate}
                                    </Text>
                                  </Box>
                                </HStack>
                                <HStack>
                                  {item.feedback && (
                                    <Tag size="sm" colorScheme="purple" variant="subtle">
                                      <Icon as={RiRobot2Line} mr={1} /> AI Feedback
                                    </Tag>
                                  )}
                                  <Icon
                                    as={isExpanded ? FiChevronUp : FiChevronDown}
                                    color={mutedTextColor}
                                  />
                                </HStack>
                              </Flex>

                              <AnimatePresence>
                                {isExpanded && (
                                  <Box
                                    as={motion.div}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    px={4}
                                    pb={4}
                                    pt={1}
                                    borderTopWidth="1px"
                                    borderColor={cardBorder}
                                    bg={innerBg}
                                  >
                                    {item.question && (
                                      <Box mb={3}>
                                        <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" color={mutedTextColor} mb={1}>
                                          {isSpanish ? "Pregunta" : "Question"}
                                        </Text>
                                        <Text fontSize="xs" bg={cardBg} p={3} borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                                          {item.question}
                                        </Text>
                                      </Box>
                                    )}

                                    {item.feedback ? (
                                      <Box>
                                        <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" color="purple.400" mb={1}>
                                          {isSpanish ? "Evaluación y Feedback de IA" : "AI Evaluation & Feedback"}
                                        </Text>
                                        <Box
                                          fontSize="xs"
                                          bg={useColorModeValue("purple.50", "gray.800")}
                                          p={3}
                                          borderRadius="md"
                                          borderWidth="1px"
                                          borderColor={useColorModeValue("purple.200", "purple.900")}
                                          color={useColorModeValue("purple.900", "purple.200")}
                                        >
                                          {item.feedback}
                                        </Box>
                                      </Box>
                                    ) : null}
                                  </Box>
                                )}
                              </AnimatePresence>
                            </Box>
                          );
                        })
                      )}
                    </VStack>
                  </TabPanel>

                  {/* TAB 4: Achievements & Badges */}
                  <TabPanel p={0}>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                      {data.badges.map((badge) => (
                        <Box
                          key={badge.id}
                          p={4}
                          borderRadius="xl"
                          bg={cardBg}
                          borderWidth="1px"
                          borderColor={badge.unlocked ? highlightColor : cardBorder}
                          opacity={badge.unlocked ? 1 : 0.7}
                          boxShadow={badge.unlocked ? "md" : "none"}
                          position="relative"
                        >
                          <Flex justify="space-between" align="flex-start" mb={2}>
                            <Text fontSize="2xl">{badge.icon}</Text>
                            <Tag
                              size="sm"
                              colorScheme={badge.unlocked ? "green" : "gray"}
                              borderRadius="full"
                            >
                              <Icon as={badge.unlocked ? FaCheckCircle : FaLock} mr={1} boxSize={3} />
                              {badge.unlocked
                                ? isSpanish ? "Desbloqueado" : "Unlocked"
                                : isSpanish ? "Bloqueado" : "Locked"}
                            </Tag>
                          </Flex>
                          <Heading size="xs" mb={1}>
                            {isSpanish ? badge.titleEs : badge.titleEn}
                          </Heading>
                          <Text fontSize="xs" color={mutedTextColor} mb={3}>
                            {isSpanish ? badge.descEs : badge.descEn}
                          </Text>
                          {!badge.unlocked && (
                            <Progress
                              value={badge.progress * 100}
                              size="xs"
                              colorScheme={themeColor}
                              borderRadius="full"
                            />
                          )}
                        </Box>
                      ))}
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(AnalyticsModal);
