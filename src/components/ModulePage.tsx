import { EmptyState } from "./Cards";

export function ModulePage({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyBody,
}: {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{description}</p>
      </section>
      <EmptyState title={emptyTitle} body={emptyBody} />
    </div>
  );
}
