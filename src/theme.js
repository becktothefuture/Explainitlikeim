const COLORS = {
  bg: '#e9dece',
  bgSoft: '#f6eddc',
  paper: '#f6eddc',
  paperStrong: '#fff7ec',
  ink: '#182335',
  inkSubhead: '#314255',
  inkSoft: '#4d5d70',
  inkQuiet: 'rgba(24, 35, 53, 0.6)',
  inkMuted: 'rgba(24, 35, 53, 0.34)',
  line: 'rgba(24, 35, 53, 0.14)',
  lineStrong: 'rgba(24, 35, 53, 0.24)',
  blue: '#3a62ff',
  focus: 'rgba(58, 98, 255, 0.38)',
  onDark: '#fffdf8',
  buttonDarkTop: '#28364b',
  buttonDarkBottom: '#17222f',
  brandCodex: '#0f1826',
  brandClaude: '#de7755',
  brandCursor: '#0f1826',
  mediaBg: '#1d140f',
  magnetCoral: '#ff6e5e',
  magnetAmber: '#ffc239',
  magnetMint: '#29d98d',
  magnetBlue: '#3e76ff',
  magnetOrange: '#ff9642',
  magnetViolet: '#8c69ff',
  dividerGreen: '#29d98d',
  dividerRed: '#ff6e5e',
  promptVioletText: '#5b38a2',
  magnetTextLight: '#fffaf7',
  magnetTextDark: '#14202d',
  magnetShadow: '#5a3c21',
  magnetShadowSoft: '#3f2a15',
  magnetSpecular: '#fffdf7',
  mask: '#000000',
};

const WARM_TONES = {
  line: '#756043',
  accent: '#866530',
};

export const MAGNET_COLORS = [
  mixHex(COLORS.magnetCoral, '#000000', 0.1),
  mixHex(COLORS.magnetAmber, '#000000', 0.1),
  mixHex(COLORS.magnetMint, '#000000', 0.1),
  mixHex(COLORS.magnetBlue, '#000000', 0.1),
  mixHex(COLORS.magnetOrange, '#000000', 0.1),
  mixHex(COLORS.magnetViolet, '#000000', 0.1),
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

export const LEVEL_CONTROL_STORAGE_KEY = 'eli5-surface-level-controls-v1';

export const LEVEL_CONTROL_DEFAULTS = {
  levelMinus1Amount: 1,
  level0Amount: 1,
  level1Amount: 1,
  level2Amount: 1,
  level3Amount: 1,
  responseShadowStrength: 1,
  responseShadowSoftness: 1,
  responseLightStrength: 1,
  responseFillContrast: 1,
  levelMinus1ShadowTrim: 0,
  levelMinus1LightTrim: 0,
  levelMinus1FillTrim: 0,
  level0ShadowTrim: 0,
  level0LightTrim: 0,
  level0FillTrim: 0,
  level1ShadowTrim: 0,
  level1LightTrim: 0,
  level1FillTrim: 0,
  level2ShadowTrim: 0,
  level2LightTrim: 0,
  level2FillTrim: 0,
  level3ShadowTrim: 0,
  level3LightTrim: 0,
  level3FillTrim: 0,
};

const STATIC_THEME_VARS = {
  '--bg': COLORS.bg,
  '--bg-soft': 'var(--paper)',
  '--paper': COLORS.paper,
  '--paper-strong': COLORS.paperStrong,
  '--ink': COLORS.ink,
  '--ink-subhead': COLORS.inkSubhead,
  '--ink-soft': COLORS.inkSoft,
  '--ink-quiet': COLORS.inkQuiet,
  '--ink-muted': COLORS.inkMuted,
  '--line': COLORS.line,
  '--line-strong': COLORS.lineStrong,
  '--blue': COLORS.blue,
  '--focus-ring': COLORS.focus,
  '--on-dark': COLORS.onDark,
  '--brand-codex': COLORS.brandCodex,
  '--brand-claude': COLORS.brandClaude,
  '--brand-cursor': COLORS.brandCursor,
  '--media-bg': COLORS.mediaBg,
  '--magnet-coral': COLORS.magnetCoral,
  '--magnet-amber': COLORS.magnetAmber,
  '--magnet-mint': COLORS.magnetMint,
  '--magnet-blue': COLORS.magnetBlue,
  '--magnet-orange': COLORS.magnetOrange,
  '--magnet-violet': COLORS.magnetViolet,
  '--prompt-violet-text': COLORS.promptVioletText,
  '--surface-border': rgba(COLORS.paperStrong, 0.76),
  '--surface-border-strong': 'var(--surface-border)',
  '--header-border': rgba(WARM_TONES.line, 0.12),
  '--panel-border': 'var(--surface-border)',
  '--floating-border': 'var(--line)',
  '--soft-border': 'var(--line)',
  '--button-secondary-border': rgba(WARM_TONES.line, 0.18),
  '--button-support-border': rgba(WARM_TONES.line, 0.14),
  '--badge-border': rgba(WARM_TONES.accent, 0.18),
  '--prompt-border': 'var(--badge-border)',
  '--prompt-skill-border': 'var(--badge-border)',
  '--coffee-ink': COLORS.ink,
  '--coffee-border': COLORS.line,
  '--gradient-card': 'linear-gradient(180deg, rgba(255, 253, 249, 0.76), rgba(245, 236, 223, 0.54)), rgba(255, 249, 241, 0.72)',
  '--gradient-warm': 'linear-gradient(180deg, rgba(255, 252, 245, 0.94), rgba(241, 228, 205, 0.86))',
  '--gradient-floating': 'linear-gradient(180deg, rgba(255, 253, 249, 0.98), rgba(246, 236, 220, 0.94))',
  '--gradient-control-window': 'linear-gradient(180deg, rgba(255, 253, 249, 0.98), rgba(246, 236, 220, 0.94))',
  '--gradient-violet-accent': 'linear-gradient(180deg, rgba(140, 105, 255, 0.2), rgba(140, 105, 255, 0.1))',
  '--gradient-action-dark': 'linear-gradient(180deg, #28364b 0%, #17222f 100%)',
  '--coffee-gradient': COLORS.magnetAmber,
  '--coffee-shadow': '0 6px 0 rgba(100, 69, 30, 0.1), 0 16px 18px rgba(73, 53, 28, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(185, 151, 0, 0.22)',
  '--media-summary-border': 'var(--badge-border)',
  '--media-summary-action-border': 'var(--badge-border)',
  '--media-summary-icon-surface': rgba(COLORS.paperStrong, 0.86),
  '--media-summary-icon-highlight': 'rgba(255, 255, 255, 0.52)',
  '--media-summary-action-surface': 'var(--media-summary-icon-surface)',
  '--media-summary-action-shadow': '0 10px 20px rgba(76, 57, 29, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  '--example-chevron-surface': 'var(--media-summary-icon-surface)',
  '--science-source-meta': 'rgba(36, 48, 66, 0.58)',
  '--science-source-meta-strong': 'var(--science-source-meta)',
  '--page-gradient': `radial-gradient(circle at 14% 0%, rgba(255, 190, 104, 0.28), transparent 26%), radial-gradient(circle at 82% 8%, rgba(110, 160, 255, 0.14), transparent 30%), radial-gradient(circle at 50% 116%, rgba(103, 73, 39, 0.11), transparent 38%), linear-gradient(180deg, ${COLORS.paper} 0%, ${COLORS.bg} 100%)`,
  '--page-grid-gradient': `radial-gradient(circle at 20% 12%, rgba(255, 255, 255, 0.2) 0, transparent 22%), radial-gradient(circle at 78% 18%, rgba(115, 82, 40, 0.05) 0, transparent 28%), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(98, 77, 47, 0.015) 0, rgba(98, 77, 47, 0.015) 1px, transparent 1px, transparent 32px)`,
  '--page-vignette': 'inset 0 24px 100px rgba(255, 250, 242, 0.28), inset 0 -56px 136px rgba(100, 71, 36, 0.1)',
  '--tab-sheen-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.05) 38%)',
  '--separator-color': 'var(--ink-muted)',
  '--headline-shadow': 'none',
  '--brand-shadow': '0 -1px 0 rgba(255, 251, 243, 0.84), 0 1px 0 rgba(120, 90, 52, 0.1)',
  '--transparent': 'transparent',
};

const LEVEL_PREFIXES = ['levelMinus1', 'level0', 'level1', 'level2', 'level3'];

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

export function sanitizeLevelControls(controls = {}) {
  const next = {
    responseShadowStrength: clamp(getFiniteNumber(controls.responseShadowStrength, LEVEL_CONTROL_DEFAULTS.responseShadowStrength), 0, 2.4),
    responseShadowSoftness: clamp(getFiniteNumber(controls.responseShadowSoftness, LEVEL_CONTROL_DEFAULTS.responseShadowSoftness), 0, 2.4),
    responseLightStrength: clamp(getFiniteNumber(controls.responseLightStrength, LEVEL_CONTROL_DEFAULTS.responseLightStrength), 0, 2.4),
    responseFillContrast: clamp(getFiniteNumber(controls.responseFillContrast, LEVEL_CONTROL_DEFAULTS.responseFillContrast), 0, 2.4),
  };

  LEVEL_PREFIXES.forEach((prefix) => {
    next[`${prefix}Amount`] = clamp(getFiniteNumber(controls[`${prefix}Amount`], LEVEL_CONTROL_DEFAULTS[`${prefix}Amount`]), 0, 2.4);
    next[`${prefix}ShadowTrim`] = clamp(getFiniteNumber(controls[`${prefix}ShadowTrim`], LEVEL_CONTROL_DEFAULTS[`${prefix}ShadowTrim`]), -0.75, 0.75);
    next[`${prefix}LightTrim`] = clamp(getFiniteNumber(controls[`${prefix}LightTrim`], LEVEL_CONTROL_DEFAULTS[`${prefix}LightTrim`]), -0.75, 0.75);
    next[`${prefix}FillTrim`] = clamp(getFiniteNumber(controls[`${prefix}FillTrim`], LEVEL_CONTROL_DEFAULTS[`${prefix}FillTrim`]), -0.75, 0.75);
  });

  return next;
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

export function getLevelControlFactors(levelControls = LEVEL_CONTROL_DEFAULTS, prefix) {
  const controls = sanitizeLevelControls(levelControls);
  const amount = controls[`${prefix}Amount`] ?? LEVEL_CONTROL_DEFAULTS[`${prefix}Amount`];
  const shadowTrim = controls[`${prefix}ShadowTrim`] ?? 0;
  const lightTrim = controls[`${prefix}LightTrim`] ?? 0;
  const fillTrim = controls[`${prefix}FillTrim`] ?? 0;

  return {
    amount,
    shadowStrength: clamp(amount * controls.responseShadowStrength + shadowTrim, 0, 2.8),
    shadowSoftness: clamp(amount * controls.responseShadowSoftness + shadowTrim * 0.35, 0, 2.8),
    lightStrength: clamp(amount * controls.responseLightStrength + lightTrim, 0, 2.8),
    fillContrast: clamp(amount * controls.responseFillContrast + fillTrim, 0, 2.8),
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
  const lift = scaleAroundUnit(1, level.amount, 0.72) * depth;
  const blurScale = (1 + (level.shadowSoftness - 1) * 0.78) * softness;

  return buildBoxShadow([
    {
      y: contactY * lift,
      blur: contactBlur * blurScale,
      color: shadowColor,
      alpha: contactAlpha * level.shadowStrength,
    },
    {
      y: ambientY * lift,
      blur: ambientBlur * blurScale,
      color: ambientColor,
      alpha: ambientAlpha * level.shadowStrength,
    },
    {
      y: farY * lift,
      blur: farBlur * blurScale,
      color: ambientColor,
      alpha: farAlpha * level.shadowStrength,
    },
    inset
      ? {
        inset: true,
        y: insetTopY,
        blur: insetTopBlur * blurScale,
        color: MODULE_COLORS.highlight,
        alpha: insetTopAlpha * level.lightStrength,
      }
      : null,
    inset
      ? {
        inset: true,
        y: insetBottomY,
        blur: insetBottomBlur * blurScale,
        color: rimShadowColor,
        alpha: insetBottomAlpha * Math.max(level.shadowStrength, level.fillContrast),
      }
      : null,
  ]);
}

function buildInsetShadow(level, { accent = MODULE_COLORS.shadowWarm } = {}) {
  const recess = scaleAroundUnit(1, level.amount, 0.42);
  const softness = 1 + (level.shadowSoftness - 1) * 0.72;
  const rimAlpha = 0.14 * level.shadowStrength;
  const lightAlpha = 0.34 * level.lightStrength;
  return buildBoxShadow([
    { inset: true, y: -1.6 * recess, blur: 8 * softness, color: accent, alpha: rimAlpha },
    { inset: true, y: 2 * recess, blur: 10 * softness, color: MODULE_COLORS.highlight, alpha: lightAlpha },
  ]);
}

function buildFloatingSurface(level, strong = false) {
  const base = strong
    ? MODULE_COLORS.highlight
    : mixHex(COLORS.paperStrong, MODULE_COLORS.neutralSoft, 0.18);
  const shifted = shiftHex(
    base,
    (level.lightStrength - 1) * 0.04 - (level.fillContrast - 1) * 0.03,
    COLORS.paperStrong,
    MODULE_COLORS.neutralWarm,
  );
  return rgba(shifted, 0.86);
}

function buildScienceCardSurface(level) {
  const cardColor = shiftHex(COLORS.inkSubhead, (level.fillContrast - 1) * 0.05, COLORS.inkSoft, COLORS.bg);
  return rgba(cardColor, 0.055 * (0.8 + level.fillContrast * 0.2));
}

function buildModularGradients(levelMinus1, level0, level1, level2) {
  const sharedSurface = buildModuleGradient(level0, {
    topColor: MODULE_COLORS.neutralLight,
    bottomColor: MODULE_COLORS.neutralSoft,
    topAlpha: 1,
    bottomAlpha: 1,
    darkTarget: MODULE_COLORS.neutralDeep,
  });

  const sharedCard = buildModuleGradient(level1, {
    topColor: mixHex(MODULE_COLORS.neutralLight, MODULE_COLORS.neutralSoft, 0.22),
    bottomColor: mixHex(MODULE_COLORS.neutralSoft, MODULE_COLORS.neutralWarm, 0.52),
    topAlpha: 1,
    bottomAlpha: 1,
    darkTarget: MODULE_COLORS.neutralDeep,
    topShiftWeight: 0.04,
    bottomShiftWeight: 0.05,
  });

  const floatingShell = buildModuleGradient(level2, {
    topColor: mixHex(MODULE_COLORS.neutralLight, MODULE_COLORS.neutralSoft, 0.38),
    bottomColor: mixHex(MODULE_COLORS.neutralSoft, MODULE_COLORS.neutralWarm, 0.74),
    topAlpha: 1,
    bottomAlpha: 0.98,
    darkTarget: MODULE_COLORS.neutralDeep,
    topShiftWeight: 0.035,
    bottomShiftWeight: 0.04,
  });

  const sharedWarm = buildModuleGradient(levelMinus1, {
    topColor: MODULE_COLORS.neutralSoft,
    bottomColor: MODULE_COLORS.neutralWarm,
    topAlpha: 1,
    bottomAlpha: 1,
    darkTarget: MODULE_COLORS.neutralDeep,
  });

  const darkAction = buildModuleGradient(level1, {
    topColor: MODULE_COLORS.darkTop,
    bottomColor: MODULE_COLORS.darkBottom,
    topAlpha: 1,
    bottomAlpha: 1,
    lightTarget: mixHex(COLORS.inkSubhead, COLORS.paperStrong, 0.16),
    darkTarget: mixHex(COLORS.buttonDarkBottom, COLORS.mask, 0.38),
    topShiftWeight: 0.04,
    bottomShiftWeight: 0.04,
  });

  const violetAccent = `linear-gradient(180deg, ${rgba(MODULE_COLORS.accentViolet, clamp(0.2 * (0.8 + levelMinus1.fillContrast * 0.2), 0.14, 0.3))} 0%, ${rgba(MODULE_COLORS.accentViolet, clamp(0.1 * (0.8 + levelMinus1.lightStrength * 0.2), 0.06, 0.2))} 100%)`;
  const goldAccent = `linear-gradient(180deg, ${MODULE_COLORS.accentGoldTop} 0%, ${MODULE_COLORS.accentGoldBottom} 100%)`;

  const controlWindow = `radial-gradient(circle at top right, ${rgba(COLORS.blue, 0.14)} 0%, transparent 26%), radial-gradient(circle at top left, ${rgba(COLORS.magnetOrange, 0.14)} 0%, transparent 26%), ${buildModuleGradient(level2, {
    topColor: MODULE_COLORS.neutralLight,
    bottomColor: MODULE_COLORS.neutralWarm,
    topAlpha: 1,
    bottomAlpha: 1,
  })}`;

  return {
    sharedSurface,
    sharedCard,
    floatingShell,
    sharedWarm,
    darkAction,
    violetAccent,
    goldAccent,
    controlWindow,
  };
}

function buildThemeVars(levelControls = LEVEL_CONTROL_DEFAULTS) {
  const controls = sanitizeLevelControls(levelControls);
  const levelMinus1 = getLevelControlFactors(controls, 'levelMinus1');
  const level0 = getLevelControlFactors(controls, 'level0');
  const level1 = getLevelControlFactors(controls, 'level1');
  const level2 = getLevelControlFactors(controls, 'level2');
  const gradients = buildModularGradients(levelMinus1, level0, level1, level2);
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
  const shadowDivider = buildRaisedShadow(level1, {
    depth: 0.54,
    softness: 0.94,
    contactY: 1.9,
    contactBlur: 6,
    contactAlpha: 0.08,
    ambientY: 5.2,
    ambientBlur: 14,
    ambientAlpha: 0.026,
    farY: 9,
    farBlur: 22,
    farAlpha: 0.012,
    insetTopBlur: 6,
    insetTopAlpha: 0.04,
    insetBottomBlur: 10,
    insetBottomAlpha: 0.016,
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
  const coffeeShadow = buildRaisedShadow(level1, {
    depth: 0.64,
    softness: 0.94,
    contactY: 2.5,
    contactBlur: 7.5,
    contactAlpha: 0.12,
    ambientY: 7,
    ambientBlur: 18,
    ambientAlpha: 0.042,
    farY: 12,
    farBlur: 28,
    farAlpha: 0.016,
    insetTopBlur: 6,
    insetTopAlpha: 0.08,
    insetBottomBlur: 10,
    insetBottomAlpha: 0.022,
    rimShadowColor: MODULE_COLORS.shadowWarm,
  });
  const mediaActionShadow = buildRaisedShadow(level1, {
    depth: 0.72,
    softness: 1.14,
    contactY: 4.6,
    contactBlur: 16,
    contactAlpha: 0.05,
    ambientY: 10,
    ambientBlur: 26,
    ambientAlpha: 0.04,
    farY: 18,
    farBlur: 44,
    farAlpha: 0.028,
    insetTopBlur: 8,
    insetTopAlpha: 0.06,
    insetBottomBlur: 12,
    insetBottomAlpha: 0.02,
  });
  const mediaSummaryIconHighlight = rgba(MODULE_COLORS.highlight, 0.52);
  const mediaSummaryIconSurface = rgba(MODULE_COLORS.neutralLight, 0.86);
  const mediaSummaryActionSurface = rgba(MODULE_COLORS.neutralLight, 0.86);
  return {
    '--gradient-card': gradients.sharedCard,
    '--gradient-warm': gradients.sharedWarm,
    '--gradient-floating': gradients.floatingShell,
    '--gradient-control-window': gradients.controlWindow,
    '--gradient-violet-accent': gradients.violetAccent,
    '--gradient-action-dark': gradients.darkAction,
    '--surface-gradient': gradients.sharedSurface,
    '--surface-overlay': buildSurfaceOverlay(level0),
    '--shadow-surface': shadowSurface,
    '--science-card-surface': buildScienceCardSurface(level0),
    '--shadow-button': shadowRaised,
    '--shadow-button-soft': shadowSoft,
    '--shadow-divider': shadowDivider,
    '--shadow-tab': shadowTab,
    '--shadow-tab-active': shadowTabActive,
    '--shadow-media': shadowMedia,
    '--shadow-install-art': shadowInstallArt,
    '--floating-surface': buildFloatingSurface(level2),
    '--floating-surface-strong': buildFloatingSurface(level2, true),
    '--shadow-floating-ui': shadowFloating,
    '--shadow-panel': shadowPanel,
    '--shadow-header': shadowHeader,
    '--shadow-hero-badge': shadowInsetWarm,
    '--shadow-prompt-shell': shadowInsetWarm,
    '--shadow-prompt-skill': shadowInsetViolet,
    '--shadow-pill-inset': shadowInsetWarm,
    '--coffee-gradient': gradients.goldAccent,
    '--coffee-shadow': coffeeShadow,
    '--media-summary-icon-surface': mediaSummaryIconSurface,
    '--media-summary-icon-highlight': mediaSummaryIconHighlight,
    '--media-summary-action-surface': mediaSummaryActionSurface,
    '--media-summary-action-shadow': mediaActionShadow,
  };
}

export function applyThemeTokens(
  root = typeof document !== 'undefined' ? document.documentElement : null,
  { levelControls = LEVEL_CONTROL_DEFAULTS } = {},
) {
  if (!root) {
    return;
  }

  const themeVars = {
    ...STATIC_THEME_VARS,
    ...buildThemeVars(levelControls),
  };

  Object.entries(themeVars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  const themeMeta = root.ownerDocument.querySelector('meta[name="theme-color"]');

  if (themeMeta) {
    themeMeta.setAttribute('content', COLORS.bgSoft);
  }
}
