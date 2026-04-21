"use client";

import { useState, useEffect, useMemo } from "react";
import AddTransactionModal from "./AddTransactionModal";
import SavingsSection from "./SavingsSection";
import Header from "./Header";
import NavigationTabs from "./NavigationTabs";
import SummaryCard from "./SummaryCard";
import MonthSelector from "./MonthSelector";
import TransactionList from "./TransactionList";
import DeleteModal from "./DeleteModal";
import { PlusIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { MONTHS } from "../utils/constants";
import { formatAmount, getOccurrencesInMonth, getOccurrencesUpToMonth } from "../utils/format";
import { createClient } from "../../utils/supabase/client";
import Grainient from "@/components/Grainient";
import DarkVeil from "@/components/DarkVeil";

export default function FinanceApp({ initialUser }) {
  const [transactions, setTransactions] = useState([]);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("movements");
  const [savingsAddTrigger, setSavingsAddTrigger] = useState(0);
  const [pullState, setPullState] = useState({
    progress: 0,
    pulling: false,
    refreshing: false,
  });

  const supabase = createClient();

  useEffect(() => {
    // Solo aplicará en móviles / pantallas pequeñas táctiles
    if (window.innerWidth > 768) return;

    let startY = null;

    const onTouchStart = (e) => {
      // Solo iniciar pull si el usuario está hasta arriba de la página
      if (window.scrollY <= 10) {
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY === null) return;

      const y = e.touches[0].clientY;
      const dy = y - startY;

      if (dy > 0 && window.scrollY <= 10) {
        setPullState((prev) => ({
          ...prev,
          progress: Math.min(dy, 120),
          pulling: true,
        }));
        // Prevenir el scroll por defecto solo si se puede para un efecto más suave
        if (dy > 10 && e.cancelable) {
          e.preventDefault();
        }
      } else if (dy < 0) {
        startY = null;
      }
    };

    const onTouchEnd = () => {
      if (startY === null) return;

      setPullState((prev) => {
        if (prev.progress > 80) {
          window.location.reload();
          return { progress: 80, pulling: false, refreshing: true };
        }
        return { progress: 0, pulling: false, refreshing: false };
      });

      startY = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    // passive: false permite usar preventDefault() para evitar el rebote nativo del navegador al hacer pull
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    async function loadTransactions() {
      if (!initialUser) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", initialUser.id);

      if (!error && data) {
        const formatted = data.map((t) => ({
          ...t,
          recurringId: t.recurring_id,
        }));
        setTransactions(formatted);
      }
      setHydrated(true);
    }
    loadTransactions();
  }, [supabase]);

  const defaultCurrency = useMemo(() => {
    if (!transactions.length) return "MXN";
    const counts = transactions.reduce((acc, t) => {
      acc[t.currency] = (acc[t.currency] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [transactions]);

  const monthTransactions = useMemo(() => {
    const results = [];
    transactions.forEach((tx) => {
      const deletedArr = tx.deleted_dates ? tx.deleted_dates.split(",") : [];
      const occs = getOccurrencesInMonth(tx, currentYear, currentMonth);

      occs.forEach((occurrence) => {
        const dateStr = typeof occurrence === 'string' ? occurrence : occurrence.dateStr;
        if (!deletedArr.includes(dateStr)) {
          results.push({
            ...tx,
            date: dateStr,
            occurrenceIndex: occurrence.occurrenceIndex,
            totalOccurrences: occurrence.totalOccurrences,
            originalId: tx.id,
            id: `${tx.id}_${dateStr}`,
          });
        }
      });
    });
    return results;
  }, [transactions, currentYear, currentMonth]);

  const totalBalance = useMemo(() => {
    let sum = 0;
    transactions.forEach((tx) => {
      const deletedArr = tx.deleted_dates ? tx.deleted_dates.split(",") : [];
      const occs = getOccurrencesUpToMonth(tx, currentYear, currentMonth);
      occs.forEach((dateStr) => {
        if (!deletedArr.includes(dateStr)) {
          sum += tx.type === "income" ? tx.amount : -tx.amount;
        }
      });
    });
    return sum;
  }, [transactions, currentYear, currentMonth]);

  const monthIncome = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [monthTransactions],
  );

  const monthExpenses = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [monthTransactions],
  );

  const grouped = useMemo(() => {
    const sorted = [...monthTransactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    return sorted.reduce((acc, t) => {
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
    }, {});
  }, [monthTransactions]);

  const savings = monthIncome - monthExpenses;

  async function handleAdd(newTxs) {
    if (!initialUser) return;

    const dbRows = newTxs.map((tx) => {
      const {
        id,
        recurringId,
        isRecurring,
        recurringFrequency,
        recurringEndType,
        recurringEndDate,
        recurringOccurrences,
        ...rest
      } = tx;

      return {
        ...rest,
        user_id: initialUser.id,
        is_recurring: isRecurring || false,
        recurring_frequency: recurringFrequency || null,
        recurring_end_type: recurringEndType || null,
        recurring_end_date: recurringEndDate || null,
        recurring_occurrences: recurringOccurrences
          ? parseInt(recurringOccurrences)
          : null,
        recurring_id: recurringId || null,
      };
    });

    const { data, error } = await supabase
      .from("transactions")
      .insert(dbRows)
      .select();

    if (!error && data) {
      const formatted = data.map((t) => ({
        ...t,
        recurringId: t.recurring_id,
      }));
      setTransactions((prev) => [...prev, ...formatted]);
      setShowModal(false);
    } else {
      console.error("Error inserting transactions:", error);
    }
  }

  async function handleDeleteClick(tx) {
    if (tx.is_recurring) {
      setDeleteTarget(tx);
    } else {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", tx.originalId || tx.id);
      if (!error) {
        setTransactions((prev) =>
          prev.filter((t) => t.id !== (tx.originalId || tx.id)),
        );
      } else {
        console.error("Error deleting transaction:", error);
      }
    }
  }

  return (
    <div>
      {/* ── Background ────────────────────────── */}
      <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden bg-[#07090F]">
        <DarkVeil
          hueShift={6}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#07090F]/70 via-[#07090F]/80 to-[#07090F]/80 pointer-events-none" />
      </div>

      {/* ── Pull to Refresh Indicator (Mobile) ────────────────────────── */}
      <div
        className="fixed top-0 left-0 w-full flex justify-center pointer-events-none z-100 sm:hidden"
        style={{
          transform: `translateY(${pullState.refreshing ? 60 : pullState.progress > 0 ? pullState.progress / 1.5 : -60}px)`,
          opacity: pullState.refreshing
            ? 1
            : pullState.progress > 0
              ? Math.min(pullState.progress / 60, 1)
              : 0,
          transition: pullState.pulling
            ? "none"
            : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="bg-[#141D2E] text-[#818CF8] p-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-[#1E2D45] flex items-center justify-center">
          <ArrowsClockwiseIcon
            size={22}
            weight="bold"
            className={pullState.refreshing ? "animate-spin" : ""}
            style={{
              transform: !pullState.refreshing
                ? `rotate(${pullState.progress * 3}deg)`
                : "none",
            }}
          />
        </div>
      </div>

      <Header
        activeTab={activeTab}
        onAddClick={() => {
          if (activeTab === "savings") setSavingsAddTrigger((n) => n + 1);
          else setShowModal(true);
        }}
        user={initialUser}
      />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "movements" && (
        <>
          {/* ── Summary cards ──────────────────────────────────────────────── */}
          <section className="px-3 md:px-0 md:pt-3 pb-1 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Balance – full width on mobile */}
              <div
                className="col-span-2 sm:col-span-1 bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-4 animate-fade-up relative overflow-hidden"
                style={{ animationDelay: "0ms" }}
              >
                <p className="text-[11px] text-[#64748B] mb-2 font-medium tracking-wide uppercase">
                  Balance total
                </p>
                {!hydrated ? (
                  <div className="space-y-2 py-1">
                    <div className="h-6 w-32 bg-[#1E2D45]/50 rounded-sm animate-pulse" />
                    <div className="h-3 w-10 bg-[#1E2D45]/50 rounded-sm animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p
                      className={`text-xl font-bold leading-snug ${totalBalance >= 0 ? "text-[#818CF8]" : "text-[#F87171]"}`}
                    >
                      {formatAmount(Math.abs(totalBalance), defaultCurrency)}
                    </p>
                    <p className="text-[10px] text-[#334155] mt-1 font-semibold">
                      {defaultCurrency}
                    </p>
                  </>
                )}
              </div>
              <div
                className="animate-fade-up"
                style={{ animationDelay: "70ms" }}
              >
                <SummaryCard
                  label="Ingresos"
                  value={monthIncome}
                  currency={defaultCurrency}
                  colorClass="text-[#34D399]"
                  prefix="+"
                  formatAmount={formatAmount}
                  loading={!hydrated}
                />
              </div>
              <div
                className="animate-fade-up"
                style={{ animationDelay: "140ms" }}
              >
                <SummaryCard
                  label="Gastos"
                  value={monthExpenses}
                  currency={defaultCurrency}
                  colorClass="text-[#F87171]"
                  prefix="-"
                  formatAmount={formatAmount}
                  loading={!hydrated}
                />
              </div>
            </div>

            {(monthIncome > 0 || monthExpenses > 0) && (
              <div
                className="mt-3 bg-[#0c1018]/80 backdrop-blur-sm rounded-md px-4 py-2.5 flex items-center justify-between animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                <span className="text-xs text-[#64748B] font-medium">
                  {savings >= 0 ? "Ahorro" : "Déficit"} en{" "}
                  {MONTHS[currentMonth]}
                </span>
                <span
                  className={`text-sm font-bold ${savings >= 0 ? "text-[#34D399]" : "text-[#F87171]"}`}
                >
                  {savings >= 0 ? "+" : ""}
                  {formatAmount(savings, defaultCurrency)}
                </span>
              </div>
            )}
          </section>

          <MonthSelector
            currentMonth={currentMonth}
            currentYear={currentYear}
            setCurrentMonth={setCurrentMonth}
            setCurrentYear={setCurrentYear}
          />

          <TransactionList
            hydrated={hydrated}
            grouped={grouped}
            currentMonth={currentMonth}
            handleDeleteClick={handleDeleteClick}
            formatAmount={formatAmount}
          />
        </>
      )}

      {activeTab === "savings" && (
        <SavingsSection triggerAdd={savingsAddTrigger} />
      )}

      {/* ── FAB (mobile) global ───────────────────────────────────────── */}
      <div className="fixed bottom-6 right-5 sm:hidden z-10">
        <button
          onClick={() => {
            if (activeTab === "savings") setSavingsAddTrigger((n) => n + 1);
            else setShowModal(true);
          }}
          className="w-14 h-14 bg-[#818CF8] hover:bg-[#6D75E8] text-[#07090F] rounded-full shadow-2xl flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          aria-label={
            activeTab === "savings" ? "Agregar caja" : "Agregar movimiento"
          }
        >
          <PlusIcon size={24} />
        </button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showModal && (
        <AddTransactionModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          transaction={deleteTarget}
          onDeleteOne={async () => {
            const txBase = transactions.find(
              (t) => t.id === deleteTarget.originalId,
            );
            if (!txBase) return;

            const newDeleted = txBase.deleted_dates
              ? txBase.deleted_dates + `,${deleteTarget.date}`
              : deleteTarget.date;

            const { error } = await supabase
              .from("transactions")
              .update({ deleted_dates: newDeleted })
              .eq("id", deleteTarget.originalId);
            if (!error) {
              setTransactions((prev) =>
                prev.map((t) =>
                  t.id === deleteTarget.originalId
                    ? { ...t, deleted_dates: newDeleted }
                    : t,
                ),
              );
              setDeleteTarget(null);
            }
          }}
          onDeleteAll={async () => {
            const { error } = await supabase
              .from("transactions")
              .delete()
              .eq("id", deleteTarget.originalId);
            if (!error) {
              setTransactions((prev) =>
                prev.filter((t) => t.id !== deleteTarget.originalId),
              );
              setDeleteTarget(null);
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
