"use client";

// Grupo de píldoras de selección única (frecuencia, tipo de fin, alcance...).
export default function PillGroup({ options, value, onChange, activeClass }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
            value === key
              ? activeClass
              : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
