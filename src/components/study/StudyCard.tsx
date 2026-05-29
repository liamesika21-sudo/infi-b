import type { ReactNode } from "react";

interface StudyCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "featured" | "muted";
  noPad?: boolean;
}

export function StudyCard({ children, className = "", variant = "default", noPad = false }: StudyCardProps) {
  const base =
    variant === "featured"
      ? "bg-[var(--navy)] text-white border-[var(--navy)]"
      : variant === "muted"
        ? "bg-[var(--bg-subtle)] border-[var(--border)]"
        : "bg-white border-[var(--border)]";

  return (
    <div
      className={`rounded-xl border shadow-sm ${noPad ? "" : "p-5"} ${base} ${className}`}
    >
      {children}
    </div>
  );
}

export function StudySection({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
      {eyebrow && (
        <p
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--cyan)" }}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        {actions}
      </div>
      {description && (
        <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
