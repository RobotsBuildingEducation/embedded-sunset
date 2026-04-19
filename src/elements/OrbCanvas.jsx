import React, { useEffect, useRef } from "react";
import { useColorMode } from "@chakra-ui/react";
import StreamLoader from "./StreamLoader";

export function OrbCanvas({
  isAbsolute = true,
  instructions,
  hasStreamedText = true,
}) {
  const { colorMode } = useColorMode();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvas = useRef(null);
  const particles = useRef([]);
  const animationFrameId = useRef();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offscreen canvas for faster rendering
    offscreenCanvas.current = document.createElement("canvas");
    const offCtx = offscreenCanvas.current.getContext("2d");

    // Resize canvas to fit its container
    const resizeCanvas = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (!nextWidth || !nextHeight) return;

      canvas.width = nextWidth;
      canvas.height = nextHeight;

      offscreenCanvas.current.width = canvas.width;
      offscreenCanvas.current.height = canvas.height;

      particles.current = particles.current.map((particle) => ({
        ...particle,
        x: Math.min(particle.x, canvas.width),
        y: Math.min(particle.y, canvas.height),
      }));
    };

    resizeCanvas();

    // Gradient colors for orbs
    const colors =
      colorMode === "dark"
        ? [
            "rgba(114, 146, 255, 0.45)",
            "rgba(136, 93, 255, 0.5)",
            "rgba(64, 209, 255, 0.35)",
          ]
        : [
            "rgba(147, 51, 234, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(249, 115, 22, 0.8)",
          ];
    const backgroundFade =
      colorMode === "dark" ? "rgba(8, 13, 30, 0.18)" : "rgba(255, 255, 255, 0.12)";

    // Initialize particles
    const particleCount = 30; // Reduced count for optimization
    particles.current = Array.from({ length: particleCount }, (_, index) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 5, // Slower velocity
      vy: (Math.random() - 0.5) * 5,
      radius: Math.random() * 3 + 2,
      colorIndex: index % colors.length,
      colorOffset: Math.random(),
    }));

    const drawParticles = () => {
      const width = canvas.width;
      const height = canvas.height;
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
      const width = canvas.width;
      const height = canvas.height;

      // Fade effect for the main canvas
      ctx.fillStyle = backgroundFade;
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

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resizeCanvas);
      }
    };
  }, [colorMode]);

  const absoluteContainerStyles = {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "100%",
    overflow: "hidden",
    background: "var(--chakra-colors-appBg)",
  };

  const absoluteCanvasStyles = {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
  };

  const inlineContainerStyles = {
    position: "relative",
    width: "200px",
    margin: "0 auto",
  };

  const inlineCanvasStyles = {
    display: "block",
    width: "200px",
    height: "250px",
    minHeight: "min-content",
    borderRadius: "25px",
  };

  return (
    <div
      ref={containerRef}
      style={isAbsolute ? absoluteContainerStyles : inlineContainerStyles}
    >
      <canvas
        ref={canvasRef}
        style={isAbsolute ? absoluteCanvasStyles : inlineCanvasStyles}
      ></canvas>
      {isAbsolute ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <StreamLoader
            isAbsolute={isAbsolute}
            instructions={instructions}
            hasStreamedText={hasStreamedText}
          />
        </div>
      ) : (
        <StreamLoader
          isAbsolute={isAbsolute}
          instructions={instructions}
          hasStreamedText={hasStreamedText}
        />
      )}
    </div>
  );
}
