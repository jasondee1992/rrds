import { Outlet } from "react-router-dom";
import { FloatingChatbot } from "../components/public/FloatingChatbot";
import { Footer } from "../components/public/Footer";
import { PublicHeader } from "../components/public/PublicHeader";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />
      <Outlet />
      <Footer />
      <FloatingChatbot />
    </div>
  );
}
