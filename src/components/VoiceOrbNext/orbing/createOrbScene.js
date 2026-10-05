import { acquireSharedOrbRenderer } from "../../../achievements/sharedOrbRenderer.js";
import { ORB_SURFACE_GLSL } from "../../../achievements/orbSurfaces.js";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { clamp, DEFAULT_ORB_PALETTE, ORB_FLOW, ORB_PALETTES, REACTION_DURATION, REACTION_SETTLE_DURATION, reactionPose, resolveOrbMood, simulatedVoiceLevel } from "./orbModel.js";
import { drawOrbFace } from "./orbFace.js";
import { createEyeMorph, advanceEyeMorph } from "./orbEyeMorph.js";

const TAU = Math.PI * 2;

let cachedSurfaceGeometry = null;
function getSurfaceGeometry() {
  if (!cachedSurfaceGeometry) {
    const geometry = new THREE.SphereGeometry(1, 72, 48);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const fullness = 1 - positions.getY(i) * 0.065;
      positions.setX(i, positions.getX(i) * fullness);
      positions.setZ(i, positions.getZ(i) * fullness);
    }
    geometry.computeVertexNormals();
    cachedSurfaceGeometry = geometry;
  }
  return cachedSurfaceGeometry;
}

let cachedFaceGeometry = null;
function getFaceGeometry() {
  if (!cachedFaceGeometry) {
    const geometry = new THREE.PlaneGeometry(1.62, 1.215, 40, 30);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i) + 0.075;
      const fullness = 1 - y * 0.065;
      const z = Math.sqrt(Math.max(0.01, 1 - (x / fullness) ** 2 - y ** 2)) * fullness;
      positions.setXYZ(i, x, y, z + 0.012);
    }
    geometry.computeVertexNormals();
    cachedFaceGeometry = geometry;
  }
  return cachedFaceGeometry;
}

let cachedShadowTexture = null;
function getShadowTexture() {
  if (!cachedShadowTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, "rgba(25, 56, 42, 0.30)");
    gradient.addColorStop(0.4, "rgba(25, 56, 42, 0.16)");
    gradient.addColorStop(1, "rgba(25, 56, 42, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    cachedShadowTexture = new THREE.CanvasTexture(canvas);
  }
  return cachedShadowTexture;
}

let cachedStarGeometry = null;
function getStarGeometry() {
  if (!cachedStarGeometry) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * TAU;
      const radius = i % 2 ? 0.25 : 1;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    cachedStarGeometry = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, steps: 1 });
  }
  return cachedStarGeometry;
}

let cachedShadowGeometry = null;
function getShadowGeometry() {
  if (!cachedShadowGeometry) {
    cachedShadowGeometry = new THREE.PlaneGeometry(3.5, 1.45);
  }
  return cachedShadowGeometry;
}

let cachedDotGeometry = null;
function getDotGeometry() {
  if (!cachedDotGeometry) {
    cachedDotGeometry = new THREE.SphereGeometry(0.042, 12, 8);
  }
  return cachedDotGeometry;
}

function isSharedGeometry(geom) {
  return geom === cachedSurfaceGeometry ||
         geom === cachedFaceGeometry ||
         geom === cachedShadowGeometry ||
         geom === cachedStarGeometry ||
         geom === cachedDotGeometry;
}

const environmentTextureCache = new WeakMap();
function getEnvironmentTexture(renderer) {
  let texture = environmentTextureCache.get(renderer);
  if (!texture) {
    const environmentScene = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(environmentScene, 0.025);
    texture = environment.texture;
    environmentScene.dispose();
    pmrem.dispose();
    environmentTextureCache.set(renderer, texture);
  }
  return texture;
}

// This scene owns every GPU resource and event listener it creates. Options can
// change without rebuilding the renderer, textures, geometry, or environment.
export function createOrbScene(host, initialOptions, onFailure) {
  let options = initialOptions;
  const sharedRenderer = initialOptions?.sharedRenderer ? acquireSharedOrbRenderer() : null;
  const renderer = sharedRenderer?.renderer || new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  const canvas = sharedRenderer?.canvas || renderer.domElement;
  let renderWidth = 1, renderHeight = 1;
  const maxDpr = options?.maxDpr ?? (options?.compact ? 1.25 : 1.75);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.set(0, 0.48, 7.2);
  camera.lookAt(0, 0, 0);
  scene.environment = getEnvironmentTexture(renderer);

  scene.add(new THREE.HemisphereLight(0xf8fffa, 0x487a69, 2.2));
  const key = new THREE.DirectionalLight(0xfff6e5, 3.8);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbdffee, 2.2);
  rim.position.set(4, 1, -2);
  scene.add(rim);

  const character = new THREE.Group();
  character.position.y = 0.04;
  character.scale.x = 1.04;
  scene.add(character);
  const targetPosition = new THREE.Vector3();
  const targetScale = new THREE.Vector3();
  const targetRotation = new THREE.Euler();
  const targetQuaternion = new THREE.Quaternion();
  const initialPalettes = initialOptions?.palettes || ORB_PALETTES;
  const initialPalette = initialPalettes.find((p) => p.id === initialOptions?.palette) || initialPalettes.find(p => p.id === DEFAULT_ORB_PALETTE) || initialPalettes[0];
  const uniforms = {
    // Offset only experimental surfaces, so repeated rewards enter at different
    // points in their flow without changing their palette or reaction timing.
    orbTime: { value: initialOptions?.orbFlow?.[initialOptions?.state]?.pattern ? Math.random() * 32 : 0 },
    orbPattern: { value: 0 },
    orbListening: { value: 0 },
    orbThinking: { value: 0 },
    orbSpeaking: { value: 0 },
    orbVoice: { value: 0 },
    orbRipple: { value: 0 },
    orbSpiral: { value: 0 },
    orbWarp: { value: 0 },
    orbTurbulence: { value: 0 },
    orbWaveScale: { value: 1.0 },
    orbWashAlpha: { value: 0.83 },
    orbVoiceMod: { value: 0.0 },
    orbDeep: { value: new THREE.Color(initialOptions?.colors?.[0] || initialPalette.colors[0]) },
    orbMid: { value: new THREE.Color(initialOptions?.colors?.[1] || initialPalette.colors[1]) },
    orbLight: { value: new THREE.Color(initialOptions?.colors?.[2] || initialPalette.colors[2]) },
  };
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.28, metalness: 0.02,
    clearcoat: 0.72, clearcoatRoughness: 0.22, envMapIntensity: 0.65,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vOrbPosition;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOrbPosition = position;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
      varying vec3 vOrbPosition;
      uniform float orbTime;
      uniform float orbPattern;
      uniform float orbListening;
      uniform float orbThinking;
      uniform float orbSpeaking;
      uniform float orbVoice;
      uniform float orbRipple;
      uniform float orbSpiral;
      uniform float orbWarp;
      uniform float orbTurbulence;
      uniform float orbWaveScale;
      uniform float orbWashAlpha;
      uniform float orbVoiceMod;
      uniform vec3 orbDeep;
      uniform vec3 orbMid;
      uniform vec3 orbLight;
      float orbNoise(vec2 p) {
        vec2 cell = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        vec4 n = vec4(dot(cell, vec2(12.9898, 4.1414)),
          dot(cell + vec2(1.0, 0.0), vec2(12.9898, 4.1414)),
          dot(cell + vec2(0.0, 1.0), vec2(12.9898, 4.1414)),
          dot(cell + vec2(1.0), vec2(12.9898, 4.1414)));
        n = fract(sin(n) * 43758.5453);
        return mix(mix(n.x, n.y, f.x), mix(n.z, n.w, f.x), f.y);
      }
      ${ORB_SURFACE_GLSL}
    `).replace("#include <color_fragment>", `#include <color_fragment>
      vec3 pigment;
      if (orbPattern > 0.5) {
        // Each reward owns its entire color animation; no tutor swirl underlay.
        pigment = rewardPigment(vOrbPosition, orbTime, orbPattern);
      } else {
        vec3 p = vOrbPosition;
        float drift = orbTime;
        float radius = length(p.xy);
        // VoiceOrb's listening ripples and speaking spiral, wrapped around the toy.
        float ripple = (sin(radius * (12.0 * orbWaveScale) - drift * 8.0) * 0.18
          + sin(radius * (20.0 * orbWaveScale) - drift * 13.0 + 1.2) * 0.08) * orbRipple;
        p.xy += p.xy / max(radius, 0.001) * ripple * (0.5 + orbVoice * orbVoiceMod);
        // Match VoiceOrb's speaking twist & inward thinking warp
        float spiral = radius * 6.0 * orbSpiral
          - sin(p.y * 2.0 + drift) * orbWarp * 1.1;
        float spiralCos = cos(spiral);
        float spiralSin = sin(spiral);
        p.xy = vec2(p.x * spiralCos - p.y * spiralSin,
                    p.x * spiralSin + p.y * spiralCos);
        vec2 watercolor = vec2(orbNoise(p.xy * (2.2 * orbWaveScale) + drift),
          orbNoise(p.yz * 2.0 - drift + 74.85)) - 0.5;
        p.xy += watercolor * orbTurbulence * 0.5;
        float wave = sin((p.x * 3.4 + p.y * 2.8) * orbWaveScale + sin(p.z * 3.0 + drift) * 1.6 - drift);
        float ribbon = sin((p.y * 4.0 - p.x * 2.4) * orbWaveScale + sin(p.z * 2.5 - drift) + drift * 0.7);
        // Active states expose more of the saturated pigment beneath the pale wash.
        wave -= orbWarp * 0.22 + orbSpiral * orbVoice * 0.28 * orbVoiceMod;
        pigment = mix(orbDeep, orbMid, smoothstep(-0.9, 0.65, wave));
        float wash = orbWashAlpha - orbWarp * 0.2 - orbSpiral * (0.14 + orbVoice * 0.25 * orbVoiceMod);
        pigment = mix(pigment, orbLight, smoothstep(0.08, 0.95, ribbon) * wash);
      }
      diffuseColor.rgb *= pigment;
    `);
  };
  const body = new THREE.Mesh(getSurfaceGeometry(), material);
  character.add(body);

  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = 512; faceCanvas.height = 384;
  const faceContext = faceCanvas.getContext("2d");
  const initialMoodResolver = options.resolveOrbMood || resolveOrbMood;
  const eyeMorph = createEyeMorph(initialMoodResolver(options.mood, options.state, null), options.expressions);
  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const face = new THREE.Mesh(getFaceGeometry(), new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  character.add(face);

  const shadowTexture = getShadowTexture();
  const shadow = new THREE.Mesh(getShadowGeometry(), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
  shadow.position.set(0, -1.38, -0.2);
  shadow.rotation.x = -Math.PI / 2.7;
  scene.add(shadow);

  const sparkGeometry = getStarGeometry();
  const sparks = Array.from({ length: 10 }, (_, index) => {
    const spark = new THREE.Mesh(sparkGeometry, new THREE.MeshStandardMaterial({ color: index % 2 ? 0xffc47e : 0x66cbae, roughness: 0.36, transparent: true }));
    spark.visible = false;
    scene.add(spark);
    return spark;
  });
  const dotGeometry = getDotGeometry();
  const thinkingDots = Array.from({ length: 3 }, (_, index) => {
    const dot = new THREE.Mesh(dotGeometry, new THREE.MeshStandardMaterial({ color: 0x378e7b }));
    dot.position.set((index - 1) * 0.2 + 0.68, 1.38, 0);
    dot.visible = false;
    scene.add(dot);
    return dot;
  });

  const pointer = { x: 0, y: 0, down: false, startX: 0, startY: 0, dragged: false, turn: 0 };
  const raycaster = new THREE.Raycaster();
  let frame = 0;
  let disposed = false;
  let cachedColorKey = "";
  let cachedColors = [];
  let inView = true;
  let time = 0;
  let reactionClock = 0;
  let previousTime = 0;
  let lastRender = 0;
  let dirty = true;
  let reactionId = null;
  let reactionStart = -100;
  let reactionKind = null;
  let completedReactionId = null;
  let blinkAt = 2.4;
  let tilt = 0, turn = 0, pitch = 0, level = 0;
  let flowSpeed = ORB_FLOW.idle.speed;
  let faceNeedsRedraw = true;
  let previousBlink = 0;
  let previousMood = "";
  let previousState = "";

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderWidth = width; renderHeight = height;
    if (!sharedRenderer) renderer.setSize(width, height);
    camera.aspect = width / height;
    if (options.compact) {
      // Frame the body in square icon canvases, with room for the shadow when shown.
      camera.position.set(0, 0, 5);
      camera.lookAt(0, options.showShadow === false ? 0 : -0.18, 0);
      shadow.position.y = -1.12;
    } else {
      camera.position.set(0, 0.48, camera.aspect < 0.85 ? 7.1 : 5.6);
      camera.lookAt(0, 0, 0);
      shadow.position.y = -1.38;
    }
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  function pointerMove(event) {
    const rect = host.getBoundingClientRect();
    pointer.x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointer.y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    if (pointer.down) {
      const distance = event.clientX - pointer.startX;
      if (Math.hypot(distance, event.clientY - pointer.startY) > 6) pointer.dragged = true;
      pointer.turn = distance * 0.009;
    }
    dirty = true;
  }
  function pointerDown(event) {
    if (event.button !== 0) return;
    pointerMove(event);
    raycaster.setFromCamera(new THREE.Vector2(pointer.x, -pointer.y), camera);
    if (!raycaster.intersectObject(body).length) return;
    pointer.down = true; pointer.dragged = false;
    pointer.startX = event.clientX; pointer.startY = event.clientY;
    host.setPointerCapture(event.pointerId);
    host.style.cursor = "grabbing";
  }
  function pointerUp(event) {
    if (!pointer.down) return;
    if (!pointer.dragged && event.type !== "pointercancel") options.onInteract?.("boop");
    pointer.down = false;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    host.style.cursor = "grab";
    dirty = true;
  }
  function pointerLeave() {
    if (!pointer.down) { pointer.x = 0; pointer.y = 0; dirty = true; }
  }
  host.addEventListener("pointermove", pointerMove);
  host.addEventListener("pointerdown", pointerDown);
  host.addEventListener("pointerup", pointerUp);
  host.addEventListener("pointercancel", pointerUp);
  host.addEventListener("lostpointercapture", pointerUp);
  host.addEventListener("pointerleave", pointerLeave);

  function render(now) {
    if (disposed || document.hidden || !inView) { frame = 0; return; }
    frame = requestAnimationFrame(render);
    if (now - lastRender < 1000 / 40) return;
    const dt = Math.min((now - (previousTime || now)) / 1000, 0.05);
    previousTime = now; lastRender = now;
    const moving = !options.paused && !options.reducedMotion;
    if (!options.paused) reactionClock += dt;
    if (options.reaction?.id !== reactionId) {
      reactionId = options.reaction?.id;
      reactionKind = options.reaction?.kind;
      reactionStart = reactionClock;
    }
    const elapsed = reactionClock - reactionStart;
    const durations = { ...REACTION_DURATION, ...(options.reactionDurations || {}) };
    const duration = durations[reactionKind] || 0;
    // Completion follows the scene clock even when reduced motion keeps the
    // image static. Hidden/offscreen scenes and explicitly paused scenes wait.
    if (reactionKind && reactionId !== completedReactionId && elapsed >= duration + REACTION_SETTLE_DURATION) {
      completedReactionId = reactionId;
      options.onReactionComplete?.(reactionId);
    }
    if (!moving && !dirty) return;
    dirty = false;
    if (moving) time += dt;
    const amount = moving ? clamp(options.energy ?? 0.7, 0, 1.5) : 0;
    const reacting = reactionKind && elapsed < duration;
    const pose = (options.reactionPose || reactionPose)(reactionKind, elapsed, amount);
    const moodResolver = options.resolveOrbMood || resolveOrbMood;
    const currentMood = moodResolver(options.mood, options.state, reacting ? reactionKind : null);
    if (time > blinkAt + 0.18) blinkAt = time + 2.8 + Math.random() * 2.7;
    const blink = moving && time > blinkAt ? Math.sin(clamp((time - blinkAt) / 0.18, 0, 1) * Math.PI) : 0;
    const targetLevel = options.state === "speaking" || options.state === "listening"
      ? (options.audioLevelRef ? clamp(options.audioLevelRef.current || 0, 0, 1) : simulatedVoiceLevel(time) * (options.voiceLevel ?? 0.65)) : 0;
    level += (targetLevel - level) * (1 - Math.exp(-dt * 16));

    advanceEyeMorph(eyeMorph, { mood: currentMood, state: options.state, time, dt, immediate: !moving, expressions: options.expressions });
    const blinkActive = blink > 0 || previousBlink > 0;
    const moodChanged = currentMood !== previousMood;
    const stateChanged = options.state !== previousState;
    if (faceNeedsRedraw || blinkActive || moodChanged || stateChanged || eyeMorph.changed) {
      drawOrbFace(faceContext, eyeMorph, blink);
      faceTexture.needsUpdate = true;
      previousBlink = blink;
      previousMood = currentMood;
      previousState = options.state;
      faceNeedsRedraw = false;
    }
    const follow = options.followPointer && moving ? 1 : 0;
    const sleepy = currentMood === "sleepy" || currentMood === "snooze";
    const listening = options.state === "listening";
    const speaking = options.state === "speaking";
    const curious = currentMood === "curious";
    const responsiveness = moving ? 1 - Math.exp(-dt * 5.5) : 1;
    tilt += ((curious ? -0.15 : sleepy ? 0.11 : 0) + pointer.x * -0.05 * follow - tilt) * responsiveness;
    turn += (pointer.x * 0.37 * follow - turn) * responsiveness;
    pitch += (pointer.y * 0.19 * follow + (sleepy ? 0.12 : listening ? -0.06 : 0) - pitch) * responsiveness;
    if (!pointer.down) pointer.turn *= Math.exp(-dt * 4.2);
    const breath = Math.sin(time * (sleepy ? 1.4 : 2.1)) * 0.018 * amount;
    const bounce = currentMood === "excited" ? Math.abs(Math.sin(time * 4.7)) * 0.10 * amount : 0;
    const squash = pose.squash + (pointer.down ? 0.075 * amount : 0);
    const voiceStretch = (speaking ? level * 0.065 : level * 0.018) * amount;
    targetScale.set(1.04 + squash * 0.65 - breath * 0.4, 1 - squash + breath + voiceStretch, 1 + squash * 0.35);
    targetPosition.set(pose.x, 0.04 + Math.sin(time * 1.7) * 0.045 * amount + pose.y + bounce, 0);
    if (options.compact) {
      // Animated display reactions still need to fit within the icon canvas.
      targetScale.y = Math.min(targetScale.y, 1.12);
      targetPosition.y = Math.min(targetPosition.y, 0.14);
    }
    targetRotation.set(pitch + pose.pitch, turn + pose.turn + pointer.turn * amount, tilt + pose.roll + Math.sin(time * 1.15) * 0.025 * amount);
    targetQuaternion.setFromEuler(targetRotation);
    // Blend the complete pose, including a mood's idle bounce. Quaternions make
    // the end of a full spin equivalent to rest, with no backwards snap at 2π.
    const settleBlend = moving ? 1 - Math.exp(-dt * 12) : 1;
    character.position.lerp(targetPosition, settleBlend);
    character.scale.lerp(targetScale, settleBlend);
    character.quaternion.slerp(targetQuaternion, settleBlend);

    const activeFlowTable = options.orbFlow || ORB_FLOW;
    const flow = activeFlowTable[options.state] || activeFlowTable.idle || ORB_FLOW.idle;
    const flowBlend = moving ? 1 - Math.exp(-dt * 3) : 1;
    flowSpeed += (flow.speed - flowSpeed) * flowBlend;
    // Integrate phase instead of multiplying time by speed: changing states
    // accelerates the color flow without jumping to a different point in it.
    if (moving) uniforms.orbTime.value += dt * flowSpeed;

    uniforms.orbPattern.value = flow.pattern || 0;
    const targetRipple = flow.ripple ?? flow.listening ?? 0;
    const targetSpiral = flow.swirl ?? flow.speaking ?? 0;
    const targetWarp = flow.warp ?? flow.thinking ?? 0;
    const targetTurbulence = flow.turbulence ?? ((flow.listening ?? 0) * 0.4 + (flow.thinking ?? 0) * 0.65 + (flow.speaking ?? 0));
    const targetWaveScale = flow.waveScale ?? 1.0;
    const targetWashAlpha = flow.washAlpha ?? 0.83;
    const targetVoiceMod = flow.voiceMod ?? ((flow.listening || flow.speaking) ? 1.0 : 0.0);

    uniforms.orbListening.value += ((flow.listening ?? 0) - uniforms.orbListening.value) * flowBlend;
    uniforms.orbThinking.value += ((flow.thinking ?? 0) - uniforms.orbThinking.value) * flowBlend;
    uniforms.orbSpeaking.value += ((flow.speaking ?? 0) - uniforms.orbSpeaking.value) * flowBlend;
    uniforms.orbRipple.value += (targetRipple - uniforms.orbRipple.value) * flowBlend;
    uniforms.orbSpiral.value += (targetSpiral - uniforms.orbSpiral.value) * flowBlend;
    uniforms.orbWarp.value += (targetWarp - uniforms.orbWarp.value) * flowBlend;
    uniforms.orbTurbulence.value += (targetTurbulence - uniforms.orbTurbulence.value) * flowBlend;
    uniforms.orbWaveScale.value += (targetWaveScale - uniforms.orbWaveScale.value) * flowBlend;
    uniforms.orbWashAlpha.value += (targetWashAlpha - uniforms.orbWashAlpha.value) * flowBlend;
    uniforms.orbVoiceMod.value += (targetVoiceMod - uniforms.orbVoiceMod.value) * flowBlend;
    uniforms.orbVoice.value = level;

    const activePalettes = options.palettes || ORB_PALETTES;
    const currentPalette = activePalettes.find((p) => p.id === options.palette) || activePalettes.find(p => p.id === DEFAULT_ORB_PALETTE) || activePalettes[0] || ORB_PALETTES[0];
    const colors = options.colors?.length === 3 ? options.colors : currentPalette.colors;
    const colorKey = colors.join("|");
    if (colorKey !== cachedColorKey) {
      cachedColorKey = colorKey;
      cachedColors = colors.map(c => new THREE.Color(c));
    }
    const targetColors = cachedColors;
    material.roughness = currentPalette.material?.roughness ?? 0.28;
    material.metalness = currentPalette.material?.metalness ?? 0.02;
    material.clearcoat = currentPalette.material?.clearcoat ?? 0.72;
    const colorBlend = moving ? 1 - Math.exp(-dt * 5) : 1;
    uniforms.orbDeep.value.lerp(targetColors[0], colorBlend);
    uniforms.orbMid.value.lerp(targetColors[1], colorBlend);
    uniforms.orbLight.value.lerp(targetColors[2], colorBlend);

    shadow.visible = options.showShadow !== false;
    shadow.scale.setScalar((options.compact ? 0.72 : 1) * (1 + character.position.y * 0.22));
    shadow.material.opacity = (options.dark ? 0.48 : 0.9) - pose.y * 0.4;
    const isThinking = options.state === "thinking";
    for (let index = 0; index < thinkingDots.length; index++) {
      const dot = thinkingDots[index];
      dot.visible = isThinking;
      if (dot.visible) dot.material.color.copy(targetColors[0]);
      dot.position.y = 1.32 + Math.sin(time * 4 - index * 0.7) * 0.065 * amount;
    }
    const celebration = reacting && (reactionKind === "celebrate" || reactionKind === "blastoff" || reactionKind === "heartbeat");
    const joyful = currentMood === "excited" || currentMood === "love" || currentMood === "grateful" || currentMood === "awestruck";
    for (let index = 0; index < sparks.length; index++) {
      const spark = sparks[index];
      spark.visible = moving && (celebration || (joyful && index < 3));
      if (!spark.visible) continue;
      const angle = index / sparks.length * TAU + time * 0.16;
      const distance = celebration ? 1.15 + elapsed * 0.35 : 1.45;
      spark.position.set(Math.cos(angle) * distance, Math.sin(angle) * distance * 0.75 + 0.35, 0.25 + Math.sin(index * 2) * 0.4);
      const flutter = 0.7 + Math.sin(time * 3 + index) * 0.3;
      spark.scale.setScalar((celebration ? 0.08 : 0.055) * flutter * (celebration ? pose.burst : 1));
      spark.rotation.set(0, time * 0.7 + index, Math.sin(time + index) * 0.25);
      spark.material.opacity = celebration ? pose.burst : 0.75;
    }
    if (sharedRenderer) sharedRenderer.render(scene, camera, renderWidth, renderHeight);
    else renderer.render(scene, camera);
  }
  function resume() {
    if (!disposed && !document.hidden && inView && !frame) {
      previousTime = 0; dirty = true; faceNeedsRedraw = true;
      frame = requestAnimationFrame(render);
    }
  }
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) resume();
  });
  intersection.observe(host);
  document.addEventListener("visibilitychange", resume);
  function contextLost(event) { event.preventDefault(); onFailure(); }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  resume();

  return {
    update(next) { options = next; dirty = true; faceNeedsRedraw = true; resume(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect(); intersection.disconnect();
      document.removeEventListener("visibilitychange", resume);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointerup", pointerUp);
      host.removeEventListener("pointercancel", pointerUp);
      host.removeEventListener("lostpointercapture", pointerUp);
      host.removeEventListener("pointerleave", pointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      const resources = new Set([faceTexture]);
      scene.traverse((object) => {
        if (object.geometry && !isSharedGeometry(object.geometry)) resources.add(object.geometry);
        if (object.material) resources.add(object.material);
      });
      resources.forEach((resource) => resource.dispose());
      if (sharedRenderer) {
        sharedRenderer.release();
      } else {
        const envTex = environmentTextureCache.get(renderer);
        if (envTex) {
          envTex.dispose();
          environmentTextureCache.delete(renderer);
        }
        renderer.dispose();
        renderer.forceContextLoss();
      }
      canvas.remove();
    },
  };
}
