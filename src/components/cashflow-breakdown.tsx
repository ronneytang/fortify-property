interface CashflowLine {
  label: string;
  value: string;
  color: "green" | "red" | "muted";
  bold?: boolean;
}

interface CashflowBreakdownProps {
  lines: CashflowLine[];
  netLabel: string;
  netValue: string;
  netPositive: boolean;
  taxBenefit?: { label: string; value: string; effectiveLabel: string; effectiveValue: string };
  footnote?: string;
}

export function CashflowBreakdown({ lines, netLabel, netValue, netPositive, taxBenefit, footnote }: CashflowBreakdownProps) {
  const colorMap = { green: "text-[#10b981]", red: "text-[#ef4444]", muted: "text-[#6b7280]" };

  return (
    <div>
      {lines.map((line, i) => (
        <div key={i}>
          {line.label === "---" ? (
            <hr className="border-t border-[#e5e7eb] my-3" />
          ) : (
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="text-[#6b7280]">{line.label}</span>
              <span className={`font-semibold ${line.bold ? "text-[13px]" : ""} ${colorMap[line.color]}`}>{line.value}</span>
            </div>
          )}
        </div>
      ))}
      <div className={`flex items-center justify-between p-2 px-3 rounded-lg mt-2 text-[13px] font-bold ${netPositive ? "bg-[#f0fdf4] text-[#10b981]" : "bg-[#fef2f2] text-[#ef4444]"}`}>
        <span>{netLabel}</span><span>{netValue}</span>
      </div>
      {taxBenefit && (
        <div className="mt-2.5 p-2.5 px-3 bg-[#f0fdf4] rounded-lg">
          <div className="flex justify-between text-xs">
            <span className="text-[#6b7280]">{taxBenefit.label}</span>
            <span className="text-[#10b981] font-bold">{taxBenefit.value}</span>
          </div>
          <div className="flex justify-between text-[13px] font-bold mt-1">
            <span className="text-[#065f46]">{taxBenefit.effectiveLabel}</span>
            <span className="text-[#065f46]">{taxBenefit.effectiveValue}</span>
          </div>
        </div>
      )}
      {footnote && <div className="mt-3 text-[10px] text-[#9ca3af] leading-relaxed">{footnote}</div>}
    </div>
  );
}
