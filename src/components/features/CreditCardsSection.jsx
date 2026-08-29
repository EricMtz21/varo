"use client";

import { useState, useEffect, useRef } from "react";
import { TrayIcon } from "@phosphor-icons/react";
import CardSheet from "./CardSheet";
import CardPaymentSheet from "./CardPaymentSheet";
import CreditCardRow from "./CreditCardRow";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { formatAmount } from "@/utils/format";
import { CARD_COLORS, getCardTotals } from "@/utils/creditCards";

function CardsSkeleton() {
  return (
    <div className="w-full space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-card rounded-md border border-border p-4 animate-pulse"
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
  );
}

export default function CreditCardsSection({
  triggerAdd,
  cards,
  transactions,
  payments = [],
  hydrated,
  currency = "MXN",
  onAdd,
  onEdit,
  onDelete,
  onRegisterPayment,
  onDeletePayment,
}) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const summaryRef1 = useRevealOnMount(0);
  const summaryRef2 = useRevealOnMount(70);

  // El botón "+" vive en el header y el FAB: avisan subiendo este contador.
  const prevTriggerRef = useRef(triggerAdd);
  useEffect(() => {
    if (triggerAdd > prevTriggerRef.current) setShowAddSheet(true);
    prevTriggerRef.current = triggerAdd;
  }, [triggerAdd]);

  async function handleAdd(values) {
    const ok = await onAdd(values);
    if (ok) setShowAddSheet(false);
    return ok;
  }

  async function handleEdit(values) {
    const ok = await onEdit(editTarget.id, values);
    if (ok) setEditTarget(null);
    return ok;
  }

  async function handlePay(values) {
    const ok = await onRegisterPayment(values);
    if (ok) setPayTarget(null);
    return ok;
  }

  const totals = cards.map((card) =>
    getCardTotals(card, transactions, new Date(), payments),
  );
  const totalCurrent = totals.reduce((sum, t) => sum + t.current, 0);
  const totalOutstanding = totals.reduce((sum, t) => sum + t.outstanding, 0);
  const nextColor = CARD_COLORS[cards.length % CARD_COLORS.length];

  const payTargetTotals = payTarget
    ? getCardTotals(payTarget, transactions, new Date(), payments)
    : null;

  return (
    <div className="px-3 md:px-0 md:pt-3 pb-28 max-w-2xl mx-auto mt-2">
      {/* Resumen */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div
            ref={summaryRef1}
            className="bg-card rounded-xl shadow-xs border border-border p-4"
          >
            <p className="text-[11px] text-muted-foreground mb-1 font-medium tracking-wide uppercase">
              Periodo actual
            </p>
            <p className="text-base font-bold text-foreground">
              {formatAmount(totalCurrent, currency)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              En todas las tarjetas
            </p>
          </div>
          <div
            ref={summaryRef2}
            className="bg-card rounded-xl shadow-xs border border-border p-4"
          >
            <p className="text-[11px] text-muted-foreground mb-1 font-medium tracking-wide uppercase">
              Por pagar
            </p>
            <p
              className={`text-base font-bold ${totalOutstanding > 0 ? "text-[#F43F5E]" : "text-[#10B981]"}`}
            >
              {formatAmount(Math.abs(totalOutstanding), currency)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {totalOutstanding > 0 ? "Cortes ya cerrados" : "Al corriente"}
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {!hydrated ? (
        <CardsSkeleton />
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <TrayIcon size={44} />
          <p className="font-semibold mt-4">Sin tarjetas</p>
          <p className="text-sm mt-1 text-center px-8">
            Agrega una tarjeta y enlaza tus gastos para ver cuánto debes en cada
            corte.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card, i) => (
            <CreditCardRow
              key={card.id}
              card={card}
              transactions={transactions}
              payments={payments}
              currency={currency}
              onEdit={setEditTarget}
              onPay={setPayTarget}
              onDeletePayment={onDeletePayment}
              delay={i * 80}
            />
          ))}
        </div>
      )}

      {hydrated && cards.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground px-6 font-medium leading-relaxed">
            * Los totales suman los gastos que enlazaste a cada tarjeta menos
            los pagos que registraste. No incluyen intereses ni anualidades.
          </p>
        </div>
      )}

      {showAddSheet && (
        <CardSheet
          title="Nueva tarjeta"
          submitLabel="Agregar tarjeta"
          initial={{
            name: "",
            color: nextColor,
            cutoffDay: "1",
            paymentDay: "",
          }}
          onSubmit={handleAdd}
          onClose={() => setShowAddSheet(false)}
        />
      )}

      {editTarget && (
        <CardSheet
          title="Editar tarjeta"
          submitLabel="Guardar cambios"
          initial={{
            name: editTarget.name,
            color: editTarget.color,
            cutoffDay: String(editTarget.cutoffDay),
            paymentDay: editTarget.paymentDay
              ? String(editTarget.paymentDay)
              : "",
          }}
          onSubmit={handleEdit}
          onDelete={() => onDelete(editTarget.id)}
          onClose={() => setEditTarget(null)}
        />
      )}

      {payTarget && (
        <CardPaymentSheet
          card={payTarget}
          suggested={Math.max(payTargetTotals?.outstanding ?? 0, 0)}
          currency={currency}
          onSubmit={handlePay}
          onClose={() => setPayTarget(null)}
        />
      )}
    </div>
  );
}
