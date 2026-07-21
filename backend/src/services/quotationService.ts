import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { QuotationListQuery } from "../validations/quotationSchemas";

function money(value: Prisma.Decimal) {
  return value.toFixed(2);
}

function buildQuotationWhere(query: QuotationListQuery): Prisma.QuotationWhereInput {
  const where: Prisma.QuotationWhereInput = {};

  if (query.search) {
    where.OR = [
      { quotationNumber: { contains: query.search } },
      { customer: { fullName: { contains: query.search } } },
      { customer: { email: { contains: query.search } } },
      { estimateRequest: { estimateNumber: { contains: query.search } } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

export async function listQuotations(query: QuotationListQuery) {
  const where = buildQuotationWhere(query);
  const skip = (query.page - 1) * query.limit;
  const orderBy: Prisma.QuotationOrderByWithRelationInput = {
    createdAt: query.sort === "oldest" ? "asc" : "desc",
  };

  const [records, total] = await prisma.$transaction([
    prisma.quotation.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: {
        id: true,
        quotationNumber: true,
        grandTotal: true,
        status: true,
        createdAt: true,
        validUntil: true,
        customer: {
          select: {
            fullName: true,
            companyName: true,
            email: true,
            mobileNumber: true,
          },
        },
        estimateRequest: {
          select: {
            estimateNumber: true,
          },
        },
        preparedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.quotation.count({ where }),
  ]);

  return {
    records: records.map((record) => ({
      ...record,
      grandTotal: money(record.grandTotal),
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getQuotationDetails(id: string) {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    select: {
      id: true,
      quotationNumber: true,
      quotationDate: true,
      validUntil: true,
      subtotal: true,
      discount: true,
      taxRate: true,
      taxAmount: true,
      additionalFees: true,
      grandTotal: true,
      scopeOfWork: true,
      exclusions: true,
      paymentTerms: true,
      warrantyTerms: true,
      notes: true,
      status: true,
      createdAt: true,
      updatedAt: true,
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
      estimateRequest: {
        select: {
          estimateNumber: true,
          serviceAddress: true,
          selectedService: true,
        },
      },
      preparedBy: {
        select: {
          fullName: true,
          email: true,
        },
      },
      items: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          itemType: true,
          description: true,
          quantity: true,
          unit: true,
          unitPrice: true,
          amount: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!quotation) {
    throw new AppError("Quotation not found.", 404);
  }

  return {
    ...quotation,
    subtotal: money(quotation.subtotal),
    discount: money(quotation.discount),
    taxRate: money(quotation.taxRate),
    taxAmount: money(quotation.taxAmount),
    additionalFees: money(quotation.additionalFees),
    grandTotal: money(quotation.grandTotal),
    items: quotation.items.map((item) => ({
      ...item,
      quantity: money(item.quantity),
      unitPrice: money(item.unitPrice),
      amount: money(item.amount),
    })),
  };
}
