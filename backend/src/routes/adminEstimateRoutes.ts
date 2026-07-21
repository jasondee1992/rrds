import { Router } from "express";
import {
  deleteAdminEstimatePublicAccessToken,
  downloadAdminEstimatePdf,
  getAdminEstimateDetails,
  getAdminEstimates,
  patchAdminEstimateNotes,
  patchAdminEstimateStatus,
  postAdminEstimateCancel,
  postAdminEstimateConvertToQuotation,
  postAdminEstimateReady,
  postAdminEstimateStartReview,
  postAdminEstimatePublicAccessToken,
  putAdminEstimateReview,
} from "../controllers/adminEstimateController";
import { authenticateAdmin, authorizeRoles } from "../middlewares/adminAuth";
import { AdminRole } from "@prisma/client";

export const adminEstimateRoutes = Router();

adminEstimateRoutes.use("/admin/estimates", authenticateAdmin);

adminEstimateRoutes.get("/admin/estimates", getAdminEstimates);
adminEstimateRoutes.get("/admin/estimates/:id", getAdminEstimateDetails);
adminEstimateRoutes.get("/admin/estimates/:id/pdf", downloadAdminEstimatePdf);
adminEstimateRoutes.patch("/admin/estimates/:id/status", patchAdminEstimateStatus);
adminEstimateRoutes.patch("/admin/estimates/:id/notes", patchAdminEstimateNotes);
adminEstimateRoutes.post("/admin/estimates/:id/start-review", postAdminEstimateStartReview);
adminEstimateRoutes.put("/admin/estimates/:id/review", putAdminEstimateReview);
adminEstimateRoutes.post("/admin/estimates/:id/mark-ready", postAdminEstimateReady);
adminEstimateRoutes.post("/admin/estimates/:id/cancel", postAdminEstimateCancel);
adminEstimateRoutes.post(
  "/admin/estimates/:id/convert-to-quotation",
  authorizeRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.STAFF),
  postAdminEstimateConvertToQuotation,
);
adminEstimateRoutes.post(
  "/admin/estimates/:id/public-access-token",
  postAdminEstimatePublicAccessToken,
);
adminEstimateRoutes.delete(
  "/admin/estimates/:id/public-access-token",
  deleteAdminEstimatePublicAccessToken,
);
