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
  const accentColor = isIncome ? "#10B981" : "#F43F5E";
  const catColor = CATEGORY_COLORS[tx.category] ?? "#A1A1AA";
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
        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors border cursor-pointer animate-fade-up ${
          isSelected
            ? "bg-muted border-border"
            : "bg-card border-transparent hover:bg-muted hover:border-border"
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
            <p className="font-medium text-sm text-foreground truncate">
              {tx.name}
            </p>
            {tx.recurringId && (
              <span className="text-muted-foreground shrink-0 flex items-center gap-1 pb-px">
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
            <div className="flex items-center gap-1 bg-secondary border border-border rounded-2xl px-1.5 py-1.5 shadow-lg shadow-black/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                  onEdit(tx);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <PencilSimpleIcon size={14} />
                Editar
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                  onDelete(tx);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer whitespace-nowrap"
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
