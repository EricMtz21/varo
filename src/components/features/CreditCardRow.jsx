"use client";

import { useState } from "react";
import {
  ArrowBendUpRightIcon,
  CaretDownIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { formatAmount } from "@/utils/format";
import {
  cardInitials,
  formatDayLabel,
  formatShortDate,
  getCardMovements,
  getCardPayments,
  getCardTotals,
  relativeDayLabel,
} from "@/utils/creditCards";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
} from "./categoryConfig";

function ChargeRow({ tx, currency }) {
  const catColor = CATEGORY_COLORS[tx.category] ?? "#A1A1AA";
  const CatIcon = CATEGORY_ICONS[tx.category] ?? DEFAULT_ICON;

  return (
    <div className="flex items-center gap-2.5 py-2">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: catColor + "1A", color: catColor }}
      >
        <CatIcon size={14} weight="fill" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{tx.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatShortDate(tx.date)}
        </p>
      </div>
      <p className="text-xs font-bold text-foreground shrink-0 tabular-nums">
        {formatAmount(tx.amount, tx.currency ?? currency)}
      </p>
    </div>
  );
}

function PaymentRow({ payment, currency, onDelete }) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[#10B981]/10 text-[#10B981]">
        <ArrowBendUpRightIcon size={14} weight="bold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">Pago</p>
        <p className="text-[10px] text-muted-foreground">
          {formatShortDate(payment.date)}
        </p>
      </div>
      <p className="text-xs font-bold text-[#10B981] shrink-0 tabular-nums">
        −{formatAmount(payment.amount, currency)}
      </p>
      <button
        type="button"
        onClick={() => onDelete(payment.id)}
        className="p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
        aria-label="Eliminar pago"
      >
        <TrashIcon size={13} />
      </button>
    </div>
  );
}

export default function CreditCardRow({
  card,
  transactions,
  payments,
  currency,
  onEdit,
  onPay,
  onDeletePayment,
  delay = 0,
}) {
  const revealRef = useRevealOnMount(delay);
  const [expanded, setExpanded] = useState(false);
  const totals = getCardTotals(card, transactions, new Date(), payments);

  const charges = expanded
    ? getCardMovements(
        card.id,
        transactions,
        totals.period.start,
        totals.period.end,
      )
    : [];
  const periodPayments = expanded
    ? getCardPayments(card.id, payments, totals.period.start, totals.period.end)
    : [];

  const owes = totals.outstanding;

  return (
    <div
      ref={revealRef}
      className="bg-card rounded-xl border border-border p-5 shadow-sm relative"
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm shrink-0"
            style={{ backgroundColor: card.color + "22", color: card.color }}
          >
            {cardInitials(card.name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate">{card.name}</p>
            <p className="text-xs text-muted-foreground">
              Corte {formatDayLabel(card.cutoffDay)}
              {card.paymentDay
                ? ` · Pago ${formatDayLabel(card.paymentDay)}`
                : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(card)}
          className="p-2 -mt-1 -mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          aria-label={`Editar ${card.name}`}
        >
          <PencilSimpleIcon size={16} />
        </button>
      </div>

      {/* Periodo actual */}
      <div className="mb-4">
        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
          Periodo actual
        </p>
        <p className="text-2xl font-bold" style={{ color: card.color }}>
          {formatAmount(totals.current, currency)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatShortDate(totals.period.start)} –{" "}
          {formatShortDate(totals.period.end)} ·{" "}
          {relativeDayLabel(totals.period.end, {
            present: "corta",
            future: "corta",
            past: "cortó",
          })}
        </p>
      </div>

      {/* Cifras */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            {owes < 0 ? "A favor" : "Por pagar"}
          </p>
          <p
            className={`text-sm font-bold ${owes > 0 ? "text-foreground" : "text-[#10B981]"}`}
          >
            {formatAmount(Math.abs(owes), currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {owes > 0 && totals.previousPaymentDate
              ? `Límite ${formatShortDate(totals.previousPaymentDate)}`
              : owes > 0
                ? "Ya cortado"
                : "Al corriente"}
          </p>
        </div>
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Pagado
          </p>
          <p className="text-sm font-bold text-[#10B981]">
            {formatAmount(totals.paid, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            Histórico
          </p>
        </div>
        <div className="bg-secondary rounded-md p-3 border border-border">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">
            Cargos
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            {formatAmount(totals.total, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            Histórico
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          disabled={totals.currentCount === 0 && periodPayments.length === 0}
          className="flex-1 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:cursor-default disabled:hover:text-muted-foreground"
        >
          <span className="truncate">
            {totals.currentCount === 0
              ? "Sin movimientos este periodo"
              : `${totals.currentCount} movimiento${
                  totals.currentCount === 1 ? "" : "s"
                } este periodo`}
          </span>
          {totals.currentCount > 0 && (
            <CaretDownIcon
              size={12}
              weight="bold"
              className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => onPay(card)}
          className="shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold bg-secondary border border-border text-foreground hover:bg-muted transition-colors cursor-pointer active:scale-95"
        >
          Registrar pago
        </button>
      </div>

      {expanded && (charges.length > 0 || periodPayments.length > 0) && (
        <div className="mt-1 divide-y divide-border">
          {periodPayments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              currency={currency}
              onDelete={onDeletePayment}
            />
          ))}
          {charges.map((tx) => (
            <ChargeRow key={tx.id} tx={tx} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
}
