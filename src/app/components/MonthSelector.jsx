"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { MONTHS, MONTHS_SHORT } from "../utils/constants";

export default function MonthSelector({
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
}) {
  return (
    <section className="px-4 md:px-0 pt-5 pb-2 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#E2E8F0]">
          {MONTHS[currentMonth]}{" "}
          <span className="text-[#475569] font-medium">{currentYear}</span>
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCurrentYear((y) => y - 1)}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2537] transition-colors cursor-pointer"
            aria-label="Año anterior"
          >
            <CaretLeftIcon size={14} />
          </button>
          <span className="text-sm text-[#475569] font-semibold w-10 text-center">
            {currentYear}
          </span>
          <button
            onClick={() => setCurrentYear((y) => y + 1)}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2537] transition-colors cursor-pointer"
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
                  ? "bg-[#818CF8] text-[#07090F]"
                  : "bg-[#0c1018]/80 backdrop-blur-sm text-[#475569] hover:text-[#E2E8F0] hover:bg-[#1A2537] border border-[#1E2D45]"
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
