import { Route, Routes } from "react-router-dom";
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
    </Routes>
  );
}
