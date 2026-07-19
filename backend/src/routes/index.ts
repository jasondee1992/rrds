import { Router } from "express";
import { adminAuthRoutes } from "./adminAuthRoutes";
import { adminDashboardRoutes } from "./adminDashboardRoutes";
import { healthRoutes } from "./healthRoutes";

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(adminAuthRoutes);
apiRoutes.use(adminDashboardRoutes);
