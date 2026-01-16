import React, { useEffect, useState } from "react";
import { VStack, Button, Text } from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { translation } from "../../utility/translation";
import { IoChatbubblesOutline } from "react-icons/io5";
import { soundManager } from "../../utility/soundManager";

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
    soundManager.play("paint");
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
      // case " ":
      case "Enter":
        e.preventDefault();
        if (focusedIndex !== null) {
          if (draggedIndex === null) {
            soundManager.play("select");
            setSelectedIndex(focusedIndex);
            setDraggedIndex(focusedIndex);
          } else {
            soundManager.play("paint");
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
      tabIndex={0} // Make this container focusable
      onKeyDown={handleKeyDown} // Attach the listener directly to the component
      onBlur={() => setFocusedIndex(null)}
      style={{ outline: "none" }} // Remove default focus outline
    >
      <Button
        onMouseDown={() => {
          soundManager.play("intro");
          handleModalCheck(onLearnClick);
        }}
        colorScheme="pink"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            soundManager.play("intro");
            handleModalCheck(onLearnClick);
          }
        }}
        background="pink.400"
        boxShadow="0.5px 0.5px 0px 0px rgba(0, 0, 0,0.75)"
      >
        <IoChatbubblesOutline />
        &nbsp;
        {translation[userLanguage]["app.button.learn"]}
      </Button>
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
                      tabIndex={0}
                      onClick={() => setFocusedIndex(index)}
                      onFocus={() => setFocusedIndex(index)}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: "8px",
                        padding: "16px",
                        border: `${borderSwitches[index] ? "3" : "1"}px solid ${
                          borderSwitches[index] ? "#5ad5ac" : "transparent"
                        }`,
                        borderRadius: "4px",
                        backgroundColor:
                          draggedIndex === index
                            ? "#e2e8f0"
                            : selectedIndex === index
                              ? "#e6f7ff"
                              : "white",
                        boxShadow:
                          focusedIndex === index
                            ? "0 0 0 2px #3182ce"
                            : "0.5px 0.5px 1px 0px rgba(0, 0, 0, 0.75)",
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
