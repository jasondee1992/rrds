import { Award, Building2, CheckCircle2 } from "lucide-react";
import { founderProfile } from "../../data/publicData";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { SectionTitle } from "./SectionTitle";

type FounderProfileSectionProps = {
  variant: "preview" | "full";
};

function ProfileBadge({
  children,
  tone = "blue",
}: {
  children: string;
  tone?: "blue" | "slate";
}) {
  const toneClasses =
    tone === "blue"
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : "border-slate-200 bg-white text-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold leading-5 sm:text-sm ${toneClasses}`}
    >
      {tone === "blue" ? (
        <Award aria-hidden="true" className="h-4 w-4 shrink-0" />
      ) : (
        <Building2 aria-hidden="true" className="h-4 w-4 shrink-0" />
      )}
      {children}
    </span>
  );
}

function FounderAvatar({ isFull }: { isFull: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[260px] lg:mx-0">
      <div
        className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${
          isFull ? "p-4" : "p-3"
        }`}
      >
        <img
          alt={founderProfile.imageAlt}
          className="aspect-square w-full rounded-md object-cover"
          src={founderProfile.image}
        />
      </div>
    </div>
  );
}

function ExpertiseBadge({ label }: { label: string }) {
  return (
    <li className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
      <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-700" />
      <span>{label}</span>
    </li>
  );
}

export function FounderProfileSection({ variant }: FounderProfileSectionProps) {
  const isFull = variant === "full";

  return (
    <section className={`${isFull ? "bg-white" : "bg-slate-50"} px-6 py-16 sm:py-20`}>
      <div className="mx-auto max-w-7xl">
        {isFull ? (
          <SectionTitle
            description="Hands-on technical leadership you can rely on"
            eyebrow="Founder Profile"
            title="Meet the Expert Behind RRDS"
          />
        ) : null}

        <div
          className={`grid gap-8 ${
            isFull
              ? "mt-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start"
              : "lg:grid-cols-[0.55fr_1.45fr] lg:items-center"
          }`}
        >
          <FounderAvatar isFull={isFull} />

          <div className="text-center lg:text-left">
            {!isFull ? (
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                Founder Profile
              </p>
            ) : null}
            <h2 className={`${isFull ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"} mt-3 font-bold text-slate-950`}>
              {founderProfile.name}
            </h2>
            <p className="mt-2 text-base font-semibold text-blue-800">
              {founderProfile.role}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <ProfileBadge>{founderProfile.experienceBadge}</ProfileBadge>
              <ProfileBadge tone="slate">{founderProfile.currentResponsibility}</ProfileBadge>
            </div>

            {isFull ? (
              <div className="mt-6 space-y-4 text-left text-base leading-7 text-slate-700">
                {founderProfile.fullBiography.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-700 lg:mx-0">
                {founderProfile.shortBiography}
              </p>
            )}

            {isFull ? (
              <div className="mt-8">
                <h3 className="text-base font-bold text-slate-950">Technical expertise</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {founderProfile.expertise.map((item) => (
                    <ExpertiseBadge key={item} label={item} />
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              {isFull ? (
                <>
                  <PrimaryButton className="w-full sm:w-fit" to="/free-quotation">
                    Request a Free Estimate
                  </PrimaryButton>
                  <SecondaryButton className="w-full sm:w-fit" to="/contact">
                    Contact RRDS
                  </SecondaryButton>
                </>
              ) : (
                <SecondaryButton className="w-full sm:w-fit" to="/about">
                  Meet Our Lead Technician
                </SecondaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
