-- AlterTable
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessTokenHash" TEXT;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessTokenEncrypted" TEXT;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessTokenIv" TEXT;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessTokenAuthTag" TEXT;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessTokenExpiresAt" DATETIME;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessTokenCreatedAt" DATETIME;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessLastAccessedAt" DATETIME;
ALTER TABLE "EstimateRequest" ADD COLUMN "publicAccessDisabledAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "EstimateRequest_publicAccessTokenHash_key" ON "EstimateRequest"("publicAccessTokenHash");

-- CreateIndex
CREATE INDEX "EstimateRequest_publicAccessTokenExpiresAt_idx" ON "EstimateRequest"("publicAccessTokenExpiresAt");

-- CreateIndex
CREATE INDEX "EstimateRequest_publicAccessDisabledAt_idx" ON "EstimateRequest"("publicAccessDisabledAt");
