"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  ClipboardList,
  FileQuestion,
  FlaskConical,
  LayoutDashboard,
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061426]/92 shadow-[0_10px_30px_rgba(3,12,27,0.22)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-bold text-[#07162a] shadow-[inset_0_-2px_8px_rgba(8,24,46,0.18)]"
            >
              ∑
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold text-white">
                אינפי ב׳
              </span>
              <span className="block text-xs font-medium text-white/60">
                מועד א׳ · 90+
              </span>
            </span>
          </Link>

          {/* Top Nav (desktop) */}
          <nav className="glass-menu header-glass-menu hidden min-w-0 flex-1 xl:flex">
            {topNavItems.map(({ href, label, icon: Icon }, index) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`glass-menu-link glass-menu-link-${index + 1} ${active ? "active" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
            <svg className="glass-menu-outline" overflow="visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect className="glass-menu-rect" pathLength={100} x="1" y="1" width="98" height="98" rx="48" fill="transparent" />
            </svg>
          </nav>

          {/* Mobile Nav scroll */}
          <nav className="glass-menu mobile-glass-menu flex min-w-0 flex-1 xl:hidden">
            {topNavItems.slice(0, 7).map(({ href, label, icon: Icon }, index) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`glass-menu-link glass-menu-link-${index + 1} ${active ? "active" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
            <svg className="glass-menu-outline" overflow="visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect className="glass-menu-rect" pathLength={100} x="1" y="1" width="98" height="98" rx="48" fill="transparent" />
            </svg>
          </nav>

          {/* Exam countdown chip */}
          <div
            className={`flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold shadow-sm ${urgencyColor}`}
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
