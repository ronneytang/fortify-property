type AustralianState = "VIC" | "NSW" | "QLD" | "SA" | "WA" | "TAS" | "NT" | "ACT";
type PropertyType = "house" | "townhouse" | "apartment";

interface ExpenseEstimate {
  councilRates: number;
  insurance: number;
  depreciation: number;
  landTax: number;
  landTaxNote: string;
}

// Median council rates by state (adjusted by property value relative to $700K median)
const COUNCIL_RATES_BASE: Record<AustralianState, number> = {
  VIC: 1800,
  NSW: 1500,
  QLD: 2200,
  SA: 1600,
  WA: 1800,
  TAS: 1500,
  NT: 2000,
  ACT: 2500,
};

// Insurance base by property type, then adjusted by state + bedrooms
const INSURANCE_BASE: Record<PropertyType, number> = {
  house: 1800,
  townhouse: 1400,
  apartment: 800,
};

const INSURANCE_PER_BEDROOM = 150;

// Insurance state multiplier (QLD/NT higher due to natural disaster risk)
const INSURANCE_STATE_MULT: Record<AustralianState, number> = {
  VIC: 1.0,
  NSW: 1.0,
  QLD: 1.3,
  SA: 0.95,
  WA: 1.05,
  TAS: 0.9,
  NT: 1.5,
  ACT: 0.95,
};

// Land tax thresholds (general rate, individual ownership)
const LAND_TAX: Record<AustralianState, { threshold: number; rate: number }> = {
  VIC: { threshold: 50000, rate: 0.002 },
  NSW: { threshold: 1075000, rate: 0.016 },
  QLD: { threshold: 600000, rate: 0.01 },
  SA: { threshold: 569000, rate: 0.005 },
  WA: { threshold: 300000, rate: 0.002 },
  TAS: { threshold: 87000, rate: 0.005 },
  NT: { threshold: 0, rate: 0 }, // No land tax in NT
  ACT: { threshold: 0, rate: 0 }, // ACT uses rates-based system
};

export function estimateExpenses(params: {
  state: AustralianState;
  propertyType: PropertyType;
  bedrooms: number;
  purchasePrice: number;
  currentValue: number;
  purchaseDate?: string;
}): ExpenseEstimate {
  const { state, propertyType, bedrooms, purchasePrice, currentValue, purchaseDate } = params;
  const medianValue = 700000;

  // Council rates: scale relative to median property value
  const valueRatio = Math.max(0.5, Math.min(2, currentValue / medianValue));
  const councilRates = Math.round((COUNCIL_RATES_BASE[state] * valueRatio) / 100) * 100;

  // Insurance: base + per bedroom, scaled by state risk
  const insuranceRaw = (INSURANCE_BASE[propertyType] + INSURANCE_PER_BEDROOM * bedrooms) * INSURANCE_STATE_MULT[state];
  const insurance = Math.round(insuranceRaw / 50) * 50;

  // Depreciation estimate: based on property age and type
  // Construction cost is ~60% of price for houses, ~80% for apartments
  const constructionPct = propertyType === "apartment" ? 0.8 : propertyType === "townhouse" ? 0.7 : 0.6;
  const constructionCost = purchasePrice * constructionPct;

  let depreciationRate = 0.015; // default medium age
  if (purchaseDate) {
    const yearsSincePurchase = (Date.now() - new Date(purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (yearsSincePurchase < 2) {
      depreciationRate = 0.025; // new build or recent purchase — higher Div 40 items
    } else if (yearsSincePurchase < 7) {
      depreciationRate = 0.018;
    } else if (yearsSincePurchase < 15) {
      depreciationRate = 0.012;
    } else {
      depreciationRate = 0.005; // older property, mostly Div 43 building allowance
    }
  }
  const depreciation = Math.round((constructionCost * depreciationRate) / 100) * 100;

  // Land tax: estimate land value as ~40-60% of current value
  const landValuePct = propertyType === "apartment" ? 0.3 : propertyType === "townhouse" ? 0.4 : 0.5;
  const estLandValue = currentValue * landValuePct;
  const ltConfig = LAND_TAX[state];
  let landTax = 0;
  let landTaxNote = "";

  if (ltConfig.rate === 0) {
    landTaxNote = state === "NT" ? "No land tax in NT" : "ACT uses a rates-based system";
  } else if (estLandValue <= ltConfig.threshold) {
    landTaxNote = `Est. land value ~${formatK(estLandValue)} is below ${state} threshold of ${formatK(ltConfig.threshold)}`;
  } else {
    landTax = Math.round((estLandValue - ltConfig.threshold) * ltConfig.rate / 100) * 100;
    landTaxNote = `Based on est. land value ~${formatK(estLandValue)}, ${state} rate ${(ltConfig.rate * 100).toFixed(1)}%`;
  }

  return { councilRates, insurance, depreciation, landTax, landTaxNote };
}

function formatK(v: number): string {
  return v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`;
}

export function canEstimate(state: string, propertyType: string, bedrooms: string | number): boolean {
  return !!state && !!propertyType && Number(bedrooms) > 0;
}
