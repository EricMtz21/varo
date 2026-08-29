"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { calcStats, formatAmount } from "@/utils/format";

function formatStartDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SavingsBoxCard({ box, onDelete, onEdit, onToggleBalance, delay = 0 }) {
  const revealRef = useRevealOnMount(delay);
  const { currentBalance, totalEarned, todayEarnings } = calcStats(box);

  const effectiveRate =
    currentBalance > 0
      ? ((todayEarnings * 365) / currentBalance) * 100
      : parseFloat(box.rate);

  const included = box.includeInBalance !== false;

  return (
    <div
      ref={revealRef}
      onClick={() => onEdit(box)}
      className="bg-card rounded-xl border border-border p-5 shadow-sm group hover:border-muted-foreground transition-colors cursor-pointer relative active:scale-[0.99]"
    >
      <div className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <PencilSimpleIcon size={16} />
      </div>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm shrink-0"
            style={{ backgroundColor: box.color + "22", color: box.color }}
          >
            {box.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-foreground">{box.name}</p>
            <p className="text-xs text-muted-foreground">
              Desde {formatStartDate(box.startDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 z-10">
          <span
            className="text-[11px] font-bold px-2.5 py-1 flex items-center justify-center text-center rounded-md leading-tight"
            title={
              box.limitAmount
                ? `Base: ${box.rate}%, Excedente: ${box.secondaryRate || 0}%`
                : ""
            }
            style={{ backgroundColor: box.color + "20", color: box.color }}
          >
            {Number(effectiveRate.toFixed(2))}%{" "}
            {box.limitAmount ? "real" : "anual"}
          </span>
        </div>
      </div>

      {/* Current balance */}
      <div className="mb-4">
        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
          Balance actual
        </p>
        <p className="text-2xl font-bold" style={{ color: box.color }}>
          {formatAmount(currentBalance, box.currency)}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Hoy
          </p>
          <p className="text-sm font-bold text-[#10B981]">
            +{formatAmount(todayEarnings, box.currency)}
          </p>
        </div>
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Ganado
          </p>
          <p
            className={`text-sm font-bold ${totalEarned >= 0 ? "text-[#10B981]" : "text-destructive"}`}
          >
            {totalEarned >= 0 ? "+" : ""}
            {formatAmount(totalEarned, box.currency)}
          </p>
        </div>
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Inicial
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            {formatAmount(box.initialAmount, box.currency)}
          </p>
        </div>
      </div>

      {/* Include in balance toggle */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
          Incluir en balance
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleBalance(box.id, !included); }}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${included ? "bg-foreground" : "bg-muted"}`}
          aria-label="Incluir en balance general"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${included ? "left-4.5" : "left-0.5"}`}
          />
        </button>
      </div>
    </div>
  );
}
