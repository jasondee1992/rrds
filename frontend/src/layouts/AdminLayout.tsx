import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderKanban,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type AdminNavItem = {
  label: string;
  path: string;
  Icon: LucideIcon;
};

const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", Icon: BarChart3 },
  { label: "Inquiries", path: "/admin/inquiries", Icon: MessageSquare },
  { label: "Estimate Requests", path: "/admin/estimates", Icon: ClipboardList },
  { label: "Quotations", path: "/admin/quotations", Icon: FileText },
  { label: "Customers", path: "/admin/customers", Icon: Users },
  { label: "Services", path: "/admin/services", Icon: Wrench },
  { label: "Projects", path: "/admin/projects", Icon: FolderKanban },
];

const settingsNavItems = [
  { label: "Company Information", path: "/admin/settings?tab=company" },
  { label: "Social Media", path: "/admin/settings?tab=social" },
  { label: "Home Page", path: "/admin/settings?tab=home" },
  { label: "About Page", path: "/admin/settings?tab=about" },
  { label: "Founder Profile", path: "/admin/settings?tab=founder" },
];

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/admin/inquiries/")) {
    return "Inquiry Details";
  }

  if (pathname.startsWith("/admin/estimates/")) {
    return "Estimate Details";
  }

  if (pathname.startsWith("/admin/settings")) {
    return "Settings";
  }

  const activeItem = adminNavItems.find((item) => item.path === pathname);

  return activeItem?.label ?? "Admin";
}

export function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const isSettingsActive = location.pathname.startsWith("/admin/settings");

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex min-h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-10 w-16 items-center justify-center rounded-md bg-white px-2">
          <img alt="RRDS" className="max-h-7 w-auto object-contain" src="/rrds-logo-mark.png" />
        </div>
        <div>
          <p className="text-sm font-bold leading-5">RRDS Admin</p>
          <p className="text-xs text-slate-300">Airconditioning Services</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {adminNavItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        <div>
          <NavLink
            to="/admin/settings?tab=company"
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              isSettingsActive
                ? "bg-blue-700 text-white"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Settings</span>
            <ChevronDown
              className={`ml-auto h-4 w-4 transition ${isSettingsActive ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </NavLink>
          {isSettingsActive ? (
            <div className="mt-1 space-y-1 pl-8">
              {settingsNavItems.map((item) => (
                <NavLink
                  className={() => {
                    const isActive =
                      location.pathname === "/admin/settings" &&
                      `${location.pathname}${location.search}` === item.path;

                    return `block rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`;
                  }}
                  key={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 lg:block">{sidebarContent}</aside>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] shadow-2xl">{sidebarContent}</aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={isMobileSidebarOpen ? "Close admin menu" : "Open admin menu"}
                onClick={() => setIsMobileSidebarOpen((isOpen) => !isOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-700 lg:hidden"
              >
                {isMobileSidebarOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Admin
                </p>
                <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {admin?.fullName}
                </p>
                <p className="text-xs font-medium text-slate-500">{admin?.role}</p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
