const COLORS = {
  bg: '#e9dece',
  bgSoft: '#f8efe2',
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
  dividerGreen: '#31cf6d',
  dividerRed: '#ef4f47',
  promptVioletText: '#5b38a2',
  magnetTextLight: '#fffaf7',
  magnetTextDark: '#14202d',
  magnetShadow: '#5a3c21',
  magnetShadowSoft: '#3f2a15',
  magnetSpecular: '#fffdf7',
  mask: '#000000',
};

export const MAGNET_COLORS = [
  COLORS.magnetCoral,
  COLORS.magnetAmber,
  COLORS.magnetMint,
  COLORS.magnetBlue,
  COLORS.magnetOrange,
  COLORS.magnetViolet,
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

const ROOT_THEME_VARS = {
  '--bg': COLORS.bg,
  '--bg-soft': COLORS.bgSoft,
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
  '--surface-border': 'rgba(255, 247, 233, 0.68)',
  '--surface-border-strong': 'rgba(255, 248, 235, 0.76)',
  '--header-border': 'rgba(255, 247, 234, 0.74)',
  '--panel-border': 'rgba(255, 255, 255, 0.8)',
  '--floating-border': 'rgba(24, 35, 53, 0.1)',
  '--soft-border': 'rgba(117, 96, 67, 0.16)',
  '--button-secondary-border': 'rgba(177, 145, 95, 0.45)',
  '--button-support-border': 'rgba(255, 255, 255, 0.88)',
  '--badge-border': 'rgba(128, 99, 58, 0.18)',
  '--prompt-border': 'rgba(116, 95, 66, 0.18)',
  '--prompt-skill-border': 'rgba(108, 74, 176, 0.12)',
  '--page-gradient': `radial-gradient(circle at 14% 0%, rgba(255, 190, 104, 0.28), transparent 26%), radial-gradient(circle at 82% 8%, rgba(110, 160, 255, 0.14), transparent 30%), radial-gradient(circle at 50% 116%, rgba(103, 73, 39, 0.11), transparent 38%), linear-gradient(180deg, #f7ecde 0%, ${COLORS.bg} 100%)`,
  '--page-grid-gradient': `radial-gradient(circle at 20% 12%, rgba(255, 255, 255, 0.2) 0, transparent 22%), radial-gradient(circle at 78% 18%, rgba(115, 82, 40, 0.05) 0, transparent 28%), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(98, 77, 47, 0.015) 0, rgba(98, 77, 47, 0.015) 1px, transparent 1px, transparent 32px)`,
  '--page-vignette': 'inset 0 24px 100px rgba(255, 250, 242, 0.28), inset 0 -56px 136px rgba(100, 71, 36, 0.1)',
  '--surface-gradient': 'linear-gradient(180deg, rgba(249, 243, 234, 0.98) 0%, rgba(240, 231, 215, 0.97) 100%)',
  '--surface-overlay': 'radial-gradient(circle at 18% 10%, rgba(255, 250, 241, 0.44), transparent 28%), linear-gradient(180deg, rgba(255, 252, 246, 0.22), transparent 24%), repeating-linear-gradient(0deg, rgba(98, 77, 47, 0.015) 0, rgba(98, 77, 47, 0.015) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, rgba(255, 252, 245, 0.08) 0, rgba(255, 252, 245, 0.08) 1px, transparent 1px, transparent 28px)',
  '--header-gradient': 'linear-gradient(180deg, rgba(248, 242, 233, 0.97) 0%, rgba(236, 225, 208, 0.95) 100%)',
  '--panel-gradient': 'linear-gradient(180deg, rgba(255, 253, 249, 0.98) 0%, rgba(248, 239, 226, 0.96) 100%)',
  '--button-primary-gradient': `linear-gradient(180deg, ${COLORS.buttonDarkTop} 0%, ${COLORS.buttonDarkBottom} 100%)`,
  '--button-secondary-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 228, 204, 0.97) 100%)',
  '--button-support-gradient': 'linear-gradient(180deg, #f6eeda 0%, #ece0c9 100%)',
  '--hero-badge-gradient': 'linear-gradient(180deg, rgba(245, 236, 220, 0.99) 0%, rgba(233, 220, 198, 0.98) 100%)',
  '--prompt-shell-gradient': 'linear-gradient(180deg, rgba(251, 247, 240, 0.99) 0%, rgba(241, 233, 220, 0.98) 100%)',
  '--prompt-skill-gradient': 'linear-gradient(180deg, rgba(140, 105, 255, 0.18) 0%, rgba(140, 105, 255, 0.11) 100%)',
  '--media-frame-gradient': 'linear-gradient(180deg, rgba(255, 251, 243, 0.8) 0%, rgba(239, 226, 207, 0.72) 100%)',
  '--control-window-gradient': `radial-gradient(circle at top right, rgba(75, 147, 255, 0.12), transparent 24%), radial-gradient(circle at top left, rgba(255, 157, 46, 0.12), transparent 24%), linear-gradient(180deg, ${COLORS.paperStrong} 0%, #f0e4d2 100%)`,
  '--tab-sheen-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.05) 38%)',
  '--floating-surface': 'rgba(255, 252, 247, 0.94)',
  '--floating-surface-strong': 'rgba(255, 255, 255, 0.86)',
  '--pill-surface': 'rgba(255, 251, 243, 0.78)',
  '--science-card-surface': 'rgba(74, 92, 122, 0.055)',
  '--separator-color': COLORS.inkMuted,
  '--shadow-floating-ui': '0 12px 24px rgba(24, 35, 53, 0.08)',
  '--shadow-panel': '0 24px 60px rgba(24, 35, 53, 0.14)',
  '--shadow-surface': '0 24px 54px rgba(88, 61, 27, 0.1), inset 0 1px 0 rgba(255, 251, 243, 0.58), inset 0 -1px 0 rgba(118, 89, 52, 0.06)',
  '--shadow-header': '0 2px 0 rgba(255, 251, 243, 0.72), 0 8px 0 rgba(107, 73, 31, 0.12), 0 14px 18px rgba(88, 63, 33, 0.08), 0 28px 34px rgba(73, 53, 28, 0.08), 0 44px 58px rgba(73, 53, 28, 0.05), inset 0 1.5px 0 rgba(255, 252, 245, 0.82), inset 0 -1.5px 0 rgba(83, 60, 28, 0.08)',
  '--shadow-button': '0 6px 0 rgba(100, 69, 30, 0.18), 0 18px 20px rgba(73, 53, 28, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -2px 0 rgba(7, 10, 14, 0.18)',
  '--shadow-button-soft': '0 6px 0 rgba(100, 69, 30, 0.12), 0 18px 20px rgba(73, 53, 28, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.72), inset 0 -1px 0 rgba(84, 61, 32, 0.16)',
  '--shadow-divider': '0 6px 0 rgba(107, 73, 31, 0.14), 0 14px 14px rgba(73, 53, 28, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.34), inset 0 -2px 0 rgba(34, 26, 12, 0.08)',
  '--shadow-tab': '0 6px 0 rgba(107, 73, 31, 0.14), 0 14px 14px rgba(73, 53, 28, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(34, 26, 12, 0.08)',
  '--shadow-tab-active': '0 8px 0 rgba(107, 73, 31, 0.16), 0 18px 18px rgba(73, 53, 28, 0.11), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(34, 26, 12, 0.08)',
  '--shadow-media': '0 18px 28px rgba(73, 53, 28, 0.13)',
  '--shadow-install-art': 'drop-shadow(0 14px 18px rgba(73, 53, 28, 0.14))',
  '--shadow-hero-badge': 'inset 0 1px 0 rgba(255, 255, 255, 0.62), inset 0 1px 10px rgba(122, 91, 52, 0.07), inset 0 -1px 0 rgba(112, 81, 45, 0.14)',
  '--shadow-prompt-shell': 'inset 0 1px 0 rgba(255, 255, 255, 0.76), inset 0 2px 10px rgba(126, 95, 56, 0.08), inset 0 -1px 0 rgba(98, 72, 35, 0.1)',
  '--shadow-prompt-skill': 'inset 0 1px 0 rgba(255, 255, 255, 0.34), inset 0 -1px 0 rgba(92, 56, 154, 0.08)',
  '--shadow-pill-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
  '--headline-shadow': 'none',
  '--brand-shadow': '0 -1px 0 rgba(255, 251, 243, 0.84), 0 1px 0 rgba(120, 90, 52, 0.1)',
};

export function applyThemeTokens(root = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!root) {
    return;
  }

  Object.entries(ROOT_THEME_VARS).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  const themeMeta = root.ownerDocument.querySelector('meta[name="theme-color"]');

  if (themeMeta) {
    themeMeta.setAttribute('content', COLORS.bgSoft);
  }
}
