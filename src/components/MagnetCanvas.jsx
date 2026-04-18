import { useEffect, useEffectEvent, useRef } from 'react';

import {
  clamp,
  drawMagnet,
  findTopMagnetAtPoint,
  invalidateMagnetRenderCaches,
  normalizeMagnetList,
} from './magnetUtils';

const LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  contain: 'strict',
  willChange: 'transform',
};
const HIT_PADDING = 8;
const INTRO_STAGGER_MS = 22;
const INTRO_DURATION_MS = 420;
const BOUNCE_DURATION_MS = 1100;

export default function MagnetCanvas({
  magnets,
  initialMagnets = [],
  className,
  pixelRatioCap = 1.6,
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const magnetsRef = useRef([]);
  const sortedMagnetsRef = useRef([]);
  const drawFrameRef = useRef(0);
  const introAnimationRef = useRef(null);
  const introHasPlayedRef = useRef(false);
  const floatProfilesRef = useRef(new Map());
  const bounceStatesRef = useRef(new Map());
  const pointerPointRef = useRef(null);
  const hoverMagnetIdRef = useRef(null);
  const layerOriginRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 });
  const prefersReducedMotionRef = useRef(false);
  const didHydrateInitialMagnetsRef = useRef(false);
  const sessionPhaseRef = useRef(Math.random() * Math.PI * 2);
  const isControlled = magnets != null;

  const requestDraw = useEffectEvent(() => {
    if (drawFrameRef.current) {
      return;
    }

    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = 0;
      drawScene();
    });
  });

  const syncCanvasSize = useEffectEvent(() => {
    const canvas = canvasRef.current;
    const layer = canvas?.parentElement;

    if (!canvas || !layer) {
      return;
    }

    const layerRect = layer.getBoundingClientRect();
    const width = Math.max(0, Math.round(layerRect.width));
    const height = Math.max(0, Math.round(layerRect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, pixelRatioCap);
    const backingWidth = Math.round(width * dpr);
    const backingHeight = Math.round(height * dpr);

    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    if (!contextRef.current) {
      contextRef.current = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
      });
    }

    layerOriginRef.current = {
      x: layerRect.left + window.scrollX,
      y: layerRect.top + window.scrollY,
    };
    viewportRef.current = { width, height, dpr };
    requestDraw();
  });

  const syncFloatProfiles = useEffectEvent((nextMagnets) => {
    const nextProfiles = new Map();

    nextMagnets.forEach((magnet) => {
      nextProfiles.set(
        magnet.id,
        createFloatProfile(magnet, sessionPhaseRef.current),
      );
    });

    floatProfilesRef.current = nextProfiles;
  });

  const pruneBounceStates = useEffectEvent((nextMagnets) => {
    const validIds = new Set(nextMagnets.map((magnet) => magnet.id));

    for (const magnetId of bounceStatesRef.current.keys()) {
      if (!validIds.has(magnetId)) {
        bounceStatesRef.current.delete(magnetId);
      }
    }

    if (hoverMagnetIdRef.current && !validIds.has(hoverMagnetIdRef.current)) {
      hoverMagnetIdRef.current = null;
    }
  });

  const maybePrimeIntroAnimation = useEffectEvent((nextMagnets) => {
    if (introHasPlayedRef.current) {
      return;
    }

    const heroMagnets = nextMagnets.filter(
      (magnet) => magnet.boardId === 'hero' && Number.isFinite(magnet.lineIndex),
    );

    if (heroMagnets.length < 2) {
      return;
    }

    const heroBounds = heroMagnets.reduce((acc, magnet) => ({
      left: Math.min(acc.left, magnet.x),
      top: Math.min(acc.top, magnet.y),
      right: Math.max(acc.right, magnet.x + magnet.width),
      bottom: Math.max(acc.bottom, magnet.y + magnet.height),
    }), {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
    });
    const centerX = (heroBounds.left + heroBounds.right) / 2;
    const centerY = (heroBounds.top + heroBounds.bottom) / 2;
    const entries = new Map();

    heroMagnets.forEach((magnet) => {
      const hash = hashString(`${magnet.id}:${magnet.lineIndex}:${magnet.charIndex}`);
      const radial = normalizeVector(
        magnet.x + magnet.width / 2 - centerX,
        magnet.y + magnet.height / 2 - centerY,
      );
      const jitterAngle = ((hash % 360) * Math.PI) / 180;
      const jitterVector = {
        x: Math.cos(jitterAngle),
        y: Math.sin(jitterAngle),
      };
      const travelDistance =
        Math.max(22, magnet.height * 0.18) + ((hash >>> 3) % 18);
      const direction = normalizeVector(
        radial.x * 0.72 + jitterVector.x * 0.48,
        radial.y * 0.72 + jitterVector.y * 0.48,
      );
      const delayBucket = (magnet.charIndex + magnet.lineIndex * 2 + (hash % 3)) % 6;

      entries.set(magnet.id, {
        fromX: magnet.x + direction.x * travelDistance,
        fromY: magnet.y + direction.y * travelDistance,
        fromRotation: magnet.rotation + direction.x * 5.5 + direction.y * 3.5,
        delayMs: delayBucket * INTRO_STAGGER_MS,
        durationMs: INTRO_DURATION_MS + (hash % 2) * 18,
      });
    });

    const maxDelay = Math.max(
      ...Array.from(entries.values(), (entry) => entry.delayMs),
    );
    const startTime = performance.now();

    introAnimationRef.current = {
      entries,
      startTime,
      endTime: startTime + maxDelay + INTRO_DURATION_MS + 18,
    };
    introHasPlayedRef.current = true;
  });

  const syncExternalMagnets = useEffectEvent((sourceMagnets) => {
    const nextMagnets = normalizeMagnetList(sourceMagnets);
    magnetsRef.current = nextMagnets;
    sortedMagnetsRef.current = sortMagnetsForPaint(nextMagnets);
    syncFloatProfiles(nextMagnets);
    pruneBounceStates(nextMagnets);
    maybePrimeIntroAnimation(nextMagnets);
    requestDraw();
  });

  const isIntroAnimating = useEffectEvent((now = performance.now()) => {
    const intro = introAnimationRef.current;

    if (!intro) {
      return false;
    }

    if (now >= intro.endTime) {
      introAnimationRef.current = null;
      return false;
    }

    return true;
  });

  const resolveIntroMagnet = useEffectEvent((magnet, now) => {
    const intro = introAnimationRef.current;

    if (!intro) {
      return magnet;
    }

    if (now >= intro.endTime) {
      introAnimationRef.current = null;
      return magnet;
    }

    const entry = intro.entries.get(magnet.id);

    if (!entry) {
      return magnet;
    }

    const elapsed = now - intro.startTime - entry.delayMs;

    if (elapsed <= 0) {
      return {
        ...magnet,
        x: entry.fromX,
        y: entry.fromY,
        rotation: entry.fromRotation,
      };
    }

    const progress = clamp(elapsed / entry.durationMs, 0, 1);

    if (progress >= 1) {
      return magnet;
    }

    const eased = easeOutCubic(progress);

    return {
      ...magnet,
      x: lerp(entry.fromX, magnet.x, eased),
      y: lerp(entry.fromY, magnet.y, eased),
      rotation: lerp(entry.fromRotation, magnet.rotation, eased),
    };
  });

  const resolveBounceOffset = useEffectEvent((magnet, now) => {
    const state = bounceStatesRef.current.get(magnet.id);

    if (!state) {
      return { x: 0, y: 0, rotation: 0 };
    }

    const elapsedSeconds = (now - state.startTime) / 1000;

    if (elapsedSeconds >= BOUNCE_DURATION_MS / 1000) {
      bounceStatesRef.current.delete(magnet.id);
      return { x: 0, y: 0, rotation: 0 };
    }

    const attack = 1 - Math.exp(-elapsedSeconds * 18);
    const decay = Math.exp(-elapsedSeconds * state.decay);
    const wave = Math.cos(elapsedSeconds * state.frequency);
    const sway = Math.sin(elapsedSeconds * state.frequency * 0.72 + state.phase);
    const scale = attack * decay;

    return {
      x: state.amplitudeX * sway * scale,
      y: state.amplitudeY * wave * scale,
      rotation: state.rotationAmplitude * wave * scale * state.rotationDirection,
    };
  });

  const getPointerLean = useEffectEvent((magnet, profile) => {
    const point = pointerPointRef.current;

    if (!point) {
      return 0;
    }

    const centerX = magnet.x + magnet.width / 2;
    return (
      clamp(
        (point.x - centerX) / Math.max(magnet.width * 0.52, 1),
        -1,
        1,
      ) * profile.hoverLean
    );
  });

  const resolveFloatingMagnet = useEffectEvent((magnet, now) => {
    const profile = floatProfilesRef.current.get(magnet.id);

    if (!profile) {
      return magnet;
    }

    const time = now / 1000;
    const idleX =
      Math.sin(time * profile.waveX + profile.phaseX) * profile.amplitudeX +
      Math.cos(time * profile.driftX + profile.phaseDrift) * profile.amplitudeX * 0.36;
    const idleY =
      Math.sin(time * profile.waveY + profile.phaseY) * profile.amplitudeY +
      Math.cos(time * profile.driftY + profile.phaseDrift) * profile.amplitudeY * 0.32;
    const idleRotation =
      Math.sin(time * profile.waveRotation + profile.phaseRotation) * profile.rotationAmplitude;
    const isHovered = hoverMagnetIdRef.current === magnet.id;
    const bounce = resolveBounceOffset(magnet, now);

    return {
      ...magnet,
      x: magnet.x + idleX + bounce.x,
      y: magnet.y + idleY + bounce.y + (isHovered ? profile.hoverSink : 0),
      rotation:
        magnet.rotation +
        idleRotation +
        bounce.rotation +
        (isHovered ? getPointerLean(magnet, profile) : 0),
    };
  });

  const drawScene = useEffectEvent(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = contextRef.current;
    const { width, height, dpr } = viewportRef.current;

    if (!ctx || width === 0 || height === 0) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const now = performance.now();
    const allowFloating = !prefersReducedMotionRef.current;
    let hasActiveIntroFrame = false;

    for (const magnet of sortedMagnetsRef.current) {
      const introMagnet = resolveIntroMagnet(magnet, now);
      const animatedMagnet = allowFloating
        ? resolveFloatingMagnet(introMagnet, now)
        : introMagnet;

      if (introMagnet !== magnet) {
        hasActiveIntroFrame = true;
      }

      drawMagnet(ctx, animatedMagnet, layerOriginRef.current, viewportRef.current);
    }

    if (hasActiveIntroFrame || allowFloating) {
      requestDraw();
    }
  });

  const triggerBounce = useEffectEvent((magnetId) => {
    const profile = floatProfilesRef.current.get(magnetId);

    if (!profile) {
      return;
    }

    bounceStatesRef.current.set(magnetId, {
      startTime: performance.now(),
      amplitudeX: profile.bounceAmplitudeX,
      amplitudeY: profile.bounceAmplitudeY,
      rotationAmplitude: profile.bounceRotation,
      frequency: profile.bounceFrequency,
      decay: profile.bounceDecay,
      phase: profile.phaseBounce,
      rotationDirection: profile.rotationDirection,
    });
  });

  const updateHoverTarget = useEffectEvent((point) => {
    pointerPointRef.current = point;

    if (prefersReducedMotionRef.current) {
      return;
    }

    const hit = point
      ? findTopMagnetAtPoint(magnetsRef.current, point, HIT_PADDING)
      : null;
    const nextHoverId = hit?.magnet.id ?? null;
    const previousHoverId = hoverMagnetIdRef.current;

    hoverMagnetIdRef.current = nextHoverId;

    if (nextHoverId && nextHoverId !== previousHoverId) {
      triggerBounce(nextHoverId);
    }

    if (nextHoverId || previousHoverId !== nextHoverId) {
      requestDraw();
    }
  });

  const clearHoverState = useEffectEvent(() => {
    pointerPointRef.current = null;

    if (!hoverMagnetIdRef.current) {
      return;
    }

    hoverMagnetIdRef.current = null;
    requestDraw();
  });

  useEffect(() => {
    if (isControlled) {
      syncExternalMagnets(magnets);
      return;
    }

    if (!didHydrateInitialMagnetsRef.current || magnetsRef.current.length === 0) {
      didHydrateInitialMagnetsRef.current = true;
      syncExternalMagnets(initialMagnets);
    }
  }, [initialMagnets, isControlled, magnets, syncExternalMagnets]);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      return;
    }

    let cancelled = false;
    const refreshGlyphCaches = () => {
      if (cancelled) {
        return;
      }

      invalidateMagnetRenderCaches();
      requestDraw();
    };

    document.fonts.ready.then(refreshGlyphCaches).catch(() => {});

    const fontSet = document.fonts;
    if (typeof fontSet.addEventListener !== 'function') {
      return () => {
        cancelled = true;
      };
    }

    fontSet.addEventListener('loadingdone', refreshGlyphCaches);

    return () => {
      cancelled = true;
      fontSet.removeEventListener('loadingdone', refreshGlyphCaches);
    };
  }, [requestDraw]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
      prefersReducedMotionRef.current = mediaQuery.matches;
      requestDraw();
    };

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => {
      mediaQuery.removeEventListener('change', syncPreference);
    };
  }, [requestDraw]);

  useEffect(() => {
    syncCanvasSize();
    const layer = canvasRef.current?.parentElement ?? null;
    const resizeObserver = layer && typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => syncCanvasSize())
      : null;

    if (layer) {
      resizeObserver?.observe(layer);
    }

    const handlePointerMove = (event) => {
      if (isIntroAnimating()) {
        return;
      }

      updateHoverTarget(toDocumentPoint(event));
    };

    window.addEventListener('resize', syncCanvasSize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', clearHoverState);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', clearHoverState);

      if (drawFrameRef.current) {
        window.cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = 0;
      }
    };
  }, [
    clearHoverState,
    isIntroAnimating,
    syncCanvasSize,
    updateHoverTarget,
  ]);

  return (
    <div aria-hidden="true" className={className} style={LAYER_STYLE}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function toDocumentPoint(event) {
  return {
    x: event.clientX + window.scrollX,
    y: event.clientY + window.scrollY,
  };
}

function sortMagnetsForPaint(magnets) {
  return [...magnets].sort((left, right) => {
    if (left.zIndex !== right.zIndex) {
      return left.zIndex - right.zIndex;
    }

    return `${left.id}`.localeCompare(`${right.id}`);
  });
}

function createFloatProfile(magnet, sessionPhase) {
  const seed = hashString(`${magnet.id}:${sessionPhase.toFixed(6)}`);
  const height = Math.max(28, magnet.height ?? magnet.size ?? 68);
  const width = Math.max(28, magnet.width ?? height);
  const unit = (shift) => ((seed >>> shift) & 1023) / 1023;

  return {
    amplitudeX: clamp(width * (0.0035 + unit(0) * 0.005), 0.35, 1.9),
    amplitudeY: clamp(height * (0.012 + unit(3) * 0.011), 1.1, 4.4),
    rotationAmplitude: clamp(0.18 + unit(6) * 0.92, 0.18, 1.1),
    waveX: 0.42 + unit(9) * 0.16,
    driftX: 0.18 + unit(12) * 0.08,
    waveY: 0.48 + unit(15) * 0.18,
    driftY: 0.24 + unit(18) * 0.08,
    waveRotation: 0.34 + unit(21) * 0.12,
    phaseX: sessionPhase + unit(24) * Math.PI * 2,
    phaseY: sessionPhase * 0.6 + unit(27) * Math.PI * 2,
    phaseRotation: sessionPhase * 1.2 + unit(30) * Math.PI * 2,
    phaseDrift: sessionPhase * 0.8 + unit(5) * Math.PI * 2,
    phaseBounce: unit(11) * Math.PI,
    hoverSink: clamp(height * 0.009, 0.8, 1.9),
    hoverLean: clamp(0.55 + unit(14) * 0.85, 0.55, 1.4),
    bounceAmplitudeX: clamp(width * 0.003, 0.15, 0.75),
    bounceAmplitudeY: clamp(height * 0.036 + unit(17) * 0.8, 2.2, 6.4),
    bounceRotation: clamp(0.24 + unit(20) * 0.9, 0.24, 1.2),
    bounceFrequency: 13 + unit(23) * 5,
    bounceDecay: 3.4 + unit(26) * 1.4,
    rotationDirection: unit(29) > 0.5 ? 1 : -1,
  };
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function easeOutCubic(value) {
  const clamped = clamp(value, 0, 1);
  return 1 - (1 - clamped) ** 3;
}

function normalizeVector(x, y) {
  const length = Math.hypot(x, y);

  if (length < 0.0001) {
    return { x: 0, y: -1 };
  }

  return {
    x: x / length,
    y: y / length,
  };
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
