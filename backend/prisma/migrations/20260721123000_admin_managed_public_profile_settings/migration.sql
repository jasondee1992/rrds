ALTER TABLE "CompanySetting" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderName" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderRole" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderExperienceYears" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderShortBiography" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderFullBiography" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderCurrentResponsibility" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderImagePath" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "founderExpertise" TEXT;

UPDATE "CompanySetting"
SET
  "facebookUrl" = COALESCE("facebookUrl", 'https://www.facebook.com/RRDSAirconServices'),
  "linkedinUrl" = COALESCE("linkedinUrl", NULL),
  "founderName" = COALESCE("founderName", 'Ramon Dela Cruz'),
  "founderRole" = COALESCE("founderRole", 'Founder & Lead Air-Conditioning Technician'),
  "founderExperienceYears" = COALESCE("founderExperienceYears", '15+'),
  "founderShortBiography" = COALESCE("founderShortBiography", 'RRDS is led by an experienced air-conditioning technician with more than 15 years of hands-on experience in residential and commercial systems. He currently handles the air-conditioning service and maintenance requirements of Makati Palace Hotel and personally oversees the technical quality of RRDS projects.'),
  "founderFullBiography" = COALESCE("founderFullBiography", 'With more than 15 years of hands-on experience in the air-conditioning industry, our founder and lead technician has developed extensive knowledge in diagnosing, repairing, maintaining, and installing different types of air-conditioning systems.' || char(10) || char(10) || 'He is experienced in handling window-type, split-type, floor-mounted, cassette, ceiling-mounted, centralized, and commercial air-conditioning units from various major brands.' || char(10) || char(10) || 'He currently oversees and handles the air-conditioning service and maintenance requirements of Makati Palace Hotel, giving him extensive experience in managing both individual units and large-scale commercial air-conditioning operations.' || char(10) || char(10) || 'His hands-on leadership ensures that every RRDS project is approached with proper technical assessment, reliable workmanship, and a strong commitment to customer satisfaction.'),
  "founderCurrentResponsibility" = COALESCE("founderCurrentResponsibility", 'Currently Handling Air-Conditioning Operations at Makati Palace Hotel'),
  "founderExpertise" = COALESCE("founderExpertise", '["Residential Air-Conditioning Systems","Commercial Air-Conditioning Systems","Installation and Replacement","Preventive Maintenance","Troubleshooting and Diagnostics","Aircon Repair","Cleaning and General Maintenance","Multi-Unit and Hotel Aircon Operations"]')
WHERE "founderName" IS NULL
   OR "founderRole" IS NULL
   OR "founderExpertise" IS NULL;
