import { InquirySource, InquiryStatus } from "@prisma/client";
import { z } from "zod";

const trimmedRequiredString = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(maxLength, `${fieldName} must be ${maxLength} characters or fewer.`);

export const publicContactSchema = z.object({
  fullName: trimmedRequiredString("Full name", 120),
  email: z.email("Email must be valid.").trim().toLowerCase().max(160),
  mobileNumber: trimmedRequiredString("Mobile number", 40),
  subject: trimmedRequiredString("Subject", 160),
  message: trimmedRequiredString("Message", 4000),
  website: z.string().trim().max(0, "Unable to submit this request.").optional().or(z.literal("")),
});

export const inquiryIdParamSchema = z.object({
  id: z.uuid("Invalid inquiry ID."),
});

export const inquiryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(160).optional().default(""),
  status: z.enum(InquiryStatus).optional(),
  source: z.enum(InquirySource).optional(),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
  sort: z.enum(["latest", "oldest"]).optional().default("latest"),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(InquiryStatus),
});

export const updateInquiryNotesSchema = z.object({
  internalNotes: z.string().trim().max(3000, "Internal notes must be 3000 characters or fewer."),
});

export const linkInquiryCustomerSchema = z.object({
  customerId: z.uuid("Invalid customer ID."),
});

export const inquiryCustomerMatchesQuerySchema = z.object({
  search: z.string().trim().max(160).optional().default(""),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type PublicContactInput = z.infer<typeof publicContactSchema>;
export type InquiryListQuery = z.infer<typeof inquiryListQuerySchema>;
