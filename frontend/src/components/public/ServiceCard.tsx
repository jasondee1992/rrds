import { Snowflake, type LucideIcon } from "lucide-react";
import { resolvePublicAssetUrl } from "../../contexts/SiteSettingsContext";
import { PrimaryButton } from "./PrimaryButton";
import { ImagePlaceholder } from "./ImagePlaceholder";

type ServiceCardService = {
  id?: string;
  key?: string;
  name: string;
  summary: string;
  description: string;
  imageUrl?: string;
  Icon?: LucideIcon;
};

type ServiceCardProps = {
  service: ServiceCardService;
  detailed?: boolean;
};

export function ServiceCard({ service, detailed = false }: ServiceCardProps) {
  const Icon = service.Icon ?? Snowflake;

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {service.imageUrl ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <img
            alt={service.name}
            className="aspect-[4/3] w-full object-cover"
            src={resolvePublicAssetUrl(service.imageUrl)}
          />
        </div>
      ) : (
        <ImagePlaceholder Icon={Icon} label={service.name} />
      )}
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
