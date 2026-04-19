import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(
  repoRoot,
  'src',
  'authoring',
  'floating-letters-authoring-snapshot.json',
);
const outputPath = path.join(
  repoRoot,
  'src',
  'generated',
  'floatingLettersBuildSnapshot.js',
);

const FLOATING_LETTER_STYLE_FALLBACKS = Object.freeze({
  styleReferenceScale: 1.07,
  innerLight: 1.4,
  innerLightSize: 1.68,
  innerShade: 1.33,
  innerShadeSize: 1.03,
  depthOffsetX: 6,
  depthOffsetY: 6.6,
  groundShadow: 1.04,
  groundShadowSaturation: 1,
});

const FLOATING_LETTER_STYLE_REFERENCE_HEIGHT = 330;

const HERO_MAGNET_DEFAULTS = Object.freeze({
  innerLightOpacity: 1,
  innerLightOffsetY: 3.4,
  innerLightBlur: 1,
  innerShadeOpacity: 1,
  innerShadeOffsetX: 2.5,
  innerShadeOffsetY: 2.8,
  innerShadeBlur: 3.5,
  depthContrast: 0.57,
  depthSpread: 0,
});

function clamp(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }

  if (min > max) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function getFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeFloatingLetterStyleControls(controls = {}) {
  const groundShadow = clamp(
    getFiniteNumber(
      controls.groundShadow,
      getFiniteNumber(controls.groundShadow2, FLOATING_LETTER_STYLE_FALLBACKS.groundShadow),
    ),
    0,
    2.5,
  );
  const groundShadowSaturation = clamp(
    getFiniteNumber(
      controls.groundShadowSaturation,
      FLOATING_LETTER_STYLE_FALLBACKS.groundShadowSaturation,
    ),
    0,
    1.5,
  );

  return {
    styleReferenceScale: clamp(
      getFiniteNumber(controls.styleReferenceScale, FLOATING_LETTER_STYLE_FALLBACKS.styleReferenceScale),
      0,
      2,
    ),
    innerLight: clamp(
      getFiniteNumber(controls.innerLight, FLOATING_LETTER_STYLE_FALLBACKS.innerLight),
      0,
      2.5,
    ),
    innerLightSize: clamp(
      getFiniteNumber(controls.innerLightSize, FLOATING_LETTER_STYLE_FALLBACKS.innerLightSize),
      0,
      3,
    ),
    innerShade: clamp(
      getFiniteNumber(controls.innerShade, FLOATING_LETTER_STYLE_FALLBACKS.innerShade),
      0,
      2.5,
    ),
    innerShadeSize: clamp(
      getFiniteNumber(controls.innerShadeSize, FLOATING_LETTER_STYLE_FALLBACKS.innerShadeSize),
      0,
      3,
    ),
    depthOffsetX: clamp(
      getFiniteNumber(controls.depthOffsetX, FLOATING_LETTER_STYLE_FALLBACKS.depthOffsetX),
      0,
      16,
    ),
    depthOffsetY: clamp(
      getFiniteNumber(controls.depthOffsetY, FLOATING_LETTER_STYLE_FALLBACKS.depthOffsetY),
      0,
      16,
    ),
    groundShadow,
    groundShadowSaturation,
  };
}

function buildFloatingLettersVisualProps(
  referenceHeight,
  styleControls = FLOATING_LETTER_STYLE_FALLBACKS,
) {
  const controls = sanitizeFloatingLetterStyleControls(styleControls);
  const lightAmount = controls.innerLight;
  const lightReach = controls.innerLightSize;
  const shadeAmount = controls.innerShade;
  const shadeReach = controls.innerShadeSize;
  const shadowAmount = controls.groundShadow;

  return {
    styleReferenceHeight: referenceHeight * controls.styleReferenceScale,
    innerLightOpacity: clamp(HERO_MAGNET_DEFAULTS.innerLightOpacity * lightAmount, 0, 1),
    innerLightOffsetY: clamp(
      HERO_MAGNET_DEFAULTS.innerLightOffsetY * lightReach * 0.9,
      0,
      24,
    ),
    innerLightBlur: clamp(
      HERO_MAGNET_DEFAULTS.innerLightBlur * (0.28 + lightReach * 0.36 + lightAmount * 0.14),
      0,
      16,
    ),
    innerShadeOpacity: clamp(HERO_MAGNET_DEFAULTS.innerShadeOpacity * shadeAmount, 0, 1),
    innerShadeOffsetX: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeOffsetX * shadeReach * 1.1,
      0,
      18,
    ),
    innerShadeOffsetY: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeOffsetY * shadeReach * 1.1,
      0,
      20,
    ),
    innerShadeBlur: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeBlur * (0.3 + shadeReach * 0.22 + shadeAmount * 0.12),
      0,
      16,
    ),
    depthContrast: HERO_MAGNET_DEFAULTS.depthContrast,
    depthOffsetX: controls.depthOffsetX,
    depthOffsetY: controls.depthOffsetY,
    depthSpread: HERO_MAGNET_DEFAULTS.depthSpread,
    groundShadow1Opacity: 0,
    groundShadow1OffsetX: 0,
    groundShadow1OffsetY: 0,
    groundShadow1Blur: 0,
    groundShadow2Opacity: clamp(
      0.18 * shadowAmount,
      0,
      1,
    ),
    groundShadowSaturation: controls.groundShadowSaturation,
    groundShadow2OffsetX: 3.4,
    groundShadow2OffsetY: 19.4,
    groundShadow2Blur: clamp(
      6.8 * (0.84 + shadowAmount * 0.28),
      0,
      72,
    ),
  };
}

function readAuthoringSnapshot() {
  const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  if (!raw || typeof raw !== 'object') {
    throw new Error('Floating letters authoring snapshot must be an object.');
  }

  if (!raw.styleControls || typeof raw.styleControls !== 'object') {
    throw new Error('Floating letters authoring snapshot is missing styleControls.');
  }

  if (!raw.layouts || typeof raw.layouts !== 'object') {
    throw new Error('Floating letters authoring snapshot is missing layouts.');
  }

  return raw;
}

const rawSnapshot = readAuthoringSnapshot();
const motionControls =
  rawSnapshot.motionControls && typeof rawSnapshot.motionControls === 'object'
    ? rawSnapshot.motionControls
    : {};
const styleControls = sanitizeFloatingLetterStyleControls(rawSnapshot.styleControls);
const buildSnapshot = {
  motionControls,
  styleControls,
  visualProps: buildFloatingLettersVisualProps(
    FLOATING_LETTER_STYLE_REFERENCE_HEIGHT,
    styleControls,
  ),
  layouts: rawSnapshot.layouts,
};

const fileContents = `// Generated by scripts/generate_floating_letters_build_snapshot.mjs\nexport const FLOATING_LETTER_BUILD_SNAPSHOT = ${JSON.stringify(buildSnapshot, null, 2)};\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fileContents);

console.log(
  `Wrote floating letters build snapshot to ${path.relative(repoRoot, outputPath)}`,
);
