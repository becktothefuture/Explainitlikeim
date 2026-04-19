import { useEffect, useRef, useState } from 'react';
import { CURSOR_VARIANTS } from '../publicAssetUrls.js';

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'summary',
  'label[for]',
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
  "input[type='file']",
  "input[type='range']",
  'select',
  "[role='button']",
  "[role='link']",
].join(', ');

const TEXT_SELECTOR = [
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='file']):not([type='range']):not([type='checkbox']):not([type='radio'])",
  'textarea',
  "[contenteditable='true']",
  "[contenteditable='plaintext-only']",
].join(', ');

function resolveCursorVariant(target, isPointerDown = false) {
  if (!(target instanceof Element)) {
    return 'default';
  }

  if (target.closest('.eli5-magnet-layer')) {
    return isPointerDown ? 'grabbing' : 'grab';
  }

  if (target.closest(TEXT_SELECTOR)) {
    return 'text';
  }

  if (target.closest(INTERACTIVE_SELECTOR)) {
    return 'pointer';
  }

  return 'default';
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const frameRef = useRef(0);
  const positionRef = useRef({ x: -120, y: -120 });
  const variantRef = useRef('default');
  const pointerDownRef = useRef(false);
  const [variant, setVariant] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    variantRef.current = variant;

    if (cursorRef.current) {
      const { hotX, hotY } = CURSOR_VARIANTS[variant];
      cursorRef.current.style.transform = `translate3d(${positionRef.current.x - hotX}px, ${positionRef.current.y - hotY}px, 0)`;
    }
  }, [variant]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(pointer: fine)');

    const applyCursorPosition = () => {
      frameRef.current = 0;

      if (!cursorRef.current) {
        return;
      }

      const { hotX, hotY } = CURSOR_VARIANTS[variantRef.current];
      cursorRef.current.style.transform = `translate3d(${positionRef.current.x - hotX}px, ${positionRef.current.y - hotY}px, 0)`;
    };

    const queueCursorPosition = () => {
      if (frameRef.current) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(applyCursorPosition);
    };

    const updateEnabled = () => {
      const nextEnabled = mediaQuery.matches;
      setIsEnabled(nextEnabled);
      document.body.classList.toggle('eli5-custom-cursor-enabled', nextEnabled);

      if (!nextEnabled) {
        setIsVisible(false);
      }
    };

    const syncVariant = (target) => {
      const nextVariant = resolveCursorVariant(target, pointerDownRef.current);

      if (nextVariant === variantRef.current) {
        return;
      }

      variantRef.current = nextVariant;
      setVariant(nextVariant);
    };

    const handlePointerMove = (event) => {
      if (!mediaQuery.matches || event.pointerType !== 'mouse') {
        return;
      }

      positionRef.current = { x: event.clientX, y: event.clientY };
      queueCursorPosition();
      setIsVisible(true);
      syncVariant(event.target);
    };

    const handlePointerDown = (event) => {
      if (!mediaQuery.matches || event.pointerType !== 'mouse') {
        return;
      }

      pointerDownRef.current = true;
      syncVariant(event.target);
    };

    const handlePointerUp = (event) => {
      if (!mediaQuery.matches || event.pointerType !== 'mouse') {
        return;
      }

      pointerDownRef.current = false;
      syncVariant(document.elementFromPoint(event.clientX, event.clientY) ?? event.target);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
      pointerDownRef.current = false;
    };

    updateEnabled();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateEnabled);
    } else {
      mediaQuery.addListener(updateEnabled);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('blur', handleWindowBlur);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateEnabled);
      } else {
        mediaQuery.removeListener(updateEnabled);
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.body.classList.remove('eli5-custom-cursor-enabled');

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`eli5-custom-cursor eli5-custom-cursor--${variant}${isVisible ? ' is-visible' : ''}`}
      aria-hidden="true"
    >
      <span className="eli5-custom-cursor__glow" />
      <img src={CURSOR_VARIANTS[variant].src} alt="" draggable="false" />
    </div>
  );
}
