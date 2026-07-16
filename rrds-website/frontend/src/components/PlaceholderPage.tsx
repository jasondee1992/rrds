type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-700">
          RRDS Airconditioning Services
        </p>
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
          {description}
        </p>
      </section>
    </main>
  );
}
