"use client";

import { useState, useEffect } from "react";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
} from "./categoryConfig";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useModalMotion } from "@/hooks/useModalMotion";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";

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

// ─── Shared field style helpers ─────────────────────────────────────────────

const inputCls =
  "h-12 rounded-md border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground transition-colors px-4";

const triggerCls =
  "h-12 data-[size=default]:h-12 rounded-md border-border bg-muted text-foreground text-sm w-full px-4 justify-between focus:ring-0 focus-visible:ring-0 focus:border-foreground";

function PillGroup({ options, value, onChange, activeClass }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
            value === key
              ? activeClass
              : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
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

  const { backdropRef, panelRef, requestClose } = useModalMotion("sheet");
  const recurringRef = useRevealOnMount();

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  function handleClose() {
    requestClose(onClose);
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
        recurringId: form.recurring.enabled ? uid() : null,
      },
    ]);
  }

  const isValid = form.name.trim() && parseFloat(form.amount) > 0 && form.date;
  const accentBg = form.type === "income" ? "#10B981" : "#F43F5E";
  const count = previewCount();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-md bg-card border-t border-border sm:border sm:rounded-md max-h-[92dvh] overflow-y-auto scrollbar-thin"
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-foreground">
              Nuevo movimiento
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <XIcon />
            </button>
          </div>

          {/* Type toggle */}
          <div className="flex bg-secondary rounded-md p-1 mb-5 border border-border">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
                form.type === "expense"
                  ? "bg-[#F43F5E] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
                form.type === "income"
                  ? "bg-[#10B981] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Nombre del movimiento"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputCls}
              maxLength={60}
            />

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                <SelectTrigger className={`${triggerCls} w-22.5 shrink-0`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-200">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category picker */}
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
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
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-md text-[10px] font-bold transition-all cursor-pointer border ${
                        selected
                          ? "border-transparent"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-muted"
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

            <DatePicker
              value={form.date}
              onChange={(v) => setField("date", v)}
              placeholder="Fecha del movimiento"
            />
          </div>

          {/* Recurring section */}
          <div className="mt-5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setRecurring("enabled", !form.recurring.enabled)}
              className="w-full flex items-center justify-between cursor-pointer group py-0.5"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">
                  Repetir movimiento
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                  form.recurring.enabled ? "bg-foreground" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    form.recurring.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </button>

            {form.recurring.enabled && (
              <div ref={recurringRef} className="mt-4 space-y-4">
                {/* Frequency */}
                <div>
                  <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2 block">
                    Frecuencia
                  </label>
                  <PillGroup
                    options={Object.entries(FREQ_LABELS)}
                    value={form.recurring.frequency}
                    onChange={(v) => setRecurring("frequency", v)}
                    activeClass="bg-foreground text-background border-transparent"
                  />
                </div>

                {/* End type */}
                <div>
                  <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2 block">
                    Termina
                  </label>
                  <PillGroup
                    options={Object.entries(END_TYPE_LABELS)}
                    value={form.recurring.endType}
                    onChange={(v) => setRecurring("endType", v)}
                    activeClass="bg-foreground text-background border-transparent"
                  />
                </div>

                {/* End date picker */}
                {form.recurring.endType === "date" && (
                  <DatePicker
                    value={form.recurring.endDate}
                    onChange={(v) => setRecurring("endDate", v)}
                    minDate={form.date}
                    placeholder="Fecha de fin"
                  />
                )}

                {/* Occurrences */}
                {form.recurring.endType === "occurrences" && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Después de
                    </span>
                    <Input
                      type="number"
                      min="2"
                      max="999"
                      value={form.recurring.occurrences}
                      onChange={(e) =>
                        setRecurring("occurrences", e.target.value)
                      }
                      className={`${inputCls} w-24 text-center`}
                    />
                    <span className="text-sm text-muted-foreground">veces</span>
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
            className="w-full py-4 rounded-md font-bold text-sm mt-6 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{ backgroundColor: accentBg, color: "#ffffff" }}
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
