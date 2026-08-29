"use client";

import { useEffect, useRef } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { MONTHS, MONTHS_SHORT } from "@/utils/constants";

export default function MonthSelector({
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
}) {
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && activeRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const scrollLeft =
        container.scrollLeft +
        activeRect.left -
        containerRect.left -
        containerRect.width / 2 +
        activeRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentMonth]);

  function goToPreviousYear() {
    setCurrentYear((y) => y - 1);
    setCurrentMonth(11);
  }

  function goToNextYear() {
    setCurrentYear((y) => y + 1);
    setCurrentMonth(0);
  }

  return (
    <section className="px-3 md:px-0 pt-5 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-foreground">
          {MONTHS[currentMonth]}
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goToPreviousYear}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Año anterior"
          >
            <CaretLeftIcon size={14} />
          </button>
          <span className="text-sm text-muted-foreground font-semibold w-10 text-center">
            {currentYear}
          </span>
          <button
            onClick={goToNextYear}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Año siguiente"
          >
            <CaretRightIcon size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div ref={containerRef} className="flex gap-1.5 overflow-x-auto pb-4 -mb-4">
          {MONTHS_SHORT.map((m, i) => (
            <button
              key={i}
              ref={i === currentMonth ? activeRef : null}
              onClick={() => setCurrentMonth(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                i === currentMonth
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
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
