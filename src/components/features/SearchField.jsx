"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

/**
 * Búsqueda dentro del mes visible. Filtra por nombre, categoría y tarjeta.
 */
export default function SearchField({ value, onChange, resultCount }) {
  const active = value.trim().length > 0;

  return (
    <div className="px-3 md:px-0 max-w-2xl mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar movimiento"
          aria-label="Buscar movimiento"
          className="w-full h-10 pl-10 pr-10 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {active && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <XIcon size={14} weight="bold" />
          </button>
        )}
      </div>
      {active && (
        <p className="text-[11px] text-muted-foreground mt-2 px-0.5 font-medium">
          {resultCount === 0
            ? "Sin coincidencias"
            : `${resultCount} ${resultCount === 1 ? "resultado" : "resultados"}`}
        </p>
      )}
    </div>
  );
}
