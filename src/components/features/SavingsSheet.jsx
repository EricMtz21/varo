"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { useSheet } from "@/hooks/useSheet";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { inputCls, triggerCls } from "./fieldStyles";
import { formatAmount } from "@/utils/format";
import { ACCENT_COLORS, CURRENCIES } from "@/utils/constants";

function badgeInitials(name) {
  return name ? name.slice(0, 2).toUpperCase() : "??";
}

/**
 * Alta y edición de una caja de ahorro. La hoja es la misma; al editar se
 * añaden el selector de color y el borrado, y la fecha cambia de sentido
 * (es desde cuándo vale el monto que capturaste).
 */
export default function SavingsSheet({
  title,
  submitLabel,
  initial,
  dateLabel,
  dateHelp,
  showColorPicker = false,
  onSubmit,
  onClose,
  onDelete,
}) {
  const sheet = useSheet(onClose);
  const limitRevealRef = useRevealOnMount();
  const previewRevealRef = useRevealOnMount();
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(initial);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const amount = parseFloat(form.initialAmount);
  const rate = parseFloat(form.rate);
  const hasPreview = amount > 0 && rate > 0;
  const isValid = form.name.trim() && hasPreview && form.startDate;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({
      name: form.name.trim(),
      initialAmount: amount,
      rate,
      currency: form.currency,
      startDate: form.startDate,
      color: form.color,
      limitAmount: form.hasLimit ? parseFloat(form.limitAmount) || null : null,
      secondaryRate: form.hasLimit
        ? parseFloat(form.secondaryRate) || null
        : null,
    });
    if (!ok) setSubmitting(false);
  }

  return (
    <Sheet {...sheet}>
      <SheetHeader
        title={title}
        onClose={sheet.close}
        color={form.color}
        initials={badgeInitials(form.name)}
      />

      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Nombre (ej. Nu, CETES, BBVA)"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
          maxLength={40}
        />

        {/* Monto + moneda */}
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
          <Select
            value={form.currency}
            onValueChange={(v) => set("currency", v)}
          >
            <SelectTrigger className={`${triggerCls} w-24 shrink-0`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="z-200">
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tasa anual */}
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

        {/* Tasa por tramos */}
        <div className="mt-2 bg-secondary rounded-md p-3 border border-border">
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
            <div ref={limitRevealRef} className="mt-3 grid grid-cols-2 gap-2">
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

        {/* Fecha */}
        <div>
          <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
            {dateLabel}
          </label>
          {dateHelp && (
            <p className="text-[11px] text-muted-foreground mb-1.5 leading-snug">
              {dateHelp}
            </p>
          )}
          <DatePicker
            value={form.startDate}
            onChange={(v) => set("startDate", v)}
            placeholder={dateLabel}
          />
        </div>

        {showColorPicker && (
          <div>
            <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  className={`w-7 h-7 rounded-md transition-all cursor-pointer ${
                    form.color === c
                      ? "ring-2 ring-foreground scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vista previa de rendimientos */}
      {hasPreview && (
        <div
          ref={previewRevealRef}
          className="mt-4 bg-secondary rounded-md p-4 border border-border"
        >
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
        disabled={!isValid || submitting}
        className="w-full py-4 rounded-md font-bold text-sm mt-5 bg-foreground text-background transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {submitting ? "Guardando…" : submitLabel}
      </button>

      {onDelete && (
        <div className="mt-3">
          {confirmDelete ? (
            <div className="rounded-md border border-destructive/20 p-3">
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Se borrará la caja y su historial de rendimientos. No se puede
                deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    sheet.close();
                  }}
                  className="flex-1 py-3 rounded-md text-sm font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full py-4 rounded-md font-bold text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              Eliminar caja
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}
