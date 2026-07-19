import { Router } from "express";
import {
  getAdminInquiries,
  getAdminInquiryCustomerMatches,
  getAdminInquiryDetails,
  patchAdminInquiryLinkCustomer,
  patchAdminInquiryNotes,
  patchAdminInquiryStatus,
  postAdminInquiryCreateCustomer,
} from "../controllers/adminInquiryController";
import { authenticateAdmin } from "../middlewares/adminAuth";

export const adminInquiryRoutes = Router();

adminInquiryRoutes.use("/admin/inquiries", authenticateAdmin);

adminInquiryRoutes.get("/admin/inquiries", getAdminInquiries);
adminInquiryRoutes.get("/admin/inquiries/:id", getAdminInquiryDetails);
adminInquiryRoutes.patch("/admin/inquiries/:id/status", patchAdminInquiryStatus);
adminInquiryRoutes.patch("/admin/inquiries/:id/notes", patchAdminInquiryNotes);
adminInquiryRoutes.get("/admin/inquiries/:id/customer-matches", getAdminInquiryCustomerMatches);
adminInquiryRoutes.post("/admin/inquiries/:id/create-customer", postAdminInquiryCreateCustomer);
adminInquiryRoutes.patch("/admin/inquiries/:id/link-customer", patchAdminInquiryLinkCustomer);
