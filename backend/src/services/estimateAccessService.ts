import crypto from "crypto";
import { EstimateRequestStatus, Prisma } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { estimateDisclaimer } from "../config/estimatePricing";
import { AppError } from "../utils/AppError";

export const PUBLIC_ESTIMATE_UNAVAILABLE_MESSAGE =
  "This estimate is unavailable or the access link is invalid.";

const allowedPublicStatuses = new Set<EstimateRequestStatus>([
  EstimateRequestStatus.SUBMITTED,
  EstimateRequestStatus.UNDER_REVIEW,
  EstimateRequestStatus.ESTIMATE_READY,
  EstimateRequestStatus.CONVERTED_TO_QUOTATION,
]);

const publicEstimateSelect = {
  id: true,
  estimateNumber: true,
  propertyType: true,
  serviceAddress: true,
  airconType: true,
  airconCapacity: true,
  quantity: true,
  brand: true,
  unitCondition: true,
  indoorUnitLocation: true,
  outdoorUnitLocation: true,
  selectedService: true,
  preferredDate: true,
  notes: true,
  urgencyLevel: true,
  estimatedSubtotal: true,
  estimatedAdditionalFees: true,
  estimatedTax: true,
  estimatedTotal: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  publicAccessTokenHash: true,
  publicAccessTokenEncrypted: true,
  publicAccessTokenIv: true,
  publicAccessTokenAuthTag: true,
  publicAccessTokenExpiresAt: true,
  publicAccessTokenCreatedAt: true,
  publicAccessLastAccessedAt: true,
  publicAccessDisabledAt: true,
  customer: {
    select: {
      fullName: true,
      companyName: true,
      email: true,
      mobileNumber: true,
      address: true,
      city: true,
      province: true,
    },
  },
} satisfies Prisma.EstimateRequestSelect;

type EstimateDocumentRecord = Prisma.EstimateRequestGetPayload<{
  select: typeof publicEstimateSelect;
}>;

function getEncryptionKey() {
  return crypto.createHash("sha256").update(env.JWT_SECRET).digest();
}

function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);

  return {
    encrypted: encrypted.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
  };
}

function decryptToken(record: Pick<
  EstimateDocumentRecord,
  "publicAccessTokenEncrypted" | "publicAccessTokenIv" | "publicAccessTokenAuthTag"
>) {
  if (
    !record.publicAccessTokenEncrypted ||
    !record.publicAccessTokenIv ||
    !record.publicAccessTokenAuthTag
  ) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(record.publicAccessTokenIv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(record.publicAccessTokenAuthTag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(record.publicAccessTokenEncrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export function generatePublicAccessToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashPublicAccessToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildPublicEstimateUrl(token: string) {
  return `${env.FRONTEND_URL.replace(/\/$/, "")}/estimate/${token}`;
}

export function calculateValidUntil(generatedDate: Date, validityDays: number) {
  const validUntil = new Date(generatedDate);
  validUntil.setDate(validUntil.getDate() + validityDays);
  return validUntil;
}

export async function buildPublicAccessTokenData(
  validUntil?: Date | null,
  generatedDate = new Date(),
) {
  const token = generatePublicAccessToken();
  const encryptedToken = encryptToken(token);

  return {
    token,
    data: {
      publicAccessTokenHash: hashPublicAccessToken(token),
      publicAccessTokenEncrypted: encryptedToken.encrypted,
      publicAccessTokenIv: encryptedToken.iv,
      publicAccessTokenAuthTag: encryptedToken.authTag,
      publicAccessTokenCreatedAt: generatedDate,
      publicAccessTokenExpiresAt: validUntil ?? null,
      publicAccessDisabledAt: null,
      publicAccessLastAccessedAt: null,
    },
  };
}

function decimalToString(value: Prisma.Decimal) {
  return value.toFixed(2);
}

function buildPublicAccessState(estimate: EstimateDocumentRecord) {
  const token = decryptToken(estimate);
  const isEnabled = Boolean(
    estimate.publicAccessTokenHash && !estimate.publicAccessDisabledAt && token,
  );

  return {
    enabled: isEnabled,
    createdAt: estimate.publicAccessTokenCreatedAt,
    expiresAt: estimate.publicAccessTokenExpiresAt,
    lastAccessedAt: estimate.publicAccessLastAccessedAt,
    disabledAt: estimate.publicAccessDisabledAt,
    publicUrl: isEnabled && token ? buildPublicEstimateUrl(token) : null,
  };
}

export async function getCompanySettingForEstimate() {
  return prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      companyName: true,
      companyAddress: true,
      companyPhone: true,
      companyEmail: true,
      estimateValidityDays: true,
      estimateDisclaimer: true,
    },
  });
}

export function toPublicEstimateDocument(
  estimate: EstimateDocumentRecord,
  companySetting: Awaited<ReturnType<typeof getCompanySettingForEstimate>>,
) {
  const validUntil =
    estimate.publicAccessTokenExpiresAt ??
    calculateValidUntil(estimate.createdAt, companySetting?.estimateValidityDays ?? 7);

  return {
    estimateNumber: estimate.estimateNumber,
    propertyType: estimate.propertyType,
    serviceAddress: estimate.serviceAddress,
    airconType: estimate.airconType,
    airconCapacity: estimate.airconCapacity,
    quantity: estimate.quantity,
    brand: estimate.brand,
    unitCondition: estimate.unitCondition,
    indoorUnitLocation: estimate.indoorUnitLocation,
    outdoorUnitLocation: estimate.outdoorUnitLocation,
    selectedService: estimate.selectedService,
    preferredDate: estimate.preferredDate,
    notes: estimate.notes,
    urgencyLevel: estimate.urgencyLevel,
    estimatedSubtotal: decimalToString(estimate.estimatedSubtotal),
    estimatedAdditionalFees: decimalToString(estimate.estimatedAdditionalFees),
    estimatedTax: decimalToString(estimate.estimatedTax),
    estimatedTotal: decimalToString(estimate.estimatedTotal),
    status: estimate.status,
    generatedDate: estimate.createdAt,
    validUntil,
    disclaimer: companySetting?.estimateDisclaimer || estimateDisclaimer,
    requiredDisclaimer:
      "This document is an automated preliminary estimate only and is not an official quotation, invoice, purchase order, contract, or billing document.\n\nFinal pricing is subject to site inspection, technical assessment, availability of materials, actual installation requirements, and approval by RRDS Airconditioning Services.",
    company: {
      name: companySetting?.companyName ?? "RRDS Airconditioning Services",
      address: companySetting?.companyAddress ?? "Philippines",
      phone: companySetting?.companyPhone ?? "To be updated",
      email: companySetting?.companyEmail ?? "admin@example.com",
    },
    customer: {
      fullName: estimate.customer.fullName,
      companyName: estimate.customer.companyName,
      email: estimate.customer.email,
      mobileNumber: estimate.customer.mobileNumber,
      address: estimate.customer.address,
      city: estimate.customer.city,
      province: estimate.customer.province,
    },
  };
}

export type PublicEstimateDocument = ReturnType<typeof toPublicEstimateDocument>;

function isPubliclyAccessible(estimate: EstimateDocumentRecord) {
  if (!estimate.publicAccessTokenHash || estimate.publicAccessDisabledAt) {
    return false;
  }

  if (!allowedPublicStatuses.has(estimate.status)) {
    return false;
  }

  if (
    estimate.publicAccessTokenExpiresAt &&
    estimate.publicAccessTokenExpiresAt.getTime() < Date.now()
  ) {
    return false;
  }

  return true;
}

export async function getPublicEstimateDocumentByToken(token: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { publicAccessTokenHash: hashPublicAccessToken(token) },
    select: publicEstimateSelect,
  });

  if (!estimate || !isPubliclyAccessible(estimate)) {
    console.warn("Invalid or unavailable public estimate access attempted.");
    throw new AppError(PUBLIC_ESTIMATE_UNAVAILABLE_MESSAGE, 404);
  }

  const companySetting = await getCompanySettingForEstimate();

  await prisma.estimateRequest
    .update({
      where: { id: estimate.id },
      data: { publicAccessLastAccessedAt: new Date() },
      select: { id: true },
    })
    .catch(() => undefined);

  return toPublicEstimateDocument(estimate, companySetting);
}

export async function getAdminEstimateDocumentById(id: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: publicEstimateSelect,
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  const companySetting = await getCompanySettingForEstimate();

  return toPublicEstimateDocument(estimate, companySetting);
}

export async function getAdminEstimatePublicAccess(id: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: publicEstimateSelect,
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  return buildPublicAccessState(estimate);
}

export async function regenerateEstimatePublicAccessToken(id: string, adminId: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
      createdAt: true,
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  const companySetting = await getCompanySettingForEstimate();
  const validUntil = calculateValidUntil(
    estimate.createdAt,
    companySetting?.estimateValidityDays ?? 7,
  );
  const tokenData = await buildPublicAccessTokenData(validUntil);

  await prisma.estimateRequest.update({
    where: { id },
    data: tokenData.data,
    select: { id: true },
  });

  console.info(
    `Public estimate access token regenerated for ${estimate.estimateNumber} by admin ${adminId}.`,
  );

  return {
    publicAccessToken: tokenData.token,
    publicUrl: buildPublicEstimateUrl(tokenData.token),
    expiresAt: validUntil,
  };
}

export async function disableEstimatePublicAccessToken(id: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  await prisma.estimateRequest.update({
    where: { id },
    data: {
      publicAccessTokenHash: null,
      publicAccessTokenEncrypted: null,
      publicAccessTokenIv: null,
      publicAccessTokenAuthTag: null,
      publicAccessDisabledAt: new Date(),
    },
    select: { id: true },
  });

  return {
    estimateNumber: estimate.estimateNumber,
    disabled: true,
  };
}
