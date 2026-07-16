-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'CONTACT_FORM',
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstimateRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "serviceAddress" TEXT NOT NULL,
    "airconType" TEXT NOT NULL,
    "airconCapacity" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "selectedService" TEXT NOT NULL,
    "preferredDate" DATETIME NOT NULL,
    "notes" TEXT NOT NULL,
    "estimatedSubtotal" DECIMAL NOT NULL DEFAULT 0,
    "estimatedAdditionalFees" DECIMAL NOT NULL DEFAULT 0,
    "estimatedTax" DECIMAL NOT NULL DEFAULT 0,
    "estimatedTotal" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EstimateRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "estimateRequestId" TEXT,
    "quotationDate" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "subtotal" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "taxRate" DECIMAL NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "additionalFees" DECIMAL NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL NOT NULL DEFAULT 0,
    "scopeOfWork" TEXT NOT NULL,
    "exclusions" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "warrantyTerms" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "preparedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quotation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quotation_estimateRequestId_fkey" FOREIGN KEY ("estimateRequestId") REFERENCES "EstimateRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quotation_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "AdminUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quotation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL DEFAULT 0,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanySetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "quotationValidityDays" INTEGER NOT NULL DEFAULT 30,
    "estimateValidityDays" INTEGER NOT NULL DEFAULT 7,
    "taxRate" DECIMAL NOT NULL DEFAULT 0,
    "estimateDisclaimer" TEXT NOT NULL,
    "quotationTerms" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_fullName_idx" ON "AdminUser"("fullName");

-- CreateIndex
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");

-- CreateIndex
CREATE INDEX "Customer_fullName_idx" ON "Customer"("fullName");

-- CreateIndex
CREATE INDEX "Customer_companyName_idx" ON "Customer"("companyName");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_mobileNumber_idx" ON "Customer"("mobileNumber");

-- CreateIndex
CREATE INDEX "Customer_city_idx" ON "Customer"("city");

-- CreateIndex
CREATE INDEX "Customer_province_idx" ON "Customer"("province");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_referenceNumber_key" ON "Inquiry"("referenceNumber");

-- CreateIndex
CREATE INDEX "Inquiry_customerId_idx" ON "Inquiry"("customerId");

-- CreateIndex
CREATE INDEX "Inquiry_fullName_idx" ON "Inquiry"("fullName");

-- CreateIndex
CREATE INDEX "Inquiry_email_idx" ON "Inquiry"("email");

-- CreateIndex
CREATE INDEX "Inquiry_mobileNumber_idx" ON "Inquiry"("mobileNumber");

-- CreateIndex
CREATE INDEX "Inquiry_subject_idx" ON "Inquiry"("subject");

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX "Inquiry_source_idx" ON "Inquiry"("source");

-- CreateIndex
CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateRequest_estimateNumber_key" ON "EstimateRequest"("estimateNumber");

-- CreateIndex
CREATE INDEX "EstimateRequest_customerId_idx" ON "EstimateRequest"("customerId");

-- CreateIndex
CREATE INDEX "EstimateRequest_propertyType_idx" ON "EstimateRequest"("propertyType");

-- CreateIndex
CREATE INDEX "EstimateRequest_airconType_idx" ON "EstimateRequest"("airconType");

-- CreateIndex
CREATE INDEX "EstimateRequest_selectedService_idx" ON "EstimateRequest"("selectedService");

-- CreateIndex
CREATE INDEX "EstimateRequest_preferredDate_idx" ON "EstimateRequest"("preferredDate");

-- CreateIndex
CREATE INDEX "EstimateRequest_status_idx" ON "EstimateRequest"("status");

-- CreateIndex
CREATE INDEX "EstimateRequest_createdAt_idx" ON "EstimateRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_estimateRequestId_key" ON "Quotation"("estimateRequestId");

-- CreateIndex
CREATE INDEX "Quotation_customerId_idx" ON "Quotation"("customerId");

-- CreateIndex
CREATE INDEX "Quotation_preparedById_idx" ON "Quotation"("preparedById");

-- CreateIndex
CREATE INDEX "Quotation_approvedById_idx" ON "Quotation"("approvedById");

-- CreateIndex
CREATE INDEX "Quotation_quotationDate_idx" ON "Quotation"("quotationDate");

-- CreateIndex
CREATE INDEX "Quotation_validUntil_idx" ON "Quotation"("validUntil");

-- CreateIndex
CREATE INDEX "Quotation_status_idx" ON "Quotation"("status");

-- CreateIndex
CREATE INDEX "Quotation_createdAt_idx" ON "Quotation"("createdAt");

-- CreateIndex
CREATE INDEX "QuotationItem_quotationId_idx" ON "QuotationItem"("quotationId");

-- CreateIndex
CREATE INDEX "QuotationItem_itemType_idx" ON "QuotationItem"("itemType");

-- CreateIndex
CREATE INDEX "QuotationItem_description_idx" ON "QuotationItem"("description");

-- CreateIndex
CREATE INDEX "QuotationItem_sortOrder_idx" ON "QuotationItem"("sortOrder");

-- CreateIndex
CREATE INDEX "CompanySetting_companyName_idx" ON "CompanySetting"("companyName");

-- CreateIndex
CREATE INDEX "CompanySetting_companyEmail_idx" ON "CompanySetting"("companyEmail");
