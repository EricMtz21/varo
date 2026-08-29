import { describe, it, expect } from "vitest";
import {
  dominantCurrency,
  expandMonth,
  filterByQuery,
  groupByDate,
  normalize,
  previousDayIso,
  runningBalance,
  shiftMonth,
  sumByType,
} from "./transactions";

const gasto = (over = {}) => ({
  id: "t1",
  type: "expense",
  name: "Café",
  category: "Alimentación",
  amount: 50,
  currency: "MXN",
  date: "2026-03-10",
  ...over,
});

describe("expandMonth", () => {
  it("da una fila por ocurrencia, con id compuesto y originalId", () => {
    const rows = expandMonth([gasto()], 2026, 2);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "t1_2026-03-10",
      originalId: "t1",
      startDate: "2026-03-10",
      date: "2026-03-10",
    });
  });

  it("expande una serie recurrente en varias filas", () => {
    const rows = expandMonth(
      [
        gasto({
          date: "2026-03-02",
          is_recurring: true,
          recurring_frequency: "weekly",
          recurring_end_type: "never",
        }),
      ],
      2026,
      2,
    );
    expect(rows.map((r) => r.date)).toEqual([
      "2026-03-02",
      "2026-03-09",
      "2026-03-16",
      "2026-03-23",
      "2026-03-30",
    ]);
  });

  it("omite las ocurrencias borradas", () => {
    const rows = expandMonth(
      [
        gasto({
          date: "2026-03-02",
          is_recurring: true,
          recurring_frequency: "weekly",
          recurring_end_type: "never",
          deleted_dates: "2026-03-09,2026-03-23",
        }),
      ],
      2026,
      2,
    );
    expect(rows.map((r) => r.date)).toEqual([
      "2026-03-02",
      "2026-03-16",
      "2026-03-30",
    ]);
  });

  it("ignora lo que no cae en el mes", () => {
    expect(expandMonth([gasto()], 2026, 3)).toEqual([]);
  });
});

describe("runningBalance", () => {
  it("resta gastos y suma ingresos de todo lo anterior", () => {
    const movimientos = [
      gasto({ id: "a", amount: 100, date: "2026-01-05" }),
      gasto({ id: "b", type: "income", amount: 500, date: "2026-02-01" }),
      gasto({ id: "c", amount: 30, date: "2026-03-20" }),
    ];
    expect(runningBalance(movimientos, 2026, 1)).toBe(400);
    expect(runningBalance(movimientos, 2026, 2)).toBe(370);
  });

  it("no cuenta las ocurrencias borradas", () => {
    const serie = gasto({
      amount: 10,
      date: "2026-01-01",
      is_recurring: true,
      recurring_frequency: "monthly",
      recurring_end_type: "never",
      deleted_dates: "2026-02-01",
    });
    // Enero y marzo cuentan; febrero está borrado.
    expect(runningBalance([serie], 2026, 2)).toBe(-20);
  });
});

describe("normalize y filterByQuery", () => {
  const filas = [
    gasto({ id: "1", name: "Café", category: "Alimentación" }),
    gasto({ id: "2", name: "Uber", category: "Transporte" }),
    gasto({ id: "3", name: "Cine", category: "Entretenimiento", credit_card_id: "c1" }),
  ];
  const tarjetas = { c1: { id: "c1", name: "Nu Crédito" } };

  it("ignora acentos y mayúsculas", () => {
    expect(normalize("Alimentación")).toBe("alimentacion");
  });

  it("busca por nombre", () => {
    expect(filterByQuery(filas, "uber", tarjetas).map((f) => f.id)).toEqual(["2"]);
  });

  it("busca por categoría sin acentos", () => {
    expect(filterByQuery(filas, "alimentacion", tarjetas).map((f) => f.id)).toEqual(["1"]);
  });

  it("busca por nombre de la tarjeta", () => {
    expect(filterByQuery(filas, "nu credito", tarjetas).map((f) => f.id)).toEqual(["3"]);
  });

  it("una búsqueda vacía devuelve todo", () => {
    expect(filterByQuery(filas, "   ", tarjetas)).toHaveLength(3);
  });
});

describe("groupByDate", () => {
  it("agrupa por fecha en orden ascendente", () => {
    const filas = [
      gasto({ id: "1", date: "2026-03-20" }),
      gasto({ id: "2", date: "2026-03-01" }),
      gasto({ id: "3", date: "2026-03-20" }),
    ];
    const grupos = groupByDate(filas);
    expect(Object.keys(grupos)).toEqual(["2026-03-01", "2026-03-20"]);
    expect(grupos["2026-03-20"].map((f) => f.id)).toEqual(["1", "3"]);
  });
});

describe("sumByType", () => {
  it("suma solo el tipo pedido", () => {
    const filas = [
      gasto({ amount: 10 }),
      gasto({ amount: 40 }),
      gasto({ type: "income", amount: 100 }),
    ];
    expect(sumByType(filas, "expense")).toBe(50);
    expect(sumByType(filas, "income")).toBe(100);
  });
});

describe("dominantCurrency", () => {
  it("devuelve la moneda más repetida", () => {
    const filas = [
      gasto({ currency: "USD" }),
      gasto({ currency: "MXN" }),
      gasto({ currency: "MXN" }),
    ];
    expect(dominantCurrency(filas)).toBe("MXN");
  });

  it("sin movimientos usa el respaldo", () => {
    expect(dominantCurrency([])).toBe("MXN");
  });
});

describe("previousDayIso", () => {
  it("retrocede un día", () => {
    expect(previousDayIso("2026-03-10")).toBe("2026-03-09");
  });

  it("cruza inicio de mes y de año", () => {
    expect(previousDayIso("2026-03-01")).toBe("2026-02-28");
    expect(previousDayIso("2026-01-01")).toBe("2025-12-31");
  });
});

describe("shiftMonth", () => {
  it("avanza y retrocede dentro del año", () => {
    expect(shiftMonth(2026, 5, 1)).toEqual({ year: 2026, month: 6 });
    expect(shiftMonth(2026, 5, -1)).toEqual({ year: 2026, month: 4 });
  });

  it("cruza el cambio de año en ambos sentidos", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });

  it("aguanta saltos de más de un año", () => {
    expect(shiftMonth(2026, 0, -13)).toEqual({ year: 2024, month: 11 });
  });
});
