"use client";

import Image from "next/image";

const TABS = [
  {
    id: "movements",
    label: "Movimientos",
    sub: "Ingresos y gastos",
    icon: "/assets/coin-w.png",
  },
  {
    id: "savings",
    label: "Cajas",
    sub: "Rendimientos",
    icon: "/assets/locker-w.png",
  },
  {
    id: "cards",
    label: "Tarjetas",
    sub: "Deuda y cortes",
    icon: "/assets/card-w.png",
  },
];

export default function NavigationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="px-3 pt-4 pb-3 md:px-0 max-w-2xl mx-auto">
      <div className="flex gap-2 sm:gap-3">
        {TABS.map(({ id, label, sub, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 min-w-0 flex flex-col items-start gap-3 p-3 sm:p-4 rounded-md border transition-all relative overflow-hidden pb-14 sm:pb-16 cursor-pointer text-left select-none active:scale-[0.97] ${
                isActive
                  ? "bg-card border-border shadow-md"
                  : "bg-transparent border-border/40 hover:bg-muted/30 hover:border-border/70"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`text-[12px] sm:text-[13px] font-bold leading-tight transition-colors truncate ${
                    isActive ? "text-foreground" : "text-muted-foreground/55"
                  }`}
                >
                  {label}
                </p>
                <p
                  className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug transition-colors truncate ${
                    isActive
                      ? "text-muted-foreground"
                      : "text-muted-foreground/35"
                  }`}
                >
                  {sub}
                </p>
              </div>
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center transition-all absolute -bottom-6 sm:-bottom-8 -right-2 ${
                  isActive ? "opacity-100" : "opacity-35"
                }`}
              >
                <Image
                  src={icon}
                  alt=""
                  width={500}
                  height={500}
                  priority
                  className="object-contain select-none"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
