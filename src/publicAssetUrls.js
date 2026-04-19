const BASE_URL = import.meta.env?.BASE_URL ?? process.env.PUBLIC_BASE_URL ?? '/';

const CURSOR_SPECS = {
  default: { path: 'assets/cursors/default.png', hotX: 8, hotY: 7, fallback: 'default' },
  pointer: { path: 'assets/cursors/pointer.png', hotX: 31, hotY: 7, fallback: 'pointer' },
  text: { path: 'assets/cursors/text.png', hotX: 32, hotY: 32, fallback: 'text' },
  grab: { path: 'assets/cursors/grab.png', hotX: 32, hotY: 31, fallback: 'grab' },
  grabbing: { path: 'assets/cursors/grabbing.png', hotX: 32, hotY: 31, fallback: 'grabbing' },
};

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function resolvePublicAssetUrl(path) {
  const normalizedBaseUrl = normalizeBaseUrl(BASE_URL);
  const normalizedPath = path.replace(/^\/+/, '');
  return `${normalizedBaseUrl}${normalizedPath}`;
}

export const CURSOR_VARIANTS = Object.fromEntries(
  Object.entries(CURSOR_SPECS).map(([name, spec]) => [
    name,
    {
      ...spec,
      src: resolvePublicAssetUrl(spec.path),
    },
  ]),
);

export function applyPublicAssetVariables(
  root = typeof document !== 'undefined' ? document.documentElement : null,
) {
  if (!root) {
    return;
  }

  Object.entries(CURSOR_VARIANTS).forEach(([name, spec]) => {
    root.style.setProperty(
      `--cursor-${name}`,
      `url('${spec.src}') ${spec.hotX} ${spec.hotY}, ${spec.fallback}`,
    );
  });

  root.style.setProperty(
    '--page-noise-image',
    `url('${resolvePublicAssetUrl('assets/paper-noise.png')}')`,
  );
}
