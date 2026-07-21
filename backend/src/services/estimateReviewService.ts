import {
  EstimateRequestStatus,
  Prisma,
  QuotationItemType,
  QuotationStatus,
} from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { SaveEstimateReviewInput } from "../validations/estimateSchemas";

function decimal(value: string | number | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

function money(value: Prisma.Decimal) {
  return value.toFixed(2);
}

function calculateReviewedEstimate(input: SaveEstimateReviewInput["revision"]) {
  const quantity = decimal(input.quantity);
  const baseAmount = decimal(input.baseAmount);
  const capacityAdjustment = decimal(input.capacityAdjustment);
  const urgencyAdjustment = decimal(input.urgencyAdjustment);
  const additionalFees = decimal(input.additionalFees);
  const discount = decimal(input.discount);
  const taxRate = decimal(input.taxRate);
  const subtotalBeforeDiscount = baseAmount
    .mul(quantity)
    .plus(capacityAdjustment)
    .plus(urgencyAdjustment)
    .plus(additionalFees);

  if (discount.greaterThan(subtotalBeforeDiscount)) {
    throw new AppError("Discount cannot be greater than the reviewed subtotal.", 400);
  }

  const subtotal = subtotalBeforeDiscount.minus(discount);
  const taxAmount = subtotal.mul(taxRate).div(100);
  const total = subtotal.plus(taxAmount);

  return {
    quantity: input.quantity,
    baseAmount,
    capacityAdjustment,
    urgencyAdjustment,
    additionalFees,
    discount,
    taxRate,
    taxAmount,
    subtotal,
    total,
  };
}

export function toRevisionResponse<
  T extends {
    id: string;
    revisionNumber: number;
    serviceDescription: string;
    quantity: number;
    baseAmount: Prisma.Decimal;
    capacityAdjustment: Prisma.Decimal;
    urgencyAdjustment: Prisma.Decimal;
    additionalFees: Prisma.Decimal;
    discount: Prisma.Decimal;
    taxRate: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    total: Prisma.Decimal;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: { id: string; fullName: string; email: string } | null;
  },
>(revision: T) {
  return {
    id: revision.id,
    revisionNumber: revision.revisionNumber,
    serviceDescription: revision.serviceDescription,
    quantity: revision.quantity,
    baseAmount: money(revision.baseAmount),
    capacityAdjustment: money(revision.capacityAdjustment),
    urgencyAdjustment: money(revision.urgencyAdjustment),
    additionalFees: money(revision.additionalFees),
    discount: money(revision.discount),
    taxRate: money(revision.taxRate),
    taxAmount: money(revision.taxAmount),
    subtotal: money(revision.subtotal),
    total: money(revision.total),
    notes: revision.notes,
    createdAt: revision.createdAt,
    updatedAt: revision.updatedAt,
    createdBy: revision.createdBy ?? null,
  };
}

async function getNextRevisionNumber(estimateRequestId: string) {
  const latestRevision = await prisma.estimateRevision.findFirst({
    where: { estimateRequestId },
    orderBy: { revisionNumber: "desc" },
    select: { revisionNumber: true },
  });

  return (latestRevision?.revisionNumber ?? 0) + 1;
}

function calculateValidUntil(quotationDate: Date, days: number) {
  const validUntil = new Date(quotationDate);
  validUntil.setDate(validUntil.getDate() + days);
  return validUntil;
}

function formatQuotationNumber(year: number, sequence: number) {
  return `QTN-${year}-${sequence.toString().padStart(6, "0")}`;
}

async function getNextQuotationNumber(tx: Prisma.TransactionClient, year: number) {
  const prefix = `QTN-${year}-`;
  const latestQuotation = await tx.quotation.findFirst({
    where: {
      quotationNumber: {
        startsWith: prefix,
      },
    },
    orderBy: { quotationNumber: "desc" },
    select: { quotationNumber: true },
  });
  const latestSequence = latestQuotation
    ? Number(latestQuotation.quotationNumber.replace(prefix, ""))
    : 0;

  return formatQuotationNumber(
    year,
    Number.isFinite(latestSequence) ? latestSequence + 1 : 1,
  );
}

function logEstimateAudit(action: string, estimateNumber: string, adminId: string) {
  console.info(`${action}: ${estimateNumber} by admin ${adminId}.`);
}

export async function startEstimateReview(id: string, adminId: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  if (estimate.status !== EstimateRequestStatus.SUBMITTED) {
    throw new AppError("Only submitted estimates can start review.", 409);
  }

  const updatedEstimate = await prisma.estimateRequest.update({
    where: { id },
    data: {
      status: EstimateRequestStatus.UNDER_REVIEW,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
      reviewedAt: true,
      updatedAt: true,
    },
  });

  logEstimateAudit("Estimate review started", updatedEstimate.estimateNumber, adminId);

  return updatedEstimate;
}

export async function saveEstimateReview(
  id: string,
  input: SaveEstimateReviewInput,
  adminId: string,
) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  if (
    estimate.status === EstimateRequestStatus.CANCELLED ||
    estimate.status === EstimateRequestStatus.CONVERTED_TO_QUOTATION
  ) {
    throw new AppError("This estimate can no longer be reviewed.", 409);
  }

  const calculation = calculateReviewedEstimate(input.revision);
  const recommendedServiceDate = input.recommendedServiceDate
    ? new Date(`${input.recommendedServiceDate}T00:00:00.000Z`)
    : null;

  const revision = await prisma.$transaction(async (tx) => {
    const revisionNumber =
      ((await tx.estimateRevision.findFirst({
        where: { estimateRequestId: id },
        orderBy: { revisionNumber: "desc" },
        select: { revisionNumber: true },
      }))?.revisionNumber ?? 0) + 1;

    await tx.estimateRequest.update({
      where: { id },
      data: {
        status:
          estimate.status === EstimateRequestStatus.SUBMITTED
            ? EstimateRequestStatus.UNDER_REVIEW
            : estimate.status,
        internalNotes: input.internalNotes || null,
        reviewedById: adminId,
        reviewedAt: new Date(),
        reviewSummary: input.reviewSummary || null,
        recommendedSiteInspection: input.recommendedSiteInspection,
        recommendedServiceDate,
      },
      select: { id: true },
    });

    return tx.estimateRevision.create({
      data: {
        estimateRequestId: id,
        revisionNumber,
        serviceDescription: input.revision.serviceDescription,
        quantity: calculation.quantity,
        baseAmount: calculation.baseAmount,
        capacityAdjustment: calculation.capacityAdjustment,
        urgencyAdjustment: calculation.urgencyAdjustment,
        additionalFees: calculation.additionalFees,
        discount: calculation.discount,
        taxRate: calculation.taxRate,
        taxAmount: calculation.taxAmount,
        subtotal: calculation.subtotal,
        total: calculation.total,
        notes: input.revision.notes || null,
        createdById: adminId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  });

  logEstimateAudit("Estimate review values changed", estimate.estimateNumber, adminId);

  return toRevisionResponse(revision);
}

export async function markEstimateReady(id: string, adminId: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
      revisions: {
        orderBy: { revisionNumber: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  if (estimate.status !== EstimateRequestStatus.UNDER_REVIEW) {
    throw new AppError("Only estimates under review can be marked ready.", 409);
  }

  if (estimate.revisions.length === 0) {
    throw new AppError("Save reviewed values before marking the estimate ready.", 409);
  }

  const updatedEstimate = await prisma.estimateRequest.update({
    where: { id },
    data: {
      status: EstimateRequestStatus.ESTIMATE_READY,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
      updatedAt: true,
    },
  });

  logEstimateAudit("Estimate marked ready", estimate.estimateNumber, adminId);

  return updatedEstimate;
}

export async function cancelEstimateRequest(id: string, adminId: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  if (estimate.status === EstimateRequestStatus.CONVERTED_TO_QUOTATION) {
    throw new AppError("Converted estimates cannot be cancelled.", 409);
  }

  const updatedEstimate = await prisma.estimateRequest.update({
    where: { id },
    data: {
      status: EstimateRequestStatus.CANCELLED,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
      updatedAt: true,
    },
  });

  logEstimateAudit("Estimate cancelled", estimate.estimateNumber, adminId);

  return updatedEstimate;
}

export async function ensureInitialEstimateRevision(id: string, adminId: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
      id: true,
      estimateNumber: true,
      selectedService: true,
      quantity: true,
      estimatedSubtotal: true,
      estimatedAdditionalFees: true,
      estimatedTax: true,
      estimatedTotal: true,
      revisions: {
        orderBy: { revisionNumber: "desc" },
        take: 1,
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  if (estimate.revisions[0]) {
    return toRevisionResponse(estimate.revisions[0]);
  }

  const subtotalWithoutAdditionalFees = estimate.estimatedSubtotal.minus(
    estimate.estimatedAdditionalFees,
  );
  const baseAmount = subtotalWithoutAdditionalFees.div(estimate.quantity);

  const revision = await prisma.estimateRevision.create({
    data: {
      estimateRequestId: estimate.id,
      revisionNumber: await getNextRevisionNumber(estimate.id),
      serviceDescription: estimate.selectedService,
      quantity: estimate.quantity,
      baseAmount,
      capacityAdjustment: 0,
      urgencyAdjustment: 0,
      additionalFees: estimate.estimatedAdditionalFees,
      discount: 0,
      taxRate: estimate.estimatedSubtotal.equals(0)
        ? 0
        : estimate.estimatedTax.mul(100).div(estimate.estimatedSubtotal),
      taxAmount: estimate.estimatedTax,
      subtotal: estimate.estimatedSubtotal,
      total: estimate.estimatedTotal,
      notes: "Initial review snapshot from saved client estimate.",
      createdById: adminId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return toRevisionResponse(revision);
}

function buildQuotationItemData(revision: {
  serviceDescription: string;
  quantity: number;
  baseAmount: Prisma.Decimal;
  capacityAdjustment: Prisma.Decimal;
  urgencyAdjustment: Prisma.Decimal;
  additionalFees: Prisma.Decimal;
}) {
  const items: Prisma.QuotationItemCreateWithoutQuotationInput[] = [];
  const serviceAmount = revision.baseAmount.mul(revision.quantity);

  if (serviceAmount.greaterThan(0)) {
    items.push({
      itemType: QuotationItemType.SERVICE,
      description: revision.serviceDescription,
      quantity: revision.quantity,
      unit: "service",
      unitPrice: revision.baseAmount,
      amount: serviceAmount,
      sortOrder: items.length + 1,
    });
  }

  if (revision.capacityAdjustment.greaterThan(0)) {
    items.push({
      itemType: QuotationItemType.OTHER,
      description: "Capacity adjustment",
      quantity: 1,
      unit: "lot",
      unitPrice: revision.capacityAdjustment,
      amount: revision.capacityAdjustment,
      sortOrder: items.length + 1,
    });
  }

  if (revision.urgencyAdjustment.greaterThan(0)) {
    items.push({
      itemType: QuotationItemType.OTHER,
      description: "Urgency adjustment",
      quantity: 1,
      unit: "lot",
      unitPrice: revision.urgencyAdjustment,
      amount: revision.urgencyAdjustment,
      sortOrder: items.length + 1,
    });
  }

  if (revision.additionalFees.greaterThan(0)) {
    items.push({
      itemType: QuotationItemType.OTHER,
      description: "Additional estimated fees",
      quantity: 1,
      unit: "lot",
      unitPrice: revision.additionalFees,
      amount: revision.additionalFees,
      sortOrder: items.length + 1,
    });
  }

  return items;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function convertEstimateToDraftQuotation(id: string, adminId: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const estimate = await tx.estimateRequest.findUnique({
          where: { id },
          include: {
            customer: true,
            quotation: {
              select: {
                id: true,
                quotationNumber: true,
              },
            },
            revisions: {
              orderBy: { revisionNumber: "desc" },
              take: 1,
            },
          },
        });

        if (!estimate) {
          throw new AppError("Estimate request not found.", 404);
        }

        if (estimate.status === EstimateRequestStatus.CANCELLED) {
          throw new AppError("Cancelled estimates cannot be converted.", 409);
        }

        if (
          estimate.status === EstimateRequestStatus.CONVERTED_TO_QUOTATION ||
          estimate.quotation
        ) {
          throw new AppError(
            estimate.quotation
              ? `Estimate is already linked to quotation ${estimate.quotation.quotationNumber}.`
              : "Estimate has already been converted.",
            409,
          );
        }

        if (estimate.status !== EstimateRequestStatus.ESTIMATE_READY) {
          throw new AppError("Mark the estimate ready before converting it.", 409);
        }

        const revision = estimate.revisions[0];

        if (!revision || revision.total.lessThanOrEqualTo(0)) {
          throw new AppError("A valid reviewed estimate revision is required.", 409);
        }

        const companySetting = await tx.companySetting.findFirst({
          orderBy: { createdAt: "asc" },
          select: {
            quotationValidityDays: true,
            quotationTerms: true,
          },
        });
        const quotationDate = new Date();
        const quotationNumber = await getNextQuotationNumber(tx, quotationDate.getFullYear());
        const validUntil = calculateValidUntil(
          quotationDate,
          companySetting?.quotationValidityDays ?? 30,
        );
        const quotationItems = buildQuotationItemData(revision);

        if (quotationItems.length === 0) {
          throw new AppError("A quotation must include at least one billable item.", 409);
        }

        const quotation = await tx.quotation.create({
          data: {
            quotationNumber,
            customerId: estimate.customerId,
            estimateRequestId: estimate.id,
            quotationDate,
            validUntil,
            subtotal: revision.subtotal,
            discount: revision.discount,
            taxRate: revision.taxRate,
            taxAmount: revision.taxAmount,
            additionalFees: revision.additionalFees,
            grandTotal: revision.total,
            scopeOfWork: [
              revision.serviceDescription,
              `Service address: ${estimate.serviceAddress}`,
              `Reference estimate: ${estimate.estimateNumber}`,
            ].join("\n"),
            exclusions:
              "Final exclusions and detailed scope will be completed in the quotation editor.",
            paymentTerms:
              companySetting?.quotationTerms ||
              "Payment terms will be finalized before the quotation is sent for approval.",
            warrantyTerms:
              "Warranty terms will be finalized before the quotation is sent for approval.",
            notes: revision.notes || estimate.reviewSummary || "",
            preparedById: adminId,
            status: QuotationStatus.DRAFT,
            items: {
              create: quotationItems,
            },
          },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            grandTotal: true,
          },
        });

        await tx.estimateRequest.update({
          where: { id },
          data: {
            status: EstimateRequestStatus.CONVERTED_TO_QUOTATION,
            reviewedById: adminId,
            reviewedAt: quotationDate,
          },
          select: { id: true },
        });

        return {
          quotation: {
            ...quotation,
            grandTotal: money(quotation.grandTotal),
          },
          estimate: {
            id: estimate.id,
            estimateNumber: estimate.estimateNumber,
            status: EstimateRequestStatus.CONVERTED_TO_QUOTATION,
          },
        };
      });
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 9) {
        throw error;
      }
    }
  }

  throw new AppError("Unable to generate a unique quotation number.", 409);
}
