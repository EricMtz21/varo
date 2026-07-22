"use client";

import { useModalMotion } from "@/hooks/useModalMotion";

export default function DeleteModal({ onConfirm, onDeleteOne, onDeleteFromHere, onDeleteAll, onCancel }) {
  const isSimple = !!onConfirm;
  const { backdropRef, panelRef, requestClose } = useModalMotion("dialog");

  function close(action) {
    requestClose(() => action?.());
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => close(onCancel)}
      />
      <div ref={panelRef} className="relative bg-card border border-border rounded-md p-6 max-w-xs w-full">
        <h3 className="font-bold text-foreground mb-1">Eliminar movimiento</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {isSimple
            ? "¿Seguro que quieres eliminar este movimiento?"
            : "Este movimiento se repite. ¿Qué deseas eliminar?"}
        </p>
        <div className="space-y-2">
          {isSimple ? (
            <button
              onClick={() => close(onConfirm)}
              className="w-full py-3 rounded-md text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors cursor-pointer border border-destructive/20"
            >
              Sí, eliminar
            </button>
          ) : (
            <>
              <button
                onClick={() => close(onDeleteOne)}
                className="w-full py-3 rounded-md bg-secondary text-foreground text-sm font-semibold hover:bg-muted transition-colors cursor-pointer border border-border"
              >
                Solo este
              </button>
              <button
                onClick={() => close(onDeleteFromHere)}
                className="w-full py-3 rounded-md bg-secondary text-foreground text-sm font-semibold hover:bg-muted transition-colors cursor-pointer border border-border"
              >
                Este y los siguientes
              </button>
              <button
                onClick={() => close(onDeleteAll)}
                className="w-full py-3 rounded-md text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors cursor-pointer border border-destructive/20"
              >
                Todos los repetidos
              </button>
            </>
          )}
          <button
            onClick={() => close(onCancel)}
            className="w-full py-3 rounded-md text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
