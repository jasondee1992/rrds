import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/adminAuthController";
import { authenticateAdmin } from "../middlewares/adminAuth";
import { errorResponse } from "../utils/apiResponse";

export const adminAuthRoutes = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many login attempts. Please try again later."),
});

adminAuthRoutes.post("/admin/auth/login", loginRateLimiter, loginAdmin);
adminAuthRoutes.get("/admin/auth/me", authenticateAdmin, getCurrentAdmin);
adminAuthRoutes.post("/admin/auth/logout", authenticateAdmin, logoutAdmin);
