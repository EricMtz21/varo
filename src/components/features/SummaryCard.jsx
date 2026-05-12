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
    <div className="bg-card rounded-xl p-5 border border-border shadow-xs">
      <p className="text-[11px] text-muted-foreground mb-2 font-medium tracking-wide uppercase">
        {label}
      </p>
      {loading ? (
        <div className="space-y-1.5 py-0.5">
          <div className="h-5 w-24 bg-muted/50 rounded-sm animate-pulse" />
          <div className="h-3 w-8 bg-muted/50 rounded-sm animate-pulse" />
        </div>
      ) : (
        <>
          <p className={`text-base font-bold leading-snug ${colorClass}`}>
            {prefix}
            {formatAmount(Math.abs(value), currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
            {currency}
          </p>
        </>
      )}
    </div>
  );
}
