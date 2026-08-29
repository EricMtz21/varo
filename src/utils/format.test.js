import { describe, it, expect } from "vitest";
import {
  clampedDate,
  getOccurrencesInMonth,
  getOccurrencesInRange,
  getOccurrencesUpToMonth,
  listOccurrences,
  occurrenceIso,
  toLocalIso,
} from "./format";

// Atajo para armar un movimiento recurrente sin repetir campos en cada prueba.
function recurring(date, frequency, extra = {}) {
  return {
    date,
    is_recurring: true,
    recurring_frequency: frequency,
    recurring_end_type: "never",
    ...extra,
  };
}

describe("toLocalIso", () => {
  it("usa la fecha local, no UTC", () => {
    // 1 de enero a las 20:00 locales: en UTC ya sería día 2 en México.
    expect(toLocalIso(new Date(2026, 0, 1, 20, 0))).toBe("2026-01-01");
  });
});

describe("clampedDate", () => {
  it("recorta el día al último del mes", () => {
    expect(toLocalIso(clampedDate(2026, 1, 31))).toBe("2026-02-28");
  });

  it("respeta los años bisiestos", () => {
    expect(toLocalIso(clampedDate(2028, 1, 31))).toBe("2028-02-29");
  });

  it("normaliza meses desbordados", () => {
    expect(toLocalIso(clampedDate(2026, 12, 5))).toBe("2027-01-05");
    expect(toLocalIso(clampedDate(2026, -1, 5))).toBe("2025-12-05");
  });
});

describe("occurrenceIso", () => {
  it("mensual: un cargo del 31 no se desfasa nunca", () => {
    // Éste era el bug: sumar un mes a "31 ene" daba 3 de marzo y la serie
    // entera se quedaba en el día 3.
    const dates = [0, 1, 2, 3, 4].map((i) =>
      occurrenceIso("2026-01-31", "monthly", i),
    );
    expect(dates).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
      "2026-05-31",
    ]);
  });

  it("mensual: el día 15 es estable", () => {
    expect(occurrenceIso("2026-01-15", "monthly", 13)).toBe("2027-02-15");
  });

  it("anual: el 29 de febrero cae al 28 en los años no bisiestos", () => {
    expect(occurrenceIso("2028-02-29", "yearly", 0)).toBe("2028-02-29");
    expect(occurrenceIso("2028-02-29", "yearly", 1)).toBe("2029-02-28");
    expect(occurrenceIso("2028-02-29", "yearly", 4)).toBe("2032-02-29");
  });

  it("diario, semanal y quincenal avanzan en días fijos", () => {
    expect(occurrenceIso("2026-01-30", "daily", 3)).toBe("2026-02-02");
    expect(occurrenceIso("2026-01-01", "weekly", 2)).toBe("2026-01-15");
    expect(occurrenceIso("2026-01-01", "biweekly", 2)).toBe("2026-01-31");
  });

  it("devuelve null si la frecuencia no existe", () => {
    expect(occurrenceIso("2026-01-01", "cada rato", 1)).toBeNull();
  });
});

describe("listOccurrences", () => {
  it("un movimiento único solo aparece si ya ocurrió", () => {
    const tx = { date: "2026-03-10" };
    expect(listOccurrences(tx, "2026-03-31")).toEqual([
      { dateStr: "2026-03-10", occurrenceIndex: 1, totalOccurrences: 1 },
    ]);
    expect(listOccurrences(tx, "2026-03-09")).toEqual([]);
  });

  it("corta la serie en la fecha de fin", () => {
    const tx = recurring("2026-01-05", "monthly", {
      recurring_end_type: "date",
      recurring_end_date: "2026-03-31",
    });
    expect(listOccurrences(tx, "2026-12-31").map((o) => o.dateStr)).toEqual([
      "2026-01-05",
      "2026-02-05",
      "2026-03-05",
    ]);
  });

  it("corta la serie al número de repeticiones y numera cada una", () => {
    const tx = recurring("2026-01-05", "monthly", {
      recurring_end_type: "occurrences",
      recurring_occurrences: 3,
    });
    expect(listOccurrences(tx, "2026-12-31")).toEqual([
      { dateStr: "2026-01-05", occurrenceIndex: 1, totalOccurrences: 3 },
      { dateStr: "2026-02-05", occurrenceIndex: 2, totalOccurrences: 3 },
      { dateStr: "2026-03-05", occurrenceIndex: 3, totalOccurrences: 3 },
    ]);
  });

  it("una serie sin fin se detiene en el límite que le pidas", () => {
    const tx = recurring("2026-01-01", "daily");
    expect(listOccurrences(tx, "2026-01-10")).toHaveLength(10);
  });
});

describe("getOccurrencesInMonth", () => {
  it("solo devuelve lo que cae dentro del mes", () => {
    const tx = recurring("2026-01-31", "monthly");
    expect(getOccurrencesInMonth(tx, 2026, 1).map((o) => o.dateStr)).toEqual([
      "2026-02-28",
    ]);
  });

  it("un mes sin ocurrencias devuelve vacío", () => {
    const tx = { date: "2026-01-10" };
    expect(getOccurrencesInMonth(tx, 2026, 1)).toEqual([]);
  });

  it("incluye varias ocurrencias del mismo mes", () => {
    const tx = recurring("2026-03-02", "weekly");
    expect(getOccurrencesInMonth(tx, 2026, 2).map((o) => o.dateStr)).toEqual([
      "2026-03-02",
      "2026-03-09",
      "2026-03-16",
      "2026-03-23",
      "2026-03-30",
    ]);
  });
});

describe("getOccurrencesUpToMonth", () => {
  it("acumula todo lo anterior al mes indicado, inclusive", () => {
    const tx = recurring("2026-01-15", "monthly");
    expect(getOccurrencesUpToMonth(tx, 2026, 2)).toEqual([
      "2026-01-15",
      "2026-02-15",
      "2026-03-15",
    ]);
  });
});

describe("getOccurrencesInRange", () => {
  it("respeta ambos extremos del rango", () => {
    const tx = recurring("2026-01-01", "weekly");
    expect(getOccurrencesInRange(tx, "2026-01-08", "2026-01-22")).toEqual([
      "2026-01-08",
      "2026-01-15",
      "2026-01-22",
    ]);
  });

  it("descarta las ocurrencias borradas", () => {
    const tx = recurring("2026-01-01", "weekly", {
      deleted_dates: "2026-01-08,2026-01-22",
    });
    expect(getOccurrencesInRange(tx, "2026-01-01", "2026-01-29")).toEqual([
      "2026-01-01",
      "2026-01-15",
      "2026-01-29",
    ]);
  });

  it("un movimiento único fuera del rango no aparece", () => {
    const tx = { date: "2026-05-02" };
    expect(getOccurrencesInRange(tx, "2026-01-01", "2026-04-30")).toEqual([]);
  });
});
