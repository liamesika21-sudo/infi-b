import Link from "next/link";
import { BookOpen, Brain, ClipboardList, FileQuestion, Gauge, Home, Layers3, ListChecks, Sigma, Sparkles, Target } from "lucide-react";
import { calculus2Course, moduleRoutes } from "@/lib/calculus2/config";

const icons = [Home, Layers3, BookOpen, Sigma, ListChecks, Target, ClipboardList, FileQuestion, ClipboardList, Sparkles, Gauge, Brain];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f6f8f8] text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              ∑
            </span>
            <span>
              <span className="block text-lg font-semibold">{calculus2Course.nameHe}</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {calculus2Course.nameEn} · Moed A · {calculus2Course.targetScoreLabel}
              </span>
            </span>
          </Link>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {moduleRoutes.slice(0, 8).map((route, index) => {
              const Icon = icons[index] ?? BookOpen;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                >
                  <Icon className="h-4 w-4" />
                  {route.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
