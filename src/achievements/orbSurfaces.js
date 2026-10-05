// Each experimental surface owns its complete pigment field and animation.
// Shared helpers only draw primitives; no shared distortion or swirl is applied.
export const ORB_SURFACE_GLSL = `
  const float REWARD_TAU = 6.2831853;

  vec2 rewardRotate(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }
  float rewardHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float rewardCloud(vec2 p) {
    return orbNoise(p) * 0.57 + orbNoise(p * 2.03 + 17.2) * 0.28
      + orbNoise(p * 4.11 - 9.4) * 0.15;
  }
  float rewardLine(float d, float width) {
    float aa = max(fwidth(d), 0.003);
    return 1.0 - smoothstep(width - aa, width + aa, abs(d));
  }
  // Nearest two moving cell centers and the winning cell's persistent identity.
  vec3 rewardCells(vec2 p, float t) {
    vec2 tile = floor(p), local = fract(p);
    float first = 8.0, second = 8.0, identity = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        float h = rewardHash(tile + offset);
        vec2 seed = 0.5 + 0.28 * sin(vec2(h * 31.0, h * 57.0) + t);
        float distance = length(offset + seed - local);
        if (distance < first) {
          second = first; first = distance; identity = h;
        } else { second = min(second, distance); }
      }
    }
    return vec3(first, second - first, identity);
  }

  // 01 / Ice floes: separate plates drift, their fissures open and heal.
  vec3 rewardFloes(vec3 p, float t) {
    vec2 q = p.xy * 2.8 + vec2(sin(t * 0.23), cos(t * 0.19)) * 0.35;
    vec3 cells = rewardCells(q, t * 0.65);
    float opening = 0.06 + 0.055 * (0.5 + 0.5 * sin(t * 1.4 + cells.z * 8.0));
    float ice = smoothstep(opening, opening + 0.14, cells.y);
    float depth = 0.3 + 0.35 * sin(cells.z * 9.0 + t * 0.7 + cells.x * 2.0);
    vec3 water = mix(orbDeep, orbMid, 0.35 + depth * 0.45);
    vec3 plate = mix(orbMid, orbLight, 0.5 + 0.3 * cos(cells.x * 3.5 + t * 0.4));
    return mix(water, plate, ice);
  }

  // 02 / Radar: an angular beam paints a fading wake; echoes advance outward.
  vec3 rewardRadar(vec3 p, float t) {
    vec2 center = vec2(sin(t * 0.25), cos(t * 0.31)) * 0.13;
    vec2 q = p.xy - center;
    float r = length(q), a = atan(q.y, q.x + 0.00001);
    float wake = mod(a - t * 1.5, REWARD_TAU);
    float beam = exp(-wake * 1.4) * smoothstep(0.04, 0.24, r);
    float echo = rewardLine(sin(r * 17.0 - t * 2.8), 0.11);
    float target = pow(max(0.0, cos(a * 4.0 + r * 6.0 + t * 0.35)), 12.0);
    vec3 ink = mix(orbDeep, orbMid, 0.24 + echo * 0.25);
    return mix(ink, orbLight, clamp(beam * 0.85 + echo * target * 0.3, 0.0, 1.0));
  }

  // 03 / Circuits: colored charges travel along right-angle tracks and fill cells.
  vec3 rewardCircuit(vec3 p, float t) {
    vec2 grid = p.xy * 3.7, tile = floor(grid), q = fract(grid);
    float id = rewardHash(tile);
    float distance = min(abs(q.x - 0.5), abs(q.y - 0.5));
    float track = rewardLine(distance, 0.035);
    float route = q.x < q.y ? q.y : q.x;
    float packet = pow(0.5 + 0.5 * cos(route * 5.0 - t * 3.0 + id * REWARD_TAU), 8.0);
    float charge = 0.5 + 0.5 * sin(t * 1.3 - tile.x * 0.8 + tile.y * 1.1);
    float node = 1.0 - smoothstep(0.06, 0.12, length(q - 0.5));
    vec3 board = mix(orbDeep, orbMid, 0.15 + charge * 0.55);
    return mix(board, orbLight, clamp(track * (0.2 + packet * 0.8) + node * charge, 0.0, 1.0));
  }

  // 04 / Chromatic pipes: columns pump pigment upward at independent rhythms.
  vec3 rewardPipes(vec3 p, float t) {
    float x = (p.x + 1.0) * 5.5, column = floor(x), lane = fract(x);
    float phase = column * 1.71 + t * (0.9 + 0.2 * sin(column));
    float height = sin(phase) * 0.65;
    float fill = 1.0 - smoothstep(height - 0.16, height + 0.16, p.y);
    float rise = 0.5 + 0.5 * sin(p.y * 6.0 - t * 2.8 + column * 1.3);
    float cap = exp(-pow((p.y - height) * 9.0, 2.0));
    float seam = smoothstep(0.02, 0.1, lane) * (1.0 - smoothstep(0.9, 0.98, lane));
    vec3 glass = mix(orbDeep, orbMid, 0.18 + rise * 0.25);
    vec3 liquid = mix(orbMid, orbLight, rise * 0.65);
    return mix(orbDeep, mix(mix(glass, liquid, fill), orbLight, cap * 0.75), seam);
  }

  // 05 / Silk: oblique folds roll through a fine weave, carrying broad color bands.
  vec3 rewardSilk(vec3 p, float t) {
    vec2 q = rewardRotate(p.xy, 0.55);
    float fold = q.x * 7.0 + sin(q.y * 2.5 - t * 1.1) * 1.7 - t * 1.5;
    float sheen = pow(0.5 + 0.5 * cos(fold), 5.0);
    float fabric = 0.5 + 0.5 * sin(fold * 0.5 + q.y * 1.8 + t * 0.6);
    float thread = 0.5 + 0.5 * sin(q.x * 95.0 + sin(fold) * 2.0);
    vec3 dye = mix(orbDeep, orbMid, 0.25 + fabric * 0.6);
    return mix(dye, orbLight, sheen * 0.7 + thread * 0.08);
  }

  // 06 / Interference: two moving sound sources produce crossing colored fronts.
  vec3 rewardInterference(vec3 p, float t) {
    vec2 left = vec2(-0.48, sin(t * 0.6) * 0.35);
    vec2 right = vec2(0.48, cos(t * 0.5) * 0.35);
    float a = sin(length(p.xy - left) * 13.0 - t * 3.1);
    float b = sin(length(p.xy - right) * 15.0 - t * 2.7);
    float crossing = (a + b) * 0.25 + 0.5;
    vec3 waves = mix(orbDeep, orbMid, smoothstep(0.05, 0.7, crossing));
    return mix(waves, orbLight, smoothstep(0.48, 0.98, crossing) * 0.85);
  }

  // 07 / Aurora: three translucent curtains billow vertically at different depths.
  vec3 rewardAurora(vec3 p, float t) {
    vec3 sky = mix(orbDeep, orbMid, 0.13 + 0.12 * (p.y + 1.0));
    for (int i = 0; i < 3; i++) {
      float layer = float(i);
      float wind = sin(p.y * 2.2 + t * 0.8 + layer * 2.1) * 0.26;
      float curtain = sin(p.x * (5.0 + layer) + wind * 5.0 + layer * 2.0 - t * 0.45);
      float veil = pow(0.5 + 0.5 * curtain, 6.0);
      float height = 0.45 + 0.4 * sin(p.y * 1.8 - t * 0.65 + layer);
      vec3 color = mix(orbMid, orbLight, 0.5 + 0.5 * sin(p.y * 2.0 + layer + t * 0.5));
      sky = mix(sky, color, veil * height * 0.85);
    }
    return sky;
  }

  // 08 / Plasma: forked filaments bend and carry charges along their length.
  vec3 rewardPlasma(vec3 p, float t) {
    float light = 0.0, halo = 0.0;
    for (int i = 0; i < 3; i++) {
      float branch = float(i);
      float path = -0.6 + branch * 0.6 + sin(p.y * 4.0 + t * 0.9 + branch) * 0.17;
      path += sin(p.y * 12.0 - t * 0.7 + branch * 3.0) * 0.09;
      float fork = path + sin(p.y * 5.0 + branch * 2.0 - t * 0.4) * 0.32;
      float distance = min(abs(p.x - path), abs(p.x - fork));
      float charge = 0.6 + 0.4 * sin(p.y * 5.0 - t * 2.5 + branch * 2.0);
      light += exp(-distance * 90.0) * charge;
      halo += exp(-distance * 9.0) * 0.4;
    }
    vec3 gas = mix(orbDeep, orbMid, clamp(0.1 + halo * 0.55, 0.0, 1.0));
    return mix(gas, orbLight, clamp(light, 0.0, 1.0));
  }

  // 09 / Blossom: six soft petals unfurl and close around a breathing center.
  vec3 rewardBlossom(vec3 p, float t) {
    float r = length(p.xy), a = atan(p.y, p.x + 0.00001);
    float opening = 0.5 + 0.5 * sin(t * 1.3);
    float petal = 0.5 + 0.5 * cos(a * 6.0 + sin(t * 0.4) * 0.45);
    float edge = 0.28 + opening * 0.25 + petal * (0.18 + opening * 0.25);
    float bloom = 1.0 - smoothstep(edge - 0.2, edge + 0.05, r);
    float ribs = pow(petal, 3.0) * smoothstep(0.12, 0.5, r);
    vec3 garden = mix(orbDeep, orbMid, 0.25 + r * 0.25);
    vec3 flower = mix(orbMid, orbLight, 0.35 + ribs * 0.45 + opening * 0.1);
    return mix(garden, flower, bloom);
  }

  // 10 / Crystal: fixed facets refract separate traveling bands of light.
  vec3 rewardCrystal(vec3 p, float t) {
    vec2 grid = rewardRotate(p.xy, 0.7854) * 4.3;
    vec2 tile = floor(grid), q = fract(grid);
    float triangle = step(q.x, q.y);
    float id = rewardHash(tile + triangle * 0.37);
    vec2 normal = vec2(cos(id * REWARD_TAU), sin(id * REWARD_TAU));
    float refraction = sin(dot(p.xy, normal) * 5.0 + t * 1.7 + id * 6.0);
    float edge = min(min(q.x, q.y), min(1.0 - q.x, 1.0 - q.y));
    float seam = rewardLine(edge, 0.012) + rewardLine(q.y - q.x, 0.015);
    vec3 facet = mix(orbDeep, orbMid, 0.35 + 0.4 * sin(id * 9.0 + t * 0.5));
    facet = mix(facet, orbLight, smoothstep(-0.2, 1.0, refraction) * 0.75);
    return mix(facet, orbLight, clamp(seam * 0.22, 0.0, 1.0));
  }

  // 11 / Infinity: nested figure-eight bands exchange colors around their crossings.
  vec3 rewardInfinity(vec3 p, float t) {
    vec2 q = rewardRotate(p.xy, sin(t * 0.4) * 0.3);
    float lemniscate = q.x * q.x + q.y * q.y;
    lemniscate = lemniscate * lemniscate - 0.8 * (q.x * q.x - q.y * q.y);
    float folds = 0.5 + 0.5 * cos(lemniscate * 19.0 - t * 1.8);
    float exchange = 0.5 + 0.5 * sin(q.x * 4.0 + t * 1.2);
    vec3 ink = mix(orbDeep, orbMid, exchange * 0.75);
    return mix(ink, mix(orbMid, orbLight, exchange), pow(folds, 3.0) * 0.85);
  }

  // 12 / Rain: staggered beads fall down refractive streams and leave long wakes.
  vec3 rewardRain(vec3 p, float t) {
    float x = p.x * 6.0 + sin(p.y * 2.0 + t * 0.7) * 0.16;
    float lane = floor(x), offset = rewardHash(vec2(lane, 4.0));
    float fall = fract(p.y * 0.75 + t * (0.65 + offset * 0.45) + offset);
    float side = abs(fract(x) - 0.5);
    float bead = exp(-side * side * 75.0 - pow((fall - 0.25) * 15.0, 2.0));
    float wake = exp(-side * side * 45.0) * smoothstep(0.2, 0.3, fall) * (1.0 - smoothstep(0.3, 0.95, fall));
    float stream = 0.5 + 0.5 * sin(x * REWARD_TAU + fall * 2.0);
    vec3 water = mix(orbDeep, orbMid, 0.2 + stream * 0.45);
    return mix(water, orbLight, clamp(bead * 0.95 + wake * 0.6, 0.0, 1.0));
  }

  // 13 / Embers: hot plumes rise, stretch and cool into a darker upper layer.
  vec3 rewardEmbers(vec3 p, float t) {
    vec2 q = vec2(p.x * 3.2, p.y * 2.0 - t * 1.1);
    float heat = rewardCloud(q + vec2(sin(p.y * 3.0 - t) * 0.5, 0.0));
    float tongues = sin(p.x * 8.0 + heat * 6.0 + sin(t * 0.6)) * 0.15;
    float height = p.y * 0.4 + 0.4;
    float fire = smoothstep(height - 0.12, height + 0.2, heat + tongues);
    float core = smoothstep(0.6, 0.92, heat - p.y * 0.3);
    return mix(mix(orbDeep, orbMid, fire), orbLight, core * 0.9);
  }

  // 14 / Nebula: independent cloud volumes pass behind softly twinkling dust.
  vec3 rewardNebula(vec3 p, float t) {
    float nearCloud = rewardCloud(p.xy * 2.4 + vec2(t * 0.27, -t * 0.19) + p.z * 0.8);
    float farCloud = rewardCloud(p.yz * 3.0 + vec2(-t * 0.16, t * 0.24) + 13.0);
    float dust = smoothstep(0.4, 0.78, nearCloud * 0.7 + farCloud * 0.5);
    vec2 starGrid = p.xy * 19.0 + vec2(t * 0.025, t * 0.04);
    float id = rewardHash(floor(starGrid));
    float star = (1.0 - smoothstep(0.035, 0.11, length(fract(starGrid) - 0.5))) * step(0.82, id);
    float twinkle = 0.55 + 0.45 * sin(t * 0.9 + id * 20.0);
    vec3 cloud = mix(orbDeep, orbMid, dust * 0.9);
    return mix(cloud, orbLight, clamp(pow(farCloud, 3.0) * 0.55 + star * twinkle, 0.0, 1.0));
  }

  // 15 / Pulse: paired impulses travel along a trace and diffuse into the body.
  vec3 rewardPulse(vec3 p, float t) {
    float travel = p.x * 2.2 - t * 2.0;
    float beat = pow(0.5 + 0.5 * cos(travel), 18.0)
      + pow(0.5 + 0.5 * cos(travel - 0.85), 24.0) * 0.55;
    float traceY = sin(p.x * 4.0 - t * 0.8) * 0.12 + beat * 0.25;
    float distance = abs(p.y - traceY);
    float signal = rewardLine(distance, 0.025);
    float diffusion = exp(-distance * (3.0 + beat * 2.0)) * beat;
    vec3 tissue = mix(orbDeep, orbMid, 0.25 + min(diffusion, 1.0) * 0.65);
    return mix(tissue, orbLight, clamp(signal * 0.65 + diffusion * 0.35, 0.0, 1.0));
  }

  // 16 / Kaleidoscope: mirrored chambers turn while prisms slide in and out.
  vec3 rewardKaleidoscope(vec3 p, float t) {
    float r = length(p.xy), a = atan(p.y, p.x + 0.00001) + t * 0.24;
    float fold = abs(mod(a, 1.0471976) - 0.5235988);
    vec2 q = vec2(cos(fold), sin(fold)) * r;
    float pane = sin(q.x * 13.0 - t * 1.1) * cos(q.y * 18.0 + t * 0.7);
    float glass = 0.5 + 0.5 * sin(q.x * 5.0 + q.y * 7.0 + t);
    float seam = rewardLine(pane, 0.06);
    vec3 prism = mix(orbDeep, orbMid, smoothstep(-0.65, 0.6, pane));
    return mix(prism, orbLight, clamp(glass * 0.5 + seam * 0.35, 0.0, 1.0));
  }

  // 17 / Tides: overlapping water layers climb and fall; foam follows each crest.
  vec3 rewardTides(vec3 p, float t) {
    vec3 sea = mix(orbDeep, orbMid, 0.18);
    for (int i = 0; i < 3; i++) {
      float layer = float(i);
      float height = -0.55 + layer * 0.42 + sin(t * 0.65 + layer) * 0.22;
      height += sin(p.x * (3.0 + layer) - t * (1.1 + layer * 0.25) + layer) * 0.13;
      float fill = 1.0 - smoothstep(height - 0.06, height + 0.06, p.y);
      float foam = exp(-pow((p.y - height) * 28.0, 2.0));
      vec3 water = mix(orbMid, orbLight, layer * 0.18);
      sea = mix(sea, water, fill * 0.75);
      sea = mix(sea, orbLight, foam * 0.7);
    }
    return sea;
  }

  // 18 / Weaving: crossing ribbons trade which strand passes over the other.
  vec3 rewardWeave(vec3 p, float t) {
    vec2 q = rewardRotate(p.xy, 0.3);
    float a = q.y - sin(q.x * 5.0 - t * 1.2) * 0.45;
    float b = q.y - sin(q.x * 5.0 + t * 1.2 + 2.1) * 0.45;
    float first = 1.0 - smoothstep(0.08, 0.2, abs(a));
    float second = 1.0 - smoothstep(0.08, 0.2, abs(b));
    float order = 0.5 + 0.5 * sin(q.x * 5.0 + t * 0.5);
    vec3 ribbonA = mix(orbMid, orbLight, 0.5 + 0.4 * sin(q.x * 3.0 - t * 2.0));
    vec3 ribbonB = mix(orbMid, orbLight, 0.5 + 0.4 * cos(q.x * 3.0 + t * 1.6));
    vec3 below = mix(mix(orbDeep, orbMid, 0.12), ribbonA, first);
    vec3 above = mix(mix(orbDeep, orbMid, 0.12), ribbonB, second);
    return mix(mix(below, ribbonB, second), mix(above, ribbonA, first), order);
  }

  // 19 / Mosaic: broad packets of color move between fixed, softly edged pixels.
  vec3 rewardMosaic(vec3 p, float t) {
    vec2 grid = p.xy * 6.0, tile = floor(grid), q = fract(grid);
    float id = rewardHash(tile);
    float packet = 0.5 + 0.5 * sin(tile.x * 0.85 - t * 1.7 + sin(tile.y * 0.8 + t * 0.6));
    float second = 0.5 + 0.5 * cos(tile.y * 1.2 + t * 1.1 + id * 1.2);
    float edge = min(min(q.x, q.y), min(1.0 - q.x, 1.0 - q.y));
    float pixel = smoothstep(0.02, 0.08, edge);
    vec3 ink = mix(orbDeep, orbMid, smoothstep(0.1, 0.8, packet));
    ink = mix(ink, orbLight, packet * second * 0.8);
    return mix(orbDeep, ink, pixel);
  }

  // 20 / Corona: convection cells churn beneath long radial tongues of light.
  vec3 rewardCorona(vec3 p, float t) {
    float r = length(p.xy), a = atan(p.y, p.x + 0.00001);
    vec3 cells = rewardCells(p.xy * 4.5, t * 0.8);
    float convection = smoothstep(0.02, 0.3, cells.y);
    float ray = 0.5 + 0.5 * sin(a * 14.0 + sin(r * 7.0 - t * 1.6) * 1.8);
    float flare = pow(ray, 4.0) * smoothstep(0.2, 0.9, r);
    float core = 1.0 - smoothstep(0.12, 0.65 + sin(t * 0.7) * 0.1, r);
    vec3 sun = mix(orbDeep, orbMid, 0.3 + convection * 0.6);
    return mix(sun, orbLight, clamp(core * 0.65 + flare * 0.85, 0.0, 1.0));
  }

  vec3 rewardPigment(vec3 p, float t, float mode) {
    if (mode < 1.5) return rewardFloes(p, t);
    if (mode < 2.5) return rewardRadar(p, t);
    if (mode < 3.5) return rewardCircuit(p, t);
    if (mode < 4.5) return rewardPipes(p, t);
    if (mode < 5.5) return rewardSilk(p, t);
    if (mode < 6.5) return rewardInterference(p, t);
    if (mode < 7.5) return rewardAurora(p, t);
    if (mode < 8.5) return rewardPlasma(p, t);
    if (mode < 9.5) return rewardBlossom(p, t);
    if (mode < 10.5) return rewardCrystal(p, t);
    if (mode < 11.5) return rewardInfinity(p, t);
    if (mode < 12.5) return rewardRain(p, t);
    if (mode < 13.5) return rewardEmbers(p, t);
    if (mode < 14.5) return rewardNebula(p, t);
    if (mode < 15.5) return rewardPulse(p, t);
    if (mode < 16.5) return rewardKaleidoscope(p, t);
    if (mode < 17.5) return rewardTides(p, t);
    if (mode < 18.5) return rewardWeave(p, t);
    if (mode < 19.5) return rewardMosaic(p, t);
    return rewardCorona(p, t);
  }
`;
