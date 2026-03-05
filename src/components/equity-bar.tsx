interface EquityBarProps {
  propertyName: string;
  subtitle: string;
  equityAmount: string;
  debtAmount: string;
  lvrPercent: number;
  equityPercent: number;
}

export function EquityBar({ propertyName, subtitle, equityAmount, debtAmount, lvrPercent, equityPercent }: EquityBarProps) {
  const lvrColor = lvrPercent < 65 ? "bg-[#d1fae5] text-[#065f46]" : lvrPercent < 80 ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#fee2e2] text-[#991b1b]";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#e5e7eb] last:border-b-0">
      <div className="w-[130px]">
        <div className="text-xs font-semibold">{propertyName}</div>
        <div className="text-[10px] text-[#6b7280]">{subtitle}</div>
      </div>
      <div className="flex-1">
        <div className="flex h-3.5 rounded-full overflow-hidden gap-0.5">
          <div style={{ width: `${equityPercent}%` }} className="bg-[#10b981] rounded-l-full" />
          <div className="flex-1 bg-[#e5e7eb] rounded-r-full" />
        </div>
        <div className="flex justify-between text-[10px] text-[#9ca3af] mt-0.5">
          <span className="text-[#10b981] font-semibold">Equity {equityAmount}</span>
          <span>{debtAmount} · LVR {lvrPercent.toFixed(1)}%</span>
        </div>
      </div>
      <div className="ml-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${lvrColor}`}>
          {lvrPercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
