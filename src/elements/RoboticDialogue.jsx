import React, { useEffect, useRef } from "react";

export const RobotDialogue = ({ text, background = null }) => {
  const colors = ["#f7e0fa", "#e0eefa", "#e0fae0", "#fae0ee"];

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const randomColor = getRandomColor();

  return (
    <div
      style={{
        backgroundColor: background ? randomColor : null,
        padding: background ? "10px" : null,
        borderRadius: 8,
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );
};
