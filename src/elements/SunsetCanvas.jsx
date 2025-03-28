import React, { useEffect, useRef, useState } from "react";
import { createNoise2D } from "simplex-noise";

import { FadeInComponent } from "./RandomCharacter";
import { StreamLoader } from "./StreamLoader";
import { Noise } from "noisejs";

function hexToHSL(H) {
  let hex = H.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;
  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return {
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  };
}

export const SunsetCanvas = ({
  alternativeSpeed = null,
  isLoader = false,
  hasAnimation = true,
  hasInitialFade = true,
  regulateWidth = true,
  // New props for outline customization
  outlineColor = "#000",
  outlineWidth = 0.75,
}) => {
  const canvasRef = useRef(null);
  let requestId;

  const draw = (ctx, frameCount) => {
    const oscillationSpeed = 0.0025;
    const time = Date.now() * oscillationSpeed;
    const colors = ["#f2dcfa", "#f9d4fa", "#fca4b3", "#fcb7a4", "#fcd4a4"];

    ctx.beginPath();
    const numPoints = 16;
    const angleStep = (Math.PI * 2) / numPoints;
    const minRadius = 50;
    const maxRadius = 200;
    const smoothingFactor = 0.65;
    let prevX = 0;
    let prevY = 0;
    for (let i = 0; i <= numPoints; i++) {
      const angle = i * angleStep;
      const radius =
        minRadius +
        (maxRadius - minRadius) *
          (0.5 + 0.5 * Math.sin(time + i * 0.3)) *
          Math.sin(time * 0.5);
      const x = ctx.canvas.width / 2 + radius * Math.cos(angle);
      const y = ctx.canvas.height / 2 + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
        prevX = x;
        prevY = y;
      } else {
        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;
        const controlX = prevX + (midX - prevX) * smoothingFactor;
        const controlY = prevY + (midY - y) * smoothingFactor;
        ctx.quadraticCurveTo(controlX, controlY, midX, midY);
        prevX = x;
        prevY = y;
      }
    }
    ctx.closePath();

    const gradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    for (let i = 0; i < colors.length; i++) {
      const colorHSL = hexToHSL(colors[i]);
      const stopPosition = i / (colors.length - 1);
      gradient.addColorStop(
        stopPosition,
        `hsl(${colorHSL.hue}, ${colorHSL.saturation}%, ${
          colorHSL.lightness + Math.sin(time + i * 2) * 10
        }%)`
      );
    }

    // Fill the shape with the gradient
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the outline around the shape
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
  };

  const animate = (ctx) => {
    requestId = requestAnimationFrame(() => animate(ctx));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    draw(ctx, requestId * 0.08);
  };

  useEffect(() => {
    if (hasAnimation) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = 75;
      canvas.height = 75;
      animate(context);
      return () => {
        cancelAnimationFrame(requestId);
      };
    }
  }, []);

  return (
    <FadeInComponent speed={hasInitialFade ? "1s" : "0s"}>
      <div
        style={{
          width: regulateWidth ? null : "100%",
          minWidth: regulateWidth ? null : "300px",
          maxWidth: regulateWidth ? null : "600px",
          display: isLoader ? "flex" : null,
          flexDirection: isLoader ? "column" : "",
          alignItems: isLoader ? "center" : "",
          textAlign: regulateWidth ? "left" : null,
        }}
      >
        {hasAnimation ? (
          <div>
            <canvas
              style={{
                borderRadius: "45%",
              }}
              ref={canvasRef}
            ></canvas>
          </div>
        ) : null}

        {isLoader === true ? <StreamLoader /> : null}
      </div>
    </FadeInComponent>
  );
};

export const BigSunset = () => {
  const canvasRef = useRef(null);
  let requestId;

  const draw = (ctx, frameCount) => {
    const oscillationSpeed = 0.0025;
    const time = Date.now() * oscillationSpeed;

    const colors = [
      "#E6E6FA", // Lavender
      "#FFC0CB", // Pink
      "#ADD8E6", // Light Blue
      "#DDA0DD", // Plum
      "#F0E6FA", // Lavender Blush
    ];

    ctx.beginPath();
    const numPoints = 16;
    const angleStep = (Math.PI * 2) / numPoints;
    const minRadius = 50;
    const maxRadius = 200;
    const smoothingFactor = 0.05;
    let prevX = 0;
    let prevY = 0;
    for (let i = 0; i <= numPoints; i++) {
      const angle = i * angleStep;
      const radius =
        minRadius +
        (maxRadius - minRadius) *
          (0.5 + 0.5 * Math.sin(time + i * 0.3)) *
          Math.sin(time * 0.5);
      const x = ctx.canvas.width / 2 + radius * Math.cos(angle);
      const y = ctx.canvas.height / 2 + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
        prevX = x;
        prevY = y;
      } else {
        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;
        const controlX = prevX + (midX - prevX) * smoothingFactor;
        const controlY = prevY + (midY - y) * smoothingFactor;
        ctx.quadraticCurveTo(controlX, controlY, midX, midY);
        prevX = x;
        prevY = y;
      }
    }
    ctx.closePath();

    const gradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    for (let i = 0; i < colors.length; i++) {
      const colorHSL = hexToHSL(colors[i]);
      const stopPosition = i / (colors.length - 1);
      gradient.addColorStop(
        stopPosition,
        `hsl(${colorHSL.hue}, ${colorHSL.saturation}%, ${
          colorHSL.lightness + Math.sin(time + i * 2) * 10
        }%)`
      );
    }

    ctx.fillStyle = gradient;
    ctx.fill();
  };

  const animate = (ctx) => {
    requestId = requestAnimationFrame(() => animate(ctx));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    draw(ctx, requestId * 0.08);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 300;
    animate(context);
    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <>
      <canvas
        style={{
          borderRadius: "45%",
          zoom: "0.25",
        }}
        ref={canvasRef}
      ></canvas>
    </>
  );
};

function hexToRGB(hex) {
  let cleaned = hex.replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return [
    parseInt(cleaned.substr(0, 2), 16),
    parseInt(cleaned.substr(2, 2), 16),
    parseInt(cleaned.substr(4, 2), 16),
  ];
}
// Fractal Brownian Motion (fBm) function.
function fbm(noise, x, y, octaves = 4, persistence = 0.5) {
  let total = 0,
    frequency = 1,
    amplitude = 1,
    maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    total += noise.perlin2(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }
  return total / maxValue;
}

export const CloudCanvas = ({
  alternativeSpeed = null, // if provided, overrides shape oscillation speed
  isLoader = false,
  hasAnimation = true,
  hasInitialFade = true,
  regulateWidth = true,
  // Outline customization:
  outlineColor = "#000",
  outlineWidth = 0,
}) => {
  const canvasRef = useRef(null);
  let requestId;

  // Noise generator for cloud gradient (used in fbm)
  const noise = new Noise(Math.random());

  // Cloud gradient parameters
  const cloudPalette = ["#f2dcfa", "#f9d4fa", "#fca4b3", "#fcb7a4", "#fcd4a4"];
  const cloudPaletteRGB = cloudPalette.map(hexToRGB);
  const groupOffsets = [0, 10, 20, 30, 40];
  const groupPhases = [0, 1.5, 3, 4.5, 6];
  const beta = 10;
  const scale = 2;
  // Oscillation speeds
  const shapeOscSpeed = alternativeSpeed ?? 0.0025;
  const cloudOscSpeed = 0.00015;

  // Linear interpolation helper
  const lerp = (a, b, t) => a + (b - a) * t;
  // Optionally, you can apply an easing function to t for a smoother feel:
  // const ease = t => t * t * (3 - 2 * t);

  const draw = (ctx) => {
    const now = Date.now();
    const timeShape = now * shapeOscSpeed;
    const timeCloud = now * cloudOscSpeed;

    // --- Shape Construction with Smooth Transition Between Point Counts ---
    ctx.beginPath();

    // Define discrete target values and cycle duration
    const possiblePoints = [16, 32, 64, 128, 256];
    const cycleDuration = 5000; // ms per transition
    const totalCycle = possiblePoints.length * cycleDuration;
    const cycleTime = now % totalCycle;

    const lowerIndex = Math.floor(cycleTime / cycleDuration);
    const upperIndex = (lowerIndex + 1) % possiblePoints.length;
    const fraction = (cycleTime % cycleDuration) / cycleDuration;
    // Smoothly interpolate between the current and next target.
    const effectivePoints = lerp(
      possiblePoints[lowerIndex],
      possiblePoints[upperIndex],
      fraction
    );

    // Use the continuous effectivePoints value to compute angle step.
    const angleStep = (Math.PI * 2) / effectivePoints;
    const minRadius = 45;
    const maxRadius = 70;
    const smoothingFactor = 0.65;

    let prevX = 0;
    let prevY = 0;
    // Loop using Math.ceil(effectivePoints) to ensure we cover the full circle.
    const steps = Math.ceil(effectivePoints);
    for (let i = 0; i <= steps; i++) {
      // We compute the parameter t along the circle as a fraction of effectivePoints.
      const t = i / effectivePoints;
      const angle = t * Math.PI * 2;
      const radius =
        minRadius +
        (maxRadius - minRadius) *
          (0.5 + 0.5 * Math.sin(timeShape + i * 0.3)) *
          Math.sin(timeShape * 0.5);
      const x = ctx.canvas.width / 2 + radius * Math.cos(angle);
      const y = ctx.canvas.height / 2 + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
        prevX = x;
        prevY = y;
      } else {
        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;
        const controlX = prevX + (midX - prevX) * smoothingFactor;
        const controlY = prevY + (midY - y) * smoothingFactor;
        ctx.quadraticCurveTo(controlX, controlY, midX, midY);
        prevX = x;
        prevY = y;
      }
    }
    ctx.closePath();

    // --- Cloud Gradient remains unchanged ---
    const offCanvas = document.createElement("canvas");
    offCanvas.width = ctx.canvas.width;
    offCanvas.height = ctx.canvas.height;
    const offCtx = offCanvas.getContext("2d");
    const size = offCanvas.width;
    const imageData = offCtx.createImageData(size, size);
    const data = imageData.data;
    const centerX = size / 2;
    const centerY = size / 2;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const rNorm = Math.sqrt(dx * dx + dy * dy) / centerX;
        const nx = dx / centerX;
        const ny = dy / centerX;
        let weights = [];
        let weightSum = 0;
        for (let i = 0; i < cloudPaletteRGB.length; i++) {
          const offset = groupOffsets[i];
          const phase = groupPhases[i];
          const noiseVal = fbm(
            noise,
            nx * scale + timeCloud + offset,
            ny * scale + timeCloud + offset,
            4,
            0.5
          );
          const radial = (1 - rNorm) * Math.sin(timeCloud + phase);
          const score = noiseVal + radial;
          const w = Math.exp(beta * score);
          weights.push(w);
          weightSum += w;
        }
        for (let i = 0; i < weights.length; i++) {
          weights[i] /= weightSum;
        }
        let rColor = 0,
          gColor = 0,
          bColor = 0;
        for (let i = 0; i < cloudPaletteRGB.length; i++) {
          rColor += weights[i] * cloudPaletteRGB[i][0];
          gColor += weights[i] * cloudPaletteRGB[i][1];
          bColor += weights[i] * cloudPaletteRGB[i][2];
        }
        const idx = (y * size + x) * 4;
        data[idx] = rColor;
        data[idx + 1] = gColor;
        data[idx + 2] = bColor;
        data[idx + 3] = 255;
      }
    }
    offCtx.putImageData(imageData, 0, 0);

    const pattern = ctx.createPattern(offCanvas, "no-repeat");
    ctx.fillStyle = pattern;
    ctx.fill();

    ctx.shadowColor = "rgba(245, 135, 66, 1)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    // Optionally, draw the outline:
    // ctx.lineWidth = outlineWidth;
    // ctx.strokeStyle = outlineColor;
    // ctx.stroke();
  };

  const animate = (ctx) => {
    requestId = requestAnimationFrame(() => animate(ctx));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    draw(ctx);
  };

  useEffect(() => {
    if (hasAnimation) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = 100;
      canvas.height = 100;
      animate(context);
      return () => cancelAnimationFrame(requestId);
    }
  }, [hasAnimation, alternativeSpeed, outlineColor, outlineWidth]);

  return (
    <FadeInComponent speed={hasInitialFade ? "1s" : "0s"}>
      <div
        style={{
          width: regulateWidth ? null : "100%",
          minWidth: regulateWidth ? null : "300px",
          maxWidth: regulateWidth ? null : "600px",
          display: isLoader ? "flex" : undefined,
          flexDirection: isLoader ? "column" : undefined,
          alignItems: isLoader ? "center" : undefined,
          textAlign: regulateWidth ? "left" : undefined,
        }}
      >
        {hasAnimation && (
          <div>
            <canvas
              style={{
                borderRadius: "50%", // circular appearance
              }}
              ref={canvasRef}
            ></canvas>
          </div>
        )}
        {isLoader && <StreamLoader />}
      </div>
    </FadeInComponent>
  );
};
