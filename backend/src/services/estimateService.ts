import { EstimateRequestStatus, Prisma } from "@prisma/client";
import {
  airconCapacities,
  airconTypes,
  estimateDisclaimer,
  estimateServices,
  propertyTypes,
  samplePricingNotice,
  unitConditions,
  urgencyLevels,
} from "../config/estimatePricing";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { EstimateListQuery, PublicEstimateInput } from "../validations/estimateSchemas";
import {
  buildPublicAccessTokenData,
  calculateValidUntil,
  getAdminEstimatePublicAccess,
} from "./estimateAccessService";
import { calculateEstimate } from "./estimateCalculationService";

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function formatEstimateNumber(year: number, sequence: number) {
  return `EST-${year}-${sequence.toString().padStart(6, "0")}`;
}

async function getNextEstimateNumber(year: number) {
  const prefix = `EST-${year}-`;
  const latestEstimate = await prisma.estimateRequest.findFirst({
    where: {
      estimateNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      estimateNumber: "desc",
    },
    select: {
      estimateNumber: true,
    },
  });

  const latestSequence = latestEstimate
    ? Number(latestEstimate.estimateNumber.replace(prefix, ""))
    : 0;

  return formatEstimateNumber(
    year,
    Number.isFinite(latestSequence) ? latestSequence + 1 : 1,
  );
}

export async function getPublicEstimateOptions() {
  return {
    propertyTypes,
    airconTypes,
    airconCapacities: airconCapacities.map(({ label }) => label),
    services: estimateServices.map(({ label, basePrice }) => ({
      label,
      sampleBasePrice: basePrice,
    })),
    urgencyLevels: urgencyLevels.map(({ label }) => label),
    unitConditions,
    pricingNotice: samplePricingNotice,
    disclaimer: estimateDisclaimer,
  };
}

async function getOrCreateEstimateCustomer(input: PublicEstimateInput) {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [{ email: input.email }, { mobileNumber: input.mobileNumber }],
    },
    orderBy: { createdAt: "asc" },
  });

  if (!existingCustomer) {
    return prisma.customer.create({
      data: {
        fullName: input.fullName,
        companyName: input.companyName,
        email: input.email,
        mobileNumber: input.mobileNumber,
        address: input.serviceAddress,
        city: input.city,
        province: input.province,
      },
    });
  }

  return prisma.customer.update({
    where: { id: existingCustomer.id },
    data: {
      fullName: existingCustomer.fullName || input.fullName,
      companyName: existingCustomer.companyName || input.companyName,
      address: existingCustomer.address || input.serviceAddress,
      city: existingCustomer.city || input.city,
      province: existingCustomer.province || input.province,
    },
  });
}

export async function createPublicEstimate(input: PublicEstimateInput) {
  const companySetting = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
    select: { taxRate: true, estimateValidityDays: true },
  });
  const calculation = calculateEstimate({
    selectedService: input.selectedService,
    airconCapacity: input.airconCapacity,
    quantity: input.quantity,
    urgencyLevel: input.urgencyLevel,
    taxRate: companySetting?.taxRate,
  });
  const customer = await getOrCreateEstimateCustomer(input);
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const estimateNumber = await getNextEstimateNumber(year);
    const generatedDate = new Date();
    const validUntil = calculateValidUntil(
      generatedDate,
      companySetting?.estimateValidityDays ?? 7,
    );
    const tokenData = await buildPublicAccessTokenData(validUntil, generatedDate);

    try {
      const estimateRequest = await prisma.estimateRequest.create({
        data: {
          estimateNumber,
          customerId: customer.id,
          propertyType: input.propertyType,
          serviceAddress: input.serviceAddress,
          airconType: input.airconType,
          airconCapacity: input.airconCapacity,
          quantity: input.quantity,
          brand: input.brand,
          unitCondition: input.unitCondition,
          indoorUnitLocation: input.indoorUnitLocation,
          outdoorUnitLocation: input.outdoorUnitLocation,
          selectedService: input.selectedService,
          preferredDate: input.preferredDate ? new Date(`${input.preferredDate}T00:00:00.000Z`) : null,
          notes: input.notes,
          urgencyLevel: input.urgencyLevel,
          estimatedSubtotal: calculation.estimatedSubtotal,
          estimatedAdditionalFees: calculation.estimatedAdditionalFees,
          estimatedTax: calculation.estimatedTax,
          estimatedTotal: calculation.estimatedTotal,
          ...tokenData.data,
          status: EstimateRequestStatus.SUBMITTED,
          createdAt: generatedDate,
        },
        select: {
          estimateNumber: true,
          status: true,
          selectedService: true,
          createdAt: true,
        },
      });

      return {
        estimateNumber: estimateRequest.estimateNumber,
        publicAccessToken: tokenData.token,
        status: estimateRequest.status,
        selectedService: estimateRequest.selectedService,
        generatedDate: estimateRequest.createdAt,
        validUntil,
        estimatedSubtotal: calculation.display.estimatedSubtotal,
        estimatedAdditionalFees: calculation.display.estimatedAdditionalFees,
        estimatedTax: calculation.display.estimatedTax,
        estimatedTotal: calculation.display.estimatedTotal,
        disclaimer: estimateDisclaimer,
      };
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  throw new AppError("Unable to submit estimate request. Please try again.", 409);
}

function buildEstimateWhere(query: EstimateListQuery): Prisma.EstimateRequestWhereInput {
  const where: Prisma.EstimateRequestWhereInput = {};

  if (query.search) {
    where.OR = [
      { estimateNumber: { contains: query.search } },
      { serviceAddress: { contains: query.search } },
      { customer: { fullName: { contains: query.search } } },
      { customer: { email: { contains: query.search } } },
      { customer: { mobileNumber: { contains: query.search } } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.service) {
    where.selectedService = query.service;
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};

    if (query.dateFrom) {
      where.createdAt.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
    }

    if (query.dateTo) {
      where.createdAt.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
    }
  }

  return where;
}

export async function listEstimateRequests(query: EstimateListQuery) {
  const where = buildEstimateWhere(query);
  const skip = (query.page - 1) * query.limit;
  const orderBy: Prisma.EstimateRequestOrderByWithRelationInput = {
    createdAt: query.sort === "oldest" ? "asc" : "desc",
  };

  const [records, total] = await prisma.$transaction([
    prisma.estimateRequest.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: {
        id: true,
        estimateNumber: true,
        selectedService: true,
        airconType: true,
        airconCapacity: true,
        quantity: true,
        estimatedTotal: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            fullName: true,
            email: true,
            mobileNumber: true,
          },
        },
      },
    }),
    prisma.estimateRequest.count({ where }),
  ]);

  return {
    records: records.map((record) => ({
      ...record,
      estimatedTotal: record.estimatedTotal.toFixed(2),
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getEstimateRequestDetails(id: string) {
  const estimate = await prisma.estimateRequest.findUnique({
    where: { id },
    select: {
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
      internalNotes: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      customer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true,
          mobileNumber: true,
          address: true,
          city: true,
          province: true,
        },
      },
    },
  });

  if (!estimate) {
    throw new AppError("Estimate request not found.", 404);
  }

  return {
    ...estimate,
    estimatedSubtotal: estimate.estimatedSubtotal.toFixed(2),
    estimatedAdditionalFees: estimate.estimatedAdditionalFees.toFixed(2),
    estimatedTax: estimate.estimatedTax.toFixed(2),
    estimatedTotal: estimate.estimatedTotal.toFixed(2),
    publicAccess: await getAdminEstimatePublicAccess(id),
    disclaimer: estimateDisclaimer,
  };
}

export async function updateEstimateRequestStatus(
  id: string,
  status: Extract<
    EstimateRequestStatus,
    "SUBMITTED" | "UNDER_REVIEW" | "ESTIMATE_READY" | "CANCELLED"
  >,
) {
  await getEstimateRequestDetails(id);

  return prisma.estimateRequest.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      estimateNumber: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function updateEstimateRequestNotes(id: string, internalNotes: string) {
  await getEstimateRequestDetails(id);

  return prisma.estimateRequest.update({
    where: { id },
    data: {
      internalNotes: internalNotes || null,
    },
    select: {
      id: true,
      estimateNumber: true,
      internalNotes: true,
      updatedAt: true,
    },
  });
}
