"use client";

import { useEffect, useState } from "react";

const MAX_PULL = 120;
const TRIGGER_AT = 80;
const IDLE = { progress: 0, pulling: false, refreshing: false };
const REFRESHING = { progress: TRIGGER_AT, pulling: false, refreshing: true };

/**
 * Gesto de "jalar para recargar" en móvil. El hook se encarga del indicador
 * (incluido el estado "recargando" mientras corre `onRefresh`), que debe ser
 * estable (useCallback) porque el listener se registra una sola vez.
 */
export function usePullToRefresh(onRefresh) {
  const [pullState, setPullState] = useState(IDLE);

  useEffect(() => {
    // Solo aplicará en móviles / pantallas pequeñas táctiles
    if (window.innerWidth > 768) return;

    let startY = null;
    let progress = 0;

    const onTouchStart = (e) => {
      // Solo iniciar pull si el usuario está hasta arriba de la página
      if (window.scrollY <= 10) {
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY === null) return;

      const dy = e.touches[0].clientY - startY;

      if (dy > 0 && window.scrollY <= 10) {
        progress = Math.min(dy, MAX_PULL);
        setPullState({ progress, pulling: true, refreshing: false });
        // Prevenir el scroll por defecto solo si se puede, para un efecto más suave
        if (dy > 10 && e.cancelable) e.preventDefault();
      } else if (dy < 0) {
        startY = null;
      }
    };

    const onTouchEnd = async () => {
      if (startY === null) return;
      startY = null;

      const shouldRefresh = progress > TRIGGER_AT;
      progress = 0;

      if (!shouldRefresh) {
        setPullState(IDLE);
        return;
      }
      setPullState(REFRESHING);
      await onRefresh();
      setPullState(IDLE);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    // passive: false permite preventDefault() y evita el rebote nativo del navegador
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh]);

  return pullState;
}
