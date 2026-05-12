"use client";

import {
  CircleNotchIcon,
  PencilSimpleIcon,
  TrashIcon,
  TrayIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { calcStats, formatAmount } from "@/utils/format";

const BOX_COLORS = [
  "#818CF8",
  "#34D399",
  "#F472B6",
  "#FBBF24",
  "#67E8F9",
  "#A78BFA",
  "#F87171",
  "#4ADE80",
  "#FB923C",
  "#2DD4BF",
];

const CURRENCIES = ["MXN", "USD", "EUR", "CAD", "GBP"];

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

function formatStartDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";

// ─── Shared input styles ────────────────────────────────────────────────────

const inputCls =
  "h-12 w-full rounded-xl border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground transition-colors px-4";

const triggerCls =
  "h-12 rounded-xl border-border bg-muted text-foreground text-sm px-4 justify-between focus:ring-0 focus-visible:ring-0";

// ─── Add Savings Modal ──────────────────────────────────────────────────────

function AddSavingsModal({ onAdd, onClose, nextColor }) {
  const [isExiting, setIsExiting] = useState(false);
  const d = new Date();
  const today = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");

  const [form, setForm] = useState({
    name: "",
    initialAmount: "",
    rate: "",
    hasLimit: false,
    limitAmount: "",
    secondaryRate: "",
    currency: "MXN",
    startDate: today,
  });

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  function handleClose() {
    setIsExiting(true);
    setTimeout(onClose, 260);
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const amount = parseFloat(form.initialAmount);
  const rate = parseFloat(form.rate);
  const hasPreview = amount > 0 && rate > 0;
  const isValid = form.name.trim() && hasPreview && form.startDate;

  function handleSubmit() {
    if (!isValid) return;
    onAdd({
      id: uid(),
      name: form.name.trim(),
      initialAmount: amount,
      rate,
      currency: form.currency,
      startDate: form.startDate,
      color: nextColor,
      limitAmount: form.hasLimit ? parseFloat(form.limitAmount) || null : null,
      secondaryRate: form.hasLimit
        ? parseFloat(form.secondaryRate) || null
        : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm ${isExiting ? "animate-fade-out" : "animate-fade-in"}`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full sm:max-w-md bg-card border-t border-border sm:border sm:rounded-xl max-h-[92dvh] overflow-y-auto scrollbar-thin ${isExiting ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: nextColor + "22", color: nextColor }}
              >
                {form.name ? form.name.slice(0, 2).toUpperCase() : "??"}
              </div>
              <h2 className="font-bold text-lg text-foreground">Nueva caja</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <XIcon size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Name */}
            <Input
              type="text"
              placeholder="Nombre (ej. Nu, CETES, BBVA)"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              maxLength={40}
            />

            {/* Amount + currency */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Monto inicial"
                min="0.01"
                step="0.01"
                value={form.initialAmount}
                onChange={(e) => set("initialAmount", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger className={`${triggerCls} w-24 shrink-0`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-200">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Annual rate */}
            <div className="relative">
              <Input
                type="number"
                placeholder="Tasa anual (%)"
                min="0.01"
                step="0.01"
                max="999"
                value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                className={`${inputCls} pr-16`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold pointer-events-none">
                % base
              </span>
            </div>

            {/* Limit toggle */}
            <div className="mt-2 bg-secondary rounded-xl p-3 border border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasLimit}
                  onChange={(e) => set("hasLimit", e.target.checked)}
                  className="accent-foreground w-4 h-4"
                />
                <span className="text-xs font-bold text-foreground select-none">
                  Tasa por límite (ej. Nu)
                </span>
              </label>

              {form.hasLimit && (
                <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-up">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">
                      Tope base ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Monto max"
                      min="0"
                      value={form.limitAmount}
                      onChange={(e) => set("limitAmount", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">
                      Tasa excedente (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="%"
                      min="0"
                      step="0.01"
                      value={form.secondaryRate}
                      onChange={(e) => set("secondaryRate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Start date */}
            <div>
              <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
                Fecha de inicio
              </label>
              <DatePicker
                value={form.startDate}
                onChange={(v) => set("startDate", v)}
                placeholder="Fecha de inicio"
              />
            </div>
          </div>

          {/* Live preview */}
          {hasPreview && (
            <div className="mt-4 bg-secondary rounded-xl p-4 border border-border animate-fade-up">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-3">
                Ganancias estimadas
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Por día", value: amount * (rate / 100 / 365) },
                  { label: "Por mes", value: amount * (rate / 100 / 12) },
                  { label: "Por año", value: amount * (rate / 100) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#10B981]">
                      +{formatAmount(value, form.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-4 rounded-xl font-bold text-sm mt-5 bg-foreground text-background transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Agregar caja
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Savings Modal ─────────────────────────────────────────────────────

function EditSavingsModal({ box, onSave, onClose, onDelete }) {
  const [isExiting, setIsExiting] = useState(false);
  const d = new Date();
  const today = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");

  const [form, setForm] = useState({
    name: box.name,
    initialAmount: String(box.initialAmount),
    rate: String(box.rate),
    hasLimit: !!(box.limitAmount),
    limitAmount: box.limitAmount ? String(box.limitAmount) : "",
    secondaryRate: box.secondaryRate ? String(box.secondaryRate) : "",
    currency: box.currency,
    startDate: today,
    color: box.color,
  });

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  function handleClose() {
    setIsExiting(true);
    setTimeout(onClose, 260);
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const amount = parseFloat(form.initialAmount);
  const rate = parseFloat(form.rate);
  const hasPreview = amount > 0 && rate > 0;
  const isValid = form.name.trim() && hasPreview && form.startDate;

  function handleSubmit() {
    if (!isValid) return;
    onSave(box.id, {
      name: form.name.trim(),
      initialAmount: amount,
      rate,
      currency: form.currency,
      startDate: form.startDate,
      color: form.color,
      limitAmount: form.hasLimit ? parseFloat(form.limitAmount) || null : null,
      secondaryRate: form.hasLimit ? parseFloat(form.secondaryRate) || null : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm ${isExiting ? "animate-fade-out" : "animate-fade-in"}`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full sm:max-w-md bg-card border-t border-border sm:border sm:rounded-xl max-h-[92dvh] overflow-y-auto scrollbar-thin ${isExiting ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: form.color + "22", color: form.color }}
              >
                {form.name ? form.name.slice(0, 2).toUpperCase() : "??"}
              </div>
              <h2 className="font-bold text-lg text-foreground">Editar caja</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <XIcon size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Nombre (ej. Nu, CETES, BBVA)"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              maxLength={40}
            />

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Monto inicial"
                min="0.01"
                step="0.01"
                value={form.initialAmount}
                onChange={(e) => set("initialAmount", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger className={`${triggerCls} w-24 shrink-0`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-200">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder="Tasa anual (%)"
                min="0.01"
                step="0.01"
                max="999"
                value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                className={`${inputCls} pr-16`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold pointer-events-none">
                % base
              </span>
            </div>

            <div className="bg-secondary rounded-xl p-3 border border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasLimit}
                  onChange={(e) => set("hasLimit", e.target.checked)}
                  className="accent-foreground w-4 h-4"
                />
                <span className="text-xs font-bold text-foreground select-none">
                  Tasa por límite (ej. Nu)
                </span>
              </label>

              {form.hasLimit && (
                <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-up">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">
                      Tope base ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Monto max"
                      min="0"
                      value={form.limitAmount}
                      onChange={(e) => set("limitAmount", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">
                      Tasa excedente (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="%"
                      min="0"
                      step="0.01"
                      value={form.secondaryRate}
                      onChange={(e) => set("secondaryRate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
                Balance a partir de
              </label>
              <DatePicker
                value={form.startDate}
                onChange={(v) => set("startDate", v)}
                placeholder="Balance a partir de"
              />
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {BOX_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    className={`w-7 h-7 rounded-lg transition-all cursor-pointer ${form.color === c ? "ring-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {hasPreview && (
            <div className="mt-4 bg-secondary rounded-xl p-4 border border-border animate-fade-up">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-3">
                Ganancias estimadas
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Por día", value: amount * (rate / 100 / 365) },
                  { label: "Por mes", value: amount * (rate / 100 / 12) },
                  { label: "Por año", value: amount * (rate / 100) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#10B981]">
                      +{formatAmount(value, form.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-4 rounded-xl font-bold text-sm mt-5 bg-foreground text-background transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Guardar cambios
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(box.id);
                handleClose();
              }}
              className="w-full py-4 rounded-xl font-bold text-sm mt-3 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              Eliminar caja
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Savings box card ───────────────────────────────────────────────────────

function SavingsBox({ box, onDelete, onEdit, onToggleBalance, delay = 0 }) {
  const { currentBalance, totalEarned, todayEarnings } = calcStats(box);

  const effectiveRate =
    currentBalance > 0
      ? ((todayEarnings * 365) / currentBalance) * 100
      : parseFloat(box.rate);

  const included = box.includeInBalance !== false;

  return (
    <div
      onClick={() => onEdit(box)}
      className="bg-card rounded-xl p-5 border border-border shadow-sm group hover:border-muted-foreground transition-colors cursor-pointer animate-fade-up relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <PencilSimpleIcon size={16} />
      </div>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
            style={{ backgroundColor: box.color + "22", color: box.color }}
          >
            {box.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-foreground">{box.name}</p>
            <p className="text-xs text-muted-foreground">
              Desde {formatStartDate(box.startDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 z-10">
          <span
            className="text-[11px] font-bold px-2.5 py-1 flex items-center justify-center text-center rounded-lg leading-tight"
            title={
              box.limitAmount
                ? `Base: ${box.rate}%, Excedente: ${box.secondaryRate || 0}%`
                : ""
            }
            style={{ backgroundColor: box.color + "20", color: box.color }}
          >
            {Number(effectiveRate.toFixed(2))}%{" "}
            {box.limitAmount ? "real" : "anual"}
          </span>
        </div>
      </div>

      {/* Current balance */}
      <div className="mb-4">
        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
          Balance actual
        </p>
        <p className="text-2xl font-bold" style={{ color: box.color }}>
          {formatAmount(currentBalance, box.currency)}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Hoy
          </p>
          <p className="text-sm font-bold text-[#10B981]">
            +{formatAmount(todayEarnings, box.currency)}
          </p>
        </div>
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Ganado
          </p>
          <p
            className={`text-sm font-bold ${totalEarned >= 0 ? "text-[#10B981]" : "text-destructive"}`}
          >
            {totalEarned >= 0 ? "+" : ""}
            {formatAmount(totalEarned, box.currency)}
          </p>
        </div>
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Inicial
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            {formatAmount(box.initialAmount, box.currency)}
          </p>
        </div>
      </div>

      {/* Include in balance toggle */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
          Incluir en balance
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleBalance(box.id, !included); }}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${included ? "bg-foreground" : "bg-muted"}`}
          aria-label="Incluir en balance general"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${included ? "left-4.5" : "left-0.5"}`}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Main section ───────────────────────────────────────────────────────────

export default function SavingsSection({
  triggerAdd,
  boxes,
  hydrated,
  onAdd,
  onDelete,
  onEdit,
  onToggleBalance,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const prevTriggerRef = useRef(triggerAdd);
  useEffect(() => {
    if (triggerAdd > prevTriggerRef.current) setShowModal(true);
    prevTriggerRef.current = triggerAdd;
  }, [triggerAdd]);

  async function handleAdd(box) {
    const success = await onAdd(box);
    if (success) setShowModal(false);
  }

  async function handleEdit(id, updates) {
    const success = await onEdit(id, updates);
    if (success) setEditTarget(null);
  }

  const nextColor = BOX_COLORS[boxes.length % BOX_COLORS.length];

  const mxnBoxes = boxes.filter((b) => b.currency === "MXN");
  const totalMxn = mxnBoxes.reduce(
    (sum, b) => sum + calcStats(b).currentBalance,
    0,
  );
  const totalEarnedMxn = mxnBoxes.reduce(
    (sum, b) => sum + calcStats(b).totalEarned,
    0,
  );

  return (
    <div className="px-3 md:px-0 md:pt-3 pb-28 max-w-2xl mx-auto mt-2">
      {/* Summary bar */}
      {boxes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div
            className="bg-card rounded-xl shadow-xs border border-border p-4 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <p className="text-[11px] text-muted-foreground mb-1 font-medium tracking-wide uppercase">
              Total en cajas
            </p>
            <p className="text-base font-bold text-foreground">
              {formatAmount(totalMxn, "MXN")}
            </p>
            {boxes.length !== mxnBoxes.length && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Solo MXN</p>
            )}
          </div>
          <div
            className="bg-card rounded-xl shadow-xs border border-border p-4 animate-fade-up"
            style={{ animationDelay: "70ms" }}
          >
            <p className="text-[11px] text-muted-foreground mb-1 font-medium tracking-wide uppercase">
              Total ganado
            </p>
            <p className="text-base font-bold text-[#10B981]">
              +{formatAmount(totalEarnedMxn, "MXN")}
            </p>
            {boxes.length !== mxnBoxes.length && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Solo MXN</p>
            )}
          </div>
        </div>
      )}

      {/* Box list */}
      {!hydrated ? (
        <div className="flex flex-col items-center justify-center py-10">
          <CircleNotchIcon
            size={32}
            className="text-foreground animate-spin mb-8"
          />
          <div className="w-full space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-md p-4 animate-pulse"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-muted/50 shrink-0" />
                  <div className="space-y-2 w-1/3 py-1">
                    <div className="h-4 bg-muted/50 rounded-md w-full" />
                    <div className="h-2.5 bg-muted/50 rounded-md w-2/3" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted/50 rounded-md w-20" />
                  <div className="h-6 bg-muted/50 rounded-md w-1/3" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 bg-muted/50 rounded-md" />
                  <div className="h-14 bg-muted/50 rounded-md" />
                  <div className="h-14 bg-muted/50 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : boxes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <TrayIcon size={44} />
          <p className="font-semibold mt-4">
            Sin cajas de ahorro
          </p>
          <p className="text-sm mt-1">
            Presiona &quot;+ Caja&quot; para agregar una
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {boxes.map((box, i) => (
            <SavingsBox
              key={box.id}
              box={box}
              onDelete={onDelete}
              onEdit={setEditTarget}
              onToggleBalance={onToggleBalance}
              delay={i * 80}
            />
          ))}
        </div>
      )}

      {/* Disclaimer de impuestos */}
      {hydrated && boxes.length > 0 && (
        <div
          className="mt-8 text-center animate-fade-up"
          style={{ animationDelay: `${boxes.length * 80}ms` }}
        >
          <p className="text-[10px] text-muted-foreground px-6 font-medium leading-relaxed">
            * Los rendimientos calculados son estimaciones matemáticas brutas
            aproximadas antes de impuestos y retenciones (ISR). Tu pago bancario
            real puede variar.
          </p>
        </div>
      )}

      {showModal && (
        <AddSavingsModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          nextColor={nextColor}
        />
      )}

      {editTarget && (
        <EditSavingsModal
          box={editTarget}
          onSave={handleEdit}
          onDelete={onDelete}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
