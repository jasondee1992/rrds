import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { errorResponse } from "../utils/apiResponse";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(errorResponse(message));
};
