import { CalendarCheck, ClipboardList } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

type ContactCTAProps = {
  title?: string;
  description?: string;
};

export function ContactCTA({
  title = "Need a Free Quotation?",
  description = "Tell RRDS what service you need and request a frontend-only quotation review using the placeholder flow.",
}: ContactCTAProps) {
  return (
    <section className="bg-slate-950 px-6 py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Schedule a Service
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <PrimaryButton className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400" to="/free-quotation">
            <ClipboardList aria-hidden="true" className="h-5 w-5" />
            Need a Free Quotation?
          </PrimaryButton>
          <SecondaryButton className="gap-2 border-white bg-transparent text-white hover:bg-white hover:text-slate-950" to="/contact">
            <CalendarCheck aria-hidden="true" className="h-5 w-5" />
            Schedule a Service
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
