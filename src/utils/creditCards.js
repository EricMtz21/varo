import {
  clampedDate,
  getOccurrencesInRange,
  isoToDate,
  toLocalIso,
} from "./format";

export { ACCENT_COLORS as CARD_COLORS } from "./constants";

export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

/**
 * Periodo de corte de una tarjeta.
 * offset 0 = periodo abierto (el que se está acumulando ahora),
 * offset -1 = periodo ya cortado (el que toca pagar).
 * El día de corte abre el periodo nuevo: lo que se gasta ese día ya cuenta
 * para el siguiente corte. Con corte 18, el periodo va del 18 al 17.
 * `cutoff` es el día en que este periodo corta, o sea el arranque del que sigue.
 */
export function getStatementPeriod(cutoffDay, ref = new Date(), offset = 0) {
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  let startMonth = today.getMonth();
  if (today < clampedDate(today.getFullYear(), startMonth, cutoffDay)) startMonth -= 1;
  startMonth += offset;

  const start = clampedDate(today.getFullYear(), startMonth, cutoffDay);
  const cutoff = clampedDate(today.getFullYear(), startMonth + 1, cutoffDay);
  const end = new Date(cutoff);
  end.setDate(end.getDate() - 1);

  return {
    start: toLocalIso(start),
    end: toLocalIso(end),
    cutoff: toLocalIso(cutoff),
  };
}

// Primera fecha de pago posterior a la fecha de corte dada.
export function getPaymentDate(paymentDay, cutoffIso) {
  if (!paymentDay) return null;
  const cutoff = isoToDate(cutoffIso);
  let payment = clampedDate(cutoff.getFullYear(), cutoff.getMonth(), paymentDay);
  if (payment <= cutoff) {
    payment = clampedDate(cutoff.getFullYear(), cutoff.getMonth() + 1, paymentDay);
  }
  return toLocalIso(payment);
}

export function daysUntil(iso, ref = new Date()) {
  if (!iso) return null;
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  return Math.round((isoToDate(iso) - today) / 86400000);
}

export function formatShortDate(iso) {
  if (!iso) return "";
  return isoToDate(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export function formatDayLabel(day) {
  return day === 1 ? "el 1" : `el ${day}`;
}

// Texto tipo "corta hoy" / "corta en 3 días" / "cortó hace 2 días".
export function relativeDayLabel(iso, verbs, ref = new Date()) {
  const days = daysUntil(iso, ref);
  if (days === null) return "";
  if (days === 0) return `${verbs.present} hoy`;
  if (days === 1) return `${verbs.future} mañana`;
  if (days > 1) return `${verbs.future} en ${days} días`;
  if (days === -1) return `${verbs.past} ayer`;
  return `${verbs.past} hace ${Math.abs(days)} días`;
}

function linkedExpenses(cardId, transactions) {
  return transactions.filter(
    (t) => t.credit_card_id === cardId && t.type === "expense",
  );
}

/**
 * Cuánto se debe en una tarjeta según los movimientos enlazados.
 *  current     → cargos del periodo abierto (lo que caerá en el próximo corte)
 *  previous    → cargos del último periodo cortado
 *  total       → todos los cargos históricos hasta el corte actual
 *  paid        → suma de los pagos registrados
 *  outstanding → lo que realmente debes hoy: todo lo ya cortado menos los
 *                pagos. Negativo significa saldo a favor.
 */
export function getCardTotals(
  card,
  transactions,
  ref = new Date(),
  payments = [],
) {
  const linked = linkedExpenses(card.id, transactions);
  const period = getStatementPeriod(card.cutoffDay, ref, 0);
  const previousPeriod = getStatementPeriod(card.cutoffDay, ref, -1);

  const sumRange = (startIso, endIso) =>
    linked.reduce(
      (sum, tx) =>
        sum + getOccurrencesInRange(tx, startIso, endIso).length * tx.amount,
      0,
    );

  const countRange = (startIso, endIso) =>
    linked.reduce(
      (n, tx) => n + getOccurrencesInRange(tx, startIso, endIso).length,
      0,
    );

  const paid = payments
    .filter((p) => p.credit_card_id === card.id)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const chargedUpToLastCutoff = sumRange("0001-01-01", previousPeriod.end);

  return {
    period,
    previousPeriod,
    current: sumRange(period.start, period.end),
    previous: sumRange(previousPeriod.start, previousPeriod.end),
    total: sumRange("0001-01-01", period.end),
    currentCount: countRange(period.start, period.end),
    paid,
    outstanding: chargedUpToLastCutoff - paid,
    paymentDate: getPaymentDate(card.paymentDay, period.cutoff),
    previousPaymentDate: getPaymentDate(card.paymentDay, previousPeriod.cutoff),
  };
}

// Pagos de una tarjeta dentro de un rango, del más reciente al más antiguo.
export function getCardPayments(cardId, payments, startIso, endIso) {
  return payments
    .filter(
      (p) =>
        p.credit_card_id === cardId && p.date >= startIso && p.date <= endIso,
    )
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Movimientos enlazados dentro de un rango, ya expandidos por recurrencia y
// ordenados del más reciente al más antiguo.
export function getCardMovements(cardId, transactions, startIso, endIso) {
  const rows = [];
  linkedExpenses(cardId, transactions).forEach((tx) => {
    getOccurrencesInRange(tx, startIso, endIso).forEach((dateStr) => {
      rows.push({ ...tx, date: dateStr, id: `${tx.id}_${dateStr}` });
    });
  });
  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Iniciales para la insignia de color de la tarjeta: "Nu Crédito" → "NC".
export function cardInitials(name) {
  const clean = (name ?? "").trim();
  if (!clean) return "??";
  const words = clean.split(/\s+/);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}
