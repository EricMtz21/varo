"use client";

import { RepeatIcon, TrashIcon } from "@phosphor-icons/react";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
} from "./categoryConfig";

export default function TransactionItem({
  tx,
  onDelete,
  delay = 0,
  formatAmount,
}) {
  const isIncome = tx.type === "income";
  const accentColor = isIncome ? "#34D399" : "#F87171";
  const catColor = CATEGORY_COLORS[tx.category] ?? "#64748B";
  const CatIcon = CATEGORY_ICONS[tx.category] ?? DEFAULT_ICON;

  return (
    <div
      className="flex items-center gap-3 bg-[#0c1018]/80 backdrop-blur-sm rounded-xl px-4 py-3.5 group hover:bg-[#141D2E] transition-colors border border-transparent hover:border-[#1E2D45] animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: catColor + "1A", color: catColor }}
      >
        <CatIcon size={18} weight="fill" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-sm text-[#E2E8F0] truncate">
            {tx.name}
          </p>
          {tx.recurringId && (
            <span className="text-[#475569] shrink-0 flex items-center gap-1 pb-px">
              {tx.totalOccurrences && (
                <span className="text-[10px] leading-[1] font-semibold tracking-wide">
                  {tx.occurrenceIndex} de {tx.totalOccurrences}
                </span>
              )}
              <RepeatIcon size={12} />
            </span>
          )}
        </div>
        <span
          className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1"
          style={{ backgroundColor: catColor + "18", color: catColor }}
        >
          {tx.category}
        </span>
      </div>

      <p className="font-bold text-sm shrink-0" style={{ color: accentColor }}>
        {isIncome ? "+" : "-"}
        {formatAmount(tx.amount, tx.currency)}
      </p>

      <button
        onClick={() => onDelete(tx)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#475569] hover:text-[#F87171] hover:bg-[#F87171]/10 cursor-pointer shrink-0"
        aria-label="Eliminar movimiento"
      >
        <TrashIcon size={13} />
      </button>
    </div>
  );
}
