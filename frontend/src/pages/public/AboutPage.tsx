import { CheckCircle2, Target, Telescope, UsersRound } from "lucide-react";
import { ContactCTA } from "../../components/public/ContactCTA";
import { FounderProfileSection } from "../../components/public/FounderProfileSection";
import { SectionTitle } from "../../components/public/SectionTitle";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";

const whyIcons = [CheckCircle2, Target, Telescope, UsersRound];

export function AboutPage() {
  const { settings } = useSiteSettings();
  const { about } = settings;

  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description={about.heroDescription}
            eyebrow={about.heroEyebrow}
            title={about.heroTitle}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-950">{about.introTitle}</h2>
              {about.introParagraphs.map((paragraph) => (
                <p className="mt-4 text-base leading-7 text-slate-700" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </article>
            <aside className="rounded-lg bg-slate-950 p-6 text-white sm:p-8">
              <h2 className="text-2xl font-bold">{about.commitmentTitle}</h2>
              <p className="mt-4 text-base leading-7 text-slate-200">
                {about.commitmentDescription}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <FounderProfileSection variant="full" />

      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Target aria-hidden="true" className="h-10 w-10 text-blue-700" />
            <h2 className="mt-5 text-2xl font-bold text-slate-950">{about.missionTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {about.missionDescription}
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Telescope aria-hidden="true" className="h-10 w-10 text-blue-700" />
            <h2 className="mt-5 text-2xl font-bold text-slate-950">{about.visionTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {about.visionDescription}
            </p>
          </article>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description={about.valuesDescription}
            eyebrow={about.valuesEyebrow}
            title={about.valuesTitle}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.coreValues.map((item) => (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-5" key={item}>
                <CheckCircle2 aria-hidden="true" className="h-7 w-7 text-blue-700" />
                <h2 className="mt-4 text-base font-bold text-slate-950">{item}</h2>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description={about.whyDescription}
            eyebrow={about.whyEyebrow}
            title={about.whyTitle}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {about.whyItems.map((item, index) => {
              const Icon = whyIcons[index % whyIcons.length];

              return (
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={item.title}>
                <Icon aria-hidden="true" className="h-8 w-8 text-blue-700" />
                <h2 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-blue-700 text-white">
            <UsersRound aria-hidden="true" className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{about.finalTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {about.finalDescription}
            </p>
          </div>
        </div>
      </section>

      <ContactCTA title="Ready to Discuss Your Aircon Service?" />
    </main>
  );
}
