"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  Calendar,
  ClipboardList,
  FileQuestion,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Layers3,
  ListChecks,
  ScrollText,
  Sigma,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

function getDaysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const navGroups = [
  {
    label: "ראשי",
    items: [
      { href: "/dashboard", label: "דשבורד", icon: LayoutDashboard },
      { href: "/weeks", label: "שבועות", icon: Calendar },
      { href: "/topics", label: "נושאים", icon: Layers3 },
    ],
  },
  {
    label: "חומר לימוד",
    items: [
      { href: "/formulas", label: "נוסחאות", icon: Sigma },
      { href: "/theorems", label: "משפטים", icon: ScrollText },
      { href: "/proof-patterns", label: "הוכחות", icon: BookOpen },
    ],
  },
  {
    label: "תרגול",
    items: [
      { href: "/practice", label: "תרגול", icon: Target },
      { href: "/simulations", label: "סימולציות", icon: FlaskConical },
      { href: "/past-exams", label: "מבחני עבר", icon: FileQuestion },
    ],
  },
  {
    label: "חזרה",
    items: [
      { href: "/homework-review", label: "מטלות", icon: ClipboardList },
      { href: "/quick-review", label: "חזרה מהירה", icon: Zap },
      { href: "/progress", label: "מעקב", icon: Gauge },
    ],
  },
  {
    label: "כלים",
    items: [
      { href: "/mentor", label: "מנטור", icon: Brain },
    ],
  },
];

const topNavItems = [
  { href: "/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { href: "/weeks", label: "שבועות", icon: Calendar },
  { href: "/formulas", label: "נוסחאות", icon: Sigma },
  { href: "/theorems", label: "משפטים", icon: ScrollText },
  { href: "/practice", label: "תרגול", icon: Target },
  { href: "/simulations", label: "סימולציות", icon: FlaskConical },
  { href: "/homework-review", label: "מטלות", icon: ClipboardList },
  { href: "/quick-review", label: "חזרה מהירה", icon: Zap },
  { href: "/past-exams", label: "מבחני עבר", icon: FileQuestion },
  { href: "/mentor", label: "מנטור", icon: Brain },
  { href: "/instructor-notes", label: "הערות מקס", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const daysLeft = getDaysUntilExam();

  const urgencyColor =
    daysLeft <= 7
      ? "bg-red-600 text-white"
      : daysLeft <= 21
        ? "bg-amber-500 text-white"
        : "bg-[var(--navy)] text-white";

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: "var(--border)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white"
              style={{ background: "var(--navy)" }}
            >
              ∑
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                אינפי ב׳
              </span>
              <span className="block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                מועד א׳ · 90+
              </span>
            </span>
          </Link>

          {/* Top Nav (desktop) */}
          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto xl:flex">
            {topNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    color: active ? "var(--navy-mid)" : "var(--text-secondary)",
                    background: active ? "var(--navy-light)" : "transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Nav scroll */}
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto xl:hidden">
            {topNavItems.slice(0, 7).map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    color: active ? "var(--navy-mid)" : "var(--text-secondary)",
                    background: active ? "var(--navy-light)" : "transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Exam countdown chip */}
          <div
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${urgencyColor}`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span dir="ltr" className="font-mono font-bold">
              {daysLeft}
            </span>
            <span className="hidden sm:block">ימים</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">{children}</main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t px-4 py-4 text-center text-xs lg:px-6" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        מועד א׳ · 01.07.2026 · יעד 90+ · Calculus 2 Exam Prep
      </footer>
    </div>
  );
}
