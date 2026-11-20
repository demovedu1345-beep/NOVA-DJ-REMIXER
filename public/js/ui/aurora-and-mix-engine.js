// =========================================================================
// Audify WebGL2 Dual-Aurora Engine (React Bits SoftAurora + Aurora)
// & Professional Mix Action FX Controller with Audio-Reactive Beat Sync
// =========================================================================

(function initAudifyAuroraAndMixEngine() {
  if (window.__audify_aurora_initialized) return;
  window.__audify_aurora_initialized = true;

  // -----------------------------------------------------------------------
  // 1. Shaders & Shaders Pipeline (React Bits SoftAurora & Aurora)
  // -----------------------------------------------------------------------
  const MAX_PULSES = 4;
  const MAX_STOPS = 5;
  const MAX_LAYERS = 3;

  // Vertex shader for SoftAurora (uses gl_VertexID fullscreen triangle)
  const SOFT_VERTEX = `#version 300 es
  const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  void main() {
    gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
  }`;

  // Fragment shader for SoftAurora (React Bits 3D Perlin Noise + Pulses)
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

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
    vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);
    vec2 cursor = turn(uCursor.xy, center);
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

    float glow1 = auroraGlow(t, field, bend) * boost;
    float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;
    vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);
    vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);

    vec3 col = 0.99 * glow1 * gradient1 * uColor1;
    col += 0.99 * glow2 * gradient2 * uColor2;
    col *= uBrightness;

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
      float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);
      float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));
      float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);
      alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);

      vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);
      glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);
      cover = 1.0 - (1.0 - cover) * (1.0 - alpha);
    }

    float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;
    float strength = clamp(uBrightness, 0.0, 2.0);
    glow *= fade * min(strength, 1.0);
    cover *= fade * min(strength, 1.0);
    glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));
    float dither = (hash(frag) - 0.5) / 255.0;

    outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));
  }`;

  // -----------------------------------------------------------------------
  // 2. Color Space & Shader Utility Helpers
  // -----------------------------------------------------------------------
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const smoother = t => {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  const parseColor = value => {
    const text = String(value || '').trim();
    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (hex) {
      const full = hex[1].length === 3 ? hex[1].replace(/./g, d => d + d) : hex[1];
      return [0, 2, 4].map(idx => parseInt(full.slice(idx, idx + 2), 16) / 255);
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
    if (rgb) return [rgb[1], rgb[2], rgb[3]].map(c => clamp(parseFloat(c) / 255, 0, 1));
    return [1, 1, 1];
  };

  const toOklch = rgb => {
    const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const lab = [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ];
    return [lab[0], Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1])];
  };

  const unwrapHues = stops => {
    const known = stops.findIndex(stop => stop[1] > 0.02);
    const anchor = known === -1 ? 0 : stops[known][2];
    let previous = anchor;
    return stops.map(stop => {
      let hue = stop[1] > 0.02 ? stop[2] : previous;
      while (hue - previous > Math.PI) hue -= Math.PI * 2;
      while (hue - previous < -Math.PI) hue += Math.PI * 2;
      previous = hue;
      return [stop[0], stop[1], hue];
    });
  };

  function compileShader(gl, type, source) {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('GLSL Compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function linkProgram(gl, vsSource, fsSource, attribLocation = null) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    if (attribLocation) {
      gl.bindAttribLocation(prog, attribLocation.index, attribLocation.name);
    }
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('GLSL Link error:', gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(prog, i);
      if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(prog, info.name);
    }
    return { program: prog, uniforms };
  }

  // -----------------------------------------------------------------------
  // 3. Canvas Setup & WebGL2 Context Initialization
  // -----------------------------------------------------------------------
  let canvas = document.getElementById('audify-aurora-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'audify-aurora-canvas';
    document.body.prepend(canvas);
  }
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    opacity: 0.92;
    mix-blend-mode: screen;
    transition: opacity 0.4s ease;
  `;

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    console.warn('WebGL2 not available; fallback to standard renderer.');
    return;
  }

  // Compile both shader programs
  const softShader = linkProgram(gl, SOFT_VERTEX, SOFT_FRAGMENT);
  const curtainShader = linkProgram(gl, CURTAIN_VERTEX, CURTAIN_FRAGMENT, { index: 0, name: 'aPosition' });

  // VAOs and Buffers
  const softVao = gl.createVertexArray();

  const curtainVao = gl.createVertexArray();
  const curtainBuffer = gl.createBuffer();
  gl.bindVertexArray(curtainVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, curtainBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  // -----------------------------------------------------------------------
  // 4. Audio-Reactive Song Palettes & Genre Color Harmonies
  // -----------------------------------------------------------------------
  const MOOD_PALETTES = [
    {
      id: 'neon-cyber',
      name: 'Cyberpunk Neon (Dance & EDM)',
      soft: { c1: '#00f5ff', c2: '#e100ff', spectrum: 1.0, bandHeight: 0.52 },
      curtain: ['#5227FF', '#00f5ff', '#ff007a', '#7cff67', '#5227FF']
    },
    {
      id: 'punjabi-gold',
      name: 'Bhangra Flame (Punjabi & Dhol)',
      soft: { c1: '#ffd000', c2: '#00ff87', spectrum: 0.9, bandHeight: 0.48 },
      curtain: ['#ff8800', '#ffd000', '#00ff87', '#ff0055', '#ff8800']
    },
    {
      id: 'sufi-velvet',
      name: 'Ethereal Velvet (Sufi & Romantic)',
      soft: { c1: '#ff6584', c2: '#5227ff', spectrum: 0.85, bandHeight: 0.55 },
      curtain: ['#2e0854', '#5227ff', '#ff6584', '#2af598', '#7928ca']
    },
    {
      id: 'hiphop-crimson',
      name: '808 Bass Heat (Desi Hip-Hop & Rap)',
      soft: { c1: '#ff003c', c2: '#ff8800', spectrum: 0.8, bandHeight: 0.45 },
      curtain: ['#ff003c', '#ff5500', '#ffe600', '#111111', '#ff003c']
    },
    {
      id: 'south-solar',
      name: 'High-Voltage Mass (Tamil & Telugu Kuthu)',
      soft: { c1: '#ff0055', c2: '#00e5ff', spectrum: 1.0, bandHeight: 0.5 },
      curtain: ['#ff0055', '#ffaa00', '#00e5ff', '#7cff67', '#ff0055']
    }
  ];

  // Pre-parse and pre-calculate all palette colors & OKLCH stops once at initialization (Zero GC Churn)
  const PRECOMPUTED_PALETTES = MOOD_PALETTES.map((pal) => {
    const c1 = parseColor(pal.soft.c1);
    const c2 = parseColor(pal.soft.c2);
    const curtainStops = pal.curtain.map(parseColor);
    const curtainBuf = new Float32Array(MAX_STOPS * 3);
    unwrapHues(curtainStops.map(toOklch)).forEach((stop, idx) => {
      curtainBuf.set(stop, idx * 3);
    });
    return {
      ...pal,
      parsedSoft: { c1, c2 },
      curtainBuffer: curtainBuf
    };
  });

  let currentPaletteIdx = 0;
  let targetPaletteIdx = 0;
  let paletteTransition = 1.0;

  // Active effect mode: 'auto' | 'soft' | 'curtain' | 'fusion'
  let auroraMode = localStorage.getItem('audify_aurora_mode') || 'auto';
  let activeEffect = 'soft'; // Currently running effect in auto mode

  // -----------------------------------------------------------------------
  // 5. Interactive State, Beat Pulses & Mouse Dynamics
  // -----------------------------------------------------------------------
  const pulses = [];
  const pulseData = new Float32Array(MAX_PULSES * 4);
  const paletteBuffer = new Float32Array(MAX_STOPS * 3);

  const pointer = { x: 0.5, y: 0.5, inside: false };
  const mouse = { x: 0.5, y: 0.5, presence: 0 };
  const curtainState = { clock: 0, px: 0, py: 0.5, reach: 0, reveal: 1 };

  let beatPulse = 1.0;
  let isPlaying = false;
  let flow = 0;
  let hue = 0;
  let lastTime = performance.now();
  let trackCounter = 0;

  // Global Beat Pulse Trigger
  window.triggerAudifyBeatPulse = function (intensity = 1.6) {
    beatPulse = Math.max(beatPulse, intensity);

    // Inject SoftAurora wave pulse along band
    const aspect = canvas.width / Math.max(1, canvas.height);
    pulses.push({
      x: (0.2 + 0.6 * Math.random()) * aspect,
      y: 0.5 + (Math.random() - 0.5) * 0.15,
      age: 0
    });
    if (pulses.length > MAX_PULSES) pulses.shift();
  };

  // Song Transition Notification
  window.onAudifySongChange = function (songInfo = {}) {
    trackCounter++;
    console.log('[Audify Aurora Engine] Song transition:', songInfo.title || 'Track #' + trackCounter);

    // Alternate effect on song change if in auto mode
    if (auroraMode === 'auto') {
      activeEffect = trackCounter % 2 === 0 ? 'soft' : 'curtain';
      const label = document.getElementById('audify-aurora-label');
      if (label) label.textContent = getAuroraModeLabel(auroraMode);
    }

    // Shift mood palette
    targetPaletteIdx = (currentPaletteIdx + 1) % MOOD_PALETTES.length;
    paletteTransition = 0.0;
    window.triggerAudifyBeatPulse(2.4);
  };

  // Track observer to automatically catch song changes
  let lastObservedTitle = '';
  setInterval(() => {
    const titleEl = document.querySelector('[data-testid="track-title"], .track-title, h1, h2, h3');
    const titleText = (titleEl ? titleEl.textContent : '').trim();
    if (titleText && titleText !== lastObservedTitle && titleText.length > 3) {
      if (lastObservedTitle !== '') {
        window.onAudifySongChange({ title: titleText });
      }
      lastObservedTitle = titleText;
    }
  }, 1000);

  // Resize handler
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
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
    pulses.push({
      x: (e.clientX / window.innerWidth) * aspect,
      y: 1 - e.clientY / window.innerHeight,
      age: 0
    });
    if (pulses.length > MAX_PULSES) pulses.shift();
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });

  // -----------------------------------------------------------------------
  // 6. Main WebGL2 Render Loop (Dual Shaders Orchestration)
  // -----------------------------------------------------------------------
  let isContextLost = false;
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
    if (isContextLost || (gl.isContextLost && gl.isContextLost())) return;
    if (document.hidden) {
      lastTime = now;
      return;
    }

    const dt = clamp((now - lastTime) / 1000 || 0, 0, 0.05);
    lastTime = now;

    // Smooth beat decay
    beatPulse += (1.0 - beatPulse) * Math.min(1, dt * 5.0);
    if (paletteTransition < 1.0) {
      paletteTransition = Math.min(1.0, paletteTransition + dt * 1.5);
      if (paletteTransition >= 1.0) currentPaletteIdx = targetPaletteIdx;
    }

    const pace = isPlaying ? 1.3 : 0.45;
    flow += dt * 0.7 * pace * (1 + (beatPulse - 1) * 0.5);
    hue += dt * 0.4 * pace;
    curtainState.clock += dt * 0.85 * pace;

    // Follow mouse
    const follow = 1 - Math.exp(-dt / 0.35);
    mouse.x += ((pointer.inside ? pointer.x : 0.5) - mouse.x) * follow;
    mouse.y += ((pointer.inside ? pointer.y : 0.5) - mouse.y) * follow;
    mouse.presence += ((pointer.inside ? 1 : 0) - mouse.presence) * (1 - Math.exp(-dt / 0.5));

    curtainState.px += (((pointer.x - 0.5) * (canvas.width / canvas.height)) - curtainState.px) * follow;
    curtainState.py += (pointer.y - curtainState.py) * follow;
    curtainState.reach += ((pointer.inside ? 1 : 0) - curtainState.reach) * (1 - Math.exp(-dt / 0.8));

    // Update pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].age += dt;
      if (pulses[i].age >= 2.6) pulses.splice(i, 1);
    }
    pulseData.fill(0);
    pulses.forEach((p, idx) => {
      pulseData[idx * 4] = p.x;
      pulseData[idx * 4 + 1] = p.y;
      pulseData[idx * 4 + 2] = smoother(p.age / 0.18) * (1 - smoother((p.age - 0.18) / 2.42));
      pulseData[idx * 4 + 3] = p.age;
    });

    const activePal = PRECOMPUTED_PALETTES[currentPaletteIdx];
    const targetPal = PRECOMPUTED_PALETTES[targetPaletteIdx];
    const aspect = canvas.width / canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const whichEffect = auroraMode === 'auto' ? activeEffect : auroraMode;

    // RENDER 1: SoftAurora Shader (Zero per-frame allocations)
    if ((whichEffect === 'soft' || whichEffect === 'fusion') && softShader) {
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
      gl.uniform1f(u.uBrightness, 1.15 * (1 + (beatPulse - 1) * 0.55));
      gl.uniform3f(u.uColor1, c1R, c1G, c1Bval);
      gl.uniform3f(u.uColor2, c2R, c2G, c2Bval);
      gl.uniform1f(u.uNoiseFreq, 2.4);
      gl.uniform1f(u.uNoiseAmp, 1.05);
      gl.uniform1f(u.uBandHeight, activePal.soft.bandHeight || 0.5);
      gl.uniform1f(u.uBandSpread, 1.0 + (beatPulse - 1) * 0.4);
      gl.uniform1f(u.uOctaveDecay, 0.12);
      gl.uniform1f(u.uLayerOffset, 0.25);
      gl.uniform2f(u.uShift, (mouse.x - 0.5) * 0.25, (mouse.y - 0.5) * 0.25);
      gl.uniform4f(u.uCursor, mouse.x * aspect, mouse.y, Math.min(1, 0.25 * 4) * mouse.presence, 0);
      gl.uniform4fv(u.uPulses, pulseData);
      gl.uniform1f(u.uSpectrum, activePal.soft.spectrum || 1.0);
      gl.uniform1f(u.uTilt, 0.0);
      gl.uniform3f(u.uIntro, 1.0, 1.0, 1.0);
      gl.uniform1f(u.uLightMode, 0.0);
      gl.uniform1f(u.uOpacity, whichEffect === 'fusion' ? 0.65 : 0.95);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // RENDER 2: Curtain Aurora Shader (Zero per-frame allocations)
    if ((whichEffect === 'curtain' || whichEffect === 'fusion') && curtainShader) {
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
      gl.uniform1f(u.uAmplitude, 1.25 + (beatPulse - 1) * 0.7);
      gl.uniform1f(u.uBlend, 0.55);
      gl.uniform1f(u.uHeight, 0.52);
      gl.uniform1f(u.uScale, 1.2);
      gl.uniform1f(u.uGlow, 0.9 + (beatPulse - 1) * 0.5);
      gl.uniform1f(u.uBrightness, 1.35 * (1 + (beatPulse - 1) * 0.45));
      gl.uniform1i(u.uLayers, 3);
      gl.uniform1f(u.uFlip, 0.0);
      gl.uniform3f(u.uPointer, curtainState.px, curtainState.py, curtainState.reach);
      gl.uniform1f(u.uReveal, 1.0);
      gl.uniform1f(u.uOpacity, whichEffect === 'fusion' ? 0.55 : 0.95);
      gl.uniform1f(u.uLightMode, 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
  requestAnimationFrame(render);

  // -----------------------------------------------------------------------
  // 7. Serato-Grade Audio FX Synthesizer (Drum Roll, S-Blend, Sweep, Echo, 808)
  // -----------------------------------------------------------------------
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const SOUND_FX = {
    drum_roll() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const count = 18;
      const step = 0.07;
      for (let i = 0; i < count; i++) {
        const t = now + i * step;
        const progress = i / count;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + 260 * progress, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.35 + 0.5 * progress, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

        const bSize = Math.max(1, Math.round(ctx.sampleRate * 0.05));
        const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
        const data = b.getChannelData(0);
        for (let j = 0; j < bSize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bSize * 0.3));
        const noise = ctx.createBufferSource();
        noise.buffer = b;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.1 + 0.4 * progress, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        noise.connect(nGain);
        nGain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
        noise.start(t);
        noise.stop(t + 0.05);
      }
      setTimeout(() => SOUND_FX.sub_drop(), 1250);
    },

    blend() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    },

    filter_sweep() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const dur = 1.4;
      const bSize = Math.max(1, Math.round(ctx.sampleRate * dur));
      const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const data = b.getChannelData(0);
      for (let j = 0; j < bSize; j++) {
        const p = j / bSize;
        data[j] = (Math.random() * 2 - 1) * Math.pow(p, 1.8);
      }
      const src = ctx.createBufferSource();
      src.buffer = b;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 4.0;
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(8000, now + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.7, now + dur - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + dur);
    },

    echo_drop() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.18;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.65;

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(ctx.destination);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    },

    sub_drop() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  };

  let activeMixStyle = localStorage.getItem('audify_mix_action') || 'drum_roll';

  window.setAudifyMixStyle = function (style) {
    activeMixStyle = style;
    localStorage.setItem('audify_mix_action', style);
    const label = document.getElementById('audify-mix-label');
    if (label) label.textContent = getMixStyleLabel(style);
  };

  function getMixStyleLabel(style) {
    if (style === 'drum_roll') return '🥁 DRUM ROLL';
    if (style === 'blend') return '🎚 CLUB BLEND';
    if (style === 'filter_sweep') return '🌊 FILTER SWEEP';
    if (style === 'echo_drop') return '🔊 ECHO DROP';
    if (style === 'sub_drop') return '💥 SUB IMPACT';
    return '🥁 DRUM ROLL';
  }

  window.setAudifyAuroraMode = function (mode) {
    auroraMode = mode;
    localStorage.setItem('audify_aurora_mode', mode);
    const label = document.getElementById('audify-aurora-label');
    if (label) label.textContent = getAuroraModeLabel(mode);
    window.triggerAudifyBeatPulse(2.0);
  };

  function getAuroraModeLabel(mode) {
    if (mode === 'auto') return '🔀 AUTO-SYNC';
    if (mode === 'soft') return '✨ SOFT AURORA';
    if (mode === 'curtain') return '🌠 CURTAIN RIBBONS';
    if (mode === 'fusion') return '🎆 HYBRID FUSION';
    return '🔀 AUTO-SYNC';
  }

  // Hook into Skip clicks for transition effects
  document.addEventListener('click', (e) => {
    getAudioCtx();
    const btn = e.target.closest('button, [role="button"]');
    if (!btn) return;
    const text = (btn.textContent || '').trim().toUpperCase();
    if (text.includes('SKIP') || text.includes('NEXT')) {
      window.triggerAudifyBeatPulse(2.5);
      window.onAudifySongChange({ title: 'Next Song' });
      if (SOUND_FX[activeMixStyle]) {
        SOUND_FX[activeMixStyle]();
      }
    }
  }, true);

  // Detect play state to keep aurora breathing (Zero layout reflow)
  setInterval(() => {
    const isPaused = Boolean(document.querySelector('.paused-stamp, #btn-paused-resume, [data-paused="true"]'));
    const hasPlayClock = Boolean(document.getElementById('btn-clock-pause'));
    const isAudioPlaying = Boolean(window.__nova_orchestrator && !window.__nova_orchestrator.getSnapshot()?.paused);
    isPlaying = isAudioPlaying || (hasPlayClock && !isPaused);
    if (isPlaying) {
      window.triggerAudifyBeatPulse(1.15);
    }
  }, 500);

  // -----------------------------------------------------------------------
  // 8. Inject UI Controls: Aurora Mode & Mix Action Pills
  // -----------------------------------------------------------------------
  function injectPlayerControls() {
    // 1. Inject Controls Pill in header
    if (!document.getElementById('audify-control-pills-container')) {
      const navHeader = document.querySelector('header, nav, .flex.justify-between');
      if (navHeader) {
        const pillGroup = document.createElement('div');
        pillGroup.id = 'audify-control-pills-container';
        pillGroup.style.cssText = `
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-left: 12px;
          position: relative;
          z-index: 40;
        `;
        pillGroup.innerHTML = `
          <!-- Aurora Mode Selector -->
          <div style="position:relative">
            <button id="audify-aurora-btn" class="squeeze" style="
              display:flex;
              align-items:center;
              gap:6px;
              background:rgba(225,0,255,0.12);
              border:1.5px solid #e100ff;
              color:#fff;
              padding:7px 14px;
              border-radius:9999px;
              font-family:var(--font-anton), 'Anton', sans-serif;
              font-size:13px;
              letter-spacing:0.04em;
              cursor:pointer;
              transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              box-shadow: 0 0 16px rgba(225,0,255,0.25);
            ">
              <span style="color:#e100ff">AURORA:</span>
              <span id="audify-aurora-label">${getAuroraModeLabel(auroraMode)}</span>
              <span style="font-size:10px;opacity:0.8">▼</span>
            </button>
            <div id="audify-aurora-dropdown" style="
              display:none;
              position:absolute;
              top:115%;
              left:0;
              min-width:210px;
              background:#0a0a0c;
              border:1.5px solid rgba(225,0,255,0.3);
              border-radius:14px;
              padding:6px;
              box-shadow:0 18px 48px rgba(0,0,0,0.85);
              backdrop-filter:blur(20px);
              z-index:999;
            ">
              <div class="audify-aurora-opt" data-mode="auto" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🔀 DYNAMIC AUTO-SYNC</div>
              <div class="audify-aurora-opt" data-mode="soft" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">✨ SOFT AURORA (3D Perlin)</div>
              <div class="audify-aurora-opt" data-mode="curtain" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🌠 CURTAIN RIBBONS (OKLab)</div>
              <div class="audify-aurora-opt" data-mode="fusion" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🎆 HYBRID FUSION</div>
            </div>
          </div>

          <!-- Mix Action Pill -->
          <div style="position:relative">
            <button id="audify-mix-btn" class="squeeze" style="
              display:flex;
              align-items:center;
              gap:6px;
              background:rgba(200,255,0,0.12);
              border:1.5px solid #c8ff00;
              color:#c8ff00;
              padding:7px 14px;
              border-radius:9999px;
              font-family:var(--font-anton), 'Anton', sans-serif;
              font-size:13px;
              letter-spacing:0.04em;
              cursor:pointer;
              transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              box-shadow: 0 0 16px rgba(200,255,0,0.2);
            ">
              <span style="font-size:14px">MIX:</span>
              <span id="audify-mix-label">${getMixStyleLabel(activeMixStyle)}</span>
              <span style="font-size:10px;opacity:0.8">▼</span>
            </button>
            <div id="audify-mix-dropdown" style="
              display:none;
              position:absolute;
              top:115%;
              left:0;
              min-width:180px;
              background:#0a0a0c;
              border:1.5px solid rgba(255,255,255,0.15);
              border-radius:14px;
              padding:6px;
              box-shadow:0 18px 48px rgba(0,0,0,0.85);
              backdrop-filter:blur(20px);
              z-index:999;
            ">
              <div class="audify-mix-opt" data-style="drum_roll" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🥁 DRUM ROLL BUILD</div>
              <div class="audify-mix-opt" data-style="blend" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🎚 CLUB S-BLEND</div>
              <div class="audify-mix-opt" data-style="filter_sweep" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🌊 FILTER SWEEP</div>
              <div class="audify-mix-opt" data-style="echo_drop" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🔊 ECHO OUT DROP</div>
              <div class="audify-mix-opt" data-style="sub_drop" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">💥 808 SUB IMPACT</div>
            </div>
          </div>
        `;
        navHeader.appendChild(pillGroup);

        // Mix Dropdown events
        const mixBtn = document.getElementById('audify-mix-btn');
        const mixDd = document.getElementById('audify-mix-dropdown');
        mixBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          mixDd.style.display = mixDd.style.display === 'block' ? 'none' : 'block';
          if (auroraDd) auroraDd.style.display = 'none';
        });

        pillGroup.querySelectorAll('.audify-mix-opt').forEach((opt) => {
          opt.addEventListener('mouseenter', () => (opt.style.background = 'rgba(200,255,0,0.15)'));
          opt.addEventListener('mouseleave', () => (opt.style.background = 'transparent'));
          opt.addEventListener('click', () => {
            window.setAudifyMixStyle(opt.dataset.style);
            mixDd.style.display = 'none';
            SOUND_FX[opt.dataset.style]?.();
          });
        });

        // Aurora Dropdown events
        const auroraBtn = document.getElementById('audify-aurora-btn');
        const auroraDd = document.getElementById('audify-aurora-dropdown');
        auroraBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          auroraDd.style.display = auroraDd.style.display === 'block' ? 'none' : 'block';
          if (mixDd) mixDd.style.display = 'none';
        });

        pillGroup.querySelectorAll('.audify-aurora-opt').forEach((opt) => {
          opt.addEventListener('mouseenter', () => (opt.style.background = 'rgba(225,0,255,0.18)'));
          opt.addEventListener('mouseleave', () => (opt.style.background = 'transparent'));
          opt.addEventListener('click', () => {
            window.setAudifyAuroraMode(opt.dataset.mode);
            auroraDd.style.display = 'none';
          });
        });

        document.addEventListener('click', () => {
          if (mixDd) mixDd.style.display = 'none';
          if (auroraDd) auroraDd.style.display = 'none';
        });
      }
    }
  }

  setInterval(injectPlayerControls, 1000);
})();
