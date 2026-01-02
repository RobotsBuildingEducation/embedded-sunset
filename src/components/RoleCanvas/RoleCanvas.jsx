import React, { useRef, useEffect } from "react";
import { createNoise2D } from "simplex-noise";
import { useColorModeValue } from "@chakra-ui/react";
import { useThemeStore } from "../../useThemeStore";

// Theme color hex values
const themeColorHex = {
  purple: "#9f7aea",
  orange: "#ed8936",
  green: "#48bb78",
  blue: "#4299e1",
  pink: "#ed64a6",
};

/**
 * RoleCanvas: renders a breathing sphere, a plan mesh, a plate-of-food animation,
 * a 3-bar chart animation, a sleep/crescent moon animation,
 * an emotions/flower animation, a chores single-particle animation,
 * or a counselor/heart animation,
 * morphing smoothly when `role` changes.
 */
export function RoleCanvas({
  role = "sphere",
  width = 100,
  height = 100,
  particleCount = 200,
  color = null, // null means use theme color

  // sphere params
  cycleSpeed = 0.0015,
  jitterScale = 0.2,
  trailOpacity = 0.15,
  pauseThreshold = 20,

  // plan params
  gridCols = 20,
  gridRows = 10,
  waterSpeed = 0.001,
  waterAmplitude = 0.01,

  transitionEase = 0.2,
  backgroundColorX = "245,244,242",
}) {
  const canvasRef = useRef(null);
  const roleRef = useRef(role);
  const progressRef = useRef(0);
  const frameRef = useRef(0);
  const themeColor = useThemeStore((state) => state.themeColor);

  // Use provided color or fall back to theme color
  const particleColor = color || themeColorHex[themeColor] || themeColorHex.orange;

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const baseRgb = useColorModeValue(backgroundColorX, "0,0,37");
  const fadeColor = `rgba(${baseRgb},${trailOpacity})`;
  const bgColor = useColorModeValue("rgba(255,255,255,1)", "rgba(0,0,0,1)");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const noise2D = createNoise2D();
    canvas.width = width;
    canvas.height = height;

    // center and plate radius
    const cx = width / 2;
    const cy = height / 2;
    const plateR = (Math.min(width, height) / 2) * 0.9;
    const depth = plateR * 2;
    const collapseThreshold = 1 - pauseThreshold;
    const stepCount = 7;
    const step = 1 / stepCount;

    // initialize particles
    const particles = Array.from({ length: particleCount }, () => ({
      phi: Math.acos(2 * Math.random() - 1),
      theta: Math.random() * Math.PI * 2,
      size: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
    }));

    // Plan grid base positions
    const gridBase = [];
    const sx = width / (gridCols - 1);
    const sy = height / (gridRows - 1);
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        gridBase.push({
          x: c * sx,
          y: r * sy,
          rN: r / (gridRows - 1),
          cN: c / (gridCols - 1),
        });
      }
    }

    // Meals rim and food
    const rimCount = Math.floor(particleCount * 0.3);
    const rimBase = [];
    const foodBase = [];
    for (let i = 0; i < rimCount; i++) {
      rimBase.push({
        angle: (i / rimCount) * 2 * Math.PI,
        phase: particles[i].phase,
        size: particles[i].size,
      });
    }
    for (let i = rimCount; i < particleCount; i++) {
      foodBase.push({
        angle: Math.random() * 2 * Math.PI,
        rad: Math.sqrt(Math.random()) * plateR * 0.6,
        phase: particles[i].phase,
        size: particles[i].size,
      });
    }

    // Finance bar base positions
    const financeBase = [];
    const perBar = Math.floor(particleCount / 3);
    const bSpacing = width / 4;
    const maxH = [0.4 * height, 0.6 * height, 0.8 * height];
    for (let i = 0; i < particleCount; i++) {
      const bi = Math.min(2, Math.floor(i / perBar));
      financeBase.push({
        baseX: bSpacing * (bi + 1) + (Math.random() - 0.5) * bSpacing * 0.8,
        baseY: height - Math.random() * maxH[bi],
        phase: particles[i].phase,
        size: particles[i].size,
      });
    }

    // Sleep crescent moon base
    const sleepBase = [];
    const a0 = Math.PI / 6;
    const a1 = (2.5 * Math.PI) / 2;
    for (let i = 0; i < particleCount; i++) {
      const ang = a0 + (i / (particleCount - 1)) * (a1 - a0);
      sleepBase.push({
        x: cx + plateR * Math.cos(ang),
        y: cy + plateR * Math.sin(ang),
        phase: particles[i].phase,
        size: particles[i].size,
      });
    }

    // Emotions flower base
    const flowerBase = particles.map((p, i) => {
      const baseAng = (i / particleCount) * 2 * Math.PI;
      const petal = 6;
      const thickness = plateR * 0.05;
      const coreRad = plateR * (0.7 + 0.3 * Math.sin(petal * baseAng));
      return {
        baseAng,
        baseRad: coreRad + (Math.random() - 0.5) * thickness,
        phase: p.phase,
        size: p.size,
      };
    });

    // Counselor heart base
    const heartBase = [];
    const scale = plateR / 17;
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * 2 * Math.PI;
      const xh = 16 * Math.sin(t) ** 3;
      const yh =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      heartBase.push({
        x: cx + xh * scale,
        y: cy - yh * scale,
        phase: particles[i].phase,
        size: particles[i].size,
      });
    }

    function animate(time) {
      const map = {
        sphere: 0,
        plan: 1 * step,
        meals: 2 * step,
        finance: 3 * step,
        sleep: 4 * step,
        emotions: 5 * step,
        chores: 6 * step,
        counselor: 7 * step,
      };
      const target = map[roleRef.current] ?? 0;
      progressRef.current += (target - progressRef.current) * transitionEase;
      if (Math.abs(progressRef.current - target) < 0.01)
        progressRef.current = target;
      const prog = progressRef.current;

      // draw fade for trails
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, width, height);

      // singular random-moving particle when chores
      if (roleRef.current === "chores") {
        const p0 = particles[0];
        const xPos = cx + noise2D(p0.phase + 70, time * 0.0005) * (width / 2);
        const yPos = cy + noise2D(p0.phase + 80, time * 0.0005) * (height / 2);
        const rPos = p0.size + 20;
        ctx.beginPath();
        ctx.arc(xPos, yPos, rPos, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      particles.forEach((p, i) => {
        // Sphere coordinates
        const raw = (1 + Math.sin(time * cycleSpeed)) / 2;
        const rpos =
          raw <= collapseThreshold
            ? 0
            : raw >= pauseThreshold
              ? 1
              : (raw - collapseThreshold) /
                (pauseThreshold - collapseThreshold);
        const noiseR =
          noise2D(p.phi + p.phase, time * 0.0003) *
          (plateR / 1.5) *
          jitterScale;
        const radS = Math.max(0, rpos * (plateR / 1.5) + noiseR);
        const thS = p.theta + time * 0.0002;
        const xs = cx + radS * Math.sin(p.phi) * Math.cos(thS);
        const ys = cy + radS * Math.sin(p.phi) * Math.sin(thS);
        const zs = radS * Math.cos(p.phi);
        const sc = depth / (depth + zs);
        const sphX = cx + (xs - cx) * sc;
        const sphY = cy + (ys - cy) * sc;
        const sphR = p.size * sc;

        // Plan coordinates
        const gb = gridBase[i];
        const planX =
          gb.x +
          noise2D(gb.rN + 100, time * waterSpeed) * waterAmplitude * width;
        const planY =
          gb.y +
          noise2D(gb.cN + 200, time * waterSpeed) * waterAmplitude * height;
        const planR = p.size;

        // Meals coordinates
        let mealX, mealY, mealR;
        if (i < rimCount) {
          const rb = rimBase[i];
          const wob = Math.sin(time * 0.002 + rb.phase) * 4;
          const ao = Math.sin(time * 0.0015 + rb.phase) * 0.2;
          mealX = cx + (plateR + wob) * Math.cos(rb.angle + ao);
          mealY = cy + (plateR + wob) * Math.sin(rb.angle + ao);
          mealR = rb.size;
        } else {
          const fb = foodBase[i - rimCount];
          mealX =
            cx +
            fb.rad * Math.cos(fb.angle) +
            Math.cos(time * 0.001 + fb.phase) * 2;
          mealY =
            cy +
            fb.rad * Math.sin(fb.angle) +
            Math.sin(time * 0.001 + fb.phase) * 2;
          mealR = fb.size;
        }

        // Finance coordinates
        const fb2 = financeBase[i];
        const finX = fb2.baseX + noise2D(fb2.phase + 10, time * 0.0005) * 5;
        const finY = fb2.baseY + noise2D(fb2.phase + 20, time * 0.0005) * 5;
        const finR = fb2.size;

        // Sleep coordinates
        const sb = sleepBase[i];
        const sleepX = sb.x + noise2D(sb.phase + 30, time * 0.0005) * 10;
        const sleepY = sb.y + noise2D(sb.phase + 40, time * 0.0005) * 10;
        const sleepR = sb.size;

        // Emotions coordinates
        const eb = flowerBase[i];
        const emoAng = eb.baseAng + time * 0.00005;
        const emoX =
          cx +
          eb.baseRad * Math.cos(emoAng) +
          noise2D(eb.phase + 50, time * 0.0003);
        const emoY =
          cy +
          eb.baseRad * Math.sin(emoAng) +
          noise2D(eb.phase + 60, time * 0.0003);
        const emoR = eb.size;

        // Counselor coordinates
        const hb = heartBase[i];
        const pulse = 1 + 0.05 * Math.sin(time * 0.002 + hb.phase);
        const baseX = cx + (hb.x - cx) * pulse;
        const baseY = cy + (hb.y - cy) * pulse;
        const counX = baseX + noise2D(hb.phase + 90, time * 0.0003) * 2;
        const counY = baseY + noise2D(hb.phase + 100, time * 0.0003) * 2;
        const counR = hb.size;

        // Interpolate between roles
        let x, y, r;
        if (prog < step) {
          const t = prog / step;
          x = sphX + (planX - sphX) * t;
          y = sphY + (planY - sphY) * t;
          r = sphR + (planR - sphR) * t;
        } else if (prog < 2 * step) {
          const t = (prog - step) / step;
          x = planX + (mealX - planX) * t;
          y = planY + (mealY - planY) * t;
          r = planR + (mealR - planR) * t;
        } else if (prog < 3 * step) {
          const t = (prog - 2 * step) / step;
          x = mealX + (finX - mealX) * t;
          y = mealY + (finY - mealY) * t;
          r = mealR + (finR - mealR) * t;
        } else if (prog < 4 * step) {
          const t = (prog - 3 * step) / step;
          x = finX + (sleepX - finX) * t;
          y = finY + (sleepY - finY) * t;
          r = finR + (sleepR - finR) * t;
        } else if (prog < 5 * step) {
          const t = (prog - 4 * step) / step;
          x = sleepX + (emoX - sleepX) * t;
          y = sleepY + (emoY - sleepY) * t;
          r = sleepR + (emoR - sleepR) * t;
        } else if (prog < 6 * step) {
          const t = (prog - 5 * step) / step;
          x = emoX + (counX - emoX) * 0;
          y = emoY + (counY - emoY) * 0;
          r = emoR;
        } else if (prog < 7 * step) {
          const t = (prog - 6 * step) / step;
          x = counX;
          y = counY;
          r = counR;
        } else {
          x = counX;
          y = counY;
          r = counR;
        }

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      // Draw flower center when emotions
      if (roleRef.current === "emotions") {
        const centerCount = Math.floor(particleCount * 0.1);
        for (let j = 0; j < centerCount; j++) {
          const angle = (j / centerCount) * 2 * Math.PI;
          const rad = plateR * 0.1 + noise2D(j + 100, time * 0.001) * 2;
          const xC = cx + rad * Math.cos(angle);
          const yC = cy + rad * Math.sin(angle);
          ctx.beginPath();
          ctx.arc(xC, yC, 2, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [
    role,
    width,
    height,
    particleCount,
    particleColor,
    cycleSpeed,
    jitterScale,
    trailOpacity,
    pauseThreshold,
    gridCols,
    gridRows,
    waterSpeed,
    waterAmplitude,
    transitionEase,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${200}px`,
        height: `${200}px`,
        // backgroundColor: bgColor,
        borderRadius: role === "sphere" ? "50%" : "0",
        display: "block",
      }}
    />
  );
}
