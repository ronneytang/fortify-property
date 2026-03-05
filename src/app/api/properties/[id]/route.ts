import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const property = await prisma.property.findFirst({
      where: { id, userId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const existing = await prisma.property.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(body.address != null && { address: body.address }),
        ...(body.suburb != null && { suburb: body.suburb }),
        ...(body.state != null && { state: body.state }),
        ...(body.postcode != null && { postcode: body.postcode }),
        ...(body.purchasePrice != null && {
          purchasePrice: body.purchasePrice,
        }),
        ...(body.purchaseDate != null && {
          purchaseDate: new Date(body.purchaseDate),
        }),
        ...(body.currentValue != null && { currentValue: body.currentValue }),
        ...(body.loanBalance != null && { loanBalance: body.loanBalance }),
        ...(body.interestRate != null && { interestRate: body.interestRate }),
        ...(body.loanType != null && { loanType: body.loanType }),
        ...(body.weeklyRent != null && { weeklyRent: body.weeklyRent }),
        ...(body.propertyType != null && { propertyType: body.propertyType }),
        ...(body.bedrooms != null && { bedrooms: body.bedrooms }),
        ...(body.propertyManagementPct != null && {
          propertyManagementPct: body.propertyManagementPct,
        }),
        ...(body.councilRatesAnnual != null && {
          councilRatesAnnual: body.councilRatesAnnual,
        }),
        ...(body.insuranceAnnual != null && {
          insuranceAnnual: body.insuranceAnnual,
        }),
        ...(body.depreciationAnnual != null && {
          depreciationAnnual: body.depreciationAnnual,
        }),
        ...(body.landTaxAnnual != null && {
          landTaxAnnual: body.landTaxAnnual,
        }),
        ...(body.landSize != null && { landSize: body.landSize }),
      },
    });

    return NextResponse.json({ property });
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const existing = await prisma.property.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ success: true });
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
