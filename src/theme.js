import { applyPublicAssetVariables } from './publicAssetUrls.js';

const FOUNDATIONS = {
  pageBg: '#FBFCF8',
  slate050: '#f8faf9',
  slate100: '#edf0ee',
  slate200: '#dbe0dc',
  slate300: '#c3c9c4',
  slate500: '#8c938d',
  slate700: '#59615c',
  slate900: '#191d1b',
  slate950: '#0f1210',
  violet500: '#736d96',
  blue500: '#325fff',
  blueA300: 'rgba(50, 95, 255, 0.34)',
};

const COLORS = {
  pageBg: FOUNDATIONS.pageBg,
  bg: FOUNDATIONS.slate200,
  bgSoft: FOUNDATIONS.slate100,
  paper: FOUNDATIONS.slate100,
  paperStrong: FOUNDATIONS.slate050,
  ink: FOUNDATIONS.slate900,
  inkSubhead: FOUNDATIONS.slate700,
  inkSoft: FOUNDATIONS.slate700,
  inkMuted: FOUNDATIONS.slate500,
  line: FOUNDATIONS.slate300,
  lineStrong: FOUNDATIONS.slate300,
  blue: FOUNDATIONS.blue500,
  onDark: FOUNDATIONS.slate050,
  buttonDarkTop: '#212622',
  buttonDarkBottom: '#111411',
  brandCodex: FOUNDATIONS.slate900,
  brandClaude: '#de7755',
  brandCursor: FOUNDATIONS.slate900,
  mediaBg: FOUNDATIONS.slate950,
  magnetCoral: '#ff3628',
  magnetAmber: '#ffbc00',
  magnetMint: '#00cf73',
  magnetBlue: '#0d4eff',
  magnetOrange: '#ff6d00',
  magnetViolet: '#6530ff',
  dividerGreen: '#00cf73',
  dividerRed: '#ff3628',
  magnetTextLight: '#fcfbf7',
  magnetTextDark: '#141715',
  magnetShadow: '#48372a',
  magnetShadowSoft: '#32271f',
  magnetSpecular: '#fffdf7',
  mask: '#000000',
};

export const MAGNET_COLORS = [
  mixHex(COLORS.magnetCoral, '#000000', 0.03),
  mixHex(COLORS.magnetAmber, '#000000', 0.03),
  mixHex(COLORS.magnetMint, '#000000', 0.03),
  mixHex(COLORS.magnetBlue, '#000000', 0.03),
  mixHex(COLORS.magnetOrange, '#000000', 0.03),
  mixHex(COLORS.magnetViolet, '#000000', 0.03),
];

export const EXAMPLE_TAB_COLORS = [
  COLORS.magnetOrange,
  COLORS.magnetViolet,
  COLORS.magnetMint,
  COLORS.magnetBlue,
];

export const SECTION_BREAK_COLORS = {
  orange: COLORS.magnetOrange,
  green: COLORS.dividerGreen,
  violet: COLORS.magnetViolet,
  blue: COLORS.magnetBlue,
  red: COLORS.dividerRed,
};

export const MAGNET_RENDER_THEME = {
  highlight: COLORS.magnetSpecular,
  shadow: COLORS.magnetShadow,
  shadowSoft: COLORS.magnetShadowSoft,
  textLight: COLORS.magnetTextLight,
  textDark: COLORS.magnetTextDark,
  mask: COLORS.mask,
};

export const LEVEL_CONTROL_STORAGE_KEY = 'eli5-scene-depth-controls-v3';
export const DEPTH_CONTROL_STORAGE_KEY = 'eli5-depth-token-controls-v4';

export const LEVEL_CONTROL_DEFAULTS = {
  sceneLevelStep: 1,
  sceneInsetDepth: 1,
  sceneSunStrength: 1,
  sceneSunSoftness: 1,
  sceneAmbientFill: 1,
  sceneShadowDensity: 1,
  sceneEdgeRelief: 1,
  sceneSurfaceContrast: 1,
  scenePaperNoise: 1,
  scenePaperNoiseScale: 1,
};

export const DEPTH_CONTROL_DEFAULTS = {
  depthInsetDropShadow: '0px 0.5px 1.2px rgba(50, 39, 31, 0.038)',
  depthInsetLightEdge: 'inset 0px -1px 0px rgba(255, 253, 247, 0.74), inset 0px -2px 3.2px rgba(248, 250, 249, 0.16)',
  depthInsetShadowEdge: 'inset 0px 1px 0px rgba(72, 55, 42, 0.26), inset 0px 2px 3.8px rgba(50, 39, 31, 0.12)',
  depthInsetLightGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.025) 56%, rgba(255, 255, 255, 0.12) 100%)',
  depth0DropShadow: '0px 3.499px 9.267px rgba(72, 55, 42, 0.002), 0px 12.546px 27.414px rgba(50, 39, 31, 0.004), 0px 29.952px 59.199px rgba(50, 39, 31, 0.002)',
  depth0LightEdge: 'inset 0px 0.8px 7.267px rgba(248, 250, 249, 0.028)',
  depth0ShadowEdge: 'inset 0px -3.2px 14.108px rgba(89, 97, 92, 0.024)',
  depth0LightGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 42%, rgba(255, 255, 255, 0) 100%)',
  depth1DropShadow: '0px 1px 2px rgba(72, 55, 42, 0.19), 0px 4px 8px rgba(50, 39, 31, 0.085), 0px 8px 16px rgba(50, 39, 31, 0.03)',
  depth1LightEdge: 'inset 0px 1px 0px rgba(255, 253, 247, 0.92), inset 0px 1.5px 2.6px rgba(248, 250, 249, 0.18)',
  depth1ShadowEdge: 'inset 0px -1px 0px rgba(72, 55, 42, 0.28), inset 0px -2px 4px rgba(50, 39, 31, 0.125)',
  depth1LightGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.055) 28%, rgba(255, 255, 255, 0) 100%)',
  depth2DropShadow: '0px 6.579px 29.27px rgba(72, 55, 42, 0.081), 0px 34.199px 101.624px rgba(50, 39, 31, 0.06), 0px 88.447px 233.919px rgba(50, 39, 31, 0.044)',
  depth2LightEdge: 'inset 0px 0.8px 10.163px rgba(248, 250, 249, 0.072)',
  depth2ShadowEdge: 'inset 0px -3.2px 18.613px rgba(89, 97, 92, 0.076)',
  depth2LightGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 34%, rgba(255, 255, 255, 0) 100%)',
  depth3DropShadow: '0px 7.627px 33.496px rgba(72, 55, 42, 0.085), 0px 38.678px 115.607px rgba(50, 39, 31, 0.065), 0px 100.03px 263.213px rgba(50, 39, 31, 0.047)',
  depth3LightEdge: 'inset 0px 0.8px 10.357px rgba(248, 250, 249, 0.072)',
  depth3ShadowEdge: 'inset 0px -3.2px 17.107px rgba(89, 97, 92, 0.076)',
  depth3LightGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.09) 32%, rgba(255, 255, 255, 0) 100%)',
};

const STATIC_THEME_VARS = {
  '--page-bg': COLORS.pageBg,
  '--slate-050': FOUNDATIONS.slate050,
  '--slate-100': FOUNDATIONS.slate100,
  '--slate-200': FOUNDATIONS.slate200,
  '--slate-300': FOUNDATIONS.slate300,
  '--slate-500': FOUNDATIONS.slate500,
  '--slate-700': FOUNDATIONS.slate700,
  '--slate-900': FOUNDATIONS.slate900,
  '--slate-950': FOUNDATIONS.slate950,
  '--violet-500': FOUNDATIONS.violet500,
  '--blue-500': FOUNDATIONS.blue500,
  '--blue-a300': FOUNDATIONS.blueA300,
  '--skill-pill-fill': rgba(COLORS.magnetViolet, 0.14),
  '--skill-pill-ink': COLORS.magnetViolet,
  '--external-claude-500': COLORS.brandClaude,
  '--magnet-coral': COLORS.magnetCoral,
  '--magnet-amber': COLORS.magnetAmber,
  '--magnet-mint': COLORS.magnetMint,
  '--magnet-blue': COLORS.magnetBlue,
  '--magnet-orange': COLORS.magnetOrange,
  '--magnet-violet': COLORS.magnetViolet,
  '--slate-surface': rgba(COLORS.paperStrong, 0.86),
  '--slate-gradient-100': 'linear-gradient(180deg, rgba(252, 252, 249, 1) 0%, rgba(241, 241, 236, 1) 100%)',
  '--slate-gradient-050': 'linear-gradient(180deg, rgba(247, 247, 243, 1) 0%, rgba(236, 236, 231, 0.98) 100%)',
  '--signal-gradient-violet': `linear-gradient(180deg, ${rgba(COLORS.magnetViolet, 0.24)} 0%, ${rgba(COLORS.magnetViolet, 0.12)} 100%)`,
  '--slate-gradient-900': 'linear-gradient(180deg, #242822 0%, #121511 100%)',
  '--signal-gradient-gold': COLORS.magnetAmber,
  '--slate-highlight': 'rgba(255, 255, 255, 0.52)',
  '--slate-gradient-200': `radial-gradient(circle at 16% 0%, ${rgba(mixHex(COLORS.paperStrong, COLORS.bg, 0.22), 0.2)} 0%, transparent 28%), radial-gradient(circle at 80% 12%, ${rgba(mixHex(COLORS.inkSoft, COLORS.paper, 0.84), 0.06)} 0%, transparent 28%), radial-gradient(circle at 50% 116%, ${rgba(mixHex(COLORS.mediaBg, COLORS.bg, 0.6), 0.06)} 0%, transparent 38%), linear-gradient(180deg, ${COLORS.paper} 0%, ${COLORS.bg} 100%)`,
  '--slate-gradient-300': `radial-gradient(circle at 20% 12%, rgba(255, 255, 255, 0.12) 0, transparent 22%), radial-gradient(circle at 78% 18%, ${rgba(mixHex(COLORS.bg, COLORS.mediaBg, 0.2), 0.035)} 0, transparent 28%)`,
  '--page-noise-image': "url('/assets/paper-noise.png')",
  '--page-vignette': 'inset 0 24px 100px rgba(255, 255, 255, 0.18), inset 0 -56px 136px rgba(16, 18, 16, 0.07)',
  '--slate-veil': 'rgba(93, 96, 89, 0.05)',
  '--slate-gradient-overlay': `radial-gradient(circle at 18% 10%, rgba(252, 252, 249, 0.2) 0%, transparent 34%), repeating-linear-gradient(0deg, rgba(16, 18, 16, 0.014) 0, rgba(16, 18, 16, 0.014) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(252, 252, 249, 0.04) 0, rgba(252, 252, 249, 0.04) 1px, transparent 1px, transparent 30px)`,
  '--slate-gradient-sheen': 'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.05) 38%)',
  '--headline-shadow': 'none',
  '--transparent': 'transparent',
};

const SCENE_LEVEL_BASES = {
  level0: 0,
  level1: 0.38,
  level2: 0.94,
  level3: 1.62,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return value.toFixed(3).replace(/\.?0+$/, '');
}

function formatPx(value) {
  return `${formatNumber(value)}px`;
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const resolved =
    normalized.length === 3
      ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
      : normalized;

  const parsed = Number.parseInt(resolved, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function mixHex(from, to, amount) {
  const mixAmount = clamp(amount, 0, 1);
  const start = hexToRgb(from);
  const end = hexToRgb(to);

  const next = {
    r: Math.round(start.r + (end.r - start.r) * mixAmount),
    g: Math.round(start.g + (end.g - start.g) * mixAmount),
    b: Math.round(start.b + (end.b - start.b) * mixAmount),
  };

  return `#${[next.r, next.g, next.b]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

function shiftHex(baseColor, delta, lightTarget = COLORS.paperStrong, darkTarget = COLORS.bg) {
  if (delta >= 0) {
    return mixHex(baseColor, lightTarget, delta);
  }

  return mixHex(baseColor, darkTarget, Math.abs(delta));
}

function rgba(hex, alpha) {
  const color = hexToRgb(hex);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${formatNumber(clamp(alpha, 0, 1))})`;
}

function buildLinearGradient({
  topColor,
  topAlpha = 1,
  topShift = 0,
  bottomColor,
  bottomAlpha = 1,
  bottomShift = 0,
  lightTarget = COLORS.paperStrong,
  darkTarget = COLORS.bg,
}) {
  return `linear-gradient(180deg, ${rgba(shiftHex(topColor, topShift, lightTarget, darkTarget), topAlpha)} 0%, ${rgba(shiftHex(bottomColor, bottomShift, lightTarget, darkTarget), bottomAlpha)} 100%)`;
}

function buildBoxShadow(layers) {
  const parts = layers.flatMap((layer) => {
    if (!layer || !Number.isFinite(layer.alpha) || layer.alpha <= 0.001) {
      return [];
    }

    const spread = Number.isFinite(layer.spread) ? ` ${formatPx(layer.spread)}` : '';

    return `${layer.inset ? 'inset ' : ''}${formatPx(layer.x ?? 0)} ${formatPx(layer.y ?? 0)} ${formatPx(layer.blur ?? 0)}${spread} ${rgba(layer.color, layer.alpha)}`;
  });

  return parts.join(', ') || 'none';
}

function scaleAroundUnit(value, factor, weight = 1) {
  return Math.max(0, value * (1 + (factor - 1) * weight));
}

export function getPageNoiseOpacity(levelControls = LEVEL_CONTROL_DEFAULTS) {
  const controls = sanitizeLevelControls(levelControls);
  return clamp(0.038 * controls.scenePaperNoise, 0, 0.12);
}

export function getPageNoiseSize(levelControls = LEVEL_CONTROL_DEFAULTS) {
  const controls = sanitizeLevelControls(levelControls);
  return clamp(controls.scenePaperNoiseScale * 400, 220, 640);
}

export function sanitizeLevelControls(controls = {}) {
  return {
    sceneLevelStep: clamp(getFiniteNumber(controls.sceneLevelStep, LEVEL_CONTROL_DEFAULTS.sceneLevelStep), 0, 2.4),
    sceneInsetDepth: clamp(getFiniteNumber(controls.sceneInsetDepth, LEVEL_CONTROL_DEFAULTS.sceneInsetDepth), 0, 2.4),
    sceneSunStrength: clamp(getFiniteNumber(controls.sceneSunStrength, LEVEL_CONTROL_DEFAULTS.sceneSunStrength), 0, 2.4),
    sceneSunSoftness: clamp(getFiniteNumber(controls.sceneSunSoftness, LEVEL_CONTROL_DEFAULTS.sceneSunSoftness), 0, 2.4),
    sceneAmbientFill: clamp(getFiniteNumber(controls.sceneAmbientFill, LEVEL_CONTROL_DEFAULTS.sceneAmbientFill), 0, 2.4),
    sceneShadowDensity: clamp(getFiniteNumber(controls.sceneShadowDensity, LEVEL_CONTROL_DEFAULTS.sceneShadowDensity), 0, 2.4),
    sceneEdgeRelief: clamp(getFiniteNumber(controls.sceneEdgeRelief, LEVEL_CONTROL_DEFAULTS.sceneEdgeRelief), 0, 2.4),
    sceneSurfaceContrast: clamp(getFiniteNumber(controls.sceneSurfaceContrast, LEVEL_CONTROL_DEFAULTS.sceneSurfaceContrast), 0, 2.4),
    scenePaperNoise: clamp(getFiniteNumber(controls.scenePaperNoise, LEVEL_CONTROL_DEFAULTS.scenePaperNoise), 0, 2.4),
    scenePaperNoiseScale: clamp(getFiniteNumber(controls.scenePaperNoiseScale, LEVEL_CONTROL_DEFAULTS.scenePaperNoiseScale), 0, 2.4),
  };
}

export function loadLevelControls() {
  if (typeof window === 'undefined') {
    return LEVEL_CONTROL_DEFAULTS;
  }

  try {
    const raw = window.localStorage.getItem(LEVEL_CONTROL_STORAGE_KEY);

    if (!raw) {
      return LEVEL_CONTROL_DEFAULTS;
    }

    return sanitizeLevelControls(JSON.parse(raw));
  } catch {
    return LEVEL_CONTROL_DEFAULTS;
  }
}

export function sanitizeDepthControls(controls = {}) {
  return Object.fromEntries(
    Object.entries(DEPTH_CONTROL_DEFAULTS).map(([key, fallback]) => {
      const value = controls[key];

      if (typeof value !== 'string') {
        return [key, fallback];
      }

      const trimmed = value.trim();
      return [key, trimmed || fallback];
    }),
  );
}

export function loadDepthControls() {
  if (typeof window === 'undefined') {
    return DEPTH_CONTROL_DEFAULTS;
  }

  try {
    const raw = window.localStorage.getItem(DEPTH_CONTROL_STORAGE_KEY);

    if (!raw) {
      return DEPTH_CONTROL_DEFAULTS;
    }

    return sanitizeDepthControls(JSON.parse(raw));
  } catch {
    return DEPTH_CONTROL_DEFAULTS;
  }
}

function buildSceneProfile(levelControls = LEVEL_CONTROL_DEFAULTS) {
  const controls = sanitizeLevelControls(levelControls);
  return {
    levelStep: scaleAroundUnit(1, controls.sceneLevelStep, 0.8),
    insetDepth: scaleAroundUnit(1, controls.sceneInsetDepth, 0.84),
    sunStrength: controls.sceneSunStrength,
    sunSoftness: controls.sceneSunSoftness,
    ambientFill: controls.sceneAmbientFill,
    shadowDensity: controls.sceneShadowDensity,
    edgeRelief: controls.sceneEdgeRelief,
    surfaceContrast: controls.sceneSurfaceContrast,
  };
}

export function getLevelControlFactors(levelControls = LEVEL_CONTROL_DEFAULTS, prefix) {
  const scene = buildSceneProfile(levelControls);
  const ambientShade = clamp(1.14 - (scene.ambientFill - 1) * 0.3, 0.55, 1.45);
  const sunSharpness = clamp(1.16 - (scene.sunSoftness - 1) * 0.26, 0.68, 1.4);
  const reliefBoost = clamp(0.92 + (scene.edgeRelief - 1) * 0.32, 0.55, 1.68);
  const surfaceContrast = clamp(
    scene.surfaceContrast * (1.04 - (scene.ambientFill - 1) * 0.08),
    0,
    2.8,
  );

  if (prefix === 'levelMinus1') {
    const recess = 0.9 * scene.insetDepth;

    return {
      amount: recess,
      elevation: -recess,
      recess,
      shadowStrength: clamp(
        scene.shadowDensity *
          ambientShade *
          (0.94 + (scene.sunStrength - 1) * 0.08 + (scene.insetDepth - 1) * 0.14),
        0,
        2.8,
      ),
      shadowSoftness: clamp(
        0.82 +
          (scene.sunSoftness - 1) * 0.24 +
          (scene.ambientFill - 1) * 0.16 +
          (scene.insetDepth - 1) * 0.18,
        0,
        2.8,
      ),
      lightStrength: clamp(
        scene.sunStrength * reliefBoost * (0.92 + (scene.insetDepth - 1) * 0.06),
        0,
        2.8,
      ),
      fillContrast: clamp(surfaceContrast * (0.94 + (scene.insetDepth - 1) * 0.12), 0, 2.8),
      contactFocus: clamp(
        sunSharpness * (1.02 + (scene.shadowDensity - 1) * 0.1),
        0.6,
        1.8,
      ),
      shadowFalloff: clamp(
        0.88 +
          (scene.sunSoftness - 1) * 0.22 +
          (scene.ambientFill - 1) * 0.14,
        0.6,
        2.4,
      ),
      contactEmphasis: clamp(
        (0.92 + (scene.shadowDensity - 1) * 0.18) * ambientShade,
        0.7,
        1.7,
      ),
      ambientEmphasis: clamp(
        0.74 + (scene.sunSoftness - 1) * 0.16 - (scene.ambientFill - 1) * 0.12,
        0.6,
        1.4,
      ),
      rimLightAlpha: clamp(
        0.16 * scene.sunStrength * reliefBoost * (0.9 + (scene.insetDepth - 1) * 0.12),
        0.04,
        0.34,
      ),
      rimShadowAlpha: clamp(
        0.19 * scene.shadowDensity * reliefBoost * ambientShade,
        0.06,
        0.38,
      ),
    };
  }

  if (prefix === 'level0') {
    return {
      amount: 0,
      elevation: 0,
      shadowStrength: clamp(0.2 * scene.shadowDensity * ambientShade, 0, 0.48),
      shadowSoftness: clamp(0.72 + (scene.ambientFill - 1) * 0.08 + (scene.sunSoftness - 1) * 0.06, 0, 1.2),
      lightStrength: clamp(scene.sunStrength * 0.72, 0, 2.8),
      fillContrast: clamp(surfaceContrast * 0.86, 0, 2.8),
      contactFocus: clamp(0.86 * sunSharpness, 0.5, 1.2),
      shadowFalloff: clamp(0.9 + (scene.ambientFill - 1) * 0.08, 0.6, 1.4),
      contactEmphasis: 0.18,
      ambientEmphasis: clamp(0.34 * ambientShade, 0.18, 0.6),
      rimLightAlpha: clamp(0.03 * scene.sunStrength * reliefBoost, 0.01, 0.08),
      rimShadowAlpha: clamp(0.026 * scene.shadowDensity * reliefBoost, 0.01, 0.07),
    };
  }

  const baseElevation = SCENE_LEVEL_BASES[prefix] ?? SCENE_LEVEL_BASES.level1;
  const elevation = baseElevation * scene.levelStep;
  const normalizedElevation = clamp(elevation / SCENE_LEVEL_BASES.level3, 0, 1);
  const proximity = 1 - normalizedElevation;

  return {
    amount: elevation,
    elevation,
    shadowStrength: clamp(
      scene.shadowDensity *
        ambientShade *
        (0.82 + proximity * 0.18 + elevation * 0.08 + (scene.sunStrength - 1) * 0.1),
      0,
      2.8,
    ),
    shadowSoftness: clamp(
      0.7 +
        elevation * (0.5 + (scene.sunSoftness - 1) * 0.08) +
        (scene.sunSoftness - 1) * 0.22 +
        (scene.ambientFill - 1) * 0.12,
      0,
      2.8,
    ),
    lightStrength: clamp(
      scene.sunStrength * reliefBoost * (0.92 + elevation * 0.1),
      0,
      2.8,
    ),
    fillContrast: clamp(
      surfaceContrast * (0.94 + elevation * 0.08),
      0,
      2.8,
    ),
    contactFocus: clamp(
      sunSharpness * (0.98 + proximity * 0.3 + (scene.sunStrength - 1) * 0.12),
      0.65,
      1.8,
    ),
    shadowFalloff: clamp(
      0.88 +
        elevation * 0.26 +
        (scene.sunSoftness - 1) * 0.26 +
        (scene.ambientFill - 1) * 0.14,
      0.6,
      2.4,
    ),
    contactEmphasis: clamp(
      (1.02 + proximity * 0.42 + (scene.sunStrength - 1) * 0.18) *
        ambientShade /
        (1 + (scene.sunSoftness - 1) * 0.18),
      0.65,
      1.8,
    ),
    ambientEmphasis: clamp(
      (0.64 + elevation * 0.42 + (scene.sunSoftness - 1) * 0.18) *
        ambientShade,
      0.6,
      2.1,
    ),
    rimLightAlpha: clamp(
      (0.056 + elevation * 0.024) * scene.sunStrength * reliefBoost,
      0.03,
      0.22,
    ),
    rimShadowAlpha: clamp(
      (0.052 + elevation * 0.022) * scene.shadowDensity * reliefBoost * ambientShade,
      0.03,
      0.2,
    ),
  };
}

const MODULE_COLORS = {
  neutralLight: COLORS.paperStrong,
  neutralSoft: COLORS.paper,
  neutralWarm: mixHex(COLORS.paper, COLORS.bg, 0.34),
  neutralDeep: mixHex(COLORS.bg, COLORS.magnetShadow, 0.22),
  highlight: COLORS.onDark,
  shadowWarm: COLORS.magnetShadow,
  shadowWarmSoft: COLORS.magnetShadowSoft,
  shadowCool: COLORS.inkSubhead,
  darkTop: COLORS.buttonDarkTop,
  darkBottom: COLORS.buttonDarkBottom,
  accentViolet: COLORS.magnetViolet,
  violetDeep: mixHex(COLORS.magnetViolet, COLORS.magnetShadow, 0.36),
  accentGoldTop: COLORS.magnetAmber,
  accentGoldBottom: COLORS.magnetAmber,
};

function buildModuleGradient(
  level,
  {
    topColor,
    bottomColor,
    topAlpha = 1,
    bottomAlpha = 1,
    topShiftWeight = 0.06,
    bottomShiftWeight = 0.06,
    lightTarget = COLORS.paperStrong,
    darkTarget = MODULE_COLORS.neutralDeep,
  },
) {
  const topShift =
    (level.lightStrength - 1) * topShiftWeight -
    (level.fillContrast - 1) * topShiftWeight * 0.45;
  const bottomShift =
    (level.lightStrength - 1) * bottomShiftWeight * 0.24 -
    (level.fillContrast - 1) * bottomShiftWeight;

  return buildLinearGradient({
    topColor,
    topAlpha,
    topShift,
    bottomColor,
    bottomAlpha,
    bottomShift,
    lightTarget,
    darkTarget,
  });
}

function buildSurfaceOverlay(level) {
  const sheenAlpha = clamp(0.24 * (0.8 + level.lightStrength * 0.2), 0, 0.36);
  const grainAlpha = clamp(0.02 * (0.8 + level.fillContrast * 0.2), 0, 0.05);
  const gridAlpha = clamp(0.05 * (0.7 + level.lightStrength * 0.3), 0, 0.08);

  return `radial-gradient(circle at 18% 10%, ${rgba(MODULE_COLORS.highlight, sheenAlpha)} 0%, transparent 34%), repeating-linear-gradient(0deg, ${rgba(MODULE_COLORS.shadowWarmSoft, grainAlpha)} 0, ${rgba(MODULE_COLORS.shadowWarmSoft, grainAlpha)} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, ${rgba(MODULE_COLORS.highlight, gridAlpha)} 0, ${rgba(MODULE_COLORS.highlight, gridAlpha)} 1px, transparent 1px, transparent 30px)`;
}

function buildRaisedShadow(
  level,
  {
    depth = 1,
    softness = 1,
    inset = true,
    contactY = 6,
    contactBlur = 18,
    contactAlpha = 0.08,
    ambientY = 16,
    ambientBlur = 34,
    ambientAlpha = 0.052,
    farY = 28,
    farBlur = 58,
    farAlpha = 0.036,
    insetTopY = 0.8,
    insetTopBlur = 8,
    insetTopAlpha = 0.08,
    insetBottomY = -3.2,
    insetBottomBlur = 14,
    insetBottomAlpha = 0.03,
    shadowColor = MODULE_COLORS.shadowWarm,
    ambientColor = MODULE_COLORS.shadowWarmSoft,
    rimShadowColor = MODULE_COLORS.shadowCool,
  } = {},
) {
  const elevation = Math.max(0, getFiniteNumber(level.elevation, level.amount));
  const contactFocus = getFiniteNumber(level.contactFocus, 1);
  const shadowFalloff = getFiniteNumber(level.shadowFalloff, 1);
  const contactEmphasis = getFiniteNumber(level.contactEmphasis, 1);
  const ambientEmphasis = getFiniteNumber(level.ambientEmphasis, 1);
  const blurScale = (1 + (level.shadowSoftness - 1) * 0.72) * softness;
  const contactLift = depth * clamp(0.54 + elevation * (0.44 + (shadowFalloff - 1) * 0.08), 0.38, 1.8);
  const ambientLift = depth * clamp(0.82 + elevation * (0.9 + (shadowFalloff - 1) * 0.26), 0.6, 3.1);
  const farLift = depth * clamp(1.04 + elevation * (1.18 + (shadowFalloff - 1) * 0.38), 0.8, 4.6);
  const contactBlurScale = clamp(
    (0.46 + elevation * 0.28 * shadowFalloff) / (0.92 + (contactFocus - 1) * 0.24),
    0.26,
    1.4,
  );
  const ambientBlurScale = clamp(0.74 + elevation * 0.46 * shadowFalloff, 0.62, 2.5);
  const farBlurScale = clamp(0.94 + elevation * 0.62 * shadowFalloff, 0.82, 3.2);
  const rimLightAlpha = clamp(
    getFiniteNumber(level.rimLightAlpha, insetTopAlpha * level.lightStrength),
    0,
    0.48,
  );
  const rimShadowAlpha = clamp(
    getFiniteNumber(level.rimShadowAlpha, insetBottomAlpha * Math.max(level.shadowStrength, level.fillContrast)),
    0,
    0.42,
  );

  return buildBoxShadow([
    {
      y: contactY * contactLift,
      blur: contactBlur * blurScale * contactBlurScale,
      color: shadowColor,
      alpha: contactAlpha * level.shadowStrength * contactEmphasis,
    },
    {
      y: ambientY * ambientLift,
      blur: ambientBlur * blurScale * ambientBlurScale,
      color: ambientColor,
      alpha: ambientAlpha * level.shadowStrength * ambientEmphasis,
    },
    {
      y: farY * farLift,
      blur: farBlur * blurScale * farBlurScale,
      color: ambientColor,
      alpha: farAlpha * level.shadowStrength * ambientEmphasis,
    },
    inset
      ? {
        inset: true,
        y: insetTopY,
        blur: insetTopBlur * clamp(0.56 + blurScale * 0.18, 0.56, 1.32),
        color: MODULE_COLORS.highlight,
        alpha: rimLightAlpha,
      }
      : null,
    inset
      ? {
        inset: true,
        y: insetBottomY,
        blur: insetBottomBlur * clamp(0.58 + blurScale * 0.22, 0.58, 1.48),
        color: rimShadowColor,
        alpha: rimShadowAlpha,
      }
      : null,
  ]);
}

function buildInsetShadow(level, { accent = MODULE_COLORS.shadowWarm } = {}) {
  const recess = Math.max(
    0.1,
    getFiniteNumber(level.recess, Math.abs(getFiniteNumber(level.elevation, level.amount))),
  );
  const softness = 0.82 + (level.shadowSoftness - 1) * 0.56;
  const contactFocus = getFiniteNumber(level.contactFocus, 1);
  const topShadowAlpha = clamp(
    getFiniteNumber(level.rimShadowAlpha, 0.18 * level.shadowStrength) *
      (0.96 + (contactFocus - 1) * 0.18),
    0,
    0.42,
  );
  const bottomLightAlpha = clamp(
    getFiniteNumber(level.rimLightAlpha, 0.16 * level.lightStrength),
    0,
    0.38,
  );
  return buildBoxShadow([
    { inset: true, y: 1.2 * recess, blur: 2.4 * softness, color: accent, alpha: topShadowAlpha },
    {
      inset: true,
      y: 3 * recess,
      blur: 8.8 * softness,
      color: MODULE_COLORS.shadowWarmSoft,
      alpha: clamp(topShadowAlpha * 0.54, 0, 0.28),
    },
    {
      inset: true,
      y: -1.35 * recess,
      blur: 2.2 * softness,
      color: MODULE_COLORS.highlight,
      alpha: clamp(bottomLightAlpha * 0.82, 0, 0.3),
    },
    { inset: true, y: -3 * recess, blur: 8.2 * softness, color: MODULE_COLORS.highlight, alpha: bottomLightAlpha },
  ]);
}

function buildCursorShadowFilter(level) {
  const elevation = Math.max(0, getFiniteNumber(level.elevation, level.amount));
  const shadowFalloff = getFiniteNumber(level.shadowFalloff, 1);
  const softness = 0.78 + elevation * 0.28 * shadowFalloff + (level.shadowSoftness - 1) * 0.22;
  const lift = 0.8 + elevation * (0.52 + (shadowFalloff - 1) * 0.18);
  const contactAlpha = clamp(0.26 * level.shadowStrength * (0.92 + (level.contactFocus - 1) * 0.18), 0.12, 0.48);
  const ambientAlpha = clamp(0.16 * level.shadowStrength, 0.08, 0.28);
  const farAlpha = clamp(0.08 * level.shadowStrength, 0.04, 0.16);

  return [
    `drop-shadow(0 ${formatPx(2.2 * lift)} ${formatPx(3.2 * softness)} ${rgba(MODULE_COLORS.shadowWarm, contactAlpha)})`,
    `drop-shadow(0 ${formatPx(6.2 * lift)} ${formatPx(10.8 * softness)} ${rgba(MODULE_COLORS.shadowWarmSoft, ambientAlpha)})`,
    `drop-shadow(0 ${formatPx(10.4 * lift)} ${formatPx(18.8 * softness)} ${rgba(MODULE_COLORS.shadowWarmSoft, farAlpha)})`,
  ].join(' ');
}

function buildScienceCardSurface(level) {
  const cardColor = shiftHex(COLORS.inkSubhead, (level.fillContrast - 1) * 0.05, COLORS.inkSoft, COLORS.bg);
  return rgba(cardColor, 0.055 * (0.8 + level.fillContrast * 0.2));
}

function buildModularGradients(levelMinus1, level0, level1, level2) {
  const surface = buildModuleGradient(level0, {
    topColor: MODULE_COLORS.neutralLight,
    bottomColor: MODULE_COLORS.neutralSoft,
    topAlpha: 1,
    bottomAlpha: 1,
    darkTarget: MODULE_COLORS.neutralDeep,
  });

  const floating = buildModuleGradient(level2, {
    topColor: mixHex(MODULE_COLORS.neutralLight, MODULE_COLORS.neutralSoft, 0.38),
    bottomColor: mixHex(MODULE_COLORS.neutralSoft, MODULE_COLORS.neutralWarm, 0.74),
    topAlpha: 1,
    bottomAlpha: 0.98,
    darkTarget: MODULE_COLORS.neutralDeep,
    topShiftWeight: 0.035,
    bottomShiftWeight: 0.04,
  });

  const dark = buildModuleGradient(level1, {
    topColor: MODULE_COLORS.darkTop,
    bottomColor: MODULE_COLORS.darkBottom,
    topAlpha: 1,
    bottomAlpha: 1,
    lightTarget: mixHex(COLORS.inkSubhead, COLORS.paperStrong, 0.16),
    darkTarget: mixHex(COLORS.buttonDarkBottom, COLORS.mask, 0.38),
    topShiftWeight: 0.04,
    bottomShiftWeight: 0.04,
  });

  const accentViolet = `linear-gradient(180deg, ${rgba(MODULE_COLORS.accentViolet, clamp(0.2 * (0.8 + levelMinus1.fillContrast * 0.2), 0.14, 0.3))} 0%, ${rgba(MODULE_COLORS.accentViolet, clamp(0.1 * (0.8 + levelMinus1.lightStrength * 0.2), 0.06, 0.2))} 100%)`;
  const accentGold = `linear-gradient(180deg, ${MODULE_COLORS.accentGoldTop} 0%, ${MODULE_COLORS.accentGoldBottom} 100%)`;

  return {
    surface,
    floating,
    dark,
    accentViolet,
    accentGold,
  };
}

function buildDepthShadowStack(...parts) {
  const shadowParts = parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part && part.toLowerCase() !== 'none');

  return shadowParts.join(', ') || 'none';
}

function buildDepthThemeVars(depthControls = DEPTH_CONTROL_DEFAULTS) {
  const controls = sanitizeDepthControls(depthControls);

  return {
    '--eli5-depth-inset-drop-shadow': controls.depthInsetDropShadow,
    '--eli5-depth-inset-light-edge': controls.depthInsetLightEdge,
    '--eli5-depth-inset-shadow-edge': controls.depthInsetShadowEdge,
    '--eli5-depth-inset-light-gradient': controls.depthInsetLightGradient,
    '--eli5-depth-inset-shadow-stack': buildDepthShadowStack(
      controls.depthInsetDropShadow,
      controls.depthInsetLightEdge,
      controls.depthInsetShadowEdge,
    ),
    '--eli5-depth-0-drop-shadow': controls.depth0DropShadow,
    '--eli5-depth-0-light-edge': controls.depth0LightEdge,
    '--eli5-depth-0-shadow-edge': controls.depth0ShadowEdge,
    '--eli5-depth-0-light-gradient': controls.depth0LightGradient,
    '--eli5-depth-0-shadow-stack': buildDepthShadowStack(
      controls.depth0DropShadow,
      controls.depth0LightEdge,
      controls.depth0ShadowEdge,
    ),
    '--eli5-depth-1-drop-shadow': controls.depth1DropShadow,
    '--eli5-depth-1-light-edge': controls.depth1LightEdge,
    '--eli5-depth-1-shadow-edge': controls.depth1ShadowEdge,
    '--eli5-depth-1-light-gradient': controls.depth1LightGradient,
    '--eli5-depth-1-shadow-stack': buildDepthShadowStack(
      controls.depth1DropShadow,
      controls.depth1LightEdge,
      controls.depth1ShadowEdge,
    ),
    '--eli5-depth-2-drop-shadow': controls.depth2DropShadow,
    '--eli5-depth-2-light-edge': controls.depth2LightEdge,
    '--eli5-depth-2-shadow-edge': controls.depth2ShadowEdge,
    '--eli5-depth-2-light-gradient': controls.depth2LightGradient,
    '--eli5-depth-2-shadow-stack': buildDepthShadowStack(
      controls.depth2DropShadow,
      controls.depth2LightEdge,
      controls.depth2ShadowEdge,
    ),
    '--eli5-depth-3-drop-shadow': controls.depth3DropShadow,
    '--eli5-depth-3-light-edge': controls.depth3LightEdge,
    '--eli5-depth-3-shadow-edge': controls.depth3ShadowEdge,
    '--eli5-depth-3-light-gradient': controls.depth3LightGradient,
    '--eli5-depth-3-shadow-stack': buildDepthShadowStack(
      controls.depth3DropShadow,
      controls.depth3LightEdge,
      controls.depth3ShadowEdge,
    ),
  };
}

function buildThemeVars(levelControls = LEVEL_CONTROL_DEFAULTS) {
  const controls = sanitizeLevelControls(levelControls);
  const levelMinus1 = getLevelControlFactors(controls, 'levelMinus1');
  const level0 = getLevelControlFactors(controls, 'level0');
  const level1 = getLevelControlFactors(controls, 'level1');
  const level2 = getLevelControlFactors(controls, 'level2');
  const level3 = getLevelControlFactors(controls, 'level3');
  const gradients = buildModularGradients(levelMinus1, level0, level1, level2);
  const cursorShadowFilter = buildCursorShadowFilter(level3);
  const cursorGlowColor = rgba(
    mixHex(MODULE_COLORS.highlight, COLORS.inkSoft, 0.24),
    clamp(0.16 * level3.lightStrength, 0.08, 0.22),
  );
  const shadowSurface = buildRaisedShadow(level0, {
    depth: 0.9,
    softness: 1.16,
    contactY: 7.2,
    contactBlur: 20,
    contactAlpha: 0.06,
    ambientY: 17,
    ambientBlur: 40,
    ambientAlpha: 0.04,
    farY: 32,
    farBlur: 68,
    farAlpha: 0.024,
    insetTopBlur: 10,
    insetTopAlpha: 0.06,
    insetBottomBlur: 18,
    insetBottomAlpha: 0.02,
  });
  const shadowRaised = buildRaisedShadow(level1, {
    depth: 0.68,
    softness: 0.92,
    contactY: 2.5,
    contactBlur: 7,
    contactAlpha: 0.14,
    ambientY: 7.2,
    ambientBlur: 18,
    ambientAlpha: 0.046,
    farY: 12.5,
    farBlur: 30,
    farAlpha: 0.018,
    insetTopBlur: 7,
    insetTopAlpha: 0.06,
    insetBottomBlur: 12,
    insetBottomAlpha: 0.022,
  });
  const shadowSoft = buildRaisedShadow(level1, {
    depth: 0.62,
    softness: 0.98,
    contactY: 2.3,
    contactBlur: 8,
    contactAlpha: 0.112,
    ambientY: 6.8,
    ambientBlur: 18,
    ambientAlpha: 0.04,
    farY: 11.5,
    farBlur: 28,
    farAlpha: 0.016,
    insetTopBlur: 8,
    insetTopAlpha: 0.07,
    insetBottomBlur: 14,
    insetBottomAlpha: 0.02,
  });
  const shadowDivider = buildRaisedShadow(level3, {
    depth: 0.78,
    softness: 0.82,
    contactY: 2.6,
    contactBlur: 8,
    contactAlpha: 0.078,
    ambientY: 7.6,
    ambientBlur: 18,
    ambientAlpha: 0.038,
    farY: 14,
    farBlur: 30,
    farAlpha: 0.02,
    insetTopBlur: 7,
    insetTopAlpha: 0.054,
    insetBottomBlur: 12,
    insetBottomAlpha: 0.02,
  });
  const shadowTab = buildRaisedShadow(level1, {
    depth: 0.64,
    softness: 0.98,
    contactY: 2.4,
    contactBlur: 8,
    contactAlpha: 0.11,
    ambientY: 6.9,
    ambientBlur: 18,
    ambientAlpha: 0.042,
    farY: 11.8,
    farBlur: 28,
    farAlpha: 0.016,
    insetTopBlur: 8,
    insetTopAlpha: 0.06,
    insetBottomBlur: 12,
    insetBottomAlpha: 0.02,
  });
  const shadowTabActive = buildRaisedShadow(level1, {
    depth: 0.72,
    softness: 0.94,
    contactY: 2.6,
    contactBlur: 8.5,
    contactAlpha: 0.122,
    ambientY: 7.4,
    ambientBlur: 20,
    ambientAlpha: 0.046,
    farY: 12.4,
    farBlur: 30,
    farAlpha: 0.018,
    insetTopBlur: 8,
    insetTopAlpha: 0.07,
    insetBottomBlur: 12,
    insetBottomAlpha: 0.022,
  });
  const shadowInsetWarm = buildInsetShadow(levelMinus1, { accent: MODULE_COLORS.shadowWarm });
  const shadowInsetViolet = buildInsetShadow(levelMinus1, { accent: MODULE_COLORS.violetDeep });
  const shadowFloating = buildRaisedShadow(level2, {
    depth: 1.12,
    softness: 1.42,
    contactY: 6.1,
    contactBlur: 24,
    contactAlpha: 0.054,
    ambientY: 18,
    ambientBlur: 52,
    ambientAlpha: 0.046,
    farY: 36,
    farBlur: 92,
    farAlpha: 0.034,
    insetTopBlur: 12,
    insetTopAlpha: 0.035,
    insetBottomBlur: 20,
    insetBottomAlpha: 0.012,
  });
  const shadowPanel = buildRaisedShadow(level2, {
    depth: 1.08,
    softness: 1.42,
    inset: false,
    contactY: 7,
    contactBlur: 24,
    contactAlpha: 0.06,
    ambientY: 18,
    ambientBlur: 48,
    ambientAlpha: 0.05,
    farY: 36,
    farBlur: 82,
    farAlpha: 0.038,
  });
  const shadowMedia = buildRaisedShadow(level1, {
    depth: 0.86,
    softness: 1.18,
    inset: false,
    contactY: 5.6,
    contactBlur: 18,
    contactAlpha: 0.06,
    ambientY: 13.5,
    ambientBlur: 32,
    ambientAlpha: 0.044,
    farY: 24,
    farBlur: 54,
    farAlpha: 0.03,
  });
  const shadowHeader = buildRaisedShadow(level2, {
    depth: 1.2,
    softness: 1.5,
    contactY: 6.6,
    contactBlur: 26,
    contactAlpha: 0.056,
    ambientY: 19,
    ambientBlur: 56,
    ambientAlpha: 0.05,
    farY: 38,
    farBlur: 98,
    farAlpha: 0.036,
    insetTopBlur: 12,
    insetTopAlpha: 0.03,
    insetBottomBlur: 18,
    insetBottomAlpha: 0.01,
  });
  const shadowInstallArt = `drop-shadow(0 ${formatPx(14 * scaleAroundUnit(1, level1.amount, 0.74))} ${formatPx(18 * (1 + (level1.shadowSoftness - 1) * 0.6))} ${rgba(MODULE_COLORS.shadowWarm, 0.14 * level1.shadowStrength)})`;
  const mediaSummaryIconHighlight = rgba(MODULE_COLORS.highlight, 0.52);
  const mediaSummaryIconSurface = rgba(MODULE_COLORS.neutralLight, 0.86);
  const pageNoiseOpacity = getPageNoiseOpacity(controls);
  const pageNoiseSize = getPageNoiseSize(controls);
  return {
    '--slate-gradient-100': gradients.surface,
    '--slate-gradient-050': gradients.floating,
    '--signal-gradient-violet': gradients.accentViolet,
    '--slate-gradient-900': gradients.dark,
    '--slate-gradient-overlay': buildSurfaceOverlay(level0),
    '--shadow-surface': shadowSurface,
    '--slate-veil': buildScienceCardSurface(level0),
    '--shadow-button': shadowRaised,
    '--shadow-button-soft': shadowSoft,
    '--shadow-divider': shadowDivider,
    '--shadow-tab': shadowTab,
    '--shadow-tab-active': shadowTabActive,
    '--shadow-media': shadowMedia,
    '--shadow-install-art': shadowInstallArt,
    '--shadow-floating-ui': shadowFloating,
    '--shadow-panel': shadowPanel,
    '--shadow-header': shadowHeader,
    '--shadow-hero-badge': shadowInsetWarm,
    '--shadow-prompt-shell': shadowInsetWarm,
    '--shadow-prompt-skill': shadowInsetViolet,
    '--shadow-pill-inset': shadowInsetWarm,
    '--signal-gradient-gold': gradients.accentGold,
    '--slate-surface': mediaSummaryIconSurface,
    '--slate-highlight': mediaSummaryIconHighlight,
    '--page-noise-opacity': formatNumber(pageNoiseOpacity),
    '--page-noise-size': formatPx(pageNoiseSize),
    '--cursor-shadow-filter': cursorShadowFilter,
    '--cursor-glow-color': cursorGlowColor,
  };
}

export function applyThemeTokens(
  root = typeof document !== 'undefined' ? document.documentElement : null,
  {
    levelControls = LEVEL_CONTROL_DEFAULTS,
    depthControls = DEPTH_CONTROL_DEFAULTS,
  } = {},
) {
  if (!root) {
    return;
  }

  const themeVars = {
    ...STATIC_THEME_VARS,
    ...buildThemeVars(levelControls),
    ...buildDepthThemeVars(depthControls),
  };

  Object.entries(themeVars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  applyPublicAssetVariables(root);

  const themeMeta = root.ownerDocument.querySelector('meta[name="theme-color"]');

  if (themeMeta) {
    themeMeta.setAttribute('content', COLORS.bgSoft);
  }
}
