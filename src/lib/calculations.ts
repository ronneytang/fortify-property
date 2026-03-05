import type { Property } from "@prisma/client";

// Monthly mortgage payment (P&I)
export function monthlyMortgage(principal: number, annualRate: number, years: number = 25): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Monthly IO payment
export function monthlyIO(principal: number, annualRate: number): number {
  return principal * (annualRate / 100 / 12);
}

// LVR percentage
export function lvr(loanBalance: number, value: number): number {
  if (value === 0) return 0;
  return (loanBalance / value) * 100;
}

// Accessible equity (to 80% LVR)
export function accessibleEquity(value: number, loanBalance: number): number {
  const max = value * 0.8;
  return Math.max(0, max - loanBalance);
}

// Monthly rental income
export function monthlyRent(weeklyRent: number): number {
  return (weeklyRent * 52) / 12;
}

// Monthly mortgage for a property
export function propertyMonthlyMortgage(property: Property): number {
  return property.loanType === "PI"
    ? monthlyMortgage(property.loanBalance, property.interestRate)
    : monthlyIO(property.loanBalance, property.interestRate);
}

// Monthly cashflow for a property
export function monthlyCashflow(property: Property): number {
  const income = monthlyRent(property.weeklyRent);
  const mortgage = propertyMonthlyMortgage(property);
  const mgmt = income * (property.propertyManagementPct / 100);
  const rates = (property.councilRatesAnnual + property.insuranceAnnual) / 12;
  return income - mortgage - mgmt - rates;
}

// Annual interest expense
export function annualInterest(property: Property): number {
  return (property.interestRate / 100) * property.loanBalance;
}

// Annual deductions for a property
export function annualDeductions(property: Property): number {
  const interest = annualInterest(property);
  const rates = property.councilRatesAnnual;
  const insurance = property.insuranceAnnual;
  const mgmt = property.weeklyRent * 52 * (property.propertyManagementPct / 100);
  const depreciation = property.depreciationAnnual;
  const landTax = property.landTaxAnnual;
  return interest + rates + insurance + mgmt + depreciation + landTax;
}

// After-tax effective monthly cost (negative gearing benefit)
export function afterTaxMonthlyCashflow(property: Property, marginalRate: number = 0.39): number {
  const gross = monthlyCashflow(property);
  if (gross >= 0) return gross;

  const deductions = annualDeductions(property);
  const annualIncome = property.weeklyRent * 52;
  const netLoss = Math.max(0, deductions - annualIncome);
  const monthlyTaxBenefit = (netLoss * marginalRate) / 12;
  return gross + monthlyTaxBenefit;
}

// Capital growth
export function capitalGrowth(property: Property): number {
  return property.currentValue - property.purchasePrice;
}

// Gross rental yield
export function grossYield(weeklyRent: number, value: number): number {
  if (value === 0) return 0;
  return ((weeklyRent * 52) / value) * 100;
}

// Portfolio-level calculations
export function portfolioEquity(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + (p.currentValue - p.loanBalance), 0);
}

export function portfolioValue(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + p.currentValue, 0);
}

export function portfolioDebt(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + p.loanBalance, 0);
}

export function weightedLVR(properties: Property[]): number {
  const totalDebt = portfolioDebt(properties);
  const totalValue = portfolioValue(properties);
  if (totalValue === 0) return 0;
  return (totalDebt / totalValue) * 100;
}

export function portfolioMonthlyCashflow(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + monthlyCashflow(p), 0);
}

export function portfolioGrossYield(properties: Property[]): number {
  const totalRent = properties.reduce((sum, p) => sum + p.weeklyRent * 52, 0);
  const totalValue = portfolioValue(properties);
  if (totalValue === 0) return 0;
  return (totalRent / totalValue) * 100;
}

export function portfolioTotalDeductions(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + annualDeductions(p), 0);
}

export function portfolioTaxBenefit(properties: Property[], marginalRate: number = 0.39): number {
  const totalDeductions = portfolioTotalDeductions(properties);
  const totalIncome = properties.reduce((sum, p) => sum + p.weeklyRent * 52, 0);
  const netLoss = Math.max(0, totalDeductions - totalIncome);
  return netLoss * marginalRate;
}

// Portfolio Health Score (0-100)
export interface HealthScores {
  overall: number;
  equityGrowth: number;
  cashflow: number;
  taxEfficiency: number;
  diversification: number;
  lvrSafety: number;
  portfolioYield: number;
}

export function portfolioHealthScore(properties: Property[]): HealthScores {
  if (properties.length === 0) {
    return { overall: 0, equityGrowth: 0, cashflow: 0, taxEfficiency: 0, diversification: 0, lvrSafety: 0, portfolioYield: 0 };
  }

  // Equity Growth: based on average capital growth percentage
  const avgGrowthPct = properties.reduce((sum, p) => {
    const growth = ((p.currentValue - p.purchasePrice) / p.purchasePrice) * 100;
    return sum + growth;
  }, 0) / properties.length;
  const equityGrowth = Math.min(100, Math.max(0, avgGrowthPct * 1.5)); // 66%+ growth = 100

  // Cashflow: 100 = positive, 0 = -$10K/mo
  const totalCashflow = portfolioMonthlyCashflow(properties);
  const cashflow = Math.min(100, Math.max(0, ((totalCashflow + 10000) / 10000) * 50));

  // Tax Efficiency: based on % of properties with depreciation claimed
  const withDepreciation = properties.filter(p => p.depreciationAnnual > 0).length;
  const taxEfficiency = Math.min(100, (withDepreciation / properties.length) * 80 + 20);

  // Diversification: based on unique suburbs and states
  const uniqueSuburbs = new Set(properties.map(p => p.suburb)).size;
  const uniqueStates = new Set(properties.map(p => p.state)).size;
  const diversification = Math.min(100, (uniqueSuburbs * 20) + (uniqueStates * 15));

  // LVR Safety: 100 = all under 60%, 0 = all over 90%
  const avgLVR = weightedLVR(properties);
  const lvrSafety = Math.min(100, Math.max(0, ((90 - avgLVR) / 30) * 100));

  // Portfolio Yield: based on gross yield
  const yield_ = portfolioGrossYield(properties);
  const portfolioYield = Math.min(100, yield_ * 20); // 5%+ = 100

  const overall = Math.round(
    equityGrowth * 0.2 +
    cashflow * 0.2 +
    taxEfficiency * 0.15 +
    diversification * 0.15 +
    lvrSafety * 0.15 +
    portfolioYield * 0.15
  );

  return {
    overall,
    equityGrowth: Math.round(equityGrowth),
    cashflow: Math.round(cashflow),
    taxEfficiency: Math.round(taxEfficiency),
    diversification: Math.round(diversification),
    lvrSafety: Math.round(lvrSafety),
    portfolioYield: Math.round(portfolioYield),
  };
}

// Format helpers
export function formatCurrency(value: number, compact?: boolean): string {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${value < 0 ? "-" : ""}$${Math.round(abs / 1_000)}K`;
  }
  const formatted = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return value < 0 ? `−${formatted}` : formatted;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
