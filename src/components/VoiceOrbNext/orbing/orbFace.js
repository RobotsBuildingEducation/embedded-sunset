import { EYE_POINTS, eyeColors } from "./orbEyeMorph.js";

export function drawOrbFace(ctx, morph, blink) {
  ctx.clearRect(0, 0, 512, 384);
  const colors = eyeColors(morph);
  ctx.fillStyle = colors.ink;
  ctx.save();
  // Let a little of the orb's moving pigment show through the eye ink.
  ctx.globalAlpha = 0.62;
  ctx.translate(256, 144);
  ctx.scale(1, Math.max(0.065, 1 - blink));
  ctx.translate(-256, -144);
  for (let eye = 0; eye < 2; eye++) {
    const offset = eye * EYE_POINTS * 2;
    const points = morph.values;
    const last = offset + (EYE_POINTS - 1) * 2;
    ctx.beginPath();
    ctx.moveTo((points[last] + points[offset]) / 2, (points[last + 1] + points[offset + 1]) / 2);
    for (let index = 0; index < EYE_POINTS; index++) {
      const current = offset + index * 2;
      const next = offset + ((index + 1) % EYE_POINTS) * 2;
      ctx.quadraticCurveTo(points[current], points[current + 1],
        (points[current] + points[next]) / 2, (points[current + 1] + points[next + 1]) / 2);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  if (colors.blushOpacity > 0.001) {
    for (const x of [140, 372]) {
      const blush = ctx.createRadialGradient(x, 210, 1, x, 210, 29);
      blush.addColorStop(0, `rgba(${colors.blush}, ${colors.blushOpacity})`);
      blush.addColorStop(1, `rgba(${colors.blush}, 0)`);
      ctx.fillStyle = blush;
      ctx.fillRect(x - 30, 180, 60, 60);
    }
  }
}
