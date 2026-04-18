import { Fragment, useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import MagnetCanvas from './components/MagnetCanvas.jsx';
import { clamp, getMagnetWidthForLabel } from './components/magnetUtils.js';

const DOWNLOAD_HREF = './downloads/explain-it-like-im-5.md';
const DOWNLOAD_FILENAME = 'explain-it-like-im-5.md';
const SUPPORT_HREF = 'https://buymeacoffee.com/explainitlikeim';
const HERO_GIF =
  'https://media.giphy.com/media/WsNbxuFkLi3IuGI9NU/giphy.gif';
const EXAMPLE_SEPARATOR = '---------------';
const HERO_CONTROL_STORAGE_KEY = 'eli5-hero-magnet-controls-v5';
const HERO_CONTROL_WINDOW_NAME = 'eli5-hero-control-panel';
const HERO_CONTROL_WINDOW_TITLE = "Config Panel for Explain It Like I'm Five";
const HERO_TITLE_SLOT_PADDING_X = 28;
const HERO_TITLE_SLOT_PADDING_Y = 24;

const BOARD_LAYOUTS = {
  hero: {
    authorWidth: 1280,
    authorHeight: 760,
    padding: {
      top: 24,
      right: 28,
      bottom: 24,
      left: 28,
    },
  },
  playfield: {
    authorWidth: 1280,
    authorHeight: 1040,
    padding: {
      top: 34,
      right: 34,
      bottom: 34,
      left: 34,
    },
  },
};

const MAGNET_COLORS = ['#ff5c57', '#ffbf2f', '#22d98b', '#4d86ff', '#ff9a3d', '#7e5cff'];
const HERO_MAGNET_DEFAULTS = {
  size: 226,
  letterGap: -48,
  wordGap: 0.07,
  lineGap: 120,
  tilt: 0.55,
  scatter: 0.34,
  offsetX: 0,
  offsetY: -2,
  vibrance: 1.26,
  depth: 1.26,
  roundness: 1.04,
  shadowOpacity: 0.34,
  shadowOffset: 1.08,
  shadowBlur: 0.16,
  shadowLayers: 2,
  highlightStrength: 0.31,
  faceContrast: 1.24,
};
const HERO_CONTROL_SECTIONS = [
  {
    title: 'Layout',
    fields: [
      { key: 'size', label: 'Size', min: 72, max: 300, step: 1, format: (value) => `${value}px` },
      { key: 'letterGap', label: 'Letter Gap', min: -60, max: 24, step: 1, format: (value) => `${value}px` },
      { key: 'wordGap', label: 'Word Gap', min: 0.02, max: 0.44, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'lineGap', label: 'Line Gap', min: 48, max: 200, step: 1, format: (value) => `${value}px` },
      { key: 'tilt', label: 'Tilt', min: 0, max: 4.4, step: 0.05, format: (value) => value.toFixed(2) },
      { key: 'scatter', label: 'Scatter', min: 0, max: 2.8, step: 0.05, format: (value) => value.toFixed(2) },
      { key: 'offsetX', label: 'Offset X', min: -140, max: 140, step: 1, format: (value) => `${value}px` },
      { key: 'offsetY', label: 'Offset Y', min: -120, max: 180, step: 1, format: (value) => `${value}px` },
    ],
  },
  {
    title: 'Finish',
    fields: [
      { key: 'vibrance', label: 'Vibrance', min: 1, max: 1.6, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'depth', label: 'Depth', min: 0.8, max: 1.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'roundness', label: 'Roundness', min: 0.76, max: 1.42, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'shadowOpacity', label: 'Shadow Opacity', min: 0.08, max: 0.56, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'shadowOffset', label: 'Shadow Offset', min: 0.55, max: 1.9, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'shadowBlur', label: 'Shadow Blur', min: 0, max: 0.44, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'shadowLayers', label: 'Shadow Layers', min: 1, max: 4, step: 1, format: (value) => `${value}` },
      { key: 'highlightStrength', label: 'Top Light', min: 0.04, max: 0.36, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'faceContrast', label: 'Face Contrast', min: 0.84, max: 1.28, step: 0.01, format: (value) => value.toFixed(2) },
    ],
  },
];
const HERO_CONTROL_FIELDS = HERO_CONTROL_SECTIONS.flatMap((section) => section.fields);
const HERO_CONTROL_KEYS = new Set(HERO_CONTROL_FIELDS.map((field) => field.key));

const HOW_STEPS = [
  {
    age: '5',
    title: 'Start tiny',
    copy: 'One short truth. No jargon.',
  },
  {
    age: '7',
    title: 'Add one step',
    copy: 'Keep the same idea. Add one moving part.',
  },
  {
    age: '9',
    title: 'Make it more real',
    copy: 'Start trading the metaphor for the actual thing.',
  },
  {
    age: '12',
    title: 'Show the mechanism',
    copy: 'Say how it works. Name the useful term.',
  },
  {
    age: '16',
    title: 'Make it adult',
    copy: 'Keep it clear. Add nuance. Stop before it gets smug.',
  },
];

const EXAMPLES = [
  {
    slug: 'inflation',
    category: 'Economics',
    subject: 'Inflation',
    prompt: "Explain inflation like I'm 5, 7, 9, 12, and 16.",
    bands: [
      { age: '5', copy: 'Inflation means your money buys less than before.' },
      { age: '7', copy: 'Prices go up, so the same money gets you fewer things at the shop.' },
      { age: '9', copy: 'Things start costing more, so your money does not stretch as far as it used to.' },
      {
        age: '12',
        copy: 'Inflation is when prices rise across lots of goods and services. When that happens, the buying power of your money goes down.',
      },
      {
        age: '16',
        copy: 'Inflation is sustained price growth across an economy, usually tracked with price indexes. It affects wages, savings, rates, and policy.',
      },
    ],
  },
  {
    slug: 'project',
    category: 'Software',
    subject: 'This Repo',
    prompt: "Explain this Explain It Like I'm Five repo like I'm 5, 7, 9, 12, and 16.",
    bands: [
      { age: '5', copy: 'This project helps people make hard things easier to understand.' },
      {
        age: '7',
        copy: 'It shows a skill that answers one question in five easier-to-harder versions.',
      },
      {
        age: '9',
        copy: 'It takes one topic and explains it in steps, so you get the simple version before the more technical one.',
      },
      {
        age: '12',
        copy: 'This repo is a small React site for an installable AI skill. It shows the method and makes the skill easy to grab.',
      },
      {
        age: '16',
        copy: 'This repository is a focused landing page for an installable AI skill. It shows the method, real examples, and how to install it fast.',
      },
    ],
  },
  {
    slug: 'photosynthesis',
    category: 'Science',
    subject: 'Photosynthesis',
    prompt: "Explain photosynthesis like I'm 5, 7, 9, 12, and 16.",
    bands: [
      { age: '5', copy: 'Plants use sunlight to make food.' },
      {
        age: '7',
        copy: 'A plant takes in sunlight, water, and air, then makes sugar so it can grow.',
      },
      {
        age: '9',
        copy: 'The plant uses light as energy to turn water and air into food it can store and use later.',
      },
      {
        age: '12',
        copy: 'Photosynthesis is how plants turn light into stored food. They use carbon dioxide and water to make glucose and release oxygen.',
      },
      {
        age: '16',
        copy: 'Photosynthesis happens mainly in chloroplasts. Light reactions capture energy, and the Calvin cycle uses that energy to build sugars from carbon dioxide.',
      },
    ],
  },
  {
    slug: 'tax-brackets',
    category: 'Personal Finance',
    subject: 'Tax Brackets',
    prompt: "Explain tax brackets like I'm 5, 7, 9, 12, and 16.",
    bands: [
      { age: '5', copy: 'Not all your money is taxed the same way.' },
      {
        age: '7',
        copy: 'As you earn more, only the extra money goes into higher tax slices.',
      },
      {
        age: '9',
        copy: 'The government taxes your income in layers, and only the money in the higher layer gets the higher rate.',
      },
      {
        age: '12',
        copy: 'Tax brackets are income ranges taxed at different rates. Only the money in the higher range gets the higher rate.',
      },
      {
        age: '16',
        copy: 'A marginal tax system applies higher rates to higher bands of taxable income. Your top bracket is not the rate on all your income.',
      },
    ],
  },
];

const SCIENCE_SOURCES = [
  {
    id: 'ayre-2024',
    short: 'Ayre et al., 2024',
    title: 'Online Plain Language Tool and Health Information Quality: A Randomized Clinical Trial',
    meta: 'JAMA Network Open, 2024',
    href: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2824548',
  },
  {
    id: 'feinberg-2024',
    short: 'Feinberg et al., 2024',
    title: 'Simplifying informed consent as a universal precaution',
    meta: 'Scientific Reports, 2024',
    href: 'https://www.nature.com/articles/s41598-024-64139-9',
  },
  {
    id: 'liu-2024',
    short: 'Liu, 2024',
    title: 'The effects of segmentation on cognitive load, vocabulary learning and retention, and reading comprehension in a multimedia learning environment',
    meta: 'BMC Psychology, 2024',
    href: 'https://bmcpsychology.biomedcentral.com/articles/10.1186/s40359-023-01489-5',
  },
  {
    id: 'li-2023',
    short: 'Li et al., 2023',
    title: 'Effect of summarizing scaffolding and textual cues on learning performance, mental model, and cognitive load in a virtual reality environment: An experimental study',
    meta: 'Computers & Education, 2023',
    href: 'https://www.sciencedirect.com/science/article/pii/S0360131523000702',
  },
  {
    id: 'lumu-2023',
    short: "Lu'mu et al., 2023",
    title: 'Perceived related humor in the classroom, student–teacher relationship quality, and engagement',
    meta: 'Heliyon, 2023',
    href: 'https://www.sciencedirect.com/science/article/pii/S2405844023002426',
  },
  {
    id: 'pinto-2025',
    short: 'Pinto & Riesch, 2025',
    title: 'Does Humor in Popular Science Magazine Articles Increase Information Retention and Receptiveness in Science Education?',
    meta: 'Bulletin of Science, Technology & Society, 2025',
    href: 'https://journals.sagepub.com/doi/10.1177/02704676251353101',
  },
];

const SCIENCE_SOURCE_MAP = Object.fromEntries(
  SCIENCE_SOURCES.map((source) => [source.id, source]),
);

const SCIENCE_PRINCIPLES = [
  {
    title: 'Clear words land faster.',
    copy:
      'Plain language improves understanding. It helps people get the first grip before the technical version shows up.',
    sourceIds: ['ayre-2024', 'feinberg-2024'],
  },
  {
    title: 'Small steps cut overload.',
    copy:
      'Segmented explanations reduce cognitive load. One layer at a time is easier to follow than one dense block.',
    sourceIds: ['liu-2024', 'li-2023'],
  },
  {
    title: 'The shape arrives before the detail.',
    copy:
      'Scaffolds and cueing help people build a mental model first. Then the more exact version has somewhere to stick.',
    sourceIds: ['li-2023', 'liu-2024'],
  },
  {
    title: 'A little humor helps attention.',
    copy:
      'Related humor can lift engagement. It works best when it stays short and stays tied to the idea.',
    sourceIds: ['lumu-2023', 'pinto-2025'],
  },
];

const COMPAT_TOOLS = [
  { key: 'codex', label: 'Codex' },
  { key: 'claude-code', label: 'Claude Code' },
  { key: 'cursor', label: 'Cursor' },
];
const INSTALL_STEPS = [
  {
    title: 'Get the skill.',
    copy: 'Download it once. Save it somewhere easy to find.',
    image: './assets/install/install-step-1.png',
    alt: 'A hand placing the skill into an AI app.',
  },
  {
    title: 'Add it to your tool.',
    copy: 'Put it in Codex, Claude Code, or Cursor once. Then leave it there.',
    image: './assets/install/install-step-2.png',
    alt: 'A chat window splitting into cleaner answer layers.',
  },
  {
    title: 'Ask anything.',
    copy: 'Repo, bug, paper, plan, or weird word. It starts simple and builds up.',
    image: './assets/install/install-step-3.png',
    alt: 'A person having an aha moment while learning.',
  },
];

function isTightPunctuation(label) {
  return label === "'" || label === '’' || label === '.';
}

function getLetterGap(currentLabel, nextLabel, baseGap) {
  if (!nextLabel) {
    return 0;
  }

  if (isTightPunctuation(currentLabel) || isTightPunctuation(nextLabel)) {
    return baseGap < 0 ? baseGap * 1.75 : baseGap * 0.35;
  }

  return baseGap;
}

function getLineWidth(line, size, gap, spaceScale = 0.44) {
  const letters = line.split('');
  let width = 0;

  letters.forEach((label, index) => {
    if (label === ' ') {
      width += size * spaceScale;
      return;
    }

    width += getMagnetWidthForLabel(label, size);

    const nextLabel = letters.slice(index + 1).find((nextLabel) => nextLabel !== ' ') ?? null;
    if (nextLabel) {
      width += getLetterGap(label, nextLabel, gap);
    }
  });

  return width;
}

function getSeededUnit(label, lineIndex, charIndex, salt = 0) {
  let seed =
    label.charCodeAt(0) * 92821 +
    (lineIndex + 1) * 68917 +
    (charIndex + 1) * 29791 +
    salt * 1931;
  seed = Math.imul(seed ^ (seed >>> 15), 2246822507);
  seed ^= seed >>> 13;
  return ((seed >>> 0) % 2000) / 1000 - 1;
}

function getMagnetRotation(label, lineIndex, charIndex, rotationScale = 1) {
  const harmonic = Math.sin((charIndex + 1) * 0.86 + lineIndex * 1.08) * 3.4;
  const jitter = getSeededUnit(label, lineIndex, charIndex, 1) * 6.8;
  return (harmonic + jitter) * (0.28 + rotationScale * 0.22);
}

function getHeroMagnetNudge({
  label,
  line,
  lineIndex,
  charIndex,
  size,
  scatter = 1,
  tilt = 1,
}) {
  const compactLineLength = line.replace(/\s+/g, '').length;
  const centerIndex = Math.max(0, compactLineLength - 1) / 2;
  const lineSpread = charIndex - centerIndex;
  const seededX = getSeededUnit(label, lineIndex, charIndex, 3);
  const seededY = getSeededUnit(label, lineIndex, charIndex, 5);
  const seededRotation = getSeededUnit(label, lineIndex, charIndex, 7);

  if (label === "'" || label === '’') {
    return {
      x: -size * 0.048 + seededX * size * 0.01,
      y: -size * (0.22 + scatter * 0.04) + seededY * size * 0.012,
      rotation: (3.8 + tilt * 1.8) * (0.44 + scatter * 0.22),
    };
  }

  const waveX =
    Math.sin(lineSpread * 0.92 + lineIndex * 0.64) *
    size *
    (0.012 + scatter * 0.022);
  const waveY =
    Math.cos(lineSpread * 0.78 + lineIndex * 0.86) *
    size *
    (0.018 + scatter * 0.032);
  const jitterX = seededX * size * (0.01 + scatter * 0.048);
  const jitterY = seededY * size * (0.009 + scatter * 0.04);
  const lineLift = (lineIndex - 1) * size * 0.012 * scatter;

  return {
    x: waveX + jitterX,
    y: waveY + jitterY + lineLift,
    rotation: seededRotation * (1.2 + scatter * 3.2 + tilt * 1.1),
  };
}

function getFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeHeroMagnetControls(controls = {}) {
  return {
    size: Math.round(clamp(getFiniteNumber(controls.size, HERO_MAGNET_DEFAULTS.size), 72, 300)),
    letterGap: Math.round(clamp(getFiniteNumber(controls.letterGap, HERO_MAGNET_DEFAULTS.letterGap), -60, 24)),
    wordGap: clamp(getFiniteNumber(controls.wordGap, HERO_MAGNET_DEFAULTS.wordGap), 0.02, 0.44),
    lineGap: Math.round(clamp(getFiniteNumber(controls.lineGap, HERO_MAGNET_DEFAULTS.lineGap), 48, 200)),
    tilt: clamp(getFiniteNumber(controls.tilt, HERO_MAGNET_DEFAULTS.tilt), 0, 4.4),
    scatter: clamp(getFiniteNumber(controls.scatter, HERO_MAGNET_DEFAULTS.scatter), 0, 2.8),
    offsetX: Math.round(clamp(getFiniteNumber(controls.offsetX, HERO_MAGNET_DEFAULTS.offsetX), -140, 140)),
    offsetY: Math.round(clamp(getFiniteNumber(controls.offsetY, HERO_MAGNET_DEFAULTS.offsetY), -120, 180)),
    vibrance: clamp(getFiniteNumber(controls.vibrance, HERO_MAGNET_DEFAULTS.vibrance), 1, 1.6),
    depth: clamp(getFiniteNumber(controls.depth, HERO_MAGNET_DEFAULTS.depth), 0.8, 1.4),
    roundness: clamp(getFiniteNumber(controls.roundness, HERO_MAGNET_DEFAULTS.roundness), 0.76, 1.42),
    shadowOpacity: clamp(getFiniteNumber(controls.shadowOpacity, HERO_MAGNET_DEFAULTS.shadowOpacity), 0.08, 0.56),
    shadowOffset: clamp(getFiniteNumber(controls.shadowOffset, HERO_MAGNET_DEFAULTS.shadowOffset), 0.55, 1.9),
    shadowBlur: clamp(getFiniteNumber(controls.shadowBlur, HERO_MAGNET_DEFAULTS.shadowBlur), 0, 0.44),
    shadowLayers: Math.round(clamp(getFiniteNumber(controls.shadowLayers, HERO_MAGNET_DEFAULTS.shadowLayers), 1, 4)),
    highlightStrength: clamp(getFiniteNumber(controls.highlightStrength, HERO_MAGNET_DEFAULTS.highlightStrength), 0.04, 0.36),
    faceContrast: clamp(getFiniteNumber(controls.faceContrast, HERO_MAGNET_DEFAULTS.faceContrast), 0.84, 1.28),
  };
}

function loadHeroMagnetControls() {
  if (typeof window === 'undefined') {
    return HERO_MAGNET_DEFAULTS;
  }

  try {
    const raw = window.localStorage.getItem(HERO_CONTROL_STORAGE_KEY);

    if (!raw) {
      return HERO_MAGNET_DEFAULTS;
    }

    return sanitizeHeroMagnetControls(JSON.parse(raw));
  } catch {
    return HERO_MAGNET_DEFAULTS;
  }
}

function createPhraseMagnets({
  boardId,
  lines,
  startX = 0,
  startY,
  offsetX = 0,
  offsetY = 0,
  size,
  gap,
  lineGap,
  align = 'start',
  spaceScale = 0.44,
  rotationScale = 1,
  getNudge,
  magnetProps = {},
}) {
  const magnets = [];
  const authorWidth = BOARD_LAYOUTS[boardId]?.authorWidth ?? 0;

  lines.forEach((line, lineIndex) => {
    const lineWidth = getLineWidth(line, size, gap, spaceScale);
    let letterIndex = 0;
    let cursor =
      align === 'center' && authorWidth > 0
        ? Math.max(startX, (authorWidth - lineWidth) / 2)
        : startX;

    line.split('').forEach((label, charIndex) => {
      if (label === ' ') {
        cursor += size * spaceScale;
        return;
      }

      const width = getMagnetWidthForLabel(label, size);
      const nudge = getNudge?.({
        label,
        line,
        lineIndex,
        charIndex: letterIndex,
        size,
        tilt: rotationScale,
      }) ?? { x: 0, y: 0, rotation: 0 };
      const nextLabel = line.slice(charIndex + 1).split('').find((nextChar) => nextChar !== ' ') ?? null;
      const trailingGap = getLetterGap(label, nextLabel, gap);

      magnets.push({
        id: `${boardId}-${lineIndex}-${charIndex}-${label}`,
        boardId,
        label,
        lineIndex,
        charIndex,
        authorX: cursor + offsetX + nudge.x,
        authorY: startY + offsetY + lineIndex * lineGap + nudge.y,
        size,
        rotation:
          getMagnetRotation(label, lineIndex, letterIndex, rotationScale) +
          (nudge.rotation ?? 0),
        color: MAGNET_COLORS[(letterIndex + lineIndex * 3) % MAGNET_COLORS.length],
        ...magnetProps,
      });

      letterIndex += 1;
      cursor += width + trailingGap;
    });
  });

  return magnets;
}

function createShapeMagnet({
  id,
  boardId,
  shapeType,
  authorX,
  authorY,
  width,
  height,
  rotation = 0,
  color,
  magnetProps = {},
}) {
  return {
    id,
    boardId,
    shapeType,
    authorX,
    authorY,
    width,
    height,
    rotation,
    color,
    ...magnetProps,
  };
}

function buildHeroTitleAuthoredMagnets(heroMagnetControls, magnetProps = {}) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);

  return createPhraseMagnets({
    boardId: 'hero',
    lines: ['EXPLAIN IT', "LIKE I'M", 'FIVE...'],
    startX: 0,
    startY: 52,
    offsetX: heroControls.offsetX,
    offsetY: heroControls.offsetY,
    size: heroControls.size,
    gap: heroControls.letterGap,
    lineGap: heroControls.lineGap,
    align: 'center',
    spaceScale: heroControls.wordGap,
    rotationScale: heroControls.tilt,
    getNudge: ({ label, line, lineIndex, charIndex, size, tilt }) =>
      getHeroMagnetNudge({
        label,
        line,
        lineIndex,
        charIndex,
        size,
        scatter: heroControls.scatter,
        tilt,
      }),
    magnetProps,
  });
}

function getAuthorMagnetBounds(magnets = []) {
  if (magnets.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const bounds = magnets.reduce((acc, magnet) => {
    const width = magnet.width ?? getMagnetWidthForLabel(magnet.label, magnet.size ?? magnet.height);
    const height = magnet.height ?? magnet.size ?? width;
    const left = magnet.authorX;
    const top = magnet.authorY;
    const right = left + width;
    const bottom = top + height;

    return {
      left: Math.min(acc.left, left),
      top: Math.min(acc.top, top),
      right: Math.max(acc.right, right),
      bottom: Math.max(acc.bottom, bottom),
    };
  }, {
    left: Number.POSITIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
  });

  return {
    left: bounds.left,
    top: bounds.top,
    width: bounds.right - bounds.left,
    height: bounds.bottom - bounds.top,
  };
}

function buildHeroTitleSlot(boardRect, heroMagnetControls = HERO_MAGNET_DEFAULTS) {
  const layout = BOARD_LAYOUTS.hero;
  const slotBoost = 1.18;

  if (!boardRect || !layout) {
    return { width: 0, height: 0 };
  }

  const bounds = getAuthorMagnetBounds(buildHeroTitleAuthoredMagnets(heroMagnetControls));
  const innerWidth = boardRect.width - layout.padding.left - layout.padding.right;
  const innerHeight = boardRect.height - layout.padding.top - layout.padding.bottom;
  const scale = Math.min(
    Math.max(innerWidth / layout.authorWidth, 0),
    Math.max(innerHeight / layout.authorHeight, 0),
  );

  return {
    width: Math.round(
      Math.min(
        innerWidth,
        (bounds.width + HERO_TITLE_SLOT_PADDING_X * 2) * scale * slotBoost,
      ),
    ),
    height: Math.round(
      Math.min(
        innerHeight,
        (bounds.height + HERO_TITLE_SLOT_PADDING_Y * 2) * scale * slotBoost,
      ),
    ),
  };
}

function buildFallbackHeroBoardRect(heroMagnetControls = HERO_MAGNET_DEFAULTS) {
  return buildCenteredHeroBoardRect(
    buildFallbackBoardRects().hero,
    heroMagnetControls,
  );
}

function buildCenteredHeroBoardRect(
  heroStageRect,
  heroMagnetControls = HERO_MAGNET_DEFAULTS,
  heroTitleSlot = buildHeroTitleSlot(heroStageRect, heroMagnetControls),
) {
  if (!heroStageRect) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  return {
    left: heroStageRect.left + Math.max((heroStageRect.width - heroTitleSlot.width) / 2, 0),
    top: heroStageRect.top + Math.max((heroStageRect.height - heroTitleSlot.height) / 2, 0),
    width: heroTitleSlot.width,
    height: heroTitleSlot.height,
  };
}

function buildAuthoredMagnets(heroMagnetControls) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);
  const sharedMagnetProps = {
    vibrance: heroControls.vibrance,
    depth: heroControls.depth,
    roundness: heroControls.roundness,
    shadowOpacity: heroControls.shadowOpacity,
    shadowOffset: heroControls.shadowOffset,
    shadowBlur: heroControls.shadowBlur,
    shadowLayers: heroControls.shadowLayers,
    highlightStrength: heroControls.highlightStrength,
    faceContrast: heroControls.faceContrast,
  };

  return [
    ...buildHeroTitleAuthoredMagnets(heroMagnetControls, sharedMagnetProps),
  ];
}

function buildRuntimeMagnets(boardRects, heroMagnetControls = HERO_MAGNET_DEFAULTS) {
  const shouldCompactPlayfield = typeof window !== 'undefined' && window.innerWidth < 860;
  const authoredMagnets = buildAuthoredMagnets(heroMagnetControls);
  const heroAuthorBounds = getAuthorMagnetBounds(
    authoredMagnets.filter((magnet) => magnet.boardId === 'hero'),
  );

  return authoredMagnets.map((magnet) => {
    if (shouldCompactPlayfield && magnet.id === 'playfield-0-0-M') {
      return null;
    }

    const rect = boardRects[magnet.boardId];
    const layout = BOARD_LAYOUTS[magnet.boardId];

    if (!rect || !layout) {
      return null;
    }

    const bounds = {
      left: rect.left + layout.padding.left,
      top: rect.top + layout.padding.top,
      right: rect.left + rect.width - layout.padding.right,
      bottom: rect.top + rect.height - layout.padding.bottom,
    };
    const innerWidth = bounds.right - bounds.left;
    const innerHeight = bounds.bottom - bounds.top;
    const scale = Math.min(
      innerWidth / layout.authorWidth,
      innerHeight / layout.authorHeight,
    );

    if (magnet.boardId === 'hero') {
      const slotScaleX = rect.width / Math.max(heroAuthorBounds.width + HERO_TITLE_SLOT_PADDING_X * 2, 1);
      const slotScaleY = rect.height / Math.max(heroAuthorBounds.height + HERO_TITLE_SLOT_PADDING_Y * 2, 1);
      const slotScale = Math.min(slotScaleX, slotScaleY);

      return {
        ...magnet,
        x: rect.left + (magnet.authorX - heroAuthorBounds.left + HERO_TITLE_SLOT_PADDING_X) * slotScale,
        y: rect.top + (magnet.authorY - heroAuthorBounds.top + HERO_TITLE_SLOT_PADDING_Y) * slotScale,
        size: magnet.size ? magnet.size * slotScale : magnet.size,
        width: magnet.width ? magnet.width * slotScale : magnet.width,
        height: magnet.height ? magnet.height * slotScale : magnet.height,
        bounds: {
          left: rect.left,
          top: rect.top,
          right: rect.left + rect.width,
          bottom: rect.top + rect.height,
        },
      };
    }

    return {
      ...magnet,
      x: bounds.left + magnet.authorX * scale,
      y: bounds.top + magnet.authorY * scale,
      size: magnet.size ? magnet.size * scale : magnet.size,
      width: magnet.width ? magnet.width * scale : magnet.width,
      height: magnet.height ? magnet.height * scale : magnet.height,
      bounds,
    };
  }).filter(Boolean);
}

function buildFallbackBoardRects() {
  if (typeof window === 'undefined') {
    return {};
  }

  const shellWidth = Math.min(1200, window.innerWidth - 32);
  const heroLeft = Math.max((window.innerWidth - shellWidth) / 2, 16);

  return {
    hero: {
      left: heroLeft,
      top: 92,
      width: shellWidth,
      height: Math.max(460, window.innerHeight - 280),
    },
    playfield: {
      left: heroLeft,
      top: 980,
      width: shellWidth,
      height: 1040,
    },
  };
}

function DownloadLink({ className, children }) {
  return (
    <a className={className} href={DOWNLOAD_HREF} download={DOWNLOAD_FILENAME}>
      {children}
    </a>
  );
}

function SupportLink({ className, children }) {
  return (
    <a
      className={className}
      href={SUPPORT_HREF}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function ToolLogo({ toolKey }) {
  switch (toolKey) {
    case 'codex':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z"
          />
        </svg>
      );
    case 'claude-code':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M17.304 3.541h-3.672l6.696 16.918H24Zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541Zm-.371 10.223L8.616 7.82l2.291 5.945Z"
          />
        </svg>
      );
    case 'cursor':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11.503.131L1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
          />
        </svg>
      );
    default:
      return null;
  }
}

function SectionBreak({ color = '#2d7cff', tilt = -4, width = 132 }) {
  return (
    <div className="eli5-section-break" aria-hidden="true">
      <span
        className="eli5-section-break__magnet"
        style={{
          '--divider-color': color,
          '--divider-tilt': `${tilt}deg`,
          '--divider-width': `${width}px`,
        }}
      />
    </div>
  );
}

function ensureHeroControlWindowHost(popupWindow) {
  const { document: popupDocument } = popupWindow;

  popupDocument.title = HERO_CONTROL_WINDOW_TITLE;

  if (!popupDocument.querySelector('meta[name="viewport"]')) {
    const viewportMeta = popupDocument.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1';
    popupDocument.head.appendChild(viewportMeta);
  }

  if (!popupDocument.querySelector('meta[charset]')) {
    const charsetMeta = popupDocument.createElement('meta');
    charsetMeta.setAttribute('charset', 'UTF-8');
    popupDocument.head.prepend(charsetMeta);
  }

  const sourceHeadNodes = document.head.querySelectorAll('style, link[rel="stylesheet"], link[rel="preconnect"]');

  sourceHeadNodes.forEach((node, index) => {
    const marker = node.getAttribute('href') ?? `style-${index}`;

    if (popupDocument.head.querySelector(`[data-eli5-head="${marker}"]`)) {
      return;
    }

    const clone = node.cloneNode(true);
    clone.setAttribute('data-eli5-head', marker);
    popupDocument.head.appendChild(clone);
  });

  if (!popupDocument.getElementById('eli5-control-window-style')) {
    const styleTag = popupDocument.createElement('style');
    styleTag.id = 'eli5-control-window-style';
    styleTag.textContent = `
      html, body {
        min-height: 100%;
      }

      body.eli5-control-window {
        margin: 0;
        padding: 16px;
        background:
          radial-gradient(circle at top right, rgba(75, 147, 255, 0.08), transparent 24%),
          radial-gradient(circle at top left, rgba(255, 157, 46, 0.08), transparent 24%),
          linear-gradient(180deg, #fffaf0 0%, #f3e8d5 100%);
      }

      body.eli5-control-window #eli5-control-host {
        min-height: calc(100vh - 32px);
      }

      body.eli5-control-window .eli5-control-panel {
        width: 100%;
      }
    `;
    popupDocument.head.appendChild(styleTag);
  }

  popupDocument.body.className = 'eli5-control-window';

  let host = popupDocument.getElementById('eli5-control-host');

  if (!host) {
    host = popupDocument.createElement('div');
    host.id = 'eli5-control-host';
    popupDocument.body.innerHTML = '';
    popupDocument.body.appendChild(host);
  }

  return host;
}

function ControlPanelSurface({
  eyebrow,
  title,
  caption,
  controls,
  sections,
  onChange,
  onReset,
  onClose,
}) {
  return (
    <aside className="eli5-control-panel" aria-label="Hero letter controls">
      <div className="eli5-control-panel__header">
        <div>
          <p className="eli5-control-panel__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="eli5-control-panel__caption">{caption}</p>
        </div>

        <div className="eli5-control-panel__actions">
          <button
            type="button"
            className="eli5-control-panel__reset"
            onClick={onReset}
          >
            Reset
          </button>

          {onClose ? (
            <button
              type="button"
              className="eli5-control-panel__close"
              onClick={onClose}
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div className="eli5-control-panel__sections">
        {sections.map((section) => (
          <section key={section.title} className="eli5-control-section">
            <h3>{section.title}</h3>

            <div className="eli5-control-panel__rows">
              {section.fields.map((field) => (
                <label key={field.key} className="eli5-control-row">
                  <span className="eli5-control-row__top">
                    <span>{field.label}</span>
                    <span>{field.format(controls[field.key])}</span>
                  </span>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={controls[field.key]}
                    onChange={(event) => onChange(field.key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

export default function App() {
  const heroStageRef = useRef(null);
  const heroBoardRef = useRef(null);
  const playfieldBoardRef = useRef(null);
  const controlPanelWindowRef = useRef(null);
  const [activeExampleSlug, setActiveExampleSlug] = useState('photosynthesis');
  const [heroTitleSlot, setHeroTitleSlot] = useState(() =>
    buildHeroTitleSlot(buildFallbackBoardRects().hero, loadHeroMagnetControls()),
  );
  const [heroMagnetControls, setHeroMagnetControls] = useState(() =>
    loadHeroMagnetControls(),
  );
  const [controlPanelHost, setControlPanelHost] = useState(null);
  const [isInlineFallbackOpen, setIsInlineFallbackOpen] = useState(false);
  const [magnetSeed, setMagnetSeed] = useState(() =>
    buildRuntimeMagnets({
      ...buildFallbackBoardRects(),
      hero: buildFallbackHeroBoardRect(loadHeroMagnetControls()),
    }, loadHeroMagnetControls()),
  );

  const syncMagnetSeed = useEffectEvent(() => {
    const heroStageRect = heroStageRef.current
      ? {
          left: heroStageRef.current.getBoundingClientRect().left + window.scrollX,
          top: heroStageRef.current.getBoundingClientRect().top + window.scrollY,
          width: heroStageRef.current.getBoundingClientRect().width,
          height: heroStageRef.current.getBoundingClientRect().height,
        }
      : null;
    const playfieldRect = playfieldBoardRef.current
      ? {
          left: playfieldBoardRef.current.getBoundingClientRect().left + window.scrollX,
          top: playfieldBoardRef.current.getBoundingClientRect().top + window.scrollY,
          width: playfieldBoardRef.current.getBoundingClientRect().width,
          height: playfieldBoardRef.current.getBoundingClientRect().height,
        }
      : null;

    const resolvedHeroStageRect = heroStageRect ?? buildFallbackBoardRects().hero;
    const nextHeroSlot = buildHeroTitleSlot(resolvedHeroStageRect, heroMagnetControls);
    const nextHeroRect = buildCenteredHeroBoardRect(
      resolvedHeroStageRect,
      heroMagnetControls,
      nextHeroSlot,
    );
    const nextSeed = buildRuntimeMagnets({
      hero: nextHeroRect,
      playfield: playfieldRect,
    }, heroMagnetControls);

    setHeroTitleSlot(nextHeroSlot);

    if (nextSeed.length === 0) {
      return;
    }

    setMagnetSeed(nextSeed);
  });

  const handleMagnetsChange = useEffectEvent((nextMagnets, meta) => {
    if (meta?.source !== 'drag') {
      return;
    }

    setMagnetSeed(nextMagnets);
  });

  useEffect(() => {
    syncMagnetSeed();

    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => syncMagnetSeed())
      : null;

    if (heroBoardRef.current) {
      resizeObserver?.observe(heroBoardRef.current);
    }

    if (heroStageRef.current) {
      resizeObserver?.observe(heroStageRef.current);
    }

    if (playfieldBoardRef.current) {
      resizeObserver?.observe(playfieldBoardRef.current);
    }

    window.addEventListener('resize', syncMagnetSeed);

    const readyFrame = window.requestAnimationFrame(() => {
      syncMagnetSeed();
    });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncMagnetSeed);
      window.cancelAnimationFrame(readyFrame);
    };
  }, []);

  useEffect(() => {
    syncMagnetSeed();
  }, [heroMagnetControls]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      HERO_CONTROL_STORAGE_KEY,
      JSON.stringify(heroMagnetControls),
    );
  }, [heroMagnetControls]);

  const handleHeroControlChange = useEffectEvent((key, value) => {
    setHeroMagnetControls((current) =>
      sanitizeHeroMagnetControls({
        ...current,
        [key]: value,
      }),
    );
  });

  const handleHeroControlReset = useEffectEvent(() => {
    setHeroMagnetControls(HERO_MAGNET_DEFAULTS);
  });

  const handleExternalPanelClose = useEffectEvent(() => {
    setControlPanelHost(null);

    if (controlPanelWindowRef.current && !controlPanelWindowRef.current.closed) {
      controlPanelWindowRef.current.close();
    }

    controlPanelWindowRef.current = null;
  });

  const openExternalControlPanel = useEffectEvent(() => {
    let popupWindow = controlPanelWindowRef.current;

    if (!popupWindow || popupWindow.closed) {
      popupWindow = window.open(
        '',
        HERO_CONTROL_WINDOW_NAME,
        'popup=yes,width=430,height=760,resizable=yes,scrollbars=yes',
      );
    }

    if (!popupWindow) {
      setIsInlineFallbackOpen(true);
      return;
    }

    setIsInlineFallbackOpen(false);
    controlPanelWindowRef.current = popupWindow;
    const nextHost = ensureHeroControlWindowHost(popupWindow);
    setControlPanelHost(nextHost);
    popupWindow.focus();
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (controlPanelWindowRef.current?.closed) {
        controlPanelWindowRef.current = null;
        setControlPanelHost(null);
      }
    }, 700);

    return () => {
      window.clearInterval(interval);

      if (controlPanelWindowRef.current && !controlPanelWindowRef.current.closed) {
        controlPanelWindowRef.current.close();
      }
    };
  }, []);

  const activeExample =
    EXAMPLES.find((example) => example.slug === activeExampleSlug) ?? EXAMPLES[0];

  return (
    <div className="eli5-page">
      <main className="eli5-main">
        <div className="eli5-shell">
          <div className="eli5-surface">
            <header className="eli5-header">
              <a className="eli5-brand" href="#hero" aria-label="Explain It Like I'm Five">
                <span className="eli5-brand__lead">Explain It Like I&apos;m</span>
                <span className="eli5-brand__accent">Five</span>
              </a>

              <nav className="eli5-nav" aria-label="Primary">
                <a href="#how">How it works</a>
                <a href="#examples">Examples</a>
                <a href="#science">Why it works</a>
              </nav>

              <DownloadLink className="eli5-button eli5-button--primary eli5-button--header">
                Get the skill
              </DownloadLink>
            </header>

            <>
                <section id="hero" className="eli5-hero">
                  <div ref={heroStageRef} className="eli5-hero-stage">
                    <h1 className="eli5-sr-only">Explain It Like I&apos;m Five</h1>

                    <div className="eli5-hero__badge">For when you&apos;re not getting it.</div>

                    <div
                      ref={heroBoardRef}
                      className="eli5-hero__magnet-slot"
                      data-magnet-board="hero"
                      aria-hidden="true"
                      style={{
                        width: heroTitleSlot.width ? `${heroTitleSlot.width}px` : undefined,
                        height: heroTitleSlot.height ? `${heroTitleSlot.height}px` : undefined,
                      }}
                    />

                    <div className="eli5-hero__notes">
                      <div className="eli5-hero__notes-copy">
                        <p className="eli5-hero__summary">
                          Ask one question. Get five clearer versions, from very simple to more complete.
                        </p>
                      </div>

                      <div className="eli5-hero__compat" aria-label="Supported tools">
                        <span className="eli5-hero__compat-label">Works in</span>
                        {COMPAT_TOOLS.map((tool) => (
                          <span key={tool.key} className="eli5-hero__compat-item">
                            <span className={`eli5-tool-logo eli5-tool-logo--${tool.key}`} aria-hidden="true">
                              <ToolLogo toolKey={tool.key} />
                            </span>
                            <span>{tool.label}</span>
                          </span>
                        ))}
                      </div>

                      <div className="eli5-hero__actions">
                        <DownloadLink className="eli5-button eli5-button--primary">
                          Get the skill
                        </DownloadLink>
                        <a className="eli5-button eli5-button--secondary" href="#examples">
                          See examples
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                <SectionBreak color="#ff8a1f" tilt={5} width={142} />

                <section id="how" className="eli5-section eli5-section--how">
                  <div className="eli5-how">
                    <div className="eli5-how__copy">
                      <h2>When you lose the thread.</h2>
                      <p className="eli5-how__lede">
                        Use it when the answer seems smart but you still do not get it.
                        Big repo. Dense paper. Weird bug. Messy plan. It gives you
                        the simple version first, then builds up.
                      </p>

                      <div className="eli5-step-list">
                        {HOW_STEPS.map((step) => (
                          <article key={step.age} className="eli5-step">
                            <p className="eli5-step__age">{step.age}</p>
                            <div>
                              <h3>{step.title}</h3>
                              <p>{step.copy}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    <div className="eli5-gif-wrap">
                      <div className="eli5-gif-card__frame">
                        <img
                          src={HERO_GIF}
                          alt="Michael Scott waiting for Oscar to explain it like he's five."
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <SectionBreak color="#2ecc5a" tilt={-3} width={126} />

                <section id="examples" className="eli5-section eli5-section--examples">
                  <div className="eli5-section-heading">
                    <h2>Real output.</h2>
                    <p>Pick a tab. This is what the skill sends back.</p>
                  </div>

                  <div ref={playfieldBoardRef} className="eli5-playfield" data-magnet-board="playfield">
                    <div className="eli5-example-tabs" role="tablist" aria-label="Example topics">
                      {EXAMPLES.map((example) => {
                        const isActive = example.slug === activeExample.slug;

                        return (
                          <button
                            key={example.slug}
                            id={`example-tab-${example.slug}`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`example-panel-${example.slug}`}
                            className={`eli5-example-tab${isActive ? ' is-active' : ''}`}
                            onClick={() => setActiveExampleSlug(example.slug)}
                          >
                            {example.subject}
                          </button>
                        );
                      })}
                    </div>

                    <div
                      id={`example-panel-${activeExample.slug}`}
                      className="eli5-example-thread"
                      role="tabpanel"
                      aria-labelledby={`example-tab-${activeExample.slug}`}
                    >
                      <p className="eli5-example-thread__category">{activeExample.category}</p>

                      <div className="eli5-example-thread__prompt">
                        <span className="eli5-example-thread__skill">
                          <span className="eli5-example-thread__skill-mark" aria-hidden="true" />
                          Explain It Like I&apos;m Five
                        </span>
                        <span className="eli5-example-thread__topic">{activeExample.subject}</span>
                      </div>

                      <p className="eli5-example-thread__scale">5 / 7 / 9 / 12 / 16</p>

                      <div className="eli5-example-output">
                        {activeExample.bands.map((band, index) => (
                          <Fragment key={band.age}>
                            <p className="eli5-example-output__entry">
                              <span className="eli5-example-output__label">{band.age}:</span>
                              {' '}
                              {band.copy}
                            </p>

                            {index < activeExample.bands.length - 1 ? (
                              <p className="eli5-example-output__separator" aria-hidden="true">
                                {EXAMPLE_SEPARATOR}
                              </p>
                            ) : null}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <SectionBreak color="#8848ff" tilt={4} width={136} />

                <section id="science" className="eli5-section eli5-section--science" aria-label="The science">
                  <div className="eli5-section-heading">
                    <h2>Why it works.</h2>
                    <p>
                      This is built on real learning research, not just vibes.
                    </p>
                  </div>

                  <div className="eli5-science-grid">
                    {SCIENCE_PRINCIPLES.map((item) => (
                      <article key={item.title} className="eli5-science-point">
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.copy}</p>
                          <p className="eli5-science-point__sources">
                            {item.sourceIds.map((sourceId, sourceIndex) => {
                              const source = SCIENCE_SOURCE_MAP[sourceId];

                              if (!source) {
                                return null;
                              }

                              return (
                                <Fragment key={source.id}>
                                  {sourceIndex > 0 ? ' · ' : null}
                                  <a href={source.href} target="_blank" rel="noreferrer">
                                    {source.short}
                                  </a>
                                </Fragment>
                              );
                            })}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <SectionBreak color="#2d7cff" tilt={-6} width={130} />

                <section id="install" className="eli5-section eli5-section--install">
                  <div className="eli5-section-heading">
                    <h2>Install it in 3 quick steps.</h2>
                    <p>Do it once. Then use it whenever the answer gets muddy.</p>
                  </div>

                  <div className="eli5-install-grid">
                    {INSTALL_STEPS.map((step, index) => (
                      <article key={step.title} className="eli5-install-step">
                        <img
                          className="eli5-install-step__art"
                          src={step.image}
                          alt={step.alt}
                          loading="lazy"
                        />

                        <div className="eli5-install-step__copy">
                          <p className="eli5-install-step__index">Step {index + 1}</p>
                          <h3>{step.title}</h3>
                          <p>{step.copy}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <SectionBreak color="#ef4034" tilt={-2} width={134} />

                <section id="download" className="eli5-section eli5-section--download">
                  <div className="eli5-cta">
                    <h2>Get the skill.</h2>
                    <p>
                      Use it when an answer is right, long, and still hard to follow.
                      It gives you the simple version first, then builds up.
                    </p>
                    <div className="eli5-cta__actions">
                      <DownloadLink className="eli5-button eli5-button--primary eli5-button--large eli5-button--cta-download">
                        Download the skill
                      </DownloadLink>
                      <SupportLink className="eli5-button eli5-button--support eli5-button--large eli5-button--cta-support">
                        If it helped, tip me
                      </SupportLink>
                    </div>
                  </div>
                </section>
            </>
          </div>
        </div>
      </main>

      {magnetSeed.length > 0 ? (
        <MagnetCanvas
          className="eli5-magnet-layer"
          magnets={magnetSeed}
          onMagnetsChange={handleMagnetsChange}
        />
      ) : null}

      <div className="eli5-control-launcher">
        <button
          type="button"
          className="eli5-control-launcher__button"
          onClick={openExternalControlPanel}
        >
          {controlPanelHost ? 'Focus Control Panel' : 'Open Control Panel'}
        </button>

        {isInlineFallbackOpen ? (
          <button
            type="button"
            className="eli5-control-launcher__button eli5-control-launcher__button--secondary"
            onClick={() => setIsInlineFallbackOpen(false)}
          >
            Hide Inline Fallback
          </button>
        ) : null}
      </div>

      {isInlineFallbackOpen ? (
        <div className="eli5-control-dock">
          <ControlPanelSurface
            eyebrow="Linked control panel"
            title="Hero letters"
            caption="Letter layout and finish are live on this page."
            controls={heroMagnetControls}
            sections={HERO_CONTROL_SECTIONS}
            onChange={handleHeroControlChange}
            onReset={handleHeroControlReset}
          />
        </div>
      ) : null}

      {controlPanelHost
        ? createPortal(
            <ControlPanelSurface
              eyebrow="Linked control panel"
              title="Hero letters"
              caption="Letter layout and finish are live on this page."
              controls={heroMagnetControls}
              sections={HERO_CONTROL_SECTIONS}
              onChange={handleHeroControlChange}
              onReset={handleHeroControlReset}
              onClose={handleExternalPanelClose}
            />,
            controlPanelHost,
          )
        : null}
    </div>
  );
}
