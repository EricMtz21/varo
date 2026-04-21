"use client";

import { CircleNotchIcon, TrayIcon } from "@phosphor-icons/react";
import TransactionItem from "./TransactionItem";
import { MONTHS } from "../utils/constants";
import { formatDateHeader } from "../utils/format";

export default function TransactionList({
  hydrated,
  grouped,
  currentMonth,
  handleDeleteClick,
  formatAmount,
}) {
  if (!hydrated) {
    return (
      <main className="px-4 md:px-0 pb-28 pt-10 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <CircleNotchIcon
          size={32}
          className="text-[#818CF8] animate-spin mb-8"
        />
        <div className="w-full space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[#0c1018]/80 backdrop-blur-sm px-4 py-3.5 rounded-xl border border-transparent animate-pulse"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1E2D45]/50 shrink-0" />
              <div className="w-full space-y-2 py-1">
                <div className="h-3.5 bg-[#1E2D45]/50 rounded-md w-1/3" />
                <div className="h-2.5 bg-[#1E2D45]/50 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (Object.keys(grouped).length === 0) {
    return (
      <main className="px-4 md:px-0 pb-28 pt-3 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-[#1E2D45]">
          <TrayIcon size={44} />
          <p className="font-semibold mt-4 text-[#334155]">Sin movimientos</p>
          <p className="text-sm text-[#1E2D45] mt-1">
            Agrega tu primer movimiento de {MONTHS[currentMonth].toLowerCase()}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 md:px-0 pb-28 pt-3 max-w-2xl mx-auto">
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, txs], groupIdx) => (
          <div
            key={date}
            className="animate-fade-up"
            style={{ animationDelay: `${groupIdx * 60}ms` }}
          >
            <p className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-2 px-1">
              {formatDateHeader(date)}
            </p>
            <div className="space-y-2">
              {txs.map((tx, txIdx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  onDelete={handleDeleteClick}
                  delay={groupIdx * 60 + txIdx * 40}
                  formatAmount={formatAmount}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
