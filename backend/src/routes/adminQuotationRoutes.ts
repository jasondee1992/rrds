import { Router } from "express";
import {
  getAdminQuotationCustomers,
  getAdminQuotationDefaults,
  getAdminQuotationDetails,
  getAdminQuotations,
  patchAdminQuotation,
  patchAdminQuotationStatus,
  postAdminQuotation,
  postAdminQuotationDuplicate,
} from "../controllers/adminQuotationController";
import type { Request, Response } from "express";
import { errorResponse } from "../utils/apiResponse";
import { authenticateAdmin } from "../middlewares/adminAuth";

export const adminQuotationRoutes = Router();

adminQuotationRoutes.use("/admin/quotations", authenticateAdmin);

adminQuotationRoutes.get("/admin/quotations/defaults", getAdminQuotationDefaults);
adminQuotationRoutes.get("/admin/quotations/customers", getAdminQuotationCustomers);
adminQuotationRoutes.post("/admin/quotations", postAdminQuotation);
adminQuotationRoutes.get("/admin/quotations", getAdminQuotations);
adminQuotationRoutes.get("/admin/quotations/:id", getAdminQuotationDetails);
adminQuotationRoutes.patch("/admin/quotations/:id", patchAdminQuotation);
adminQuotationRoutes.patch("/admin/quotations/:id/status", patchAdminQuotationStatus);
adminQuotationRoutes.post("/admin/quotations/:id/duplicate", postAdminQuotationDuplicate);

const transactionalSaveOnly = (_req: Request, res: Response) => {
  res
    .status(405)
    .json(errorResponse("Use PATCH /api/admin/quotations/:id to save quotation items transactionally."));
};

adminQuotationRoutes.post("/admin/quotations/:id/items", transactionalSaveOnly);
adminQuotationRoutes.patch("/admin/quotations/:id/items/:itemId", transactionalSaveOnly);
adminQuotationRoutes.delete("/admin/quotations/:id/items/:itemId", transactionalSaveOnly);
adminQuotationRoutes.patch("/admin/quotations/:id/reorder-items", transactionalSaveOnly);
