import { EstimateRequestStatus } from "@prisma/client";
import { z } from "zod";
import {
  airconCapacities,
  airconTypes,
  estimateServices,
  propertyTypes,
  unitConditions,
  urgencyLevels,
} from "../config/estimatePricing";

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

const optionValues = <T extends readonly string[]>(values: T) => z.enum(values);

export const publicEstimateSchema = z.object({
  fullName: trimmedRequiredString("Full name", 120),
  email: z.email("Email must be valid.").trim().toLowerCase().max(160),
  mobileNumber: trimmedRequiredString("Mobile number", 40),
  companyName: optionalTrimmedString(120),
  propertyType: optionValues(propertyTypes),
  serviceAddress: trimmedRequiredString("Service address", 240),
  city: trimmedRequiredString("City", 120),
  province: trimmedRequiredString("Province", 120),
  airconType: optionValues(airconTypes),
  airconCapacity: z.enum(airconCapacities.map((capacity) => capacity.label)),
  quantity: z.coerce.number().int().min(1).max(50),
  brand: optionalTrimmedString(80),
  unitCondition: optionValues(unitConditions),
  indoorUnitLocation: optionalTrimmedString(160),
  outdoorUnitLocation: optionalTrimmedString(160),
  selectedService: z.enum(estimateServices.map((service) => service.label)),
  preferredDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
      message: "Preferred service date must be valid.",
    }),
  notes: z.string().trim().max(3000).optional().default(""),
  urgencyLevel: z.enum(urgencyLevels.map((urgency) => urgency.label)),
  disclaimerAccepted: z.literal(true),
  website: z.string().trim().max(0, "Unable to submit this request.").optional().or(z.literal("")),
});

export const estimateIdParamSchema = z.object({
  id: z.uuid("Invalid estimate request ID."),
});

export const publicEstimateTokenParamSchema = z.object({
  token: z
    .string()
    .trim()
    .min(32)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid estimate access token."),
});

export const pdfModeQuerySchema = z.object({
  mode: z.enum(["download", "inline"]).optional().default("download"),
});

export const estimateListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(160).optional().default(""),
  status: z.enum(EstimateRequestStatus).optional(),
  service: z.string().trim().max(120).optional().default(""),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
  sort: z.enum(["latest", "oldest"]).optional().default("latest"),
});

export const updateEstimateStatusSchema = z.object({
  status: z.enum([
    EstimateRequestStatus.SUBMITTED,
    EstimateRequestStatus.UNDER_REVIEW,
    EstimateRequestStatus.ESTIMATE_READY,
    EstimateRequestStatus.CONVERTED_TO_QUOTATION,
    EstimateRequestStatus.CANCELLED,
  ]),
});

export const updateEstimateNotesSchema = z.object({
  internalNotes: z.string().trim().max(3000, "Internal notes must be 3000 characters or fewer."),
});

const moneyInput = z.coerce.number().finite().min(0).max(99_999_999);

export const saveEstimateReviewSchema = z.object({
  internalNotes: z.string().trim().max(3000).optional().default(""),
  reviewSummary: z.string().trim().max(2000).optional().default(""),
  recommendedSiteInspection: z.coerce.boolean().default(false),
  recommendedServiceDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
      message: "Recommended service date must be valid.",
    }),
  revision: z.object({
    serviceDescription: trimmedRequiredString("Service description", 240),
    quantity: z.coerce.number().int().min(1).max(500),
    baseAmount: moneyInput,
    capacityAdjustment: moneyInput.default(0),
    urgencyAdjustment: moneyInput.default(0),
    additionalFees: moneyInput.default(0),
    discount: moneyInput.default(0),
    taxRate: z.coerce.number().finite().min(0).max(100).default(0),
    notes: z.string().trim().max(3000).optional().default(""),
  }),
});

export type PublicEstimateInput = z.infer<typeof publicEstimateSchema>;
export type EstimateListQuery = z.infer<typeof estimateListQuerySchema>;
export type SaveEstimateReviewInput = z.infer<typeof saveEstimateReviewSchema>;
