import { QuotationStatus } from "@prisma/client";
import { z } from "zod";

export const quotationIdParamSchema = z.object({
  id: z.uuid("Invalid quotation ID."),
});

export const quotationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(160).optional().default(""),
  status: z.enum(QuotationStatus).optional(),
  sort: z.enum(["latest", "oldest"]).optional().default("latest"),
});

export type QuotationListQuery = z.infer<typeof quotationListQuerySchema>;
