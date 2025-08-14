-- CreateEnum
CREATE TYPE "public"."Unit" AS ENUM ('SQFT', 'LF', 'PIECE', 'ROLL', 'DAY', 'HOUR');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('Residential', 'Nonresidential');

-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('LumpSum', 'Separated');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrgSettings" (
    "id" TEXT NOT NULL,
    "overheadPercent" DECIMAL(65,30) NOT NULL DEFAULT 15.0,
    "mileageRatePerMile" DECIMAL(65,30) NOT NULL DEFAULT 0.70,
    "perDiemPerDay" DECIMAL(65,30) NOT NULL DEFAULT 30.00,
    "defaultSalesTaxRatePct" DECIMAL(65,30),
    "bucketSetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BucketSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BucketSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BucketDef" (
    "id" TEXT NOT NULL,
    "bucketSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percent" DECIMAL(65,30) NOT NULL,
    "meta" JSONB,

    CONSTRAINT "BucketDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "defaultCost" DECIMAL(65,30) NOT NULL,
    "defaultPrice" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryStock" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "address" TEXT,
    "propertyType" "public"."PropertyType" NOT NULL,
    "contractType" "public"."ContractType" NOT NULL,
    "salesTaxRatePct" DECIMAL(65,30),
    "salesperson" TEXT,
    "channel" TEXT,
    "productType" TEXT,
    "quoteTotal" DECIMAL(65,30) NOT NULL,
    "paymentPlan" TEXT NOT NULL,
    "overheadOverridePct" DECIMAL(65,30),
    "warrantyReservePct" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChangeOrder" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Purchase" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "shippingCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PurchaseLine" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "description" TEXT NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PurchaseLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobMaterial" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "description" TEXT NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "quantityUsed" DECIMAL(65,30) NOT NULL,
    "fromStock" BOOLEAN NOT NULL DEFAULT false,
    "wastePercent" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "JobMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LaborEntry" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "units" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaborEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TravelEntry" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "miles" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "perDiemDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lodging" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "other" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "TravelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "feePct" DECIMAL(65,30),
    "feeFlat" DECIMAL(65,30),
    "receivedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BucketAllocation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BucketAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "public"."InventoryItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Job_code_key" ON "public"."Job"("code");

-- AddForeignKey
ALTER TABLE "public"."OrgSettings" ADD CONSTRAINT "OrgSettings_bucketSetId_fkey" FOREIGN KEY ("bucketSetId") REFERENCES "public"."BucketSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BucketDef" ADD CONSTRAINT "BucketDef_bucketSetId_fkey" FOREIGN KEY ("bucketSetId") REFERENCES "public"."BucketSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryStock" ADD CONSTRAINT "InventoryStock_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChangeOrder" ADD CONSTRAINT "ChangeOrder_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseLine" ADD CONSTRAINT "PurchaseLine_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseLine" ADD CONSTRAINT "PurchaseLine_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobMaterial" ADD CONSTRAINT "JobMaterial_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobMaterial" ADD CONSTRAINT "JobMaterial_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LaborEntry" ADD CONSTRAINT "LaborEntry_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TravelEntry" ADD CONSTRAINT "TravelEntry_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BucketAllocation" ADD CONSTRAINT "BucketAllocation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
