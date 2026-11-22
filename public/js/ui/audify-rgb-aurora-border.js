// =========================================================================
// Audify Viewport Perimeter RGB Aurora Border, Shockwave & HUD Badge Engine
// Award-Winning Ultra-Tier Anti-Slop Motion & Optical Laser FX Architecture
// Inspired by MotionSites, Linear, Emil Kowalski Tactile Squeeze Physics
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
      glowColor: 'rgba(0, 240, 255, 0.45)',
      shockwaveColor: 'rgba(0, 240, 255, 0.95)',
      flashColor: 'rgba(255, 0, 128, 0.32)',
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
      glowColor: 'rgba(0, 240, 255, 0.5)',
      shockwaveColor: 'rgba(225, 0, 255, 0.98)',
      flashColor: 'rgba(0, 240, 255, 0.35)',
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
      glowColor: 'rgba(0, 255, 135, 0.48)',
      shockwaveColor: 'rgba(0, 229, 255, 0.95)',
      flashColor: 'rgba(0, 255, 135, 0.32)',
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
      glowColor: 'rgba(255, 107, 0, 0.52)',
      shockwaveColor: 'rgba(255, 208, 0, 0.98)',
      flashColor: 'rgba(255, 0, 85, 0.36)',
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
      glowColor: 'rgba(121, 40, 202, 0.5)',
      shockwaveColor: 'rgba(255, 0, 128, 0.98)',
      flashColor: 'rgba(0, 223, 216, 0.35)',
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
      primaryColor: '#D4FF00',
      secondaryColor: '#00ffff',
      glowColor: 'rgba(212, 255, 0, 0.55)',
      shockwaveColor: 'rgba(212, 255, 0, 0.98)',
      flashColor: 'rgba(0, 255, 255, 0.35)',
      flare1: '#D4FF00',
      flare2: '#00ffff',
      colors: ['#D4FF00', '#00ffff']
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
      glowColor: 'rgba(255, 255, 255, 0.45)',
      shockwaveColor: 'rgba(255, 255, 255, 0.98)',
      flashColor: 'rgba(0, 240, 255, 0.3)',
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
      glowColor: 'rgba(255, 126, 95, 0.5)',
      shockwaveColor: 'rgba(254, 180, 123, 0.98)',
      flashColor: 'rgba(185, 43, 39, 0.35)',
      flare1: '#ff7e5f',
      flare2: '#feb47b',
      colors: ['#ff7e5f', '#feb47b', '#b92b27']
    }
  ];

  let currentPatternIndex = 0;
  let badgeTimeout = null;
  let lastMeasureDropTime = 0;
  let lastBarPhase = -1;

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
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        height: 100dvh !important;
        max-width: 100% !important;
        max-height: 100dvh !important;
        pointer-events: none !important;
        z-index: 10 !important;
        overflow: hidden !important;
        contain: strict !important;
        user-select: none !important;
      }

      /* 1px Obsidian Border with Dynamic Beat Glow */
      #audify-rgb-aurora-border .audify-aurora-obsidian-border {
        position: absolute !important;
        inset: 0 !important;
        pointer-events: none !important;
        border: 1px solid var(--audify-border-stroke, rgba(255, 255, 255, 0.08)) !important;
        box-shadow: inset 0 0 var(--audify-border-glow-px, 18px) var(--audify-border-glow-color, rgba(0, 240, 255, 0.35)),
                    0 0 var(--audify-border-glow-px, 18px) var(--audify-border-glow-color, rgba(0, 240, 255, 0.35)) !important;
        transition: border-color 0.08s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.08s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: border-color, box-shadow;
        z-index: 1 !important;
      }

      /* Inward Ambient Edge Glow */
      #audify-rgb-aurora-border .audify-aurora-inward-glow {
        position: absolute !important;
        inset: 0 !important;
        pointer-events: none !important;
        box-shadow: inset 0 0 40px var(--aurora-glow-color, rgba(0, 240, 255, 0.38));
        transition: box-shadow 0.08s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: box-shadow;
        z-index: 2 !important;
      }

      /* Perimeter Base Laser Beams */
      #audify-rgb-aurora-border .audify-aurora-beam {
        position: absolute !important;
        pointer-events: none !important;
        z-index: 3 !important;
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
        height: 2px !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-bottom {
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 2px !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-left {
        top: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 2px !important;
      }

      #audify-rgb-aurora-border .audify-aurora-beam-right {
        top: 0 !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 2px !important;
      }

      /* Traveling Electric Neon Streaks along Perimeter on Beat/Kick */
      #audify-rgb-aurora-border .audify-neon-streak {
        position: absolute !important;
        pointer-events: none !important;
        z-index: 4 !important;
        opacity: var(--audify-streak-opacity, 0.4) !important;
        will-change: transform, opacity !important;
      }

      #audify-rgb-aurora-border .audify-neon-streak-top {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 2.5px !important;
        background: linear-gradient(90deg, transparent 0%, #D4FF00 45%, #ffffff 50%, var(--aurora-primary, #00f0ff) 55%, transparent 100%) !important;
        background-size: 50% 100% !important;
        animation: audifyStreakH 1.8s linear infinite !important;
      }

      #audify-rgb-aurora-border .audify-neon-streak-bottom {
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 2.5px !important;
        background: linear-gradient(90deg, transparent 0%, var(--aurora-primary, #00f0ff) 45%, #ffffff 50%, #D4FF00 55%, transparent 100%) !important;
        background-size: 50% 100% !important;
        animation: audifyStreakHReverse 1.8s linear infinite !important;
      }

      #audify-rgb-aurora-border .audify-neon-streak-left {
        top: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 2.5px !important;
        background: linear-gradient(180deg, transparent 0%, var(--aurora-primary, #00f0ff) 45%, #ffffff 50%, #D4FF00 55%, transparent 100%) !important;
        background-size: 100% 50% !important;
        animation: audifyStreakVReverse 1.8s linear infinite !important;
      }

      #audify-rgb-aurora-border .audify-neon-streak-right {
        top: 0 !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 2.5px !important;
        background: linear-gradient(180deg, transparent 0%, #D4FF00 45%, #ffffff 50%, var(--aurora-primary, #00f0ff) 55%, transparent 100%) !important;
        background-size: 100% 50% !important;
        animation: audifyStreakV 1.8s linear infinite !important;
      }

      @keyframes audifyStreakH {
        0% { background-position: -50% 0%; }
        100% { background-position: 150% 0%; }
      }
      @keyframes audifyStreakHReverse {
        0% { background-position: 150% 0%; }
        100% { background-position: -50% 0%; }
      }
      @keyframes audifyStreakV {
        0% { background-position: 0% -50%; }
        100% { background-position: 0% 150%; }
      }
      @keyframes audifyStreakVReverse {
        0% { background-position: 0% 150%; }
        100% { background-position: 0% -50%; }
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
        z-index: 5 !important;
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

      /* 4-Corner Strobe Sparks for Measure Drops (Beat 1 of 4) */
      #audify-rgb-aurora-border .audify-corner-spark {
        position: absolute !important;
        width: 32px !important;
        height: 32px !important;
        pointer-events: none !important;
        z-index: 6 !important;
        opacity: 0 !important;
        will-change: transform, opacity, filter !important;
      }

      #audify-rgb-aurora-border .audify-corner-spark.top-left,
      #audify-rgb-aurora-border .audify-corner-spark.spark-tl {
        top: 0 !important;
        left: 0 !important;
      }
      #audify-rgb-aurora-border .audify-corner-spark.top-right,
      #audify-rgb-aurora-border .audify-corner-spark.spark-tr {
        top: 0 !important;
        right: 0 !important;
      }
      #audify-rgb-aurora-border .audify-corner-spark.bottom-right,
      #audify-rgb-aurora-border .audify-corner-spark.spark-br {
        bottom: 0 !important;
        right: 0 !important;
      }
      #audify-rgb-aurora-border .audify-corner-spark.bottom-left,
      #audify-rgb-aurora-border .audify-corner-spark.spark-bl {
        bottom: 0 !important;
        left: 0 !important;
      }

      .audify-spark-core {
        position: absolute !important;
        width: 14px !important;
        height: 14px !important;
        border-radius: 50% !important;
        background: #ffffff !important;
        box-shadow: 0 0 16px #ffffff, 0 0 32px #D4FF00, 0 0 48px var(--aurora-glow-color, rgba(0, 240, 255, 0.8)) !important;
        transform: translate(-50%, -50%) !important;
      }

      .audify-spark-trail-h,
      .audify-spark-trail-v {
        position: absolute !important;
        pointer-events: none !important;
        opacity: 0 !important;
        will-change: transform, opacity !important;
      }

      /* Triggered on Measure Drop (Beat 1 of 4) */
      .audify-strobe-sparking .audify-corner-spark {
        opacity: 1 !important;
        animation: audifyCornerStrobeFlash 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      .audify-strobe-sparking .spark-tl .audify-spark-trail-h {
        top: 0; left: 0; height: 3px; width: 260px;
        background: linear-gradient(90deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootRight 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }
      .audify-strobe-sparking .spark-tl .audify-spark-trail-v {
        top: 0; left: 0; width: 3px; height: 260px;
        background: linear-gradient(180deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootDown 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      .audify-strobe-sparking .spark-tr .audify-spark-trail-h {
        top: 0; right: 0; height: 3px; width: 260px;
        background: linear-gradient(-90deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootLeft 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }
      .audify-strobe-sparking .spark-tr .audify-spark-trail-v {
        top: 0; right: 0; width: 3px; height: 260px;
        background: linear-gradient(180deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootDown 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      .audify-strobe-sparking .spark-br .audify-spark-trail-h {
        bottom: 0; right: 0; height: 3px; width: 260px;
        background: linear-gradient(-90deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootLeft 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }
      .audify-strobe-sparking .spark-br .audify-spark-trail-v {
        bottom: 0; right: 0; width: 3px; height: 260px;
        background: linear-gradient(0deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      .audify-strobe-sparking .spark-bl .audify-spark-trail-h {
        bottom: 0; left: 0; height: 3px; width: 260px;
        background: linear-gradient(90deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootRight 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }
      .audify-strobe-sparking .spark-bl .audify-spark-trail-v {
        bottom: 0; left: 0; width: 3px; height: 260px;
        background: linear-gradient(0deg, #ffffff, #D4FF00, transparent);
        animation: audifyShootUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyShootRight {
        0% { transform: scaleX(0.01) translateX(0); opacity: 1; transform-origin: left; }
        55% { transform: scaleX(1) translateX(45px); opacity: 0.95; }
        100% { transform: scaleX(1.8) translateX(160px); opacity: 0; }
      }
      @keyframes audifyShootLeft {
        0% { transform: scaleX(0.01) translateX(0); opacity: 1; transform-origin: right; }
        55% { transform: scaleX(1) translateX(-45px); opacity: 0.95; }
        100% { transform: scaleX(1.8) translateX(-160px); opacity: 0; }
      }
      @keyframes audifyShootDown {
        0% { transform: scaleY(0.01) translateY(0); opacity: 1; transform-origin: top; }
        55% { transform: scaleY(1) translateY(45px); opacity: 0.95; }
        100% { transform: scaleY(1.8) translateY(160px); opacity: 0; }
      }
      @keyframes audifyShootUp {
        0% { transform: scaleY(0.01) translateY(0); opacity: 1; transform-origin: bottom; }
        55% { transform: scaleY(1) translateY(-45px); opacity: 0.95; }
        100% { transform: scaleY(1.8) translateY(-160px); opacity: 0; }
      }
      @keyframes audifyCornerStrobeFlash {
        0% { transform: scale(2.4); opacity: 1; filter: brightness(300%) drop-shadow(0 0 24px #ffffff) drop-shadow(0 0 45px #D4FF00); }
        35% { transform: scale(1.6); opacity: 0.85; filter: brightness(200%); }
        100% { transform: scale(0.9); opacity: 0; filter: brightness(100%); }
      }

      /* ------------------------------------------------------------- */
      /* 2. Distinctive Motion Pattern Implementations                 */
      /* ------------------------------------------------------------- */

      /* Pattern 1: Prismatic RGB Spectrum */
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

      /* Pattern 2: Cyber Neon Laser Sweep */
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
        background: linear-gradient(90deg, #D4FF00 0%, #00ffff 50%, #D4FF00 100%) !important;
        background-size: 180% 100% !important;
        animation: audifyAcidH 1.1s linear infinite !important;
      }
      .pattern-acid-lime .audify-aurora-beam-left,
      .pattern-acid-lime .audify-aurora-beam-right {
        background: linear-gradient(180deg, #D4FF00 0%, #00ffff 50%, #D4FF00 100%) !important;
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
      /* 3. Full-Screen Song Change Shockwave & Chromatic Glitch FX   */
      /* ------------------------------------------------------------- */
      #audify-shockwave-ring {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        width: 100px !important;
        height: 100px !important;
        border-radius: 50% !important;
        pointer-events: none !important;
        z-index: 9998 !important;
        opacity: 0 !important;
        transform: translate(-50%, -50%) scale(0.01) !important;
        border: 3.5px solid rgba(255, 255, 255, 0.95) !important;
        box-shadow:
          0 0 0 2px rgba(255, 255, 255, 0.95),
          0 0 45px 8px var(--shockwave-color, rgba(0, 240, 255, 0.95)),
          -10px -8px 55px 12px rgba(255, 0, 85, 0.88),
          10px 8px 55px 12px rgba(0, 240, 255, 0.88),
          0 0 75px 18px #D4FF00,
          inset 0 0 35px 6px rgba(255, 255, 255, 0.75),
          inset -8px -6px 45px rgba(255, 0, 128, 0.8),
          inset 8px 6px 45px rgba(0, 240, 255, 0.8) !important;
        will-change: transform, opacity, filter !important;
      }

      #audify-shockwave-ring::before,
      #audify-shockwave-ring::after {
        content: '' !important;
        position: absolute !important;
        inset: -10px !important;
        border-radius: 50% !important;
        border: 2px solid transparent !important;
        pointer-events: none !important;
      }

      #audify-shockwave-ring::before {
        border-color: rgba(255, 0, 80, 0.85) !important;
        box-shadow: 0 0 35px rgba(255, 0, 80, 0.8) !important;
        transform: scale(1.05) translate(-3px, -2px) !important;
        filter: blur(1px) !important;
      }

      #audify-shockwave-ring::after {
        border-color: rgba(0, 240, 255, 0.85) !important;
        box-shadow: 0 0 35px rgba(0, 240, 255, 0.8), 0 0 50px #D4FF00 !important;
        transform: scale(0.95) translate(3px, 2px) !important;
        filter: blur(1px) !important;
      }

      #audify-shockwave-ring.audify-shockwave-active {
        animation: audifyShockwaveChromaticExpand 0.82s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyShockwaveChromaticExpand {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.02);
          filter: blur(0px) contrast(200%);
          border-width: 8px;
        }
        30% {
          opacity: 0.95;
          filter: blur(1px) contrast(170%);
          border-width: 4.5px;
        }
        65% {
          opacity: 0.65;
          filter: blur(3px) contrast(140%);
          border-width: 2.5px;
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(28);
          filter: blur(16px) contrast(100%);
          border-width: 1px;
        }
      }

      /* 280ms Full-Screen Chromatic RGB Displacement Glitch */
      #audify-chromatic-glitch {
        position: fixed !important;
        inset: 0 !important;
        pointer-events: none !important;
        z-index: 9997 !important;
        opacity: 0 !important;
        mix-blend-mode: screen !important;
        background: transparent !important;
        will-change: transform, opacity, filter, box-shadow !important;
      }

      #audify-chromatic-glitch.audify-glitch-active {
        opacity: 1 !important;
        animation: audifyGlitchDisplacement 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyGlitchDisplacement {
        0% {
          opacity: 0.95;
          transform: translate3d(4px, -3px, 0) skewX(0.9deg);
          box-shadow: inset 8px 0 0 rgba(255, 0, 85, 0.85),
                      inset -8px 0 0 rgba(0, 240, 255, 0.85),
                      inset 0 4px 0 #D4FF00;
          filter: contrast(190%) saturate(230%);
          background: radial-gradient(circle at 50% 50%, rgba(212, 255, 0, 0.14) 0%, rgba(255, 0, 128, 0.16) 42%, transparent 75%);
        }
        20% {
          transform: translate3d(-5px, 3px, 0) skewX(-1.4deg);
          box-shadow: inset -10px 0 0 rgba(255, 0, 128, 0.9),
                      inset 10px 0 0 rgba(0, 255, 135, 0.9);
          filter: contrast(220%) saturate(260%);
        }
        45% {
          transform: translate3d(6px, -2px, 0) skewX(1.6deg);
          box-shadow: inset 6px 0 0 #D4FF00,
                      inset -6px 0 0 rgba(121, 40, 202, 0.95);
          filter: contrast(180%) saturate(200%);
        }
        70% {
          transform: translate3d(-3px, 1px, 0) skewX(-0.6deg);
          opacity: 0.75;
          box-shadow: inset -3px 0 0 rgba(0, 240, 255, 0.6),
                      inset 3px 0 0 rgba(255, 0, 85, 0.6);
        }
        90% {
          transform: translate3d(1px, -1px, 0) skewX(0.2deg);
          opacity: 0.35;
        }
        100% {
          transform: translate3d(0, 0, 0);
          opacity: 0;
          box-shadow: none;
        }
      }

      .audify-flash-aura {
        position: fixed !important;
        inset: 0 !important;
        pointer-events: none !important;
        z-index: 11 !important;
        background: radial-gradient(circle at 50% 50%, var(--flash-color-1, rgba(212, 255, 0, 0.38)) 0%, var(--flash-color-2, rgba(225, 0, 255, 0.22)) 48%, transparent 76%) !important;
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
      /* 4. Ultra-High-Tier Glassmorphism Floating HUD Toast Badge     */
      /* Emil Kowalski Spring Entrance & Exit, Squeeze Micro-Physics   */
      /* ------------------------------------------------------------- */
      #audify-songchange-badge {
        position: fixed !important;
        top: 24px !important;
        left: 50% !important;
        transform: translate(-50%, -36px) scale(0.88) !important;
        z-index: 9999 !important;
        pointer-events: auto !important;
        cursor: default !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 14px !important;
        padding: 9px 22px 9px 14px !important;
        background: rgba(7, 8, 12, 0.92) !important;
        backdrop-filter: blur(32px) saturate(220%) !important;
        -webkit-backdrop-filter: blur(32px) saturate(220%) !important;
        border-radius: 9999px !important;
        border: 1.5px solid rgba(255, 255, 255, 0.14) !important;
        box-shadow: 0 24px 65px rgba(0, 0, 0, 0.85),
                    0 0 32px var(--badge-glow, rgba(0, 240, 255, 0.35)),
                    inset 0 1px 1px rgba(255, 255, 255, 0.32),
                    inset 0 -1px 1px rgba(0, 0, 0, 0.5) !important;
        user-select: none !important;
        white-space: nowrap !important;
        opacity: 0 !important;
        will-change: transform, opacity !important;
        transition: transform 0.48s cubic-bezier(0.16, 1, 0.3, 1),
                    opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
        max-width: min(540px, calc(100vw - 32px)) !important;
      }

      #audify-songchange-badge:active {
        transform: translate(-50%, 0) scale(0.96) !important;
        transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      #audify-songchange-badge.audify-badge-show {
        opacity: 1 !important;
        transform: translate(-50%, 0) scale(1) !important;
        animation: audifyBadgeSpringIn 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      #audify-songchange-badge.leaving {
        animation: audifyBadgeSpringOut 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }

      @keyframes audifyBadgeSpringIn {
        0% {
          opacity: 0;
          transform: translate(-50%, -36px) scale(0.88);
        }
        55% {
          opacity: 1;
          transform: translate(-50%, 3px) scale(1.03);
        }
        80% {
          transform: translate(-50%, -1px) scale(0.99);
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
          transform: translate(-50%, -24px) scale(0.92);
        }
      }

      .audify-badge-led-ring {
        position: relative !important;
        width: 16px !important;
        height: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
      }

      .audify-badge-led-ring::before {
        content: '' !important;
        position: absolute !important;
        inset: -4px !important;
        border-radius: 50% !important;
        background: var(--badge-accent, #D4FF00) !important;
        opacity: 0.35 !important;
        filter: blur(4px) !important;
        animation: audifyLedHalo 1.4s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate !important;
      }

      .audify-badge-led {
        width: 9px !important;
        height: 9px !important;
        border-radius: 50% !important;
        background: var(--badge-accent, #D4FF00) !important;
        box-shadow: 0 0 10px var(--badge-accent, #D4FF00), 0 0 18px #D4FF00 !important;
        animation: audifyLedPulse 1.2s ease-in-out infinite alternate !important;
        flex-shrink: 0 !important;
      }

      @keyframes audifyLedPulse {
        0% { transform: scale(0.85); opacity: 0.75; }
        100% { transform: scale(1.22); opacity: 1; }
      }

      @keyframes audifyLedHalo {
        0% { transform: scale(0.8); opacity: 0.2; }
        100% { transform: scale(1.35); opacity: 0.55; }
      }

      .audify-badge-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        min-width: 0 !important;
      }

      .audify-badge-tag-row {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .audify-badge-accent {
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 10px !important;
        letter-spacing: 0.14em !important;
        text-transform: uppercase !important;
        color: var(--badge-accent, #D4FF00) !important;
        font-weight: 700 !important;
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
      }

      .audify-badge-pattern-pill {
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 9px !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.08) !important;
        padding: 1px 7px !important;
        border-radius: 9999px !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
      }

      .audify-badge-bpm-pill {
        font-family: var(--font-mono), monospace !important;
        font-size: 9px !important;
        letter-spacing: 0.06em !important;
        text-transform: uppercase !important;
        color: #D4FF00 !important;
        background: rgba(212, 255, 0, 0.12) !important;
        padding: 1px 6px !important;
        border-radius: 4px !important;
        border: 1px solid rgba(212, 255, 0, 0.28) !important;
        font-weight: 600 !important;
      }

      .audify-badge-title-text {
        font-family: var(--font-anton), 'Anton', 'Syne', sans-serif !important;
        font-size: 15px !important;
        font-weight: 500 !important;
        letter-spacing: 0.05em !important;
        color: #ffffff !important;
        line-height: 1.2 !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .audify-badge-artist-text {
        font-family: system-ui, -apple-system, sans-serif !important;
        font-size: 11px !important;
        color: rgba(255, 255, 255, 0.65) !important;
        letter-spacing: 0.02em !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      /* Responsive Mobile Adjustments */
      @media (max-width: 640px) {
        #audify-songchange-badge {
          top: 16px !important;
          padding: 8px 16px 8px 12px !important;
          gap: 10px !important;
        }
        .audify-badge-title-text {
          font-size: 13px !important;
        }
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
  let obsidianBorder = null;
  let inwardGlow = null;
  let cornerFlares = [];
  let cornerSparks = [];
  let shockwaveRing = null;
  let chromaticGlitch = null;

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
          <div class="audify-aurora-obsidian-border"></div>
          <div class="audify-aurora-inward-glow"></div>
          <div class="audify-aurora-beam audify-aurora-beam-top"></div>
          <div class="audify-aurora-beam audify-aurora-beam-right"></div>
          <div class="audify-aurora-beam audify-aurora-beam-bottom"></div>
          <div class="audify-aurora-beam audify-aurora-beam-left"></div>
          <div class="audify-neon-streak audify-neon-streak-top"></div>
          <div class="audify-neon-streak audify-neon-streak-right"></div>
          <div class="audify-neon-streak audify-neon-streak-bottom"></div>
          <div class="audify-neon-streak audify-neon-streak-left"></div>
          <div class="audify-corner-flare top-left"></div>
          <div class="audify-corner-flare top-right"></div>
          <div class="audify-corner-flare bottom-right"></div>
          <div class="audify-corner-flare bottom-left"></div>
          <!-- 4 Corner Strobe Sparks for Measure Drops -->
          <div class="audify-corner-spark spark-tl top-left">
            <div class="audify-spark-core"></div>
            <div class="audify-spark-trail-h"></div>
            <div class="audify-spark-trail-v"></div>
          </div>
          <div class="audify-corner-spark spark-tr top-right">
            <div class="audify-spark-core"></div>
            <div class="audify-spark-trail-h"></div>
            <div class="audify-spark-trail-v"></div>
          </div>
          <div class="audify-corner-spark spark-br bottom-right">
            <div class="audify-spark-core"></div>
            <div class="audify-spark-trail-h"></div>
            <div class="audify-spark-trail-v"></div>
          </div>
          <div class="audify-corner-spark spark-bl bottom-left">
            <div class="audify-spark-core"></div>
            <div class="audify-spark-trail-h"></div>
            <div class="audify-spark-trail-v"></div>
          </div>
        `;
        document.body.prepend(borderRoot);
      } else {
        // Upgrade existing borderRoot if missing obsidian border or streaks
        if (!borderRoot.querySelector('.audify-aurora-obsidian-border')) {
          const obs = document.createElement('div');
          obs.className = 'audify-aurora-obsidian-border';
          borderRoot.prepend(obs);
        }
        if (!borderRoot.querySelector('.audify-neon-streak')) {
          borderRoot.insertAdjacentHTML('beforeend', `
            <div class="audify-neon-streak audify-neon-streak-top"></div>
            <div class="audify-neon-streak audify-neon-streak-right"></div>
            <div class="audify-neon-streak audify-neon-streak-bottom"></div>
            <div class="audify-neon-streak audify-neon-streak-left"></div>
          `);
        }
        if (!borderRoot.querySelector('.audify-corner-spark')) {
          borderRoot.insertAdjacentHTML('beforeend', `
            <div class="audify-corner-spark spark-tl top-left">
              <div class="audify-spark-core"></div>
              <div class="audify-spark-trail-h"></div>
              <div class="audify-spark-trail-v"></div>
            </div>
            <div class="audify-corner-spark spark-tr top-right">
              <div class="audify-spark-core"></div>
              <div class="audify-spark-trail-h"></div>
              <div class="audify-spark-trail-v"></div>
            </div>
            <div class="audify-corner-spark spark-br bottom-right">
              <div class="audify-spark-core"></div>
              <div class="audify-spark-trail-h"></div>
              <div class="audify-spark-trail-v"></div>
            </div>
            <div class="audify-corner-spark spark-bl bottom-left">
              <div class="audify-spark-core"></div>
              <div class="audify-spark-trail-h"></div>
              <div class="audify-spark-trail-v"></div>
            </div>
          `);
        }
      }

      obsidianBorder = borderRoot.querySelector('.audify-aurora-obsidian-border');
      inwardGlow = borderRoot.querySelector('.audify-aurora-inward-glow') || borderRoot.querySelector('.audify-border-ambient');
      cornerFlares = Array.from(borderRoot.querySelectorAll('.audify-corner-flare'));
      cornerSparks = Array.from(borderRoot.querySelectorAll('.audify-corner-spark'));
      applyBorderPattern(currentPatternIndex);
    }

    // Full-Screen Expanding Shockwave Ring
    if (!shockwaveRing || !shockwaveRing.isConnected) {
      shockwaveRing = document.getElementById('audify-shockwave-ring');
      if (!shockwaveRing) {
        shockwaveRing = document.createElement('div');
        shockwaveRing.id = 'audify-shockwave-ring';
        shockwaveRing.setAttribute('aria-hidden', 'true');
        document.body.appendChild(shockwaveRing);
      }
    }

    // 280ms Chromatic RGB Displacement Glitch Container
    if (!chromaticGlitch || !chromaticGlitch.isConnected) {
      chromaticGlitch = document.getElementById('audify-chromatic-glitch');
      if (!chromaticGlitch) {
        chromaticGlitch = document.createElement('div');
        chromaticGlitch.id = 'audify-chromatic-glitch';
        chromaticGlitch.setAttribute('aria-hidden', 'true');
        document.body.appendChild(chromaticGlitch);
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
    borderRoot.style.setProperty('--aurora-primary', pattern.primaryColor);
    borderRoot.style.setProperty('--flare-c1', pattern.flare1);
    borderRoot.style.setProperty('--flare-c2', pattern.flare2);
    borderRoot.style.setProperty('--badge-accent', pattern.primaryColor);
    borderRoot.style.setProperty('--badge-glow', pattern.glowColor);
    borderRoot.style.setProperty('--shockwave-color', pattern.shockwaveColor);

    return pattern;
  }

  // -----------------------------------------------------------------------
  // 5. Measure Drop (Beat 1 of 4) 4-Corner Strobe Sparks
  // -----------------------------------------------------------------------
  function triggerMeasureDropSparks() {
    ensureBorderDOM();
    if (!borderRoot) return;

    borderRoot.classList.remove('audify-strobe-sparking');
    void borderRoot.offsetWidth; // Force re-flow to trigger animation
    borderRoot.classList.add('audify-strobe-sparking');

    setTimeout(() => {
      if (borderRoot) borderRoot.classList.remove('audify-strobe-sparking');
    }, 420);
  }

  // -----------------------------------------------------------------------
  // 6. 280ms Chromatic RGB Displacement Glitch Trigger
  // -----------------------------------------------------------------------
  function triggerChromaticGlitch() {
    ensureBorderDOM();
    if (!chromaticGlitch) return;

    chromaticGlitch.classList.remove('audify-glitch-active');
    void chromaticGlitch.offsetWidth;
    chromaticGlitch.classList.add('audify-glitch-active');

    setTimeout(() => {
      if (chromaticGlitch) chromaticGlitch.classList.remove('audify-glitch-active');
    }, 290);
  }

  // -----------------------------------------------------------------------
  // 7. Full-Screen Song Change FX (Shockwave + Glitch + Flash Aura)
  // -----------------------------------------------------------------------
  function triggerSongChangeFX(pattern) {
    ensureBorderDOM();

    // 1. Radial Expanding Shockwave with Chromatic Dispersion
    if (shockwaveRing) {
      shockwaveRing.style.setProperty('--shockwave-color', pattern.shockwaveColor || 'rgba(0, 240, 255, 0.95)');
      shockwaveRing.classList.remove('audify-shockwave-active');
      void shockwaveRing.offsetWidth;
      shockwaveRing.classList.add('audify-shockwave-active');
    }

    // 2. Fire 280ms Chromatic RGB Displacement Glitch
    triggerChromaticGlitch();

    // 3. Luminous Flash Aura (Decaying in 400ms)
    let flash = document.getElementById('audify-flash-aura-el');
    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'audify-flash-aura-el';
      flash.className = 'audify-flash-aura';
      document.body.appendChild(flash);
    }
    flash.style.setProperty('--flash-color-1', pattern.flashColor || 'rgba(212, 255, 0, 0.38)');
    flash.style.setProperty('--flash-color-2', pattern.glowColor || 'rgba(0, 240, 255, 0.25)');
    flash.style.animation = 'none';
    void flash.offsetWidth;
    flash.style.animation = '';
  }

  // -----------------------------------------------------------------------
  // 8. Ultra-High-Tier Glassmorphism Floating HUD Badge Toast
  // -----------------------------------------------------------------------
  function showSongChangeHUD(songInfo = {}, pattern) {
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

    const title = (typeof songInfo === 'string' ? songInfo : (songInfo?.title || 'NEXT TRACK')).trim();
    let artist = typeof songInfo === 'object' ? (songInfo.artist || '') : '';
    let bpm = typeof songInfo === 'object' ? (songInfo.bpm || '') : '';

    // If artist or BPM missing, introspect player or beat analyzer
    if (!artist || !bpm) {
      try {
        const live = window.__nauxEngine?.liveDeck?.();
        if (live?.track) {
          if (!artist && live.track.artist) artist = live.track.artist;
          if (!bpm && (live.track.bpm || live.cue?.bpm)) bpm = live.track.bpm || live.cue?.bpm;
        }
      } catch (_) {}
    }
    if (!bpm && window.__audify_beat_analyzer) {
      try {
        const beat = window.__audify_beat_analyzer.update(0, performance.now());
        if (beat && beat.bpm) bpm = Math.round(beat.bpm);
      } catch (_) {}
    }
    if (!bpm) bpm = 128;

    const activePattern = pattern || AURORA_PATTERNS[currentPatternIndex];
    const themeName = activePattern.tag || activePattern.name || 'PRISMATIC RGB';

    badge.classList.remove('leaving', 'audify-badge-show');
    badge.style.setProperty('--badge-accent', activePattern.primaryColor || '#D4FF00');
    badge.style.setProperty('--badge-glow', activePattern.glowColor || 'rgba(0, 240, 255, 0.35)');

    badge.innerHTML = `
      <div class="audify-badge-led-ring">
        <div class="audify-badge-led"></div>
      </div>
      <div class="audify-badge-content">
        <div class="audify-badge-tag-row">
          <span class="audify-badge-accent">NOW PLAYING</span>
          <span class="audify-badge-pattern-pill" id="audify-badge-pattern-el">${escapeHtml(themeName)}</span>
          <span class="audify-badge-bpm-pill" id="audify-badge-bpm-el">${escapeHtml(bpm)} BPM</span>
        </div>
        <div class="audify-badge-title-text" id="audify-badge-title-el">${escapeHtml(title)}</div>
        ${artist ? `<div class="audify-badge-artist-text" id="audify-badge-artist-el">${escapeHtml(artist)}</div>` : ''}
      </div>
    `;

    // Emil Kowalski Spring Entrance: trigger re-flow to re-run animation
    void badge.offsetWidth;
    badge.classList.add('audify-badge-show');

    // Dismiss after 3s (with smooth 380ms spring release cubic-bezier(0.16, 1, 0.3, 1))
    badgeTimeout = setTimeout(() => {
      if (badge && badge.isConnected) {
        badge.classList.add('leaving');
        setTimeout(() => {
          if (badge && badge.isConnected) {
            badge.classList.remove('audify-badge-show', 'leaving');
          }
        }, 380);
      }
    }, 2850);
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
  // 9. Audio-Reactive Beat Render Frame Hook (60/120 FPS Zero-GC Loop)
  // -----------------------------------------------------------------------
  let cachedStrokeColor = '';
  let cachedGlowSpread = -1;
  let cachedGlowColor = '';
  let cachedStreakOpacity = '';
  let cachedInwardSpread = -1;
  let cachedFlareScale = '';
  let cachedFlareOpacity = '';

  function onRenderFrame(beatPulse = 1.0, beatData = null) {
    if (!borderRoot || !borderRoot.isConnected) return;
    const activePattern = AURORA_PATTERNS[currentPatternIndex];

    const kickRatio = Math.min(1.0, Math.max(0, (beatPulse - 1.0) / 1.4));

    // 1. Dynamic 1px Obsidian Border Color Transition:
    // border-white/[0.08] -> #D4FF00 on kick strike -> active theme colors -> obsidian resting
    let strokeColor;
    if (kickRatio > 0.6) {
      strokeColor = '#D4FF00'; // Peak kick onset: electric lime
    } else if (kickRatio > 0.18) {
      strokeColor = activePattern.primaryColor; // Blooming into active theme color
    } else {
      strokeColor = 'rgba(255, 255, 255, 0.08)'; // Resting obsidian
    }

    // High-performance Zero-GC caching: only mutate DOM when style values actually change
    if (strokeColor !== cachedStrokeColor) {
      cachedStrokeColor = strokeColor;
      borderRoot.style.setProperty('--audify-border-stroke', strokeColor);
    }

    const glowSpread = Math.round(16 + kickRatio * 44);
    if (glowSpread !== cachedGlowSpread) {
      cachedGlowSpread = glowSpread;
      borderRoot.style.setProperty('--audify-border-glow-px', `${glowSpread}px`);
    }

    const glowColor = kickRatio > 0.4 ? '#D4FF00' : activePattern.glowColor;
    if (glowColor !== cachedGlowColor) {
      cachedGlowColor = glowColor;
      borderRoot.style.setProperty('--audify-border-glow-color', glowColor);
    }

    // Traveling Electric Neon Streak Opacity surge on beat
    const streakOpacity = Math.min(1.0, 0.32 + kickRatio * 0.68).toFixed(2);
    if (streakOpacity !== cachedStreakOpacity) {
      cachedStreakOpacity = streakOpacity;
      borderRoot.style.setProperty('--audify-streak-opacity', streakOpacity);
    }

    // Inward Edge Glow Box-Shadow Pulse
    if (inwardGlow) {
      const inwardSpread = Math.round(32 + kickRatio * 48);
      if (inwardSpread !== cachedInwardSpread) {
        cachedInwardSpread = inwardSpread;
        inwardGlow.style.boxShadow = `inset 0 0 ${inwardSpread}px ${activePattern.glowColor}, inset 0 0 ${Math.round(inwardSpread * 1.5)}px rgba(0, 0, 0, 0.45)`;
      }
    }

    // Corner Flares Dynamic Scale
    if (cornerFlares && cornerFlares.length) {
      const scale = (1.0 + kickRatio * 0.35).toFixed(3);
      const opacity = Math.min(1.0, 0.72 + kickRatio * 0.28).toFixed(3);
      if (scale !== cachedFlareScale || opacity !== cachedFlareOpacity) {
        cachedFlareScale = scale;
        cachedFlareOpacity = opacity;
        cornerFlares.forEach(el => {
          el.style.transform = `scale(${scale})`;
          el.style.opacity = opacity;
        });
      }
    }

    // Measure Drop (Beat 1 of 4) Detection & Strobe Sparks Trigger
    const now = performance.now();
    if (beatData) {
      const barPhase = beatData.barPhase || 0;
      const beatNumber = Math.floor(barPhase * 4.0); // 0, 1, 2, 3
      const isBeat1 = beatNumber === 0;
      const isMeasureOnset = (isBeat1 && beatData.rawKick > 0.45) || (beatData.barDropImpulse && beatData.barDropImpulse > 0.55);

      if (isMeasureOnset && (now - lastMeasureDropTime > 600)) {
        lastMeasureDropTime = now;
        triggerMeasureDropSparks();
      }
      lastBarPhase = barPhase;
    } else {
      // Fallback measure drop pulse
      if (beatPulse > 2.2 && (now - lastMeasureDropTime > 1500)) {
        lastMeasureDropTime = now;
        triggerMeasureDropSparks();
      }
    }
  }

  // -----------------------------------------------------------------------
  // 10. Public Integration APIs & Song Change Listener
  // -----------------------------------------------------------------------
  function onSongChange(songInfo = {}) {
    const nextIdx = (currentPatternIndex + 1) % AURORA_PATTERNS.length;
    const pattern = applyBorderPattern(nextIdx);

    // Trigger full-screen effects
    triggerSongChangeFX(pattern);

    // Display floating glassmorphism HUD toast
    showSongChangeHUD(songInfo, pattern);
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
    triggerChromaticGlitch,
    triggerMeasureDropSparks,
    showSongChangeHUD
  };

  window.setAudifyBorderPattern = function(idx) {
    return applyBorderPattern(idx);
  };
})();
