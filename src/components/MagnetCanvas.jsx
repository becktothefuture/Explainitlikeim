import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';

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
const EDIT_LAYER_STYLE = {
  ...LAYER_STYLE,
  pointerEvents: 'auto',
  touchAction: 'none',
};
const HIT_PADDING = 0;
const INTRO_STAGGER_MS = 46;
const INTRO_DURATION_MS = 780;
const BOUNCE_DURATION_MS = 1100;
const AMBIENT_FLOAT_FADE_MS = 1480;
const GEOMETRY_TRACK_MS = 1680;
const DEFAULT_MOTION_CONFIG = {
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
};

export default function MagnetCanvas({
  magnets,
  initialMagnets = [],
  className,
  introEnabled = true,
  pixelRatioCap = 1.6,
  motionConfig = DEFAULT_MOTION_CONFIG,
  localCoordinates = false,
  layoutEditing = false,
  onLayoutCommit,
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const magnetsRef = useRef([]);
  const sortedMagnetsRef = useRef([]);
  const drawFrameRef = useRef(0);
  const introAnimationRef = useRef(null);
  const ambientFloatFadeStartRef = useRef(0);
  const geometryTrackUntilRef = useRef(0);
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
  const motionConfigRef = useRef(resolveMotionConfig(motionConfig));
  const introEnabledRef = useRef(introEnabled);
  const ambientMotionEnabledRef = useRef(true);
  const dragStateRef = useRef(null);
  const dragOverridesRef = useRef(new Map());
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
    let hasAmbientMotionValue = false;

    nextMagnets.forEach((magnet) => {
      const profile = createFloatProfile(
        magnet,
        sessionPhaseRef.current,
        motionConfigRef.current,
      );

      if (hasAmbientMotion(profile)) {
        hasAmbientMotionValue = true;
      }

      nextProfiles.set(magnet.id, profile);
    });

    floatProfilesRef.current = nextProfiles;
    ambientMotionEnabledRef.current = hasAmbientMotionValue;
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
    if (!introEnabledRef.current || introHasPlayedRef.current) {
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
    ambientFloatFadeStartRef.current = introAnimationRef.current.endTime;
    introHasPlayedRef.current = true;
  });

  const syncExternalMagnets = useEffectEvent((sourceMagnets) => {
    const nextMagnets = normalizeMagnetList(sourceMagnets);
    magnetsRef.current = nextMagnets;
    sortedMagnetsRef.current = sortMagnetsForPaint(nextMagnets);
    if (!dragStateRef.current) {
      dragOverridesRef.current = new Map();
    }
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

    const ambientFadeStart = ambientFloatFadeStartRef.current;
    const ambientBlend = ambientFadeStart > 0
      ? easeOutCubic(clamp((now - ambientFadeStart) / AMBIENT_FLOAT_FADE_MS, 0, 1))
      : 1;
    const time = now / 1000;
    const allowAmbientMotion = hasAmbientMotion(profile);
    const idleX = allowAmbientMotion
      ? (
        Math.sin(time * profile.waveX + profile.phaseX) * profile.amplitudeX +
        Math.cos(time * profile.driftX + profile.phaseDrift) * profile.amplitudeX * 0.36
      ) * ambientBlend
      : 0;
    const idleY = allowAmbientMotion
      ? (
        Math.sin(time * profile.waveY + profile.phaseY) * profile.amplitudeY +
        Math.cos(time * profile.driftY + profile.phaseDrift) * profile.amplitudeY * 0.32
      ) * ambientBlend
      : 0;
    const idleRotation = allowAmbientMotion
      ? Math.sin(time * profile.waveRotation + profile.phaseRotation) *
        profile.rotationAmplitude *
        ambientBlend
      : 0;
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

  const resolveDragOverride = useEffectEvent((magnet) => {
    const override = dragOverridesRef.current.get(magnet.id);

    if (!override) {
      return magnet;
    }

    return {
      ...magnet,
      x: override.x,
      y: override.y,
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
    if (!localCoordinates && now < geometryTrackUntilRef.current) {
      syncCanvasSize();
    }
    const allowFloating = !prefersReducedMotionRef.current && !layoutEditing;
    const introActive = isIntroAnimating(now);
    let hasActiveIntroFrame = false;

    for (const magnet of sortedMagnetsRef.current) {
      const baseMagnet = resolveDragOverride(magnet);
      const introMagnet = layoutEditing
        ? baseMagnet
        : resolveIntroMagnet(baseMagnet, now);
      const animatedMagnet = allowFloating && !introActive
        ? resolveFloatingMagnet(introMagnet, now)
        : introMagnet;

      if (introMagnet !== magnet) {
        hasActiveIntroFrame = true;
      }

      drawMagnet(
        ctx,
        animatedMagnet,
        localCoordinates ? { x: 0, y: 0 } : layerOriginRef.current,
        viewportRef.current,
      );
    }

    if (
      hasActiveIntroFrame ||
      (allowFloating && ambientMotionEnabledRef.current) ||
      bounceStatesRef.current.size > 0
    ) {
      requestDraw();
    }
  });

  const triggerBounce = useEffectEvent((magnetId) => {
    const profile = floatProfilesRef.current.get(magnetId);

    if (!profile) {
      return;
    }

    if (
      profile.bounceSpeedScale <= 0.001 ||
      (
        profile.bounceAmplitudeX <= 0.001 &&
        profile.bounceAmplitudeY <= 0.001 &&
        profile.bounceRotation <= 0.001
      )
    ) {
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
    if (layoutEditing) {
      pointerPointRef.current = null;
      return;
    }

    pointerPointRef.current = point;

    if (prefersReducedMotionRef.current) {
      return;
    }

    const hoverableMagnets = magnetsRef.current.filter(
      (magnet) => magnet.hoverable !== false,
    );
    const hit = point
      ? findTopMagnetAtPoint(hoverableMagnets, point, HIT_PADDING)
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

  const commitDraggedLayout = useEffectEvent((magnetId, nextPosition) => {
    if (!onLayoutCommit || !nextPosition) {
      return;
    }

    const magnet = magnetsRef.current.find((entry) => entry.id === magnetId);

    if (!magnet || magnet.boardId !== 'hero' || !magnet.bounds) {
      return;
    }

    const { width, height } = getMagnetDimensions(magnet);
    const dragBounds = getHeroDragBounds(magnet.bounds, width, height);
    const boundsWidth = Math.max(dragBounds.right - dragBounds.left, 1);
    const boundsHeight = Math.max(dragBounds.bottom - dragBounds.top, 1);

    onLayoutCommit({
      [magnetId]: {
        cx: clamp(
          (nextPosition.x + width / 2 - dragBounds.left) / boundsWidth,
          0,
          1,
        ),
        cy: clamp(
          (nextPosition.y + height / 2 - dragBounds.top) / boundsHeight,
          0,
          1,
        ),
        rotation: magnet.rotation,
      },
    });
  });

  const beginLayoutDrag = useEffectEvent((event) => {
    if (!layoutEditing) {
      return;
    }

    const point = toCanvasPoint(event, layerOriginRef.current, localCoordinates);
    const editableMagnets = magnetsRef.current
      .filter((magnet) => magnet.boardId === 'hero')
      .map((magnet) => resolveDragOverride(magnet));
    const hit = findTopMagnetAtPoint(editableMagnets, point, HIT_PADDING);
    const magnet = hit?.magnet;

    if (!magnet || !magnet.bounds) {
      return;
    }

    const { width, height } = getMagnetDimensions(magnet);
    const dragBounds = getHeroDragBounds(magnet.bounds, width, height);

    dragStateRef.current = {
      dragId: getDragEventId(event),
      magnetId: magnet.id,
      width,
      height,
      bounds: dragBounds,
      offsetX: point.x - magnet.x,
      offsetY: point.y - magnet.y,
    };
    dragOverridesRef.current.set(magnet.id, {
      x: magnet.x,
      y: magnet.y,
    });
    pointerPointRef.current = null;
    hoverMagnetIdRef.current = null;
    bounceStatesRef.current.clear();
    if ('pointerId' in event) {
      canvasRef.current?.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    requestDraw();
  });

  const updateLayoutDrag = useEffectEvent((event) => {
    const dragState = dragStateRef.current;

    if (!dragState || !matchesDragEvent(event, dragState.dragId)) {
      return;
    }

    const point = toCanvasPoint(event, layerOriginRef.current, localCoordinates);
    const nextX = clamp(
      point.x - dragState.offsetX,
      dragState.bounds.left,
      dragState.bounds.right - dragState.width,
    );
    const nextY = clamp(
      point.y - dragState.offsetY,
      dragState.bounds.top,
      dragState.bounds.bottom - dragState.height,
    );

    dragOverridesRef.current.set(dragState.magnetId, {
      x: nextX,
      y: nextY,
    });
    event.preventDefault();
    requestDraw();
  });

  const endLayoutDrag = useEffectEvent((event) => {
    const dragState = dragStateRef.current;

    if (!dragState || !matchesDragEvent(event, dragState.dragId)) {
      return;
    }

    const nextPosition = dragOverridesRef.current.get(dragState.magnetId);

    dragStateRef.current = null;
    if ('pointerId' in event) {
      canvasRef.current?.releasePointerCapture?.(event.pointerId);
    }
    commitDraggedLayout(dragState.magnetId, nextPosition);
    requestDraw();
  });

  useLayoutEffect(() => {
    syncCanvasSize();

    if (isControlled) {
      syncExternalMagnets(magnets);
      drawScene();
      return;
    }

    if (!didHydrateInitialMagnetsRef.current || magnetsRef.current.length === 0) {
      didHydrateInitialMagnetsRef.current = true;
      syncExternalMagnets(initialMagnets);
      drawScene();
    }
  }, [
    drawScene,
    initialMagnets,
    isControlled,
    magnets,
    syncCanvasSize,
    syncExternalMagnets,
  ]);

  useLayoutEffect(() => {
    motionConfigRef.current = resolveMotionConfig(motionConfig);
    syncFloatProfiles(magnetsRef.current);
    drawScene();
  }, [drawScene, motionConfig, syncFloatProfiles]);

  useEffect(() => {
    introEnabledRef.current = introEnabled;

    if (!introEnabled) {
      ambientFloatFadeStartRef.current = 0;
      geometryTrackUntilRef.current = 0;
      return;
    }

    geometryTrackUntilRef.current = performance.now() + GEOMETRY_TRACK_MS;
    syncCanvasSize();
    maybePrimeIntroAnimation(magnetsRef.current);
    requestDraw();
  }, [introEnabled, maybePrimeIntroAnimation, requestDraw, syncCanvasSize]);

  useEffect(() => {
    if (!layoutEditing) {
      dragStateRef.current = null;
      dragOverridesRef.current = new Map();
      requestDraw();
      return;
    }

    introAnimationRef.current = null;
    ambientFloatFadeStartRef.current = 0;
    geometryTrackUntilRef.current = 0;
    clearHoverState();
    bounceStatesRef.current.clear();
    requestDraw();
  }, [clearHoverState, layoutEditing, requestDraw]);

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
    const canvas = canvasRef.current;
    const interactionTarget = layer ?? canvas;
    const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;
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

      updateHoverTarget(toCanvasPoint(event, layerOriginRef.current, localCoordinates));
    };
    const handleMouseMove = (event) => {
      if (supportsPointerEvents || isIntroAnimating()) {
        return;
      }

      updateHoverTarget(toCanvasPoint(event, layerOriginRef.current, localCoordinates));
    };
    const beginMouseDrag = (event) => {
      if (supportsPointerEvents) {
        return;
      }

      beginLayoutDrag(event);
    };
    const updateMouseDrag = (event) => {
      if (supportsPointerEvents) {
        return;
      }

      updateLayoutDrag(event);
    };
    const endMouseDrag = (event) => {
      if (supportsPointerEvents) {
        return;
      }

      endLayoutDrag(event);
    };
    const beginTouchDrag = (event) => {
      if (supportsPointerEvents) {
        return;
      }

      beginLayoutDrag(event);
    };
    const updateTouchDrag = (event) => {
      if (supportsPointerEvents) {
        return;
      }

      updateLayoutDrag(event);
    };
    const endTouchDrag = (event) => {
      if (supportsPointerEvents) {
        return;
      }

      endLayoutDrag(event);
    };

    window.addEventListener('resize', syncCanvasSize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('blur', clearHoverState);
    interactionTarget?.addEventListener('pointerdown', beginLayoutDrag);
    interactionTarget?.addEventListener('mousedown', beginMouseDrag);
    interactionTarget?.addEventListener('touchstart', beginTouchDrag, { passive: false });
    window.addEventListener('pointermove', updateLayoutDrag);
    window.addEventListener('pointerup', endLayoutDrag);
    window.addEventListener('pointercancel', endLayoutDrag);
    window.addEventListener('mousemove', updateMouseDrag);
    window.addEventListener('mouseup', endMouseDrag);
    window.addEventListener('touchmove', updateTouchDrag, { passive: false });
    window.addEventListener('touchend', endTouchDrag);
    window.addEventListener('touchcancel', endTouchDrag);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', clearHoverState);
      interactionTarget?.removeEventListener('pointerdown', beginLayoutDrag);
      interactionTarget?.removeEventListener('mousedown', beginMouseDrag);
      interactionTarget?.removeEventListener('touchstart', beginTouchDrag);
      window.removeEventListener('pointermove', updateLayoutDrag);
      window.removeEventListener('pointerup', endLayoutDrag);
      window.removeEventListener('pointercancel', endLayoutDrag);
      window.removeEventListener('mousemove', updateMouseDrag);
      window.removeEventListener('mouseup', endMouseDrag);
      window.removeEventListener('touchmove', updateTouchDrag);
      window.removeEventListener('touchend', endTouchDrag);
      window.removeEventListener('touchcancel', endTouchDrag);

      if (drawFrameRef.current) {
        window.cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = 0;
      }
    };
  }, [
    beginLayoutDrag,
    clearHoverState,
    endLayoutDrag,
    isIntroAnimating,
    localCoordinates,
    syncCanvasSize,
    updateHoverTarget,
    updateLayoutDrag,
  ]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={layoutEditing ? EDIT_LAYER_STYLE : LAYER_STYLE}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

function toDocumentPoint(event) {
  const touch =
    ('touches' in event && event.touches?.[0]) ||
    ('changedTouches' in event && event.changedTouches?.[0]) ||
    null;

  return {
    x: (touch?.clientX ?? event.clientX) + window.scrollX,
    y: (touch?.clientY ?? event.clientY) + window.scrollY,
  };
}

function toCanvasPoint(event, layerOrigin, localCoordinates) {
  const point = toDocumentPoint(event);

  if (!localCoordinates) {
    return point;
  }

  return {
    x: point.x - layerOrigin.x,
    y: point.y - layerOrigin.y,
  };
}

function getDragEventId(event) {
  if ('pointerId' in event) {
    return `pointer:${event.pointerId}`;
  }

  const touch =
    ('changedTouches' in event && event.changedTouches?.[0]) ||
    ('touches' in event && event.touches?.[0]) ||
    null;

  if (touch) {
    return `touch:${touch.identifier}`;
  }

  return 'mouse';
}

function matchesDragEvent(event, dragId) {
  if (!dragId) {
    return false;
  }

  if (dragId === 'mouse') {
    return !('pointerId' in event) && !('touches' in event) && !('changedTouches' in event);
  }

  if (dragId.startsWith('pointer:')) {
    return 'pointerId' in event && `pointer:${event.pointerId}` === dragId;
  }

  if (!dragId.startsWith('touch:')) {
    return false;
  }

  const touchId = Number(dragId.slice(6));
  const touches = [
    ...(('touches' in event && event.touches) ? Array.from(event.touches) : []),
    ...(('changedTouches' in event && event.changedTouches) ? Array.from(event.changedTouches) : []),
  ];

  return touches.some((touch) => touch.identifier === touchId);
}

function getHeroDragBounds(bounds, width, height) {
  return {
    left: bounds.left,
    top: bounds.top,
    right: Math.max(bounds.right, bounds.left + width),
    bottom: Math.max(bounds.bottom, bounds.top + height),
  };
}

function getMagnetDimensions(magnet) {
  return {
    width: Math.max(28, magnet.width ?? magnet.size ?? magnet.height ?? 68),
    height: Math.max(28, magnet.height ?? magnet.size ?? 68),
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

function createFloatProfile(
  magnet,
  sessionPhase,
  motionConfig = DEFAULT_MOTION_CONFIG,
) {
  const seed = hashString(`${magnet.id}:${sessionPhase.toFixed(6)}`);
  const height = Math.max(
    28,
    magnet.motionHeight ?? magnet.height ?? magnet.size ?? 68,
  );
  const width = Math.max(
    28,
    magnet.motionWidth ?? magnet.width ?? height,
  );
  const unit = (shift) => ((seed >>> shift) & 1023) / 1023;
  const resolvedMotion = resolveMotionConfig(motionConfig);

  return {
    amplitudeX:
      clamp(width * (0.0035 + unit(0) * 0.005), 0.35, 1.9) *
      resolvedMotion.floatRangeX,
    amplitudeY:
      clamp(height * (0.012 + unit(3) * 0.011), 1.1, 4.4) *
      resolvedMotion.floatRangeY,
    rotationAmplitude:
      clamp(0.18 + unit(6) * 0.92, 0.18, 1.1) *
      resolvedMotion.floatRotate,
    waveX: (0.42 + unit(9) * 0.16) * resolvedMotion.floatSpeed,
    driftX: (0.18 + unit(12) * 0.08) * resolvedMotion.floatSpeed,
    waveY: (0.48 + unit(15) * 0.18) * resolvedMotion.floatSpeed,
    driftY: (0.24 + unit(18) * 0.08) * resolvedMotion.floatSpeed,
    waveRotation: (0.34 + unit(21) * 0.12) * resolvedMotion.floatSpeed,
    phaseX: sessionPhase + unit(24) * Math.PI * 2,
    phaseY: sessionPhase * 0.6 + unit(27) * Math.PI * 2,
    phaseRotation: sessionPhase * 1.2 + unit(30) * Math.PI * 2,
    phaseDrift: sessionPhase * 0.8 + unit(5) * Math.PI * 2,
    phaseBounce: unit(11) * Math.PI,
    hoverSink: clamp(height * 0.009, 0.8, 1.9) * resolvedMotion.hoverSink,
    hoverLean:
      clamp(0.55 + unit(14) * 0.85, 0.55, 1.4) *
      resolvedMotion.hoverLean,
    bounceAmplitudeX:
      clamp(width * 0.003, 0.15, 0.75) * resolvedMotion.bounceLift,
    bounceAmplitudeY:
      clamp(height * 0.036 + unit(17) * 0.8, 2.2, 6.4) *
      resolvedMotion.bounceLift,
    bounceRotation:
      clamp(0.24 + unit(20) * 0.9, 0.24, 1.2) *
      resolvedMotion.bounceTwist,
    bounceFrequency: (13 + unit(23) * 5) * resolvedMotion.bounceSpeed,
    bounceDecay: (3.4 + unit(26) * 1.4) * resolvedMotion.bounceDamping,
    floatSpeedScale: resolvedMotion.floatSpeed,
    bounceSpeedScale: resolvedMotion.bounceSpeed,
    rotationDirection: unit(29) > 0.5 ? 1 : -1,
  };
}

function resolveMotionConfig(motionConfig = DEFAULT_MOTION_CONFIG) {
  return {
    floatRangeX: clamp(getMotionNumber(motionConfig.floatRangeX, DEFAULT_MOTION_CONFIG.floatRangeX), 0, 2.4),
    floatRangeY: clamp(getMotionNumber(motionConfig.floatRangeY, DEFAULT_MOTION_CONFIG.floatRangeY), 0, 2.4),
    floatSpeed: clamp(getMotionNumber(motionConfig.floatSpeed, DEFAULT_MOTION_CONFIG.floatSpeed), 0, 2.4),
    floatRotate: clamp(getMotionNumber(motionConfig.floatRotate, DEFAULT_MOTION_CONFIG.floatRotate), 0, 2.4),
    hoverSink: clamp(getMotionNumber(motionConfig.hoverSink, DEFAULT_MOTION_CONFIG.hoverSink), 0, 2.4),
    hoverLean: clamp(getMotionNumber(motionConfig.hoverLean, DEFAULT_MOTION_CONFIG.hoverLean), 0, 2.4),
    bounceLift: clamp(getMotionNumber(motionConfig.bounceLift, DEFAULT_MOTION_CONFIG.bounceLift), 0, 2.4),
    bounceTwist: clamp(getMotionNumber(motionConfig.bounceTwist, DEFAULT_MOTION_CONFIG.bounceTwist), 0, 2.4),
    bounceSpeed: clamp(getMotionNumber(motionConfig.bounceSpeed, DEFAULT_MOTION_CONFIG.bounceSpeed), 0, 2.4),
    bounceDamping: clamp(getMotionNumber(motionConfig.bounceDamping, DEFAULT_MOTION_CONFIG.bounceDamping), 0.35, 2.4),
  };
}

function getMotionNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasAmbientMotion(profile) {
  return profile.floatSpeedScale > 0.001 && (
    profile.amplitudeX > 0.001 ||
    profile.amplitudeY > 0.001 ||
    profile.rotationAmplitude > 0.001
  );
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
