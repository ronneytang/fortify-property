import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  lvr,
  accessibleEquity,
  capitalGrowth,
  annualDeductions,
  portfolioTotalDeductions,
  portfolioTaxBenefit,
  portfolioMonthlyCashflow,
  afterTaxMonthlyCashflow,
  formatCurrency,
  formatPercent,
} from "@/lib/calculations";
import { IntelligenceCard } from "@/components/intelligence-card";

interface Insight {
  id: string;
  type: "opportunity" | "action" | "risk";
  property?: string;
  category: string;
  title: string;
  body: string;
  dollarValue?: number;
  dollarLabel?: string;
  tagColor: "green" | "blue" | "amber" | "red" | "purple";
  borderColor: "emerald" | "amber" | "red";
  source: string;
  actions: { label: string; variant: "primary" | "ghost" }[];
}

export default async function IntelligencePage() {
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
  const marginalRate = user.marginalTaxRate;
  const insights: Insight[] = [];

  // ---------- Per-property insights ----------
  for (const property of properties) {
    const propertyLVR = lvr(property.loanBalance, property.currentValue);

    // 1. Equity Unlock - LVR < 65%
    if (propertyLVR < 65) {
      const equity = accessibleEquity(property.currentValue, property.loanBalance);
      insights.push({
        id: `equity-unlock-${property.id}`,
        type: "opportunity",
        property: property.suburb,
        category: "LVR milestone",
        title: `You can access ${formatCurrency(equity, true)} in equity today`,
        body: `Your LVR sits at just <strong>${formatPercent(propertyLVR)}</strong>. By refinancing up to 80% LVR you could release <strong>${formatCurrency(equity, true)}</strong> to use as a deposit on your next investment or fund renovations -- without selling.`,
        dollarValue: equity,
        dollarLabel: `Access ${formatCurrency(equity, true)}`,
        tagColor: "blue",
        borderColor: "emerald",
        source: "CoreLogic AVM \u00b7 Mar 2026",
        actions: [
          { label: "Calculate Refinance", variant: "primary" },
          { label: "See markets", variant: "ghost" },
        ],
      });
    }

    // 2. CGT Timing - held > 12 months AND capital gain > $50K
    const holdingMonths = Math.floor(
      (Date.now() - new Date(property.purchaseDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
    const growth = capitalGrowth(property);

    if (holdingMonths > 12 && growth > 50000) {
      const cgtSaving = growth * 0.5 * marginalRate;
      const julyTimingSaving = Math.round(cgtSaving * 0.15); // deferral benefit ~15%
      insights.push({
        id: `cgt-timing-${property.id}`,
        type: "opportunity",
        property: property.suburb,
        category: "CGT planning",
        title: `Selling in July saves ${formatCurrency(julyTimingSaving, true)} in CGT`,
        body: `You've held ${property.suburb} for <strong>${Math.floor(holdingMonths / 12)}+ years</strong> with a <strong>${formatCurrency(growth, true)}</strong> capital gain. The 50% CGT discount applies, and by timing a sale after 1 July you defer the liability by 12 months -- worth approximately <strong>${formatCurrency(julyTimingSaving, true)}</strong> at the ${formatPercent(marginalRate * 100, 0)} marginal rate.`,
        dollarValue: julyTimingSaving,
        dollarLabel: `Save ${formatCurrency(julyTimingSaving, true)}`,
        tagColor: "green",
        borderColor: "emerald",
        source: "ATO CGT calculator \u00b7 FY2026 rates",
        actions: [{ label: "Model CGT Scenarios", variant: "primary" }],
      });
    }

    // 3. Depreciation Gap - depreciationAnnual === 0
    if (property.depreciationAnnual === 0) {
      const estimatedDepreciation = property.purchasePrice / 40;
      const taxSaving = estimatedDepreciation * marginalRate;
      insights.push({
        id: `depreciation-gap-${property.id}`,
        type: "action",
        property: property.suburb,
        category: "Depreciation",
        title: `${formatCurrency(estimatedDepreciation, true)}/yr in depreciation going unclaimed`,
        body: `No depreciation schedule is on file for <strong>${property.suburb}</strong>. A quantity surveyor report typically costs $550 and could unlock approximately <strong>${formatCurrency(estimatedDepreciation, true)}/yr</strong> in deductions, saving you <strong>${formatCurrency(taxSaving, true)}</strong> per year in tax at the ${formatPercent(marginalRate * 100, 0)} rate.`,
        dollarValue: taxSaving,
        dollarLabel: `Save ${formatCurrency(taxSaving, true)}/yr`,
        tagColor: "green",
        borderColor: "amber",
        source: "ATO Tax Ruling TR 97/25",
        actions: [
          { label: "Get QS Report $550", variant: "primary" },
          { label: "Learn more", variant: "ghost" },
        ],
      });
    }

    // 4. Rate Comparison - interestRate > 5.94%
    if (property.interestRate > 5.94) {
      const rateGap = property.interestRate - 5.94;
      const extraAnnualCost = (rateGap / 100) * property.loanBalance;
      insights.push({
        id: `rate-comparison-${property.id}`,
        type: "risk",
        property: property.suburb,
        category: "Interest rate",
        title: `${formatPercent(property.interestRate)} rate is ${formatPercent(rateGap)} above market best`,
        body: `Your current rate of <strong>${formatPercent(property.interestRate)}</strong> is above the best advertised variable rate of <strong>5.94%</strong>. On a balance of <strong>${formatCurrency(property.loanBalance, true)}</strong>, that gap costs an extra <strong>${formatCurrency(extraAnnualCost, true)}/yr</strong>.`,
        dollarValue: extraAnnualCost,
        dollarLabel: `${formatCurrency(extraAnnualCost, true)}/yr extra`,
        tagColor: "amber",
        borderColor: "red",
        source: "RateCity \u00b7 Mar 2026",
        actions: [
          { label: "Set Refinance Alert", variant: "ghost" },
          { label: "Compare rates", variant: "ghost" },
        ],
      });
    }
  }

  // ---------- Counts by type ----------
  const opportunityCount = insights.filter((i) => i.type === "opportunity").length;
  const actionCount = insights.filter((i) => i.type === "action").length;
  const riskCount = insights.filter((i) => i.type === "risk").length;
  const totalInsights = insights.length;

  // ---------- Tax summary ----------
  const totalDeductions = portfolioTotalDeductions(properties);
  const taxBenefit = portfolioTaxBenefit(properties, marginalRate);

  const unclaimed = properties.filter((p) => p.depreciationAnnual === 0);
  const additionalIfQSClaimed =
    unclaimed.reduce((sum, p) => sum + p.purchasePrice / 40, 0) * marginalRate;

  return (
    <div className="space-y-5">
      {/* ─── 1. Header Row ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[16px] font-bold">
            {totalInsights} Insight{totalInsights !== 1 ? "s" : ""} This Week
          </div>
          <div className="text-[12px] text-[#6b7280]">
            AI-generated &middot; Based on your portfolio, ATO rates, and CoreLogic data
          </div>
        </div>

        <div className="flex items-center gap-2">
          {opportunityCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#d1fae5] text-[#065f46]">
              {opportunityCount} Opportunit{opportunityCount !== 1 ? "ies" : "y"}
            </span>
          )}
          {actionCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#92400e]">
              {actionCount} Action{actionCount !== 1 ? "s" : ""}
            </span>
          )}
          {riskCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#991b1b]">
              {riskCount} Risk{riskCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ─── 2. Insight Cards Grid ─── */}
      {totalInsights === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-8 text-center">
          <div className="text-[#6b7280] text-sm">
            No insights available yet. Add properties to receive AI-powered portfolio analysis.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {insights.map((insight) => (
            <IntelligenceCard
              key={insight.id}
              type={insight.type}
              property={insight.property}
              category={insight.category}
              title={insight.title}
              body={insight.body}
              dollarLabel={insight.dollarLabel}
              tagColor={insight.tagColor}
              borderColor={insight.borderColor}
              source={insight.source}
              actions={insight.actions}
            />
          ))}
        </div>
      )}

      {/* ─── 3. Tax Summary Banner ─── */}
      {properties.length > 0 && (
        <div className="bg-gradient-to-r from-[#0f172a] to-[#1a1d2e] border border-[#2d3148] rounded-xl p-6 flex items-center justify-between">
          {/* Left side */}
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold mb-1">
              FY2026 Tax Position Summary
            </div>
            <div className="text-[18px] font-bold text-white">
              {formatCurrency(totalDeductions)} in total deductions claimed so far
            </div>
            <div className="text-[12px] text-[#94a3b8] mt-1">
              Combined interest, rates, depreciation and property management fees across{" "}
              {properties.length === 1
                ? "your property"
                : `both properties`}
            </div>
          </div>

          {/* Right side */}
          <div className="grid grid-cols-2 gap-6 ml-8">
            <div className="text-right">
              <div className="text-[22px] font-bold text-[#10b981]">
                {formatCurrency(taxBenefit)}
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                Tax benefit at {formatPercent(marginalRate * 100, 0)} rate
              </div>
            </div>
            {additionalIfQSClaimed > 0 && (
              <div className="text-right">
                <div className="text-[22px] font-bold text-[#f59e0b]">
                  +{formatCurrency(additionalIfQSClaimed)}
                </div>
                <div className="text-[11px] text-[#94a3b8]">
                  Additional if QS claimed
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
