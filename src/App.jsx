import { Fragment, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';

import CustomCursor from './components/CustomCursor.jsx';
import MagnetCanvas from './components/MagnetCanvas.jsx';
import { clamp, getMagnetWidthForLabel } from './components/magnetUtils.js';
import {
  applyThemeTokens,
  DEPTH_CONTROL_DEFAULTS,
  DEPTH_CONTROL_STORAGE_KEY,
  getLevelControlFactors,
  loadDepthControls,
  LEVEL_CONTROL_DEFAULTS,
  MAGNET_COLORS,
  sanitizeDepthControls,
  SECTION_BREAK_COLORS,
} from './theme.js';

const DOWNLOAD_HREF = './downloads/explain-it-like-im-5.md';
const DOWNLOAD_FILENAME = 'explain-it-like-im-5.md';
const SUPPORT_HREF = 'https://buymeacoffee.com/explainitlikeim';
const HOW_GIF_VIDEO = './assets/how/michael-scott-waiting.mp4';
const HOW_GIF_POSTER = './assets/how/michael-scott-waiting-poster.jpg';
const HOW_GIF_STICKY_TOP_VH = 35;
const EXAMPLE_SEPARATOR = '---------------';
const EXAMPLE_TAB_VISIBLE_COUNT = 5;
const EXAMPLE_TAB_HEIGHT = 56;
const EXAMPLE_TAB_GAP = 12;
const EXAMPLE_TAB_STEP = EXAMPLE_TAB_HEIGHT + EXAMPLE_TAB_GAP;
const EXAMPLE_TAB_VIEWPORT_HEIGHT =
  EXAMPLE_TAB_HEIGHT * EXAMPLE_TAB_VISIBLE_COUNT +
  EXAMPLE_TAB_GAP * (EXAMPLE_TAB_VISIBLE_COUNT - 1);
const EXAMPLE_TAB_TRANSITION_MS = 340;
const EXAMPLE_TAB_WINDOW_START = -1;
const EXAMPLE_TAB_WINDOW_END = (EXAMPLE_TAB_VISIBLE_COUNT * 2) - 2;
const EXAMPLE_TAB_WINDOW_COUNT = EXAMPLE_TAB_WINDOW_END - EXAMPLE_TAB_WINDOW_START + 1;
const HERO_CONTROL_STORAGE_KEY = 'eli5-hero-magnet-controls-v14';
const HERO_LEGACY_CONTROL_STORAGE_KEYS = [
  'eli5-hero-magnet-controls-v13',
  'eli5-hero-magnet-controls-v12',
  'eli5-hero-magnet-controls-v11',
  'eli5-hero-magnet-controls-v10',
];
const HERO_CONTROL_STORAGE_DEPRECATED_KEYS = [
  'eli5-hero-magnet-controls-v8',
  'eli5-hero-magnet-controls-v9',
  ...HERO_LEGACY_CONTROL_STORAGE_KEYS,
];
const HERO_LAYOUT_STORAGE_KEY = 'eli5-hero-custom-layout-v5';
const HERO_LAYOUT_STORAGE_DEPRECATED_KEYS = [
  'eli5-hero-custom-layout-v4',
  'eli5-hero-custom-layout-v3',
];
const HERO_CONTROL_WINDOW_NAME = 'eli5-hero-control-panel';
const HERO_CONTROL_WINDOW_TITLE = "Config Panel for Explain It Like I'm Five";
const CONTROL_PANEL_SECTION_STORAGE_KEY = 'eli5-control-panel-sections-v1';
const APP_VIEWS = {
  home: 'home',
  depthLab: 'depth-lab',
  typographyLab: 'typography-lab',
};
const LOAD_CUES = {
  header: 1,
  heroBadge: 2,
  heroTitle: 3,
  heroNotes: 4,
  breakHow: 5,
  how: 6,
  breakExamples: 7,
  examples: 8,
  breakInstall: 9,
  install: 10,
  breakScience: 11,
  science: 12,
  breakDownload: 13,
  download: 14,
  controls: 15,
  controlDock: 16,
};
const LOAD_TIMELINE = [
  { stage: LOAD_CUES.header, delay: 720 },
  { stage: LOAD_CUES.heroBadge, delay: 1100 },
  { stage: LOAD_CUES.heroTitle, delay: 1600 },
  { stage: LOAD_CUES.heroNotes, delay: 2280 },
  { stage: LOAD_CUES.breakHow, delay: 3260 },
  { stage: LOAD_CUES.how, delay: 3480 },
  { stage: LOAD_CUES.breakExamples, delay: 4100 },
  { stage: LOAD_CUES.examples, delay: 4320 },
  { stage: LOAD_CUES.breakInstall, delay: 4940 },
  { stage: LOAD_CUES.install, delay: 5160 },
  { stage: LOAD_CUES.breakScience, delay: 5780 },
  { stage: LOAD_CUES.science, delay: 6000 },
  { stage: LOAD_CUES.breakDownload, delay: 6620 },
  { stage: LOAD_CUES.download, delay: 6840 },
  { stage: LOAD_CUES.controls, delay: 7360 },
  { stage: LOAD_CUES.controlDock, delay: 7520 },
];
const FINAL_LOAD_STAGE = LOAD_TIMELINE[LOAD_TIMELINE.length - 1]?.stage ?? 0;
const HERO_TITLE_SLOT_PADDING_X = 28;
const HERO_TITLE_SLOT_PADDING_Y = 24;
const HERO_SLOT_MIN_HEIGHT = 238;
const HERO_SLOT_ASPECT_RATIO = 2.35;
const HERO_SLOT_HEIGHT_SCALE = 1.25;
const HERO_VISUAL_PAD_SCALE = 1.65;
const HERO_VISUAL_PAD_BASE = 4 / HERO_VISUAL_PAD_SCALE;
const HERO_VISUAL_PAD_MIN = 5 / HERO_VISUAL_PAD_SCALE;
const HERO_SIZE_MIN = 72;
const HERO_SIZE_MAX = 560;
const HERO_LAYOUT_REFERENCE_SIZE = 269;
const HERO_DEFAULT_SIZE = 342;
const HERO_LAYOUT_VERTICAL_COMPRESSION = 0.4;
const HERO_LAYOUT_MIGRATION_EXPANSION = 1.35;
const HERO_AUTHORED_LETTER_GAP = -48;
const HERO_AUTHORED_WORD_GAP = 0.07;
const HERO_AUTHORED_LINE_GAP = 48;

const HERO_REFERENCE_LAYOUT = {
  'hero-0-0-E': { cx: 0.105, cy: 0.258, rotation: -4.4 },
  'hero-0-1-X': { cx: 0.207, cy: 0.226, rotation: -16.8 },
  'hero-0-2-P': { cx: 0.331, cy: 0.224, rotation: -0.8 },
  'hero-0-3-L': { cx: 0.438, cy: 0.234, rotation: -1.6 },
  'hero-0-4-A': { cx: 0.546, cy: 0.222, rotation: 2.8 },
  'hero-0-5-I': { cx: 0.624, cy: 0.236, rotation: -4.8 },
  'hero-0-6-N': { cx: 0.704, cy: 0.226, rotation: -1.4 },
  'hero-0-8-I': { cx: 0.806, cy: 0.23, rotation: 0.4 },
  'hero-0-9-T': { cx: 0.891, cy: 0.206, rotation: -1.9 },
  'hero-1-0-L': { cx: 0.287, cy: 0.544, rotation: 1.6 },
  'hero-1-1-I': { cx: 0.373, cy: 0.524, rotation: 0.2 },
  'hero-1-2-K': { cx: 0.453, cy: 0.503, rotation: 4.9 },
  'hero-1-3-E': { cx: 0.553, cy: 0.516, rotation: -5.8 },
  'hero-1-5-I': { cx: 0.647, cy: 0.486, rotation: 0.8 },
  "hero-1-6-'": { cx: 0.687, cy: 0.44, rotation: 4.2 },
  'hero-1-7-M': { cx: 0.769, cy: 0.531, rotation: 8.4 },
  'hero-2-0-F': { cx: 0.347, cy: 0.784, rotation: 7.9 },
  'hero-2-1-I': { cx: 0.43, cy: 0.756, rotation: -6.7 },
  'hero-2-2-V': { cx: 0.505, cy: 0.741, rotation: 6.2 },
  'hero-2-3-E': { cx: 0.608, cy: 0.773, rotation: -2.3 },
  'hero-2-4-…': { cx: 0.772, cy: 0.845, rotation: -1.2 },
};

const HERO_MISALIGNED_LAYOUT_V5 = {
  'hero-0-0-E': { cx: 0.09063788679884617, cy: 0.215293138154343, rotation: -4.4 },
  'hero-0-1-X': { cx: 0.20003328441280635, cy: 0.25373733993552533, rotation: -16.8 },
  'hero-0-2-P': { cx: 0.31180379703034633, cy: 0.1911313421766937, rotation: -0.8 },
  'hero-0-3-L': { cx: 0.40498212129196703, cy: 0.2085115312242193, rotation: -1.6 },
  'hero-0-4-A': { cx: 0.5094788556644712, cy: 0.21223682900379473, rotation: 2.8 },
  'hero-0-5-I': { cx: 0.5840169303270579, cy: 0.19984109514826218, rotation: -4.8 },
  'hero-0-6-N': { cx: 0.6720354452753317, cy: 0.1911313421766937, rotation: -1.4 },
  'hero-0-8-I': { cx: 0.814576005387794, cy: 0.24012737003703716, rotation: 0.4 },
  'hero-0-9-T': { cx: 0.8842110735271341, cy: 0.20293998199271393, rotation: -1.9 },
  'hero-1-0-L': { cx: 0.26229153487107065, cy: 0.5183693183441859, rotation: 1.6 },
  'hero-1-1-I': { cx: 0.324938351963876, cy: 0.5108100143978981, rotation: 0.2 },
  'hero-1-2-K': { cx: 0.40618815096037864, cy: 0.5084894061564154, rotation: 4.9 },
  'hero-1-3-E': { cx: 0.5057541382084645, cy: 0.48033934236980635, rotation: -5.8 },
  'hero-1-5-I': { cx: 0.6746017560905666, cy: 0.47564468878588606, rotation: 0.8 },
  "hero-1-6-'": { cx: 0.7161723046147389, cy: 0.5818085679502267, rotation: 4.2 },
  'hero-1-7-M': { cx: 0.8185703456253869, cy: 0.5097354360844456, rotation: 8.4 },
  'hero-2-0-F': { cx: 0.3700734703358319, cy: 0.8215370722404887, rotation: 7.9 },
  'hero-2-1-I': { cx: 0.4428731929818868, cy: 0.8186987097317433, rotation: -6.7 },
  'hero-2-2-V': { cx: 0.517564767548864, cy: 0.7835555077611736, rotation: 6.2 },
  'hero-2-3-E': { cx: 0.6310474131834947, cy: 0.7768616714773481, rotation: -2.3 },
  'hero-2-4-…': { cx: 0.7672987838425523, cy: 0.7945113571545369, rotation: -1.2 },
};

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

const HERO_MAGNET_DEFAULTS = {
  size: HERO_DEFAULT_SIZE,
  floatRangeX: 1,
  floatRangeY: 1.06,
  floatSpeed: 1.1,
  floatRotate: 1.18,
  hoverSink: 0.46,
  hoverLean: 2.24,
  bounceLift: 1.3,
  bounceTwist: 1.88,
  bounceSpeed: 0.37,
  bounceDamping: 1.43,
  stickyEaseBand: 196,
  stickyEaseEnterStrength: 1.36,
  stickyEaseReleaseStrength: 1.24,
  vibrance: 1.88,
  faceContrast: 1.26,
  innerLightOpacity: 1,
  innerLightOffsetY: 3.4,
  innerLightBlur: 1,
  innerShadeOpacity: 1,
  innerShadeOffsetX: 2.5,
  innerShadeOffsetY: 2.8,
  innerShadeBlur: 3.5,
  depthContrast: 0.57,
  depthOffsetX: 2,
  depthOffsetY: 3.8,
  depthSpread: 0,
  groundShadow1Opacity: 0.2,
  groundShadow1OffsetX: 2.3,
  groundShadow1OffsetY: 11.1,
  groundShadow1Blur: 3.1,
  groundShadow2Opacity: 0.2,
  groundShadow2OffsetX: 3,
  groundShadow2OffsetY: 26.7,
  groundShadow2Blur: 7,
};
const HERO_CONTROL_SECTIONS = [
  {
    id: 'hero-layout',
    title: 'Layout',
    defaultCollapsed: true,
    fields: [
      { key: 'size', label: 'Size', min: HERO_SIZE_MIN, max: HERO_SIZE_MAX, step: 1, format: (value) => `${value}px` },
    ],
  },
  {
    id: 'hero-float',
    title: 'Float',
    defaultCollapsed: true,
    fields: [
      { key: 'floatRangeX', label: 'Float X', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'floatRangeY', label: 'Float Y', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'floatSpeed', label: 'Float Speed', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'floatRotate', label: 'Float Twist', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
    ],
  },
  {
    id: 'hero-hover-bounce',
    title: 'Hover Bounce',
    defaultCollapsed: true,
    fields: [
      { key: 'hoverSink', label: 'Hover Sink', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'hoverLean', label: 'Hover Lean', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'bounceLift', label: 'Bounce Height', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'bounceTwist', label: 'Bounce Twist', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'bounceSpeed', label: 'Bounce Speed', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'bounceDamping', label: 'Bounce Settle', min: 0.35, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
    ],
  },
  {
    id: 'hero-sticky-motion',
    title: 'Sticky Motion',
    defaultCollapsed: true,
    fields: [
      { key: 'stickyEaseBand', label: 'Sticky Window', min: 64, max: 320, step: 1, format: (value) => `${Math.round(value)}px` },
      { key: 'stickyEaseEnterStrength', label: 'Catch Drift', min: 0, max: 2.2, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'stickyEaseReleaseStrength', label: 'Release Drift', min: 0, max: 2.2, step: 0.01, format: (value) => value.toFixed(2) },
    ],
  },
  {
    id: 'hero-letters',
    title: 'Letters',
    defaultCollapsed: true,
    fields: [
      { key: 'vibrance', label: 'Vibrance', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
    ],
  },
];
const HERO_CONTROL_FIELDS = HERO_CONTROL_SECTIONS.flatMap((section) => section.fields);
const HERO_CONTROL_KEYS = new Set(HERO_CONTROL_FIELDS.map((field) => field.key));
const DEPTH_CONTROL_SECTIONS = [
  {
    id: 'depth-inset',
    title: 'Inset',
    detail: 'Use `.eli5-depth--inset` for recessed fields and shells.',
    defaultCollapsed: true,
    fields: [
      { key: 'depthInsetDropShadow', label: 'Drop Shadow', type: 'token', token: '--eli5-depth-inset-drop-shadow' },
      { key: 'depthInsetLightEdge', label: 'Light Edge', type: 'token', token: '--eli5-depth-inset-light-edge' },
      { key: 'depthInsetShadowEdge', label: 'Shadow Edge', type: 'token', token: '--eli5-depth-inset-shadow-edge' },
      { key: 'depthInsetLightGradient', label: 'Light Gradient', type: 'token', token: '--eli5-depth-inset-light-gradient' },
    ],
  },
  {
    id: 'depth-0',
    title: 'Depth 0',
    detail: 'Use `.eli5-depth--0` for page-plane cards and calmer surfaces.',
    defaultCollapsed: true,
    fields: [
      { key: 'depth0DropShadow', label: 'Drop Shadow', type: 'token', token: '--eli5-depth-0-drop-shadow' },
      { key: 'depth0LightEdge', label: 'Light Edge', type: 'token', token: '--eli5-depth-0-light-edge' },
      { key: 'depth0ShadowEdge', label: 'Shadow Edge', type: 'token', token: '--eli5-depth-0-shadow-edge' },
      { key: 'depth0LightGradient', label: 'Light Gradient', type: 'token', token: '--eli5-depth-0-light-gradient' },
    ],
  },
  {
    id: 'depth-1',
    title: 'Depth 1',
    detail: 'Use `.eli5-depth--1` for default buttons, pills, and tabs.',
    defaultCollapsed: true,
    fields: [
      { key: 'depth1DropShadow', label: 'Drop Shadow', type: 'token', token: '--eli5-depth-1-drop-shadow' },
      { key: 'depth1LightEdge', label: 'Light Edge', type: 'token', token: '--eli5-depth-1-light-edge' },
      { key: 'depth1ShadowEdge', label: 'Shadow Edge', type: 'token', token: '--eli5-depth-1-shadow-edge' },
      { key: 'depth1LightGradient', label: 'Light Gradient', type: 'token', token: '--eli5-depth-1-light-gradient' },
    ],
  },
  {
    id: 'depth-2',
    title: 'Depth 2',
    detail: 'Use `.eli5-depth--2` for floating chrome and active controls.',
    defaultCollapsed: true,
    fields: [
      { key: 'depth2DropShadow', label: 'Drop Shadow', type: 'token', token: '--eli5-depth-2-drop-shadow' },
      { key: 'depth2LightEdge', label: 'Light Edge', type: 'token', token: '--eli5-depth-2-light-edge' },
      { key: 'depth2ShadowEdge', label: 'Shadow Edge', type: 'token', token: '--eli5-depth-2-shadow-edge' },
      { key: 'depth2LightGradient', label: 'Light Gradient', type: 'token', token: '--eli5-depth-2-light-gradient' },
    ],
  },
  {
    id: 'depth-3',
    title: 'Depth 3',
    detail: 'Use `.eli5-depth--3` for the furthest lifted layer.',
    defaultCollapsed: true,
    fields: [
      { key: 'depth3DropShadow', label: 'Drop Shadow', type: 'token', token: '--eli5-depth-3-drop-shadow' },
      { key: 'depth3LightEdge', label: 'Light Edge', type: 'token', token: '--eli5-depth-3-light-edge' },
      { key: 'depth3ShadowEdge', label: 'Shadow Edge', type: 'token', token: '--eli5-depth-3-shadow-edge' },
      { key: 'depth3LightGradient', label: 'Light Gradient', type: 'token', token: '--eli5-depth-3-light-gradient' },
    ],
  },
];
const DEPTH_CONTROL_KEYS = new Set(Object.keys(DEPTH_CONTROL_DEFAULTS));
const ALL_CONTROL_PANEL_SECTIONS = [
  ...HERO_CONTROL_SECTIONS,
  ...DEPTH_CONTROL_SECTIONS,
];

function getDefaultControlPanelSectionState() {
  return Object.fromEntries(
    ALL_CONTROL_PANEL_SECTIONS.map((section) => [section.id, Boolean(section.defaultCollapsed)]),
  );
}

function sanitizeControlPanelSectionState(sectionState = {}) {
  const defaults = getDefaultControlPanelSectionState();

  return Object.fromEntries(
    Object.entries(defaults).map(([sectionId, defaultValue]) => [
      sectionId,
      typeof sectionState[sectionId] === 'boolean'
        ? sectionState[sectionId]
        : defaultValue,
    ]),
  );
}

function loadControlPanelSectionState() {
  if (typeof window === 'undefined') {
    return getDefaultControlPanelSectionState();
  }

  try {
    const raw = window.localStorage.getItem(CONTROL_PANEL_SECTION_STORAGE_KEY);

    if (!raw) {
      return getDefaultControlPanelSectionState();
    }

    return sanitizeControlPanelSectionState(JSON.parse(raw));
  } catch {
    return getDefaultControlPanelSectionState();
  }
}

const HOW_EXAMPLE = {
  skill: "Explain It Like I'm Five",
  prompt: 'why do we have a surplus?',
};

function readAppView() {
  if (typeof window === 'undefined') {
    return APP_VIEWS.home;
  }

  const view = new URLSearchParams(window.location.search).get('view');

  switch (view) {
    case APP_VIEWS.depthLab:
    case APP_VIEWS.typographyLab:
      return view;
    default:
      return APP_VIEWS.home;
  }
}

function writeAppView(nextView) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);

  if (nextView === APP_VIEWS.home) {
    url.searchParams.delete('view');
  } else {
    url.searchParams.set('view', nextView);
  }

  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function getInitialLoadStage() {
  if (typeof window === 'undefined') {
    return FINAL_LOAD_STAGE;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? FINAL_LOAD_STAGE
    : 0;
}

function getLoadItemClass(baseClassName, isEntered, variantClassName = '') {
  return [
    baseClassName,
    'eli5-load-item',
    variantClassName,
    isEntered ? 'is-entered' : '',
  ].filter(Boolean).join(' ');
}

const HERO_COPY = {
  badge: 'a practical skill for AI agents',
  summary: 'An AI skill for answers you can follow.',
  detail: 'Add it to Codex, Claude Code, Cursor, or a similar AI setup. Ask one question. Get five versions of the answer, from simple to precise. No follow-up rewrite prompt required.',
  compatLabel: 'Use it with',
};

const HOW_BENEFITS = [
  {
    title: 'Start with the simple version.',
    copy:
      'The first pass gets you oriented fast, before the denser language shows up.',
    art: '/assets/how/how-benefit-start.png',
  },
  {
    title: 'The detail is still there when you want it.',
    copy:
      'Each pass adds back the terms, mechanism, and caveats, so the answer stays useful instead of getting watered down.',
    art: '/assets/how/how-benefit-detail.png',
  },
  {
    title: 'It works on code, docs, papers, plans, and odd questions.',
    copy:
      'Anything that is correct but annoyingly dense gets easier when the answer arrives in steps instead of one long slab.',
    art: '/assets/how/how-benefit-anywhere.png',
  },
  {
    title: 'It saves you from asking twice.',
    copy: 'You spend less time asking for a rewrite and more time using the answer.',
    art: '/assets/how/how-benefit-reprompt.png',
  },
];

const HOW_USE_CASES = [
  'API docs',
  'merge conflicts',
  'research papers',
  'architecture notes',
  'product specs',
  'weird finance terms',
];

const EXAMPLES = [
  {
    slug: 'budget-surplus',
    category: 'Money',
    subject: 'Why Do We Have A Surplus?',
    prompt: 'why do we have a surplus?',
    bands: [
      {
        age: '5',
        copy: 'A surplus means you have money left after paying for the things you needed.',
      },
      {
        age: '7',
        copy: 'In a budget, a surplus means you planned some money for spending, but part of it did not get used.',
      },
      {
        age: '9',
        copy: 'A budget surplus happens when income is higher than spending, or when spending ends up lower than expected. The leftover amount is the surplus.',
      },
      {
        age: '12',
        copy: 'A budget surplus is the amount left when actual revenue or available funds are greater than actual spending over the same period. In a company or office budget, that usually means some planned money was not spent.',
      },
      {
        age: '16',
        copy: 'A budget surplus is the positive balance that remains when revenue or allocated funds exceed expenditures for a defined period. It can result from higher-than-expected income, lower-than-expected costs, delayed purchases, or deliberate underspending, and the next question is usually whether to save it, reallocate it, or return it.',
      },
    ],
  },
  {
    slug: 'inflation',
    category: 'Economics',
    subject: 'Inflation',
    prompt: 'Why do prices keep going up?',
    bands: [
      { age: '5', copy: 'Prices creep up, so your coins buy a little less than before.' },
      {
        age: '7',
        copy: 'Inflation means things cost more over time. If a toy used to cost $10 and later costs $11, your money does less work.',
      },
      {
        age: '9',
        copy: 'Inflation is when the general price of goods and services rises. It does not mean every price rises at the same speed, but over time money buys less.',
      },
      {
        age: '12',
        copy: 'Inflation is the rate at which the overall price level rises. When inflation is positive, each dollar buys a smaller share of goods and services than it did before. Central banks try to keep it from rising too fast.',
      },
      {
        age: '16',
        copy: 'Inflation measures how fast the average price level is increasing across an economy, not just one item. It reduces purchasing power, can affect wages, savings, interest rates, and borrowing, and is usually tracked with indexes like the CPI or PCE.',
      },
    ],
  },
  {
    slug: 'photosynthesis',
    category: 'Science',
    subject: 'Photosynthesis',
    prompt: 'How do plants make food?',
    bands: [
      { age: '5', copy: 'Plants make their own food from sunlight, water, and air.' },
      {
        age: '7',
        copy: 'Photosynthesis is how plants use sunlight to turn water and carbon dioxide into sugar. That sugar helps them grow.',
      },
      {
        age: '9',
        copy: 'It happens mostly in leaves. Plants use light energy to make glucose, and they also release oxygen as a byproduct.',
      },
      {
        age: '12',
        copy: 'Photosynthesis is the process plants use to convert light energy into chemical energy. In chloroplasts, chlorophyll captures sunlight, and the plant uses water and carbon dioxide to make glucose and oxygen.',
      },
      {
        age: '16',
        copy: 'Photosynthesis is the biochemical process by which plants, algae, and some bacteria convert light energy into chemical energy stored in sugars. It happens in two linked stages, light reactions and the Calvin cycle, and depends on chloroplasts, chlorophyll, water, and carbon dioxide.',
      },
    ],
  },
  {
    slug: 'tax-brackets',
    category: 'Economics',
    subject: 'Tax Brackets',
    prompt: 'How do tax brackets work?',
    bands: [
      {
        age: '5',
        copy: 'Tax brackets are price bands for income, so higher earners pay more on the extra money they make.',
      },
      {
        age: '7',
        copy: 'Tax brackets split income into chunks. You may pay one rate on the first part of your income and a higher rate on the next part.',
      },
      {
        age: '9',
        copy: 'A tax bracket is a range of income taxed at a certain rate. Your whole paycheck usually is not taxed at the highest rate; only the income inside that bracket is.',
      },
      {
        age: '12',
        copy: 'Tax brackets are parts of a progressive tax system. As income rises, different slices of income are taxed at different rates, so the rate applies to the slice inside each bracket, not to all income at once.',
      },
      {
        age: '16',
        copy: 'Tax brackets describe the income ranges used in progressive tax systems. Each bracket has a marginal tax rate, which applies only to income within that range. That means crossing into a higher bracket raises the tax on the next dollars earned, but it does not retroactively change the rate on earlier income.',
      },
    ],
  },
  {
    slug: 'measles-outbreak',
    category: 'Health',
    subject: 'Measles Outbreak',
    prompt: 'Why does measles spread so fast?',
    bands: [
      {
        age: '5',
        copy: 'A measles outbreak means lots of people in one place get a very contagious sickness.',
      },
      {
        age: '7',
        copy: 'Measles spreads very easily from one person to another. If it starts spreading in a school or town, that is called an outbreak.',
      },
      {
        age: '9',
        copy: 'Measles is a virus that can move fast through groups that are not well protected. Outbreaks happen when enough people catch it in the same area.',
      },
      {
        age: '12',
        copy: 'A measles outbreak is when measles cases rise in a community, school, or region. Because measles is highly contagious and spreads through the air, public health teams try to find exposed people quickly and stop further spread.',
      },
      {
        age: '16',
        copy: 'A measles outbreak occurs when transmission of the measles virus rises above the expected level in a place or population. Because measles is one of the most contagious human viruses, outbreaks are especially likely where vaccination coverage is low, and response typically includes case investigation, isolation, contact tracing, and vaccination campaigns.',
      },
    ],
  },
  {
    slug: 'tariffs-prices',
    category: 'Economics',
    subject: 'Tariffs & Prices',
    prompt: 'Why can tariffs raise prices?',
    bands: [
      {
        age: '5',
        copy: 'A tariff is a tax on things brought in from another country, and it can make prices go up.',
      },
      {
        age: '7',
        copy: 'When a country adds a tariff, imported goods usually cost more. Stores may pass that extra cost to shoppers.',
      },
      {
        age: '9',
        copy: 'Tariffs are taxes on imports. If a product becomes more expensive to bring in, businesses often raise the price people pay, though some of the cost can also be absorbed by sellers.',
      },
      {
        age: '12',
        copy: 'Tariffs are taxes on imported goods. They can raise prices because importers pay more, and those higher costs may be passed on to retailers and customers. The final effect depends on competition, supply chains, and whether companies cut margins instead.',
      },
      {
        age: '16',
        copy: 'Tariffs are border taxes on imports, so they change the after-tax cost of foreign goods. In practice, prices may rise for consumers, but the size of the increase depends on market structure, exchange rates, supplier responses, and how much of the tariff is absorbed by firms versus passed through to buyers.',
      },
    ],
  },
  {
    slug: 'merge-conflicts',
    category: 'Code',
    subject: 'Merge Conflicts',
    prompt: 'Why is Git asking for help?',
    bands: [
      {
        age: '5',
        copy: 'Two people changed the same part, so the computer needs help choosing which version to keep.',
      },
      {
        age: '7',
        copy: 'A merge conflict happens when two edits do not fit together automatically. Git stops and asks a person to decide.',
      },
      {
        age: '9',
        copy: 'Merge conflicts happen when different versions of a file change the same lines, or nearby lines, in incompatible ways. The version control tool cannot safely guess the right result.',
      },
      {
        age: '12',
        copy: 'A merge conflict happens during a merge or rebase when Git finds competing changes it cannot combine automatically. You review the conflicting sections, keep the right parts, and then mark the conflict as resolved.',
      },
      {
        age: '16',
        copy: 'A merge conflict is a version-control state where Git cannot reconcile competing edits from different branches using its normal merge algorithm. Resolving it means inspecting the affected hunks, producing a coherent final file, and then completing the merge or rebase with that chosen result.',
      },
    ],
  },
  {
    slug: 'api-rate-limits',
    category: 'Software',
    subject: 'API Rate Limits',
    prompt: 'Why is this API telling me to slow down?',
    bands: [
      {
        age: '5',
        copy: 'A website says “slow down” so too many requests do not pile up at once.',
      },
      {
        age: '7',
        copy: 'API rate limits are rules about how many requests you can send in a certain time. They stop one user from flooding the service.',
      },
      {
        age: '9',
        copy: 'A rate limit caps request volume, such as 100 requests per minute. If you go past the limit, the API may reject requests until the time window resets.',
      },
      {
        age: '12',
        copy: 'API rate limits control traffic so a service stays stable and fair. Providers may limit by time window, token usage, IP address, or account, and clients usually handle that with retries, backoff, or queues.',
      },
      {
        age: '16',
        copy: 'API rate limiting is a traffic-control mechanism that caps request throughput over a defined interval. It protects capacity, discourages abuse, and supports fair multi-tenant performance, and is often implemented with fixed windows, sliding windows, token buckets, or leaky buckets.',
      },
    ],
  },
  {
    slug: 'peer-review',
    category: 'Research',
    subject: 'Peer Review',
    prompt: 'Who checks research before it gets published?',
    bands: [
      {
        age: '5',
        copy: 'Other experts read the work first to check whether it makes sense.',
      },
      {
        age: '7',
        copy: 'Peer review means other people who know the subject read a study before it is published and point out problems or missing parts.',
      },
      {
        age: '9',
        copy: 'In peer review, editors send research to independent experts for critique. Reviewers look at the methods, evidence, and claims before the paper is accepted, revised, or rejected.',
      },
      {
        age: '12',
        copy: 'Peer review is a quality-control step in scholarly publishing. External specialists assess whether the study design, analysis, and conclusions are strong enough for publication, even though the process is not perfect.',
      },
      {
        age: '16',
        copy: 'Peer review is an editorial evaluation process in which subject-matter experts assess a manuscript’s methodology, interpretation, novelty, and evidentiary support before publication. It can improve rigor and catch errors, but it does not guarantee correctness or reproducibility.',
      },
    ],
  },
  {
    slug: 'interest-rates',
    category: 'Economics',
    subject: 'Interest Rates',
    prompt: 'Why do interest rates go up or down?',
    bands: [
      {
        age: '5',
        copy: 'Interest is extra money paid for borrowing or earned for saving.',
      },
      {
        age: '7',
        copy: 'An interest rate says how much extra you pay to borrow money, or how much extra you get for saving it.',
      },
      {
        age: '9',
        copy: 'Interest rates are percentages attached to loans and savings. Higher rates make borrowing more expensive and saving more rewarding.',
      },
      {
        age: '12',
        copy: 'An interest rate is the price of borrowing money, usually shown as a yearly percentage. Central banks influence rates because they affect spending, saving, inflation, and investment.',
      },
      {
        age: '16',
        copy: 'Interest rates express the cost of credit or the return on savings over time. They influence mortgages, business investment, bond prices, exchange rates, and inflation, and they can be quoted as nominal, real, fixed, or variable rates.',
      },
    ],
  },
  {
    slug: 'technical-debt',
    category: 'Code',
    subject: 'Technical Debt',
    prompt: 'What is technical debt?',
    bands: [
      {
        age: '5',
        copy: 'You take a quick shortcut now, and later the code gets harder to clean up.',
      },
      {
        age: '7',
        copy: 'Technical debt means building something the fast way now and paying for that shortcut later with bugs or slower changes.',
      },
      {
        age: '9',
        copy: 'Technical debt is the future cost created by rushed or temporary code choices. It can help a team move quickly in the short term, but it usually makes maintenance harder later.',
      },
      {
        age: '12',
        copy: 'Technical debt is the accumulated cost of design or implementation shortcuts that were acceptable for speed at the time. Teams repay it by refactoring, improving tests, or simplifying the system before the debt causes larger slowdowns.',
      },
      {
        age: '16',
        copy: 'Technical debt is a software engineering metaphor for the long-term cost imposed by expedient technical choices that defer cleaner architecture or maintenance work. In small amounts it can be strategic, but unmanaged debt compounds through fragility, duplication, slower delivery, and higher defect risk.',
      },
    ],
  },
];

const EXAMPLE_TAB_SLOT_SCALES = [0, 1, 0.97, 0.94, 0.91, 0.88, 0];
const EXAMPLE_TAB_SLOT_TILTS = [-2, -4, 2, -2, 3, -1, 2];

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
    title: 'Plain language improves first-pass comprehension.',
    copy:
      'Simpler wording improves early understanding and usability, especially before readers have enough background to decode specialist terms.',
    sourceIds: ['ayre-2024', 'feinberg-2024'],
  },
  {
    title: 'Segmentation reduces cognitive load.',
    copy:
      'Breaking an explanation into shorter units lowers processing burden and can improve comprehension and retention.',
    sourceIds: ['liu-2024', 'li-2023'],
  },
  {
    title: 'Scaffolding helps later detail stick.',
    copy:
      'Supportive structure helps people build a workable mental model first, which makes denser technical detail easier to place.',
    sourceIds: ['li-2023', 'liu-2024'],
  },
  {
    title: 'Relevant humor can improve attention.',
    copy:
      'Brief, content-related humor can support engagement, provided it does not distract from the instructional point.',
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
    title: 'Download the file.',
    copy: 'Grab the skill and keep it somewhere easy to find.',
    image: './assets/install/install-step-1.png',
    alt: 'A hand placing the skill into an AI app.',
    artScale: 1.08,
  },
  {
    title: 'Add it to your AI setup.',
    copy: 'Use it in Codex, Claude Code, Cursor, or a similar AI setup.',
    image: './assets/install/install-step-2.png',
    alt: 'A chat window splitting into cleaner answer layers.',
    artScale: 1.18,
  },
  {
    title: 'Ask your question.',
    copy: 'The skill rewrites the answer in five levels, so you can start simple and keep going.',
    image: './assets/install/install-step-3.png',
    alt: 'A person having an aha moment while learning.',
    artScale: 1.2,
  },
];

function isTightPunctuation(label) {
  return label === "'" || label === '’' || label === '.' || label === '…';
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
  if (rotationScale <= 0) {
    return 0;
  }

  const harmonic = Math.sin((charIndex + 1) * 0.86 + lineIndex * 1.08) * 3.4;
  const jitter = getSeededUnit(label, lineIndex, charIndex, 1) * 6.8;
  return (harmonic + jitter) * rotationScale * 0.72;
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
  const scatterAmount = Math.max(0, scatter);
  const tiltAmount = Math.max(0, tilt);
  const compactLineLength = line.replace(/\s+/g, '').length;
  const centerIndex = Math.max(0, compactLineLength - 1) / 2;
  const lineSpread = charIndex - centerIndex;
  const seededX = getSeededUnit(label, lineIndex, charIndex, 3);
  const seededY = getSeededUnit(label, lineIndex, charIndex, 5);
  const seededRotation = getSeededUnit(label, lineIndex, charIndex, 7);

  if (label === "'" || label === '’') {
    const baseX = -size * 0.08;
    const baseY = -size * 0.3;

    if (scatterAmount <= 0 && tiltAmount <= 0) {
      return {
        x: baseX,
        y: baseY,
        rotation: 0,
      };
    }

    return {
      x: baseX + seededX * size * (0.004 + scatterAmount * 0.012),
      y: baseY + seededY * size * (0.004 + scatterAmount * 0.01),
      rotation: seededRotation * tiltAmount * (0.5 + scatterAmount * 0.24),
    };
  }

  if (label === '…') {
    const baseX = -size * 0.04;
    const baseY = -size * 0.03;

    if (scatterAmount <= 0 && tiltAmount <= 0) {
      return { x: baseX, y: baseY, rotation: 0 };
    }

    return {
      x: baseX + seededX * size * (0.001 + scatterAmount * 0.004),
      y: baseY + seededY * size * (0.001 + scatterAmount * 0.004),
      rotation: seededRotation * tiltAmount * 0.1,
    };
  }

  if (scatterAmount <= 0) {
    return { x: 0, y: 0, rotation: 0 };
  }

  const waveX =
    Math.sin(lineSpread * 0.92 + lineIndex * 0.64) *
    size *
    scatterAmount *
    0.022;
  const waveY =
    Math.cos(lineSpread * 0.78 + lineIndex * 0.86) *
    size *
    scatterAmount *
    0.032;
  const jitterX = seededX * size * scatterAmount * 0.048;
  const jitterY = seededY * size * scatterAmount * 0.04;
  const lineLift = (lineIndex - 1) * size * 0.012 * scatterAmount;

  return {
    x: waveX + jitterX,
    y: waveY + jitterY + lineLift,
    rotation: seededRotation * scatterAmount * (0.8 + tiltAmount * 0.7),
  };
}

function getFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeHeroMagnetControls(controls = {}) {
  return {
    size: Math.round(clamp(getFiniteNumber(controls.size, HERO_MAGNET_DEFAULTS.size), HERO_SIZE_MIN, HERO_SIZE_MAX)),
    floatRangeX: clamp(getFiniteNumber(controls.floatRangeX, HERO_MAGNET_DEFAULTS.floatRangeX), 0, 2.4),
    floatRangeY: clamp(getFiniteNumber(controls.floatRangeY, HERO_MAGNET_DEFAULTS.floatRangeY), 0, 2.4),
    floatSpeed: clamp(getFiniteNumber(controls.floatSpeed, HERO_MAGNET_DEFAULTS.floatSpeed), 0, 2.4),
    floatRotate: clamp(getFiniteNumber(controls.floatRotate, HERO_MAGNET_DEFAULTS.floatRotate), 0, 2.4),
    hoverSink: clamp(getFiniteNumber(controls.hoverSink, HERO_MAGNET_DEFAULTS.hoverSink), 0, 2.4),
    hoverLean: clamp(getFiniteNumber(controls.hoverLean, HERO_MAGNET_DEFAULTS.hoverLean), 0, 2.4),
    bounceLift: clamp(getFiniteNumber(controls.bounceLift, HERO_MAGNET_DEFAULTS.bounceLift), 0, 2.4),
    bounceTwist: clamp(getFiniteNumber(controls.bounceTwist, HERO_MAGNET_DEFAULTS.bounceTwist), 0, 2.4),
    bounceSpeed: clamp(getFiniteNumber(controls.bounceSpeed, HERO_MAGNET_DEFAULTS.bounceSpeed), 0, 2.4),
    bounceDamping: clamp(getFiniteNumber(controls.bounceDamping, HERO_MAGNET_DEFAULTS.bounceDamping), 0.35, 2.4),
    stickyEaseBand: Math.round(clamp(getFiniteNumber(controls.stickyEaseBand, HERO_MAGNET_DEFAULTS.stickyEaseBand), 64, 320)),
    stickyEaseEnterStrength: clamp(getFiniteNumber(controls.stickyEaseEnterStrength, HERO_MAGNET_DEFAULTS.stickyEaseEnterStrength), 0, 2.2),
    stickyEaseReleaseStrength: clamp(getFiniteNumber(controls.stickyEaseReleaseStrength, HERO_MAGNET_DEFAULTS.stickyEaseReleaseStrength), 0, 2.2),
    vibrance: clamp(getFiniteNumber(controls.vibrance, HERO_MAGNET_DEFAULTS.vibrance), 0, 2.4),
    faceContrast: clamp(getFiniteNumber(controls.faceContrast, HERO_MAGNET_DEFAULTS.faceContrast), 0, 2),
    innerLightOpacity: clamp(getFiniteNumber(controls.innerLightOpacity, HERO_MAGNET_DEFAULTS.innerLightOpacity), 0, 1),
    innerLightOffsetY: clamp(getFiniteNumber(controls.innerLightOffsetY, HERO_MAGNET_DEFAULTS.innerLightOffsetY), 0, 12),
    innerLightBlur: clamp(getFiniteNumber(controls.innerLightBlur, HERO_MAGNET_DEFAULTS.innerLightBlur), 0, 16),
    innerShadeOpacity: clamp(getFiniteNumber(controls.innerShadeOpacity, HERO_MAGNET_DEFAULTS.innerShadeOpacity), 0, 1),
    innerShadeOffsetX: clamp(getFiniteNumber(controls.innerShadeOffsetX, HERO_MAGNET_DEFAULTS.innerShadeOffsetX), 0, 12),
    innerShadeOffsetY: clamp(getFiniteNumber(controls.innerShadeOffsetY, HERO_MAGNET_DEFAULTS.innerShadeOffsetY), 0, 12),
    innerShadeBlur: clamp(getFiniteNumber(controls.innerShadeBlur, HERO_MAGNET_DEFAULTS.innerShadeBlur), 0, 16),
    depthContrast: clamp(getFiniteNumber(controls.depthContrast, HERO_MAGNET_DEFAULTS.depthContrast), 0, 2),
    depthOffsetX: clamp(getFiniteNumber(controls.depthOffsetX, HERO_MAGNET_DEFAULTS.depthOffsetX), 0, 12),
    depthOffsetY: clamp(getFiniteNumber(controls.depthOffsetY, HERO_MAGNET_DEFAULTS.depthOffsetY), 0, 20),
    depthSpread: Math.round(clamp(getFiniteNumber(controls.depthSpread, HERO_MAGNET_DEFAULTS.depthSpread), 0, 6)),
    groundShadow1Opacity: clamp(getFiniteNumber(controls.groundShadow1Opacity, HERO_MAGNET_DEFAULTS.groundShadow1Opacity), 0, 1),
    groundShadow1OffsetX: clamp(getFiniteNumber(controls.groundShadow1OffsetX, HERO_MAGNET_DEFAULTS.groundShadow1OffsetX), 0, 24),
    groundShadow1OffsetY: clamp(getFiniteNumber(controls.groundShadow1OffsetY, HERO_MAGNET_DEFAULTS.groundShadow1OffsetY), 0, 40),
    groundShadow1Blur: clamp(getFiniteNumber(controls.groundShadow1Blur, HERO_MAGNET_DEFAULTS.groundShadow1Blur), 0, 40),
    groundShadow2Opacity: clamp(getFiniteNumber(controls.groundShadow2Opacity, HERO_MAGNET_DEFAULTS.groundShadow2Opacity), 0, 1),
    groundShadow2OffsetX: clamp(getFiniteNumber(controls.groundShadow2OffsetX, HERO_MAGNET_DEFAULTS.groundShadow2OffsetX), 0, 36),
    groundShadow2OffsetY: clamp(getFiniteNumber(controls.groundShadow2OffsetY, HERO_MAGNET_DEFAULTS.groundShadow2OffsetY), 0, 56),
    groundShadow2Blur: clamp(getFiniteNumber(controls.groundShadow2Blur, HERO_MAGNET_DEFAULTS.groundShadow2Blur), 0, 72),
  };
}

function migrateLegacyHeroMagnetControls(controls = {}, sourceKey = '') {
  const legacyDefaultSize =
    sourceKey === 'eli5-hero-magnet-controls-v10'
      ? 226
      : sourceKey === 'eli5-hero-magnet-controls-v11'
        ? 249
        : HERO_LAYOUT_REFERENCE_SIZE;
  const legacySize = getFiniteNumber(controls.size, legacyDefaultSize);
  const sizeMultiplier =
    sourceKey === 'eli5-hero-magnet-controls-v10' ||
    sourceKey === 'eli5-hero-magnet-controls-v11'
      ? 1.2
      : sourceKey === 'eli5-hero-magnet-controls-v13'
        ? 1.06
        : 1;

  return sanitizeHeroMagnetControls({
    ...controls,
    size: Math.round(legacySize * sizeMultiplier),
  });
}

function loadHeroMagnetControls() {
  return HERO_MAGNET_DEFAULTS;
}

function sanitizeHeroLayout(layout = {}) {
  if (!layout || typeof layout !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(layout).flatMap(([id, value]) => {
      const x = getFiniteNumber(value?.x, Number.NaN);
      const y = getFiniteNumber(value?.y, Number.NaN);
      const cx = getFiniteNumber(value?.cx, Number.NaN);
      const cy = getFiniteNumber(value?.cy, Number.NaN);
      const rotation = getFiniteNumber(value?.rotation, Number.NaN);

      if (!Number.isFinite(rotation)) {
        return [];
      }

      if (Number.isFinite(cx) && Number.isFinite(cy)) {
        return [[
          id,
          {
            cx: clamp(cx, 0, 1),
            cy: clamp(cy, 0, 1),
            rotation: clamp(rotation, -45, 45),
          },
        ]];
      }

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return [];
      }

      return [[
        id,
        {
          x: clamp(x, 0, 1),
          y: clamp(y, 0, 1),
          rotation: clamp(rotation, -45, 45),
        },
      ]];
    }),
  );
}

function scaleHeroLayoutVertical(layout = {}, factor = 1) {
  const sanitizedLayout = sanitizeHeroLayout(layout);
  const entries = Object.entries(sanitizedLayout);

  if (entries.length === 0) {
    return sanitizedLayout;
  }

  const verticalValues = entries.map(([, value]) => (
    Number.isFinite(value.cy) ? value.cy : value.y
  ));
  const minY = Math.min(...verticalValues);
  const maxY = Math.max(...verticalValues);
  const centerY = (minY + maxY) / 2;

  return Object.fromEntries(entries.map(([id, value]) => {
    if (Number.isFinite(value.cy)) {
      return [
        id,
        {
          ...value,
          cy: clamp(centerY + (value.cy - centerY) * factor, 0, 1),
        },
      ];
    }

    return [
      id,
      {
        ...value,
        y: clamp(centerY + (value.y - centerY) * factor, 0, 1),
      },
    ];
  }));
}

function compactHeroLayoutVertical(layout = {}, factor = HERO_LAYOUT_VERTICAL_COMPRESSION) {
  return scaleHeroLayoutVertical(layout, factor);
}

function expandHeroLayoutVertical(layout = {}, factor = HERO_LAYOUT_MIGRATION_EXPANSION) {
  return scaleHeroLayoutVertical(layout, factor);
}

function areHeroLayoutsEquivalent(layoutA = {}, layoutB = {}, epsilon = 0.001) {
  const sanitizedLayoutA = sanitizeHeroLayout(layoutA);
  const sanitizedLayoutB = sanitizeHeroLayout(layoutB);
  const layoutAKeys = Object.keys(sanitizedLayoutA);
  const layoutBKeys = Object.keys(sanitizedLayoutB);

  if (layoutAKeys.length !== layoutBKeys.length) {
    return false;
  }

  return layoutAKeys.every((key) => {
    const valueA = sanitizedLayoutA[key];
    const valueB = sanitizedLayoutB[key];

    if (!valueA || !valueB) {
      return false;
    }

    return ['x', 'y', 'cx', 'cy', 'rotation'].every((property) => {
      const propertyA = valueA[property];
      const propertyB = valueB[property];

      if (!Number.isFinite(propertyA) && !Number.isFinite(propertyB)) {
        return true;
      }

      return Number.isFinite(propertyA) &&
        Number.isFinite(propertyB) &&
        Math.abs(propertyA - propertyB) <= epsilon;
    });
  });
}

function getReferenceHeroLayout() {
  return sanitizeHeroLayout(HERO_REFERENCE_LAYOUT);
}

function getHeroLayoutRenderExpansion(heroMagnetControls = HERO_MAGNET_DEFAULTS) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);
  const sizeRatio = heroControls.size / HERO_LAYOUT_REFERENCE_SIZE;

  if (sizeRatio <= 1) {
    return 1;
  }

  return 1 + (sizeRatio - 1) * 0.9;
}

function loadHeroLayout() {
  return getReferenceHeroLayout();
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

function rotatePoint(x, y, centerX, centerY, angleRadians) {
  const dx = x - centerX;
  const dy = y - centerY;
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}

function rotateMagnetsAroundCenter(magnets, angleDegrees = 0) {
  if (!Number.isFinite(angleDegrees) || Math.abs(angleDegrees) < 0.01 || magnets.length === 0) {
    return magnets;
  }

  const bounds = getAuthorMagnetBounds(magnets);
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return magnets.map((magnet) => {
    const width = magnet.width ?? getMagnetWidthForLabel(magnet.label, magnet.size ?? magnet.height);
    const height = magnet.height ?? magnet.size ?? width;
    const currentCenter = {
      x: magnet.authorX + width / 2,
      y: magnet.authorY + height / 2,
    };
    const rotatedCenter = rotatePoint(
      currentCenter.x,
      currentCenter.y,
      centerX,
      centerY,
      angleRadians,
    );

    return {
      ...magnet,
      authorX: rotatedCenter.x - width / 2,
      authorY: rotatedCenter.y - height / 2,
      rotation: (magnet.rotation ?? 0) + angleDegrees,
    };
  });
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

function getTypedPromptText(prompt) {
  if (!prompt) {
    return '';
  }

  return prompt
    .replace(/^Explain\s+/i, '')
    .replace(/\.$/, '')
    .trim()
    .toLowerCase();
}

function getExamplePromptText(example) {
  if (!example?.prompt && !example?.subject) {
    return '';
  }

  return example.prompt ?? example.subject;
}

function getMotionBehavior() {
  if (typeof window === 'undefined') {
    return 'smooth';
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

function smootherstep(value) {
  const clampedValue = clamp(value, 0, 1);

  return clampedValue * clampedValue * clampedValue * (
    clampedValue * (clampedValue * 6 - 15) + 10
  );
}

function getStickyTrackProgress(trackRect, stickyHeight, stickyTop) {
  const scrollSpan = Math.max(trackRect.height - stickyHeight, 1);
  const rawProgress = (stickyTop - trackRect.top) / scrollSpan;

  return {
    rawProgress,
    progress: clamp(rawProgress, 0, 1),
    scrollSpan,
  };
}

function interpolateHermite(position, startPosition, endPosition, startValue, endValue, startSlope, endSlope) {
  const span = endPosition - startPosition;

  if (!Number.isFinite(span) || Math.abs(span) < 0.001) {
    return endValue;
  }

  const progress = clamp((position - startPosition) / span, 0, 1);
  const progressSquared = progress * progress;
  const progressCubed = progressSquared * progress;
  const basis0 = 2 * progressCubed - 3 * progressSquared + 1;
  const basis1 = progressCubed - 2 * progressSquared + progress;
  const basis2 = -2 * progressCubed + 3 * progressSquared;
  const basis3 = progressCubed - progressSquared;

  return (
    basis0 * startValue +
    basis1 * span * startSlope +
    basis2 * endValue +
    basis3 * span * endSlope
  );
}

function getStickyBoundaryOffset(position, window, startValue, endValue, startSlope, endSlope, naturalValue) {
  if (window <= 0 || position <= -window || position >= window) {
    return 0;
  }

  const smoothedValue = interpolateHermite(
    position,
    -window,
    window,
    startValue,
    endValue,
    startSlope,
    endSlope,
  );

  return smoothedValue - naturalValue;
}

function getStickyTravelOffset({
  rawProgress,
  scrollSpan,
  band,
  enterStrength,
  releaseStrength,
}) {
  const entryWindow = band * enterStrength;
  const releaseWindow = band * releaseStrength;
  const entryPosition = rawProgress * scrollSpan;
  const releasePosition = (rawProgress - 1) * scrollSpan;
  const entryNaturalValue = entryPosition < 0 ? -entryPosition : 0;
  const releaseNaturalValue = releasePosition > 0 ? -releasePosition : 0;
  const entryOffset = getStickyBoundaryOffset(
    entryPosition,
    entryWindow,
    entryWindow,
    0,
    -1,
    0,
    entryNaturalValue,
  );
  const releaseOffset = getStickyBoundaryOffset(
    releasePosition,
    releaseWindow,
    0,
    -releaseWindow,
    0,
    -1,
    releaseNaturalValue,
  );

  return entryOffset + releaseOffset;
}

const STICKY_EASE_SETTLE_MS = 180;

function useStickyEase({
  shellRef,
  contentRef,
  trackRef,
  motionControls = HERO_MAGNET_DEFAULTS,
}) {
  const renderedOffsetRef = useRef(Number.NaN);
  const targetOffsetRef = useRef(0);
  const animationFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  const writeStickyEaseOffset = useEffectEvent((offset) => {
    const contentNode = contentRef.current;

    if (!contentNode) {
      return;
    }

    if (Math.abs(offset - renderedOffsetRef.current) < 0.02) {
      return;
    }

    contentNode.style.setProperty('--eli5-sticky-ease-y', `${offset.toFixed(2)}px`);
    renderedOffsetRef.current = offset;
  });

  const animateStickyEase = useEffectEvent((timestamp) => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentOffset = Number.isFinite(renderedOffsetRef.current)
      ? renderedOffsetRef.current
      : targetOffsetRef.current;
    const elapsed = lastFrameTimeRef.current > 0
      ? Math.min(timestamp - lastFrameTimeRef.current, 48)
      : 16;
    const blend = 1 - Math.exp(-elapsed / STICKY_EASE_SETTLE_MS);
    const nextOffset = currentOffset + (targetOffsetRef.current - currentOffset) * blend;

    lastFrameTimeRef.current = timestamp;

    if (Math.abs(targetOffsetRef.current - nextOffset) < 0.05) {
      writeStickyEaseOffset(targetOffsetRef.current);
      animationFrameRef.current = 0;
      lastFrameTimeRef.current = 0;
      return;
    }

    writeStickyEaseOffset(nextOffset);
    animationFrameRef.current = window.requestAnimationFrame(animateStickyEase);
  });

  const ensureStickyEaseAnimation = useEffectEvent(() => {
    if (typeof window === 'undefined' || animationFrameRef.current) {
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(animateStickyEase);
  });

  const syncStickyEase = useEffectEvent(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const shellNode = shellRef.current;
    const contentNode = contentRef.current;
    const trackNode = trackRef?.current ?? shellNode?.parentElement;

    if (!shellNode || !contentNode || !trackNode) {
      return;
    }

    let nextOffset = 0;

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const shellStyle = window.getComputedStyle(shellNode);
      const stickyTop = Number.parseFloat(shellStyle.top);
      const stickyBand = clamp(
        getFiniteNumber(motionControls.stickyEaseBand, HERO_MAGNET_DEFAULTS.stickyEaseBand),
        64,
        320,
      );
      const enterStrength = clamp(
        getFiniteNumber(motionControls.stickyEaseEnterStrength, HERO_MAGNET_DEFAULTS.stickyEaseEnterStrength),
        0,
        2.2,
      );
      const releaseStrength = clamp(
        getFiniteNumber(motionControls.stickyEaseReleaseStrength, HERO_MAGNET_DEFAULTS.stickyEaseReleaseStrength),
        0,
        2.2,
      );

      if (shellStyle.position === 'sticky' && Number.isFinite(stickyTop)) {
        const trackRect = trackNode.getBoundingClientRect();
        const stickyHeight = shellNode.offsetHeight;
        const { rawProgress, scrollSpan } = getStickyTrackProgress(
          trackRect,
          stickyHeight,
          stickyTop,
        );

        nextOffset = getStickyTravelOffset({
          rawProgress,
          scrollSpan,
          band: stickyBand,
          enterStrength,
          releaseStrength,
        });
      }
    }

    targetOffsetRef.current = nextOffset;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      writeStickyEaseOffset(nextOffset);
      return;
    }

    if (!Number.isFinite(renderedOffsetRef.current)) {
      writeStickyEaseOffset(nextOffset);
      return;
    }

    if (Math.abs(nextOffset - renderedOffsetRef.current) < 0.05) {
      writeStickyEaseOffset(nextOffset);
      return;
    }

    ensureStickyEaseAnimation();
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frameRequested = false;
    let measureFrameId = 0;

    const requestSync = () => {
      if (frameRequested) {
        return;
      }

      frameRequested = true;
      measureFrameId = window.requestAnimationFrame(() => {
        frameRequested = false;
        syncStickyEase();
      });
    };

    const shellNode = shellRef.current;
    const trackNode = trackRef?.current ?? shellNode?.parentElement;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      requestSync();
    };

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
    }

    let resizeObserver;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        requestSync();
      });

      if (shellNode) {
        resizeObserver.observe(shellNode);
      }

      if (trackNode && trackNode !== shellNode) {
        resizeObserver.observe(trackNode);
      }
    }

    requestSync();

    return () => {
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }

      resizeObserver?.disconnect();
      window.cancelAnimationFrame(measureFrameId);
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      lastFrameTimeRef.current = 0;
    };
  }, [contentRef, shellRef, trackRef, syncStickyEase]);

  useEffect(() => {
    syncStickyEase();
  }, [
    motionControls.stickyEaseBand,
    motionControls.stickyEaseEnterStrength,
    motionControls.stickyEaseReleaseStrength,
    syncStickyEase,
  ]);
}

function wrapIndex(index, length) {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

function getExampleTabSlotVisuals(slotIndex) {
  const boundedSlotIndex = clamp(
    slotIndex,
    -1,
    EXAMPLE_TAB_VISIBLE_COUNT,
  );
  const mapIndex = boundedSlotIndex - EXAMPLE_TAB_WINDOW_START;
  const layerSlotIndex = clamp(boundedSlotIndex, 0, EXAMPLE_TAB_VISIBLE_COUNT - 1);

  return {
    offsetY: EXAMPLE_TAB_STEP * boundedSlotIndex,
    scale: EXAMPLE_TAB_SLOT_SCALES[mapIndex],
    tilt: EXAMPLE_TAB_SLOT_TILTS[mapIndex],
    layer: String(30 - layerSlotIndex),
    isVisible: boundedSlotIndex >= 0 && boundedSlotIndex < EXAMPLE_TAB_VISIBLE_COUNT,
  };
}

function getExampleTabIdentityColor(exampleIndex) {
  return MAGNET_COLORS[wrapIndex(exampleIndex, MAGNET_COLORS.length)];
}

function getExampleTabRingItems(examples, committedIndex) {
  if (examples.length === 0) {
    return [];
  }

  return Array.from({ length: EXAMPLE_TAB_WINDOW_COUNT }, (_, offset) => {
    const slotIndex = EXAMPLE_TAB_WINDOW_START + offset;
    const exampleIndex = wrapIndex(committedIndex + slotIndex, examples.length);
    const example = examples[exampleIndex];

    return {
      example,
      exampleIndex,
      slotIndex,
    };
  }).filter(({ example }) => Boolean(example));
}

function ExampleChevronIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.5 10 8 6.5 11.5 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildHeroTitleAuthoredMagnets(heroMagnetControls, magnetProps = {}) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);

  return createPhraseMagnets({
    boardId: 'hero',
    lines: ['EXPLAIN IT', "LIKE I'M", 'FIVE…'],
    startX: 0,
    startY: 52,
    offsetX: 0,
    offsetY: 0,
    size: heroControls.size,
    gap: HERO_AUTHORED_LETTER_GAP,
    lineGap: HERO_AUTHORED_LINE_GAP,
    align: 'center',
    spaceScale: HERO_AUTHORED_WORD_GAP,
    rotationScale: 0,
    getNudge: ({ label, line, lineIndex, charIndex, size, tilt }) =>
      getHeroMagnetNudge({
        label,
        line,
        lineIndex,
        charIndex,
        size,
        scatter: 0,
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

function getHeroReferenceAuthorBounds() {
  return getAuthorMagnetBounds(
    buildHeroTitleAuthoredMagnets(
      { ...HERO_MAGNET_DEFAULTS, size: HERO_LAYOUT_REFERENCE_SIZE },
    ),
  );
}

function buildHeroTitleSlot(boardRect) {
  if (!boardRect) {
    return { width: 0, height: 0 };
  }

  return {
    width: Math.round(Math.max(boardRect.width, 0)),
    height: Math.round(
      Math.max(
        HERO_SLOT_MIN_HEIGHT,
        (boardRect.width / HERO_SLOT_ASPECT_RATIO) * HERO_SLOT_HEIGHT_SCALE,
      ),
    ),
  };
}

function getHeroMagnetVisualPad(magnet) {
  const depthOffsetX = Math.abs(getFiniteNumber(magnet.depthOffsetX, 1.4));
  const depthOffsetY = Math.abs(getFiniteNumber(magnet.depthOffsetY, 6.6));
  const depthSpread = Math.max(0, getFiniteNumber(magnet.depthSpread, 1));
  const groundShadow1OffsetX = Math.abs(getFiniteNumber(magnet.groundShadow1OffsetX, 4));
  const groundShadow1OffsetY = Math.abs(getFiniteNumber(magnet.groundShadow1OffsetY, 13));
  const groundShadow1Blur = Math.max(0, getFiniteNumber(magnet.groundShadow1Blur, 14));
  const groundShadow2OffsetX = Math.abs(getFiniteNumber(magnet.groundShadow2OffsetX, 7));
  const groundShadow2OffsetY = Math.abs(getFiniteNumber(magnet.groundShadow2OffsetY, 26));
  const groundShadow2Blur = Math.max(0, getFiniteNumber(magnet.groundShadow2Blur, 30));
  const innerLightOffsetY = Math.abs(getFiniteNumber(magnet.innerLightOffsetY, 1.6));
  const innerLightBlur = Math.max(0, getFiniteNumber(magnet.innerLightBlur, 3));
  const innerShadeOffsetX = Math.abs(getFiniteNumber(magnet.innerShadeOffsetX, 1.8));
  const innerShadeOffsetY = Math.abs(getFiniteNumber(magnet.innerShadeOffsetY, 2.8));
  const innerShadeBlur = Math.max(0, getFiniteNumber(magnet.innerShadeBlur, 4));

  return Math.max(
    HERO_VISUAL_PAD_MIN,
    depthOffsetX + depthSpread * 2 + HERO_VISUAL_PAD_BASE,
    depthOffsetY + depthSpread * 2 + HERO_VISUAL_PAD_BASE,
    groundShadow1OffsetX + groundShadow1Blur * 2.8 + HERO_VISUAL_PAD_BASE,
    groundShadow1OffsetY + groundShadow1Blur * 2.8 + HERO_VISUAL_PAD_BASE,
    groundShadow2OffsetX + groundShadow2Blur * 2.8 + HERO_VISUAL_PAD_BASE,
    groundShadow2OffsetY + groundShadow2Blur * 2.8 + HERO_VISUAL_PAD_BASE,
    innerLightOffsetY + innerLightBlur * 2 + HERO_VISUAL_PAD_BASE,
    Math.max(innerShadeOffsetX, innerShadeOffsetY) + innerShadeBlur * 2 + HERO_VISUAL_PAD_BASE,
  );
}

function getHeroVisualBounds(magnets = []) {
  const heroMagnets = magnets.filter((magnet) => magnet.boardId === 'hero');

  if (heroMagnets.length === 0) {
    return null;
  }

  return heroMagnets.reduce((acc, magnet) => {
    const { width, height } = getMagnetDimensions(magnet);
    const visualPad = getHeroMagnetVisualPad(magnet);

    return {
      left: Math.min(acc.left, magnet.x - visualPad),
      top: Math.min(acc.top, magnet.y - visualPad),
      right: Math.max(acc.right, magnet.x + width + visualPad),
      bottom: Math.max(acc.bottom, magnet.y + height + visualPad),
    };
  }, {
    left: Number.POSITIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
  });
}

function buildCenteredHeroBoardRect(
  heroStageRect,
  heroMagnetControls = HERO_MAGNET_DEFAULTS,
  heroTitleSlot = buildHeroTitleSlot(heroStageRect),
) {
  if (!heroStageRect) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  return {
    left: heroStageRect.left,
    top: heroStageRect.top + Math.max((heroStageRect.height - heroTitleSlot.height) / 2, 0),
    width: heroStageRect.width,
    height: heroTitleSlot.height,
  };
}

function buildSharedMagnetVisualProps(
  levelControls,
  vibrance = HERO_MAGNET_DEFAULTS.vibrance,
) {
  const level3 = getLevelControlFactors(levelControls, 'level3');
  const shadowStrengthDelta = level3.shadowStrength - 1;
  const shadowSoftnessDelta = level3.shadowSoftness - 1;
  const amountDelta = level3.amount - 1;

  return {
    vibrance,
    faceContrast: clamp(HERO_MAGNET_DEFAULTS.faceContrast * (1 + (level3.fillContrast - 1) * 0.42), 0, 2),
    innerLightOpacity: clamp(
      HERO_MAGNET_DEFAULTS.innerLightOpacity *
        (1 + (level3.lightStrength - 1) * 0.36 + amountDelta * 0.08),
      0,
      1,
    ),
    innerLightOffsetY: clamp(
      HERO_MAGNET_DEFAULTS.innerLightOffsetY * (1 + amountDelta * 0.24),
      0,
      12,
    ),
    innerLightBlur: clamp(
      HERO_MAGNET_DEFAULTS.innerLightBlur *
        (1 + (level3.lightStrength - 1) * 0.22 + shadowSoftnessDelta * 0.08),
      0,
      16,
    ),
    innerShadeOpacity: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeOpacity * (1 + shadowStrengthDelta * 0.18),
      0,
      1,
    ),
    innerShadeOffsetX: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeOffsetX * (1 + amountDelta * 0.18),
      0,
      12,
    ),
    innerShadeOffsetY: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeOffsetY * (1 + amountDelta * 0.18),
      0,
      12,
    ),
    innerShadeBlur: clamp(
      HERO_MAGNET_DEFAULTS.innerShadeBlur * (1 + shadowSoftnessDelta * 0.18),
      0,
      16,
    ),
    depthContrast: clamp(
      HERO_MAGNET_DEFAULTS.depthContrast *
        (1 + (level3.fillContrast - 1) * 0.26 + shadowStrengthDelta * 0.34),
      0,
      2,
    ),
    depthOffsetX: clamp(
      HERO_MAGNET_DEFAULTS.depthOffsetX * (1 + amountDelta * 0.35),
      0,
      12,
    ),
    depthOffsetY: clamp(
      HERO_MAGNET_DEFAULTS.depthOffsetY *
        (1 + amountDelta * 0.42 + shadowStrengthDelta * 0.22),
      0,
      20,
    ),
    depthSpread: Math.round(
      clamp(
        HERO_MAGNET_DEFAULTS.depthSpread +
          amountDelta * 1.8 +
          shadowSoftnessDelta * 0.8 +
          shadowStrengthDelta * 0.9,
        0,
        6,
      ),
    ),
    groundShadow1Opacity: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow1Opacity *
        (1 + shadowStrengthDelta * 0.9 + amountDelta * 0.14),
      0,
      1,
    ),
    groundShadow1OffsetX: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow1OffsetX * (1 + amountDelta * 0.22),
      0,
      24,
    ),
    groundShadow1OffsetY: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow1OffsetY * (1 + amountDelta * 0.3),
      0,
      40,
    ),
    groundShadow1Blur: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow1Blur *
        (1 + shadowSoftnessDelta * 0.36 + amountDelta * 0.16),
      0,
      40,
    ),
    groundShadow2Opacity: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow2Opacity *
        (1 + shadowStrengthDelta * 1.05 + amountDelta * 0.12),
      0,
      1,
    ),
    groundShadow2OffsetX: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow2OffsetX * (1 + amountDelta * 0.2),
      0,
      36,
    ),
    groundShadow2OffsetY: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow2OffsetY * (1 + amountDelta * 0.26),
      0,
      56,
    ),
    groundShadow2Blur: clamp(
      HERO_MAGNET_DEFAULTS.groundShadow2Blur *
        (1 + shadowSoftnessDelta * 0.42 + amountDelta * 0.14),
      0,
      72,
    ),
  };
}

function buildAuthoredMagnets(
  heroMagnetControls,
  levelControls = LEVEL_CONTROL_DEFAULTS,
) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);
  const sharedMagnetProps = buildSharedMagnetVisualProps(
    levelControls,
    heroControls.vibrance,
  );

  return [
    ...buildHeroTitleAuthoredMagnets(heroMagnetControls, sharedMagnetProps),
  ];
}

function buildHeroLayoutContentRect(heroRect, heroAuthorBounds) {
  if (!heroRect) {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      scale: 0,
    };
  }

  const referenceBounds = getHeroReferenceAuthorBounds();
  const slotScaleX =
    heroRect.width / Math.max(referenceBounds.width + HERO_TITLE_SLOT_PADDING_X * 2, 1);
  const scale = slotScaleX;

  return {
    left: heroRect.left + HERO_TITLE_SLOT_PADDING_X * scale,
    top: heroRect.top + HERO_TITLE_SLOT_PADDING_Y * scale,
    width: heroAuthorBounds.width * scale,
    height: heroAuthorBounds.height * scale,
    scale,
  };
}

function getMagnetDimensions(magnet) {
  const height = Math.max(28, magnet.height ?? magnet.size ?? 68);
  const width = magnet.width ?? getMagnetWidthForLabel(magnet.label, height);

  return { width, height };
}

function getHeroLayoutInsetBounds(heroRect, width, height) {
  const insetX = Math.min(
    Math.max(14, width * 0.08),
    Math.max((heroRect.width - width) / 2, 0),
  );
  const insetY = Math.min(
    Math.max(18, height * 0.12),
    Math.max((heroRect.height - height) / 2, 0),
  );

  return {
    left: heroRect.left + insetX,
    top: heroRect.top + insetY,
    right: heroRect.left + heroRect.width - insetX,
    bottom: heroRect.top + heroRect.height - insetY,
  };
}

function buildRuntimeMagnets(
  boardRects,
  heroMagnetControls = HERO_MAGNET_DEFAULTS,
  levelControls = LEVEL_CONTROL_DEFAULTS,
) {
  const shouldCompactPlayfield = typeof window !== 'undefined' && window.innerWidth < 860;
  const authoredMagnets = buildAuthoredMagnets(heroMagnetControls, levelControls);
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
      const heroContentRect = buildHeroLayoutContentRect(rect, heroAuthorBounds);
      const slotScale = heroContentRect.scale;

      return {
        ...magnet,
        x: heroContentRect.left + (magnet.authorX - heroAuthorBounds.left) * slotScale,
        y: heroContentRect.top + (magnet.authorY - heroAuthorBounds.top) * slotScale,
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

function applyPersistedHeroLayout(
  magnets,
  heroRect,
  heroLayout = {},
) {
  if (!heroRect || Object.keys(heroLayout).length === 0) {
    return magnets;
  }

  const positionedMagnets = magnets.map((magnet) => {
    if (magnet.boardId !== 'hero') {
      return magnet;
    }

    const override = heroLayout[magnet.id];

    if (!override) {
      return magnet;
    }

    const { width, height } = getMagnetDimensions(magnet);
    let nextX;
    let nextY;

    if (Number.isFinite(override.cx) && Number.isFinite(override.cy)) {
      const insetBounds = getHeroLayoutInsetBounds(heroRect, width, height);
      const insetWidth = Math.max(insetBounds.right - insetBounds.left, 1);
      const insetHeight = Math.max(insetBounds.bottom - insetBounds.top, 1);

      nextX = insetBounds.left + override.cx * insetWidth - width / 2;
      nextY = insetBounds.top + override.cy * insetHeight - height / 2;
    } else {
      const insetBounds = getHeroLayoutInsetBounds(heroRect, width, height);
      const usableWidth = Math.max(insetBounds.right - insetBounds.left - width, 0);
      const usableHeight = Math.max(insetBounds.bottom - insetBounds.top - height, 0);
      nextX = insetBounds.left + override.x * usableWidth;
      nextY = insetBounds.top + override.y * usableHeight;
    }

    const insetBounds = getHeroLayoutInsetBounds(heroRect, width, height);
    return {
      ...magnet,
      x: clamp(nextX, insetBounds.left, insetBounds.right - width),
      y: clamp(nextY, insetBounds.top, insetBounds.bottom - height),
      rotation: override.rotation,
      userPlaced: true,
    };
  });

  return positionedMagnets;
}

function buildFallbackBoardRects() {
  if (typeof window === 'undefined') {
    return {};
  }

  const shellMaxWidth = Math.min(Math.max(1120, window.innerWidth * 0.72), 1380);
  const shellWidth = Math.min(shellMaxWidth, window.innerWidth - 32);
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

function SectionBreak({
  className = 'eli5-section-break',
  color = SECTION_BREAK_COLORS.blue,
  tilt = -4,
  width = 106,
  heroMagnetControls = HERO_MAGNET_DEFAULTS,
  levelControls = LEVEL_CONTROL_DEFAULTS,
}) {
  const pillMagnet = createShapeMagnet({
    id: `section-break-${color}-${tilt}-${width}`,
    shapeType: 'pill',
    authorX: 0,
    authorY: 0,
    width,
    height: 22,
    rotation: tilt,
    color,
    magnetProps: {
      ...buildSharedMagnetVisualProps(
        levelControls,
        getFiniteNumber(heroMagnetControls.vibrance, HERO_MAGNET_DEFAULTS.vibrance),
      ),
      x: 0,
      y: 0,
      zIndex: 1,
      hoverable: false,
    },
  });
  const visualPad = getHeroMagnetVisualPad(pillMagnet);
  const floatRangeX = getFiniteNumber(
    heroMagnetControls.floatRangeX,
    HERO_MAGNET_DEFAULTS.floatRangeX,
  );
  const floatRangeY = getFiniteNumber(
    heroMagnetControls.floatRangeY,
    HERO_MAGNET_DEFAULTS.floatRangeY,
  );
  const slotWidth = Math.ceil(pillMagnet.width + visualPad * 2 + floatRangeX * 12);
  const slotHeight = Math.ceil(pillMagnet.height + visualPad * 2 + floatRangeY * 22);
  pillMagnet.x = (slotWidth - pillMagnet.width) / 2;
  pillMagnet.y = (slotHeight - pillMagnet.height) / 2;

  return (
    <div className={className} aria-hidden="true">
      <span className="eli5-section-break__rail" />
      <div
        className="eli5-section-break__slot"
        style={{
          width: `${slotWidth}px`,
          height: `${slotHeight}px`,
        }}
      >
        <MagnetCanvas
          className="eli5-section-break__magnet"
          magnets={[pillMagnet]}
          motionConfig={heroMagnetControls}
          localCoordinates
        />
      </div>
      <span className="eli5-section-break__rail" />
    </div>
  );
}

function RevealOnView({
  as: Tag = 'div',
  active = true,
  children,
  className = '',
  delay = 0,
  rootMargin = '0px 0px 6% 0px',
  threshold = 0.12,
  variantClassName = '',
  style,
  ...props
}) {
  const nodeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return active && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !active) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    if (isVisible) {
      return;
    }

    if (typeof IntersectionObserver !== 'function') {
      setIsVisible(true);
      return;
    }

    const node = nodeRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const nextEntry = entries[0];

        if (!nextEntry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        rootMargin,
        threshold,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [active, isVisible, rootMargin, threshold]);

  return (
    <Tag
      ref={nodeRef}
      className={[
        className,
        'eli5-reveal',
        variantClassName,
        isVisible ? 'is-visible' : '',
      ].filter(Boolean).join(' ')}
      style={{
        ...style,
        '--reveal-delay': `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function ensureHeroControlWindowHost(
  popupWindow,
  depthControls = DEPTH_CONTROL_DEFAULTS,
) {
  const { document: popupDocument } = popupWindow;

  popupDocument.title = HERO_CONTROL_WINDOW_TITLE;
  applyThemeTokens(popupDocument.documentElement, {
    levelControls: LEVEL_CONTROL_DEFAULTS,
    depthControls,
  });

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
        color: var(--slate-900);
        background: var(--slate-gradient-050);
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
  collapsedSections,
  isLayoutEditing = false,
  onChange,
  onReset,
  onToggleSection,
  onStartLayoutEdit,
  onSaveLayoutEdit,
  onCancelLayoutEdit,
  onResetLayout,
  onClose,
}) {
  return (
    <aside className="eli5-control-panel eli5-depth--2" aria-label="Site control panel">
      <div className="eli5-control-panel__header">
        <div>
          <p className="eli5-control-panel__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="eli5-control-panel__caption">{caption}</p>
        </div>

        <div className="eli5-control-panel__actions">
          <button
            type="button"
            className="eli5-control-panel__reset eli5-depth--1"
            onClick={onReset}
          >
            Reset
          </button>

          {onClose ? (
            <button
              type="button"
              className="eli5-control-panel__close eli5-depth--1"
              onClick={onClose}
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      {onStartLayoutEdit || onSaveLayoutEdit || onResetLayout ? (
        <div className="eli5-control-panel__layout-tools">
          <p className="eli5-control-panel__layout-caption">
            {isLayoutEditing
              ? 'Drag the hero letters on the page, then save this composition as the new resting layout. Press / to hide or show this panel while you work.'
              : 'Use Edit Layout to drag the hero letters into place, then save that composition as the new default.'}
          </p>

          <div className="eli5-control-panel__layout-actions">
            {isLayoutEditing ? (
              <>
                <button
                  type="button"
                  className="eli5-control-panel__close eli5-depth--1"
                  onClick={onSaveLayoutEdit}
                >
                  Save Layout
                </button>
                <button
                  type="button"
                  className="eli5-control-panel__reset eli5-depth--1"
                  onClick={onCancelLayoutEdit}
                >
                  Cancel Edit
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="eli5-control-panel__close eli5-depth--1"
                  onClick={onStartLayoutEdit}
                >
                  Edit Layout
                </button>
                <button
                  type="button"
                  className="eli5-control-panel__reset eli5-depth--1"
                  onClick={onResetLayout}
                >
                  Use Reference
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="eli5-control-panel__sections">
        {sections.map((section) => {
          const isCollapsed = Boolean(collapsedSections?.[section.id]);

          return (
            <section
              key={section.id}
              className="eli5-control-section"
              data-collapsed={isCollapsed ? 'true' : undefined}
            >
              <button
                type="button"
                className="eli5-control-section__toggle"
                aria-expanded={!isCollapsed}
                onClick={() => onToggleSection?.(section.id)}
              >
                <span>{section.title}</span>
                <span className="eli5-control-section__toggle-state">
                  {isCollapsed ? 'Show' : 'Hide'}
                </span>
              </button>

              {!isCollapsed && section.detail ? (
                <p className="eli5-control-section__detail">{section.detail}</p>
              ) : null}

              {!isCollapsed ? (
                <div className="eli5-control-panel__rows">
                  {section.fields.map((field) => (
                    field.type === 'token' ? (
                      <label key={field.key} className="eli5-control-row eli5-control-row--token">
                        <span className="eli5-control-row__top">
                          <span>{field.label}</span>
                          <code className="eli5-control-row__token-name">{field.token}</code>
                        </span>
                        <textarea
                          className="eli5-control-row__textarea"
                          value={controls[field.key]}
                          rows={3}
                          spellCheck="false"
                          onChange={(event) => onChange(field.key, event.target.value)}
                        />
                      </label>
                    ) : (
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
                    )
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function LabCard({
  level,
  title,
  detail,
  tone = 'default',
  children,
}) {
  return (
    <article className={`eli5-depth-lab__card eli5-depth--0 eli5-depth-lab__card--${tone}`}>
      <div className="eli5-depth-lab__card-copy">
        <p className="eli5-depth-lab__card-level">{level}</p>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>

      <div className="eli5-depth-lab__card-demo">
        {children}
      </div>
    </article>
  );
}

function DepthLabView({
  isControlPanelVisible,
  onToggleControlPanel,
  onOpenTypographyLab,
  panelSurface,
  onReturnHome,
}) {
  return (
    <div className="eli5-page eli5-page--depth-lab">
      <CustomCursor />

      <main className="eli5-main eli5-main--depth-lab">
        <div className="eli5-depth-lab">
          <div className="eli5-depth-lab__topbar">
            <div className="eli5-depth-lab__intro">
              <p className="eli5-depth-lab__eyebrow">Depth Lab</p>
              <h1>Test the page depth stack without poking the whole landing page.</h1>
              <p>
                The grid shows the inset field, the page plane, buttons and pills, floating chrome, and the cursor. The controls on the right edit the actual tokens for each depth class.
              </p>
            </div>

            <div className="eli5-depth-lab__topbar-actions">
              <button
                type="button"
                className="eli5-button eli5-button--secondary eli5-depth--1"
                onClick={onToggleControlPanel}
              >
                {isControlPanelVisible ? 'Hide config panel' : 'Show config panel'}
              </button>

              <button
                type="button"
                className="eli5-button eli5-button--secondary eli5-depth--1"
                onClick={onOpenTypographyLab}
              >
                Open Typography Lab
              </button>

              <button
                type="button"
                className="eli5-button eli5-button--secondary eli5-depth--1"
                onClick={onReturnHome}
              >
                Back to landing page
              </button>
            </div>
          </div>

          <div className="eli5-depth-lab__layout">
            <section className="eli5-depth-lab__stage" aria-label="Depth preview grid">
              <div className="eli5-depth-lab__grid">
                <LabCard
                  level="Level -1"
                  title="Intrusion"
                  detail="This should read as pushed into the page. Shadow above. Light below."
                  tone="inset"
                >
                  <div className="eli5-prompt-field__shell eli5-depth-lab__field-demo eli5-depth--inset">
                    <span className="eli5-prompt-field__skill eli5-prompt-field__skill--printed">Skills for AI agents</span>
                    <span className="eli5-depth-lab__field-copy">Inset form field</span>
                  </div>
                </LabCard>

                <LabCard
                  level="Level 0"
                  title="Printed on the page"
                  detail="No lift. No recess. Just content sitting on the paper."
                  tone="page"
                >
                  <div className="eli5-depth-lab__page-demo eli5-depth--0">
                    <p className="eli5-depth-lab__page-kicker">Level 0 copy</p>
                    <h3>Printed surface</h3>
                    <p>
                      This is the page plane. It should feel calm and almost shadowless.
                    </p>
                  </div>
                </LabCard>

                <LabCard
                  level="Level 1"
                  title="Buttons"
                  detail="Closer to the page, so the contact shadow should be sharper and more anchored."
                  tone="button"
                >
                  <div className="eli5-depth-lab__button-row">
                    <button type="button" className="eli5-button eli5-button--primary eli5-depth--1">
                      Primary
                    </button>
                    <button type="button" className="eli5-button eli5-button--secondary eli5-depth--1">
                      Secondary
                    </button>
                  </div>
                </LabCard>

                <LabCard
                  level="Level 1"
                  title="Pill / Tab"
                  detail="Same level as the buttons, but on a smaller footprint so it is easier to judge the edge."
                  tone="pill"
                >
                  <div className="eli5-depth-lab__pill-row">
                    <span className="eli5-depth-lab__pill-sample eli5-depth--1">What it does</span>
                    <span className="eli5-depth-lab__pill-sample eli5-depth-lab__pill-sample--active eli5-depth--2">See output</span>
                  </div>
                </LabCard>

                <LabCard
                  level="Level 2"
                  title="Floating menu"
                  detail="This sits furthest from the page, so the shadow can travel more and blur more."
                  tone="menu"
                >
                  <div className="eli5-depth-lab__menu-demo eli5-depth--2">
                    <div className="eli5-depth-lab__menu-links" aria-hidden="true">
                      <span>What it does</span>
                      <span>See output</span>
                      <span>Install</span>
                    </div>
                    <button type="button" className="eli5-button eli5-button--primary eli5-button--header eli5-depth--1">
                      Download
                    </button>
                  </div>
                </LabCard>

                <LabCard
                  level="Level 3"
                  title="Cursor reference"
                  detail="Use this as the level-3 reference for now. The swatch sits on the top layer so you can judge the strongest lift next to the cursor art."
                  tone="reference"
                >
                  <div className="eli5-depth-lab__reference-row">
                    <div className="eli5-depth-lab__cursor-swatch eli5-depth--3" aria-hidden="true">
                      <span className="eli5-depth-lab__cursor-glow" />
                      <img src="/assets/cursors/pointer.png" alt="" draggable="false" />
                    </div>
                  </div>
                </LabCard>
              </div>
            </section>

            <div className="eli5-depth-lab__panel">
              {isControlPanelVisible ? (
                panelSurface
              ) : (
                <aside className="eli5-depth-lab__panel-placeholder eli5-depth--0" aria-label="Config panel placeholder">
                  <p className="eli5-depth-lab__eyebrow">Main config panel</p>
                  <h2>Use the same panel here.</h2>
                  <p>
                    Open the shared config panel in this rail, then edit the drop shadow, light edge, shadow edge, and light gradient for each depth class directly.
                  </p>

                  <button
                    type="button"
                    className="eli5-button eli5-button--secondary eli5-depth--1"
                    onClick={onToggleControlPanel}
                  >
                    Open config panel
                  </button>
                </aside>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TypographyLabSection({
  eyebrow,
  title,
  detail,
  children,
}) {
  return (
    <section className="eli5-typography-lab__section">
      <header className="eli5-typography-lab__section-header">
        <p className="eli5-depth-lab__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{detail}</p>
      </header>

      {children}
    </section>
  );
}

function TypographyLabCard({
  eyebrow,
  title,
  detail,
  selector,
  wide = false,
  children,
}) {
  return (
    <article
      className={[
        'eli5-depth-lab__card',
        'eli5-typography-lab__card',
        wide ? 'eli5-typography-lab__card--wide' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="eli5-depth-lab__card-copy">
        <p className="eli5-depth-lab__card-level">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{detail}</p>
        {selector ? (
          <code className="eli5-typography-lab__selector">{selector}</code>
        ) : null}
      </div>

      <div className="eli5-depth-lab__card-demo eli5-typography-lab__card-demo">
        {children}
      </div>
    </article>
  );
}

function TypographyLabView({
  onOpenDepthLab,
  onReturnHome,
}) {
  const preventDemoNavigation = (event) => {
    event.preventDefault();
  };

  return (
    <div className="eli5-page eli5-page--typography-lab">
      <CustomCursor />

      <main className="eli5-main eli5-main--depth-lab">
        <div className="eli5-depth-lab eli5-typography-lab">
          <div className="eli5-depth-lab__topbar">
            <div className="eli5-depth-lab__intro">
              <p className="eli5-depth-lab__eyebrow">Typography Lab</p>
              <h1>Check every live text style without hunting through the landing page.</h1>
              <p>
                These specimens use the site&apos;s actual classes, in the colors they normally show
                up in, so you can judge the real type system instead of a decorative fake one.
              </p>
            </div>

            <div className="eli5-depth-lab__topbar-actions">
              <button
                type="button"
                className="eli5-button eli5-button--secondary eli5-depth--1"
                onClick={onOpenDepthLab}
              >
                Open Depth Lab
              </button>

              <button
                type="button"
                className="eli5-button eli5-button--secondary eli5-depth--1"
                onClick={onReturnHome}
              >
                Back to landing page
              </button>
            </div>
          </div>

          <div className="eli5-typography-lab__stack">
            <TypographyLabSection
              eyebrow="Families"
              title="The site uses two font families."
              detail="One handles the readable UI. The other is reserved for the hero magnets, because one dramatic exception is enough."
            >
              <div className="eli5-typography-lab__grid">
                <TypographyLabCard
                  eyebrow="Family"
                  title="UI / body"
                  detail="This is the working voice for navigation, headings, body copy, prompts, examples, and CTAs."
                  selector="--font-ui"
                >
                  <div className="eli5-typography-lab__demo">
                    <p className="eli5-typography-lab__family-note">Outfit</p>
                    <p className="eli5-typography-lab__family-sample eli5-typography-lab__family-sample--body">
                      A clear sentence beats a grand speech.
                    </p>
                    <p className="eli5-hero__detail">
                      It stays readable at almost every size on the site and does not start showing
                      off halfway through the job.
                    </p>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Family"
                  title="Hero magnet lettering"
                  detail="Used for the hero letters only. The headline gets to be louder than the rest of the site."
                  selector="--font-magnet"
                >
                  <div className="eli5-typography-lab__demo">
                    <p className="eli5-typography-lab__family-note">Fredoka</p>
                    <p className="eli5-typography-lab__family-sample eli5-typography-lab__family-sample--magnet">
                      {"EXPLAIN IT LIKE I'M FIVE".split('').map((character, index) => (
                        <span
                          key={`magnet-sample-${index}`}
                          style={{
                            color:
                              character === ' '
                                ? 'transparent'
                                : MAGNET_COLORS[index % MAGNET_COLORS.length],
                          }}
                        >
                          {character === ' ' ? '\u00A0' : character}
                        </span>
                      ))}
                    </p>
                    <p className="eli5-hero__detail">
                      Bright, chunky, and deliberately not invited to the body copy.
                    </p>
                  </div>
                </TypographyLabCard>
              </div>
            </TypographyLabSection>

            <TypographyLabSection
              eyebrow="Chrome"
              title="Navigation, actions, and control labels stay crisp and compact."
              detail="These are the styles you keep clicking, so they need to read fast before they try to look pretty."
            >
              <div className="eli5-typography-lab__grid">
                <TypographyLabCard
                  eyebrow="Navigation"
                  title="Primary nav and example tabs"
                  detail="Pill labels use a tighter weight and smaller size than the big content headings."
                  selector=".eli5-nav a, .eli5-example-tab"
                >
                  <div className="eli5-typography-lab__demo">
                    <nav className="eli5-nav eli5-typography-lab__nav-preview" aria-label="Navigation type sample">
                      <a href="#type-nav" onClick={preventDemoNavigation}>What it does</a>
                      <a href="#type-nav" className="is-active" onClick={preventDemoNavigation}>See output</a>
                      <a href="#type-nav" onClick={preventDemoNavigation}>Install</a>
                    </nav>

                    <div className="eli5-typography-lab__row">
                      <button
                        type="button"
                        className="eli5-example-tab eli5-depth--1"
                        style={{ '--example-tab-color': 'var(--magnet-orange)' }}
                      >
                        Inflation
                      </button>
                      <button
                        type="button"
                        className="eli5-example-tab is-active eli5-depth--2"
                        style={{ '--example-tab-color': 'var(--magnet-violet)' }}
                      >
                        Banking
                      </button>
                    </div>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Actions"
                  title="Buttons"
                  detail="Primary, secondary, and header buttons share one type base, then change only by context."
                  selector=".eli5-button"
                >
                  <div className="eli5-typography-lab__demo">
                    <div className="eli5-typography-lab__row">
                      <button type="button" className="eli5-button eli5-button--primary eli5-depth--1">Download the skill</button>
                      <button type="button" className="eli5-button eli5-button--secondary eli5-depth--1">See the output</button>
                    </div>
                    <div className="eli5-typography-lab__row">
                      <button type="button" className="eli5-button eli5-button--primary eli5-button--header eli5-depth--1">Download</button>
                      <button type="button" className="eli5-button eli5-button--secondary eli5-button--header eli5-depth--1">See output</button>
                    </div>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Panel"
                  title="Control panel copy"
                  detail="The control panel keeps its labels practical: quiet eyebrow, strong title, plain caption, compact row labels."
                  selector=".eli5-control-panel*"
                  wide
                >
                  <div className="eli5-typography-lab__panel-preview">
                    <aside className="eli5-control-panel eli5-depth--2" aria-label="Control panel type specimen">
                      <div className="eli5-control-panel__header">
                        <div>
                          <p className="eli5-control-panel__eyebrow">Linked control panel</p>
                          <h2>Live page controls</h2>
                          <p className="eli5-control-panel__caption">
                            Edit each depth class directly. Every level has its own drop shadow, light edge, shadow edge, and light gradient.
                          </p>
                        </div>

                        <div className="eli5-control-panel__actions">
                          <button type="button" className="eli5-control-panel__reset eli5-depth--1">Reset</button>
                          <button type="button" className="eli5-control-panel__close eli5-depth--1">Close</button>
                        </div>
                      </div>

                      <div className="eli5-control-panel__layout-tools">
                        <p className="eli5-control-panel__layout-caption">
                          Use Edit Layout to drag the hero letters into place, then save that composition as the new default.
                        </p>

                        <div className="eli5-control-panel__layout-actions">
                          <button type="button" className="eli5-control-panel__close eli5-depth--1">Edit Layout</button>
                          <button type="button" className="eli5-control-panel__reset eli5-depth--1">Use Reference</button>
                        </div>
                      </div>

                      <section className="eli5-control-section">
                        <button type="button" className="eli5-control-section__toggle" aria-expanded="true">
                          <span>Depth 1</span>
                          <span className="eli5-control-section__toggle-state">Hide</span>
                        </button>

                        <div className="eli5-control-panel__rows">
                          <label className="eli5-control-row eli5-control-row--token">
                            <span className="eli5-control-row__top">
                              <span>Drop Shadow</span>
                              <code className="eli5-control-row__token-name">--eli5-depth-1-drop-shadow</code>
                            </span>
                            <textarea
                              className="eli5-control-row__textarea"
                              rows={3}
                              defaultValue="0px 1px 4px rgba(72, 55, 42, 0.19), 0px 5px 15px rgba(50, 39, 31, 0.04)"
                            />
                          </label>
                        </div>
                      </section>
                    </aside>
                  </div>
                </TypographyLabCard>
              </div>
            </TypographyLabSection>

            <TypographyLabSection
              eyebrow="Content"
              title="The content stack moves from loud headings to calmer body copy."
              detail="Big statements pull attention. Supporting text settles down quickly so the page still reads like help instead of theatre."
            >
              <div className="eli5-typography-lab__grid">
                <TypographyLabCard
                  eyebrow="Hero"
                  title="Hero badge, summary, detail, and compatibility line"
                  detail="The hero uses one printed badge, one stronger summary line, one calmer detail line, and a compact compatibility row."
                  selector=".eli5-hero__badge, .eli5-hero__summary, .eli5-hero__detail, .eli5-hero__compat"
                  wide
                >
                  <div className="eli5-typography-lab__demo eli5-typography-lab__hero-preview">
                    <div className="eli5-hero__badge eli5-hero__badge--printed eli5-depth--1">Skill for AI agents</div>

                    <div className="eli5-hero__notes">
                      <div className="eli5-hero__notes-copy">
                        <p className="eli5-hero__summary">An AI skill for answers you can follow.</p>
                        <p className="eli5-hero__detail">
                          Install it in any AI agent. Ask one question. Get five versions of the
                          answer, from simple to precise.
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
                    </div>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Prompts"
                  title="Prompt field labels"
                  detail="Labels stay quiet. The prompt itself gets the stronger weight."
                  selector=".eli5-prompt-field*"
                >
                  <div className="eli5-prompt-field">
                    <p className="eli5-prompt-field__label">What you ask</p>
                    <div className="eli5-prompt-field__shell eli5-depth--inset">
                      <span className="eli5-prompt-field__skill eli5-prompt-field__skill--printed">Skills for AI agents</span>
                      <span className="eli5-prompt-field__text">Explain inflation like I&apos;m five</span>
                      <span className="eli5-prompt-field__cursor" aria-hidden="true" />
                    </div>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Headings"
                  title="Section heading and intro copy"
                  detail="The main section headline gets the largest UI type. The paragraph underneath does the explaining."
                  selector=".eli5-section-heading h2, .eli5-section-heading p"
                >
                  <div className="eli5-section-heading eli5-typography-lab__section-heading-sample">
                    <h2>What this skill does</h2>
                    <p>
                      You ask one question and get the answer in five passes, starting simple and
                      building toward the fuller version as you keep reading.
                    </p>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Supporting copy"
                  title="Benefit cards and use-case labels"
                  detail="These carry the explanatory load, so they stay readable first and decorative second."
                  selector=".eli5-how-benefit*, .eli5-how__use-cases*"
                >
                  <div className="eli5-typography-lab__demo">
                    <article className="eli5-how-benefit">
                      <div className="eli5-how-benefit__copy">
                        <h3>People can start simple and keep going.</h3>
                        <p>
                          The first version gets them oriented. The later ones add the proper detail
                          without forcing a second explanation request.
                        </p>
                      </div>
                    </article>

                    <div className="eli5-how__use-cases">
                      <p className="eli5-how__use-cases-label">Great for</p>
                      <div className="eli5-how__use-cases-list">
                        <span className="eli5-how__use-case">Docs</span>
                        <span className="eli5-how__use-case">Meetings</span>
                        <span className="eli5-how__use-case">Teaching</span>
                      </div>
                    </div>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Media"
                  title="Sticky media summary"
                  detail="The media card uses a stronger mid-size line so the ask/write contrast still reads under motion and video."
                  selector=".eli5-gif-card__summary-text"
                >
                  <div className="eli5-gif-card__frame eli5-typography-lab__gif-preview eli5-depth--0">
                    <div className="eli5-gif-card__summary" aria-label="What the skill outputs">
                      <div className="eli5-gif-card__summary-row">
                        <p className="eli5-gif-card__summary-text eli5-gif-card__summary-text--ask">
                          Ask one question.
                        </p>
                        <div className="eli5-gif-card__summary-icon" aria-hidden="true">
                          <svg
                            className="eli5-gif-card__summary-icon-svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 12h12" />
                            <path d="m13 7 5 5-5 5" />
                          </svg>
                        </div>
                        <p className="eli5-gif-card__summary-text eli5-gif-card__summary-text--write">
                          Get five clearer versions back.
                        </p>
                      </div>

                      <button type="button" className="eli5-button eli5-button--secondary eli5-gif-card__summary-action eli5-depth--1">
                        See the output
                      </button>
                    </div>
                  </div>
                </TypographyLabCard>
              </div>
            </TypographyLabSection>

            <TypographyLabSection
              eyebrow="Examples and proof"
              title="Examples, citations, and install steps keep the hierarchy obvious."
              detail="Small labels guide the scan. Titles stay distinct. Proof copy should read quickly without turning into tiny grey dust."
            >
              <div className="eli5-typography-lab__grid">
                <TypographyLabCard
                  eyebrow="Examples"
                  title="Example prompt and output"
                  detail="Blue labels flag the example system. The body copy does the actual explaining."
                  selector=".eli5-example-thread*, .eli5-example-output*"
                  wide
                >
                  <div className="eli5-typography-lab__example-preview">
                    <div className="eli5-example-thread">
                      <p className="eli5-example-thread__category">Example prompt</p>

                      <div className="eli5-prompt-field eli5-example-thread__prompt">
                        <div className="eli5-prompt-field__shell eli5-depth--inset">
                          <span className="eli5-prompt-field__skill eli5-prompt-field__skill--printed">Explain It Like I&apos;m Five</span>
                          <span className="eli5-prompt-field__text">Why do we have a surplus?</span>
                          <span className="eli5-prompt-field__cursor" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="eli5-example-output">
                        <p className="eli5-example-output__entry">
                          <span className="eli5-example-output__label">5:</span>{' '}
                          More came in than went out.
                        </p>
                        <p className="eli5-example-output__separator" aria-hidden="true">---------------</p>
                        <p className="eli5-example-output__entry">
                          <span className="eli5-example-output__label">12:</span>{' '}
                          A surplus means income or supply was higher than spending or demand for that period.
                        </p>
                      </div>
                    </div>
                  </div>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="Install"
                  title="Install steps"
                  detail="Step labels stay pale. The title does the directing. The body handles the plain-English instruction."
                  selector=".eli5-install-step*"
                >
                  <article className="eli5-install-step">
                    <div className="eli5-install-step__copy">
                      <p className="eli5-install-step__index">Step 1</p>
                      <h3>Drop the skill file into your agent setup.</h3>
                      <p>
                        Codex, Claude Code, Cursor, and similar agents can load it from Markdown.
                      </p>
                    </div>
                  </article>
                </TypographyLabCard>

                <TypographyLabCard
                  eyebrow="References"
                  title="Science cards and source lines"
                  detail="Sources run in a lighter horizontal row so they stay visible without pulling focus from the point."
                  selector=".eli5-science-point*"
                >
                  <article className="eli5-science-point eli5-depth--0">
                    <div>
                      <h3>Keep the citation readable.</h3>
                      <p>
                        The point card uses a muted heading, a steady body size, and a very small
                        source treatment so the evidence stays visible without taking over the room.
                      </p>

                      <div className="eli5-science-point__sources">
                        <div className="eli5-science-point__source-list">
                          <a
                            className="eli5-science-point__source"
                            href="#source-1"
                            onClick={preventDemoNavigation}
                          >
                            <span>Clark and Mayer</span>
                            <span>eLearning and the Science of Instruction</span>
                          </a>
                          <a
                            className="eli5-science-point__source"
                            href="#source-2"
                            onClick={preventDemoNavigation}
                          >
                            <span>Plain Language Action</span>
                            <span>Short sentences and structured information</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </TypographyLabCard>
              </div>
            </TypographyLabSection>

            <TypographyLabSection
              eyebrow="Endgame"
              title="The CTA goes bigger, but it still explains itself."
              detail="This block stays direct: what it is, where it works, and one clean action."
            >
              <div className="eli5-typography-lab__grid">
                <TypographyLabCard
                  eyebrow="CTA"
                  title="End-of-page call to action"
                  detail="Simple headline, short body copy, and a formal footer with clear navigation."
                  selector=".eli5-cta*, .eli5-site-footer*"
                  wide
                >
                  <div className="eli5-typography-lab__cta-preview">
                    <div className="eli5-cta eli5-depth--2">
                      <h2>Get clearer answers.</h2>
                      <p className="eli5-cta__support">One question in. Five clearer versions out.</p>
                      <p className="eli5-cta__body">
                        Explain It Like I&apos;m Five is a Markdown skill for AI agents. It rewrites
                        one answer into five levels and works in Codex, Claude Code, Cursor, and similar tools.
                      </p>
                      <button
                        type="button"
                        className="eli5-button eli5-button--primary eli5-button--large eli5-button--cta-download eli5-depth--1"
                      >
                        Download the skill
                      </button>
                    </div>

                    <footer className="eli5-site-footer eli5-site-footer--preview eli5-depth--0" aria-label="Preview footer">
                      <div className="eli5-site-footer__brand">
                        <p className="eli5-site-footer__title">Explain It Like I&apos;m Five</p>
                        <p className="eli5-site-footer__summary">
                          Markdown skill for AI agents with five explanation levels.
                        </p>
                      </div>
                      <div className="eli5-site-footer__links">
                        <div className="eli5-site-footer__column">
                          <p className="eli5-site-footer__heading">Product</p>
                          <a href="#footer-how" onClick={preventDemoNavigation}>What it does</a>
                          <a href="#footer-output" onClick={preventDemoNavigation}>See output</a>
                          <a href="#footer-install" onClick={preventDemoNavigation}>How to install</a>
                        </div>
                        <div className="eli5-site-footer__column">
                          <p className="eli5-site-footer__heading">Works with</p>
                          <span>Codex</span>
                          <span>Claude Code</span>
                          <span>Cursor</span>
                        </div>
                        <div className="eli5-site-footer__column">
                          <p className="eli5-site-footer__heading">Resources</p>
                          <a href="#footer-download" onClick={preventDemoNavigation}>Download skill</a>
                          <a href="#footer-coffee" onClick={preventDemoNavigation}>Buy me a coffee</a>
                        </div>
                      </div>
                    </footer>
                  </div>
                </TypographyLabCard>
              </div>
            </TypographyLabSection>
          </div>
        </div>
      </main>
    </div>
  );
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  );
}

function TypedPromptField({
  label,
  skill,
  prompt,
  className = '',
  ariaLabel,
}) {
  const rootClassName = className
    ? `eli5-prompt-field ${className}`
    : 'eli5-prompt-field';

  return (
    <div className={rootClassName}>
      {label ? <span className="eli5-prompt-field__label">{label}</span> : null}

      <div
        className="eli5-prompt-field__shell eli5-depth--inset"
        aria-label={ariaLabel ?? `${skill} ${prompt}`}
      >
        <span className="eli5-prompt-field__skill">{skill}</span>
        <span className="eli5-prompt-field__text">
          {prompt}
          <span className="eli5-prompt-field__cursor" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function ExampleTopicTabs({
  examples,
  activeSlug,
  onSelect,
}) {
  const focusTargetIndexRef = useRef(null);
  const transitionTimeoutRef = useRef(0);
  const resetFrameRef = useRef(0);
  const activeIndex = Math.max(0, examples.findIndex((example) => example.slug === activeSlug));
  const [committedIndex, setCommittedIndex] = useState(activeIndex);
  const [queuedSteps, setQueuedSteps] = useState(0);
  const [stepOffset, setStepOffset] = useState(0);
  const [phase, setPhase] = useState('idle');
  const isAnimating = phase === 'animating';
  const isResetting = phase === 'resetting';

  const clearPendingTransition = useEffectEvent(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.clearTimeout(transitionTimeoutRef.current);
    window.cancelAnimationFrame(resetFrameRef.current);
    transitionTimeoutRef.current = 0;
    resetFrameRef.current = 0;
  });

  const focusExampleIndex = useEffectEvent((nextIndex) => {
    const targetExample = examples[nextIndex];

    if (typeof window === 'undefined' || !targetExample) {
      return;
    }

    window.requestAnimationFrame(() => {
      document
        .getElementById(`example-tab-${targetExample.slug}`)
        ?.focus();
    });
  });

  const finishTransition = useEffectEvent((completedOffset) => {
    clearPendingTransition();
    const nextIndex = wrapIndex(committedIndex + completedOffset, examples.length);

    flushSync(() => {
      setPhase('resetting');
      setCommittedIndex(nextIndex);
      setQueuedSteps(0);
      setStepOffset(0);
    });

    if (typeof window !== 'undefined') {
      resetFrameRef.current = window.requestAnimationFrame(() => {
        setPhase('idle');
        resetFrameRef.current = 0;

        if (focusTargetIndexRef.current === nextIndex) {
          focusExampleIndex(nextIndex);
          focusTargetIndexRef.current = null;
        }
      });
    } else {
      setPhase('idle');

      if (focusTargetIndexRef.current === nextIndex) {
        focusExampleIndex(nextIndex);
        focusTargetIndexRef.current = null;
      }
    }

    const nextSlug = examples[nextIndex]?.slug ?? activeSlug;
    onSelect(nextSlug);
  });

  useEffect(() => () => {
    clearPendingTransition();
  }, [clearPendingTransition]);

  useEffect(() => {
    if (!activeSlug || isAnimating || isResetting || queuedSteps !== 0) {
      return;
    }

    const externalIndex = examples.findIndex((example) => example.slug === activeSlug);

    if (externalIndex < 0 || externalIndex === committedIndex) {
      return;
    }

    setCommittedIndex(externalIndex);
  }, [activeSlug, committedIndex, examples, isAnimating, isResetting, queuedSteps]);

  useEffect(() => {
    if (examples.length === 0 || phase !== 'idle' || queuedSteps === 0) {
      return;
    }

    const nextStepOffset = queuedSteps;
    const nextIndex = wrapIndex(committedIndex + nextStepOffset, examples.length);
    const nextExample = examples[nextIndex];

    if (!nextExample) {
      return;
    }

    setStepOffset(nextStepOffset);
    setPhase('animating');

    if (typeof window === 'undefined') {
      finishTransition(nextStepOffset);
      return;
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      finishTransition(nextStepOffset);
    }, EXAMPLE_TAB_TRANSITION_MS + 40);
  }, [
    committedIndex,
    finishTransition,
    examples,
    phase,
    queuedSteps,
  ]);

  const selectIndexImmediately = (nextIndex, shouldFocus = false) => {
    const wrappedIndex = wrapIndex(nextIndex, examples.length);
    const targetExample = examples[wrappedIndex];

    if (!targetExample) {
      return;
    }

    clearPendingTransition();
    focusTargetIndexRef.current = shouldFocus ? wrappedIndex : null;
    setQueuedSteps(0);
    setStepOffset(0);
    setPhase('idle');
    setCommittedIndex(wrappedIndex);
    onSelect(targetExample.slug);

    if (shouldFocus) {
      focusExampleIndex(wrappedIndex);
    }
  };

  const queueStep = (offset, shouldFocus = false) => {
    const nextIndex = wrapIndex(committedIndex + offset, examples.length);
    const targetExample = examples[nextIndex];

    if (!targetExample) {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      selectIndexImmediately(nextIndex, shouldFocus);
      return;
    }

    if (phase !== 'idle' || queuedSteps !== 0) {
      return;
    }

    focusTargetIndexRef.current = shouldFocus ? nextIndex : null;
    setQueuedSteps(offset);
  };

  const queueSelection = (nextIndex, shouldFocus = false) => {
    const wrappedIndex = wrapIndex(nextIndex, examples.length);
    const targetExample = examples[wrappedIndex];

    if (!targetExample) {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      selectIndexImmediately(wrappedIndex, shouldFocus);
      return;
    }

    if (phase !== 'idle' || queuedSteps !== 0) {
      return;
    }

    const delta = wrapIndex(wrappedIndex - committedIndex, examples.length);

    if (delta === 0) {
      if (shouldFocus) {
        focusExampleIndex(wrappedIndex);
      }
      return;
    }

    focusTargetIndexRef.current = shouldFocus ? wrappedIndex : null;
    setQueuedSteps(delta);
  };

  const handleTabKeyDown = (event, index) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        queueStep(1, true);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        queueStep(-1, true);
        break;
      case 'Home':
        event.preventDefault();
        selectIndexImmediately(0, true);
        break;
      case 'End':
        event.preventDefault();
        selectIndexImmediately(examples.length - 1, true);
        break;
      default:
        break;
    }
  };

  const handleTrackTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform' || !isAnimating) {
      return;
    }

    finishTransition(stepOffset);
  };

  const tabTrack = getExampleTabRingItems(examples, committedIndex);
  const trackShift = isAnimating
    ? `${-stepOffset * EXAMPLE_TAB_STEP}px`
    : '0px';

  return (
    <div
      className="eli5-example-tabs"
      style={{
        '--example-tab-item-height': `${EXAMPLE_TAB_HEIGHT}px`,
        '--example-tab-gap': `${EXAMPLE_TAB_GAP}px`,
        '--example-tab-step': `${EXAMPLE_TAB_STEP}px`,
        '--example-tab-viewport-height': `${EXAMPLE_TAB_VIEWPORT_HEIGHT}px`,
      }}
    >
      <div className="eli5-example-tabs__viewport">
        <div className="eli5-example-tabs__measure" aria-hidden="true">
          {examples.map((example, exampleIndex) => {
            return (
              <span
                key={`measure-${example.slug}`}
                className="eli5-example-tab eli5-example-tab--measure"
                style={{
                  '--example-tab-color': getExampleTabIdentityColor(exampleIndex),
                  '--example-tab-tilt': '0deg',
                  '--example-tab-scale': '1',
                }}
              >
                {example.subject}
              </span>
            );
          })}
        </div>

        <div
          className={`eli5-example-tabs__list${isResetting ? ' is-resetting' : ''}`}
          role="tablist"
          aria-label="Example topics"
          aria-orientation="vertical"
          style={{
            '--example-tab-track-shift': trackShift,
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {tabTrack.map((item) => {
            const {
              example,
              exampleIndex,
              slotIndex,
            } = item;
            const isActive = example.slug === activeSlug;
            const sourceVisuals = getExampleTabSlotVisuals(slotIndex);
            const targetSlotIndex = isAnimating
              ? slotIndex - stepOffset
              : slotIndex;
            const visualState = getExampleTabSlotVisuals(targetSlotIndex);
            const exampleColor = getExampleTabIdentityColor(exampleIndex);
            const isWithinVisibleRange = slotIndex >= 0 && slotIndex < EXAMPLE_TAB_VISIBLE_COUNT;
            const isAriaVisible = isAnimating
              ? visualState.isVisible
              : isWithinVisibleRange;

            return (
              <div
                key={`slot-${slotIndex}`}
                className="eli5-example-tabs__slot"
                style={{
                  '--example-tab-slot-y': `${sourceVisuals.offsetY}px`,
                  '--example-tab-layer': visualState.layer,
                  pointerEvents: phase === 'idle' && isWithinVisibleRange ? undefined : 'none',
                }}
                aria-hidden={isAriaVisible ? undefined : 'true'}
              >
                <button
                  id={`example-tab-${example.slug}`}
                  type="button"
                  role="tab"
                  tabIndex={isActive && phase === 'idle' && isWithinVisibleRange ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls={`example-panel-${example.slug}`}
                  className={`eli5-example-tab ${isActive ? 'eli5-depth--2 is-active' : 'eli5-depth--1'}${isResetting ? ' is-resetting' : ''}`}
                  style={{
                    '--example-tab-color': exampleColor,
                    '--example-tab-tilt': `${visualState.tilt}deg`,
                    '--example-tab-scale': visualState.scale.toFixed(3),
                  }}
                  onClick={() => {
                    if (phase === 'idle' && queuedSteps === 0) {
                      queueSelection(exampleIndex, true);
                    }
                  }}
                  onKeyDown={(event) => handleTabKeyDown(event, exampleIndex)}
                >
                  {example.subject}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="eli5-example-tabs__controls" aria-label="Scroll topics">
        <button
          type="button"
          className="eli5-example-tabs__chevron eli5-depth--2"
          onClick={() => queueStep(-1)}
          aria-label="Show previous topic"
        >
          <ExampleChevronIcon className="eli5-example-tabs__chevron-icon" />
        </button>

        <button
          type="button"
          className="eli5-example-tabs__chevron eli5-depth--2 eli5-example-tabs__chevron--down"
          onClick={() => queueStep(1)}
          aria-label="Show next topic"
        >
          <ExampleChevronIcon className="eli5-example-tabs__chevron-icon" />
        </button>
      </div>
    </div>
  );
}

function ScrollScrubMedia({
  trackRef,
  topVh = 35,
  label,
  motionControls,
}) {
  const wrapRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);

  useStickyEase({
    shellRef: wrapRef,
    contentRef,
    trackRef,
    motionControls,
  });

  const syncFrame = useEffectEvent(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const wrapNode = wrapRef.current;
    const videoNode = videoRef.current;
    const trackNode = trackRef.current;

    if (!wrapNode || !videoNode || !trackNode) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (videoNode.currentTime !== 0) {
        videoNode.currentTime = 0;
      }
      return;
    }

    const duration = videoNode.duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const trackRect = trackNode.getBoundingClientRect();
    const stickyHeight = wrapNode.offsetHeight;
    const stickyTop = window.innerHeight * (topVh / 100);
    const { progress } = getStickyTrackProgress(trackRect, stickyHeight, stickyTop);
    const nextTime = progress * duration;

    if (Math.abs(videoNode.currentTime - nextTime) < 1 / 30) {
      return;
    }

    videoNode.currentTime = nextTime;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const videoNode = videoRef.current;

    if (!videoNode) {
      return;
    }

    let frameRequested = false;
    let frameId = 0;

    const requestSync = () => {
      if (frameRequested) {
        return;
      }

      frameRequested = true;
      frameId = window.requestAnimationFrame(() => {
        frameRequested = false;
        syncFrame();
      });
    };

    const handleMediaReady = () => {
      videoNode.pause();
      requestSync();
    };

    videoNode.pause();
    videoNode.addEventListener('loadedmetadata', handleMediaReady);
    videoNode.addEventListener('loadeddata', handleMediaReady);
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);

    if (videoNode.readyState >= 1) {
      handleMediaReady();
    } else {
      requestSync();
    }

    return () => {
      videoNode.removeEventListener('loadedmetadata', handleMediaReady);
      videoNode.removeEventListener('loadeddata', handleMediaReady);
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
      window.cancelAnimationFrame(frameId);
    };
  }, [topVh, trackRef]);

  return (
    <div
      ref={wrapRef}
      className="eli5-gif-wrap"
      style={{ '--eli5-gif-sticky-top': `${topVh}vh` }}
    >
      <div ref={contentRef} className="eli5-sticky-ease">
        <div className="eli5-gif-card__frame eli5-depth--0">
          <video
            ref={videoRef}
            className="eli5-gif-card__media"
            src={HOW_GIF_VIDEO}
            poster={HOW_GIF_POSTER}
            muted
            playsInline
            preload="auto"
            aria-label={label}
          />

          <div className="eli5-gif-card__summary" aria-label="What the skill outputs">
            <div className="eli5-gif-card__summary-row">
              <p className="eli5-gif-card__summary-text eli5-gif-card__summary-text--ask">
                Ask one question
              </p>

              <div className="eli5-gif-card__summary-icon" aria-hidden="true">
                <svg
                  className="eli5-gif-card__summary-icon-svg"
                  viewBox="0 0 24 24"
                  focusable="false"
                >
                  <path
                    d="M5 12h12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <path
                    d="m13 7 5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="eli5-gif-card__summary-text eli5-gif-card__summary-text--write">
                Get five clearer versions back
              </p>
            </div>

            <a
              className="eli5-button eli5-button--secondary eli5-gif-card__summary-action eli5-depth--1"
              href="#install"
            >
              How to install
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const heroStageRef = useRef(null);
  const playfieldBoardRef = useRef(null);
  const howSectionRef = useRef(null);
  const controlPanelWindowRef = useRef(null);
  const [appView, setAppView] = useState(() => readAppView());
  const [activeExampleSlug, setActiveExampleSlug] = useState(EXAMPLES[0]?.slug ?? '');
  const [heroTitleSlot, setHeroTitleSlot] = useState(() =>
    buildHeroTitleSlot(buildFallbackBoardRects().hero),
  );
  const [heroMagnetControls, setHeroMagnetControls] = useState(() =>
    loadHeroMagnetControls(),
  );
  const [depthControls, setDepthControls] = useState(() =>
    loadDepthControls(),
  );
  const [heroSavedLayout, setHeroSavedLayout] = useState(() =>
    loadHeroLayout(),
  );
  const [heroDraftLayout, setHeroDraftLayout] = useState(() =>
    loadHeroLayout(),
  );
  const [isHeroLayoutEditing, setIsHeroLayoutEditing] = useState(false);
  const [collapsedControlSections, setCollapsedControlSections] = useState(() =>
    loadControlPanelSectionState(),
  );
  const [controlPanelHost, setControlPanelHost] = useState(null);
  const [isInlineFallbackOpen, setIsInlineFallbackOpen] = useState(false);
  const [loadStage, setLoadStage] = useState(() => getInitialLoadStage());
  const [magnetSeed, setMagnetSeed] = useState([]);
  const levelControls = LEVEL_CONTROL_DEFAULTS;
  const activeHeroLayout = isHeroLayoutEditing
    ? heroDraftLayout
    : heroSavedLayout;

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
    const heroLayoutForRender = activeHeroLayout;
    const provisionalHeroSlot = buildHeroTitleSlot(resolvedHeroStageRect);
    const nextHeroSlot = provisionalHeroSlot;
    const nextHeroRect = {
      left: 0,
      top: 0,
      width: nextHeroSlot.width,
      height: nextHeroSlot.height,
    };
    const nextSeed = applyPersistedHeroLayout(
      buildRuntimeMagnets({
        hero: nextHeroRect,
        playfield: playfieldRect,
      }, heroMagnetControls, levelControls),
      nextHeroRect,
      heroLayoutForRender,
    );

    setHeroTitleSlot(nextHeroSlot);

    if (nextSeed.length === 0) {
      return;
    }

    setMagnetSeed(nextSeed);
  });

  useLayoutEffect(() => {
    syncMagnetSeed();

    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => syncMagnetSeed())
      : null;

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

  useLayoutEffect(() => {
    syncMagnetSeed();
  }, [activeHeroLayout, heroMagnetControls, levelControls]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timers = [];

    const clearTimers = () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timers = [];
    };

    const startLoadSequence = () => {
      clearTimers();

      if (mediaQuery.matches) {
        setLoadStage(FINAL_LOAD_STAGE);
        return;
      }

      setLoadStage(0);
      timers = LOAD_TIMELINE.map(({ stage, delay }) =>
        window.setTimeout(() => {
          setLoadStage((current) => (current < stage ? stage : current));
        }, delay),
      );
    };

    const handleMotionPreferenceChange = (event) => {
      if (event.matches) {
        clearTimers();
        setLoadStage(FINAL_LOAD_STAGE);
        return;
      }

      startLoadSequence();
    };

    startLoadSequence();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    } else {
      mediaQuery.addListener(handleMotionPreferenceChange);
    }

    return () => {
      clearTimers();

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
      } else {
        mediaQuery.removeListener(handleMotionPreferenceChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    applyThemeTokens(document.documentElement, {
      levelControls,
      depthControls,
    });

    if (controlPanelWindowRef.current && !controlPanelWindowRef.current.closed) {
      applyThemeTokens(controlPanelWindowRef.current.document.documentElement, {
        levelControls,
        depthControls,
      });
    }
  }, [depthControls, levelControls]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(HERO_CONTROL_STORAGE_KEY);

    HERO_CONTROL_STORAGE_DEPRECATED_KEYS.forEach((storageKey) => {
      window.localStorage.removeItem(storageKey);
    });
  }, [heroMagnetControls]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      DEPTH_CONTROL_STORAGE_KEY,
      JSON.stringify(depthControls),
    );
  }, [depthControls]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      CONTROL_PANEL_SECTION_STORAGE_KEY,
      JSON.stringify(collapsedControlSections),
    );
  }, [collapsedControlSections]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(HERO_LAYOUT_STORAGE_KEY);

    HERO_LAYOUT_STORAGE_DEPRECATED_KEYS.forEach((storageKey) => {
      window.localStorage.removeItem(storageKey);
    });
  }, [heroSavedLayout]);

  useEffect(() => {
    const handlePopState = () => {
      setAppView(readAppView());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (appView === APP_VIEWS.home) {
      return;
    }

    const shouldKeepPanelOpen = isInlineFallbackOpen || Boolean(controlPanelHost);

    if (controlPanelWindowRef.current && !controlPanelWindowRef.current.closed) {
      controlPanelWindowRef.current.close();
    }

    controlPanelWindowRef.current = null;
    setControlPanelHost(null);
    setIsInlineFallbackOpen(appView === APP_VIEWS.depthLab ? shouldKeepPanelOpen : false);
  }, [appView, controlPanelHost, isInlineFallbackOpen]);

  const handlePanelControlChange = useEffectEvent((key, value) => {
    if (DEPTH_CONTROL_KEYS.has(key)) {
      setDepthControls((current) =>
        sanitizeDepthControls({
          ...current,
          [key]: value,
        }),
      );
      return;
    }

    setHeroMagnetControls((current) =>
      sanitizeHeroMagnetControls({
        ...current,
        [key]: value,
      }),
    );
  });

  const handlePanelControlReset = useEffectEvent(() => {
    setHeroMagnetControls(HERO_MAGNET_DEFAULTS);
    setDepthControls(DEPTH_CONTROL_DEFAULTS);
  });

  const handleToggleControlSection = useEffectEvent((sectionId) => {
    setCollapsedControlSections((current) =>
      sanitizeControlPanelSectionState({
        ...current,
        [sectionId]: !current[sectionId],
      }),
    );
  });

  const handleStartHeroLayoutEdit = useEffectEvent(() => {
    setHeroDraftLayout(sanitizeHeroLayout(heroSavedLayout));
    setIsInlineFallbackOpen(true);

    if (controlPanelWindowRef.current && !controlPanelWindowRef.current.closed) {
      controlPanelWindowRef.current.close();
    }

    controlPanelWindowRef.current = null;
    setControlPanelHost(null);
    setIsHeroLayoutEditing(true);
  });

  const handleCancelHeroLayoutEdit = useEffectEvent(() => {
    setHeroDraftLayout(sanitizeHeroLayout(heroSavedLayout));
    setIsHeroLayoutEditing(false);
  });

  const handleSaveHeroLayoutEdit = useEffectEvent(() => {
    const nextLayout = sanitizeHeroLayout(heroDraftLayout);
    setHeroSavedLayout(nextLayout);
    setHeroDraftLayout(nextLayout);
    setIsHeroLayoutEditing(false);
  });

  const handleResetHeroLayout = useEffectEvent(() => {
    const referenceLayout = getReferenceHeroLayout();
    setHeroSavedLayout(referenceLayout);
    setHeroDraftLayout(referenceLayout);
    setIsHeroLayoutEditing(false);
  });

  const handleHeroLayoutDraftCommit = useEffectEvent((layoutPatch) => {
    setHeroDraftLayout((current) =>
      sanitizeHeroLayout({
        ...current,
        ...layoutPatch,
      }),
    );
  });

  const handleExternalPanelClose = useEffectEvent(() => {
    setIsInlineFallbackOpen(false);
    setControlPanelHost(null);

    if (controlPanelWindowRef.current && !controlPanelWindowRef.current.closed) {
      controlPanelWindowRef.current.close();
    }

    controlPanelWindowRef.current = null;
  });

  const openExternalControlPanel = useEffectEvent(() => {
    if (appView === APP_VIEWS.depthLab) {
      setIsInlineFallbackOpen(true);
      return;
    }

    if (appView === APP_VIEWS.typographyLab) {
      return;
    }

    if (isHeroLayoutEditing) {
      setIsInlineFallbackOpen(true);
      return;
    }

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
    const nextHost = ensureHeroControlWindowHost(popupWindow, depthControls);
    setControlPanelHost(nextHost);
    popupWindow.focus();
  });

  const toggleControlPanelVisibility = useEffectEvent(() => {
    if (appView === APP_VIEWS.depthLab) {
      setIsInlineFallbackOpen((current) => !current);
      return;
    }

    if (appView === APP_VIEWS.typographyLab) {
      return;
    }

    if (isHeroLayoutEditing) {
      setIsInlineFallbackOpen((current) => !current);
      return;
    }

    if (controlPanelHost || isInlineFallbackOpen) {
      handleExternalPanelClose();
      return;
    }

    openExternalControlPanel();
  });

  const handleSetAppView = useEffectEvent((nextView) => {
    writeAppView(nextView);
    setAppView(nextView);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key !== '/' && event.code !== 'Slash') {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();
      toggleControlPanelVisibility();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appView, toggleControlPanelVisibility]);

  const activeExample =
    EXAMPLES.find((example) => example.slug === activeExampleSlug) ?? EXAMPLES[0];
  const panelControls = {
    ...heroMagnetControls,
    ...depthControls,
  };
  const panelSections = [
    ...HERO_CONTROL_SECTIONS,
    ...DEPTH_CONTROL_SECTIONS,
  ];
  const hasEnteredLoadCue = (cue) => loadStage >= cue;
  const isControlPanelVisible = isInlineFallbackOpen || Boolean(controlPanelHost);
  const isDepthLabView = appView === APP_VIEWS.depthLab;
  const isTypographyLabView = appView === APP_VIEWS.typographyLab;
  const sharedPanelCaption =
    'Edit each depth class directly. Every level has its own drop shadow, light edge, shadow edge, and light gradient.';
  const sharedPanelProps = {
    eyebrow: 'Linked control panel',
    title: 'Live page controls',
    caption: sharedPanelCaption,
    controls: panelControls,
    sections: panelSections,
    collapsedSections: collapsedControlSections,
    onChange: handlePanelControlChange,
    onReset: handlePanelControlReset,
    onToggleSection: handleToggleControlSection,
  };

  if (isDepthLabView) {
    return (
      <DepthLabView
        isControlPanelVisible={isInlineFallbackOpen}
        onToggleControlPanel={toggleControlPanelVisibility}
        onOpenTypographyLab={() => handleSetAppView(APP_VIEWS.typographyLab)}
        panelSurface={<ControlPanelSurface {...sharedPanelProps} />}
        onReturnHome={() => handleSetAppView(APP_VIEWS.home)}
      />
    );
  }

  if (isTypographyLabView) {
    return (
      <TypographyLabView
        onOpenDepthLab={() => handleSetAppView(APP_VIEWS.depthLab)}
        onReturnHome={() => handleSetAppView(APP_VIEWS.home)}
      />
    );
  }

  return (
    <div className="eli5-page" data-load-stage={loadStage}>
      <CustomCursor />
      <main className="eli5-main">
        <div className="eli5-shell">
          <div className="eli5-surface">
            <header
              className={getLoadItemClass(
                'eli5-header eli5-depth--2',
                hasEnteredLoadCue(LOAD_CUES.header),
                'eli5-load-item--header',
              )}
            >
              <nav className="eli5-nav" aria-label="Primary">
                <a href="#how">What it does</a>
                <a href="#examples">See output</a>
                <a href="#install">Install</a>
              </nav>

              <div className="eli5-header__actions">
                <DownloadLink className="eli5-button eli5-button--primary eli5-button--header eli5-depth--1">
                  Download
                </DownloadLink>
              </div>
            </header>

            <>
                <section id="hero" className="eli5-hero">
                  <div ref={heroStageRef} className="eli5-hero-stage">
                    <h1 className="eli5-sr-only">Explain It Like I&apos;m Five</h1>

                    <div
                      className={getLoadItemClass(
                        'eli5-hero__badge eli5-hero__badge--printed eli5-depth--1',
                        hasEnteredLoadCue(LOAD_CUES.heroBadge),
                        'eli5-load-item--badge',
                      )}
                    >
                      {HERO_COPY.badge}
                    </div>

                    <div
                      className={getLoadItemClass(
                        'eli5-hero__magnet-slot',
                        hasEnteredLoadCue(LOAD_CUES.heroTitle),
                        'eli5-load-item--hero-title',
                      )}
                      data-magnet-board="hero"
                      data-layout-editing={isHeroLayoutEditing ? 'true' : undefined}
                      aria-hidden="true"
                      style={{
                        height: heroTitleSlot.height ? `${heroTitleSlot.height}px` : undefined,
                      }}
                    >
                      {magnetSeed.length > 0 ? (
                        <MagnetCanvas
                          className={`eli5-magnet-layer${isHeroLayoutEditing ? ' is-layout-editing' : ''}`}
                          magnets={magnetSeed}
                          introEnabled={hasEnteredLoadCue(LOAD_CUES.heroTitle)}
                          motionConfig={heroMagnetControls}
                          localCoordinates
                          layoutEditing={isHeroLayoutEditing}
                          onLayoutCommit={handleHeroLayoutDraftCommit}
                        />
                      ) : null}
                    </div>

                    <div
                      className={getLoadItemClass(
                        'eli5-hero__notes',
                        hasEnteredLoadCue(LOAD_CUES.heroNotes),
                        'eli5-load-item--hero-notes',
                      )}
                    >
                      <div className="eli5-hero__notes-copy">
                        <RevealOnView
                          as="p"
                          active={hasEnteredLoadCue(LOAD_CUES.heroNotes)}
                          className="eli5-hero__summary"
                          delay={40}
                          variantClassName="eli5-reveal--soft"
                        >
                          {HERO_COPY.summary}
                        </RevealOnView>
                        <RevealOnView
                          as="p"
                          active={hasEnteredLoadCue(LOAD_CUES.heroNotes)}
                          className="eli5-hero__detail"
                          delay={170}
                          variantClassName="eli5-reveal--soft"
                        >
                          {HERO_COPY.detail}
                        </RevealOnView>
                      </div>

                      <div className="eli5-hero__compat" aria-label="Supported tools">
                        <RevealOnView
                          as="span"
                          active={hasEnteredLoadCue(LOAD_CUES.heroNotes)}
                          className="eli5-hero__compat-label"
                          delay={280}
                          variantClassName="eli5-reveal--soft"
                        >
                          {HERO_COPY.compatLabel}
                        </RevealOnView>
                        {COMPAT_TOOLS.map((tool, index) => (
                          <RevealOnView
                            as="span"
                            key={tool.key}
                            active={hasEnteredLoadCue(LOAD_CUES.heroNotes)}
                            className="eli5-hero__compat-item"
                            delay={360 + index * 80}
                            variantClassName="eli5-reveal--pill"
                          >
                            <span className={`eli5-tool-logo eli5-tool-logo--${tool.key}`} aria-hidden="true">
                              <ToolLogo toolKey={tool.key} />
                            </span>
                            <span>{tool.label}</span>
                          </RevealOnView>
                        ))}
                      </div>

                      <div className="eli5-hero__actions">
                        <RevealOnView
                          active={hasEnteredLoadCue(LOAD_CUES.heroNotes)}
                          className="eli5-hero__action-reveal"
                          delay={560}
                          variantClassName="eli5-reveal--soft"
                        >
                          <DownloadLink className="eli5-button eli5-button--primary eli5-depth--1">
                            Download the skill
                          </DownloadLink>
                        </RevealOnView>
                        <RevealOnView
                          active={hasEnteredLoadCue(LOAD_CUES.heroNotes)}
                          className="eli5-hero__action-reveal"
                          delay={680}
                          variantClassName="eli5-reveal--soft"
                        >
                          <a className="eli5-button eli5-button--secondary eli5-depth--1" href="#examples">
                            See the output
                          </a>
                        </RevealOnView>
                      </div>
                    </div>
                  </div>
                </section>

                <SectionBreak
                  className={getLoadItemClass(
                    'eli5-section-break',
                    hasEnteredLoadCue(LOAD_CUES.breakHow),
                    'eli5-load-item--divider',
                  )}
                  color={SECTION_BREAK_COLORS.orange}
                  tilt={5}
                  width={114}
                  heroMagnetControls={heroMagnetControls}
                  levelControls={levelControls}
                />

                <section
                  id="how"
                  className={getLoadItemClass(
                    'eli5-section eli5-section--how',
                    hasEnteredLoadCue(LOAD_CUES.how),
                    'eli5-load-item--section',
                  )}
                >
                  <div ref={howSectionRef} className="eli5-how">
                    <div className="eli5-how__copy">
                      <RevealOnView
                        active={hasEnteredLoadCue(LOAD_CUES.how)}
                        className="eli5-how__intro"
                        delay={80}
                        variantClassName="eli5-reveal--soft"
                      >
                        <h2>What this skill does</h2>
                        <p className="eli5-how__lede">
                          The skill rewrites one answer in five levels. You get the simple version first, then the fuller version right underneath.
                        </p>

                        <TypedPromptField
                          label="What you ask"
                          skill={HOW_EXAMPLE.skill}
                          prompt={HOW_EXAMPLE.prompt}
                          className="eli5-how__prompt"
                        />
                      </RevealOnView>

                      <div className="eli5-how__benefits">
                        {HOW_BENEFITS.map((benefit, index) => (
                          <RevealOnView
                            as="article"
                            key={benefit.title}
                            active={hasEnteredLoadCue(LOAD_CUES.how)}
                            className="eli5-how-benefit"
                            delay={180 + index * 130}
                            variantClassName="eli5-reveal--card"
                          >
                            <div className="eli5-how-benefit__art" aria-hidden="true">
                              <img src={benefit.art} alt="" loading="lazy" />
                            </div>

                            <div className="eli5-how-benefit__copy">
                              <h3>{benefit.title}</h3>
                              <p>{benefit.copy}</p>
                            </div>
                          </RevealOnView>
                        ))}
                      </div>

                      <RevealOnView
                        active={hasEnteredLoadCue(LOAD_CUES.how)}
                        className="eli5-how__use-cases"
                        delay={620}
                        variantClassName="eli5-reveal--soft"
                      >
                        <p className="eli5-how__use-cases-label">Great for</p>

                        <div className="eli5-how__use-cases-list" aria-label="Best use cases">
                          {HOW_USE_CASES.map((item) => (
                            <span key={item} className="eli5-how__use-case">
                              {item}
                            </span>
                          ))}
                        </div>
                      </RevealOnView>
                    </div>

                    <ScrollScrubMedia
                      trackRef={howSectionRef}
                      topVh={HOW_GIF_STICKY_TOP_VH}
                      label="Michael Scott waiting for the answer to become intelligible."
                      motionControls={heroMagnetControls}
                    />
                  </div>
                </section>

                <SectionBreak
                  className={getLoadItemClass(
                    'eli5-section-break',
                    hasEnteredLoadCue(LOAD_CUES.breakExamples),
                    'eli5-load-item--divider',
                  )}
                  color={SECTION_BREAK_COLORS.green}
                  tilt={-3}
                  width={101}
                  heroMagnetControls={heroMagnetControls}
                  levelControls={levelControls}
                />

                <section
                  id="examples"
                  className={getLoadItemClass(
                    'eli5-section eli5-section--examples',
                    hasEnteredLoadCue(LOAD_CUES.examples),
                    'eli5-load-item--section',
                  )}
                >
                  <RevealOnView
                    active={hasEnteredLoadCue(LOAD_CUES.examples)}
                    className="eli5-section-heading"
                    delay={80}
                    variantClassName="eli5-reveal--soft"
                  >
                    <h2>See the output.</h2>
                    <p>Pick a topic. The prompt stays short. The skill rewrites the answer at ages 5, 7, 9, 12, and 16.</p>
                  </RevealOnView>

                  <RevealOnView
                    active={hasEnteredLoadCue(LOAD_CUES.examples)}
                    className="eli5-playfield"
                    data-magnet-board="playfield"
                    delay={220}
                    variantClassName="eli5-reveal--card"
                  >
                    <div ref={playfieldBoardRef} className="eli5-playfield__board">
                      <ExampleTopicTabs
                        examples={EXAMPLES}
                        activeSlug={activeExample.slug}
                        onSelect={setActiveExampleSlug}
                      />

                      <div
                        id={`example-panel-${activeExample.slug}`}
                        className="eli5-example-thread"
                        role="tabpanel"
                        aria-labelledby={`example-tab-${activeExample.slug}`}
                      >
                        <p className="eli5-example-thread__category">Example prompt</p>

                        <TypedPromptField
                          skill="Explain It Like I'm Five"
                          prompt={getExamplePromptText(activeExample)}
                          className="eli5-example-thread__prompt"
                          ariaLabel={`Explain It Like I'm Five ${getExamplePromptText(activeExample)}`}
                        />

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
                  </RevealOnView>
                </section>

                <SectionBreak
                  className={getLoadItemClass(
                    'eli5-section-break',
                    hasEnteredLoadCue(LOAD_CUES.breakInstall),
                    'eli5-load-item--divider',
                  )}
                  color={SECTION_BREAK_COLORS.violet}
                  tilt={4}
                  width={109}
                  heroMagnetControls={heroMagnetControls}
                  levelControls={levelControls}
                />

                <section
                  id="install"
                  className={getLoadItemClass(
                    'eli5-section eli5-section--install',
                    hasEnteredLoadCue(LOAD_CUES.install),
                    'eli5-load-item--section',
                  )}
                >
                  <RevealOnView
                    active={hasEnteredLoadCue(LOAD_CUES.install)}
                    className="eli5-section-heading"
                    delay={80}
                    variantClassName="eli5-reveal--soft"
                  >
                    <h2>Add the skill in three short steps.</h2>
                    <p>This is a Markdown skill file for AI agents. Download it, add it to Codex, Claude Code, Cursor, or a similar AI setup, and ask your question as usual. That&apos;s the whole setup.</p>
                  </RevealOnView>

                  <div className="eli5-install-grid">
                    {INSTALL_STEPS.map((step, index) => (
                      <RevealOnView
                        as="article"
                        key={step.title}
                        active={hasEnteredLoadCue(LOAD_CUES.install)}
                        className="eli5-install-step"
                        delay={220 + index * 140}
                        variantClassName="eli5-reveal--card"
                      >
                        <div className="eli5-install-step__art-frame">
                          <img
                            className="eli5-install-step__art"
                            src={step.image}
                            alt={step.alt}
                            loading="lazy"
                            style={{
                              '--install-art-scale': step.artScale ?? 1,
                            }}
                          />
                        </div>

                        <div className="eli5-install-step__copy">
                          <p className="eli5-install-step__index">Step {index + 1}</p>
                          <h3>{step.title}</h3>
                          <p>{step.copy}</p>
                        </div>
                      </RevealOnView>
                    ))}
                  </div>
                </section>

                <SectionBreak
                  className={getLoadItemClass(
                    'eli5-section-break',
                    hasEnteredLoadCue(LOAD_CUES.breakScience),
                    'eli5-load-item--divider',
                  )}
                  color={SECTION_BREAK_COLORS.blue}
                  tilt={-6}
                  width={104}
                  heroMagnetControls={heroMagnetControls}
                  levelControls={levelControls}
                />

                <section
                  id="science"
                  className={getLoadItemClass(
                    'eli5-section eli5-section--science',
                    hasEnteredLoadCue(LOAD_CUES.science),
                    'eli5-load-item--section',
                  )}
                  aria-label="The science"
                >
                  <RevealOnView
                    active={hasEnteredLoadCue(LOAD_CUES.science)}
                    className="eli5-section-heading"
                    delay={80}
                    variantClassName="eli5-reveal--soft"
                  >
                    <h2>Why this format works.</h2>
                    <p>The tone is cheeky. The method is not. Research on plain language, segmentation, scaffolding, and relevant humor points the same way: people understand more when explanations arrive in smaller, clearer steps.</p>
                  </RevealOnView>

                  <div className="eli5-science-grid">
                    {SCIENCE_PRINCIPLES.map((item, index) => (
                      <RevealOnView
                        as="article"
                        key={item.title}
                        active={hasEnteredLoadCue(LOAD_CUES.science)}
                        className="eli5-science-point eli5-depth--0"
                        delay={220 + index * 120}
                        variantClassName="eli5-reveal--card"
                      >
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.copy}</p>
                          <div className="eli5-science-point__sources">
                            <div className="eli5-science-point__source-list">
                              {item.sourceIds.map((sourceId) => {
                              const source = SCIENCE_SOURCE_MAP[sourceId];

                              if (!source) {
                                return null;
                              }

                              return (
                                <a
                                  key={source.id}
                                  className="eli5-science-point__source"
                                  href={source.href}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <span>{source.short}</span>
                                  <span>{source.meta}</span>
                                  </a>
                              );
                            })}
                            </div>
                          </div>
                        </div>
                      </RevealOnView>
                    ))}
                  </div>
                </section>

                <SectionBreak
                  className={getLoadItemClass(
                    'eli5-section-break',
                    hasEnteredLoadCue(LOAD_CUES.breakDownload),
                    'eli5-load-item--divider',
                  )}
                  color={SECTION_BREAK_COLORS.red}
                  tilt={-2}
                  width={107}
                  heroMagnetControls={heroMagnetControls}
                  levelControls={levelControls}
                />

                <section
                  id="download"
                  className={getLoadItemClass(
                    'eli5-section eli5-section--download',
                    hasEnteredLoadCue(LOAD_CUES.download),
                    'eli5-load-item--section',
                  )}
                >
                  <div className="eli5-cta-end">
                    <div className="eli5-cta eli5-depth--2">
                      <RevealOnView
                        as="div"
                        active={hasEnteredLoadCue(LOAD_CUES.download)}
                        className="eli5-hero__compat eli5-cta__compat"
                        delay={40}
                        variantClassName="eli5-reveal--soft"
                      >
                        <span className="eli5-hero__compat-label">{HERO_COPY.compatLabel}</span>
                        {COMPAT_TOOLS.map((tool) => (
                          <span key={`cta-${tool.key}`} className="eli5-hero__compat-item">
                            <span className={`eli5-tool-logo eli5-tool-logo--${tool.key}`} aria-hidden="true">
                              <ToolLogo toolKey={tool.key} />
                            </span>
                            <span>{tool.label}</span>
                          </span>
                        ))}
                      </RevealOnView>
                      <h2>Get clearer answers.</h2>
                      <RevealOnView
                        as="p"
                        active={hasEnteredLoadCue(LOAD_CUES.download)}
                        className="eli5-cta__support"
                        delay={140}
                        variantClassName="eli5-reveal--soft"
                      >
                        One question in. Five clearer versions out.
                      </RevealOnView>
                      <RevealOnView
                        as="p"
                        active={hasEnteredLoadCue(LOAD_CUES.download)}
                        className="eli5-cta__body"
                        delay={260}
                        variantClassName="eli5-reveal--soft"
                      >
                        Explain It Like I&apos;m Five is a Markdown skill for AI agents. It rewrites
                        one answer into five levels and works in Codex, Claude Code, Cursor, and similar tools.
                      </RevealOnView>
                      <RevealOnView
                        active={hasEnteredLoadCue(LOAD_CUES.download)}
                        delay={680}
                        variantClassName="eli5-reveal--soft"
                      >
                        <DownloadLink className="eli5-button eli5-button--primary eli5-button--large eli5-button--cta-download eli5-depth--1">
                          Download the skill
                        </DownloadLink>
                      </RevealOnView>
                    </div>
                    <RevealOnView
                      as="footer"
                      active={hasEnteredLoadCue(LOAD_CUES.download)}
                      className="eli5-site-footer eli5-depth--0"
                      delay={820}
                      variantClassName="eli5-reveal--soft"
                      aria-label="Site footer"
                    >
                      <div className="eli5-site-footer__brand">
                        <p className="eli5-site-footer__title">Explain It Like I&apos;m Five</p>
                        <p className="eli5-site-footer__summary">
                          Markdown skill for AI agents. One question in, five clearer versions out.
                        </p>
                      </div>
                      <div className="eli5-site-footer__links">
                        <div className="eli5-site-footer__column">
                          <p className="eli5-site-footer__heading">Product</p>
                          <a href="#how">What it does</a>
                          <a href="#examples">See output</a>
                          <a href="#install">How to install</a>
                        </div>
                        <div className="eli5-site-footer__column">
                          <p className="eli5-site-footer__heading">Works with</p>
                          <span>Codex</span>
                          <span>Claude Code</span>
                          <span>Cursor</span>
                        </div>
                        <div className="eli5-site-footer__column">
                          <p className="eli5-site-footer__heading">Resources</p>
                          <DownloadLink className="eli5-site-footer__link">Download skill</DownloadLink>
                          <SupportLink className="eli5-site-footer__link">Buy me a coffee</SupportLink>
                        </div>
                      </div>
                    </RevealOnView>
                  </div>
                </section>
            </>
          </div>
        </div>
      </main>
      <div
        className={getLoadItemClass(
          'eli5-control-launcher',
          hasEnteredLoadCue(LOAD_CUES.controls),
          'eli5-load-item--floating-ui',
        )}
      >
        <button
          type="button"
          className="eli5-control-launcher__button eli5-depth--2"
          onClick={toggleControlPanelVisibility}
        >
          {isControlPanelVisible ? 'Hide Control Panel (/)' : 'Show Control Panel (/)'}
        </button>

        <button
          type="button"
          className="eli5-control-launcher__button eli5-depth--2 eli5-control-launcher__button--secondary"
          onClick={() => handleSetAppView(APP_VIEWS.depthLab)}
        >
          Open Depth Lab
        </button>

        <button
          type="button"
          className="eli5-control-launcher__button eli5-depth--2 eli5-control-launcher__button--secondary"
          onClick={() => handleSetAppView(APP_VIEWS.typographyLab)}
        >
          Open Typography Lab
        </button>
      </div>

      {isInlineFallbackOpen ? (
        <div
          className={getLoadItemClass(
            'eli5-control-dock',
            hasEnteredLoadCue(LOAD_CUES.controlDock),
            'eli5-load-item--floating-ui',
          )}
        >
          <ControlPanelSurface
            {...sharedPanelProps}
            isLayoutEditing={isHeroLayoutEditing}
            onStartLayoutEdit={handleStartHeroLayoutEdit}
            onSaveLayoutEdit={handleSaveHeroLayoutEdit}
            onCancelLayoutEdit={handleCancelHeroLayoutEdit}
            onResetLayout={handleResetHeroLayout}
          />
        </div>
      ) : null}

      {controlPanelHost
        ? createPortal(
            <ControlPanelSurface
              {...sharedPanelProps}
              isLayoutEditing={isHeroLayoutEditing}
              onStartLayoutEdit={handleStartHeroLayoutEdit}
              onSaveLayoutEdit={handleSaveHeroLayoutEdit}
              onCancelLayoutEdit={handleCancelHeroLayoutEdit}
              onResetLayout={handleResetHeroLayout}
              onClose={handleExternalPanelClose}
            />,
            controlPanelHost,
          )
        : null}
    </div>
  );
}
