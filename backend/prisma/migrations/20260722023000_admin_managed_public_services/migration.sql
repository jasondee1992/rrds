CREATE TABLE "PublicService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companySettingId" TEXT NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imagePath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublicService_companySettingId_fkey" FOREIGN KEY ("companySettingId") REFERENCES "CompanySetting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PublicService_serviceKey_key" ON "PublicService"("serviceKey");
CREATE INDEX "PublicService_companySettingId_idx" ON "PublicService"("companySettingId");
CREATE INDEX "PublicService_serviceKey_idx" ON "PublicService"("serviceKey");
CREATE INDEX "PublicService_sortOrder_idx" ON "PublicService"("sortOrder");
CREATE INDEX "PublicService_isActive_idx" ON "PublicService"("isActive");
