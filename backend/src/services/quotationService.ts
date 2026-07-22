import {
  AdminRole,
  Prisma,
  QuotationItemType,
  QuotationStatus,
} from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type {
  CreateQuotationInput,
  QuotationListQuery,
  UpdateQuotationInput,
  UpdateQuotationStatusInput,
} from "../validations/quotationSchemas";

function decimal(value: string | number | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

function money(value: Prisma.Decimal) {
  return value.toFixed(2);
}

function toDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function isPrivilegedRole(role: AdminRole) {
  return role === AdminRole.SUPER_ADMIN || role === AdminRole.ADMIN;
}

function assertCanEditQuotation(status: QuotationStatus, role: AdminRole) {
  if (status === QuotationStatus.CANCELLED) {
    throw new AppError("Cancelled quotations cannot be edited.", 409);
  }

  if (role === AdminRole.STAFF && status !== QuotationStatus.DRAFT) {
    throw new AppError("Staff can only edit draft quotations.", 403);
  }

  if (status !== QuotationStatus.DRAFT && status !== QuotationStatus.READY) {
    throw new AppError("This quotation status cannot be edited in this phase.", 409);
  }
}

function assertFreshUpdate(currentUpdatedAt: Date, submittedUpdatedAt: string) {
  if (currentUpdatedAt.getTime() !== new Date(submittedUpdatedAt).getTime()) {
    throw new AppError(
      "This quotation was updated by another user. Reload the latest version before saving.",
      409,
    );
  }
}

function logAudit(
  tx: Prisma.TransactionClient,
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  entityReference: string | null,
  metadata?: Record<string, unknown>,
) {
  return tx.auditLog.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      entityReference,
      metadata: metadata ? JSON.stringify(metadata).slice(0, 2000) : null,
    },
    select: { id: true },
  });
}

function formatQuotationNumber(year: number, sequence: number) {
  return `QTN-${year}-${sequence.toString().padStart(6, "0")}`;
}

async function getNextQuotationNumber(tx: Prisma.TransactionClient, year: number) {
  const prefix = `QTN-${year}-`;
  const latestQuotation = await tx.quotation.findFirst({
    where: { quotationNumber: { startsWith: prefix } },
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

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function calculateItems(items: CreateQuotationInput["items"]) {
  return items
    .map((item, index) => {
      const quantity = decimal(item.quantity);
      const unitPrice = decimal(item.unitPrice);
      const discount = decimal(item.discount);
      const grossAmount = quantity.mul(unitPrice);

      if (discount.greaterThan(grossAmount)) {
        throw new AppError("Line item discount cannot exceed gross amount.", 400);
      }

      return {
        itemType: item.itemType as QuotationItemType,
        description: item.description,
        quantity,
        unit: item.unit,
        unitPrice,
        discount,
        amount: grossAmount.minus(discount),
        sortOrder: index + 1,
      };
    });
}

function calculateTotals(
  items: ReturnType<typeof calculateItems>,
  discountInput: number,
  additionalFeesInput: number,
  taxRateInput: number,
) {
  const itemsSubtotal = items.reduce(
    (total, item) => total.plus(item.amount),
    decimal(0),
  );
  const discount = decimal(discountInput);
  const additionalFees = decimal(additionalFeesInput);
  const taxRate = decimal(taxRateInput);

  if (discount.greaterThan(itemsSubtotal)) {
    throw new AppError("Quotation discount cannot exceed items subtotal.", 400);
  }

  const taxableSubtotal = itemsSubtotal.minus(discount).plus(additionalFees);
  const taxAmount = taxableSubtotal.mul(taxRate).div(100);
  const grandTotal = taxableSubtotal.plus(taxAmount);

  return {
    itemsSubtotal,
    discount,
    additionalFees,
    taxRate,
    taxAmount,
    grandTotal,
  };
}

async function getOrCreateQuotationCustomer(
  tx: Prisma.TransactionClient,
  input: CreateQuotationInput["customer"],
) {
  if (input.mode === "existing") {
    if (!input.customerId) {
      throw new AppError("Select an existing customer.", 400);
    }

    const customer = await tx.customer.findUnique({
      where: { id: input.customerId },
      select: { id: true },
    });

    if (!customer) {
      throw new AppError("Selected customer not found.", 404);
    }

    if (input.updateMasterCustomer) {
      await tx.customer.update({
        where: { id: input.customerId },
        data: {
          fullName: input.fullName,
          companyName: input.companyName,
          email: input.email,
          mobileNumber: input.mobileNumber,
          address: input.billingAddress,
          city: input.city ?? "",
          province: input.province ?? "",
        },
        select: { id: true },
      });
    }

    return input.customerId;
  }

  const customer = await tx.customer.create({
    data: {
      fullName: input.fullName,
      companyName: input.companyName,
      email: input.email,
      mobileNumber: input.mobileNumber,
      address: input.billingAddress,
      city: input.city ?? "",
      province: input.province ?? "",
    },
    select: { id: true },
  });

  return customer.id;
}

async function getCompanyDefaults(tx: Prisma.TransactionClient) {
  return tx.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      quotationValidityDays: true,
      taxRate: true,
      quotationTerms: true,
    },
  });
}

function buildQuotationWhere(query: QuotationListQuery): Prisma.QuotationWhereInput {
  const where: Prisma.QuotationWhereInput = {};

  if (query.search) {
    where.OR = [
      { quotationNumber: { contains: query.search } },
      { projectTitle: { contains: query.search } },
      { customerFullName: { contains: query.search } },
      { customerEmail: { contains: query.search } },
      { customer: { fullName: { contains: query.search } } },
      { customer: { email: { contains: query.search } } },
      { estimateRequest: { estimateNumber: { contains: query.search } } },
    ];
  }

  if (query.status) {
    where.status = query.status;
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

export async function getQuotationCreateDefaults() {
  const companySetting = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      quotationValidityDays: true,
      taxRate: true,
      quotationTerms: true,
    },
  });
  const quotationDate = new Date();
  const validUntil = new Date(quotationDate);
  validUntil.setDate(validUntil.getDate() + (companySetting?.quotationValidityDays ?? 30));

  return {
    quotationDate,
    validUntil,
    taxRate: companySetting?.taxRate?.toFixed(2) ?? "0.00",
    scopeOfWork: "",
    exclusions: "Final exclusions will be confirmed before approval.",
    paymentTerms:
      companySetting?.quotationTerms ||
      "Payment terms will be finalized before the quotation is sent for approval.",
    warrantyTerms: "Warranty terms will be finalized before the quotation is sent for approval.",
    notes: "",
  };
}

export async function listQuotationCustomers(search = "") {
  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search } },
            { companyName: { contains: search } },
            { email: { contains: search } },
            { mobileNumber: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
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
  });

  return { records: customers };
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
        projectTitle: true,
        customerFullName: true,
        grandTotal: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        validUntil: true,
        customer: {
          select: {
            fullName: true,
            companyName: true,
            email: true,
            mobileNumber: true,
          },
        },
        estimateRequest: { select: { estimateNumber: true } },
        preparedBy: { select: { fullName: true, email: true } },
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
      projectTitle: true,
      customerFullName: true,
      customerCompanyName: true,
      customerEmail: true,
      customerMobileNumber: true,
      billingAddress: true,
      serviceAddress: true,
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
      estimateRequest: {
        select: {
          estimateNumber: true,
          serviceAddress: true,
          selectedService: true,
        },
      },
      preparedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
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
          discount: true,
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
    customerFullName: quotation.customerFullName ?? quotation.customer.fullName,
    customerCompanyName: quotation.customerCompanyName ?? quotation.customer.companyName,
    customerEmail: quotation.customerEmail ?? quotation.customer.email,
    customerMobileNumber:
      quotation.customerMobileNumber ?? quotation.customer.mobileNumber,
    billingAddress: quotation.billingAddress ?? quotation.customer.address,
    serviceAddress:
      quotation.serviceAddress ??
      quotation.estimateRequest?.serviceAddress ??
      quotation.customer.address,
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
      discount: money(item.discount),
      amount: money(item.amount),
    })),
  };
}

export async function createQuotation(
  input: CreateQuotationInput,
  adminId: string,
) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const customerId = await getOrCreateQuotationCustomer(tx, input.customer);
        const items = calculateItems(input.items);
        const totals = calculateTotals(
          items,
          input.discount,
          input.additionalFees,
          input.taxRate,
        );
        const quotationNumber = await getNextQuotationNumber(
          tx,
          new Date().getFullYear(),
        );

        const quotation = await tx.quotation.create({
          data: {
            quotationNumber,
            customerId,
            projectTitle: input.projectTitle,
            customerFullName: input.customer.fullName,
            customerCompanyName: input.customer.companyName,
            customerEmail: input.customer.email,
            customerMobileNumber: input.customer.mobileNumber,
            billingAddress: input.customer.billingAddress,
            serviceAddress: input.customer.serviceAddress,
            quotationDate: toDate(input.quotationDate),
            validUntil: toDate(input.validUntil),
            subtotal: totals.itemsSubtotal,
            discount: totals.discount,
            taxRate: totals.taxRate,
            taxAmount: totals.taxAmount,
            additionalFees: totals.additionalFees,
            grandTotal: totals.grandTotal,
            scopeOfWork: input.scopeOfWork,
            exclusions: input.exclusions,
            paymentTerms: input.paymentTerms,
            warrantyTerms: input.warrantyTerms,
            notes: input.notes,
            preparedById: adminId,
            approvedById: input.approvedById ?? null,
            status: QuotationStatus.DRAFT,
            items: { create: items },
          },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            grandTotal: true,
          },
        });

        await logAudit(tx, adminId, "QUOTATION_CREATED", "Quotation", quotation.id, quotation.quotationNumber);

        return {
          ...quotation,
          grandTotal: money(quotation.grandTotal),
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

export async function updateQuotation(
  id: string,
  input: UpdateQuotationInput,
  adminId: string,
  adminRole: AdminRole,
) {
  await prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id },
      select: {
        id: true,
        quotationNumber: true,
        status: true,
        updatedAt: true,
        items: { select: { id: true, description: true, sortOrder: true } },
      },
    });

    if (!quotation) {
      throw new AppError("Quotation not found.", 404);
    }

    assertCanEditQuotation(quotation.status, adminRole);
    assertFreshUpdate(quotation.updatedAt, input.updatedAt);

    const customerId = await getOrCreateQuotationCustomer(tx, input.customer);
    const items = calculateItems(input.items);
    const totals = calculateTotals(
      items,
      input.discount,
      input.additionalFees,
      input.taxRate,
    );
    const previousItemIds = new Set(quotation.items.map((item) => item.id));
    const submittedItemIds = new Set(input.items.flatMap((item) => (item.id ? [item.id] : [])));

    await tx.quotationItem.deleteMany({ where: { quotationId: id } });
    await tx.quotation.update({
      where: { id },
      data: {
        customerId,
        projectTitle: input.projectTitle,
        customerFullName: input.customer.fullName,
        customerCompanyName: input.customer.companyName,
        customerEmail: input.customer.email,
        customerMobileNumber: input.customer.mobileNumber,
        billingAddress: input.customer.billingAddress,
        serviceAddress: input.customer.serviceAddress,
        quotationDate: toDate(input.quotationDate),
        validUntil: toDate(input.validUntil),
        subtotal: totals.itemsSubtotal,
        discount: totals.discount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        additionalFees: totals.additionalFees,
        grandTotal: totals.grandTotal,
        scopeOfWork: input.scopeOfWork,
        exclusions: input.exclusions,
        paymentTerms: input.paymentTerms,
        warrantyTerms: input.warrantyTerms,
        notes: input.notes,
        approvedById: input.approvedById ?? null,
        items: { create: items },
      },
      select: { id: true },
    });

    const removedCount = quotation.items.filter((item) => !submittedItemIds.has(item.id)).length;
    const addedCount = input.items.filter((item) => !item.id || !previousItemIds.has(item.id)).length;

    await logAudit(tx, adminId, "QUOTATION_EDITED", "Quotation", id, quotation.quotationNumber, {
      itemCount: input.items.length,
      addedCount,
      removedCount,
    });

    if (addedCount > 0) {
      await logAudit(tx, adminId, "ITEM_ADDED", "Quotation", id, quotation.quotationNumber, { addedCount });
    }
    if (removedCount > 0) {
      await logAudit(tx, adminId, "ITEM_REMOVED", "Quotation", id, quotation.quotationNumber, { removedCount });
    }
    await logAudit(tx, adminId, "ITEM_REORDERED", "Quotation", id, quotation.quotationNumber);

  });

  return getQuotationDetails(id);
}

export async function updateQuotationStatus(
  id: string,
  input: UpdateQuotationStatusInput,
  adminId: string,
  adminRole: AdminRole,
) {
  if (!isPrivilegedRole(adminRole)) {
    throw new AppError("Only admins can change quotation status.", 403);
  }

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id },
      select: {
        id: true,
        quotationNumber: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!quotation) {
      throw new AppError("Quotation not found.", 404);
    }

    assertFreshUpdate(quotation.updatedAt, input.updatedAt);

    const allowedTransitions: Record<QuotationStatus, QuotationStatus[]> = {
      [QuotationStatus.DRAFT]: [QuotationStatus.READY, QuotationStatus.CANCELLED],
      [QuotationStatus.READY]: [QuotationStatus.DRAFT, QuotationStatus.CANCELLED],
      [QuotationStatus.SENT]: [],
      [QuotationStatus.VIEWED]: [],
      [QuotationStatus.ACCEPTED]: [],
      [QuotationStatus.REJECTED]: [],
      [QuotationStatus.EXPIRED]: [],
      [QuotationStatus.CANCELLED]: [],
    };

    if (
      input.status !== quotation.status &&
      !allowedTransitions[quotation.status].includes(input.status)
    ) {
      throw new AppError("Invalid quotation status transition.", 409);
    }

    const updatedQuotation = await tx.quotation.update({
      where: { id },
      data: { status: input.status },
      select: {
        id: true,
        quotationNumber: true,
        status: true,
        updatedAt: true,
      },
    });

    await logAudit(
      tx,
      adminId,
      input.status === QuotationStatus.CANCELLED
        ? "QUOTATION_CANCELLED"
        : "STATUS_CHANGED",
      "Quotation",
      id,
      quotation.quotationNumber,
      { from: quotation.status, to: input.status },
    );

    return updatedQuotation;
  });
}

export async function duplicateQuotation(id: string, adminId: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const source = await tx.quotation.findUnique({
          where: { id },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        });

        if (!source) {
          throw new AppError("Quotation not found.", 404);
        }

        if (source.status === QuotationStatus.CANCELLED) {
          throw new AppError("Cancelled quotations cannot be duplicated.", 409);
        }

        const quotationNumber = await getNextQuotationNumber(
          tx,
          new Date().getFullYear(),
        );

        const duplicate = await tx.quotation.create({
          data: {
            quotationNumber,
            customerId: source.customerId,
            projectTitle: `${source.projectTitle} Copy`.slice(0, 160),
            customerFullName: source.customerFullName,
            customerCompanyName: source.customerCompanyName,
            customerEmail: source.customerEmail,
            customerMobileNumber: source.customerMobileNumber,
            billingAddress: source.billingAddress,
            serviceAddress: source.serviceAddress,
            quotationDate: new Date(),
            validUntil: source.validUntil,
            subtotal: source.subtotal,
            discount: source.discount,
            taxRate: source.taxRate,
            taxAmount: source.taxAmount,
            additionalFees: source.additionalFees,
            grandTotal: source.grandTotal,
            scopeOfWork: source.scopeOfWork,
            exclusions: source.exclusions,
            paymentTerms: source.paymentTerms,
            warrantyTerms: source.warrantyTerms,
            notes: source.notes,
            preparedById: adminId,
            approvedById: null,
            status: QuotationStatus.DRAFT,
            items: {
              create: source.items.map((item) => ({
                itemType: item.itemType,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                discount: item.discount,
                amount: item.amount,
                sortOrder: item.sortOrder,
              })),
            },
          },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            grandTotal: true,
          },
        });

        await logAudit(tx, adminId, "QUOTATION_DUPLICATED", "Quotation", duplicate.id, duplicate.quotationNumber, {
          sourceQuotationId: source.id,
          sourceQuotationNumber: source.quotationNumber,
        });

        return {
          ...duplicate,
          grandTotal: money(duplicate.grandTotal),
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
