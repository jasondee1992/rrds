import type { Request, Response } from "express";
import {
  createPublicEstimate,
  getPublicEstimateOptions,
} from "../services/estimateService";
import {
  getPublicEstimateDocumentByToken,
  PUBLIC_ESTIMATE_UNAVAILABLE_MESSAGE,
} from "../services/estimateAccessService";
import {
  getEstimatePdfFilename,
  renderEstimatePdf,
} from "../services/estimatePdfService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  pdfModeQuerySchema,
  publicEstimateSchema,
  publicEstimateTokenParamSchema,
} from "../validations/estimateSchemas";

export async function getEstimateOptions(_req: Request, res: Response) {
  const options = await getPublicEstimateOptions();

  res.json(successResponse("Estimate options retrieved", options));
}

export async function submitPublicEstimate(req: Request, res: Response) {
  const parsedBody = publicEstimateSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Please check the estimate form fields and try again."));
    return;
  }

  const estimate = await createPublicEstimate(parsedBody.data);

  res.status(201).json(
    successResponse("Your estimate request has been submitted successfully.", estimate),
  );
}

function parsePublicEstimateToken(req: Request, res: Response) {
  const parsedParams = publicEstimateTokenParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    console.warn("Invalid public estimate token format attempted.");
    res.status(404).json(errorResponse(PUBLIC_ESTIMATE_UNAVAILABLE_MESSAGE));
    return null;
  }

  return parsedParams.data.token;
}

export async function getPublicEstimateAccess(req: Request, res: Response) {
  const token = parsePublicEstimateToken(req, res);

  if (!token) {
    return;
  }

  const estimate = await getPublicEstimateDocumentByToken(token);

  res.json(successResponse("Estimate retrieved", { estimate }));
}

export async function downloadPublicEstimatePdf(req: Request, res: Response) {
  const token = parsePublicEstimateToken(req, res);

  if (!token) {
    return;
  }

  const parsedQuery = pdfModeQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json(errorResponse("Invalid PDF mode."));
    return;
  }

  const estimate = await getPublicEstimateDocumentByToken(token);

  try {
    const pdf = await renderEstimatePdf(estimate);
    const filename = getEstimatePdfFilename(estimate.estimateNumber);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${parsedQuery.data.mode === "inline" ? "inline" : "attachment"}; filename="${filename}"`,
    );
    res.send(pdf);
  } catch (error) {
    console.error(`PDF generation failed for estimate ${estimate.estimateNumber}.`, error);
    res.status(500).json(errorResponse("Unable to generate estimate PDF."));
  }
}
