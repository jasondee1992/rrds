import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function AdminAuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
          RRDS Admin
        </p>
        <h1 className="mt-3 text-xl font-semibold">Checking access</h1>
      </div>
    </main>
  );
}

export function ProtectedAdminRoute() {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <AdminAuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
