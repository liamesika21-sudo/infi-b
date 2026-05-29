import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p> : null}
    </div>
  );
}

export function ModuleCard({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-slate-950">{label}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
            פתיחה
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          </span>
        </span>
      </div>
    </Link>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{body}</p>
    </div>
  );
}
