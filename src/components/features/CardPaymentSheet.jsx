"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { useSheet } from "@/hooks/useSheet";
import { inputCls } from "./fieldStyles";
import { formatAmount, todayIso } from "@/utils/format";
import { cardInitials } from "@/utils/creditCards";

/** Registrar un pago a una tarjeta. */
export default function CardPaymentSheet({
  card,
  suggested,
  currency,
  onSubmit,
  onClose,
}) {
  const sheet = useSheet(onClose);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: suggested > 0 ? String(Math.round(suggested * 100) / 100) : "",
    date: todayIso(),
  });

  const amount = parseFloat(form.amount);
  const isValid = amount > 0 && form.date;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({ cardId: card.id, amount, date: form.date });
    if (!ok) setSubmitting(false);
  }

  return (
    <Sheet {...sheet}>
      <SheetHeader
        title={`Pago a ${card.name}`}
        onClose={sheet.close}
        color={card.color}
        initials={cardInitials(card.name)}
      />

      <div className="space-y-4">
        <div>
          <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
            Monto del pago
          </label>
          <Input
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className={inputCls}
          />
          {suggested > 0 && (
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  amount: String(Math.round(suggested * 100) / 100),
                }))
              }
              className="text-[11px] text-muted-foreground hover:text-foreground mt-2 font-medium transition-colors cursor-pointer"
            >
              Pagar todo lo pendiente: {formatAmount(suggested, currency)}
            </button>
          )}
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 block">
            Fecha del pago
          </label>
          <DatePicker
            value={form.date}
            onChange={(v) => setForm((f) => ({ ...f, date: v }))}
            placeholder="Fecha del pago"
          />
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          El pago descuenta lo que debes en esta tarjeta. No se registra como
          gasto: el gasto ya lo contaste cuando lo hiciste.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid || submitting}
        className="w-full py-4 rounded-md font-bold text-sm mt-5 bg-foreground text-background transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {submitting ? "Guardando…" : "Registrar pago"}
      </button>
    </Sheet>
  );
}
