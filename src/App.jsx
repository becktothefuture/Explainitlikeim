import { Fragment, useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import MagnetCanvas from './components/MagnetCanvas.jsx';
import { clamp, getMagnetWidthForLabel } from './components/magnetUtils.js';
import {
  applyThemeTokens,
  EXAMPLE_TAB_COLORS,
  MAGNET_COLORS,
  SECTION_BREAK_COLORS,
} from './theme.js';

const DOWNLOAD_HREF = './downloads/explain-it-like-im-5.md';
const DOWNLOAD_FILENAME = 'explain-it-like-im-5.md';
const SUPPORT_HREF = 'https://buymeacoffee.com/explainitlikeim';
const HOW_GIF_VIDEO = './assets/how/michael-scott-waiting.mp4';
const HOW_GIF_POSTER = './assets/how/michael-scott-waiting-poster.jpg';
const HOW_GIF_STICKY_TOP_VH = 35;
const STICKY_EASE_BAND = 88;
const EXAMPLE_SEPARATOR = '---------------';
const EXAMPLE_TAB_VISIBLE_COUNT = 5;
const EXAMPLE_TAB_HEIGHT = 56;
const EXAMPLE_TAB_GAP = 12;
const EXAMPLE_TAB_STEP = EXAMPLE_TAB_HEIGHT + EXAMPLE_TAB_GAP;
const EXAMPLE_TAB_VIEWPORT_HEIGHT =
  EXAMPLE_TAB_HEIGHT * EXAMPLE_TAB_VISIBLE_COUNT +
  EXAMPLE_TAB_GAP * (EXAMPLE_TAB_VISIBLE_COUNT - 1);
const HERO_CONTROL_STORAGE_KEY = 'eli5-hero-magnet-controls-v9';
const HERO_LAYOUT_STORAGE_KEY = 'eli5-hero-custom-layout-v2';
const HERO_CONTROL_WINDOW_NAME = 'eli5-hero-control-panel';
const HERO_CONTROL_WINDOW_TITLE = "Config Panel for Explain It Like I'm Five";
const HERO_TITLE_SLOT_PADDING_X = 28;
const HERO_TITLE_SLOT_PADDING_Y = 24;
const HERO_SLOT_MIN_HEIGHT = 238;
const HERO_SLOT_FLOAT_BUFFER = 28;

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
  size: 226,
  letterGap: -48,
  wordGap: 0.07,
  lineGap: 120,
  tilt: 0,
  scatter: 0,
  groupRotation: 0,
  offsetX: 0,
  offsetY: -2,
  floatRangeX: 1,
  floatRangeY: 1,
  floatSpeed: 1,
  floatRotate: 1,
  hoverSink: 1,
  hoverLean: 1,
  bounceLift: 1,
  bounceTwist: 1,
  bounceSpeed: 1,
  bounceDamping: 1,
  vibrance: 1.18,
  faceContrast: 0.9,
  innerLightOpacity: 0.58,
  innerLightOffsetY: 1.6,
  innerLightBlur: 3,
  innerShadeOpacity: 0.52,
  innerShadeOffsetX: 1.8,
  innerShadeOffsetY: 2.8,
  innerShadeBlur: 4,
  depthContrast: 0.82,
  depthOffsetX: 1.4,
  depthOffsetY: 6.6,
  depthSpread: 1,
  groundShadow1Opacity: 0.24,
  groundShadow1OffsetX: 4,
  groundShadow1OffsetY: 13,
  groundShadow1Blur: 14,
  groundShadow2Opacity: 0.14,
  groundShadow2OffsetX: 7,
  groundShadow2OffsetY: 26,
  groundShadow2Blur: 30,
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
      { key: 'groupRotation', label: 'Title Rotation', min: -24, max: 24, step: 0.1, format: (value) => `${value.toFixed(1)}deg` },
      { key: 'offsetX', label: 'Offset X', min: -140, max: 140, step: 1, format: (value) => `${value}px` },
      { key: 'offsetY', label: 'Offset Y', min: -120, max: 180, step: 1, format: (value) => `${value}px` },
    ],
  },
  {
    title: 'Float',
    fields: [
      { key: 'floatRangeX', label: 'Float X', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'floatRangeY', label: 'Float Y', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'floatSpeed', label: 'Float Speed', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'floatRotate', label: 'Float Twist', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
    ],
  },
  {
    title: 'Hover Bounce',
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
    title: 'Face',
    fields: [
      { key: 'vibrance', label: 'Vibrance', min: 0, max: 2.4, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'faceContrast', label: 'Face Contrast', min: 0, max: 2, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'innerLightOpacity', label: 'Top Light Opacity', min: 0, max: 1, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'innerLightOffsetY', label: 'Top Light Offset', min: 0, max: 12, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'innerLightBlur', label: 'Top Light Blur', min: 0, max: 16, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'innerShadeOpacity', label: 'Bottom Right Opacity', min: 0, max: 1, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'innerShadeOffsetX', label: 'Bottom Right X', min: 0, max: 12, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'innerShadeOffsetY', label: 'Bottom Right Y', min: 0, max: 12, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'innerShadeBlur', label: 'Bottom Right Blur', min: 0, max: 16, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
    ],
  },
  {
    title: 'Depth',
    fields: [
      { key: 'depthContrast', label: 'Depth Contrast', min: 0, max: 2, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'depthOffsetX', label: 'Depth X', min: 0, max: 12, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'depthOffsetY', label: 'Depth Y', min: 0, max: 20, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'depthSpread', label: 'Depth Spread', min: 0, max: 6, step: 1, format: (value) => `${value}px` },
    ],
  },
  {
    title: 'Ground Shadow',
    fields: [
      { key: 'groundShadow1Opacity', label: 'Layer 1 Opacity', min: 0, max: 1, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'groundShadow1OffsetX', label: 'Layer 1 X', min: 0, max: 24, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'groundShadow1OffsetY', label: 'Layer 1 Y', min: 0, max: 40, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'groundShadow1Blur', label: 'Layer 1 Blur', min: 0, max: 40, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'groundShadow2Opacity', label: 'Layer 2 Opacity', min: 0, max: 1, step: 0.01, format: (value) => value.toFixed(2) },
      { key: 'groundShadow2OffsetX', label: 'Layer 2 X', min: 0, max: 36, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'groundShadow2OffsetY', label: 'Layer 2 Y', min: 0, max: 56, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
      { key: 'groundShadow2Blur', label: 'Layer 2 Blur', min: 0, max: 72, step: 0.1, format: (value) => `${value.toFixed(1)}px` },
    ],
  },
];
const HERO_CONTROL_FIELDS = HERO_CONTROL_SECTIONS.flatMap((section) => section.fields);
const HERO_CONTROL_KEYS = new Set(HERO_CONTROL_FIELDS.map((field) => field.key));

const HOW_EXAMPLE = {
  skill: "Explain It Like I'm Five",
  prompt: 'merge conflict',
};

const HERO_COPY = {
  badge: 'Skill for AI agents',
  summary: 'An AI skill for answers you can follow.',
  detail: 'Install it in any AI agent. Ask one question. Get five versions of the answer, from simple to precise.',
  compatLabel: 'Use it with',
};

const HOW_BENEFITS = [
  {
    title: 'You get the version your brain wanted first.',
    copy:
      'The first pass gives you the shape of the answer quickly, before the denser language turns up.',
    art: '/assets/how/how-benefit-start.svg',
  },
  {
    title: 'The proper detail still shows up.',
    copy:
      'Each pass adds back the real terms, mechanism, and caveats, so the useful detail stays intact.',
    art: '/assets/how/how-benefit-detail.svg',
  },
  {
    title: 'It works on code, docs, papers, plans, and odd questions.',
    copy:
      'Anything that is correct but annoyingly dense gets easier when the answer arrives in steps instead of one long slab.',
    art: '/assets/how/how-benefit-anywhere.svg',
  },
  {
    title: 'It saves your next prompt for something better.',
    copy:
      'You spend less time asking for a rewrite and more time deciding what to do with the answer.',
    art: '/assets/how/how-benefit-reprompt.svg',
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
    slug: 'inflation',
    category: 'Economics',
    subject: 'Inflation',
    prompt: 'Explain inflation in simple steps from age 5 to 16.',
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
    prompt: 'Explain photosynthesis in simple steps from age 5 to 16.',
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
    prompt: 'Explain tax brackets in simple steps from age 5 to 16.',
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
    prompt: 'Explain a measles outbreak in simple steps from age 5 to 16.',
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
    prompt: 'Explain tariffs and prices in simple steps from age 5 to 16.',
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
    prompt: 'Explain merge conflicts in simple steps from age 5 to 16.',
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
    prompt: 'Explain API rate limits in simple steps from age 5 to 16.',
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
    prompt: 'Explain peer review in simple steps from age 5 to 16.',
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
    prompt: 'Explain interest rates in simple steps from age 5 to 16.',
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
    prompt: 'Explain technical debt in simple steps from age 5 to 16.',
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

const EXAMPLE_TAB_STYLES = [
  { color: EXAMPLE_TAB_COLORS[0], tilt: -3 },
  { color: EXAMPLE_TAB_COLORS[1], tilt: 2 },
  { color: EXAMPLE_TAB_COLORS[2], tilt: -2 },
  { color: EXAMPLE_TAB_COLORS[3], tilt: 3 },
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
    title: 'Add it to your agent.',
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
    size: Math.round(clamp(getFiniteNumber(controls.size, HERO_MAGNET_DEFAULTS.size), 72, 300)),
    letterGap: Math.round(clamp(getFiniteNumber(controls.letterGap, HERO_MAGNET_DEFAULTS.letterGap), -60, 24)),
    wordGap: clamp(getFiniteNumber(controls.wordGap, HERO_MAGNET_DEFAULTS.wordGap), 0.02, 0.44),
    lineGap: Math.round(clamp(getFiniteNumber(controls.lineGap, HERO_MAGNET_DEFAULTS.lineGap), 48, 200)),
    tilt: clamp(getFiniteNumber(controls.tilt, HERO_MAGNET_DEFAULTS.tilt), 0, 4.4),
    scatter: clamp(getFiniteNumber(controls.scatter, HERO_MAGNET_DEFAULTS.scatter), 0, 2.8),
    groupRotation: clamp(getFiniteNumber(controls.groupRotation, HERO_MAGNET_DEFAULTS.groupRotation), -24, 24),
    offsetX: Math.round(clamp(getFiniteNumber(controls.offsetX, HERO_MAGNET_DEFAULTS.offsetX), -140, 140)),
    offsetY: Math.round(clamp(getFiniteNumber(controls.offsetY, HERO_MAGNET_DEFAULTS.offsetY), -120, 180)),
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

function getHeroMotionBuffer(heroMagnetControls, baseHeight) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);

  return Math.max(
    HERO_SLOT_FLOAT_BUFFER,
    Math.round(
      Math.max(baseHeight, 0) *
        (0.14 +
          heroControls.floatRangeY * 0.018 +
          heroControls.hoverSink * 0.012 +
          heroControls.bounceLift * 0.035),
    ),
  );
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

function loadHeroLayout() {
  const fallbackLayout = sanitizeHeroLayout(HERO_REFERENCE_LAYOUT);

  if (typeof window === 'undefined') {
    return fallbackLayout;
  }

  try {
    const raw = window.localStorage.getItem(HERO_LAYOUT_STORAGE_KEY);

    if (!raw) {
      return fallbackLayout;
    }

    const parsed = sanitizeHeroLayout(JSON.parse(raw));
    return Object.keys(parsed).length > 0 ? parsed : fallbackLayout;
  } catch {
    return fallbackLayout;
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
  if (!example?.subject) {
    return '';
  }

  return example.subject.toLowerCase();
}

function getMotionBehavior() {
  if (typeof window === 'undefined') {
    return 'smooth';
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

function getStickyEaseDistance(distance, band) {
  const normalized = clamp(distance / band, 0, 1);

  return distance * (1 - normalized) * (1 - normalized);
}

function useStickyEase({
  shellRef,
  contentRef,
  trackRef,
  band = STICKY_EASE_BAND,
}) {
  const lastOffsetRef = useRef(Number.NaN);

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

      if (shellStyle.position === 'sticky' && Number.isFinite(stickyTop)) {
        const trackRect = trackNode.getBoundingClientRect();
        const shellRect = shellNode.getBoundingClientRect();
        const stickyHeight = shellNode.offsetHeight;
        const enterDistance = shellRect.top - stickyTop;
        const releaseDistance = trackRect.bottom - stickyHeight - stickyTop;

        if (enterDistance > 0) {
          nextOffset = -getStickyEaseDistance(enterDistance, band);
        } else if (releaseDistance > 0) {
          nextOffset = getStickyEaseDistance(releaseDistance, band);
        }
      }
    }

    if (Math.abs(nextOffset - lastOffsetRef.current) < 0.1) {
      return;
    }

    contentNode.style.setProperty('--eli5-sticky-ease-y', `${nextOffset.toFixed(2)}px`);
    lastOffsetRef.current = nextOffset;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
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
      window.cancelAnimationFrame(frameId);
    };
  }, [band, shellRef, trackRef, syncStickyEase]);
}

function getExampleTabVisuals(index, scrollTop) {
  const viewportCenter = EXAMPLE_TAB_VIEWPORT_HEIGHT / 2;
  const itemCenter = index * EXAMPLE_TAB_STEP + EXAMPLE_TAB_HEIGHT / 2 - scrollTop;
  const distance = Math.abs(itemCenter - viewportCenter);
  const normalized = clamp(distance / (EXAMPLE_TAB_STEP * 2.75), 0, 1.7);

  return {
    scale: clamp(1.02 - normalized * 0.2, 0.72, 1.02),
    opacity: clamp(1.08 - normalized * 0.48, 0, 1),
    blur: clamp((normalized - 0.82) * 3.6, 0, 3.2),
  };
}

function buildHeroTitleAuthoredMagnets(heroMagnetControls, magnetProps = {}) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);

  const baselineMagnets = createPhraseMagnets({
    boardId: 'hero',
    lines: ['EXPLAIN IT', "LIKE I'M", 'FIVE…'],
    startX: 0,
    startY: 52,
    offsetX: 0,
    offsetY: 0,
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

  return rotateMagnetsAroundCenter(baselineMagnets, heroControls.groupRotation);
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
  const slotBoost = 1.12;

  if (!boardRect || !layout) {
    return { width: 0, height: 0 };
  }

  const bounds = getAuthorMagnetBounds(buildHeroTitleAuthoredMagnets(heroMagnetControls));
  const motionBuffer = getHeroMotionBuffer(
    heroMagnetControls,
    sanitizeHeroMagnetControls(heroMagnetControls).size,
  );
  const innerWidth = boardRect.width - layout.padding.left - layout.padding.right;
  const innerHeight = boardRect.height - layout.padding.top - layout.padding.bottom;
  const scale = Math.min(
    Math.max(innerWidth / layout.authorWidth, 0),
    Math.max(innerHeight / layout.authorHeight, 0),
  );

  return {
    width: Math.round(Math.max(boardRect.width, 0)),
    height: Math.round(
      Math.min(
        innerHeight,
        (bounds.height + HERO_TITLE_SLOT_PADDING_Y * 2 + motionBuffer * 2) * scale * slotBoost,
      ),
    ),
  };
}

function getHeroRuntimeBounds(magnets = []) {
  const heroMagnets = magnets.filter((magnet) => magnet.boardId === 'hero');

  if (heroMagnets.length === 0) {
    return null;
  }

  return heroMagnets.reduce((acc, magnet) => {
    const { width, height } = getMagnetDimensions(magnet);

    return {
      left: Math.min(acc.left, magnet.x),
      top: Math.min(acc.top, magnet.y),
      right: Math.max(acc.right, magnet.x + width),
      bottom: Math.max(acc.bottom, magnet.y + height),
    };
  }, {
    left: Number.POSITIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
  });
}

function buildHeroTitleSlotFromRuntimeMagnets(
  magnets,
  heroStageRect,
  heroMagnetControls = HERO_MAGNET_DEFAULTS,
) {
  const bounds = getHeroRuntimeBounds(magnets);

  if (!bounds || !heroStageRect) {
    return { width: 0, height: 0 };
  }

  const averageHeight =
    magnets
      .filter((magnet) => magnet.boardId === 'hero')
      .reduce((sum, magnet) => sum + getMagnetDimensions(magnet).height, 0) /
    Math.max(magnets.filter((magnet) => magnet.boardId === 'hero').length, 1);
  const comfortBuffer = Math.max(
    getHeroMotionBuffer(heroMagnetControls, averageHeight),
    Math.round(averageHeight * 0.18),
  );

  return {
    width: Math.round(Math.max(heroStageRect.width, 0)),
    height: Math.round(
      clamp(
        bounds.bottom - bounds.top + comfortBuffer * 2,
        HERO_SLOT_MIN_HEIGHT,
        heroStageRect.height,
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
    left: heroStageRect.left,
    top: heroStageRect.top + Math.max((heroStageRect.height - heroTitleSlot.height) / 2, 0),
    width: heroStageRect.width,
    height: heroTitleSlot.height,
  };
}

function buildAuthoredMagnets(heroMagnetControls) {
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);
  const sharedMagnetProps = {
    vibrance: heroControls.vibrance,
    faceContrast: heroControls.faceContrast,
    innerLightOpacity: heroControls.innerLightOpacity,
    innerLightOffsetY: heroControls.innerLightOffsetY,
    innerLightBlur: heroControls.innerLightBlur,
    innerShadeOpacity: heroControls.innerShadeOpacity,
    innerShadeOffsetX: heroControls.innerShadeOffsetX,
    innerShadeOffsetY: heroControls.innerShadeOffsetY,
    innerShadeBlur: heroControls.innerShadeBlur,
    depthContrast: heroControls.depthContrast,
    depthOffsetX: heroControls.depthOffsetX,
    depthOffsetY: heroControls.depthOffsetY,
    depthSpread: heroControls.depthSpread,
    groundShadow1Opacity: heroControls.groundShadow1Opacity,
    groundShadow1OffsetX: heroControls.groundShadow1OffsetX,
    groundShadow1OffsetY: heroControls.groundShadow1OffsetY,
    groundShadow1Blur: heroControls.groundShadow1Blur,
    groundShadow2Opacity: heroControls.groundShadow2Opacity,
    groundShadow2OffsetX: heroControls.groundShadow2OffsetX,
    groundShadow2OffsetY: heroControls.groundShadow2OffsetY,
    groundShadow2Blur: heroControls.groundShadow2Blur,
  };

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

  const slotScaleX =
    heroRect.width / Math.max(heroAuthorBounds.width + HERO_TITLE_SLOT_PADDING_X * 2, 1);
  const slotScaleY =
    heroRect.height / Math.max(heroAuthorBounds.height + HERO_TITLE_SLOT_PADDING_Y * 2, 1);
  const scale = Math.min(slotScaleX, slotScaleY);

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

function buildRuntimeMagnets(boardRects, heroMagnetControls = HERO_MAGNET_DEFAULTS) {
  const shouldCompactPlayfield = typeof window !== 'undefined' && window.innerWidth < 860;
  const heroControls = sanitizeHeroMagnetControls(heroMagnetControls);
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
      const heroContentRect = buildHeroLayoutContentRect(rect, heroAuthorBounds);
      const slotScale = heroContentRect.scale;

      return {
        ...magnet,
        x: heroContentRect.left + (magnet.authorX - heroAuthorBounds.left) * slotScale + heroControls.offsetX,
        y: heroContentRect.top + (magnet.authorY - heroAuthorBounds.top) * slotScale + heroControls.offsetY,
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

  return magnets.map((magnet) => {
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
      nextX = heroRect.left + override.cx * heroRect.width - width / 2;
      nextY = heroRect.top + override.cy * heroRect.height - height / 2;
    } else {
      const usableWidth = Math.max(heroRect.width - width, 0);
      const usableHeight = Math.max(heroRect.height - height, 0);
      nextX = heroRect.left + override.x * usableWidth;
      nextY = heroRect.top + override.y * usableHeight;
    }

    return {
      ...magnet,
      x: clamp(nextX, heroRect.left, heroRect.left + heroRect.width - width),
      y: clamp(nextY, heroRect.top, heroRect.top + heroRect.height - height),
      rotation: override.rotation,
      userPlaced: true,
    };
  });
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

function SectionBreak({ color = SECTION_BREAK_COLORS.blue, tilt = -4, width = 106 }) {
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
  applyThemeTokens(popupDocument.documentElement);

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
        color: var(--ink);
        background: var(--control-window-gradient);
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
        className="eli5-prompt-field__shell"
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
  trackRef,
}) {
  const shellRef = useRef(null);
  const contentRef = useRef(null);
  const viewportRef = useRef(null);
  const tabRefs = useRef([]);
  const [scrollTop, setScrollTop] = useState(0);
  const maxScroll = Math.max(0, (examples.length - EXAMPLE_TAB_VISIBLE_COUNT) * EXAMPLE_TAB_STEP);
  const canScrollUp = scrollTop > 6;
  const canScrollDown = scrollTop < maxScroll - 6;

  useStickyEase({
    shellRef,
    contentRef,
    trackRef,
  });

  const syncScrollState = useEffectEvent(() => {
    setScrollTop(viewportRef.current?.scrollTop ?? 0);
  });

  useEffect(() => {
    const viewportNode = viewportRef.current;

    if (!viewportNode) {
      return;
    }

    syncScrollState();

    const handleScroll = () => {
      syncScrollState();
    };

    viewportNode.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      viewportNode.removeEventListener('scroll', handleScroll);
    };
  }, [syncScrollState]);

  const scrollByStep = (direction) => {
    const viewportNode = viewportRef.current;

    if (!viewportNode) {
      return;
    }

    viewportNode.scrollBy({
      top: direction * EXAMPLE_TAB_STEP,
      behavior: getMotionBehavior(),
    });
  };

  const focusTabAtIndex = (nextIndex) => {
    const boundedIndex = clamp(nextIndex, 0, examples.length - 1);
    const targetExample = examples[boundedIndex];
    const targetNode = tabRefs.current[boundedIndex];

    if (!targetExample || !targetNode) {
      return;
    }

    onSelect(targetExample.slug);
    targetNode.focus();
    targetNode.scrollIntoView({
      block: 'nearest',
      behavior: getMotionBehavior(),
    });
  };

  const handleTabKeyDown = (event, index) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        focusTabAtIndex(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        focusTabAtIndex(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTabAtIndex(0);
        break;
      case 'End':
        event.preventDefault();
        focusTabAtIndex(examples.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={shellRef}
      className="eli5-example-tabs"
      style={{
        '--example-tab-item-height': `${EXAMPLE_TAB_HEIGHT}px`,
        '--example-tab-gap': `${EXAMPLE_TAB_GAP}px`,
        '--example-tab-viewport-height': `${EXAMPLE_TAB_VIEWPORT_HEIGHT}px`,
      }}
    >
      <div ref={contentRef} className="eli5-sticky-ease">
        <div
          ref={viewportRef}
          className="eli5-example-tabs__viewport"
        >
          <div
            className="eli5-example-tabs__list"
            role="tablist"
            aria-label="Example topics"
            aria-orientation="vertical"
          >
            {examples.map((example, index) => {
              const isActive = example.slug === activeSlug;
              const tabStyle = EXAMPLE_TAB_STYLES[index % EXAMPLE_TAB_STYLES.length];
              const visuals = getExampleTabVisuals(index, scrollTop);

              return (
                <button
                  key={example.slug}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`example-tab-${example.slug}`}
                  type="button"
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls={`example-panel-${example.slug}`}
                  className={`eli5-example-tab${isActive ? ' is-active' : ''}`}
                  style={{
                    '--example-tab-color': tabStyle.color,
                    '--example-tab-tilt': `${tabStyle.tilt}deg`,
                    '--example-tab-scale': visuals.scale.toFixed(3),
                    '--example-tab-opacity': visuals.opacity.toFixed(3),
                    '--example-tab-blur': `${visuals.blur.toFixed(2)}px`,
                  }}
                  onClick={() => onSelect(example.slug)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {example.subject}
                </button>
              );
            })}
          </div>
        </div>

        <div className="eli5-example-tabs__controls" aria-label="Scroll topics">
          <button
            type="button"
            className="eli5-example-tabs__chevron"
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollUp}
            aria-label="Scroll topics up"
          >
            <span aria-hidden="true">⌃</span>
          </button>

          <button
            type="button"
            className="eli5-example-tabs__chevron"
            onClick={() => scrollByStep(1)}
            disabled={!canScrollDown}
            aria-label="Scroll topics down"
          >
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ScrollScrubMedia({
  trackRef,
  topVh = 35,
  label,
}) {
  const wrapRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);

  useStickyEase({
    shellRef: wrapRef,
    contentRef,
    trackRef,
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
    const scrollSpan = Math.max(trackRect.height - stickyHeight, 1);
    const stickyTop = window.innerHeight * (topVh / 100);
    const progress = clamp((stickyTop - trackRect.top) / scrollSpan, 0, 1);
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
        <div className="eli5-gif-card__frame">
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
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const heroStageRef = useRef(null);
  const heroBoardRef = useRef(null);
  const playfieldBoardRef = useRef(null);
  const howSectionRef = useRef(null);
  const controlPanelWindowRef = useRef(null);
  const [activeExampleSlug, setActiveExampleSlug] = useState('photosynthesis');
  const [heroTitleSlot, setHeroTitleSlot] = useState(() =>
    buildHeroTitleSlot(buildFallbackBoardRects().hero, loadHeroMagnetControls()),
  );
  const [heroMagnetControls, setHeroMagnetControls] = useState(() =>
    loadHeroMagnetControls(),
  );
  const [heroSavedLayout] = useState(() =>
    loadHeroLayout(),
  );
  const [controlPanelHost, setControlPanelHost] = useState(null);
  const [isInlineFallbackOpen, setIsInlineFallbackOpen] = useState(false);
  const [magnetSeed, setMagnetSeed] = useState(() =>
    applyPersistedHeroLayout(
      buildRuntimeMagnets({
        ...buildFallbackBoardRects(),
        hero: buildFallbackHeroBoardRect(loadHeroMagnetControls()),
      }, loadHeroMagnetControls()),
      buildFallbackHeroBoardRect(loadHeroMagnetControls()),
      loadHeroLayout(),
    ),
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
    const heroBoardRect = heroBoardRef.current
      ? {
          left: heroBoardRef.current.getBoundingClientRect().left + window.scrollX,
          top: heroBoardRef.current.getBoundingClientRect().top + window.scrollY,
          width: heroBoardRef.current.getBoundingClientRect().width,
          height: heroBoardRef.current.getBoundingClientRect().height,
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
    const provisionalHeroSlot = buildHeroTitleSlot(resolvedHeroStageRect, heroMagnetControls);
    const provisionalHeroRect =
      heroBoardRect ??
      buildCenteredHeroBoardRect(
        resolvedHeroStageRect,
        heroMagnetControls,
        provisionalHeroSlot,
      );
    const provisionalSeed = applyPersistedHeroLayout(
      buildRuntimeMagnets({
        hero: provisionalHeroRect,
        playfield: playfieldRect,
      }, heroMagnetControls),
      provisionalHeroRect,
      heroSavedLayout,
    );
    const nextHeroSlot = buildHeroTitleSlotFromRuntimeMagnets(
      provisionalSeed,
      resolvedHeroStageRect,
      heroMagnetControls,
    );
    const nextHeroRect =
      heroBoardRect ??
      buildCenteredHeroBoardRect(
        resolvedHeroStageRect,
        heroMagnetControls,
        nextHeroSlot,
      );
    const nextSeed = applyPersistedHeroLayout(
      buildRuntimeMagnets({
        hero: nextHeroRect,
        playfield: playfieldRect,
      }, heroMagnetControls),
      nextHeroRect,
      heroSavedLayout,
    );

    setHeroTitleSlot(nextHeroSlot);

    if (nextSeed.length === 0) {
      return;
    }

    setMagnetSeed(nextSeed);
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
  }, [heroMagnetControls, heroSavedLayout]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      HERO_CONTROL_STORAGE_KEY,
      JSON.stringify(heroMagnetControls),
    );
  }, [heroMagnetControls]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (Object.keys(heroSavedLayout).length === 0) {
      window.localStorage.removeItem(HERO_LAYOUT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      HERO_LAYOUT_STORAGE_KEY,
      JSON.stringify(heroSavedLayout),
    );
  }, [heroSavedLayout]);

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
                <a href="#how">What it does</a>
                <a href="#examples">See output</a>
                <a href="#install">Install</a>
              </nav>

              <DownloadLink className="eli5-button eli5-button--primary eli5-button--header">
                Download the skill
              </DownloadLink>
            </header>

            <>
                <section id="hero" className="eli5-hero">
                  <div ref={heroStageRef} className="eli5-hero-stage">
                    <h1 className="eli5-sr-only">Explain It Like I&apos;m Five</h1>

                    <div className="eli5-hero__badge">{HERO_COPY.badge}</div>

                    <div
                      ref={heroBoardRef}
                      className="eli5-hero__magnet-slot"
                      data-magnet-board="hero"
                      aria-hidden="true"
                      style={{
                        height: heroTitleSlot.height ? `${heroTitleSlot.height}px` : undefined,
                      }}
                    >
                      {magnetSeed.length > 0 ? (
                        <MagnetCanvas
                          className="eli5-magnet-layer"
                          magnets={magnetSeed}
                          motionConfig={heroMagnetControls}
                        />
                      ) : null}
                    </div>

                    <div className="eli5-hero__notes">
                      <div className="eli5-hero__notes-copy">
                        <p className="eli5-hero__summary">
                          {HERO_COPY.summary}
                        </p>
                        <p className="eli5-hero__detail">{HERO_COPY.detail}</p>
                      </div>

                      <div className="eli5-hero__compat" aria-label="Supported tools">
                        <span className="eli5-hero__compat-label">{HERO_COPY.compatLabel}</span>
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
                          Download the skill
                        </DownloadLink>
                        <a className="eli5-button eli5-button--secondary" href="#examples">
                          See the output
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                <SectionBreak color={SECTION_BREAK_COLORS.orange} tilt={5} width={114} />

                <section id="how" className="eli5-section eli5-section--how">
                  <div ref={howSectionRef} className="eli5-how">
                    <div className="eli5-how__copy">
                      <h2>What this skill does</h2>
                      <p className="eli5-how__lede">
                        You ask one question and get the answer in five passes, starting with the quick shape first and building toward the fuller version as you keep reading.
                      </p>

                      <TypedPromptField
                        label="What you ask"
                        skill={HOW_EXAMPLE.skill}
                        prompt={HOW_EXAMPLE.prompt}
                        className="eli5-how__prompt"
                      />

                      <div className="eli5-how__benefits">
                        {HOW_BENEFITS.map((benefit) => (
                          <article key={benefit.title} className="eli5-how-benefit">
                            <div className="eli5-how-benefit__art" aria-hidden="true">
                              <img src={benefit.art} alt="" loading="lazy" />
                            </div>

                            <div className="eli5-how-benefit__copy">
                              <h3>{benefit.title}</h3>
                              <p>{benefit.copy}</p>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="eli5-how__use-cases">
                        <p className="eli5-how__use-cases-label">Great for</p>

                        <div className="eli5-how__use-cases-list" aria-label="Best use cases">
                          {HOW_USE_CASES.map((item) => (
                            <span key={item} className="eli5-how__use-case">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <ScrollScrubMedia
                      trackRef={howSectionRef}
                      topVh={HOW_GIF_STICKY_TOP_VH}
                      label="Michael Scott waiting for the answer to become intelligible."
                    />
                  </div>
                </section>

                <SectionBreak color={SECTION_BREAK_COLORS.green} tilt={-3} width={101} />

                <section id="examples" className="eli5-section eli5-section--examples">
                  <div className="eli5-section-heading">
                    <h2>See the output.</h2>
                    <p>Pick a topic. The prompt stays short. The answer gets rewritten at ages 5, 7, 9, 12, and 16.</p>
                  </div>

                  <div ref={playfieldBoardRef} className="eli5-playfield" data-magnet-board="playfield">
                    <ExampleTopicTabs
                      examples={EXAMPLES}
                      activeSlug={activeExample.slug}
                      onSelect={setActiveExampleSlug}
                      trackRef={playfieldBoardRef}
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
                </section>

                <SectionBreak color={SECTION_BREAK_COLORS.violet} tilt={4} width={109} />

                <section id="install" className="eli5-section eli5-section--install">
                  <div className="eli5-section-heading">
                    <h2>Add the skill in three short steps.</h2>
                    <p>This is a Markdown skill file for AI agents. Download it, add it to Codex, Claude Code, Cursor, or a similar setup, and ask your question as usual.</p>
                  </div>

                  <div className="eli5-install-grid">
                    {INSTALL_STEPS.map((step, index) => (
                      <article key={step.title} className="eli5-install-step">
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
                      </article>
                    ))}
                  </div>
                </section>

                <SectionBreak color={SECTION_BREAK_COLORS.blue} tilt={-6} width={104} />

                <section id="science" className="eli5-section eli5-section--science" aria-label="The science">
                  <div className="eli5-section-heading">
                    <h2>Why this format works.</h2>
                    <p>The tone is cheeky. The method is not. Research on plain language, segmentation, scaffolding, and relevant humor points in the same direction: people stay oriented longer when explanations arrive in smaller, better-signposted chunks.</p>
                  </div>

                  <div className="eli5-science-grid">
                    {SCIENCE_PRINCIPLES.map((item) => (
                      <article key={item.title} className="eli5-science-point">
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.copy}</p>
                          <div className="eli5-science-point__sources">
                            <p className="eli5-science-point__sources-label">Sources</p>
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
                      </article>
                    ))}
                  </div>
                </section>

                <SectionBreak color={SECTION_BREAK_COLORS.red} tilt={-2} width={107} />

                <section id="download" className="eli5-section eli5-section--download">
                  <div className="eli5-cta">
                    <h2>Put it in your agent.</h2>
                    <p>
                      You do not need a smarter answer. You need one you can actually follow.
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
            caption="Motion and material settings are live on this page."
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
              caption="Motion and material settings are live on this page."
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
