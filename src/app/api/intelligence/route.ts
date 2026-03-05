import { NextResponse } from "next/server";
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
} from "@/lib/calculations";

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

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const properties = await prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const insights: Insight[] = [];

    for (const property of properties) {
      const propertyLVR = lvr(property.loanBalance, property.currentValue);

      // 1. Equity Unlock - LVR < 65%
      if (propertyLVR < 65) {
        const equity = accessibleEquity(
          property.currentValue,
          property.loanBalance
        );
        insights.push({
          id: `equity-unlock-${property.id}`,
          type: "opportunity",
          property: property.suburb,
          category: "LVR milestone",
          title: `Equity available in ${property.suburb}`,
          body: `Your LVR of ${propertyLVR.toFixed(1)}% is well below 80%. You could access up to $${Math.round(equity / 1000)}K in equity for your next deposit or renovations.`,
          dollarValue: equity,
          dollarLabel: `Access $${Math.round(equity / 1000)}K`,
          tagColor: "green",
          borderColor: "emerald",
          source: "LVR & equity analysis",
          actions: [
            { label: "Explore options", variant: "primary" },
            { label: "Dismiss", variant: "ghost" },
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
        const cgtDiscount = growth * 0.5 * 0.39;
        insights.push({
          id: `cgt-timing-${property.id}`,
          type: "opportunity",
          property: property.suburb,
          category: "CGT planning",
          title: `CGT discount applies to ${property.suburb}`,
          body: `Held for ${Math.floor(holdingMonths / 12)}+ years with $${Math.round(growth / 1000)}K capital gain. The 50% CGT discount could save you ~$${Math.round(cgtDiscount / 1000)}K if you sell in the right financial year.`,
          dollarValue: cgtDiscount,
          dollarLabel: `Save $${Math.round(cgtDiscount / 1000)}K`,
          tagColor: "green",
          borderColor: "emerald",
          source: "CGT & holding period analysis",
          actions: [
            { label: "View CGT estimate", variant: "primary" },
            { label: "Dismiss", variant: "ghost" },
          ],
        });
      }

      // 3. Depreciation Gap - depreciationAnnual === 0
      if (property.depreciationAnnual === 0) {
        const estimatedDepreciation = property.purchasePrice / 40;
        const taxSaving = estimatedDepreciation * 0.39;
        insights.push({
          id: `depreciation-gap-${property.id}`,
          type: "action",
          property: property.suburb,
          category: "Depreciation",
          title: `No depreciation claimed on ${property.suburb}`,
          body: `You're not claiming depreciation on this property. A quantity surveyor report could unlock ~$${Math.round(estimatedDepreciation / 1000)}K/year in deductions, saving ~$${Math.round(taxSaving / 1000)}K in tax annually.`,
          dollarValue: taxSaving,
          dollarLabel: `Save $${Math.round(taxSaving / 1000)}K`,
          tagColor: "amber",
          borderColor: "amber",
          source: "Depreciation schedule analysis",
          actions: [
            { label: "Get QS quote", variant: "primary" },
            { label: "Dismiss", variant: "ghost" },
          ],
        });
      }

      // 4. Rate Comparison - interestRate > 5.94%
      if (property.interestRate > 5.94) {
        const extraAnnualCost =
          ((property.interestRate - 5.94) / 100) * property.loanBalance;
        insights.push({
          id: `rate-comparison-${property.id}`,
          type: "risk",
          property: property.suburb,
          category: "Interest rate",
          title: `Above-market rate on ${property.suburb}`,
          body: `Your rate of ${property.interestRate.toFixed(2)}% is above the competitive benchmark of 5.94%. Refinancing could save ~$${Math.round(extraAnnualCost / 1000)}K per year.`,
          dollarValue: extraAnnualCost,
          dollarLabel: `Save $${Math.round(extraAnnualCost / 1000)}K/yr`,
          tagColor: "red",
          borderColor: "red",
          source: "Rate comparison analysis",
          actions: [
            { label: "Compare rates", variant: "primary" },
            { label: "Dismiss", variant: "ghost" },
          ],
        });
      }
    }

    // Portfolio-level: Negative Gearing Summary
    if (properties.length > 0) {
      const totalDeductions = portfolioTotalDeductions(properties);
      const taxBenefit = portfolioTaxBenefit(properties);
      const monthlyCashflow = portfolioMonthlyCashflow(properties);
      const effectiveHoldingCost = Math.abs(
        monthlyCashflow < 0 ? monthlyCashflow + taxBenefit / 12 : 0
      );

      insights.push({
        id: "negative-gearing-summary",
        type: "opportunity",
        category: "Negative gearing",
        title: "Negative gearing tax benefit summary",
        body: `Your portfolio claims $${Math.round(totalDeductions / 1000)}K in annual deductions, generating a tax benefit of ~$${Math.round(taxBenefit / 1000)}K at the 39% marginal rate. Effective monthly holding cost after tax: $${Math.round(effectiveHoldingCost).toLocaleString()}.`,
        dollarValue: taxBenefit,
        dollarLabel: `$${Math.round(taxBenefit / 1000)}K tax benefit`,
        tagColor: "green",
        borderColor: "emerald",
        source: "Portfolio tax analysis",
        actions: [
          { label: "View breakdown", variant: "primary" },
          { label: "Dismiss", variant: "ghost" },
        ],
      });
    }

    // Tax summary
    const totalDeductions = portfolioTotalDeductions(properties);
    const taxBenefit = portfolioTaxBenefit(properties);

    // Additional tax benefit if QS (depreciation) claimed on all unclaimed properties
    const unclaimed = properties.filter((p) => p.depreciationAnnual === 0);
    const additionalIfQSClaimed =
      unclaimed.reduce((sum, p) => sum + p.purchasePrice / 40, 0) * 0.39;

    return NextResponse.json({
      insights,
      taxSummary: {
        totalDeductions,
        taxBenefit,
        additionalIfQSClaimed,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
