import React, { useEffect, useRef } from "react";
import StreamLoader from "./StreamLoader";

export function OrbCanvas({
  isAbsolute = true,
  instructions,
  hasStreamedText = true,
}) {
  const canvasRef = useRef(null);
  const offscreenCanvas = useRef(null);
  const particles = useRef([]);
  const animationFrameId = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offscreen canvas for faster rendering
    offscreenCanvas.current = document.createElement("canvas");
    const offCtx = offscreenCanvas.current.getContext("2d");

    // Resize canvas to fit its container
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      offscreenCanvas.current.width = canvas.width;
      offscreenCanvas.current.height = canvas.height;
    };

    resizeCanvas();

    const width = canvas.width;
    const height = canvas.height;

    // Gradient colors for orbs
    const colors = [
      "rgba(147, 51, 234, 0.8)", // Purple
      "rgba(236, 72, 153, 0.8)", // Pink
      "rgba(249, 115, 22, 0.8)", // Orange
    ];

    // Initialize particles
    const particleCount = 30; // Reduced count for optimization
    particles.current = Array.from({ length: particleCount }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 5, // Slower velocity
      vy: (Math.random() - 0.5) * 5,
      radius: Math.random() * 3 + 2,
      colorIndex: index % colors.length,
      colorOffset: Math.random(),
    }));

    const drawParticles = () => {
      offCtx.clearRect(0, 0, width, height);

      particles.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Smoothly transition particle colors
        const gradientIndex = Math.floor(
          (particle.colorOffset + performance.now() * 0.001) % colors.length
        );
        const color = colors[gradientIndex];

        // Draw particle
        offCtx.fillStyle = color;
        offCtx.beginPath();
        offCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        offCtx.fill();
      });
    };

    const animate = () => {
      // Fade effect for the main canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Render particles onto the offscreen canvas
      drawParticles();

      // Draw the offscreen canvas onto the main canvas
      ctx.drawImage(offscreenCanvas.current, 0, 0);

      // Draw connecting lines on the main canvas
      particles.current.forEach((particle, i) => {
        particles.current.slice(i + 1).forEach((other) => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const gradientIndex = Math.floor(
              (particle.colorOffset + performance.now() * 0.001) % colors.length
            );
            const lineGradient = ctx.createLinearGradient(
              particle.x,
              particle.y,
              other.x,
              other.y
            );
            lineGradient.addColorStop(0, colors[gradientIndex]);
            lineGradient.addColorStop(
              1,
              colors[(gradientIndex + 1) % colors.length]
            );

            ctx.strokeStyle = lineGradient;
            ctx.globalAlpha = 1 - distance / 100; // Fading lines
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.globalAlpha = 1; // Reset alpha
          }
        });
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // Listen for window resize events
    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      {isAbsolute ? (
        <StreamLoader
          isAbsolute={isAbsolute}
          instructions={instructions}
          hasStreamedText={hasStreamedText}
        />
      ) : null}

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: isAbsolute ? "100%" : "200px",
          height: isAbsolute ? "100%" : "250px",
          minHeight: isAbsolute ? "100vh" : "min-content",
          borderRadius: isAbsolute ? "0px" : "25px",
        }}
      ></canvas>
      {!isAbsolute ? (
        <StreamLoader
          isAbsolute={isAbsolute}
          instructions={instructions}
          hasStreamedText={hasStreamedText}
        />
      ) : null}
    </>
  );
}
