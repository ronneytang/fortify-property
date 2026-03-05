import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  accessibleEquity,
  portfolioMonthlyCashflow,
  afterTaxMonthlyCashflow,
  monthlyMortgage,
  formatCurrency,
  formatPercent,
  lvr,
} from "@/lib/calculations";
import { MarketCard } from "@/components/market-card";

export default async function NextMovePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { properties: true },
  });

  if (!user) {
    redirect("/login");
  }

  const properties = user.properties;

  // --- Borrowing Capacity Card calculations ---
  const usableEquity = properties.reduce((sum, p) => {
    const propLVR = lvr(p.loanBalance, p.currentValue);
    // Only count accessible equity where LVR allows (below 80%)
    if (propLVR < 80) {
      return sum + accessibleEquity(p.currentValue, p.loanBalance);
    }
    return sum;
  }, 0);

  const cashDeposit = user.cashDeposit ?? 80_000;
  const totalDeposit = usableEquity + cashDeposit;
  // At 20% deposit requirement: deposit / 0.2 = max purchase price
  const maxPurchasePrice = totalDeposit / 0.2;
  const borrowingCapacity = user.borrowingCapacity ?? maxPurchasePrice * 0.8;
  const capacityBarPct = Math.min(100, (borrowingCapacity / 1_000_000) * 100);

  // --- 3rd Property Impact Simulator calculations ---
  const simPurchasePrice = 700_000;
  const simLoanAmount = simPurchasePrice * 0.8; // 80% LVR = $560,000
  const simRate = 5.94;
  const simEstRent = (simPurchasePrice * 0.035) / 12; // 3.5% yield / 12
  const simNewMortgage = monthlyMortgage(simLoanAmount, simRate);
  const simMonthlyInterest = simLoanAmount * (simRate / 100 / 12);
  const simAdditionalDeductions = simMonthlyInterest + 4800 / 12; // interest + $4800/yr rates & insurance
  const simNewPropertyCashflow = simEstRent - simNewMortgage - 4800 / 12;

  const existingPortfolioCashflow = portfolioMonthlyCashflow(properties);
  const simNewPortfolioCashflow = existingPortfolioCashflow + simNewPropertyCashflow;

  const marginalRate = user.marginalTaxRate;
  // After-tax: if there's a loss, apply marginal rate benefit
  const simMonthlyLoss = Math.min(0, simNewPortfolioCashflow);
  const simAfterTaxCost = simNewPortfolioCashflow + Math.abs(simMonthlyLoss) * marginalRate;

  return (
    <div className="space-y-4">
      {/* ===== Two-column top section ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* --- Left: Borrowing Capacity Card --- */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[13px] font-semibold">Borrowing Capacity</div>
              <div className="text-[11px] text-[#6b7280]">
                Estimated &middot; Based on income + existing commitments
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[10px] font-semibold text-[#10b981] border border-[#bbf7d0]">
              Ready
            </span>
          </div>

          {/* Big number */}
          <div className="mt-4 mb-1">
            <span className="text-[32px] font-bold text-[#10b981] leading-none">
              {formatCurrency(borrowingCapacity, true)}
            </span>
            <span className="text-[13px] text-[#6b7280] ml-2">additional</span>
          </div>
          <div className="text-[11px] text-[#9ca3af] mb-4">
            Approx. max additional borrowing for an investment property
          </div>

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-[#6b7280] mb-1">
              <span>$0</span>
              <span className="font-semibold">Capacity: {formatCurrency(borrowingCapacity, true)}</span>
              <span>$1M</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10b981] transition-all"
                style={{ width: `${capacityBarPct}%` }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e5e7eb] my-4" />

          {/* 2x2 stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-[#9ca3af] font-semibold tracking-wider">
                USABLE EQUITY
              </div>
              <div className="text-[15px] font-bold text-[#10b981] mt-0.5">
                {formatCurrency(usableEquity, true)}
              </div>
              <div className="text-[10px] text-[#6b7280]">From properties</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af] font-semibold tracking-wider">
                CASH DEPOSIT
              </div>
              <div className="text-[15px] font-bold mt-0.5">
                {user.cashDeposit
                  ? formatCurrency(user.cashDeposit, true)
                  : "Est. $80,000"}
              </div>
              <div className="text-[10px] text-[#6b7280]">Available</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af] font-semibold tracking-wider">
                MAX PURCHASE PRICE
              </div>
              <div className="text-[15px] font-bold mt-0.5">
                {formatCurrency(maxPurchasePrice, true)}
              </div>
              <div className="text-[10px] text-[#6b7280]">At 20% deposit</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af] font-semibold tracking-wider">
                TARGET LVR
              </div>
              <div className="text-[15px] font-bold mt-0.5">80%</div>
              <div className="text-[10px] text-[#6b7280]">Investment standard</div>
            </div>
          </div>

          {/* Pre-approval status banner */}
          <div className="mt-4 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] p-3">
            <div className="text-[12px] font-bold text-[#15803d]">
              &#10003; Pre-approval ready
            </div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">
              Based on your current income, equity position, and existing commitments you
              are likely eligible for pre-approval. Speak to your broker to confirm.
            </div>
          </div>
        </div>

        {/* --- Right: 3rd Property Impact Simulator Card --- */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5">
          {/* Header */}
          <div className="mb-4">
            <div className="text-[13px] font-semibold">
              3rd Property Impact Simulator
            </div>
            <div className="text-[11px] text-[#6b7280]">
              Based on $700K purchase at 80% LVR
            </div>
          </div>

          {/* Gray background section */}
          <div className="rounded-lg bg-[#f8fafc] p-4">
            <div className="text-[10px] text-[#9ca3af] font-semibold tracking-wider mb-3">
              AFTER PURCHASE
            </div>

            {/* Cashflow lines */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#6b7280]">New mortgage est.</span>
                <span className="text-[12px] font-semibold text-[#ef4444]">
                  −{formatCurrency(simNewMortgage)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#6b7280]">Rental income est.</span>
                <span className="text-[12px] font-semibold text-[#10b981]">
                  +{formatCurrency(simEstRent)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#6b7280]">Additional deductions</span>
                <span className="text-[12px] font-semibold text-[#8b5cf6]">
                  {formatCurrency(simAdditionalDeductions * 12)}/yr
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#e2e8f0] my-3" />

            {/* Summary lines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold">New portfolio cashflow</span>
                <span className="text-[13px] font-bold text-[#ef4444]">
                  {formatCurrency(simNewPortfolioCashflow)}/mo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold">After-tax effective cost</span>
                <span className="text-[13px] font-bold text-[#f59e0b]">
                  {formatCurrency(simAfterTaxCost)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="mt-4 rounded-lg bg-[#fef9c3] border border-[#fde68a] p-3">
            <div className="text-[12px] font-bold text-[#92400e]">
              &#9888; Cashflow stress test
            </div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">
              At current rates, an additional property would require approx.{" "}
              {formatCurrency(Math.abs(simAfterTaxCost))}/mo cash buffer after tax
              benefits. Ensure you have 6 months of expenses saved before proceeding.
            </div>
          </div>
        </div>
      </div>

      {/* ===== Market Recommendations (full width) ===== */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[13px] font-semibold">
              Recommended Markets for 3rd Property
            </div>
            <div className="text-[11px] text-[#6b7280]">
              $600K&ndash;$850K &middot; Freestanding house &middot; 400sqm+ &middot;
              High wage-worker density
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[10px] font-semibold text-[#10b981] border border-[#bbf7d0]">
            AI Ranked
          </span>
        </div>

        {/* Market cards */}
        <div className="flex flex-col gap-2">
          <MarketCard
            dotColor="#10b981"
            name="Brisbane — Outer North (Strathpine, Mango Hill)"
            priceRange="$620–780K"
            yieldInfo="4.1% yield · ↑ Strong growth"
            details="High infrastructure spend · Rail upgrade · 4.1% gross yield · 62% detached housing"
          />
          <MarketCard
            dotColor="#3b82f6"
            name="Adelaide — Northern Suburbs (Elizabeth, Salisbury)"
            priceRange="$550–720K"
            yieldInfo="4.6% yield · ↑ Accelerating"
            details="AUKUS defence corridor · Manufacturing employment · Low vacancy 0.4%"
          />
          <MarketCard
            dotColor="#8b5cf6"
            name="Perth — Middle Ring (Morley, Dianella)"
            priceRange="$680–850K"
            yieldInfo="3.8% yield · ↑ Mining boom thesis"
            details="Mining sector income · LNG expansion · Median land size 650sqm+"
          />
          <MarketCard
            dotColor="#f59e0b"
            name="Newcastle — Inner West (Mayfield, Waratah)"
            priceRange="$600–750K"
            yieldInfo="4.3% yield · → Stable"
            details="Port + manufacturing · Undervalued vs Sydney · 45-min express to CBD"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button className="inline-flex items-center gap-1 bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors">
            Deep Dive Any Market
          </button>
          <button className="inline-flex items-center gap-1 border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#374151] text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors">
            Run Cashflow Model
          </button>
          <button className="inline-flex items-center gap-1 border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#374151] text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors">
            Find Buyer&apos;s Agent
          </button>
        </div>
      </div>
    </div>
  );
}
