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

export function getOccurrencesInMonth(tx, year, month) {
  if (!tx.is_recurring && !tx.isRecurring) {
    const d = new Date(tx.date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) return [{ dateStr: tx.date, occurrenceIndex: 1, totalOccurrences: 1 }];
    return [];
  }

  const dates = [];
  let current = new Date(tx.date + "T12:00:00");
  const endDateStr = tx.recurring_end_date || tx.recurringEndDate;
  const endType = tx.recurring_end_type || tx.recurringEndType;
  const occrs = tx.recurring_occurrences || tx.recurringOccurrences;
  const freq = tx.recurring_frequency || tx.recurringFrequency;

  const end = endDateStr && endType === 'date' ? new Date(endDateStr + "T23:59:59") : null;
  const maxOccurrences = endType === 'occurrences' ? parseInt(occrs) : null;
  
  let occurrencesCount = 0;

  while (true) {
    if (end && current > end) break;
    if (maxOccurrences && occurrencesCount >= maxOccurrences) break;

    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();
    
    // Stop if we bypassed the target view
    if (currentYear > year || (currentYear === year && currentMonth > month)) {
      break;
    }

    if (currentYear === year && currentMonth === month) {
      dates.push({
        dateStr: current.toISOString().split("T")[0],
        occurrenceIndex: occurrencesCount + 1,
        totalOccurrences: maxOccurrences
      });
    }

    occurrencesCount++;
    const next = new Date(current);
    if (freq === "daily") next.setDate(next.getDate() + 1);
    else if (freq === "weekly") next.setDate(next.getDate() + 7);
    else if (freq === "biweekly") next.setDate(next.getDate() + 15);
    else if (freq === "monthly") next.setMonth(next.getMonth() + 1);
    else if (freq === "yearly") next.setFullYear(next.getFullYear() + 1);
    else break; // Fallback

    current = next;
  }

  return dates;
}

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

export function getOccurrencesUpToMonth(tx, year, month) {
  if (!tx.is_recurring && !tx.isRecurring) {
    const d = new Date(tx.date + "T12:00:00");
    if (d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() <= month)) return [tx.date];
    return [];
  }

  const dates = [];
  let current = new Date(tx.date + "T12:00:00");
  const endDateStr = tx.recurring_end_date || tx.recurringEndDate;
  const endType = tx.recurring_end_type || tx.recurringEndType;
  const occrs = tx.recurring_occurrences || tx.recurringOccurrences;
  const freq = tx.recurring_frequency || tx.recurringFrequency;

  const end = endDateStr && endType === 'date' ? new Date(endDateStr + "T23:59:59") : null;
  const maxOccurrences = endType === 'occurrences' ? parseInt(occrs) : null;
  
  let occurrencesCount = 0;

  while (true) {
    if (end && current > end) break;
    if (maxOccurrences && occurrencesCount >= maxOccurrences) break;

    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();
    
    if (currentYear > year || (currentYear === year && currentMonth > month)) {
      break;
    }

    dates.push(current.toISOString().split("T")[0]);

    occurrencesCount++;
    const next = new Date(current);
    if (freq === "daily") next.setDate(next.getDate() + 1);
    else if (freq === "weekly") next.setDate(next.getDate() + 7);
    else if (freq === "biweekly") next.setDate(next.getDate() + 15);
    else if (freq === "monthly") next.setMonth(next.getMonth() + 1);
    else if (freq === "yearly") next.setFullYear(next.getFullYear() + 1);
    else break; // Fallback

    current = next;
  }

  return dates;
}
