// =========================================================================
// Audify WebGL2 Dual-Aurora Engine (React Bits SoftAurora + Aurora)
// + Full Viewport Perimeter RGB Laser Border Motion Engine
// + Audio-Reactive Beat Sync & Full-Screen Song-Change Explosion System
// =========================================================================

(function initAudifyAuroraAndMixEngine() {
  if (window.__audify_aurora_initialized) return;
  window.__audify_aurora_initialized = true;

  // -----------------------------------------------------------------------
  // 1. WebGL2 Shaders (React Bits SoftAurora 3D Perlin & Curtain Ribbons)
  // -----------------------------------------------------------------------
  const MAX_PULSES = 4;
  const MAX_STOPS = 5;
  const MAX_LAYERS = 3;

  // Vertex shader for SoftAurora (gl_VertexID fullscreen triangle)
  const SOFT_VERTEX = `#version 300 es
  const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  void main() {
    gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
  }`;

  // Fragment shader for SoftAurora (React Bits 3D Perlin Noise + Wave Pulses)
  const SOFT_FRAGMENT = `#version 300 es
  precision highp float;
  uniform vec2 uResolution;
  uniform float uFlow;
  uniform float uHue;
  uniform float uScale;
  uniform float uBrightness;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uNoiseFreq;
  uniform float uNoiseAmp;
  uniform float uBandHeight;
  uniform float uBandSpread;
  uniform float uOctaveDecay;
  uniform float uLayerOffset;
  uniform vec2 uShift;
  uniform vec4 uCursor;
  uniform vec4 uPulses[${MAX_PULSES}];
  uniform float uSpectrum;
  uniform float uTilt;
  uniform vec3 uIntro;
  uniform float uLightMode;
  uniform float uOpacity;
  uniform float uAberration;
  uniform float uShockwave;
  uniform int uVisualMode;
  uniform float uBeatPulse;
  out vec4 fragColor;

  #define TAU 6.28318530718

  vec3 gradientHash(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 234.6)),
      dot(p, vec3(269.5, 183.3, 198.3)),
      dot(p, vec3(169.5, 283.3, 156.9))
    );
    vec3 h = fract(sin(p) * 43758.5453123);
    float phi = acos(clamp(2.0 * h.x - 1.0, -1.0, 1.0));
    float theta = TAU * h.y;
    return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
  }

  float quinticSmooth(float t) {
    float t2 = t * t;
    float t3 = t * t2;
    return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
  }

  vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(TAU * (c * t + d));
  }

  float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
    float x = px * frequency;
    float y = py * frequency;

    float fx = floor(x);
    float fy = floor(y);
    float fz = floor(pz);
    float cx = ceil(x);
    float cy = ceil(y);
    float cz = ceil(pz);

    vec3 g000 = gradientHash(vec3(fx, fy, fz));
    vec3 g100 = gradientHash(vec3(cx, fy, fz));
    vec3 g010 = gradientHash(vec3(fx, cy, fz));
    vec3 g110 = gradientHash(vec3(cx, cy, fz));
    vec3 g001 = gradientHash(vec3(fx, fy, cz));
    vec3 g101 = gradientHash(vec3(cx, fy, cz));
    vec3 g011 = gradientHash(vec3(fx, cy, cz));
    vec3 g111 = gradientHash(vec3(cx, cy, cz));

    float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
    float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
    float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
    float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
    float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
    float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
    float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
    float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

    float sx = quinticSmooth(x - fx);
    float sy = quinticSmooth(y - fy);
    float sz = quinticSmooth(pz - fz);

    float lx00 = mix(d000, d100, sx);
    float lx10 = mix(d010, d110, sx);
    float lx01 = mix(d001, d101, sx);
    float lx11 = mix(d011, d111, sx);

    float ly0 = mix(lx00, lx10, sy);
    float ly1 = mix(lx01, lx11, sy);

    return amplitude * mix(ly0, ly1, sz);
  }

  float auroraGlow(float t, vec2 uv, float bend) {
    float noiseVal = 0.0;
    float freq = uNoiseFreq;
    float amp = uNoiseAmp;
    vec2 samplePos = uv * uScale;

    for (float i = 0.0; i < 3.0; i += 1.0) {
      noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
      amp *= uOctaveDecay;
      freq *= 2.0;
    }

    float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;
    return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);
  }

  vec2 turn(vec2 p, vec2 center) {
    float c = cos(uTilt);
    float s = sin(uTilt);
    vec2 d = p - center;
    return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
  }

  vec3 evalAurora(vec2 sampleField, vec2 sampleUv, float bend, float boost, float t) {
    float glow1 = auroraGlow(t, sampleField, bend) * boost;
    float glow2 = auroraGlow(t + uLayerOffset, sampleField, bend) * boost;
    vec3 gradient1 = mix(vec3(1.0), cosineGradient(sampleUv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);
    vec3 gradient2 = mix(vec3(1.0), cosineGradient(sampleUv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);
    return (0.99 * glow1 * gradient1 * uColor1 + 0.99 * glow2 * gradient2 * uColor2) * uBrightness;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
    vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);
    vec2 cursor = turn(uCursor.xy, center);

    // Audio Shockwave Distortion on Beat Drops / Kicks
    if (uShockwave > 0.001) {
      vec2 waveCenter = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
      vec2 diff = screen - waveCenter;
      float dist = length(diff);
      float waveDist = uShockwave * 1.5;
      float waveThickness = 0.16;
      float diffDist = abs(dist - waveDist);
      if (diffDist < waveThickness) {
        float factor = (1.0 - diffDist / waveThickness) * (1.0 - uShockwave);
        screen += normalize(diff) * factor * 0.055;
      }
    }

    // Visual Mode 1: Vortex (Cosmic Spiral Warp)
    if (uVisualMode == 1) {
      vec2 d = screen - center;
      float r = length(d);
      float angle = atan(d.y, d.x);
      float spiral = (2.4 + (uBeatPulse - 1.0) * 0.8) * exp(-r * 1.6) + uFlow * 0.35;
      angle += spiral;
      screen = center + vec2(cos(angle), sin(angle)) * r;
    }
    // Visual Mode 2: Chromatic Wave (RGB Fluid Ripple)
    else if (uVisualMode == 2) {
      float waveX = sin(screen.y * 7.5 + uFlow * 1.4) * 0.07 * (1.0 + (uBeatPulse - 1.0) * 0.4);
      float waveY = cos(screen.x * 6.0 + uFlow * 1.1) * 0.05 * (1.0 + (uBeatPulse - 1.0) * 0.4);
      screen += vec2(waveX, waveY);
    }

    vec2 field = screen + uShift;
    float t = 0.4 * uFlow;

    float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;
    float gap = cursor.y + uShift.y - uBandHeight;
    float near = exp(-gap * gap / 0.16);
    float bend = reach * gap * near * 0.55;

    float pulse = 0.0;
    for (int i = 0; i < ${MAX_PULSES}; i++) {
      vec4 wave = uPulses[i];
      if (wave.z <= 0.0) continue;
      float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);
      pulse += wave.z * exp(-x * x);
    }
    float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;

    // Dynamic Chromatic Aberration & Channel Separation
    // On beat spikes (uBeatPulse > 1.8), uAberration triggers explosive channel separation:
    // col.r is evaluated at pos - offset, col.b is evaluated at pos + offset
    float effAberration = uAberration;
    if (uVisualMode == 2) {
      effAberration = max(effAberration, 0.022 + 0.015 * sin(uFlow * 2.2));
    } else if (uVisualMode == 1) {
      effAberration = max(effAberration, (uBeatPulse > 1.8 ? (uBeatPulse - 1.8) * 0.03 : 0.008));
    }

    vec3 col;
    if (effAberration > 0.0008) {
      vec2 offset = vec2(effAberration, effAberration * 0.35);
      float rCh = evalAurora(field - offset, uv - offset * 0.5, bend, boost, t).r;
      float gCh = evalAurora(field, uv, bend, boost, t).g;
      float bCh = evalAurora(field + offset, uv + offset * 0.5, bend, boost, t).b;
      col = vec3(rCh, gCh, bCh);
    } else {
      col = evalAurora(field, uv, bend, boost, t);
    }

    float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
    float alpha = clamp(length(col), 0.0, 1.0);
    vec3 color = clamp(col, 0.0, 1.0);
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);
  }`;

  // Vertex shader for Curtain Aurora
  const CURTAIN_VERTEX = `#version 300 es
  in vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

  // Fragment shader for Curtain Aurora (React Bits OKLab / OKLCH + Simplex Waves)
  const CURTAIN_FRAGMENT = `#version 300 es
  precision highp float;
  precision highp int;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uStops[${MAX_STOPS}];
  uniform int uStopCount;
  uniform float uAmplitude;
  uniform float uBlend;
  uniform float uHeight;
  uniform float uScale;
  uniform float uGlow;
  uniform float uBrightness;
  uniform int uLayers;
  uniform float uFlip;
  uniform vec3 uPointer;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uLightMode;
  uniform float uAberration;
  uniform float uShockwave;
  uniform int uVisualMode;
  uniform float uBeatPulse;
  out vec4 outColor;

  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float smootherstep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  vec3 oklabToLinear(vec3 c) {
    float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
    l = l * l * l;
    m = m * m * m;
    s = s * s * s;
    return vec3(
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
  }

  vec3 toSrgb(vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }

  vec3 ramp(float t) {
    float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);
    int i = int(min(floor(x), float(uStopCount - 2)));
    float f = x - float(i);
    f = f * f * (3.0 - 2.0 * f);
    vec3 lch = mix(uStops[i], uStops[i + 1], f);
    lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);
    return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    float y = 1.0 - frag.y / uResolution.y;
    y = mix(y, 1.0 - y, uFlip);
    float u = frag.x / uResolution.x;
    float X = (frag.x - uResolution.x * 0.5) / uResolution.y;
    float t = uTime;

    // Audio Shockwave Distortion on Beat Drops / Kicks
    if (uShockwave > 0.001) {
      vec2 waveCenter = vec2(0.0, 0.5);
      vec2 diff = vec2(X, y) - waveCenter;
      float dist = length(diff);
      float waveDist = uShockwave * 1.4;
      float waveThickness = 0.15;
      float diffDist = abs(dist - waveDist);
      if (diffDist < waveThickness) {
        float factor = (1.0 - diffDist / waveThickness) * (1.0 - uShockwave);
        vec2 offset = normalize(diff) * factor * 0.05;
        X += offset.x;
        y += offset.y;
      }
    }

    // Visual Mode 1: Vortex (Cosmic Spiral Warp)
    if (uVisualMode == 1) {
      vec2 p = vec2(X, y - 0.5);
      float r = length(p);
      float a = atan(p.y, p.x) + (2.2 + (uBeatPulse - 1.0) * 0.6) * exp(-r * 1.5) + t * 0.35;
      X = cos(a) * r;
      y = sin(a) * r + 0.5;
    }
    // Visual Mode 2: Chromatic Wave
    else if (uVisualMode == 2) {
      X += sin(y * 8.0 + t * 1.5) * 0.08 * (1.0 + (uBeatPulse - 1.0) * 0.35);
      y += cos(X * 6.5 + t * 1.2) * 0.06 * (1.0 + (uBeatPulse - 1.0) * 0.35);
    }

    float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));

    vec3 glow = vec3(0.0);
    float cover = 0.0;
    for (int k = 0; k < ${MAX_LAYERS}; k++) {
      if (k >= uLayers) break;
      float layer = float(k);
      float seed = layer * 13.7;
      float pace = t * (1.0 - layer * 0.18);
      float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));
      float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72
        + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;
      float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;
      hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);
      hem = mix(-0.25, hem, uReveal);

      float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);
      float rise = hem - y;
      float low = -soft - uGlow * 0.14;
      float high = 0.26 + soft * 0.6;

      float alpha = smootherstep(low, high, rise);
      float shape = smootherstep(high, low, rise);
      float tone = clamp(u + layer * 0.18 + warp * 0.1, 0.0, 1.0);

      float effAberration = uAberration;
      if (uVisualMode == 2) {
        effAberration = max(effAberration, 0.02 + 0.015 * sin(t * 2.0));
      }
      vec3 col;
      if (effAberration > 0.001) {
        vec3 colR = ramp(clamp(tone - effAberration * 0.5, 0.0, 1.0));
        vec3 colG = ramp(tone);
        vec3 colB = ramp(clamp(tone + effAberration * 0.5, 0.0, 1.0));
        col = vec3(colR.r, colG.g, colB.b);
      } else {
        col = ramp(tone);
      }

      glow += col * shape * (0.8 + 0.3 * (1.0 - layer / float(uLayers)));
      cover = max(cover, alpha);
    }

    float grain = (hash(frag + vec2(t * 11.3, -t * 7.1)) - 0.5) * 0.035;
    vec3 result = glow * uBrightness + grain;
    float outAlpha = clamp(cover * uOpacity, 0.0, 1.0);
    outColor = vec4(clamp(result, 0.0, 1.0) * outAlpha, outAlpha);
  }`;

  // -----------------------------------------------------------------------
  // 2. High-Performance Math & Color Utilities
  // -----------------------------------------------------------------------
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function smoother(t) {
    t = clamp(t, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function parseColor(c) {
    if (typeof c === 'string') {
      const match = c.match(/#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
      if (match) {
        return [
          parseInt(match[1], 16) / 255,
          parseInt(match[2], 16) / 255,
          parseInt(match[3], 16) / 255
        ];
      }
    }
    return [1, 1, 1];
  }

  function toOklch(rgb) {
    const r = rgb[0] > 0.04045 ? Math.pow((rgb[0] + 0.055) / 1.055, 2.4) : rgb[0] / 12.92;
    const g = rgb[1] > 0.04045 ? Math.pow((rgb[1] + 0.055) / 1.055, 2.4) : rgb[1] / 12.92;
    const b = rgb[2] > 0.04045 ? Math.pow((rgb[2] + 0.055) / 1.055, 2.4) : rgb[2] / 12.92;

    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

    const C = Math.sqrt(A * A + B * B);
    let h = Math.atan2(B, A);
    if (h < 0) h += 2 * Math.PI;
    return [L, C, h];
  }

  function unwrapHues(stops) {
    const out = [];
    let prev = stops[0][2];
    for (let i = 0; i < stops.length; i++) {
      let h = stops[i][2];
      while (h - prev > Math.PI) h -= 2 * Math.PI;
      while (h - prev < -Math.PI) h += 2 * Math.PI;
      out.push([stops[i][0], stops[i][1], h]);
      prev = h;
    }
    return out;
  }

  // -----------------------------------------------------------------------
  // 3. WebGL2 Context & Canvas Attachment (Stacking Context: z-index 0)
  // -----------------------------------------------------------------------
  let canvas = document.getElementById('audify-aurora-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'audify-aurora-canvas';
  }

  function ensureCanvasAttached() {
    if (!canvas.isConnected && document.body) {
      document.body.prepend(canvas);
    }
  }
  ensureCanvasAttached();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureCanvasAttached);
  }
  canvas.style.cssText = `
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    height: 100dvh !important;
    max-width: 100% !important;
    max-height: 100dvh !important;
    pointer-events: none !important;
    z-index: 0 !important;
    opacity: 0.94 !important;
    mix-blend-mode: screen !important;
    transition: opacity 0.4s ease !important;
  `;

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });

  if (!gl) {
    console.warn('[Audify Aurora] WebGL2 not supported on this browser.');
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Shader compilation helper
  function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[Audify Aurora Shader Error]', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[Audify Aurora Program Error]', gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  // SoftAurora Program
  const softProgram = createProgram(gl, SOFT_VERTEX, SOFT_FRAGMENT);
  let softShader = null;
  let softVao = null;
  if (softProgram) {
    softVao = gl.createVertexArray();
    softShader = {
      program: softProgram,
      uniforms: {
        uResolution: gl.getUniformLocation(softProgram, 'uResolution'),
        uFlow: gl.getUniformLocation(softProgram, 'uFlow'),
        uHue: gl.getUniformLocation(softProgram, 'uHue'),
        uScale: gl.getUniformLocation(softProgram, 'uScale'),
        uBrightness: gl.getUniformLocation(softProgram, 'uBrightness'),
        uColor1: gl.getUniformLocation(softProgram, 'uColor1'),
        uColor2: gl.getUniformLocation(softProgram, 'uColor2'),
        uNoiseFreq: gl.getUniformLocation(softProgram, 'uNoiseFreq'),
        uNoiseAmp: gl.getUniformLocation(softProgram, 'uNoiseAmp'),
        uBandHeight: gl.getUniformLocation(softProgram, 'uBandHeight'),
        uBandSpread: gl.getUniformLocation(softProgram, 'uBandSpread'),
        uOctaveDecay: gl.getUniformLocation(softProgram, 'uOctaveDecay'),
        uLayerOffset: gl.getUniformLocation(softProgram, 'uLayerOffset'),
        uShift: gl.getUniformLocation(softProgram, 'uShift'),
        uCursor: gl.getUniformLocation(softProgram, 'uCursor'),
        uPulses: gl.getUniformLocation(softProgram, 'uPulses'),
        uSpectrum: gl.getUniformLocation(softProgram, 'uSpectrum'),
        uTilt: gl.getUniformLocation(softProgram, 'uTilt'),
        uIntro: gl.getUniformLocation(softProgram, 'uIntro'),
        uLightMode: gl.getUniformLocation(softProgram, 'uLightMode'),
        uOpacity: gl.getUniformLocation(softProgram, 'uOpacity'),
        uAberration: gl.getUniformLocation(softProgram, 'uAberration'),
        uShockwave: gl.getUniformLocation(softProgram, 'uShockwave'),
        uVisualMode: gl.getUniformLocation(softProgram, 'uVisualMode'),
        uBeatPulse: gl.getUniformLocation(softProgram, 'uBeatPulse')
      }
    };
  }

  // Curtain Aurora Program
  const curtainProgram = createProgram(gl, CURTAIN_VERTEX, CURTAIN_FRAGMENT);
  let curtainShader = null;
  let curtainVao = null;
  if (curtainProgram) {
    curtainVao = gl.createVertexArray();
    gl.bindVertexArray(curtainVao);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(curtainProgram, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    curtainShader = {
      program: curtainProgram,
      uniforms: {
        uResolution: gl.getUniformLocation(curtainProgram, 'uResolution'),
        uTime: gl.getUniformLocation(curtainProgram, 'uTime'),
        uStops: gl.getUniformLocation(curtainProgram, 'uStops'),
        uStopCount: gl.getUniformLocation(curtainProgram, 'uStopCount'),
        uAmplitude: gl.getUniformLocation(curtainProgram, 'uAmplitude'),
        uBlend: gl.getUniformLocation(curtainProgram, 'uBlend'),
        uHeight: gl.getUniformLocation(curtainProgram, 'uHeight'),
        uScale: gl.getUniformLocation(curtainProgram, 'uScale'),
        uGlow: gl.getUniformLocation(curtainProgram, 'uGlow'),
        uBrightness: gl.getUniformLocation(curtainProgram, 'uBrightness'),
        uLayers: gl.getUniformLocation(curtainProgram, 'uLayers'),
        uFlip: gl.getUniformLocation(curtainProgram, 'uFlip'),
        uPointer: gl.getUniformLocation(curtainProgram, 'uPointer'),
        uReveal: gl.getUniformLocation(curtainProgram, 'uReveal'),
        uOpacity: gl.getUniformLocation(curtainProgram, 'uOpacity'),
        uLightMode: gl.getUniformLocation(curtainProgram, 'uLightMode'),
        uAberration: gl.getUniformLocation(curtainProgram, 'uAberration'),
        uShockwave: gl.getUniformLocation(curtainProgram, 'uShockwave'),
        uVisualMode: gl.getUniformLocation(curtainProgram, 'uVisualMode'),
        uBeatPulse: gl.getUniformLocation(curtainProgram, 'uBeatPulse')
      }
    };
  }

  // -----------------------------------------------------------------------
  // 4. The 8 Distinctive RGB Aurora Motion Patterns & Mood Palettes
  // -----------------------------------------------------------------------
  const AURORA_PATTERNS = [
    {
      id: 'prismatic-rgb',
      name: 'PRISMATIC RGB WAVE',
      tag: 'REACT.DEV SPECTRUM',
      icon: '🌈',
      soft: { c1: '#ff0055', c2: '#00e5ff', spectrum: 1.0, bandHeight: 0.52 },
      curtain: ['#ff0033', '#00ff66', '#0066ff', '#e100ff', '#ff0033'],
      borderGradient: 'linear-gradient(90deg, #ff0055, #ffaa00, #00ff66, #00f0ff, #0066ff, #e100ff, #ff0055)',
      ambientGlow: 'rgba(0, 240, 255, 0.45)',
      laserSpeed: '2.4s',
      mode: 'conic-sweep'
    },
    {
      id: 'cyber-laser',
      name: 'CYBERPUNK NEON SWEEP',
      tag: 'TOKYO TRON DRIFT',
      icon: '⚡',
      soft: { c1: '#00f5ff', c2: '#e100ff', spectrum: 0.95, bandHeight: 0.50 },
      curtain: ['#5227ff', '#00f5ff', '#ff007a', '#7cff67', '#5227ff'],
      borderGradient: 'linear-gradient(90deg, #00f5ff, #ffffff, #e100ff, #5227ff, #00f5ff)',
      ambientGlow: 'rgba(225, 0, 255, 0.5)',
      laserSpeed: '1.8s',
      mode: 'dual-counter'
    },
    {
      id: 'borealis-matrix',
      name: 'EMERALD BOREALIS',
      tag: 'NORDIC NIGHT GLOW',
      icon: '🌲',
      soft: { c1: '#00ff87', c2: '#00e5ff', spectrum: 0.85, bandHeight: 0.55 },
      curtain: ['#00ff87', '#00e5ff', '#4338ca', '#2af598', '#00ff87'],
      borderGradient: 'linear-gradient(90deg, #00ff87, #00e5ff, #38bdf8, #4338ca, #00ff87)',
      ambientGlow: 'rgba(0, 255, 135, 0.45)',
      laserSpeed: '3.0s',
      mode: 'wave-oscillate'
    },
    {
      id: 'solar-flare',
      name: '808 SOLAR PLASMA',
      tag: 'HIGH-BASS FLAME',
      icon: '🔥',
      soft: { c1: '#ffd000', c2: '#ff0055', spectrum: 0.9, bandHeight: 0.48 },
      curtain: ['#ff8800', '#ffd000', '#ff0055', '#ff3300', '#ff8800'],
      borderGradient: 'linear-gradient(90deg, #ffd000, #ff6b00, #ff0055, #ff0033, #ffd000)',
      ambientGlow: 'rgba(255, 136, 0, 0.55)',
      laserSpeed: '1.6s',
      mode: 'perimeter-pulse'
    },
    {
      id: 'ultraviolet-hyper',
      name: 'ULTRAVIOLET HYPERDRIVE',
      tag: 'COSMIC VOID PULSE',
      icon: '🌌',
      soft: { c1: '#7928ca', c2: '#ff0080', spectrum: 0.9, bandHeight: 0.53 },
      curtain: ['#7928ca', '#ff0080', '#00dfd8', '#2e0854', '#7928ca'],
      borderGradient: 'linear-gradient(90deg, #7928ca, #ff0080, #ffffff, #00dfd8, #7928ca)',
      ambientGlow: 'rgba(121, 40, 202, 0.55)',
      laserSpeed: '2.0s',
      mode: 'conic-sweep'
    },
    {
      id: 'acid-velocity',
      name: 'ACID LIME VELOCITY',
      tag: 'AUDIFY SIGNATURE OVERDRIVE',
      icon: '💥',
      soft: { c1: '#c8ff00', c2: '#00ffff', spectrum: 0.95, bandHeight: 0.46 },
      curtain: ['#c8ff00', '#00ffff', '#9d00ff', '#10b981', '#c8ff00'],
      borderGradient: 'linear-gradient(90deg, #c8ff00, #00ffff, #ffffff, #9d00ff, #c8ff00)',
      ambientGlow: 'rgba(200, 255, 0, 0.55)',
      laserSpeed: '1.4s',
      mode: 'dual-counter'
    },
    {
      id: 'optical-prism',
      name: 'OPTICAL DIFFRACTION PRISM',
      tag: 'PURE RGB CHROMATIC',
      icon: '💎',
      soft: { c1: '#ff0000', c2: '#00ff00', spectrum: 1.0, bandHeight: 0.5 },
      curtain: ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#ff0000'],
      borderGradient: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
      ambientGlow: 'rgba(255, 255, 255, 0.5)',
      laserSpeed: '2.2s',
      mode: 'corner-strobing'
    },
    {
      id: 'synthwave-dusk',
      name: 'MIAMI SYNTHWAVE DUSK',
      tag: 'RETRO 80S HORIZON',
      icon: '🌅',
      soft: { c1: '#ff7e5f', c2: '#feb47b', spectrum: 0.85, bandHeight: 0.44 },
      curtain: ['#b92b27', '#ff7e5f', '#feb47b', '#1565c0', '#b92b27'],
      borderGradient: 'linear-gradient(90deg, #ff7e5f, #feb47b, #ff007a, #b92b27, #ff7e5f)',
      ambientGlow: 'rgba(255, 126, 95, 0.5)',
      laserSpeed: '2.8s',
      mode: 'wave-oscillate'
    },
    {
      id: 'quantum-pulse',
      name: 'QUANTUM PULSE VELOCITY',
      tag: 'DEEP SUB-ATOMIC CHOP',
      icon: '⚛️',
      soft: { c1: '#00ffcc', c2: '#ff00aa', spectrum: 1.0, bandHeight: 0.51 },
      curtain: ['#00ffcc', '#7000ff', '#ff00aa', '#00f0ff', '#00ffcc'],
      borderGradient: 'linear-gradient(90deg, #00ffcc, #7000ff, #ff00aa, #ffffff, #00f0ff, #00ffcc)',
      ambientGlow: 'rgba(0, 255, 204, 0.55)',
      laserSpeed: '1.7s',
      mode: 'perimeter-pulse'
    },
    {
      id: 'tokyo-drift',
      name: 'TOKYO DRIFT NEON',
      tag: 'SHIBUYA UNDERGROUND BASS',
      icon: '🏎️',
      soft: { c1: '#ff0055', c2: '#ffea00', spectrum: 0.95, bandHeight: 0.49 },
      curtain: ['#ff0055', '#ff9900', '#ffea00', '#00e5ff', '#ff0055'],
      borderGradient: 'linear-gradient(90deg, #ff0055, #ff6600, #ffea00, #00e5ff, #ffffff, #ff0055)',
      ambientGlow: 'rgba(255, 0, 85, 0.55)',
      laserSpeed: '1.5s',
      mode: 'dual-counter'
    },
    {
      id: 'supernova-gold',
      name: 'SUPERNOVA CELESTIAL GOLD',
      tag: 'CELESTIAL GOLD & SUPERMASSIVE WHITE STROBE',
      icon: '🌟',
      soft: { c1: '#ffd700', c2: '#ffffff', spectrum: 0.95, bandHeight: 0.50 },
      curtain: ['#ffd700', '#fff3b0', '#ffffff', '#ffaa00', '#ffd700'],
      borderGradient: 'linear-gradient(90deg, #ffd700, #fff8db, #ffffff, #ffaa00, #ffd700)',
      ambientGlow: 'rgba(255, 215, 0, 0.55)',
      laserSpeed: '1.5s',
      mode: 'corner-strobing'
    },
    {
      id: 'interstellar-void',
      name: 'INTERSTELLAR VOID',
      tag: 'DEEP SPACE OBSIDIAN & COBALT STARLIGHT',
      icon: '🌌',
      soft: { c1: '#002b5c', c2: '#00d4ff', spectrum: 0.88, bandHeight: 0.52 },
      curtain: ['#020b14', '#002b5c', '#0052cc', '#00d4ff', '#020b14'],
      borderGradient: 'linear-gradient(90deg, #020b14, #002b5c, #0052cc, #00d4ff, #ffffff, #002b5c)',
      ambientGlow: 'rgba(0, 212, 255, 0.45)',
      laserSpeed: '2.5s',
      mode: 'wave-oscillate'
    },
    {
      id: 'hyper-pop-bubblegum',
      name: 'HYPER-POP BUBBLEGUM',
      tag: 'ELECTRIC CANDY PASTEL SURGE',
      icon: '🍬',
      soft: { c1: '#ff69b4', c2: '#00ffff', spectrum: 1.0, bandHeight: 0.48 },
      curtain: ['#ff69b4', '#ff1493', '#ffc0cb', '#00ffff', '#ff69b4'],
      borderGradient: 'linear-gradient(90deg, #ff69b4, #ff1493, #ffffff, #00ffff, #ff69b4)',
      ambientGlow: 'rgba(255, 105, 180, 0.55)',
      laserSpeed: '1.6s',
      mode: 'dual-counter'
    },
    {
      id: 'volcanic-magma',
      name: 'VOLCANIC MAGMA',
      tag: 'MOLTEN OBSIDIAN & INCANDESCENT EMBER',
      icon: '🌋',
      soft: { c1: '#ff2200', c2: '#ff8800', spectrum: 0.92, bandHeight: 0.46 },
      curtain: ['#1f0400', '#ff2200', '#ff6600', '#ffcc00', '#1f0400'],
      borderGradient: 'linear-gradient(90deg, #ff2200, #ff6600, #ffcc00, #ffffff, #1f0400, #ff2200)',
      ambientGlow: 'rgba(255, 68, 0, 0.60)',
      laserSpeed: '1.9s',
      mode: 'perimeter-pulse'
    },
    {
      id: 'glitch-cyberpunk',
      name: 'GLITCH CYBERPUNK',
      tag: 'ANARCHIC NEON & CHROMATIC SPLIT',
      icon: '⚡',
      soft: { c1: '#ff003c', c2: '#00f0ff', spectrum: 1.0, bandHeight: 0.51 },
      curtain: ['#ff003c', '#00f0ff', '#fcee0a', '#05d9e8', '#ff003c'],
      borderGradient: 'linear-gradient(90deg, #ff003c, #fcee0a, #00f0ff, #ffffff, #ff003c)',
      ambientGlow: 'rgba(255, 0, 60, 0.55)',
      laserSpeed: '1.2s',
      mode: 'corner-strobing'
    },
    {
      id: 'radioactive-isotope',
      name: 'RADIOACTIVE ISOTOPE',
      tag: 'PHOSPHORESCENT GREEN & ELECTRIC TURQUOISE',
      icon: '☢️',
      soft: { c1: '#39ff14', c2: '#00ffcc', spectrum: 0.95, bandHeight: 0.53 },
      curtain: ['#003300', '#39ff14', '#00ffcc', '#76ff03', '#003300'],
      borderGradient: 'linear-gradient(90deg, #39ff14, #00ffcc, #ffffff, #76ff03, #39ff14)',
      ambientGlow: 'rgba(57, 255, 20, 0.55)',
      laserSpeed: '1.7s',
      mode: 'conic-sweep'
    }
  ];

  // Aliases for 16 Harmonic Mood Palettes matching RGB Aurora Border Patterns
  const MOOD_PALETTES = AURORA_PATTERNS;
  window.MOOD_PALETTES = MOOD_PALETTES;
  window.AURORA_PATTERNS = AURORA_PATTERNS;

  // Pre-parse and pre-calculate all palette colors & OKLCH stops once at initialization (Zero GC Churn)
  const PRECOMPUTED_PATTERNS = AURORA_PATTERNS.map((pal) => {
    const c1 = parseColor(pal.soft.c1);
    const c2 = parseColor(pal.soft.c2);
    const curtainStops = pal.curtain.map(parseColor);
    const curtainBuf = new Float32Array(MAX_STOPS * 3);
    unwrapHues(curtainStops.map(toOklch)).forEach((stop, idx) => {
      curtainBuf.set(stop, idx * 3);
    });
    return {
      ...pal,
      parsedSoft: {
        c1: new Float32Array(c1),
        c2: new Float32Array(c2)
      },
      curtainBuffer: curtainBuf
    };
  });
  const PRECOMPUTED_PALETTES = PRECOMPUTED_PATTERNS;
  const PALETTE_BY_ID = Object.fromEntries(AURORA_PATTERNS.map((p, idx) => [p.id, idx]));
  window.__AUDIFY_PALETTES = PRECOMPUTED_PALETTES;

  let currentPaletteIdx = 0;
  let targetPaletteIdx = 0;
  let paletteTransition = 1.0;
  const PALETTE_TRANSITION_DURATION = 1.2;
  let paletteTransitionElapsed = PALETTE_TRANSITION_DURATION;
  let activePatternIdx = 0;

  // Active effect mode: 'auto' | 'soft' | 'curtain' | 'fusion' | 'vortex' | 'chromatic-wave'
  let auroraMode = localStorage.getItem('audify_aurora_mode') || 'auto';
  let activeEffect = 'soft'; // Currently running effect in auto mode
  const AUTO_EFFECT_CYCLE = ['soft', 'curtain', 'fusion', 'vortex', 'chromatic-wave'];

  // -----------------------------------------------------------------------
  // 5. Perimeter RGB Aurora Border, Shockwave & Toast Injection
  // -----------------------------------------------------------------------
  function ensureBorderStyles() {
    if (document.getElementById('audify-rgb-border-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'audify-rgb-border-styles';
    styleEl.textContent = `
      :root {
        --audify-border-gradient: ${AURORA_PATTERNS[0].borderGradient};
        --audify-border-glow: ${AURORA_PATTERNS[0].ambientGlow};
        --audify-laser-speed: ${AURORA_PATTERNS[0].laserSpeed};
      }

      /* Viewport Perimeter RGB Border Container */
      #audify-rgb-aurora-border {
        position: fixed !important;
        inset: 0 !important;
        pointer-events: none !important;
        z-index: 10 !important;
        overflow: hidden !important;
      }

      /* 4 Perimeter Laser Beams */
      .audify-laser-beam {
        position: absolute !important;
        pointer-events: none !important;
        opacity: 0.95 !important;
        will-change: transform, opacity !important;
      }

      .audify-laser-top {
        top: 0 !important;
        left: 0 !important;
        width: 200% !important;
        height: 3px !important;
        background: var(--audify-border-gradient) !important;
        box-shadow: 0 0 16px var(--audify-border-glow), 0 0 32px var(--audify-border-glow) !important;
        animation: audifyLaserSlideH var(--audify-laser-speed) linear infinite !important;
      }

      .audify-laser-bottom {
        bottom: 0 !important;
        left: -100% !important;
        width: 200% !important;
        height: 3px !important;
        background: var(--audify-border-gradient) !important;
        box-shadow: 0 0 16px var(--audify-border-glow), 0 0 32px var(--audify-border-glow) !important;
        animation: audifyLaserSlideHReverse var(--audify-laser-speed) linear infinite !important;
      }

      .audify-laser-left {
        top: -100% !important;
        left: 0 !important;
        width: 3px !important;
        height: 200% !important;
        background: var(--audify-border-gradient) !important;
        box-shadow: 0 0 16px var(--audify-border-glow), 0 0 32px var(--audify-border-glow) !important;
        animation: audifyLaserSlideVReverse var(--audify-laser-speed) linear infinite !important;
      }

      .audify-laser-right {
        top: 0 !important;
        right: 0 !important;
        width: 3px !important;
        height: 200% !important;
        background: var(--audify-border-gradient) !important;
        box-shadow: 0 0 16px var(--audify-border-glow), 0 0 32px var(--audify-border-glow) !important;
        animation: audifyLaserSlideV var(--audify-laser-speed) linear infinite !important;
      }

      /* Ambient Inward Glow */
      .audify-border-ambient {
        position: absolute !important;
        inset: 0 !important;
        box-shadow: inset 0 0 45px var(--audify-border-glow), inset 0 0 90px rgba(0, 0, 0, 0.45) !important;
        transition: box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        pointer-events: none !important;
      }

      /* 4 Glowing Corner Flares */
      .audify-corner-flare {
        position: absolute !important;
        width: 18px !important;
        height: 18px !important;
        pointer-events: none !important;
        filter: drop-shadow(0 0 10px var(--audify-border-glow)) !important;
      }
      .audify-corner-tl { top: 0 !important; left: 0 !important; border-top: 3px solid #ffffff; border-left: 3px solid #ffffff; }
      .audify-corner-tr { top: 0 !important; right: 0 !important; border-top: 3px solid #ffffff; border-right: 3px solid #ffffff; }
      .audify-corner-br { bottom: 0 !important; right: 0 !important; border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff; }
      .audify-corner-bl { bottom: 0 !important; left: 0 !important; border-bottom: 3px solid #ffffff; border-left: 3px solid #ffffff; }

      @keyframes audifyLaserSlideH {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }
      @keyframes audifyLaserSlideHReverse {
        0% { transform: translateX(0%); }
        100% { transform: translateX(50%); }
      }
      @keyframes audifyLaserSlideV {
        0% { transform: translateY(0%); }
        100% { transform: translateY(-50%); }
      }
      @keyframes audifyLaserSlideVReverse {
        0% { transform: translateY(0%); }
        100% { transform: translateY(50%); }
      }

      /* Full-Screen Song Change Explosion Shockwave */
      #audify-shockwave-ring {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        width: 100vmax !important;
        height: 100vmax !important;
        margin-top: -50vmax !important;
        margin-left: -50vmax !important;
        border-radius: 50% !important;
        border: 4px solid var(--audify-border-glow) !important;
        box-shadow: 0 0 50px var(--audify-border-glow), inset 0 0 50px var(--audify-border-glow) !important;
        pointer-events: none !important;
        z-index: 12 !important;
        opacity: 0 !important;
        transform: scale(0.05) !important;
      }

      #audify-shockwave-ring.audify-shockwave-active {
        animation: audifyShockwaveExpand 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyShockwaveExpand {
        0% {
          opacity: 0.95;
          transform: scale(0.05);
          filter: blur(0px);
        }
        50% {
          opacity: 0.6;
          filter: blur(3px);
        }
        100% {
          opacity: 0;
          transform: scale(1.6);
          filter: blur(16px);
        }
      }

      /* Full-Screen Chromatic Aura Flash */
      #audify-chromatic-flash {
        position: fixed !important;
        inset: 0 !important;
        background: var(--audify-border-glow) !important;
        mix-blend-mode: screen !important;
        pointer-events: none !important;
        z-index: 11 !important;
        opacity: 0 !important;
      }

      #audify-chromatic-flash.audify-flash-active {
        animation: audifyFlashFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyFlashFade {
        0% { opacity: 0.65; }
        100% { opacity: 0; }
      }

      /* Floating Song Change HUD Toast Badge */
      #audify-songchange-badge {
        position: fixed !important;
        top: 24px !important;
        left: 50% !important;
        transform: translateX(-50%) translateY(-30px) scale(0.92) !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 10px 20px !important;
        background: rgba(8, 9, 12, 0.92) !important;
        backdrop-filter: blur(28px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
        border-radius: 9999px !important;
        border: 1.5px solid rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px var(--audify-border-glow), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important;
        pointer-events: none !important;
        opacity: 0 !important;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
        max-width: min(520px, calc(100vw - 32px)) !important;
      }

      #audify-songchange-badge.audify-badge-show {
        opacity: 1 !important;
        transform: translateX(-50%) translateY(0) scale(1) !important;
      }

      .audify-badge-icon {
        font-size: 20px !important;
        line-height: 1 !important;
        animation: audifyBadgePulse 1.2s infinite ease-in-out !important;
      }

      @keyframes audifyBadgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      .audify-badge-text {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
      }

      .audify-badge-kicker {
        font-family: var(--font-anton), 'Anton', sans-serif !important;
        font-size: 10px !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
        color: #c8ff00 !important;
        line-height: 1 !important;
      }

      .audify-badge-title {
        font-family: var(--font-anton), 'Anton', sans-serif !important;
        font-size: 14px !important;
        letter-spacing: 0.04em !important;
        text-transform: uppercase !important;
        color: #ffffff !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        line-height: 1.2 !important;
      }

      .audify-badge-pattern {
        font-size: 10px !important;
        color: rgba(255, 255, 255, 0.6) !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
        line-height: 1 !important;
      }

      /* Reactive Card Borders */
      main button[class*="rounded-"],
      main a[class*="rounded-"] {
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      main button[class*="rounded-"]:hover,
      main a[class*="rounded-"]:hover {
        box-shadow: 0 0 18px var(--audify-border-glow), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  function ensureBorderAttached() {
    ensureBorderStyles();
    if (!document.getElementById('audify-rgb-aurora-border')) {
      const borderEl = document.createElement('div');
      borderEl.id = 'audify-rgb-aurora-border';
      borderEl.innerHTML = `
        <div class="audify-laser-beam audify-laser-top"></div>
        <div class="audify-laser-beam audify-laser-right"></div>
        <div class="audify-laser-beam audify-laser-bottom"></div>
        <div class="audify-laser-beam audify-laser-left"></div>
        <div class="audify-border-ambient"></div>
        <div class="audify-corner-flare audify-corner-tl"></div>
        <div class="audify-corner-flare audify-corner-tr"></div>
        <div class="audify-corner-flare audify-corner-br"></div>
        <div class="audify-corner-flare audify-corner-bl"></div>
      `;
      document.body.appendChild(borderEl);
    }

    if (!document.getElementById('audify-shockwave-ring')) {
      const shockwave = document.createElement('div');
      shockwave.id = 'audify-shockwave-ring';
      document.body.appendChild(shockwave);
    }

    if (!document.getElementById('audify-chromatic-flash')) {
      const flash = document.createElement('div');
      flash.id = 'audify-chromatic-flash';
      document.body.appendChild(flash);
    }

    if (!document.getElementById('audify-songchange-badge')) {
      const badge = document.createElement('div');
      badge.id = 'audify-songchange-badge';
      badge.innerHTML = `
        <span class="audify-badge-icon">🌈</span>
        <div class="audify-badge-text">
          <div class="audify-badge-kicker">NOW PLAYING · AURORA RGB SYNC</div>
          <div class="audify-badge-title" id="audify-badge-title-el">TAIWAN REMIX · LIVE</div>
          <div class="audify-badge-pattern" id="audify-badge-pattern-el">AURORA: PRISMATIC RGB WAVE</div>
        </div>
      `;
      document.body.appendChild(badge);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBorderAttached);
  } else {
    ensureBorderAttached();
  }

  // -----------------------------------------------------------------------
  // 6. Interactive State, Beat Pulses & Motion Choreography
  // -----------------------------------------------------------------------
  let beatPulse = 1.0;
  let flowVelocity = 1.0;
  let flowSurgeTime = 0.0;
  const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, presence: 0 };
  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, inside: false };
  const curtainState = { px: 0, py: 0, reach: 0, clock: 0 };

  // Pulse pool for zero GC churn in render loop
  const PULSE_POOL_SIZE = MAX_PULSES;
  const pulsePool = [];
  for (let i = 0; i < PULSE_POOL_SIZE; i++) {
    pulsePool.push({ x: 0, y: 0, age: 999.0, active: false });
  }

  function addPulse(x, y) {
    let oldestIdx = 0;
    let maxAge = -1;
    let slot = -1;
    for (let i = 0; i < PULSE_POOL_SIZE; i++) {
      if (!pulsePool[i].active) {
        slot = i;
        break;
      }
      if (pulsePool[i].age > maxAge) {
        maxAge = pulsePool[i].age;
        oldestIdx = i;
      }
    }
    if (slot === -1) slot = oldestIdx;
    const p = pulsePool[slot];
    p.x = x;
    p.y = y;
    p.age = 0.0;
    p.active = true;
  }

  const pulseData = new Float32Array(MAX_PULSES * 4);
  const paletteBuffer = new Float32Array(MAX_STOPS * 3);

  let flow = 0;
  let hue = 0;
  let lastTime = performance.now();
  let trackCounter = 0;

  // Global Beat Pulse Trigger
  window.triggerAudifyBeatPulse = function (intensity = 1.8) {
    beatPulse = Math.max(beatPulse, intensity);

    // Inject SoftAurora wave pulse along band (zero allocation via pool)
    const aspect = canvas.width / Math.max(1, canvas.height);
    addPulse(
      (0.2 + 0.6 * Math.random()) * aspect,
      0.5 + (Math.random() - 0.5) * 0.15
    );
  };

  // Helper to trigger full-screen shockwave and flash
  function triggerSongChangeExplosion(pattern, songTitle) {
    ensureBorderAttached();
    const shockwave = document.getElementById('audify-shockwave-ring');
    const flash = document.getElementById('audify-chromatic-flash');
    const badge = document.getElementById('audify-songchange-badge');

    if (shockwave) {
      shockwave.classList.remove('audify-shockwave-active');
      void shockwave.offsetWidth;
      shockwave.classList.add('audify-shockwave-active');
    }

    if (flash) {
      flash.classList.remove('audify-flash-active');
      void flash.offsetWidth;
      flash.classList.add('audify-flash-active');
    }

    if (badge) {
      const titleEl = document.getElementById('audify-badge-title-el');
      const patternEl = document.getElementById('audify-badge-pattern-el');
      const iconEl = badge.querySelector('.audify-badge-icon');
      if (titleEl) titleEl.textContent = songTitle || ('TRACK #' + trackCounter);
      if (patternEl) patternEl.textContent = 'AURORA: ' + pattern.name;
      if (iconEl) iconEl.textContent = pattern.icon;

      badge.classList.remove('audify-badge-show');
      void badge.offsetWidth;
      badge.classList.add('audify-badge-show');

      if (window.__audify_badge_timer) clearTimeout(window.__audify_badge_timer);
      window.__audify_badge_timer = setTimeout(() => {
        badge.classList.remove('audify-badge-show');
      }, 3000);
    }
  }

  // Update CSS Variables for Active Pattern
  function updateBorderCssVariables(pattern) {
    const root = document.documentElement;
    root.style.setProperty('--audify-border-gradient', pattern.borderGradient);
    root.style.setProperty('--audify-border-glow', pattern.ambientGlow);
    root.style.setProperty('--audify-laser-speed', pattern.laserSpeed);
  }

  // Programmatic Palette/Pattern Selector
  window.setAudifyPalette = function (idOrIdx) {
    let targetIdx = -1;
    if (typeof idOrIdx === 'number') {
      targetIdx = Math.max(0, Math.min(AURORA_PATTERNS.length - 1, idOrIdx));
    } else if (typeof idOrIdx === 'string' && PALETTE_BY_ID[idOrIdx] !== undefined) {
      targetIdx = PALETTE_BY_ID[idOrIdx];
    }
    if (targetIdx !== -1 && targetIdx !== targetPaletteIdx) {
      activePatternIdx = targetIdx;
      targetPaletteIdx = targetIdx;
      paletteTransitionElapsed = 0.0;
      paletteTransition = 0.0;
      updateBorderCssVariables(AURORA_PATTERNS[targetIdx]);
      window.triggerAudifyBeatPulse(2.4);
    }
  };

  window.__audify_set_theme = function (themeId) {
    if (themeId === 'auto') {
      if (typeof window.setAudifyAuroraMode === 'function') window.setAudifyAuroraMode('auto');
    } else if (typeof window.setAudifyPalette === 'function') {
      window.setAudifyPalette(themeId);
    }
  };
  window.__audify_trigger_beat_pulse = window.triggerAudifyBeatPulse;

  // ========================================================
  // Mobile Volume Drop Protector & YouTube Audio Engine Guard
  // ========================================================
  const isMobileEnvironment = () => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth <= 768 ||
      (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
  };

  let mobileVolumeGuardTimer = null;

  function enforceMobileMaxVolume() {
    try {
      // 1. Direct PlayerEngine inspection if exposed
      if (window.__nauxEngine) {
        const eng = window.__nauxEngine;
        eng.keepLiveAudible?.();
        const live = eng.liveDeck?.();
        if (live?.player) {
          live.player.unMute?.();
          live.player.setVolume?.(100);
        }
        if (eng.awaitingStart && eng.decks?.[eng.awaitingStart]?.player) {
          const incoming = eng.decks[eng.awaitingStart].player;
          incoming.unMute?.();
          incoming.setVolume?.(100);
        }
      }

      // 2. Window.YT player lookup
      if (window.YT && typeof window.YT.get === 'function') {
        ['naux-deck-A', 'naux-deck-B'].forEach(id => {
          try {
            const p = window.YT.get(id);
            if (p && typeof p.setVolume === 'function') {
              p.unMute?.();
              p.setVolume?.(100);
            }
          } catch (_) {}
        });
      }

      // 3. YouTube iframe postMessage commands
      const iframes = document.querySelectorAll(
        'iframe[id^="naux-deck"], .naux-players iframe, iframe[src*="youtube.com"]'
      );
      iframes.forEach(iframe => {
        try {
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
              '*'
            );
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
              '*'
            );
          }
        } catch (_) {}
      });

      // 4. Any HTMLMediaElements (audio/video)
      const mediaEls = document.querySelectorAll('audio, video');
      mediaEls.forEach(el => {
        try {
          el.muted = false;
          el.volume = 1.0;
        } catch (_) {}
      });
    } catch (err) {
      // Fail-safe silent catch
    }
  }

  function launchMobileVolumeGuard(durationMs = 3000, intervalMs = 50) {
    enforceMobileMaxVolume();

    if (mobileVolumeGuardTimer) {
      clearInterval(mobileVolumeGuardTimer);
      mobileVolumeGuardTimer = null;
    }

    const startTime = performance.now();
    mobileVolumeGuardTimer = setInterval(() => {
      enforceMobileMaxVolume();
      if (performance.now() - startTime >= durationMs) {
        clearInterval(mobileVolumeGuardTimer);
        mobileVolumeGuardTimer = null;
        enforceMobileMaxVolume();
      }
    }, intervalMs);
  }

  // Bind to mobile gestures and tab visibility
  window.addEventListener('touchstart', enforceMobileMaxVolume, { passive: true });
  window.addEventListener('touchend', enforceMobileMaxVolume, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      launchMobileVolumeGuard(1500, 50);
    }
  });

  // Global exports for external access & automated test verification
  window.launchAudifyVolumeGuard = launchMobileVolumeGuard;
  window.enforceAudifyMaxVolume = enforceMobileMaxVolume;

  // Song Transition Notification with High-Precision Deduplication & Motion Choreography
  let lastSongChangeTimestamp = 0;
  let lastSongChangeTitle = '';

  window.onAudifySongChange = function (songInfo = {}) {
    // Mobile Audio Protection: High-frequency guard against mobile volume drops
    launchMobileVolumeGuard(3000, 50);
    const rawTitle = typeof songInfo === 'string' ? songInfo : (songInfo?.title || '');
    const cleanTitle = (rawTitle || '').trim();
    const now = performance.now();

    // Prevent double-triggering when multiple hooks (UI click, PlayerEngine startFade, MutationObserver)
    // fire within 1500ms of each other during the same track handoff
    const isRecent = (now - lastSongChangeTimestamp) < 1500;
    const isPlaceholder = (t) => !t || t === 'Next Song' || t === 'Starting Set' || t === 'Preview Next Pattern';
    const isSameSongOrHandoff = isPlaceholder(cleanTitle) || isPlaceholder(lastSongChangeTitle) || cleanTitle === lastSongChangeTitle;

    if (isRecent && isSameSongOrHandoff && !songInfo?.force) {
      // If we now received an actual track title (not placeholder 'Next Song'), update HUD badge title smoothly
      if (cleanTitle && !isPlaceholder(cleanTitle) && cleanTitle !== lastSongChangeTitle) {
        lastSongChangeTitle = cleanTitle;
        const badgeTitle = document.getElementById('audify-badge-title-el');
        if (badgeTitle) badgeTitle.textContent = cleanTitle;
      }
      return;
    }

    lastSongChangeTimestamp = now;
    if (cleanTitle && cleanTitle !== 'Next Song' && cleanTitle !== 'Starting Set' && cleanTitle !== 'Preview Next Pattern') {
      lastSongChangeTitle = cleanTitle;
    }

    trackCounter++;
    const songTitle = cleanTitle || ('Track #' + trackCounter);
    console.log('[Audify Aurora Engine] Song transition choreography triggered:', songTitle);

    // Advance to next pattern
    activePatternIdx = (activePatternIdx + 1) % AURORA_PATTERNS.length;
    targetPaletteIdx = activePatternIdx;

    const pattern = AURORA_PATTERNS[activePatternIdx];
    updateBorderCssVariables(pattern);

    // 1. Flow parameter sudden velocity kick (+8.0) and accelerated delta for 1.5s
    flow += 8.0;
    flowSurgeTime = 1.5;
    flowVelocity = 3.5;

    // 2. BeatPulse surges to 3.2
    window.triggerAudifyBeatPulse(3.2);

    // 3. Smooth palette transition with 1.2s ease-out curve
    paletteTransitionElapsed = 0.0;
    paletteTransition = 0.0;

    // 4. Alternate effect in Auto mode ('soft' <-> 'curtain' <-> 'fusion')
    if (auroraMode === 'auto') {
      activeEffect = AUTO_EFFECT_CYCLE[trackCounter % AUTO_EFFECT_CYCLE.length];
      const label = document.getElementById('audify-aurora-label');
      if (label) label.textContent = getAuroraModeLabel(auroraMode);
    }

    // Trigger full-screen visual effects
    triggerSongChangeExplosion(pattern, songTitle);

    // Dispatch synchronized event for RGB Aurora borders and UI listeners
    try {
      window.dispatchEvent(new CustomEvent('audify:palette-change', {
        detail: {
          palette: PRECOMPUTED_PATTERNS[targetPaletteIdx],
          paletteId: PRECOMPUTED_PATTERNS[targetPaletteIdx].id,
          activeEffect,
          trackTitle: songTitle
        }
      }));
    } catch (_) {}
  };

  // Serato-Grade Beat Shockwave & Dynamic Palette Transition Trigger
  function triggerAudifySongTransition(nextTrack) {
    let trackInfo = {};
    if (typeof nextTrack === 'string') {
      trackInfo = { title: nextTrack, force: true };
    } else if (nextTrack && typeof nextTrack === 'object') {
      trackInfo = { ...nextTrack, force: true };
    } else {
      trackInfo = { title: 'Next Track', force: true };
    }

    // Force song change choreography and palette swap
    window.onAudifySongChange(trackInfo);

    // Synchronize with RGB Aurora Border if separate module is mounted
    if (window.__audifyBorderInstance?.onSongChange) {
      try {
        window.__audifyBorderInstance.onSongChange(trackInfo);
      } catch (_) {}
    }

    return AURORA_PATTERNS[activePatternIdx];
  }
  window.triggerAudifySongTransition = triggerAudifySongTransition;

  // Manual cycling of pattern anytime (Users / UI / Hotkeys)
  window.audifyNextAuroraPattern = function (options = {}) {
    activePatternIdx = (activePatternIdx + 1) % AURORA_PATTERNS.length;
    targetPaletteIdx = activePatternIdx;

    const pattern = AURORA_PATTERNS[activePatternIdx];
    updateBorderCssVariables(pattern);

    flow += 8.0;
    flowSurgeTime = 1.5;
    flowVelocity = 3.2;
    paletteTransitionElapsed = 0.0;
    paletteTransition = 0.0;

    window.triggerAudifyBeatPulse(2.6);

    const activeTitle = lastSongChangeTitle || ('Track #' + trackCounter);
    triggerSongChangeExplosion(pattern, activeTitle);

    try {
      window.dispatchEvent(new CustomEvent('audify:palette-change', {
        detail: {
          palette: PRECOMPUTED_PATTERNS[targetPaletteIdx],
          paletteId: PRECOMPUTED_PATTERNS[targetPaletteIdx].id,
          activeEffect,
          trackTitle: activeTitle
        }
      }));
    } catch (_) {}

    console.log(`[Audify Aurora] Manual pattern cycled: ${pattern.name} (${activePatternIdx + 1}/${AURORA_PATTERNS.length})`);
    return pattern;
  };

  // High-Performance Track Title Observer (Zero Polling Lag, Zero Layout Reflow)
  let lastObservedTitle = '';
  let titleObserverScheduled = false;

  function checkTitleElement() {
    titleObserverScheduled = false;
    const titleEl = document.querySelector(
      '.title-land, [data-testid="track-title"], [data-testid="now-playing-title"], .track-title, .now-playing-title, .song-title, main h2, main h1, h2, h1, h3'
    );
    if (!titleEl) return;
    const titleText = (titleEl.textContent || '').trim();
    if (!titleText || titleText === 'End of set' || titleText.length < 2) return;

    if (titleText !== lastObservedTitle) {
      if (lastObservedTitle !== '') {
        console.log('[Audify Title Observer] Detected song change via DOM mutation:', titleText);
        window.onAudifySongChange({ title: titleText, source: 'mutation-observer' });
      }
      lastObservedTitle = titleText;
    }
  }

  function scheduleTitleCheck() {
    if (titleObserverScheduled) return;
    titleObserverScheduled = true;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(checkTitleElement);
    } else {
      setTimeout(checkTitleElement, 16);
    }
  }

  // Set up MutationObserver on document.body
  try {
    const titleObserver = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'characterData') {
          scheduleTitleCheck();
          return;
        }
        if (m.type === 'childList') {
          const target = m.target;
          if (target && target.nodeType === 1) {
            const el = target;
            if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' ||
                el.classList?.contains('title-land') ||
                el.classList?.contains('track-title') ||
                el.getAttribute?.('data-testid')?.includes('title')) {
              scheduleTitleCheck();
              return;
            }
          }
          if (m.addedNodes.length > 0) {
            scheduleTitleCheck();
            return;
          }
        }
      }
    });

    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      titleObserver.observe(targetNode, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        titleObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      });
    }
  } catch (err) {
    console.warn('[Audify Title Observer] MutationObserver initialization error, using fallback polling:', err);
  }

  // Throttled fallback interval for off-DOM or iframe updates
  setInterval(scheduleTitleCheck, 3000);

  // Resize handler
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Performance optimization: Aurora is an atmospheric soft-blur ambient gradient.
    // Capping internal WebGL buffer to 360px on phones / 640px on desktop with bilinear GPU filtering
    // yields 100% silky smooth 60fps performance, zero dropped frames, and minimal battery/GPU load.
    const maxW = (w <= 768) ? 360 : 640;
    const targetW = Math.min(w, maxW);
    const aspect = w / Math.max(1, h);
    canvas.width = Math.max(1, targetW);
    canvas.height = Math.max(1, Math.round(targetW / aspect));
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse & Touch interaction across entire window
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / Math.max(1, window.innerWidth);
    pointer.y = 1 - e.clientY / Math.max(1, window.innerHeight);
    pointer.inside = true;
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    const aspect = canvas.width / Math.max(1, canvas.height);
    addPulse(
      (e.clientX / window.innerWidth) * aspect,
      1 - e.clientY / window.innerHeight
    );
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });

  // -----------------------------------------------------------------------
  // 7. Main WebGL2 Render Loop (Dual Shaders Orchestration)
  // -----------------------------------------------------------------------
  let isContextLost = false;
  let borderContainerEl = null;
  let lastBorderGlowPx = -1;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    isContextLost = true;
    console.warn('[Audify Aurora] WebGL context lost.');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    isContextLost = false;
    console.log('[Audify Aurora] WebGL context restored.');
  });

  function render(now) {
    requestAnimationFrame(render);
    if (!canvas.isConnected) ensureCanvasAttached();
    if (isContextLost || (gl.isContextLost && gl.isContextLost())) return;
    if (document.hidden) {
      lastTime = now;
      return;
    }

    const dt = clamp((now - lastTime) / 1000 || 0, 0, 0.05);
    lastTime = now;

    // Smooth beat decay & flow velocity: Crisp, snappy transient envelope for high-contrast beat sync
    beatPulse += (1.0 - beatPulse) * Math.min(1.0, dt * 14.0);
    flowVelocity += (1.0 - flowVelocity) * Math.min(1.0, dt * 4.0);

    // Real-Time Master DJ Beat Analyzer & Energy Modulation
    const beatData = window.__audify_beat_analyzer ? window.__audify_beat_analyzer.update(dt, now) : null;
    if (beatData && beatData.beatEnergy > 0.05) {
      const kickImpulse = (beatData.rawKick || 0) * 1.8;
      const targetPulse = 1.0 + (beatData.beatEnergy + kickImpulse) * 1.45;
      beatPulse = Math.max(beatPulse, targetPulse);
    }

    // Modulate GPU-composited opacity of #audify-rgb-aurora-border using beatPulse (zero shadow re-rasterization)
    if (!borderContainerEl) {
      borderContainerEl = document.getElementById('audify-rgb-aurora-border');
      if (borderContainerEl) {
        borderContainerEl.style.boxShadow = 'inset 0 0 18px var(--audify-border-glow), inset 0 0 36px rgba(0, 0, 0, 0.45)';
        borderContainerEl.style.willChange = 'opacity';
      }
    }
    if (borderContainerEl) {
      const targetOp = Math.min(1.0, 0.72 + Math.max(0, beatPulse - 1.0) * 0.25);
      const roundedOp = Math.round(targetOp * 50) / 50;
      if (roundedOp !== lastBorderGlowPx) {
        lastBorderGlowPx = roundedOp;
        borderContainerEl.style.opacity = String(roundedOp);
      }
    }
    if (window.__audifyBorderInstance?.onRenderFrame) {
      window.__audifyBorderInstance.onRenderFrame(beatPulse, beatData);
    }

    // Palette transition: 0.0 -> 1.0 over 1.2s using ease-out cubic curve (1 - (1-t)^3)
    if (paletteTransitionElapsed < PALETTE_TRANSITION_DURATION) {
      paletteTransitionElapsed = Math.min(PALETTE_TRANSITION_DURATION, paletteTransitionElapsed + dt);
      const t = paletteTransitionElapsed / PALETTE_TRANSITION_DURATION;
      const invT = 1.0 - t;
      paletteTransition = 1.0 - (invT * invT * invT);
      if (paletteTransitionElapsed >= PALETTE_TRANSITION_DURATION) {
        paletteTransition = 1.0;
        currentPaletteIdx = targetPaletteIdx;
      }
    }

    // Accelerated delta calculation for 1.5s post-song-change surge
    let velocityMultiplier = 1.0;
    if (flowSurgeTime > 0.0) {
      flowSurgeTime = Math.max(0.0, flowSurgeTime - dt);
      const surgeRatio = flowSurgeTime / 1.5;
      velocityMultiplier = 1.0 + surgeRatio * 3.5;
    }

    // Advance clocks with accelerated velocity
    const effectiveFlowVelocity = flowVelocity * velocityMultiplier;
    flow += dt * 0.7 * effectiveFlowVelocity * (0.8 + (beatPulse - 1.0) * 0.4);
    hue += dt * 0.25;
    curtainState.clock += dt * 0.65 * effectiveFlowVelocity * (0.8 + (beatPulse - 1.0) * 0.35);

    // Mouse easing
    const mouseLerp = Math.min(1.0, dt * 3.5);
    mouse.targetX = pointer.x;
    mouse.targetY = pointer.y;
    mouse.x += (mouse.targetX - mouse.x) * mouseLerp;
    mouse.y += (mouse.targetY - mouse.y) * mouseLerp;
    mouse.presence += ((pointer.inside ? 1.0 : 0.0) - mouse.presence) * mouseLerp;

    curtainState.px += (pointer.x - 0.5 - curtainState.px) * mouseLerp;
    curtainState.py += (pointer.y - 0.5 - curtainState.py) * mouseLerp;
    curtainState.reach += ((pointer.inside ? 1.0 : 0.0) - curtainState.reach) * mouseLerp;

    // Update pulses pool (zero GC churn)
    pulseData.fill(0);
    for (let i = 0; i < PULSE_POOL_SIZE; i++) {
      const p = pulsePool[i];
      if (!p.active) continue;
      p.age += dt;
      if (p.age >= 2.6) {
        p.active = false;
        continue;
      }
      const offset = i * 4;
      pulseData[offset] = p.x;
      pulseData[offset + 1] = p.y;
      pulseData[offset + 2] = smoother(p.age / 0.18) * (1.0 - smoother((p.age - 0.18) / 2.42));
      pulseData[offset + 3] = p.age;
    }

    const activePal = PRECOMPUTED_PATTERNS[currentPaletteIdx];
    const targetPal = PRECOMPUTED_PATTERNS[targetPaletteIdx];
    const aspect = canvas.width / canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const whichEffect = auroraMode === 'auto' ? activeEffect : auroraMode;
    let visualModeInt = 0;
    if (whichEffect === 'vortex') {
      visualModeInt = 1;
    } else if (whichEffect === 'chromatic-wave') {
      visualModeInt = 2;
    }
    const aberration = beatPulse > 1.8 ? Math.min(0.05, (beatPulse - 1.8) * 0.028) : 0.0;

    // RENDER 1: SoftAurora Shader (Zero per-frame allocations)
    const isSoftActive = whichEffect === 'soft' || whichEffect === 'fusion' || whichEffect === 'vortex' || whichEffect === 'chromatic-wave';
    if (isSoftActive && softShader) {
      gl.useProgram(softShader.program);
      gl.bindVertexArray(softVao);
      const u = softShader.uniforms;

      const c1A = activePal.parsedSoft.c1;
      const c1B = targetPal.parsedSoft.c1;
      const c2A = activePal.parsedSoft.c2;
      const c2B = targetPal.parsedSoft.c2;
      const tP = paletteTransition;

      const c1R = c1A[0] + (c1B[0] - c1A[0]) * tP;
      const c1G = c1A[1] + (c1B[1] - c1A[1]) * tP;
      const c1Bval = c1A[2] + (c1B[2] - c1A[2]) * tP;

      const c2R = c2A[0] + (c2B[0] - c2A[0]) * tP;
      const c2G = c2A[1] + (c2B[1] - c2A[1]) * tP;
      const c2Bval = c2A[2] + (c2B[2] - c2A[2]) * tP;

      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uFlow, flow);
      gl.uniform1f(u.uHue, hue);
      gl.uniform1f(u.uScale, 1.45);
      gl.uniform1f(u.uBrightness, 1.25 * (1.0 + (beatPulse - 1.0) * 0.65));
      gl.uniform3f(u.uColor1, c1R, c1G, c1Bval);
      gl.uniform3f(u.uColor2, c2R, c2G, c2Bval);
      gl.uniform1f(u.uNoiseFreq, 2.4);
      gl.uniform1f(u.uNoiseAmp, 1.05 + (beatPulse - 1.0) * 0.55);
      gl.uniform1f(u.uBandHeight, activePal.soft.bandHeight || 0.5);
      gl.uniform1f(u.uBandSpread, 1.0 + (beatPulse - 1.0) * 0.6);
      gl.uniform1f(u.uOctaveDecay, 0.12);
      gl.uniform1f(u.uLayerOffset, 0.25);
      gl.uniform2f(u.uShift, (mouse.x - 0.5) * 0.25, (mouse.y - 0.5) * 0.25);
      gl.uniform4f(u.uCursor, mouse.x * aspect, mouse.y, Math.min(1, 0.25 * 4) * mouse.presence, 0);
      gl.uniform4fv(u.uPulses, pulseData);
      gl.uniform1f(u.uSpectrum, activePal.soft.spectrum || 1.0);
      gl.uniform1f(u.uTilt, 0.0);
      gl.uniform3f(u.uIntro, 1.0, 1.0, 1.0);
      gl.uniform1f(u.uLightMode, 0.0);
      // Audio Shockwave Progression
      let shockwaveVal = 0.0;
      if (beatData && (beatData.rawKick > 0.72 || (beatData.barPhase < 0.04 && beatData.rawKick > 0.42))) {
        if (typeof shockwaveTimer === 'undefined' || shockwaveTimer <= 0) {
          shockwaveTimer = 0.001;
        }
      }
      if (typeof shockwaveTimer !== 'undefined' && shockwaveTimer > 0) {
        shockwaveTimer += dt;
        shockwaveVal = Math.min(1.0, shockwaveTimer / 0.65);
        if (shockwaveVal >= 1.0) {
          shockwaveTimer = 0.0;
          shockwaveVal = 0.0;
        }
      }
      if (u.uShockwave) gl.uniform1f(u.uShockwave, shockwaveVal);
      gl.uniform1f(u.uAberration, aberration);
      gl.uniform1i(u.uVisualMode, visualModeInt);
      gl.uniform1f(u.uBeatPulse, beatPulse);
      gl.uniform1f(u.uOpacity, whichEffect === 'fusion' ? 0.65 : (whichEffect === 'vortex' ? 0.75 : (whichEffect === 'chromatic-wave' ? 0.80 : 0.95)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // RENDER 2: Curtain Aurora Shader (Zero per-frame allocations)
    const isCurtainActive = whichEffect === 'curtain' || whichEffect === 'fusion' || whichEffect === 'vortex' || whichEffect === 'chromatic-wave';
    if (isCurtainActive && curtainShader) {
      gl.useProgram(curtainShader.program);
      gl.bindVertexArray(curtainVao);
      const u = curtainShader.uniforms;

      if (paletteTransition >= 1.0) {
        gl.uniform3fv(u.uStops, activePal.curtainBuffer);
      } else {
        const aBuf = activePal.curtainBuffer;
        const bBuf = targetPal.curtainBuffer;
        const tP = paletteTransition;
        for (let i = 0; i < MAX_STOPS * 3; i++) {
          paletteBuffer[i] = aBuf[i] + (bBuf[i] - aBuf[i]) * tP;
        }
        gl.uniform3fv(u.uStops, paletteBuffer);
      }

      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, curtainState.clock);
      gl.uniform1i(u.uStopCount, activePal.curtain.length);
      gl.uniform1f(u.uAmplitude, 1.25 + (beatPulse - 1.0) * 0.75);
      gl.uniform1f(u.uBlend, 0.55);
      gl.uniform1f(u.uHeight, 0.52);
      gl.uniform1f(u.uScale, 1.2);
      gl.uniform1f(u.uGlow, 0.9 + (beatPulse - 1.0) * 0.6);
      gl.uniform1f(u.uBrightness, 1.35 * (1.0 + (beatPulse - 1.0) * 0.55));
      gl.uniform1i(u.uLayers, 3);
      gl.uniform1f(u.uFlip, 0.0);
      gl.uniform3f(u.uPointer, curtainState.px, curtainState.py, curtainState.reach);
      gl.uniform1f(u.uReveal, 1.0);
      // Audio Shockwave Progression
      let shockwaveVal = 0.0;
      if (beatData && (beatData.rawKick > 0.72 || (beatData.barPhase < 0.04 && beatData.rawKick > 0.42))) {
        if (typeof shockwaveTimer === 'undefined' || shockwaveTimer <= 0) {
          shockwaveTimer = 0.001;
        }
      }
      if (typeof shockwaveTimer !== 'undefined' && shockwaveTimer > 0) {
        shockwaveTimer += dt;
        shockwaveVal = Math.min(1.0, shockwaveTimer / 0.65);
        if (shockwaveVal >= 1.0) {
          shockwaveTimer = 0.0;
          shockwaveVal = 0.0;
        }
      }
      if (u.uShockwave) gl.uniform1f(u.uShockwave, shockwaveVal);
      gl.uniform1f(u.uAberration, aberration);
      gl.uniform1i(u.uVisualMode, visualModeInt);
      gl.uniform1f(u.uBeatPulse, beatPulse);
      gl.uniform1f(u.uOpacity, whichEffect === 'fusion' ? 0.55 : (whichEffect === 'vortex' ? 0.60 : (whichEffect === 'chromatic-wave' ? 0.65 : 0.95)));
      gl.uniform1f(u.uLightMode, 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
  requestAnimationFrame(render);

  // -----------------------------------------------------------------------
  // 8. Serato-Grade Audio FX Synthesizer with Master Brickwall Limiter
  // -----------------------------------------------------------------------
  let audioCtx = null;
  let masterLimiter = null;

  function getAudioCtx() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        try {
          masterLimiter = audioCtx.createDynamicsCompressor();
          masterLimiter.threshold.setValueAtTime(-1.0, audioCtx.currentTime);
          masterLimiter.knee.setValueAtTime(0.0, audioCtx.currentTime);
          masterLimiter.ratio.setValueAtTime(20.0, audioCtx.currentTime);
          masterLimiter.attack.setValueAtTime(0.002, audioCtx.currentTime);
          masterLimiter.release.setValueAtTime(0.10, audioCtx.currentTime);
          masterLimiter.connect(audioCtx.destination);
        } catch {}
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function getFxOut(ctx) {
    return masterLimiter || ctx.destination;
  }

  const SOUND_FX = {
    drum_roll() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const dest = getFxOut(ctx);
      const now = ctx.currentTime;
      const count = 18;
      const step = 0.07;

      for (let i = 0; i < count; i++) {
        const t = now + i * step;
        const progress = i / count;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + progress * 160, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);

        gain.gain.setValueAtTime(0.05 + progress * 0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.05), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
        noise.buffer = buffer;

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.04 + progress * 0.22, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(gain);
        gain.connect(dest);
        noise.connect(nGain);
        nGain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.06);
        noise.start(t);
        noise.stop(t + 0.05);
      }
    },

    blend() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const dest = getFxOut(ctx);
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.5);
    },

    filter_sweep() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const dest = getFxOut(ctx);
      const now = ctx.currentTime;
      const dur = 1.4;
      const bSize = Math.max(1, Math.round(ctx.sampleRate * dur));
      const buffer = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(7000, now + dur * 0.7);
      filter.frequency.exponentialRampToValueAtTime(400, now + dur);
      filter.Q.value = 6;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.28, now + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      src.start(now);
      src.stop(now + dur);
    },

    echo_drop() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const dest = getFxOut(ctx);
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = ctx.createDelay();
      const feedback = ctx.createGain();

      delay.delayTime.value = 0.18;
      feedback.gain.value = 0.55;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(dest);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.35);
    },

    sub_drop() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const dest = getFxOut(ctx);
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  };

  let activeMixStyle = 'drum_roll';
  try {
    activeMixStyle = localStorage.getItem('audify_mix_style') || 'drum_roll';
  } catch (_) {}

  window.setAudifyMixStyle = function (style) {
    if (SOUND_FX[style]) {
      activeMixStyle = style;
      try {
        localStorage.setItem('audify_mix_style', style);
        localStorage.setItem('audify_mix_action', style);
      } catch (_) {}
      const label = document.getElementById('audify-mix-label');
      if (label) label.textContent = getMixStyleLabel(style);
    }
  };

  window.setAudifyAuroraMode = function (mode) {
    const validModes = ['auto', 'soft', 'curtain', 'fusion', 'vortex', 'chromatic-wave'];
    if (validModes.includes(mode)) {
      auroraMode = mode;
      try {
        localStorage.setItem('audify_aurora_mode', mode);
      } catch (_) {}
      const label = document.getElementById('audify-aurora-label');
      if (label) label.textContent = getAuroraModeLabel(mode);
    }
  };

  function getMixStyleLabel(style) {
    const map = {
      drum_roll: '🥁 DRUM ROLL',
      blend: '🎚 CLUB S-BLEND',
      filter_sweep: '🌊 FILTER SWEEP',
      echo_drop: '🔊 ECHO OUT',
      sub_drop: '💥 808 SUB'
    };
    return map[style] || 'MIX FX';
  }

  function getAuroraModeLabel(mode) {
    if (mode === 'auto') {
      const effectMap = {
        soft: 'SOFT',
        curtain: 'CURTAIN',
        fusion: 'FUSION',
        vortex: 'VORTEX',
        'chromatic-wave': 'CHROMATIC'
      };
      const effectName = effectMap[activeEffect] || 'SOFT';
      return `🔀 AUTO (${effectName})`;
    }
    const map = {
      soft: '✨ SOFT AURORA',
      curtain: '🌠 CURTAIN RIBBONS',
      fusion: '🎆 HYBRID FUSION',
      vortex: '🌀 COSMIC VORTEX',
      'chromatic-wave': '🌈 CHROMATIC WAVE'
    };
    return map[mode] || '🔀 AUTO-SYNC';
  }

  // Hook into all UI click triggers: NEXT, SKIP, .skip-btn, .next-btn, [data-action="skip"], PLAY SET
  document.addEventListener('click', (e) => {
    getAudioCtx();
    const target = e.target;
    if (!target) return;

    // Check matching element or ancestor
    const btn = target.closest('button, [role="button"], a, input[type="button"], input[type="submit"], .skip-btn, .next-btn, [data-action="skip"], [data-action="next"], [data-testid="skip-button"], [data-testid="next-button"]');
    if (!btn) return;

    const text = (btn.textContent || btn.value || '').toUpperCase().trim();
    const isSkipBtn = btn.matches('.skip-btn, .next-btn, [data-action="skip"], [data-action="next"], [data-testid="skip-button"], [data-testid="next-button"]') ||
      text.includes('SKIP') ||
      text.includes('NEXT') ||
      text === 'PLAY SET' ||
      text.startsWith('PLAY SET') ||
      text.includes('START SET') ||
      text.includes('PLAY NEXT');

    if (isSkipBtn) {
      window.triggerAudifyBeatPulse(2.8);
      
      const isPlaySet = text.includes('PLAY SET') || text.includes('START SET');
      window.onAudifySongChange({ title: isPlaySet ? 'Starting Set' : 'Next Song', trigger: 'ui-click' });

      if (SOUND_FX && activeMixStyle && SOUND_FX[activeMixStyle]) {
        try {
          SOUND_FX[activeMixStyle]();
        } catch (err) {
          console.error('[Audify SoundFX] Click error:', err);
        }
      }
    }
  }, true);

  // -----------------------------------------------------------------------
  // 9. Top Navigation Pills (AURORA & MIX Controls)
  // -----------------------------------------------------------------------
  function ensurePillStyles() {
    if (document.getElementById('audify-header-pills-style')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'audify-header-pills-style';
    styleEl.textContent = `
      #audify-control-pills-container {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        margin-left: 8px !important; margin-right: auto !important; max-width: 42vw !important;
        position: relative !important;
        z-index: 50 !important;
        flex-shrink: 1 !important;
        min-width: 0 !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        white-space: nowrap !important;
        -webkit-overflow-scrolling: touch !important;
        scrollbar-width: none !important;
        box-sizing: border-box !important;
      }
      #audify-control-pills-container::-webkit-scrollbar {
        display: none !important;
      }

      .squeeze {
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                    color 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: transform;
        user-select: none;
        -webkit-user-select: none;
      }
      .squeeze:active:not(:disabled) {
        transform: scale(0.95, 0.93) translateY(1px) !important;
      }

      .audify-pill-btn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        height: 38px !important;
        padding: 0 14px !important;
        border-radius: 9999px !important;
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 13px !important;
        font-weight: 400 !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
        line-height: 1 !important;
        cursor: pointer !important;
        outline: none !important;
        background: rgba(14, 16, 21, 0.85) !important;
        backdrop-filter: blur(18px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(18px) saturate(160%) !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }

      #audify-aurora-btn {
        border: 1.5px solid rgba(225, 0, 255, 0.45) !important;
        color: #ffffff !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 14px rgba(225, 0, 255, 0.2) !important;
      }
      #audify-aurora-btn:hover,
      #audify-aurora-btn[aria-expanded="true"] {
        border-color: #e100ff !important;
        background: rgba(225, 0, 255, 0.18) !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 0 22px rgba(225, 0, 255, 0.4) !important;
      }

      #audify-mix-btn {
        border: 1.5px solid rgba(200, 255, 0, 0.45) !important;
        color: #c8ff00 !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 14px rgba(200, 255, 0, 0.2) !important;
      }
      #audify-mix-btn:hover,
      #audify-mix-btn[aria-expanded="true"] {
        border-color: #c8ff00 !important;
        background: rgba(200, 255, 0, 0.18) !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 0 22px rgba(200, 255, 0, 0.4) !important;
      }

      #audify-eq-btn {
        border: 1.5px solid rgba(212, 255, 0, 0.45) !important;
        color: #D4FF00 !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 14px rgba(212, 255, 0, 0.2) !important;
      }
      #audify-eq-btn:hover,
      #audify-eq-btn:active,
      #audify-eq-btn.active {
        border-color: #D4FF00 !important;
        background: rgba(212, 255, 0, 0.18) !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 0 22px rgba(212, 255, 0, 0.4) !important;
      }

      #audify-mini-spectrum-canvas {
        display: inline-block !important;
        width: 44px !important;
        height: 16px !important;
        border-radius: 4px !important;
        background: rgba(0, 0, 0, 0.55) !important;
        border: 1px solid rgba(212, 255, 0, 0.28) !important;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8) !important;
        vertical-align: middle !important;
        pointer-events: none !important;
        margin-left: 4px !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      }
      #audify-eq-btn:hover #audify-mini-spectrum-canvas,
      #audify-eq-btn:active #audify-mini-spectrum-canvas,
      #audify-eq-btn.active #audify-mini-spectrum-canvas {
        border-color: rgba(212, 255, 0, 0.8) !important;
        box-shadow: 0 0 12px rgba(212, 255, 0, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.8) !important;
      }

      .audify-pill-tag-aurora {
        color: #e100ff !important;
        font-size: 13px !important;
      }
      .audify-pill-tag-mix {
        color: #c8ff00 !important;
        font-size: 13px !important;
      }
      .audify-pill-chevron {
        font-size: 9px !important;
        opacity: 0.75 !important;
        margin-left: 2px !important;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .audify-pill-btn[aria-expanded="true"] .audify-pill-chevron {
        transform: rotate(180deg) !important;
      }

      .audify-dropdown-menu {
        display: none;
        position: absolute !important;
        top: calc(100% + 8px) !important;
        right: 0 !important;
        left: auto !important;
        min-width: 240px !important;
        max-width: min(320px, calc(100vw - 24px)) !important;
        background: rgba(10, 10, 14, 0.92) !important;
        border-radius: 16px !important;
        padding: 6px !important;
        z-index: 999 !important;
        backdrop-filter: blur(28px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
        transform-origin: top right !important;
        animation: audifyDropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      #audify-aurora-dropdown {
        border: 1.5px solid rgba(225, 0, 255, 0.35) !important;
        box-shadow: 0 22px 56px rgba(0, 0, 0, 0.85), 0 0 24px rgba(225, 0, 255, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
      }

      #audify-mix-dropdown {
        border: 1.5px solid rgba(200, 255, 0, 0.35) !important;
        box-shadow: 0 22px 56px rgba(0, 0, 0, 0.85), 0 0 24px rgba(200, 255, 0, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
      }

      @keyframes audifyDropdownFadeIn {
        from { opacity: 0; transform: scale(0.96) translateY(-4px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .audify-dropdown-opt {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        padding: 9px 12px !important;
        border-radius: 10px !important;
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 13px !important;
        letter-spacing: 0.04em !important;
        color: #ffffff !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
        white-space: nowrap !important;
      }

      .audify-aurora-opt:hover {
        background: rgba(225, 0, 255, 0.18) !important;
        color: #ffffff !important;
        transform: translateX(2px) !important;
      }

      .audify-mix-opt:hover {
        background: rgba(200, 255, 0, 0.18) !important;
        color: #c8ff00 !important;
        transform: translateX(2px) !important;
      }

      @media (max-width: 768px) {
        #audify-control-pills-container {
          gap: 4px !important;
          margin-right: 6px !important;
          overflow-x: auto !important;
          scrollbar-width: none !important;
          -webkit-overflow-scrolling: touch !important;
        }
        .audify-pill-btn {
          height: 28px !important;
          padding: 0 7px !important;
          font-size: 11px !important;
          flex-shrink: 0 !important;
          touch-action: manipulation !important;
        }
        .audify-pill-btn > * {
          pointer-events: none !important;
        }
        .audify-dropdown-menu { min-width: 180px !important; }
      }

      @media (max-width: 520px) {
        .audify-pill-tag-aurora,
        .audify-pill-tag-mix,
        #audify-fullscreen-text {
          display: none !important;
        }
        .audify-pill-btn {
          height: 28px !important;
          padding: 0 6px !important;
          font-size: 10.5px !important;
          touch-action: manipulation !important;
        }
        .audify-pill-btn > * {
          pointer-events: none !important;
        }
        #audify-control-pills-container {
          margin-right: 0 !important;
          gap: 3px !important;
          max-width: calc(100vw - 165px) !important;
        }
        #audify-mix-label,
        #audify-aurora-label {
          max-width: 58px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        #audify-mini-spectrum-canvas {
          width: 24px !important;
          height: 10px !important;
          margin-left: 2px !important;
          pointer-events: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  function wirePillControls(pillGroup) {
    const auroraBtn = pillGroup.querySelector('#audify-aurora-btn');
    const auroraDd = pillGroup.querySelector('#audify-aurora-dropdown');
    const mixBtn = pillGroup.querySelector('#audify-mix-btn');
    const mixDd = pillGroup.querySelector('#audify-mix-dropdown');

    function closeAllDropdowns() {
      if (auroraDd) auroraDd.style.display = 'none';
      if (mixDd) mixDd.style.display = 'none';
      if (auroraBtn) auroraBtn.setAttribute('aria-expanded', 'false');
      if (mixBtn) mixBtn.setAttribute('aria-expanded', 'false');
    }

    function alignDropdown(dd) {
      dd.style.right = '0';
      dd.style.left = 'auto';
      const rect = dd.getBoundingClientRect();
      if (rect.left < 8) {
        const shift = 8 - rect.left;
        dd.style.right = `-${shift}px`;
      }
      if (rect.right > window.innerWidth - 8) {
        const overflow = rect.right - (window.innerWidth - 8);
        dd.style.right = `${overflow}px`;
      }
    }

    auroraBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = auroraDd.style.display !== 'block';
      closeAllDropdowns();
      if (isClosed) {
        auroraDd.style.display = 'block';
        auroraBtn.setAttribute('aria-expanded', 'true');
        alignDropdown(auroraDd);
      }
    });

    mixBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = mixDd.style.display !== 'block';
      closeAllDropdowns();
      if (isClosed) {
        mixDd.style.display = 'block';
        mixBtn.setAttribute('aria-expanded', 'true');
        alignDropdown(mixDd);
      }
    });

    pillGroup.querySelectorAll('.audify-aurora-opt').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        window.setAudifyAuroraMode(opt.dataset.mode);
        closeAllDropdowns();
      });
    });

    pillGroup.querySelectorAll('.audify-mix-opt').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const style = opt.dataset.style;
        window.setAudifyMixStyle(style);
        closeAllDropdowns();
        getAudioCtx();
        if (SOUND_FX[style]) SOUND_FX[style]();
      });
    });

    // Master FX / EQ Pill Button is handled directly by eq-modal.js event delegation

    function toggleFullscreen() {
      try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
      } catch (_) {}
    }

    const fsBtn = pillGroup.querySelector('#audify-fullscreen-btn');
    if (fsBtn && !fsBtn.__audify_wired) {
      fsBtn.__audify_wired = true;
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        toggleFullscreen();
      });
    }

    const updateFsState = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      document.querySelectorAll('#audify-fullscreen-btn').forEach(btn => {
        const icon = btn.querySelector('#audify-fullscreen-icon');
        const text = btn.querySelector('#audify-fullscreen-text');
        if (icon) icon.textContent = isFs ? '🗗' : '⛶';
        if (text) text.textContent = isFs ? 'EXIT' : 'FULL';
      });
    };
    document.removeEventListener('fullscreenchange', updateFsState);
    document.addEventListener('fullscreenchange', updateFsState);
    document.removeEventListener('webkitfullscreenchange', updateFsState);
    document.addEventListener('webkitfullscreenchange', updateFsState);

    if (!window.__audify_global_dropdown_listener) {
      window.__audify_global_dropdown_listener = true;
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#audify-control-pills-container')) {
          closeAllDropdowns();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
        if (e.key === 'p' || e.key === 'P') {
          // Press 'p' to preview next aurora motion pattern!
          window.audifyNextAuroraPattern();
        }
      });
      window.addEventListener('resize', () => {
        const curAurora = document.getElementById('audify-aurora-dropdown');
        const curMix = document.getElementById('audify-mix-dropdown');
        if (curAurora && curAurora.style.display === 'block') alignDropdown(curAurora);
        if (curMix && curMix.style.display === 'block') alignDropdown(curMix);
      });
    }
  }

  function injectPlayerControls() {
    ensurePillStyles();
    ensureBorderAttached();

    const targetHeader = document.querySelector('main > div.relative.z-30.flex, div.relative.z-30.flex');
    if (!targetHeader) return;
    const targetRightCluster = targetHeader.querySelector('.ml-auto');
    if (!targetRightCluster) return;

    let pillGroup = document.getElementById('audify-control-pills-container');
    if (!pillGroup) {
      pillGroup = document.createElement('div');
      pillGroup.id = 'audify-control-pills-container';
      pillGroup.innerHTML = `
        <button id="audify-eq-btn" class="audify-pill-btn squeeze" title="Master DJ Equalizer & FX">
          <span>🎚️ FX / EQ</span>
          <canvas id="audify-mini-spectrum-canvas" width="48" height="20" class="audify-mini-spectrum" aria-hidden="true"></canvas>
        </button>
      `;
    }

    pillGroup.style.display = 'inline-flex';
    pillGroup.style.alignItems = 'center';
    pillGroup.style.flexShrink = '0';
    pillGroup.style.marginRight = '8px';
    pillGroup.style.marginLeft = '0';

    if (!targetRightCluster.contains(pillGroup)) {
      targetRightCluster.prepend(pillGroup);
    }
  }

  // -----------------------------------------------------------------------
  // Live Miniature 16-Bar Audio Spectrum Visualizer Loop
  // HiDPI Retina Precision, Zero-GC Layout Thrashing & Gravity Falloff
  // -----------------------------------------------------------------------
  const miniPeakVals = new Float32Array(16);
  const miniPeakSpeeds = new Float32Array(16);
  const miniPeakHolds = new Int16Array(16);
  const miniSmoothed = new Float32Array(16);
  let miniSpectrumRunning = false;
  let miniLastW = 0;
  let miniLastH = 0;
  let miniCanvasEl = null;

  function updateMiniCanvasDimensions() {
    if (!miniCanvasEl || !miniCanvasEl.isConnected) {
      miniCanvasEl = document.getElementById('audify-mini-spectrum-canvas');
    }
    if (!miniCanvasEl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = miniCanvasEl.getBoundingClientRect();
    const targetW = Math.floor((rect.width > 0 ? rect.width : 44) * dpr);
    const targetH = Math.floor((rect.height > 0 ? rect.height : 16) * dpr);
    if (miniCanvasEl.width !== targetW || miniCanvasEl.height !== targetH) {
      miniCanvasEl.width = targetW;
      miniCanvasEl.height = targetH;
      miniLastW = targetW;
      miniLastH = targetH;
    }
  }
  window.addEventListener('resize', updateMiniCanvasDimensions, { passive: true });

  function renderMiniSpectrum() {
    requestAnimationFrame(renderMiniSpectrum);
    if (!miniCanvasEl || !miniCanvasEl.isConnected) {
      miniCanvasEl = document.getElementById('audify-mini-spectrum-canvas');
      if (miniCanvasEl) updateMiniCanvasDimensions();
    }
    if (!miniCanvasEl) return;
    const ctx = miniCanvasEl.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = miniCanvasEl.width || miniLastW || 44;
    const h = miniCanvasEl.height || miniLastH || 16;
    ctx.clearRect(0, 0, w, h);

    const spectrum = (window.__audify_beat_analyzer && typeof window.__audify_beat_analyzer.getSpectrum === 'function')
      ? window.__audify_beat_analyzer.getSpectrum()
      : null;

    const now = performance.now() * 0.003;
    const numBars = 16;
    const spacing = Math.max(1, Math.floor(1.2 * dpr));
    const barWidth = Math.max(1, Math.floor((w - (numBars - 1) * spacing) / numBars));

    // Gradient: Neon Acid Lime -> Electric Cyan -> Hot Magenta
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0.0, '#D4FF00');
    grad.addColorStop(0.55, '#00F0FF');
    grad.addColorStop(1.0, '#FF007F');

    for (let i = 0; i < numBars; i++) {
      let raw = (spectrum && spectrum[i] !== undefined) ? spectrum[i] : 0;
      if (!raw || raw < 0.04) {
        raw = 0.08 + 0.06 * Math.sin(now * 2.5 + i * 0.45);
      }
      const targetVal = Math.min(1.0, Math.max(0.04, raw));

      if (targetVal > miniSmoothed[i]) {
        miniSmoothed[i] += (targetVal - miniSmoothed[i]) * 0.75;
      } else {
        miniSmoothed[i] += (targetVal - miniSmoothed[i]) * 0.2;
      }
      const val = miniSmoothed[i];

      if (val >= miniPeakVals[i]) {
        miniPeakVals[i] = val;
        miniPeakSpeeds[i] = 0;
        miniPeakHolds[i] = 12;
      } else {
        if (miniPeakHolds[i] > 0) {
          miniPeakHolds[i]--;
        } else {
          miniPeakSpeeds[i] += 0.0035 * dpr;
          miniPeakVals[i] = Math.max(val, miniPeakVals[i] - miniPeakSpeeds[i]);
        }
      }

      const barH = Math.max(2 * dpr, val * (h - 3 * dpr));
      const x = i * (barWidth + spacing);
      const y = h - barH;

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      const peakY = h - Math.max(2 * dpr, miniPeakVals[i] * (h - 3 * dpr)) - 2 * dpr;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, Math.max(0, peakY), barWidth, Math.max(1, 1.5 * dpr));
    }
  }

  function startMiniSpectrum() {
    if (miniSpectrumRunning) return;
    miniSpectrumRunning = true;
    requestAnimationFrame(renderMiniSpectrum);
  }
  window.__audify_init_mini_spectrum = startMiniSpectrum;
  startMiniSpectrum();

  function ensurePillsAttached() {
    const pill = document.getElementById('audify-control-pills-container');
    const eqBtn = document.getElementById('audify-eq-btn');
    const topBar = document.querySelector('main > div.relative.z-30.flex, div.relative.z-30.flex');
    const rightCluster = topBar ? topBar.querySelector('.ml-auto') : null;

    if (!pill || !pill.isConnected || !eqBtn) {
      injectPlayerControls();
    } else if (rightCluster && !rightCluster.contains(pill)) {
      rightCluster.prepend(pill);
    }
  }

  injectPlayerControls();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPlayerControls);
  }
  setInterval(ensurePillsAttached, 1200);
})();
