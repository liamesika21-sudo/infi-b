"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Calendar,
  ChevronDown,
  FileQuestion,
  FlaskConical,
  LayoutDashboard,
  Sigma,
  Sparkles,
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
              if (href === "/weeks") {
                return (
                  <NavDropdown
                    key={href}
                    href={href}
                    label={label}
                    icon={<Icon className="h-3.5 w-3.5 shrink-0" />}
                    active={active}
                    items={[
                      { href: "/instructor-notes", label: "מסקנות מתרגולים", icon: <Sparkles className="h-3 w-3" /> },
                    ]}
                  />
                );
              }
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

function NavDropdown({
  href,
  label,
  icon,
  active,
  items,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  items: { href: string; label: string; icon: React.ReactNode }[];
}) {
  return (
    <div className="group relative shrink-0">
      {/* Trigger */}
      <Link
        href={href}
        className="nav-link flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
        data-active={active ? "true" : undefined}
      >
        {icon}
        <span className="hidden lg:block whitespace-nowrap">{label}</span>
        <ChevronDown className="h-2.5 w-2.5 opacity-50 hidden lg:block" />
      </Link>

      {/* Dropdown panel — appears on hover */}
      <div
        className="pointer-events-none absolute right-0 top-full z-50 min-w-40 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
        style={{ paddingTop: "4px" }}
      >
        <div
          className="rounded-lg border overflow-hidden py-1"
          style={{
            background: "rgba(6,20,38,0.97)",
            borderColor: "rgba(255,255,255,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap"
              style={{ color: "rgba(255,255,255,0.75)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
