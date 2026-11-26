with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add uShockwave to softFragmentShaderSource
old_soft_frag = """  uniform float uAberration;
  uniform int uVisualMode;
  uniform float uBeatPulse;
  out vec4 fragColor;"""

new_soft_frag = """  uniform float uAberration;
  uniform float uShockwave;
  uniform int uVisualMode;
  uniform float uBeatPulse;
  out vec4 fragColor;"""

if old_soft_frag in c:
    c = c.replace(old_soft_frag, new_soft_frag, 1)
    print("Added uShockwave to softFragmentShaderSource")

# 2. Add shockwave distortion to softFragmentShaderSource main()
old_soft_main = """    // Visual Mode 1: Vortex (Cosmic Spiral Warp)"""

new_soft_main = """    // Audio Shockwave Distortion on Beat Drops / Kicks
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

    // Visual Mode 1: Vortex (Cosmic Spiral Warp)"""

if old_soft_main in c:
    c = c.replace(old_soft_main, new_soft_main, 1)
    print("Added shockwave distortion to softFragmentShaderSource")

# 3. Add uShockwave to curtainFragmentShaderSource
old_curtain_frag = """  uniform float uAberration;
  uniform int uVisualMode;
  uniform float uBeatPulse;
  out vec4 outColor;"""

new_curtain_frag = """  uniform float uAberration;
  uniform float uShockwave;
  uniform int uVisualMode;
  uniform float uBeatPulse;
  out vec4 outColor;"""

if old_curtain_frag in c:
    c = c.replace(old_curtain_frag, new_curtain_frag, 1)
    print("Added uShockwave to curtainFragmentShaderSource")

# 4. Add shockwave distortion to curtainFragmentShaderSource main()
old_curtain_main = """    // Visual Mode 1: Vortex (Cosmic Spiral Warp)
    if (uVisualMode == 1) {"""

new_curtain_main = """    // Audio Shockwave Distortion on Beat Drops / Kicks
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
    if (uVisualMode == 1) {"""

if old_curtain_main in c:
    c = c.replace(old_curtain_main, new_curtain_main, 1)
    print("Added shockwave distortion to curtainFragmentShaderSource")

# 5. Add uShockwave to uniform maps
old_u_soft = """        uAberration: gl.getUniformLocation(softProgram, 'uAberration'),"""
new_u_soft = """        uAberration: gl.getUniformLocation(softProgram, 'uAberration'),
        uShockwave: gl.getUniformLocation(softProgram, 'uShockwave'),"""

if old_u_soft in c:
    c = c.replace(old_u_soft, new_u_soft, 1)
    print("Added uShockwave to softUniformLocations")

old_u_curtain = """        uAberration: gl.getUniformLocation(curtainProgram, 'uAberration'),"""
new_u_curtain = """        uAberration: gl.getUniformLocation(curtainProgram, 'uAberration'),
        uShockwave: gl.getUniformLocation(curtainProgram, 'uShockwave'),"""

if old_u_curtain in c:
    c = c.replace(old_u_curtain, new_u_curtain, 1)
    print("Added uShockwave to curtainUniformLocations")

# 6. Pass beatData to borderEngine.onRenderFrame
old_border_call = """    if (window.__audifyBorderInstance?.onRenderFrame) {
      window.__audifyBorderInstance.onRenderFrame(beatPulse);
    }"""

new_border_call = """    if (window.__audifyBorderInstance?.onRenderFrame) {
      window.__audifyBorderInstance.onRenderFrame(beatPulse, beatData);
    }"""

if old_border_call in c:
    c = c.replace(old_border_call, new_border_call, 1)
    print("Updated window.__audifyBorderInstance.onRenderFrame to pass beatData")

# 7. Add shockwaveTimer tracking and uniform upload in render()
# Locate let shockwaveTimer
old_render_vars = """    let beatPulse = 1.0;"""
new_render_vars = """    let beatPulse = 1.0;
    let shockwaveTimer = 0.0;"""

if old_render_vars in c and 'let shockwaveTimer = 0.0;' not in c:
    c = c.replace(old_render_vars, new_render_vars, 1)
    print("Added shockwaveTimer variable outside/in scope")

# Locate where gl.uniform1f(u.uAberration, aberration); is called in soft draw
old_uniform_call = """      gl.uniform1f(u.uAberration, aberration);"""
new_uniform_call = """      // Audio Shockwave Progression
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
      gl.uniform1f(u.uAberration, aberration);"""

if old_uniform_call in c:
    # replace all occurrences
    c = c.replace(old_uniform_call, new_uniform_call)
    print("Added shockwave uniform updates to soft and curtain render passes")

with open('public/js/ui/aurora-and-mix-engine.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Saved aurora-and-mix-engine.js")
