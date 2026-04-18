const DEFAULT_MAGNET_COLORS = [
  '#ff5c57',
  '#4d86ff',
  '#ffbf2f',
  '#22d98b',
  '#7e5cff',
  '#ff9a3d',
];

export const MAGNET_FONT_FAMILY =
  "'Fredoka', 'Arial Rounded MT Bold', 'Nunito', 'Trebuchet MS', 'Segoe UI', sans-serif";

const DEG_TO_RAD = Math.PI / 180;
const LETTER_LAYOUT_CACHE = new Map();
const LETTER_LAYOUT_CACHE_LIMIT = 160;
const LETTER_SPRITE_CACHE = new Map();
const LETTER_SPRITE_CACHE_LIMIT = 140;
let measureCanvas = null;

const SINGLE_LETTER_WIDTH_SCALE = {
  '5': 0.78,
  "'": 0.28,
  '’': 0.28,
  '.': 0.24,
  '…': 0.54,
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
  const color = magnet.color ?? DEFAULT_MAGNET_COLORS[index % DEFAULT_MAGNET_COLORS.length];

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
    localY <= magnet.height + padding
  );
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
  const vibrance = magnet.vibrance ?? 1.18;
  const depth = magnet.depth ?? 1;
  const roundness = magnet.roundness ?? 1;
  const shadowOpacity = magnet.shadowOpacity ?? magnet.shadowStrength ?? 0.22;
  const shadowOffset = magnet.shadowOffset ?? 1;
  const shadowBlur = magnet.shadowBlur ?? magnet.shadowSoftness ?? 0.12;
  const shadowLayers = magnet.shadowLayers ?? 2;
  const highlightStrength = magnet.highlightStrength ?? 0.22;
  const faceContrast = magnet.faceContrast ?? 1;
  const baseColor = saturateColor(magnet.color, vibrance);
  const thickness = Math.max(3.5, magnet.height * (0.034 + depth * 0.03 * roundness));
  const faceTop = shiftColor(baseColor, 0.05 + faceContrast * 0.095);
  const faceMid = shiftColor(baseColor, 0.012 + faceContrast * 0.026);
  const faceBottom = shiftColor(baseColor, -0.08 - faceContrast * 0.058);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(magnet.rotation * DEG_TO_RAD);
  ctx.translate(-magnet.width / 2, -magnet.height / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  if (magnet.shapeType) {
    const shapePath = getShapePath(magnet);
    drawShapeShadow(ctx, shapePath, magnet, thickness, shadowOpacity, shadowBlur);
    drawShapeFace(ctx, shapePath, magnet, faceTop, faceMid, faceBottom);
    drawShapeHighlight(ctx, shapePath, magnet, highlightStrength);
  } else {
    const labelLayout = getLabelLayout(magnet);
    drawLetterSprite(ctx, magnet, labelLayout, {
      baseColor,
      faceTop,
      faceMid,
      faceBottom,
      shadowOpacity,
      shadowOffset,
      shadowBlur,
      shadowLayers,
      depth,
      roundness,
      faceContrast,
      highlightStrength,
    });
  }
  ctx.restore();
}

function drawLetterSprite(ctx, magnet, layout, style) {
  const cacheKey = getLetterSpriteCacheKey(magnet, layout, style);
  const cached = LETTER_SPRITE_CACHE.get(cacheKey);

  if (cached) {
    ctx.drawImage(cached.canvas, cached.offsetX, cached.offsetY);
    return;
  }

  const sprite = buildLetterSprite(magnet, layout, style);
  cacheSetWithLimit(LETTER_SPRITE_CACHE, cacheKey, sprite, LETTER_SPRITE_CACHE_LIMIT);
  ctx.drawImage(sprite.canvas, sprite.offsetX, sprite.offsetY);
}

function buildLetterSprite(
  magnet,
  layout,
  style,
) {
  const depthPixels = Math.max(6, Math.round(layout.fontSize * (0.08 + style.depth * 0.06)));
  const extrusionDX = 0.16 + style.shadowOffset * 0.33;
  const extrusionDY = 0.65 + style.shadowOffset * 0.56;
  const outerShadowBlur = layout.fontSize * (0.02 + style.shadowBlur * 0.26);
  const sideBlur = layout.fontSize * (0.004 + style.roundness * 0.0016);
  const pad = Math.ceil(
    Math.max(
      5,
      depthPixels * Math.max(extrusionDX, extrusionDY) + outerShadowBlur * 2.2 + layout.fontSize * 0.09,
    ),
  );

  const width = Math.max(1, Math.ceil(magnet.width + pad * 2));
  const height = Math.max(1, Math.ceil(magnet.height + pad * 2));
  const canvas = createWorkingCanvas(width, height);
  const canvasCtx = canvas.getContext('2d');

  if (!canvasCtx) {
    return {
      canvas,
      offsetX: -pad,
      offsetY: -pad,
    };
  }

  const textX = pad + layout.x;
  const textY = pad + layout.y;
  const maskCanvas = createGlyphMaskCanvas(width, height, layout, textX, textY);
  const effectCanvas = createWorkingCanvas(width, height);

  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.textAlign = 'center';
  canvasCtx.textBaseline = 'middle';
  canvasCtx.lineJoin = 'round';
  canvasCtx.miterLimit = 2;
  canvasCtx.font = layout.font;

  if (style.shadowOpacity > 0.01) {
    canvasCtx.save();
    canvasCtx.fillStyle = toAlphaColor('#3c2d1d', style.shadowOpacity * 0.6);
    canvasCtx.shadowColor = toAlphaColor('#3c2d1d', style.shadowOpacity * 0.95);
    canvasCtx.shadowBlur = outerShadowBlur + style.shadowLayers * 0.36;
    canvasCtx.shadowOffsetX = Math.round(depthPixels * extrusionDX * 0.32);
    canvasCtx.shadowOffsetY = Math.round(depthPixels * extrusionDY * 0.44);
    canvasCtx.fillText(
      layout.label,
      textX + depthPixels * 0.44,
      textY + depthPixels * 0.56,
    );
    canvasCtx.restore();
  }

  canvasCtx.save();
  canvasCtx.shadowColor = toAlphaColor('#3b2c1b', 0.22 + style.shadowOpacity * 0.38);
  canvasCtx.shadowBlur = sideBlur;
  canvasCtx.shadowOffsetX = 0;
  canvasCtx.shadowOffsetY = 0;
  for (let step = depthPixels; step >= 1; step -= 1) {
    const progress = step / depthPixels;
    const sideColor = mixColors(
      style.baseColor,
      '#3d2b1b',
      clamp(0.5 + progress * 0.34 + style.depth * 0.05, 0.44, 0.93),
    );
    const alpha = clamp(
      0.26 + (1 - progress) * (0.48 + style.shadowOpacity * 0.2),
      0.18,
      0.88,
    );
    canvasCtx.fillStyle = toAlphaColor(sideColor, alpha);
    canvasCtx.fillText(
      layout.label,
      textX + step * extrusionDX,
      textY + step * extrusionDY,
    );
  }
  canvasCtx.restore();

  canvasCtx.fillStyle = toAlphaColor(
    mixColors(style.baseColor, '#2f2115', 0.84),
    clamp(0.26 + style.depth * 0.08, 0.2, 0.45),
  );
  canvasCtx.fillText(
    layout.label,
    textX + depthPixels * (extrusionDX + 0.08),
    textY + depthPixels * (extrusionDY + 0.08),
  );

  const faceCanvas = createWorkingCanvas(width, height);
  const faceCtx = faceCanvas.getContext('2d');

  if (faceCtx) {
    faceCtx.clearRect(0, 0, width, height);
    const faceGradient = faceCtx.createLinearGradient(
      textX - magnet.width * 0.16,
      textY - magnet.height * 0.54,
      textX + magnet.width * 0.26,
      textY + magnet.height * 0.62,
    );
    faceGradient.addColorStop(0, style.faceTop);
    faceGradient.addColorStop(0.34, style.faceMid);
    faceGradient.addColorStop(0.72, style.faceMid);
    faceGradient.addColorStop(1, style.faceBottom);
    faceCtx.fillStyle = faceGradient;
    faceCtx.fillRect(0, 0, width, height);
    faceCtx.globalCompositeOperation = 'destination-in';
    faceCtx.drawImage(maskCanvas, 0, 0);
    faceCtx.globalCompositeOperation = 'source-over';

    applyInsetEffectToMask(faceCtx, effectCanvas, maskCanvas, {
      color: toAlphaColor(
        '#ffffff',
        clamp(0.44 + style.highlightStrength * 0.42, 0.3, 0.92),
      ),
      blur: layout.fontSize * (0.018 + style.roundness * 0.004),
      offsetX: -layout.fontSize * (0.02 + style.highlightStrength * 0.016),
      offsetY: -layout.fontSize * (0.022 + style.highlightStrength * 0.015),
      opacity: clamp(0.46 + style.highlightStrength * 0.44, 0.28, 0.95),
    });

    applyInsetEffectToMask(faceCtx, effectCanvas, maskCanvas, {
      color: toAlphaColor(
        mixColors(style.baseColor, '#382717', 0.9),
        clamp(0.48 + style.faceContrast * 0.14, 0.34, 0.82),
      ),
      blur: layout.fontSize * (0.02 + style.faceContrast * 0.01),
      offsetX: layout.fontSize * (0.024 + style.depth * 0.01),
      offsetY: layout.fontSize * (0.026 + style.depth * 0.014),
      opacity: clamp(0.4 + style.faceContrast * 0.28, 0.26, 0.86),
    });

    const topSpecular = faceCtx.createLinearGradient(
      0,
      textY - magnet.height * 0.7,
      0,
      textY + magnet.height * 0.16,
    );
    topSpecular.addColorStop(0, toAlphaColor('#ffffff', 0.42 + style.highlightStrength * 0.4));
    topSpecular.addColorStop(0.28, toAlphaColor('#ffffff', 0.18 + style.highlightStrength * 0.18));
    topSpecular.addColorStop(1, 'rgba(255, 255, 255, 0)');
    faceCtx.fillStyle = topSpecular;
    faceCtx.fillRect(0, 0, width, height);
    faceCtx.globalCompositeOperation = 'destination-in';
    faceCtx.drawImage(maskCanvas, 0, 0);
    faceCtx.globalCompositeOperation = 'source-over';

    faceCtx.save();
    faceCtx.textAlign = 'center';
    faceCtx.textBaseline = 'middle';
    faceCtx.lineJoin = 'round';
    faceCtx.miterLimit = 2;
    faceCtx.font = layout.font;
    faceCtx.lineWidth = Math.max(1, layout.fontSize * 0.026);
    faceCtx.strokeStyle = toAlphaColor(
      '#ffffff',
      clamp(0.08 + style.highlightStrength * 0.16, 0.06, 0.32),
    );
    faceCtx.strokeText(layout.label, textX, textY);
    faceCtx.restore();

    canvasCtx.drawImage(faceCanvas, 0, 0);
  } else {
    canvasCtx.fillStyle = style.faceMid;
    canvasCtx.fillText(layout.label, textX, textY);
  }

  return {
    canvas,
    offsetX: -pad,
    offsetY: -pad,
  };
}

function getLetterSpriteCacheKey(magnet, layout, style) {
  const width = Math.round(magnet.width);
  const height = Math.round(magnet.height);
  return [
    layout.label,
    layout.font,
    width,
    height,
    style.baseColor,
    getCacheKeyNumber(style.depth),
    getCacheKeyNumber(style.roundness),
    getCacheKeyNumber(style.shadowOpacity),
    getCacheKeyNumber(style.shadowOffset),
    getCacheKeyNumber(style.shadowBlur),
    getCacheKeyNumber(style.shadowLayers, 0),
    getCacheKeyNumber(style.highlightStrength),
    getCacheKeyNumber(style.faceContrast),
  ].join('|');
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
  let fontSize =
    magnet.fontSize ??
    Math.round(
      isApostrophe
        ? magnet.height * 1.06
        : isDot
          ? magnet.height * 0.96
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
      ? magnet.height * 0.34
      : isDot
        ? magnet.height * 0.6
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
  maskCtx.textAlign = 'center';
  maskCtx.textBaseline = 'middle';
  maskCtx.lineJoin = 'round';
  maskCtx.miterLimit = 2;
  maskCtx.font = layout.font;
  maskCtx.fillStyle = '#000000';
  maskCtx.fillText(layout.label, textX, textY);

  return maskCanvas;
}

function applyInsetEffectToMask(targetCtx, effectCanvas, maskCanvas, effect) {
  const effectCtx = effectCanvas.getContext('2d');

  if (!effectCtx) {
    return;
  }

  effectCtx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
  effectCtx.save();
  effectCtx.shadowColor = effect.color;
  effectCtx.shadowBlur = effect.blur;
  effectCtx.shadowOffsetX = effect.offsetX;
  effectCtx.shadowOffsetY = effect.offsetY;
  effectCtx.drawImage(maskCanvas, 0, 0);
  effectCtx.restore();

  effectCtx.globalCompositeOperation = 'destination-out';
  effectCtx.drawImage(maskCanvas, 0, 0);
  effectCtx.globalCompositeOperation = 'destination-in';
  effectCtx.drawImage(maskCanvas, 0, 0);
  effectCtx.globalCompositeOperation = 'source-over';

  targetCtx.save();
  targetCtx.globalAlpha = effect.opacity ?? 1;
  targetCtx.drawImage(effectCanvas, 0, 0);
  targetCtx.restore();
}

function drawShapeShadow(ctx, path, magnet, thickness, shadowStrength, shadowSoftness) {
  ctx.save();
  ctx.shadowColor = toAlphaColor('#4a3b1f', shadowStrength * 1.06);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = Math.round(thickness * 0.16);
  ctx.shadowOffsetY = Math.round(thickness * 0.96);
  ctx.fillStyle = toAlphaColor('#4a3b1f', shadowStrength);
  ctx.fill(path);

  ctx.shadowColor = toAlphaColor('#4a3b1f', shadowStrength * 0.58);
  ctx.shadowBlur = magnet.height * shadowSoftness * 0.62;
  ctx.shadowOffsetX = thickness * 0.24;
  ctx.shadowOffsetY = thickness * 1.08;
  ctx.fillStyle = toAlphaColor('#4a3b1f', shadowStrength * 0.42);
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
  topGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  topGlow.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
  topGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = topGlow;
  ctx.fill(path);

  const lowerShade = ctx.createLinearGradient(0, magnet.height * 0.12, 0, magnet.height);
  lowerShade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  lowerShade.addColorStop(0.7, 'rgba(46, 32, 15, 0.06)');
  lowerShade.addColorStop(1, 'rgba(46, 32, 15, 0.14)');
  ctx.fillStyle = lowerShade;
  ctx.fill(path);
  ctx.restore();
}

function drawShapeHighlight(ctx, path, magnet, highlightStrength) {
  ctx.save();
  ctx.clip(path);
  const gloss = ctx.createLinearGradient(0, 0, 0, magnet.height * 0.5);
  gloss.addColorStop(0, `rgba(255, 255, 255, ${0.28 * highlightStrength})`);
  gloss.addColorStop(0.3, `rgba(255, 255, 255, ${0.14 * highlightStrength})`);
  gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
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
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
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

function getReadableTextColor(color) {
  const rgb = parseHexColor(color);

  if (!rgb) {
    return '#fffaf6';
  }

  const luminance = (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;

  return luminance > 168 ? '#17202a' : '#fffaf6';
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
