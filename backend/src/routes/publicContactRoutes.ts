import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitPublicContactInquiry } from "../controllers/publicContactController";
import { errorResponse } from "../utils/apiResponse";

export const publicContactRoutes = Router();

const publicContactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many contact submissions. Please try again later."),
});

publicContactRoutes.post(
  "/public/contact",
  publicContactRateLimiter,
  submitPublicContactInquiry,
);
