import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PropertyForm } from "@/components/property-form";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.userId },
  });

  if (!property) notFound();

  const initialData = {
    id: property.id,
    address: property.address,
    suburb: property.suburb,
    state: property.state,
    postcode: property.postcode,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    landSize: property.landSize,
    purchasePrice: property.purchasePrice,
    purchaseDate: property.purchaseDate.toISOString().split("T")[0],
    currentValue: property.currentValue,
    loanBalance: property.loanBalance,
    interestRate: property.interestRate,
    loanType: property.loanType,
    weeklyRent: property.weeklyRent,
    propertyManagementPct: property.propertyManagementPct,
    councilRatesAnnual: property.councilRatesAnnual,
    insuranceAnnual: property.insuranceAnnual,
    depreciationAnnual: property.depreciationAnnual,
    landTaxAnnual: property.landTaxAnnual,
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PropertyForm mode="edit" initialData={initialData} />
    </div>
  );
}
