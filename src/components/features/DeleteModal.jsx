"use client";

export default function DeleteModal({ onConfirm, onDeleteOne, onDeleteFromHere, onDeleteAll, onCancel }) {
  const isSimple = !!onConfirm;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-xs w-full animate-scale-in">
        <h3 className="font-bold text-foreground mb-1">Eliminar movimiento</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {isSimple
            ? "¿Seguro que quieres eliminar este movimiento?"
            : "Este movimiento se repite. ¿Qué deseas eliminar?"}
        </p>
        <div className="space-y-2">
          {isSimple ? (
            <button
              onClick={onConfirm}
              className="w-full py-3 rounded-xl text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors cursor-pointer border border-destructive/20"
            >
              Sí, eliminar
            </button>
          ) : (
            <>
              <button
                onClick={onDeleteOne}
                className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Solo este
              </button>
              <button
                onClick={onDeleteFromHere}
                className="w-full py-3 rounded-xl bg-secondary text-[#D97706] text-sm font-semibold hover:bg-muted transition-colors cursor-pointer border border-[#D97706]/20"
              >
                Este y los siguientes
              </button>
              <button
                onClick={onDeleteAll}
                className="w-full py-3 rounded-xl text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors cursor-pointer border border-destructive/20"
              >
                Todos los repetidos
              </button>
            </>
          )}
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
