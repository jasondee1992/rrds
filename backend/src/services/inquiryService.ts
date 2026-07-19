import { InquirySource, InquiryStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { InquiryListQuery, PublicContactInput } from "../validations/inquirySchemas";

const statusTransitions: Record<InquiryStatus, InquiryStatus[]> = {
  [InquiryStatus.NEW]: [
    InquiryStatus.IN_PROGRESS,
    InquiryStatus.RESOLVED,
    InquiryStatus.CLOSED,
  ],
  [InquiryStatus.IN_PROGRESS]: [InquiryStatus.RESOLVED, InquiryStatus.CLOSED],
  [InquiryStatus.RESOLVED]: [InquiryStatus.IN_PROGRESS],
  [InquiryStatus.CLOSED]: [InquiryStatus.IN_PROGRESS],
};

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function formatReferenceNumber(year: number, sequence: number) {
  return `INQ-${year}-${sequence.toString().padStart(6, "0")}`;
}

async function getNextReferenceNumber(year: number) {
  const prefix = `INQ-${year}-`;
  const latestInquiry = await prisma.inquiry.findFirst({
    where: {
      referenceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      referenceNumber: "desc",
    },
    select: {
      referenceNumber: true,
    },
  });

  const latestSequence = latestInquiry
    ? Number(latestInquiry.referenceNumber.replace(prefix, ""))
    : 0;

  return formatReferenceNumber(year, Number.isFinite(latestSequence) ? latestSequence + 1 : 1);
}

export async function createContactInquiry(input: PublicContactInput) {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const referenceNumber = await getNextReferenceNumber(year);

    try {
      return await prisma.inquiry.create({
        data: {
          referenceNumber,
          fullName: input.fullName,
          email: input.email,
          mobileNumber: input.mobileNumber,
          subject: input.subject,
          message: input.message,
          status: InquiryStatus.NEW,
          source: InquirySource.CONTACT_FORM,
        },
        select: {
          referenceNumber: true,
        },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  throw new AppError("Unable to submit inquiry. Please try again.", 409);
}

function buildInquiryWhere(query: InquiryListQuery): Prisma.InquiryWhereInput {
  const where: Prisma.InquiryWhereInput = {};

  if (query.search) {
    where.OR = [
      { referenceNumber: { contains: query.search } },
      { fullName: { contains: query.search } },
      { email: { contains: query.search } },
      { mobileNumber: { contains: query.search } },
      { subject: { contains: query.search } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.source) {
    where.source = query.source;
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

export async function listInquiries(query: InquiryListQuery) {
  const where = buildInquiryWhere(query);
  const skip = (query.page - 1) * query.limit;
  const orderBy: Prisma.InquiryOrderByWithRelationInput = {
    createdAt: query.sort === "oldest" ? "asc" : "desc",
  };

  const [records, total] = await prisma.$transaction([
    prisma.inquiry.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: {
        id: true,
        referenceNumber: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        subject: true,
        status: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        customerId: true,
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  return {
    records,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getInquiryDetails(id: string) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      referenceNumber: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      subject: true,
      message: true,
      status: true,
      source: true,
      internalNotes: true,
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
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found.", 404);
  }

  return inquiry;
}

export async function updateInquiryStatus(id: string, nextStatus: InquiryStatus) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found.", 404);
  }

  const isNoOp = inquiry.status === nextStatus;
  const isAllowed = statusTransitions[inquiry.status].includes(nextStatus);

  if (!isNoOp && !isAllowed) {
    throw new AppError("This inquiry status transition is not allowed.", 400);
  }

  return prisma.inquiry.update({
    where: { id },
    data: { status: nextStatus },
    select: {
      id: true,
      referenceNumber: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function updateInquiryNotes(id: string, internalNotes: string) {
  await getInquiryDetails(id);

  return prisma.inquiry.update({
    where: { id },
    data: {
      internalNotes: internalNotes || null,
    },
    select: {
      id: true,
      referenceNumber: true,
      internalNotes: true,
      updatedAt: true,
    },
  });
}

const customerSummarySelect = {
  id: true,
  fullName: true,
  companyName: true,
  email: true,
  mobileNumber: true,
  address: true,
  city: true,
  province: true,
  createdAt: true,
} satisfies Prisma.CustomerSelect;

export async function findCustomerMatchesForInquiry(
  inquiryId: string,
  search: string,
  limit: number,
) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: {
      email: true,
      mobileNumber: true,
      fullName: true,
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found.", 404);
  }

  const normalizedSearch = search.trim();
  const where: Prisma.CustomerWhereInput = normalizedSearch
    ? {
        OR: [
          { fullName: { contains: normalizedSearch } },
          { companyName: { contains: normalizedSearch } },
          { email: { contains: normalizedSearch.toLowerCase() } },
          { mobileNumber: { contains: normalizedSearch } },
        ],
      }
    : {
        OR: [
          { email: inquiry.email },
          { mobileNumber: inquiry.mobileNumber },
          { fullName: { contains: inquiry.fullName } },
        ],
      };

  return prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: customerSummarySelect,
  });
}

export async function createCustomerFromInquiry(inquiryId: string) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: {
      id: true,
      customerId: true,
      fullName: true,
      email: true,
      mobileNumber: true,
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found.", 404);
  }

  if (inquiry.customerId) {
    throw new AppError("Inquiry is already linked to a customer.", 409);
  }

  const matches = await prisma.customer.findMany({
    where: {
      OR: [{ email: inquiry.email }, { mobileNumber: inquiry.mobileNumber }],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: customerSummarySelect,
  });

  if (matches.length > 0) {
    return {
      created: false,
      matches,
    };
  }

  const customer = await prisma.customer.create({
    data: {
      fullName: inquiry.fullName,
      email: inquiry.email,
      mobileNumber: inquiry.mobileNumber,
      address: "",
      city: "",
      province: "",
    },
    select: customerSummarySelect,
  });

  await prisma.inquiry.update({
    where: { id: inquiry.id },
    data: { customerId: customer.id },
  });

  return {
    created: true,
    customer,
  };
}

export async function linkInquiryToCustomer(inquiryId: string, customerId: string) {
  const [inquiry, customer] = await Promise.all([
    prisma.inquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true },
    }),
    prisma.customer.findUnique({
      where: { id: customerId },
      select: customerSummarySelect,
    }),
  ]);

  if (!inquiry) {
    throw new AppError("Inquiry not found.", 404);
  }

  if (!customer) {
    throw new AppError("Customer not found.", 404);
  }

  await prisma.inquiry.update({
    where: { id: inquiry.id },
    data: { customerId: customer.id },
  });

  return customer;
}
