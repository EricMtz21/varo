"use client";

import Image from "next/image";

const TABS = [
  {
    id: "movements",
    label: "Movimientos",
    sub: "Tus ingresos y gastos",
    icon: "/assets/coin-w.png",
  },
  {
    id: "savings",
    label: "Cajas de ahorro",
    sub: "Tus cajas de ahorro",
    icon: "/assets/locker-w.png",
  },
];

export default function NavigationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="px-3 pt-3 pb-1 md:px-0 max-w-2xl mx-auto">
      <div className="flex gap-3">
        {TABS.map(({ id, label, sub, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-start gap-3 p-4 rounded-xl border transition-all relative overflow-hidden pb-16 cursor-pointer text-left select-none active:scale-[0.97] ${
                isActive
                  ? "bg-card border-border shadow-md"
                  : "bg-transparent border-border/40 hover:bg-muted/30 hover:border-border/70"
              }`}
            >
              <div>
                <p
                  className={`text-[13px] font-bold leading-tight transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground/55"
                  }`}
                >
                  {label}
                </p>
                <p
                  className={`text-[11px] mt-0.5 leading-snug transition-colors ${
                    isActive
                      ? "text-muted-foreground"
                      : "text-muted-foreground/35"
                  }`}
                >
                  {sub}
                </p>
              </div>
              <div
                className={`w-24 h-24 flex items-center justify-center transition-all absolute -bottom-8 -right-2 ${
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
