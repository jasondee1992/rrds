import { Router } from "express";
import {
  deleteAdminEstimatePublicAccessToken,
  downloadAdminEstimatePdf,
  getAdminEstimateDetails,
  getAdminEstimates,
  patchAdminEstimateNotes,
  patchAdminEstimateStatus,
  postAdminEstimatePublicAccessToken,
} from "../controllers/adminEstimateController";
import { authenticateAdmin } from "../middlewares/adminAuth";

export const adminEstimateRoutes = Router();

adminEstimateRoutes.use("/admin/estimates", authenticateAdmin);

adminEstimateRoutes.get("/admin/estimates", getAdminEstimates);
adminEstimateRoutes.get("/admin/estimates/:id", getAdminEstimateDetails);
adminEstimateRoutes.get("/admin/estimates/:id/pdf", downloadAdminEstimatePdf);
adminEstimateRoutes.patch("/admin/estimates/:id/status", patchAdminEstimateStatus);
adminEstimateRoutes.patch("/admin/estimates/:id/notes", patchAdminEstimateNotes);
adminEstimateRoutes.post(
  "/admin/estimates/:id/public-access-token",
  postAdminEstimatePublicAccessToken,
);
adminEstimateRoutes.delete(
  "/admin/estimates/:id/public-access-token",
  deleteAdminEstimatePublicAccessToken,
);
