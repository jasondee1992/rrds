import type { Request, Response } from "express";
import {
  createPublicEstimate,
  getPublicEstimateOptions,
} from "../services/estimateService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { publicEstimateSchema } from "../validations/estimateSchemas";

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
