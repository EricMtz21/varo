"use client";

import { useState, useEffect } from "react";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
} from "./categoryConfig";

const CURRENCIES = ["MXN", "USD", "EUR", "CAD", "GBP"];

const FREQ_LABELS = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  yearly: "Anual",
};
const END_TYPE_LABELS = {
  never: "Nunca",
  date: "En fecha",
  occurrences: "N veces",
};
const MAX_BY_FREQ = { daily: 365, weekly: 156, biweekly: 78, monthly: 60, yearly: 20 };

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateRecurringDates(
  startDate,
  frequency,
  endType,
  endDate,
  occurrences,
) {
  const max =
    endType === "never"
      ? MAX_BY_FREQ[frequency]
      : endType === "occurrences"
        ? Math.min(Math.max(parseInt(occurrences) || 1, 1), 9999)
        : 9999;

  const dates = [];
  let current = new Date(startDate + "T12:00:00");
  const end = endDate ? new Date(endDate + "T23:59:59") : null;

  for (let i = 0; i < max; i++) {
    if (end && current > end) break;
    dates.push(current.toISOString().split("T")[0]);
    const next = new Date(current);
    if (frequency === "daily") next.setDate(next.getDate() + 1);
    else if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (frequency === "biweekly") next.setDate(next.getDate() + 15);
    else if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
    else if (frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
    current = next;
  }
  return dates;
}

// ─── Icons ─────────────────────────────────────────────────────────────────

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Shared styles ──────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#141D2E] border border-[#1E2D45] rounded-xl px-4 py-3 text-[#E2E8F0] text-sm outline-none focus:border-[#818CF8] transition-colors placeholder:text-[#3D5070]";
const selectCls =
  "bg-[#141D2E] border border-[#1E2D45] rounded-xl px-3 py-3 text-[#E2E8F0] text-sm outline-none focus:border-[#818CF8] transition-colors cursor-pointer";

function PillGroup({ options, value, onChange, activeClass }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
            value === key
              ? activeClass
              : "bg-[#141D2E] text-[#475569] border-[#1E2D45] hover:text-[#E2E8F0] hover:border-[#334155]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────

export default function AddTransactionModal({ onAdd, onClose }) {
  const d = new Date();
  const today = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");

  const [form, setForm] = useState({
    type: "expense",
    name: "",
    category: EXPENSE_CATEGORIES[0],
    amount: "",
    currency: "MXN",
    date: today,
    recurring: {
      enabled: false,
      frequency: "monthly",
      endType: "never",
      endDate: "",
      occurrences: "3",
    },
  });

  const [isExiting, setIsExiting] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  function handleClose() {
    setIsExiting(true);
    setTimeout(onClose, 260);
  }

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(type) {
    const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((f) => ({
      ...f,
      type,
      category: cats.includes(f.category) ? f.category : cats[0],
    }));
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setRecurring(key, value) {
    setForm((f) => ({ ...f, recurring: { ...f.recurring, [key]: value } }));
  }

  function previewCount() {
    const { enabled, frequency, endType, occurrences, endDate } =
      form.recurring;
    if (!enabled) return 1;
    if (endType === "occurrences")
      return Math.max(parseInt(occurrences) || 1, 1);
    if (endType === "date" && endDate && form.date) {
      const dates = generateRecurringDates(
        form.date,
        frequency,
        "date",
        endDate,
        0,
      );
      return dates.length;
    }
    return MAX_BY_FREQ[frequency];
  }

  function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0 || !form.date) return;

    onAdd([
      {
        type: form.type,
        name: form.name.trim(),
        category: form.category,
        amount,
        currency: form.currency,
        date: form.date,

        // Reglas de recurrencia
        isRecurring: form.recurring.enabled,
        recurringFrequency: form.recurring.enabled
          ? form.recurring.frequency
          : null,
        recurringEndType: form.recurring.enabled
          ? form.recurring.endType
          : null,
        recurringEndDate: form.recurring.enabled
          ? form.recurring.endDate
          : null,
        recurringOccurrences: form.recurring.enabled
          ? form.recurring.occurrences
          : null,
        recurringId: form.recurring.enabled ? uid() : null, // ID de grupo (opcional)
      },
    ]);
  }

  const isValid = form.name.trim() && parseFloat(form.amount) > 0 && form.date;
  const accentBg = form.type === "income" ? "#34D399" : "#F87171";
  const count = previewCount();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm ${isExiting ? "animate-fade-out" : "animate-fade-in"}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full sm:max-w-md bg-[#0C1220] border-t border-[#1E2D45] sm:border sm:rounded-2xl max-h-[92dvh] overflow-y-auto scrollbar-thin ${isExiting ? "animate-slide-down" : "animate-slide-up"}`}
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-[#1E2D45] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-[#E2E8F0]">
              Nuevo movimiento
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2537] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <XIcon />
            </button>
          </div>

          {/* Type toggle */}
          <div className="flex bg-[#141D2E] rounded-xl p-1 mb-5 border border-[#1E2D45]">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                form.type === "expense"
                  ? "bg-[#F87171] text-[#07090F] shadow-sm"
                  : "text-[#475569] hover:text-[#E2E8F0]"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                form.type === "income"
                  ? "bg-[#34D399] text-[#07090F] shadow-sm"
                  : "text-[#475569] hover:text-[#E2E8F0]"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del movimiento"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputCls}
              maxLength={60}
            />

            {/* Category picker */}
            <div>
              <p className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-2">
                Categoría
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {categories.map((cat) => {
                  const CatIcon = CATEGORY_ICONS[cat] ?? DEFAULT_ICON;
                  const color = CATEGORY_COLORS[cat] ?? "#64748B";
                  const selected = form.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setField("category", cat)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                        selected
                          ? "border-transparent"
                          : "bg-[#141D2E] text-[#475569] border-[#1E2D45] hover:text-[#CBD5E1] hover:bg-[#1A2537]"
                      }`}
                      style={
                        selected
                          ? {
                              backgroundColor: color + "22",
                              color,
                              borderColor: color + "55",
                            }
                          : {}
                      }
                    >
                      <CatIcon
                        size={18}
                        weight={selected ? "fill" : "regular"}
                      />
                      <span className="truncate w-full text-center leading-tight">
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <select
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
                className={selectCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Recurring section */}
          <div className="mt-5 pt-4 border-t border-[#1E2D45]">
            <button
              type="button"
              onClick={() => setRecurring("enabled", !form.recurring.enabled)}
              className="w-full flex items-center justify-between cursor-pointer group py-0.5"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-[#E2E8F0]">
                  Repetir movimiento
                </p>
                <p className="text-xs text-[#475569] mt-0.5">
                  {form.recurring.enabled
                    ? `${FREQ_LABELS[form.recurring.frequency]} · ${
                        form.recurring.endType === "never"
                          ? "Sin fin definido"
                          : form.recurring.endType === "date"
                            ? "Hasta una fecha"
                            : `${form.recurring.occurrences} veces`
                      }`
                    : "Solo una vez"}
                </p>
              </div>
              {/* Toggle switch */}
              <div
                className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ml-3 ${
                  form.recurring.enabled ? "bg-[#818CF8]" : "bg-[#1E2D45]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.recurring.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </button>

            {form.recurring.enabled && (
              <div className="mt-4 space-y-4">
                {/* Frequency */}
                <div>
                  <label className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-2 block">
                    Frecuencia
                  </label>
                  <PillGroup
                    options={Object.entries(FREQ_LABELS)}
                    value={form.recurring.frequency}
                    onChange={(v) => setRecurring("frequency", v)}
                    activeClass="bg-[#818CF8] text-[#07090F] border-transparent"
                  />
                </div>

                {/* End type */}
                <div>
                  <label className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-2 block">
                    Termina
                  </label>
                  <PillGroup
                    options={Object.entries(END_TYPE_LABELS)}
                    value={form.recurring.endType}
                    onChange={(v) => setRecurring("endType", v)}
                    activeClass="bg-[#818CF8] text-[#07090F] border-transparent"
                  />
                </div>

                {/* End date picker */}
                {form.recurring.endType === "date" && (
                  <input
                    type="date"
                    value={form.recurring.endDate}
                    min={form.date}
                    onChange={(e) => setRecurring("endDate", e.target.value)}
                    className={inputCls}
                  />
                )}

                {/* Occurrences */}
                {form.recurring.endType === "occurrences" && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#64748B] whitespace-nowrap">
                      Después de
                    </span>
                    <input
                      type="number"
                      min="2"
                      max="999"
                      value={form.recurring.occurrences}
                      onChange={(e) =>
                        setRecurring("occurrences", e.target.value)
                      }
                      className="w-24 bg-[#141D2E] border border-[#1E2D45] rounded-xl px-3 py-3 text-[#E2E8F0] text-sm text-center outline-none focus:border-[#818CF8] transition-colors"
                    />
                    <span className="text-sm text-[#64748B]">veces</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-4 rounded-xl font-bold text-sm mt-6 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{ backgroundColor: accentBg, color: "#07090F" }}
          >
            {form.recurring.enabled
              ? `Agregar movimiento${count !== 1 ? "s" : ""}`
              : "Agregar movimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}
