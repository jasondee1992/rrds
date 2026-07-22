ALTER TABLE "CompanySetting" ADD COLUMN "companyWebsite" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "companyLogoPath" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'PHP';
ALTER TABLE "CompanySetting" ADD COLUMN "quotationFooter" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "registrationDetails" TEXT;
