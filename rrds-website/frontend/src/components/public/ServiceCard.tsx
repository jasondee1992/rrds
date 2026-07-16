import type { Service } from "../../data/publicData";
import { PrimaryButton } from "./PrimaryButton";
import { ImagePlaceholder } from "./ImagePlaceholder";

type ServiceCardProps = {
  service: Service;
  detailed?: boolean;
};

export function ServiceCard({ service, detailed = false }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <ImagePlaceholder Icon={service.Icon} label={service.name} />
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-xl font-bold text-slate-950">{service.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">
          {detailed ? service.description : service.summary}
        </p>
        <PrimaryButton className="mt-5 w-full sm:w-auto" to="/services">
          Learn More
        </PrimaryButton>
      </div>
    </article>
  );
}
