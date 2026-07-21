import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  downloadPublicEstimatePdf,
  getPublicEstimateAccess,
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

const publicEstimateAccessRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many estimate access attempts. Please try again later."),
});

const publicEstimatePdfRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many PDF download attempts. Please try again later."),
});

publicEstimateRoutes.get("/public/estimate-options", getEstimateOptions);
publicEstimateRoutes.post(
  "/public/estimates",
  publicEstimateRateLimiter,
  submitPublicEstimate,
);
publicEstimateRoutes.get(
  "/public/estimates/access/:token",
  publicEstimateAccessRateLimiter,
  getPublicEstimateAccess,
);
publicEstimateRoutes.get(
  "/public/estimates/access/:token/pdf",
  publicEstimatePdfRateLimiter,
  downloadPublicEstimatePdf,
);
