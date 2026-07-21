import { Router } from "express";
import {
  getAdminQuotationDetails,
  getAdminQuotations,
} from "../controllers/adminQuotationController";
import { authenticateAdmin } from "../middlewares/adminAuth";

export const adminQuotationRoutes = Router();

adminQuotationRoutes.use("/admin/quotations", authenticateAdmin);

adminQuotationRoutes.get("/admin/quotations", getAdminQuotations);
adminQuotationRoutes.get("/admin/quotations/:id", getAdminQuotationDetails);
