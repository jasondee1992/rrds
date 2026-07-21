import { Router } from "express";
import {
  getAdminEstimateDetails,
  getAdminEstimates,
  patchAdminEstimateNotes,
  patchAdminEstimateStatus,
} from "../controllers/adminEstimateController";
import { authenticateAdmin } from "../middlewares/adminAuth";

export const adminEstimateRoutes = Router();

adminEstimateRoutes.use("/admin/estimates", authenticateAdmin);

adminEstimateRoutes.get("/admin/estimates", getAdminEstimates);
adminEstimateRoutes.get("/admin/estimates/:id", getAdminEstimateDetails);
adminEstimateRoutes.patch("/admin/estimates/:id/status", patchAdminEstimateStatus);
adminEstimateRoutes.patch("/admin/estimates/:id/notes", patchAdminEstimateNotes);
