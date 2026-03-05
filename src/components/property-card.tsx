import { formatCurrency, formatPercent } from "@/lib/calculations";
import { PropertyCardActions } from "@/components/property-card-actions";

interface PropertyCardProps {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  propertyType: string;
  bedrooms: number;
  currentValue: number;
  valueLabel: string;
  valueDate: string;
  tags: { label: string; color: "green" | "amber" | "blue" | "red" }[];
  metrics: {
    equity: number;
    loanBalance: number;
    lvrPercent: number;
    monthlyRent: number;
    monthlyMortgage: number;
    monthlyRates: number;
    netCashflow: number;
    purchasePrice: number;
    capitalGrowth: number;
    interestRate: number;
    taxDeductionsYTD: number;
    depreciationAnnual: number;
    accessibleEquity: number;
    loanType: string;
  };
  warnings: string[];
}

export function PropertyCard({ id, address, suburb, state, postcode, propertyType, bedrooms, currentValue, valueLabel, valueDate, tags, metrics, warnings }: PropertyCardProps) {
  const tagColors: Record<string, string> = {
    green: "bg-[#d1fae5] text-[#065f46]",
    amber: "bg-[#fef3c7] text-[#92400e]",
    blue: "bg-[#dbeafe] text-[#1e40af]",
    red: "bg-[#fee2e2] text-[#991b1b]",
  };
  const lvrColor = metrics.lvrPercent < 65 ? "text-[#10b981]" : metrics.lvrPercent < 80 ? "text-[#f59e0b]" : "text-[#ef4444]";
  const equityPercent = 100 - metrics.lvrPercent;
  const debtBarColor = metrics.lvrPercent >= 80 ? "bg-[#f59e0b] opacity-70" : "bg-[#e5e7eb]";
  const typeLabel = propertyType === "house" ? "Freestanding House" : propertyType === "townhouse" ? "Townhouse" : "Apartment";

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-[#1a1d2e] to-[#252840] p-5 flex items-start justify-between">
        <div>
          <div className="text-sm font-bold text-white">{address}</div>
          <div className="text-[11px] text-[#94a3b8] mt-0.5">{suburb} {state} {postcode} · {typeLabel}</div>
          <div className="flex gap-1.5 mt-2">
            {tags.map((tag, i) => (
              <span key={i} className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${tagColors[tag.color]}`}>{tag.label}</span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#94a3b8]">{valueLabel}</div>
          <div className="text-xl font-bold text-white">{formatCurrency(currentValue)}</div>
          <div className="text-[10px] text-[#94a3b8] mt-0.5">{valueDate}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <div className="text-[10px] text-[#6b7280] font-medium mb-0.5">Equity</div>
            <div className="text-sm font-bold text-[#10b981]">{formatCurrency(metrics.equity)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6b7280] font-medium mb-0.5">Loan Balance</div>
            <div className="text-sm font-bold text-[#3b82f6]">{formatCurrency(metrics.loanBalance)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6b7280] font-medium mb-0.5">LVR</div>
            <div className={`text-sm font-bold ${lvrColor}`}>{formatPercent(metrics.lvrPercent)}</div>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-[#9ca3af] mb-1">
            <span>Equity</span><span>Debt</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div style={{ width: `${equityPercent}%` }} className="bg-[#10b981] rounded-l-full" />
            <div className={`flex-1 ${debtBarColor} rounded-r-full`} />
          </div>
        </div>
        <div className="text-[10px] font-bold tracking-wider uppercase text-[#9ca3af] mb-2">MONTHLY CASHFLOW</div>
        <div className="flex justify-between py-1 text-xs">
          <span className="text-[#6b7280]">Rental income</span>
          <span className="font-semibold text-[#10b981]">+{formatCurrency(metrics.monthlyRent)}</span>
        </div>
        <div className="flex justify-between py-1 text-xs">
          <span className="text-[#6b7280]">Mortgage {metrics.loanType}</span>
          <span className="font-semibold text-[#ef4444]">{formatCurrency(metrics.monthlyMortgage)}</span>
        </div>
        <div className="flex justify-between py-1 text-xs">
          <span className="text-[#6b7280]">Rates + insurance</span>
          <span className="font-semibold text-[#ef4444]">{formatCurrency(-metrics.monthlyRates)}</span>
        </div>
        <div className={`flex justify-between p-2 px-3 rounded-lg mt-2 text-[13px] font-bold ${metrics.netCashflow >= 0 ? "bg-[#f0fdf4] text-[#10b981]" : "bg-[#fef2f2] text-[#ef4444]"}`}>
          <span>Net monthly cashflow</span>
          <span>{formatCurrency(metrics.netCashflow)}</span>
        </div>
        <hr className="border-t border-[#e5e7eb] my-3.5" />
        <div className="grid grid-cols-3 gap-2.5 mt-1">
          <div>
            <div className="text-[10px] text-[#9ca3af]">Purchase Price</div>
            <div className="text-xs font-semibold">{formatCurrency(metrics.purchasePrice)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#9ca3af]">Capital Growth</div>
            <div className={`text-xs font-semibold ${metrics.capitalGrowth > 0 ? "text-[#10b981]" : metrics.capitalGrowth === 0 ? "text-[#9ca3af]" : "text-[#ef4444]"}`}>
              {metrics.capitalGrowth > 0 ? `+${formatCurrency(metrics.capitalGrowth)}` : metrics.capitalGrowth === 0 ? "\u2014" : formatCurrency(metrics.capitalGrowth)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#9ca3af]">Interest Rate</div>
            <div className="text-xs font-semibold">{formatPercent(metrics.interestRate, 2)} {metrics.loanType}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#9ca3af]">Tax Deductions YTD</div>
            <div className="text-xs font-semibold text-[#8b5cf6]">{formatCurrency(metrics.taxDeductionsYTD)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#9ca3af]">Depreciation</div>
            <div className={`text-xs font-semibold ${metrics.depreciationAnnual > 0 ? "" : "text-[#10b981]"}`}>
              {metrics.depreciationAnnual > 0 ? `${formatCurrency(metrics.depreciationAnnual)}/yr` : "Claim now \u2192"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#9ca3af]">{metrics.accessibleEquity > 0 ? "Accessible Equity" : "Refinance target"}</div>
            <div className={`text-xs font-semibold ${metrics.accessibleEquity > 0 ? "text-[#10b981]" : ""}`}>
              {metrics.accessibleEquity > 0 ? formatCurrency(metrics.accessibleEquity) : "LVR < 70%"}
            </div>
          </div>
        </div>
        {warnings.length > 0 && warnings.map((w, i) => (
          <div key={i} className="mt-3.5 p-2.5 px-3 bg-[#fef3c7] rounded-lg text-[11px] text-[#92400e]">
            ⚠ {w}
          </div>
        ))}
        <PropertyCardActions id={id} address={address} />
      </div>
    </div>
  );
}
