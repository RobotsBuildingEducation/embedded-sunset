import * as THREE from "three";

// All visible collection tiles use the same WebGL context. Each receives the
// actual rendered frame in its own display canvas, including animated pigment,
// eye morphing, lighting and reactions. Nothing is replaced by a drawn icon.
export function createOrbRendererPool(createRenderer, createCanvas) {
  let shared = null;
  return function acquire() {
    if (!shared) shared = { renderer: createRenderer(), users: 0, width: 1, height: 1 };
    const owner = shared;
    const renderer = owner.renderer;
    owner.users++;
    const canvas = createCanvas();
    const context = canvas.getContext("2d");
    if (!context) {
      owner.users--;
      if (!owner.users) { renderer.dispose(); renderer.forceContextLoss(); shared = null; }
      throw new Error("Orb display canvas unavailable");
    }
    let released = false;
    return {
      renderer, canvas,
      render(scene, camera, width, height) {
        if (released || !width || !height) return;
        if (width > owner.width || height > owner.height) {
          owner.width = Math.max(width, owner.width);
          owner.height = Math.max(height, owner.height);
          renderer.setSize(owner.width, owner.height, false);
        }
        renderer.setRenderTarget(null);
        renderer.setViewport(0, 0, width, height);
        renderer.setScissor(0, 0, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
        const ratio = renderer.getPixelRatio();
        const w = Math.floor(width * ratio), h = Math.floor(height * ratio);
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;
        context.clearRect(0, 0, w, h);
        context.drawImage(renderer.domElement, 0, renderer.domElement.height - h, w, h, 0, 0, w, h);
        // PMREM generation for a newly visible scene expects a full viewport.
        renderer.setScissorTest(false);
      },
      release() {
        if (released) return;
        released = true;
        owner.users--;
        if (!owner.users) {
          renderer.dispose(); renderer.forceContextLoss();
          if (shared === owner) shared = null;
        }
      },
    };
  };
}

export const acquireSharedOrbRenderer = createOrbRendererPool(
  () => new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }),
  () => document.createElement("canvas"),
);
