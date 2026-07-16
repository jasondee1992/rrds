import { X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { navigationLinks } from "../../data/publicData";

type MobileNavigationProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Close mobile navigation overlay"
        className="absolute inset-0 bg-slate-950/50"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Mobile navigation"
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xl font-black tracking-normal text-slate-950">RRDS</span>
          <button
            aria-label="Close mobile navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <nav aria-label="Mobile primary navigation" className="mt-8 flex flex-col gap-2">
          {navigationLinks.map((link) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-md px-4 py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                  isActive
                    ? "bg-blue-50 text-blue-800"
                    : "text-slate-700 hover:bg-slate-100 hover:text-blue-800"
                }`
              }
              key={link.path}
              onClick={onClose}
              to={link.path}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Link
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          onClick={onClose}
          to="/free-quotation"
        >
          Get a Free Quote
        </Link>
      </aside>
    </div>
  );
}
