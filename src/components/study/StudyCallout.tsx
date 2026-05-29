import type { ReactNode } from "react";
import { AlertCircle, BookOpen, CheckCircle, Info, Lightbulb, Star, XCircle, Zap } from "lucide-react";

type CalloutVariant = "info" | "success" | "warning" | "error" | "theorem" | "definition" | "tip" | "exam";

const variantConfig: Record<CalloutVariant, { cls: string; icon: ReactNode; label?: string }> = {
  info: {
    cls: "study-callout-blue",
    icon: <Info className="h-4 w-4 shrink-0" style={{ color: "var(--navy-mid)" }} />,
  },
  success: {
    cls: "study-callout-green",
    icon: <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "var(--green)" }} />,
  },
  warning: {
    cls: "study-callout-amber",
    icon: <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--amber)" }} />,
    label: "שימי לב",
  },
  error: {
    cls: "study-callout-red",
    icon: <XCircle className="h-4 w-4 shrink-0" style={{ color: "var(--red)" }} />,
    label: "טעות נפוצה",
  },
  theorem: {
    cls: "study-callout-blue",
    icon: <BookOpen className="h-4 w-4 shrink-0" style={{ color: "var(--navy-mid)" }} />,
    label: "משפט",
  },
  definition: {
    cls: "study-callout-green",
    icon: <Lightbulb className="h-4 w-4 shrink-0" style={{ color: "var(--green)" }} />,
    label: "הגדרה",
  },
  tip: {
    cls: "study-callout-amber",
    icon: <Star className="h-4 w-4 shrink-0" style={{ color: "var(--amber)" }} />,
    label: "טיפ",
  },
  exam: {
    cls: "study-callout-red",
    icon: <Zap className="h-4 w-4 shrink-0" style={{ color: "var(--red)" }} />,
    label: "חשוב למבחן",
  },
};

export function StudyCallout({
  variant = "info",
  title,
  children,
  className = "",
}: {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const config = variantConfig[variant];
  const displayTitle = title ?? config.label;

  return (
    <div className={`${config.cls} ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5">{config.icon}</span>
        <div className="min-w-0 flex-1">
          {displayTitle && (
            <p className="mb-1 text-xs font-bold uppercase tracking-wider opacity-70">
              {displayTitle}
            </p>
          )}
          <div className="text-sm leading-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
      {label && (
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
      )}
      <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
    </div>
  );
}
