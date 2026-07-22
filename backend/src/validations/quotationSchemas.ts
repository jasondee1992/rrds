import { QuotationStatus } from "@prisma/client";
import { z } from "zod";

const allowedItemTypes = [
  "PRODUCT",
  "SERVICE",
  "LABOR",
  "MATERIAL",
  "TRANSPORTATION",
  "OTHER",
] as const;

const trimmedRequiredString = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(maxLength, `${fieldName} must be ${maxLength} characters or fewer.`);

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

const moneyInput = z.coerce.number().finite().min(0).max(99_999_999);

export const quotationIdParamSchema = z.object({
  id: z.uuid("Invalid quotation ID."),
});

export const quotationItemIdParamSchema = z.object({
  id: z.uuid("Invalid quotation ID."),
  itemId: z.uuid("Invalid quotation item ID."),
});

export const quotationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(160).optional().default(""),
  status: z.enum(QuotationStatus).optional(),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
  sort: z.enum(["latest", "oldest"]).optional().default("latest"),
});

export const quotationCustomerSchema = z.object({
  mode: z.enum(["existing", "new"]),
  customerId: z.uuid().optional(),
  updateMasterCustomer: z.coerce.boolean().optional().default(false),
  fullName: trimmedRequiredString("Full name", 120),
  companyName: optionalTrimmedString(120),
  email: z.email("Email must be valid.").trim().toLowerCase().max(160),
  mobileNumber: trimmedRequiredString("Mobile number", 40),
  billingAddress: trimmedRequiredString("Billing address", 240),
  serviceAddress: trimmedRequiredString("Service address", 240),
  city: optionalTrimmedString(120),
  province: optionalTrimmedString(120),
});

export const quotationItemSchema = z.object({
  id: z.uuid().optional(),
  itemType: z.enum(allowedItemTypes),
  description: trimmedRequiredString("Item description", 240),
  quantity: moneyInput.refine((value) => value > 0, "Quantity must be greater than zero."),
  unit: trimmedRequiredString("Unit", 40),
  unitPrice: moneyInput,
  discount: moneyInput.default(0),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

const quotationEditableFieldsSchema = z.object({
  customer: quotationCustomerSchema,
  projectTitle: trimmedRequiredString("Project title", 160),
  quotationDate: z.iso.date(),
  validUntil: z.iso.date(),
  approvedById: z.uuid().nullable().optional(),
  discount: moneyInput.default(0),
  additionalFees: moneyInput.default(0),
  taxRate: z.coerce.number().finite().min(0).max(100).default(0),
  scopeOfWork: trimmedRequiredString("Scope of work", 5000),
  exclusions: trimmedRequiredString("Exclusions", 5000),
  paymentTerms: trimmedRequiredString("Payment terms", 5000),
  warrantyTerms: trimmedRequiredString("Warranty terms", 5000),
  notes: z.string().trim().max(5000).optional().default(""),
  items: z.array(quotationItemSchema).min(1, "At least one quotation item is required."),
});

export const createQuotationSchema = quotationEditableFieldsSchema;

export const updateQuotationSchema = quotationEditableFieldsSchema.extend({
  updatedAt: z.iso.datetime(),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum([
    QuotationStatus.DRAFT,
    QuotationStatus.READY,
    QuotationStatus.CANCELLED,
  ]),
  updatedAt: z.iso.datetime(),
});

export type QuotationListQuery = z.infer<typeof quotationListQuerySchema>;
export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type UpdateQuotationStatusInput = z.infer<typeof updateQuotationStatusSchema>;
