ALTER TABLE "CompanySetting" ADD COLUMN "homeHeroEyebrow" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeHeroTitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeHeroSubtitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homePrimaryCtaLabel" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homePrimaryCtaPath" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeSecondaryCtaLabel" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeSecondaryCtaPath" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeStats" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeWhyEyebrow" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeWhyTitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeWhyDescription" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeServicesEyebrow" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeServicesTitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeServicesDescription" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeAboutEyebrow" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeAboutTitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeAboutDescription" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeAboutCtaLabel" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeProjectsEyebrow" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeProjectsTitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeProjectsDescription" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeTestimonialsEyebrow" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeTestimonialsTitle" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "homeTestimonialsDescription" TEXT;

CREATE TABLE "HomeCarouselImage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companySettingId" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "HomeCarouselImage_companySettingId_fkey" FOREIGN KEY ("companySettingId") REFERENCES "CompanySetting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "HomeCarouselImage_companySettingId_idx" ON "HomeCarouselImage"("companySettingId");
CREATE INDEX "HomeCarouselImage_sortOrder_idx" ON "HomeCarouselImage"("sortOrder");

UPDATE "CompanySetting"
SET
  "homeHeroEyebrow" = COALESCE("homeHeroEyebrow", 'RRDS Airconditioning Services'),
  "homeHeroTitle" = COALESCE("homeHeroTitle", 'KEEPING YOU COOL. ALWAYS.'),
  "homeHeroSubtitle" = COALESCE("homeHeroSubtitle", 'Professional air-conditioning installation, maintenance, cleaning, and repair services for homes and businesses.'),
  "homePrimaryCtaLabel" = COALESCE("homePrimaryCtaLabel", 'Request Free Quotation'),
  "homePrimaryCtaPath" = COALESCE("homePrimaryCtaPath", '/free-quotation'),
  "homeSecondaryCtaLabel" = COALESCE("homeSecondaryCtaLabel", 'Contact Us'),
  "homeSecondaryCtaPath" = COALESCE("homeSecondaryCtaPath", '/contact'),
  "homeStats" = COALESCE("homeStats", '[{"label":"Residential Support","value":"Homes"},{"label":"Commercial Support","value":"Businesses"},{"label":"Service Focus","value":"Cooling Comfort"}]'),
  "homeWhyEyebrow" = COALESCE("homeWhyEyebrow", 'Why Choose RRDS'),
  "homeWhyTitle" = COALESCE("homeWhyTitle", 'Reliable Air-Conditioning Support'),
  "homeWhyDescription" = COALESCE("homeWhyDescription", 'Built around dependable workmanship, practical recommendations, and responsive support.'),
  "homeServicesEyebrow" = COALESCE("homeServicesEyebrow", 'Our Services'),
  "homeServicesTitle" = COALESCE("homeServicesTitle", 'Aircon Services for Homes and Businesses'),
  "homeServicesDescription" = COALESCE("homeServicesDescription", 'Core RRDS public service offerings shown with editable placeholder descriptions.'),
  "homeAboutEyebrow" = COALESCE("homeAboutEyebrow", 'About RRDS'),
  "homeAboutTitle" = COALESCE("homeAboutTitle", 'Professional service with a focus on comfort and reliability.'),
  "homeAboutDescription" = COALESCE("homeAboutDescription", 'RRDS Airconditioning Services is presented here with editable placeholder content. This section can later be updated with approved company details while keeping the focus on quality work, reliable service, and support for both residential and commercial customers.'),
  "homeAboutCtaLabel" = COALESCE("homeAboutCtaLabel", 'Learn More About RRDS'),
  "homeProjectsEyebrow" = COALESCE("homeProjectsEyebrow", 'Sample Projects'),
  "homeProjectsTitle" = COALESCE("homeProjectsTitle", 'Project Preview'),
  "homeProjectsDescription" = COALESCE("homeProjectsDescription", 'Sample cards only. Replace these with verified RRDS project details during a later phase.'),
  "homeTestimonialsEyebrow" = COALESCE("homeTestimonialsEyebrow", 'Testimonials'),
  "homeTestimonialsTitle" = COALESCE("homeTestimonialsTitle", 'What Customers May Say'),
  "homeTestimonialsDescription" = COALESCE("homeTestimonialsDescription", 'Placeholder testimonials for layout approval. Replace with verified customer feedback later.');
