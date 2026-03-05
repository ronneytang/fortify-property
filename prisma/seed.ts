import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@fortifyproperty.com",
      name: "Ronney Tang",
      passwordHash: hashSync("demo1234", 10),
      borrowingCapacity: 680000,
      cashDeposit: 80000,
      marginalTaxRate: 0.39,
    },
  });

  // Property 1: Keilor East
  await prisma.property.create({
    data: {
      userId: user.id,
      address: "12 Outlook Drive",
      suburb: "Keilor East",
      state: "VIC",
      postcode: "3033",
      purchasePrice: 580000,
      purchaseDate: new Date("2019-06-15"),
      currentValue: 920000,
      loanBalance: 538000,
      interestRate: 5.98,
      loanType: "PI",
      weeklyRent: 507,
      propertyManagementPct: 8.5,
      councilRatesAnnual: 2400,
      insuranceAnnual: 2400,
      depreciationAnnual: 8200,
      landTaxAnnual: 0,
      propertyType: "house",
      bedrooms: 4,
      landSize: 620,
    },
  });

  // Property 2: Maidstone
  await prisma.property.create({
    data: {
      userId: user.id,
      address: "47 Cross Street",
      suburb: "Maidstone",
      state: "VIC",
      postcode: "3012",
      purchasePrice: 1039000,
      purchaseDate: new Date("2026-03-01"),
      currentValue: 1039000,
      loanBalance: 831200,
      interestRate: 6.85,
      loanType: "PI",
      weeklyRent: 646,
      propertyManagementPct: 8.5,
      councilRatesAnnual: 2400,
      insuranceAnnual: 2400,
      depreciationAnnual: 0, // Intentionally unclaimed
      landTaxAnnual: 0,
      propertyType: "house",
      bedrooms: 3,
      landSize: 450,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
