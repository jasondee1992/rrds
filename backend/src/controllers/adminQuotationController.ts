import { AdminRole } from "@prisma/client";
import type { Request, Response } from "express";
import {
  createQuotation,
  duplicateQuotation,
  getQuotationCreateDefaults,
  getQuotationDetails,
  listQuotationCustomers,
  listQuotations,
  updateQuotation,
  updateQuotationStatus,
} from "../services/quotationService";
import { generateAdminQuotationPdf } from "../services/quotationPdfService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  createQuotationSchema,
  quotationIdParamSchema,
  quotationListQuerySchema,
  quotationPdfModeQuerySchema,
  updateQuotationSchema,
  updateQuotationStatusSchema,
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

export async function getAdminQuotationPdf(req: Request, res: Response) {
  const parsedParams = quotationIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid quotation ID."));
    return;
  }

  const parsedQuery = quotationPdfModeQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json(errorResponse("Invalid PDF mode."));
    return;
  }

  if (!req.admin) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  const { pdfBuffer, filename } = await generateAdminQuotationPdf(
    parsedParams.data.id,
    parsedQuery.data.mode,
    req.admin,
  );
  const disposition = parsedQuery.data.mode === "inline" ? "inline" : "attachment";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  res.send(pdfBuffer);
}

export async function getAdminQuotationPreview(req: Request, res: Response) {
  req.query.mode = "inline";
  await getAdminQuotationPdf(req, res);
}

export async function getAdminQuotationDefaults(_req: Request, res: Response) {
  const defaults = await getQuotationCreateDefaults();

  res.json(successResponse("Quotation defaults retrieved", { defaults }));
}

export async function getAdminQuotationCustomers(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const result = await listQuotationCustomers(search.slice(0, 160));

  res.json(successResponse("Quotation customers retrieved", result));
}

export async function postAdminQuotation(req: Request, res: Response) {
  const parsedBody = createQuotationSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid quotation values."));
    return;
  }

  const quotation = await createQuotation(parsedBody.data, req.admin?.id ?? "");

  res.status(201).json(successResponse("Quotation created", { quotation }));
}

export async function patchAdminQuotation(req: Request, res: Response) {
  const parsedParams = quotationIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid quotation ID."));
    return;
  }

  const parsedBody = updateQuotationSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid quotation values."));
    return;
  }

  const quotation = await updateQuotation(
    parsedParams.data.id,
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Quotation saved", { quotation }));
}

export async function patchAdminQuotationStatus(req: Request, res: Response) {
  const parsedParams = quotationIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid quotation ID."));
    return;
  }

  const parsedBody = updateQuotationStatusSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid quotation status."));
    return;
  }

  const quotation = await updateQuotationStatus(
    parsedParams.data.id,
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Quotation status updated", { quotation }));
}

export async function postAdminQuotationDuplicate(req: Request, res: Response) {
  const parsedParams = quotationIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid quotation ID."));
    return;
  }

  const quotation = await duplicateQuotation(parsedParams.data.id, req.admin?.id ?? "");

  res.status(201).json(successResponse("Quotation duplicated", { quotation }));
}
