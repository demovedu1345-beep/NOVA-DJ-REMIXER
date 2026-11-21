// =========================================================================
// Audify Viewport Perimeter RGB Aurora Border, Shockwave & HUD Badge Engine
// Award-Winning React.dev / Linear / Emil Kowalski Spring Motion Architecture
// =========================================================================

(function initAudifyRgbAuroraBorderModule() {
  if (typeof window === 'undefined') return;
  if (window.__audify_rgb_aurora_border_loaded) return;
  window.__audify_rgb_aurora_border_loaded = true;

  // -----------------------------------------------------------------------
  // 1. The 8 Distinctive Motion Pattern Definitions
  // -----------------------------------------------------------------------
  const AURORA_PATTERNS = [
    {
      id: 'pattern-1',
      num: 1,
      name: 'Prismatic RGB Spectrum',
      tag: '🌈 PRISMATIC RGB SPECTRUM',
      subtext: 'react.dev Continuous Fluid Rainbow Aurora',
      className: 'pattern-prismatic',
      primaryColor: '#00f0ff',
      secondaryColor: '#ff0080',
      glowColor: 'rgba(0, 240, 255, 0.42)',
      shockwaveColor: 'rgba(0, 240, 255, 0.95)',
      flashColor: 'rgba(255, 0, 128, 0.28)',
      flare1: '#00f0ff',
      flare2: '#ff0080',
      colors: ['#ff0055', '#ff7700', '#ffd000', '#00ff87', '#00f0ff', '#0066ff', '#7928ca', '#ff0080']
    },
    {
      id: 'pattern-2',
      num: 2,
      name: 'Cyber Neon Laser Sweep',
      tag: '⚡ CYBER NEON LASER SWEEP',
      subtext: 'Cyan & Magenta Perimeter Laser Accelerator',
      className: 'pattern-cyber-neon',
      primaryColor: '#00f0ff',
      secondaryColor: '#e100ff',
      glowColor: 'rgba(0, 240, 255, 0.45)',
      shockwaveColor: 'rgba(225, 0, 255, 0.98)',
      flashColor: 'rgba(0, 240, 255, 0.3)',
      flare1: '#00f0ff',
      flare2: '#e100ff',
      colors: ['#00f0ff', '#e100ff']
    },
    {
      id: 'pattern-3',
      num: 3,
      name: 'Emerald Aurora Borealis',
      tag: '🌌 EMERALD BOREALIS',
      subtext: 'Vibrant Green + Teal + Indigo Wave Ribbon',
      className: 'pattern-emerald-borealis',
      primaryColor: '#00ff87',
      secondaryColor: '#00e5ff',
      glowColor: 'rgba(0, 255, 135, 0.42)',
      shockwaveColor: 'rgba(0, 229, 255, 0.95)',
      flashColor: 'rgba(0, 255, 135, 0.28)',
      flare1: '#00ff87',
      flare2: '#00e5ff',
      colors: ['#00ff87', '#00e5ff', '#4338ca']
    },
    {
      id: 'pattern-4',
      num: 4,
      name: 'Solar Plasma Flare',
      tag: '🔥 SOLAR PLASMA FLARE',
      subtext: 'Gold + Crimson + Neon Orange High-Heat Plasma',
      className: 'pattern-solar-plasma',
      primaryColor: '#ffd000',
      secondaryColor: '#ff0055',
      glowColor: 'rgba(255, 107, 0, 0.48)',
      shockwaveColor: 'rgba(255, 208, 0, 0.98)',
      flashColor: 'rgba(255, 0, 85, 0.32)',
      flare1: '#ffd000',
      flare2: '#ff0055',
      colors: ['#ffd000', '#ff0055', '#ff6b00']
    },
    {
      id: 'pattern-5',
      num: 5,
      name: 'Ultraviolet Hyperdrive',
      tag: '🚀 ULTRAVIOLET HYPERDRIVE',
      subtext: 'Violet + Neon Pink + Laser Cyan Velocity',
      className: 'pattern-ultraviolet',
      primaryColor: '#7928ca',
      secondaryColor: '#ff0080',
      glowColor: 'rgba(121, 40, 202, 0.45)',
      shockwaveColor: 'rgba(255, 0, 128, 0.98)',
      flashColor: 'rgba(0, 223, 216, 0.3)',
      flare1: '#ff0080',
      flare2: '#00dfd8',
      colors: ['#7928ca', '#ff0080', '#00dfd8']
    },
    {
      id: 'pattern-6',
      num: 6,
      name: 'Acid Lime Velocity',
      tag: '⚡ ACID LIME VELOCITY',
      subtext: 'Audify Signature Lime + Electric Cyan Laser',
      className: 'pattern-acid-lime',
      primaryColor: '#c8ff00',
      secondaryColor: '#00ffff',
      glowColor: 'rgba(200, 255, 0, 0.5)',
      shockwaveColor: 'rgba(200, 255, 0, 0.98)',
      flashColor: 'rgba(0, 255, 255, 0.32)',
      flare1: '#c8ff00',
      flare2: '#00ffff',
      colors: ['#c8ff00', '#00ffff']
    },
    {
      id: 'pattern-7',
      num: 7,
      name: 'Optical Diffraction Prism',
      tag: '💎 OPTICAL DIFFRACTION PRISM',
      subtext: 'Pure R/G/B Phase-Shifted Specular Glints',
      className: 'pattern-optical-diffraction',
      primaryColor: '#ffffff',
      secondaryColor: '#00f0ff',
      glowColor: 'rgba(255, 255, 255, 0.4)',
      shockwaveColor: 'rgba(255, 255, 255, 0.98)',
      flashColor: 'rgba(0, 240, 255, 0.26)',
      flare1: '#ff0055',
      flare2: '#00ffff',
      colors: ['#ff0000', '#ffffff', '#00ff00', '#ffffff', '#0000ff']
    },
    {
      id: 'pattern-8',
      num: 8,
      name: 'Miami Synthwave Mirage',
      tag: '🌅 MIAMI SYNTHWAVE MIRAGE',
      subtext: 'Sunset Coral + Flamingo + Synth Purple Dusk',
      className: 'pattern-miami-synthwave',
      primaryColor: '#ff7e5f',
      secondaryColor: '#feb47b',
      glowColor: 'rgba(255, 126, 95, 0.45)',
      shockwaveColor: 'rgba(254, 180, 123, 0.98)',
      flashColor: 'rgba(185, 43, 39, 0.3)',
      flare1: '#ff7e5f',
      flare2: '#feb47b',
      colors: ['#ff7e5f', '#feb47b', '#b92b27']
    }
  ];

  let currentPatternIndex = 0;
  let badgeTimeout = null;

  // -----------------------------------------------------------------------
  // 2. High-Craft Stylesheet Injection
  // -----------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('audify-rgb-aurora-styles')) return;
    const style = document.createElement('style');
    style.id = 'audify-rgb-aurora-styles';
    style.textContent = `
      /* @property for Smooth Hardware-Accelerated Conic Card Angles */
      @property --audify-card-angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
      }

      /* 1. Viewport Perimeter RGB Aurora Border Root */
      #audify-rgb-aurora-border {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 10 !important;
        overflow: hidden !important;
        contain: strict !important;
        user-select: none !important;
      }

      /* Inward Ambient Edge Glow */
      #audify-rgb-aurora-border .audify-aurora-inward-glow {
        position: absolute !important;
        inset: 0 !important;
        pointer-events: none !important;
        box-shadow: inset 0 0 40px var(--aurora-glow-color, rgba(0, 240, 255, 0.38));
        transition: box-shadow 0.08s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: box-shadow;
      }

      /* Perimeter Laser Beams */
      #audify-rgb-aurora-border .audify-aurora-beam {
        position: absolute !important;
        pointer-events: none !important;
        z-index: 2 !important;
        will-change: transform, background-position, opacity;
      }

      #audify-rgb-aurora-border .audify-aurora-beam::after {
        content: '' !important;
        position: absolute !important;
        inset: -3px !important;
        background: inherit !important;
        filter: blur(5px) !important;
        opacity: 0.9 !important;
        pointer-events: none !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-top {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 3px !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-bottom {
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 3px !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-left {
        top: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 3px !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-right {
        top: 0 !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 3px !important;
      }

      /* Corner Light Leaks & Flares */
      #audify-rgb-aurora-border .audify-corner-flare {
        position: absolute !important;
        width: 200px !important;
        height: 200px !important;
        pointer-events: none !important;
        filter: blur(24px) !important;
        mix-blend-mode: screen !important;
        opacity: 0.82 !important;
        z-index: 3 !important;
        will-change: transform, opacity;
        transition: transform 0.1s ease-out, opacity 0.15s ease-out !important;
      }

      #audify-rgb-aurora-border .audify-corner-flare.top-left {
        top: -60px !important;
        left: -60px !important;
        background: radial-gradient(circle at 40% 40%, var(--flare-c1, #00f0ff) 0%, var(--flare-c2, #ff0080) 38%, transparent 72%) !important;
      }

      #audify-rgb-aurora-border .audify-corner-flare.top-right {
        top: -60px !important;
        right: -60px !important;
        background: radial-gradient(circle at 60% 40%, var(--flare-c2, #ff0080) 0%, var(--flare-c1, #00f0ff) 38%, transparent 72%) !important;
      }

      #audify-rgb-aurora-border .audify-corner-flare.bottom-right {
        bottom: -60px !important;
        right: -60px !important;
        background: radial-gradient(circle at 60% 60%, var(--flare-c1, #00f0ff) 0%, var(--flare-c2, #ffd000) 38%, transparent 72%) !important;
      }

      #audify-rgb-aurora-border .audify-corner-flare.bottom-left {
        bottom: -60px !important;
        left: -60px !important;
        background: radial-gradient(circle at 40% 60%, var(--flare-c2, #ffd000) 0%, var(--flare-c1, #00f0ff) 38%, transparent 72%) !important;
      }

      /* ------------------------------------------------------------- */
      /* 2. Distinctive Motion Pattern Implementations                 */
      /* ------------------------------------------------------------- */

      /* Pattern 1: Prismatic RGB Spectrum (React.dev style) */
      .pattern-prismatic .audify-aurora-beam-top,
      .pattern-prismatic .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #ff0055, #ff7700, #ffd000, #00ff87, #00f0ff, #0066ff, #7928ca, #ff0080, #ff0055) !important;
        background-size: 200% 100% !important;
        animation: audifyPrismaticH 3.2s linear infinite !important;
      }
      .pattern-prismatic .audify-aurora-beam-left,
      .pattern-prismatic .audify-aurora-beam-right {
        background: linear-gradient(180deg, #ff0055, #ff7700, #ffd000, #00ff87, #00f0ff, #0066ff, #7928ca, #ff0080, #ff0055) !important;
        background-size: 100% 200% !important;
        animation: audifyPrismaticV 3.2s linear infinite !important;
      }

      @keyframes audifyPrismaticH {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 0%; }
      }
      @keyframes audifyPrismaticV {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 200%; }
      }

      /* Pattern 2: Cyber Neon Laser Sweep (Clockwise Perimeter Sweep) */
      .pattern-cyber-neon .audify-aurora-beam-top {
        background: linear-gradient(90deg, rgba(0, 240, 255, 0.15) 0%, #00f0ff 45%, #ffffff 50%, #e100ff 55%, rgba(225, 0, 255, 0.15) 100%) !important;
        background-size: 40% 100% !important;
        background-repeat: no-repeat !important;
        animation: audifySweepTop 2.4s linear infinite !important;
      }
      .pattern-cyber-neon .audify-aurora-beam-right {
        background: linear-gradient(180deg, rgba(225, 0, 255, 0.15) 0%, #e100ff 45%, #ffffff 50%, #00f0ff 55%, rgba(0, 240, 255, 0.15) 100%) !important;
        background-size: 100% 40% !important;
        background-repeat: no-repeat !important;
        animation: audifySweepRight 2.4s linear infinite !important;
      }
      .pattern-cyber-neon .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, rgba(0, 240, 255, 0.15) 0%, #00f0ff 45%, #ffffff 50%, #e100ff 55%, rgba(225, 0, 255, 0.15) 100%) !important;
        background-size: 40% 100% !important;
        background-repeat: no-repeat !important;
        animation: audifySweepBottom 2.4s linear infinite !important;
      }
      .pattern-cyber-neon .audify-aurora-beam-left {
        background: linear-gradient(180deg, rgba(225, 0, 255, 0.15) 0%, #e100ff 45%, #ffffff 50%, #00f0ff 55%, rgba(0, 240, 255, 0.15) 100%) !important;
        background-size: 100% 40% !important;
        background-repeat: no-repeat !important;
        animation: audifySweepLeft 2.4s linear infinite !important;
      }

      @keyframes audifySweepTop {
        0% { background-position: -40% 0%; opacity: 0; }
        2% { opacity: 1; }
        25% { background-position: 100% 0%; opacity: 1; }
        26% { opacity: 0; }
        100% { background-position: 100% 0%; opacity: 0; }
      }
      @keyframes audifySweepRight {
        0%, 23% { background-position: 0% -40%; opacity: 0; }
        25% { opacity: 1; }
        50% { background-position: 0% 100%; opacity: 1; }
        51% { opacity: 0; }
        100% { background-position: 0% 100%; opacity: 0; }
      }
      @keyframes audifySweepBottom {
        0%, 48% { background-position: 140% 0%; opacity: 0; }
        50% { opacity: 1; }
        75% { background-position: 0% 0%; opacity: 1; }
        76% { opacity: 0; }
        100% { background-position: 0% 0%; opacity: 0; }
      }
      @keyframes audifySweepLeft {
        0%, 73% { background-position: 0% 140%; opacity: 0; }
        75% { opacity: 1; }
        98% { background-position: 0% 0%; opacity: 1; }
        100% { opacity: 0; }
      }

      /* Pattern 3: Emerald Aurora Borealis */
      .pattern-emerald-borealis .audify-aurora-beam-top,
      .pattern-emerald-borealis .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #4338ca, #00ff87, #00e5ff, #4338ca) !important;
        background-size: 250% 100% !important;
        animation: audifyEmeraldH 4.2s ease-in-out infinite alternate !important;
      }
      .pattern-emerald-borealis .audify-aurora-beam-left,
      .pattern-emerald-borealis .audify-aurora-beam-right {
        background: linear-gradient(180deg, #4338ca, #00ff87, #00e5ff, #4338ca) !important;
        background-size: 100% 250% !important;
        animation: audifyEmeraldV 4.2s ease-in-out infinite alternate !important;
      }
      @keyframes audifyEmeraldH {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 0%; }
      }
      @keyframes audifyEmeraldV {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 100%; }
      }

      /* Pattern 4: Solar Plasma Flare */
      .pattern-solar-plasma .audify-aurora-beam-top,
      .pattern-solar-plasma .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #ff0055, #ff6b00, #ffd000, #ff0055) !important;
        background-size: 200% 100% !important;
        animation: audifySolarH 1.8s linear infinite !important;
      }
      .pattern-solar-plasma .audify-aurora-beam-left,
      .pattern-solar-plasma .audify-aurora-beam-right {
        background: linear-gradient(180deg, #ff0055, #ff6b00, #ffd000, #ff0055) !important;
        background-size: 100% 200% !important;
        animation: audifySolarV 1.8s linear infinite !important;
      }
      @keyframes audifySolarH {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 0%; }
      }
      @keyframes audifySolarV {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 200%; }
      }

      /* Pattern 5: Ultraviolet Hyperdrive */
      .pattern-ultraviolet .audify-aurora-beam-top,
      .pattern-ultraviolet .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #7928ca, #ff0080, #00dfd8, #7928ca) !important;
        background-size: 200% 100% !important;
        animation: audifyHyperdriveH 1.4s linear infinite !important;
      }
      .pattern-ultraviolet .audify-aurora-beam-left,
      .pattern-ultraviolet .audify-aurora-beam-right {
        background: linear-gradient(180deg, #7928ca, #ff0080, #00dfd8, #7928ca) !important;
        background-size: 100% 200% !important;
        animation: audifyHyperdriveV 1.4s linear infinite !important;
      }
      @keyframes audifyHyperdriveH {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 0%; }
      }
      @keyframes audifyHyperdriveV {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 200%; }
      }

      /* Pattern 6: Acid Lime Velocity */
      .pattern-acid-lime .audify-aurora-beam-top,
      .pattern-acid-lime .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #c8ff00 0%, #00ffff 50%, #c8ff00 100%) !important;
        background-size: 180% 100% !important;
        animation: audifyAcidH 1.1s linear infinite !important;
      }
      .pattern-acid-lime .audify-aurora-beam-left,
      .pattern-acid-lime .audify-aurora-beam-right {
        background: linear-gradient(180deg, #c8ff00 0%, #00ffff 50%, #c8ff00 100%) !important;
        background-size: 100% 180% !important;
        animation: audifyAcidV 1.1s linear infinite !important;
      }
      @keyframes audifyAcidH {
        0% { background-position: 0% 0%; }
        100% { background-position: 180% 0%; }
      }
      @keyframes audifyAcidV {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 180%; }
      }

      /* Pattern 7: Optical Diffraction Prism */
      .pattern-optical-diffraction .audify-aurora-beam-top,
      .pattern-optical-diffraction .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #ff0000 0%, #ffffff 15%, #00ff00 35%, #ffffff 50%, #0000ff 70%, #ffffff 85%, #ff0000 100%) !important;
        background-size: 200% 100% !important;
        animation: audifyDiffractionH 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
      }
      .pattern-optical-diffraction .audify-aurora-beam-left,
      .pattern-optical-diffraction .audify-aurora-beam-right {
        background: linear-gradient(180deg, #ff0000 0%, #ffffff 15%, #00ff00 35%, #ffffff 50%, #0000ff 70%, #ffffff 85%, #ff0000 100%) !important;
        background-size: 100% 200% !important;
        animation: audifyDiffractionV 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
      }
      @keyframes audifyDiffractionH {
        0% { background-position: 0% 0%; }
        50% { background-position: 100% 0%; }
        100% { background-position: 200% 0%; }
      }
      @keyframes audifyDiffractionV {
        0% { background-position: 0% 0%; }
        50% { background-position: 0% 100%; }
        100% { background-position: 0% 200%; }
      }

      /* Pattern 8: Miami Synthwave Mirage */
      .pattern-miami-synthwave .audify-aurora-beam-top,
      .pattern-miami-synthwave .audify-aurora-beam-bottom {
        background: linear-gradient(90deg, #b92b27, #ff7e5f, #feb47b, #b92b27) !important;
        background-size: 220% 100% !important;
        animation: audifyMiamiH 3.4s ease-in-out infinite alternate !important;
      }
      .pattern-miami-synthwave .audify-aurora-beam-left,
      .pattern-miami-synthwave .audify-aurora-beam-right {
        background: linear-gradient(180deg, #b92b27, #ff7e5f, #feb47b, #b92b27) !important;
        background-size: 100% 220% !important;
        animation: audifyMiamiV 3.4s ease-in-out infinite alternate !important;
      }
      @keyframes audifyMiamiH {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 0%; }
      }
      @keyframes audifyMiamiV {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 100%; }
      }

      /* ------------------------------------------------------------- */
      /* 3. Full-Screen Song Change Shockwave & Luminous Flash Aura   */
      /* ------------------------------------------------------------- */
      #audify-shockwave-container {
        position: fixed !important;
        inset: 0 !important;
        pointer-events: none !important;
        z-index: 12 !important;
        overflow: hidden !important;
      }

      .audify-shockwave-ring {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        border-radius: 50% !important;
        transform: translate(-50%, -50%) scale(0.01) !important;
        border: 3.5px solid var(--shockwave-color, rgba(0, 240, 255, 0.95)) !important;
        box-shadow: 0 0 45px var(--shockwave-color, rgba(0, 240, 255, 0.95)),
                    inset 0 0 30px var(--shockwave-color, rgba(0, 240, 255, 0.75)) !important;
        opacity: 1 !important;
        pointer-events: none !important;
        will-change: transform, opacity !important;
        animation: audifyShockwaveExpand 0.78s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyShockwaveExpand {
        0% {
          width: 20px;
          height: 20px;
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.08);
          border-width: 6px;
        }
        50% {
          opacity: 0.9;
          border-width: 3.5px;
        }
        100% {
          width: 300vmax;
          height: 300vmax;
          opacity: 0;
          transform: translate(-50%, -50%) scale(1);
          border-width: 1px;
        }
      }

      .audify-flash-aura {
        position: fixed !important;
        inset: 0 !important;
        pointer-events: none !important;
        z-index: 11 !important;
        background: radial-gradient(circle at 50% 50%, var(--flash-color-1, rgba(200, 255, 0, 0.38)) 0%, var(--flash-color-2, rgba(225, 0, 255, 0.22)) 48%, transparent 76%) !important;
        mix-blend-mode: screen !important;
        opacity: 0.95 !important;
        will-change: opacity !important;
        animation: audifyFlashDecay 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyFlashDecay {
        0% { opacity: 0.95; }
        100% { opacity: 0; }
      }

      /* ------------------------------------------------------------- */
      /* 4. Floating HUD Badge (Emil Kowalski Spring Entrance)        */
      /* ------------------------------------------------------------- */
      #audify-songchange-badge {
        position: fixed !important;
        top: 24px !important;
        left: 50% !important;
        transform: translate(-50%, 0) !important;
        z-index: 9999 !important;
        pointer-events: none !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 14px !important;
        padding: 8px 20px 8px 12px !important;
        background: rgba(10, 12, 17, 0.88) !important;
        backdrop-filter: blur(28px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
        border-radius: 9999px !important;
        border: 1.5px solid rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.82),
                    0 0 28px var(--badge-glow, rgba(0, 240, 255, 0.3)),
                    inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
        user-select: none !important;
        white-space: nowrap !important;
        will-change: transform, opacity !important;
        animation: audifyBadgeSpringIn 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      #audify-songchange-badge.leaving {
        animation: audifyBadgeSpringOut 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyBadgeSpringIn {
        0% {
          opacity: 0;
          transform: translate(-50%, -28px) scale(0.9);
        }
        40% {
          opacity: 1;
          transform: translate(-50%, 0) scale(1.04);
        }
        72% {
          transform: translate(-50%, 0) scale(0.985);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
        }
      }

      @keyframes audifyBadgeSpringOut {
        0% {
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -18px) scale(0.94);
        }
      }

      .audify-badge-led {
        width: 10px !important;
        height: 10px !important;
        border-radius: 50% !important;
        background: var(--badge-accent, #c8ff00) !important;
        box-shadow: 0 0 12px var(--badge-accent, #c8ff00) !important;
        animation: audifyLedPulse 1.2s ease-in-out infinite alternate !important;
        flex-shrink: 0 !important;
      }

      @keyframes audifyLedPulse {
        0% { transform: scale(0.85); opacity: 0.7; }
        100% { transform: scale(1.2); opacity: 1; }
      }

      .audify-badge-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
      }

      .audify-badge-tag-row {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .audify-badge-accent {
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 10px !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
        color: var(--badge-accent, #c8ff00) !important;
        font-weight: 600 !important;
      }

      .audify-badge-pattern-pill {
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 10px !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.1) !important;
        padding: 1px 7px !important;
        border-radius: 9999px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
      }

      .audify-badge-title-text {
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 14px !important;
        font-weight: 400 !important;
        letter-spacing: 0.04em !important;
        color: #ffffff !important;
        line-height: 1.15 !important;
        text-transform: uppercase !important;
      }

      .audify-badge-artist-text {
        font-family: system-ui, -apple-system, sans-serif !important;
        font-size: 11px !important;
        color: rgba(255, 255, 255, 0.6) !important;
        letter-spacing: 0.02em !important;
      }

      /* ------------------------------------------------------------- */
      /* 5. Card RGB Aurora Borders (.audify-rgb-card)                */
      /* ------------------------------------------------------------- */
      .audify-rgb-card {
        position: relative !important;
        background: rgba(14, 16, 21, 0.88) !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        z-index: 1 !important;
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .audify-rgb-card::before {
        content: '' !important;
        position: absolute !important;
        inset: -2px !important;
        border-radius: inherit !important;
        padding: 2px !important;
        background: conic-gradient(
          from var(--audify-card-angle, 0deg),
          #ff0055,
          #ffd000,
          #00ff87,
          #00f0ff,
          #7928ca,
          #ff0080,
          #ff0055
        ) !important;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
        -webkit-mask-composite: xor !important;
        mask-composite: exclude !important;
        pointer-events: none !important;
        opacity: 0.32 !important;
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        z-index: 2 !important;
        animation: audifyRotateCardBorder 4.5s linear infinite !important;
      }

      .audify-rgb-card::after {
        content: '' !important;
        position: absolute !important;
        inset: 0 !important;
        border-radius: inherit !important;
        background: radial-gradient(
          480px circle at var(--card-mouse-x, 50%) var(--card-mouse-y, 50%),
          rgba(255, 255, 255, 0.09),
          transparent 40%
        ) !important;
        pointer-events: none !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
        z-index: 3 !important;
      }

      .audify-rgb-card:hover::before,
      .audify-rgb-card.active::before,
      .audify-rgb-card[data-active="true"]::before {
        opacity: 1 !important;
        animation-duration: 2.2s !important;
      }

      .audify-rgb-card:hover,
      .audify-rgb-card.active,
      .audify-rgb-card[data-active="true"] {
        transform: translateY(-2px) scale(1.01) !important;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65),
                    0 0 24px rgba(0, 240, 255, 0.28),
                    0 0 42px rgba(225, 0, 255, 0.18) !important;
      }

      .audify-rgb-card:hover::after {
        opacity: 1 !important;
      }

      @keyframes audifyRotateCardBorder {
        0% {
          --audify-card-angle: 0deg;
          transform: rotate(0deg);
        }
        100% {
          --audify-card-angle: 360deg;
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // -----------------------------------------------------------------------
  // 3. Viewport Perimeter RGB Border DOM Creation & Injection
  // -----------------------------------------------------------------------
  let borderRoot = null;
  let inwardGlow = null;
  let cornerFlares = [];
  let shockwaveContainer = null;

  function ensureBorderDOM() {
    if (!document.body) return;
    injectStyles();

    if (!borderRoot || !borderRoot.isConnected) {
      borderRoot = document.getElementById('audify-rgb-aurora-border');
      if (!borderRoot) {
        borderRoot = document.createElement('div');
        borderRoot.id = 'audify-rgb-aurora-border';
        borderRoot.setAttribute('aria-hidden', 'true');
        borderRoot.innerHTML = `
          <div class="audify-aurora-inward-glow"></div>
          <div class="audify-aurora-beam audify-aurora-beam-top"></div>
          <div class="audify-aurora-beam audify-aurora-beam-right"></div>
          <div class="audify-aurora-beam audify-aurora-beam-bottom"></div>
          <div class="audify-aurora-beam audify-aurora-beam-left"></div>
          <div class="audify-corner-flare top-left"></div>
          <div class="audify-corner-flare top-right"></div>
          <div class="audify-corner-flare bottom-right"></div>
          <div class="audify-corner-flare bottom-left"></div>
        `;
        document.body.prepend(borderRoot);
      }
      inwardGlow = borderRoot.querySelector('.audify-aurora-inward-glow');
      cornerFlares = Array.from(borderRoot.querySelectorAll('.audify-corner-flare'));
      applyBorderPattern(currentPatternIndex);
    }

    if (!shockwaveContainer || !shockwaveContainer.isConnected) {
      shockwaveContainer = document.getElementById('audify-shockwave-container');
      if (!shockwaveContainer) {
        shockwaveContainer = document.createElement('div');
        shockwaveContainer.id = 'audify-shockwave-container';
        shockwaveContainer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(shockwaveContainer);
      }
    }
  }

  // -----------------------------------------------------------------------
  // 4. Pattern Controller & Switcher
  // -----------------------------------------------------------------------
  function applyBorderPattern(idx) {
    currentPatternIndex = (idx + AURORA_PATTERNS.length) % AURORA_PATTERNS.length;
    const pattern = AURORA_PATTERNS[currentPatternIndex];

    if (!borderRoot) return pattern;

    // Reset old pattern classes
    AURORA_PATTERNS.forEach(p => borderRoot.classList.remove(p.className));
    borderRoot.classList.add(pattern.className);

    // Update CSS custom properties
    borderRoot.style.setProperty('--aurora-glow-color', pattern.glowColor);
    borderRoot.style.setProperty('--flare-c1', pattern.flare1);
    borderRoot.style.setProperty('--flare-c2', pattern.flare2);
    borderRoot.style.setProperty('--badge-accent', pattern.primaryColor);
    borderRoot.style.setProperty('--badge-glow', pattern.glowColor);

    return pattern;
  }

  // -----------------------------------------------------------------------
  // 5. Full-Screen Song Change FX (Shockwave + Flash Aura)
  // -----------------------------------------------------------------------
  function triggerSongChangeFX(pattern) {
    ensureBorderDOM();
    if (!shockwaveContainer) return;

    // 1. Radial Expanding Shockwave
    const ring = document.createElement('div');
    ring.className = 'audify-shockwave-ring';
    ring.style.setProperty('--shockwave-color', pattern.shockwaveColor);
    shockwaveContainer.appendChild(ring);

    ring.addEventListener('animationend', () => {
      ring.remove();
    }, { once: true });

    // 2. Luminous Flash Aura (Decaying in 400ms)
    const flash = document.createElement('div');
    flash.className = 'audify-flash-aura';
    flash.style.setProperty('--flash-color-1', pattern.flashColor);
    flash.style.setProperty('--flash-color-2', pattern.glowColor);
    shockwaveContainer.appendChild(flash);

    flash.addEventListener('animationend', () => {
      flash.remove();
    }, { once: true });
  }

  // -----------------------------------------------------------------------
  // 6. Floating HUD Badge (Emil Kowalski Spring Entrance, 3s Duration)
  // -----------------------------------------------------------------------
  function showSongChangeHUD(title, artist, pattern) {
    ensureBorderDOM();
    let badge = document.getElementById('audify-songchange-badge');

    if (badgeTimeout) {
      clearTimeout(badgeTimeout);
      badgeTimeout = null;
    }

    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'audify-songchange-badge';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      document.body.appendChild(badge);
    }

    badge.classList.remove('leaving');
    badge.style.setProperty('--badge-accent', pattern.primaryColor);
    badge.style.setProperty('--badge-glow', pattern.glowColor);

    badge.innerHTML = `
      <div class="audify-badge-led"></div>
      <div class="audify-badge-content">
        <div class="audify-badge-tag-row">
          <span class="audify-badge-accent">NOW PLAYING</span>
          <span class="audify-badge-pattern-pill">${escapeHtml(pattern.tag)}</span>
        </div>
        <div class="audify-badge-title-text">${escapeHtml(title || 'AUDIFY SET')}</div>
        ${artist ? `<div class="audify-badge-artist-text">${escapeHtml(artist)}</div>` : ''}
      </div>
    `;

    // Emil Kowalski Squeeze Entrance: trigger re-flow to re-run animation
    badge.style.animation = 'none';
    void badge.offsetWidth;
    badge.style.animation = '';

    // Dismiss after 3s (with smooth 350ms exit spring)
    badgeTimeout = setTimeout(() => {
      if (badge && badge.isConnected) {
        badge.classList.add('leaving');
        setTimeout(() => {
          if (badge && badge.isConnected) badge.remove();
        }, 360);
      }
    }, 2650);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -----------------------------------------------------------------------
  // 7. Audio-Reactive Beat Render Frame Hook (60/120 FPS)
  // -----------------------------------------------------------------------
  function onRenderFrame(beatPulse = 1.0) {
    if (!borderRoot || !borderRoot.isConnected) return;
    const activePattern = AURORA_PATTERNS[currentPatternIndex];

    // Inward Edge Glow Pulse
    if (inwardGlow) {
      const glowSpread = Math.round(36 + (beatPulse - 1.0) * 36);
      inwardGlow.style.boxShadow = `inset 0 0 ${glowSpread}px ${activePattern.glowColor}`;
    }

    // Corner Flares Dynamic Flare Scale
    if (cornerFlares && cornerFlares.length) {
      const scale = (1.0 + (beatPulse - 1.0) * 0.28).toFixed(3);
      const opacity = Math.min(1.0, 0.75 + (beatPulse - 1.0) * 0.25).toFixed(3);
      cornerFlares.forEach(el => {
        el.style.transform = `scale(${scale})`;
        el.style.opacity = opacity;
      });
    }
  }

  // -----------------------------------------------------------------------
  // 8. Public Integration APIs & Song Change Listener
  // -----------------------------------------------------------------------
  function onSongChange(songInfo = {}) {
    const nextIdx = (currentPatternIndex + 1) % AURORA_PATTERNS.length;
    const pattern = applyBorderPattern(nextIdx);

    // Trigger full-screen effects
    triggerSongChangeFX(pattern);

    // Display floating HUD
    const title = songInfo.title || songInfo.name || 'Next Track';
    const artist = songInfo.artist || 'Audify Mix';
    showSongChangeHUD(title, artist, pattern);
  }

  // Card Mouse Move Spotlight Tracker
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.audify-rgb-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);
  }, { passive: true });

  // Auto-tag cards in songs list
  function tagCards() {
    const candidateCards = document.querySelectorAll('li a.flex.h-full.flex-col, .grid > div, [data-testid="song-card"]');
    candidateCards.forEach(c => {
      if (!c.classList.contains('audify-rgb-card')) {
        c.classList.add('audify-rgb-card');
      }
    });
  }
    // Zero CPU polling: tag cards on load and user interactions
  tagCards();
  document.addEventListener('DOMContentLoaded', tagCards);
  window.addEventListener('popstate', () => setTimeout(tagCards, 200));
  document.addEventListener('click', () => setTimeout(tagCards, 300), { passive: true });

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBorderDOM);
  } else {
    ensureBorderDOM();
  }

  // Export on global window
  window.__audifyBorderInstance = {
    patterns: AURORA_PATTERNS,
    getCurrentPattern: () => AURORA_PATTERNS[currentPatternIndex],
    setPattern: (idx) => applyBorderPattern(idx),
    onSongChange,
    onRenderFrame,
    triggerSongChangeFX,
    showSongChangeHUD
  };

  window.setAudifyBorderPattern = function(idx) {
    return applyBorderPattern(idx);
  };
})();
