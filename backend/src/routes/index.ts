import { Router } from "express";
import { adminAuthRoutes } from "./adminAuthRoutes";
import { adminDashboardRoutes } from "./adminDashboardRoutes";
import { adminInquiryRoutes } from "./adminInquiryRoutes";
import { healthRoutes } from "./healthRoutes";
import { publicContactRoutes } from "./publicContactRoutes";

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(publicContactRoutes);
apiRoutes.use(adminAuthRoutes);
apiRoutes.use(adminDashboardRoutes);
apiRoutes.use(adminInquiryRoutes);
