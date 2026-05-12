"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { MONTHS, MONTHS_SHORT } from "@/utils/constants";

export default function MonthSelector({
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
}) {
  return (
    <section className="px-4 md:px-0 pt-5 pb-2 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-foreground">
          {MONTHS[currentMonth]}{" "}
          <span className="text-muted-foreground font-medium">{currentYear}</span>
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCurrentYear((y) => y - 1)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Año anterior"
          >
            <CaretLeftIcon size={14} />
          </button>
          <span className="text-sm text-muted-foreground font-semibold w-10 text-center">
            {currentYear}
          </span>
          <button
            onClick={() => setCurrentYear((y) => y + 1)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Año siguiente"
          >
            <CaretRightIcon size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-4 -mb-4">
          {MONTHS_SHORT.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrentMonth(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                i === currentMonth
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
