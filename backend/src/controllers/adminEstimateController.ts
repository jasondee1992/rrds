import type { Request, Response } from "express";
import {
  getEstimateRequestDetails,
  listEstimateRequests,
  updateEstimateRequestNotes,
  updateEstimateRequestStatus,
} from "../services/estimateService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  estimateIdParamSchema,
  estimateListQuerySchema,
  updateEstimateNotesSchema,
  updateEstimateStatusSchema,
} from "../validations/estimateSchemas";

function parseEstimateId(req: Request, res: Response) {
  const parsedParams = estimateIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid estimate request ID."));
    return null;
  }

  return parsedParams.data.id;
}

export async function getAdminEstimates(req: Request, res: Response) {
  const parsedQuery = estimateListQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json(errorResponse("Invalid estimate request filters."));
    return;
  }

  const result = await listEstimateRequests(parsedQuery.data);

  res.json(successResponse("Estimate requests retrieved", result));
}

export async function getAdminEstimateDetails(req: Request, res: Response) {
  const estimateId = parseEstimateId(req, res);

  if (!estimateId) {
    return;
  }

  const estimate = await getEstimateRequestDetails(estimateId);

  res.json(successResponse("Estimate request details retrieved", { estimate }));
}

export async function patchAdminEstimateStatus(req: Request, res: Response) {
  const estimateId = parseEstimateId(req, res);

  if (!estimateId) {
    return;
  }

  const parsedBody = updateEstimateStatusSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid estimate request status."));
    return;
  }

  const estimate = await updateEstimateRequestStatus(estimateId, parsedBody.data.status);

  res.json(successResponse("Estimate request status updated", { estimate }));
}

export async function patchAdminEstimateNotes(req: Request, res: Response) {
  const estimateId = parseEstimateId(req, res);

  if (!estimateId) {
    return;
  }

  const parsedBody = updateEstimateNotesSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid internal notes."));
    return;
  }

  const estimate = await updateEstimateRequestNotes(
    estimateId,
    parsedBody.data.internalNotes,
  );

  res.json(successResponse("Internal notes updated", { estimate }));
}
