"use client";

// Selector de tarjeta para un gasto. Se usa en el alta y en la edición de
// movimientos; los ingresos nunca se enlazan a una tarjeta.
export default function CardPicker({ cards, value, onChange }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
        Pagado con
      </p>
      <div className="flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-3 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
            !value
              ? "bg-foreground text-background border-transparent"
              : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
          }`}
        >
          Efectivo / débito
        </button>
        {cards.map((card) => {
          const selected = value === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onChange(card.id)}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 max-w-full ${
                selected
                  ? "border-transparent"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
              }`}
              style={
                selected
                  ? {
                      backgroundColor: card.color + "22",
                      color: card.color,
                      borderColor: card.color + "55",
                    }
                  : {}
              }
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: card.color }}
              />
              <span className="truncate">{card.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
