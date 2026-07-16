import { ContactCTA } from "../../components/public/ContactCTA";
import { ProjectCard } from "../../components/public/ProjectCard";
import { SectionTitle } from "../../components/public/SectionTitle";
import { projects } from "../../data/publicData";

export function ProjectsPage() {
  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="This responsive gallery uses sample placeholder content only. Real RRDS project records and image management are intentionally not implemented in Phase 2."
            eyebrow="Projects"
            title="Sample Project Gallery"
          />
          <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900">
            All project cards on this page are sample data for public website layout review.
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
      <ContactCTA title="Planning an Aircon Project?" />
    </main>
  );
}
