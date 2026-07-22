"use client";

import { useState } from "react";
import { TrayIcon } from "@phosphor-icons/react";
import TransactionItem from "./TransactionItem";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { MONTHS } from "@/utils/constants";
import { formatDateHeader } from "@/utils/format";

function DateGroupHeader({ children, delay }) {
  const ref = useRevealOnMount(delay);
  return (
    <p
      ref={ref}
      className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2 px-3"
    >
      {children}
    </p>
  );
}

export default function TransactionList({
  hydrated,
  grouped,
  currentMonth,
  handleDeleteClick,
  handleEditClick,
  formatAmount,
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
        {Object.entries(grouped).map(([date, txs], groupIdx) => (
          <div key={date}>
            <DateGroupHeader delay={groupIdx * 60}>
              {formatDateHeader(date)}
            </DateGroupHeader>
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
        ))}
      </div>
    </main>
  );
}
