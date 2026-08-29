import {
  getOccurrencesInMonth,
  getOccurrencesUpToMonth,
  isoToDate,
  toLocalIso,
} from "./format";

// Fechas borradas de una serie recurrente, guardadas como texto en la BD.
function deletedDatesOf(tx) {
  return tx.deleted_dates ? tx.deleted_dates.split(",") : [];
}

/**
 * Convierte los movimientos guardados en las filas visibles de un mes: cada
 * ocurrencia de una serie recurrente se vuelve su propia fila, con un id
 * compuesto (`<id>_<fecha>`) y `originalId` apuntando al registro real.
 */
export function expandMonth(transactions, year, month) {
  const rows = [];
  transactions.forEach((tx) => {
    const deleted = deletedDatesOf(tx);
    getOccurrencesInMonth(tx, year, month).forEach((occurrence) => {
      if (deleted.includes(occurrence.dateStr)) return;
      rows.push({
        ...tx,
        startDate: tx.date,
        date: occurrence.dateStr,
        occurrenceIndex: occurrence.occurrenceIndex,
        totalOccurrences: occurrence.totalOccurrences,
        originalId: tx.id,
        id: `${tx.id}_${occurrence.dateStr}`,
      });
    });
  });
  return rows;
}

/** Saldo acumulado desde el principio hasta el final del mes indicado. */
export function runningBalance(transactions, year, month) {
  let sum = 0;
  transactions.forEach((tx) => {
    const deleted = deletedDatesOf(tx);
    getOccurrencesUpToMonth(tx, year, month).forEach((dateStr) => {
      if (deleted.includes(dateStr)) return;
      sum += tx.type === "income" ? tx.amount : -tx.amount;
    });
  });
  return sum;
}

// Quita acentos y mayúsculas para que "alimentacion" encuentre "Alimentación".
export function normalize(text) {
  return (text ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Filtra por nombre, categoría y nombre de la tarjeta enlazada. */
export function filterByQuery(rows, query, cardsById = {}) {
  const needle = normalize(query).trim();
  if (!needle) return rows;
  return rows.filter((tx) => {
    const card = cardsById[tx.credit_card_id];
    return normalize(
      `${tx.name} ${tx.category} ${card ? card.name : ""}`,
    ).includes(needle);
  });
}

/** Agrupa por fecha, de la más antigua a la más reciente. */
export function groupByDate(rows) {
  return [...rows]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .reduce((acc, tx) => {
      (acc[tx.date] ||= []).push(tx);
      return acc;
    }, {});
}

export function sumByType(rows, type) {
  return rows
    .filter((tx) => tx.type === type)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/** La moneda que más usa el usuario; es la que se muestra en los totales. */
export function dominantCurrency(transactions, fallback = "MXN") {
  if (!transactions.length) return fallback;
  const counts = transactions.reduce((acc, tx) => {
    acc[tx.currency] = (acc[tx.currency] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/** Día anterior en ISO. Se usa para cortar una serie "de aquí en adelante". */
export function previousDayIso(iso) {
  const date = isoToDate(iso);
  date.setDate(date.getDate() - 1);
  return toLocalIso(date);
}

/** Avanza o retrocede meses cuidando el cambio de año. */
export function shiftMonth(year, month, delta) {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}
