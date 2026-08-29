"use client";

import { useState } from "react";
import { TrayIcon } from "@phosphor-icons/react";
import TransactionItem from "./TransactionItem";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { MONTHS } from "@/utils/constants";
import { formatDateHeader } from "@/utils/format";

function DateGroupHeader({ date, total, delay }) {
  const ref = useRevealOnMount(delay);
  return (
    <div
      ref={ref}
      className="flex items-baseline justify-between gap-3 mb-2 px-3 text-[11px] font-bold uppercase tracking-widest"
    >
      <span className="text-muted-foreground truncate">
        {formatDateHeader(date)}
      </span>
      {total}
    </div>
  );
}

export default function TransactionList({
  hydrated,
  grouped,
  currentMonth,
  handleDeleteClick,
  handleEditClick,
  formatAmount,
  currency = "MXN",
}) {
  const [selectedTxId, setSelectedTxId] = useState(null);
  if (!hydrated) {
    return (
      <main className="px-3 md:px-0 pb-28 pt-3 max-w-2xl mx-auto">
        <div className="w-full space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card px-4 py-3.5 rounded-md border border-transparent animate-pulse"
            >
              <div className="w-9 h-9 rounded-md bg-muted/50 shrink-0" />
              <div className="w-full space-y-2 py-1">
                <div className="h-3.5 bg-muted/50 rounded-md w-1/3" />
                <div className="h-2.5 bg-muted/50 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (Object.keys(grouped).length === 0) {
    return (
      <main className="px-3 md:px-0 pb-28 pt-3 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <TrayIcon size={40} />
          <p className="font-semibold mt-4">Sin movimientos</p>
          <p className="text-sm mt-1 text-center">
            Nada registrado en {MONTHS[currentMonth].toLowerCase()}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-3 md:px-0 pb-28 pt-3 max-w-2xl mx-auto" onClick={() => setSelectedTxId(null)}>
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, txs], groupIdx) => {
          const dayExpenses = txs
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <div key={date}>
              <DateGroupHeader
                date={date}
                delay={groupIdx * 60}
                total={
                  dayExpenses > 0 ? (
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      -{formatAmount(dayExpenses, currency)}
                    </span>
                  ) : null
                }
              />
              <div className="space-y-2">
                {txs.map((tx, txIdx) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditClick}
                    delay={groupIdx * 60 + txIdx * 40}
                    formatAmount={formatAmount}
                    isSelected={selectedTxId === tx.id}
                    onSelect={(id) => setSelectedTxId(id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
