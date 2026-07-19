import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedAdminRoute } from "../components/admin/ProtectedAdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminPlaceholderPage } from "../pages/admin/AdminPlaceholderPage";
import { PublicLayout } from "../layouts/PublicLayout";
import { AboutPage } from "../pages/public/AboutPage";
import { ContactPage } from "../pages/public/ContactPage";
import { FreeQuotationPage } from "../pages/public/FreeQuotationPage";
import { HomePage } from "../pages/public/HomePage";
import { ProjectsPage } from "../pages/public/ProjectsPage";
import { ServicesPage } from "../pages/public/ServicesPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/free-quotation" element={<FreeQuotationPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="inquiries" element={<AdminPlaceholderPage title="Inquiries" />} />
          <Route
            path="estimate-requests"
            element={<AdminPlaceholderPage title="Estimate Requests" />}
          />
          <Route path="quotations" element={<AdminPlaceholderPage title="Quotations" />} />
          <Route path="customers" element={<AdminPlaceholderPage title="Customers" />} />
          <Route path="services" element={<AdminPlaceholderPage title="Services" />} />
          <Route path="projects" element={<AdminPlaceholderPage title="Projects" />} />
          <Route path="settings" element={<AdminPlaceholderPage title="Settings" />} />
        </Route>
      </Route>
    </Routes>
  );
}
