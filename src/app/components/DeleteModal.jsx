"use client";

export default function DeleteModal({ onConfirm, onDeleteOne, onDeleteFromHere, onDeleteAll, onCancel }) {
  const isSimple = !!onConfirm;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative bg-[#0C1220] border border-[#1E2D45] rounded-2xl p-6 max-w-xs w-full animate-scale-in">
        <h3 className="font-bold text-[#E2E8F0] mb-1">Eliminar movimiento</h3>
        <p className="text-sm text-[#64748B] mb-5">
          {isSimple
            ? "¿Seguro que quieres eliminar este movimiento?"
            : "Este movimiento se repite. ¿Qué deseas eliminar?"}
        </p>
        <div className="space-y-2">
          {isSimple ? (
            <button
              onClick={onConfirm}
              className="w-full py-3 rounded-xl text-[#F87171] text-sm font-semibold hover:bg-[#F87171]/10 transition-colors cursor-pointer border border-[#F87171]/20"
            >
              Sí, eliminar
            </button>
          ) : (
            <>
              <button
                onClick={onDeleteOne}
                className="w-full py-3 rounded-xl bg-[#1A2537] text-[#E2E8F0] text-sm font-semibold hover:bg-[#1E2D45] transition-colors cursor-pointer"
              >
                Solo este
              </button>
              <button
                onClick={onDeleteFromHere}
                className="w-full py-3 rounded-xl bg-[#1A2537] text-[#FBBF24] text-sm font-semibold hover:bg-[#1E2D45] transition-colors cursor-pointer border border-[#FBBF24]/20"
              >
                Este y los siguientes
              </button>
              <button
                onClick={onDeleteAll}
                className="w-full py-3 rounded-xl text-[#F87171] text-sm font-semibold hover:bg-[#F87171]/10 transition-colors cursor-pointer border border-[#F87171]/20"
              >
                Todos los repetidos
              </button>
            </>
          )}
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl text-[#64748B] text-sm hover:text-[#E2E8F0] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
