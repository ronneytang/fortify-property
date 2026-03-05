-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "borrowingCapacity" DOUBLE PRECISION,
    "cashDeposit" DOUBLE PRECISION,
    "marginalTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.39,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "loanBalance" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "loanType" TEXT NOT NULL,
    "weeklyRent" DOUBLE PRECISION NOT NULL,
    "propertyManagementPct" DOUBLE PRECISION NOT NULL DEFAULT 8.5,
    "councilRatesAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depreciationAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landTaxAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "propertyType" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "landSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
