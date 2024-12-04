import { useState, useEffect } from "react";

export const CuteGradient = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animateGradient = () => {
      const elapsedTime = Date.now() - startTime;
      setOffsetX(50 + 25 * Math.sin(elapsedTime * 0.001));
      setOffsetY(50 + 25 * Math.cos(elapsedTime * 0.0015));
      requestAnimationFrame(animateGradient);
    };
    requestAnimationFrame(animateGradient);
  }, []);

  const gradientStyle = {
    background: `radial-gradient(
      circle at ${offsetX}% ${offsetY}%,
      pink, lightpink, hotpink, deepPink
    )`,
    width: "300px",
    height: "400px",
    marginBottom: 24,
  };

  return (
    <div style={gradientStyle}>
      &nbsp;
      <br />
      <br />
    </div>
  );
};
