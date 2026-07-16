import { NavLink } from "react-router-dom";
import { navigationLinks } from "../../data/publicData";

export function DesktopNavigation() {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
      {navigationLinks.map((link) => (
        <NavLink
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
              isActive
                ? "bg-blue-50 text-blue-800"
                : "text-slate-700 hover:bg-slate-100 hover:text-blue-800"
            }`
          }
          key={link.path}
          to={link.path}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
