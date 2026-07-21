import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getEstimateOptions,
  submitPublicEstimate,
} from "../controllers/publicEstimateController";
import { errorResponse } from "../utils/apiResponse";

export const publicEstimateRoutes = Router();

const publicEstimateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many estimate submissions. Please try again later."),
});

publicEstimateRoutes.get("/public/estimate-options", getEstimateOptions);
publicEstimateRoutes.post(
  "/public/estimates",
  publicEstimateRateLimiter,
  submitPublicEstimate,
);
