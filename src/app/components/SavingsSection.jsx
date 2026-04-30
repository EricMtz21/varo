"use client";

import {
  CircleNotchIcon,
  PencilSimpleIcon,
  TrashIcon,
  TrayIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { calcStats, formatAmount } from "../utils/format";

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

// ─── Shared input styles ────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#141D2E] border border-[#1E2D45] rounded-xl px-4 py-3 text-[#E2E8F0] text-sm outline-none focus:border-[#818CF8] transition-colors placeholder:text-[#3D5070]";
const selectCls =
  "bg-[#141D2E] border border-[#1E2D45] rounded-xl px-3 py-3 text-[#E2E8F0] text-sm outline-none focus:border-[#818CF8] transition-colors cursor-pointer";

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
        className={`relative w-full sm:max-w-md bg-[#0c1018]/80 backdrop-blur-sm border-t border-[#1E2D45] sm:border sm:rounded-xl max-h-[92dvh] overflow-y-auto scrollbar-thin ${isExiting ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="w-10 h-1 bg-[#1E2D45] rounded-full mx-auto mt-3 mb-1 sm:hidden" />
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
              <h2 className="font-bold text-lg text-[#E2E8F0]">Nueva caja</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2537] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <XIcon size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Name */}
            <input
              type="text"
              placeholder="Nombre (ej. Nu, CETES, BBVA)"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              maxLength={40}
            />

            {/* Amount + currency */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Monto inicial"
                min="0.01"
                step="0.01"
                value={form.initialAmount}
                onChange={(e) => set("initialAmount", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className={selectCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual rate */}
            <div className="relative">
              <input
                type="number"
                placeholder="Tasa anual (%)"
                min="0.01"
                step="0.01"
                max="999"
                value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                className={`${inputCls} pr-16`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#475569] font-bold pointer-events-none">
                % base
              </span>
            </div>

            {/* Limit toggle */}
            <div className="mt-2 bg-[#141D2E] rounded-xl p-3 border border-[#1E2D45]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasLimit}
                  onChange={(e) => set("hasLimit", e.target.checked)}
                  className="accent-[#818CF8] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#E2E8F0] select-none">
                  Tasa por límite (ej. Nu)
                </span>
              </label>

              {form.hasLimit && (
                <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-up">
                  <div>
                    <label className="text-[10px] text-[#475569] font-bold uppercase tracking-widest block mb-1">
                      Tope base ($)
                    </label>
                    <input
                      type="number"
                      placeholder="Monto max"
                      min="0"
                      value={form.limitAmount}
                      onChange={(e) => set("limitAmount", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#475569] font-bold uppercase tracking-widest block mb-1">
                      Tasa excedente (%)
                    </label>
                    <input
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
              <label className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-1.5 block">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Live preview */}
          {hasPreview && (
            <div className="mt-4 bg-[#141D2E] rounded-xl p-4 border border-[#1E2D45] animate-fade-up">
              <p className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-3">
                Ganancias estimadas
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Por día", value: amount * (rate / 100 / 365) },
                  { label: "Por mes", value: amount * (rate / 100 / 12) },
                  { label: "Por año", value: amount * (rate / 100) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#34D399]">
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
            className="w-full py-4 rounded-xl font-bold text-sm mt-5 bg-[#818CF8] text-[#07090F] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Agregar caja
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Savings Modal ─────────────────────────────────────────────────────

function EditSavingsModal({ box, onSave, onClose }) {
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
        className={`relative w-full sm:max-w-md bg-[#0c1018]/80 backdrop-blur-sm border-t border-[#1E2D45] sm:border sm:rounded-xl max-h-[92dvh] overflow-y-auto scrollbar-thin ${isExiting ? "animate-slide-down" : "animate-slide-up"}`}
      >
        <div className="w-10 h-1 bg-[#1E2D45] rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: form.color + "22", color: form.color }}
              >
                {form.name ? form.name.slice(0, 2).toUpperCase() : "??"}
              </div>
              <h2 className="font-bold text-lg text-[#E2E8F0]">Editar caja</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2537] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <XIcon size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre (ej. Nu, CETES, BBVA)"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              maxLength={40}
            />

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Monto inicial"
                min="0.01"
                step="0.01"
                value={form.initialAmount}
                onChange={(e) => set("initialAmount", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className={selectCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Tasa anual (%)"
                min="0.01"
                step="0.01"
                max="999"
                value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                className={`${inputCls} pr-16`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#475569] font-bold pointer-events-none">
                % base
              </span>
            </div>

            <div className="bg-[#141D2E] rounded-xl p-3 border border-[#1E2D45]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasLimit}
                  onChange={(e) => set("hasLimit", e.target.checked)}
                  className="accent-[#818CF8] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#E2E8F0] select-none">
                  Tasa por límite (ej. Nu)
                </span>
              </label>

              {form.hasLimit && (
                <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-up">
                  <div>
                    <label className="text-[10px] text-[#475569] font-bold uppercase tracking-widest block mb-1">
                      Tope base ($)
                    </label>
                    <input
                      type="number"
                      placeholder="Monto max"
                      min="0"
                      value={form.limitAmount}
                      onChange={(e) => set("limitAmount", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#475569] font-bold uppercase tracking-widest block mb-1">
                      Tasa excedente (%)
                    </label>
                    <input
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
              <label className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-1.5 block">
                Balance a partir de
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-1.5 block">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {BOX_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    className={`w-7 h-7 rounded-lg transition-all cursor-pointer ${form.color === c ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {hasPreview && (
            <div className="mt-4 bg-[#141D2E] rounded-xl p-4 border border-[#1E2D45] animate-fade-up">
              <p className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-3">
                Ganancias estimadas
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Por día", value: amount * (rate / 100 / 365) },
                  { label: "Por mes", value: amount * (rate / 100 / 12) },
                  { label: "Por año", value: amount * (rate / 100) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#34D399]">
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
            className="w-full py-4 rounded-xl font-bold text-sm mt-5 bg-[#818CF8] text-[#07090F] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Guardar cambios
          </button>
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
      className="bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-4 group hover:border-[#334155] transition-colors animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
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
            <p className="font-bold text-[#E2E8F0]">{box.name}</p>
            <p className="text-xs text-[#475569]">
              Desde {formatStartDate(box.startDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[11px] font-bold px-2 py-1 flex items-center justify-center text-center rounded-lg leading-tight min-w-12.5"
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
          <button
            onClick={() => onEdit(box)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#475569] hover:text-[#818CF8] hover:bg-[#818CF8]/10 cursor-pointer"
            aria-label={`Editar ${box.name}`}
          >
            <PencilSimpleIcon size={18} />
          </button>
          <button
            onClick={() => onDelete(box.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#475569] hover:text-[#F87171] hover:bg-[#F87171]/10 cursor-pointer"
            aria-label={`Eliminar ${box.name}`}
          >
            <TrashIcon size={18} />
          </button>
        </div>
      </div>

      {/* Current balance */}
      <div className="mb-4">
        <p className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mb-1">
          Balance actual
        </p>
        <p className="text-2xl font-bold" style={{ color: box.color }}>
          {formatAmount(currentBalance, box.currency)}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#141D2E] rounded-md p-3 border border-[#1E2D45]">
          <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wide mb-1">
            Hoy
          </p>
          <p className="text-sm font-bold text-[#34D399]">
            +{formatAmount(todayEarnings, box.currency)}
          </p>
        </div>
        <div className="bg-[#141D2E] rounded-md p-3 border border-[#1E2D45]">
          <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wide mb-1">
            Ganado
          </p>
          <p
            className={`text-sm font-bold ${totalEarned >= 0 ? "text-[#34D399]" : "text-[#F87171]"}`}
          >
            {totalEarned >= 0 ? "+" : ""}
            {formatAmount(totalEarned, box.currency)}
          </p>
        </div>
        <div className="bg-[#141D2E] rounded-md p-3 border border-[#1E2D45]">
          <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wide mb-1">
            Inicial
          </p>
          <p className="text-sm font-bold text-[#94A3B8]">
            {formatAmount(box.initialAmount, box.currency)}
          </p>
        </div>
      </div>

      {/* Include in balance toggle */}
      <div className="mt-3 pt-3 border-t border-[#1E2D45] flex items-center justify-between">
        <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wide">
          Incluir en balance
        </span>
        <button
          type="button"
          onClick={() => onToggleBalance(box.id, !included)}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${included ? "bg-[#818CF8]" : "bg-[#1E2D45]"}`}
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

  // Open modal only when triggerAdd actually increases (not on component mount)
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

  // Summary totals (MXN only for simplicity)
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
    <div className="px-3 md:px-0 md:pt-3 pb-28 max-w-2xl mx-auto">
      {/* Summary bar */}
      {boxes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div
            className="bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-4 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <p className="text-[11px] text-[#64748B] mb-1 font-medium tracking-wide uppercase">
              Total en cajas
            </p>
            <p className="text-base font-bold text-[#818CF8]">
              {formatAmount(totalMxn, "MXN")}
            </p>
            {boxes.length !== mxnBoxes.length && (
              <p className="text-[10px] text-[#334155] mt-0.5">Solo MXN</p>
            )}
          </div>
          <div
            className="bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-4 animate-fade-up"
            style={{ animationDelay: "70ms" }}
          >
            <p className="text-[11px] text-[#64748B] mb-1 font-medium tracking-wide uppercase">
              Total ganado
            </p>
            <p className="text-base font-bold text-[#34D399]">
              +{formatAmount(totalEarnedMxn, "MXN")}
            </p>
            {boxes.length !== mxnBoxes.length && (
              <p className="text-[10px] text-[#334155] mt-0.5">Solo MXN</p>
            )}
          </div>
        </div>
      )}

      {/* Box list */}
      {!hydrated ? (
        <div className="flex flex-col items-center justify-center py-10">
          <CircleNotchIcon
            size={32}
            className="text-[#818CF8] animate-spin mb-8"
          />
          <div className="w-full space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-4 animate-pulse"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-[#1E2D45]/50 shrink-0" />
                  <div className="space-y-2 w-1/3 py-1">
                    <div className="h-4 bg-[#1E2D45]/50 rounded-md w-full" />
                    <div className="h-2.5 bg-[#1E2D45]/50 rounded-md w-2/3" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-[#1E2D45]/50 rounded-md w-20" />
                  <div className="h-6 bg-[#1E2D45]/50 rounded-md w-1/3" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 bg-[#1E2D45]/50 rounded-md" />
                  <div className="h-14 bg-[#1E2D45]/50 rounded-md" />
                  <div className="h-14 bg-[#1E2D45]/50 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : boxes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#1E2D45]">
          <TrayIcon size={44} />
          <p className="font-semibold mt-4 text-[#334155]">
            Sin cajas de ahorro
          </p>
          <p className="text-sm text-[#1E2D45] mt-1">
            Presiona "+ Caja" para agregar una
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
          <p className="text-[10px] text-[#475569] px-6 font-medium leading-relaxed">
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
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
