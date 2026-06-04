"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  FileQuestion,
  FlaskConical,
  LayoutDashboard,
  Sigma,
  Target,
  Zap,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

function getDaysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const NAV_ITEMS = [
  { href: "/dashboard",   label: "דשבורד",    icon: LayoutDashboard },
  { href: "/weeks",       label: "שבועות",    icon: Calendar },
  { href: "/formulas",    label: "נוסחאות",   icon: Sigma },
  { href: "/practice",    label: "תרגול",     icon: Target },
  { href: "/simulations", label: "סימולציות", icon: FlaskConical },
  { href: "/past-exams",  label: "מבחני עבר", icon: FileQuestion },
  { href: "/quick-review",label: "חזרה",      icon: Zap },
  { href: "/mentor",      label: "מנטור",     icon: Brain },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const daysLeft = getDaysUntilExam();

  const countdownStyle =
    daysLeft <= 7
      ? { background: "#dc2626", color: "#fff" }
      : daysLeft <= 21
        ? { background: "#d97706", color: "#fff" }
        : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" };

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
      <AuthGate />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(6,20,38,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 lg:px-6">

          {/* Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black"
              style={{ background: "#fff", color: "#07162a" }}
            >
              ∑
            </span>
            <span className="hidden md:block leading-none">
              <span className="block text-sm font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
                אינפי ב׳
              </span>
              <span className="block text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                מועד א׳ · 90+
              </span>
            </span>
          </Link>

          {/* Divider */}
          <div className="shrink-0 w-px h-5" style={{ background: "rgba(255,255,255,0.15)" }} />

          {/* Single nav — one row, scrollable */}
          <nav
            className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <NavLink key={href} href={href} label={label} icon={<Icon className="h-3.5 w-3.5 shrink-0" />} active={active} />
              );
            })}
          </nav>

          {/* Exam countdown */}
          <div
            className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
            style={countdownStyle}
          >
            <span className="font-mono font-black tabular-nums" dir="ltr">{daysLeft}</span>
            <span className="hidden sm:block opacity-80">ימים</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="mx-auto max-w-7xl border-t px-4 py-4 text-center text-xs lg:px-6"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        מועד א׳ · 01.07.2026 · יעד 90+ · Calculus 2 Exam Prep
      </footer>
    </div>
  );
}

/* Extracted so hover is handled cleanly without inline handlers */
function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="nav-link flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
      data-active={active ? "true" : undefined}
    >
      {icon}
      <span className="hidden lg:block whitespace-nowrap">{label}</span>
    </Link>
  );
}
