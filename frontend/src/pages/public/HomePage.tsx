import { Fan, Quote, Snowflake } from "lucide-react";
import { BenefitCard } from "../../components/public/BenefitCard";
import { ContactCTA } from "../../components/public/ContactCTA";
import { FounderProfileSection } from "../../components/public/FounderProfileSection";
import { ImagePlaceholder } from "../../components/public/ImagePlaceholder";
import { PrimaryButton } from "../../components/public/PrimaryButton";
import { ProjectCard } from "../../components/public/ProjectCard";
import { SecondaryButton } from "../../components/public/SecondaryButton";
import { SectionTitle } from "../../components/public/SectionTitle";
import { ServiceCard } from "../../components/public/ServiceCard";
import {
  benefits,
  heroStats,
  heroVisualItems,
  projects,
  services,
  testimonials,
} from "../../data/publicData";

export function HomePage() {
  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              RRDS Airconditioning Services
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              KEEPING YOU COOL. ALWAYS.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Professional air-conditioning installation, maintenance, cleaning, and repair
              services for homes and businesses.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton to="/free-quotation">Request Free Quotation</PrimaryButton>
              <SecondaryButton to="/contact">Contact Us</SecondaryButton>
            </div>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={stat.label}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-base font-bold text-slate-950">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <ImagePlaceholder Icon={Fan} label="Professional air-conditioning technician" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {heroVisualItems.map((item) => (
                <div className="rounded-md bg-white p-4 text-center shadow-sm" key={item.label}>
                  <item.Icon aria-hidden="true" className="mx-auto h-6 w-6 text-blue-700" />
                  <p className="mt-2 text-xs font-bold text-slate-700">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            align="center"
            description="Built around dependable workmanship, practical recommendations, and responsive support."
            eyebrow="Why Choose RRDS"
            title="Reliable Air-Conditioning Support"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <BenefitCard benefit={benefit} key={benefit.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              description="Core RRDS public service offerings shown with editable placeholder descriptions."
              eyebrow="Our Services"
              title="Aircon Services for Homes and Businesses"
            />
            <SecondaryButton className="w-full sm:w-fit" to="/services">
              View All Services
            </SecondaryButton>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <ImagePlaceholder Icon={Snowflake} label="RRDS company service placeholder" variant="dark" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
              About RRDS
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Professional service with a focus on comfort and reliability.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-200">
              RRDS Airconditioning Services is presented here with editable placeholder
              content for Phase 2. This section can later be updated with approved company
              details while keeping the focus on quality work, reliable service, and support
              for both residential and commercial customers.
            </p>
            <div className="mt-8">
              <PrimaryButton className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" to="/about">
                Learn More About RRDS
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      <FounderProfileSection variant="preview" />

      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              description="Sample cards only. Replace these with verified RRDS project details during a later phase."
              eyebrow="Sample Projects"
              title="Project Preview"
            />
            <SecondaryButton className="w-full sm:w-fit" to="/projects">
              View Projects
            </SecondaryButton>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            align="center"
            description="Placeholder testimonials for layout approval. Replace with verified customer feedback later."
            eyebrow="Testimonials"
            title="What Customers May Say"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm"
                key={testimonial.id}
              >
                <Quote aria-hidden="true" className="h-8 w-8 text-blue-700" />
                <p className="mt-5 text-sm leading-6 text-slate-700">"{testimonial.quote}"</p>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="font-bold text-slate-950">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  {testimonial.isPlaceholder ? (
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-cyan-800">
                      Placeholder content
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}
