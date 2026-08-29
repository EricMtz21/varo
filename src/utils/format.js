import { MONTHS } from "./constants";

export function formatAmount(amount, currency = "MXN") {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}

// ─── Fechas ─────────────────────────────────────────────────────────────────

// Fecha local en ISO (YYYY-MM-DD). Nunca uses toISOString() para esto: convierte
// a UTC y puede correr el día según la zona horaria.
export function toLocalIso(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function todayIso() {
  return toLocalIso(new Date());
}

export function isoToDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Fecha del día `day` en (year, month) recortada al último día real del mes:
// el "31" de febrero es el 28 (o 29). `month` puede desbordarse; Date normaliza.
export function clampedDate(year, month, day) {
  const base = new Date(year, month, 1);
  const y = base.getFullYear();
  const m = base.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(day, lastDay));
}

export function formatDateHeader(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return `${dayNames[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

// ─── Recurrencia ────────────────────────────────────────────────────────────

/**
 * Fecha de la ocurrencia número `index` (0 = la primera), calculada SIEMPRE
 * desde la fecha de inicio y no sumando paso a paso.
 *
 * Esto es lo que evita el desfase: sumar un mes a "31 de enero" da 3 de marzo,
 * y a partir de ahí la serie entera se queda en el día 3. Calculando desde el
 * origen, un cargo del 31 cae 31 ene, 28 feb, 31 mar… y siempre vuelve al 31.
 */
export function occurrenceIso(startIso, frequency, index) {
  const [year, month, day] = startIso.split("-").map(Number);
  const monthIndex = month - 1;

  if (frequency === "monthly") {
    return toLocalIso(clampedDate(year, monthIndex + index, day));
  }
  if (frequency === "yearly") {
    return toLocalIso(clampedDate(year + index, monthIndex, day));
  }

  const stepDays = { daily: 1, weekly: 7, biweekly: 15 }[frequency];
  if (!stepDays) return null;
  return toLocalIso(new Date(year, monthIndex, day + stepDays * index));
}

/**
 * Todas las ocurrencias de un movimiento desde su fecha de inicio hasta
 * `untilIso` inclusive, respetando la condición de fin de la serie.
 * No filtra las fechas borradas: cada quien decide si las quiere.
 */
export function listOccurrences(tx, untilIso) {
  const isRecurring = tx.is_recurring || tx.isRecurring;
  if (!isRecurring) {
    return tx.date <= untilIso
      ? [{ dateStr: tx.date, occurrenceIndex: 1, totalOccurrences: 1 }]
      : [];
  }

  const endDateStr = tx.recurring_end_date || tx.recurringEndDate;
  const endType = tx.recurring_end_type || tx.recurringEndType;
  const occrs = tx.recurring_occurrences || tx.recurringOccurrences;
  const frequency = tx.recurring_frequency || tx.recurringFrequency;

  const seriesEnd = endType === "date" && endDateStr ? endDateStr : null;
  const maxOccurrences = endType === "occurrences" ? parseInt(occrs) : null;

  const results = [];
  // Tope duro: protege de un bucle infinito si la frecuencia llega corrupta.
  for (let index = 0; index < 5000; index++) {
    if (maxOccurrences && index >= maxOccurrences) break;

    const dateStr = occurrenceIso(tx.date, frequency, index);
    if (!dateStr) break;
    if (seriesEnd && dateStr > seriesEnd) break;
    if (dateStr > untilIso) break;

    results.push({
      dateStr,
      occurrenceIndex: index + 1,
      totalOccurrences: maxOccurrences,
    });
  }
  return results;
}

function lastDayOfMonthIso(year, month) {
  return toLocalIso(new Date(year, month + 1, 0));
}

export function getOccurrencesInMonth(tx, year, month) {
  const firstDay = toLocalIso(new Date(year, month, 1));
  return listOccurrences(tx, lastDayOfMonthIso(year, month)).filter(
    (o) => o.dateStr >= firstDay,
  );
}

export function getOccurrencesUpToMonth(tx, year, month) {
  return listOccurrences(tx, lastDayOfMonthIso(year, month)).map(
    (o) => o.dateStr,
  );
}

/**
 * Ocurrencias dentro de un rango de fechas arbitrario. A diferencia de
 * getOccurrencesInMonth, el rango no está atado a un mes calendario: los
 * periodos de corte de una tarjeta cruzan meses (ej. 16 ago – 15 sep).
 * Aquí sí se descartan las fechas borradas.
 */
export function getOccurrencesInRange(tx, startIso, endIso) {
  const deleted = tx.deleted_dates ? tx.deleted_dates.split(",") : [];
  return listOccurrences(tx, endIso)
    .filter((o) => o.dateStr >= startIso && !deleted.includes(o.dateStr))
    .map((o) => o.dateStr);
}

// ─── Cajas de ahorro ────────────────────────────────────────────────────────

export function calcStats(box) {
  const primaryParam = parseFloat(box.rate) / 100;
  const dailyPrimaryRate = primaryParam / 365;

  const secondaryParam = box.secondaryRate
    ? parseFloat(box.secondaryRate) / 100
    : primaryParam;
  const dailySecondaryRate = secondaryParam / 365;

  const threshold = box.limitAmount ? parseFloat(box.limitAmount) : Infinity;

  const start = new Date(box.startDate + "T00:00:00");
  const now = new Date();

  const totalDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
  const fullDays = Math.floor(totalDays);

  let currentBalance = parseFloat(box.initialAmount);
  let todayEarnings = 0;

  for (let i = 0; i <= fullDays; i++) {
    let dayInterest = 0;
    if (currentBalance <= threshold) {
      dayInterest = currentBalance * dailyPrimaryRate;
    } else {
      dayInterest =
        threshold * dailyPrimaryRate +
        (currentBalance - threshold) * dailySecondaryRate;
    }

    if (i === fullDays) {
      todayEarnings = dayInterest;
    } else {
      currentBalance += dayInterest;
    }
  }

  const totalEarned = currentBalance - box.initialAmount;
  return { currentBalance, totalEarned, todayEarnings };
}
