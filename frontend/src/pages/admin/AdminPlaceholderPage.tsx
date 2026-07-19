type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Phase 4 Foundation
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        This admin section is reserved for a later phase. The route is protected and uses
        the shared admin layout.
      </p>
    </section>
  );
}
