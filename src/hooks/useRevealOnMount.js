"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";

// Fades + lifts an element in once, on its own mount. Attach the returned
// ref to the element. Safe to use inside lists: since it fires on mount
// only, adding a sibling never replays this element's animation.
export function useRevealOnMount(delayMs = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: EASE, delay: delayMs / 1000 },
    );
    return () => tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
