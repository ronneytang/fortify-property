import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/property-card";
import {
  lvr,
  monthlyCashflow,
  propertyMonthlyMortgage,
  accessibleEquity,
  capitalGrowth,
  annualDeductions,
  monthlyRent,
  formatCurrency,
} from "@/lib/calculations";

export default async function PropertiesPage() {
  const session = await requireAuth();
  const properties = await prisma.property.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      {properties.map((p) => {
        const equity = p.currentValue - p.loanBalance;
        const lvrPct = lvr(p.loanBalance, p.currentValue);
        const rent = monthlyRent(p.weeklyRent);
        const mortgage = propertyMonthlyMortgage(p);
        const rates = (p.councilRatesAnnual + p.insuranceAnnual) / 12;
        const cashflow = monthlyCashflow(p);
        const growth = capitalGrowth(p);
        const equityAccess = accessibleEquity(p.currentValue, p.loanBalance);
        const deductions = annualDeductions(p);

        const warnings: string[] = [];
        if (p.depreciationAnnual === 0) {
          const estDepr = Math.round(p.purchasePrice / 40);
          warnings.push(
            `Quantity Surveyor report not yet claimed. Estimated ${formatCurrency(estDepr)}/yr in depreciation deductions available.`
          );
        }
        if (lvrPct >= 80) {
          // Don't add extra warning, the "High LVR" tag handles it
        }
        if (p.interestRate > 5.94 + 0.5) {
          warnings.push(
            `Interest rate ${p.interestRate.toFixed(2)}% is ${(p.interestRate - 5.94).toFixed(2)}% above market best. Consider refinancing when LVR drops below 70%.`
          );
        }

        const tags: {
          label: string;
          color: "green" | "amber" | "blue" | "red";
        }[] = [{ label: "Investment", color: "green" }];
        if (cashflow < 0) tags.push({ label: "Neg. Geared", color: "blue" });
        if (lvrPct >= 80) tags.push({ label: "High LVR", color: "amber" });

        // Determine value label based on whether it's a recent purchase
        const isRecentPurchase = growth === 0;
        const valueLabel = isRecentPurchase
          ? "Purchase Price"
          : "Current Est. Value";
        const valueDate = isRecentPurchase
          ? `Settled ${new Date(p.purchaseDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`
          : `CoreLogic \u00b7 ${new Date().toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`;

        return (
          <PropertyCard
            key={p.id}
            id={p.id}
            address={p.address}
            suburb={p.suburb}
            state={p.state}
            postcode={p.postcode}
            propertyType={p.propertyType}
            bedrooms={p.bedrooms}
            currentValue={p.currentValue}
            valueLabel={valueLabel}
            valueDate={valueDate}
            tags={tags}
            metrics={{
              equity,
              loanBalance: p.loanBalance,
              lvrPercent: lvrPct,
              monthlyRent: rent,
              monthlyMortgage: -mortgage,
              monthlyRates: rates,
              netCashflow: cashflow,
              purchasePrice: p.purchasePrice,
              capitalGrowth: growth,
              interestRate: p.interestRate,
              taxDeductionsYTD: deductions,
              depreciationAnnual: p.depreciationAnnual,
              accessibleEquity: equityAccess,
              loanType: p.loanType === "PI" ? "P&I" : "IO",
            }}
            warnings={warnings}
          />
        );
      })}
    </div>
  );
}
