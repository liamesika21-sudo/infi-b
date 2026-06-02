"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
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

const navItems = [
  { href: "/dashboard",        label: "דשבורד",      icon: LayoutDashboard },
  { href: "/weeks",            label: "שבועות",      icon: Calendar },
  { href: "/definitions",      label: "הגדרות",      icon: BookMarked },
  { href: "/formulas",         label: "נוסחאות",     icon: Sigma },
  { href: "/theorems",         label: "משפטים",      icon: ScrollText },
  { href: "/practice",         label: "תרגול",       icon: Target },
  { href: "/simulations",      label: "סימולציות",   icon: FlaskConical },
  { href: "/homework-review",  label: "מטלות",       icon: ClipboardList },
  { href: "/quick-review",     label: "חזרה מהירה",  icon: Zap },
  { href: "/past-exams",       label: "מבחני עבר",   icon: FileQuestion },
  { href: "/mentor",           label: "מנטור",       icon: Brain },
  { href: "/instructor-notes", label: "הערות מקס",   icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const daysLeft = getDaysUntilExam();

  const urgencyStyle =
    daysLeft <= 7
      ? { background: "var(--red-light)", color: "var(--red-mid)", border: "1px solid var(--red-border)" }
      : daysLeft <= 21
        ? { background: "var(--amber-light)", color: "var(--amber-mid)", border: "1px solid var(--amber-border)" }
        : { background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" };

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 lg:px-8">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5 text-decoration-none"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
              style={{ background: "var(--navy)", letterSpacing: "-0.05em" }}
            >
              ∑
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                אינפי ב׳
              </span>
              <span className="block text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                מועד א׳ · 90+
              </span>
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px shrink-0" style={{ background: "var(--border)" }} />

          {/* Nav scroll */}
          <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`glass-menu-link${active ? " active" : ""}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden xl:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Exam countdown */}
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
            style={urgencyStyle}
          >
            <span className="font-mono font-black" dir="ltr">{daysLeft}</span>
            <span className="hidden sm:block" style={{ color: "var(--text-muted)", fontWeight: 500 }}>ימים</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="mx-auto max-w-7xl border-t px-5 py-5 text-center text-xs lg:px-8"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        מועד א׳ · 01.07.2026 · יעד 90+ · Calculus 2 Exam Prep
      </footer>
    </div>
  );
}
