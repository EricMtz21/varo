"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { EASE, EASE_SOFT, EASE_IN, prefersReducedMotion } from "@/lib/motion";

const VARIANTS = {
  // Bottom sheet on mobile, centered panel on desktop.
  sheet: {
    from: { yPercent: 110 },
    to: { yPercent: 0 },
    duration: 0.38,
    exitDuration: 0.26,
    panelFade: false,
  },
  // Small centered confirmation dialog.
  dialog: {
    from: { scale: 0.88, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 0.24,
    exitDuration: 0.16,
    panelFade: true,
  },
  // Side drawer / nav sheet.
  drawer: {
    from: { xPercent: -100 },
    to: { xPercent: 0 },
    duration: 0.32,
    exitDuration: 0.26,
    panelFade: false,
  },
};

// Drives enter/exit motion for a backdrop + panel pair. Replaces the old
// isExiting-state + setTimeout(ms-matches-css-duration) pattern: exit now
// resolves off GSAP's onComplete, so it can't drift out of sync with the
// actual animation duration.
export function useModalMotion(variant = "sheet", open = true) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const closingRef = useRef(false);
  const cfg = VARIANTS[variant];

  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!panel) return;

    if (prefersReducedMotion()) {
      gsap.set(panel, { ...cfg.to, opacity: 1 });
      if (backdrop) gsap.set(backdrop, { opacity: 1 });
      return;
    }

    const tl = gsap.timeline();
    if (backdrop) {
      tl.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: cfg.duration * 0.85, ease: EASE_SOFT },
        0,
      );
    }
    tl.fromTo(
      panel,
      { ...cfg.from, opacity: cfg.panelFade ? 0 : 1 },
      { ...cfg.to, opacity: 1, duration: cfg.duration, ease: EASE },
      0,
    );

    return () => tl.kill();
  }, [variant, cfg, open]);

  const requestClose = useCallback(
    (onClosed) => {
      if (closingRef.current) return;
      closingRef.current = true;

      const backdrop = backdropRef.current;
      const panel = panelRef.current;

      if (prefersReducedMotion() || !panel) {
        onClosed();
        return;
      }

      const tl = gsap.timeline({ onComplete: onClosed });
      tl.to(
        panel,
        {
          ...cfg.from,
          opacity: cfg.panelFade ? 0 : 1,
          duration: cfg.exitDuration,
          ease: EASE_IN,
        },
        0,
      );
      if (backdrop) {
        tl.to(
          backdrop,
          { opacity: 0, duration: cfg.exitDuration, ease: EASE_IN },
          0,
        );
      }
    },
    [cfg],
  );

  return { backdropRef, panelRef, requestClose };
}
