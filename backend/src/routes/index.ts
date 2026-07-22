import { Router } from "express";
import { adminAuthRoutes } from "./adminAuthRoutes";
import { adminDashboardRoutes } from "./adminDashboardRoutes";
import { adminEstimateRoutes } from "./adminEstimateRoutes";
import { adminInquiryRoutes } from "./adminInquiryRoutes";
import { adminQuotationRoutes } from "./adminQuotationRoutes";
import { healthRoutes } from "./healthRoutes";
import { publicContactRoutes } from "./publicContactRoutes";
import { publicEstimateRoutes } from "./publicEstimateRoutes";
import { settingsRoutes } from "./settingsRoutes";

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(publicContactRoutes);
apiRoutes.use(publicEstimateRoutes);
apiRoutes.use(settingsRoutes);
apiRoutes.use(adminAuthRoutes);
apiRoutes.use(adminDashboardRoutes);
apiRoutes.use(adminInquiryRoutes);
apiRoutes.use(adminEstimateRoutes);
apiRoutes.use(adminQuotationRoutes);
