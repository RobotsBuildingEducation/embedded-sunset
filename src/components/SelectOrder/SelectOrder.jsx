import React, { useEffect, useState } from "react";
import { VStack, Button, Text, Box, useColorModeValue } from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { translation } from "../../utility/translation";
import { IoChatbubblesOutline } from "react-icons/io5";
import { triggerHaptic } from "tactus";

const SelectOrderQuestion = ({
  step,
  items,
  setItems,
  onLearnClick,
  userLanguage,
  handleModalCheck,
}) => {
  const [borderSwitches, setBorderSwitches] = useState({});
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const cardShadow = useColorModeValue(
    "0 14px 30px rgba(15, 23, 42, 0.08)",
    "0px 4px 0px rgba(0, 0, 0, 0.58)",
  );
  const interactiveCardShadow = useColorModeValue(
    "0 16px 32px rgba(15, 23, 42, 0.1)",
    "0px 4px 0px rgba(0, 0, 0, 0.72)",
  );
  const selectedCardShadow = useColorModeValue(
    "0 16px 34px rgba(15, 23, 42, 0.11)",
    "0px 4px 0px rgba(0, 0, 0, 0.68)",
  );
  const actionShadow = useColorModeValue(
    "0 12px 24px rgba(15, 23, 42, 0.12)",
    "0 16px 34px rgba(2, 6, 23, 0.42)",
  );
  const focusRing = useColorModeValue(
    "0 0 0 3px rgba(236, 72, 153, 0.22)",
    "0 0 0 3px rgba(244, 114, 182, 0.3)",
  );

  const indexMatcher = (newItems) => {
    let answerSet = step.question.answer;
    let switches = {};
    for (let i = 0; i < answerSet.length; i++) {
      switches[i] = newItems[i] === answerSet[i];
    }
    setBorderSwitches(switches);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    setItems(reorderedItems);
    setFocusedIndex(null);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex !== null
            ? prevIndex > 0
              ? prevIndex - 1
              : items.length - 1
            : 0,
        );
        break;
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        setFocusedIndex((prevIndex) =>
          prevIndex !== null
            ? prevIndex < items.length - 1
              ? prevIndex + 1
              : 0
            : 0,
        );
        break;
      // case " ":
      case "Enter":
        e.preventDefault();
        if (focusedIndex !== null) {
          if (draggedIndex === null) {
            setSelectedIndex(focusedIndex);
            setDraggedIndex(focusedIndex);
          } else {
            const reorderedItems = Array.from(items);
            const [removed] = reorderedItems.splice(draggedIndex, 1);
            reorderedItems.splice(focusedIndex, 0, removed);
            setItems(reorderedItems);
            setDraggedIndex(null);
          }
        }
        break;
      case "Escape":
        setFocusedIndex(null);
        setDraggedIndex(null);
        setSelectedIndex(null);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    indexMatcher(items);
  }, [items]);

  // Attach the keydown event listener directly to the component's wrapper
  return (
    <VStack
      spacing={4}
      width="100%"
      maxWidth="600px"
      align="stretch"
      tabIndex={0} // Make this container focusable
      onKeyDown={handleKeyDown} // Attach the listener directly to the component
      onBlur={() => setFocusedIndex(null)}
      style={{ outline: "none" }} // Remove default focus outline
    >
      <Button
        onMouseDown={() => {
          triggerHaptic();
          handleModalCheck(onLearnClick);
        }}
        colorScheme="pink"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            triggerHaptic();
            handleModalCheck(onLearnClick);
          }
        }}
        background="pink.400"
        color="white"
        boxShadow={actionShadow}
        alignSelf="center"
        _hover={{ bg: "pink.500" }}
        _active={{ bg: "pink.500" }}
      >
        <IoChatbubblesOutline />
        &nbsp;
        {translation[userLanguage]["app.button.learn"]}
      </Button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              width="100%"
            >
              {items.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      tabIndex={0}
                      onClick={() => setFocusedIndex(index)}
                      onFocus={() => setFocusedIndex(index)}
                      aria-pressed={draggedIndex === index}
                      mb={2}
                      px={6}
                      py={5}
                      borderRadius="2xl"
                      borderWidth={borderSwitches[index] ? "2px" : "1px"}
                      borderColor={
                        borderSwitches[index] ? "green.300" : "appBorder"
                      }
                      bg={
                        draggedIndex === index
                          ? "appSurfaceStrong"
                          : selectedIndex === index
                            ? "appSurfaceMuted"
                            : "appSurface"
                      }
                      color="appText"
                      boxShadow={
                        focusedIndex === index
                          ? `${interactiveCardShadow}, ${focusRing}`
                          : draggedIndex === index || selectedIndex === index
                            ? selectedCardShadow
                            : cardShadow
                      }
                      textAlign="left"
                      cursor={draggedIndex === index ? "grabbing" : "grab"}
                      touchAction="none"
                      userSelect="none"
                      transition="background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
                      _hover={{
                        bg:
                          draggedIndex === index
                            ? "appSurfaceStrong"
                            : "appSurfaceMuted",
                        borderColor: borderSwitches[index]
                          ? "green.300"
                          : "appBorderStrong",
                        boxShadow: interactiveCardShadow,
                      }}
                      style={{
                        ...provided.draggableProps.style,
                        WebkitTapHighlightColor: "transparent",
                        WebkitTouchCallout: "none",
                      }}
                    >
                      {index + 1 + ". " + item}
                      {draggedIndex === index && (
                        <Text mt={2} fontSize="sm" color="appTextMuted">
                          (Picked up)
                        </Text>
                      )}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </VStack>
  );
};

export default SelectOrderQuestion;
