import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Clock,
  BarChart3,
  DollarSign,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  portfolioEquity,
  portfolioValue,
  portfolioDebt,
  weightedLVR,
  portfolioMonthlyCashflow,
  portfolioGrossYield,
  portfolioTaxBenefit,
  portfolioHealthScore,
  lvr,
  monthlyRent,
  propertyMonthlyMortgage,
  formatCurrency,
  formatPercent,
  accessibleEquity,
} from "@/lib/calculations";
import { StatCard } from "@/components/stat-card";
import { EquityBar } from "@/components/equity-bar";
import { CashflowBreakdown } from "@/components/cashflow-breakdown";
import { HealthScore } from "@/components/health-score";

export default async function DashboardPage() {
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

  // Portfolio-level calculations
  const totalEquity = portfolioEquity(properties);
  const totalValue = portfolioValue(properties);
  const totalDebt = portfolioDebt(properties);
  const lvrValue = weightedLVR(properties);
  const netCashflow = portfolioMonthlyCashflow(properties);
  const grossYield = portfolioGrossYield(properties);
  const taxBenefit = portfolioTaxBenefit(properties, user.marginalTaxRate);
  const healthScores = portfolioHealthScore(properties);

  // Determine LVR status
  const lvrChangeType: "positive" | "warning" | "negative" =
    lvrValue > 80 ? "negative" : lvrValue > 65 ? "warning" : "positive";
  const lvrColor =
    lvrValue > 80 ? "#ef4444" : lvrValue > 65 ? "#f59e0b" : undefined;

  // Health score status
  const healthStatus: "good" | "warning" | "action" =
    healthScores.overall >= 70
      ? "good"
      : healthScores.overall >= 50
        ? "warning"
        : "action";

  // Cashflow breakdown lines
  const cashflowLines: {
    label: string;
    value: string;
    color: "green" | "red" | "muted";
    bold?: boolean;
  }[] = [];

  // Add each property's rent
  for (const p of properties) {
    const rent = monthlyRent(p.weeklyRent);
    cashflowLines.push({
      label: `${p.suburb} rent`,
      value: `+${formatCurrency(rent)}`,
      color: "green",
    });
  }

  if (properties.length > 0) {
    cashflowLines.push({ label: "---", value: "", color: "muted" });
  }

  // Add each property's mortgage
  for (const p of properties) {
    const mortgage = propertyMonthlyMortgage(p);
    cashflowLines.push({
      label: `${p.suburb} mortgage`,
      value: `-${formatCurrency(mortgage)}`,
      color: "red",
    });
  }

  // Rates + PM fees total
  if (properties.length > 0) {
    const totalRates = properties.reduce(
      (sum, p) =>
        sum +
        (p.councilRatesAnnual + p.insuranceAnnual) / 12 +
        monthlyRent(p.weeklyRent) * (p.propertyManagementPct / 100),
      0
    );
    cashflowLines.push({
      label: "Rates + PM fees",
      value: `-${formatCurrency(totalRates)}`,
      color: "red",
    });

    cashflowLines.push({ label: "---", value: "", color: "muted" });
  }

  // Tax benefit info
  const taxBenefitMonthly = taxBenefit / 12;
  const effectiveNet = netCashflow + taxBenefitMonthly;
  const taxBenefitInfo =
    netCashflow < 0 && properties.length > 0
      ? {
          label: `Neg. gearing benefit (${Math.round(user.marginalTaxRate * 100)}% rate)`,
          value: `+${formatCurrency(taxBenefitMonthly)}/mo`,
          effectiveLabel: "Effective net cost",
          effectiveValue: formatCurrency(effectiveNet),
        }
      : undefined;

  // Equity chart months
  const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  return (
    <div className="space-y-4">
      {/* AI Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1a1d2e] border border-[#2d3148] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#10b981]" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white">
              {properties.length > 0
                ? `${Math.min(properties.length * 2, 7)} new insights found this week`
                : "0 new insights found this week"}
            </div>
            <div className="text-[11px] text-[#94a3b8]">
              AI-powered analysis of your portfolio performance
            </div>
          </div>
        </div>
        <Link
          href="/intelligence"
          className="inline-flex items-center gap-1 bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          View Insights &rarr;
        </Link>
      </div>

      {/* Stat Cards Row */}
      {properties.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-8 text-center">
          <div className="text-[#6b7280] text-sm">
            No properties yet. Add your first property to see portfolio stats.
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-3">
            <StatCard
              icon={<Home className="w-4 h-4 stroke-[#10b981]" />}
              iconBg="bg-[#f0fdf4]"
              label="Portfolio Equity"
              value={formatCurrency(totalEquity, true)}
              change={`${formatCurrency(accessibleEquity(totalValue, totalDebt), true)} accessible`}
              changeType="positive"
            />
            <StatCard
              icon={<Clock className="w-4 h-4 stroke-[#3b82f6]" />}
              iconBg="bg-[#eff6ff]"
              label="Portfolio Value"
              value={formatCurrency(totalValue, true)}
              change={`${properties.length} ${properties.length === 1 ? "property" : "properties"}`}
              changeType="neutral"
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4 stroke-[#f59e0b]" />}
              iconBg="bg-[#fef3c7]"
              label="Weighted LVR"
              value={formatPercent(lvrValue)}
              valueColor={lvrColor}
              change={
                lvrValue > 80
                  ? "Above 80% - high risk"
                  : lvrValue > 65
                    ? "Above 65% - monitor"
                    : "Healthy range"
              }
              changeType={lvrChangeType}
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4 stroke-[#ef4444]" />}
              iconBg="bg-[#fef2f2]"
              label="Net Monthly Cashflow"
              value={formatCurrency(netCashflow)}
              valueColor={netCashflow < 0 ? "#ef4444" : undefined}
              change={
                netCashflow < 0
                  ? `${formatCurrency(effectiveNet)}/mo after tax`
                  : "Positive cashflow"
              }
              changeType={netCashflow < 0 ? "negative" : "positive"}
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4 stroke-[#8b5cf6]" />}
              iconBg="bg-[#f3e8ff]"
              label="Gross Rental Yield"
              value={formatPercent(grossYield)}
              change={
                grossYield >= 5
                  ? "Strong yield"
                  : grossYield >= 3.5
                    ? "Average yield"
                    : "Below average"
              }
              changeType={
                grossYield >= 5
                  ? "positive"
                  : grossYield >= 3.5
                    ? "neutral"
                    : "warning"
              }
            />
          </div>

          {/* Two-column section */}
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            {/* Left: Equity vs Debt */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[13px] font-semibold">
                    Equity vs Debt per Property
                  </div>
                  <div className="text-[11px] text-[#6b7280]">
                    Current LVR position
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[10px] font-semibold text-[#64748b]">
                  CoreLogic est.
                </span>
              </div>

              {properties.map((p) => {
                const propLVR = lvr(p.loanBalance, p.currentValue);
                const equityPct =
                  p.currentValue > 0
                    ? ((p.currentValue - p.loanBalance) / p.currentValue) * 100
                    : 0;
                return (
                  <EquityBar
                    key={p.id}
                    propertyName={p.suburb}
                    subtitle={`${p.propertyType} | ${p.bedrooms} bed`}
                    equityAmount={formatCurrency(
                      p.currentValue - p.loanBalance,
                      true
                    )}
                    debtAmount={formatCurrency(p.loanBalance, true)}
                    lvrPercent={propLVR}
                    equityPercent={Math.max(0, equityPct)}
                  />
                );
              })}

              {/* Portfolio Total */}
              <div className="bg-[#f8fafc] rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Portfolio Total</div>
                    <div className="text-[10px] text-[#6b7280]">
                      {properties.length}{" "}
                      {properties.length === 1 ? "property" : "properties"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs">
                      <span className="text-[#10b981] font-bold">
                        {formatCurrency(totalEquity, true)}
                      </span>
                      <span className="text-[#6b7280] mx-1">equity</span>
                      <span className="text-[#6b7280]">|</span>
                      <span className="text-[#6b7280] mx-1">
                        {formatCurrency(totalDebt, true)} debt
                      </span>
                      <span className="text-[#6b7280]">|</span>
                      <span className="text-[#6b7280] mx-1">
                        LVR {formatPercent(lvrValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equity Growth Sparkline */}
              <div className="mt-4">
                <div className="text-[10px] text-[#9ca3af] font-semibold tracking-wider mb-2">
                  EQUITY GROWTH (12 MONTHS)
                </div>
                <svg
                  width="100%"
                  height="50"
                  viewBox="0 0 400 50"
                  preserveAspectRatio="none"
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="equityGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 45 Q50 42 100 38 T200 28 T300 18 T400 8"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <path
                    d="M0 45 Q50 42 100 38 T200 28 T300 18 T400 8 L400 50 L0 50 Z"
                    fill="url(#equityGrad)"
                  />
                </svg>
                <div className="flex justify-between text-[9px] text-[#9ca3af] mt-1">
                  {months.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Cashflow Breakdown */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <div className="text-[13px] font-semibold">
                  Monthly Cashflow
                </div>
                <div className="text-[11px] text-[#6b7280]">
                  Before tax benefits
                </div>
              </div>
              <CashflowBreakdown
                lines={cashflowLines}
                netLabel="Net monthly"
                netValue={formatCurrency(netCashflow)}
                netPositive={netCashflow >= 0}
                taxBenefit={taxBenefitInfo}
                footnote={
                  taxBenefitInfo
                    ? `Effective cost is your true out-of-pocket after claiming negative gearing deductions at your ${Math.round(user.marginalTaxRate * 100)}% marginal tax rate.`
                    : undefined
                }
              />
            </div>
          </div>

          {/* Portfolio Health Score */}
          <HealthScore
            overall={healthScores.overall}
            status={healthStatus}
            scores={[
              { label: "Equity Growth", value: healthScores.equityGrowth },
              { label: "Cashflow", value: healthScores.cashflow },
              { label: "Tax Efficiency", value: healthScores.taxEfficiency },
              { label: "Diversification", value: healthScores.diversification },
              { label: "LVR Safety", value: healthScores.lvrSafety },
              { label: "Portfolio Yield", value: healthScores.portfolioYield },
            ]}
          />
        </>
      )}
    </div>
  );
}
