"use client";

import { useState, useEffect, useMemo } from "react";
import AddTransactionModal from "./AddTransactionModal";
import EditTransactionModal from "./EditTransactionModal";
import SavingsSection from "./SavingsSection";
import Header from "./Header";
import NavigationTabs from "./NavigationTabs";
import SummaryCard from "./SummaryCard";
import MonthSelector from "./MonthSelector";
import TransactionList from "./TransactionList";
import DeleteModal from "./DeleteModal";
import { PlusIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { MONTHS } from "@/utils/constants";
import {
  formatAmount,
  getOccurrencesInMonth,
  getOccurrencesUpToMonth,
  calcStats,
} from "@/utils/format";
import { createClient } from "@/lib/supabase/client";

function localDateStr(ts) {
  const d = new Date(ts);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function FinanceApp({ initialUser }) {
  const [transactions, setTransactions] = useState([]);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("movements");
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("theme") ?? "system")
      : "system",
  );


  useEffect(() => {
    const saved = localStorage.getItem("activeTab");
    // eslint-disable-next-line
    if (saved) setActiveTab(saved);
  }, []);

  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && prefersDark),
      );
    };
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  function toggleTheme() {
    const cycle = { system: "dark", dark: "light", light: "system" };
    const next = cycle[theme];
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  function handleSetActiveTab(tab) {
    localStorage.setItem("activeTab", tab);
    setActiveTab(tab);
  }
  const [savingsAddTrigger, setSavingsAddTrigger] = useState(0);
  const [savingsBoxes, setSavingsBoxes] = useState([]);
  const [savingsHydrated, setSavingsHydrated] = useState(false);
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
    async function loadSavings() {
      if (!initialUser) return;
      const { data, error } = await supabase
        .from("savings_boxes")
        .select("*")
        .eq("user_id", initialUser.id);
      if (!error && data) {
        setSavingsBoxes(
          data.map((b) => ({
            ...b,
            initialAmount: b.initial_amount,
            startDate: localDateStr(b.start_date),
            limitAmount: b.limit_amount,
            secondaryRate: b.secondary_rate,
            includeInBalance: b.include_in_balance ?? true,
          })),
        );
      }
      setSavingsHydrated(true);
    }
    loadSavings();
  }, [supabase]);

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
        const dateStr =
          typeof occurrence === "string" ? occurrence : occurrence.dateStr;
        if (!deletedArr.includes(dateStr)) {
          results.push({
            ...tx,
            startDate: tx.date,
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

  const includedSavingsTotal = useMemo(
    () =>
      savingsBoxes
        .filter((b) => b.includeInBalance !== false)
        .reduce((sum, b) => sum + calcStats(b).currentBalance, 0),
    [savingsBoxes],
  );

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

  async function handleAddSavings(box) {
    const {
      id,
      initialAmount,
      startDate,
      limitAmount,
      secondaryRate,
      ...rest
    } = box;
    const dbBox = {
      ...rest,
      user_id: initialUser.id,
      initial_amount: initialAmount,
      start_date: new Date(startDate + "T00:00:00").toISOString(),
      limit_amount: limitAmount || null,
      secondary_rate: secondaryRate || null,
      include_in_balance: true,
    };
    const { data, error } = await supabase
      .from("savings_boxes")
      .insert(dbBox)
      .select();
    if (!error && data) {
      const ins = data[0];
      setSavingsBoxes((prev) => [
        ...prev,
        {
          ...ins,
          initialAmount: ins.initial_amount,
          startDate: localDateStr(ins.start_date),
          limitAmount: ins.limit_amount,
          secondaryRate: ins.secondary_rate,
          includeInBalance: ins.include_in_balance ?? true,
        },
      ]);
      return true;
    }
    return false;
  }

  async function handleEditSavings(id, updates) {
    const { initialAmount, startDate, limitAmount, secondaryRate, ...rest } =
      updates;
    const dbUpdates = {
      ...rest,
      initial_amount: initialAmount,
      start_date: new Date(startDate + "T00:00:00").toISOString(),
      limit_amount: limitAmount || null,
      secondary_rate: secondaryRate || null,
    };
    const { error } = await supabase
      .from("savings_boxes")
      .update(dbUpdates)
      .eq("id", id);
    if (!error) {
      setSavingsBoxes((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
      return true;
    }
    return false;
  }

  async function handleDeleteSavings(id) {
    const { error } = await supabase
      .from("savings_boxes")
      .delete()
      .eq("id", id);
    if (!error) setSavingsBoxes((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleToggleSavingsBalance(id, newValue) {
    const { error } = await supabase
      .from("savings_boxes")
      .update({ include_in_balance: newValue })
      .eq("id", id);
    if (!error)
      setSavingsBoxes((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, includeInBalance: newValue } : b,
        ),
      );
  }

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

  function handleEditClick(tx) {
    setEditTarget(tx);
  }

  async function handleEdit(editedData, scope) {
    const tx = editTarget;
    if (!tx) return;

    const dbFields = {
      type: editedData.type,
      name: editedData.name,
      category: editedData.category,
      amount: editedData.amount,
      currency: editedData.currency,
      date: editedData.date,
    };

    if (scope === "single" || !tx.is_recurring) {
      const { error } = await supabase
        .from("transactions")
        .update(dbFields)
        .eq("id", tx.originalId);
      if (!error) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === tx.originalId ? { ...t, ...dbFields } : t)),
        );
        setEditTarget(null);
      }
      return;
    }

    if (scope === "one") {
      const baseTx = transactions.find((t) => t.id === tx.originalId);
      if (!baseTx) return;
      const newDeleted = baseTx.deleted_dates
        ? `${baseTx.deleted_dates},${tx.date}`
        : tx.date;
      await supabase
        .from("transactions")
        .update({ deleted_dates: newDeleted })
        .eq("id", tx.originalId);
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...dbFields, user_id: initialUser.id, is_recurring: false })
        .select();
      if (!error && data) {
        setTransactions((prev) => [
          ...prev.map((t) =>
            t.id === tx.originalId ? { ...t, deleted_dates: newDeleted } : t,
          ),
          { ...data[0], recurringId: null },
        ]);
        setEditTarget(null);
      }
      return;
    }

    if (scope === "forward") {
      const isFirstOccurrence = tx.date === tx.startDate;
      if (isFirstOccurrence) {
        await supabase.from("transactions").delete().eq("id", tx.originalId);
      } else {
        const d = new Date(tx.date + "T12:00:00");
        d.setDate(d.getDate() - 1);
        const newEndDate = d.toISOString().split("T")[0];
        await supabase
          .from("transactions")
          .update({
            recurring_end_date: newEndDate,
            recurring_end_type: "date",
          })
          .eq("id", tx.originalId);
      }
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...dbFields,
          user_id: initialUser.id,
          is_recurring: editedData.isRecurring,
          recurring_frequency: editedData.recurringFrequency,
          recurring_end_type: editedData.recurringEndType,
          recurring_end_date: editedData.recurringEndDate || null,
          recurring_occurrences: editedData.recurringOccurrences
            ? parseInt(editedData.recurringOccurrences)
            : null,
          recurring_id: editedData.isRecurring ? crypto.randomUUID() : null,
        })
        .select();
      if (!error && data) {
        setTransactions((prev) => {
          const filtered = isFirstOccurrence
            ? prev.filter((t) => t.id !== tx.originalId)
            : prev.map((t) => {
                const d2 = new Date(tx.date + "T12:00:00");
                d2.setDate(d2.getDate() - 1);
                return t.id === tx.originalId
                  ? {
                      ...t,
                      recurring_end_date: d2.toISOString().split("T")[0],
                      recurring_end_type: "date",
                    }
                  : t;
              });
          return [
            ...filtered,
            { ...data[0], recurringId: data[0].recurring_id },
          ];
        });
        setEditTarget(null);
      }
      return;
    }

    if (scope === "all") {
      const recurringFields = {
        is_recurring: editedData.isRecurring,
        recurring_frequency: editedData.recurringFrequency,
        recurring_end_type: editedData.recurringEndType,
        recurring_end_date: editedData.recurringEndDate || null,
        recurring_occurrences: editedData.recurringOccurrences
          ? parseInt(editedData.recurringOccurrences)
          : null,
      };
      const { error } = await supabase
        .from("transactions")
        .update({ ...dbFields, ...recurringFields })
        .eq("id", tx.originalId);
      if (!error) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === tx.originalId
              ? { ...t, ...dbFields, ...recurringFields }
              : t,
          ),
        );
        setEditTarget(null);
      }
    }
  }

  async function handleDeleteClick(tx) {
    setDeleteTarget(tx);
  }

  async function confirmDeleteSingle(tx) {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", tx.originalId || tx.id);
    if (!error) {
      setTransactions((prev) =>
        prev.filter((t) => t.id !== (tx.originalId || tx.id)),
      );
    }
    setDeleteTarget(null);
  }

  return (
    <div>
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
        <div className="bg-secondary text-foreground p-2.5 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-border flex items-center justify-center">
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
        theme={theme}
        onToggleDark={toggleTheme}
      />

      <NavigationTabs activeTab={activeTab} setActiveTab={handleSetActiveTab} />

      {activeTab === "movements" && (
        <>
          {/* ── Summary cards ──────────────────────────────────────────────── */}
          <section className="px-3 md:px-0 md:pt-3 pb-1 max-w-2xl mx-auto mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Balance – full width on mobile */}
              <div
                className="col-span-2 sm:col-span-1 bg-card rounded-xl p-5 border border-border shadow-xs animate-fade-up relative overflow-hidden"
                style={{ animationDelay: "0ms" }}
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
                      className={`text-2xl font-extrabold leading-snug ${totalBalance + includedSavingsTotal >= 0 ? "text-foreground" : "text-destructive"}`}
                    >
                      {formatAmount(
                        Math.abs(totalBalance + includedSavingsTotal),
                        defaultCurrency,
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
                      {defaultCurrency}
                    </p>
                  </>
                )}
              </div>
              <div
                className="animate-fade-up h-full"
                style={{ animationDelay: "70ms" }}
              >
                <SummaryCard
                  label="Ingresos"
                  value={monthIncome}
                  currency={defaultCurrency}
                  colorClass="text-[#10B981]"
                  prefix="+"
                  formatAmount={formatAmount}
                  loading={!hydrated}
                />
              </div>
              <div
                className="animate-fade-up h-full"
                style={{ animationDelay: "140ms" }}
              >
                <SummaryCard
                  label="Gastos"
                  value={monthExpenses}
                  currency={defaultCurrency}
                  colorClass="text-[#F43F5E]"
                  prefix="-"
                  formatAmount={formatAmount}
                  loading={!hydrated}
                />
              </div>
            </div>

            {(monthIncome > 0 || monthExpenses > 0) && (
              <div
                className="mt-3 py-2.5 px-3 flex items-center justify-between bg-card rounded-md border border-border animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                <span className="text-xs text-muted-foreground font-medium">
                  {savings >= 0 ? "Ahorro" : "Déficit"} en{" "}
                  {MONTHS[currentMonth]}
                </span>
                <span
                  className={`text-sm font-bold ${savings >= 0 ? "text-[#10B981]" : "text-destructive"}`}
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
            handleEditClick={handleEditClick}
            formatAmount={formatAmount}
          />
        </>
      )}

      {activeTab === "savings" && (
        <SavingsSection
          triggerAdd={savingsAddTrigger}
          boxes={savingsBoxes}
          hydrated={savingsHydrated}
          onAdd={handleAddSavings}
          onDelete={handleDeleteSavings}
          onEdit={handleEditSavings}
          onToggleBalance={handleToggleSavingsBalance}
        />
      )}

      {/* ── FAB (mobile) global ───────────────────────────────────────── */}
      <div className="fixed bottom-6 right-5 sm:hidden z-10">
        <button
          onClick={() => {
            if (activeTab === "savings") setSavingsAddTrigger((n) => n + 1);
            else setShowModal(true);
          }}
          className="w-14 h-14 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg flex items-center justify-center transition-colors cursor-pointer active:scale-95"
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

      {editTarget && (
        <EditTransactionModal
          tx={editTarget}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && !deleteTarget.is_recurring && (
        <DeleteModal
          onConfirm={() => confirmDeleteSingle(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget && deleteTarget.is_recurring && (
        <DeleteModal
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
          onDeleteFromHere={async () => {
            const txBase = transactions.find(
              (t) => t.id === deleteTarget.originalId,
            );
            if (!txBase) return;

            // Si es la primera ocurrencia, eliminar toda la transacción
            if (deleteTarget.date === txBase.date) {
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
              return;
            }

            // Acortar la recurrencia al día anterior al seleccionado
            const d = new Date(deleteTarget.date + "T12:00:00");
            d.setDate(d.getDate() - 1);
            const newEndDate = d.toISOString().split("T")[0];

            const { error } = await supabase
              .from("transactions")
              .update({
                recurring_end_date: newEndDate,
                recurring_end_type: "date",
              })
              .eq("id", deleteTarget.originalId);
            if (!error) {
              setTransactions((prev) =>
                prev.map((t) =>
                  t.id === deleteTarget.originalId
                    ? {
                        ...t,
                        recurring_end_date: newEndDate,
                        recurring_end_type: "date",
                      }
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
