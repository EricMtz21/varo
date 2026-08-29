"use client";

import { useMemo, useRef } from "react";
import SummaryCard from "./SummaryCard";
import MonthSelector from "./MonthSelector";
import SearchField from "./SearchField";
import TransactionList from "./TransactionList";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { MONTHS } from "@/utils/constants";
import { calcStats, formatAmount } from "@/utils/format";
import {
  expandMonth,
  filterByQuery,
  groupByDate,
  runningBalance,
  sumByType,
} from "@/utils/transactions";

const SWIPE_MIN_DISTANCE = 70;

export default function MovementsSection({
  transactions,
  savingsBoxes,
  cardsById,
  currency,
  hydrated,
  currentYear,
  currentMonth,
  setCurrentMonth,
  setCurrentYear,
  onShiftMonth,
  query,
  setQuery,
  onEditClick,
  onDeleteClick,
}) {
  const balanceRevealRef = useRevealOnMount(0);
  const incomeRevealRef = useRevealOnMount(70);
  const expenseRevealRef = useRevealOnMount(140);
  const savingsBarRevealRef = useRevealOnMount(200);

  const monthTransactions = useMemo(
    () => expandMonth(transactions, currentYear, currentMonth),
    [transactions, currentYear, currentMonth],
  );

  const totalBalance = useMemo(
    () => runningBalance(transactions, currentYear, currentMonth),
    [transactions, currentYear, currentMonth],
  );

  const includedSavingsTotal = useMemo(
    () =>
      savingsBoxes
        .filter((b) => b.includeInBalance !== false)
        .reduce((sum, b) => sum + calcStats(b).currentBalance, 0),
    [savingsBoxes],
  );

  const monthIncome = useMemo(
    () => sumByType(monthTransactions, "income"),
    [monthTransactions],
  );
  const monthExpenses = useMemo(
    () => sumByType(monthTransactions, "expense"),
    [monthTransactions],
  );

  const visibleTransactions = useMemo(
    () => filterByQuery(monthTransactions, query, cardsById),
    [monthTransactions, query, cardsById],
  );

  const grouped = useMemo(
    () => groupByDate(visibleTransactions),
    [visibleTransactions],
  );

  const savings = monthIncome - monthExpenses;

  // Swipe horizontal para cambiar de mes sin buscar el chip.
  const swipeStart = useRef(null);

  function onSwipeStart(e) {
    // Arrastrar dentro del buscador selecciona texto: eso no cambia de mes.
    if (e.target.closest("input, textarea, button, [role='button']")) {
      swipeStart.current = null;
      return;
    }
    const touch = e.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onSwipeEnd(e) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Claramente horizontal y con recorrido suficiente: si no, era un scroll.
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) {
      return;
    }
    onShiftMonth(dx < 0 ? 1 : -1);
  }

  return (
    <>
      {/* ── Tarjetas de resumen ────────────────────────────────────────── */}
      <section className="px-3 md:px-0 md:pt-3 pb-1 max-w-2xl mx-auto mt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Balance – ancho completo en móvil */}
          <div
            ref={balanceRevealRef}
            className="col-span-2 sm:col-span-1 bg-card rounded-xl p-5 border border-border shadow-xs relative overflow-hidden"
          >
            <p className="text-[11px] text-muted-foreground mb-2 font-medium tracking-wide uppercase">
              Ahorro total
            </p>
            {!hydrated ? (
              <div className="space-y-2 py-1">
                <div className="h-6 w-32 bg-muted/50 rounded-sm animate-pulse" />
                <div className="h-3 w-10 bg-muted/50 rounded-sm animate-pulse" />
              </div>
            ) : (
              <>
                <p
                  className={`text-2xl font-extrabold leading-snug ${
                    totalBalance + includedSavingsTotal >= 0
                      ? "text-foreground"
                      : "text-destructive"
                  }`}
                >
                  {formatAmount(
                    Math.abs(totalBalance + includedSavingsTotal),
                    currency,
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
                  {currency}
                </p>
              </>
            )}
          </div>
          <div ref={incomeRevealRef} className="h-full">
            <SummaryCard
              label="Ingresos"
              value={monthIncome}
              currency={currency}
              colorClass="text-[#10B981]"
              prefix="+"
              formatAmount={formatAmount}
              loading={!hydrated}
            />
          </div>
          <div ref={expenseRevealRef} className="h-full">
            <SummaryCard
              label="Gastos"
              value={monthExpenses}
              currency={currency}
              colorClass="text-[#F43F5E]"
              prefix="-"
              formatAmount={formatAmount}
              loading={!hydrated}
            />
          </div>
        </div>

        {(monthIncome > 0 || monthExpenses > 0) && (
          <div
            ref={savingsBarRevealRef}
            className="mt-3 py-2.5 px-3 flex items-center justify-between bg-card rounded-md border border-border"
          >
            <span className="text-xs text-muted-foreground font-medium">
              {savings >= 0 ? "Ahorro" : "Déficit"} en {MONTHS[currentMonth]}
            </span>
            <span
              className={`text-sm font-bold ${savings >= 0 ? "text-[#10B981]" : "text-destructive"}`}
            >
              {savings >= 0 ? "+" : ""}
              {formatAmount(savings, currency)}
            </span>
          </div>
        )}
      </section>

      {/* Deslizar de lado cambia de mes; el chip sigue estando ahí. */}
      <div onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}>
        <MonthSelector
          currentMonth={currentMonth}
          currentYear={currentYear}
          setCurrentMonth={setCurrentMonth}
          setCurrentYear={setCurrentYear}
        />

        <SearchField
          value={query}
          onChange={setQuery}
          resultCount={visibleTransactions.length}
        />

        <TransactionList
          hydrated={hydrated}
          grouped={grouped}
          currentMonth={currentMonth}
          handleDeleteClick={onDeleteClick}
          handleEditClick={onEditClick}
          formatAmount={formatAmount}
          currency={currency}
          cardsById={cardsById}
          query={query}
        />
      </div>
    </>
  );
}
