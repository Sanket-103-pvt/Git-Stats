import { useEffect, useRef, useState } from "react";

// Easing function: ease-out quad (starts fast, slows down at the end)
const easeOutQuad = (t) => t * (2 - t);

export default function useCountUp(
  targetValue,
  duration = 1000,
  startOnMount = true,
) {
  const target = Number(targetValue) || 0;
  const [currentValue, setCurrentValue] = useState(() => {
    return startOnMount ? 0 : target;
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    // Check prefers-reduced-motion media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setCurrentValue(target);
      return;
    }

    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (!startOnMount) {
        setCurrentValue(target);
        return;
      }
    }

    let startTimestamp = null;
    const startValue = 0; // reset and replay from 0

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const nextValue = startValue + easedProgress * (target - startValue);
      setCurrentValue(nextValue);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCurrentValue(target);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration, startOnMount]);

  return currentValue;
}

/**
 * Formats a stat number to K/M format if finished animating.
 * During animation, it returns the raw rounded value format.
 */
export function formatStatValue(value, target) {
  const val = Math.floor(value);
  if (val !== target) {
    return val.toLocaleString();
  }
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return val.toLocaleString();
}
