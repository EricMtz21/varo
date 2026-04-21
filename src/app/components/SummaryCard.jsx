export default function SummaryCard({
  label,
  value,
  currency,
  colorClass,
  prefix,
  formatAmount,
  loading,
}) {
  return (
    <div className="bg-[#0c1018]/80 backdrop-blur-sm rounded-md p-4">
      <p className="text-[11px] text-[#64748B] mb-2 font-medium tracking-wide uppercase">
        {label}
      </p>
      {loading ? (
        <div className="space-y-1.5 py-0.5">
          <div className="h-5 w-24 bg-[#1E2D45]/50 rounded-sm animate-pulse" />
          <div className="h-3 w-8 bg-[#1E2D45]/50 rounded-sm animate-pulse" />
        </div>
      ) : (
        <>
          <p className={`text-base font-bold leading-snug ${colorClass}`}>
            {prefix}
            {formatAmount(Math.abs(value), currency)}
          </p>
          <p className="text-[10px] text-[#334155] mt-1 font-semibold">
            {currency}
          </p>
        </>
      )}
    </div>
  );
}
