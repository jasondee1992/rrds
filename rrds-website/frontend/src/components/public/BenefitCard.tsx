import type { Benefit } from "../../data/publicData";

type BenefitCardProps = {
  benefit: Benefit;
};

export function BenefitCard({ benefit }: BenefitCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-700 text-white">
        <benefit.Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{benefit.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-700">{benefit.description}</p>
    </article>
  );
}
