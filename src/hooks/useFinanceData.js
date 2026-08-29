"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { toLocalIso } from "@/utils/format";
import { previousDayIso } from "@/utils/transactions";
import { uid } from "@/utils/uid";

// ─── Traducción entre las filas de la BD (snake_case) y la app (camelCase) ──

function mapTransaction(row) {
  return { ...row, recurringId: row.recurring_id };
}

function mapCard(row) {
  return { ...row, cutoffDay: row.cutoff_day, paymentDay: row.payment_day };
}

function mapSavingsBox(row) {
  return {
    ...row,
    initialAmount: row.initial_amount,
    startDate: toLocalIso(new Date(row.start_date)),
    limitAmount: row.limit_amount,
    secondaryRate: row.secondary_rate,
    includeInBalance: row.include_in_balance ?? true,
  };
}

function savingsBoxToRow({ initialAmount, startDate, limitAmount, secondaryRate, ...rest }) {
  return {
    ...rest,
    initial_amount: initialAmount,
    start_date: new Date(startDate + "T00:00:00").toISOString(),
    limit_amount: limitAmount || null,
    secondary_rate: secondaryRate || null,
  };
}

function cardToRow(values) {
  return {
    name: values.name,
    color: values.color,
    cutoff_day: values.cutoffDay,
    payment_day: values.paymentDay,
  };
}

function movementToRow(tx) {
  const {
    id,
    recurringId,
    creditCardId,
    isRecurring,
    recurringFrequency,
    recurringEndType,
    recurringEndDate,
    recurringOccurrences,
    ...rest
  } = tx;

  return {
    ...rest,
    is_recurring: isRecurring || false,
    recurring_frequency: recurringFrequency || null,
    recurring_end_type: recurringEndType || null,
    recurring_end_date: recurringEndDate || null,
    recurring_occurrences: recurringOccurrences
      ? parseInt(recurringOccurrences)
      : null,
    recurring_id: recurringId || null,
    credit_card_id: creditCardId || null,
  };
}

function recurrenceFieldsOf(editedData) {
  return {
    is_recurring: editedData.isRecurring,
    recurring_frequency: editedData.recurringFrequency,
    recurring_end_type: editedData.recurringEndType,
    recurring_end_date: editedData.recurringEndDate || null,
    recurring_occurrences: editedData.recurringOccurrences
      ? parseInt(editedData.recurringOccurrences)
      : null,
  };
}

function editableFieldsOf(editedData) {
  return {
    type: editedData.type,
    name: editedData.name,
    category: editedData.category,
    amount: editedData.amount,
    currency: editedData.currency,
    date: editedData.date,
    credit_card_id: editedData.creditCardId ?? null,
  };
}

/**
 * Todo el estado que vive en Supabase: movimientos, cajas de ahorro, tarjetas
 * y pagos. Cada operación devuelve `true`/`false` para que quien la llama
 * decida si cierra la hoja, y avisa por toast cuando algo falla.
 */
export function useFinanceData(user) {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [transactions, setTransactions] = useState([]);
  const [savingsBoxes, setSavingsBoxes] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [cardPayments, setCardPayments] = useState([]);

  const [transactionsReady, setTransactionsReady] = useState(false);
  const [savingsReady, setSavingsReady] = useState(false);
  const [cardsReady, setCardsReady] = useState(false);

  const userId = user?.id;

  // Los cargadores se declaran dentro del effect (así el setState no cuelga
  // del cuerpo del effect) y se exponen por ref para que el pull-to-refresh
  // reutilice exactamente las mismas consultas.
  const reloadRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    async function loadTransactions() {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId);
      if (!alive) return;
      if (error) toast.error("No se pudieron cargar los movimientos.");
      else if (data) setTransactions(data.map(mapTransaction));
      setTransactionsReady(true);
    }

    async function loadSavings() {
      const { data, error } = await supabase
        .from("savings_boxes")
        .select("*")
        .eq("user_id", userId);
      if (!alive) return;
      if (error) toast.error("No se pudieron cargar las cajas de ahorro.");
      else if (data) setSavingsBoxes(data.map(mapSavingsBox));
      setSavingsReady(true);
    }

    async function loadCreditCards() {
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (!alive) return;
      if (error) toast.error("No se pudieron cargar las tarjetas.");
      else if (data) setCreditCards(data.map(mapCard));
      setCardsReady(true);
    }

    async function loadCardPayments() {
      const { data, error } = await supabase
        .from("card_payments")
        .select("*")
        .eq("user_id", userId);
      if (!alive) return;
      if (error) toast.error("No se pudieron cargar los pagos de tarjeta.");
      else if (data) setCardPayments(data);
    }

    reloadRef.current = () =>
      Promise.all([
        loadTransactions(),
        loadSavings(),
        loadCreditCards(),
        loadCardPayments(),
      ]);

    reloadRef.current();

    return () => {
      alive = false;
    };
  }, [supabase, userId, toast]);

  const reload = useCallback(() => reloadRef.current?.(), []);

  // ── Cajas de ahorro ───────────────────────────────────────────────────────

  async function addSavingsBox(box) {
    const { id, ...values } = box;
    const { data, error } = await supabase
      .from("savings_boxes")
      .insert({
        ...savingsBoxToRow(values),
        user_id: userId,
        include_in_balance: true,
      })
      .select();
    if (error || !data) {
      toast.error("No se pudo crear la caja de ahorro.");
      return false;
    }
    setSavingsBoxes((prev) => [...prev, mapSavingsBox(data[0])]);
    return true;
  }

  async function editSavingsBox(id, updates) {
    const { error } = await supabase
      .from("savings_boxes")
      .update(savingsBoxToRow(updates))
      .eq("id", id);
    if (error) {
      toast.error("No se pudieron guardar los cambios de la caja.");
      return false;
    }
    setSavingsBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
    return true;
  }

  async function deleteSavingsBox(id) {
    const { error } = await supabase.from("savings_boxes").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar la caja de ahorro.");
      return false;
    }
    setSavingsBoxes((prev) => prev.filter((b) => b.id !== id));
    return true;
  }

  async function toggleSavingsInBalance(id, included) {
    const { error } = await supabase
      .from("savings_boxes")
      .update({ include_in_balance: included })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo actualizar la caja.");
      return false;
    }
    setSavingsBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, includeInBalance: included } : b)),
    );
    return true;
  }

  // ── Tarjetas ──────────────────────────────────────────────────────────────

  async function addCard(values) {
    if (!userId) return false;
    const { data, error } = await supabase
      .from("credit_cards")
      .insert({ ...cardToRow(values), user_id: userId })
      .select();
    if (error || !data) {
      toast.error("No se pudo crear la tarjeta.");
      return false;
    }
    setCreditCards((prev) => [...prev, mapCard(data[0])]);
    return true;
  }

  async function editCard(id, values) {
    const row = cardToRow(values);
    const { error } = await supabase
      .from("credit_cards")
      .update(row)
      .eq("id", id);
    if (error) {
      toast.error("No se pudieron guardar los cambios de la tarjeta.");
      return false;
    }
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? mapCard({ ...c, ...row }) : c)),
    );
    return true;
  }

  async function deleteCard(id) {
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar la tarjeta.");
      return false;
    }
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
    setCardPayments((prev) => prev.filter((p) => p.credit_card_id !== id));
    // La FK usa ON DELETE SET NULL: los movimientos siguen ahí, solo dejan de
    // estar enlazados. Reflejamos lo mismo en memoria.
    setTransactions((prev) =>
      prev.map((t) =>
        t.credit_card_id === id ? { ...t, credit_card_id: null } : t,
      ),
    );
    return true;
  }

  async function registerPayment({ cardId, amount, date }) {
    const { data, error } = await supabase
      .from("card_payments")
      .insert({ user_id: userId, credit_card_id: cardId, amount, date })
      .select();
    if (error || !data) {
      toast.error("No se pudo registrar el pago.");
      return false;
    }
    setCardPayments((prev) => [...prev, data[0]]);
    toast.success("Pago registrado.");
    return true;
  }

  async function deletePayment(id) {
    const { error } = await supabase.from("card_payments").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar el pago.");
      return false;
    }
    setCardPayments((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  // ── Movimientos ───────────────────────────────────────────────────────────

  async function addMovements(newTxs) {
    if (!userId) return false;
    const rows = newTxs.map((tx) => ({
      ...movementToRow(tx),
      user_id: userId,
    }));
    const { data, error } = await supabase
      .from("transactions")
      .insert(rows)
      .select();
    if (error || !data) {
      toast.error("No se pudo guardar el movimiento.");
      return false;
    }
    setTransactions((prev) => [...prev, ...data.map(mapTransaction)]);
    return true;
  }

  // Marca una fecha como borrada dentro de una serie recurrente.
  async function hideOccurrence(tx) {
    const base = transactions.find((t) => t.id === tx.originalId);
    if (!base) return false;
    const deleted_dates = base.deleted_dates
      ? `${base.deleted_dates},${tx.date}`
      : tx.date;
    const { error } = await supabase
      .from("transactions")
      .update({ deleted_dates })
      .eq("id", tx.originalId);
    if (error) return false;
    setTransactions((prev) =>
      prev.map((t) => (t.id === tx.originalId ? { ...t, deleted_dates } : t)),
    );
    return true;
  }

  // Corta una serie el día antes de `tx`; si `tx` es la primera ocurrencia,
  // no queda nada que conservar y se borra el registro completo.
  async function truncateSeriesBefore(tx) {
    if (tx.date === tx.startDate) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", tx.originalId);
      if (error) return false;
      setTransactions((prev) => prev.filter((t) => t.id !== tx.originalId));
      return true;
    }

    const cut = {
      recurring_end_date: previousDayIso(tx.date),
      recurring_end_type: "date",
    };
    const { error } = await supabase
      .from("transactions")
      .update(cut)
      .eq("id", tx.originalId);
    if (error) return false;
    setTransactions((prev) =>
      prev.map((t) => (t.id === tx.originalId ? { ...t, ...cut } : t)),
    );
    return true;
  }

  async function deleteMovement(tx) {
    const id = tx.originalId || tx.id;
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar el movimiento.");
      return false;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  }

  async function deleteOccurrence(tx) {
    const ok = await hideOccurrence(tx);
    if (!ok) toast.error("No se pudo eliminar el movimiento.");
    return ok;
  }

  async function deleteFromHere(tx) {
    const ok = await truncateSeriesBefore(tx);
    if (!ok) toast.error("No se pudo eliminar el movimiento.");
    return ok;
  }

  /**
   * Editar una ocurrencia de una serie es delicado: según el alcance hay que
   * tocar el registro entero, esconder una fecha y crear un movimiento suelto,
   * o cortar la serie y abrir una nueva.
   */
  async function editMovement(tx, editedData, scope) {
    const fields = editableFieldsOf(editedData);
    const fail = () => {
      toast.error("No se pudieron guardar los cambios.");
      return false;
    };

    if (scope === "single" || !tx.is_recurring) {
      const { error } = await supabase
        .from("transactions")
        .update(fields)
        .eq("id", tx.originalId);
      if (error) return fail();
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.originalId ? { ...t, ...fields } : t)),
      );
      return true;
    }

    if (scope === "one") {
      // La ocurrencia editada se esconde de la serie y renace como suelta.
      if (!(await hideOccurrence(tx))) return fail();
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...fields, user_id: userId, is_recurring: false })
        .select();
      if (error || !data) return fail();
      setTransactions((prev) => [...prev, mapTransaction(data[0])]);
      return true;
    }

    if (scope === "forward") {
      if (!(await truncateSeriesBefore(tx))) return fail();
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...fields,
          ...recurrenceFieldsOf(editedData),
          user_id: userId,
          recurring_id: editedData.isRecurring ? uid() : null,
        })
        .select();
      if (error || !data) return fail();
      setTransactions((prev) => [...prev, mapTransaction(data[0])]);
      return true;
    }

    if (scope === "all") {
      const update = { ...fields, ...recurrenceFieldsOf(editedData) };
      const { error } = await supabase
        .from("transactions")
        .update(update)
        .eq("id", tx.originalId);
      if (error) return fail();
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.originalId ? { ...t, ...update } : t)),
      );
      return true;
    }

    return false;
  }

  return {
    transactions,
    savingsBoxes,
    creditCards,
    cardPayments,
    ready: {
      transactions: transactionsReady,
      savings: savingsReady,
      cards: cardsReady,
    },
    reload,
    savings: {
      add: addSavingsBox,
      edit: editSavingsBox,
      remove: deleteSavingsBox,
      toggleInBalance: toggleSavingsInBalance,
    },
    cards: {
      add: addCard,
      edit: editCard,
      remove: deleteCard,
      registerPayment,
      deletePayment,
    },
    movements: {
      add: addMovements,
      edit: editMovement,
      remove: deleteMovement,
      removeOccurrence: deleteOccurrence,
      removeFromHere: deleteFromHere,
    },
  };
}
