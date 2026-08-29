"use client";

import { useCallback, useMemo, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import AddTransactionModal from "./AddTransactionModal";
import EditTransactionModal from "./EditTransactionModal";
import DeleteModal from "./DeleteModal";
import Header from "./Header";
import NavigationTabs from "./NavigationTabs";
import MovementsSection from "./MovementsSection";
import CreditCardsSection from "./CreditCardsSection";
import SavingsSection from "./SavingsSection";
import PullToRefreshIndicator from "./PullToRefreshIndicator";
import { useFinanceData } from "@/hooks/useFinanceData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useThemePreference } from "@/hooks/useThemePreference";
import { writePref } from "@/utils/prefs";
import { dominantCurrency, shiftMonth } from "@/utils/transactions";

const ADD_LABELS = {
  savings: "Agregar caja",
  cards: "Agregar tarjeta",
  movements: "Agregar movimiento",
};

export default function FinanceApp({
  initialUser,
  initialTab = "movements",
  initialTheme = "system",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [query, setQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [savingsAddTrigger, setSavingsAddTrigger] = useState(0);
  const [cardsAddTrigger, setCardsAddTrigger] = useState(0);

  const { theme, toggleTheme } = useThemePreference(initialTheme);
  const data = useFinanceData(initialUser);
  const pullState = usePullToRefresh(data.reload);

  const currency = useMemo(
    () => dominantCurrency(data.transactions),
    [data.transactions],
  );

  const cardsById = useMemo(
    () => Object.fromEntries(data.creditCards.map((c) => [c.id, c])),
    [data.creditCards],
  );

  function handleSetActiveTab(tab) {
    writePref("activeTab", tab);
    setActiveTab(tab);
  }

  function handleAddClick() {
    if (activeTab === "savings") setSavingsAddTrigger((n) => n + 1);
    else if (activeTab === "cards") setCardsAddTrigger((n) => n + 1);
    else setShowAddModal(true);
  }

  function handleShiftMonth(delta) {
    const next = shiftMonth(currentYear, currentMonth, delta);
    setCurrentMonth(next.month);
    setCurrentYear(next.year);
  }

  async function handleAddMovements(newTxs) {
    const ok = await data.movements.add(newTxs);
    if (ok) setShowAddModal(false);
    return ok;
  }

  async function handleEditMovement(editedData, scope) {
    if (!editTarget) return false;
    const ok = await data.movements.edit(editTarget, editedData, scope);
    if (ok) setEditTarget(null);
    return ok;
  }

  // Cada opción de borrado cierra el diálogo solo si la operación salió bien.
  function closeDeleteAfter(action) {
    return async () => {
      const ok = await action(deleteTarget);
      if (ok) setDeleteTarget(null);
    };
  }

  return (
    <div>
      <PullToRefreshIndicator {...pullState} />

      <Header
        activeTab={activeTab}
        onAddClick={handleAddClick}
        user={initialUser}
        theme={theme}
        onToggleDark={toggleTheme}
      />

      <NavigationTabs activeTab={activeTab} setActiveTab={handleSetActiveTab} />

      {activeTab === "movements" && (
        <MovementsSection
          transactions={data.transactions}
          savingsBoxes={data.savingsBoxes}
          cardsById={cardsById}
          currency={currency}
          hydrated={data.ready.transactions}
          currentYear={currentYear}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          setCurrentYear={setCurrentYear}
          onShiftMonth={handleShiftMonth}
          query={query}
          setQuery={setQuery}
          onEditClick={setEditTarget}
          onDeleteClick={setDeleteTarget}
        />
      )}

      {activeTab === "cards" && (
        <CreditCardsSection
          triggerAdd={cardsAddTrigger}
          cards={data.creditCards}
          transactions={data.transactions}
          payments={data.cardPayments}
          hydrated={data.ready.cards && data.ready.transactions}
          currency={currency}
          onAdd={data.cards.add}
          onEdit={data.cards.edit}
          onDelete={data.cards.remove}
          onRegisterPayment={data.cards.registerPayment}
          onDeletePayment={data.cards.deletePayment}
        />
      )}

      {activeTab === "savings" && (
        <SavingsSection
          triggerAdd={savingsAddTrigger}
          boxes={data.savingsBoxes}
          hydrated={data.ready.savings}
          onAdd={data.savings.add}
          onEdit={data.savings.edit}
          onDelete={data.savings.remove}
          onToggleBalance={data.savings.toggleInBalance}
        />
      )}

      {/* ── FAB (móvil) ────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-5 sm:hidden z-10">
        <button
          onClick={handleAddClick}
          className="w-14 h-14 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          aria-label={ADD_LABELS[activeTab] ?? ADD_LABELS.movements}
        >
          <PlusIcon size={24} />
        </button>
      </div>

      {/* ── Hojas y diálogos ───────────────────────────────────────────── */}
      {showAddModal && (
        <AddTransactionModal
          onAdd={handleAddMovements}
          onClose={() => setShowAddModal(false)}
          cards={data.creditCards}
        />
      )}

      {editTarget && (
        <EditTransactionModal
          tx={editTarget}
          onSave={handleEditMovement}
          onClose={() => setEditTarget(null)}
          cards={data.creditCards}
        />
      )}

      {deleteTarget && !deleteTarget.is_recurring && (
        <DeleteModal
          onConfirm={closeDeleteAfter(data.movements.remove)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget && deleteTarget.is_recurring && (
        <DeleteModal
          onDeleteOne={closeDeleteAfter(data.movements.removeOccurrence)}
          onDeleteFromHere={closeDeleteAfter(data.movements.removeFromHere)}
          onDeleteAll={closeDeleteAfter(data.movements.remove)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
