"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PencilSimpleIcon, RepeatIcon, TrashIcon } from "@phosphor-icons/react";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
} from "./categoryConfig";

export default function TransactionItem({
  tx,
  onDelete,
  onEdit,
  delay = 0,
  formatAmount,
  isSelected = false,
  onSelect,
}) {
  const isIncome = tx.type === "income";
  const accentColor = isIncome ? "#34D399" : "#F87171";
  const catColor = CATEGORY_COLORS[tx.category] ?? "#64748B";
  const CatIcon = CATEGORY_ICONS[tx.category] ?? DEFAULT_ICON;

  const rowRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  useEffect(() => {
    if (isSelected && rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const showAbove = rect.top > 80;
      setMenuPos({
        x: rect.left + rect.width / 2,
        top: showAbove ? undefined : rect.bottom + 10,
        bottom: showAbove ? window.innerHeight - rect.top + 10 : undefined,
        above: showAbove,
      });
    } else {
      setMenuPos(null);
    }
  }, [isSelected]);

  function handleRowClick(e) {
    e.stopPropagation();
    onSelect(isSelected ? null : tx.id);
  }

  return (
    <>
      <div
        ref={rowRef}
        onClick={handleRowClick}
        className={`flex items-center gap-3 backdrop-blur-sm rounded-xl px-4 py-3.5 transition-colors border cursor-pointer animate-fade-up ${
          isSelected
            ? "bg-[#141D2E] border-[#1E2D45]"
            : "bg-[#0c1018]/80 border-transparent hover:bg-[#141D2E] hover:border-[#1E2D45]"
        }`}
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
                  <span className="text-[10px] leading-none font-semibold tracking-wide">
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
      </div>

      {menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: menuPos.x,
              top: menuPos.top,
              bottom: menuPos.bottom,
              zIndex: 200,
            }}
            className={
              menuPos.above ? "animate-tx-menu-above" : "animate-tx-menu-below"
            }
          >
            {/* Buttons */}
            <div className="flex items-center gap-1 bg-[#1A2537] border border-[#2D3F5E] rounded-2xl px-1.5 py-1.5 shadow-2xl shadow-black/60">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                  onEdit(tx);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#818CF8] hover:bg-[#818CF8]/15 transition-colors cursor-pointer whitespace-nowrap"
              >
                <PencilSimpleIcon size={14} />
                Editar
              </button>
              <div className="w-px h-5 bg-[#2D3F5E]" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                  onDelete(tx);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#F87171] hover:bg-[#F87171]/15 transition-colors cursor-pointer whitespace-nowrap"
              >
                <TrashIcon size={14} />
                Borrar
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
