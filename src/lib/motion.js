// Shared GSAP easing + reduced-motion helpers.
// No bounce/elastic curves — confident, decisive deceleration only.
export const EASE = "expo.out";
export const EASE_SOFT = "power2.out";
export const EASE_IN = "power2.in";

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
