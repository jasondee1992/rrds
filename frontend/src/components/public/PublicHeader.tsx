import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { PrimaryButton } from "./PrimaryButton";

export function PublicHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="RRDS Airconditioning Services home"
          className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          to="/"
        >
          <img
            alt="RRDS Airconditioning Services"
            className="h-12 w-auto max-w-[170px] object-contain sm:h-14 sm:max-w-[220px]"
            src="/rrds-logo-brand.png"
          />
        </Link>

        <div className="flex items-center gap-4">
          <DesktopNavigation />
          <PrimaryButton className="hidden xl:inline-flex" to="/free-quotation">
            Get a Free Quote
          </PrimaryButton>
          <button
            aria-expanded={isMobileOpen}
            aria-label="Open mobile navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-700 lg:hidden"
            onClick={() => setIsMobileOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </div>
      <MobileNavigation isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </header>
  );
}
