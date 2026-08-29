"use client";

import { useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { useSheet } from "@/hooks/useSheet";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { inputCls, triggerCls } from "./fieldStyles";
import {
  CARD_COLORS,
  DAYS_OF_MONTH,
  cardInitials,
  formatShortDate,
  getPaymentDate,
  getStatementPeriod,
  relativeDayLabel,
} from "@/utils/creditCards";

/** Alta y edición de tarjeta: el mismo formulario para las dos. */
export default function CardSheet({
  title,
  submitLabel,
  initial,
  onSubmit,
  onClose,
  onDelete,
}) {
  const sheet = useSheet(onClose);
  const previewRef = useRevealOnMount();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initial);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isValid = form.name.trim().length > 0 && form.cutoffDay;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({
      name: form.name.trim(),
      color: form.color,
      cutoffDay: Number(form.cutoffDay),
      paymentDay: form.paymentDay ? Number(form.paymentDay) : null,
    });
    // Si falló, la hoja sigue abierta: hay que poder reintentar.
    if (!ok) setSubmitting(false);
  }

  const period = getStatementPeriod(Number(form.cutoffDay));
  const paymentIso = getPaymentDate(
    form.paymentDay ? Number(form.paymentDay) : null,
    period.end,
  );

  return (
    <Sheet {...sheet}>
      <SheetHeader
        title={title}
        onClose={sheet.close}
        color={form.color}
        initials={cardInitials(form.name)}
      />

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Nombre (ej. Nu Crédito, Banamex Oro)"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
          maxLength={40}
        />

        {/* Color */}
        <div>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {CARD_COLORS.map((color) => {
              const selected = form.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => set("color", color)}
                  aria-label={`Color ${color}`}
                  aria-pressed={selected}
                  className="w-9 h-9 rounded-md flex items-center justify-center transition-all cursor-pointer active:scale-95 border-2"
                  style={{
                    backgroundColor: selected ? color : color + "33",
                    borderColor: selected ? color : "transparent",
                    color: selected ? "#ffffff" : color,
                    boxShadow: selected
                      ? `0 0 0 2px var(--card), 0 0 0 4px ${color}`
                      : "none",
                  }}
                >
                  {selected && <CheckIcon size={16} weight="bold" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Días de corte y pago */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
              Día de corte
            </label>
            <Select
              value={String(form.cutoffDay)}
              onValueChange={(v) => set("cutoffDay", v)}
            >
              <SelectTrigger className={triggerCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-200">
                {DAYS_OF_MONTH.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
              Día de pago
            </label>
            <Select
              value={form.paymentDay ? String(form.paymentDay) : "none"}
              onValueChange={(v) => set("paymentDay", v === "none" ? "" : v)}
            >
              <SelectTrigger className={triggerCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-200">
                <SelectItem value="none">Sin definir</SelectItem>
                {DAYS_OF_MONTH.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vista previa del periodo */}
        <div
          ref={previewRef}
          className="bg-secondary rounded-md p-4 border border-border"
        >
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
            Periodo en curso
          </p>
          <p className="text-sm font-bold text-foreground">
            {formatShortDate(period.start)} – {formatShortDate(period.end)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {relativeDayLabel(period.end, {
              present: "Corta",
              future: "Corta",
              past: "Cortó",
            })}
            {paymentIso
              ? ` · se paga el ${formatShortDate(paymentIso)}`
              : " · sin fecha de pago"}
          </p>
        </div>
      </div>

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
                Los movimientos enlazados no se borran: solo dejan de estar
                asignados a esta tarjeta. Los pagos registrados sí se pierden.
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
              Eliminar tarjeta
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}
