import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { errorResponse } from "../utils/apiResponse";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const parserStatus =
    typeof err.status === "number" && err.status >= 400 && err.status < 500
      ? err.status
      : null;
  const statusCode = err instanceof AppError ? err.statusCode : parserStatus ?? 500;
  const message =
    err instanceof AppError
      ? err.message
      : statusCode === 413
        ? "Request body is too large."
        : statusCode === 400
          ? "Invalid request body."
          : "Internal server error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(errorResponse(message));
};
