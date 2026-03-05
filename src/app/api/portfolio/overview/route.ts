import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  portfolioEquity,
  portfolioValue,
  portfolioDebt,
  weightedLVR,
  portfolioMonthlyCashflow,
  portfolioGrossYield,
  portfolioTotalDeductions,
  portfolioTaxBenefit,
  portfolioHealthScore,
  lvr,
  monthlyCashflow,
  propertyMonthlyMortgage,
  accessibleEquity,
  capitalGrowth,
  grossYield,
  annualDeductions,
  afterTaxMonthlyCashflow,
} from "@/lib/calculations";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const properties = await prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      portfolioEquity: portfolioEquity(properties),
      portfolioValue: portfolioValue(properties),
      totalDebt: portfolioDebt(properties),
      weightedLVR: weightedLVR(properties),
      monthlyNetCashflow: portfolioMonthlyCashflow(properties),
      grossRentalYield: portfolioGrossYield(properties),
      totalAnnualDeductions: portfolioTotalDeductions(properties),
      annualTaxBenefit: portfolioTaxBenefit(properties),
      propertyCount: properties.length,
    };

    const healthScores = portfolioHealthScore(properties);

    const propertiesWithComputed = properties.map((p) => ({
      ...p,
      equity: p.currentValue - p.loanBalance,
      lvr: lvr(p.loanBalance, p.currentValue),
      monthlyCashflow: monthlyCashflow(p),
      monthlyMortgage: propertyMonthlyMortgage(p),
      accessibleEquity: accessibleEquity(p.currentValue, p.loanBalance),
      capitalGrowth: capitalGrowth(p),
      grossYield: grossYield(p.weeklyRent, p.currentValue),
      annualDeductions: annualDeductions(p),
      afterTaxMonthlyCashflow: afterTaxMonthlyCashflow(p),
    }));

    return NextResponse.json({
      stats,
      healthScores,
      properties: propertiesWithComputed,
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
