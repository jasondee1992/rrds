import { AdminRole } from "@prisma/client";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import {
  deleteFounderProfileImage,
  deleteHomeCarouselImageController,
  getAdminPublicProfileSettingsController,
  getPublicSiteSettingsController,
  patchHomeCarouselImage,
  patchHomeCarouselImageOrder,
  patchCompanyInformation,
  patchFounderProfile,
  patchHomePageSettings,
  patchSocialLinks,
  postFounderProfileImage,
  postHomeCarouselImage,
} from "../controllers/settingsController";
import { authenticateAdmin, authorizeRoles } from "../middlewares/adminAuth";
import { errorResponse } from "../utils/apiResponse";

export const settingsRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const publicSettingsRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many requests. Please try again later."),
});

settingsRoutes.get(
  "/public/site-settings",
  publicSettingsRateLimiter,
  getPublicSiteSettingsController,
);

settingsRoutes.use("/admin/settings", authenticateAdmin);
settingsRoutes.get("/admin/settings/public-profile", getAdminPublicProfileSettingsController);

const requireSettingsWrite = authorizeRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN);

settingsRoutes.patch(
  "/admin/settings/company-information",
  requireSettingsWrite,
  patchCompanyInformation,
);
settingsRoutes.patch("/admin/settings/social-links", requireSettingsWrite, patchSocialLinks);
settingsRoutes.patch(
  "/admin/settings/founder-profile",
  requireSettingsWrite,
  patchFounderProfile,
);
settingsRoutes.patch(
  "/admin/settings/home-page",
  requireSettingsWrite,
  patchHomePageSettings,
);
settingsRoutes.post(
  "/admin/settings/founder-profile/image",
  requireSettingsWrite,
  upload.single("image"),
  postFounderProfileImage,
);
settingsRoutes.delete(
  "/admin/settings/founder-profile/image",
  requireSettingsWrite,
  deleteFounderProfileImage,
);
settingsRoutes.post(
  "/admin/settings/home-page/carousel-images",
  requireSettingsWrite,
  upload.single("image"),
  postHomeCarouselImage,
);
settingsRoutes.patch(
  "/admin/settings/home-page/carousel-images/reorder",
  requireSettingsWrite,
  patchHomeCarouselImageOrder,
);
settingsRoutes.patch(
  "/admin/settings/home-page/carousel-images/:imageId",
  requireSettingsWrite,
  patchHomeCarouselImage,
);
settingsRoutes.delete(
  "/admin/settings/home-page/carousel-images/:imageId",
  requireSettingsWrite,
  deleteHomeCarouselImageController,
);
