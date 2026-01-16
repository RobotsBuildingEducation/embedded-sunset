import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
  Badge,
  useToast,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  PiSpeakerHighDuotone,
  PiSpeakerSlashDuotone,
  PiArrowLeftBold,
  PiMusicNotesFill,
  PiWaveformBold,
  PiPaintBrushBold,
  PiEraserDuotone,
  PiSparkle,
  PiTrashSimpleBold,
  PiPaletteBold,
  PiCheckCircleFill,
  PiPianoKeysFill,
  PiCursorClickDuotone,
} from "react-icons/pi";
import { soundManager } from "../utility/soundManager";

// Color palette matching the SoundManager's color chords
const COLOR_PALETTE = [
  { name: "Cyan", color: "#00CED1", chord: "Cmaj7" },
  { name: "Blue", color: "#4169E1", chord: "Am7" },
  { name: "Teal", color: "#20B2AA", chord: "Em7" },
  { name: "Green", color: "#3CB371", chord: "Gmaj7" },
  { name: "Purple", color: "#9370DB", chord: "Bbmaj7" },
  { name: "Amber", color: "#FFB347", chord: "Dmaj7" },
  { name: "Pink", color: "#FF69B4", chord: "Fmaj7" },
  { name: "Red", color: "#DC143C", chord: "E5" },
  { name: "White", color: "#F5F5F5", chord: "Cadd9" },
  { name: "Dark", color: "#2F4F4F", chord: "Bdim7" },
];

// Sound definitions with metadata
const BASIC_SOUNDS = [
  {
    id: "click",
    name: "Click",
    description: "Soft pop/tap sound",
    icon: PiCursorClickDuotone,
    color: "blue",
  },
  {
    id: "hover",
    name: "Hover",
    description: "Dynamic pitch tone",
    icon: PiWaveformBold,
    color: "cyan",
  },
  {
    id: "paint",
    name: "Paint",
    description: "Quick brush stroke",
    icon: PiPaintBrushBold,
    color: "green",
  },
  {
    id: "erase",
    name: "Erase",
    description: "Soft descending tone",
    icon: PiEraserDuotone,
    color: "orange",
  },
  {
    id: "pattern",
    name: "Pattern",
    description: "Ascending arpeggio",
    icon: PiMusicNotesFill,
    color: "purple",
  },
  {
    id: "clear",
    name: "Clear",
    description: "Descending sweep",
    icon: PiTrashSimpleBold,
    color: "red",
  },
  {
    id: "colorSwitch",
    name: "Color Switch",
    description: "Quick blip",
    icon: PiPaletteBold,
    color: "pink",
  },
  {
    id: "success",
    name: "Success",
    description: "Rising fifth",
    icon: PiCheckCircleFill,
    color: "teal",
  },
  {
    id: "intro",
    name: "Intro",
    description: "Jazz Cmaj9 chord",
    icon: PiPianoKeysFill,
    color: "yellow",
  },
];

export default function SoundExperiment() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  const [hoverValue, setHoverValue] = useState(50);
  const [brushSize, setBrushSize] = useState(5);
  const [activeSound, setActiveSound] = useState(null);

  const handleVolumeChange = (value) => {
    setVolume(value);
    soundManager.init().catch(() => {});
    soundManager.play("sliderTick");
  };

  const handleToggleSoundEnabled = (event) => {
    soundManager.init().catch(() => {});
    soundManager.play("modeSwitch");
    setSoundEnabled(event.target.checked);
  };

  // Initialize sound manager - MUST be called from user gesture
  const initializeAudio = useCallback(async () => {
    if (isInitialized || isInitializing) return;

    setIsInitializing(true);
    try {
      await soundManager.init();
      setIsInitialized(true);
      // Play intro sound to confirm it works
      setTimeout(() => soundManager.play("intro"), 100);
    } catch (err) {
      console.error("Failed to initialize audio:", err);
      toast({
        title: "Audio initialization failed",
        description: "Please try tapping again",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, isInitializing, toast]);

  // Sync volume with sound manager
  useEffect(() => {
    soundManager.setVolume(volume / 100);
  }, [volume]);

  // Sync enabled state
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const playSound = useCallback(
    (soundId) => {
      if (!isInitialized) {
        toast({
          title: "Audio not ready",
          description: "Please wait for audio to initialize",
          status: "warning",
          duration: 2000,
        });
        return;
      }
      setActiveSound(soundId);
      soundManager.play(soundId);
      setTimeout(() => setActiveSound(null), 300);
    },
    [isInitialized, toast]
  );

  const playHoverSound = useCallback(
    (value) => {
      if (!isInitialized) return;
      soundManager.playHover(value / 100);
    },
    [isInitialized]
  );

  const playBrushSizeSound = useCallback(
    (size) => {
      if (!isInitialized) return;
      soundManager.playBrushSize(size, 10);
    },
    [isInitialized]
  );

  const playColorChord = useCallback(
    (index) => {
      if (!isInitialized) return;
      soundManager.playColorSwitch(index, COLOR_PALETTE.length);
    },
    [isInitialized]
  );

  // Show start screen if not initialized
  if (!isInitialized) {
    return (
      <Box
        minH="100dvh"
        bg="linear-gradient(135deg, #0b1220 0%, #1a1a2e 50%, #16213e 100%)"
        color="gray.100"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={8}
        textAlign="center"
      >
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading size="2xl" fontWeight="bold">
              Sound Laboratory
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Explore synthesized sounds with Tone.js
            </Text>
          </VStack>

          <Button
            onClick={initializeAudio}
            isLoading={isInitializing}
            loadingText="Starting..."
            size="lg"
            colorScheme="teal"
            px={12}
            py={8}
            fontSize="xl"
            borderRadius="2xl"
            leftIcon={<PiSpeakerHighDuotone size={28} />}
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "0 0 30px rgba(56, 178, 172, 0.5)",
            }}
            transition="all 0.2s ease"
          >
            Tap to Start Audio
          </Button>

          <Text color="gray.500" fontSize="sm" maxW="300px">
            Audio requires user interaction to start due to browser policies
          </Text>

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
            leftIcon={<PiArrowLeftBold />}
          >
            Back to Home
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      minH="100dvh"
      bg="linear-gradient(135deg, #0b1220 0%, #1a1a2e 50%, #16213e 100%)"
      color="gray.100"
      p={{ base: 4, md: 8 }}
      overflow="auto"
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexWrap="wrap"
        gap={4}
      >
        <HStack spacing={4}>
          <IconButton
            aria-label="Go back"
            icon={<PiArrowLeftBold />}
            onClick={() => navigate("/")}
            variant="ghost"
            size="lg"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg" fontWeight="bold">
              Sound Laboratory
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Explore synthesized sounds with Tone.js
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.400">
              Volume
            </Text>
            <Slider
              aria-label="volume"
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              w="100px"
            >
              <SliderTrack bg="gray.700">
                <SliderFilledTrack bg="duo.500" />
              </SliderTrack>
              <SliderThumb boxSize={4} />
            </Slider>
            <Text fontSize="sm" w="40px" textAlign="right">
              {volume}%
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Switch
              isChecked={soundEnabled}
              onChange={handleToggleSoundEnabled}
              colorScheme="teal"
            />
            {soundEnabled ? (
              <PiSpeakerHighDuotone size={20} />
            ) : (
              <PiSpeakerSlashDuotone size={20} />
            )}
          </HStack>
        </HStack>
      </Flex>

      {/* Status Badge */}
      <Flex justify="center" mb={6}>
        <Badge
          colorScheme="green"
          px={4}
          py={2}
          borderRadius="full"
          fontSize="sm"
        >
          Audio Engine Ready
        </Badge>
      </Flex>

      {/* Basic Sounds Grid */}
      <Box mb={10}>
        <Heading size="md" mb={4} color="gray.300">
          Basic Sounds
        </Heading>
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          }}
          gap={4}
        >
          {BASIC_SOUNDS.map((sound) => {
            const Icon = sound.icon;
            const isActive = activeSound === sound.id;
            return (
              <Tooltip key={sound.id} label={sound.description} placement="top">
                <Button
                  onClick={() => playSound(sound.id)}
                  colorScheme={sound.color}
                  variant="solid"
                  h="auto"
                  py={6}
                  flexDir="column"
                  gap={2}
                  position="relative"
                  overflow="hidden"
                  transform={isActive ? "scale(0.95)" : "scale(1)"}
                  transition="all 0.15s ease"
                  _before={
                    isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          bg: "whiteAlpha.300",
                          animation: "pulse 0.3s ease-out",
                        }
                      : {}
                  }
                >
                  <Icon size={32} />
                  <Text fontWeight="semibold">{sound.name}</Text>
                </Button>
              </Tooltip>
            );
          })}
        </Grid>
      </Box>

      {/* Interactive Sounds */}
      <Box mb={10}>
        <Heading size="md" mb={4} color="gray.300">
          Interactive Controls
        </Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          {/* Hover Pitch Control */}
          <Box
            bg="whiteAlpha.50"
            borderRadius="xl"
            p={6}
            border="1px solid"
            borderColor="gray.700"
          >
            <HStack justify="space-between" mb={4}>
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="lg">
                  Hover Pitch
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Slide to change pitch (C5 to C6)
                </Text>
              </VStack>
              <Badge colorScheme="cyan" fontSize="md" px={3}>
                {hoverValue}%
              </Badge>
            </HStack>
            <Slider
              aria-label="hover-pitch"
              value={hoverValue}
              onChange={(val) => {
                setHoverValue(val);
                soundManager.init().catch(() => {});
                soundManager.play("sliderTick");
                playHoverSound(val);
              }}
              min={0}
              max={100}
              step={1}
            >
              <SliderTrack bg="gray.700" h={3} borderRadius="full">
                <SliderFilledTrack bg="linear-gradient(90deg, #00CED1, #4169E1)" />
              </SliderTrack>
              <SliderThumb boxSize={6} bg="cyan.400" />
            </Slider>
          </Box>

          {/* Brush Size Control */}
          <Box
            bg="whiteAlpha.50"
            borderRadius="xl"
            p={6}
            border="1px solid"
            borderColor="gray.700"
          >
            <HStack justify="space-between" mb={4}>
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="lg">
                  Brush Size
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Size-reactive pitch (C4 to C5)
                </Text>
              </VStack>
              <Badge colorScheme="green" fontSize="md" px={3}>
                {brushSize}
              </Badge>
            </HStack>
            <Slider
              aria-label="brush-size"
              value={brushSize}
              onChange={(val) => {
                setBrushSize(val);
                soundManager.init().catch(() => {});
                soundManager.play("sliderTick");
                playBrushSizeSound(val);
              }}
              min={1}
              max={10}
              step={1}
            >
              <SliderTrack bg="gray.700" h={3} borderRadius="full">
                <SliderFilledTrack bg="linear-gradient(90deg, #3CB371, #90EE90)" />
              </SliderTrack>
              <SliderThumb boxSize={6} bg="green.400" />
            </Slider>
          </Box>
        </Grid>
      </Box>

      {/* Color Chord Palette */}
      <Box mb={10}>
        <Heading size="md" mb={4} color="gray.300">
          Color Chords
        </Heading>
        <Text color="gray.400" fontSize="sm" mb={4}>
          Each color triggers a unique chord with its own emotional vibe
        </Text>
        <Grid
          templateColumns={{
            base: "repeat(5, 1fr)",
            md: "repeat(10, 1fr)",
          }}
          gap={3}
        >
          {COLOR_PALETTE.map((color, index) => (
            <Tooltip
              key={color.name}
              label={`${color.name} - ${color.chord}`}
              placement="top"
            >
              <Button
                onClick={() => playColorChord(index)}
                bg={color.color}
                _hover={{
                  bg: color.color,
                  transform: "scale(1.1)",
                  boxShadow: `0 0 20px ${color.color}`,
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                w="100%"
                h={{ base: "50px", md: "60px" }}
                borderRadius="lg"
                transition="all 0.2s ease"
                position="relative"
              >
                <VStack spacing={0}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={
                      color.name === "White" || color.name === "Amber"
                        ? "gray.800"
                        : "white"
                    }
                    textShadow={
                      color.name === "Dark"
                        ? "0 0 4px rgba(255,255,255,0.5)"
                        : "none"
                    }
                    display={{ base: "none", md: "block" }}
                  >
                    {color.chord}
                  </Text>
                </VStack>
              </Button>
            </Tooltip>
          ))}
        </Grid>
      </Box>

      {/* Sound Visualization Hint */}
      <Box
        bg="whiteAlpha.50"
        borderRadius="xl"
        p={6}
        border="1px solid"
        borderColor="gray.700"
        textAlign="center"
      >
        <HStack justify="center" spacing={2} mb={2}>
          <PiSparkle size={24} />
          <Text fontWeight="semibold" fontSize="lg">
            About These Sounds
          </Text>
        </HStack>
        <Text color="gray.400" fontSize="sm" maxW="600px" mx="auto">
          All sounds are synthesized in real-time using Tone.js. No audio files
          are loaded - everything is generated programmatically with
          oscillators, envelopes, and effects. The system uses synth pooling for
          performance optimization.
        </Text>
      </Box>
    </Box>
  );
}
