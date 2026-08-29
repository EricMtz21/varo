"use client";

import { useCallback, useEffect } from "react";
import { useModalMotion } from "@/hooks/useModalMotion";

/**
 * Plomería común de las hojas modales: animación de entrada/salida, bloqueo
 * del scroll de fondo y un `close` que espera a que termine la animación.
 * Se usa junto con <Sheet {...sheet}>.
 */
export function useSheet(onClose) {
  const { backdropRef, panelRef, requestClose } = useModalMotion("sheet");

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  const close = useCallback(() => requestClose(onClose), [requestClose, onClose]);

  return { backdropRef, panelRef, close };
}
