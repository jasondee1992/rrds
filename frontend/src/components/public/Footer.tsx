import { Link } from "react-router-dom";
import { BriefcaseBusiness, LinkIcon, Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import { navigationLinks, services } from "../../data/publicData";

export function Footer() {
  const { settings } = useSiteSettings();
  const contactDetails = [
    {
      label: "Phone",
      value: settings.company.contactNumber,
      href: `tel:${settings.company.contactNumber.replaceAll(" ", "")}`,
      Icon: Phone,
    },
    {
      label: "Email",
      value: settings.company.email,
      href: `mailto:${settings.company.email}`,
      Icon: Mail,
    },
    { label: "Address", value: settings.company.address, Icon: MapPin },
    ...(settings.socialLinks.facebook
      ? [
          {
            label: "Facebook",
            value: "RRDS Aircon Services",
            href: settings.socialLinks.facebook,
            Icon: BriefcaseBusiness,
          },
        ]
      : []),
    ...(settings.socialLinks.linkedin
      ? [
          {
            label: "LinkedIn",
            value: "RRDS LinkedIn",
            href: settings.socialLinks.linkedin,
            Icon: LinkIcon,
          },
        ]
      : []),
  ];

  return (
    <footer className="bg-slate-950 px-6 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link
            aria-label={`${settings.company.name} home`}
            className="inline-flex rounded bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            to="/"
          >
            <img
              alt={settings.company.name}
              className="h-12 w-auto max-w-[190px] object-contain"
              src="/rrds-logo-brand.png"
            />
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
                {item.href ? (
                  <a
                    className="hover:text-white"
                    href={item.href}
                    rel="noreferrer"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-sm text-slate-400">
        <p>{settings.company.name}. Public website content managed from admin settings.</p>
      </div>
    </footer>
  );
}
