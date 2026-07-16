import { Link } from "react-router-dom";
import { contactDetails, navigationLinks, services } from "../../data/publicData";

export function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link className="text-2xl font-black tracking-normal" to="/">
            RRDS
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Professional air-conditioning installation, maintenance, cleaning, and repair
            services for homes and businesses.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Navigation
          </h2>
          <ul className="mt-4 space-y-3">
            {navigationLinks.map((link) => (
              <li key={link.path}>
                <Link className="text-sm text-slate-300 hover:text-white" to={link.path}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Services
          </h2>
          <ul className="mt-4 space-y-3">
            {services.slice(0, 5).map((service) => (
              <li key={service.id}>
                <Link className="text-sm text-slate-300 hover:text-white" to="/services">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Contact
          </h2>
          <ul className="mt-4 space-y-3">
            {contactDetails.map((item) => (
              <li className="text-sm text-slate-300" key={item.label}>
                <span className="font-semibold text-white">{item.label}: </span>
                {item.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-sm text-slate-400">
        <p>RRDS Airconditioning Services. Public website placeholder content for editing.</p>
      </div>
    </footer>
  );
}
