import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const properties = await prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
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

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();

    const {
      address,
      suburb,
      state,
      postcode,
      purchasePrice,
      purchaseDate,
      currentValue,
      loanBalance,
      interestRate,
      loanType,
      weeklyRent,
      propertyType,
      bedrooms,
      propertyManagementPct,
      councilRatesAnnual,
      insuranceAnnual,
      depreciationAnnual,
      landTaxAnnual,
      landSize,
    } = body;

    if (
      !address ||
      !suburb ||
      !state ||
      !postcode ||
      purchasePrice == null ||
      !purchaseDate ||
      currentValue == null ||
      loanBalance == null ||
      interestRate == null ||
      !loanType ||
      weeklyRent == null ||
      !propertyType ||
      bedrooms == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        userId,
        address,
        suburb,
        state,
        postcode,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
        currentValue,
        loanBalance,
        interestRate,
        loanType,
        weeklyRent,
        propertyType,
        bedrooms,
        ...(propertyManagementPct != null && { propertyManagementPct }),
        ...(councilRatesAnnual != null && { councilRatesAnnual }),
        ...(insuranceAnnual != null && { insuranceAnnual }),
        ...(depreciationAnnual != null && { depreciationAnnual }),
        ...(landTaxAnnual != null && { landTaxAnnual }),
        ...(landSize != null && { landSize }),
      },
    });

    return NextResponse.json({ property }, { status: 201 });
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
