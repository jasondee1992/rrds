import { ContactCTA } from "../../components/public/ContactCTA";
import { SectionTitle } from "../../components/public/SectionTitle";
import { ServiceCard } from "../../components/public/ServiceCard";
import { services } from "../../data/publicData";

export function ServicesPage() {
  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="All service descriptions are Phase 2 placeholders for later replacement with approved RRDS service copy."
            eyebrow="Services"
            title="Complete Air-Conditioning Service Options"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard detailed key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>
      <ContactCTA
        description="Use the frontend-only quotation layout to prepare service details for RRDS review."
        title="Need Service Pricing?"
      />
    </main>
  );
}
