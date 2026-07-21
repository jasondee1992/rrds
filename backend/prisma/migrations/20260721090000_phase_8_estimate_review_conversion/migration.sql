-- AlterTable
ALTER TABLE "EstimateRequest" ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "EstimateRequest" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "EstimateRequest" ADD COLUMN "reviewSummary" TEXT;
ALTER TABLE "EstimateRequest" ADD COLUMN "recommendedSiteInspection" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "EstimateRequest" ADD COLUMN "recommendedServiceDate" DATETIME;

-- CreateTable
CREATE TABLE "EstimateRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateRequestId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "baseAmount" DECIMAL NOT NULL DEFAULT 0,
    "capacityAdjustment" DECIMAL NOT NULL DEFAULT 0,
    "urgencyAdjustment" DECIMAL NOT NULL DEFAULT 0,
    "additionalFees" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "taxRate" DECIMAL NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "subtotal" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EstimateRevision_estimateRequestId_fkey" FOREIGN KEY ("estimateRequestId") REFERENCES "EstimateRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EstimateRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EstimateRequest_reviewedById_idx" ON "EstimateRequest"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateRevision_estimateRequestId_revisionNumber_key" ON "EstimateRevision"("estimateRequestId", "revisionNumber");

-- CreateIndex
CREATE INDEX "EstimateRevision_estimateRequestId_idx" ON "EstimateRevision"("estimateRequestId");

-- CreateIndex
CREATE INDEX "EstimateRevision_createdById_idx" ON "EstimateRevision"("createdById");

-- CreateIndex
CREATE INDEX "EstimateRevision_createdAt_idx" ON "EstimateRevision"("createdAt");
