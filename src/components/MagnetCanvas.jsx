import { useEffect, useEffectEvent, useRef } from 'react';

import {
  clamp,
  clampMagnetToBounds,
  cloneMagnetList,
  drawMagnet,
  findTopMagnetAtPoint,
  invalidateMagnetRenderCaches,
  normalizeMagnetList,
} from './magnetUtils';

const LAYER_STYLE = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  contain: 'strict',
  willChange: 'transform',
};
const HIT_PADDING = 16;
const INERTIA_MIN_SPEED = 90;
const INERTIA_DAMPING = 0.9;
const INERTIA_STOP_SPEED = 14;
const INTRO_LINE_DELAY_MS = 120;
const INTRO_LINE_DURATION_MS = 680;

/**
 * Magnet shape:
 * { id, label, x, y, width?, height?, size?, color?, textColor?, rotation?, boardId?, bounds? }
 *
 * boards supports:
 * [{ id, element?, ref?, bounds?, padding? }]
 *
 * drawBounds supports:
 * { x, y, width, height } or { left, top, right, bottom } or element/ref source.
 */
export default function MagnetCanvas({
  magnets,
  initialMagnets = [],
  boards = [],
  drawBounds = null,
  className,
  onMagnetsChange,
  pixelRatioCap = 1.6,
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const magnetsRef = useRef([]);
  const sortedMagnetsRef = useRef([]);
  const dragRef = useRef(null);
  const drawFrameRef = useRef(0);
  const dragFrameRef = useRef(0);
  const inertiaFrameRef = useRef(0);
  const inertiaRef = useRef(null);
  const introAnimationRef = useRef(null);
  const introHasPlayedRef = useRef(false);
  const pendingPointRef = useRef(null);
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 });
  const restoreUserSelectRef = useRef('');
  const restoreCursorRef = useRef('');
  const hoverMagnetIdRef = useRef(null);
  const didHydrateInitialMagnetsRef = useRef(false);
  const isControlled = magnets != null;

  const emitMagnetsChange = useEffectEvent((nextMagnets, meta) => {
    onMagnetsChange?.(cloneMagnetList(nextMagnets), meta);
  });

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

    if (!canvas) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
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

    viewportRef.current = { width, height, dpr };
    requestDraw();
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

    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    const now = performance.now();
    let hasActiveIntroFrame = false;

    for (const magnet of sortedMagnetsRef.current) {
      const animatedMagnet = resolveIntroMagnet(magnet, now);
      if (animatedMagnet !== magnet) {
        hasActiveIntroFrame = true;
      }
      drawMagnet(ctx, animatedMagnet, scrollPosition, viewportRef.current);
    }

    if (hasActiveIntroFrame) {
      requestDraw();
    }
  });

  const syncExternalMagnets = useEffectEvent((sourceMagnets) => {
    magnetsRef.current = normalizeMagnetList(sourceMagnets);
    sortedMagnetsRef.current = sortMagnetsForPaint(magnetsRef.current);
    maybePrimeIntroAnimation(magnetsRef.current);
    requestDraw();
  });

  const updateMagnetList = useEffectEvent((updater, meta) => {
    const nextMagnets = updater(cloneMagnetList(magnetsRef.current));
    magnetsRef.current = nextMagnets;
    sortedMagnetsRef.current = sortMagnetsForPaint(nextMagnets);
    requestDraw();

    if (meta) {
      emitMagnetsChange(nextMagnets, meta);
    }
  });

  const setCursor = useEffectEvent((value) => {
    document.documentElement.style.cursor = value;
  });

  const updateHoverCursor = useEffectEvent((point) => {
    if (dragRef.current) {
      return;
    }

    const hit = point
      ? findTopMagnetAtPoint(magnetsRef.current, point, HIT_PADDING)
      : null;
    const nextHoverId = hit?.magnet.id ?? null;

    if (hoverMagnetIdRef.current === nextHoverId) {
      return;
    }

    hoverMagnetIdRef.current = nextHoverId;
    setCursor(nextHoverId ? 'grab' : restoreCursorRef.current || '');
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

    const uniqueLines = [...new Set(heroMagnets.map((magnet) => magnet.lineIndex))].sort(
      (left, right) => left - right,
    );
    const lineOrder = new Map(uniqueLines.map((lineIndex, order) => [lineIndex, order]));
    const travelX = Math.max(viewportRef.current.width * 0.66, 420);
    const travelY = Math.max(viewportRef.current.height * 0.72, 360);
    const directionByLine = [
      { x: -travelX, y: 0, rotation: -14 },
      { x: travelX, y: 0, rotation: 14 },
      { x: 0, y: -travelY, rotation: -10 },
      { x: 0, y: travelY, rotation: 10 },
    ];

    const entries = new Map();

    heroMagnets.forEach((magnet) => {
      const order = lineOrder.get(magnet.lineIndex) ?? 0;
      const direction = directionByLine[order % directionByLine.length];
      entries.set(magnet.id, {
        fromX: magnet.x + direction.x,
        fromY: magnet.y + direction.y,
        fromRotation: magnet.rotation + direction.rotation,
        delayMs: order * INTRO_LINE_DELAY_MS,
        durationMs: INTRO_LINE_DURATION_MS,
      });
    });

    const maxDelay = Math.max(
      ...Array.from(entries.values(), (entry) => entry.delayMs),
    );
    const startTime = performance.now();

    introAnimationRef.current = {
      entries,
      startTime,
      endTime: startTime + maxDelay + INTRO_LINE_DURATION_MS,
    };
    introHasPlayedRef.current = true;
  });

  const stopInertia = useEffectEvent(() => {
    if (inertiaFrameRef.current) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = 0;
    }

    inertiaRef.current = null;
  });

  const applyPendingDragPosition = useEffectEvent((phase = 'move') => {
    const dragState = dragRef.current;
    const point = pendingPointRef.current;

    if (!dragState || !point) {
      return;
    }

    pendingPointRef.current = null;

    updateMagnetList((currentMagnets) => {
      const targetIndex = currentMagnets.findIndex(
        (magnet) => magnet.id === dragState.magnetId,
      );

      if (targetIndex === -1) {
        return currentMagnets;
      }

      const magnet = currentMagnets[targetIndex];
      const rawX = point.x - dragState.offsetX;
      const rawY = point.y - dragState.offsetY;
      const clamped = clampMagnetToBounds(
        magnet,
        rawX,
        rawY,
        boards,
        drawBounds,
      );

      if (magnet.x === clamped.x && magnet.y === clamped.y && phase === 'move') {
        return currentMagnets;
      }

      currentMagnets[targetIndex] = {
        ...magnet,
        x: clamped.x,
        y: clamped.y,
        rotation: dragState.dragRotation ?? magnet.rotation,
        userPlaced: true,
      };

      return currentMagnets;
    }, { source: 'drag', phase, activeId: dragState.magnetId });
  });

  const scheduleDragFrame = useEffectEvent(() => {
    if (dragFrameRef.current) {
      return;
    }

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = 0;
      applyPendingDragPosition('move');

      if (pendingPointRef.current) {
        scheduleDragFrame();
      }
    });
  });

  const stopDrag = useEffectEvent((pointerEvent, phase = 'end') => {
    const dragState = dragRef.current;

    if (!dragState) {
      return;
    }

    if (pointerEvent) {
      pendingPointRef.current = toDocumentPoint(pointerEvent);
    }

    if (dragFrameRef.current) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = 0;
    }

    applyPendingDragPosition(phase);
    dragRef.current = null;
    pendingPointRef.current = null;
    restoreInteractionStyles();
    updateHoverCursor(pointerEvent ? toDocumentPoint(pointerEvent) : null);
    requestDraw();

    if (phase === 'end' && dragState.velocity) {
      const speed = Math.hypot(dragState.velocity.x, dragState.velocity.y);

      if (speed >= INERTIA_MIN_SPEED) {
        inertiaRef.current = {
          magnetId: dragState.magnetId,
          velocityX: dragState.velocity.x,
          velocityY: dragState.velocity.y,
          angularVelocity: dragState.angularVelocity ?? 0,
          lastTime: performance.now(),
        };

        const tick = () => {
          const state = inertiaRef.current;

          if (!state) {
            inertiaFrameRef.current = 0;
            return;
          }

          const now = performance.now();
          const dt = Math.min((now - state.lastTime) / 1000, 0.034);
          state.lastTime = now;

          let shouldStop = false;

          updateMagnetList((currentMagnets) => {
            const targetIndex = currentMagnets.findIndex(
              (magnet) => magnet.id === state.magnetId,
            );

            if (targetIndex === -1) {
              shouldStop = true;
              return currentMagnets;
            }

            const magnet = currentMagnets[targetIndex];
            const nextVelocityX = state.velocityX * INERTIA_DAMPING;
            const nextVelocityY = state.velocityY * INERTIA_DAMPING;
            const nextAngularVelocity = state.angularVelocity * 0.88;
            const rawX = magnet.x + nextVelocityX * dt;
            const rawY = magnet.y + nextVelocityY * dt;
            const clamped = clampMagnetToBounds(
              magnet,
              rawX,
              rawY,
              boards,
              drawBounds,
            );
            const hitBoundary = clamped.x !== rawX || clamped.y !== rawY;

            state.velocityX = hitBoundary ? nextVelocityX * 0.42 : nextVelocityX;
            state.velocityY = hitBoundary ? nextVelocityY * 0.42 : nextVelocityY;
            state.angularVelocity = hitBoundary ? nextAngularVelocity * 0.42 : nextAngularVelocity;

            currentMagnets[targetIndex] = {
              ...magnet,
              x: clamped.x,
              y: clamped.y,
              rotation: magnet.rotation + state.angularVelocity * dt,
              userPlaced: true,
            };

            if (
              Math.hypot(state.velocityX, state.velocityY) < INERTIA_STOP_SPEED &&
              Math.abs(state.angularVelocity) < 8
            ) {
              shouldStop = true;
            }

            return currentMagnets;
          }, { source: 'drag', phase: 'inertia', activeId: state.magnetId });

          if (shouldStop) {
            stopInertia();
            return;
          }

          inertiaFrameRef.current = window.requestAnimationFrame(tick);
        };

        stopInertia();
        inertiaFrameRef.current = window.requestAnimationFrame(tick);
      }
    }
  });

  const restoreInteractionStyles = useEffectEvent(() => {
    document.body.style.userSelect = restoreUserSelectRef.current;
    document.documentElement.style.cursor = restoreCursorRef.current;
  });

  const lockInteractionStyles = useEffectEvent(() => {
    restoreUserSelectRef.current = document.body.style.userSelect;
    restoreCursorRef.current = document.documentElement.style.cursor;
    document.body.style.userSelect = 'none';
    setCursor('grabbing');
  });

  const handlePointerDown = useEffectEvent((event) => {
    if (event.button !== 0 || dragRef.current || isIntroAnimating()) {
      return;
    }

    stopInertia();
    const point = toDocumentPoint(event);
    const hit = findTopMagnetAtPoint(magnetsRef.current, point, HIT_PADDING);

    if (!hit) {
      return;
    }

    event.preventDefault();

    const targetMagnet = hit.magnet;
    const nextZIndex =
      Math.max(0, ...magnetsRef.current.map((magnet) => magnet.zIndex)) + 1;

    updateMagnetList((currentMagnets) => {
      const targetIndex = currentMagnets.findIndex(
        (magnet) => magnet.id === targetMagnet.id,
      );

      if (targetIndex === -1) {
        return currentMagnets;
      }

      currentMagnets[targetIndex] = {
        ...currentMagnets[targetIndex],
        zIndex: nextZIndex,
      };

      return currentMagnets;
    }, { source: 'drag', phase: 'start', activeId: targetMagnet.id });

    dragRef.current = {
      pointerId: event.pointerId,
      magnetId: targetMagnet.id,
      offsetX: point.x - targetMagnet.x,
      offsetY: point.y - targetMagnet.y,
      lastPoint: point,
      lastTime: performance.now(),
      velocity: { x: 0, y: 0 },
      angularVelocity: 0,
      baseRotation: targetMagnet.rotation,
      dragRotation: targetMagnet.rotation,
    };

    lockInteractionStyles();
    requestDraw();
  });

  const handlePointerMove = useEffectEvent((event) => {
    const dragState = dragRef.current;

    if (!dragState) {
      if (isIntroAnimating()) {
        return;
      }
      updateHoverCursor(toDocumentPoint(event));
      return;
    }

    if (dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const point = toDocumentPoint(event);
    const now = performance.now();
    const dt = Math.max((now - dragState.lastTime) / 1000, 0.001);
    const dx = point.x - dragState.lastPoint.x;
    const dy = point.y - dragState.lastPoint.y;

    dragState.velocity = {
      x: dx / dt,
      y: dy / dt,
    };
    dragState.angularVelocity = clamp(dragState.velocity.x * 0.24, -120, 120);
    dragState.dragRotation = dragState.baseRotation + clamp(dragState.velocity.x * 0.006, -5.5, 5.5);
    dragState.lastPoint = point;
    dragState.lastTime = now;
    pendingPointRef.current = point;
    scheduleDragFrame();
  });

  const handlePointerUp = useEffectEvent((event) => {
    const dragState = dragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    stopDrag(event, 'end');
  });

  const handleWindowBlur = useEffectEvent(() => {
    stopDrag(null, 'cancel');
  });

  const handleViewportChange = useEffectEvent(() => {
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
    syncCanvasSize();

    window.addEventListener('resize', syncCanvasSize);
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
      window.removeEventListener('blur', handleWindowBlur);

      if (drawFrameRef.current) {
        window.cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = 0;
      }

      if (dragFrameRef.current) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = 0;
      }

      if (inertiaFrameRef.current) {
        window.cancelAnimationFrame(inertiaFrameRef.current);
        inertiaFrameRef.current = 0;
      }

      restoreInteractionStyles();
    };
  }, [
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleViewportChange,
    handleWindowBlur,
    setCursor,
    restoreInteractionStyles,
    syncCanvasSize,
    stopInertia,
    updateHoverCursor,
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

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function easeOutCubic(value) {
  const clamped = clamp(value, 0, 1);
  return 1 - (1 - clamped) ** 3;
}
