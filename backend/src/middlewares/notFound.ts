import type { Request, Response } from "express";
import { errorResponse } from "../utils/apiResponse";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.originalUrl}`));
}
