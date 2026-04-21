"use client";

export default function NavigationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="p-3 md:p-0 md:pt-3 max-w-2xl mx-auto">
      <div className="flex bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-1">
        {[
          ["movements", "Movimientos"],
          ["savings", "Cajas de ahorro"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-[#1A2537] text-[#E2E8F0]"
                : "text-[#475569] hover:text-[#CBD5E1]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
