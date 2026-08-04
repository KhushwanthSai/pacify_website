import { useEffect, useRef, useState } from "react";

/** Honours the OS "reduce motion" setting; re-evaluates if the user changes it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Reveals an element the first time it scrolls into view.
 *
 * Returns a ref to attach and a boolean. Once shown it stays shown — content
 * that re-hides on scroll-up is distracting rather than polished.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return { ref, shown };
}

/**
 * Eases a number towards `target`. Used for score readouts so a change reads
 * as movement rather than a jump.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic — fast to settle, no bounce.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + delta * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduced]);

  return value;
}

/** Standard reveal classes, so every section animates identically. */
export function revealClass(shown: boolean, delayMs = 0): string {
  return (
    [
      "transition-all duration-700 ease-out motion-reduce:transition-none",
      shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    ].join(" ") + (delayMs ? ` [transition-delay:${delayMs}ms]` : "")
  );
}
