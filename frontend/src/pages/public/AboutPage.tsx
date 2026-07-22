import { CheckCircle2, Target, Telescope, UsersRound } from "lucide-react";
import { ContactCTA } from "../../components/public/ContactCTA";
import { FounderProfileSection } from "../../components/public/FounderProfileSection";
import { SectionTitle } from "../../components/public/SectionTitle";
import { benefits } from "../../data/publicData";

const valueItems = [
  "Quality-focused work",
  "Clear communication",
  "Reliable scheduling",
  "Practical service recommendations",
];

export function AboutPage() {
  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="Placeholder company content for RRDS Airconditioning Services. Replace this copy with approved company information when available."
            eyebrow="About Us"
            title="Air-Conditioning Service Built Around Comfort and Reliability"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-950">Company Introduction</h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                RRDS Airconditioning Services provides frontend placeholder content here for
                installation, maintenance, cleaning, repair, troubleshooting, and replacement
                support. The final company description should be supplied and approved before
                launch.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-700">
                This page intentionally avoids claims about company history, certifications,
                awards, or years of experience until verified content is provided.
              </p>
            </article>
            <aside className="rounded-lg bg-slate-950 p-6 text-white sm:p-8">
              <h2 className="text-2xl font-bold">Service Commitment</h2>
              <p className="mt-4 text-base leading-7 text-slate-200">
                RRDS is positioned as a professional air-conditioning service provider focused
                on quality, reliable response, residential support, and commercial support.
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
            <h2 className="mt-5 text-2xl font-bold text-slate-950">Mission</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Placeholder mission statement: provide dependable air-conditioning service that
              helps customers maintain safe, comfortable, and efficient indoor spaces.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Telescope aria-hidden="true" className="h-10 w-10 text-blue-700" />
            <h2 className="mt-5 text-2xl font-bold text-slate-950">Vision</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Placeholder vision statement: become a trusted air-conditioning service partner
              for customers who value professionalism, clarity, and reliable support.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="Editable values for Phase 2 layout approval. Replace with approved RRDS wording later."
            eyebrow="Core Values"
            title="What Guides the Service"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valueItems.map((item) => (
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
            description="Public-facing reasons customers may choose RRDS, written as placeholder content pending final approval."
            eyebrow="Why Choose RRDS"
            title="Practical Support for Aircon Service Needs"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={benefit.title}>
                <benefit.Icon aria-hidden="true" className="h-8 w-8 text-blue-700" />
                <h2 className="mt-4 text-xl font-bold text-slate-950">{benefit.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-blue-700 text-white">
            <UsersRound aria-hidden="true" className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Service Commitment</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              RRDS service content should remain easy to edit as real operational details are
              approved. This Phase 2 layout keeps the public message focused on quality work,
              reliability, residential service, commercial service, and customer support.
            </p>
          </div>
        </div>
      </section>

      <ContactCTA title="Ready to Discuss Your Aircon Service?" />
    </main>
  );
}
