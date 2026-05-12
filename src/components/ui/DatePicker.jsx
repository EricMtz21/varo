"use client";

import * as React from "react";
import { CalendarIcon } from "@phosphor-icons/react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * DatePicker — cross-platform date selector.
 * Props:
 *   value       string | undefined   — ISO "YYYY-MM-DD"
 *   onChange    (iso: string) => void
 *   placeholder string
 *   minDate     string | undefined   — ISO, disables days before
 *   className   string | undefined
 *   disabled    boolean | undefined
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona fecha",
  minDate,
  className,
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false);

  function isoToDate(iso) {
    if (!iso) return undefined;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function dateToIso(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const selected = isoToDate(value);
  const minDateObj = isoToDate(minDate);

  const label = selected
    ? selected.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-xl border border-border",
            "bg-muted px-4 text-left text-sm transition-colors",
            "hover:bg-secondary focus-visible:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value ? "text-foreground" : "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon size={16} className="shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{label}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 rounded-xl border border-border bg-card shadow-lg z-300"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(dateToIso(date));
            setOpen(false);
          }}
          disabled={minDateObj ? (date) => date < minDateObj : undefined}
          defaultMonth={selected ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
