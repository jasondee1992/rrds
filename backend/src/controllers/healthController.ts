import type { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";

export function getHealth(_req: Request, res: Response) {
  res.json(successResponse("RRDS API is running"));
}
