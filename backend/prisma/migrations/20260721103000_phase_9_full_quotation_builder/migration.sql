-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN "projectTitle" TEXT NOT NULL DEFAULT 'Untitled Project';
ALTER TABLE "Quotation" ADD COLUMN "customerFullName" TEXT;
ALTER TABLE "Quotation" ADD COLUMN "customerCompanyName" TEXT;
ALTER TABLE "Quotation" ADD COLUMN "customerEmail" TEXT;
ALTER TABLE "Quotation" ADD COLUMN "customerMobileNumber" TEXT;
ALTER TABLE "Quotation" ADD COLUMN "billingAddress" TEXT;
ALTER TABLE "Quotation" ADD COLUMN "serviceAddress" TEXT;

-- AlterTable
ALTER TABLE "QuotationItem" ADD COLUMN "discount" DECIMAL NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityReference" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
