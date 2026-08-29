import { describe, it, expect } from "vitest";
import {
  daysUntil,
  getCardMovements,
  getCardTotals,
  getPaymentDate,
  getStatementPeriod,
  relativeDayLabel,
} from "./creditCards";

// Todas las pruebas fijan "hoy" para que no dependan del día en que se corran.
const HOY = new Date(2026, 7, 28); // 28 de agosto de 2026

describe("getStatementPeriod", () => {
  it("calcula el periodo abierto", () => {
    expect(getStatementPeriod(15, HOY, 0)).toEqual({
      start: "2026-08-16",
      end: "2026-09-15",
    });
  });

  it("calcula el periodo ya cortado", () => {
    expect(getStatementPeriod(15, HOY, -1)).toEqual({
      start: "2026-07-16",
      end: "2026-08-15",
    });
  });

  it("el día de corte pertenece al periodo que cierra", () => {
    expect(getStatementPeriod(28, HOY, 0)).toEqual({
      start: "2026-07-29",
      end: "2026-08-28",
    });
  });

  it("si el corte de este mes ya pasó, el periodo cierra el mes que viene", () => {
    expect(getStatementPeriod(27, HOY, 0)).toEqual({
      start: "2026-08-28",
      end: "2026-09-27",
    });
  });

  it("un corte 31 cae al último día en los meses cortos", () => {
    expect(getStatementPeriod(31, new Date(2027, 1, 10), 0)).toEqual({
      start: "2027-02-01",
      end: "2027-02-28",
    });
    expect(getStatementPeriod(31, new Date(2027, 2, 10), 0)).toEqual({
      start: "2027-03-01",
      end: "2027-03-31",
    });
  });

  it("cruza el cambio de año sin romperse", () => {
    expect(getStatementPeriod(5, new Date(2027, 0, 3), 0)).toEqual({
      start: "2026-12-06",
      end: "2027-01-05",
    });
  });
});

describe("getPaymentDate", () => {
  it("busca el día de pago posterior al corte", () => {
    expect(getPaymentDate(5, "2026-09-15")).toBe("2026-10-05");
    expect(getPaymentDate(20, "2026-09-15")).toBe("2026-09-20");
  });

  it("recorta el día de pago en meses cortos", () => {
    expect(getPaymentDate(31, "2027-01-31")).toBe("2027-02-28");
  });

  it("sin día de pago devuelve null", () => {
    expect(getPaymentDate(null, "2026-09-15")).toBeNull();
  });
});

describe("daysUntil y relativeDayLabel", () => {
  const verbos = { present: "corta", future: "corta", past: "cortó" };

  it("cuenta los días que faltan", () => {
    expect(daysUntil("2026-09-15", HOY)).toBe(18);
    expect(daysUntil("2026-08-26", HOY)).toBe(-2);
  });

  it("redacta el futuro, el presente y el pasado", () => {
    expect(relativeDayLabel("2026-08-28", verbos, HOY)).toBe("corta hoy");
    expect(relativeDayLabel("2026-08-29", verbos, HOY)).toBe("corta mañana");
    expect(relativeDayLabel("2026-09-15", verbos, HOY)).toBe("corta en 18 días");
    expect(relativeDayLabel("2026-08-27", verbos, HOY)).toBe("cortó ayer");
    expect(relativeDayLabel("2026-08-20", verbos, HOY)).toBe("cortó hace 8 días");
  });
});

describe("getCardTotals", () => {
  const tarjeta = { id: "c1", cutoffDay: 15, paymentDay: 5 };

  // Periodo abierto: 16 ago – 15 sep. Periodo cortado: 16 jul – 15 ago.
  const movimientos = [
    // Gasto suelto dentro del periodo abierto.
    { id: "t1", credit_card_id: "c1", type: "expense", amount: 1000, date: "2026-08-20" },
    // Gasto suelto del periodo ya cortado.
    { id: "t2", credit_card_id: "c1", type: "expense", amount: 500, date: "2026-08-01" },
    // Recurrente mensual desde mayo: cae una vez por periodo.
    {
      id: "t3",
      credit_card_id: "c1",
      type: "expense",
      amount: 200,
      date: "2026-05-18",
      is_recurring: true,
      recurring_frequency: "monthly",
      recurring_end_type: "never",
    },
    // Ruido que NO debe contar:
    { id: "t4", credit_card_id: "c2", type: "expense", amount: 9999, date: "2026-08-20" },
    { id: "t5", credit_card_id: "c1", type: "income", amount: 7777, date: "2026-08-20" },
    { id: "t6", credit_card_id: null, type: "expense", amount: 4444, date: "2026-08-20" },
    // Semanal de 4 repeticiones con una ocurrencia borrada.
    {
      id: "t7",
      credit_card_id: "c1",
      type: "expense",
      amount: 300,
      date: "2026-08-18",
      is_recurring: true,
      recurring_frequency: "weekly",
      recurring_end_type: "occurrences",
      recurring_occurrences: 4,
      deleted_dates: "2026-08-25",
    },
  ];

  const totales = getCardTotals(tarjeta, movimientos, HOY);

  it("suma los cargos del periodo abierto", () => {
    // 1000 (t1) + 200 (t3 del 18 ago) + 900 (t7: 3 de 4, una borrada)
    expect(totales.current).toBe(2100);
    expect(totales.currentCount).toBe(5);
  });

  it("suma los cargos del periodo ya cortado", () => {
    // 500 (t2) + 200 (t3 del 18 jul)
    expect(totales.previous).toBe(700);
  });

  it("acumula el histórico completo", () => {
    // 1000 + 500 + 800 (t3 de mayo a agosto) + 900 (t7)
    expect(totales.total).toBe(3200);
  });

  it("ignora ingresos, movimientos sin tarjeta y de otras tarjetas", () => {
    const soloRuido = getCardTotals(tarjeta, movimientos.slice(3, 6), HOY);
    expect(soloRuido.current).toBe(0);
    expect(soloRuido.total).toBe(0);
  });

  it("expone la fecha límite de pago del corte anterior", () => {
    expect(totales.previousPaymentDate).toBe("2026-09-05");
  });

  it("una tarjeta sin movimientos queda en ceros", () => {
    expect(getCardTotals(tarjeta, [], HOY)).toMatchObject({
      current: 0,
      previous: 0,
      total: 0,
      currentCount: 0,
    });
  });
});

describe("getCardMovements", () => {
  const movimientos = [
    { id: "a", credit_card_id: "c1", type: "expense", amount: 100, date: "2026-08-20" },
    { id: "b", credit_card_id: "c1", type: "expense", amount: 200, date: "2026-09-01" },
    { id: "c", credit_card_id: "c2", type: "expense", amount: 300, date: "2026-08-22" },
  ];

  it("devuelve los movimientos del rango, del más reciente al más viejo", () => {
    const rows = getCardMovements("c1", movimientos, "2026-08-16", "2026-09-15");
    expect(rows.map((r) => r.date)).toEqual(["2026-09-01", "2026-08-20"]);
  });

  it("expande los recurrentes en filas con id único", () => {
    const recurrente = [
      {
        id: "r",
        credit_card_id: "c1",
        type: "expense",
        amount: 50,
        date: "2026-08-18",
        is_recurring: true,
        recurring_frequency: "weekly",
        recurring_end_type: "never",
      },
    ];
    const rows = getCardMovements("c1", recurrente, "2026-08-16", "2026-09-01");
    expect(rows.map((r) => r.id)).toEqual([
      "r_2026-09-01",
      "r_2026-08-25",
      "r_2026-08-18",
    ]);
  });
});
