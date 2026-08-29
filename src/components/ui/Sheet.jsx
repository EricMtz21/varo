"use client";

import { XIcon } from "@phosphor-icons/react";

/**
 * Hoja inferior en móvil, panel centrado en escritorio. Recibe las refs y el
 * `close` que arma useSheet(onClose).
 */
export function Sheet({ backdropRef, panelRef, close, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={close}
      />
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-md bg-card border-t border-border sm:border sm:rounded-md max-h-[92dvh] overflow-y-auto scrollbar-thin"
      >
        {/* Asa de arrastre (solo móvil) */}
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Título de la hoja, con una insignia de color opcional a la izquierda. */
export function SheetHeader({ title, onClose, color, initials }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3 min-w-0">
        {initials && (
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: color + "22", color }}
          >
            {initials}
          </div>
        )}
        <h2 className="font-bold text-lg text-foreground truncate">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
        aria-label="Cerrar"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
}
