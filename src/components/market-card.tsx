interface MarketCardProps {
  dotColor: string;
  name: string;
  details: string;
  priceRange: string;
  yieldInfo: string;
}

export function MarketCard({ dotColor, name, details, priceRange, yieldInfo }: MarketCardProps) {
  return (
    <div className="flex items-center gap-3 p-3.5 px-4 rounded-[10px] bg-[#f4f5f7] border border-[#e5e7eb]">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
      <div className="flex-1">
        <div className="text-[13px] font-semibold">{name}</div>
        <div className="text-[11px] text-[#6b7280] mt-0.5">{details}</div>
      </div>
      <div className="text-right">
        <div className="text-[13px] font-bold">{priceRange}</div>
        <div className="text-[10px] text-[#10b981] font-semibold">{yieldInfo}</div>
      </div>
    </div>
  );
}
