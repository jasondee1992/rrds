import { ChevronLeft, ChevronRight, Quote, Snowflake } from "lucide-react";
import { useEffect, useState } from "react";
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
  resolvePublicAssetUrl,
  useSiteSettings,
} from "../../contexts/SiteSettingsContext";
import {
  benefits,
  projects,
  services,
  testimonials,
} from "../../data/publicData";

function HomeHeroCarousel() {
  const { settings } = useSiteSettings();
  const images = settings.home.carouselImages;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <ImagePlaceholder Icon={Snowflake} label="Professional air-conditioning technician" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="relative aspect-[4/3] min-h-[320px]">
        <img
          alt={activeImage.altText}
          className="h-full w-full object-cover"
          src={resolvePublicAssetUrl(activeImage.imageUrl)}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5">
          <p className="text-sm font-semibold text-white">
            {activeImage.caption || activeImage.altText}
          </p>
        </div>
        {images.length > 1 ? (
          <>
            <button
              aria-label="Previous carousel image"
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              onClick={() =>
                setActiveIndex((currentIndex) =>
                  currentIndex === 0 ? images.length - 1 : currentIndex - 1,
                )
              }
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              aria-label="Next carousel image"
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              onClick={() =>
                setActiveIndex((currentIndex) => (currentIndex + 1) % images.length)
              }
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="flex justify-center gap-2 bg-slate-950 px-4 py-3">
          {images.map((image, index) => (
            <button
              aria-label={`Show carousel image ${index + 1}`}
              className={`h-2.5 rounded-full transition ${
                index === activeIndex ? "w-8 bg-cyan-300" : "w-2.5 bg-white/40"
              }`}
              key={image.imageUrl}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const { settings } = useSiteSettings();
  const { home } = settings;

  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              {home.heroEyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              {home.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton to={home.primaryCtaPath}>{home.primaryCtaLabel}</PrimaryButton>
              <SecondaryButton to={home.secondaryCtaPath}>{home.secondaryCtaLabel}</SecondaryButton>
            </div>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {home.stats.map((stat) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={stat.label}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-base font-bold text-slate-950">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HomeHeroCarousel />
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            align="center"
            description={home.whyDescription}
            eyebrow={home.whyEyebrow}
            title={home.whyTitle}
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
              description={home.servicesDescription}
              eyebrow={home.servicesEyebrow}
              title={home.servicesTitle}
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
              {home.aboutEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {home.aboutTitle}
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-200">
              {home.aboutDescription}
            </p>
            <div className="mt-8">
              <PrimaryButton className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" to="/about">
                {home.aboutCtaLabel}
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
              description={home.projectsDescription}
              eyebrow={home.projectsEyebrow}
              title={home.projectsTitle}
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
            description={home.testimonialsDescription}
            eyebrow={home.testimonialsEyebrow}
            title={home.testimonialsTitle}
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
