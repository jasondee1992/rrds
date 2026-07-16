import { MapPin, Snowflake } from "lucide-react";
import type { Project } from "../../data/publicData";
import { SecondaryButton } from "./SecondaryButton";
import { ImagePlaceholder } from "./ImagePlaceholder";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <ImagePlaceholder Icon={Snowflake} label={project.title} />
      <div className="flex flex-1 flex-col pt-5">
        {project.isSample ? (
          <span className="mb-3 w-fit rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-800">
            Sample Data
          </span>
        ) : null}
        <h3 className="text-xl font-bold text-slate-950">{project.title}</h3>
        <p className="mt-2 text-sm font-semibold text-blue-700">{project.serviceType}</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <MapPin aria-hidden="true" className="h-4 w-4 text-blue-700" />
          {project.location}
        </p>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{project.summary}</p>
        <SecondaryButton className="mt-5 w-full sm:w-auto" to="/projects">
          View Project
        </SecondaryButton>
      </div>
    </article>
  );
}
