"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Brain,
  Calendar,
  ChevronDown,
  FileQuestion,
  FlaskConical,
  Lightbulb,
  LayoutDashboard,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { OnboardingTour } from "@/components/OnboardingTour";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

function getDaysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// show: breakpoint from which the item becomes visible ("always" | "sm" | "md" | "lg")
const NAV_ITEMS = [
  { href: "/dashboard",     label: "דשבורד",    icon: LayoutDashboard, tourId: "nav-dashboard",    show: "always" },
  { href: "/weeks",         label: "שבועות",    icon: Calendar,        tourId: "nav-weeks",        show: "always" },
  { href: "/formulas",      label: "נוסחאות",   icon: Sigma,           tourId: "nav-formulas",     show: "sm"     },
  { href: "/practice",      label: "תרגול",     icon: Target,          tourId: "nav-practice",     show: "always" },
  { href: "/past-exams",    label: "מבחני עבר", icon: FileQuestion,    tourId: "nav-past-exams",   show: "sm"     },
  { href: "/simulations",   label: "סימולציות", icon: FlaskConical,    tourId: "nav-simulations",  show: "md"     },
  { href: "/intuition-map", label: "אינטואיציה", icon: Lightbulb,      tourId: "nav-intuition",    show: "md"     },
  { href: "/quick-review",  label: "חזרה",       icon: Zap,            tourId: "nav-quick-review", show: "md"     },
  { href: "/mentor",        label: "מנטור",      icon: Brain,          tourId: "nav-mentor",       show: "always" },
  { href: "/admin",         label: "אדמין",      icon: ShieldCheck,    tourId: "nav-admin",        show: "lg"     },
] as const;

const SHOW_CLASS: Record<string, string> = {
  always: "",
  sm: "hidden sm:flex",
  md: "hidden md:flex",
  lg: "hidden lg:flex",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [onboardingEmail, setOnboardingEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const daysLeft = getDaysUntilExam();

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d: { isAdmin?: boolean }) => { if (d.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const handleAuthenticated = useCallback((email: string, options?: { showOnboarding?: boolean }) => {
    if (options?.showOnboarding) {
      setOnboardingEmail(email);
    }
  }, []);

  const countdownStyle =
    daysLeft <= 7
      ? { background: "#dc2626", color: "#fff" }
      : daysLeft <= 21
        ? { background: "#d97706", color: "#fff" }
        : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" };

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
      <AuthGate
        onAuthenticated={handleAuthenticated}
      />
      <OnboardingTour email={onboardingEmail} enabled={Boolean(onboardingEmail)} />

      {/* ── Header ── */}
      <header
        data-tour="app-header"
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
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="Mentora dashboard">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white/5">
              <Image
                src="/brand/mentora-logo.png"
                alt="Mentora"
                fill
                className="object-contain"
                sizes="36px"
                priority
              />
            </span>
            <span className="hidden md:block leading-none">
              <span className="block text-sm font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
                Mentora
              </span>
              <span className="block text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                אינפי ב׳ · מועד א׳
              </span>
            </span>
          </Link>

          {/* Divider */}
          <div className="shrink-0 w-px h-5" style={{ background: "rgba(255,255,255,0.15)" }} />

          {/* Nav */}
          <nav className="flex min-w-0 flex-1 items-center gap-0.5">
            {NAV_ITEMS.filter(({ href }) => href !== "/admin" || isAdmin).map(({ href, label, icon: Icon, tourId, show }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              const showCls = SHOW_CLASS[show] ?? "";
              if (href === "/weeks") {
                return (
                  <NavDropdown
                    key={href}
                    href={href}
                    label={label}
                    icon={<Icon className="h-3.5 w-3.5 shrink-0" />}
                    active={active}
                    tourId={tourId}
                    className={showCls}
                    items={[
                      { href: "/instructor-notes", label: "הערות מקס", icon: <Sparkles className="h-3 w-3" /> },
                    ]}
                  />
                );
              }
              return (
                <NavLink key={href} href={href} label={label} icon={<Icon className="h-3.5 w-3.5 shrink-0" />} active={active} tourId={tourId} className={showCls} />
              );
            })}
          </nav>

          {/* Exam countdown */}
          <div
            data-tour="exam-countdown"
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
        Mentora · אינפי ב׳ · מועד א׳ · 01.07.2026 · יעד 90+ ·{" "}
        <a
          href="https://www.mentora-edu.com/pro"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
        >
          Mentora Pro
        </a>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
  tourId,
  className = "",
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  tourId?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-tour={tourId}
      className={`nav-link flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${className}`}
      data-active={active ? "true" : undefined}
    >
      {icon}
      <span className="hidden xl:block whitespace-nowrap">{label}</span>
    </Link>
  );
}

function NavDropdown({
  href,
  label,
  icon,
  active,
  tourId,
  items,
  className = "",
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  tourId?: string;
  items: { href: string; label: string; icon: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={`group relative shrink-0 ${className}`}>
      {/* Trigger */}
      <Link
        href={href}
        data-tour={tourId}
        className="nav-link flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
        data-active={active ? "true" : undefined}
      >
        {icon}
        <span className="hidden xl:block whitespace-nowrap">{label}</span>
        <ChevronDown className="h-2.5 w-2.5 opacity-50 hidden xl:block" />
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
