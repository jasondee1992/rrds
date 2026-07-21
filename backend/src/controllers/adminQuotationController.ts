import type { Request, Response } from "express";
import {
  getQuotationDetails,
  listQuotations,
} from "../services/quotationService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  quotationIdParamSchema,
  quotationListQuerySchema,
} from "../validations/quotationSchemas";

export async function getAdminQuotations(req: Request, res: Response) {
  const parsedQuery = quotationListQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json(errorResponse("Invalid quotation filters."));
    return;
  }

  const result = await listQuotations(parsedQuery.data);

  res.json(successResponse("Quotations retrieved", result));
}

export async function getAdminQuotationDetails(req: Request, res: Response) {
  const parsedParams = quotationIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid quotation ID."));
    return;
  }

  const quotation = await getQuotationDetails(parsedParams.data.id);

  res.json(successResponse("Quotation details retrieved", { quotation }));
}
