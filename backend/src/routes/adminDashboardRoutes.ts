import { Router } from "express";
import { getAdminDashboardSummary } from "../controllers/adminDashboardController";
import { authenticateAdmin } from "../middlewares/adminAuth";

export const adminDashboardRoutes = Router();

adminDashboardRoutes.get(
  "/admin/dashboard/summary",
  authenticateAdmin,
  getAdminDashboardSummary,
);
