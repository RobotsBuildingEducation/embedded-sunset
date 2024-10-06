import React, { useEffect, useState } from "react";
import { VStack, Button, Text } from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { translation } from "../../utility/translation";

const SelectOrderQuestion = ({
  step,
  items,
  setItems,
  onLearnClick,
  userLanguage,
  handleModalCheck,
}) => {
  const [borderSwitches, setBorderSwitches] = useState({});
  const [focusedIndex, setFocusedIndex] = useState(null); // Track the currently focused item
  const [selectedIndex, setSelectedIndex] = useState(null); // Track the currently selected item
  const [draggedIndex, setDraggedIndex] = useState(null); // Track the picked-up item index

  // Compare items with the answer set
  const indexMatcher = (newItems) => {
    let answerSet = step.question.answer;
    let switches = {};
    for (let i = 0; i < answerSet.length; i++) {
      switches[i] = newItems[i] === answerSet[i];
    }
    setBorderSwitches(switches);
  };

  // Handles the end of a drag operation
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    setItems(reorderedItems);
    setFocusedIndex(null); // Reset focus after drag and drop
  };

  // Handle keyboard navigation and drag/drop operations
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
            : 0
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
            : 0
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex !== null) {
          if (draggedIndex === null) {
            // Pick up or select the item
            setSelectedIndex(focusedIndex); // Set the item as selected
            setDraggedIndex(focusedIndex);
          } else {
            // Drop the item
            const reorderedItems = Array.from(items);
            const [removed] = reorderedItems.splice(draggedIndex, 1);
            reorderedItems.splice(focusedIndex, 0, removed);
            setItems(reorderedItems);
            setDraggedIndex(null);
          }
        }
        break;
      case "Escape":
        // Deselect if Escape is pressed
        setFocusedIndex(null);
        setDraggedIndex(null);
        setSelectedIndex(null); // Deselect the currently selected item
        break;
      default:
        break;
    }
  };

  // Global key listener for Arrow keys to bring focus back to the component
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        focusedIndex === null &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        e.preventDefault();
        setFocusedIndex(selectedIndex !== null ? selectedIndex : 0); // Bring focus back to the selected or first item
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [focusedIndex, selectedIndex]);

  // Reset focus when tabbing away
  const handleBlur = () => {
    setFocusedIndex(null);
  };

  useEffect(() => {
    indexMatcher(items);
  }, [items]);

  useEffect(() => {
    // Set up keydown event listener for the component
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      // Cleanup keydown event listener
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, draggedIndex]);

  return (
    <VStack spacing={4} onBlur={handleBlur}>
      {/* Learn Button */}
      <Button
        onMouseDown={() => handleModalCheck(onLearnClick)}
        colorScheme="pink"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleModalCheck(onLearnClick);
          }
        }}
        background="pink.400"
      >
        {translation[userLanguage]["app.button.learn"]}
      </Button>
      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      tabIndex={0} // Make items focusable
                      onClick={() => setFocusedIndex(index)} // Allow mouse clicks to change focus
                      onFocus={() => setFocusedIndex(index)} // Set focus when item is focused
                      onBlur={handleBlur} // Handle focus leaving the item
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: "8px",
                        padding: "16px",
                        border: `${borderSwitches[index] ? "3" : "1"}px solid ${
                          borderSwitches[index] ? "#5ad5ac" : "gray"
                        }`,
                        borderRadius: "4px",
                        backgroundColor:
                          draggedIndex === index
                            ? "#e2e8f0"
                            : selectedIndex === index
                              ? "#e6f7ff" // Highlight the selected item
                              : "white",
                        boxShadow:
                          focusedIndex === index
                            ? "0 0 0 2px #3182ce" // Highlight the focused item
                            : "0 1px 1px rgba(0, 0, 0, 0.1)",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {index + 1 + ". " + item}
                      {draggedIndex === index && (
                        <Text fontSize="sm" color="gray.500">
                          (Picked up)
                        </Text>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </VStack>
  );
};

export default SelectOrderQuestion;
