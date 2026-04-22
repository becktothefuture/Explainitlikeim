import { MAGNET_COLORS, MAGNET_RENDER_THEME } from '../theme.js';

export const MAGNET_FONT_FAMILY =
  "'Londrina Solid', 'Arial Rounded MT Bold', 'Trebuchet MS', 'Segoe UI', sans-serif";

const DEG_TO_RAD = Math.PI / 180;
const LETTER_SPRITE_SCALE = 1.65;
const LETTER_LAYOUT_CACHE = new Map();
const LETTER_LAYOUT_CACHE_LIMIT = 160;
const LETTER_SPRITE_CACHE = new Map();
const LETTER_SPRITE_CACHE_LIMIT = 140;
const LETTER_SPRITE_CACHE_VERSION = 'v2';
const MAGNET_HIT_MASK_CACHE = new Map();
const MAGNET_HIT_MASK_CACHE_LIMIT = 160;
const MAGNET_HIT_MASK_CACHE_VERSION = 'v1';
const SHAPE_SPRITE_CACHE = new Map();
const SHAPE_SPRITE_CACHE_LIMIT = 80;
const SHAPE_SPRITE_CACHE_VERSION = 'v1';
const HIT_MASK_SCALE = 2;
const HIT_ALPHA_THRESHOLD = 16;
let measureCanvas = null;

const SINGLE_LETTER_WIDTH_SCALE = {
  '5': 0.78,
  "'": 0.28,
  '’': 0.28,
  '.': 0.24,
  '…': 0.64,
  A: 0.82,
  B: 0.8,
  C: 0.78,
  D: 0.84,
  E: 0.74,
  F: 0.72,
  G: 0.84,
  H: 0.86,
  I: 0.42,
  J: 0.56,
  K: 0.82,
  L: 0.66,
  M: 1.02,
  N: 0.9,
  O: 0.84,
  P: 0.78,
  Q: 0.86,
  R: 0.82,
  S: 0.74,
  T: 0.8,
  U: 0.84,
  V: 0.82,
  W: 1.08,
  X: 0.82,
  Y: 0.82,
  Z: 0.76,
};

export function clamp(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }

  if (min > max) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function getMagnetVisualScale(magnet) {
  const referenceHeight = Number(magnet?.styleReferenceHeight);
  const height = Number(magnet?.height);

  if (!Number.isFinite(referenceHeight) || referenceHeight <= 0) {
    return 1;
  }

  if (!Number.isFinite(height) || height <= 0) {
    return 1;
  }

  return Math.max(height / referenceHeight, 0.01);
}

export function normalizeMagnetList(magnets = []) {
  return magnets.map((magnet, index) => normalizeMagnet(magnet, index));
}

export function normalizeMagnet(magnet = {}, index = 0) {
  const label = `${magnet.label ?? magnet.letter ?? magnet.text ?? ''}`;
  const size = Math.max(28, magnet.size ?? magnet.height ?? 68);
  const height = Math.max(28, magnet.height ?? size);
  const width =
    magnet.width ??
    getMagnetWidthForLabel(label, height);
  const color = magnet.color ?? MAGNET_COLORS[index % MAGNET_COLORS.length];

  return {
    ...magnet,
    id: magnet.id ?? `magnet-${index}-${label || 'tile'}`,
    label,
    x: magnet.x ?? 0,
    y: magnet.y ?? 0,
    width,
    height,
    rotation: magnet.rotation ?? magnet.angle ?? 0,
    zIndex: magnet.zIndex ?? index,
    radius: magnet.radius ?? Math.min(width, height) * 0.24,
    color,
    textColor: magnet.textColor ?? getReadableTextColor(color),
    boardId: magnet.boardId ?? null,
    fontSize: magnet.fontSize ?? null,
    userPlaced: Boolean(magnet.userPlaced),
  };
}

export function cloneMagnetList(magnets = []) {
  return magnets.map((magnet) => ({ ...magnet }));
}

export function invalidateMagnetRenderCaches() {
  LETTER_LAYOUT_CACHE.clear();
  LETTER_SPRITE_CACHE.clear();
  MAGNET_HIT_MASK_CACHE.clear();
  SHAPE_SPRITE_CACHE.clear();
}

export function getMagnetWidthScale(label = '') {
  const letter = `${label}`.trim().slice(0, 1).toUpperCase();
  return SINGLE_LETTER_WIDTH_SCALE[letter] ?? 0.82;
}

export function getMagnetWidthForLabel(label = '', height = 68) {
  const normalized = `${label}`.trim().toUpperCase();

  if (normalized.length === 1) {
    const isPunctuation =
      normalized === "'" ||
      normalized === '’' ||
      normalized === '.' ||
      normalized === '…';
    const basePadding = isPunctuation ? 0.05 : 0.18;
    return Math.round(height * (getMagnetWidthScale(normalized) + basePadding));
  }

  return Math.max(
    Math.round(height * 0.94),
    Math.round(height * (0.6 + Math.max(0, normalized.length - 1) * 0.42)),
  );
}

export function resolveConstraintRect(magnet, boards = [], drawBounds = null) {
  const source =
    magnet.bounds ??
    boards.find((board) => board?.id === magnet.boardId) ??
    drawBounds;

  if (!source) {
    return null;
  }

  const rect = resolveRectSource(source);

  if (!rect) {
    return null;
  }

  const padding = expandPadding(source.padding ?? 0);

  return {
    x: rect.x + padding.left,
    y: rect.y + padding.top,
    width: Math.max(0, rect.width - padding.left - padding.right),
    height: Math.max(0, rect.height - padding.top - padding.bottom),
  };
}

export function clampMagnetToBounds(magnet, nextX, nextY, boards = [], drawBounds = null) {
  const bounds = resolveConstraintRect(magnet, boards, drawBounds);

  if (!bounds) {
    return { x: nextX, y: nextY };
  }

  return {
    x: clamp(nextX, bounds.x, bounds.x + bounds.width - magnet.width),
    y: clamp(nextY, bounds.y, bounds.y + bounds.height - magnet.height),
  };
}

export function findTopMagnetAtPoint(magnets, point, hitPadding = 0) {
  const ranked = magnets
    .map((magnet, index) => ({ magnet, index }))
    .sort((left, right) => {
      if (left.magnet.zIndex !== right.magnet.zIndex) {
        return right.magnet.zIndex - left.magnet.zIndex;
      }

      return right.index - left.index;
    });

  return ranked.find(({ magnet }) => pointHitsMagnet(point, magnet, hitPadding)) ?? null;
}

export function pointHitsMagnet(point, magnet, hitPadding = 0) {
  const cx = magnet.x + magnet.width / 2;
  const cy = magnet.y + magnet.height / 2;
  const dx = point.x - cx;
  const dy = point.y - cy;
  const rotation = -magnet.rotation * DEG_TO_RAD;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const localX = dx * cos - dy * sin + magnet.width / 2;
  const localY = dx * sin + dy * cos + magnet.height / 2;
  const padding = typeof hitPadding === 'number'
    ? hitPadding
    : Math.max(12, Math.min(magnet.width, magnet.height) * 0.16);

  return (
    localX >= -padding &&
    localY >= -padding &&
    localX <= magnet.width + padding &&
    localY <= magnet.height + padding &&
    pointHitsMagnetFace(localX, localY, magnet)
  );
}

function pointHitsMagnetFace(localX, localY, magnet) {
  if (
    localX < 0 ||
    localY < 0 ||
    localX > magnet.width ||
    localY > magnet.height
  ) {
    return false;
  }

  const hitMask = getMagnetHitMask(magnet);
  const hitCtx = hitMask.context;

  if (!hitCtx) {
    return true;
  }

  const sampleX = clamp(
    Math.floor(localX * HIT_MASK_SCALE),
    0,
    hitMask.canvas.width - 1,
  );
  const sampleY = clamp(
    Math.floor(localY * HIT_MASK_SCALE),
    0,
    hitMask.canvas.height - 1,
  );
  const alpha = hitCtx.getImageData(sampleX, sampleY, 1, 1).data[3];

  return alpha >= HIT_ALPHA_THRESHOLD;
}

export function drawMagnet(ctx, magnet, scrollPosition, viewport) {
  const screenX = magnet.x - scrollPosition.x;
  const screenY = magnet.y - scrollPosition.y;
  const cullingMargin = Math.max(magnet.width, magnet.height) * 0.9;

  if (
    screenX > viewport.width + cullingMargin ||
    screenY > viewport.height + cullingMargin ||
    screenX + magnet.width < -cullingMargin ||
    screenY + magnet.height < -cullingMargin
  ) {
    return;
  }

  const centerX = screenX + magnet.width / 2;
  const centerY = screenY + magnet.height / 2;
  const visualScale = getMagnetVisualScale(magnet);
  const vibrance = magnet.vibrance ?? 1.18;
  const depth = magnet.depth ?? 1;
  const roundness = magnet.roundness ?? 1;
  const shadowOpacity = magnet.shadowOpacity ?? magnet.shadowStrength ?? 0.22;
  const shadowOffset = (magnet.shadowOffset ?? 1) * visualScale;
  const shadowBlur = (magnet.shadowBlur ?? magnet.shadowSoftness ?? 0.12) * visualScale;
  const shadowLayers = magnet.shadowLayers ?? 2;
  const highlightStrength = magnet.highlightStrength ?? 0.22;
  const faceContrast = magnet.faceContrast ?? 0.9;
  const innerLightOpacity = magnet.innerLightOpacity ?? 0.58;
  const innerLightOffsetY = (magnet.innerLightOffsetY ?? 1.6) * visualScale;
  const innerLightBlur = (magnet.innerLightBlur ?? 3) * visualScale;
  const innerShadeOpacity = magnet.innerShadeOpacity ?? 0.52;
  const innerShadeOffsetX = (magnet.innerShadeOffsetX ?? 1.8) * visualScale;
  const innerShadeOffsetY = (magnet.innerShadeOffsetY ?? 2.8) * visualScale;
  const innerShadeBlur = (magnet.innerShadeBlur ?? 4) * visualScale;
  const depthContrast = magnet.depthContrast ?? 0.82;
  const depthOffsetX = (magnet.depthOffsetX ?? 1.4) * visualScale;
  const depthOffsetY = (magnet.depthOffsetY ?? 6.6) * visualScale;
  const depthSpread = (magnet.depthSpread ?? 1) * visualScale;
  const groundShadow1Opacity = magnet.groundShadow1Opacity ?? 0.24;
  const groundShadow1OffsetX = (magnet.groundShadow1OffsetX ?? 4) * visualScale;
  const groundShadow1OffsetY = (magnet.groundShadow1OffsetY ?? 13) * visualScale;
  const groundShadow1Blur = (magnet.groundShadow1Blur ?? 14) * visualScale;
  const groundShadow2Opacity = magnet.groundShadow2Opacity ?? 0.14;
  const groundShadowSaturation = magnet.groundShadowSaturation ?? 1;
  const groundShadow2OffsetX = (magnet.groundShadow2OffsetX ?? 7) * visualScale;
  const groundShadow2OffsetY = (magnet.groundShadow2OffsetY ?? 26) * visualScale;
  const groundShadow2Blur = (magnet.groundShadow2Blur ?? 30) * visualScale;
  const baseColor = saturateColor(magnet.color, vibrance);
  const faceStyle = {
    baseColor,
    depth,
    roundness,
    shadowOpacity,
    shadowOffset,
    shadowBlur,
    shadowLayers,
    highlightStrength,
    faceContrast,
    innerLightOpacity,
    innerLightOffsetY,
    innerLightBlur,
    innerShadeOpacity,
    innerShadeOffsetX,
    innerShadeOffsetY,
    innerShadeBlur,
    depthContrast,
    depthOffsetX,
    depthOffsetY,
    depthSpread,
    groundShadow1Opacity,
    groundShadow1OffsetX,
    groundShadow1OffsetY,
    groundShadow1Blur,
    groundShadow2Opacity,
    groundShadowSaturation,
    groundShadow2OffsetX,
    groundShadow2OffsetY,
    groundShadow2Blur,
    faceTop: shiftColor(baseColor, 0.05 + faceContrast * 0.095),
    faceMid: shiftColor(baseColor, 0.012 + faceContrast * 0.026),
    faceBottom: shiftColor(baseColor, -0.08 - faceContrast * 0.058),
  };

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(magnet.rotation * DEG_TO_RAD);
  ctx.translate(-magnet.width / 2, -magnet.height / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  if (magnet.shapeType) {
    drawShapeSprite(ctx, magnet, faceStyle);
  } else {
    const labelLayout = getLabelLayout(magnet);
    drawLetterSprite(ctx, magnet, labelLayout, faceStyle);
  }
  ctx.restore();
}

function drawLetterSprite(ctx, magnet, layout, style) {
  const cacheKey = getLetterSpriteCacheKey(magnet, layout, style);
  const cached = LETTER_SPRITE_CACHE.get(cacheKey);

  if (cached) {
    drawCachedSprite(ctx, cached);
    return;
  }

  const sprite = buildLetterSprite(magnet, layout, style);
  cacheSetWithLimit(LETTER_SPRITE_CACHE, cacheKey, sprite, LETTER_SPRITE_CACHE_LIMIT);
  drawCachedSprite(ctx, sprite);
}

function getSharedFaceGradientStops(style) {
  return [
    { position: 0, color: shiftColor(style.baseColor, 0.072 + style.faceContrast * 0.092) },
    { position: 0.38, color: shiftColor(style.baseColor, 0.018 + style.faceContrast * 0.024) },
    { position: 0.7, color: shiftColor(style.baseColor, -(0.014 + style.faceContrast * 0.02)) },
    { position: 1, color: shiftColor(style.baseColor, -(0.096 + style.faceContrast * 0.126)) },
  ];
}

function buildLetterSprite(
  magnet,
  layout,
  style,
) {
  const scaledMagnet = {
    ...magnet,
    width: magnet.width * LETTER_SPRITE_SCALE,
    height: magnet.height * LETTER_SPRITE_SCALE,
  };
  const scaledLayout = scaleLetterLayout(layout, LETTER_SPRITE_SCALE);
  const scaledInnerLightOffsetY = style.innerLightOffsetY * LETTER_SPRITE_SCALE;
  const scaledInnerLightBlur = style.innerLightBlur * LETTER_SPRITE_SCALE;
  const scaledInnerShadeOffsetX = style.innerShadeOffsetX * LETTER_SPRITE_SCALE;
  const scaledInnerShadeOffsetY = style.innerShadeOffsetY * LETTER_SPRITE_SCALE;
  const scaledInnerShadeBlur = style.innerShadeBlur * LETTER_SPRITE_SCALE;
  const scaledDepthOffsetX = style.depthOffsetX * LETTER_SPRITE_SCALE;
  const scaledDepthOffsetY = style.depthOffsetY * LETTER_SPRITE_SCALE;
  const scaledDepthSpread = style.depthSpread * LETTER_SPRITE_SCALE;
  const scaledGroundShadow1OffsetX = style.groundShadow1OffsetX * LETTER_SPRITE_SCALE;
  const scaledGroundShadow1OffsetY = style.groundShadow1OffsetY * LETTER_SPRITE_SCALE;
  const scaledGroundShadow1Blur = style.groundShadow1Blur * LETTER_SPRITE_SCALE;
  const scaledGroundShadow2OffsetX = style.groundShadow2OffsetX * LETTER_SPRITE_SCALE;
  const scaledGroundShadow2OffsetY = style.groundShadow2OffsetY * LETTER_SPRITE_SCALE;
  const scaledGroundShadow2Blur = style.groundShadow2Blur * LETTER_SPRITE_SCALE;
  const pad = Math.ceil(
    Math.max(
      5,
      Math.abs(scaledDepthOffsetX) + scaledDepthSpread * 2 + 4,
      Math.abs(scaledDepthOffsetY) + scaledDepthSpread * 2 + 4,
      scaledGroundShadow1OffsetX + scaledGroundShadow1Blur * 2.8 + 4,
      scaledGroundShadow1OffsetY + scaledGroundShadow1Blur * 2.8 + 4,
      scaledGroundShadow2OffsetX + scaledGroundShadow2Blur * 2.8 + 4,
      scaledGroundShadow2OffsetY + scaledGroundShadow2Blur * 2.8 + 4,
      scaledInnerLightOffsetY + scaledInnerLightBlur * 2 + 4,
      Math.max(scaledInnerShadeOffsetX, scaledInnerShadeOffsetY) + scaledInnerShadeBlur * 2 + 4,
    ),
  );

  const width = Math.max(1, Math.ceil(scaledMagnet.width + pad * 2));
  const height = Math.max(1, Math.ceil(scaledMagnet.height + pad * 2));
  const canvas = createWorkingCanvas(width, height);
  const canvasCtx = canvas.getContext('2d');

  if (!canvasCtx) {
    return {
      canvas,
      offsetX: -pad / LETTER_SPRITE_SCALE,
      offsetY: -pad / LETTER_SPRITE_SCALE,
      width: width / LETTER_SPRITE_SCALE,
      height: height / LETTER_SPRITE_SCALE,
    };
  }

  const textX = pad + scaledLayout.x;
  const textY = pad + scaledLayout.y;
  const maskCanvas = createGlyphMaskCanvas(width, height, scaledLayout, textX, textY);

  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.imageSmoothingEnabled = true;
  canvasCtx.imageSmoothingQuality = 'high';
  canvasCtx.textAlign = 'center';
  canvasCtx.textBaseline = 'middle';
  canvasCtx.lineJoin = 'round';
  canvasCtx.miterLimit = 2;
  canvasCtx.font = scaledLayout.font;
  const groundShadow2Fill = toAlphaColor(
    getGroundShadowBounceColor(style.baseColor, style.groundShadowSaturation),
    style.groundShadow2Opacity,
  );
  drawOffsetGlyphLayer(canvasCtx, maskCanvas, width, height, {
    fill: toAlphaColor(MAGNET_RENDER_THEME.shadow, style.groundShadow1Opacity),
    offsetX: scaledGroundShadow1OffsetX,
    offsetY: scaledGroundShadow1OffsetY,
    blur: scaledGroundShadow1Blur,
  });
  drawOffsetGlyphLayer(canvasCtx, maskCanvas, width, height, {
    fill: groundShadow2Fill,
    offsetX: scaledGroundShadow2OffsetX,
    offsetY: scaledGroundShadow2OffsetY,
    blur: scaledGroundShadow2Blur,
  });
  drawExtrudedGlyphDepth(canvasCtx, maskCanvas, width, height, {
    baseColor: style.baseColor,
    depthContrast: style.depthContrast,
    offsetX: scaledDepthOffsetX,
    offsetY: scaledDepthOffsetY,
    spread: scaledDepthSpread,
  });

  const faceCanvas = buildGradientGlyphCanvas(maskCanvas, width, height, {
    fromX: textX - scaledMagnet.width * 0.18,
    fromY: textY - scaledMagnet.height * 0.62,
    toX: textX + scaledMagnet.width * 0.22,
    toY: textY + scaledMagnet.height * 0.78,
    stops: getSharedFaceGradientStops(style),
  });
  const faceCtx = faceCanvas.getContext('2d');

  if (faceCtx) {
    drawInnerGlyphShadow(faceCtx, maskCanvas, width, height, {
      fill: toAlphaColor(MAGNET_RENDER_THEME.highlight, style.innerLightOpacity),
      cutoutX: 0,
      cutoutY: scaledInnerLightOffsetY,
      blur: scaledInnerLightBlur,
    });
    drawInnerGlyphShadow(faceCtx, maskCanvas, width, height, {
      fill: toAlphaColor(
        mixColors(style.baseColor, MAGNET_RENDER_THEME.shadow, 0.72),
        style.innerShadeOpacity,
      ),
      cutoutX: -scaledInnerShadeOffsetX,
      cutoutY: -scaledInnerShadeOffsetY,
      blur: scaledInnerShadeBlur,
    });

    canvasCtx.drawImage(faceCanvas, 0, 0);
  } else {
    canvasCtx.fillStyle = style.baseColor;
    canvasCtx.fillText(scaledLayout.label, textX, textY);
  }

  return {
    canvas,
    offsetX: -pad / LETTER_SPRITE_SCALE,
    offsetY: -pad / LETTER_SPRITE_SCALE,
    width: width / LETTER_SPRITE_SCALE,
    height: height / LETTER_SPRITE_SCALE,
  };
}

function drawShapeSprite(ctx, magnet, style) {
  const cacheKey = getShapeSpriteCacheKey(magnet, style);
  const cached = SHAPE_SPRITE_CACHE.get(cacheKey);

  if (cached) {
    drawCachedSprite(ctx, cached);
    return;
  }

  const sprite = buildShapeSprite(magnet, style);
  cacheSetWithLimit(SHAPE_SPRITE_CACHE, cacheKey, sprite, SHAPE_SPRITE_CACHE_LIMIT);
  drawCachedSprite(ctx, sprite);
}

function buildShapeSprite(magnet, style) {
  const scaledMagnet = {
    ...magnet,
    width: magnet.width * LETTER_SPRITE_SCALE,
    height: magnet.height * LETTER_SPRITE_SCALE,
  };
  const scaledInnerLightOffsetY = style.innerLightOffsetY * LETTER_SPRITE_SCALE;
  const scaledInnerLightBlur = style.innerLightBlur * LETTER_SPRITE_SCALE;
  const scaledInnerShadeOffsetX = style.innerShadeOffsetX * LETTER_SPRITE_SCALE;
  const scaledInnerShadeOffsetY = style.innerShadeOffsetY * LETTER_SPRITE_SCALE;
  const scaledInnerShadeBlur = style.innerShadeBlur * LETTER_SPRITE_SCALE;
  const scaledDepthOffsetX = style.depthOffsetX * LETTER_SPRITE_SCALE;
  const scaledDepthOffsetY = style.depthOffsetY * LETTER_SPRITE_SCALE;
  const scaledDepthSpread = style.depthSpread * LETTER_SPRITE_SCALE;
  const scaledGroundShadow1OffsetX = style.groundShadow1OffsetX * LETTER_SPRITE_SCALE;
  const scaledGroundShadow1OffsetY = style.groundShadow1OffsetY * LETTER_SPRITE_SCALE;
  const scaledGroundShadow1Blur = style.groundShadow1Blur * LETTER_SPRITE_SCALE;
  const scaledGroundShadow2OffsetX = style.groundShadow2OffsetX * LETTER_SPRITE_SCALE;
  const scaledGroundShadow2OffsetY = style.groundShadow2OffsetY * LETTER_SPRITE_SCALE;
  const scaledGroundShadow2Blur = style.groundShadow2Blur * LETTER_SPRITE_SCALE;
  const pad = Math.ceil(
    Math.max(
      5,
      Math.abs(scaledDepthOffsetX) + scaledDepthSpread * 2 + 4,
      Math.abs(scaledDepthOffsetY) + scaledDepthSpread * 2 + 4,
      scaledGroundShadow1OffsetX + scaledGroundShadow1Blur * 2.8 + 4,
      scaledGroundShadow1OffsetY + scaledGroundShadow1Blur * 2.8 + 4,
      scaledGroundShadow2OffsetX + scaledGroundShadow2Blur * 2.8 + 4,
      scaledGroundShadow2OffsetY + scaledGroundShadow2Blur * 2.8 + 4,
      scaledInnerLightOffsetY + scaledInnerLightBlur * 2 + 4,
      Math.max(scaledInnerShadeOffsetX, scaledInnerShadeOffsetY) + scaledInnerShadeBlur * 2 + 4,
    ),
  );

  const width = Math.max(1, Math.ceil(scaledMagnet.width + pad * 2));
  const height = Math.max(1, Math.ceil(scaledMagnet.height + pad * 2));
  const canvas = createWorkingCanvas(width, height);
  const canvasCtx = canvas.getContext('2d');

  if (!canvasCtx) {
    return {
      canvas,
      offsetX: -pad / LETTER_SPRITE_SCALE,
      offsetY: -pad / LETTER_SPRITE_SCALE,
      width: width / LETTER_SPRITE_SCALE,
      height: height / LETTER_SPRITE_SCALE,
    };
  }

  const maskCanvas = createShapeMaskCanvas(width, height, scaledMagnet, pad);

  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.imageSmoothingEnabled = true;
  canvasCtx.imageSmoothingQuality = 'high';
  const groundShadow2Fill = toAlphaColor(
    getGroundShadowBounceColor(style.baseColor, style.groundShadowSaturation),
    style.groundShadow2Opacity,
  );
  drawOffsetGlyphLayer(canvasCtx, maskCanvas, width, height, {
    fill: toAlphaColor(MAGNET_RENDER_THEME.shadow, style.groundShadow1Opacity),
    offsetX: scaledGroundShadow1OffsetX,
    offsetY: scaledGroundShadow1OffsetY,
    blur: scaledGroundShadow1Blur,
  });
  drawOffsetGlyphLayer(canvasCtx, maskCanvas, width, height, {
    fill: groundShadow2Fill,
    offsetX: scaledGroundShadow2OffsetX,
    offsetY: scaledGroundShadow2OffsetY,
    blur: scaledGroundShadow2Blur,
  });
  drawExtrudedGlyphDepth(canvasCtx, maskCanvas, width, height, {
    baseColor: style.baseColor,
    depthContrast: style.depthContrast,
    offsetX: scaledDepthOffsetX,
    offsetY: scaledDepthOffsetY,
    spread: scaledDepthSpread,
  });

  const faceCenterX = pad + scaledMagnet.width / 2;
  const faceCenterY = pad + scaledMagnet.height / 2;
  const faceCanvas = buildGradientGlyphCanvas(maskCanvas, width, height, {
    fromX: faceCenterX - scaledMagnet.width * 0.18,
    fromY: faceCenterY - scaledMagnet.height * 0.62,
    toX: faceCenterX + scaledMagnet.width * 0.22,
    toY: faceCenterY + scaledMagnet.height * 0.78,
    stops: getSharedFaceGradientStops(style),
  });
  const faceCtx = faceCanvas.getContext('2d');

  if (faceCtx) {
    drawInnerGlyphShadow(faceCtx, maskCanvas, width, height, {
      fill: toAlphaColor(MAGNET_RENDER_THEME.highlight, style.innerLightOpacity),
      cutoutX: 0,
      cutoutY: scaledInnerLightOffsetY,
      blur: scaledInnerLightBlur,
    });
    drawInnerGlyphShadow(faceCtx, maskCanvas, width, height, {
      fill: toAlphaColor(
        mixColors(style.baseColor, MAGNET_RENDER_THEME.shadow, 0.72),
        style.innerShadeOpacity,
      ),
      cutoutX: -scaledInnerShadeOffsetX,
      cutoutY: -scaledInnerShadeOffsetY,
      blur: scaledInnerShadeBlur,
    });

    canvasCtx.drawImage(faceCanvas, 0, 0);
  } else {
    canvasCtx.save();
    canvasCtx.translate(pad, pad);
    canvasCtx.fillStyle = style.baseColor;
    canvasCtx.fill(getShapePath(scaledMagnet));
    canvasCtx.restore();
  }

  return {
    canvas,
    offsetX: -pad / LETTER_SPRITE_SCALE,
    offsetY: -pad / LETTER_SPRITE_SCALE,
    width: width / LETTER_SPRITE_SCALE,
    height: height / LETTER_SPRITE_SCALE,
  };
}

function drawCachedSprite(ctx, sprite) {
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    sprite.canvas,
    sprite.offsetX,
    sprite.offsetY,
    sprite.width ?? sprite.canvas.width,
    sprite.height ?? sprite.canvas.height,
  );
  ctx.restore();
}

function drawGlyphCastShadow(ctx, maskCanvas, shadow) {
  if (!ctx || !maskCanvas) {
    return;
  }

  if (shadow.opacity <= 0.01 || shadow.layers <= 0) {
    return;
  }

  const layerCount = Math.max(1, shadow.layers);
  const layerOpacity = shadow.opacity / Math.max(1, layerCount * 0.58);

  for (let layer = 1; layer <= layerCount; layer += 1) {
    const progress = layer / layerCount;
    const offsetScale = 0.18 + progress * 0.82;
    const blur = shadow.blur * (0.72 + progress * 1.08);
    const alpha = layerOpacity * (0.52 + (1 - progress) * 0.24);
    const shadowCanvas = createWorkingCanvas(maskCanvas.width, maskCanvas.height);
    const shadowCtx = shadowCanvas.getContext('2d');

    if (!shadowCtx) {
      continue;
    }

    shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    shadowCtx.imageSmoothingEnabled = true;
    shadowCtx.imageSmoothingQuality = 'high';
    shadowCtx.save();
    shadowCtx.shadowColor = toAlphaColor(MAGNET_RENDER_THEME.shadow, alpha);
    shadowCtx.shadowBlur = blur;
    shadowCtx.shadowOffsetX = Math.round(shadow.offsetX * offsetScale);
    shadowCtx.shadowOffsetY = Math.round(shadow.offsetY * offsetScale);
    shadowCtx.globalAlpha = 0.68 + (1 - progress) * 0.16;
    shadowCtx.drawImage(maskCanvas, 0, 0);
    shadowCtx.restore();

    // Canvas shadows also draw the source image. Remove the glyph itself so only the cast shadow remains.
    shadowCtx.globalCompositeOperation = 'destination-out';
    carveGlyphFromShadow(shadowCtx, maskCanvas, blur);
    shadowCtx.globalCompositeOperation = 'source-over';

    ctx.drawImage(shadowCanvas, 0, 0);
  }
}

function carveGlyphFromShadow(targetCtx, maskCanvas, blur) {
  const carveRadius = Math.max(1, Math.min(2, Math.round(blur * 0.035)));

  for (let offsetY = -carveRadius; offsetY <= carveRadius; offsetY += 1) {
    for (let offsetX = -carveRadius; offsetX <= carveRadius; offsetX += 1) {
      if (offsetX * offsetX + offsetY * offsetY > carveRadius * carveRadius) {
        continue;
      }

      targetCtx.drawImage(maskCanvas, offsetX, offsetY);
    }
  }
}

function buildGlyphExtrusionMaskCanvas(maskCanvas, width, height, depthPixels, extrusionDX, extrusionDY) {
  const extrusionMaskCanvas = createWorkingCanvas(width, height);
  const extrusionMaskCtx = extrusionMaskCanvas.getContext('2d');

  if (!extrusionMaskCtx) {
    return extrusionMaskCanvas;
  }

  extrusionMaskCtx.clearRect(0, 0, width, height);

  for (let step = depthPixels; step >= 1; step -= 1) {
    extrusionMaskCtx.drawImage(
      maskCanvas,
      step * extrusionDX,
      step * extrusionDY,
    );
  }

  extrusionMaskCtx.globalCompositeOperation = 'destination-out';
  extrusionMaskCtx.drawImage(maskCanvas, 0, 0);
  extrusionMaskCtx.globalCompositeOperation = 'source-over';

  return extrusionMaskCanvas;
}

function getLetterSpriteCacheKey(magnet, layout, style) {
  const width = Math.round(magnet.width);
  const height = Math.round(magnet.height);
  return [
    LETTER_SPRITE_CACHE_VERSION,
    layout.label,
    layout.font,
    width,
    height,
    style.baseColor,
    getCacheKeyNumber(style.faceContrast),
    getCacheKeyNumber(style.innerLightOpacity),
    getCacheKeyNumber(style.innerLightOffsetY),
    getCacheKeyNumber(style.innerLightBlur),
    getCacheKeyNumber(style.innerShadeOpacity),
    getCacheKeyNumber(style.innerShadeOffsetX),
    getCacheKeyNumber(style.innerShadeOffsetY),
    getCacheKeyNumber(style.innerShadeBlur),
    getCacheKeyNumber(style.depthContrast),
    getCacheKeyNumber(style.depthOffsetX),
    getCacheKeyNumber(style.depthOffsetY),
    getCacheKeyNumber(style.depthSpread),
    getCacheKeyNumber(style.groundShadow1Opacity),
    getCacheKeyNumber(style.groundShadow1OffsetX),
    getCacheKeyNumber(style.groundShadow1OffsetY),
    getCacheKeyNumber(style.groundShadow1Blur),
    getCacheKeyNumber(style.groundShadow2Opacity),
    getCacheKeyNumber(style.groundShadowSaturation),
    getCacheKeyNumber(style.groundShadow2OffsetX),
    getCacheKeyNumber(style.groundShadow2OffsetY),
    getCacheKeyNumber(style.groundShadow2Blur),
  ].join('|');
}

function getShapeSpriteCacheKey(magnet, style) {
  const width = Math.round(magnet.width);
  const height = Math.round(magnet.height);
  return [
    SHAPE_SPRITE_CACHE_VERSION,
    magnet.shapeType ?? 'shape',
    width,
    height,
    style.baseColor,
    getCacheKeyNumber(style.faceContrast),
    getCacheKeyNumber(style.innerLightOpacity),
    getCacheKeyNumber(style.innerLightOffsetY),
    getCacheKeyNumber(style.innerLightBlur),
    getCacheKeyNumber(style.innerShadeOpacity),
    getCacheKeyNumber(style.innerShadeOffsetX),
    getCacheKeyNumber(style.innerShadeOffsetY),
    getCacheKeyNumber(style.innerShadeBlur),
    getCacheKeyNumber(style.depthContrast),
    getCacheKeyNumber(style.depthOffsetX),
    getCacheKeyNumber(style.depthOffsetY),
    getCacheKeyNumber(style.depthSpread),
    getCacheKeyNumber(style.groundShadow1Opacity),
    getCacheKeyNumber(style.groundShadow1OffsetX),
    getCacheKeyNumber(style.groundShadow1OffsetY),
    getCacheKeyNumber(style.groundShadow1Blur),
    getCacheKeyNumber(style.groundShadow2Opacity),
    getCacheKeyNumber(style.groundShadowSaturation),
    getCacheKeyNumber(style.groundShadow2OffsetX),
    getCacheKeyNumber(style.groundShadow2OffsetY),
    getCacheKeyNumber(style.groundShadow2Blur),
  ].join('|');
}

function getMagnetHitMaskKey(magnet) {
  const width = Math.round(magnet.width);
  const height = Math.round(magnet.height);

  if (magnet.shapeType) {
    return [
      MAGNET_HIT_MASK_CACHE_VERSION,
      'shape',
      magnet.shapeType,
      width,
      height,
    ].join('|');
  }

  const layout = getLabelLayout(magnet);

  return [
    MAGNET_HIT_MASK_CACHE_VERSION,
    'letter',
    layout.label,
    layout.font,
    width,
    height,
  ].join('|');
}

function getMagnetHitMask(magnet) {
  const cacheKey = getMagnetHitMaskKey(magnet);
  const cached = MAGNET_HIT_MASK_CACHE.get(cacheKey);

  if (cached) {
    return cached;
  }

  const scaledWidth = Math.max(1, Math.round(magnet.width * HIT_MASK_SCALE));
  const scaledHeight = Math.max(1, Math.round(magnet.height * HIT_MASK_SCALE));
  let canvas;

  if (magnet.shapeType) {
    canvas = createShapeMaskCanvas(
      scaledWidth,
      scaledHeight,
      {
        ...magnet,
        width: scaledWidth,
        height: scaledHeight,
      },
      0,
    );
  } else {
    const layout = scaleLetterLayout(getLabelLayout(magnet), HIT_MASK_SCALE);
    canvas = createGlyphMaskCanvas(
      scaledWidth,
      scaledHeight,
      layout,
      layout.x,
      layout.y,
    );
  }

  return cacheSetWithLimit(
    MAGNET_HIT_MASK_CACHE,
    cacheKey,
    { canvas, context: canvas.getContext('2d') },
    MAGNET_HIT_MASK_CACHE_LIMIT,
  );
}

function getLabelLayout(magnet) {
  const label = magnet.label.toUpperCase();
  const width = Math.max(1, Math.round(magnet.width));
  const height = Math.max(1, Math.round(magnet.height));
  const layoutKey = `${label}|${width}|${height}|${magnet.fontSize ?? ''}`;
  const cached = LETTER_LAYOUT_CACHE.get(layoutKey);

  if (cached) {
    return cached;
  }

  const isApostrophe = label === "'" || label === '’';
  const isDot = label === '.';
  const isEllipsis = label === '…';
  let fontSize =
    magnet.fontSize ??
    Math.round(
      isApostrophe
        ? magnet.height * 1.18
        : isDot
          ? magnet.height * 1.08
          : isEllipsis
            ? magnet.height * 1.02
            : label.length > 1
              ? magnet.height * 0.43
              : magnet.height * 0.82,
    );

  const measureContext = getMeasureContext();

  if (measureContext) {
    const maxWidth = magnet.width - magnet.height * 0.14;
    do {
      measureContext.font = `900 ${fontSize}px ${MAGNET_FONT_FAMILY}`;
      if (measureContext.measureText(label).width <= maxWidth || fontSize <= 16) {
        break;
      }
      fontSize -= 1;
    } while (fontSize > 16);
  }

  const layout = {
    label,
    font: `900 ${fontSize}px ${MAGNET_FONT_FAMILY}`,
    fontSize,
    x: magnet.width / 2,
    y: isApostrophe
      ? magnet.height * 0.24
      : isDot
        ? magnet.height * 0.54
        : isEllipsis
          ? magnet.height * 0.52
          : magnet.height * 0.54,
  };

  return cacheSetWithLimit(
    LETTER_LAYOUT_CACHE,
    layoutKey,
    layout,
    LETTER_LAYOUT_CACHE_LIMIT,
  );
}

function getMeasureContext() {
  if (!measureCanvas) {
    measureCanvas = createWorkingCanvas(1, 1);
  }

  return measureCanvas.getContext('2d');
}

function getCacheKeyNumber(value, decimals = 3) {
  if (!Number.isFinite(value)) {
    return 'na';
  }

  return value.toFixed(decimals);
}

function cacheSetWithLimit(cache, key, value, limit) {
  cache.set(key, value);

  if (cache.size > limit) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  return value;
}

function createGlyphMaskCanvas(width, height, layout, textX, textY) {
  const maskCanvas = createWorkingCanvas(width, height);
  const maskCtx = maskCanvas.getContext('2d');

  if (!maskCtx) {
    return maskCanvas;
  }

  maskCtx.clearRect(0, 0, width, height);
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.textAlign = 'center';
  maskCtx.textBaseline = 'middle';
  maskCtx.lineJoin = 'round';
  maskCtx.miterLimit = 2;
  maskCtx.font = layout.font;
  maskCtx.fillStyle = MAGNET_RENDER_THEME.mask;
  maskCtx.fillText(layout.label, textX, textY);

  return maskCanvas;
}

function createShapeMaskCanvas(width, height, magnet, pad) {
  const maskCanvas = createWorkingCanvas(width, height);
  const maskCtx = maskCanvas.getContext('2d');

  if (!maskCtx) {
    return maskCanvas;
  }

  maskCtx.clearRect(0, 0, width, height);
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.fillStyle = MAGNET_RENDER_THEME.mask;
  maskCtx.translate(pad, pad);
  maskCtx.fill(getShapePath(magnet));

  return maskCanvas;
}

function buildGradientGlyphCanvas(maskCanvas, width, height, gradient) {
  const fillCanvas = createWorkingCanvas(width, height);
  const fillCtx = fillCanvas.getContext('2d');

  if (!fillCtx) {
    return fillCanvas;
  }

  fillCtx.clearRect(0, 0, width, height);
  const faceGradient = fillCtx.createLinearGradient(
    gradient.fromX ?? 0,
    gradient.fromY ?? 0,
    gradient.toX ?? 0,
    gradient.toY ?? height,
  );

  (gradient.stops ?? []).forEach((stop) => {
    faceGradient.addColorStop(stop.position, stop.color);
  });

  fillCtx.fillStyle = faceGradient;
  fillCtx.fillRect(0, 0, width, height);
  fillCtx.globalCompositeOperation = 'destination-in';
  fillCtx.drawImage(maskCanvas, 0, 0);
  fillCtx.globalCompositeOperation = 'source-over';

  return fillCanvas;
}

function buildFilledGlyphCanvas(maskCanvas, width, height, fill) {
  const fillCanvas = createWorkingCanvas(width, height);
  const fillCtx = fillCanvas.getContext('2d');

  if (!fillCtx) {
    return fillCanvas;
  }

  fillCtx.clearRect(0, 0, width, height);
  fillCtx.fillStyle = fill;
  fillCtx.fillRect(0, 0, width, height);
  fillCtx.globalCompositeOperation = 'destination-in';
  fillCtx.drawImage(maskCanvas, 0, 0);
  fillCtx.globalCompositeOperation = 'source-over';

  return fillCanvas;
}

function buildDilatedMaskCanvas(maskCanvas, width, height, spread) {
  if (!Number.isFinite(spread) || spread <= 0.01) {
    return maskCanvas;
  }

  const spreadRadius = Math.max(1, Math.round(spread));
  const dilatedCanvas = createWorkingCanvas(width, height);
  const dilatedCtx = dilatedCanvas.getContext('2d');

  if (!dilatedCtx) {
    return maskCanvas;
  }

  dilatedCtx.clearRect(0, 0, width, height);

  for (let offsetY = -spreadRadius; offsetY <= spreadRadius; offsetY += 1) {
    for (let offsetX = -spreadRadius; offsetX <= spreadRadius; offsetX += 1) {
      if (offsetX * offsetX + offsetY * offsetY > spreadRadius * spreadRadius) {
        continue;
      }

      dilatedCtx.drawImage(maskCanvas, offsetX, offsetY);
    }
  }

  return dilatedCanvas;
}

function buildBlurredCanvas(sourceCanvas, width, height, blur) {
  if (!Number.isFinite(blur) || blur <= 0.01) {
    return sourceCanvas;
  }

  const blurredCanvas = createWorkingCanvas(width, height);
  const blurredCtx = blurredCanvas.getContext('2d');

  if (!blurredCtx) {
    return sourceCanvas;
  }

  blurredCtx.clearRect(0, 0, width, height);
  blurredCtx.imageSmoothingEnabled = true;
  blurredCtx.imageSmoothingQuality = 'high';
  blurredCtx.filter = `blur(${blur}px)`;
  blurredCtx.drawImage(sourceCanvas, 0, 0);
  blurredCtx.filter = 'none';

  return blurredCanvas;
}

function drawExtrudedGlyphDepth(targetCtx, maskCanvas, width, height, depth) {
  if (!targetCtx || !maskCanvas) {
    return;
  }

  const maxTravel = Math.max(Math.abs(depth.offsetX ?? 0), Math.abs(depth.offsetY ?? 0));
  const stepCount = Math.max(1, Math.round(maxTravel));
  const sideColor = mixColors(
    depth.baseColor,
    MAGNET_RENDER_THEME.shadow,
    clamp(0.22 + depth.depthContrast * 0.22, 0.16, 0.72),
  );
  const backColor = mixColors(
    depth.baseColor,
    MAGNET_RENDER_THEME.shadowSoft,
    clamp(0.44 + depth.depthContrast * 0.18, 0.32, 0.8),
  );

  for (let step = 1; step <= stepCount; step += 1) {
    const progress = step / stepCount;
    drawOffsetGlyphLayer(targetCtx, maskCanvas, width, height, {
      fill: mixColors(sideColor, backColor, progress * 0.78),
      offsetX: Math.round((depth.offsetX ?? 0) * progress),
      offsetY: Math.round((depth.offsetY ?? 0) * progress),
      spread: depth.spread ?? 0,
    });
  }
}

function drawOffsetGlyphLayer(targetCtx, maskCanvas, width, height, layer) {
  if (!targetCtx || !maskCanvas || !layer?.fill) {
    return;
  }

  const sourceMask = buildDilatedMaskCanvas(maskCanvas, width, height, layer.spread ?? 0);
  const filledCanvas = buildFilledGlyphCanvas(sourceMask, width, height, layer.fill);
  const finalCanvas = buildBlurredCanvas(filledCanvas, width, height, layer.blur ?? 0);

  targetCtx.drawImage(finalCanvas, layer.offsetX ?? 0, layer.offsetY ?? 0);
}

function drawInnerGlyphShadow(targetCtx, maskCanvas, width, height, shadow) {
  if (!targetCtx || !maskCanvas || !shadow?.fill) {
    return;
  }

  const edgeCanvas = buildFilledGlyphCanvas(maskCanvas, width, height, shadow.fill);
  const edgeCtx = edgeCanvas.getContext('2d');

  if (!edgeCtx) {
    return;
  }

  edgeCtx.globalCompositeOperation = 'destination-out';
  edgeCtx.drawImage(maskCanvas, shadow.cutoutX ?? 0, shadow.cutoutY ?? 0);
  edgeCtx.globalCompositeOperation = 'source-over';

  const blurredCanvas = buildBlurredCanvas(edgeCanvas, width, height, shadow.blur ?? 0);
  const clippedCanvas = createWorkingCanvas(width, height);
  const clippedCtx = clippedCanvas.getContext('2d');

  if (!clippedCtx) {
    targetCtx.drawImage(blurredCanvas, 0, 0);
    return;
  }

  clippedCtx.clearRect(0, 0, width, height);
  clippedCtx.drawImage(blurredCanvas, 0, 0);
  clippedCtx.globalCompositeOperation = 'destination-in';
  clippedCtx.drawImage(maskCanvas, 0, 0);
  clippedCtx.globalCompositeOperation = 'source-over';

  targetCtx.drawImage(clippedCanvas, 0, 0);
}

function drawShapeShadow(ctx, path, magnet, thickness, shadowStrength, shadowSoftness) {
  ctx.save();
  ctx.shadowColor = toAlphaColor(MAGNET_RENDER_THEME.shadow, shadowStrength * 0.68);
  ctx.shadowBlur = magnet.height * (0.08 + shadowSoftness * 0.46);
  ctx.shadowOffsetX = Math.round(thickness * 0.06);
  ctx.shadowOffsetY = Math.round(thickness * 0.34);
  ctx.fillStyle = toAlphaColor(MAGNET_RENDER_THEME.shadow, shadowStrength * 0.42);
  ctx.fill(path);

  ctx.shadowColor = toAlphaColor(MAGNET_RENDER_THEME.shadowSoft, shadowStrength * 0.48);
  ctx.shadowBlur = magnet.height * (0.16 + shadowSoftness * 0.92);
  ctx.shadowOffsetX = thickness * 0.12;
  ctx.shadowOffsetY = thickness * 0.56;
  ctx.fillStyle = toAlphaColor(MAGNET_RENDER_THEME.shadowSoft, shadowStrength * 0.26);
  ctx.fill(path);
  ctx.restore();
}

function drawShapeFace(ctx, path, magnet, faceTop, faceMid, faceBottom) {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, 0, magnet.height);
  gradient.addColorStop(0, faceTop);
  gradient.addColorStop(0.34, faceMid);
  gradient.addColorStop(0.74, faceMid);
  gradient.addColorStop(1, faceBottom);
  ctx.fillStyle = gradient;
  ctx.fill(path);

  const topGlow = ctx.createLinearGradient(0, 0, 0, magnet.height * 0.48);
  topGlow.addColorStop(0, toAlphaColor(MAGNET_RENDER_THEME.highlight, 0.16));
  topGlow.addColorStop(0.3, toAlphaColor(MAGNET_RENDER_THEME.highlight, 0.06));
  topGlow.addColorStop(1, toAlphaColor(MAGNET_RENDER_THEME.highlight, 0));
  ctx.fillStyle = topGlow;
  ctx.fill(path);

  const lowerShade = ctx.createLinearGradient(0, magnet.height * 0.12, 0, magnet.height);
  lowerShade.addColorStop(0, toAlphaColor(MAGNET_RENDER_THEME.shadowSoft, 0));
  lowerShade.addColorStop(0.7, toAlphaColor(MAGNET_RENDER_THEME.shadowSoft, 0.04));
  lowerShade.addColorStop(1, toAlphaColor(MAGNET_RENDER_THEME.shadowSoft, 0.12));
  ctx.fillStyle = lowerShade;
  ctx.fill(path);
  ctx.restore();
}

function drawShapeHighlight(ctx, path, magnet, highlightStrength) {
  ctx.save();
  ctx.clip(path);
  const gloss = ctx.createLinearGradient(0, 0, 0, magnet.height * 0.5);
  gloss.addColorStop(0, toAlphaColor(MAGNET_RENDER_THEME.highlight, 0.22 * highlightStrength));
  gloss.addColorStop(0.3, toAlphaColor(MAGNET_RENDER_THEME.highlight, 0.1 * highlightStrength));
  gloss.addColorStop(1, toAlphaColor(MAGNET_RENDER_THEME.highlight, 0));
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, magnet.width, magnet.height * 0.52);
  ctx.restore();
}

function getShapePath(magnet) {
  const path = new Path2D();

  if (magnet.shapeType === 'dot') {
    path.arc(magnet.width / 2, magnet.height / 2, Math.min(magnet.width, magnet.height) / 2, 0, Math.PI * 2);
    return path;
  }

  const radius =
    magnet.shapeType === 'pill'
      ? magnet.height / 2
      : Math.min(magnet.width, magnet.height) * 0.24;
  addRoundedRectPath(path, 0, 0, magnet.width, magnet.height, radius);

  return path;
}

function addRoundedRectPath(path, x, y, width, height, radius) {
  const nextRadius = Math.min(radius, width / 2, height / 2);
  path.moveTo(x + nextRadius, y);
  path.lineTo(x + width - nextRadius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  path.lineTo(x + width, y + height - nextRadius);
  path.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  path.lineTo(x + nextRadius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  path.lineTo(x, y + nextRadius);
  path.quadraticCurveTo(x, y, x + nextRadius, y);
  path.closePath();
}

function createWorkingCanvas(width, height) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));

  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(safeWidth, safeHeight);
  }

  const canvas = document.createElement('canvas');
  canvas.width = safeWidth;
  canvas.height = safeHeight;
  return canvas;
}

function resolveRectSource(source) {
  const resolved = typeof source === 'function' ? source() : source;

  if (!resolved) {
    return null;
  }

  const node =
    typeof Element !== 'undefined' && resolved instanceof Element
      ? resolved
      : typeof Element !== 'undefined' && resolved.current instanceof Element
        ? resolved.current
        : null;

  if (node) {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  }

  if (
    typeof resolved.x === 'number' &&
    typeof resolved.y === 'number' &&
    typeof resolved.width === 'number' &&
    typeof resolved.height === 'number'
  ) {
    return {
      x: resolved.x,
      y: resolved.y,
      width: resolved.width,
      height: resolved.height,
    };
  }

  if (
    typeof resolved.left === 'number' &&
    typeof resolved.top === 'number' &&
    typeof resolved.right === 'number' &&
    typeof resolved.bottom === 'number'
  ) {
    return {
      x: resolved.left,
      y: resolved.top,
      width: resolved.right - resolved.left,
      height: resolved.bottom - resolved.top,
    };
  }

  return null;
}

function expandPadding(padding) {
  if (typeof padding === 'number') {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding,
    };
  }

  return {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0,
  };
}

function shiftColor(color, amount = 0) {
  const rgb = parseHexColor(color);

  if (!rgb) {
    return color;
  }

  return toHexColor({
    red: adjustChannel(rgb.red, amount),
    green: adjustChannel(rgb.green, amount),
    blue: adjustChannel(rgb.blue, amount),
  });
}

function mixColors(colorA, colorB, ratio = 0.5) {
  const rgbA = parseHexColor(colorA);
  const rgbB = parseHexColor(colorB);

  if (!rgbA || !rgbB) {
    return colorA;
  }

  return toHexColor({
    red: Math.round(rgbA.red + (rgbB.red - rgbA.red) * ratio),
    green: Math.round(rgbA.green + (rgbB.green - rgbA.green) * ratio),
    blue: Math.round(rgbA.blue + (rgbB.blue - rgbA.blue) * ratio),
  });
}

function getGroundShadowBounceColor(baseColor, saturation = 1) {
  const mutedBounce = mixColors(baseColor, MAGNET_RENDER_THEME.shadowSoft, 0.72);
  const neutralBounce = mixColors(mutedBounce, MAGNET_RENDER_THEME.shadowSoft, 0.86);
  const clampedSaturation = clamp(saturation, 0, 1.5);

  if (clampedSaturation <= 1) {
    return shiftColor(
      mixColors(neutralBounce, mutedBounce, clampedSaturation),
      -0.04,
    );
  }

  const boostedBounce = mixColors(
    mutedBounce,
    baseColor,
    ((clampedSaturation - 1) / 0.5) * 0.18,
  );
  return shiftColor(boostedBounce, -0.04);
}

function getReadableTextColor(color) {
  const rgb = parseHexColor(color);

  if (!rgb) {
    return MAGNET_RENDER_THEME.textLight;
  }

  const luminance = (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;

  return luminance > 168 ? MAGNET_RENDER_THEME.textDark : MAGNET_RENDER_THEME.textLight;
}

function scaleLetterLayout(layout, scale) {
  const match = /^900\s+([\d.]+)px\s+(.+)$/.exec(layout.font);
  const nextFontSize = layout.fontSize * scale;
  const fontFamily = match?.[2] ?? MAGNET_FONT_FAMILY;

  return {
    ...layout,
    fontSize: nextFontSize,
    font: `900 ${nextFontSize}px ${fontFamily}`,
    x: layout.x * scale,
    y: layout.y * scale,
  };
}

function parseHexColor(color) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);

  if (!match) {
    return null;
  }

  const hex = match[1].length === 3
    ? match[1]
        .split('')
        .map((char) => char + char)
        .join('')
    : match[1];

  return {
    red: Number.parseInt(hex.slice(0, 2), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    blue: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function toHexColor({ red, green, blue }) {
  return `#${[red, green, blue]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function adjustChannel(channel, amount) {
  if (amount >= 0) {
    return channel + (255 - channel) * amount;
  }

  return channel * (1 + amount);
}

function saturateColor(color, multiplier = 1) {
  const rgb = parseHexColor(color);

  if (!rgb) {
    return color;
  }

  const hsl = rgbToHsl(rgb.red, rgb.green, rgb.blue);

  return hslToHex({
    hue: hsl.hue,
    saturation: clamp(hsl.saturation * multiplier, 0, 1),
    lightness: hsl.lightness,
  });
}

function rgbToHsl(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { hue: 0, saturation: 0, lightness };
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);

  let hue;

  switch (max) {
    case r:
      hue = (g - b) / delta + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
      break;
  }

  return {
    hue: hue / 6,
    saturation,
    lightness,
  };
}

function hslToHex({ hue, saturation, lightness }) {
  const hueToRgb = (p, q, t) => {
    let value = t;

    if (value < 0) {
      value += 1;
    }

    if (value > 1) {
      value -= 1;
    }

    if (value < 1 / 6) {
      return p + (q - p) * 6 * value;
    }

    if (value < 1 / 2) {
      return q;
    }

    if (value < 2 / 3) {
      return p + (q - p) * (2 / 3 - value) * 6;
    }

    return p;
  };

  let red;
  let green;
  let blue;

  if (saturation === 0) {
    red = green = blue = lightness;
  } else {
    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    red = hueToRgb(p, q, hue + 1 / 3);
    green = hueToRgb(p, q, hue);
    blue = hueToRgb(p, q, hue - 1 / 3);
  }

  return toHexColor({
    red: Math.round(red * 255),
    green: Math.round(green * 255),
    blue: Math.round(blue * 255),
  });
}

function toAlphaColor(color, alpha) {
  const rgb = parseHexColor(color);

  if (!rgb) {
    return color;
  }

  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${clamp(alpha, 0, 1)})`;
}
